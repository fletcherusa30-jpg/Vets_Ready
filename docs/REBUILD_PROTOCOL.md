# Vets Ready Platform - Complete Rebuild Protocol

**Version:** 1.0
**Date:** January 26, 2026
**Purpose:** Complete disaster recovery and project rebuild from zero

---

## 🎯 Overview

This protocol enables complete reconstruction of the Vets Ready platform from scratch. Follow these steps in order to rebuild the entire system with full functionality.

---

## 📋 Prerequisites

### Required Tools
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))
- **Redis** 7+ (Optional, for caching)
- **Docker** (Optional, for containerized deployment)

### Required Accounts
- GitHub account (for code repository)
- OpenAI API key (for AI features)
- Stripe account (for payments)

---

## 🔄 Rebuild Steps

### Phase 1: Environment Setup

#### Step 1.1: Create Project Root
```powershell
# Create main project directory
New-Item -Path "c:\Dev\Vets Ready" -ItemType Directory -Force
Set-Location "c:\Dev\Vets Ready"
```

#### Step 1.2: Initialize Git Repository
```powershell
git init
git remote add origin https://github.com/your-org/vets-ready.git
```

#### Step 1.3: Validate Environment
```powershell
.\scripts\Initialize-Environment.ps1
```

**Expected Output:** All required tools installed and compatible

---

### Phase 2: Backend Reconstruction

#### Step 2.1: Create Backend Structure
```powershell
# Create backend folders
New-Item -Path "vets-ready-backend\app\routers" -ItemType Directory -Force
New-Item -Path "vets-ready-backend\app\services" -ItemType Directory -Force
New-Item -Path "vets-ready-backend\app\models" -ItemType Directory -Force
New-Item -Path "vets-ready-backend\app\schemas" -ItemType Directory -Force
New-Item -Path "vets-ready-backend\ai-engine" -ItemType Directory -Force
New-Item -Path "vets-ready-backend\tests" -ItemType Directory -Force
```

#### Step 2.2: Create Python Virtual Environment
```powershell
Set-Location vets-ready-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

#### Step 2.3: Install Dependencies
```powershell
# Create requirements.txt with all dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose passlib bcrypt python-multipart pydantic pydantic-settings alembic redis stripe openai

# Save requirements
pip freeze > requirements.txt
```

#### Step 2.4: Create Core Backend Files

**app/main.py** - Main FastAPI application
**app/database.py** - Database configuration
**app/config.py** - Environment settings

#### Step 2.5: Create API Routers (23 routers)
```
app/routers/
├── auth.py              # Authentication & JWT
├── claims.py            # Claims analysis
├── retirement.py        # Retirement planning
├── conditions.py        # VA conditions
├── business.py          # Business resources
├── legal.py             # Legal references (M21-1, 38 CFR)
├── subscriptions.py     # Subscription management
├── employers.py         # Employer job postings
├── business_directory.py # Business listings
├── payments.py          # Stripe integration
├── badges.py            # Achievement system
├── theme.py             # UI customization
├── referrals.py         # Referral system
├── user_data.py         # User profile
├── ai.py                # AI engine integration
├── scanners.py          # Document scanners
├── dd214.py             # DD-214 extraction
├── entitlement.py       # Entitlement helper
└── revenue.py           # Revenue tracking
```

#### Step 2.6: Configure Environment
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env

# Edit .env with your settings
DATABASE_URL=postgresql://postgres:password@localhost:5432/vetsready
OPENAI_API_KEY=sk-your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
```

#### Step 2.7: Initialize Database
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE vetsready;"

# Run migrations
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head

# Seed data
python -m app.scripts.seed_database
```

---

### Phase 3: Frontend Reconstruction

#### Step 3.1: Create Frontend Structure
```powershell
Set-Location "c:\Dev\Vets Ready"

# Create React app with Vite
npm create vite@latest vets-ready-frontend -- --template react-ts
Set-Location vets-ready-frontend
```

#### Step 3.2: Install Dependencies
```powershell
npm install react-router-dom @tanstack/react-query axios zustand
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/react @types/react-dom
```

#### Step 3.3: Configure Tailwind CSS
```powershell
npx tailwindcss init -p
```

#### Step 3.4: Create Folder Structure
```powershell
New-Item -Path "src\pages" -ItemType Directory -Force
New-Item -Path "src\components\layout" -ItemType Directory -Force
New-Item -Path "src\hooks" -ItemType Directory -Force
New-Item -Path "budget" -ItemType Directory -Force
New-Item -Path "retirement" -ItemType Directory -Force
New-Item -Path "transition" -ItemType Directory -Force
New-Item -Path "jobboard" -ItemType Directory -Force
New-Item -Path "outreach" -ItemType Directory -Force
```

#### Step 3.5: Create Page Components
```
src/pages/
├── HomePage.tsx
├── BenefitsPage.tsx
├── ClaimsPage.tsx
├── TransitionPage.tsx
├── FinancePage.tsx
├── JobsBusinessPage.tsx
├── ResourcesPage.tsx
└── PartnersPage.tsx
```

#### Step 3.6: Create Layout Components
```
src/components/layout/
├── VetsReadyLayout.tsx
├── VetsReadyNav.tsx
└── VetsReadyFooter.tsx
```

#### Step 3.7: Configure Environment
```powershell
# Create .env
@"
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_AI=true
"@ | Out-File -FilePath .env -Encoding UTF8
```

---

### Phase 4: Mobile App Reconstruction

#### Step 4.1: Initialize Capacitor
```powershell
Set-Location "c:\Dev\Vets Ready"
New-Item -Path "vets-ready-mobile" -ItemType Directory -Force
Set-Location vets-ready-mobile

npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init "Vets Ready" "com.vetsready.app"
```

#### Step 4.2: Add Platforms
```powershell
npx cap add android
npx cap add ios
```

#### Step 4.3: Configure Capacitor
Edit `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vetsready.app',
  appName: 'Vets Ready',
  webDir: '../vets-ready-frontend/dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

---

### Phase 5: Scripts & Automation

#### Step 5.1: Create PowerShell Scripts
All scripts should be in `scripts/` directory:

- **Initialize-Environment.ps1** ✅ - Environment validation
- **Build-Frontend.ps1** ✅ - Frontend build automation
- **Run-Backend.ps1** ✅ - Backend server startup
- **Bootstrap-All.ps1** ✅ - Full project bootstrap
- **Validate-Structure.ps1** ✅ - Structure integrity check

#### Step 5.2: Create Startup Scripts
- **Start-VetsReady.ps1** - Unified startup
- **Start-All-Services.ps1** - All services launcher

---

### Phase 6: Documentation

#### Step 6.1: Create Documentation Structure
```powershell
New-Item -Path "docs" -ItemType Directory -Force
```

#### Step 6.2: Create Core Documentation
```
docs/
├── ARCHITECTURE.md
├── API.md
├── DEPLOYMENT.md
├── DEVELOPER_ONBOARDING.md
├── COMPLIANCE_AND_PRIVACY.md
└── REBUILD_PROTOCOL.md (this file)
```

---

### Phase 7: Data Layer

#### Step 7.1: Create Data Directories
```powershell
New-Item -Path "data" -ItemType Directory -Force
New-Item -Path "SQL" -ItemType Directory -Force
New-Item -Path "config" -ItemType Directory -Force
New-Item -Path "logs" -ItemType Directory -Force
```

#### Step 7.2: Create Seed Data
```
data/
├── seed_conditions.json      # VA conditions
├── seed_organizations.json   # Veteran organizations
└── cfr_references.json       # Legal references
```

---

## 🔍 Validation & Testing

### Step 8.1: Run Structure Validation
```powershell
.\scripts\Validate-Structure.ps1 -Detailed
```

**Expected:** 90%+ compliance

### Step 8.2: Test Backend
```powershell
.\scripts\Run-Backend.ps1 -Mode development

# In another terminal
Invoke-WebRequest http://localhost:8000/docs
```

**Expected:** API documentation loads

### Step 8.3: Test Frontend
```powershell
.\scripts\Build-Frontend.ps1 -Mode development

Set-Location vets-ready-frontend
npm run dev
```

**Expected:** Frontend accessible at http://localhost:5173

### Step 8.4: Run Full Integration Test
```powershell
.\Start-All-Services.ps1
```

**Expected:** All services start without errors

---

## 🚨 Self-Heal Procedures

### Issue: Missing Dependencies

**Frontend:**
```powershell
Set-Location vets-ready-frontend
Remove-Item -Recurse -Force node_modules
npm install
```

**Backend:**
```powershell
Set-Location vets-ready-backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: Database Connection Failed
```powershell
# Restart PostgreSQL
Restart-Service postgresql-x64-15

# Recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS vetsready;"
psql -U postgres -c "CREATE DATABASE vetsready;"

# Run migrations
Set-Location vets-ready-backend
alembic upgrade head
```

### Issue: Build Failures
```powershell
# Clean and rebuild frontend
.\scripts\Build-Frontend.ps1 -Clean -Install -Mode development

# Restart backend
.\scripts\Run-Backend.ps1 -Install -Mode development
```

### Issue: Port Already in Use
```powershell
# Find process on port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object OwningProcess

# Kill process
Stop-Process -Id <ProcessID> -Force

# Restart with different port
.\scripts\Run-Backend.ps1 -Port 8001
```

---

## 📊 Verification Checklist

After rebuild, verify all components:

- ✅ Environment validated (Node, Python, PostgreSQL)
- ✅ Backend running on port 8000
- ✅ Frontend running on port 5173
- ✅ Database connected and seeded
- ✅ API documentation accessible (/docs)
- ✅ All 23 routers responding
- ✅ Authentication working
- ✅ Mobile configurations present
- ✅ All scripts executable
- ✅ Documentation complete

---

## 🎯 Final Steps

### Step 9.1: Create Git Commit
```powershell
git add .
git commit -m "Complete rebuild - all systems operational"
git push origin main
```

### Step 9.2: Tag Release
```powershell
git tag -a v1.0-rebuild -m "Platform rebuild complete"
git push origin v1.0-rebuild
```

### Step 9.3: Generate Deployment Package
```powershell
.\scripts\Deploy-VetsReady.ps1 -Environment production
```

---

## 📞 Support & Resources

### Documentation References
- Technical Specification: `App/VeteranApp — Full Technical Specification.md`
- Master Design: `App/VetsReady – Master Design.md`
- Professional Blueprint: `App/Professional Master Blueprint.md`
- Pricing Guide: `App/Vets Ready Pricing Guide.md`

### Automation Scripts
- Bootstrap: `scripts/Bootstrap-All.ps1`
- Validation: `scripts/Validate-Structure.ps1`
- Environment: `scripts/Initialize-Environment.ps1`

---

## 🔄 Recovery Time Objectives

With this protocol:
- **Minimal Rebuild:** 2-3 hours (structure + critical files)
- **Full Rebuild:** 6-8 hours (complete with testing)
- **Production Deployment:** 10-12 hours (includes security hardening)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 26, 2026 | Initial rebuild protocol based on guidance documents |

---

**Document Status:** ✅ Complete
**Last Validated:** January 26, 2026
**Next Review:** June 26, 2026
