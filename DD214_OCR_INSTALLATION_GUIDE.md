# DD-214 OCR Pipeline - Complete Installation & Setup Guide

## Overview

The DD-214 OCR pipeline requires **Poppler** (for PDF processing) and **Tesseract** (for text extraction). This guide provides complete setup instructions for Windows, Linux, and macOS.

## Architecture

```
DD-214 File Upload
    ↓
[File Validation] (type, size)
    ↓
[Dependency Check] (Poppler, Tesseract)
    ↓
[PDF Verification] (pdfinfo - checks page count)
    ↓
[PDF Rasterization] (pdftoppm - converts PDF to images)
    ↓
[OCR Text Extraction] (Tesseract on images)
    ↓
[Fallback: Google Vision] (if Tesseract fails)
    ↓
[Data Parsing] (structure raw text)
    ↓
[Response] (extracted fields + confidence score)
```

---

## Installation by Platform

### Windows

#### Option 1: Manual Installation (Recommended)

**Step 1: Install Poppler**

1. Go to: https://github.com/oschwartz10612/poppler-windows/releases/
2. Download the latest release (e.g., `poppler-24.01.0_windows-x64.zip`)
3. Extract to a known location, e.g.: `C:\poppler\`
4. Structure should be: `C:\poppler\Library\bin\pdfinfo.exe`, `pdftoppm.exe`
5. Add to system PATH:
   - Open System Properties → Environment Variables
   - Add `C:\poppler\Library\bin` to your PATH
   - Or use in code with `POPPLER_PATH` environment variable

**Step 2: Install Tesseract**

1. Go to: https://github.com/UB-Mannheim/tesseract/wiki
2. Download the latest installer (e.g., `tesseract-ocr-w64-setup-v5.x.x.exe`)
3. Run installer, choose installation path
4. Default path: `C:\Program Files\Tesseract-OCR`
5. The installer automatically adds to PATH

**Step 3: Verify Installation**

```powershell
# Check Poppler
pdfinfo -v
pdftoppm -v

# Check Tesseract
tesseract --version
```

**Step 4: Configure Backend**

Create or update `.env` file in `rally-forge-backend`:

```env
# Optional: If not in system PATH
POPPLER_PATH=C:\poppler\Library\bin
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

#### Option 2: Using Chocolatey (Windows)

```powershell
# Install Chocolatey first if needed
# See: https://chocolatey.org/install

choco install poppler tesseract-ocr

# Verify
pdfinfo -v
tesseract --version
```

#### Option 3: Using WSL2 + Linux

If using Windows Subsystem for Linux:

```bash
sudo apt-get update
sudo apt-get install -y poppler-utils tesseract-ocr
```

---

### Linux (Ubuntu/Debian)

```bash
# Update package manager
sudo apt-get update

# Install Poppler utilities
sudo apt-get install -y poppler-utils

# Install Tesseract OCR
sudo apt-get install -y tesseract-ocr

# Verify installation
pdfinfo -v
pdftoppm -v
tesseract --version
```

Optional: Install additional language data for Tesseract:

```bash
sudo apt-get install -y tesseract-ocr-eng  # English
sudo apt-get install -y tesseract-ocr-all  # All languages
```

---

### macOS

```bash
# Install Homebrew if needed
# See: https://brew.sh

# Install Poppler
brew install poppler

# Install Tesseract
brew install tesseract

# Verify installation
pdfinfo -v
pdftoppm -v
tesseract --version
```

---

## Backend Setup

### 1. Install Python Dependencies

```bash
cd rally-forge-backend

# Activate virtual environment (if not already activated)
source .venv/bin/activate  # Linux/macOS
.\.venv\Scripts\Activate.ps1  # Windows PowerShell

# Install required packages
pip install pytesseract pdf2image pillow

# Optional: Google Cloud Vision (if using as fallback)
pip install google-cloud-vision
```

### 2. Configure Backend

Update `rally-forge-backend/app/config.py`:

```python
class Settings(BaseSettings):
    # OCR and Document Processing
    poppler_path: str = ""  # Leave empty to use system PATH, or set to full path
    tesseract_path: str = ""  # Leave empty for default, or set full path to tesseract executable
    google_vision_enabled: bool = False  # Set to True if using Google Vision API
    ocr_timeout_seconds: int = 30
```

Or use environment variables:

```bash
export POPPLER_PATH="/usr/bin"  # Linux path
export TESSERACT_PATH="/usr/bin/tesseract"
export GOOGLE_VISION_ENABLED="false"
export OCR_TIMEOUT_SECONDS="30"
```

### 3. Test Backend Startup

```bash
cd rally-forge-backend

# Start backend
python -m uvicorn app.main:app --reload --port 8000
```

Watch for initialization logs:

```
INFO:app.utils.ocr_diagnostics:Added Poppler path to system PATH: C:\poppler\Library\bin
INFO:app.services.dd214_ocr_scanner:Tesseract OCR is available
INFO:app.services.dd214_ocr_scanner:Poppler (pdfinfo) is available
```

---

## Diagnostics Endpoint

### Check OCR Status

```bash
# Get OCR diagnostics
curl http://localhost:8000/api/scanner/diagnostics/ocr

# Returns:
{
  "status": "healthy",
  "dependencies": {
    "poppler": {
      "detected": true,
      "pdfinfo_available": true,
      "pdftoppm_available": true,
      "pdfinfo_version": "pdfinfo version 24.01.0"
    },
    "tesseract": {
      "detected": true,
      "version": "tesseract 5.3.0"
    }
  },
  "ocr_ready": {
    "pdf_processing": true,
    "image_processing": true,
    "overall": true
  },
  "errors": [],
  "warnings": []
}
```

---

## Troubleshooting

### Error: "pdfinfo not found in PATH"

**Cause**: Poppler is not installed or not in system PATH

**Solution**:
1. Install Poppler (see platform-specific instructions above)
2. Add to PATH or set `POPPLER_PATH` environment variable
3. Restart backend service

### Error: "Unable to get page count"

**Cause**: Poppler not properly installed or PDF is corrupted

**Solution**:
1. Test manually: `pdfinfo /path/to/dd214.pdf`
2. Check file is valid PDF
3. Verify Poppler installation
4. Check file permissions (must be readable)

### Error: "Tesseract not available"

**Cause**: Tesseract is not installed or not in PATH

**Solution**:
1. Install Tesseract (see platform-specific instructions)
2. Verify: `tesseract --version`
3. Set `TESSERACT_PATH` if using non-standard location
4. Restart backend

### Error: "No OCR engines available"

**Cause**: Neither Tesseract nor Google Vision is available

**Solution**:
1. Install at least Tesseract (required minimum)
2. Or enable Google Cloud Vision API as fallback
3. Check `/api/scanner/diagnostics/ocr` endpoint for details

### Error: "PDF conversion failed"

**Cause**: pdf2image module issue or Poppler not in PATH

**Solution**:
1. Verify Poppler is installed: `pdfinfo -v`
2. Check PATH includes Poppler: `echo $PATH` (Linux/macOS) or `$env:PATH` (Windows)
3. Reinstall pdf2image: `pip install --upgrade pdf2image`

### Error: "Timeout expired"

**Cause**: OCR taking too long (large file, slow system)

**Solution**:
1. Try with smaller file
2. Increase timeout: `ocr_timeout_seconds=60`
3. Check system resources (CPU, RAM)

---

## Performance Tuning

### Optimize for Speed

```python
# In config.py - reduce timeout for faster failure
ocr_timeout_seconds: int = 15  # Default is 30

# Limit max file size for faster processing
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB instead of 10MB
```

### Optimize for Accuracy

```python
# Use higher quality OCR
tesseract_config = "--psm 3 -l eng"  # Page Segmentation Mode 3

# Use Google Vision for critical documents
google_vision_enabled: bool = True
```

---

## Google Cloud Vision Setup (Optional)

If you want to use Google Cloud Vision as a fallback:

### 1. Set up GCP Account

- Create Google Cloud project
- Enable Cloud Vision API
- Create service account with Vision permissions
- Download JSON credentials

### 2. Install Google Cloud SDK

```bash
pip install google-cloud-vision google-auth
```

### 3. Configure Credentials

```bash
# Set credentials path
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"

# Or configure in code
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/credentials.json'
```

### 4. Enable in Backend

```python
# In config.py
google_vision_enabled: bool = True
```

---

## Testing the OCR Pipeline

### 1. Check Diagnostics

```bash
curl http://localhost:8000/api/scanner/diagnostics/ocr
```

### 2. Get Scanner Info

```bash
curl http://localhost:8000/api/scanner/dd214/info
```

### 3. Upload Sample DD-214

```bash
curl -X POST \
  -F "file=@/path/to/sample_dd214.pdf" \
  http://localhost:8000/api/scanner/dd214/upload
```

### 4. Check Response

```json
{
  "success": true,
  "data": {
    "branch": "Army",
    "entry_date": "01/15/2003",
    "separation_date": "06/20/2023",
    "years_of_service": 20,
    "rank": "E-7",
    "character_of_service": "Honorable",
    "combat_service": true,
    "combat_locations": ["Iraq", "Afghanistan"],
    "awards": ["Bronze Star", "Purple Heart"],
    "mos_code": "68W",
    "mos_title": "Combat Medic",
    "extraction_confidence": "high",
    "scanned_at": "2024-01-29T15:30:00"
  }
}
```

---

## Deployment Checklist

- [ ] Poppler installed and in PATH (or `POPPLER_PATH` set)
- [ ] Tesseract installed and in PATH (or `TESSERACT_PATH` set)
- [ ] Python dependencies installed: `pytesseract`, `pdf2image`, `pillow`
- [ ] Backend starts without errors
- [ ] `/api/scanner/diagnostics/ocr` returns `"status": "healthy"`
- [ ] Sample DD-214 upload successful
- [ ] Extracted data matches expected fields
- [ ] Confidence score is appropriate
- [ ] Error messages are actionable
- [ ] Frontend integration working

---

## Support

If you encounter issues:

1. **Check diagnostics**: `GET /api/scanner/diagnostics/ocr`
2. **Check logs**: Backend should show detailed errors
3. **Verify installation**: Run `pdfinfo -v` and `tesseract --version` manually
4. **Try sample files**: Use various DD-214 formats to test
5. **Enable debug logging**: Set `log_level: "DEBUG"` in config

---

## Next Steps

1. Run installation for your platform (above)
2. Install Python dependencies
3. Start backend and check diagnostics
4. Test with sample DD-214
5. Integrate with frontend
6. Deploy to production

