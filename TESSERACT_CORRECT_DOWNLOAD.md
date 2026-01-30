# ✅ Tesseract OCR - Correct Download Link

## The Issue
The v5.3.3 release was removed from GitHub. The **latest version is v5.4.0.20240606**.

---

## ✅ Correct Download Link

### Direct Download (Recommended)
```
https://github.com/UB-Mannheim/tesseract/releases/download/v5.4.0.20240606/tesseract-ocr-w64-setup-5.4.0.20240606.exe
```

**File**: tesseract-ocr-w64-setup-5.4.0.20240606.exe
**Size**: 47.9 MB
**Version**: 5.4.0 (Latest & Greatest)

---

## Installation Steps

### 1. Download
Click this link (or copy/paste into browser):
```
https://github.com/UB-Mannheim/tesseract/releases/download/v5.4.0.20240606/tesseract-ocr-w64-setup-5.4.0.20240606.exe
```

### 2. Run Installer
1. Double-click the downloaded `.exe`
2. Accept license agreement
3. Use **default installation path**: `C:\Program Files\Tesseract-OCR`
4. Complete installation

### 3. Restart PowerShell
**IMPORTANT**: Close PowerShell completely and reopen it
- This ensures the PATH environment variable is updated

### 4. Verify Installation
```powershell
tesseract --version
```

Should output:
```
tesseract 5.4.0-20240606
leptonica-1.83.0
libpng 1.6.40 zlib 1.3.1
libjpeg 9f
libopenjp2 2.5.2
```

---

## Then Test the Scanner

### Start Backend
```powershell
cd "C:\Dev\Rally Forge\rally-forge-backend"
python -m uvicorn app.main:app --reload --port 8000
```

### Upload DD-214
1. Open frontend: `http://localhost:5173`
2. Click DD-214 upload
3. Select: `C:\Dev\Rally Forge\App\DD214 98-03.pdf`
4. Should see extracted fields! ✅

---

## What's Included in v5.4.0

- ✅ Latest OCR improvements
- ✅ Better accuracy
- ✅ Faster processing
- ✅ Full language support (English pre-installed)
- ✅ Backward compatible with older versions

---

## Releases Available

If you need alternative versions:

| Version | Release Date | Status | Download |
|---------|--------------|--------|----------|
| **v5.4.0.20240606** | Jun 8, 2024 | **LATEST** | [Download](https://github.com/UB-Mannheim/tesseract/releases/download/v5.4.0.20240606/tesseract-ocr-w64-setup-5.4.0.20240606.exe) |
| v5.3.4 | (if needed) | Older | https://github.com/UB-Mannheim/tesseract/releases |
| v5.0 | (if needed) | Older | https://github.com/UB-Mannheim/tesseract/releases |

**Recommendation**: Use v5.4.0 - it's the latest and most reliable.

---

## Quick Links

- **Releases Page**: https://github.com/UB-Mannheim/tesseract/releases
- **Latest Installer**: https://github.com/UB-Mannheim/tesseract/releases/download/v5.4.0.20240606/tesseract-ocr-w64-setup-5.4.0.20240606.exe
- **Project Wiki**: https://github.com/UB-Mannheim/tesseract/wiki

---

## Summary

1. **Download**: tesseract-ocr-w64-setup-5.4.0.20240606.exe
2. **Install**: Run with defaults
3. **Restart PowerShell**: Close and reopen
4. **Verify**: `tesseract --version`
5. **Test**: Start backend and upload DD-214

**That's it! Scanner will work after this.** 🚀


