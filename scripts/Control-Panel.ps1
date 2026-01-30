#Requires -Version 5.1
<#
.SYNOPSIS
    Rally Forge - Master Control Panel
    Central automation framework for diagnostics, repair, backup, and deployment

.DESCRIPTION
    Unified control system implementing the automation framework from ARCHITECTURE.md
    - Diagnostics Engine: Health checks and environment validation
    - Repair Engine: Auto-healing and issue resolution
    - Backup Manager: Database and configuration backups
    - Next-Step Engine: Guided workflow for users
    - Environment Validation: Verify all dependencies

.EXAMPLE
    .\Control-Panel.ps1 -Action Diagnostics
    .\Control-Panel.ps1 -Action Repair
    .\Control-Panel.ps1 -Action Backup
    .\Control-Panel.ps1 -Action NextSteps
    .\Control-Panel.ps1 -Action FullCheck
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Diagnostics', 'Repair', 'Backup', 'NextSteps', 'FullCheck', 'Menu')]
    [string]$Action = 'Menu',

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Configuration
$Config = @{
    ProjectName = 'Rally Forge'
    Version = '1.0.0'
    RootPath = Split-Path -Parent $PSScriptRoot
    LogPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'logs'
    BackupPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'Backups'
    DiagnosticsPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'diagnostics'
}

# Ensure log directory exists
if (-not (Test-Path $Config.LogPath)) {
    New-Item -ItemType Directory -Path $Config.LogPath -Force | Out-Null
}

$LogFile = Join-Path $Config.LogPath "control-panel_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $logMessage

    switch ($Level) {
        'ERROR' { Write-Host $Message -ForegroundColor Red }
        'WARNING' { Write-Host $Message -ForegroundColor Yellow }
        'SUCCESS' { Write-Host $Message -ForegroundColor Green }
        'INFO' { Write-Host $Message -ForegroundColor Cyan }
        default { Write-Host $Message }
    }
}

function Show-Menu {
    Clear-Host
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║       Rally Forge - MASTER CONTROL PANEL v$($Config.Version)       ║" -ForegroundColor Cyan
    Write-Host "║          The Ultimate Veteran-First Platform              ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. 🔍 Run Diagnostics" -ForegroundColor Green
    Write-Host "  2. 🔧 Run Repair Engine" -ForegroundColor Yellow
    Write-Host "  3. 💾 Create Backup" -ForegroundColor Magenta
    Write-Host "  4. 🎯 Next Steps Guide" -ForegroundColor Cyan
    Write-Host "  5. ✅ Full System Check (All)" -ForegroundColor White
    Write-Host "  6. 📊 View System Status" -ForegroundColor Blue
    Write-Host "  0. ❌ Exit" -ForegroundColor Red
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Gray
}

function Invoke-Diagnostics {
    Write-Log "═══ DIAGNOSTICS ENGINE STARTED ═══" "INFO"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Checks = @()
    }

    # Check 1: Node.js
    Write-Log "Checking Node.js installation..." "INFO"
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Log "✓ Node.js: $nodeVersion" "SUCCESS"
            $results.Passed++
            $results.Checks += @{ Name = "Node.js"; Status = "PASS"; Details = $nodeVersion }
        } else {
            throw "Not found"
        }
    } catch {
        Write-Log "✗ Node.js not found" "ERROR"
        $results.Failed++
        $results.Checks += @{ Name = "Node.js"; Status = "FAIL"; Details = "Not installed" }
    }

    # Check 2: Python
    Write-Log "Checking Python installation..." "INFO"
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            Write-Log "✓ Python: $pythonVersion" "SUCCESS"
            $results.Passed++
            $results.Checks += @{ Name = "Python"; Status = "PASS"; Details = $pythonVersion }
        } else {
            throw "Not found"
        }
    } catch {
        Write-Log "✗ Python not found" "ERROR"
        $results.Failed++
        $results.Checks += @{ Name = "Python"; Status = "FAIL"; Details = "Not installed" }
    }

    # Check 3: Frontend folder
    Write-Log "Checking frontend structure..." "INFO"
    $frontendPath = Join-Path $Config.RootPath 'rally-forge-frontend'
    if (Test-Path $frontendPath) {
        Write-Log "✓ Frontend folder exists" "SUCCESS"
        $results.Passed++
        $results.Checks += @{ Name = "Frontend"; Status = "PASS"; Details = "Folder exists" }
    } else {
        Write-Log "✗ Frontend folder missing" "ERROR"
        $results.Failed++
        $results.Checks += @{ Name = "Frontend"; Status = "FAIL"; Details = "Folder not found" }
    }

    # Check 4: Backend folder
    Write-Log "Checking backend structure..." "INFO"
    $backendPath = Join-Path $Config.RootPath 'rally-forge-backend'
    if (Test-Path $backendPath) {
        Write-Log "✓ Backend folder exists" "SUCCESS"
        $results.Passed++
        $results.Checks += @{ Name = "Backend"; Status = "PASS"; Details = "Folder exists" }
    } else {
        Write-Log "✗ Backend folder missing" "ERROR"
        $results.Failed++
        $results.Checks += @{ Name = "Backend"; Status = "FAIL"; Details = "Folder not found" }
    }

    # Check 5: package.json files
    Write-Log "Checking package.json files..." "INFO"
    $rootPackageJson = Join-Path $Config.RootPath 'package.json'
    if (Test-Path $rootPackageJson) {
        Write-Log "✓ Root package.json exists" "SUCCESS"
        $results.Passed++
    } else {
        Write-Log "⚠ Root package.json missing" "WARNING"
        $results.Warnings++
    }

    # Check 6: Database schema
    Write-Log "Checking database schema..." "INFO"
    $schemaPath = Join-Path $Config.RootPath 'data\schema.sql'
    if (Test-Path $schemaPath) {
        Write-Log "✓ Database schema exists" "SUCCESS"
        $results.Passed++
        $results.Checks += @{ Name = "Database Schema"; Status = "PASS"; Details = "schema.sql found" }
    } else {
        Write-Log "✗ Database schema missing" "ERROR"
        $results.Failed++
        $results.Checks += @{ Name = "Database Schema"; Status = "FAIL"; Details = "schema.sql not found" }
    }

    # Summary
    Write-Log "`n═══ DIAGNOSTICS SUMMARY ═══" "INFO"
    Write-Log "Passed:   $($results.Passed)" "SUCCESS"
    Write-Log "Warnings: $($results.Warnings)" "WARNING"
    Write-Log "Failed:   $($results.Failed)" "ERROR"

    return $results
}

function Invoke-Repair {
    Write-Log "═══ REPAIR ENGINE STARTED ═══" "INFO"

    # Run diagnostics first
    $diagnostics = Invoke-Diagnostics

    if ($diagnostics.Failed -eq 0) {
        Write-Log "No issues detected. System is healthy!" "SUCCESS"
        return
    }

    Write-Log "`nAttempting repairs..." "INFO"

    # Repair: Install missing Node modules
    $frontendPath = Join-Path $Config.RootPath 'rally-forge-frontend'
    $nodeModulesPath = Join-Path $frontendPath 'node_modules'
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Log "Installing frontend dependencies..." "INFO"
        try {
            Push-Location $frontendPath
            npm install 2>&1 | Out-Null
            Pop-Location
            Write-Log "✓ Frontend dependencies installed" "SUCCESS"
        } catch {
            Write-Log "✗ Failed to install frontend dependencies" "ERROR"
            Pop-Location
        }
    }

    # Repair: Install Python requirements
    $backendPath = Join-Path $Config.RootPath 'rally-forge-backend'
    $requirementsPath = Join-Path $backendPath 'requirements.txt'
    if (Test-Path $requirementsPath) {
        Write-Log "Installing Python dependencies..." "INFO"
        try {
            Push-Location $backendPath
            python -m pip install -r requirements.txt 2>&1 | Out-Null
            Pop-Location
            Write-Log "✓ Python dependencies installed" "SUCCESS"
        } catch {
            Write-Log "✗ Failed to install Python dependencies" "ERROR"
            Pop-Location
        }
    }

    Write-Log "`n═══ REPAIR COMPLETE ═══" "SUCCESS"
}

function Invoke-Backup {
    Write-Log "═══ BACKUP MANAGER STARTED ═══" "INFO"

    # Ensure backup directory exists
    if (-not (Test-Path $Config.BackupPath)) {
        New-Item -ItemType Directory -Path $Config.BackupPath -Force | Out-Null
    }

    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupFolder = Join-Path $Config.BackupPath "backup_$timestamp"
    New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

    # Backup 1: Database schema
    $schemaPath = Join-Path $Config.RootPath 'data\schema.sql'
    if (Test-Path $schemaPath) {
        Copy-Item -Path $schemaPath -Destination $backupFolder -Force
        Write-Log "✓ Database schema backed up" "SUCCESS"
    }

    # Backup 2: Configuration files
    $configPath = Join-Path $Config.RootPath 'config'
    if (Test-Path $configPath) {
        Copy-Item -Path $configPath -Destination $backupFolder -Recurse -Force
        Write-Log "✓ Configuration files backed up" "SUCCESS"
    }

    # Backup 3: Environment files
    $envFiles = Get-ChildItem -Path $Config.RootPath -Filter '.env*' -File
    foreach ($envFile in $envFiles) {
        Copy-Item -Path $envFile.FullName -Destination $backupFolder -Force
    }
    Write-Log "✓ Environment files backed up" "SUCCESS"

    Write-Log "`nBackup saved to: $backupFolder" "INFO"
    Write-Log "═══ BACKUP COMPLETE ═══" "SUCCESS"
}

function Show-NextSteps {
    Write-Log "═══ NEXT STEPS GUIDE ═══" "INFO"

    Write-Host "`n📋 RECOMMENDED NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    Write-Host "1. 🚀 Start Development Environment:" -ForegroundColor Green
    Write-Host "   npm run dev:all" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 🧪 Run Tests:" -ForegroundColor Green
    Write-Host "   npm run test           (Frontend)" -ForegroundColor White
    Write-Host "   npm run test:backend   (Backend)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 📦 Build for Production:" -ForegroundColor Green
    Write-Host "   npm run build" -ForegroundColor White
    Write-Host ""
    Write-Host "4. 📚 View Documentation:" -ForegroundColor Green
    Write-Host "   See: docs\GETTING-STARTED.md" -ForegroundColor White
    Write-Host "   See: docs\ARCHITECTURE.md" -ForegroundColor White
    Write-Host ""
    Write-Host "5. 🔐 Configure Environment:" -ForegroundColor Green
    Write-Host "   Edit: rally-forge-backend\.env" -ForegroundColor White
    Write-Host ""
}

function Invoke-FullCheck {
    Write-Log "═══ FULL SYSTEM CHECK ═══" "INFO"
    Invoke-Diagnostics
    Write-Host ""
    Invoke-Backup
    Write-Host ""
    Show-NextSteps
}

function Show-SystemStatus {
    Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║          SYSTEM STATUS OVERVIEW               ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Project: $($Config.ProjectName) v$($Config.Version)" -ForegroundColor White
    Write-Host "Root: $($Config.RootPath)" -ForegroundColor Gray
    Write-Host ""

    # Quick checks
    $frontendExists = Test-Path (Join-Path $Config.RootPath 'rally-forge-frontend')
    $backendExists = Test-Path (Join-Path $Config.RootPath 'rally-forge-backend')

    Write-Host "Frontend: " -NoNewline
    Write-Host $(if ($frontendExists) { "✓ Present" } else { "✗ Missing" }) -ForegroundColor $(if ($frontendExists) { "Green" } else { "Red" })

    Write-Host "Backend:  " -NoNewline
    Write-Host $(if ($backendExists) { "✓ Present" } else { "✗ Missing" }) -ForegroundColor $(if ($backendExists) { "Green" } else { "Red" })

    Write-Host ""
}

# Main execution
try {
    Write-Log "Rally Forge Control Panel started" "INFO"
    Write-Log "Action: $Action" "INFO"

    switch ($Action) {
        'Diagnostics' { Invoke-Diagnostics }
        'Repair' { Invoke-Repair }
        'Backup' { Invoke-Backup }
        'NextSteps' { Show-NextSteps }
        'FullCheck' { Invoke-FullCheck }
        'Menu' {
            do {
                Show-Menu
                $choice = Read-Host "Select an option"

                switch ($choice) {
                    '1' { Invoke-Diagnostics; Pause }
                    '2' { Invoke-Repair; Pause }
                    '3' { Invoke-Backup; Pause }
                    '4' { Show-NextSteps; Pause }
                    '5' { Invoke-FullCheck; Pause }
                    '6' { Show-SystemStatus; Pause }
                    '0' { Write-Log "Exiting..." "INFO"; break }
                    default { Write-Host "Invalid option" -ForegroundColor Red; Pause }
                }
            } while ($choice -ne '0')
        }
    }

    Write-Log "Control Panel completed successfully" "SUCCESS"
}
catch {
    Write-Log "Control Panel error: $_" "ERROR"
    Write-Log $_.ScriptStackTrace "ERROR"
    exit 1
}

function Pause {
    Write-Host "`nPress any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

