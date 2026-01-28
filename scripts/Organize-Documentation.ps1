#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Organize and consolidate markdown files into logical folders

.DESCRIPTION
    Moves markdown files from root to organized subdirectories without breaking anything

.EXAMPLE
    .\Organize-Documentation.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Header { param([string]$Message) Write-Host "`n$Message" -ForegroundColor Magenta }
function Write-Success { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

Write-Header "📁 DOCUMENTATION ORGANIZATION"
Write-Header "=" * 80

$baseDir = "C:\Dev\Vets Ready"
Set-Location $baseDir

# Create organized folder structure
$folders = @{
    "docs/implementation" = @()
    "docs/guides" = @()
    "docs/status-reports" = @()
    "docs/testing" = @()
    "docs/scanners" = @()
    "docs/architecture" = @()
}

# Define file categories and destinations
$fileMapping = @{
    # Implementation Docs
    "ARDE_IMPLEMENTATION_SUMMARY.md" = "docs/implementation"
    "CRSC_IMPLEMENTATION_SUMMARY.md" = "docs/implementation"
    "CRSC_AND_SCANNER_IMPLEMENTATION_SUMMARY.md" = "docs/implementation"
    "MILITARY_PENSION_CRSC_IMPLEMENTATION.md" = "docs/implementation"
    "MILITARY_BACKGROUNDS_IMPLEMENTATION.md" = "docs/implementation"
    "ENTITLEMENT_HELPER_IMPLEMENTATION.md" = "docs/implementation"
    "PRICING_REVENUE_SYSTEM_IMPLEMENTATION.md" = "docs/implementation"
    "INTEGRATED_SYSTEM_IMPLEMENTATION.md" = "docs/implementation"
    "IMPLEMENTATION_ROADMAP.md" = "docs/implementation"
    "IMPLEMENTATION_ROADMAP_DOCUMENT_SCANNING.md" = "docs/implementation"
    "STR_INTELLIGENCE_ENGINE_IMPLEMENTATION.md" = "docs/implementation"
    "EMPLOYMENT_HUB_POLICY_COMPLIANCE.md" = "docs/implementation"
    "MANUAL_DISABILITY_ENTRY_ENHANCEMENT.md" = "docs/implementation"

    # Complete/Status Docs
    "ARDE_COMPLETE_GUIDE.md" = "docs/guides"
    "COMPLETE_SETUP_AND_STARTUP_GUIDE.md" = "docs/guides"
    "ADVANCED_CALCULATORS_DOCUMENTATION.md" = "docs/guides"
    "SCANNER_API_COMPLETE_GUIDE.md" = "docs/guides"
    "VA_KNOWLEDGE_QUICK_START.md" = "docs/guides"
    "QUICK_START.md" = "docs/guides"
    "QUICK_START_DOCUMENT_SCANNING.md" = "docs/guides"
    "QUICK_COMMANDS.md" = "docs/guides"
    "QUICK_REFERENCE_CRSC_SCANNER.md" = "docs/guides"

    # Status Reports
    "ARDE_STATUS.md" = "docs/status-reports"
    "PLATFORM_STATUS_REPORT.md" = "docs/status-reports"
    "PLATFORM_COMPLETE.md" = "docs/status-reports"
    "PHASE_2_COMPLETE.md" = "docs/status-reports"
    "IMPLEMENTATION_STATUS.md" = "docs/status-reports"
    "IMPLEMENTATION_COMPLETE.md" = "docs/status-reports"
    "MY_TOTAL_BENEFITS_CENTER_COMPLETE.md" = "docs/status-reports"
    "VA_KNOWLEDGE_CENTER_COMPLETE.md" = "docs/status-reports"
    "DD214_UPLOAD_COMPLETE.md" = "docs/status-reports"
    "DISCHARGE_UPGRADE_HELPER_COMPLETE.md" = "docs/status-reports"
    "DEEP_SCAN_HARDENING_COMPLETE.md" = "docs/status-reports"
    "WIZARD_REORGANIZATION_COMPLETE.md" = "docs/status-reports"
    "DOCUMENT_SCAN_COMPLETE.md" = "docs/status-reports"

    # Testing Docs
    "CRSC_WIZARD_TESTING_GUIDE.md" = "docs/testing"
    "DD214_QUICK_START_TEST.md" = "docs/testing"
    "SCANNER_TESTING_GUIDE.md" = "docs/testing"
    "TESTING_GUIDE.md" = "docs/testing"
    "TESTING_GUIDE_MILITARY_PENSION.md" = "docs/testing"
    "VA_KNOWLEDGE_AI_TEST_RESULTS.md" = "docs/testing"
    "VA_KNOWLEDGE_MANUAL_TEST_SCRIPT.md" = "docs/testing"

    # Scanner Docs
    "SCANNER_QUICK_START.md" = "docs/scanners"
    "SCANNER_SYSTEM_COMPLETE_FIX.md" = "docs/scanners"
    "DOCUMENT_SCANNER_VALIDATION.md" = "docs/scanners"
    "DD214_EXTRACTION_FIX_COMPLETE.md" = "docs/scanners"
    "VBMS_SCANNER_ENHANCEMENTS.md" = "docs/scanners"

    # Architecture Docs
    "ARCHITECTURE_DIAGRAM.md" = "docs/architecture"
    "ELITE_ARCHITECTURE_ANALYSIS.md" = "docs/architecture"
    "ELITE_CODE_PATTERNS.md" = "docs/architecture"
    "MODULE_MAP.md" = "docs/architecture"
    "APP_REORGANIZATION_SUMMARY.md" = "docs/architecture"
    "UI_UX_BLUEPRINT.md" = "docs/architecture"

    # Deployment/Production
    "PRODUCTION_SETUP.md" = "docs/deployment"
    "PRODUCTION_CHECKLIST.md" = "docs/deployment"

    # Misc/Strategy
    "STRATEGIC_COMPETITIVE_ANALYSIS.md" = "docs"
    "VETS_READY_COMPREHENSIVE_SIMULATION.md" = "docs"
    "WEEK_1_ACTION_PLAN.md" = "docs"
    "CRSC_BEFORE_AFTER_COMPARISON.md" = "docs"
    "EFFECTIVE_DATE_CALCULATOR_FIX.md" = "docs"
}

# Create directories
Write-Info "Creating directory structure..."
foreach ($folder in $folders.Keys) {
    $fullPath = Join-Path $baseDir $folder
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Success "Created: $folder"
    }
}

# Move files
Write-Header "`n📦 MOVING FILES"
$movedCount = 0
$skippedCount = 0

foreach ($file in $fileMapping.Keys) {
    $sourcePath = Join-Path $baseDir $file
    $destFolder = Join-Path $baseDir $fileMapping[$file]
    $destPath = Join-Path $destFolder $file

    if (Test-Path $sourcePath) {
        try {
            # Check if file already exists in destination
            if (Test-Path $destPath) {
                Write-Info "Already exists: $file"
                $skippedCount++
            } else {
                Move-Item -Path $sourcePath -Destination $destPath -Force
                Write-Success "Moved: $file -> $($fileMapping[$file])"
                $movedCount++
            }
        } catch {
            Write-Host "❌ Failed to move $file : $_" -ForegroundColor Red
        }
    } else {
        $skippedCount++
    }
}

# Create index file
Write-Header "`n📋 CREATING INDEX"

$indexContent = @"
# 📚 Documentation Organization

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

This document provides a guide to the reorganized documentation structure.

---

## 📁 Folder Structure

### 📂 docs/implementation/
**Implementation guides and summaries**
- ARDE, CRSC, Military Pension implementations
- Scanner integrations
- Revenue systems
- Employment hub compliance
- STR Intelligence Engine

### 📂 docs/guides/
**Quick start guides and references**
- Setup and startup guides
- Scanner guides
- Calculator documentation
- Quick reference materials
- API guides

### 📂 docs/status-reports/
**Status updates and completion reports**
- Platform status
- Phase completion reports
- Feature completion summaries
- Implementation status

### 📂 docs/testing/
**Testing guides and results**
- Test scripts
- Testing guides (CRSC, DD214, scanners)
- AI test results
- Manual test procedures

### 📂 docs/scanners/
**Scanner-specific documentation**
- DD214 scanner
- VBMS scanner
- Document scanner validation
- Scanner system fixes

### 📂 docs/architecture/
**Architecture and design documents**
- Architecture diagrams
- Code patterns
- Module maps
- UI/UX blueprints
- App organization

### 📂 docs/deployment/
**Deployment and production guides**
- Production setup
- Production checklist
- Deployment guides
- Quick deploy

---

## 🔍 Finding Documentation

### By Topic

**Setting Up**
- See \`docs/guides/COMPLETE_SETUP_AND_STARTUP_GUIDE.md\`
- See \`docs/guides/QUICK_START.md\`

**Scanners**
- See \`docs/scanners/\` folder
- See \`docs/guides/SCANNER_API_COMPLETE_GUIDE.md\`

**Implementation Details**
- See \`docs/implementation/\` folder

**Testing**
- See \`docs/testing/\` folder

**Architecture**
- See \`docs/architecture/\` folder

**Status & Progress**
- See \`docs/status-reports/\` folder

---

## 📊 Statistics

- **Total Files Organized**: $movedCount
- **Folders Created**: $($folders.Keys.Count)
- **Categories**: 6 main categories

---

**Root README**: See [README.md](../README.md) for project overview
"@

$indexPath = Join-Path $baseDir "docs/DOCUMENTATION_INDEX.md"
$indexContent | Out-File -FilePath $indexPath -Encoding UTF8
Write-Success "Created documentation index"

# Summary
Write-Header "`n📊 SUMMARY"
Write-Success "Files moved: $movedCount"
Write-Info "Files skipped: $skippedCount"
Write-Success "Organization complete!"

Write-Header "`n✅ DOCUMENTATION ORGANIZED"
Write-Info "See docs/DOCUMENTATION_INDEX.md for the new structure"

Write-Host ""
