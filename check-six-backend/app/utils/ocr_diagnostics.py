"""
OCR Diagnostics and Dependency Management

Provides comprehensive checks for OCR dependencies (Poppler, Tesseract)
and structured error handling for OCR pipeline failures.
"""

import os
import sys
import subprocess
import logging
from typing import Dict, Tuple, List, Optional
from pathlib import Path
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class DependencyCheckResult:
    """Result of a dependency check"""
    available: bool
    version: Optional[str]
    path: Optional[str]
    error: Optional[str]


@dataclass
class OCRDiagnosticResult:
    """Complete OCR diagnostic result"""
    poppler_detected: bool
    pdfinfo_available: bool
    pdftoppm_available: bool
    pdfinfo_version: Optional[str]
    pdftoppm_version: Optional[str]
    tesseract_detected: bool
    tesseract_version: Optional[str]
    google_vision_available: bool
    errors: List[str]
    warnings: List[str]
    recommendations: List[str]
    ready_for_pdf_ocr: bool


class OCRDependencyManager:
    """Manage OCR dependencies and provide diagnostics"""

    def __init__(self, poppler_path: str = "", tesseract_path: str = ""):
        """
        Initialize OCR dependency manager

        Args:
            poppler_path: Optional path to Poppler bin directory
            tesseract_path: Optional path to Tesseract executable
        """
        self.poppler_path = poppler_path
        self.tesseract_path = tesseract_path
        self._setup_paths()

    def _setup_paths(self):
        """Setup system PATH with custom OCR tool paths if provided"""
        if self.poppler_path and os.path.isdir(self.poppler_path):
            if self.poppler_path not in os.environ.get('PATH', ''):
                os.environ['PATH'] = self.poppler_path + os.pathsep + os.environ.get('PATH', '')
                logger.info(f"Added Poppler path to system PATH: {self.poppler_path}")
        else:
            if self.poppler_path:
                logger.warning(f"Poppler path not found: {self.poppler_path}")

        if self.tesseract_path and os.path.isfile(self.tesseract_path):
            os.environ['PYTESSERACT_PATH'] = self.tesseract_path
            logger.info(f"Set Tesseract path: {self.tesseract_path}")
        else:
            if self.tesseract_path:
                logger.warning(f"Tesseract path not found: {self.tesseract_path}")

    def check_poppler(self) -> DependencyCheckResult:
        """Check if Poppler is installed and accessible"""
        try:
            # Try pdfinfo
            result = subprocess.run(
                ['pdfinfo', '-v'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                # Extract version from output
                version_line = result.stdout.strip().split('\n')[0] if result.stdout else "Unknown"
                pdfinfo_path = self._get_command_path('pdfinfo')
                return DependencyCheckResult(
                    available=True,
                    version=version_line,
                    path=pdfinfo_path,
                    error=None
                )
        except FileNotFoundError:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error="pdfinfo not found in PATH"
            )
        except subprocess.TimeoutExpired:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error="pdfinfo command timed out"
            )
        except Exception as e:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error=str(e)
            )

    def check_pdftoppm(self) -> DependencyCheckResult:
        """Check if pdftoppm is installed and accessible"""
        try:
            result = subprocess.run(
                ['pdftoppm', '-v'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0 or "pdftoppm version" in result.stdout + result.stderr:
                version_line = (result.stdout + result.stderr).strip().split('\n')[0] if (result.stdout or result.stderr) else "Unknown"
                pdftoppm_path = self._get_command_path('pdftoppm')
                return DependencyCheckResult(
                    available=True,
                    version=version_line,
                    path=pdftoppm_path,
                    error=None
                )
        except FileNotFoundError:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error="pdftoppm not found in PATH"
            )
        except subprocess.TimeoutExpired:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error="pdftoppm command timed out"
            )
        except Exception as e:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error=str(e)
            )

    def check_tesseract(self) -> DependencyCheckResult:
        """Check if Tesseract is installed and accessible"""
        try:
            import pytesseract
            version = pytesseract.get_tesseract_version()
            tesseract_path = self._get_command_path('tesseract')
            return DependencyCheckResult(
                available=True,
                version=str(version),
                path=tesseract_path,
                error=None
            )
        except ImportError:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error="pytesseract not installed"
            )
        except Exception as e:
            return DependencyCheckResult(
                available=False,
                version=None,
                path=None,
                error=str(e)
            )

    def check_google_vision(self) -> bool:
        """Check if Google Cloud Vision is available"""
        try:
            from google.cloud import vision  # noqa: F401
            return True
        except ImportError:
            return False

    def verify_pdf_for_processing(self, file_path: str) -> Tuple[bool, str]:
        """
        Verify that a PDF file can be processed

        Args:
            file_path: Path to PDF file

        Returns:
            Tuple of (can_process: bool, message: str)
        """
        if not os.path.isfile(file_path):
            return False, "File not found"

        # Check if file is readable
        if not os.access(file_path, os.R_OK):
            return False, "File is not readable"

        # Try pdfinfo to get page count
        try:
            result = subprocess.run(
                ['pdfinfo', file_path],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                return False, f"pdfinfo failed: {result.stderr}"

            # Extract page count
            for line in result.stdout.split('\n'):
                if line.startswith('Pages:'):
                    try:
                        pages = int(line.split(':')[1].strip())
                        if pages == 0:
                            return False, "PDF has no pages"
                        return True, f"PDF has {pages} pages"
                    except (ValueError, IndexError):
                        return False, "Could not parse page count from pdfinfo"

            return False, "Could not find page count in pdfinfo output"

        except FileNotFoundError:
            return False, "pdfinfo not found in PATH - Poppler may not be installed"
        except subprocess.TimeoutExpired:
            return False, "pdfinfo command timed out"
        except Exception as e:
            return False, f"Error checking PDF: {str(e)}"

    def run_diagnostics(self) -> OCRDiagnosticResult:
        """Run comprehensive OCR diagnostics"""
        errors = []
        warnings = []
        recommendations = []

        # Check Poppler
        logger.info("Checking Poppler installation...")
        pdfinfo_check = self.check_poppler()
        pdftoppm_check = self.check_pdftoppm()

        if not pdfinfo_check.available:
            errors.append(f"pdfinfo not available: {pdfinfo_check.error}")
            recommendations.append(
                "Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases/ "
                "or 'apt-get install poppler-utils' on Linux"
            )
        else:
            logger.info(f"pdfinfo detected: {pdfinfo_check.version}")

        if not pdftoppm_check.available:
            errors.append(f"pdftoppm not available: {pdftoppm_check.error}")
            recommendations.append(
                "Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases/ "
                "or 'apt-get install poppler-utils' on Linux"
            )
        else:
            logger.info(f"pdftoppm detected: {pdftoppm_check.version}")

        # Check Tesseract
        logger.info("Checking Tesseract OCR installation...")
        tesseract_check = self.check_tesseract()

        if not tesseract_check.available:
            warnings.append(f"Tesseract not available: {tesseract_check.error}")
            recommendations.append(
                "Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki "
                "or 'apt-get install tesseract-ocr' on Linux"
            )
        else:
            logger.info(f"Tesseract detected: {tesseract_check.version}")

        # Check Google Vision
        logger.info("Checking Google Cloud Vision availability...")
        google_vision_available = self.check_google_vision()
        if google_vision_available:
            logger.info("Google Cloud Vision is available as fallback")
        else:
            logger.info("Google Cloud Vision not available (not installed or no credentials)")

        # Determine readiness
        ready_for_pdf_ocr = pdfinfo_check.available and pdftoppm_check.available

        if not ready_for_pdf_ocr and not tesseract_check.available and not google_vision_available:
            errors.append("No OCR engines available for PDF processing")
            recommendations.append(
                "Install at least one: Poppler (for PDF rasterization) + Tesseract (for OCR), "
                "or enable Google Cloud Vision"
            )

        return OCRDiagnosticResult(
            poppler_detected=pdfinfo_check.available and pdftoppm_check.available,
            pdfinfo_available=pdfinfo_check.available,
            pdftoppm_available=pdftoppm_check.available,
            pdfinfo_version=pdfinfo_check.version,
            pdftoppm_version=pdftoppm_check.version,
            tesseract_detected=tesseract_check.available,
            tesseract_version=tesseract_check.version,
            google_vision_available=google_vision_available,
            errors=errors,
            warnings=warnings,
            recommendations=recommendations,
            ready_for_pdf_ocr=ready_for_pdf_ocr
        )

    @staticmethod
    def _get_command_path(command: str) -> Optional[str]:
        """Get full path to a command"""
        try:
            if sys.platform == 'win32':
                result = subprocess.run(['where', command], capture_output=True, text=True)
            else:
                result = subprocess.run(['which', command], capture_output=True, text=True)

            if result.returncode == 0:
                return result.stdout.strip().split('\n')[0]
        except Exception:
            pass
        return None
