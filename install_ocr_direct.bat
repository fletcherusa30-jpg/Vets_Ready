@echo off
REM DD-214 OCR - Direct Installation Script for Tesseract and Poppler
REM This script downloads and installs both tools

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo     DD-214 OCR Pipeline - Installation Tool
echo ============================================================
echo.

REM Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: This script requires Administrator privileges!
    echo.
    echo Please:
    echo 1. Press Windows key
    echo 2. Type: PowerShell
    echo 3. Right-click PowerShell and select "Run as administrator"
    echo 4. Paste this command:
    echo.
    echo    cd "C:\Dev\Rally Forge" ^& .\.venv\Scripts\Activate.ps1 ^& powershell -NoProfile -ExecutionPolicy Bypass -Command "^& 'C:\Dev\Rally Forge\install_ocr_deps_admin.bat'"
    echo.
    pause
    exit /b 1
)

REM Create temp directory
set TEMP_DIR=%TEMP%\ocr_install
set TESSERACT_PATH=C:\Program Files\Tesseract-OCR
set POPPLER_PATH=C:\Program Files\poppler

echo [STEP 1] Creating temporary directory...
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

echo.
echo ============================================================
echo [STEP 2] Downloading Tesseract OCR (25MB)...
echo ============================================================
echo.

REM Download Tesseract
powershell -NoProfile -Command ^
  "$ProgressPreference='SilentlyContinue'; " ^
  "$url='https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.3/tesseract-ocr-w64-setup-v5.3.3.exe'; " ^
  "Write-Host 'Downloading from: $url'; " ^
  "try { Invoke-WebRequest -Uri $url -OutFile 'tesseract.exe' -TimeoutSec 300; Write-Host 'Download complete' } " ^
  "catch { Write-Host 'Failed to download'; exit 1 }"

if not exist "tesseract.exe" (
    echo ERROR: Failed to download Tesseract
    echo Please download manually from:
    echo https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.3/tesseract-ocr-w64-setup-v5.3.3.exe
    pause
    exit /b 1
)

echo.
echo Installing Tesseract OCR (this may take a minute)...
start /wait tesseract.exe /S /D="%TESSERACT_PATH%"

if exist "%TESSERACT_PATH%\tesseract.exe" (
    echo ✓ Tesseract installed successfully at: %TESSERACT_PATH%
) else (
    echo ✗ Tesseract installation failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo [STEP 3] Downloading Poppler (45MB)...
echo ============================================================
echo.

REM Download Poppler
powershell -NoProfile -Command ^
  "$ProgressPreference='SilentlyContinue'; " ^
  "$url='https://github.com/oschwartz10612/poppler-windows/releases/download/v24.02.0/Release-24.02.0.zip'; " ^
  "Write-Host 'Downloading from: $url'; " ^
  "try { Invoke-WebRequest -Uri $url -OutFile 'poppler.zip' -TimeoutSec 300; Write-Host 'Download complete' } " ^
  "catch { Write-Host 'Failed to download'; exit 1 }"

if not exist "poppler.zip" (
    echo ERROR: Failed to download Poppler
    echo Please download manually from:
    echo https://github.com/oschwartz10612/poppler-windows/releases/download/v24.02.0/Release-24.02.0.zip
    pause
    exit /b 1
)

echo.
echo Extracting Poppler (this may take a minute)...
powershell -NoProfile -Command "Expand-Archive -Path 'poppler.zip' -DestinationPath '%TEMP_DIR%\poppler-extract' -Force"

if exist "%TEMP_DIR%\poppler-extract\Release-24.02.0" (
    echo ✓ Poppler extracted
    if exist "%POPPLER_PATH%" rmdir /s /q "%POPPLER_PATH%"
    move "%TEMP_DIR%\poppler-extract\Release-24.02.0" "%POPPLER_PATH%"
    echo ✓ Poppler moved to: %POPPLER_PATH%
) else (
    echo ✗ Poppler extraction failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo [STEP 4] Configuring System PATH...
echo ============================================================
echo.

REM Get current PATH
for /f "tokens=2*" %%a in ('reg query HKLM\SYSTEM\CurrentControlSet\Control\Session\ Manager\Environment /v PATH') do set OLD_PATH=%%b

REM Check if paths already in PATH
echo %OLD_PATH% | findstr /I "Tesseract-OCR" > nul
if %errorlevel% equ 0 (
    echo ✓ Tesseract already in PATH
) else (
    echo Adding Tesseract to PATH...
    setx PATH "%OLD_PATH%;%TESSERACT_PATH%" /M
    echo ✓ Tesseract added to PATH
)

echo %OLD_PATH% | findstr /I "poppler" > nul
if %errorlevel% equ 0 (
    echo ✓ Poppler already in PATH
) else (
    echo Adding Poppler to PATH...
    setx PATH "%OLD_PATH%;%POPPLER_PATH%\Library\bin" /M
    echo ✓ Poppler added to PATH
)

echo.
echo ============================================================
echo [STEP 5] Verification
echo ============================================================
echo.

if exist "%TESSERACT_PATH%\tesseract.exe" (
    echo ✓ Tesseract executable found
) else (
    echo ✗ Tesseract executable not found
)

if exist "%POPPLER_PATH%\Library\bin\pdfinfo.exe" (
    echo ✓ Poppler pdfinfo found
) else (
    echo ✗ Poppler pdfinfo not found
)

if exist "%POPPLER_PATH%\Library\bin\pdftoppm.exe" (
    echo ✓ Poppler pdftoppm found
) else (
    echo ✗ Poppler pdftoppm not found
)

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo IMPORTANT: Close and reopen PowerShell completely!
echo.
echo Next steps:
echo 1. Close this window
echo 2. Close PowerShell completely (exit)
echo 3. Open a NEW PowerShell window as Administrator
echo 4. Run: cd "C:\Dev\Rally Forge" ; .\.venv\Scripts\Activate.ps1 ; python verify_ocr_setup.py
echo.
echo Cleaning up temporary files...
cd /d "%TEMP%"
rmdir /s /q "%TEMP_DIR%"

pause

