# DD-214 OCR Error Reference & Troubleshooting

## Error Code Reference

### Dependency Errors

#### `MISSING_POPPLER`
**Status Code**: 400

**Message**: "Poppler is not installed or not in system PATH"

**Cause**:
- Poppler not installed
- Poppler bin directory not in PATH
- pdfinfo or pdftoppm executables missing

**Solution**:
1. Install Poppler from https://github.com/oschwartz10612/poppler-windows/releases/
2. Extract to known location
3. Add to system PATH or set `POPPLER_PATH` env variable
4. Restart backend

**Test**:
```bash
pdfinfo -v
pdftoppm -v
```

---

#### `INVALID_PDF`
**Status Code**: 400

**Message**: "PDF validation failed"

**Cause**:
- File is corrupted
- File is not actually a PDF
- PDF has 0 pages
- File is encrypted/password-protected
- File permissions issue

**Solution**:
1. Verify file is valid: `pdfinfo /path/to/file.pdf`
2. Try different PDF file
3. Check file is readable: `ls -l` (Linux) or `Get-Acl` (Windows)
4. Try extracting PDF manually to verify

**Test**:
```bash
# Linux
pdfinfo /path/to/dd214.pdf

# Windows PowerShell
& "C:\poppler\Library\bin\pdfinfo.exe" "C:\path\to\dd214.pdf"
```

---

#### `OCR_EXTRACTION_FAILED`
**Status Code**: 400

**Message**: "Could not extract text from PDF using available OCR engines"

**Cause**:
- Tesseract not installed
- PDF contains only images (no selectable text)
- Tesseract crashes on specific file
- Google Vision API not configured or failed

**Solution**:
1. Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki
2. Verify: `tesseract --version`
3. Try different PDF file
4. Check `/api/scanner/diagnostics/ocr` for OCR engine status
5. Enable Google Vision as fallback

**Test**:
```bash
tesseract --version
tesseract /path/to/image.png -  # Test OCR on image
```

---

### File Validation Errors

#### `INVALID_FILE_TYPE`
**Status Code**: 400

**Message**: "Invalid file type"

**Cause**:
- File extension not PDF or image
- File MIME type incorrect
- Wrong file format

**Solution**:
- Use only: PDF, JPG, PNG, TIFF, BMP
- Verify file extension matches content

**Allowed Types**:
```
application/pdf
image/jpeg
image/png
image/tiff
image/bmp
```

---

#### `FILE_TOO_LARGE`
**Status Code**: 413

**Message**: "File too large. Maximum size: 10MB"

**Cause**:
- File exceeds 10MB limit
- PDF has too many pages
- Scan resolution too high

**Solution**:
1. Compress PDF: Use online tool or software
2. Reduce scan resolution
3. Split into multiple documents
4. Check if file can be reduced

**Troubleshoot**:
```bash
# Check file size
ls -lh /path/to/file.pdf  # Linux
Get-Item /path/to/file.pdf | Select-Object Length  # Windows
```

---

#### `EMPTY_FILE`
**Status Code**: 400

**Message**: "File is empty"

**Cause**:
- File has 0 bytes
- Upload corrupted
- Wrong file selected

**Solution**:
- Select correct file
- Try uploading again
- Verify file exists locally

---

#### `FILE_NOT_FOUND`
**Status Code**: 400

**Message**: "File not found"

**Cause**:
- File moved or deleted
- Path incorrect
- Temp file cleanup too aggressive

**Solution**:
- File is saved correctly during processing
- Internal error if file disappears mid-processing
- Contact support with timestamp

---

#### `FILE_NOT_READABLE`
**Status Code**: 400

**Message**: "File is not readable"

**Cause**:
- Permission denied
- File locked by another process
- Disk read error

**Solution**:
1. Check permissions: `chmod 644 /path/to/file.pdf`
2. Close file if open in another application
3. Try different file
4. Check disk health

---

### Unsupported File Errors

#### `UNSUPPORTED_FILE_TYPE`
**Status Code**: 400

**Message**: "Unsupported file type"

**Cause**:
- File extension not recognized
- DOCX, DOC, or other non-image format
- Corrupted file header

**Solution**:
- Verify file is actually a PDF or image
- Use correct file type
- Check file header: `file /path/to/filename` (Linux)

---

### Text Extraction Errors

#### `NO_TEXT_EXTRACTED`
**Status Code**: 400

**Message**: "No text could be extracted from the file"

**Details**: "The document appears to be blank or contains only images"

**Cause**:
- Scanned image with no OCR text layer
- Blank page
- Image quality too poor for OCR
- OCR engine failed silently

**Solution**:
1. Verify file is readable
2. Check document quality
3. Try higher resolution scan
4. Check OCR engine logs

**Test**:
```bash
# Try OCR directly on extracted image
pdftoppm -png /path/to/file.pdf /tmp/test
tesseract /tmp/test-1.png -
```

---

## Response Error Format

All errors follow this structured format:

```json
{
  "success": false,
  "error": {
    "error_code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": "Technical details or null",
    "recommended_fix": "What user should do"
  }
}
```

### Example Error Responses

**Missing Poppler**:
```json
{
  "success": false,
  "error": {
    "error_code": "MISSING_POPPLER",
    "message": "Poppler is not installed or not in system PATH",
    "details": "pdfinfo not found in PATH - Poppler may not be installed",
    "recommended_fix": "Install Poppler from https://github.com/oschwartz10612/poppler-windows/releases/ or run: apt-get install poppler-utils (Linux)"
  }
}
```

**Invalid PDF**:
```json
{
  "success": false,
  "error": {
    "error_code": "INVALID_PDF",
    "message": "PDF validation failed: PDF has no pages",
    "details": "pdfinfo returned: Error reading PDF: No pages",
    "recommended_fix": "Verify the PDF file is valid and not corrupted"
  }
}
```

**OCR Extraction Failed**:
```json
{
  "success": false,
  "error": {
    "error_code": "OCR_EXTRACTION_FAILED",
    "message": "Could not extract text from PDF using available OCR engines",
    "details": "Tesseract available: true, Google Vision available: false",
    "recommended_fix": "Install Tesseract OCR from https://github.com/UB-Mannheim/tesseract/wiki or enable Google Cloud Vision API"
  }
}
```

---

## Diagnostics Endpoint Guide

### Check System Status

```bash
curl http://localhost:8000/api/scanner/diagnostics/ocr
```

### Understanding Response

**Healthy Status** (All OCR engines available):
```json
{
  "status": "healthy",
  "dependencies": {
    "poppler": {"detected": true, "pdfinfo_available": true},
    "tesseract": {"detected": true},
    "google_vision": {"available": false}
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

**Degraded Status** (Some engines available):
```json
{
  "status": "degraded",
  "dependencies": {
    "poppler": {"detected": true, "pdfinfo_available": true},
    "tesseract": {"detected": false},
    "google_vision": {"available": true}
  },
  "ocr_ready": {
    "pdf_processing": true,
    "image_processing": true,
    "overall": true
  },
  "errors": ["Tesseract not available: ..."],
  "warnings": [],
  "recommendations": ["Install Tesseract OCR from ..."]
}
```

**Critical Status** (No OCR engines):
```json
{
  "status": "critical",
  "ocr_ready": {
    "overall": false
  },
  "errors": [
    "pdfinfo not available: ...",
    "pdftoppm not available: ...",
    "Tesseract not available: ...",
    "No OCR engines available for PDF processing"
  ],
  "recommendations": [
    "Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases/",
    "Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki"
  ]
}
```

---

## Common Issues & Solutions

### Issue: Backend starts but DD-214 uploads fail

**Diagnosis**:
1. Check `/api/scanner/diagnostics/ocr`
2. Look for error messages in backend logs
3. Try diagnostics endpoint to identify missing dependencies

**Solutions**:
1. Install Poppler and Tesseract
2. Add to PATH
3. Restart backend
4. Verify with diagnostics endpoint

---

### Issue: pdfinfo works but uploads still fail

**Diagnosis**:
1. Test: `pdfinfo /path/to/dd214.pdf` ✅
2. Check if Tesseract installed: `tesseract --version`
3. Check logs for OCR errors

**Solutions**:
1. Install Tesseract
2. Ensure both Poppler AND Tesseract available
3. Check file permissions
4. Try different PDF file

---

### Issue: Very slow processing

**Diagnosis**:
1. Check file size (>5MB is slow)
2. Check system resources (CPU, RAM, disk)
3. Check if timeout occurring

**Solutions**:
1. Use smaller file for testing
2. Reduce image resolution in PDFs
3. Increase timeout: `ocr_timeout_seconds=60`
4. Upgrade system resources

---

### Issue: Extraction confidence is "low"

**Cause**:
- Poor quality scan
- Hand-written sections
- Low image resolution
- Old/faded document

**Solutions**:
1. Try different/higher quality scan
2. Use Google Vision for comparison
3. Manually review and correct extracted data
4. Adjust OCR confidence threshold

---

## Installation Verification Checklist

Run these commands to verify each dependency:

```bash
# 1. Check Poppler
pdfinfo -v
# Expected: "pdfinfo version X.X.X"

pdftoppm -v
# Expected: "pdftoppm version X.X.X"

# 2. Check Tesseract
tesseract --version
# Expected: "tesseract 5.x.x"

# 3. Check Python packages
python -c "import pytesseract; print('pytesseract OK')"
python -c "import pdf2image; print('pdf2image OK')"
python -c "import PIL; print('PIL OK')"

# 4. Check diagnostics endpoint
curl http://localhost:8000/api/scanner/diagnostics/ocr

# 5. Test with sample DD-214
curl -X POST -F "file=@sample_dd214.pdf" \
  http://localhost:8000/api/scanner/dd214/upload
```

---

## Getting Help

1. **Check diagnostics**: `/api/scanner/diagnostics/ocr`
2. **Review error code**: Refer to this document
3. **Check logs**: Backend logs show detailed error info
4. **Run installation test**: Verify all dependencies installed
5. **Contact support**: Include error code and logs

---

## Support Contacts

- **Technical Issues**: Check this troubleshooting guide first
- **Installation Help**: See `DD214_OCR_INSTALLATION_GUIDE.md`
- **API Documentation**: See FastAPI docs at `/docs`
- **Diagnostics**: Always check `/api/scanner/diagnostics/ocr` first
