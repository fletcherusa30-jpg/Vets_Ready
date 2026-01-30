# ⚠️ Manual Installation Required - Poppler & Tesseract

Due to download restrictions in the current environment, you'll need to install these manually. The process is simple and takes about 15 minutes.

---

## 📥 Step 1: Download Files

### Tesseract OCR
Go to: https://github.com/UB-Mannheim/tesseract/releases
- Find and download: `tesseract-ocr-w64-setup-v5.3.3.exe` (or latest version)
- File size: ~25 MB

### Poppler
Go to: https://github.com/oschwartz10612/poppler-windows/releases
- Find and download: `Release-24.02.0.zip` (or latest version)
- File size: ~45 MB

---

## 🔧 Step 2: Install Tesseract

1. **Run the installer**: Double-click `tesseract-ocr-w64-setup-v5.3.3.exe`
2. **Click through installation wizard**:
   - Accept license agreement
   - Use default path: `C:\Program Files\Tesseract-OCR`
   - Click "Install"
3. **Wait for completion** (2-3 minutes)
4. **Verify**: Open PowerShell and run:
   ```powershell
   & "C:\Program Files\Tesseract-OCR\tesseract.exe" --version
   ```
   Should show version info like `tesseract 5.3.3`

---

## 📦 Step 3: Extract Poppler

1. **Extract the ZIP**:
   - Right-click `Release-24.02.0.zip`
   - Select "Extract All..."
   - Extract to: `C:\Program Files\poppler\`

2. **Verify the structure**:
   - You should have: `C:\Program Files\poppler\Release-24.02.0\Library\bin\`
   - Inside should be: `pdfinfo.exe`, `pdftoppm.exe`, `pdfseparate.exe`, etc.

3. **Move files up one level** (optional but cleaner):
   - Copy files from: `C:\Program Files\poppler\Release-24.02.0\Library\bin\`
   - To: `C:\Program Files\poppler\Library\bin\`
   - Or update PATH to include the full path

4. **Verify**:
   ```powershell
   & "C:\Program Files\poppler\Library\bin\pdfinfo.exe" -v
   # OR if you didn't move:
   & "C:\Program Files\poppler\Release-24.02.0\Library\bin\pdfinfo.exe" -v
   ```
   Should show version info

---

## 🛣️ Step 4: Add to System PATH

**Method 1: Using GUI (Easiest)**

1. **Open System Settings**:
   - Press `Win + X` → Select "System"
   - Or: Search for "Environment Variables"

2. **Click "Environment Variables"** button

3. **Under "System variables", find "Path"** and click "Edit"

4. **Click "New"** and add these two paths:
   ```
   C:\Program Files\Tesseract-OCR
   C:\Program Files\poppler\Library\bin
   ```

   (Or if you didn't move the Poppler files:)
   ```
   C:\Program Files\poppler\Release-24.02.0\Library\bin
   ```

5. **Click "OK"** three times to save

**Method 2: Using PowerShell (As Administrator)**

```powershell
# Run PowerShell as Administrator, then:
$tesseractPath = "C:\Program Files\Tesseract-OCR"
$popperPath = "C:\Program Files\poppler\Library\bin"

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = "$currentPath;$tesseractPath;$popperPath"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")

Write-Host "PATH updated!"
```

---

## ✅ Step 5: Verify Installation

**Close PowerShell completely** and open a NEW one, then run:

```powershell
cd "C:\Dev\Rally Forge"
.\.venv\Scripts\Activate.ps1
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

## 🚀 Step 6: Start Backend

```powershell
cd rally-forge-backend
python -m uvicorn app.main:app --reload --port 8000
```

Should start without OCR errors!

---

## 🧪 Step 7: Test OCR Status

Open browser:
```
http://localhost:8000/api/scanner/diagnostics/ocr
```

Should show:
```json
{
  "status": "healthy",
  "ocr_ready": {
    "overall": true,
    "pdf": true
  }
}
```

---

## ❓ Troubleshooting

### "tesseract not found after PATH update"
1. Close PowerShell completely
2. Wait 10 seconds
3. Open new PowerShell
4. Verify: `tesseract --version`

### "pdfinfo not found"
1. Verify file exists: `ls "C:\Program Files\poppler\Library\bin\pdfinfo.exe"`
2. If not, check if you extracted to different path
3. Update PATH to correct location
4. Close/reopen PowerShell

### "Still failing after everything"
Run this to see full PATH:
```powershell
$env:PATH -split ';' | ForEach-Object { if ($_ -match 'tesseract|poppler') { Write-Host "✓ $_" } }
```

Should show your paths. If not, add them manually via GUI method.

---

## 📊 Installation Summary

| Tool | Where | Verify |
|------|-------|--------|
| Tesseract | `C:\Program Files\Tesseract-OCR\` | `tesseract --version` |
| Poppler | `C:\Program Files\poppler\Library\bin\` | `pdfinfo -v` |
| PATH | System Environment Variables | `echo %PATH%` in CMD |

---

## ⏱️ Timeline

- Download files: 5-10 minutes (depending on internet speed)
- Install Tesseract: 2-3 minutes
- Extract Poppler: 1-2 minutes
- Update PATH: 2-3 minutes
- Verify: 1 minute

**Total: 15-20 minutes**

Once complete, run the verification script and you're done!


