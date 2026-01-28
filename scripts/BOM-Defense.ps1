<#
.SYNOPSIS
    Ultimate BOM Defense System for VetsReady project.
.DESCRIPTION
    - Deep BOM scanner and cleaner
    - Real-time BOM watchdog
    - Process correlation engine
    - Environment hardening validator
    - Reporting engine
#>

# =====================================================================
# CONFIGURATION - MUST BE CORRECT FOR SCANNER TO WORK
# =====================================================================

# Determine project root dynamically
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "=== BOM DEFENSE SYSTEM ===" -ForegroundColor Cyan
Write-Host "Script Directory: $ScriptDir" -ForegroundColor Yellow
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host "Current Location: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Verify project root exists
if (-not (Test-Path $ProjectRoot)) {
    Write-Host "ERROR: Project root does not exist: $ProjectRoot" -ForegroundColor Red
    Write-Host "Please verify the path and try again." -ForegroundColor Red
    exit 1
}

$BackupRoot = Join-Path $ProjectRoot "BOM_Backups"
$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$LogsDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
    Write-Host "Created logs directory: $LogsDir" -ForegroundColor Green
}
$LogFile = Join-Path $LogsDir "BOM_Defense_Log_$Timestamp.txt"
$TargetExtensions = @("*.gradle","*.groovy","*.xml","*.kt","*.java","*.properties","*.json","*.js","*.ts","*.tsx","*.cfg","*.ini")
$BOM = 0xEF,0xBB,0xBF
$BOMEvents = @()

if (-not (Test-Path $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    Write-Host "Created backup directory: $BackupRoot" -ForegroundColor Green
}

Write-Host "Log file: $LogFile" -ForegroundColor Cyan
Write-Host ""

function Write-Log {
    param([string]$Message)
    $entry = "[$(Get-Date)] $Message"
    try {
        Add-Content -Path $LogFile -Value $entry -ErrorAction Stop
        Write-Host $entry
    } catch {
        Write-Host "[LOG ERROR] Could not write to log file: $_" -ForegroundColor Red
        Write-Host $entry
    }
}

function Remove-BOMFromFile {
    param([string]$FilePath)
    try {
        if (-not (Test-Path $FilePath)) {
            Write-Log "WARNING: File does not exist: $FilePath"
            return $false
        }

        $bytes = [System.IO.File]::ReadAllBytes($FilePath)

        if ($bytes.Length -ge 3 -and $bytes[0..2] -eq $BOM) {
            Write-Log "BOM detected in: $FilePath"

            $relPath = $FilePath.Substring($ProjectRoot.Length).TrimStart('\')
            $backupPath = Join-Path $BackupRoot $relPath
            $backupDir = Split-Path $backupPath

            if (-not (Test-Path $backupDir)) {
                New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
            }

            Copy-Item $FilePath "$backupPath.bak_$Timestamp" -Force

            $cleanBytes = $bytes[3..($bytes.Length - 1)]
            $content = [System.Text.Encoding]::UTF8.GetString($cleanBytes)
            [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.Encoding]::UTF8)

            Write-Log "BOM removed from: $FilePath (Backup: $backupPath.bak_$Timestamp)"
            return $true
        }
    } catch {
        Write-Log "ERROR removing BOM from $FilePath : $($_.Exception.Message)"
        Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor Red
        return $false
    }
    return $false
}

function Start-BOMScan {
    Write-Log "=== STARTING DEEP BOM SCAN ==="
    Write-Log "Project Root: $ProjectRoot"
    Write-Log "Target Extensions: $($TargetExtensions -join ', ')"

    if (-not (Test-Path $ProjectRoot)) {
        Write-Log "ERROR: Project root does not exist: $ProjectRoot"
        return
    }

    Write-Host "Scanning for files..." -ForegroundColor Cyan
    $files = Get-ChildItem -Path $ProjectRoot -Recurse -Include $TargetExtensions -File -ErrorAction SilentlyContinue

    $total = 0
    $removed = 0
    $fileCount = ($files | Measure-Object).Count

    Write-Log "Found $fileCount files to scan"
    Write-Host "Processing $fileCount files..." -ForegroundColor Cyan

    if ($fileCount -eq 0) {
        Write-Log "WARNING: No files found matching target extensions"
        Write-Host "This may indicate an incorrect project root or file filter" -ForegroundColor Yellow
        return
    }

    foreach ($file in $files) {
        $total++

        if ($total % 100 -eq 0) {
            Write-Host "Processed $total files..." -ForegroundColor Gray
        }

        if (Remove-BOMFromFile -FilePath $file.FullName) {
            $removed++
        }
    }

    Write-Log "=== SCAN COMPLETED ==="
    Write-Log "Total files scanned: $total"
    Write-Log "BOMs removed: $removed"
    Write-Host ""
    Write-Host "✅ Scan Complete" -ForegroundColor Green
    Write-Host "Files Scanned: $total" -ForegroundColor White
    Write-Host "BOMs Removed: $removed" -ForegroundColor White
    Write-Host "Log File: $LogFile" -ForegroundColor Cyan
    Write-Host ""
}

function Start-BOMWatchdog {
    Write-Log "Starting BOM Watchdog for $ProjectRoot"
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $ProjectRoot; $watcher.IncludeSubdirectories = $true; $watcher.EnableRaisingEvents = $true; $watcher.Filter = "*.*"

    Register-ObjectEvent $watcher Changed -Action {
        $ext = [System.IO.Path]::GetExtension($Event.SourceEventArgs.FullPath)
        if ($TargetExtensions -contains "*$ext") {
            if (Remove-BOMFromFile -FilePath $Event.SourceEventArgs.FullPath) {
                $procList = Get-Process | Select-Object ProcessName,Id
                $BOMEvents += [PSCustomObject]@{Time=Get-Date;File=$Event.SourceEventArgs.FullPath;Operation="Changed";Processes=$procList}
                Write-Log "BOM detected and removed during change: $($Event.SourceEventArgs.FullPath)"
            }
        }
    }

    Register-ObjectEvent $watcher Created -Action {
        $ext = [System.IO.Path]::GetExtension($Event.SourceEventArgs.FullPath)
        if ($TargetExtensions -contains "*$ext") {
            if (Remove-BOMFromFile -FilePath $Event.SourceEventArgs.FullPath) {
                $procList = Get-Process | Select-Object ProcessName,Id
                $BOMEvents += [PSCustomObject]@{Time=Get-Date;File=$Event.SourceEventArgs.FullPath;Operation="Created";Processes=$procList}
                Write-Log "BOM detected and removed during creation: $($Event.SourceEventArgs.FullPath)"
            }
        }
    }

    Write-Host "BOM Watchdog running. Press Ctrl+C to stop."
    while ($true) { Start-Sleep -Seconds 5 }
}

function Test-AndroidStudioConfig {
    Write-Log "Validating Android Studio configuration..."
    $configPath = "$env:USERPROFILE\.AndroidStudio*\config\options\editor.xml"
    if (Test-Path $configPath) {
        $content = Get-Content $configPath -Raw
        if ($content -match "UTF-8" -and $content -notmatch "BOM") {
            Write-Log "Encoding is UTF-8 without BOM."
        } else {
            Write-Log "WARNING: Android Studio encoding settings may allow BOM."
        }
    } else {
        Write-Log "Android Studio config file not found."
    }
}

function Test-EnvironmentHardening {
    Write-Log "Checking Windows Defender and security settings..."
    try {
        $defenderStatus = Get-MpComputerStatus
        Write-Log ("Defender RealTimeProtection: " + $defenderStatus.RealTimeProtectionEnabled)
        Write-Log ("Controlled Folder Access: " + $defenderStatus.ControlledFolderAccessProtected)
        Write-Log ("Cloud Protection: " + $defenderStatus.CloudProtectionEnabled)
    } catch {
        Write-Log "Unable to retrieve Defender status: $_"
    }
}

function Get-BOMReport {
    Write-Log "Generating BOM status report..."
    $reportPath = Join-Path $ProjectRoot "BOM_Report_$Timestamp.txt"
    $summary = @("BOM Status Report - $(Get-Date)","Total BOM events: $($BOMEvents.Count)","")
    foreach ($event in $BOMEvents) {
        $summary += "Time: $($event.Time)"; $summary += "File: $($event.File)"; $summary += "Operation: $($event.Operation)"
        $summary += "Processes active:"; foreach ($proc in $event.Processes) { $summary += "    $($proc.ProcessName) (PID: $($proc.Id))" }; $summary += ""
    }
    $summary | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Log "Report generated at $reportPath"
}

Write-Host "Available Commands:"
Write-Host "Start-BOMScan             -> Deep scan and cleanup"
Write-Host "Start-BOMWatchdog         -> Continuous monitoring"
Write-Host "Test-AndroidStudioConfig  -> Validate IDE settings"
Write-Host "Test-EnvironmentHardening -> Validate system security"
Write-Host "Get-BOMReport             -> Generate BOM report"
Write-Host "`nExample: Start-BOMScan"
