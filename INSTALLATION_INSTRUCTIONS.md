# 🚀 Installation Instructions - Poppler & Tesseract

## Quick Summary
Your system needs two tools installed: **Tesseract OCR** and **Poppler** (for PDF processing). These are system-level tools, not Python packages.

---

## ✅ RECOMMENDED: Option 1 - Automated Installation

### For Windows
I've created **two automated scripts** for you:

1. **`install_ocr_deps_admin.bat`** (Easier)
   - Right-click → "Run as administrator"
   - Downloads and installs everything automatically
   - Configures PATH automatically
   - ~5 minutes

2. **`install_ocr_deps.ps1`** (Advanced)
   - Run in PowerShell as Administrator
   - More detailed logging
   - Same functionality

### Steps

**Step 1: Run the installer**
```
1. Right-click on: install_ocr_deps_admin.bat
2. Select: "Run as administrator"
3. Wait for completion (5-10 minutes)
```

**Step 2: Close and reopen PowerShell**
- Important! PATH changes require a fresh shell

**Step 3: Verify installation**
```powershell
cd "C:\Dev\Rally Forge"
python verify_ocr_setup.py
```

Expected output:
```
✓ FastAPI installed
✓ Tesseract OCR installed
✓ PDF2Image installed
✓ Poppler - pdfinfo IN PATH ✓
✓ Poppler - pdftoppm IN PATH ✓
✓ Tesseract OCR IN PATH ✓
```

---

## 🔧 Alternative: Option 2 - Manual Installation

### If automated scripts don't work, do this manually:

### Step 1: Install Tesseract

1. Visit: https://github.com/UB-Mannheim/tesseract/releases
2. Download: `tesseract-ocr-w64-setup-v5.3.3.exe`
3. Run installer with **default settings**
4. Note the path (usually `C:\Program Files\Tesseract-OCR`)

Verify:
```powershell
& "C:\Program Files\Tesseract-OCR\tesseract.exe" --version
```

### Step 2: Install Poppler

1. Visit: https://github.com/oschwartz10612/poppler-windows/releases
2. Download: `Release-24.02.0.zip` (latest version)
3. Extract to: `C:\Program Files\poppler\`
   - You should have: `C:\Program Files\poppler\Library\bin\pdfinfo.exe`

Verify:
```powershell
& "C:\Program Files\poppler\Library\bin\pdfinfo.exe" -v
```

### Step 3: Add to PATH

**Windows 10/11:**
1. Press `Win + X`
2. Select "System"
3. Click "Advanced system settings"
4. Click "Environment Variables..."
5. Under "System variables", select "Path" and click "Edit"
6. Click "New" and add:
   - `C:\Program Files\Tesseract-OCR`
   - `C:\Program Files\poppler\Library\bin`
7. Click OK three times

**PowerShell (Alternative):**
```powershell
# Run as Administrator
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH;C:\Program Files\Tesseract-OCR;C:\Program Files\poppler\Library\bin", "Machine")
```

### Step 4: Restart PowerShell and verify
```powershell
# Close PowerShell completely and reopen as Administrator
python verify_ocr_setup.py
```

---

## ✨ Verify Everything Works

### Test 1: Check Python packages
```powershell
cd "C:\Dev\Rally Forge"
python verify_ocr_setup.py
```

Expected: ✓ All green (or mostly green if system tools installed)

### Test 2: Start backend
```powershell
cd "rally-forge-backend"
python -m uvicorn app.main:app --reload --port 8000
```

### Test 3: Check system status
Open in browser:
```
http://localhost:8000/api/scanner/diagnostics/ocr
```

Should show:
```json
{
  "status": "healthy",
  "ocr_ready": {
    "overall": true
  }
}
```

---

## 🆘 Troubleshooting

### Problem: "tesseract not found"
**Solution:**
1. Verify: `ls "C:\Program Files\Tesseract-OCR"`
2. Close and reopen PowerShell completely
3. Try manual PATH addition:
   ```powershell
   setx PATH "%PATH%;C:\Program Files\Tesseract-OCR" /M
   ```

### Problem: "pdfinfo not found"
**Solution:**
1. Verify: `ls "C:\Program Files\poppler\Library\bin\pdfinfo.exe"`
2. If missing, re-extract the ZIP properly
3. Add PATH:
   ```powershell
   setx PATH "%PATH%;C:\Program Files\poppler\Library\bin" /M
   ```

### Problem: Installation script fails
**Solution:**
1. Check if running as Administrator
2. Try manual installation instead
3. Check internet connection

### Problem: verify_ocr_setup.py still shows errors
**Solution:**
```powershell
# Force environment reload
[Environment]::GetEnvironmentVariable("PATH","Machine")
# Should show your paths

# Restart PowerShell entirely
```

---

## 📋 Installation Checklist

After installation, verify:

- [ ] Tesseract installed at `C:\Program Files\Tesseract-OCR`
- [ ] Poppler installed at `C:\Program Files\poppler\`
- [ ] `C:\Program Files\Tesseract-OCR` in System PATH
- [ ] `C:\Program Files\poppler\Library\bin` in System PATH
- [ ] PowerShell restarted
- [ ] `python verify_ocr_setup.py` passes all checks
- [ ] Backend starts without OCR errors
- [ ] Diagnostics endpoint shows `status: "healthy"`

---

## ⏱️ Timeline

- **Automated script**: 5-10 minutes
- **Manual installation**: 15-20 minutes
- **Verification**: 2 minutes
- **Backend startup**: 2 minutes
- **Test upload**: 2 minutes

**Total time**: 15-30 minutes depending on method

---

## 📞 Need Help?

Check these files:
- `MANUAL_INSTALL_POPPLER_TESSERACT.md` - Detailed manual steps
- `DD214_OCR_ERROR_REFERENCE.md` - Error code reference
- `DD214_OCR_README.md` - API documentation
- `verify_ocr_setup.py` - Run to diagnose issues

---

## What's Next?

1. **Run installer** (automated or manual)
2. **Close/reopen PowerShell**
3. **Run verification**: `python verify_ocr_setup.py`
4. **Start backend**: `cd rally-forge-backend; python -m uvicorn app.main:app --reload --port 8000`
5. **Check status**: `http://localhost:8000/api/scanner/diagnostics/ocr`
6. **Upload test**: Try a sample DD-214 PDF

Let me know if you need help with any step!


