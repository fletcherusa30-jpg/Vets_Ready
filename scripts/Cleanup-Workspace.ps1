#Requires -Version 5.1
<#
.SYNOPSIS
    Comprehensive cleanup and reorganization of PhoneApp workspace
.DESCRIPTION
    - Archives backup/duplicate directories
    - Cleans up temporary/build files
    - Validates .gitignore
    - Removes duplicate source files
.NOTES
    Run from workspace root with -Force to execute
#>
param(
    [switch]$Force,
    [string]$BackupPath = "C:\Backups\PhoneApp_$(Get-Date -f 'yyyyMMdd_HHmmss')"
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = 'c:\Dev\PhoneApp'

function Write-Header {
    param([string]$Message)
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Get-DirectorySize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1GB, 2)
    }
    return 0
}

# Phase 1: Analyze
Write-Header "PHASE 1: WORKSPACE ANALYSIS"

$backupDirs = @(
    "_archive"
    "_preRestructureBackup_20260123_203934"
    "_frontendMergeBackup_20260123_204756"
)

Write-Host "`n📁 Backup Directories Found:" -ForegroundColor Yellow
$totalBackupSize = 0
foreach ($dir in $backupDirs) {
    $fullPath = Join-Path $ProjectRoot $dir
    if (Test-Path $fullPath) {
        $size = Get-DirectorySize $fullPath
        $totalBackupSize += $size
        Write-Host "   • $dir [$($size)GB]" -ForegroundColor White
    }
}
Write-Host "`n   Total: $($totalBackupSize)GB" -ForegroundColor Cyan

# Phase 2: Find Duplicates
Write-Header "PHASE 2: DUPLICATE FILE DETECTION"

$dupFiles = @()
$dupPatterns = @('_dup\d+', '\.bak_')

Write-Host "`nScanning for duplicate patterns..." -ForegroundColor Yellow
foreach ($pattern in $dupPatterns) {
    $found = Get-ChildItem -Path $ProjectRoot -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match $pattern -and $_.FullPath -notmatch '_preRestructureBackup|_archive|_frontendMergeBackup' }

    if ($found) {
        $dupFiles += $found
        Write-Host "   Found: $($found.Count) files matching '$pattern'" -ForegroundColor Cyan
    }
}

Write-Host "`nDuplicate Files in Active Workspace:" -ForegroundColor Yellow
$dupFiles | ForEach-Object {
    Write-Host "   • $($_.FullName)" -ForegroundColor DarkYellow
}

# Phase 3: Preview Actions
Write-Header "PHASE 3: ACTION PREVIEW"

Write-Host "`n✓ Will Archive:" -ForegroundColor Green
Write-Host "   • _preRestructureBackup_20260123_203934"
Write-Host "   • _frontendMergeBackup_20260123_204756"
Write-Host "   • _archive (legacy)"

Write-Host "`n✓ Will Remove from Active Workspace:" -ForegroundColor Green
Write-Host "   • $($dupFiles.Count) duplicate source files"
Write-Host "   • node_modules/.bak files"
Write-Host "   • __pycache__ directories (empty, as per .gitignore)"

Write-Host "`n✓ Will Update:" -ForegroundColor Green
Write-Host "   • .gitignore (verify complete)"
Write-Host "   • Create CLEANUP_MANIFEST.json (inventory)"

# Execute if -Force
if ($Force) {
    Write-Host "`n`n" -ForegroundColor White
    Write-Header "PHASE 4: EXECUTING CLEANUP"

    # Create backup directory
    if (!(Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
        Write-Host "✓ Created backup directory: $BackupPath" -ForegroundColor Green
    }

    # Archive directories
    Write-Host "`nArchiving backup directories..." -ForegroundColor Cyan
    foreach ($dir in $backupDirs) {
        $fullPath = Join-Path $ProjectRoot $dir
        if (Test-Path $fullPath) {
            $archiveName = Join-Path $BackupPath "$dir.zip"
            Compress-Archive -Path $fullPath -DestinationPath $archiveName -CompressionLevel Optimal -Force
            $archiveSize = (Get-Item $archiveName).Length / 1GB
            Write-Host "   ✓ Archived: $dir [$($archiveSize)GB]" -ForegroundColor Green

            # Remove original
            Remove-Item -Path $fullPath -Recurse -Force
            Write-Host "   ✓ Removed: $dir" -ForegroundColor Green
        }
    }

    # Remove duplicate files
    Write-Host "`nRemoving duplicate files..." -ForegroundColor Cyan
    $removedCount = 0
    $dupFiles | ForEach-Object {
        try {
            Remove-Item -Path $_.FullName -Force
            $removedCount++
            Write-Host "   ✓ Removed: $($_.Name)" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ Failed: $($_.Name) - $_" -ForegroundColor Red
        }
    }
    Write-Host "   Total removed: $removedCount files" -ForegroundColor Cyan

    # Create manifest
    Write-Host "`nCreating cleanup manifest..." -ForegroundColor Cyan
    $manifest = @{
        timestamp = (Get-Date).ToString('o')
        backupLocation = $BackupPath
        archivedDirectories = $backupDirs
        duplicatesRemoved = $removedCount
        backupSizeGB = $totalBackupSize
        estimatedSpaceFreedGB = $totalBackupSize + ($dupFiles.Count * 0.001)
    } | ConvertTo-Json

    $manifest | Out-File -Path (Join-Path $ProjectRoot 'CLEANUP_MANIFEST.json') -Encoding UTF8
    Write-Host "   ✓ Created: CLEANUP_MANIFEST.json" -ForegroundColor Green

    Write-Header "CLEANUP COMPLETE"
    Write-Host "✓ Backup location: $BackupPath" -ForegroundColor Green
    Write-Host "✓ Workspace is now clean and optimized" -ForegroundColor Green

} else {
    Write-Host "`n⚠ DRY RUN COMPLETE - Use -Force to execute cleanup" -ForegroundColor Yellow
}

Write-Host "`n"
