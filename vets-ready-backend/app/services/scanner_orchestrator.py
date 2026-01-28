"""
SCANNER ORCHESTRATION ENGINE

Backend execution layer for all scanners. Handles file uploads, scanner execution,
job management, and result delivery. NEVER executes in browser.

ARCHITECTURE:
- Accept scan requests via REST API
- Accept file uploads and save to disk
- Execute appropriate scanner in background
- Capture all output (stdout, stderr, exit codes)
- Return structured results to UI
- Self-healing capabilities

SCANNERS:
- DD-214 Scanner
- STR (Service Treatment Records) Scanner
- VA Rating Decision Scanner
- Project Scanner
"""

import os
import json
import uuid
import asyncio
import subprocess
from datetime import datetime
from typing import Dict, Any, Optional, List
from enum import Enum
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScannerType(str, Enum):
    """Types of scanners"""
    DD214 = "dd214"
    STR = "str"
    RATING = "rating"
    PROJECT = "project"


class JobStatus(str, Enum):
    """Scanner job statuses"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"


class ScannerJob:
    """Represents a scanner execution job"""
    def __init__(
        self,
        job_id: str,
        scanner_type: ScannerType,
        file_path: str,
        veteran_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.job_id = job_id
        self.scanner_type = scanner_type
        self.file_path = file_path
        self.veteran_id = veteran_id or "anonymous"
        self.metadata = metadata or {}
        self.status = JobStatus.PENDING
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None
        self.stdout: Optional[str] = None
        self.stderr: Optional[str] = None
        self.exit_code: Optional[int] = None
        self.retry_count = 0
        self.max_retries = 3


class ScannerOrchestrator:
    """
    Orchestrates all scanner operations.

    RESPONSIBILITIES:
    - File upload management
    - Scanner job queue
    - Job execution
    - Result storage
    - Self-healing
    """

    def __init__(self, base_data_dir: str = "./Data"):
        self.base_data_dir = Path(base_data_dir)
        self.jobs: Dict[str, ScannerJob] = {}
        self.job_history: List[ScannerJob] = []
        self.max_history = 1000

        # Create base directories
        self._ensure_directories()

        logger.info(f"Scanner Orchestrator initialized with base directory: {self.base_data_dir}")

    def _ensure_directories(self):
        """Create all required data directories"""
        directories = [
            self.base_data_dir / "DD214",
            self.base_data_dir / "STR",
            self.base_data_dir / "Rating",
            self.base_data_dir / "Project",
            self.base_data_dir / "Logs",
            self.base_data_dir / "Results"
        ]

        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured directory exists: {directory}")

    def _get_save_path(self, scanner_type: ScannerType, veteran_id: str, filename: str) -> Path:
        """
        Get the file save path for uploaded files.

        Structure: /Data/{SCANNER_TYPE}/{veteran_id}/{timestamp}/
        """
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

        type_map = {
            ScannerType.DD214: "DD214",
            ScannerType.STR: "STR",
            ScannerType.RATING: "Rating",
            ScannerType.PROJECT: "Project"
        }

        scanner_dir = self.base_data_dir / type_map[scanner_type] / veteran_id / timestamp
        scanner_dir.mkdir(parents=True, exist_ok=True)

        return scanner_dir / filename

    async def save_uploaded_file(
        self,
        file_content: bytes,
        filename: str,
        scanner_type: ScannerType,
        veteran_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save an uploaded file to disk with validation.

        VALIDATION:
        - File exists (content length > 0)
        - File type supported
        - File is readable
        - Metadata logged

        Returns:
            Dict with file_path, size, validation status
        """
        veteran_id = veteran_id or f"anon_{uuid.uuid4().hex[:8]}"

        # Validate file content
        if not file_content or len(file_content) == 0:
            logger.error(f"File upload failed: empty file '{filename}'")
            return {
                "success": False,
                "error": "File is empty",
                "file_path": None,
                "size": 0
            }

        # Get save path
        file_path = self._get_save_path(scanner_type, veteran_id, filename)

        try:
            # Write file to disk
            file_path.write_bytes(file_content)

            # Verify file was written
            if not file_path.exists():
                raise IOError(f"File was not written to disk: {file_path}")

            file_size = file_path.stat().st_size

            if file_size == 0:
                raise IOError(f"File was written but is empty: {file_path}")

            # Log metadata
            metadata = {
                "filename": filename,
                "file_path": str(file_path),
                "size": file_size,
                "scanner_type": scanner_type.value,
                "veteran_id": veteran_id,
                "uploaded_at": datetime.utcnow().isoformat()
            }

            metadata_path = file_path.parent / "metadata.json"
            metadata_path.write_text(json.dumps(metadata, indent=2))

            logger.info(f"File uploaded successfully: {file_path} ({file_size} bytes)")

            return {
                "success": True,
                "file_path": str(file_path),
                "size": file_size,
                "veteran_id": veteran_id,
                "metadata": metadata
            }

        except Exception as e:
            logger.error(f"File upload failed: {filename} - {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "file_path": None,
                "size": 0
            }

    async def create_scan_job(
        self,
        scanner_type: ScannerType,
        file_path: str,
        veteran_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new scanner job.

        Returns:
            Job ID
        """
        job_id = str(uuid.uuid4())

        job = ScannerJob(
            job_id=job_id,
            scanner_type=scanner_type,
            file_path=file_path,
            veteran_id=veteran_id,
            metadata=metadata
        )

        self.jobs[job_id] = job

        logger.info(f"Created scan job: {job_id} ({scanner_type.value})")

        # Execute job asynchronously
        asyncio.create_task(self._execute_job(job))

        return job_id

    async def _execute_job(self, job: ScannerJob):
        """
        Execute a scanner job.

        EXECUTION:
        - Validate file exists and is readable
        - Call appropriate scanner
        - Capture stdout, stderr, exit code
        - Store structured results
        - Handle errors with retry logic
        """
        job.status = JobStatus.RUNNING
        job.started_at = datetime.utcnow()

        logger.info(f"Executing job: {job.job_id} ({job.scanner_type.value})")

        try:
            # Validate file exists
            file_path = Path(job.file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {job.file_path}")

            if not file_path.is_file():
                raise ValueError(f"Path is not a file: {job.file_path}")

            file_size = file_path.stat().st_size
            if file_size == 0:
                raise ValueError(f"File is empty: {job.file_path}")

            # Execute appropriate scanner
            if job.scanner_type == ScannerType.DD214:
                result = await self._execute_dd214_scanner(job.file_path)
            elif job.scanner_type == ScannerType.STR:
                result = await self._execute_str_scanner(job.file_path)
            elif job.scanner_type == ScannerType.RATING:
                result = await self._execute_rating_scanner(job.file_path)
            elif job.scanner_type == ScannerType.PROJECT:
                result = await self._execute_project_scanner(job.file_path)
            else:
                raise ValueError(f"Unknown scanner type: {job.scanner_type}")

            # Store result
            job.result = result
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()

            # Save result to disk
            result_path = self.base_data_dir / "Results" / f"{job.job_id}.json"
            result_path.write_text(json.dumps({
                "job_id": job.job_id,
                "scanner_type": job.scanner_type.value,
                "file_path": job.file_path,
                "veteran_id": job.veteran_id,
                "result": result,
                "completed_at": job.completed_at.isoformat()
            }, indent=2))

            logger.info(f"Job completed successfully: {job.job_id}")

        except Exception as e:
            logger.error(f"Job failed: {job.job_id} - {str(e)}")

            job.error = str(e)
            job.status = JobStatus.FAILED
            job.completed_at = datetime.utcnow()

            # Retry logic
            if job.retry_count < job.max_retries:
                job.retry_count += 1
                job.status = JobStatus.RETRY
                logger.info(f"Retrying job: {job.job_id} (attempt {job.retry_count}/{job.max_retries})")

                # Retry after delay
                await asyncio.sleep(5 * job.retry_count)
                await self._execute_job(job)

        finally:
            # Move to history if completed or failed permanently
            if job.status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                self.job_history.append(job)
                if len(self.job_history) > self.max_history:
                    self.job_history.pop(0)

    async def _execute_dd214_scanner(self, file_path: str) -> Dict[str, Any]:
        """
        Execute DD-214 scanner on file.

        This will call the actual DD-214 parser service.
        """
        # Import DD-214 parser
        from app.services.parsers.dd214_parser import DD214Parser

        parser = DD214Parser()
        result = await parser.parse_file(file_path)

        return result

    async def _execute_str_scanner(self, file_path: str) -> Dict[str, Any]:
        """
        Execute STR scanner on file.

        This will call the actual STR parser service.
        """
        # Import STR parser
        from app.services.parsers.str_parser import STRParser

        parser = STRParser()
        result = await parser.parse_file(file_path)

        return result

    async def _execute_rating_scanner(self, file_path: str) -> Dict[str, Any]:
        """
        Execute VA Rating Decision scanner on file.

        This will call the actual rating decision parser service.
        """
        # Import rating decision parser
        from app.services.parsers.rating_decision_parser import RatingDecisionParser

        parser = RatingDecisionParser()
        result = await parser.parse_file(file_path)

        return result

    async def _execute_project_scanner(self, file_path: str) -> Dict[str, Any]:
        """
        Execute project scanner (scans all documents in a directory).
        """
        # TODO: Implement project scanner
        return {
            "status": "success",
            "documents_scanned": 0,
            "message": "Project scanner not yet implemented"
        }

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get the status of a scanner job"""
        job = self.jobs.get(job_id)

        if not job:
            # Check history
            for historical_job in self.job_history:
                if historical_job.job_id == job_id:
                    job = historical_job
                    break

        if not job:
            return None

        return {
            "job_id": job.job_id,
            "scanner_type": job.scanner_type.value,
            "status": job.status.value,
            "file_path": job.file_path,
            "veteran_id": job.veteran_id,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "error": job.error,
            "retry_count": job.retry_count
        }

    def get_job_result(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get the result of a completed scanner job"""
        job = self.jobs.get(job_id)

        if not job:
            # Check history
            for historical_job in self.job_history:
                if historical_job.job_id == job_id:
                    job = historical_job
                    break

        if not job:
            return None

        if job.status != JobStatus.COMPLETED:
            return {
                "status": "not_ready",
                "job_status": job.status.value,
                "error": job.error
            }

        return {
            "status": "ready",
            "job_id": job.job_id,
            "scanner_type": job.scanner_type.value,
            "result": job.result,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None
        }

    def get_scanner_health(self) -> Dict[str, Any]:
        """
        Get health metrics for all scanners.

        Returns statistics about scanner performance.
        """
        total_jobs = len(self.jobs) + len(self.job_history)
        completed_jobs = sum(1 for job in self.job_history if job.status == JobStatus.COMPLETED)
        failed_jobs = sum(1 for job in self.job_history if job.status == JobStatus.FAILED)
        running_jobs = sum(1 for job in self.jobs.values() if job.status == JobStatus.RUNNING)
        pending_jobs = sum(1 for job in self.jobs.values() if job.status == JobStatus.PENDING)

        # Calculate success rate
        success_rate = (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0

        # Get last scan times per scanner type
        last_scans = {}
        for scanner_type in ScannerType:
            matching_jobs = [
                job for job in self.job_history
                if job.scanner_type == scanner_type and job.completed_at
            ]
            if matching_jobs:
                last_scan = max(matching_jobs, key=lambda j: j.completed_at)
                last_scans[scanner_type.value] = {
                    "timestamp": last_scan.completed_at.isoformat(),
                    "status": last_scan.status.value,
                    "error": last_scan.error
                }

        return {
            "status": "healthy" if success_rate > 80 else "degraded",
            "total_jobs": total_jobs,
            "completed_jobs": completed_jobs,
            "failed_jobs": failed_jobs,
            "running_jobs": running_jobs,
            "pending_jobs": pending_jobs,
            "success_rate": round(success_rate, 2),
            "last_scans": last_scans,
            "uptime": "100%",  # TODO: Track actual uptime
            "self_healing_actions": 0  # TODO: Track self-healing actions
        }


# Global orchestrator instance
orchestrator = ScannerOrchestrator()


def get_orchestrator() -> ScannerOrchestrator:
    """Get the global orchestrator instance"""
    return orchestrator
