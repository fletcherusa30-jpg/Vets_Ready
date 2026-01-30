#Requires -Version 5.1
<#
.SYNOPSIS
    Seed database with initial data

.DESCRIPTION
    Loads seed data for:
    - Test users (admin, veteran, employer)
    - Sample conditions
    - Sample organizations
    - VSO partners

.PARAMETER SkipUsers
    Skip seeding test users

.PARAMETER SkipConditions
    Skip seeding medical conditions

.PARAMETER SkipOrganizations
    Skip seeding organizations

.EXAMPLE
    .\Seed-Database.ps1

.EXAMPLE
    .\Seed-Database.ps1 -SkipUsers
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$SkipUsers,

    [Parameter(Mandatory=$false)]
    [switch]$SkipConditions,

    [Parameter(Mandatory=$false)]
    [switch]$SkipOrganizations
)

$ErrorActionPreference = 'Stop'
$RootPath = Split-Path -Parent $PSScriptRoot

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Rally Forge - DATABASE SEEDER                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking backend availability..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
    if ($health.status -eq "healthy") {
        Write-Host "   ✓ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Backend not reachable. Start with: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Red
    exit 1
}

# Load environment
$envFile = Join-Path $RootPath '.env'
if (-not (Test-Path $envFile)) {
    Write-Host "   ✗ .env file not found!" -ForegroundColor Red
    exit 1
}

$baseUrl = "http://localhost:8000"

# Seed Users
if (-not $SkipUsers) {
    Write-Host ""
    Write-Host "👥 Seeding Test Users..." -ForegroundColor Cyan

    $users = @(
        @{
            email = "admin@RallyForge.com"
            password = "Admin123!"
            first_name = "System"
            last_name = "Administrator"
            user_type = "admin"
        },
        @{
            email = "veteran@test.com"
            password = "Veteran123!"
            first_name = "John"
            last_name = "Veteran"
            user_type = "veteran"
            military_branch = "Army"
            service_start_date = "2010-01-15"
            service_end_date = "2018-06-30"
            discharge_type = "Honorable"
        },
        @{
            email = "employer@test.com"
            password = "Employer123!"
            first_name = "Jane"
            last_name = "Employer"
            user_type = "employer"
        }
    )

    foreach ($user in $users) {
        try {
            $body = $user | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
            Write-Host "   ✓ Created user: $($user.email)" -ForegroundColor Green
        } catch {
            if ($_ -match "already exists" -or $_ -match "409") {
                Write-Host "   ⚠ User already exists: $($user.email)" -ForegroundColor Yellow
            } else {
                Write-Host "   ✗ Failed to create user $($user.email): $_" -ForegroundColor Red
            }
        }
    }
}

# Seed Conditions
if (-not $SkipConditions) {
    Write-Host ""
    Write-Host "🏥 Seeding Medical Conditions..." -ForegroundColor Cyan

    $conditionsFile = Join-Path $RootPath "data\seed_conditions.json"
    if (Test-Path $conditionsFile) {
        $conditions = Get-Content $conditionsFile -Raw | ConvertFrom-Json

        $veteranToken = $null
        try {
            # Get veteran user token
            $loginBody = @{
                email = "veteran@test.com"
                password = "Veteran123!"
            } | ConvertTo-Json

            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
            $veteranToken = $loginResponse.access_token
        } catch {
            Write-Host "   ⚠ Could not login as veteran user to seed conditions" -ForegroundColor Yellow
        }

        if ($veteranToken) {
            $headers = @{
                "Authorization" = "Bearer $veteranToken"
                "Content-Type" = "application/json"
            }

            $conditionCount = 0
            foreach ($condition in $conditions) {
                try {
                    $body = $condition | ConvertTo-Json
                    Invoke-RestMethod -Uri "$baseUrl/api/conditions" -Method Post -Body $body -Headers $headers -TimeoutSec 10
                    $conditionCount++
                } catch {
                    if ($_ -notmatch "already exists" -and $_ -notmatch "409") {
                        Write-Host "   ⚠ Warning: $($condition.name)" -ForegroundColor Yellow
                    }
                }
            }
            Write-Host "   ✓ Seeded $conditionCount medical conditions" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠ Conditions file not found: $conditionsFile" -ForegroundColor Yellow
    }
}

# Seed Organizations
if (-not $SkipOrganizations) {
    Write-Host ""
    Write-Host "🏢 Seeding Organizations..." -ForegroundColor Cyan

    $orgsFile = Join-Path $RootPath "data\seed_organizations.json"
    if (Test-Path $orgsFile) {
        $organizations = Get-Content $orgsFile -Raw | ConvertFrom-Json

        $adminToken = $null
        try {
            # Get admin user token
            $loginBody = @{
                email = "admin@RallyForge.com"
                password = "Admin123!"
            } | ConvertTo-Json

            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
            $adminToken = $loginResponse.access_token
        } catch {
            Write-Host "   ⚠ Could not login as admin user to seed organizations" -ForegroundColor Yellow
        }

        if ($adminToken) {
            $headers = @{
                "Authorization" = "Bearer $adminToken"
                "Content-Type" = "application/json"
            }

            $orgCount = 0
            foreach ($org in $organizations) {
                try {
                    $body = $org | ConvertTo-Json
                    Invoke-RestMethod -Uri "$baseUrl/api/organizations" -Method Post -Body $body -Headers $headers -TimeoutSec 10
                    $orgCount++
                } catch {
                    if ($_ -notmatch "already exists" -and $_ -notmatch "409") {
                        Write-Host "   ⚠ Warning: $($org.name)" -ForegroundColor Yellow
                    }
                }
            }
            Write-Host "   ✓ Seeded $orgCount organizations" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠ Organizations file not found: $orgsFile" -ForegroundColor Yellow
    }
}

# Seed VSO Partners
Write-Host ""
Write-Host "🤝 Seeding VSO Partners..." -ForegroundColor Cyan

$vsoPartners = @(
    @{
        name = "American Legion"
        tier = "PLATINUM"
        contact_email = "support@legion.org"
        is_active = $true
    },
    @{
        name = "Veterans of Foreign Wars (VFW)"
        tier = "PLATINUM"
        contact_email = "support@vfw.org"
        is_active = $true
    },
    @{
        name = "Disabled American Veterans (DAV)"
        tier = "GOLD"
        contact_email = "support@dav.org"
        is_active = $true
    },
    @{
        name = "Wounded Warrior Project"
        tier = "GOLD"
        contact_email = "support@woundedwarriorproject.org"
        is_active = $true
    }
)

try {
    # Get admin token if not already available
    if (-not $adminToken) {
        $loginBody = @{
            email = "admin@RallyForge.com"
            password = "Admin123!"
        } | ConvertTo-Json

        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
        $adminToken = $loginResponse.access_token
    }

    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }

    $vsoCount = 0
    foreach ($vso in $vsoPartners) {
        try {
            $body = $vso | ConvertTo-Json
            Invoke-RestMethod -Uri "$baseUrl/api/vso-partners" -Method Post -Body $body -Headers $headers -TimeoutSec 10
            $vsoCount++
        } catch {
            if ($_ -notmatch "already exists" -and $_ -notmatch "409") {
                Write-Host "   ⚠ Warning: $($vso.name)" -ForegroundColor Yellow
            }
        }
    }
    Write-Host "   ✓ Seeded $vsoCount VSO partners" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Could not seed VSO partners: $_" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                   SEEDING COMPLETE                          " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Test Accounts Created:" -ForegroundColor Cyan
Write-Host "   Admin:    admin@RallyForge.com    / Admin123!" -ForegroundColor White
Write-Host "   Veteran:  veteran@test.com       / Veteran123!" -ForegroundColor White
Write-Host "   Employer: employer@test.com      / Employer123!" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API:      http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
Write-Host ""


