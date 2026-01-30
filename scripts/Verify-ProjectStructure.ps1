#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verify Rally Forge Project Structure and Paths
.DESCRIPTION
    Validates that all project paths, scripts, and configurations reference
    the correct project structure at C:\Dev\Rally Forge
.EXAMPLE
    .\Verify-ProjectStructure.ps1
#>

$ErrorActionPreference = "Stop"
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Step { param([string]$Message); Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor }
function Write-Success { param([string]$Message); Write-Host "✓ $Message" -ForegroundColor $SuccessColor }
function Write-Error { param([string]$Message); Write-Host "✗ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param([string]$Message); Write-Host "⚠ $Message" -ForegroundColor $WarningColor }

$results = @{
    passed = 0
    failed = 0
    warnings = 0
}

Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Rally Forge Project Structure Verification" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Verify we're in the correct directory
Write-Step "Verifying project root location..."
$currentPath = Get-Location
if ($currentPath.Path -like "*Rally Forge*") {
    Write-Success "Running from correct project root: $currentPath"
    $results.passed++
} else {
    Write-Error "Not in Rally Forge directory. Current: $currentPath"
    Write-Host "Expected: C:\Dev\Rally Forge" -ForegroundColor $WarningColor
    $results.failed++
}

# Verify critical directories exist
Write-Step "Verifying project structure..."
$requiredDirs = @(
    "rally-forge-backend",
    "rally-forge-frontend",
    "rally-forge-mobile",
    "rally-forge-shared",
    "scripts",
    "docs",
    "config",
    "ai-engine",
    "android"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Success "$dir/ exists"
        $results.passed++
    } else {
        Write-Warning "$dir/ not found"
        $results.warnings++
    }
}

# Verify critical files exist
Write-Step "Verifying configuration files..."
$requiredFiles = @(
    "docker-compose.prod.yml",
    ".env.production.example",
    ".gitignore",
    "package.json",
    "README.md",
    "PRODUCTION_ARCHITECTURE.md",
    "DEPLOYMENT_GUIDE.md",
    "DEPLOYMENT_CHECKLIST.md",
    "PROJECT_STRUCTURE.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file exists"
        $results.passed++
    } else {
        Write-Error "$file not found"
        $results.failed++
    }
}

# Verify scripts exist
Write-Step "Verifying deployment scripts..."
$requiredScripts = @(
    "scripts\Deploy-Docker.ps1",
    "scripts\Build-Android.ps1",
    "scripts\Build-iOS.sh",
    "scripts\Build-Desktop.ps1",
    "scripts\Validate-Deployment.ps1"
)

foreach ($script in $requiredScripts) {
    if (Test-Path $script) {
        Write-Success "$script exists"
        $results.passed++
    } else {
        Write-Error "$script not found"
        $results.failed++
    }
}

# Check for deprecated paths in key files
Write-Step "Scanning for deprecated path references..."
$deprecatedPatterns = @("VeteranApp", "C:\\VeteranApp", "/VeteranApp", "cd frontend", "cd backend", "cd mobile")
$filesToScan = @(
    "scripts\Deploy-Docker.ps1",
    "scripts\Build-Android.ps1",
    "scripts\Build-Desktop.ps1",
    "docker-compose.prod.yml",
    ".github\workflows\ci-cd.yml"
)

$foundIssues = $false
foreach ($file in $filesToScan) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        foreach ($pattern in $deprecatedPatterns) {
            if ($content -match [regex]::Escape($pattern)) {
                Write-Warning "Found '$pattern' in $file"
                $results.warnings++
                $foundIssues = $true
            }
        }
    }
}

if (-not $foundIssues) {
    Write-Success "No deprecated path references found in core scripts"
    $results.passed++
}

# Verify Docker Compose configuration
Write-Step "Verifying Docker Compose configuration..."
if (Test-Path "docker-compose.prod.yml") {
    $composeContent = Get-Content "docker-compose.prod.yml" -Raw

    if ($composeContent -match "rally-forge-backend") {
        Write-Success "Docker Compose uses correct backend path"
        $results.passed++
    } else {
        Write-Error "Docker Compose missing rally-forge-backend reference"
        $results.failed++
    }

    if ($composeContent -match "rally-forge-frontend") {
        Write-Success "Docker Compose uses correct frontend path"
        $results.passed++
    } else {
        Write-Error "Docker Compose missing rally-forge-frontend reference"
        $results.failed++
    }

    if ($composeContent -match "RallyForge") {
        Write-Success "Docker Compose uses correct naming convention"
        $results.passed++
    } else {
        Write-Warning "Docker Compose may use inconsistent naming"
        $results.warnings++
    }
}

# Verify Dockerfiles exist
Write-Step "Verifying Dockerfiles..."
$dockerfiles = @(
    "rally-forge-backend\Dockerfile",
    "rally-forge-frontend\Dockerfile"
)

foreach ($dockerfile in $dockerfiles) {
    if (Test-Path $dockerfile) {
        Write-Success "$dockerfile exists"
        $results.passed++
    } else {
        Write-Error "$dockerfile not found"
        $results.failed++
    }
}

# Check package.json for correct project name
Write-Step "Verifying package.json configuration..."
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.name -match "rally-forge" -or $packageJson.name -match "RallyForge") {
        Write-Success "package.json uses correct project name"
        $results.passed++
    } else {
        Write-Warning "package.json may have outdated name: $($packageJson.name)"
        $results.warnings++
    }
}

# Verify environment example file
Write-Step "Verifying environment template..."
if (Test-Path ".env.production.example") {
    $envContent = Get-Content ".env.production.example" -Raw

    if ($envContent -match "RallyForge") {
        Write-Success "Environment template uses correct naming"
        $results.passed++
    } else {
        Write-Warning "Environment template may have inconsistent naming"
        $results.warnings++
    }

    if ($envContent -match "DATABASE_URL.*RallyForge") {
        Write-Success "Database name configured correctly"
        $results.passed++
    } else {
        Write-Warning "Database URL may need updating"
        $results.warnings++
    }
}

# Check .gitignore for correct exclusions
Write-Step "Verifying .gitignore configuration..."
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw

    $requiredIgnores = @("*.env", "desktop/", "_archive/", "logs/", "*.exe", "*.zip")
    foreach ($ignore in $requiredIgnores) {
        if ($gitignoreContent -match [regex]::Escape($ignore)) {
            Write-Success ".gitignore includes $ignore"
            $results.passed++
        } else {
            Write-Warning ".gitignore missing $ignore"
            $results.warnings++
        }
    }
}

# Summary
Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Verification Summary" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "Passed:   $($results.passed)" -ForegroundColor $SuccessColor
Write-Host "Failed:   $($results.failed)" -ForegroundColor $ErrorColor
Write-Host "Warnings: $($results.warnings)" -ForegroundColor $WarningColor

$total = $results.passed + $results.failed + $results.warnings
$passRate = [math]::Round(($results.passed / $total) * 100, 2)
Write-Host "`nPass Rate: $passRate%" -ForegroundColor $InfoColor

# Final verdict
if ($results.failed -eq 0 -and $results.warnings -le 5) {
    Write-Host "`n✓ Project structure verification PASSED" -ForegroundColor $SuccessColor
    Write-Host "All critical paths and configurations are correct." -ForegroundColor $SuccessColor
    Write-Host "`nProject Root: C:\Dev\Rally Forge ✓" -ForegroundColor $SuccessColor
    exit 0
} elseif ($results.failed -eq 0) {
    Write-Host "`n⚠ Project structure verification passed with warnings" -ForegroundColor $WarningColor
    Write-Host "Review warnings above for potential improvements." -ForegroundColor $WarningColor
    exit 0
} else {
    Write-Host "`n✗ Project structure verification FAILED" -ForegroundColor $ErrorColor
    Write-Host "Fix the errors above before proceeding." -ForegroundColor $ErrorColor
    exit 1
}


