"""
Installation and setup for the Upload-Only Scanner feature
"""

import subprocess
import sys
from pathlib import Path


def install_scanner_dependencies():
    """Install required packages for scanner functionality"""

    dependencies = {
        'pdf2image': 'PDF to image conversion',
        'pytesseract': 'OCR (text extraction from images)',
        'PyPDF2': 'PDF text extraction',
        'python-docx': 'DOCX file reading',
        'Pillow': 'Image processing',
    }

    print("=" * 70)
    print("UPLOADING-ONLY SCANNER - DEPENDENCY INSTALLATION")
    print("=" * 70)

    for package, description in dependencies.items():
        print(f"\n📦 Installing {package}: {description}")
        try:
            subprocess.check_call(
                [sys.executable, '-m', 'pip', 'install', package],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            print(f"   ✓ {package} installed successfully")
        except subprocess.CalledProcessError:
            print(f"   ✗ Failed to install {package}")
            print(f"   Try manually: pip install {package}")


def setup_directories():
    """Create required directories"""

    directories = [
        Path('uploads/raw'),
        Path('logs/scanners'),
        Path('data/vault'),
    ]

    print("\n" + "=" * 70)
    print("DIRECTORY SETUP")
    print("=" * 70)

    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created: {directory}")


def verify_setup():
    """Verify all components are installed"""

    print("\n" + "=" * 70)
    print("VERIFICATION")
    print("=" * 70)

    checks = {
        'FastAPI': 'fastapi',
        'SQLAlchemy': 'sqlalchemy',
        'PDF Support': 'pdf2image',
        'OCR Support': 'pytesseract',
        'PDF Reading': 'PyPDF2',
        'DOCX Support': 'docx',
        'Image Support': 'PIL',
    }

    all_ok = True
    for name, module in checks.items():
        try:
            __import__(module)
            print(f"✓ {name}: Installed")
        except ImportError:
            print(f"✗ {name}: Missing")
            all_ok = False

    if all_ok:
        print("\n✓ All dependencies installed!")
        return True
    else:
        print("\n✗ Some dependencies are missing. Run install_scanner_dependencies()")
        return False


def print_quick_start():
    """Print quick start guide"""

    guide = """
┌──────────────────────────────────────────────────────────────────────────┐
│                   UPLOAD-ONLY SCANNER QUICK START                       │
└──────────────────────────────────────────────────────────────────────────┘

1. INSTALLATION
===============

   # Install dependencies
   pip install pdf2image pytesseract PyPDF2 python-docx Pillow

   # For OCR support on Windows:
   choco install tesseract-ocr

   # For Mac:
   brew install tesseract

   # For Linux:
   sudo apt-get install tesseract-ocr


2. CONFIGURATION
================

   # Environment variables (.env)
   PROJECT_ROOT=/path/to/rally-forge
   UPLOADS_DIR=uploads/raw
   MAX_UPLOAD_SIZE=10485760  # 10MB


3. DATABASE SETUP
=================

   # Run migrations
   alembic upgrade head


4. TEST THE SCANNER
===================

   # Run unit tests
   pytest backend/tests/test_scanner_upload.py -v

   # Run with coverage
   pytest backend/tests/test_scanner_upload.py --cov=app.scanner


5. START THE SERVERS
====================

   # Backend (port 8000)
   python -m uvicorn backend.app.main:app --reload

   # Frontend (port 5176)
   cd frontend && npm run dev


6. TRY IT OUT
=============

   # Frontend
   Open http://localhost:5176/scanner

   # Upload a test DD-214 document
   - Try PDF, DOCX, or scanned image
   - See status: "Document uploaded successfully"
   - No technical output shown
   - Check /profile to see auto-filled fields


7. VERIFY IT WORKS
==================

   # Backend logs
   tail -f logs/scanners/dd214_extraction.log

   # Database check
   SELECT * FROM document_vault;
   SELECT * FROM veterans WHERE id = 'VET_001';


8. MONITORING
=============

   # Check upload directory
   ls -la uploads/raw/

   # Monitor processing
   tail -f logs/background_jobs.log

   # View audit trail
   SELECT * FROM audit_trail WHERE event = 'profile_autofill';


TROUBLESHOOTING
===============

Q: OCR is slow / not working?
A: Install tesseract:
   - Windows: choco install tesseract-ocr
   - Mac: brew install tesseract
   - Linux: sudo apt-get install tesseract-ocr

Q: File upload gives 413 error?
A: File exceeds 10MB limit. Check config and try smaller file.

Q: Profile not updating?
A: Check veteran_id is correct. View logs for errors.

Q: Background processing taking long?
A: Normal for large PDFs with OCR. Check server resources.


API ENDPOINT
============

POST /api/scanner/upload
Content-Type: multipart/form-data

file: <binary file>
veteran_id: VET_001 (optional)

Response:
{
  "status": "success",
  "message": "Document uploaded successfully. Processing in background."
}


FILES INVOLVED
==============

Frontend:
  frontend/src/pages/Scanner.tsx       (170 lines)
  frontend/src/pages/Scanner.css       (650 lines)

Backend:
  backend/app/routers/scanner_upload.py (250 lines)
  backend/app/scanner/dd214_extractor.py (400 lines)
  backend/app/models/database.py        (DocumentVault model)

Tests:
  backend/tests/test_scanner_upload.py  (400+ lines)

Documentation:
  docs/UPLOAD_ONLY_SCANNER_IMPLEMENTATION.md (Comprehensive)


KEY FEATURES
============

✓ Drag-and-drop upload
✓ File type validation (PDF, DOCX, TXT, JPG, PNG)
✓ 10MB file size limit
✓ Silent background processing
✓ Non-destructive profile autofill
✓ DD-214 field extraction
✓ Document vault storage
✓ Audit trail logging
✓ Mobile responsive design
✓ Accessibility compliant (WCAG AA)


NEXT STEPS
==========

1. Install dependencies
2. Run database migrations
3. Start backend & frontend
4. Upload test document
5. Verify profile updated
6. Check logs for success
7. Customize for your needs

Questions? See UPLOAD_ONLY_SCANNER_IMPLEMENTATION.md
"""

    print(guide)


if __name__ == "__main__":
    # Run setup steps
    setup_directories()
    install_scanner_dependencies()

    if verify_setup():
        print_quick_start()
        print("\n✓ Setup complete! Ready to use Upload-Only Scanner.")
    else:
        print("\n⚠ Setup incomplete. Please install missing dependencies.")

