@echo off
REM Installation script for Tesseract OCR and Poppler
REM This script requires Administrator privileges

echo ============================================================
echo DD-214 OCR - Tesseract and Poppler Installation
echo ============================================================
echo.

REM Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

setlocal enabledelayedexpansion

set TEMP_DIR=%TEMP%\ocr_install
set TESSERACT_PATH=C:\Program Files\Tesseract-OCR
set POPPLER_PATH=C:\Program Files\poppler

echo [1/3] Creating temporary directory...
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

echo.
echo [2/3] Downloading Tesseract OCR...
cd /d "%TEMP_DIR%"
powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.3/tesseract-ocr-w64-setup-v5.3.3.exe' -OutFile 'tesseract.exe' -TimeoutSec 300; Write-Host 'Download complete' } catch { Write-Host 'Download failed'; exit 1 }"
if %errorlevel% equ 0 (
    echo Installing Tesseract OCR...
    start /wait tesseract.exe /S /D="%TESSERACT_PATH%"
    echo Tesseract installation complete
) else (
    echo WARNING: Could not download Tesseract. Please visit:
    echo https://github.com/UB-Mannheim/tesseract/releases
)

echo.
echo [3/3] Downloading Poppler...
powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/oschwartz10612/poppler-windows/releases/download/v24.02.0/Release-24.02.0.zip' -OutFile 'poppler.zip' -TimeoutSec 300; Write-Host 'Download complete' } catch { Write-Host 'Download failed'; exit 1 }"
if %errorlevel% equ 0 (
    echo Extracting Poppler...
    powershell -Command "Expand-Archive -Path 'poppler.zip' -DestinationPath '%POPPLER_PATH%' -Force"
    echo Poppler extraction complete
) else (
    echo WARNING: Could not download Poppler. Please visit:
    echo https://github.com/oschwartz10612/poppler-windows/releases
)

echo.
echo ============================================================
echo Configuring System PATH...
echo ============================================================

REM Add to PATH using setx
setx PATH "%PATH%;%TESSERACT_PATH%;%POPPLER_PATH%\Library\bin" /M

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo Please:
echo 1. Close and reopen PowerShell
echo 2. Run: python verify_ocr_setup.py
echo.
echo Cleanup temporary files:
rmdir /s /q "%TEMP_DIR%" 2>nul

pause
