#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete Deployment Validation for Rally Forge
.DESCRIPTION
    Validates all aspects of the deployment including Docker, environment variables, connectivity, and health checks
.PARAMETER Environment
    Environment to validate: local, staging, or production
.EXAMPLE
    .\Validate-Deployment.ps1 -Environment production
#>

param(
    [ValidateSet("local", "staging", "production")]
    [string]$Environment = "local",
    [string]$ApiUrl,
    [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Step { param([string]$Message); Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor }
function Write-Success { param([string]$Message); Write-Host "✓ $Message" -ForegroundColor $SuccessColor }
function Write-Error { param([string]$Message); Write-Host "✗ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param([string]$Message); Write-Host "⚠ $Message" -ForegroundColor $WarningColor }

$validationResults = @{
    passed = 0
    failed = 0
    warnings = 0
}

Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Rally Forge Deployment Validation" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "Environment: $Environment" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Determine API URL
if (-not $ApiUrl) {
    $ApiUrl = switch ($Environment) {
        "local" { "http://localhost:8000" }
        "staging" { "https://api-staging.RallyForge.com" }
        "production" { "https://api.RallyForge.com" }
    }
}

# 1. Validate Docker Installation
Write-Step "Validating Docker installation..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker installed: $dockerVersion"
    $validationResults.passed++
} catch {
    Write-Error "Docker not installed or not running"
    $validationResults.failed++
}

# 2. Validate Docker Compose
Write-Step "Validating Docker Compose..."
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose installed: $composeVersion"
    $validationResults.passed++
} catch {
    Write-Warning "Docker Compose not found (may use 'docker compose' instead)"
    $validationResults.warnings++
}

# 3. Validate Environment File
Write-Step "Validating environment configuration..."
$envFile = if ($Environment -eq "local") { ".env" } else { ".env.$Environment" }

if (Test-Path $envFile) {
    Write-Success "Environment file found: $envFile"
    $validationResults.passed++

    # Check critical variables
    $envContent = Get-Content $envFile -Raw
    $criticalVars = @(
        "DATABASE_URL",
        "JWT_SECRET",
        "STRIPE_SECRET_KEY",
        "STRIPE_PUBLISHABLE_KEY"
    )

    foreach ($var in $criticalVars) {
        if ($envContent -match "$var=.+") {
            $value = ($envContent -split "`n" | Where-Object { $_ -match "^$var=" }) -replace "^$var=", ""
            if ($value -match "CHANGE|YOUR_|GENERATE") {
                Write-Warning "$var contains placeholder value"
                $validationResults.warnings++
            } else {
                Write-Success "$var is configured"
                $validationResults.passed++
            }
        } else {
            Write-Error "$var not found in $envFile"
            $validationResults.failed++
        }
    }
} else {
    Write-Error "Environment file not found: $envFile"
    $validationResults.failed++
}

# 4. Validate Docker Images (if local)
if ($Environment -eq "local") {
    Write-Step "Validating Docker images..."

    $backendImage = docker images RallyForge/rally-forge-backend:latest -q
    if ($backendImage) {
        Write-Success "Backend Docker image found"
        $validationResults.passed++
    } else {
        Write-Warning "Backend Docker image not built locally"
        $validationResults.warnings++
    }

    $frontendImage = docker images RallyForge/rally-forge-frontend:latest -q
    if ($frontendImage) {
        Write-Success "Frontend Docker image found"
        $validationResults.passed++
    } else {
        Write-Warning "Frontend Docker image not built locally"
        $validationResults.warnings++
    }
}

# 5. Validate Running Containers
Write-Step "Checking running containers..."
$runningContainers = docker ps --format "{{.Names}}" 2>$null
if ($runningContainers) {
    $RallyForgeContainers = $runningContainers | Where-Object { $_ -match "vets|ready" }
    if ($RallyForgeContainers) {
        Write-Success "Found $($RallyForgeContainers.Count) running Rally Forge containers"
        foreach ($container in $RallyForgeContainers) {
            Write-Host "  - $container" -ForegroundColor $InfoColor
        }
        $validationResults.passed++
    } else {
        Write-Warning "No Rally Forge containers running"
        $validationResults.warnings++
    }
} else {
    Write-Warning "No Docker containers running"
    $validationResults.warnings++
}

# 6. Health Check Endpoints
if (-not $SkipHealthCheck) {
    Write-Step "Testing API health endpoint..."
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get -TimeoutSec 10
        Write-Success "API health check passed: $($response | ConvertTo-Json -Compress)"
        $validationResults.passed++
    } catch {
        Write-Error "API health check failed: $_"
        $validationResults.failed++
    }

    Write-Step "Testing API docs endpoint..."
    try {
        $docsResponse = Invoke-WebRequest -Uri "$ApiUrl/docs" -Method Get -TimeoutSec 10 -UseBasicParsing
        if ($docsResponse.StatusCode -eq 200) {
            Write-Success "API documentation accessible"
            $validationResults.passed++
        }
    } catch {
        Write-Warning "API docs not accessible (may be disabled in production)"
        $validationResults.warnings++
    }
}

# 7. Database Connectivity (if containers running)
if ($runningContainers -match "postgres") {
    Write-Step "Testing database connectivity..."
    try {
        $dbTest = docker exec -it (docker ps -qf "name=postgres") pg_isready
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready"
            $validationResults.passed++
        }
    } catch {
        Write-Error "Database connectivity failed"
        $validationResults.failed++
    }
}

# 8. Network Connectivity
Write-Step "Validating Docker networks..."
$networks = docker network ls --format "{{.Name}}"
if ($networks -match "RallyForge") {
    Write-Success "Rally Forge Docker network exists"
    $validationResults.passed++
} else {
    Write-Warning "Rally Forge Docker network not found"
    $validationResults.warnings++
}

# 9. Volume Validation
Write-Step "Checking Docker volumes..."
$volumes = docker volume ls --format "{{.Name}}"
$RallyForgeVolumes = $volumes | Where-Object { $_ -match "vets|ready|postgres" }
if ($RallyForgeVolumes) {
    Write-Success "Found $($RallyForgeVolumes.Count) Rally Forge volumes"
    foreach ($vol in $RallyForgeVolumes) {
        Write-Host "  - $vol" -ForegroundColor $InfoColor
    }
    $validationResults.passed++
} else {
    Write-Warning "No Rally Forge volumes found"
    $validationResults.warnings++
}

# 10. Port Availability
Write-Step "Checking port availability..."
$requiredPorts = @(80, 8000, 5432)
foreach ($port in $requiredPorts) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Success "Port $port is accessible"
        $validationResults.passed++
    } else {
        Write-Warning "Port $port is not accessible"
        $validationResults.warnings++
    }
}

# Summary
Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Validation Summary" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "Passed: $($validationResults.passed)" -ForegroundColor $SuccessColor
Write-Host "Failed: $($validationResults.failed)" -ForegroundColor $ErrorColor
Write-Host "Warnings: $($validationResults.warnings)" -ForegroundColor $WarningColor

$totalChecks = $validationResults.passed + $validationResults.failed + $validationResults.warnings
$passRate = [math]::Round(($validationResults.passed / $totalChecks) * 100, 2)

Write-Host "`nPass Rate: $passRate%" -ForegroundColor $InfoColor

if ($validationResults.failed -eq 0 -and $validationResults.warnings -le 3) {
    Write-Host "`n✓ Deployment validation PASSED" -ForegroundColor $SuccessColor
    Write-Host "Your Rally Forge deployment is ready!" -ForegroundColor $SuccessColor
    exit 0
} elseif ($validationResults.failed -eq 0) {
    Write-Host "`n⚠ Deployment validation passed with warnings" -ForegroundColor $WarningColor
    Write-Host "Review warnings above and fix if necessary" -ForegroundColor $WarningColor
    exit 0
} else {
    Write-Host "`n✗ Deployment validation FAILED" -ForegroundColor $ErrorColor
    Write-Host "Fix the errors above before deploying" -ForegroundColor $ErrorColor
    exit 1
}


