"""
DD-214 Document Upload MVP Router

Web-first MVP for DD-214 scanning with client-side OCR.
Handles file upload with pre-parsed fields from frontend.

PRODUCTION TODO:
- Replace local file storage with S3/cloud storage
- Replace JSON metadata with database persistence
- Add authentication/authorization
- Add file encryption at rest
- Add virus scanning
- Implement retention policies
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import json
import logging
import uuid
import os

# Configure logging - no sensitive field logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sensitive fields that should never be logged
SENSITIVE_FIELDS = {
    'ssn', 'social_security', 'date_of_birth', 'dob', 
    'full_name', 'address', 'phone', 'email'
}

router = APIRouter(prefix="/api/documents", tags=["documents"])

# MVP Storage Configuration
# PRODUCTION TODO: Replace with cloud storage (AWS S3, Azure Blob, etc.)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

METADATA_FILE = UPLOAD_DIR / "metadata.json"

# Initialize metadata file if it doesn't exist
if not METADATA_FILE.exists():
    with open(METADATA_FILE, 'w') as f:
        json.dump([], f)


class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    success: bool
    document_id: str
    message: str
    file_path: Optional[str] = None


def sanitize_log_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove sensitive fields from data before logging.
    Ensures compliance with privacy requirements and Sentry filtering.
    """
    sanitized = {}
    for key, value in data.items():
        if key.lower() in SENSITIVE_FIELDS:
            sanitized[key] = "[REDACTED]"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_log_data(value)
        else:
            sanitized[key] = value
    return sanitized


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    parsed_fields: str = Form(...),
    consent: bool = Form(...)
):
    """
    Upload DD-214 document with client-side parsed fields.
    
    MVP Implementation:
    - Accepts multipart form data with file + metadata
    - Stores file locally in uploads/ directory
    - Persists metadata to JSON file
    - Client performs OCR with Tesseract.js
    - Server validates and stores results
    
    PRODUCTION TODO:
    - Add authentication (verify user owns this document)
    - Upload to S3 with server-side encryption
    - Store metadata in PostgreSQL/MongoDB
    - Add document versioning
    - Implement access control
    - Add audit logging
    
    Args:
        file: The DD-214 document file (PDF or image)
        document_type: Type of document (should be "dd214")
        parsed_fields: JSON string of fields parsed by client-side OCR
        consent: Boolean indicating user consent for storage
        
    Returns:
        DocumentUploadResponse with document_id and status
    """
    try:
        # Validate inputs
        if not consent:
            raise HTTPException(
                status_code=400,
                detail="User consent is required to upload documents"
            )
        
        if document_type != "dd214":
            raise HTTPException(
                status_code=400,
                detail="Only DD-214 documents are currently supported"
            )
        
        # Validate file type
        allowed_types = {
            "application/pdf",
            "image/jpeg", 
            "image/jpg",
            "image/png",
            "image/tiff"
        }
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}"
            )
        
        # Parse the JSON fields
        try:
            fields = json.loads(parsed_fields)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid JSON in parsed_fields: {str(e)}"
            )
        
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Determine file extension
        file_ext = Path(file.filename).suffix if file.filename else ".pdf"
        safe_filename = f"{document_id}{file_ext}"
        file_path = UPLOAD_DIR / safe_filename
        
        # PRODUCTION TODO: Add virus scanning here
        # await scan_file_for_viruses(file)
        
        # Save file to disk
        # PRODUCTION TODO: Upload to S3 with encryption
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        file_size = len(content)
        
        # Create metadata record
        metadata = {
            "document_id": document_id,
            "document_type": document_type,
            "filename": file.filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "content_type": file.content_type,
            "upload_timestamp": timestamp,
            "consent_given": consent,
            "parsed_fields": fields,
            # PRODUCTION TODO: Add user_id when auth is implemented
            # "user_id": current_user.id,
        }
        
        # Load existing metadata
        # PRODUCTION TODO: Replace with database insert
        try:
            with open(METADATA_FILE, 'r') as f:
                all_metadata = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            all_metadata = []
        
        # Append new record
        all_metadata.append(metadata)
        
        # Save metadata
        with open(METADATA_FILE, 'w') as f:
            json.dump(all_metadata, f, indent=2)
        
        # Log success (with sanitized data)
        sanitized_fields = sanitize_log_data(fields)
        logger.info(
            f"Document uploaded successfully: {document_id}, "
            f"type={document_type}, size={file_size}, "
            f"fields={list(sanitized_fields.keys())}"
        )
        
        return DocumentUploadResponse(
            success=True,
            document_id=document_id,
            message="Document uploaded successfully",
            file_path=str(file_path)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to upload document. Please try again."
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "document-upload-mvp",
        "storage": "local",  # PRODUCTION TODO: Update when migrated to S3
        "upload_dir": str(UPLOAD_DIR),
        "timestamp": datetime.utcnow().isoformat()
    }
