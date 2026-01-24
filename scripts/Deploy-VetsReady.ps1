#Requires -Version 5.1
<#
.SYNOPSIS
    Automated deployment script for Vets Ready

.DESCRIPTION
    Automates the deployment process including:
    - Environment validation
    - Database setup
    - Stripe configuration check
    - Docker deployment
    - Health verification

.EXAMPLE
    .\Deploy-VetsReady.ps1
    .\Deploy-VetsReady.ps1 -Environment Production
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Development', 'Staging', 'Production')]
    [string]$Environment = 'Development',

    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

# Configuration
$RootPath = Split-Path -Parent $PSScriptRoot
$BackendPath = Join-Path $RootPath 'vets-ready-backend'
$FrontendPath = Join-Path $RootPath 'vets-ready-frontend'
$EnvFile = Join-Path $RootPath '.env'
$LogFile = Join-Path $RootPath "logs\deployment_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Colors
$Success = "Green"
$Warning = "Yellow"
$Error = "Red"
$Info = "Cyan"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $logMessage
}

function Test-Prerequisite {
    param([string]$Name, [string]$Command)

    Write-Host "  Checking $Name..." -NoNewline
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Host " ✓" -ForegroundColor $Success
        return $true
    } else {
        Write-Host " ✗" -ForegroundColor $Error
        return $false
    }
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Info
Write-Host "║         VETS READY - AUTOMATED DEPLOYMENT                 ║" -ForegroundColor $Info
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Info
Write-Host ""
Write-Log "Starting deployment for environment: $Environment" $Info

# Step 1: Prerequisites Check
Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor $Info
$prereqsPassed = $true

$prereqsPassed = $prereqsPassed -and (Test-Prerequisite "Docker" "docker")
$prereqsPassed = $prereqsPassed -and (Test-Prerequisite "Docker Compose" "docker-compose")
$prereqsPassed = $prereqsPassed -and (Test-Prerequisite "Python" "python")
$prereqsPassed = $prereqsPassed -and (Test-Prerequisite "Node.js" "node")
$prereqsPassed = $prereqsPassed -and (Test-Prerequisite "Git" "git")

if (-not $prereqsPassed -and -not $Force) {
    Write-Log "❌ Prerequisites check failed. Install missing tools or use -Force to continue." $Error
    exit 1
}

Write-Host ""

# Step 2: Environment File Check
Write-Host "📝 Step 2: Validating Environment Configuration..." -ForegroundColor $Info

if (-not (Test-Path $EnvFile)) {
    Write-Log "  Creating .env from template..." $Warning
    Copy-Item (Join-Path $RootPath '.env.example') $EnvFile
    Write-Log "  ⚠ .env file created. Please configure before continuing!" $Warning
    Write-Host ""
    Write-Host "Required configuration:" -ForegroundColor $Warning
    Write-Host "  1. Set DATABASE_URL" -ForegroundColor $Warning
    Write-Host "  2. Generate JWT_SECRET: python -c 'import secrets; print(secrets.token_urlsafe(32))'" -ForegroundColor $Warning
    Write-Host "  3. Add Stripe keys from dashboard.stripe.com" -ForegroundColor $Warning
    Write-Host ""

    if (-not $Force) {
        $continue = Read-Host "Configure .env now and press Enter to continue (or 'exit' to quit)"
        if ($continue -eq 'exit') { exit 0 }
    }
}

# Validate critical environment variables
$envContent = Get-Content $EnvFile -Raw
$criticalVars = @(
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY'
)

$missingVars = @()
foreach ($var in $criticalVars) {
    if ($envContent -notmatch "$var=.+") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0 -and -not $Force) {
    Write-Log "  ❌ Missing required environment variables:" $Error
    foreach ($var in $missingVars) {
        Write-Host "     - $var" -ForegroundColor $Error
    }
    exit 1
}

Write-Log "  ✓ Environment configuration validated" $Success
Write-Host ""

# Step 3: Database Setup
Write-Host "🗄️  Step 3: Setting Up Database..." -ForegroundColor $Info

try {
    Push-Location $BackendPath

    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-Log "  Creating Python virtual environment..." $Info
        python -m venv venv
    }

    # Activate virtual environment
    Write-Log "  Activating virtual environment..." $Info
    & ".\venv\Scripts\Activate.ps1"

    # Install dependencies
    Write-Log "  Installing Python dependencies..." $Info
    pip install -q -r requirements.txt
    pip install -q alembic stripe

    # Run migrations
    Write-Log "  Running database migrations..." $Info
    alembic upgrade head

    Write-Log "  ✓ Database setup complete" $Success

} catch {
    Write-Log "  ⚠ Database setup failed: $_" $Warning
    if (-not $Force) { exit 1 }
} finally {
    Pop-Location
}

Write-Host ""

# Step 4: Run Tests (if not skipped)
if (-not $SkipTests) {
    Write-Host "🧪 Step 4: Running Tests..." -ForegroundColor $Info

    try {
        Push-Location $BackendPath
        Write-Log "  Running backend tests..." $Info
        pytest tests/ -v --maxfail=3
        Write-Log "  ✓ All tests passed" $Success
    } catch {
        Write-Log "  ⚠ Some tests failed" $Warning
        if (-not $Force) { exit 1 }
    } finally {
        Pop-Location
    }
} else {
    Write-Log "⏭️  Step 4: Tests skipped" $Warning
}

Write-Host ""

# Step 5: Build and Deploy
Write-Host "🐳 Step 5: Building and Deploying Containers..." -ForegroundColor $Info

try {
    Push-Location $RootPath

    # Stop existing containers
    Write-Log "  Stopping existing containers..." $Info
    docker-compose -f docker-compose.prod.yml down 2>$null

    # Build containers
    Write-Log "  Building Docker images..." $Info
    docker-compose -f docker-compose.prod.yml build

    # Start containers
    Write-Log "  Starting services..." $Info
    docker-compose -f docker-compose.prod.yml up -d

    Write-Log "  ✓ Containers deployed successfully" $Success

} catch {
    Write-Log "  ❌ Deployment failed: $_" $Error
    exit 1
} finally {
    Pop-Location
}

Write-Host ""

# Step 6: Health Check
Write-Host "🏥 Step 6: Verifying Service Health..." -ForegroundColor $Info

Write-Log "  Waiting for services to start (30 seconds)..." $Info
Start-Sleep -Seconds 30

$maxRetries = 5
$retryCount = 0
$healthy = $false

while ($retryCount -lt $maxRetries -and -not $healthy) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5

        if ($response.status -eq "healthy") {
            $healthy = $true
            Write-Log "  ✓ Backend is healthy" $Success
            Write-Log "    Version: $($response.version)" $Info
            Write-Log "    Environment: $($response.environment)" $Info
        }
    } catch {
        $retryCount++
        Write-Log "  Retry $retryCount/$maxRetries..." $Warning
        Start-Sleep -Seconds 10
    }
}

if (-not $healthy) {
    Write-Log "  ❌ Health check failed after $maxRetries retries" $Error
    Write-Log "  Check logs: docker-compose -f docker-compose.prod.yml logs backend" $Warning
    exit 1
}

Write-Host ""

# Step 7: Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $Success
Write-Host "║              DEPLOYMENT SUCCESSFUL! 🎉                     ║" -ForegroundColor $Success
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $Success
Write-Host ""

Write-Host "📍 Service URLs:" -ForegroundColor $Info
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor $Success
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor $Success
Write-Host "   API Docs:    http://localhost:8000/docs" -ForegroundColor $Success
Write-Host "   Health:      http://localhost:8000/health" -ForegroundColor $Success
Write-Host ""

Write-Host "📊 Container Status:" -ForegroundColor $Info
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor $Info
Write-Host "   1. Configure Stripe products and webhooks" -ForegroundColor $Warning
Write-Host "   2. Test payment flow in Stripe test mode" -ForegroundColor $Warning
Write-Host "   3. Set up SSL certificates for production" -ForegroundColor $Warning
Write-Host "   4. Configure monitoring and alerts" -ForegroundColor $Warning
Write-Host ""

Write-Host "💡 Useful Commands:" -ForegroundColor $Info
Write-Host "   View logs:    docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor $Info
Write-Host "   Stop:         docker-compose -f docker-compose.prod.yml down" -ForegroundColor $Info
Write-Host "   Restart:      docker-compose -f docker-compose.prod.yml restart" -ForegroundColor $Info
Write-Host ""

Write-Log "Deployment completed successfully!" $Success
Write-Log "Log file: $LogFile" $Info
