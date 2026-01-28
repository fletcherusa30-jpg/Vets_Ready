"""
SCANNER ROUTER - Backend API for all scanner operations

This module provides endpoints for:
- STR (Service Treatment Records) upload and processing
- Project scanner execution
- BOM scanner execution
- Forensic scanner execution
- Scanner status tracking and diagnostics

All scanners run on the backend server (not in browser).
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import uuid
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
import shutil

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scanners", tags=["scanners"])

# Configuration
PROJECT_ROOT = Path(r"C:\Dev\Vets Ready")
UPLOAD_DIR = PROJECT_ROOT / "uploads" / "str"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
LOGS_DIR = PROJECT_ROOT / "logs" / "scanners"
REPORTS_DIR = PROJECT_ROOT / "reports" / "scanners"

# Ensure directories exist
for directory in [UPLOAD_DIR, LOGS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)
    logger.info(f"📁 Created/verified directory: {directory}")

# In-memory scanner status tracking
# In production, use Redis or database
scanner_status: Dict[str, Dict[str, Any]] = {}


class ScannerJob(BaseModel):
    """Scanner job status"""
    id: str
    type: str  # 'str', 'bom', 'forensic', 'project'
    status: str  # 'pending', 'running', 'completed', 'failed'
    progress: int  # 0-100
    message: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ScannerDiagnostic(BaseModel):
    """Diagnostic information"""
    scanner_type: str
    current_directory: str
    project_root: str
    folders_checked: List[str]
    folders_exist: Dict[str, bool]
    files_found: int
    errors: List[str]
    warnings: List[str]


@router.post("/str/upload")
async def upload_str(
    file: UploadFile = File(...),
    volume: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """
    Upload STR file and start processing

    Accepts: PDF, TIFF, JPG, PNG, HEIC
    Returns: Job ID for status tracking
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.tiff', '.tif', '.jpg', '.jpeg', '.png', '.heic']
        filename = file.filename or "uploaded_document"
        file_ext = Path(filename).suffix.lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{file_ext}'. Allowed: {', '.join(allowed_extensions)}"
            )

        # Generate unique job ID
        job_id = str(uuid.uuid4())

        # Save uploaded file
        file_path = UPLOAD_DIR / f"{job_id}_{filename}"

        logger.info(f"📥 Uploading STR file: {filename} → {file_path}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = file_path.stat().st_size
        logger.info(f"✅ Saved {file_size} bytes to {file_path}")

        # Create job status
        job = ScannerJob(
            id=job_id,
            type="str",
            status="pending",
            progress=0,
            message=f"Uploaded {filename} ({file_size} bytes)",
            created_at=datetime.now().isoformat()
        )

        scanner_status[job_id] = job.dict()

        # Start processing in background
        if background_tasks:
            background_tasks.add_task(process_str_file, job_id, file_path, volume)

        return {
            "job_id": job_id,
            "filename": filename,
            "file_size": file_size,
            "status": "pending",
            "message": "Upload successful. Processing started."
        }

    except Exception as e:
        logger.error(f"❌ STR upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


async def process_str_file(job_id: str, file_path: Path, volume: Optional[str]):
    """
    Background task to process STR file

    Steps:
    1. Update status to 'running'
    2. Extract text using OCR (mock for now)
    3. Parse medical entries
    4. Identify claim opportunities
    5. Generate report
    6. Update status to 'completed'
    """
    try:
        logger.info(f"🔄 Starting STR processing for job {job_id}")

        # Update status
        scanner_status[job_id].update({
            "status": "running",
            "started_at": datetime.now().isoformat(),
            "progress": 10,
            "message": "Starting OCR processing..."
        })

        # Simulate OCR processing (20-60%)
        # In production: call Tesseract.js, AWS Textract, or Google Cloud Vision
        logger.info(f"📄 Performing OCR on {file_path}")
        scanner_status[job_id].update({
            "progress": 60,
            "message": "Extracting medical entries..."
        })

        # Mock extraction results
        mock_result = {
            "document_id": job_id,
            "filename": file_path.name,
            "page_count": 127,  # Mock value
            "volume": volume,
            "processing_date": datetime.now().isoformat(),
            "extracted_entries": [
                {
                    "id": f"entry_{i}",
                    "date": f"2020-0{(i % 9) + 1}-15",
                    "page": i + 1,
                    "entry_type": "sick_call",
                    "chief_complaint": f"Mock complaint {i}",
                    "diagnosis": [f"Mock diagnosis {i}"],
                }
                for i in range(10)  # Mock 10 entries
            ],
            "claim_opportunities": [
                {
                    "id": f"claim_{i}",
                    "condition": f"Mock condition {i}",
                    "confidence": "high",
                    "supporting_entries": 3,
                }
                for i in range(5)  # Mock 5 opportunities
            ],
            "summary": {
                "total_entries": 10,
                "total_opportunities": 5,
                "body_systems_affected": ["Musculoskeletal", "Mental Health"],
            }
        }

        # Save report
        report_path = REPORTS_DIR / f"str_{job_id}.json"
        with open(report_path, "w") as f:
            json.dump(mock_result, f, indent=2)

        logger.info(f"✅ STR processing complete. Report saved to {report_path}")

        # Update final status
        scanner_status[job_id].update({
            "status": "completed",
            "completed_at": datetime.now().isoformat(),
            "progress": 100,
            "message": "Processing complete",
            "result": mock_result
        })

    except Exception as e:
        logger.error(f"❌ STR processing failed for job {job_id}: {e}", exc_info=True)
        scanner_status[job_id].update({
            "status": "failed",
            "completed_at": datetime.now().isoformat(),
            "progress": 0,
            "error": str(e),
            "message": f"Processing failed: {str(e)}"
        })


@router.get("/str/status/{job_id}")
async def get_str_status(job_id: str):
    """Get status of STR processing job"""
    if job_id not in scanner_status:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return scanner_status[job_id]


@router.get("/str/result/{job_id}")
async def get_str_result(job_id: str):
    """Get final results of STR processing"""
    if job_id not in scanner_status:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    job = scanner_status[job_id]

    if job["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job status is '{job['status']}'. Results only available when completed."
        )

    return job["result"]


@router.post("/bom/scan")
async def run_bom_scanner(background_tasks: BackgroundTasks):
    """
    Run BOM scanner PowerShell script

    This executes scripts/BOM-Defense.ps1
    """
    try:
        job_id = str(uuid.uuid4())

        job = ScannerJob(
            id=job_id,
            type="bom",
            status="pending",
            progress=0,
            message="BOM scan queued",
            created_at=datetime.now().isoformat()
        )

        scanner_status[job_id] = job.dict()

        background_tasks.add_task(execute_powershell_scanner, job_id, "BOM-Defense.ps1", "Start-BOMScan")

        return {
            "job_id": job_id,
            "status": "pending",
            "message": "BOM scan started"
        }

    except Exception as e:
        logger.error(f"❌ BOM scan failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/forensic/scan")
async def run_forensic_scanner(background_tasks: BackgroundTasks):
    """
    Run forensic/integrity scanner

    This executes scripts/Integrity-Scanner.ps1
    """
    try:
        job_id = str(uuid.uuid4())

        job = ScannerJob(
            id=job_id,
            type="forensic",
            status="pending",
            progress=0,
            message="Forensic scan queued",
            created_at=datetime.now().isoformat()
        )

        scanner_status[job_id] = job.dict()

        background_tasks.add_task(execute_powershell_scanner, job_id, "Integrity-Scanner.ps1", None)

        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Forensic scan started"
        }

    except Exception as e:
        logger.error(f"❌ Forensic scan failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project/scan")
async def run_project_scanner(background_tasks: BackgroundTasks):
    """
    Run project health scanner

    This executes scripts/Scan-Android.ps1 (but for VetsReady project)
    """
    try:
        job_id = str(uuid.uuid4())

        job = ScannerJob(
            id=job_id,
            type="project",
            status="pending",
            progress=0,
            message="Project scan queued",
            created_at=datetime.now().isoformat()
        )

        scanner_status[job_id] = job.dict()

        background_tasks.add_task(execute_powershell_scanner, job_id, "Scan-Android.ps1", None)

        return {
            "job_id": job_id,
            "status": "pending",
            "message": "Project scan started"
        }

    except Exception as e:
        logger.error(f"❌ Project scan failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def execute_powershell_scanner(job_id: str, script_name: str, function_name: Optional[str]):
    """
    Execute PowerShell scanner script

    Args:
        job_id: Job ID for tracking
        script_name: Name of .ps1 file in scripts/
        function_name: Optional function to call (e.g., 'Start-BOMScan')
    """
    try:
        logger.info(f"🔄 Starting PowerShell scanner: {script_name}")

        scanner_status[job_id].update({
            "status": "running",
            "started_at": datetime.now().isoformat(),
            "progress": 10,
            "message": f"Executing {script_name}..."
        })

        script_path = SCRIPTS_DIR / script_name

        if not script_path.exists():
            raise FileNotFoundError(f"Scanner script not found: {script_path}")

        # Build PowerShell command
        if function_name:
            cmd = f'powershell.exe -ExecutionPolicy Bypass -File "{script_path}" -Command {function_name}'
        else:
            cmd = f'powershell.exe -ExecutionPolicy Bypass -File "{script_path}"'

        logger.info(f"💻 Executing: {cmd}")

        # Execute with proper working directory
        result = subprocess.run(
            cmd,
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        logger.info(f"📊 Exit code: {result.returncode}")
        logger.info(f"📄 Output length: {len(result.stdout)} chars")

        if result.returncode == 0:
            scanner_status[job_id].update({
                "status": "completed",
                "completed_at": datetime.now().isoformat(),
                "progress": 100,
                "message": "Scan completed successfully",
                "result": {
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "exit_code": result.returncode
                }
            })
        else:
            raise RuntimeError(f"Scanner exited with code {result.returncode}: {result.stderr}")

    except Exception as e:
        logger.error(f"❌ PowerShell scanner failed: {e}", exc_info=True)
        scanner_status[job_id].update({
            "status": "failed",
            "completed_at": datetime.now().isoformat(),
            "progress": 0,
            "error": str(e),
            "message": f"Scan failed: {str(e)}"
        })


@router.get("/status/{job_id}")
async def get_scanner_status(job_id: str):
    """Get status of any scanner job"""
    if job_id not in scanner_status:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return scanner_status[job_id]


@router.get("/diagnostics")
async def run_diagnostics():
    """
    Run diagnostic checks on scanner infrastructure

    Returns:
        - Current working directory
        - Project root existence
        - Required folders existence
        - File counts
        - Scanner script availability
    """
    try:
        diagnostics = ScannerDiagnostic(
            scanner_type="infrastructure",
            current_directory=str(Path.cwd()),
            project_root=str(PROJECT_ROOT),
            folders_checked=[],
            folders_exist={},
            files_found=0,
            errors=[],
            warnings=[]
        )

        # Check required directories
        required_dirs = [
            PROJECT_ROOT,
            UPLOAD_DIR,
            SCRIPTS_DIR,
            LOGS_DIR,
            REPORTS_DIR,
            PROJECT_ROOT / "vets-ready-frontend",
            PROJECT_ROOT / "vets-ready-backend",
        ]

        for directory in required_dirs:
            dir_name = str(directory.relative_to(PROJECT_ROOT)) if directory != PROJECT_ROOT else "PROJECT_ROOT"
            diagnostics.folders_checked.append(dir_name)
            exists = directory.exists()
            diagnostics.folders_exist[dir_name] = exists

            if not exists:
                diagnostics.errors.append(f"Directory does not exist: {directory}")

        # Check scanner scripts
        scanner_scripts = ["BOM-Defense.ps1", "Integrity-Scanner.ps1", "Scan-Android.ps1"]
        for script in scanner_scripts:
            script_path = SCRIPTS_DIR / script
            if not script_path.exists():
                diagnostics.warnings.append(f"Scanner script not found: {script}")

        # Count files in upload directory
        if UPLOAD_DIR.exists():
            diagnostics.files_found = len(list(UPLOAD_DIR.glob("*")))

        logger.info(f"✅ Diagnostics complete: {len(diagnostics.errors)} errors, {len(diagnostics.warnings)} warnings")

        return diagnostics.dict()

    except Exception as e:
        logger.error(f"❌ Diagnostics failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Simple health check endpoint

    Returns scanner service status
    """
    return {
        "status": "healthy",
        "service": "scanners",
        "timestamp": datetime.now().isoformat(),
        "project_root": str(PROJECT_ROOT),
        "project_root_exists": PROJECT_ROOT.exists(),
        "active_jobs": len([j for j in scanner_status.values() if j["status"] == "running"]),
        "total_jobs": len(scanner_status)
    }


@router.get("/jobs")
async def list_jobs(status_filter: Optional[str] = None):
    """
    List all scanner jobs

    Args:
        status_filter: Optional filter by status ('pending', 'running', 'completed', 'failed')
    """
    jobs = list(scanner_status.values())

    if status_filter:
        jobs = [j for j in jobs if j["status"] == status_filter]

    return {
        "total": len(jobs),
        "jobs": jobs
    }
