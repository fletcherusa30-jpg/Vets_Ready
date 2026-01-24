@echo off
REM PhoneApp 2.0 Development Startup Script (Windows)

echo.
echo ================================
echo PhoneApp 2.0 - Development Stack
echo ================================
echo.

REM Backend setup
echo [1/4] Setting up backend...
cd backend

if not exist ".env" (
  echo Creating .env from .env.example...
  copy .env.example .env > nul
)

if not exist "instance" (
  mkdir instance
)

echo Installing Python dependencies...
pip install -r requirements.txt > nul 2>&1

echo Initializing database...
python scripts/seed_data.py > nul 2>&1

cd ..

REM Frontend setup
echo [2/4] Setting up frontend...
cd frontend

if not exist "node_modules" (
  echo Installing npm dependencies...
  call npm install > nul 2>&1
)

cd ..

echo.
echo ================================
echo Setup complete!
echo ================================
echo.
echo To start development:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     uvicorn app.main:app --reload
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     npm run dev
echo.
echo Access points:
echo   - Frontend:     http://localhost:5173
echo   - Backend API:  http://localhost:8000
echo   - API Docs:     http://localhost:8000/docs
echo.
echo Test Account:
echo   - Email:    veteran@example.com
echo   - Password: securepassword123
echo.
pause
