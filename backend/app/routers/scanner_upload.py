"""
SCANNER UPLOAD ENDPOINT
Silent background scanning with automatic profile autofill
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
import os
import logging
import uuid
from datetime import datetime
from pathlib import Path

from app.models.database import Veteran, DocumentVault
from app.core.database import get_db
from app.scanner.dd214_extractor_enhanced import DD214Extractor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scanner", tags=["scanner"])

# Configuration
PROJECT_ROOT = Path(os.getenv("PROJECT_ROOT", "."))
UPLOADS_DIR = PROJECT_ROOT / "uploads" / "raw"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class ScannerService:
    """Handle silent scanner operations and profile autofill"""

    def __init__(self, db: Session):
        self.db = db
        self.dd214_extractor = DD214Extractor()

    def save_upload(self, file: UploadFile, veteran_id: Optional[str]) -> dict:
        """Save uploaded file to disk"""
        try:
            file_id = str(uuid.uuid4())
            filename = file.filename or "uploaded_document"
            file_ext = os.path.splitext(filename)[1]
            safe_filename = f"{file_id}{file_ext}"
            file_path = UPLOADS_DIR / safe_filename

            # Save file
            content = file.file.read()
            with open(file_path, 'wb') as f:
                f.write(content)

            logger.info(f"File saved: {file_path} ({len(content)} bytes)")

            return {
                'success': True,
                'file_id': file_id,
                'file_path': str(file_path),
                'file_name': filename,
                'file_size': len(content),
                'veteran_id': veteran_id,
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to save upload: {str(e)}")
            return {'success': False, 'error': str(e)}

    def extract_from_file(self, file_path: str) -> Optional[dict]:
        """Extract text from uploaded file"""
        try:
            from pdf2image import convert_from_path
            from pytesseract import pytesseract
            from PIL import Image
            import PyPDF2

            file_ext = os.path.splitext(file_path)[1].lower()

            # PDF
            if file_ext == '.pdf':
                try:
                    with open(file_path, 'rb') as f:
                        pdf_reader = PyPDF2.PdfReader(f)
                        text = ''
                        for page in pdf_reader.pages:
                            text += page.extract_text()
                    return {'text': text, 'source': 'pdf_text_extract'}
                except:
                    # Fallback to OCR for scanned PDFs
                    images = convert_from_path(file_path, dpi=200)
                    text = ''
                    for image in images:
                        text += pytesseract.image_to_string(image)
                    return {'text': text, 'source': 'pdf_ocr'}

            # DOCX
            elif file_ext == '.docx':
                from docx import Document
                doc = Document(file_path)
                text = '\n'.join([p.text for p in doc.paragraphs])
                return {'text': text, 'source': 'docx'}

            # TXT
            elif file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                return {'text': text, 'source': 'txt'}

            # Images (JPG, PNG)
            elif file_ext in ['.jpg', '.jpeg', '.png']:
                image = Image.open(file_path)
                text = pytesseract.image_to_string(image)
                return {'text': text, 'source': 'ocr'}

            else:
                logger.warning(f"Unsupported file type: {file_ext}")
                return None

        except Exception as e:
            logger.error(f"Text extraction failed for {file_path}: {str(e)}")
            return None

    def extract_dd214_fields(self, text: str) -> dict:
        """Extract DD-214 fields using pattern matching"""
        try:
            result = self.dd214_extractor.extract(text)
            return {
                'name': result.name,
                'branch': result.branch,
                'service_start_date': result.service_start_date,
                'service_end_date': result.service_end_date,
                'rank': result.rank,
                'mos_codes': result.mos_codes,
                'awards': result.awards,
                'discharge_status': result.discharge_status,
                'discharge_code': result.discharge_code,
                'narrative_reason': result.narrative_reason,
                'has_combat_service': result.has_combat_service,
                'service_character': result.service_character,
                'extracted_fields': result.extracted_fields,
                'extraction_confidence': result.extraction_confidence
            }
        except Exception as e:
            logger.error(f"Field extraction failed: {str(e)}")
            return {}

    def autofill_profile(self, veteran_id: str, extracted_data: dict) -> dict:
        """Non-destructive profile autofill - only updates empty fields"""
        try:
            if not veteran_id:
                return {'updated': False, 'reason': 'No veteran ID provided'}

            veteran = self.db.query(Veteran).filter(
                Veteran.id == veteran_id
            ).first()

            if not veteran:
                return {'updated': False, 'reason': f'Veteran {veteran_id} not found'}

            updates = {}

            # Only autofill empty fields
            if not veteran.first_name and extracted_data.get('name'):
                parts = extracted_data['name'].split()
                veteran.first_name = parts[0]
                if len(parts) > 1:
                    veteran.last_name = ' '.join(parts[1:])
                updates['name'] = extracted_data['name']

            if not veteran.service_branch and extracted_data.get('branch'):
                veteran.service_branch = extracted_data['branch']
                updates['branch'] = extracted_data['branch']

            if not veteran.separation_rank and extracted_data.get('rank'):
                veteran.separation_rank = extracted_data['rank']
                updates['rank'] = extracted_data['rank']

            if not veteran.discharge_status and extracted_data.get('discharge_status'):
                veteran.discharge_status = extracted_data['discharge_status']
                updates['discharge_status'] = extracted_data['discharge_status']

            # Store additional fields in metadata if available
            if not hasattr(veteran, 'metadata'):
                veteran.metadata = {}

            if extracted_data.get('service_start_date'):
                veteran.metadata['service_start_date'] = extracted_data['service_start_date']
                updates['service_start_date'] = extracted_data['service_start_date']

            if extracted_data.get('service_end_date'):
                veteran.metadata['service_end_date'] = extracted_data['service_end_date']
                updates['service_end_date'] = extracted_data['service_end_date']

            if extracted_data.get('mos_codes'):
                veteran.metadata['mos_codes'] = extracted_data['mos_codes']
                updates['mos_codes'] = extracted_data['mos_codes']

            if extracted_data.get('has_combat_service'):
                veteran.metadata['combat_service'] = True
                updates['combat_service'] = True

            # Record autofill source for audit
            veteran.metadata['last_autofill'] = {
                'source': 'DD214 upload',
                'timestamp': datetime.utcnow().isoformat(),
                'updated_fields': list(updates.keys())
            }

            # Commit changes
            self.db.commit()

            logger.info(f"Profile autofilled for {veteran_id}: {updates}")

            return {
                'updated': bool(updates),
                'updated_fields': list(updates.keys()),
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Profile autofill failed: {str(e)}")
            self.db.rollback()
            return {'updated': False, 'error': str(e)}

    def store_in_vault(self, file_id: str, file_name: str, veteran_id: str,
                      extracted_data: dict, file_path: str) -> bool:
        """Store document in vault with extracted metadata"""
        try:
            vault_entry = DocumentVault(
                id=file_id,
                veteran_id=veteran_id,
                file_name=file_name,
                file_path=file_path,
                document_type='DD214',
                extracted_data=extracted_data,
                upload_date=datetime.utcnow(),
                metadata={
                    'extraction_confidence': extracted_data.get('extraction_confidence', 0),
                    'extracted_fields': extracted_data.get('extracted_fields', [])
                }
            )

            self.db.add(vault_entry)
            self.db.commit()

            logger.info(f"Document stored in vault: {file_id}")
            return True

        except Exception as e:
            logger.error(f"Vault storage failed: {str(e)}")
            self.db.rollback()
            return False


# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Upload service document for silent background scanning.

    - Saves file to disk
    - Triggers silent background extraction
    - Autofills profile with non-destructive merge
    - Returns success immediately (no output displayed)

    Args:
        file: Uploaded file (PDF, DOCX, TXT, JPG, PNG)
        veteran_id: Optional veteran identifier for autofill
        background_tasks: FastAPI background task queue
        db: Database session

    Returns:
        {
            "status": "success",
            "message": "Document uploaded successfully. Processing in background."
        }
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    original_filename = file.filename or "uploaded_document"

    # Validate file size (10MB max)
    MAX_SIZE = 10 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds 10MB limit")

    # Reset file position
    await file.seek(0)

    service = ScannerService(db)

    # Save file
    save_result = service.save_upload(file, veteran_id)
    if not save_result['success']:
        raise HTTPException(status_code=500, detail="Failed to save file")

    file_path = save_result['file_path']
    file_id = save_result['file_id']

    # Queue background processing
    if background_tasks:
        background_tasks.add_task(
            process_document_background,
            file_path=file_path,
            file_id=file_id,
            file_name=original_filename,
            veteran_id=veteran_id
        )

    # Return immediately - processing happens silently
    return JSONResponse(
        status_code=202,  # Accepted
        content={
            "status": "success",
            "message": "Document uploaded successfully. Processing in background.",
            "file_name": original_filename
        }
    )


# ============================================================
# BACKGROUND TASK
# ============================================================

async def process_document_background(
    file_path: str,
    file_id: str,
    file_name: str,
    veteran_id: Optional[str]
):
    """
    Silent background processing - no user interaction needed
    """
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        service = ScannerService(db)

        logger.info(f"Starting background processing for {file_id}")

        # Extract text
        extraction_result = service.extract_from_file(file_path)
        if not extraction_result:
            logger.warning(f"Text extraction failed for {file_id}")
            return

        text = extraction_result['text']
        logger.info(f"Extracted {len(text)} characters from {file_id}")

        # Extract DD-214 fields
        extracted_data = service.extract_dd214_fields(text)
        logger.info(f"Extracted fields: {extracted_data.get('extracted_fields', [])}")

        # Autofill profile if veteran ID provided
        if veteran_id:
            autofill_result = service.autofill_profile(veteran_id, extracted_data)
            logger.info(f"Profile autofill result: {autofill_result}")

        # Store in vault
        vault_stored = service.store_in_vault(
            file_id=file_id,
            file_name=file_name,
            veteran_id=veteran_id or 'unknown',
            extracted_data=extracted_data,
            file_path=file_path
        )

        logger.info(f"Background processing completed for {file_id}")

    except Exception as e:
        logger.error(f"Background processing error: {str(e)}", exc_info=True)
    finally:
        db.close()
