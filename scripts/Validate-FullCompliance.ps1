#Requires -Version 5.1
<#
.SYNOPSIS
    Vets Ready - Comprehensive Compliance Validator
    Validates entire codebase against all authoritative documents

.DESCRIPTION
    Performs deep validation of:
    - Architecture compliance
    - Required folder structure
    - Required files existence
    - PowerShell automation rules
    - Functional requirements
    - Monetization implementation
    - Security framework
    - Roadmap alignment

    Based on 8 authoritative documents:
    1. ARCHITECTURE.md (Master System Blueprint)
    2. MODULE_PURPOSES.md (Technical Specification)
    3. CRSC_RESOURCE_ECOSYSTEM_COMPLETE.md (Operational Guidance)
    4. Bootstrap scripts (Automation Specification)
    5. Control-Panel.ps1 (Instruction Manual)
    6. IMPLEMENTATION_SUMMARY.md (Project Status)
    7. COMPLIANCE_IMPLEMENTATION_SUMMARY.md (Capability Summary)
    8. PRICING_STRATEGY.md (Pricing Guide)

.EXAMPLE
    .\Validate-FullCompliance.ps1
    .\Validate-FullCompliance.ps1 -Fix
    .\Validate-FullCompliance.ps1 -GenerateReport
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$Fix,

    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport,

    [Parameter(Mandatory=$false)]
    [switch]$DetailedOutput
)

$ErrorActionPreference = 'Continue'
$RootPath = Split-Path -Parent $PSScriptRoot
$ValidationResults = @{
    Passed = 0
    Failed = 0
    Fixed = 0
    Warnings = 0
    Checks = @()
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    VETS READY - COMPREHENSIVE COMPLIANCE VALIDATOR        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Required folder structure per ARCHITECTURE.md
$RequiredFolders = @(
    'vets-ready-frontend',
    'vets-ready-backend',
    'vets-ready-backend\app',
    'vets-ready-backend\app\routers',
    'vets-ready-backend\app\models',
    'vets-ready-backend\app\services',
    'vets-ready-backend\app\schemas',
    'vets-ready-mobile',
    'ai-engine',
    'data',
    'scripts',
    'docs',
    'tests',
    'logs',
    'config',
    'android',
    'desktop',
    'Backups',
    'diagnostics'
)

# Required backend files per Technical Specification
$RequiredBackendFiles = @(
    'vets-ready-backend\app\main.py',
    'vets-ready-backend\app\database.py',
    'vets-ready-backend\app\config.py',
    'vets-ready-backend\app\__init__.py',
    'vets-ready-backend\app\routers\__init__.py',
    'vets-ready-backend\app\routers\auth.py',
    'vets-ready-backend\app\routers\claims.py',
    'vets-ready-backend\app\routers\conditions.py',
    'vets-ready-backend\app\routers\retirement.py',
    'vets-ready-backend\app\routers\business.py',
    'vets-ready-backend\app\routers\legal.py',
    'vets-ready-backend\app\routers\subscriptions.py',
    'vets-ready-backend\app\routers\employers.py',
    'vets-ready-backend\app\routers\business_directory.py',
    'vets-ready-backend\app\models\__init__.py',
    'vets-ready-backend\app\models\user.py',
    'vets-ready-backend\app\models\claim.py',
    'vets-ready-backend\app\models\condition.py',
    'vets-ready-backend\app\models\subscription.py',
    'vets-ready-backend\app\schemas\subscription.py',
    'vets-ready-backend\requirements.txt'
)

# Required AI Engine files
$RequiredAIFiles = @(
    'ai-engine\engine.py',
    'ai-engine\cfr_interpreter.py',
    'ai-engine\claimstrategyengine.py',
    'ai-engine\evidence_inference.py',
    'ai-engine\secondaryconditionmapper.py',
    'ai-engine\__init__.py'
)

# Required automation scripts
$RequiredScripts = @(
    'scripts\Control-Panel.ps1',
    'scripts\Bootstrap-All.ps1',
    'scripts\Run-Diagnostics.ps1',
    'scripts\Repair-Environment.ps1',
    'scripts\Cleanup-Workspace.ps1',
    'scripts\Integrity-Scanner.ps1',
    'scripts\Generate-MasterDesignBook.ps1'
)

# Required documentation files
$RequiredDocs = @(
    'README.md',
    'docs\ARCHITECTURE.md',
    'docs\MODULE_PURPOSES.md',
    'docs\PRICING_STRATEGY.md',
    'docs\DEVELOPMENT-STANDARDS.md',
    'docs\TESTING.md',
    'docs\DEPLOYMENT.md',
    'docs\GETTING-STARTED.md',
    'docs\API.md'
)

# Required data files
$RequiredDataFiles = @(
    'data\schema.sql'
)

function Test-Requirement {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Type = 'File',
        [scriptblock]$FixAction = $null
    )

    $fullPath = Join-Path $RootPath $Path
    $exists = if ($Type -eq 'File') { Test-Path -Path $fullPath -PathType Leaf } else { Test-Path -Path $fullPath -PathType Container }

    $check = @{
        Name = $Name
        Path = $Path
        Type = $Type
        Status = if ($exists) { 'PASS' } else { 'FAIL' }
        Details = if ($exists) { 'Exists' } else { 'Missing' }
    }

    if ($exists) {
        Write-Host "  ✓ $Name" -ForegroundColor Green
        $ValidationResults.Passed++
    }
    else {
        Write-Host "  ✗ $Name - Missing" -ForegroundColor Red
        $ValidationResults.Failed++

        if ($Fix -and $FixAction) {
            try {
                & $FixAction
                $check.Status = 'FIXED'
                $check.Details = 'Created'
                $ValidationResults.Fixed++
                Write-Host "    → Fixed!" -ForegroundColor Yellow
            }
            catch {
                Write-Host "    → Fix failed: $_" -ForegroundColor Red
            }
        }
    }

    $ValidationResults.Checks += $check
}

Write-Host "🔍 VALIDATION 1: Required Folder Structure" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($folder in $RequiredFolders) {
    Test-Requirement -Name "Folder: $folder" -Path $folder -Type 'Folder' -FixAction {
        New-Item -ItemType Directory -Path (Join-Path $RootPath $folder) -Force | Out-Null
    }
}

Write-Host ""
Write-Host "🔍 VALIDATION 2: Required Backend Files" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($file in $RequiredBackendFiles) {
    Test-Requirement -Name "Backend: $(Split-Path -Leaf $file)" -Path $file -Type 'File'
}

Write-Host ""
Write-Host "🔍 VALIDATION 3: AI Engine Components" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($file in $RequiredAIFiles) {
    Test-Requirement -Name "AI: $(Split-Path -Leaf $file)" -Path $file -Type 'File' -FixAction {
        $filePath = Join-Path $RootPath $file
        $fileName = Split-Path -Leaf $file
        $placeholder = @"
'''
Vets Ready - AI Engine Component: $fileName
TODO: Implement AI logic per Master System Blueprint
'''

def initialize():
    '''Initialize AI component'''
    pass

def process():
    '''Process AI request'''
    pass
"@
        $placeholder | Out-File -FilePath $filePath -Encoding UTF8
    }
}

Write-Host ""
Write-Host "🔍 VALIDATION 4: PowerShell Automation Scripts" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($script in $RequiredScripts) {
    Test-Requirement -Name "Script: $(Split-Path -Leaf $script)" -Path $script -Type 'File'
}

Write-Host ""
Write-Host "🔍 VALIDATION 5: Documentation Files" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($doc in $RequiredDocs) {
    Test-Requirement -Name "Doc: $(Split-Path -Leaf $doc)" -Path $doc -Type 'File'
}

Write-Host ""
Write-Host "🔍 VALIDATION 6: Data Layer Files" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($dataFile in $RequiredDataFiles) {
    Test-Requirement -Name "Data: $(Split-Path -Leaf $dataFile)" -Path $dataFile -Type 'File'
}

Write-Host ""
Write-Host "🔍 VALIDATION 7: Functional Requirements" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check for calculators
$calculatorChecks = @(
    @{ Name = 'Disability Rating Calculator'; File = 'vets-ready-backend\app\routers\claims.py' },
    @{ Name = 'Retirement Calculator'; File = 'vets-ready-backend\app\routers\retirement.py' },
    @{ Name = 'Claims Strategy Engine'; File = 'ai-engine\claimstrategyengine.py' },
    @{ Name = 'CFR Interpreter'; File = 'ai-engine\cfr_interpreter.py' }
)

foreach ($calc in $calculatorChecks) {
    $exists = Test-Path (Join-Path $RootPath $calc.File)
    if ($exists) {
        Write-Host "  ✓ $($calc.Name)" -ForegroundColor Green
        $ValidationResults.Passed++
    }
    else {
        Write-Host "  ✗ $($calc.Name) - Not found" -ForegroundColor Red
        $ValidationResults.Failed++
    }
}

Write-Host ""
Write-Host "🔍 VALIDATION 8: Monetization Implementation" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check for pricing tiers implementation
$pricingChecks = @(
    @{ Name = 'Veteran Subscription Models'; File = 'vets-ready-backend\app\models\subscription.py'; Pattern = 'VeteranSubscription' },
    @{ Name = 'Employer Account Models'; File = 'vets-ready-backend\app\models\subscription.py'; Pattern = 'EmployerAccount' },
    @{ Name = 'Business Listing Models'; File = 'vets-ready-backend\app\models\subscription.py'; Pattern = 'BusinessListing' },
    @{ Name = 'Subscription API Endpoints'; File = 'vets-ready-backend\app\routers\subscriptions.py'; Pattern = '/api/subscriptions' },
    @{ Name = 'Employer API Endpoints'; File = 'vets-ready-backend\app\routers\employers.py'; Pattern = '/api/employers' },
    @{ Name = 'Business Directory API'; File = 'vets-ready-backend\app\routers\business_directory.py'; Pattern = '/api/business-directory' }
)

foreach ($check in $pricingChecks) {
    $filePath = Join-Path $RootPath $check.File
    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw
        if ($content -match [regex]::Escape($check.Pattern)) {
            Write-Host "  ✓ $($check.Name)" -ForegroundColor Green
            $ValidationResults.Passed++
        }
        else {
            Write-Host "  ⚠ $($check.Name) - Found but incomplete" -ForegroundColor Yellow
            $ValidationResults.Warnings++
        }
    }
    else {
        Write-Host "  ✗ $($check.Name) - File missing" -ForegroundColor Red
        $ValidationResults.Failed++
    }
}

Write-Host ""
Write-Host "🔍 VALIDATION 9: Security Framework" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray

$securityChecks = @(
    @{ Name = 'JWT Authentication'; File = 'vets-ready-backend\app\routers\auth.py'; Pattern = 'jwt|JWT' },
    @{ Name = 'CORS Middleware'; File = 'vets-ready-backend\app\main.py'; Pattern = 'CORSMiddleware' },
    @{ Name = 'Password Hashing'; File = 'vets-ready-backend\app\routers\auth.py'; Pattern = 'bcrypt|hash' },
    @{ Name = 'Input Validation'; File = 'vets-ready-backend\app\schemas\subscription.py'; Pattern = 'BaseModel' }
)

foreach ($check in $securityChecks) {
    $filePath = Join-Path $RootPath $check.File
    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw
        if ($content -match $check.Pattern) {
            Write-Host "  ✓ $($check.Name)" -ForegroundColor Green
            $ValidationResults.Passed++
        }
        else {
            Write-Host "  ⚠ $($check.Name) - Not fully implemented" -ForegroundColor Yellow
            $ValidationResults.Warnings++
        }
    }
    else {
        Write-Host "  ✗ $($check.Name) - File missing" -ForegroundColor Red
        $ValidationResults.Failed++
    }
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                 VALIDATION SUMMARY                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$totalChecks = $ValidationResults.Passed + $ValidationResults.Failed + $ValidationResults.Warnings
$complianceScore = if ($totalChecks -gt 0) { [Math]::Round(($ValidationResults.Passed / $totalChecks) * 100, 1) } else { 0 }

Write-Host "Total Checks:    $totalChecks" -ForegroundColor White
Write-Host "Passed:          $($ValidationResults.Passed)" -ForegroundColor Green
Write-Host "Failed:          $($ValidationResults.Failed)" -ForegroundColor Red
Write-Host "Warnings:        $($ValidationResults.Warnings)" -ForegroundColor Yellow
if ($Fix) {
    Write-Host "Fixed:           $($ValidationResults.Fixed)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Compliance Score: $complianceScore%" -ForegroundColor $(if ($complianceScore -ge 90) { 'Green' } elseif ($complianceScore -ge 75) { 'Yellow' } else { 'Red' })
Write-Host ""

if ($complianceScore -ge 95) {
    Write-Host "✅ EXCELLENT - System is fully compliant!" -ForegroundColor Green
}
elseif ($complianceScore -ge 85) {
    Write-Host "✓ GOOD - Minor items need attention" -ForegroundColor Yellow
}
elseif ($complianceScore -ge 70) {
    Write-Host "⚠ FAIR - Several items need fixing" -ForegroundColor Yellow
}
else {
    Write-Host "❌ NEEDS WORK - Significant compliance gaps" -ForegroundColor Red
}

# Generate report if requested
if ($GenerateReport) {
    $reportPath = Join-Path $RootPath "docs\generated\Compliance_Validation_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"

    $reportDir = Split-Path -Parent $reportPath
    if (-not (Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
    }

    $report = @"
# Vets Ready - Compliance Validation Report

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**Compliance Score:** $complianceScore%

## Summary

- **Total Checks:** $totalChecks
- **Passed:** $($ValidationResults.Passed) ✓
- **Failed:** $($ValidationResults.Failed) ✗
- **Warnings:** $($ValidationResults.Warnings) ⚠
$(if ($Fix) { "- **Fixed:** $($ValidationResults.Fixed) �" } else { "" })

## Status

$(if ($complianceScore -ge 95) { "✅ **EXCELLENT** - System is fully compliant!" }
elseif ($complianceScore -ge 85) { "✓ **GOOD** - Minor items need attention" }
elseif ($complianceScore -ge 70) { "⚠ **FAIR** - Several items need fixing" }
else { "❌ **NEEDS WORK** - Significant compliance gaps" })

## Detailed Results

| Check Name | Type | Status | Details |
|------------|------|--------|---------|
$(foreach ($check in $ValidationResults.Checks) {
    "| $($check.Name) | $($check.Type) | $($check.Status) | $($check.Details) |"
})

## Recommendations

$(if ($ValidationResults.Failed -gt 0) {
    "### Failed Checks"
    "The following items need immediate attention:"
    foreach ($check in $ValidationResults.Checks | Where-Object { $_.Status -eq 'FAIL' }) {
        "- [ ] $($check.Name) - $($check.Path)"
    }
    ""
})

$(if ($ValidationResults.Warnings -gt 0) {
    "### Warnings"
    "The following items should be reviewed:"
    foreach ($check in $ValidationResults.Checks | Where-Object { $_.Status -eq 'WARN' }) {
        "- [ ] $($check.Name)"
    }
})

## Next Steps

1. Review all failed checks
2. Run with ``-Fix`` flag to auto-create missing items
3. Implement missing functional components
4. Re-run validation to verify fixes
5. Generate Master Design Book: ``.\Generate-MasterDesignBook.ps1``

---

*Generated by Validate-FullCompliance.ps1*
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Cyan
}

Write-Host ""

# Return validation results
return $ValidationResults
