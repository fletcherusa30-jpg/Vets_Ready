# 🎖️ Rally Forge - QUICK COMMAND REFERENCE

## 🚀 QUICK START

### First Time Setup
```powershell
cd "C:\Dev\Rally Forge"
.\Setup-Complete.ps1
```

### Start Application
```powershell
.\Start-All-Services.ps1
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Test Login
- **Email**: veteran@test.com
- **Password**: password123

---

## 💻 MANUAL COMMANDS

### Backend (Python FastAPI)

```powershell
# Navigate to backend
cd "C:\Dev\Rally Forge\rally-forge-backend"

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database
python scripts/init_db.py

# Seed test data
python scripts/seed_data.py

# Start server
uvicorn app.main:app --reload

# Start on specific port
uvicorn app.main:app --reload --port 8000

# Start with host binding
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)

```powershell
# Navigate to frontend
cd "C:\Dev\Rally Forge\rally-forge-frontend"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run type check
npm run type-check
```

---

## 🗄️ DATABASE COMMANDS

### Initialize Database
```powershell
cd rally-forge-backend
.\.venv\Scripts\Activate.ps1
python scripts/init_db.py
```

### Seed Test Data
```powershell
python scripts/seed_data.py
```

### Reset Database (DANGER - Deletes all data!)
```powershell
# Delete database file
Remove-Item instance/dev.db

# Reinitialize
python scripts/init_db.py
python scripts/seed_data.py
```

### Database Location
- Development: `rally-forge-backend/instance/dev.db`
- Production: Use PostgreSQL (configure in `.env`)

---

## 🔧 TROUBLESHOOTING

### Backend Won't Start

```powershell
# Check Python version (need 3.11+)
python --version

# Recreate virtual environment
cd rally-forge-backend
Remove-Item -Recurse -Force .venv
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend Won't Start

```powershell
# Clear cache and reinstall
cd rally-forge-frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Port Already in Use

```powershell
# Find process using port 8000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

# Kill process
Stop-Process -Id <PID>

# Or use different port
uvicorn app.main:app --reload --port 8001

# For frontend port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess
Stop-Process -Id <PID>
```

### Database Errors

```powershell
# Reset database completely
cd rally-forge-backend
Remove-Item -Force instance/dev.db
python scripts/init_db.py
python scripts/seed_data.py
```

### CORS Errors

1. Check backend `.env` has correct frontend URL:
   ```
   CORS_ORIGINS=http://localhost:5173
   ```

2. Restart backend server

3. Clear browser cache

---

## 📦 DEPENDENCY MANAGEMENT

### Update Python Dependencies
```powershell
cd rally-forge-backend
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install --upgrade -r requirements.txt
```

### Update Node Dependencies
```powershell
cd rally-forge-frontend
npm update
```

### Check for Outdated Packages
```powershell
# Python
pip list --outdated

# Node
npm outdated
```

---

## 🧪 TESTING

### Test Backend API

```powershell
cd rally-forge-backend
.\.venv\Scripts\Activate.ps1

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_backend.py
```

### Test Frontend

```powershell
cd rally-forge-frontend

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Manual API Testing

Use Swagger UI: http://localhost:8000/docs

Or use curl:
```powershell
# Register user
curl -X POST "http://localhost:8000/api/auth/register" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🏗️ BUILD & DEPLOY

### Build Frontend for Production
```powershell
cd rally-forge-frontend
npm run build
# Output in: dist/
```

### Build Backend for Production
```powershell
cd rally-forge-backend
# Already production-ready, just deploy with:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Environment-Specific Builds

```powershell
# Development
npm run dev

# Production
npm run build
npm run preview
```

---

## 📊 MONITORING & LOGS

### View Backend Logs
Backend logs appear in terminal where `uvicorn` is running

### View Frontend Logs
- Browser console (F12)
- Network tab for API calls
- Terminal where `npm run dev` is running

### Check System Status

```powershell
# Check if services are running
Get-Process -Name python -ErrorAction SilentlyContinue
Get-Process -Name node -ErrorAction SilentlyContinue

# Check ports
Get-NetTCPConnection -LocalPort 8000,5173 -ErrorAction SilentlyContinue
```

---

## 🔐 SECURITY

### Change JWT Secret (IMPORTANT for production!)

Edit `rally-forge-backend/.env`:
```
JWT_SECRET=your-super-secret-key-minimum-32-characters-change-this-now!
```

Generate secure secret:
```powershell
# Generate random 64-character hex string
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[BitConverter]::ToString($bytes) -replace '-',''
```

---

## 📖 USEFUL URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend** | http://localhost:8000 | API server |
| **API Docs (Swagger)** | http://localhost:8000/docs | Interactive API docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc | Alternative API docs |

---

## 🎯 COMMON WORKFLOWS

### Adding a New Page

1. Create page component:
   ```powershell
   cd rally-forge-frontend/src/pages
   New-Item MyPage.tsx
   ```

2. Add route in `App.tsx`:
   ```typescript
   import { MyPage } from './pages/MyPage';
   // ...
   <Route path="/my-page" element={<MyPage />} />
   ```

3. Add navigation link:
   ```typescript
   <Link to="/my-page">My Page</Link>
   ```

### Adding a New API Endpoint

1. Create router in `rally-forge-backend/app/routers/`:
   ```python
   from fastapi import APIRouter
   router = APIRouter(prefix="/api/myfeature", tags=["My Feature"])
   ```

2. Register in `main.py`:
   ```python
   from app.routers import myfeature
   app.include_router(myfeature.router)
   ```

3. Create service layer in `rally-forge-frontend/src/services/api/`:
   ```typescript
   import api from '../../lib/api';
   export class MyFeatureService { ... }
   ```

---

## 💡 TIPS & TRICKS

### Hot Reload
- Both backend and frontend support hot reload
- Changes automatically update in browser
- No need to restart servers

### Browser DevTools
- F12 to open
- Network tab for API calls
- Console for errors
- React DevTools for component inspection

### API Testing
- Use Swagger UI at `/docs` for quick testing
- No auth needed for public endpoints
- Use "Authorize" button for protected endpoints

### Database Browsing
- Use DB Browser for SQLite
- Or use `sqlite3` command:
  ```powershell
  sqlite3 rally-forge-backend/instance/dev.db
  .tables
  SELECT * FROM users;
  ```

---

## 🆘 EMERGENCY COMMANDS

### Complete Reset (Nuclear Option)

```powershell
# Stop all services
Get-Process python,node | Stop-Process -Force

# Reset backend
cd rally-forge-backend
Remove-Item -Recurse -Force .venv, instance
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts/init_db.py
python scripts/seed_data.py

# Reset frontend
cd ../rally-forge-frontend
Remove-Item -Recurse -Force node_modules, dist
npm install

# Restart
cd ..
.\Start-All-Services.ps1
```

---

**🇺🇸 Quick Reference - Keep This Handy! 🇺🇸**

