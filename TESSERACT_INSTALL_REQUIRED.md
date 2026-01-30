# 🎯 OCR Scanner - Complete Fix Required

## What's Missing

The scanner needs **Tesseract command-line** executable to work. Current status:

| Component | Status | Location |
|-----------|--------|----------|
| Poppler | ✅ Ready | `C:\Dev\Rally Forge\App\poppler-25.12.0` |
| pytesseract package | ✅ Installed | `.venv/lib/site-packages` |
| **Tesseract executable** | ❌ **MISSING** | Need to install |
| Google Cloud Vision | ⚠️ Optional | Can be fallback |

---

## Installation Options

### Option 1: Manual Download (RECOMMENDED)

1. **Go to**: https://github.com/UB-Mannheim/tesseract/releases

2. **Download**:
   - File: `tesseract-ocr-w64-setup-v5.3.3.exe` (or latest version)
   - Size: ~25MB
   - Save to: `C:\Dev\Rally Forge\App\`

3. **Run installer**:
   - Double-click the `.exe`
   - Click through wizard
   - Accept default path: `C:\Program Files\Tesseract-OCR`
   - Complete installation

4. **Close and reopen PowerShell** (IMPORTANT!)

5. **Verify**:
   ```powershell
   tesseract --version
   # Should output: tesseract 5.3.3
   ```

---

### Option 2: Use Python Workaround (Temporary)

If you can't install system-wide, configure backend to look in local path:

**In `rally-forge-backend/app/config.py`:**
```python
tesseract_path: str = r"C:\Dev\Rally Forge\App\tesseract-3.05.02-20180621\api"
```

But this likely won't work - the source code doesn't have compiled binaries.

---

### Option 3: Use Google Cloud Vision (Alternative)

Enable Vision API as fallback in config:
```python
google_vision_enabled: bool = True  # Enable fallback
```

Then configure Google Cloud credentials. See `DD214_OCR_README.md`

---

## After Installation - Test Steps

### 1. Verify Tesseract
```powershell
tesseract --version
# Expected: tesseract 5.3.3
#           leptonica-1.80.0
#           libpng 1.6.37 zlib 1.2.11
```

### 2. Verify Backend Can Find It
```powershell
cd "C:\Dev\Rally Forge"
.\.venv\Scripts\Activate.ps1
python verify_ocr_setup.py
```

Expected output:
```
✓ Tesseract OCR IN PATH
✓ Poppler - pdfinfo IN PATH
✓ Poppler - pdftoppm IN PATH
✓ All systems ready
```

### 3. Start Backend
```powershell
cd rally-forge-backend
python -m uvicorn app.main:app --reload --port 8000
```

Look for these in output:
```
✓ Poppler (pdfinfo) is available
✓ Tesseract is available
✓ Application startup complete
```

### 4. Test Upload
From frontend or curl:
```powershell
curl -X POST `
  -F "file=@App\DD214\ 98-03.pdf" `
  http://localhost:8000/api/scanner/dd214/upload
```

Expected: JSON with extracted fields (rank, branch, dates, etc.)

---

## The Complete OCR Pipeline

```
PDF File Upload
        ↓
Backend receives file
        ↓
Poppler (pdfinfo)
  ├─ Validates PDF
  └─ Gets page count
        ↓
Poppler (pdftoppm)
  └─ Converts PDF → images
        ↓
Tesseract OCR ← CURRENTLY MISSING
  └─ Reads text from images
        ↓
pytesseract (Python wrapper)
  └─ Calls tesseract process
        ↓
Parse extracted text
  ├─ Extract rank
  ├─ Extract branch
  ├─ Extract dates
  └─ etc.
        ↓
Return JSON to frontend ✅
```

**Tesseract is the final missing link!**

---

## Why The Error Shows

When you uploaded the PDF:
1. ✅ Frontend sent request
2. ✅ Backend received it
3. ✅ Poppler validated PDF
4. ✅ Poppler converted to images
5. ❌ pytesseract tried to call `tesseract` command
6. ❌ `tesseract.exe` not found → Error returned to frontend

That's exactly what we're seeing: **"Scan Error - Failed to scan DD-214"**

---

## What You Need to Do

### PRIORITY 1: Install Tesseract
1. Go to: https://github.com/UB-Mannheim/tesseract/releases
2. Download: `tesseract-ocr-w64-setup-v5.3.3.exe`
3. Run it → use defaults
4. Close/reopen PowerShell
5. Verify: `tesseract --version`

### PRIORITY 2: Test Backend
```powershell
cd rally-forge-backend
python -m uvicorn app.main:app --reload --port 8000
```

### PRIORITY 3: Upload from Frontend
1. Go to http://localhost:5173
2. Upload sample DD-214 from `C:\Dev\Rally Forge\App\DD214 98-03.pdf`
3. Should see extracted fields

---

## FAQ

**Q: Can we skip system-wide install?**
A: Not easily. pytesseract must call the `tesseract` command, which requires system PATH.

**Q: What if installation fails?**
A: Manual copy of tesseract files to custom path, then set in config.

**Q: Can we use Google Cloud Vision instead?**
A: Yes! Enable `google_vision_enabled` and provide API key. But tesseract is simpler/free.

**Q: Will it work after just install?**
A: No! Must close and reopen PowerShell for PATH to update, then restart backend.

---

## Summary

| Task | Status | Time |
|------|--------|------|
| Poppler installed | ✅ | Already done |
| pytesseract package | ✅ | Already installed |
| **Tesseract command-line** | ⏳ | **Install now** (5 min) |
| Backend configuration | ✅ | Already done |
| Backend startup | ⏳ | After tesseract install |
| Test upload | ⏳ | After backend running |

**Estimated time to working scanner: 10-15 minutes**

---

## Download Link

Direct download:
```
https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.3/tesseract-ocr-w64-setup-v5.3.3.exe
```

Or browse releases and pick latest:
```
https://github.com/UB-Mannheim/tesseract/releases
```

---

## Next Action

👉 **Download and install tesseract-ocr-w64-setup-v5.3.3.exe**

Then report back and we'll test the scanner! 🚀


