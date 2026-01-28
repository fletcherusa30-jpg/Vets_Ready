# Vets Ready - Project Structure Verification

**Project Root:** `C:\Dev\Vets Ready`
**Status:** ✅ Verified January 24, 2026

---

## ✅ Official Project Structure

```
C:\Dev\Vets Ready\                    ← AUTHORITATIVE PROJECT ROOT
├── vets-ready-backend\               ← Backend API (FastAPI, Python)
├── vets-ready-frontend\              ← Frontend SPA (React, TypeScript, Vite)
├── vets-ready-mobile\                ← Mobile app (Capacitor, iOS/Android)
├── vets-ready-shared\                ← Shared code/types
├── android\                          ← Android native project
├── ios\                              ← iOS native project (if exists)
├── desktop\                          ← Electron desktop app
├── scripts\                          ← Build & deployment automation
│   ├── Deploy-Docker.ps1             ✅ Uses vets-ready-* paths
│   ├── Build-Android.ps1             ✅ Uses vets-ready-* paths
│   ├── Build-iOS.sh                  ✅ Uses vets-ready-* paths
│   ├── Build-Desktop.ps1             ✅ Uses vets-ready-* paths
│   ├── Validate-Deployment.ps1       ✅ Uses vets-ready-* paths
│   └── Rebuild-CleanRepo.ps1
├── docs\                             ← All documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT-STANDARDS.md
│   ├── TESTING.md
│   └── root\                         ← Legacy docs consolidated here
├── config\                           ← Configuration files
│   └── appsettings.json
├── ai-engine\                        ← AI/ML components
│   ├── cfr_interpreter.py
│   ├── claimstrategyengine.py
│   ├── evidence_inference.py
│   └── secondaryconditionmapper.py
├── data\                             ← Seed data & schemas
│   ├── schema.sql
│   ├── seed_conditions.json
│   └── seed_organizations.json
├── tests\                            ← Test files
├── _archive\                         ← Historical backups (gitignored)
├── .github\                          ← CI/CD workflows
│   └── workflows\
│       └── ci-cd.yml                 ✅ Uses vets-ready-* paths
├── docker-compose.prod.yml           ✅ Production orchestration
├── .env.production.example           ✅ Environment template
├── .gitignore                        ✅ Comprehensive exclusions
├── package.json                      ← Monorepo root package
├── README.md                         ✅ Main documentation index
├── PRODUCTION_ARCHITECTURE.md        ✅ System architecture & scaling
├── DEPLOYMENT_GUIDE.md               ✅ Deployment procedures
├── DEPLOYMENT_CHECKLIST.md           ✅ Pre/post-launch validation
├── QUICK_DEPLOY.md                   ✅ 30-minute deployment guide
└── PROJECT_STRUCTURE.md              ← This file
```

---

## ⚠️ Deprecated Paths - DO NOT USE

- ❌ `C:\VeteranApp` - **DEPRECATED**
- ❌ `frontend\` (root-level) - Use `vets-ready-frontend\`
- ❌ `backend\` (root-level) - Use `vets-ready-backend\`
- ❌ `mobile\` (root-level) - Use `vets-ready-mobile\`

---

## ✅ Script Path Verification

All build and deployment scripts use the correct structure:

### Deploy-Docker.ps1
```powershell
# ✅ Correct paths
Push-Location vets-ready-backend
python -m pytest tests/ -v
Pop-Location

Push-Location vets-ready-frontend
npm test -- --run
Pop-Location
```

### Build-Android.ps1
```powershell
# ✅ Correct paths
Push-Location vets-ready-frontend
npm install
npm run build
Pop-Location

Push-Location vets-ready-mobile
npx cap sync android
Pop-Location

Push-Location android
.\gradlew assembleDebug
Pop-Location
```

### Build-iOS.sh
```bash
# ✅ Correct paths
cd vets-ready-frontend
npm install
npm run build
cd ..

cd vets-ready-mobile
npx cap sync ios
cd ..

cd ios/App
pod install
xcodebuild archive ...
```

### Build-Desktop.ps1
```powershell
# ✅ Correct paths
Push-Location vets-ready-frontend
npm install
npm run build
Pop-Location

Copy-Item "vets-ready-frontend\dist" "desktop\dist" -Recurse

Push-Location desktop
npm install
npx electron-builder --win
Pop-Location
```

---

## 🔍 Environment Variable Paths

All environment configurations reference correct structure:

### .env.production.example
```bash
# Database
DATABASE_URL=postgresql://vetsready:PASS@postgres:5432/vetsready_db

# API URLs
API_BASE_URL=https://api.vetsready.com
FRONTEND_URL=https://vetsready.com
```

### Frontend (.env for Vite)
```bash
# vets-ready-frontend/.env.production
VITE_API_URL=https://api.vetsready.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_***
```

### Backend (.env)
```bash
# vets-ready-backend/.env
DATABASE_URL=postgresql://vetsready:PASS@localhost:5432/vetsready_db
CORS_ORIGINS=https://vetsready.com,https://app.vetsready.com
```

---

## 🐳 Docker Configuration Verification

### docker-compose.prod.yml
```yaml
services:
  backend:
    build:
      context: ./vets-ready-backend          # ✅ Correct path
      dockerfile: Dockerfile
    container_name: vetsready-backend

  frontend:
    build:
      context: ./vets-ready-frontend         # ✅ Correct path
      dockerfile: Dockerfile
    container_name: vetsready-frontend

  postgres:
    container_name: postgres
    image: postgres:15

  redis:
    container_name: redis
    image: redis:7-alpine
```

### Dockerfiles
- ✅ `vets-ready-backend/Dockerfile` - Exists and correct
- ✅ `vets-ready-frontend/Dockerfile` - Exists and correct
- ✅ `vets-ready-frontend/nginx.conf` - Exists and correct

---

## 🔧 CI/CD Pipeline Verification

### .github/workflows/ci-cd.yml
```yaml
jobs:
  validate-repo:
    # ✅ Scans entire C:\Dev\Vets Ready structure

  backend-tests:
    # ✅ Uses vets-ready-backend/
    - name: Run backend tests
      working-directory: vets-ready-backend
      run: pytest tests/

  frontend-tests:
    # ✅ Uses vets-ready-frontend/
    - name: Run frontend tests
      working-directory: vets-ready-frontend
      run: npm test

  docker-build:
    # ✅ Builds from correct paths
    - name: Build backend image
      run: docker build -t vetsready/vets-ready-backend:latest ./vets-ready-backend

    - name: Build frontend image
      run: docker build -t vetsready/vets-ready-frontend:latest ./vets-ready-frontend
```

---

## 📊 Path Usage Summary

| Component | Correct Path | Status |
|-----------|--------------|--------|
| Backend API | `vets-ready-backend/` | ✅ Verified |
| Frontend SPA | `vets-ready-frontend/` | ✅ Verified |
| Mobile App | `vets-ready-mobile/` | ✅ Verified |
| Shared Code | `vets-ready-shared/` | ✅ Verified |
| Android Native | `android/` | ✅ Verified |
| Desktop App | `desktop/` | ✅ Verified |
| Scripts | `scripts/` | ✅ Verified |
| Documentation | `docs/` | ✅ Verified |
| AI Engine | `ai-engine/` | ✅ Verified |
| Docker Compose | `docker-compose.prod.yml` | ✅ Verified |

---

## 🚀 Quick Validation Commands

Run these from `C:\Dev\Vets Ready\`:

```powershell
# Verify project root
Get-Location
# Should output: C:\Dev\Vets Ready

# Verify subdirectories exist
Test-Path vets-ready-backend
Test-Path vets-ready-frontend
Test-Path vets-ready-mobile
Test-Path scripts
Test-Path docs
# All should return: True

# Test scripts run from correct location
.\scripts\Validate-Deployment.ps1 -Environment local

# Build Docker images
.\scripts\Deploy-Docker.ps1 -Version "test" -SkipTests -SkipPush

# Verify Docker Compose
docker-compose -f docker-compose.prod.yml config
# Should show vetsready-backend, vetsready-frontend, postgres, redis
```

---

## 📝 Developer Guidelines

### ✅ DO

1. **Always run scripts from project root:**
   ```powershell
   cd "C:\Dev\Vets Ready"
   .\scripts\Deploy-Docker.ps1
   ```

2. **Use relative paths in scripts:**
   ```powershell
   Push-Location vets-ready-backend
   # ... commands ...
   Pop-Location
   ```

3. **Reference docs with correct paths:**
   ```markdown
   See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   See [Architecture](docs/ARCHITECTURE.md)
   ```

### ❌ DON'T

1. **Don't use absolute paths in scripts:**
   ```powershell
   # ❌ BAD
   cd "C:\Dev\Vets Ready\vets-ready-backend"

   # ✅ GOOD
   Push-Location vets-ready-backend
   ```

2. **Don't reference deprecated paths:**
   ```powershell
   # ❌ BAD
   cd frontend
   cd backend
   cd "C:\VeteranApp"
   ```

3. **Don't hardcode environment-specific paths:**
   ```powershell
   # ❌ BAD
   DATABASE_URL=postgresql://localhost/veteranapp

   # ✅ GOOD
   DATABASE_URL=postgresql://localhost/vetsready_db
   ```

---

## 🔐 Security Note

The following are **gitignored** and never committed:
- `.env` (all variants: `.env.local`, `.env.production`)
- `_archive/` (historical backups)
- `desktop/` (Electron builds can be large)
- `android/build/` (compiled Android artifacts)
- `logs/` (runtime logs)
- `*.zip`, `*.exe`, `*.dmg` (large binaries)

---

## ✅ Verification Complete

**Project Root Confirmed:** `C:\Dev\Vets Ready`

All scripts, documentation, and configurations verified to use correct paths.
No references to deprecated `C:\VeteranApp` or incorrect directory names.

**Last Verified:** January 24, 2026
**Verified By:** Automated structure scan
**Status:** ✅ ALL SYSTEMS GO

---

**When in doubt, remember:**
```
C:\Dev\Vets Ready  ← This is the only truth
```
