#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Process Word documents and PDFs in the Rally Forge workspace

.DESCRIPTION
    Scans for Word (.docx), PDF, and other document files, extracts their content,
    and processes them through the document scanner system.

.PARAMETER DocumentPath
    Path to specific document to process. If not provided, scans entire workspace.

.PARAMETER ScannerType
    Type of scanner to use: dd214, str, rating, project

.EXAMPLE
    .\Process-Documents.ps1
    Scans all documents in workspace

.EXAMPLE
    .\Process-Documents.ps1 -DocumentPath "C:\Dev\Rally Forge\Transition_Readiness_Guide_All_Branches.docx"
    Processes specific document
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$DocumentPath = "",

    [Parameter(Mandatory=$false)]
    [ValidateSet("dd214", "str", "rating", "project")]
    [string]$ScannerType = "project"
)

# Set error action
$ErrorActionPreference = "Stop"

# Colors
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Warning { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Host "`n🔍 DOCUMENT PROCESSING SYSTEM" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Magenta

# Base directory
$baseDir = "C:\Dev\Rally Forge"
Set-Location $baseDir

# Check if backend is running
Write-Info "Checking backend status..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
    Write-Success "Backend is running"
} catch {
    Write-Error "Backend is not running. Start it first with: .\Start-RallyForge.ps1"
    exit 1
}

# Document discovery
Write-Info "`nScanning for documents..."

$documents = @()

if ($DocumentPath) {
    if (Test-Path $DocumentPath) {
        $documents += Get-Item $DocumentPath
        Write-Info "Processing single document: $DocumentPath"
    } else {
        Write-Error "Document not found: $DocumentPath"
        exit 1
    }
} else {
    # Scan workspace for documents
    $patterns = @("*.docx", "*.doc", "*.pdf")

    foreach ($pattern in $patterns) {
        $found = Get-ChildItem -Path $baseDir -Filter $pattern -Recurse -ErrorAction SilentlyContinue |
            Where-Object {
                $_.FullName -notmatch "node_modules|\.venv|_archive|\.git|__pycache__"
            }
        $documents += $found
    }
}

Write-Info "Found $($documents.Count) documents to process"

if ($documents.Count -eq 0) {
    Write-Warning "No documents found to process"
    exit 0
}

# Display documents
Write-Host "`n📄 DOCUMENTS TO PROCESS:" -ForegroundColor Cyan
$documents | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "  - $($_.Name)" -ForegroundColor White -NoNewline
    Write-Host " ($size KB)" -ForegroundColor Gray
}

# Process each document
Write-Host "`n🔄 PROCESSING DOCUMENTS..." -ForegroundColor Cyan

$results = @()
$successCount = 0
$failCount = 0

foreach ($doc in $documents) {
    Write-Info "`nProcessing: $($doc.Name)"

    try {
        # Determine file type
        $extension = $doc.Extension.ToLower()

        # For DOCX files, we need to convert to text first
        if ($extension -eq ".docx") {
            Write-Info "  Converting Word document..."

            # Check if python-docx is available
            $pythonExe = "C:\Dev\Rally Forge\.venv\Scripts\python.exe"

            # Create temp extraction script
            $extractScript = @"
import sys
from docx import Document

try:
    doc = Document('$($doc.FullName)')
    text = '\n'.join([para.text for para in doc.paragraphs])
    print(text)
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
"@

            $tempScript = Join-Path $env:TEMP "extract_docx_$([guid]::NewGuid().ToString('N')).py"
            $extractScript | Out-File -FilePath $tempScript -Encoding UTF8

            try {
                $output = & $pythonExe $tempScript 2>&1
                $extractedText = $output -join "`n"

                if ($LASTEXITCODE -eq 0 -and $extractedText.Length -gt 0) {
                    Write-Success "  Extracted $($extractedText.Length) characters"

                    # Save extracted text
                    $textFile = Join-Path $doc.DirectoryName "$($doc.BaseName)_extracted.txt"
                    $extractedText | Out-File -FilePath $textFile -Encoding UTF8
                    Write-Success "  Saved to: $textFile"

                    $results += @{
                        File = $doc.Name
                        Status = "Success"
                        Method = "DOCX Text Extraction"
                        CharacterCount = $extractedText.Length
                        OutputPath = $textFile
                    }
                    $successCount++
                } else {
                    Write-Warning "  No text extracted from document"
                    $results += @{
                        File = $doc.Name
                        Status = "Warning"
                        Method = "DOCX Text Extraction"
                        CharacterCount = 0
                        Error = "Empty extraction"
                    }
                    $failCount++
                }
            } finally {
                Remove-Item $tempScript -Force -ErrorAction SilentlyContinue
            }

        } elseif ($extension -eq ".pdf") {
            # Upload PDF to scanner API
            Write-Info "  Uploading to scanner API..."

            $fileBytes = [System.IO.File]::ReadAllBytes($doc.FullName)
            $base64 = [Convert]::ToBase64String($fileBytes)

            $boundary = [System.Guid]::NewGuid().ToString()
            $headers = @{
                "Content-Type" = "multipart/form-data; boundary=$boundary"
            }

            $bodyLines = @(
                "--$boundary",
                "Content-Disposition: form-data; name=`"file`"; filename=`"$($doc.Name)`"",
                "Content-Type: application/pdf",
                "",
                $base64,
                "--$boundary--"
            )

            $body = $bodyLines -join "`r`n"

            $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/scan/upload/$ScannerType" `
                -Method Post `
                -Headers $headers `
                -Body $body

            if ($uploadResponse.success) {
                Write-Success "  Uploaded successfully"
                Write-Info "  File path: $($uploadResponse.file_path)"

                $results += @{
                    File = $doc.Name
                    Status = "Success"
                    Method = "Scanner API Upload"
                    FilePath = $uploadResponse.file_path
                    Size = $uploadResponse.size
                }
                $successCount++
            } else {
                Write-Error "  Upload failed: $($uploadResponse.error)"
                $results += @{
                    File = $doc.Name
                    Status = "Failed"
                    Error = $uploadResponse.error
                }
                $failCount++
            }
        }

    } catch {
        Write-Error "  Processing failed: $($_.Exception.Message)"
        $results += @{
            File = $doc.Name
            Status = "Failed"
            Error = $_.Exception.Message
        }
        $failCount++
    }
}

# Summary
Write-Host "`n" + "=" * 60 -ForegroundColor Magenta
Write-Host "📊 PROCESSING SUMMARY" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Magenta

Write-Host "`nTotal Documents: $($documents.Count)" -ForegroundColor Cyan
Write-Success "Successful: $successCount"
Write-Error "Failed: $failCount"

# Detailed results
Write-Host "`n📋 DETAILED RESULTS:" -ForegroundColor Cyan
foreach ($result in $results) {
    $statusColor = switch ($result.Status) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Failed" { "Red" }
        default { "White" }
    }

    Write-Host "`n  📄 " -NoNewline
    Write-Host "$($result.File)" -ForegroundColor White
    Write-Host "     Status: " -NoNewline
    Write-Host "$($result.Status)" -ForegroundColor $statusColor

    if ($result.Method) {
        Write-Host "     Method: $($result.Method)" -ForegroundColor Gray
    }
    if ($result.CharacterCount) {
        Write-Host "     Characters: $($result.CharacterCount)" -ForegroundColor Gray
    }
    if ($result.OutputPath) {
        Write-Host "     Output: $($result.OutputPath)" -ForegroundColor Gray
    }
    if ($result.FilePath) {
        Write-Host "     Path: $($result.FilePath)" -ForegroundColor Gray
    }
    if ($result.Error) {
        Write-Host "     Error: $($result.Error)" -ForegroundColor Red
    }
}

# Save results to JSON
$resultsFile = Join-Path $baseDir "logs\document_processing_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8
Write-Info "`nResults saved to: $resultsFile"

Write-Host "`n✅ Document processing complete!`n" -ForegroundColor Green


