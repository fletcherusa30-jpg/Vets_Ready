# Manual Installation Guide - Poppler & Tesseract for Windows

## Option 1: Using Windows Package Manager (winget) - EASIEST

```powershell
# Run PowerShell as Administrator, then:
winget install -e --id Tesseract.Tesseract
winget install -e --id GPLGhost.poppler
```

---

## Option 2: Manual Downloads (If winget not available)

### Step 1: Install Tesseract OCR

1. **Download** from: https://github.com/UB-Mannheim/tesseract/wiki
   - Look for latest release (e.g., `tesseract-ocr-w64-setup-v5.x.x.exe`)

2. **Run installer** with defaults
   - Accept license
   - Use default path: `C:\Program Files\Tesseract-OCR`

3. **Verify installation**:
   ```powershell
   & "C:\Program Files\Tesseract-OCR\tesseract.exe" --version
   ```

### Step 2: Install Poppler

1. **Download** from: https://github.com/oschwartz10612/poppler-windows/releases
   - Look for latest release (e.g., `Release-22.04.0.zip`)

2. **Extract** to `C:\Program Files\poppler\`
   - You should have: `C:\Program Files\poppler\Library\bin\pdfinfo.exe`

3. **Verify installation**:
   ```powershell
   & "C:\Program Files\poppler\Library\bin\pdfinfo.exe" -v
   ```

### Step 3: Add to PATH (IMPORTANT!)

1. **Press** `Win + X` → Select "System"
2. **Click** "Advanced system settings"
3. **Click** "Environment Variables"
4. **Under "System variables", click "Path" → "Edit"**
5. **Click "New" and add both**:
   - `C:\Program Files\Tesseract-OCR`
   - `C:\Program Files\poppler\Library\bin`
6. **Click "OK"** three times
7. **Restart PowerShell** (close and reopen)

### Step 4: Verify

```powershell
# Close and reopen PowerShell first!
tesseract --version
pdfinfo -v
```

Both should show version info without errors.

---

## Option 3: Scoop (If you have Scoop)

```powershell
scoop install tesseract
scoop install poppler
```

---

## Verification After Installation

```powershell
cd "C:\Dev\Rally Forge"
python verify_ocr_setup.py
```

Expected output should show:
```
✓ Tesseract OCR NOT in PATH → ✓ IN PATH
✓ Poppler - pdfinfo NOT in PATH → ✓ IN PATH
✓ Poppler - pdftoppm NOT in PATH → ✓ IN PATH
```

---

## Troubleshooting

### "tesseract not found"
- Verify: `ls "C:\Program Files\Tesseract-OCR"`
- Restart PowerShell after PATH changes
- Manually add to PATH if needed

### "pdfinfo not found"
- Verify: `ls "C:\Program Files\poppler\Library\bin"`
- Make sure you extracted the correct files
- Check PATH includes the bin directory

### Still not working?
- Verify Python can find them:
  ```powershell
  python -c "import pytesseract; print(pytesseract.pytesseract.pytesseract_cmd)"
  ```
- Add environment variables directly:
  ```powershell
  [Environment]::SetEnvironmentVariable("TESSERACT_CMD","C:\Program Files\Tesseract-OCR\tesseract.exe","User")
  ```

---

## Quick Test

After installation:

```powershell
cd "C:\Dev\Rally Forge\rally-forge-backend"
python -m uvicorn app.main:app --reload --port 8000
```

Then in browser:
```
http://localhost:8000/api/scanner/diagnostics/ocr
```

Should show `"status": "healthy"`


