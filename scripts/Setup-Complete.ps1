# ================================================
# Rally Forge - COMPLETE SETUP SCRIPT
# ================================================
# Run this ONCE to set up the entire application

Write-Host "`n🇺🇸 Rally Forge - COMPLETE SETUP 🇺🇸`n" -ForegroundColor Blue

$ErrorActionPreference = "Continue"

# ============================================
# BACKEND SETUP
# ============================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 1: Backend Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

cd "rally-forge-backend"

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green

# Create virtual environment
if (-not (Test-Path ".venv")) {
    Write-Host "`nCreating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
}

# Activate and install dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
.\.venv\Scripts\Activate.ps1
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

# Create .env file
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating backend .env file..." -ForegroundColor Yellow
    @"
# Rally Forge Backend Environment Variables
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///./instance/dev.db
JWT_SECRET=rally-forge-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3001,http://127.0.0.1:5173
LOG_LEVEL=INFO
ENABLE_AI_ENGINE=true
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Backend .env created" -ForegroundColor Green
} else {
    Write-Host "✓ Backend .env already exists" -ForegroundColor Green
}

# Initialize database
Write-Host "`nInitializing database..." -ForegroundColor Yellow
python scripts/init_db.py
Write-Host "✓ Database initialized" -ForegroundColor Green

# Seed database
Write-Host "`nSeeding database with test data..." -ForegroundColor Yellow
python scripts/seed_data.py 2>$null
Write-Host "✓ Database seeded" -ForegroundColor Green

cd ..

# ============================================
# FRONTEND SETUP
# ============================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  STEP 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

cd "rally-forge-frontend"

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "✓ Found: Node $nodeVersion" -ForegroundColor Green

# Create .env file
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating frontend .env file..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Frontend .env created" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend .env already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "`nInstalling Node dependencies..." -ForegroundColor Yellow
npm install --silent
Write-Host "✓ Node dependencies installed" -ForegroundColor Green

cd ..

# ============================================
# COMPLETION
# ============================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

Write-Host "🎯 Next Steps:`n" -ForegroundColor Yellow

Write-Host "1️⃣  Start all services:" -ForegroundColor Cyan
Write-Host "   .\Start-All-Services.ps1`n" -ForegroundColor White

Write-Host "2️⃣  Or start manually:" -ForegroundColor Cyan
Write-Host "   Backend:  cd rally-forge-backend; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "   Frontend: cd rally-forge-frontend; npm run dev`n" -ForegroundColor White

Write-Host "3️⃣  Open your browser:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs`n" -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  TEST CREDENTIALS" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  Email:    " -NoNewline
Write-Host "veteran@test.com" -ForegroundColor Green
Write-Host "  Password: " -NoNewline
Write-Host "password123`n" -ForegroundColor Green

Write-Host "🎖️  Serving Those Who Served 🇺🇸`n" -ForegroundColor Yellow

