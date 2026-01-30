@echo off
REM DD-214 OCR Pipeline - Windows Quick Setup Script
REM This script attempts to install required dependencies on Windows

echo.
echo ============================================================
echo DD-214 OCR Pipeline - Windows Setup
echo ============================================================
echo.

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as Administrator
) else (
    echo [ERROR] This script requires Administrator privileges
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if Chocolatey is installed
where choco >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Chocolatey is installed
    goto install_with_choco
) else (
    echo [INFO] Chocolatey not found
    goto manual_install
)

:install_with_choco
echo.
echo Installing Poppler via Chocolatey...
choco install -y poppler
if %errorLevel% == 0 (
    echo [OK] Poppler installed
) else (
    echo [WARNING] Chocolatey install failed - trying manual install
    goto manual_install
)

echo.
echo Installing Tesseract via Chocolatey...
choco install -y tesseract-ocr
if %errorLevel% == 0 (
    echo [OK] Tesseract installed
) else (
    echo [WARNING] Tesseract install failed - will need manual installation
)

goto verify

:manual_install
echo.
echo ============================================================
echo Manual Installation Required
echo ============================================================
echo.
echo Poppler is not installed. Please download and install manually:
echo.
echo 1. Download Poppler for Windows:
echo    https://github.com/oschwartz10612/poppler-windows/releases/
echo.
echo 2. Extract to C:\poppler\
echo    (Structure should be: C:\poppler\Library\bin\pdfinfo.exe)
echo.
echo 3. Add to System PATH:
echo    - Right-click "This PC" or "My Computer"
echo    - Select Properties
echo    - Click "Advanced system settings"
echo    - Click "Environment Variables"
echo    - Edit PATH and add: C:\poppler\Library\bin
echo.
echo 4. For Tesseract, download from:
echo    https://github.com/UB-Mannheim/tesseract/wiki
echo.
echo 5. Run this script again after installation
echo.
pause
exit /b 1

:verify
echo.
echo ============================================================
echo Verifying Installation
echo ============================================================
echo.

where pdfinfo >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] pdfinfo found in PATH
    pdfinfo -v
) else (
    echo [WARNING] pdfinfo not found in PATH
    echo   Add C:\poppler\Library\bin to PATH or set POPPLER_PATH
)

where pdftoppm >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] pdftoppm found in PATH
    pdftoppm -v
) else (
    echo [WARNING] pdftoppm not found in PATH
)

where tesseract >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] tesseract found in PATH
    tesseract --version
) else (
    echo [WARNING] tesseract not found in PATH
    echo   Default path is: C:\Program Files\Tesseract-OCR
)

echo.
echo ============================================================
echo Setup Complete
echo ============================================================
echo.
echo Next steps:
echo 1. Verify installation with: python verify_ocr_setup.py
echo 2. Start backend: cd rally-forge-backend ^&^& python -m uvicorn app.main:app --reload --port 8000
echo 3. Check diagnostics: http://localhost:8000/api/scanner/diagnostics/ocr
echo.
pause

