# ================================================
# VETS READY - START ALL SERVICES
# ================================================
# This script starts both backend and frontend

Write-Host "`n🇺🇸 VETS READY - STARTING ALL SERVICES 🇺🇸`n" -ForegroundColor Blue

# Check if backend .env exists
if (-not (Test-Path "vets-ready-backend\.env")) {
    Write-Host "⚠ Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "vets-ready-backend\.env.example" "vets-ready-backend\.env"
}

# Check if frontend .env exists
if (-not (Test-Path "vets-ready-frontend\.env")) {
    Write-Host "✓ Frontend .env file already exists" -ForegroundColor Green
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 1: Starting Backend Server (Port 8000)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Start backend in new terminal
$backendPath = Join-Path $PSScriptRoot "vets-ready-backend"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Starting Backend Server...' -ForegroundColor Green; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Write-Host "✓ Backend terminal opened`n" -ForegroundColor Green

Start-Sleep -Seconds 3

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 2: Starting Frontend Server (Port 5173)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Start frontend in new terminal
$frontendPath = Join-Path $PSScriptRoot "vets-ready-frontend"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '⚡ Starting Frontend Server...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Frontend terminal opened`n" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✅ VETS READY IS STARTING!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

Write-Host "🌐 Frontend: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:5173" -ForegroundColor Cyan

Write-Host "🔧 Backend API: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:8000" -ForegroundColor Cyan

Write-Host "📚 API Docs: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:8000/docs`n" -ForegroundColor Cyan

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  TEST CREDENTIALS (after seeding)" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  Email: " -NoNewline
Write-Host "veteran@test.com" -ForegroundColor Green
Write-Host "  Password: " -NoNewline
Write-Host "password123`n" -ForegroundColor Green

Write-Host "🎖️ Serving Those Who Served 🇺🇸" -ForegroundColor Yellow

Write-Host "`nPress Ctrl+C to stop this script (servers will continue running in other terminals)`n" -ForegroundColor Gray

# Keep script running
while ($true) {
    Start-Sleep -Seconds 60
}
