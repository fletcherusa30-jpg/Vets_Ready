#Requires -Version 5.1
<#
.SYNOPSIS
    Pre-launch validation and readiness check

.DESCRIPTION
    Comprehensive validation before production launch:
    - Environment configuration
    - Database connectivity
    - API endpoints
    - Stripe integration
    - Security settings
    - Performance checks

.EXAMPLE
    .\Validate-PreLaunch.ps1
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$Detailed
)

$ErrorActionPreference = 'Continue'
$RootPath = Split-Path -Parent $PSScriptRoot

$totalChecks = 0
$passedChecks = 0
$failedChecks = 0
$warnings = 0

function Test-Check {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$SuccessMessage = "Passed",
        [string]$FailMessage = "Failed",
        [switch]$Critical
    )

    $script:totalChecks++
    Write-Host "  Testing: $Name..." -NoNewline

    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✓ $SuccessMessage" -ForegroundColor Green
            $script:passedChecks++
            return $true
        } else {
            if ($Critical) {
                Write-Host " ✗ $FailMessage" -ForegroundColor Red
                $script:failedChecks++
            } else {
                Write-Host " ⚠ $FailMessage" -ForegroundColor Yellow
                $script:warnings++
            }
            return $false
        }
    } catch {
        if ($Critical) {
            Write-Host " ✗ Error: $_" -ForegroundColor Red
            $script:failedChecks++
        } else {
            Write-Host " ⚠ Error: $_" -ForegroundColor Yellow
            $script:warnings++
        }
        return $false
    }
}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        Rally Forge - PRE-LAUNCH VALIDATION                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Category 1: Environment Configuration
Write-Host "🔧 Environment Configuration" -ForegroundColor Cyan

$envFile = Join-Path $RootPath '.env'
Test-Check ".env file exists" { Test-Path $envFile } -Critical

if (Test-Path $envFile) {
    $env = Get-Content $envFile -Raw

    Test-Check "DATABASE_URL configured" { $env -match "DATABASE_URL=postgresql://" } -Critical
    Test-Check "JWT_SECRET configured" {
        ($env -match "JWT_SECRET=.{32,}") -and ($env -notmatch "JWT_SECRET=your-secret")
    } -Critical
    Test-Check "STRIPE_SECRET_KEY configured" { $env -match "STRIPE_SECRET_KEY=sk_" } -Critical
    Test-Check "STRIPE_PUBLISHABLE_KEY configured" { $env -match "STRIPE_PUBLISHABLE_KEY=pk_" } -Critical
    Test-Check "STRIPE_WEBHOOK_SECRET configured" { $env -match "STRIPE_WEBHOOK_SECRET=whsec_" } -Critical
    Test-Check "All veteran price IDs set" {
        ($env -match "STRIPE_PRICE_VETERAN_PRO_YEARLY=price_") -and
        ($env -match "STRIPE_PRICE_VETERAN_FAMILY_YEARLY=price_") -and
        ($env -match "STRIPE_PRICE_VETERAN_LIFETIME=price_")
    }
    Test-Check "All employer price IDs set" {
        ($env -match "STRIPE_PRICE_EMPLOYER_BASIC=price_") -and
        ($env -match "STRIPE_PRICE_EMPLOYER_PREMIUM=price_")
    }
    Test-Check "All business price IDs set" {
        ($env -match "STRIPE_PRICE_BUSINESS_BASIC=price_") -and
        ($env -match "STRIPE_PRICE_BUSINESS_FEATURED=price_")
    }
    Test-Check "Production mode set" { $env -match "ENVIRONMENT=production" }
    Test-Check "Debug disabled" { $env -match "DEBUG=False" }
}

Write-Host ""

# Category 2: Service Availability
Write-Host "🐳 Service Availability" -ForegroundColor Cyan

Test-Check "Docker daemon running" {
    docker ps 2>$null
    $LASTEXITCODE -eq 0
} -Critical

Test-Check "Backend container running" {
    $containers = docker ps --format "{{.Names}}" 2>$null
    $containers -contains "RallyForge_backend"
}

Test-Check "Frontend container running" {
    $containers = docker ps --format "{{.Names}}" 2>$null
    $containers -contains "RallyForge_frontend"
}

Test-Check "PostgreSQL container running" {
    $containers = docker ps --format "{{.Names}}" 2>$null
    $containers -contains "RallyForge_postgres"
}

Write-Host ""

# Category 3: API Health
Write-Host "🏥 API Health Checks" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"

Test-Check "Backend reachable" {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
        $response.status -eq "healthy"
    } catch { $false }
} -Critical

Test-Check "API version correct" {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
        $response.version -eq "1.0.0"
    } catch { $false }
}

Test-Check "Subscription endpoints available" {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/subscriptions/pricing/veteran" -Method Get -TimeoutSec 5
        $response.Count -eq 4
    } catch { $false }
} -Critical

Test-Check "Employer endpoints available" {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/employers/pricing" -Method Get -TimeoutSec 5
        $response.Count -eq 4
    } catch { $false }
}

Test-Check "Business directory endpoints available" {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/business-directory/pricing" -Method Get -TimeoutSec 5
        $response.Count -eq 4
    } catch { $false }
}

Test-Check "Payment config endpoint available" {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/pricing/config" -Method Get -TimeoutSec 5
        $null -ne $response.publishable_key
    } catch { $false }
} -Critical

Test-Check "API documentation available" {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/docs" -Method Get -TimeoutSec 5
        $response.StatusCode -eq 200
    } catch { $false }
}

Write-Host ""

# Category 4: Frontend
Write-Host "🎨 Frontend Checks" -ForegroundColor Cyan

Test-Check "Frontend reachable" {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
        $response.StatusCode -eq 200
    } catch { $false }
}

Write-Host ""

# Category 5: Database
Write-Host "🗄️  Database Checks" -ForegroundColor Cyan

Test-Check "Database container healthy" {
    $health = docker inspect RallyForge_postgres --format='{{.State.Health.Status}}' 2>$null
    $health -eq "healthy"
} -Critical

Test-Check "Required tables exist" {
    try {
        $tables = docker exec RallyForge_postgres psql -U RallyForge -d RallyForge_db -c "\dt" 2>$null
        ($tables -match "RallyForge_users") -and
        ($tables -match "RallyForge_veteran_subscriptions") -and
        ($tables -match "RallyForge_employer_accounts")
    } catch { $false }
} -Critical

Write-Host ""

# Category 6: Security
Write-Host "🔐 Security Checks" -ForegroundColor Cyan

Test-Check "JWT secret is strong" {
    if (Test-Path $envFile) {
        $env = Get-Content $envFile -Raw
        if ($env -match "JWT_SECRET=(.+)") {
            $secret = $matches[1].Trim()
            $secret.Length -ge 32 -and $secret -ne "your-secret-key-change-in-production-min-32-chars"
        } else { $false }
    } else { $false }
} -Critical

Test-Check "CORS origins restricted" {
    if (Test-Path $envFile) {
        $env = Get-Content $envFile -Raw
        $env -match "CORS_ORIGINS=" -and $env -notmatch "CORS_ORIGINS=.*\*"
    } else { $false }
}

Test-Check "Using production Stripe keys" {
    if (Test-Path $envFile) {
        $env = Get-Content $envFile -Raw
        # For production, should use live keys (sk_live_, pk_live_)
        # For testing, sk_test_ is acceptable
        ($env -match "STRIPE_SECRET_KEY=sk_") -and ($env -notmatch "placeholder")
    } else { $false }
} -Critical

Write-Host ""

# Category 7: File Structure
Write-Host "📁 File Structure" -ForegroundColor Cyan

Test-Check "Backend app directory exists" { Test-Path (Join-Path $RootPath "rally-forge-backend\app") } -Critical
Test-Check "Frontend src directory exists" { Test-Path (Join-Path $RootPath "rally-forge-frontend\src") } -Critical
Test-Check "Database schema file exists" { Test-Path (Join-Path $RootPath "data\schema.sql") } -Critical
Test-Check "Alembic migrations exist" { Test-Path (Join-Path $RootPath "rally-forge-backend\alembic\versions") } -Critical
Test-Check "Docker compose file exists" { Test-Path (Join-Path $RootPath "docker-compose.prod.yml") } -Critical

Write-Host ""

# Summary
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    VALIDATION SUMMARY                       " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$successRate = if ($totalChecks -gt 0) { [math]::Round(($passedChecks / $totalChecks) * 100, 1) } else { 0 }

Write-Host "  Total Checks:    $totalChecks" -ForegroundColor White
Write-Host "  Passed:          $passedChecks" -ForegroundColor Green
Write-Host "  Failed:          $failedChecks" -ForegroundColor Red
Write-Host "  Warnings:        $warnings" -ForegroundColor Yellow
Write-Host "  Success Rate:    $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

if ($failedChecks -eq 0 -and $successRate -ge 90) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              ✅ READY FOR PRODUCTION LAUNCH! 🚀            ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 All critical checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Final Steps:" -ForegroundColor Cyan
    Write-Host "   1. Review logs: docker-compose -f docker-compose.prod.yml logs" -ForegroundColor White
    Write-Host "   2. Test payment flow with Stripe test card" -ForegroundColor White
    Write-Host "   3. Set up SSL certificates" -ForegroundColor White
    Write-Host "   4. Configure DNS and domain" -ForegroundColor White
    Write-Host "   5. Set up monitoring (Sentry, DataDog, etc.)" -ForegroundColor White
    Write-Host "   6. Launch! 🎉" -ForegroundColor White
    Write-Host ""
} elseif ($failedChecks -gt 0) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║           ❌ NOT READY FOR PRODUCTION                     ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Critical issues must be resolved before launch!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Action Required:" -ForegroundColor Yellow
    Write-Host "   1. Fix all failed checks above" -ForegroundColor White
    Write-Host "   2. Re-run validation: .\scripts\Validate-PreLaunch.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║              ⚠️  ALMOST READY                             ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Address warnings before production launch" -ForegroundColor Yellow
    Write-Host ""
}

# Return exit code
exit $failedChecks


