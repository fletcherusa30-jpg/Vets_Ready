#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Organize App folder by file type

.DESCRIPTION
    Creates subfolders for .docx, .md, images, and scripts in the App folder
#>

$ErrorActionPreference = "Stop"

function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Host "`n📁 ORGANIZING APP FOLDER" -ForegroundColor Magenta
Write-Host "=" * 80 -ForegroundColor Magenta

$appDir = "C:\Dev\Rally Forge\App"
Set-Location $appDir

# Create organized folders
$folders = @{
    "documents" = "Word documents (.docx)"
    "markdown" = "Markdown files (.md)"
    "scripts" = "Python scripts"
}

Write-Info "Creating folder structure..."
foreach ($folder in $folders.Keys) {
    $path = Join-Path $appDir $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Success "Created: $folder/ - $($folders[$folder])"
    }
}

# Move Word documents
Write-Host "`n📄 Moving Word documents..." -ForegroundColor Cyan
$docxFiles = Get-ChildItem -Path $appDir -Filter "*.docx" -File
foreach ($file in $docxFiles) {
    $dest = Join-Path "$appDir\documents" $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force
    Write-Success "Moved: $($file.Name)"
}

# Move Markdown files
Write-Host "`n📝 Moving Markdown files..." -ForegroundColor Cyan
$mdFiles = Get-ChildItem -Path $appDir -Filter "*.md" -File
foreach ($file in $mdFiles) {
    $dest = Join-Path "$appDir\markdown" $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force
    Write-Success "Moved: $($file.Name)"
}

# Move Python scripts
Write-Host "`n🐍 Moving Python scripts..." -ForegroundColor Cyan
$pyFiles = Get-ChildItem -Path $appDir -Filter "*.py" -File
foreach ($file in $pyFiles) {
    $dest = Join-Path "$appDir\scripts" $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force
    Write-Success "Moved: $($file.Name)"
}

# Move PDF files to documents
Write-Host "`n📕 Moving PDF files..." -ForegroundColor Cyan
$pdfFiles = Get-ChildItem -Path $appDir -Filter "*.pdf" -File
foreach ($file in $pdfFiles) {
    $dest = Join-Path "$appDir\documents" $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force
    Write-Success "Moved: $($file.Name)"
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Magenta
Write-Host "📊 ORGANIZATION COMPLETE" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Magenta

Write-Host "`n📁 APP FOLDER STRUCTURE:" -ForegroundColor Yellow
Write-Host "  App/" -ForegroundColor Cyan
Write-Host "  ├── documents/ - $($docxFiles.Count) .docx + $($pdfFiles.Count) .pdf files" -ForegroundColor White
Write-Host "  ├── markdown/ - $($mdFiles.Count) .md files" -ForegroundColor White
Write-Host "  ├── scripts/ - $($pyFiles.Count) .py files" -ForegroundColor White
Write-Host "  ├── Images/ - existing image folder" -ForegroundColor White
Write-Host "  └── Seperation/ - existing folder" -ForegroundColor White

Write-Host "`n✅ App folder organized!`n" -ForegroundColor Green

