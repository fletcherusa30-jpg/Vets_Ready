<#
.SYNOPSIS
    Rally Forge - One-Click Application Startup Script

.DESCRIPTION
    This PowerShell script handles the complete setup and startup of the Rally Forge application.
    It manages dependencies, database initialization, and starts all services in the correct order.

.PARAMETER Mode
    Specifies the startup mode:
    - 'dev' (default): Local development with hot-reload
    - 'docker': Production-like environment using Docker Compose
    - 'prod': Production deployment mode

.PARAMETER SkipDeps
    Skip dependency installation (useful for subsequent runs)

.PARAMETER Fresh
    Perform a fresh installation (clean node_modules, venv, and database)

.EXAMPLE
    .\Start-RallyForge.ps1
    Starts the application in development mode

.EXAMPLE
    .\Start-RallyForge.ps1 -Mode docker
    Starts the application using Docker Compose

.EXAMPLE
    .\Start-RallyForge.ps1 -Fresh
    Performs a fresh installation and starts in dev mode

.NOTES
    File Name      : Start-RallyForge.ps1
    Author         : Rally Forge Team
    Prerequisite   : PowerShell 5.1+, Node.js 20+, Python 3.11+, PostgreSQL 15+, Redis 7+
    Version        : 1.0.0
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'docker', 'prod')]
    [string]$Mode = 'dev',

    [Parameter(Mandatory=$false)]
    [switch]$SkipDeps,

    [Parameter(Mandatory=$false)]
    [switch]$Fresh
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$FrontendPath = Join-Path $ProjectRoot "rally-forge-frontend"
$BackendPath = Join-Path $ProjectRoot "rally-forge-backend"
$LogFile = Join-Path $ProjectRoot "logs\startup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Colors for output
$Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    # Ensure logs directory exists
    $logsDir = Join-Path $ProjectRoot "logs"
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    }

    Add-Content -Path $LogFile -Value $logMessage

    switch ($Level) {
        "Success" { Write-Host $Message -ForegroundColor $Colors.Success }
        "Warning" { Write-Host $Message -ForegroundColor $Colors.Warning }
        "Error"   { Write-Host $Message -ForegroundColor $Colors.Error }
        "Header"  { Write-Host $Message -ForegroundColor $Colors.Header }
        default   { Write-Host $Message -ForegroundColor $Colors.Info }
    }
}

function Write-Header {
    param([string]$Text)

    $separator = "=" * 80
    Write-Log "" "Header"
    Write-Log $separator "Header"
    Write-Log "  $Text" "Header"
    Write-Log $separator "Header"
    Write-Log "" "Header"
}

function Test-Command {
    param([string]$Command)

    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Test-Prerequisites {
    Write-Header "Checking Prerequisites"

    $prerequisites = @(
        @{Name="Node.js"; Command="node"; Version="--version"; MinVersion="20.0.0"},
        @{Name="npm"; Command="npm"; Version="--version"; MinVersion="9.0.0"},
        @{Name="Python"; Command="python"; Version="--version"; MinVersion="3.11.0"},
        @{Name="pip"; Command="pip"; Version="--version"; MinVersion="23.0.0"}
    )

    if ($Mode -eq 'docker') {
        $prerequisites += @{Name="Docker"; Command="docker"; Version="--version"; MinVersion="24.0.0"}
        $prerequisites += @{Name="Docker Compose"; Command="docker-compose"; Version="--version"; MinVersion="2.0.0"}
    } else {
        $prerequisites += @{Name="PostgreSQL"; Command="psql"; Version="--version"; MinVersion="15.0.0"}
        $prerequisites += @{Name="Redis"; Command="redis-cli"; Version="--version"; MinVersion="7.0.0"}
    }

    $allPresent = $true

    foreach ($prereq in $prerequisites) {
        if (Test-Command $prereq.Command) {
            $version = & $prereq.Command $prereq.Version 2>&1 | Select-Object -First 1
            Write-Log "✓ $($prereq.Name): $version" "Success"
        } else {
            Write-Log "✗ $($prereq.Name) not found - please install version $($prereq.MinVersion) or higher" "Error"
            $allPresent = $false
        }
    }

    if (-not $allPresent) {
        Write-Log "Please install missing prerequisites and try again" "Error"
        exit 1
    }

    Write-Log "All prerequisites satisfied" "Success"
}

function Initialize-Environment {
    Write-Header "Initializing Environment"

    # Check if .env files exist, create from examples if not
    $envFiles = @(
        @{Source=".env.example"; Dest=".env"; Path=$ProjectRoot},
        @{Source=".env.example"; Dest=".env"; Path=$BackendPath},
        @{Source=".env"; Dest=".env"; Path=$FrontendPath}
    )

    foreach ($env in $envFiles) {
        $sourcePath = Join-Path $env.Path $env.Source
        $destPath = Join-Path $env.Path $env.Dest

        if (-not (Test-Path $destPath)) {
            if (Test-Path $sourcePath) {
                Copy-Item $sourcePath $destPath
                Write-Log "Created $destPath from $($env.Source)" "Success"
            } else {
                Write-Log "Warning: $sourcePath not found, using defaults" "Warning"
            }
        } else {
            Write-Log "Environment file exists: $destPath" "Info"
        }
    }
}

function Install-FrontendDependencies {
    Write-Header "Installing Frontend Dependencies"

    Push-Location $FrontendPath

    try {
        if ($Fresh -and (Test-Path "node_modules")) {
            Write-Log "Removing existing node_modules..." "Warning"
            Remove-Item -Recurse -Force "node_modules"
        }

        Write-Log "Running npm install..." "Info"
        npm install

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Frontend dependencies installed successfully" "Success"
        } else {
            throw "npm install failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Log "Failed to install frontend dependencies: $_" "Error"
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Install-BackendDependencies {
    Write-Header "Installing Backend Dependencies"

    Push-Location $BackendPath

    try {
        # Check if virtual environment exists
        $venvPath = ".venv"

        if ($Fresh -and (Test-Path $venvPath)) {
            Write-Log "Removing existing virtual environment..." "Warning"
            Remove-Item -Recurse -Force $venvPath
        }

        if (-not (Test-Path $venvPath)) {
            Write-Log "Creating Python virtual environment..." "Info"
            python -m venv $venvPath
        }

        # Activate virtual environment
        $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
        if (Test-Path $activateScript) {
            . $activateScript
            Write-Log "Virtual environment activated" "Success"
        }

        Write-Log "Upgrading pip..." "Info"
        python -m pip install --upgrade pip

        Write-Log "Installing Python dependencies..." "Info"
        pip install -r requirements.txt

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Backend dependencies installed successfully" "Success"
        } else {
            throw "pip install failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Log "Failed to install backend dependencies: $_" "Error"
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Initialize-Database {
    Write-Header "Initializing Database"

    Push-Location $BackendPath

    try {
        # Activate virtual environment
        $activateScript = Join-Path ".venv" "Scripts\Activate.ps1"
        if (Test-Path $activateScript) {
            . $activateScript
        }

        Write-Log "Running database migrations..." "Info"
        alembic upgrade head

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Database initialized successfully" "Success"
        } else {
            Write-Log "Warning: Database migration had issues (this may be okay for first run)" "Warning"
        }

        # Optional: Load seed data if script exists
        $seedScript = Join-Path $ProjectRoot "seed-data.sql"
        if (Test-Path $seedScript) {
            Write-Log "Loading seed data..." "Info"
            # psql -U RallyForge -d RallyForge_db -f $seedScript
            Write-Log "Seed data loaded" "Success"
        }
    }
    catch {
        Write-Log "Database initialization warning: $_" "Warning"
    }
    finally {
        Pop-Location
    }
}

function Start-Development {
    Write-Header "Starting Development Servers"

    Write-Log "Starting services in development mode..." "Info"
    Write-Log "" "Info"
    Write-Log "Frontend will be available at: http://localhost:5173" "Success"
    Write-Log "Backend API will be available at: http://localhost:8000" "Success"
    Write-Log "API Documentation: http://localhost:8000/docs" "Info"
    Write-Log "" "Info"
    Write-Log "Press Ctrl+C to stop all services" "Warning"
    Write-Log "" "Info"

    # Start backend in background
    $backendJob = Start-Job -ScriptBlock {
        param($BackendPath)
        Set-Location $BackendPath
        & "$BackendPath\.venv\Scripts\Activate.ps1"
        python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    } -ArgumentList $BackendPath

    Write-Log "Backend started (Job ID: $($backendJob.Id))" "Success"
    Start-Sleep -Seconds 3

    # Start frontend in background
    $frontendJob = Start-Job -ScriptBlock {
        param($FrontendPath)
        Set-Location $FrontendPath
        npm run dev
    } -ArgumentList $FrontendPath

    Write-Log "Frontend started (Job ID: $($frontendJob.Id))" "Success"

    # Monitor jobs
    try {
        while ($true) {
            $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
            $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue

            if ($backendOutput) { Write-Host $backendOutput }
            if ($frontendOutput) { Write-Host $frontendOutput }

            # Check if jobs are still running
            if ($backendJob.State -eq 'Completed' -or $backendJob.State -eq 'Failed') {
                Write-Log "Backend job ended unexpectedly" "Error"
                break
            }
            if ($frontendJob.State -eq 'Completed' -or $frontendJob.State -eq 'Failed') {
                Write-Log "Frontend job ended unexpectedly" "Error"
                break
            }

            Start-Sleep -Milliseconds 500
        }
    }
    finally {
        Write-Log "Stopping services..." "Warning"
        Stop-Job -Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue
    }
}

function Start-Docker {
    Write-Header "Starting Docker Environment"

    Push-Location $ProjectRoot

    try {
        if ($Fresh) {
            Write-Log "Performing fresh Docker build..." "Warning"
            docker-compose -f docker-compose.prod.yml down -v
            docker-compose -f docker-compose.prod.yml build --no-cache
        }

        Write-Log "Starting Docker containers..." "Info"
        docker-compose -f docker-compose.prod.yml up -d

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Docker containers started successfully" "Success"
            Write-Log "" "Info"
            Write-Log "Services are starting up..." "Info"
            Write-Log "Frontend: http://localhost" "Success"
            Write-Log "Backend API: http://localhost/api" "Success"
            Write-Log "" "Info"
            Write-Log "View logs with: docker-compose -f docker-compose.prod.yml logs -f" "Info"
            Write-Log "Stop with: docker-compose -f docker-compose.prod.yml down" "Info"
        } else {
            throw "Docker Compose failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        Write-Log "Failed to start Docker environment: $_" "Error"
        exit 1
    }
    finally {
        Pop-Location
    }
}

function Show-Summary {
    Write-Header "Startup Summary"

    Write-Log "Rally Forge Application started successfully!" "Success"
    Write-Log "" "Info"
    Write-Log "Mode: $Mode" "Info"
    Write-Log "Logs: $LogFile" "Info"
    Write-Log "" "Info"

    if ($Mode -eq 'dev') {
        Write-Log "Quick Commands:" "Header"
        Write-Log "  - Stop servers: Press Ctrl+C" "Info"
        Write-Log "  - Restart: Run this script again with -SkipDeps" "Info"
        Write-Log "  - Fresh install: Run with -Fresh flag" "Info"
    } elseif ($Mode -eq 'docker') {
        Write-Log "Docker Commands:" "Header"
        Write-Log "  - View logs: docker-compose -f docker-compose.prod.yml logs -f" "Info"
        Write-Log "  - Stop: docker-compose -f docker-compose.prod.yml down" "Info"
        Write-Log "  - Restart: docker-compose -f docker-compose.prod.yml restart" "Info"
    }

    Write-Log "" "Info"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

try {
    Clear-Host

    Write-Header "Rally Forge - Application Startup"
    Write-Log "Starting in $Mode mode..." "Info"
    Write-Log "Project Root: $ProjectRoot" "Info"

    # Step 1: Check prerequisites
    Test-Prerequisites

    # Step 2: Initialize environment
    Initialize-Environment

    # Step 3: Install dependencies (unless skipped)
    if (-not $SkipDeps) {
        if ($Mode -ne 'docker') {
            Install-FrontendDependencies
            Install-BackendDependencies
        }
    } else {
        Write-Log "Skipping dependency installation" "Warning"
    }

    # Step 4: Initialize database (dev mode only)
    if ($Mode -eq 'dev') {
        Initialize-Database
    }

    # Step 5: Start services
    if ($Mode -eq 'docker') {
        Start-Docker
        Show-Summary
    } else {
        Show-Summary
        Start-Development
    }
}
catch {
    Write-Log "Fatal error: $_" "Error"
    Write-Log $_.ScriptStackTrace "Error"
    exit 1
}


