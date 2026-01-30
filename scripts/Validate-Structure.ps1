# Validate-Structure.ps1
# Validates the complete Rally Forge project structure
# Checks for required folders, files, and configurations
# Provides integrity report and remediation suggestions

param(
    [switch]$Fix,
    [switch]$Detailed,
    [switch]$CreateMissing
)

$ErrorActionPreference = "Continue"
$ProjectRoot = "c:\Dev\Rally Forge"

# Expected structure based on guidance documents
$ExpectedStructure = @{
    Folders = @(
        "rally-forge-frontend",
        "rally-forge-frontend\src",
        "rally-forge-frontend\src\pages",
        "rally-forge-frontend\src\components",
        "rally-forge-frontend\src\components\layout",
        "rally-forge-frontend\budget",
        "rally-forge-frontend\retirement",
        "rally-forge-frontend\transition",
        "rally-forge-frontend\jobboard",
        "rally-forge-frontend\outreach",
        "rally-forge-backend",
        "rally-forge-backend\app",
        "rally-forge-backend\app\routers",
        "rally-forge-backend\app\services",
        "rally-forge-backend\app\models",
        "rally-forge-backend\app\schemas",
        "rally-forge-backend\ai-engine",
        "rally-forge-mobile",
        "scripts",
        "docs",
        "config",
        "data",
        "logs",
        "SQL"
    )

    CriticalFiles = @(
        "rally-forge-frontend\package.json",
        "rally-forge-frontend\vite.config.ts",
        "rally-forge-frontend\App.tsx",
        "rally-forge-backend\app\main.py",
        "rally-forge-backend\app\database.py",
        "rally-forge-backend\requirements.txt",
        "README.md",
        "package.json"
    )

    RouterFiles = @(
        "rally-forge-backend\app\routers\auth.py",
        "rally-forge-backend\app\routers\claims.py",
        "rally-forge-backend\app\routers\retirement.py",
        "rally-forge-backend\app\routers\business.py",
        "rally-forge-backend\app\routers\legal.py",
        "rally-forge-backend\app\routers\subscriptions.py",
        "rally-forge-backend\app\routers\employers.py"
    )

    PageFiles = @(
        "rally-forge-frontend\pages\HomePage.tsx",
        "rally-forge-frontend\pages\BenefitsPage.tsx",
        "rally-forge-frontend\pages\ClaimsPage.tsx",
        "rally-forge-frontend\pages\TransitionPage.tsx",
        "rally-forge-frontend\pages\FinancePage.tsx",
        "rally-forge-frontend\pages\JobsBusinessPage.tsx"
    )

    ScriptFiles = @(
        "scripts\Initialize-Environment.ps1",
        "scripts\Build-Frontend.ps1",
        "scripts\Run-Backend.ps1",
        "scripts\Bootstrap-All.ps1",
        "Start-RallyForge.ps1",
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
        "rally-forge-frontend\.env",
        "rally-forge-backend\.env",
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
    $tsFiles = Get-ChildItem -Path (Join-Path $ProjectRoot "rally-forge-frontend") -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue
    $tsxCount = ($tsFiles | Measure-Object).Count

    # Count Python files
    $pyFiles = Get-ChildItem -Path (Join-Path $ProjectRoot "rally-forge-backend") -Filter "*.py" -Recurse -ErrorAction SilentlyContinue
    $pyCount = ($pyFiles | Measure-Object).Count

    # Count routers
    $routerPath = Join-Path $ProjectRoot "rally-forge-backend\app\routers"
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
Write-Host "║       Rally Forge - Project Structure Validator            ║" -ForegroundColor Cyan
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


