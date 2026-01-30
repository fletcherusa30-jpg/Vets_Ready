"""
SCANNER API ROUTER

REST API endpoints for scanner operations.
Integrates with scanner orchestrator and all parsers.

ENDPOINTS:
- File Upload: POST /api/upload/{scanner_type}
- Trigger Scan: POST /api/scan/{scanner_type}
- Job Status: GET /api/scan/jobs/{job_id}/status
- Job Results: GET /api/scan/jobs/{job_id}/results
- Scanner Health: GET /api/scan/health
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query
from fastapi.responses import JSONResponse
from typing import Optional
import logging

from app.services.scanner_orchestrator import get_orchestrator, ScannerType

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scan", tags=["scanners"])


# ==================== FILE UPLOAD ENDPOINTS ====================

@router.post("/upload/dd214")
async def upload_dd214(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload a DD-214 file for scanning.

    Returns:
        {
            'success': bool,
            'file_path': str,
            'size': int,
            'veteran_id': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        # Read file content
        content = await file.read()

        # Save file
        result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=ScannerType.DD214,
            veteran_id=veteran_id
        )

        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])

        logger.info(f"DD-214 uploaded: {result['file_path']} ({result['size']} bytes)")

        return JSONResponse(content={
            'success': True,
            'message': 'DD-214 uploaded successfully',
            'file_path': result['file_path'],
            'size': result['size'],
            'veteran_id': result['veteran_id']
        })

    except Exception as e:
        logger.error(f"DD-214 upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/str")
async def upload_str(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload Service Treatment Records for scanning.

    Returns:
        {
            'success': bool,
            'file_path': str,
            'size': int,
            'veteran_id': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        content = await file.read()

        result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=ScannerType.STR,
            veteran_id=veteran_id
        )

        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])

        logger.info(f"STR uploaded: {result['file_path']} ({result['size']} bytes)")

        return JSONResponse(content={
            'success': True,
            'message': 'STR uploaded successfully',
            'file_path': result['file_path'],
            'size': result['size'],
            'veteran_id': result['veteran_id']
        })

    except Exception as e:
        logger.error(f"STR upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/rating")
async def upload_rating_decision(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload VA Rating Decision for scanning.

    Returns:
        {
            'success': bool,
            'file_path': str,
            'size': int,
            'veteran_id': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        content = await file.read()

        result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=ScannerType.RATING,
            veteran_id=veteran_id
        )

        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])

        logger.info(f"Rating Decision uploaded: {result['file_path']} ({result['size']} bytes)")

        return JSONResponse(content={
            'success': True,
            'message': 'Rating Decision uploaded successfully',
            'file_path': result['file_path'],
            'size': result['size'],
            'veteran_id': result['veteran_id']
        })

    except Exception as e:
        logger.error(f"Rating Decision upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GENERIC UPLOAD ENDPOINT ====================
# This endpoint handles all scanner types with auto-detection
@router.post("/upload")
async def upload_generic(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None,
    scanner_type: Optional[str] = Query(None, description="Scanner type: dd214, str, rating, or auto-detect")
):
    """
    Generic upload endpoint that handles all scanner types.

    If scanner_type is not specified, auto-detects based on file content/name.

    Args:
        file: File to upload
        veteran_id: Optional veteran identifier
        scanner_type: Optional scanner type (dd214, str, rating)

    Returns:
        {
            'success': bool,
            'message': str,
            'file_path': str,
            'size': int,
            'veteran_id': str,
            'detected_scanner_type': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        content = await file.read()

        # Determine scanner type
        detected_type = scanner_type
        if not detected_type:
            # Auto-detect based on filename and content
            filename_lower = filename.lower()
            if 'dd214' in filename_lower or 'dd-214' in filename_lower:
                detected_type = ScannerType.DD214.value
            elif 'str' in filename_lower or 'treatment' in filename_lower:
                detected_type = ScannerType.STR.value
            elif 'rating' in filename_lower or 'decision' in filename_lower:
                detected_type = ScannerType.RATING.value
            else:
                # Default to DD214 for common military documents
                detected_type = ScannerType.DD214.value

        # Validate scanner type
        try:
            scan_type = ScannerType[detected_type.upper()]
        except (KeyError, AttributeError):
            raise ValueError(f"Invalid scanner type: {detected_type}")

        # Save file
        result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=scan_type,
            veteran_id=veteran_id
        )

        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])

        logger.info(f"File uploaded ({detected_type}): {result['file_path']} ({result['size']} bytes)")

        return JSONResponse(content={
            'success': True,
            'message': f'File uploaded successfully as {detected_type} document',
            'file_path': result['file_path'],
            'size': result['size'],
            'veteran_id': result['veteran_id'],
            'detected_scanner_type': detected_type
        })

    except ValueError as e:
        logger.error(f"Invalid scanner type: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Generic upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SCAN TRIGGER ENDPOINTS ====================

@router.post("/dd214")
async def scan_dd214(
    file_path: str,
    veteran_id: Optional[str] = None
):
    """
    Trigger DD-214 scan job.

    Args:
        file_path: Path to uploaded DD-214 file
        veteran_id: Optional veteran identifier

    Returns:
        {
            'success': bool,
            'job_id': str,
            'message': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.DD214,
            file_path=file_path,
            veteran_id=veteran_id
        )

        logger.info(f"DD-214 scan job created: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'message': 'DD-214 scan job started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"DD-214 scan job creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/str")
async def scan_str(
    file_path: str,
    veteran_id: Optional[str] = None
):
    """
    Trigger STR scan job.

    Args:
        file_path: Path to uploaded STR file
        veteran_id: Optional veteran identifier

    Returns:
        {
            'success': bool,
            'job_id': str,
            'message': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.STR,
            file_path=file_path,
            veteran_id=veteran_id
        )

        logger.info(f"STR scan job created: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'message': 'STR scan job started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"STR scan job creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rating")
async def scan_rating_decision(
    file_path: str,
    veteran_id: Optional[str] = None
):
    """
    Trigger Rating Decision scan job.

    Args:
        file_path: Path to uploaded rating decision file
        veteran_id: Optional veteran identifier

    Returns:
        {
            'success': bool,
            'job_id': str,
            'message': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.RATING,
            file_path=file_path,
            veteran_id=veteran_id
        )

        logger.info(f"Rating Decision scan job created: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'message': 'Rating Decision scan job started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"Rating Decision scan job creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project")
async def scan_project(
    directory_path: str,
    veteran_id: Optional[str] = None
):
    """
    Trigger project scan (scan all documents in a directory).

    Args:
        directory_path: Path to directory containing documents
        veteran_id: Optional veteran identifier

    Returns:
        {
            'success': bool,
            'job_id': str,
            'message': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.PROJECT,
            file_path=directory_path,
            veteran_id=veteran_id
        )

        logger.info(f"Project scan job created: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'message': 'Project scan job started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"Project scan job creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== JOB STATUS & RESULTS ====================

@router.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Get the status of a scan job.

    Returns:
        {
            'job_id': str,
            'scanner_type': str,
            'status': str,  # 'pending', 'running', 'completed', 'failed'
            'started_at': Optional[str],
            'completed_at': Optional[str],
            'error': Optional[str],
            'retry_count': int
        }
    """
    orchestrator = get_orchestrator()

    status = orchestrator.get_job_status(job_id)

    if not status:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")

    return JSONResponse(content=status)


@router.get("/jobs/{job_id}/results")
async def get_job_results(job_id: str):
    """
    Get the results of a completed scan job.

    Returns:
        {
            'status': str,  # 'ready', 'not_ready'
            'job_id': str,
            'scanner_type': str,
            'result': dict,  # Parsed document data
            'completed_at': Optional[str]
        }
    """
    orchestrator = get_orchestrator()

    result = orchestrator.get_job_result(job_id)

    if not result:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")

    if result['status'] == 'not_ready':
        return JSONResponse(content=result, status_code=202)  # 202 Accepted (processing)

    return JSONResponse(content=result)


# ==================== SCANNER HEALTH ====================

@router.get("/health")
async def get_scanner_health():
    """
    Get health status of all scanners.

    Returns:
        {
            'status': str,  # 'healthy', 'degraded'
            'total_jobs': int,
            'completed_jobs': int,
            'failed_jobs': int,
            'running_jobs': int,
            'pending_jobs': int,
            'success_rate': float,
            'last_scans': dict,  # Last scan per scanner type
            'uptime': str
        }
    """
    orchestrator = get_orchestrator()

    health = orchestrator.get_scanner_health()

    return JSONResponse(content=health)


# ==================== COMBINED UPLOAD & SCAN ====================

@router.post("/upload-and-scan/dd214")
async def upload_and_scan_dd214(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload DD-214 and immediately start scanning.
    Convenience endpoint that combines upload + scan.

    Returns:
        {
            'success': bool,
            'job_id': str,
            'file_path': str,
            'message': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        # Upload file
        content = await file.read()
        upload_result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=ScannerType.DD214,
            veteran_id=veteran_id
        )

        if not upload_result['success']:
            raise HTTPException(status_code=400, detail=upload_result['error'])

        # Create scan job
        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.DD214,
            file_path=upload_result['file_path'],
            veteran_id=upload_result['veteran_id']
        )

        logger.info(f"DD-214 uploaded and scan started: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'file_path': upload_result['file_path'],
            'veteran_id': upload_result['veteran_id'],
            'message': 'DD-214 uploaded and scan started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"DD-214 upload and scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-and-scan/str")
async def upload_and_scan_str(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload STR and immediately start scanning.
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        content = await file.read()
        upload_result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=ScannerType.STR,
            veteran_id=veteran_id
        )

        if not upload_result['success']:
            raise HTTPException(status_code=400, detail=upload_result['error'])

        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.STR,
            file_path=upload_result['file_path'],
            veteran_id=upload_result['veteran_id']
        )

        logger.info(f"STR uploaded and scan started: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'file_path': upload_result['file_path'],
            'veteran_id': upload_result['veteran_id'],
            'message': 'STR uploaded and scan started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"STR upload and scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-and-scan/rating")
async def upload_and_scan_rating(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None
):
    """
    Upload Rating Decision and immediately start scanning.
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        content = await file.read()
        upload_result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=ScannerType.RATING,
            veteran_id=veteran_id
        )

        if not upload_result['success']:
            raise HTTPException(status_code=400, detail=upload_result['error'])

        job_id = await orchestrator.create_scan_job(
            scanner_type=ScannerType.RATING,
            file_path=upload_result['file_path'],
            veteran_id=upload_result['veteran_id']
        )

        logger.info(f"Rating Decision uploaded and scan started: {job_id}")

        return JSONResponse(content={
            'success': True,
            'job_id': job_id,
            'file_path': upload_result['file_path'],
            'veteran_id': upload_result['veteran_id'],
            'message': 'Rating Decision uploaded and scan started',
            'status_url': f'/api/scan/jobs/{job_id}/status',
            'results_url': f'/api/scan/jobs/{job_id}/results'
        })

    except Exception as e:
        logger.error(f"Rating Decision upload and scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== UTILITY ENDPOINTS ====================

@router.get("/supported-types")
async def get_supported_scanner_types():
    """Get list of supported scanner types"""
    return JSONResponse(content={
        'scanner_types': [
            {
                'type': 'dd214',
                'name': 'DD-214',
                'description': 'Certificate of Release or Discharge from Active Duty'
            },
            {
                'type': 'str',
                'name': 'Service Treatment Records',
                'description': 'Military medical records'
            },
            {
                'type': 'rating',
                'name': 'VA Rating Decision',
                'description': 'VA disability rating determination'
            },
            {
                'type': 'project',
                'name': 'Project Scan',
                'description': 'Scan all documents in a directory'
            }
        ]
    })


@router.get("/")
async def scanner_root():
    """Scanner API root - provides documentation links"""
    return JSONResponse(content={
        'message': 'rallyforge Scanner API',
        'version': '2.0',
        'endpoints': {
            'upload': {
                'generic': '/api/scan/upload (auto-detects scanner type)',
                'dd214': '/api/scan/upload/dd214',
                'str': '/api/scan/upload/str',
                'rating': '/api/scan/upload/rating'
            },
            'scan': {
                'dd214': '/api/scan/dd214',
                'str': '/api/scan/str',
                'rating': '/api/scan/rating',
                'project': '/api/scan/project'
            },
            'combined': {
                'dd214': '/api/scan/upload-and-scan/dd214',
                'str': '/api/scan/upload-and-scan/str',
                'rating': '/api/scan/upload-and-scan/rating'
            },
            'jobs': {
                'status': '/api/scan/jobs/{job_id}/status',
                'results': '/api/scan/jobs/{job_id}/results'
            },
            'health': '/api/scan/health',
            'types': '/api/scan/supported-types'
        }
    })


# ==================== LEGACY/ALIAS ENDPOINT ====================
# Create second router for /api/scanner path (backward compatibility with frontend)
scanner_router = APIRouter(prefix="/api/scanner", tags=["scanners-legacy"])

@scanner_router.post("/upload")
async def upload_legacy(
    file: UploadFile = File(...),
    veteran_id: Optional[str] = None,
    scanner_type: Optional[str] = Query(None, description="Scanner type: dd214, str, rating, or auto-detect")
):
    """
    Legacy upload endpoint at /api/scanner/upload (aliases to /api/scan/upload).

    This endpoint exists for backward compatibility with the frontend.
    It auto-detects the scanner type if not provided.

    Args:
        file: File to upload
        veteran_id: Optional veteran identifier
        scanner_type: Optional scanner type (dd214, str, rating)

    Returns:
        {
            'success': bool,
            'message': str,
            'file_path': str,
            'size': int,
            'veteran_id': str,
            'detected_scanner_type': str
        }
    """
    orchestrator = get_orchestrator()

    try:
        filename = file.filename or "uploaded_document"
        content = await file.read()

        # Determine scanner type
        detected_type = scanner_type
        if not detected_type:
            # Auto-detect based on filename
            filename_lower = filename.lower()
            if 'dd214' in filename_lower or 'dd-214' in filename_lower:
                detected_type = ScannerType.DD214.value
            elif 'str' in filename_lower or 'treatment' in filename_lower:
                detected_type = ScannerType.STR.value
            elif 'rating' in filename_lower or 'decision' in filename_lower:
                detected_type = ScannerType.RATING.value
            else:
                detected_type = ScannerType.DD214.value

        # Validate scanner type
        try:
            scan_type = ScannerType[detected_type.upper()]
        except (KeyError, AttributeError):
            raise ValueError(f"Invalid scanner type: {detected_type}")

        # Save file
        result = await orchestrator.save_uploaded_file(
            file_content=content,
            filename=filename,
            scanner_type=scan_type,
            veteran_id=veteran_id
        )

        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])

        logger.info(f"Legacy endpoint - File uploaded ({detected_type}): {result['file_path']} ({result['size']} bytes)")

        return JSONResponse(content={
            'success': True,
            'message': f'File uploaded successfully as {detected_type} document',
            'file_path': result['file_path'],
            'size': result['size'],
            'veteran_id': result['veteran_id'],
            'detected_scanner_type': detected_type
        })

    except ValueError as e:
        logger.error(f"Legacy upload - Invalid scanner type: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Legacy upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

