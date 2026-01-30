#!/usr/bin/env python3
"""
Quick startup verification script for DD-214 OCR pipeline

Run this to check if the backend can start and all dependencies are available
"""

import sys
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def check_python_packages():
    """Check if required Python packages are installed"""
    packages = {
        'fastapi': 'FastAPI',
        'pydantic': 'Pydantic',
        'pytesseract': 'Tesseract OCR',
        'pdf2image': 'PDF2Image',
        'PIL': 'Pillow',
    }

    missing = []
    for package, name in packages.items():
        try:
            __import__(package)
            logger.info(f"✓ {name} installed")
        except ImportError:
            logger.error(f"✗ {name} NOT installed - {package}")
            missing.append(package)

    return len(missing) == 0, missing


def check_system_binaries():
    """Check if system binaries are available"""
    import subprocess

    binaries = {
        'pdfinfo': 'Poppler - pdfinfo',
        'pdftoppm': 'Poppler - pdftoppm',
        'tesseract': 'Tesseract OCR',
    }

    missing = []
    for binary, name in binaries.items():
        try:
            result = subprocess.run(
                [binary, '--version'] if binary != 'pdfinfo' else [binary, '-v'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0 or 'version' in (result.stdout + result.stderr).lower():
                version = (result.stdout + result.stderr).split('\n')[0]
                logger.info(f"✓ {name}: {version}")
            else:
                logger.error(f"✗ {name} - returned error code {result.returncode}")
                missing.append(binary)
        except FileNotFoundError:
            logger.error(f"✗ {name} NOT in PATH")
            missing.append(binary)
        except subprocess.TimeoutExpired:
            logger.error(f"✗ {name} - command timed out")
            missing.append(binary)
        except Exception as e:
            logger.error(f"✗ {name} - {str(e)}")
            missing.append(binary)

    return len(missing) == 0, missing


def check_backend_imports():
    """Check if backend can import correctly"""
    try:
        sys.path.insert(0, 'rally-forge-backend')

        # Try importing main modules
        logger.info("Checking backend imports...")

        from app.utils.ocr_diagnostics import OCRDependencyManager
        logger.info("✓ OCR Diagnostics module")

        from app.services.dd214_ocr_scanner import DD214OCRScanner
        logger.info("✓ DD-214 OCR Scanner service")

        from app.routers import dd214_scanner
        logger.info("✓ DD-214 Scanner router")

        from app.config import settings
        logger.info(f"✓ Configuration (log_level={settings.log_level})")

        return True, []

    except ImportError as e:
        logger.error(f"✗ Import error: {e}")
        return False, [str(e)]
    except Exception as e:
        logger.error(f"✗ Unexpected error: {e}")
        return False, [str(e)]


def main():
    """Run all checks"""
    print("=" * 60)
    print("DD-214 OCR Pipeline - Startup Verification")
    print("=" * 60)
    print()

    all_ok = True

    # Check Python packages
    print("1. Python Packages")
    print("-" * 60)
    pkg_ok, missing_pkg = check_python_packages()
    if not pkg_ok:
        logger.warning(f"Install missing packages: pip install {' '.join(missing_pkg)}")
        all_ok = False
    print()

    # Check system binaries
    print("2. System Binaries")
    print("-" * 60)
    bin_ok, missing_bin = check_system_binaries()
    if not missing_bin or len([b for b in missing_bin if b in ['pdfinfo', 'pdftoppm']]) == 0:
        logger.warning("Poppler not fully available - PDF processing may fail")
    if not bin_ok and len([b for b in missing_bin if b in ['pdfinfo', 'pdftoppm']]) > 0:
        logger.error("Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases/")
        all_ok = False
    print()

    # Check backend imports
    print("3. Backend Imports")
    print("-" * 60)
    import_ok, import_errors = check_backend_imports()
    if not import_ok:
        all_ok = False
    print()

    # Summary
    print("=" * 60)
    if all_ok and pkg_ok and import_ok:
        print("✓ ALL CHECKS PASSED - Backend ready to start")
        print("=" * 60)
        print()
        print("Start backend with:")
        print("  cd rally-forge-backend")
        print("  python -m uvicorn app.main:app --reload --port 8000")
        print()
        print("Check diagnostics at:")
        print("  http://localhost:8000/api/scanner/diagnostics/ocr")
        return 0
    else:
        print("✗ SOME CHECKS FAILED - See errors above")
        print("=" * 60)
        print()
        print("Fix issues and try again:")
        if not pkg_ok:
            print(f"  pip install {' '.join(missing_pkg)}")
        if len([b for b in missing_bin if b in ['pdfinfo', 'pdftoppm']]) > 0:
            print("  Install Poppler from: https://github.com/oschwartz10612/poppler-windows/releases/")
        if not import_ok:
            print("  Check backend code for import errors")
        return 1


if __name__ == '__main__':
    exit(main())

