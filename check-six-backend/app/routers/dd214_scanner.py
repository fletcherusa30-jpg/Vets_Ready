"""
DD-214 Scanner FastAPI Router

Endpoints for uploading and processing DD-214 documents with OCR
Includes comprehensive error handling and OCR diagnostics
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, Optional
import os
import tempfile
import logging
from datetime import datetime
import json

from app.services.dd214_ocr_scanner import DD214OCRScanner
from app.utils.ocr_diagnostics import OCRDependencyManager
from app.config import settings

router = APIRouter(prefix="/api/scanner", tags=["scanner"])
logger = logging.getLogger(__name__)

# Initialize scanner
scanner = DD214OCRScanner()
dep_manager = OCRDependencyManager(
    poppler_path=settings.poppler_path,
    tesseract_path=settings.tesseract_path
)

# Allowed file types
ALLOWED_TYPES = {'application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _format_error_response(error: Dict) -> Dict:
    """Format error response with actionable information"""
    if isinstance(error, dict):
        return {
            'success': False,
            'error': {
                'error_code': error.get('error_code', 'UNKNOWN_ERROR'),
                'message': error.get('message', 'An unknown error occurred'),
                'details': error.get('details'),
                'recommended_fix': error.get('recommended_fix')
            }
        }
    else:
        return {
            'success': False,
            'error': {
                'error_code': 'PROCESSING_ERROR',
                'message': str(error),
                'details': None,
                'recommended_fix': 'Please try again or contact support'
            }
        }


@router.post("/dd214/upload")
async def scan_dd214(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
) -> Dict:
    """
    Upload and scan DD-214 document

    - **file**: DD-214 document (PDF or image)
    - **veteran_id**: Optional veteran identifier for file organization

    Returns extracted data from DD-214 with comprehensive error information
    """
    tmp_path = None
    try:
        # Validate file type
        if file.content_type not in ALLOWED_TYPES:
            raise ValueError({
                'error_code': 'INVALID_FILE_TYPE',
                'message': f'Invalid file type: {file.content_type}',
                'details': f'Allowed types: {", ".join(ALLOWED_TYPES)}',
                'recommended_fix': 'Upload a PDF or image file (JPG, PNG, TIFF, BMP)'
            })

        # Validate file size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise ValueError({
                'error_code': 'FILE_TOO_LARGE',
                'message': f'File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f}MB',
                'details': f'File size: {len(content) / (1024*1024):.1f}MB',
                'recommended_fix': 'Try uploading a smaller file'
            })

        if len(content) == 0:
            raise ValueError({
                'error_code': 'EMPTY_FILE',
                'message': 'File is empty',
                'recommended_fix': 'Select a valid file to upload'
            })

        # Save to temp file
        file_ext = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            # Scan DD-214
            logger.info(f"Scanning DD-214: {file.filename}")
            extracted_data = await scanner.scan_dd214(tmp_path)

            # Get civilian job suggestions
            job_suggestions = scanner.get_civilian_job_suggestions(
                extracted_data.get('mos_code', ''),
                extracted_data.get('mos_title', ''),
                extracted_data.get('specialties', [])
            )

            # Combine results
            result = {
                **extracted_data,
                **job_suggestions,
                'file_name': file.filename,
                'scanned_at': datetime.utcnow().isoformat(),
                'veteran_id': veteran_id
            }

            # Remove raw text from response (can be very large)
            result.pop('raw_text', None)

            logger.info(f"DD-214 scan complete: {file.filename} - Confidence: {result.get('extraction_confidence')}")

            return {
                'success': True,
                'data': result
            }

        finally:
            # Clean up temp file
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                    logger.debug(f"Cleaned up temp file: {tmp_path}")
                except Exception as e:
                    logger.warning(f"Failed to clean up temp file {tmp_path}: {e}")

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        error_response = _format_error_response(e.args[0] if e.args else str(e))
        raise HTTPException(
            status_code=400,
            detail=error_response
        )
    except Exception as e:
        logger.error(f"Error scanning DD-214: {str(e)}", exc_info=True)
        error_response = _format_error_response({
            'error_code': 'OCR_PROCESSING_ERROR',
            'message': 'Failed to process DD-214 document',
            'details': str(e),
            'recommended_fix': 'Try uploading again or contact support'
        })
        raise HTTPException(
            status_code=500,
            detail=error_response
        )


@router.get("/dd214/info")
async def get_dd214_info() -> Dict:
    """
    Get information about DD-214 scanner capabilities

    Returns supported file types, limits, and extracted fields
    """
    return {
        'scanner': {
            'name': 'DD-214 OCR Scanner',
            'version': '2.0.0',
            'description': 'Extracts veteran service information from DD-214 documents with dependency validation'
        },
        'capabilities': {
            'tesseract_ocr': scanner.tesseract_available,
            'google_cloud_vision': scanner.google_vision_available,
            'poppler': scanner.poppler_available,
            'fallback_enabled': True
        },
        'supported_formats': list(ALLOWED_TYPES),
        'max_file_size': f"{MAX_FILE_SIZE / (1024*1024):.0f}MB",
        'extracted_fields': [
            'branch',
            'entry_date',
            'separation_date',
            'years_of_service',
            'rank',
            'pay_grade',
            'character_of_service',
            'separation_code',
            'combat_service',
            'combat_locations',
            'awards',
            'mos_code',
            'mos_title',
            'specialties',
            'narrative_reason',
            'suggested_civilian_jobs',
            'matched_skills',
            'certification_recommendations',
            'extraction_confidence'
        ]
    }


@router.get("/diagnostics/ocr")
async def get_ocr_diagnostics() -> Dict:
    """
    Get comprehensive OCR diagnostics

    Returns detailed information about OCR engine availability,
    versions, and system readiness for DD-214 processing.

    This endpoint is useful for:
    - Debugging OCR setup issues
    - Verifying Poppler and Tesseract installation
    - Checking Google Vision availability
    - Getting installation recommendations
    """
    diagnostics = dep_manager.run_diagnostics()

    return {
        'status': 'healthy' if not diagnostics.errors else 'degraded' if diagnostics.warnings else 'critical',
        'timestamp': datetime.utcnow().isoformat(),
        'dependencies': {
            'poppler': {
                'detected': diagnostics.poppler_detected,
                'pdfinfo_available': diagnostics.pdfinfo_available,
                'pdftoppm_available': diagnostics.pdftoppm_available,
                'pdfinfo_version': diagnostics.pdfinfo_version,
                'pdftoppm_version': diagnostics.pdftoppm_version
            },
            'tesseract': {
                'detected': diagnostics.tesseract_detected,
                'version': diagnostics.tesseract_version
            },
            'google_vision': {
                'available': diagnostics.google_vision_available
            }
        },
        'ocr_ready': {
            'pdf_processing': diagnostics.ready_for_pdf_ocr,
            'image_processing': diagnostics.tesseract_detected or diagnostics.google_vision_available,
            'overall': diagnostics.ready_for_pdf_ocr and (diagnostics.tesseract_detected or diagnostics.google_vision_available)
        },
        'errors': diagnostics.errors,
        'warnings': diagnostics.warnings,
        'recommendations': diagnostics.recommendations,
        'setup_guide': {
            'windows': {
                'poppler': 'Download from https://github.com/oschwartz10612/poppler-windows/releases/ and add to PATH',
                'tesseract': 'Download from https://github.com/UB-Mannheim/tesseract/wiki and install'
            },
            'linux': {
                'poppler': 'apt-get install poppler-utils',
                'tesseract': 'apt-get install tesseract-ocr'
            },
            'macos': {
                'poppler': 'brew install poppler',
                'tesseract': 'brew install tesseract'
            }
        }
    }


@router.post("/dependency/validate")
async def validate_dependent(
    dependent_data: Dict
) -> Dict:
    """
    Validate dependent eligibility

    Validates spouse, child, parent, or survivor dependent against VA rules
    """
    # This endpoint would use the VADependencyValidator service
    # Implementation handled in separate endpoint handler
    return {
        'message': 'Use the frontend validation service or send to /api/dependents/validate'
    }
