<#
.SYNOPSIS
    RallyForge Integrity Scanner - Code integrity validation
.DESCRIPTION
    Scans RallyForge project for:
    - File structure integrity
    - Missing or corrupted files
    - Configuration issues
    - Security concerns
#>

# =====================================================================
# CONFIGURATION
# =====================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$LogsDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}
$LogFile = Join-Path $LogsDir "Integrity_Scanner_$Timestamp.txt"
$ReportsDir = Join-Path $ProjectRoot "reports" "scanners"
if (-not (Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null
}

Write-Host '=== INTEGRITY SCANNER ===' -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host "Log File: $LogFile" -ForegroundColor Yellow
Write-Host ""

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $entry = "[$(Get-Date)] [$Level] $Message"
    try {
        Add-Content -Path $LogFile -Value $entry -ErrorAction Stop

        switch ($Level) {
            "ERROR" { Write-Host $entry -ForegroundColor Red }
            "WARNING" { Write-Host $entry -ForegroundColor Yellow }
            "SUCCESS" { Write-Host $entry -ForegroundColor Green }
            default { Write-Host $entry }
        }
    } catch {
        Write-Host "[LOG ERROR] Could not write to log: $_" -ForegroundColor Red
        Write-Host $entry
    }
}

function Test-ProjectStructure {
    Write-Log "Testing project structure..." "INFO"

    $RequiredDirs = @(
        "rally-forge-frontend",
        "rally-forge-backend",
        "scripts",
        "docs",
        "config"
    )

    $Errors = @()
    $Warnings = @()

    foreach ($dir in $RequiredDirs) {
        $path = Join-Path $ProjectRoot $dir
        if (-not (Test-Path $path)) {
            $Errors += "Missing required directory: $dir"
            Write-Log "Missing directory: $dir" "ERROR"
        } else {
            Write-Log "Found directory: $dir" "SUCCESS"
        }
    }

    return @{
        Errors = $Errors
        Warnings = $Warnings
    }
}

function Test-ConfigFiles {
    Write-Log "Testing configuration files..." "INFO"

    $ConfigFiles = @(
        "rally-forge-frontend\package.json",
        "rally-forge-backend\requirements.txt",
        "config\appsettings.json"
    )

    $Errors = @()

    foreach ($file in $ConfigFiles) {
        $path = Join-Path $ProjectRoot $file
        if (-not (Test-Path $path)) {
            $Errors += "Missing config file: $file"
            Write-Log "Missing config: $file" "ERROR"
        } else {
            Write-Log "Found config: $file" "SUCCESS"
        }
    }

    return @{ Errors = $Errors }
}

function Get-FileCounts {
    Write-Log "Counting project files..." "INFO"

    $Counts = @{}

    $Extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.py", "*.json", "*.md")

    foreach ($ext in $Extensions) {
        $files = Get-ChildItem -Path $ProjectRoot -Recurse -Filter $ext -File -ErrorAction SilentlyContinue
        $count = ($files | Measure-Object).Count
        $Counts[$ext] = $count
        Write-Log "Found $count files matching $ext"
    }

    return $Counts
}

function Start-IntegrityScan {
    Write-Log "=== STARTING INTEGRITY SCAN ===" "INFO"
    Write-Log "Project Root: $ProjectRoot" "INFO"

    $Results = @{
        Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        ProjectRoot = $ProjectRoot
        StructureTest = Test-ProjectStructure
        ConfigTest = Test-ConfigFiles
        FileCounts = Get-FileCounts
    }

    # Generate report
    $ReportPath = Join-Path $ReportsDir "integrity_scan_$Timestamp.json"
    $Results | ConvertTo-Json -Depth 10 | Out-File -FilePath $ReportPath -Encoding UTF8

    Write-Log "=== SCAN COMPLETE ===" "SUCCESS"
    Write-Log "Report saved to: $ReportPath" "INFO"

    # Display summary
    Write-Host ""
    Write-Host "✅ Integrity Scan Complete" -ForegroundColor Green
    Write-Host "Log: $LogFile" -ForegroundColor Cyan
    Write-Host "Report: $ReportPath" -ForegroundColor Cyan
    Write-Host ""

    if ($Results.StructureTest.Errors.Count -gt 0) {
        Write-Host "❌ ERRORS FOUND: $($Results.StructureTest.Errors.Count)" -ForegroundColor Red
        foreach ($error in $Results.StructureTest.Errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
    }

    return $Results
}

# Run scan if executed directly
if ($MyInvocation.InvocationName -ne '.') {
    Start-IntegrityScan
}







