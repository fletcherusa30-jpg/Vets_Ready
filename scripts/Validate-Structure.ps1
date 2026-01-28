# Validate-Structure.ps1
# Validates the complete Vets Ready project structure
# Checks for required folders, files, and configurations
# Provides integrity report and remediation suggestions

param(
    [switch]$Fix,
    [switch]$Detailed,
    [switch]$CreateMissing
)

$ErrorActionPreference = "Continue"
$ProjectRoot = "c:\Dev\Vets Ready"

# Expected structure based on guidance documents
$ExpectedStructure = @{
    Folders = @(
        "vets-ready-frontend",
        "vets-ready-frontend\src",
        "vets-ready-frontend\src\pages",
        "vets-ready-frontend\src\components",
        "vets-ready-frontend\src\components\layout",
        "vets-ready-frontend\budget",
        "vets-ready-frontend\retirement",
        "vets-ready-frontend\transition",
        "vets-ready-frontend\jobboard",
        "vets-ready-frontend\outreach",
        "vets-ready-backend",
        "vets-ready-backend\app",
        "vets-ready-backend\app\routers",
        "vets-ready-backend\app\services",
        "vets-ready-backend\app\models",
        "vets-ready-backend\app\schemas",
        "vets-ready-backend\ai-engine",
        "vets-ready-mobile",
        "scripts",
        "docs",
        "config",
        "data",
        "logs",
        "SQL"
    )

    CriticalFiles = @(
        "vets-ready-frontend\package.json",
        "vets-ready-frontend\vite.config.ts",
        "vets-ready-frontend\App.tsx",
        "vets-ready-backend\app\main.py",
        "vets-ready-backend\app\database.py",
        "vets-ready-backend\requirements.txt",
        "README.md",
        "package.json"
    )

    RouterFiles = @(
        "vets-ready-backend\app\routers\auth.py",
        "vets-ready-backend\app\routers\claims.py",
        "vets-ready-backend\app\routers\retirement.py",
        "vets-ready-backend\app\routers\business.py",
        "vets-ready-backend\app\routers\legal.py",
        "vets-ready-backend\app\routers\subscriptions.py",
        "vets-ready-backend\app\routers\employers.py"
    )

    PageFiles = @(
        "vets-ready-frontend\pages\HomePage.tsx",
        "vets-ready-frontend\pages\BenefitsPage.tsx",
        "vets-ready-frontend\pages\ClaimsPage.tsx",
        "vets-ready-frontend\pages\TransitionPage.tsx",
        "vets-ready-frontend\pages\FinancePage.tsx",
        "vets-ready-frontend\pages\JobsBusinessPage.tsx"
    )

    ScriptFiles = @(
        "scripts\Initialize-Environment.ps1",
        "scripts\Build-Frontend.ps1",
        "scripts\Run-Backend.ps1",
        "scripts\Bootstrap-All.ps1",
        "Start-VetsReady.ps1",
        "Start-All-Services.ps1"
    )
}

$script:MissingFolders = @()
$script:MissingFiles = @()
$script:FoundItems = 0
$script:MissingItems = 0

function Write-StatusMessage {
    param([string]$Message, [string]$Type = "Info")

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    switch ($Type) {
        "Success" { Write-Host "[$timestamp] ✓ $Message" -ForegroundColor Green }
        "Error"   { Write-Host "[$timestamp] ✗ $Message" -ForegroundColor Red }
        "Warning" { Write-Host "[$timestamp] ⚠ $Message" -ForegroundColor Yellow }
        "Info"    { Write-Host "[$timestamp] ℹ $Message" -ForegroundColor Cyan }
        "Found"   { Write-Host "[$timestamp] ✓ $Message" -ForegroundColor DarkGreen }
        "Missing" { Write-Host "[$timestamp] ✗ $Message" -ForegroundColor DarkRed }
    }
}

function Test-FolderStructure {
    Write-StatusMessage "Validating folder structure..." "Info"

    foreach ($folder in $ExpectedStructure.Folders) {
        $fullPath = Join-Path $ProjectRoot $folder

        if (Test-Path $fullPath) {
            if ($Detailed) {
                Write-StatusMessage "Found: $folder" "Found"
            }
            $script:FoundItems++
        }
        else {
            Write-StatusMessage "Missing: $folder" "Missing"
            $script:MissingFolders += $folder
            $script:MissingItems++

            if ($CreateMissing) {
                New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
                Write-StatusMessage "Created: $folder" "Success"
            }
        }
    }
}

function Test-CriticalFiles {
    Write-StatusMessage "Validating critical files..." "Info"

    $allFiles = $ExpectedStructure.CriticalFiles + $ExpectedStructure.RouterFiles + $ExpectedStructure.PageFiles + $ExpectedStructure.ScriptFiles

    foreach ($file in $allFiles) {
        $fullPath = Join-Path $ProjectRoot $file

        if (Test-Path $fullPath) {
            if ($Detailed) {
                Write-StatusMessage "Found: $file" "Found"
            }
            $script:FoundItems++
        }
        else {
            Write-StatusMessage "Missing: $file" "Missing"
            $script:MissingFiles += $file
            $script:MissingItems++
        }
    }
}

function Test-ConfigurationFiles {
    Write-StatusMessage "Checking configuration files..." "Info"

    $configs = @(
        "vets-ready-frontend\.env",
        "vets-ready-backend\.env",
        "config\appsettings.json"
    )

    foreach ($config in $configs) {
        $fullPath = Join-Path $ProjectRoot $config

        if (Test-Path $fullPath) {
            if ($Detailed) {
                Write-StatusMessage "Found: $config" "Found"
            }
            $script:FoundItems++
        }
        else {
            Write-StatusMessage "Missing: $config (may need configuration)" "Warning"

            # Check for .example file
            $examplePath = "$fullPath.example"
            if (Test-Path $examplePath) {
                Write-StatusMessage "Template available: $config.example" "Info"
            }
        }
    }
}

function Get-ProjectStatistics {
    Write-StatusMessage "Gathering project statistics..." "Info"

    # Count TypeScript files
    $tsFiles = Get-ChildItem -Path (Join-Path $ProjectRoot "vets-ready-frontend") -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue
    $tsxCount = ($tsFiles | Measure-Object).Count

    # Count Python files
    $pyFiles = Get-ChildItem -Path (Join-Path $ProjectRoot "vets-ready-backend") -Filter "*.py" -Recurse -ErrorAction SilentlyContinue
    $pyCount = ($pyFiles | Measure-Object).Count

    # Count routers
    $routerPath = Join-Path $ProjectRoot "vets-ready-backend\app\routers"
    if (Test-Path $routerPath) {
        $routers = Get-ChildItem -Path $routerPath -Filter "*.py" -File | Where-Object { $_.Name -ne "__init__.py" }
        $routerCount = ($routers | Measure-Object).Count
    }
    else {
        $routerCount = 0
    }

    return @{
        TypeScriptFiles = $tsxCount
        PythonFiles = $pyCount
        Routers = $routerCount
    }
}

function Write-IntegrityReport {
    param($Stats)

    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              Project Integrity Report                     ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

    # Summary statistics
    Write-Host "Project Statistics:" -ForegroundColor Cyan
    Write-Host "  - TypeScript/TSX files: $($Stats.TypeScriptFiles)" -ForegroundColor White
    Write-Host "  - Python files: $($Stats.PythonFiles)" -ForegroundColor White
    Write-Host "  - API Routers: $($Stats.Routers)" -ForegroundColor White
    Write-Host ""

    # Validation results
    $totalChecked = $script:FoundItems + $script:MissingItems
    $successRate = if ($totalChecked -gt 0) { [math]::Round(($script:FoundItems / $totalChecked) * 100, 2) } else { 0 }

    Write-Host "Structure Validation:" -ForegroundColor Cyan
    Write-Host "  - Items checked: $totalChecked" -ForegroundColor White
    Write-Host "  - Found: $($script:FoundItems)" -ForegroundColor Green
    Write-Host "  - Missing: $($script:MissingItems)" -ForegroundColor $(if ($script:MissingItems -eq 0) { "Green" } else { "Yellow" })
    Write-Host "  - Compliance: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 75) { "Yellow" } else { "Red" })
    Write-Host ""

    # Missing items detail
    if ($script:MissingFolders.Count -gt 0) {
        Write-Host "Missing Folders ($($script:MissingFolders.Count)):" -ForegroundColor Yellow
        foreach ($folder in $script:MissingFolders) {
            Write-Host "  ✗ $folder" -ForegroundColor DarkYellow
        }
        Write-Host ""
    }

    if ($script:MissingFiles.Count -gt 0) {
        Write-Host "Missing Files ($($script:MissingFiles.Count)):" -ForegroundColor Yellow
        foreach ($file in $script:MissingFiles) {
            Write-Host "  ✗ $file" -ForegroundColor DarkYellow
        }
        Write-Host ""
    }

    # Recommendations
    if ($script:MissingItems -gt 0) {
        Write-Host "Recommendations:" -ForegroundColor Cyan
        Write-Host "  - Run with -CreateMissing to auto-create missing folders" -ForegroundColor White
        Write-Host "  - Review missing files and create as needed" -ForegroundColor White
        Write-Host "  - Run Bootstrap-All.ps1 for complete project initialization" -ForegroundColor White
    }
    else {
        Write-Host "✓ Project structure is complete and compliant!" -ForegroundColor Green
    }

    Write-Host ""
}

# Main execution
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       Vets Ready - Project Structure Validator            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-StatusMessage "Project Root: $ProjectRoot" "Info"
Write-StatusMessage "Starting validation..." "Info"
Write-Host ""

# Run validations
Test-FolderStructure
Test-CriticalFiles
Test-ConfigurationFiles

# Get statistics
$stats = Get-ProjectStatistics

# Generate report
Write-IntegrityReport -Stats $stats

# Exit code
if ($script:MissingItems -eq 0) {
    exit 0
}
else {
    exit 1
}
