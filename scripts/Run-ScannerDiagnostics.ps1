<#
.SYNOPSIS
    Complete Scanner Diagnostics for VetsReady Platform
.DESCRIPTION
    Tests all scanners, paths, permissions, and dependencies.
    Generates comprehensive diagnostic report.

.PARAMETER ProjectRoot
    Root path of the VetsReady project

.PARAMETER LogFolder
    Folder to store diagnostic logs

.EXAMPLE
    .\Run-ScannerDiagnostics.ps1
    .\Run-ScannerDiagnostics.ps1 -ProjectRoot "C:\Dev\Vets Ready"
#>

param(
    [string]$ProjectRoot = "",
    [string]$LogFolder   = ".\Diagnostics"
)

# Auto-detect project root if not specified
if ([string]::IsNullOrEmpty($ProjectRoot)) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ProjectRoot = Split-Path -Parent $ScriptDir
}

Write-Host "=== VETSREADY SCANNER DIAGNOSTICS ===" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host ""

# Ensure project root exists
if (-not (Test-Path $ProjectRoot)) {
    Write-Host "ERROR: Project root does not exist: $ProjectRoot" -ForegroundColor Red
    Write-Host "Please specify correct path using -ProjectRoot parameter" -ForegroundColor Red
    exit 1
}

# Ensure log folder
$LogFolderFull = Join-Path $ProjectRoot $LogFolder
if (-not (Test-Path $LogFolderFull)) {
    New-Item -ItemType Directory -Path $LogFolderFull -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile   = Join-Path $LogFolderFull "ScannerDiagnostics_$timestamp.log"

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message

    # Write to file
    $line | Out-File -FilePath $logFile -Append -Encoding UTF8

    # Write to console with color
    switch ($Level) {
        "ERROR"   { Write-Host $line -ForegroundColor Red }
        "WARN"    { Write-Host $line -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $line -ForegroundColor Green }
        default   { Write-Host $line }
    }
}

Write-Log "=== Scanner Diagnostics Started ===" "INFO"
Write-Log "ProjectRoot: $ProjectRoot" "INFO"
Write-Log "LogFile: $logFile" "INFO"

# Initialize results
$results = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    ProjectRoot = $ProjectRoot
    Errors = @()
    Warnings = @()
    Successes = @()
    Tests = @{}
}

# =====================================================================
# TEST 1: Check project root
# =====================================================================
Write-Log "TEST 1: Checking project root..." "INFO"

if (-not (Test-Path $ProjectRoot)) {
    Write-Log "ERROR: Project root does not exist: $ProjectRoot" "ERROR"
    $results.Errors += "Project root does not exist"
    $results.Tests["ProjectRoot"] = "FAIL"
} else {
    Write-Log "OK: Project root exists" "SUCCESS"
    $results.Successes += "Project root exists"
    $results.Tests["ProjectRoot"] = "PASS"
}

Set-Location $ProjectRoot
Write-Log "Current directory: $(Get-Location)" "INFO"

# =====================================================================
# TEST 2: Check key folders
# =====================================================================
Write-Log "TEST 2: Checking key folders..." "INFO"

$foldersToCheck = @(
    "logs",
    "logs\scanners",
    "reports",
    "reports\scanners",
    "uploads",
    "uploads\str",
    "Data",
    "Data\STR",
    "Data\Documents",
    "vets-ready-backend",
    "vets-ready-frontend",
    "scripts",
    "config"
)

$folderResults = @{}
foreach ($folder in $foldersToCheck) {
    $fullPath = Join-Path $ProjectRoot $folder
    if (-not (Test-Path $fullPath)) {
        Write-Log "WARN: Missing folder: $fullPath — attempting to create" "WARN"
        try {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Log "OK: Created folder: $fullPath" "SUCCESS"
            $results.Warnings += "Created missing folder: $folder"
            $folderResults[$folder] = "CREATED"
        } catch {
            Write-Log "ERROR: Failed to create folder: $fullPath — $($_.Exception.Message)" "ERROR"
            $results.Errors += "Failed to create folder: $folder"
            $folderResults[$folder] = "FAIL"
        }
    } else {
        Write-Log "OK: Folder exists: $fullPath" "SUCCESS"
        $folderResults[$folder] = "EXISTS"
    }
}

$results.Tests["Folders"] = $folderResults

# =====================================================================
# TEST 3: Test file enumeration in data folders
# =====================================================================
Write-Log "TEST 3: Testing file enumeration..." "INFO"

$testDirs = @(
    @{ Path = "Data\STR"; Name = "STR Files" },
    @{ Path = "Data\Documents"; Name = "Documents" },
    @{ Path = "uploads\str"; Name = "STR Uploads" }
)

$fileEnumResults = @{}
foreach ($dirInfo in $testDirs) {
    $dir = Join-Path $ProjectRoot $dirInfo.Path
    if (Test-Path $dir) {
        try {
            $files = Get-ChildItem -Path $dir -Recurse -File -ErrorAction Stop
            $count = ($files | Measure-Object).Count
            Write-Log "INFO: $count files found in $($dirInfo.Name)" "INFO"
            $fileEnumResults[$dirInfo.Name] = $count

            if ($count -gt 0) {
                $sample = $files | Select-Object -First 3
                foreach ($f in $sample) {
                    $sizeKB = [math]::Round($f.Length/1KB, 2)
                    Write-Log "  Sample file: $($f.Name) ($sizeKB KB)" "INFO"
                }
                $results.Successes += "Found $count files in $($dirInfo.Name)"
            }
        } catch {
            Write-Log "ERROR: Failed to enumerate files in $($dirInfo.Path): $($_.Exception.Message)" "ERROR"
            $results.Errors += "Failed to enumerate $($dirInfo.Name)"
            $fileEnumResults[$dirInfo.Name] = "ERROR"
        }
    } else {
        Write-Log "WARN: Directory not found: $dir" "WARN"
        $results.Warnings += "Directory not found: $($dirInfo.Path)"
        $fileEnumResults[$dirInfo.Name] = "NOT_FOUND"
    }
}

$results.Tests["FileEnumeration"] = $fileEnumResults

# =====================================================================
# TEST 4: Check PowerShell execution policy
# =====================================================================
Write-Log "TEST 4: Checking PowerShell execution policy..." "INFO"

try {
    $policy = Get-ExecutionPolicy
    Write-Log "INFO: ExecutionPolicy: $policy" "INFO"
    $results.Tests["ExecutionPolicy"] = $policy

    if ($policy -eq "Restricted") {
        Write-Log "WARN: Execution policy is Restricted. Scanners may fail." "WARN"
        Write-Log "Run: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass" "WARN"
        $results.Warnings += "Execution policy is Restricted"
    } else {
        $results.Successes += "Execution policy allows script execution"
    }
} catch {
    Write-Log "ERROR: Failed to check execution policy: $($_.Exception.Message)" "ERROR"
    $results.Errors += "Failed to check execution policy"
}

# =====================================================================
# TEST 5: Check scanner scripts existence
# =====================================================================
Write-Log "TEST 5: Checking scanner scripts..." "INFO"

$scanners = @(
    @{ Name = "BOM Scanner"; Path = "scripts\BOM-Defense.ps1"; Function = "Start-BOMScan" },
    @{ Name = "Integrity Scanner"; Path = "scripts\Integrity-Scanner.ps1"; Function = "Start-IntegrityScan" },
    @{ Name = "Android Scanner"; Path = "scripts\Scan-Android.ps1"; Function = $null }
)

$scannerResults = @{}
foreach ($scanner in $scanners) {
    $scannerPath = Join-Path $ProjectRoot $scanner.Path
    if (Test-Path $scannerPath) {
        Write-Log "OK: Scanner script found: $($scanner.Name) at $($scanner.Path)" "SUCCESS"
        $scannerResults[$scanner.Name] = "FOUND"
        $results.Successes += "Found $($scanner.Name)"

        # Check if file is readable
        try {
            $content = Get-Content $scannerPath -TotalCount 5 -ErrorAction Stop
            Write-Log "  First line: $($content[0])" "INFO"
        } catch {
            Write-Log "ERROR: Cannot read scanner: $($scanner.Name) — $($_.Exception.Message)" "ERROR"
            $scannerResults[$scanner.Name] = "UNREADABLE"
            $results.Errors += "Cannot read $($scanner.Name)"
        }
    } else {
        Write-Log "WARN: Scanner script missing: $($scanner.Name) at $($scanner.Path)" "WARN"
        $scannerResults[$scanner.Name] = "MISSING"
        $results.Warnings += "Missing $($scanner.Name)"
    }
}

$results.Tests["Scanners"] = $scannerResults

# =====================================================================
# TEST 6: Check backend dependencies
# =====================================================================
Write-Log "TEST 6: Checking backend dependencies..." "INFO"

$backendPath = Join-Path $ProjectRoot "vets-ready-backend"
$backendTests = @{}

if (Test-Path $backendPath) {
    # Check requirements.txt
    $requirementsPath = Join-Path $backendPath "requirements.txt"
    if (Test-Path $requirementsPath) {
        Write-Log "OK: requirements.txt found" "SUCCESS"
        $backendTests["requirements.txt"] = "FOUND"
    } else {
        Write-Log "WARN: requirements.txt not found" "WARN"
        $backendTests["requirements.txt"] = "MISSING"
    }

    # Check main.py
    $mainPyPath = Join-Path $backendPath "app\main.py"
    if (Test-Path $mainPyPath) {
        Write-Log "OK: app\main.py found" "SUCCESS"
        $backendTests["main.py"] = "FOUND"
    } else {
        Write-Log "WARN: app\main.py not found" "WARN"
        $backendTests["main.py"] = "MISSING"
    }

    # Check scanners.py
    $scannersPyPath = Join-Path $backendPath "app\routers\scanners.py"
    if (Test-Path $scannersPyPath) {
        Write-Log "OK: app\routers\scanners.py found" "SUCCESS"
        $backendTests["scanners.py"] = "FOUND"
    } else {
        Write-Log "ERROR: app\routers\scanners.py not found" "ERROR"
        $backendTests["scanners.py"] = "MISSING"
        $results.Errors += "Scanner backend router missing"
    }
} else {
    Write-Log "ERROR: Backend directory not found: $backendPath" "ERROR"
    $backendTests["backend_dir"] = "MISSING"
    $results.Errors += "Backend directory not found"
}

$results.Tests["Backend"] = $backendTests

# =====================================================================
# TEST 7: Check frontend dependencies
# =====================================================================
Write-Log "TEST 7: Checking frontend dependencies..." "INFO"

$frontendPath = Join-Path $ProjectRoot "vets-ready-frontend"
$frontendTests = @{}

if (Test-Path $frontendPath) {
    # Check package.json
    $packageJsonPath = Join-Path $frontendPath "package.json"
    if (Test-Path $packageJsonPath) {
        Write-Log "OK: package.json found" "SUCCESS"
        $frontendTests["package.json"] = "FOUND"
    } else {
        Write-Log "WARN: package.json not found" "WARN"
        $frontendTests["package.json"] = "MISSING"
    }

    # Check scannerAPI.ts
    $scannerAPIPath = Join-Path $frontendPath "src\services\scannerAPI.ts"
    if (Test-Path $scannerAPIPath) {
        Write-Log "OK: scannerAPI.ts found" "SUCCESS"
        $frontendTests["scannerAPI.ts"] = "FOUND"
    } else {
        Write-Log "ERROR: scannerAPI.ts not found" "ERROR"
        $frontendTests["scannerAPI.ts"] = "MISSING"
        $results.Errors += "Scanner API client missing"
    }

    # Check STRUpload component
    $strUploadPath = Join-Path $frontendPath "src\components\shared\STRUpload.tsx"
    if (Test-Path $strUploadPath) {
        Write-Log "OK: STRUpload.tsx found" "SUCCESS"
        $frontendTests["STRUpload.tsx"] = "FOUND"
    } else {
        Write-Log "ERROR: STRUpload.tsx not found" "ERROR"
        $frontendTests["STRUpload.tsx"] = "MISSING"
        $results.Errors += "STR Upload component missing"
    }
} else {
    Write-Log "ERROR: Frontend directory not found: $frontendPath" "ERROR"
    $frontendTests["frontend_dir"] = "MISSING"
    $results.Errors += "Frontend directory not found"
}

$results.Tests["Frontend"] = $frontendTests

# =====================================================================
# TEST 8: Check Python availability (for backend)
# =====================================================================
Write-Log "TEST 8: Checking Python availability..." "INFO"

try {
    $pythonVersion = & python --version 2>&1
    Write-Log "OK: Python found: $pythonVersion" "SUCCESS"
    $results.Tests["Python"] = $pythonVersion
    $results.Successes += "Python available: $pythonVersion"
} catch {
    Write-Log "WARN: Python not found in PATH" "WARN"
    $results.Tests["Python"] = "NOT_FOUND"
    $results.Warnings += "Python not found"
}

# =====================================================================
# TEST 9: Check Node.js availability (for frontend)
# =====================================================================
Write-Log "TEST 9: Checking Node.js availability..." "INFO"

try {
    $nodeVersion = & node --version 2>&1
    Write-Log "OK: Node.js found: $nodeVersion" "SUCCESS"
    $results.Tests["Node"] = $nodeVersion
    $results.Successes += "Node.js available: $nodeVersion"
} catch {
    Write-Log "WARN: Node.js not found in PATH" "WARN"
    $results.Tests["Node"] = "NOT_FOUND"
    $results.Warnings += "Node.js not found"
}

# =====================================================================
# TEST 10: Test backend API availability
# =====================================================================
Write-Log "TEST 10: Testing backend API..." "INFO"

try {
    $healthUrl = "http://localhost:8000/api/scanners/health"
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Log "OK: Backend API is running" "SUCCESS"
    Write-Log "  Status: $($response.status)" "INFO"
    Write-Log "  Active Jobs: $($response.active_jobs)" "INFO"
    $results.Tests["BackendAPI"] = "RUNNING"
    $results.Successes += "Backend API is running"
} catch {
    Write-Log "WARN: Backend API not available at http://localhost:8000" "WARN"
    Write-Log "  Start backend: cd vets-ready-backend; python -m uvicorn app.main:app --reload" "WARN"
    $results.Tests["BackendAPI"] = "NOT_RUNNING"
    $results.Warnings += "Backend API not running"
}

# =====================================================================
# TEST 11: Optional scanner execution tests
# =====================================================================
Write-Log "TEST 11: Testing scanner execution (dry run)..." "INFO"

foreach ($scanner in $scanners) {
    $scannerPath = Join-Path $ProjectRoot $scanner.Path
    if (Test-Path $scannerPath) {
        Write-Log "INFO: Testing scanner: $($scanner.Name)" "INFO"
        try {
            # Try to source the script to check for syntax errors
            . $scannerPath 2>&1 | Out-Null
            Write-Log "  OK: Scanner loaded successfully" "SUCCESS"

            # If function name provided, check if it exists
            if ($scanner.Function) {
                if (Get-Command $scanner.Function -ErrorAction SilentlyContinue) {
                    Write-Log "  OK: Function $($scanner.Function) is available" "SUCCESS"
                } else {
                    Write-Log "  WARN: Function $($scanner.Function) not found" "WARN"
                }
            }
        } catch {
            Write-Log "ERROR: Scanner failed to load: $($scanner.Name) — $($_.Exception.Message)" "ERROR"
            $results.Errors += "Scanner execution test failed: $($scanner.Name)"
        }
    }
}

# =====================================================================
# GENERATE SUMMARY
# =====================================================================
Write-Log "=== Scanner Diagnostics Completed ===" "INFO"
Write-Host ""
Write-Host "=== DIAGNOSTIC SUMMARY ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ SUCCESSES: $($results.Successes.Count)" -ForegroundColor Green
foreach ($success in $results.Successes) {
    Write-Host "  ✓ $success" -ForegroundColor Green
}
Write-Host ""

if ($results.Warnings.Count -gt 0) {
    Write-Host "⚠️  WARNINGS: $($results.Warnings.Count)" -ForegroundColor Yellow
    foreach ($warning in $results.Warnings) {
        Write-Host "  ⚠ $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($results.Errors.Count -gt 0) {
    Write-Host "❌ ERRORS: $($results.Errors.Count)" -ForegroundColor Red
    foreach ($error in $results.Errors) {
        Write-Host "  ✗ $error" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "📁 Diagnostics log saved to: $logFile" -ForegroundColor Cyan
Write-Host ""

# Save JSON report
$jsonReportPath = Join-Path $LogFolderFull "ScannerDiagnostics_$timestamp.json"
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonReportPath -Encoding UTF8
Write-Host "📊 JSON report saved to: $jsonReportPath" -ForegroundColor Cyan
Write-Host ""

# Determine overall status
$overallStatus = "PASS"
if ($results.Errors.Count -gt 0) {
    $overallStatus = "FAIL"
    Write-Host "🔴 OVERALL STATUS: FAIL" -ForegroundColor Red
    exit 1
} elseif ($results.Warnings.Count -gt 0) {
    $overallStatus = "WARN"
    Write-Host "🟡 OVERALL STATUS: PASS WITH WARNINGS" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "🟢 OVERALL STATUS: PASS" -ForegroundColor Green
    exit 0
}
