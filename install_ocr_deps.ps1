#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated installation of Tesseract OCR and Poppler for Windows
.DESCRIPTION
    Downloads and installs Tesseract OCR and Poppler, then configures PATH
.EXAMPLE
    & ".\install_ocr_deps.ps1"
#>

param(
    [switch]$SkipPrompt = $false
)

# Check for admin privileges
$currentPrincipal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DD-214 OCR - Tesseract & Poppler Installation                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$TesseractPath = "C:\Program Files\Tesseract-OCR"
$PopperPath = "C:\Program Files\poppler"
$TempDir = "$env:TEMP\ocr_install"

# Create temp directory
if (-not (Test-Path $TempDir)) {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
}

function Download-File {
    param(
        [string]$Url,
        [string]$OutFile
    )
    Write-Host "📥 Downloading: $Url" -ForegroundColor Cyan
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -TimeoutSec 300
        Write-Host "✓ Downloaded to: $OutFile" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Download failed: $_" -ForegroundColor Red
        return $false
    }
}

function Extract-Zip {
    param(
        [string]$ZipPath,
        [string]$DestPath
    )
    Write-Host "📦 Extracting: $ZipPath" -ForegroundColor Cyan
    try {
        if (-not (Test-Path $DestPath)) {
            New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
        }
        Expand-Archive -Path $ZipPath -DestinationPath $DestPath -Force
        Write-Host "✓ Extracted to: $DestPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Extraction failed: $_" -ForegroundColor Red
        return $false
    }
}

function Add-ToPath {
    param(
        [string]$PathToAdd
    )

    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

    if ($currentPath -like "*$PathToAdd*") {
        Write-Host "✓ Already in PATH: $PathToAdd" -ForegroundColor Green
        return $true
    }

    Write-Host "🔧 Adding to PATH: $PathToAdd" -ForegroundColor Cyan
    try {
        $newPath = "$currentPath;$PathToAdd"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
        Write-Host "✓ Added to PATH" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Failed to add to PATH: $_" -ForegroundColor Red
        return $false
    }
}

# Step 1: Install Tesseract
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 1: Installing Tesseract OCR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "$TesseractPath\tesseract.exe") {
    Write-Host "✓ Tesseract already installed at: $TesseractPath" -ForegroundColor Green
}
else {
    Write-Host "Downloading Tesseract OCR installer..." -ForegroundColor Yellow
    $TesseractUrl = "https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.3/tesseract-ocr-w64-setup-v5.3.3.exe"
    $TesseractInstaller = "$TempDir\tesseract-installer.exe"

    if (Download-File -Url $TesseractUrl -OutFile $TesseractInstaller) {
        Write-Host "🔨 Running Tesseract installer..." -ForegroundColor Cyan
        try {
            & $TesseractInstaller /S /D=$TesseractPath | Out-Null
            Start-Sleep -Seconds 5

            if (Test-Path "$TesseractPath\tesseract.exe") {
                Write-Host "✓ Tesseract installed successfully" -ForegroundColor Green
            }
            else {
                Write-Host "⚠ Tesseract installer completed but executable not found" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "✗ Installation failed: $_" -ForegroundColor Red
        }
    }
}

# Step 2: Install Poppler
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 2: Installing Poppler" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "$PopperPath\Library\bin\pdfinfo.exe") {
    Write-Host "✓ Poppler already installed at: $PopperPath" -ForegroundColor Green
}
else {
    Write-Host "Downloading Poppler..." -ForegroundColor Yellow
    $PopperUrl = "https://github.com/oschwartz10612/poppler-windows/releases/download/v24.02.0/Release-24.02.0.zip"
    $PopperZip = "$TempDir\poppler.zip"
    $PopperExtract = "$TempDir\poppler-extract"

    if (Download-File -Url $PopperUrl -OutFile $PopperZip) {
        if (Extract-Zip -ZipPath $PopperZip -DestPath $PopperExtract) {
            Write-Host "🚚 Moving to Program Files..." -ForegroundColor Cyan
            try {
                if (Test-Path $PopperPath) {
                    Remove-Item $PopperPath -Recurse -Force
                }
                Move-Item -Path "$PopperExtract\Release-24.02.0" -Destination $PopperPath -Force
                Write-Host "✓ Poppler installed successfully" -ForegroundColor Green
            }
            catch {
                Write-Host "✗ Move failed: $_" -ForegroundColor Red
            }
        }
    }
}

# Step 3: Configure PATH
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 3: Configuring System PATH" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$pathsToAdd = @(
    $TesseractPath,
    "$PopperPath\Library\bin"
)

foreach ($path in $pathsToAdd) {
    if (Test-Path $path) {
        Add-ToPath -PathToAdd $path
    }
}

# Step 4: Verification
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 4: Verifying Installation" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$checks = @()

# Check Tesseract
if (Test-Path "$TesseractPath\tesseract.exe") {
    $checks += @{ name = "Tesseract executable"; status = "✓" }
}
else {
    $checks += @{ name = "Tesseract executable"; status = "✗" }
}

# Check Poppler tools
if (Test-Path "$PopperPath\Library\bin\pdfinfo.exe") {
    $checks += @{ name = "Poppler pdfinfo"; status = "✓" }
}
else {
    $checks += @{ name = "Poppler pdfinfo"; status = "✗" }
}

if (Test-Path "$PopperPath\Library\bin\pdftoppm.exe") {
    $checks += @{ name = "Poppler pdftoppm"; status = "✓" }
}
else {
    $checks += @{ name = "Poppler pdftoppm"; status = "✗" }
}

# Check PATH
$TesseractInPath = [Environment]::GetEnvironmentVariable("PATH", "Machine") -like "*$TesseractPath*"
$checks += @{ name = "Tesseract in PATH"; status = if ($TesseractInPath) { "✓" } else { "✗" } }

$PopperInPath = [Environment]::GetEnvironmentVariable("PATH", "Machine") -like "*poppler*"
$checks += @{ name = "Poppler in PATH"; status = if ($PopperInPath) { "✓" } else { "✗" } }

foreach ($check in $checks) {
    $color = if ($check.status -eq "✓") { "Green" } else { "Red" }
    Write-Host "$($check.status) $($check.name)" -ForegroundColor $color
}

# Final status
Write-Host ""
$allPassed = ($checks | Where-Object { $_.status -eq "✗" }).Count -eq 0

if ($allPassed) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
}
else {
    Write-Host "⚠ Some checks failed. You may need to restart your computer for PATH changes to take effect." -ForegroundColor Yellow
}

# Cleanup
Write-Host ""
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# Next steps
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ Installation Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell" -ForegroundColor Yellow
Write-Host "2. Run: python verify_ocr_setup.py" -ForegroundColor Yellow
Write-Host "3. Start backend: cd rally-forge-backend; python -m uvicorn app.main:app --reload --port 8000" -ForegroundColor Yellow
Write-Host ""

