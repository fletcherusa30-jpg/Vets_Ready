<#
.SYNOPSIS
    Ultimate BOM Defense System for Android Studio projects.
.DESCRIPTION
    - Deep BOM scanner and cleaner
    - Real-time BOM watchdog
    - Process correlation engine
    - Android Studio configuration validator
    - Environment hardening validator
    - Reporting engine
#>

# Global Configuration
$ProjectRoot = "C:\Dev\PhoneApp"
$BackupRoot = Join-Path $ProjectRoot "BOM_Backups"
$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$LogFile = Join-Path $ProjectRoot "BOM_Defense_Log_$Timestamp.txt"
$TargetExtensions = @("*.gradle","*.groovy","*.xml","*.kt","*.java","*.properties","*.json","*.js","*.ts","*.cfg","*.ini")
$BOM = 0xEF,0xBB,0xBF
$BOMEvents = @()

if (-not (Test-Path $BackupRoot)) { New-Item -ItemType Directory -Path $BackupRoot | Out-Null }

function Write-Log { param([string]$Message)
    $entry = "[$(Get-Date)] $Message"
    Add-Content -Path $LogFile -Value $entry
    Write-Host $entry
}

function Remove-BOMFromFile { param([string]$FilePath)
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        if ($bytes.Length -ge 3 -and $bytes[0..2] -eq $BOM) {
            $relPath = $FilePath.Substring($ProjectRoot.Length).TrimStart('\')
            $backupPath = Join-Path $BackupRoot $relPath
            $backupDir = Split-Path $backupPath
            if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
            Copy-Item $FilePath "$backupPath.bak_$Timestamp" -Force
            $cleanBytes = $bytes[3..($bytes.Length - 1)]
            $content = [System.Text.Encoding]::UTF8.GetString($cleanBytes)
            [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.Encoding]::UTF8)
            Write-Log "BOM removed from: $FilePath (Backup: $backupPath.bak_$Timestamp)"
            return $true
        }
    } catch { Write-Log ('ERROR removing BOM from ' + $FilePath + ': ' + $_) }
    return $false
}

function Start-BOMScan {
    Write-Log "Starting deep BOM scan in $ProjectRoot"
    $files = Get-ChildItem -Path $ProjectRoot -Recurse -Include $TargetExtensions -File
    $total = 0; $removed = 0
    foreach ($file in $files) { $total++; if (Remove-BOMFromFile -FilePath $file.FullName) { $removed++ } }
    Write-Log "Scan completed. Total files: $total, BOMs removed: $removed"
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
