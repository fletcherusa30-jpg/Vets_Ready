# DD-214 EXTRACTION - QUICK START TEST GUIDE

**Status**: Ready for Testing
**Time to Test**: 5 minutes

---

## ⚡ QUICK START (COPY-PASTE COMMANDS)

### Step 1: Install Dependencies (2 min)

```powershell
# Install Python packages
cd "C:\Dev\Rally Forge\rally-forge-backend"
pip install PyPDF2 pytesseract pdf2image Pillow opencv-python

# Install Tesseract OCR (Windows)
# Download: https://github.com/UB-Mannheim/tesseract/wiki
# Or use chocolatey:
choco install tesseract

# Verify Tesseract
tesseract --version
```

### Step 2: Start Backend (30 sec)

```powershell
cd "C:\Dev\Rally Forge\rally-forge-backend"
python -m uvicorn app.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 3: Test Health Check (10 sec)

```powershell
# Open new PowerShell window
curl http://localhost:8000/api/dd214/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "dd214",
  "ocr_available": true,
  "pdf_extraction_available": true
}
```

### Step 4: Test Upload (1 min)

```powershell
# Create test PDF (if you don't have one)
echo "DD FORM 214 CERTIFICATE OF RELEASE OR DISCHARGE FROM ACTIVE DUTY
Name: JOHN DOE
Service: Army (USA)
Entry Date: 01/15/2010
Separation Date: 01/14/2020
Character of Service: Honorable
Pay Grade: E-5
Rank: Sergeant
Awards: Army Commendation Medal, Good Conduct Medal
Separation Authority: AR 635-200
Narrative Reason: End of Term of Service
" | Out-File test_dd214.txt

# Convert to PDF (or just upload as text for testing)
# For real test, use actual DD-214 PDF

# Upload
curl -X POST http://localhost:8000/api/dd214/upload -F "file=@test_dd214.txt"
```

**Expected Response**:
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Upload successful. Extraction started."
}
```

### Step 5: Check Status (30 sec)

```powershell
# Use job_id from previous response
curl http://localhost:8000/api/dd214/status/{job_id}
```

**Expected Progression**:

**Processing**:
```json
{
  "status": "processing",
  "progress": 50,
  "message": "Parsing DD-214 fields..."
}
```

**Completed**:
```json
{
  "status": "completed",
  "progress": 100,
  "message": "Extraction complete: 6 fields found"
}
```

### Step 6: Get Results (10 sec)

```powershell
curl http://localhost:8000/api/dd214/result/{job_id}
```

**Expected Response**:
```json
{
  "branch": "Army",
  "entryDate": "01/15/2010",
  "separationDate": "01/14/2020",
  "characterOfService": "Honorable",
  "payGrade": "E-5",
  "rank": "Sergeant",
  "awards": ["Army Commendation Medal", "Good Conduct Medal"],
  "extractionConfidence": "high",
  "extractedFields": ["branch", "entryDate", "separationDate", "characterOfService", "payGrade", "rank", "awards"],
  "textLength": 347
}
```

---

## 🧪 VALIDATION TESTS

### Test 1: Empty File (Should FAIL)

```powershell
echo $null > empty.pdf
curl -X POST http://localhost:8000/api/dd214/upload -F "file=@empty.pdf"
```

**Expected**: 400 Bad Request - "Uploaded file is empty (0 bytes)"

✅ **PASS** if error returned
❌ **FAIL** if no error or "0 characters extracted" returned as success

### Test 2: Wrong File Type (Should FAIL)

```powershell
echo "This is not a DD-214" > test.txt
curl -X POST http://localhost:8000/api/dd214/upload -F "file=@test.txt"
```

**Expected**: 400 Bad Request - "Invalid file type"

✅ **PASS** if error returned immediately

### Test 3: File Too Short (Should FAIL)

```powershell
# Create very short file
echo "TEST" > short.pdf
curl -X POST http://localhost:8000/api/dd214/upload -F "file=@short.pdf"
```

**Expected**: Extraction fails with "Only X characters extracted (minimum 200 required)"

✅ **PASS** if extraction fails with clear error
❌ **FAIL** if returns "0 characters extracted" as success

### Test 4: No DD-214 Fields (Should FAIL)

```powershell
# Upload document with text but no DD-214 fields
echo "Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.
In reprehenderit in voluptate velit esse cillum dolore eu fugiat.
Excepteur sint occaecat cupidatat non proident sunt in culpa qui." | Out-File lorem.txt

curl -X POST http://localhost:8000/api/dd214/upload -F "file=@lorem.txt"
```

**Expected**: Extraction fails with "No recognizable DD-214 fields found"

✅ **PASS** if extraction fails with clear error

---

## 🔍 VERIFY FILE STORAGE

```powershell
# Check files were saved
Get-ChildItem "C:\Dev\Rally Forge\Data\Documents" -Recurse

# Should show structure like:
# Documents\
#   anonymous\
#     20260125_143000\
#       test_dd214.txt
```

---

## 📋 VERIFY LOGS

```powershell
# Check extraction logs
Get-ChildItem "C:\Dev\Rally Forge\logs\dd214"

# Read latest log
Get-Content "C:\Dev\Rally Forge\logs\dd214\dd214_extraction_*.log" -Tail 20
```

**Should show entries like**:
```json
{"timestamp":"2026-01-25T14:30:00","event_type":"START","message":"Starting DD-214 extraction"}
{"timestamp":"2026-01-25T14:30:01","event_type":"FILE_VERIFIED","message":"File verified: 1048576 bytes"}
{"timestamp":"2026-01-25T14:30:25","event_type":"TEXT_EXTRACTED","message":"Extracted 347 characters"}
{"timestamp":"2026-01-25T14:30:30","event_type":"COMPLETED","message":"Extraction successful: 6 fields extracted"}
```

---

## ✅ SUCCESS CHECKLIST

Run through this checklist to verify everything works:

- [ ] Backend starts without errors
- [ ] Health check returns `"ocr_available": true`
- [ ] Can upload PDF file
- [ ] Job ID is returned
- [ ] Status endpoint shows processing → completed
- [ ] Result endpoint returns extracted data
- [ ] `textLength` > 0 (NO LONGER 0!)
- [ ] `extractedFields` count > 0
- [ ] File saved to `/Data/Documents/{veteranId}/{timestamp}/`
- [ ] Logs written to `/logs/dd214/dd214_extraction_YYYYMMDD.log`
- [ ] Empty file upload returns 400 error
- [ ] Wrong file type returns 400 error
- [ ] Extraction with < 200 chars returns error
- [ ] Extraction with 0 fields returns error

**If all checkboxes pass → ✅ DD-214 EXTRACTION IS WORKING**

---

## 🐛 TROUBLESHOOTING

### Issue: "pytesseract not found"

```powershell
pip install pytesseract
```

### Issue: "Tesseract is not installed"

```powershell
# Windows: Install from GitHub
# https://github.com/UB-Mannheim/tesseract/wiki

# Or chocolatey:
choco install tesseract

# Verify:
tesseract --version
```

### Issue: "ModuleNotFoundError: No module named 'PIL'"

```powershell
pip install Pillow
```

### Issue: "Backend returns 500 error"

Check backend console for error stack trace. Common issues:
- Tesseract not in PATH
- Missing Python package
- File permissions

### Issue: "Upload succeeds but extraction never completes"

Check backend logs for errors during processing:
```powershell
# Backend console should show error
# Or check logs:
Get-Content "C:\Dev\Rally Forge\logs\dd214\*.log" -Tail 50
```

---

## 📞 QUICK REFERENCE

**Backend API Base URL**: `http://localhost:8000/api/dd214`

**Endpoints**:
- POST `/upload` - Upload DD-214 file
- GET `/status/{job_id}` - Check extraction progress
- GET `/result/{job_id}` - Get extraction results
- GET `/health` - Service health check

**File Types Accepted**: PDF, JPG, PNG, TIFF, BMP

**Max File Size**: 10MB

**Minimum Text Length**: 200 characters

**Minimum Fields**: 1 recognizable DD-214 field

**Storage Location**: `C:\Dev\Rally Forge\Data\Documents\{veteranId}\{timestamp}\`

**Logs Location**: `C:\Dev\Rally Forge\logs\dd214\dd214_extraction_YYYYMMDD.log`

---

**READY TO TEST!**

Follow steps 1-6 above, then run validation tests. If all pass, DD-214 extraction is working correctly.

