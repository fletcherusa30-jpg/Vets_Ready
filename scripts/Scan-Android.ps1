# ============================================================
#  ANDROID PROJECT HEALTH SCAN (READ-ONLY)
# ============================================================

$Root = "C:\Dev\PhoneApp"
$Errors = @()
$Warnings = @()

Write-Host "=== ANDROID PROJECT HEALTH SCAN ===" -ForegroundColor Cyan
Write-Host "Scanning: $Root"
Write-Host ""

function Test-JsonFile {
    param([string]$Path)
    try {
        $raw = Get-Content $Path -Raw
        $null = $raw | ConvertFrom-Json -ErrorAction Stop
        return $true
    } catch { return $false }
}

function Test-XmlFile {
    param([string]$Path)
    try {
        $xml = New-Object System.Xml.XmlDocument
        $xml.Load($Path)
        return $true
    } catch { return $false }
}

function Test-ImageFile {
    param([string]$Path)
    try {
        Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue | Out-Null
        $img = [System.Drawing.Image]::FromFile($Path)
        $img.Dispose()
        return $true
    } catch { return $false }
}

$RequiredFolders = @(
    "$Root\app",
    "$Root\app\src\main",
    "$Root\app\src\main\java",
    "$Root\app\src\main\res",
    "$Root\app\src\main\res\layout",
    "$Root\app\src\main\res\drawable",
    "$Root\app\src\main\assets"
)

foreach ($folder in $RequiredFolders) {
    if (!(Test-Path $folder)) {
        $Errors += "Missing required folder: $folder"
    }
}

Write-Host "Checking JSON files..."
$jsonFiles = Get-ChildItem $Root -Recurse -Filter *.json -ErrorAction SilentlyContinue
foreach ($file in $jsonFiles) {
    if (-not (Test-JsonFile $file.FullName)) {
        $Errors += "Invalid JSON: $($file.FullName)"
    }
}

Write-Host "Checking XML files..."
$xmlFiles = Get-ChildItem $Root -Recurse -Filter *.xml -ErrorAction SilentlyContinue
foreach ($file in $xmlFiles) {
    if (-not (Test-XmlFile $file.FullName)) {
        $Errors += "Invalid XML: $($file.FullName)"
    }
}

Write-Host "Checking images..."
$imageFiles = Get-ChildItem $Root -Recurse -Include *.png,*.jpg,*.jpeg,*.webp -ErrorAction SilentlyContinue
foreach ($file in $imageFiles) {
    if (-not (Test-ImageFile $file.FullName)) {
        $Errors += "Corrupted or unreadable image: $($file.FullName)"
    }
}

Write-Host "Checking fonts..."
$fontFiles = Get-ChildItem $Root -Recurse -Include *.ttf,*.otf -ErrorAction SilentlyContinue
foreach ($file in $fontFiles) {
    if ((Get-Item $file.FullName).Length -lt 1000) {
        $Warnings += "Font file may be corrupted or empty: $($file.FullName)"
    }
}

Write-Host "Checking for tiny/empty files..."
$tinyFiles = Get-ChildItem $Root -Recurse -File | Where-Object { $_.Length -lt 5 }
foreach ($file in $tinyFiles) {
    $Warnings += "Tiny/empty file: $($file.FullName)"
}

$GradleWrapper = "$Root\gradlew.bat"
if (!(Test-Path $GradleWrapper)) {
    $Errors += "Missing Gradle wrapper: $GradleWrapper"
}

if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    $Warnings += "ADB not found in PATH. Device install/launch will fail."
}

Write-Host ""
Write-Host "=== SCAN SUMMARY ===" -ForegroundColor Cyan

if ($Errors.Count -eq 0 -and $Warnings.Count -eq 0) {
    Write-Host "Your Android project looks PERFECT. No issues found." -ForegroundColor Green
} else {
    if ($Errors.Count -gt 0) {
        Write-Host "`nERRORS:" -ForegroundColor Red
        $Errors | ForEach-Object { Write-Host " - $_" }
    }
    if ($Warnings.Count -gt 0) {
        Write-Host "`nWARNINGS:" -ForegroundColor Yellow
        $Warnings | ForEach-Object { Write-Host " - $_" }
    }
}

Write-Host "`n=== SCAN COMPLETE ===" -ForegroundColor Cyan






