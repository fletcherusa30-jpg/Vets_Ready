#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build Vets Ready Android Application
.DESCRIPTION
    Builds Android APK and/or AAB bundle for Vets Ready mobile app
.PARAMETER BuildType
    Type of build: debug, release, or both
.PARAMETER OutputFormat
    Output format: apk, bundle, or both
.EXAMPLE
    .\Build-Android.ps1 -BuildType release -OutputFormat bundle
#>

param(
    [ValidateSet("debug", "release", "both")]
    [string]$BuildType = "release",
    [ValidateSet("apk", "bundle", "both")]
    [string]$OutputFormat = "both",
    [switch]$SkipSync,
    [switch]$SkipClean
)

$ErrorActionPreference = "Stop"
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Step { param([string]$Message); Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor }
function Write-Success { param([string]$Message); Write-Host "✓ $Message" -ForegroundColor $SuccessColor }
function Write-Error { param([string]$Message); Write-Host "✗ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param([string]$Message); Write-Host "⚠ $Message" -ForegroundColor $WarningColor }

Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Vets Ready Android Build" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "Build Type: $BuildType" -ForegroundColor $InfoColor
Write-Host "Output Format: $OutputFormat" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Verify prerequisites
Write-Step "Verifying prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion installed"
} catch {
    Write-Error "Node.js not found. Please install Node.js 18+"
    exit 1
}

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Success "Java installed"
} catch {
    Write-Error "Java not found. Please install Java JDK 11+"
    exit 1
}

# Check Android SDK
if (-not $env:ANDROID_HOME) {
    Write-Error "ANDROID_HOME not set. Please install Android SDK and set environment variable."
    Write-Host "Typically: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" -ForegroundColor $WarningColor
    exit 1
}
Write-Success "Android SDK found at $env:ANDROID_HOME"

# Install frontend dependencies
Write-Step "Installing frontend dependencies..."
Push-Location vets-ready-frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Failed to install frontend dependencies"
    exit 1
}
Pop-Location
Write-Success "Frontend dependencies installed"

# Build frontend
Write-Step "Building frontend for production..."
Push-Location vets-ready-frontend
$env:VITE_API_URL = "https://api.vetsready.com"
npm run build
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Frontend build failed"
    exit 1
}
Pop-Location
Write-Success "Frontend built successfully"

# Sync Capacitor (unless skipped)
if (-not $SkipSync) {
    Write-Step "Syncing Capacitor with Android..."
    Push-Location vets-ready-mobile
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Capacitor sync failed"
        exit 1
    }
    Pop-Location
    Write-Success "Capacitor synced"
}

# Clean build (unless skipped)
if (-not $SkipClean) {
    Write-Step "Cleaning previous builds..."
    Push-Location android
    .\gradlew clean
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Warning "Clean failed (continuing anyway)"
    } else {
        Write-Success "Build cleaned"
    }
    Pop-Location
}

# Build APK/Bundle
Push-Location android

if ($BuildType -eq "debug" -or $BuildType -eq "both") {
    if ($OutputFormat -eq "apk" -or $OutputFormat -eq "both") {
        Write-Step "Building debug APK..."
        .\gradlew assembleDebug
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Error "Debug APK build failed"
            exit 1
        }
        Write-Success "Debug APK built"

        $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
        if (Test-Path $apkPath) {
            $apkSize = (Get-Item $apkPath).Length / 1MB
            Write-Host "  Location: $apkPath" -ForegroundColor $InfoColor
            Write-Host "  Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor $InfoColor
        }
    }
}

if ($BuildType -eq "release" -or $BuildType -eq "both") {
    if ($OutputFormat -eq "apk" -or $OutputFormat -eq "both") {
        Write-Step "Building release APK..."
        .\gradlew assembleRelease
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Warning "Release APK build failed. Do you have signing configured?"
            Write-Host "See: android\app\build.gradle - signingConfigs section" -ForegroundColor $WarningColor
        } else {
            Write-Success "Release APK built"

            $apkPath = "app\build\outputs\apk\release\app-release.apk"
            if (Test-Path $apkPath) {
                $apkSize = (Get-Item $apkPath).Length / 1MB
                Write-Host "  Location: $apkPath" -ForegroundColor $InfoColor
                Write-Host "  Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor $InfoColor
            }
        }
    }

    if ($OutputFormat -eq "bundle" -or $OutputFormat -eq "both") {
        Write-Step "Building release App Bundle (AAB)..."
        .\gradlew bundleRelease
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            Write-Warning "Release Bundle build failed. Do you have signing configured?"
        } else {
            Write-Success "Release Bundle built"

            $bundlePath = "app\build\outputs\bundle\release\app-release.aab"
            if (Test-Path $bundlePath) {
                $bundleSize = (Get-Item $bundlePath).Length / 1MB
                Write-Host "  Location: $bundlePath" -ForegroundColor $InfoColor
                Write-Host "  Size: $([math]::Round($bundleSize, 2)) MB" -ForegroundColor $InfoColor
            }
        }
    }
}

Pop-Location

# Summary
Write-Host "`n=====================================================" -ForegroundColor $SuccessColor
Write-Host "     Build Complete!" -ForegroundColor $SuccessColor
Write-Host "=====================================================" -ForegroundColor $SuccessColor

Write-Host "`nOutput locations:" -ForegroundColor $InfoColor
Write-Host "  Debug APK: android\app\build\outputs\apk\debug\" -ForegroundColor $WarningColor
Write-Host "  Release APK: android\app\build\outputs\apk\release\" -ForegroundColor $WarningColor
Write-Host "  Release Bundle: android\app\build\outputs\bundle\release\" -ForegroundColor $WarningColor

Write-Host "`nNext steps:" -ForegroundColor $InfoColor
Write-Host "  1. Test APK on physical device:" -ForegroundColor $WarningColor
Write-Host "     adb install android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor $WarningColor
Write-Host "  2. Upload AAB to Google Play Console" -ForegroundColor $WarningColor
Write-Host "  3. Configure app signing in Play Console" -ForegroundColor $WarningColor
