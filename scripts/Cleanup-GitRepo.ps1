#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automatically clean up Git repository by removing large folders and optimizing .git size
.DESCRIPTION
    This script:
    - Updates .gitignore to exclude large folders
    - Removes specified folders from Git tracking (keeps files on disk)
    - Commits the cleanup
    - Runs aggressive garbage collection
    - Pushes to GitHub
.PARAMETER RemoteUrl
    GitHub repository URL (default: uses existing origin)
.PARAMETER FoldersToRemove
    Array of folder paths to remove from Git tracking
.EXAMPLE
    .\Cleanup-GitRepo.ps1
    .\Cleanup-GitRepo.ps1 -RemoteUrl "git@github.com:user/repo.git"
#>

param(
    [string]$RemoteUrl = "",
    [string[]]$FoldersToRemove = @("desktop", "logs", "android", "vets-ready-backend", "vets-ready-mobile")
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $SuccessColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $ErrorColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $WarningColor
}

# Check if we're in a Git repository
if (-not (Test-Path ".git")) {
    Write-Error "Not a Git repository. Run this script from the repository root."
    exit 1
}

Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "     Git Repository Cleanup & Optimization" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Step 1: Check current repository size
Write-Step "Checking current repository size..."
$gitSize = (Get-ChildItem .git -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Current .git folder size: $([math]::Round($gitSize, 2)) MB"

# Step 2: Update .gitignore
Write-Step "Updating .gitignore file..."
$gitignoreContent = @"
# Build outputs
dist/
build/
out/
*.egg-info/
.gradle/
.DS_Store

# Desktop builds (EXCLUDE ENTIRE FOLDER)
desktop/

# Mobile builds (EXCLUDE ENTIRE FOLDERS)
android/
ios/
*.apk
*.aab
*.ipa
mobile/android/
mobile/ios/

# Backend artifacts
vets-ready-backend/dist/
vets-ready-backend/build/
vets-ready-backend/__pycache__/
vets-ready-backend/.pytest_cache/
vets-ready-backend/htmlcov/
vets-ready-backend/.coverage

# Mobile artifacts
vets-ready-mobile/dist/
vets-ready-mobile/build/
vets-ready-mobile/node_modules/

# Dependencies
node_modules/
.pnp
.pnp.js
venv/
.venv/
env/
ENV/
__pycache__/
*.py[cod]
*$py.class
*.so

# IDE
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

# Logs (EXCLUDE ENTIRE FOLDER)
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Backups & Duplicates (managed by scripts)
_preRestructureBackup_*/
_frontendMergeBackup_*/
*_dup*
*.bak_*
.tmp/
*.orig

# Environment
.env
.env.local
.env.*.local

# Testing
coverage/
.nyc_output/
jest.config.js.cache

# Archives
*.zip
*.tar.gz
*.7z

# System
.DS_Store
Thumbs.db
desktop.ini

# IDE generated
.tern-port
*.swc
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Success ".gitignore updated"

# Step 3: Remove large folders from Git tracking
Write-Step "Removing large folders from Git tracking..."
$removedFolders = @()
$failedFolders = @()

foreach ($folder in $FoldersToRemove) {
    Write-Host "Processing: $folder" -ForegroundColor $WarningColor

    # Check if folder exists in Git
    $gitLsFiles = git ls-files $folder 2>$null

    if ($gitLsFiles) {
        try {
            git rm -r --cached -f $folder 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                $removedFolders += $folder
                Write-Success "Removed $folder from Git tracking"
            } else {
                $failedFolders += $folder
                Write-Warning "Failed to remove $folder (not tracked or error)"
            }
        } catch {
            $failedFolders += $folder
            Write-Warning "Error removing $folder: $_"
        }
    } else {
        Write-Warning "$folder not tracked in Git (skipping)"
    }
}

if ($removedFolders.Count -gt 0) {
    Write-Success "Removed $($removedFolders.Count) folders from Git tracking"
} else {
    Write-Warning "No folders were removed from Git tracking"
}

# Step 4: Stage and commit changes
Write-Step "Staging and committing cleanup..."
git add .gitignore 2>&1 | Out-Null

if ($removedFolders.Count -gt 0) {
    $commitMessage = "Clean repo: remove large folders from Git tracking`n`nRemoved folders: $($removedFolders -join ', ')"
    git commit -m $commitMessage 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Changes committed"
    } else {
        Write-Warning "No changes to commit or commit failed"
    }
} else {
    Write-Warning "No folders removed, skipping commit"
}

# Step 5: Run aggressive garbage collection
Write-Step "Running aggressive garbage collection (this may take a few minutes)..."
Write-Host "Optimizing repository..." -ForegroundColor $WarningColor

git gc --aggressive --prune=now 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    $newGitSize = (Get-ChildItem .git -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    $savedSpace = $gitSize - $newGitSize
    Write-Success "Garbage collection complete"
    Write-Host "New .git folder size: $([math]::Round($newGitSize, 2)) MB" -ForegroundColor $SuccessColor
    Write-Host "Space saved: $([math]::Round($savedSpace, 2)) MB" -ForegroundColor $SuccessColor
} else {
    Write-Warning "Garbage collection encountered issues"
}

# Step 6: Setup remote if provided
if ($RemoteUrl) {
    Write-Step "Setting up remote repository..."

    $currentRemote = git remote get-url origin 2>$null

    if ($currentRemote) {
        Write-Host "Current remote: $currentRemote" -ForegroundColor $WarningColor
        $confirm = Read-Host "Replace with $RemoteUrl? (y/n)"
        if ($confirm -eq "y") {
            git remote set-url origin $RemoteUrl
            Write-Success "Remote URL updated"
        }
    } else {
        git remote add origin $RemoteUrl
        Write-Success "Remote added"
    }
}

# Step 7: Push to GitHub
Write-Step "Pushing to GitHub..."
Write-Host "This may take several minutes depending on repository size and connection speed..." -ForegroundColor $WarningColor

$pushOutput = git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Successfully pushed to GitHub!"
} else {
    Write-Error "Push failed. You may need to:"
    Write-Host "  1. Set up SSH keys or use a personal access token" -ForegroundColor $WarningColor
    Write-Host "  2. Check your network connection" -ForegroundColor $WarningColor
    Write-Host "  3. Verify repository permissions" -ForegroundColor $WarningColor
    Write-Host "`nError output:" -ForegroundColor $ErrorColor
    Write-Host $pushOutput
    Write-Host "`nManual push command:" -ForegroundColor $InfoColor
    Write-Host "  git push -u origin main" -ForegroundColor $WarningColor
    exit 1
}

# Summary
Write-Host "`n=====================================================" -ForegroundColor $SuccessColor
Write-Host "     Cleanup Complete!" -ForegroundColor $SuccessColor
Write-Host "=====================================================" -ForegroundColor $SuccessColor
Write-Host "Removed folders: $($removedFolders -join ', ')" -ForegroundColor $InfoColor
Write-Host "Repository optimized and pushed to GitHub" -ForegroundColor $InfoColor
Write-Host "`nNext steps:" -ForegroundColor $InfoColor
Write-Host "  1. Connect Docker Hub to GitHub at https://app.docker.com/accounts/vetsready" -ForegroundColor $WarningColor
Write-Host "  2. Enable automated builds (optional)" -ForegroundColor $WarningColor
