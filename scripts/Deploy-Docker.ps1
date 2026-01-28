#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy Vets Ready to Docker Hub
.DESCRIPTION
    Builds all Docker images, tags them appropriately, and pushes to Docker Hub
.PARAMETER Version
    Version tag for the images (default: latest)
.PARAMETER Environment
    Environment configuration (development|staging|production)
.EXAMPLE
    .\Deploy-Docker.ps1 -Version "1.0.0" -Environment production
#>

param(
    [string]$Version = "latest",
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "production",
    [switch]$SkipTests,
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

# Colors
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Step { param([string]$Message); Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor }
function Write-Success { param([string]$Message); Write-Host "✓ $Message" -ForegroundColor $SuccessColor }
function Write-Error { param([string]$Message); Write-Host "✗ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param([string]$Message); Write-Host "⚠ $Message" -ForegroundColor $WarningColor }

Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Vets Ready Docker Deployment" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "Version: $Version" -ForegroundColor $InfoColor
Write-Host "Environment: $Environment" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Verify Docker is running
Write-Step "Verifying Docker..."
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop."
    exit 1
}

# Verify Docker Hub login
Write-Step "Checking Docker Hub authentication..."
$dockerUser = docker info 2>&1 | Select-String "Username"
if (-not $dockerUser) {
    Write-Warning "Not logged in to Docker Hub"
    Write-Host "Running docker login..." -ForegroundColor $WarningColor
    docker login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker login failed"
        exit 1
    }
}
Write-Success "Authenticated to Docker Hub"

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Step "Running tests..."

    # Backend tests
    Write-Host "Testing backend..." -ForegroundColor $WarningColor
    Push-Location vets-ready-backend
    python -m pytest tests/ -v
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Backend tests failed"
        exit 1
    }
    Pop-Location
    Write-Success "Backend tests passed"

    # Frontend tests
    Write-Host "Testing frontend..." -ForegroundColor $WarningColor
    Push-Location vets-ready-frontend
    npm test -- --run
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Warning "Frontend tests failed (continuing anyway)"
    } else {
        Write-Success "Frontend tests passed"
    }
    Pop-Location
}

# Build backend image
Write-Step "Building backend Docker image..."
docker build -t vetsready/vets-ready-backend:$Version `
             -t vetsready/vets-ready-backend:latest `
             ./vets-ready-backend

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend build failed"
    exit 1
}
Write-Success "Backend image built successfully"

# Build frontend image
Write-Step "Building frontend Docker image..."
$apiUrl = switch ($Environment) {
    "development" { "http://localhost:8000" }
    "staging" { "https://api-staging.vetsready.com" }
    "production" { "https://api.vetsready.com" }
}

docker build -t vetsready/vets-ready-frontend:$Version `
             -t vetsready/vets-ready-frontend:latest `
             --build-arg VITE_API_URL=$apiUrl `
             ./vets-ready-frontend

if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend build failed"
    exit 1
}
Write-Success "Frontend image built successfully"

# Verify images
Write-Step "Verifying built images..."
$backendImage = docker images vetsready/vets-ready-backend:$Version --format "{{.Repository}}:{{.Tag}}"
$frontendImage = docker images vetsready/vets-ready-frontend:$Version --format "{{.Repository}}:{{.Tag}}"

if (-not $backendImage -or -not $frontendImage) {
    Write-Error "Images not found after build"
    exit 1
}
Write-Success "Images verified"

# Push to Docker Hub (unless skipped)
if (-not $SkipPush) {
    Write-Step "Pushing images to Docker Hub..."

    # Push backend
    Write-Host "Pushing backend..." -ForegroundColor $WarningColor
    docker push vetsready/vets-ready-backend:$Version
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push backend:$Version"
        exit 1
    }

    if ($Version -ne "latest") {
        docker push vetsready/vets-ready-backend:latest
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to push backend:latest (continuing)"
        }
    }
    Write-Success "Backend pushed to Docker Hub"

    # Push frontend
    Write-Host "Pushing frontend..." -ForegroundColor $WarningColor
    docker push vetsready/vets-ready-frontend:$Version
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push frontend:$Version"
        exit 1
    }

    if ($Version -ne "latest") {
        docker push vetsready/vets-ready-frontend:latest
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to push frontend:latest (continuing)"
        }
    }
    Write-Success "Frontend pushed to Docker Hub"
}

# Summary
Write-Host "`n=====================================================" -ForegroundColor $SuccessColor
Write-Host "     Deployment Complete!" -ForegroundColor $SuccessColor
Write-Host "=====================================================" -ForegroundColor $SuccessColor
Write-Host "Backend: vetsready/vets-ready-backend:$Version" -ForegroundColor $InfoColor
Write-Host "Frontend: vetsready/vets-ready-frontend:$Version" -ForegroundColor $InfoColor

if (-not $SkipPush) {
    Write-Host "`nImages available on Docker Hub:" -ForegroundColor $InfoColor
    Write-Host "  https://hub.docker.com/r/vetsready/vets-ready-backend" -ForegroundColor $WarningColor
    Write-Host "  https://hub.docker.com/r/vetsready/vets-ready-frontend" -ForegroundColor $WarningColor
}

Write-Host "`nNext steps:" -ForegroundColor $InfoColor
Write-Host "  1. Verify images on Docker Hub" -ForegroundColor $WarningColor
Write-Host "  2. Deploy with docker-compose:" -ForegroundColor $WarningColor
Write-Host "     docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor $WarningColor
Write-Host "  3. Monitor deployment health checks" -ForegroundColor $WarningColor
