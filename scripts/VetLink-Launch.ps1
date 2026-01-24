
# VetLink Network — Full App Launcher

# Paths (edit if your structure is different)
$projectRoot = "C:\Dev\VetLinkNetwork"
$venvPath = "$projectRoot\.venv\Scripts\Activate"
$backendPath = "$projectRoot"
$frontendPath = "$projectRoot\frontend"
$desktopPath = "$projectRoot\desktop"

# 1. Launch Backend (FastAPI) in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; . '$venvPath'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
)

# 2. Launch Frontend (React) in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; npm run dev"
)

# 3. Launch Desktop (Electron) in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$desktopPath'; npm start"
)

Write-Host "All VetLink Network apps are launching in separate windows."
Write-Host "Press Enter to exit this launcher."
Read-Host






