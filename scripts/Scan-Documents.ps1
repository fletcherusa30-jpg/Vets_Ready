#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick document scanner for Word and PDF files

.DESCRIPTION
    Simplified script to scan and extract content from documents

.EXAMPLE
    .\Scan-Documents.ps1
#>

$ErrorActionPreference = "Stop"

# Colors
function Write-Header { param([string]$Message) Write-Host "`n$Message" -ForegroundColor Magenta }
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warn { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Fail { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Header "🔍 DOCUMENT SCANNER"
Write-Header "=" * 60

# Set location
$baseDir = "C:\Dev\Vets Ready"
Set-Location $baseDir

# Check Python environment
Write-Info "Checking Python environment..."

$pythonExe = ".\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Fail "Python virtual environment not found"
    Write-Info "Run: .\Setup-Complete.ps1"
    exit 1
}

Write-Success "Python environment found"

# Check for python-docx
Write-Info "Checking dependencies..."

$checkCmd = "& '$pythonExe' -c 'import docx; print(""OK"")' 2>&1"
$result = Invoke-Expression $checkCmd

if ($result -match "OK") {
    Write-Success "python-docx is installed"
} else {
    Write-Warn "python-docx not found, installing..."
    & $pythonExe -m pip install python-docx --quiet
    Write-Success "python-docx installed"
}

# Find the Word document
Write-Info "`nSearching for Word documents..."

$docPath = "C:\Dev\Vets Ready\Transition_Readiness_Guide_All_Branches.docx"

if (Test-Path $docPath) {
    $fileSize = [math]::Round((Get-Item $docPath).Length / 1KB, 2)
    Write-Success "Found: Transition_Readiness_Guide_All_Branches.docx ($fileSize KB)"
} else {
    Write-Fail "Document not found: $docPath"
    exit 1
}

# Process the document
Write-Header "`n📄 PROCESSING DOCUMENT"

$scriptPath = ".\vets-ready-backend\scripts\process_word_docs.py"

if (-not (Test-Path $scriptPath)) {
    Write-Fail "Processing script not found: $scriptPath"
    exit 1
}

Write-Info "Extracting content..."

try {
    & $pythonExe $scriptPath --file $docPath --format both

    if ($LASTEXITCODE -eq 0) {
        Write-Success "`nDocument processed successfully!"

        # Show output files
        $outputDir = ".\data\extracted"
        if (Test-Path $outputDir) {
            Write-Header "`n📁 OUTPUT FILES:"
            Get-ChildItem $outputDir -File | Sort-Object LastWriteTime -Descending | Select-Object -First 3 | ForEach-Object {
                $size = [math]::Round($_.Length / 1KB, 2)
                Write-Host "  📄 $($_.Name) ($size KB)" -ForegroundColor White
            }
        }
    } else {
        Write-Fail "Processing failed with exit code: $LASTEXITCODE"
        exit 1
    }
} catch {
    Write-Fail "Error processing document: $($_.Exception.Message)"
    exit 1
}

# Summary
Write-Header "`n✅ SCAN COMPLETE"
Write-Info "Check the data/extracted folder for results"

Write-Host ""
