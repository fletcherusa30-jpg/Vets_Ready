#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build Vets Ready Desktop Application (Electron)
.DESCRIPTION
    Builds desktop applications for Windows, macOS, and Linux using Electron
.PARAMETER Platform
    Target platform: windows, mac, linux, or all
.PARAMETER Architecture
    Architecture: x64, arm64, or all
.EXAMPLE
    .\Build-Desktop.ps1 -Platform windows -Architecture x64
#>

param(
    [ValidateSet("windows", "mac", "linux", "all")]
    [string]$Platform = "windows",
    [ValidateSet("x64", "arm64", "all")]
    [string]$Architecture = "x64",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$InfoColor = "Cyan"
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"

function Write-Step { param([string]$Message); Write-Host "`n[STEP] $Message" -ForegroundColor $InfoColor }
function Write-Success { param([string]$Message); Write-Host "✓ $Message" -ForegroundColor $SuccessColor }
function Write-Error { param([string]$Message); Write-Host "✗ $Message" -ForegroundColor $ErrorColor }
function Write-Warning { param([string]$Message); Write-Host "⚠ $Message" -ForegroundColor $WarningColor }

Write-Host "`n=====================================================" -ForegroundColor $InfoColor
Write-Host "     Vets Ready Desktop Build (Electron)" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor
Write-Host "Platform: $Platform" -ForegroundColor $InfoColor
Write-Host "Architecture: $Architecture" -ForegroundColor $InfoColor
Write-Host "=====================================================" -ForegroundColor $InfoColor

# Verify Node.js
Write-Step "Verifying prerequisites..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion installed"
} catch {
    Write-Error "Node.js not found. Please install Node.js 18+"
    exit 1
}

# Check if desktop directory exists
if (-not (Test-Path "desktop")) {
    Write-Warning "Desktop directory not found. Creating from frontend..."
    New-Item -ItemType Directory -Path "desktop" -Force | Out-Null
}

# Install frontend dependencies
Write-Step "Installing frontend dependencies..."
Push-Location vets-ready-frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Failed to install frontend dependencies"
    exit 1
}
Pop-Location
Write-Success "Frontend dependencies installed"

# Build frontend (unless skipped)
if (-not $SkipBuild) {
    Write-Step "Building frontend for production..."
    Push-Location vets-ready-frontend
    $env:VITE_API_URL = "https://api.vetsready.com"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Frontend build failed"
        exit 1
    }
    Pop-Location
    Write-Success "Frontend built successfully"
}

# Copy frontend build to desktop
Write-Step "Preparing desktop application files..."
if (Test-Path "desktop\dist") {
    Remove-Item "desktop\dist" -Recurse -Force
}
Copy-Item "vets-ready-frontend\dist" "desktop\dist" -Recurse
Write-Success "Frontend copied to desktop"

# Create Electron main file if not exists
if (-not (Test-Path "desktop\main.js")) {
    Write-Step "Creating Electron main.js..."
    @"
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.png'),
        titleBarStyle: 'default',
        show: false
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create application menu
    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Vets Ready Documentation',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://vetsready.com/docs');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
"@ | Out-File -FilePath "desktop\main.js" -Encoding UTF8
    Write-Success "Electron main.js created"
}

# Create preload.js if not exists
if (-not (Test-Path "desktop\preload.js")) {
    @"
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    version: process.versions.electron
});
"@ | Out-File -FilePath "desktop\preload.js" -Encoding UTF8
}

# Create package.json for desktop if not exists
if (-not (Test-Path "desktop\package.json")) {
    Write-Step "Creating desktop package.json..."
    @"
{
  "name": "vets-ready-desktop",
  "version": "1.0.0",
  "description": "Vets Ready Desktop Application",
  "main": "main.js",
  "author": "Vets Ready",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win --x64",
    "build:win:arm": "electron-builder --win --arm64",
    "build:mac": "electron-builder --mac --x64",
    "build:mac:arm": "electron-builder --mac --arm64",
    "build:linux": "electron-builder --linux --x64",
    "build:all": "electron-builder --win --mac --linux"
  },
  "dependencies": {
    "electron-squirrel-startup": "^1.0.0"
  },
  "devDependencies": {
    "electron": "^28.1.0",
    "electron-builder": "^24.9.1"
  },
  "build": {
    "appId": "com.vetsready.app",
    "productName": "Vets Ready",
    "directories": {
      "output": "build"
    },
    "files": [
      "dist/**/*",
      "main.js",
      "preload.js",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "icon.icns",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "icon.png",
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
"@ | Out-File -FilePath "desktop\package.json" -Encoding UTF8
    Write-Success "Desktop package.json created"
}

# Install desktop dependencies
Write-Step "Installing desktop dependencies..."
Push-Location desktop
npm install
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Failed to install desktop dependencies"
    exit 1
}
Pop-Location
Write-Success "Desktop dependencies installed"

# Build desktop application
Push-Location desktop

$buildTargets = @()

if ($Platform -eq "windows" -or $Platform -eq "all") {
    if ($Architecture -eq "x64" -or $Architecture -eq "all") {
        $buildTargets += @("win", "x64")
    }
    if ($Architecture -eq "arm64" -or $Architecture -eq "all") {
        $buildTargets += @("win", "arm64")
    }
}

if ($Platform -eq "mac" -or $Platform -eq "all") {
    if ($Architecture -eq "x64" -or $Architecture -eq "all") {
        $buildTargets += @("mac", "x64")
    }
    if ($Architecture -eq "arm64" -or $Architecture -eq "all") {
        $buildTargets += @("mac", "arm64")
    }
}

if ($Platform -eq "linux" -or $Platform -eq "all") {
    if ($Architecture -eq "x64" -or $Architecture -eq "all") {
        $buildTargets += @("linux", "x64")
    }
}

foreach ($i in 0..($buildTargets.Length / 2 - 1)) {
    $targetPlatform = $buildTargets[$i * 2]
    $targetArch = $buildTargets[$i * 2 + 1]

    Write-Step "Building for $targetPlatform ($targetArch)..."

    npx electron-builder --$targetPlatform --$targetArch

    if ($LASTEXITCODE -eq 0) {
        Write-Success "$targetPlatform ($targetArch) build complete"
    } else {
        Write-Warning "$targetPlatform ($targetArch) build failed"
    }
}

Pop-Location

# Summary
Write-Host "`n=====================================================" -ForegroundColor $SuccessColor
Write-Host "     Desktop Build Complete!" -ForegroundColor $SuccessColor
Write-Host "=====================================================" -ForegroundColor $SuccessColor

Write-Host "`nOutput locations:" -ForegroundColor $InfoColor
Write-Host "  All builds: desktop\build\" -ForegroundColor $WarningColor

if (Test-Path "desktop\build") {
    $buildFiles = Get-ChildItem "desktop\build" -File
    foreach ($file in $buildFiles) {
        $size = [math]::Round($file.Length / 1MB, 2)
        Write-Host "    - $($file.Name) ($size MB)" -ForegroundColor $InfoColor
    }
}

Write-Host "`nNext steps:" -ForegroundColor $InfoColor
Write-Host "  1. Test installers on target platforms" -ForegroundColor $WarningColor
Write-Host "  2. Configure code signing certificates" -ForegroundColor $WarningColor
Write-Host "  3. Distribute via website or app stores" -ForegroundColor $WarningColor
