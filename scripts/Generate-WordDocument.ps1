#Requires -Version 5.1
<#
.SYNOPSIS
    Generate Word Document from Master Design Book markdown using Microsoft Word COM automation

.DESCRIPTION
    Creates a Word document (.docx) from the Master Design Book markdown file
    using Microsoft Word COM automation (requires Microsoft Word installed)

.EXAMPLE
    .\Generate-WordDocument.ps1
    .\Generate-WordDocument.ps1 -InputMarkdown "C:\Docs\input.md" -OutputPath "C:\Docs\output.docx"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$InputMarkdown,

    [Parameter(Mandatory=$false)]
    [string]$OutputPath,

    [Parameter(Mandatory=$false)]
    [switch]$OpenAfterGeneration
)

$ErrorActionPreference = 'Stop'

# Configuration
$RootPath = Split-Path -Parent $PSScriptRoot
$DocsPath = Join-Path $RootPath 'docs\generated'
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'

# Find the most recent markdown file if not specified
if (-not $InputMarkdown) {
    $markdownFiles = Get-ChildItem -Path $DocsPath -Filter "MasterDesignBook_*.md" | Sort-Object LastWriteTime -Descending
    if ($markdownFiles.Count -eq 0) {
        Write-Host "❌ No Master Design Book markdown files found in $DocsPath" -ForegroundColor Red
        Write-Host "   Run Generate-MasterDesignBook.ps1 first to create the markdown file" -ForegroundColor Yellow
        exit 1
    }
    $InputMarkdown = $markdownFiles[0].FullName
}

if (-not (Test-Path $InputMarkdown)) {
    Write-Host "❌ Markdown file not found: $InputMarkdown" -ForegroundColor Red
    exit 1
}

if (-not $OutputPath) {
    $OutputPath = Join-Path $DocsPath "RallyForge_MasterDesignBook_$Timestamp.docx"
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Rally Forge - WORD DOCUMENT GENERATOR                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Input:  $InputMarkdown" -ForegroundColor Gray
Write-Host "📝 Output: $OutputPath" -ForegroundColor Gray
Write-Host ""

# Read markdown content
Write-Host "📖 Reading markdown content..." -ForegroundColor Cyan
$markdownContent = Get-Content -Path $InputMarkdown -Raw -Encoding UTF8

# Check if Microsoft Word is installed
Write-Host "🔍 Checking for Microsoft Word..." -ForegroundColor Cyan
try {
    $word = New-Object -ComObject Word.Application
    Write-Host "  ✓ Microsoft Word found!" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Microsoft Word not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative methods to create Word document:" -ForegroundColor Yellow
    Write-Host "  1. Install Pandoc: Download from https://pandoc.org/installing.html" -ForegroundColor Cyan
    Write-Host "  2. Use online converter: Upload markdown to https://cloudconvert.com/md-to-docx" -ForegroundColor Cyan
    Write-Host "  3. Open the markdown file in Word directly (File > Open > select .md file)" -ForegroundColor Cyan
    exit 1
}

try {
    Write-Host "📝 Creating Word document..." -ForegroundColor Cyan

    # Create new document
    $word.Visible = $false
    $doc = $word.Documents.Add()

    # Set up document properties
    $doc.BuiltInDocumentProperties("Title") = "Rally Forge - Master Design Book"
    $doc.BuiltInDocumentProperties("Subject") = "Complete Platform Documentation"
    $doc.BuiltInDocumentProperties("Author") = "Rally Forge Team"
    $doc.BuiltInDocumentProperties("Keywords") = "Veterans, RallyForge, Documentation, Architecture, API"

    # Process markdown content line by line
    $lines = $markdownContent -split "`n"
    $selection = $word.Selection

    Write-Host "  Processing $($lines.Count) lines..." -ForegroundColor Yellow

    $lineCount = 0
    foreach ($line in $lines) {
        $lineCount++
        if ($lineCount % 100 -eq 0) {
            Write-Host "  Progress: $lineCount / $($lines.Count) lines" -ForegroundColor Gray
        }

        $line = $line.TrimEnd()

        # Handle headings
        if ($line -match '^# (.+)$') {
            $selection.Style = "Heading 1"
            $selection.TypeText($matches[1])
            $selection.TypeParagraph()
        }
        elseif ($line -match '^## (.+)$') {
            $selection.Style = "Heading 2"
            $selection.TypeText($matches[1])
            $selection.TypeParagraph()
        }
        elseif ($line -match '^### (.+)$') {
            $selection.Style = "Heading 3"
            $selection.TypeText($matches[1])
            $selection.TypeParagraph()
        }
        elseif ($line -match '^#### (.+)$') {
            $selection.Style = "Heading 4"
            $selection.TypeText($matches[1])
            $selection.TypeParagraph()
        }
        # Handle code blocks
        elseif ($line -match '^```') {
            # Skip code fence markers
            continue
        }
        # Handle horizontal rules
        elseif ($line -match '^---+$') {
            $selection.InsertBreak(1)  # Page break
        }
        # Handle bold text
        elseif ($line -match '\*\*(.+?)\*\*') {
            $selection.Style = "Normal"
            $processedLine = $line
            while ($processedLine -match '\*\*(.+?)\*\*') {
                $before = $processedLine.Substring(0, $processedLine.IndexOf('**'))
                $bold = $matches[1]
                $after = $processedLine.Substring($processedLine.IndexOf('**') + $bold.Length + 4)

                $selection.TypeText($before)
                $selection.Font.Bold = $true
                $selection.TypeText($bold)
                $selection.Font.Bold = $false

                $processedLine = $after
            }
            $selection.TypeText($processedLine)
            $selection.TypeParagraph()
        }
        # Handle list items
        elseif ($line -match '^[-*] (.+)$') {
            $selection.Style = "List Bullet"
            $selection.TypeText($matches[1])
            $selection.TypeParagraph()
        }
        elseif ($line -match '^(\d+)\. (.+)$') {
            $selection.Style = "List Number"
            $selection.TypeText($matches[2])
            $selection.TypeParagraph()
        }
        # Handle blank lines
        elseif ($line -eq '') {
            $selection.TypeParagraph()
        }
        # Regular text
        else {
            $selection.Style = "Normal"
            $selection.TypeText($line)
            $selection.TypeParagraph()
        }
    }

    Write-Host "  ✓ Content added to document" -ForegroundColor Green

    # Add table of contents at the beginning
    Write-Host "  Adding table of contents..." -ForegroundColor Yellow
    $range = $doc.Range(0, 0)
    $toc = $doc.TablesOfContents.Add($range, $true, 1, 3)
    $selection.TypeParagraph()
    $selection.InsertBreak(7)  # Page break

    Write-Host "  ✓ Table of contents added" -ForegroundColor Green

    # Save document
    Write-Host "💾 Saving document..." -ForegroundColor Cyan
    $doc.SaveAs([ref]$OutputPath, [ref]16)  # 16 = wdFormatDocumentDefault (.docx)
    Write-Host "  ✓ Document saved!" -ForegroundColor Green

    # Get file size
    $fileInfo = Get-Item $OutputPath
    $fileSizeMB = [Math]::Round($fileInfo.Length / 1MB, 2)

    # Close document
    $doc.Close()
    $word.Quit()

    # Release COM objects
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    # Summary
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                   GENERATION COMPLETE                     ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📄 Word Document Created!" -ForegroundColor White
    Write-Host "   Location: $OutputPath" -ForegroundColor Green
    Write-Host "   Size:     $fileSizeMB MB" -ForegroundColor Gray
    Write-Host ""

    if ($OpenAfterGeneration) {
        Write-Host "🚀 Opening document..." -ForegroundColor Cyan
        Start-Process $OutputPath
    }

    Write-Host "✅ Word document generation complete!" -ForegroundColor Green
    Write-Host ""

    return $OutputPath
}
catch {
    Write-Host ""
    Write-Host "❌ Error creating Word document: $_" -ForegroundColor Red

    # Clean up
    if ($doc) { $doc.Close($false) }
    if ($word) { $word.Quit() }

    exit 1
}


