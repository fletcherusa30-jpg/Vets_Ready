#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Clean rebuild of Git repository to remove all large files from history
.DESCRIPTION
    This script performs a complete rebuild of the Git repository:
    - Backs up current .git folder
    - Creates perfect .gitignore
    - Initializes fresh Git repo
    - Commits only current clean files
    - Pushes clean repo to GitHub
.PARAMETER RemoteUrl
    GitHub repository URL
.PARAMETER SkipBackup
    Skip backing up the old .git folder (not recommended)
.EXAMPLE
    .\Rebuild-CleanRepo.ps1 -RemoteUrl "git@github.com:fletcherusa30-jpg/Vets_Ready.git"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$RemoteUrl,
    [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"

# Colors
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Step { param([string]$Message); Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor }
function Write-Success { param([string]$Message); Write-Host "✓ $Message" -ForegroundColor $SuccessColor }
function Write-Error { param([string]$Message); Write-Host "✗ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param([string]$Message); Write-Host "⚠ $Message" -ForegroundColor $WarningColor }

Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Clean Git Repository Rebuild" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Verify we're in repo root
if (-not (Test-Path ".git")) {
    Write-Error "Not in repository root. Please run from c:\Dev\Vets Ready\"
    exit 1
}

# Step 1: Backup old .git folder
if (-not $SkipBackup) {
    Write-Step "Backing up old .git folder..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "..\_git_backup_$timestamp"

    if (Test-Path $backupPath) {
        Write-Error "Backup path already exists: $backupPath"
        exit 1
    }

    Copy-Item .git $backupPath -Recurse -ErrorAction Stop
    Write-Success "Backed up to: $backupPath"
    Write-Host "  (You can delete this after confirming the rebuild works)" -ForegroundColor $WarningColor
}

# Step 2: Create perfect .gitignore
Write-Step "Creating comprehensive .gitignore..."
$gitignoreContent = @'
# ============================================
# VETS READY - COMPREHENSIVE .GITIGNORE
# ============================================

# Python Virtual Environments (CRITICAL - NEVER COMMIT)
.venv/
venv/
env/
ENV/
virtualenv/
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Node.js Dependencies
node_modules/
.pnp/
.pnp.js
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Build Outputs
dist/
build/
out/
*.egg-info/
.gradle/
target/
*.class
*.jar
*.war

# Desktop & Mobile Builds (LARGE FOLDERS)
desktop/
android/
ios/
*.apk
*.aab
*.ipa
*.exe
*.dmg
*.app

# Backend Artifacts
vets-ready-backend/dist/
vets-ready-backend/build/
vets-ready-backend/__pycache__/
vets-ready-backend/.pytest_cache/
vets-ready-backend/htmlcov/
vets-ready-backend/.coverage
vets-ready-backend/.venv/

# Frontend Artifacts
vets-ready-frontend/dist/
vets-ready-frontend/build/
vets-ready-frontend/node_modules/
vets-ready-frontend/.vite/

# Mobile Artifacts
vets-ready-mobile/dist/
vets-ready-mobile/build/
vets-ready-mobile/node_modules/
vets-ready-mobile/android/
vets-ready-mobile/ios/

# Logs (NEVER COMMIT)
logs/
*.log

# Archives & Backups (CRITICAL - CAN BE HUGE)
_archive/
_preRestructureBackup_*/
_frontendMergeBackup_*/
_git_backup_*/
*.zip
*.tar.gz
*.7z
*.rar
*.bak
*_dup*
*.bak_*
*.orig
.tmp/
Backups/

# Environment Files (SECRETS)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*
!.env.example

# IDE & Editors
.idea/
.vscode/
*.swp
*.swo
*~
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace
*.sublime-project
.tern-port

# Testing
coverage/
.nyc_output/
.pytest_cache/
htmlcov/
jest.config.js.cache

# OS Files
.DS_Store
Thumbs.db
desktop.ini
*.lnk

# Database
*.sqlite
*.sqlite3
*.db

# Credentials (NEVER COMMIT)
*.pem
*.key
*.cert
credentials.json
service-account.json

# Large Media (Use Git LFS if needed)
*.mp4
*.mov
*.avi
*.mkv
*.iso
'@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8 -Force
Write-Success ".gitignore created"

# Step 3: Remove old .git folder
Write-Step "Removing old .git folder..."
Remove-Item .git -Recurse -Force
Write-Success "Old .git removed"

# Step 4: Initialize fresh repository
Write-Step "Initializing fresh Git repository..."
git init
git branch -M main
Write-Success "Fresh repository initialized"

# Step 5: Add remote
Write-Step "Adding remote repository..."
git remote add origin $RemoteUrl
Write-Success "Remote added: $RemoteUrl"

# Step 6: Stage all clean files
Write-Step "Staging clean files (this may take a moment)..."
git add .
$stagedFiles = (git diff --cached --numstat | Measure-Object).Count
Write-Success "Staged $stagedFiles files"

# Verify no large files
Write-Step "Verifying no large files..."
$largeFiles = git ls-files | ForEach-Object {
    if (Test-Path $_) {
        Get-Item $_ | Where-Object { $_.Length -gt 50MB }
    }
}

if ($largeFiles) {
    Write-Error "Large files detected! These should not be committed:"
    $largeFiles | ForEach-Object { Write-Host "  - $($_.FullName) ($([math]::Round($_.Length/1MB, 2)) MB)" -ForegroundColor $ErrorColor }
    Write-Host "`nPlease update .gitignore and run: git reset" -ForegroundColor $WarningColor
    exit 1
}
Write-Success "No files over 50MB detected"

# Step 7: Create initial commit
Write-Step "Creating initial commit..."
$commitMessage = @"
Initial clean commit - Vets Ready Platform

- Complete veteran-first platform codebase
- Frontend: React 18 + TypeScript + Vite + Tailwind + PWA
- Backend: FastAPI + Python + PostgreSQL
- Mobile: Capacitor + React Native
- Removed all large files and build artifacts
- Comprehensive .gitignore configured
"@

git commit -m $commitMessage
Write-Success "Initial commit created"

# Step 8: Show repository stats
Write-Step "Repository Statistics:"
$repoStats = git count-objects -vH
Write-Host $repoStats -ForegroundColor $InfoColor

# Step 9: Push to GitHub
Write-Step "Pushing to GitHub..."
Write-Host "This is a fresh push and will overwrite remote history." -ForegroundColor $WarningColor
Write-Host "Press ENTER to continue or CTRL+C to cancel..." -ForegroundColor $WarningColor
Read-Host

git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Success "Successfully pushed to GitHub!"
} else {
    Write-Error "Push failed. Check your credentials and network connection."
    Write-Host "`nManual push command:" -ForegroundColor $InfoColor
    Write-Host "  git push -u origin main --force" -ForegroundColor $WarningColor
    exit 1
}

# Step 10: Summary
Write-Host "`n=====================================================" -ForegroundColor $SuccessColor
Write-Host "     Clean Rebuild Complete!" -ForegroundColor $SuccessColor
Write-Host "=====================================================" -ForegroundColor $SuccessColor
Write-Host "✓ Old .git backed up to: $backupPath" -ForegroundColor $SuccessColor
Write-Host "✓ Fresh repository initialized" -ForegroundColor $SuccessColor
Write-Host "✓ Comprehensive .gitignore created" -ForegroundColor $SuccessColor
Write-Host "✓ Clean commit pushed to GitHub" -ForegroundColor $SuccessColor
Write-Host "✓ Repository size: ~$(($repoStats | Select-String 'size-pack').ToString().Split(':')[1].Trim())" -ForegroundColor $SuccessColor

Write-Host "`nNext steps:" -ForegroundColor $InfoColor
Write-Host "  1. Verify repository on GitHub" -ForegroundColor $WarningColor
Write-Host "  2. Delete backup folder after confirmation: $backupPath" -ForegroundColor $WarningColor
Write-Host "  3. Connect Docker Hub: https://app.docker.com/accounts/vetsready" -ForegroundColor $WarningColor
