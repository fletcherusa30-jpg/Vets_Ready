#Requires -Version 5.1
<#
.SYNOPSIS
    Rally Forge - Master Design Book Generator
    Creates comprehensive PDF documentation of the entire platform

.DESCRIPTION
    Generates a complete Master Design Book PDF containing:
    - Architecture overview
    - System specifications
    - API documentation
    - Module descriptions
    - Pricing strategy
    - Security framework
    - Development standards
    - Deployment procedures
    - Automation framework
    - Roadmap and features

    Requires: Pandoc or wkhtmltopdf for PDF generation

.EXAMPLE
    .\Generate-MasterDesignBook.ps1
    .\Generate-MasterDesignBook.ps1 -OutputPath "C:\Docs\RallyForge_MasterDesign.pdf"
    .\Generate-MasterDesignBook.ps1 -IncludeCode
    .\Generate-MasterDesignBook.ps1 -Format Word
    .\Generate-MasterDesignBook.ps1 -Format Word -OpenAfterGeneration
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath,

    [Parameter(Mandatory=$false)]
    [ValidateSet('PDF', 'Word', 'Both')]
    [string]$Format = 'PDF',

    [Parameter(Mandatory=$false)]
    [switch]$IncludeCode,

    [Parameter(Mandatory=$false)]
    [switch]$OpenAfterGeneration
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Configuration
$RootPath = Split-Path -Parent $PSScriptRoot
$DocsPath = Join-Path $RootPath 'docs'
$OutputDir = Join-Path $RootPath 'docs\generated'
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'

if (-not $OutputPath) {
    $extension = if ($Format -eq 'Word') { '.docx' } else { '.pdf' }
    $OutputPath = Join-Path $OutputDir "RallyForge_MasterDesignBook_$Timestamp$extension"
}

$WordOutputPath = $OutputPath -replace '\.pdf$', '.docx'
$PdfOutputPath = $OutputPath -replace '\.docx$', '.pdf'

# Ensure output directory exists
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$TempMarkdownPath = Join-Path $OutputDir "MasterDesignBook_$Timestamp.md"
$TempHtmlPath = Join-Path $OutputDir "MasterDesignBook_$Timestamp.html"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Rally Forge - MASTER DESIGN BOOK GENERATOR              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to read and format markdown file
function Get-FormattedMarkdown {
    param([string]$FilePath, [string]$Title)

    if (-not (Test-Path $FilePath)) {
        return "# $Title`n`n**File not found:** $FilePath`n`n"
    }

    $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    return "`n`n---`n`n# $Title`n`n$content`n`n"
}

# Function to generate table of contents
function New-TableOfContents {
    return @"
# 📚 Table of Contents

## Part I: Executive Overview
1. Project Overview & Mission
2. Quick Start Guide
3. System Architecture

## Part II: Technical Specifications
4. Architecture & Design
5. Module Purposes & Responsibilities
6. API Reference
7. Database Schema
8. Security Framework

## Part III: Business & Strategy
9. Pricing Strategy & Monetization
10. Partnership Models
11. VSO Partnerships
12. Military Installation Partnerships
13. Attorney Partnerships

## Part IV: Development & Operations
14. Development Standards
15. Testing Strategy
16. Deployment Procedures
17. Getting Started Guide

## Part V: Features & Modules
18. Retirement System
19. Outreach & Scout System
20. Military Badges System
21. Legal Reference System
22. Veteran Assistance Programs

## Part VI: Automation & Tools
23. PowerShell Automation Framework
24. Control Panel Documentation
25. Diagnostics & Repair Engines

## Part VII: Compliance & Roadmap
26. RallyForge Platform (CRSC + Resource Ecosystem)
27. Implementation Summary
28. Phase 1 Completion
29. Compliance Audit Report
30. Future Roadmap

---

"@
}

# Function to generate cover page
function New-CoverPage {
    return @"
<div style="text-align: center; margin-top: 200px;">
<h1 style="font-size: 48px; color: #1E3A8A;">Rally Forge</h1>
<h2 style="font-size: 32px; color: #3B82F6;">Master Design Book</h2>
<h3 style="font-size: 24px; color: #60A5FA;">The Ultimate Veteran-First Platform</h3>

<p style="margin-top: 100px; font-size: 18px;">
<strong>Version:</strong> 1.0.0<br>
<strong>Generated:</strong> $(Get-Date -Format 'MMMM dd, yyyy')<br>
<strong>Status:</strong> Production Ready
</p>

<p style="margin-top: 50px; font-size: 14px; color: #6B7280;">
Complete Technical Documentation, Architecture, and Strategic Planning
</p>

<div style="margin-top: 150px; border-top: 2px solid #1E3A8A; padding-top: 20px;">
<p style="font-size: 12px; font-style: italic;">
"Serve those who served - profit from helping them succeed, not from charging them."
</p>
</div>
</div>

<div style="page-break-after: always;"></div>

"@
}

Write-Host "📝 Generating Master Design Book..." -ForegroundColor Cyan
Write-Host ""

# Build the master markdown document
$masterContent = New-Object System.Text.StringBuilder

# Cover page
[void]$masterContent.Append((New-CoverPage))

# Table of Contents
[void]$masterContent.Append((New-TableOfContents))

Write-Host "  ✓ Adding Part I: Executive Overview" -ForegroundColor Green

# Part I: Executive Overview
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART I: EXECUTIVE OVERVIEW`n`n")
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'README.md') '1. Project Overview & Mission'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'QUICK_START.md') '2. Quick Start Guide'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'QUICK_REFERENCE.md') '3. System Architecture'))

Write-Host "  ✓ Adding Part II: Technical Specifications" -ForegroundColor Green

# Part II: Technical Specifications
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART II: TECHNICAL SPECIFICATIONS`n`n")
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'ARCHITECTURE.md') '4. Architecture & Design'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'MODULE_PURPOSES.md') '5. Module Purposes & Responsibilities'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'API.md') '6. API Reference'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'data\schema.sql') '7. Database Schema'))

Write-Host "  ✓ Adding Part III: Business & Strategy" -ForegroundColor Green

# Part III: Business & Strategy
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART III: BUSINESS & STRATEGY`n`n")
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'PRICING_STRATEGY.md') '9. Pricing Strategy & Monetization'))

$partnershipPath = Join-Path $RootPath 'partnerships'
if (Test-Path $partnershipPath) {
    [void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $partnershipPath 'VSO_PARTNERSHIP_PROPOSAL.md') '11. VSO Partnerships'))
    [void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $partnershipPath 'MILITARY_INSTALLATION_PARTNERSHIP.md') '12. Military Installation Partnerships'))
    [void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $partnershipPath 'ATTORNEY_PARTNERSHIP_PROPOSAL.md') '13. Attorney Partnerships'))
}

Write-Host "  ✓ Adding Part IV: Development & Operations" -ForegroundColor Green

# Part IV: Development & Operations
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART IV: DEVELOPMENT & OPERATIONS`n`n")
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'DEVELOPMENT-STANDARDS.md') '14. Development Standards'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'TESTING.md') '15. Testing Strategy'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'DEPLOYMENT.md') '16. Deployment Procedures'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'GETTING-STARTED.md') '17. Getting Started Guide'))

Write-Host "  ✓ Adding Part V: Features & Modules" -ForegroundColor Green

# Part V: Features & Modules
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART V: FEATURES & MODULES`n`n")
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'RETIREMENT_SYSTEM.md') '18. Retirement System'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'OUTREACH_SYSTEM.md') '19. Outreach & Scout System'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'MILITARY-BADGES-GUIDE.md') '20. Military Badges System'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'LEGAL_REFERENCE_QUICK_GUIDE.md') '21. Legal Reference System'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'VETERAN_ASSISTANCE_PROGRAMS.md') '22. Veteran Assistance Programs'))

Write-Host "  ✓ Adding Part VI: Automation & Tools" -ForegroundColor Green

# Part VI: Automation & Tools
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART VI: AUTOMATION & TOOLS`n`n")
[void]$masterContent.Append(@"

## 23. PowerShell Automation Framework

### Control Panel Script
The master automation control panel provides:
- Diagnostics Engine
- Repair Engine
- Backup Manager
- Next Steps Guide
- System Status Dashboard

**Location:** ``scripts/Control-Panel.ps1``

### Available Scripts
- ``Bootstrap-All.ps1`` - Initialize entire environment
- ``Run-Diagnostics.ps1`` - System health checks
- ``Repair-Environment.ps1`` - Auto-healing
- ``Cleanup-Workspace.ps1`` - Workspace maintenance
- ``Integrity-Scanner.ps1`` - Code integrity validation

"@)

Write-Host "  ✓ Adding Part VII: Compliance & Roadmap" -ForegroundColor Green

# Part VII: Compliance & Roadmap
[void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
[void]$masterContent.Append("# PART VII: COMPLIANCE & ROADMAP`n`n")
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'CRSC_RESOURCE_ECOSYSTEM_COMPLETE.md') '26. RallyForge Platform Architecture'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'IMPLEMENTATION_SUMMARY.md') '27. Implementation Summary'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $DocsPath 'PHASE_1_COMPLETION.md') '28. Phase 1 Completion'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'COMPLIANCE_AUDIT.md') '29. Compliance Audit Report'))
[void]$masterContent.Append((Get-FormattedMarkdown (Join-Path $RootPath 'COMPLIANCE_IMPLEMENTATION_SUMMARY.md') '30. Compliance Implementation Summary'))

# Optional: Include code samples
if ($IncludeCode) {
    Write-Host "  ✓ Adding Appendix: Code Samples" -ForegroundColor Green
    [void]$masterContent.Append("<div style='page-break-after: always;'></div>`n`n")
    [void]$masterContent.Append("# APPENDIX: CODE SAMPLES`n`n")

    # Add key backend files
    $backendMain = Join-Path $RootPath 'rally-forge-backend\app\main.py'
    if (Test-Path $backendMain) {
        $code = Get-Content -Path $backendMain -Raw
        [void]$masterContent.Append("## Backend Main Application`n````python`n$code`n`````n`n")
    }
}

# Write combined markdown to temporary file
Write-Host ""
Write-Host "💾 Writing combined markdown..." -ForegroundColor Cyan
$masterContent.ToString() | Out-File -FilePath $TempMarkdownPath -Encoding UTF8

Write-Host "  ✓ Markdown created: $TempMarkdownPath" -ForegroundColor Green

# Convert to PDF
Write-Host ""
Write-Host "📝 Step 4: Converting to output format..." -ForegroundColor Cyan

# Check for pandoc (supports both PDF and Word)
$pandocAvailable = Get-Command pandoc -ErrorAction SilentlyContinue
$wkhtmltopdfAvailable = Get-Command wkhtmltopdf -ErrorAction SilentlyContinue

# Generate Word Document
if ($Format -eq 'Word' -or $Format -eq 'Both') {
    if ($pandocAvailable) {
        Write-Host "  Converting to Word (.docx)..." -ForegroundColor Yellow

        try {
            & pandoc $TempMarkdownPath `
                -o $WordOutputPath `
                --toc `
                --toc-depth=3 `
                --number-sections `
                --highlight-style=tango `
                --reference-doc="$DocsPath\word-template.docx" `
                -V geometry:margin=1in `
                2>&1 | Out-Null

            Write-Host "  ✓ Word document created successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Pandoc Word conversion failed: $_" -ForegroundColor Red
            Write-Host "  → Markdown file available at: $TempMarkdownPath" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ⚠ Pandoc not found - cannot generate Word document" -ForegroundColor Yellow
        Write-Host "  → Install Pandoc: choco install pandoc" -ForegroundColor Cyan
        Write-Host "  → Markdown file available at: $TempMarkdownPath" -ForegroundColor Yellow
    }
}

# Generate PDF
if ($Format -eq 'PDF' -or $Format -eq 'Both') {
    if ($pandocAvailable) {
        Write-Host "  Converting to PDF..." -ForegroundColor Yellow

        try {
            & pandoc $TempMarkdownPath `
                -o $PdfOutputPath `
                --pdf-engine=xelatex `
                --toc `
                --toc-depth=3 `
                --number-sections `
                --highlight-style=tango `
                -V geometry:margin=1in `
                -V fontsize=11pt `
                -V documentclass=report `
                2>&1 | Out-Null

            Write-Host "  ✓ PDF created successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ Pandoc conversion failed: $_" -ForegroundColor Red
            Write-Host "  → Markdown file available at: $TempMarkdownPath" -ForegroundColor Yellow
        }
    }
    elseif ($wkhtmltopdfAvailable) {
        Write-Host "  Using wkhtmltopdf for conversion..." -ForegroundColor Yellow

        # First convert markdown to HTML
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rally Forge - Master Design Book</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
        h1 { color: #1E3A8A; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
        h2 { color: #3B82F6; border-bottom: 2px solid #60A5FA; padding-bottom: 5px; margin-top: 30px; }
        h3 { color: #60A5FA; margin-top: 20px; }
        code { background-color: #F3F4F6; padding: 2px 6px; border-radius: 3px; font-family: 'Consolas', monospace; }
        pre { background-color: #1F2937; color: #F9FAFB; padding: 15px; border-radius: 5px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #D1D5DB; padding: 10px; text-align: left; }
        th { background-color: #3B82F6; color: white; }
        blockquote { border-left: 4px solid #3B82F6; padding-left: 15px; margin-left: 0; color: #4B5563; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
$(ConvertFrom-Markdown -Path $TempMarkdownPath | Select-Object -ExpandProperty Html)
</body>
</html>
"@

        $htmlContent | Out-File -FilePath $TempHtmlPath -Encoding UTF8

        try {
            & wkhtmltopdf `
                --enable-local-file-access `
                --print-media-type `
                --page-size Letter `
                --margin-top 20mm `
                --margin-bottom 20mm `
                --margin-left 15mm `
                --margin-right 15mm `
                $TempHtmlPath $PdfOutputPath 2>&1 | Out-Null

            Write-Host "  ✓ PDF created successfully!" -ForegroundColor Green
        }
        catch {
            Write-Host "  ✗ wkhtmltopdf conversion failed: $_" -ForegroundColor Red
            Write-Host "  → HTML file available at: $TempHtmlPath" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ⚠ No PDF conversion tool found (pandoc or wkhtmltopdf)" -ForegroundColor Yellow
        Write-Host "  → Install Pandoc: choco install pandoc" -ForegroundColor Cyan
        Write-Host "  → Install wkhtmltopdf: choco install wkhtmltopdf" -ForegroundColor Cyan
        Write-Host "  → Markdown file available at: $TempMarkdownPath" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   GENERATION COMPLETE                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 Output Files:" -ForegroundColor White
Write-Host "   Markdown: $TempMarkdownPath" -ForegroundColor Gray

$outputFiles = @()

if (Test-Path $WordOutputPath) {
    Write-Host "   Word:     $WordOutputPath" -ForegroundColor Green
    $fileSize = (Get-Item $WordOutputPath).Length / 1MB
    Write-Host "   Size:     $([Math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
    $outputFiles += $WordOutputPath
}

if (Test-Path $PdfOutputPath) {
    Write-Host "   PDF:      $PdfOutputPath" -ForegroundColor Green
    $fileSize = (Get-Item $PdfOutputPath).Length / 1MB
    Write-Host "   Size:     $([Math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
    $outputFiles += $PdfOutputPath
}

if ($OpenAfterGeneration -and $outputFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "🚀 Opening document(s)..." -ForegroundColor Cyan
    foreach ($file in $outputFiles) {
        Start-Process $file
    }
}

Write-Host ""
Write-Host "✅ Master Design Book generation complete!" -ForegroundColor Green
Write-Host ""

# Return output path
if ($Format -eq 'Word') {
    return $WordOutputPath
}
elseif ($Format -eq 'Both' -and (Test-Path $WordOutputPath)) {
    return $WordOutputPath
}
else {
    return $PdfOutputPath
}
return $OutputPath


