# 🇺🇸 Rally Forge - Comprehensive Veteran Support Platform

**Version:** 1.0.0 | **Last Updated:** January 28, 2026
**Project Root:** `C:\Dev\Rally Forge` ✅ **STRICTLY ENFORCED**
**Status:** Active Development | **Unified Application Structure**

---

## 🎯 Mission

**Empower every veteran to understand, prepare, and optimize their VA disability claims with confidence, clarity, and dignity.**

Rally Forge combines AI-powered legal theory generation, evidence organization, financial planning tools, and community resources—all while maintaining strict compliance with VA policies and veteran privacy.

---

## 📁 Project Structure

**Rally Forge now uses a unified, single-application structure.** See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete details.

### Primary Applications

- **`rally-forge-frontend/`** - React + TypeScript frontend application
- **`rally-forge-backend/`** - Python FastAPI backend application

### Quick Navigation

- **🧙 Disability Wizard** - 5-step guided claim strategy builder
  - Service-connected disabilities tracking
  - New/denied condition entry with secondary linking
  - AI-powered secondary condition discovery
  - Theory of entitlement generator (38 CFR + M21-1)
  - Export to Markdown/PDF

- **🤖 AI Theory Engine** - Legal framework generation
  - Direct service connection (38 CFR § 3.303)
  - Secondary connection (38 CFR § 3.310(a))
  - Aggravation theories
  - Presumptive service connection
  - Evidence recommendations with priorities

- **📊 Claim Tracker** - Status tracking through 12 VA claim phases
  - Progress visualization
  - Timeline history
  - Educational status explanations

- **📁 Evidence Organizer** - Document management with categorization
  - 5 evidence types (medical, service records, lay statements, nexus opinions, other)
  - Tag and note system
  - OCR text extraction (integration ready)

- **💾 Export Engine** - Multi-format claim strategy export
  - ✅ Markdown (fully functional)
  - ⏳ PDF (infrastructure ready)
  - ✅ JSON (structured data)

### ⏳ **In Progress (Phase 1 Completion)**

- Backend API endpoints (AI, disabilities, evidence)
- OpenAI integration (theory generation, secondary suggestions)
- OCR service (Tesseract.js + AWS Textract)

### 📋 **Coming Soon (Phase 2-5)**

- Financial Tools (comp estimator, COLA, retirement planner)
- Effective Date Calculator (AMA-compliant)
- AI Battle Buddy (chat assistant)
- VSO Locator (with maps)
- Mobile App (iOS/Android via Capacitor)
- [See full roadmap in docs/rallyforge_MASTER_SPEC.md]

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))
- **Redis** 7+ (Optional, for caching)
- **Git** ([Download](https://git-scm.com/))

### 1. Clone Repository

```powershell
git clone https://github.com/your-org/rally-forge.git
cd "C:\Dev\Rally Forge"
```

### 2. Set Up Environment

Create `.env` file:
```bash
# Backend
DATABASE_URL=postgresql://postgres:password@localhost:5432/rallyforge
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-key-here
USE_MOCK_AI=true  # Set false to use real OpenAI

# Frontend
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_AI=true
```

### 3. Start Development

```powershell
# One-click startup (recommended)
.\scripts\Start-rallyforge.ps1

# OR manual startup:

# Terminal 1 - Backend
cd rally-forge-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd rally-forge-frontend
npm install
npm run dev
```

### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger/OpenAPI)
- **Alternative Docs**: http://localhost:8000/redoc

---

## 📚 Documentation

### 🎯 Start Here

- **[DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** ⭐ **ORGANIZED DOCS** - Complete documentation index
- **[rallyforge_MASTER_SPEC.md](docs/rallyforge_MASTER_SPEC.md)** - Complete platform specification
- **[DEVELOPER_ONBOARDING.md](docs/DEVELOPER_ONBOARDING.md)** - Setup guide for new developers

### 📁 Documentation by Category

- **[Implementation Guides](docs/implementation/)** - Feature implementations, integrations, system builds
- **[Quick Start Guides](docs/guides/)** - Setup guides, quick references, API documentation
- **[Status Reports](docs/status-reports/)** - Completion reports, status updates, progress tracking
- **[Testing](docs/testing/)** - Test guides, scripts, results
- **[Scanners](docs/scanners/)** - DD214, VBMS, document scanner documentation
- **[Architecture](docs/architecture/)** - System design, code patterns, UI/UX blueprints
- **[Deployment](docs/deployment/)** - Production setup, deployment guides, checklists

### 📖 Core Documentation

- **[COMPLIANCE_AND_PRIVACY.md](docs/COMPLIANCE_AND_PRIVACY.md)** - Legal boundaries, data handling, privacy
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and data flows
- **[API.md](docs/API.md)** - API endpoint documentation
- **[WIZARD_README.md](rally-forge-frontend/WIZARD_README.md)** - Disability Wizard implementation guide

### 🔧 Additional Resources

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment procedures
- **[TESTING.md](docs/TESTING.md)** - Testing strategy and examples
- **[DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)** - Code style and git workflow

---

## 🏗️ Project Structure

```
C:\Dev\Rally Forge\               # ⚠️ ONLY VALID PROJECT ROOT
│
├── docs/                              # All documentation
│   ├── rallyforge_MASTER_SPEC.md      # Master specification (source of truth)
│   ├── IMPLEMENTATION_TASKS.md       # Task list & progress
│   ├── DEVELOPER_ONBOARDING.md       # Developer setup guide
│   ├── COMPLIANCE_AND_PRIVACY.md     # Legal & privacy
│   └── ...
│
├── scripts/                           # Automation scripts
│   ├── Start-rallyforge.ps1           # One-click dev startup
│   ├── Build-rallyforge.ps1           # Build all services
│   └── Test-rallyforge.ps1            # Run all tests
│
├── rally-forge-frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/wizard/        # Disability Wizard (5 steps)
│   │   ├── components/               # EvidenceOrganizer, ClaimTracker
│   │   ├── services/                 # aiService, exportService
│   │   ├── types/wizard.types.ts     # Core data models
│   │   └── App.tsx                   # Root component
│   ├── package.json
│   └── vite.config.ts
│
├── rally-forge-backend/               # FastAPI Python backend
│   ├── app/
│   │   ├── routers/                  # API endpoints
│   │   │   ├── ai.py                 # AI theory generation ✅ NEW
│   │   │   ├── claims.py             # Claim tracking
│   │   │   └── ...
│   │   ├── services/                 # Business logic
│   │   │   ├── ai_service.py         # OpenAI integration ✅ NEW
│   │   │   └── ...
│   │   ├── schemas/                  # Pydantic models
│   │   │   ├── ai_schemas.py         # AI request/response ✅ NEW
│   │   │   └── ...
│   │   ├── models/                   # Database models
│   │   └── main.py                   # FastAPI app
│   ├── requirements.txt
│   └── alembic/                      # Database migrations
│
├── rally-forge-mobile/                # Capacitor mobile app (stub)
│
├── docker-compose.yml                # Development environment
└── .env.example                      # Environment variables template
```

---

## 🚀 Key Features

### Disability Wizard (5-Step Flow)

1. **Service-Connected Disabilities** - Confirm existing SC conditions
2. **Add Conditions** - Add new/denied conditions with secondary linking
3. **AI Suggestions** - Discover plausible secondary conditions
4. **Theory Builder** - Generate legal theories with CFR citations
5. **Review & Export** - Export strategy to Markdown/PDF

**Files**:
- `rally-forge-frontend/src/components/wizard/DisabilityWizard.tsx`
- `rally-forge-frontend/src/components/wizard/Step*.tsx` (5 steps)

### AI Theory Engine

**Generates**:
- Legal framework (38 CFR § 3.303, § 3.310, etc.)
- Medical nexus rationale
- Evidence recommendations (critical/important/helpful)
- Strength assessment (strong/moderate/weak)
- Challenges and opportunities

**Mock Data Coverage**:
- PTSD → Sleep Apnea, MDD, GERD, ED
- Knee → Lower back, hip pain
- Back → Radiculopathy, sleep disturbance
- Tinnitus → Migraines
- Diabetes → Neuropathy, ED

**Files**:
- `rally-forge-frontend/src/services/aiService.ts` (frontend)
- `rally-forge-backend/app/services/ai_service.py` (backend) ✅ NEW
- `rally-forge-backend/app/routers/ai.py` (API endpoints) ✅ NEW

### Evidence Organizer

**Features**:
- 5 evidence types with icons (🏥📋✍️⚖️📄)
- Upload modal with categorization
- Tag and note system
- OCR text extraction (integration ready)
- AI summary generation (integration ready)

**File**: `rally-forge-frontend/src/components/EvidenceOrganizer.tsx`

### Claim Tracker

**Features**:
- 12 claim statuses (not-filed → completed/denied/appealed)
- Progress visualization (0-100%)
- Timeline history with dates and notes
- Educational explanations for each status
- Claim type tracking (original, supplemental, increase, appeal)

**File**: `rally-forge-frontend/src/components/ClaimTracker.tsx`

---

## 🤖 AI Integration

### OpenAI Configuration

**Model**: GPT-4 Turbo (fallback: GPT-3.5)
**Temperature**: 0.3 (factual accuracy)
**Max Tokens**: 2000

### Environment Variables

```bash
OPENAI_API_KEY=sk-your-key-here  # Required for real AI
USE_MOCK_AI=true                 # Toggle mock/real mode
```

### Mock Mode (Development)

- Comprehensive mock data for 6+ condition types
- Medical literature references
- CFR citations (§ 3.303, § 3.310)
- VA approval patterns
- Confidence scores

**Toggle**: `VITE_USE_MOCK_AI=true` (frontend) or `USE_MOCK_AI=true` (backend)

---

## 🔒 Compliance & Legal Boundaries

### ✅ What rallyforge DOES

- Provides **educational guidance** on VA disability claims
- Generates **AI theories** labeled "educational only"
- Offers **tools** for evidence organization and tracking
- Calculates **effective dates** using public AMA regulations
- Connects veterans with **accredited VSOs**

### ❌ What rallyforge DOES NOT DO

- **NO VA.gov/eBenefits scraping** - Manual data entry only
- **NO credential storage** - Never store VA passwords
- **NO automated VA interactions** - No bots or auto-filing
- **NO legal advice** - Educational content only
- **NO medical diagnoses** - Only licensed physicians can diagnose
- **NO guarantees** - Success depends on evidence and VA evaluation

### Disclaimers (Every Page)

> **rallyforge is not affiliated with, endorsed by, or connected to the U.S. Department of Veterans Affairs (VA).**
> All AI-generated content is for educational purposes only and does not constitute legal, medical, or financial advice. Consult with an accredited VSO or VA-accredited attorney for personalized assistance.

See [docs/COMPLIANCE_AND_PRIVACY.md](docs/COMPLIANCE_AND_PRIVACY.md) for full guidelines.

---

## 🧪 Testing

### Frontend Tests

```powershell
cd rally-forge-frontend
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### Backend Tests

```powershell
cd rally-forge-backend
pytest                    # Run all tests
pytest --cov=app          # With coverage
pytest app/tests/test_ai_service.py  # Specific file
```

---

## 📦 Deployment

### Development (Docker Compose)

```powershell
docker-compose up -d      # Start all services
docker-compose logs -f    # View logs
docker-compose down       # Stop services
```

### Production (AWS)

**Services**:
- ECS/Fargate (containers)
- RDS PostgreSQL (database)
- ElastiCache Redis (caching)
- S3 (evidence storage)
- CloudFront (CDN)

**Deployment**:
```powershell
.\scripts\Deploy-rallyforge.ps1 -Environment production
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

---

## 🛠️ Development Scripts

All scripts in `scripts/` directory (PowerShell):

- **Start-rallyforge.ps1** - One-click dev startup
- **Build-rallyforge.ps1** - Build all services
- **Test-rallyforge.ps1** - Run all tests
- **Deploy-rallyforge.ps1** - Deploy to AWS

---

## 📊 Progress Tracking

### Phase 1: Core Claims Tools (60% Complete) ✅

| Feature | Status | Files |
|---------|--------|-------|
| Disability Wizard (5 steps) | ✅ Complete | DisabilityWizard.tsx, Step*.tsx |
| AI Theory Engine (mock) | ✅ Complete | aiService.ts, ai_service.py ✅ NEW |
| Secondary Discovery (mock) | ✅ Complete | aiService.ts, ai_service.py ✅ NEW |
| Evidence Organizer (UI) | ✅ Complete | EvidenceOrganizer.tsx |
| Claim Tracker | ✅ Complete | ClaimTracker.tsx |
| Export to Markdown | ✅ Complete | exportService.ts |
| Backend AI API | ✅ Complete | routers/ai.py ✅ NEW |
| OpenAI Integration | ⏳ In Progress | ai_service.py (mock ready) |
| OCR Service | ⏳ Not Started | - |
| PDF Export | ⏳ Infrastructure Ready | exportService.ts (needs jsPDF) |

See [docs/IMPLEMENTATION_TASKS.md](docs/IMPLEMENTATION_TASKS.md) for full task list.

---

## 🗺️ Roadmap

- **Phase 1** (Weeks 1-4): Core Claims Tools ← **Current Focus**
- **Phase 2** (Weeks 5-8): Financial & Effective Date Tools
- **Phase 3** (Weeks 9-12): Ecosystem & Community (VSO Locator, etc.)
- **Phase 4** (Weeks 13-16): Mobile App & Advanced Features
- **Phase 5** (Weeks 17+): Advanced Suites (Employment, Health, etc.)

See [docs/rallyforge_MASTER_SPEC.md](docs/rallyforge_MASTER_SPEC.md) for full roadmap.

---

## 🤝 Contributing

1. **Read Documentation**:
   - [rallyforge_MASTER_SPEC.md](docs/rallyforge_MASTER_SPEC.md)
   - [DEVELOPER_ONBOARDING.md](docs/DEVELOPER_ONBOARDING.md)
   - [DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)

2. **Create Feature Branch**:
   ```powershell
   git checkout -b feature/your-feature-name
   ```

3. **Follow Coding Standards**:
   - TypeScript: Functional components, type safety
   - Python: Type hints, Pydantic schemas, async/await
   - Commits: Conventional commits (`feat:`, `fix:`, `docs:`)

4. **Test Your Changes**:
   ```powershell
   npm run test      # Frontend
   pytest            # Backend
   ```

5. **Create Pull Request** with description and screenshots (if UI)

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Email**: dev@rallyforge.com

---

## 📜 License

Copyright © 2026 rallyforge Development Team. All rights reserved.

---

## 🇺🇸 Dedication

**Built with honor for those who served.**

This platform is dedicated to every veteran who served our country. Quality, privacy, and respect are paramount in everything we build.

---

**Last Updated**: January 24, 2026
**Maintained By**: rallyforge Development Team

### **🚀 Deployment & Production**
- **[PROJECT_CONFIRMATION.md](PROJECT_CONFIRMATION.md)** ✅ **START HERE** - Project structure verification (97.44% pass rate)
- **[PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md)** - Complete system architecture, scaling strategy, security (600+ lines)
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment procedures (400+ lines)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre/post-deployment validation
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - 30-minute deployment guide
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Official project structure reference

### **📋 All Documentation Files

### Getting Started
- **[GETTING-STARTED.md](docs/GETTING-STARTED.md)** - Quick start guide (5-min setup, common tasks)
- **[docs/root/QUICK_START.md](docs/root/QUICK_START.md)** - Legacy quick start (moved from root)
- **[EXECUTION-SUMMARY.md](EXECUTION-SUMMARY.md)** - What was built and why

### Architecture & Design
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design, data flows, deployment architecture
- **[MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md)** - All 9 modules with responsibilities & tech stack

### Development
- **[DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)** - Code style, naming, git workflow, security
- **[TESTING.md](docs/TESTING.md)** - Testing strategy, examples, frameworks for all platforms

### Operations
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment procedures, rollback, disaster recovery, IaC

### **🔧 Build & Automation Scripts**
All scripts in `scripts/` directory:
- **[Deploy-Docker.ps1](scripts/Deploy-Docker.ps1)** - Build and push Docker images to Docker Hub
- **[Build-Android.ps1](scripts/Build-Android.ps1)** - Build Android APK/AAB for Google Play
- **[Build-iOS.sh](scripts/Build-iOS.sh)** - Build iOS IPA for App Store (macOS only)
- **[Build-Desktop.ps1](scripts/Build-Desktop.ps1)** - Build Electron desktop apps (Windows/macOS/Linux)
- **[Validate-Deployment.ps1](scripts/Validate-Deployment.ps1)** - Comprehensive deployment validation
- **[Verify-ProjectStructure.ps1](scripts/Verify-ProjectStructure.ps1)** ✅ - Verify project paths and structure
- **[Rebuild-CleanRepo.ps1](scripts/Rebuild-CleanRepo.ps1)** - Clean repository rebuild

### Cleanup Note
- Root docs are being consolidated under [docs/root](docs/root/). See [docs/ROOT_DOCS_INDEX.md](docs/ROOT_DOCS_INDEX.md) for updated paths.

---

## 🚀 Quick Links

### For Different Roles

**🎓 New Team Members**
1. Read: [GETTING-STARTED.md](docs/GETTING-STARTED.md) (10 min)
2. Read: [ARCHITECTURE.md](docs/ARCHITECTURE.md) (15 min)
3. Skim: [MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md) (5 min)
4. Run: `npm run dev` to start local stack

**👨‍💻 Frontend Developer**
- Start here: [GETTING-STARTED.md - Frontend Development](docs/GETTING-STARTED.md#frontend-development)
- Code standards: [DEVELOPMENT-STANDARDS.md - TypeScript Standards](docs/DEVELOPMENT-STANDARDS.md#typescriptfrontend-standards)
- Testing: [TESTING.md - Frontend Testing](docs/TESTING.md#frontend-testing)
- Module docs: [MODULE_PURPOSES.md - Frontend](docs/MODULE_PURPOSES.md#frontend-react--typescript)

**🐍 Backend Developer**
- Start here: [GETTING-STARTED.md - Backend Development](docs/GETTING-STARTED.md#backend-development)
- Code standards: [DEVELOPMENT-STANDARDS.md - Python Standards](docs/DEVELOPMENT-STANDARDS.md#pythonbackend-standards)
- Testing: [TESTING.md - Backend Testing](docs/TESTING.md#backend-testing)
- Dependencies: [backend/requirements.txt](backend/requirements.txt)
- Module docs: [MODULE_PURPOSES.md - Backend](docs/MODULE_PURPOSES.md#backend-fastapi)

**📱 Mobile Developer**
- Start here: [GETTING-STARTED.md - Mobile Development](docs/GETTING-STARTED.md#mobile-development)
- Architecture: [ARCHITECTURE.md - Mobile Modules](docs/ARCHITECTURE.md#system-modules)
- Testing: [TESTING.md - Mobile Testing](docs/TESTING.md#mobile-testing)
- Module docs: [MODULE_PURPOSES.md - Mobile & Android](docs/MODULE_PURPOSES.md#mobile-react-native--capacitor)

**🏗️ DevOps/Operations**
- Deployment: [DEPLOYMENT.md](docs/DEPLOYMENT.md) (complete guide)
- CI/CD: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)
- Cleanup: [scripts/Cleanup-Workspace.ps1](scripts/Cleanup-Workspace.ps1)
- IaC: [DEPLOYMENT.md - Infrastructure as Code](docs/DEPLOYMENT.md#infrastructure-as-code-iac)

**📋 Project Manager/Tech Lead**
- Architecture overview: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Module responsibilities: [MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md)
- Development standards: [DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)
- Deployment process: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

**🔐 Security/Compliance**
- Security standards: [DEVELOPMENT-STANDARDS.md - Security Standards](docs/DEVELOPMENT-STANDARDS.md#security-standards)
- Deployment security: [DEPLOYMENT.md - Security Checklist](docs/DEPLOYMENT.md#security-checklist-for-deployment)
- Architecture security: [ARCHITECTURE.md - Security Architecture](docs/ARCHITECTURE.md#security-architecture)

---

## 📂 File Structure

```
rallyforge/
│
├── � rally-forge-frontend/       ← React + TypeScript web application
│   ├── src/
│   │   ├── budget/              ← Budget planning module
│   │   ├── retirement/          ← Retirement calculator module
│   │   ├── transition/          ← Military transition toolkit
│   │   ├── jobboard/            ← Veteran job matching
│   │   ├── outreach/            ← Community & business discovery (Scout!)
│   │   ├── components/          ← Shared UI components
│   │   ├── pages/               ← Page components
│   │   └── types/               ← TypeScript types
│   └── package.json
│
├── 📁 rally-forge-backend/        ← FastAPI Python backend
│   ├── app/
│   │   ├── routers/             ← API route handlers
│   │   ├── services/            ← Business logic
│   │   ├── models/              ← Database models
│   │   └── main.py              ← FastAPI application
│   ├── requirements.txt
│   └── package.json
│
├── 📁 rally-forge-mobile/         ← Mobile app (Capacitor/React Native)
│   ├── android/                 ← Android platform
│   ├── ios/                     ← iOS platform
│   └── capacitor.config.ts
│
├── 📁 rally-forge-shared/         ← Shared types, utils, constants
│   ├── types/                   ← Common type definitions
│   └── schemas/                 ← Validation schemas
│
├── 📁 docs/                      ← Comprehensive documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── OUTREACH_SYSTEM.md       ← Scout system documentation
│   └── DEPLOYMENT.md
│
├── 📁 data/                      ← Database schemas & seed data
│   └── schema.sql
│
└── 📁 scripts/                   ← Automation scripts
│   ├── GETTING-STARTED.md           ← Start here!
│   ├── ARCHITECTURE.md              ← System design
│   ├── MODULE_PURPOSES.md           ← Module breakdown
│   ├── DEPLOYMENT.md                ← Deployment guide
│   ├── TESTING.md                   ← Testing strategy
│   ├── DEVELOPMENT-STANDARDS.md     ← Code standards
│   └── EXECUTION-SUMMARY.md         ← What was built
│
├── 🔧 Configuration & Automation
│   ├── .github/workflows/ci-cd.yml  ← CI/CD pipeline
│   ├── .gitignore                   ← Git ignore rules
│   ├── scripts/Cleanup-Workspace.ps1 ← Cleanup automation
│   └── backend/pytest.ini            ← Test configuration
│
├── 🎯 Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   └── tests/
│
├── 🐍 Backend (FastAPI)
│   ├── app/
│   ├── requirements.txt              ← Dependencies (19 packages)
│   ├── pytest.ini                    ← Pytest configuration
│   └── tests/
│       ├── conftest.py              ← Shared fixtures
│       ├── unit/                    ← Unit tests
│       └── integration/             ← Integration tests
│
├── 📱 Mobile (React Native)
│   ├── src/
│   ├── capacitor.config.ts
│   └── tests/
│
├── 🖥️ Desktop (Electron)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── 🤖 AI Engine (Python ML)
│   ├── engine.py
│   ├── model.json
│   └── tools/
│
└── 📊 Data & Config
    ├── data/
    ├── config/
    └── SQL/
```

---

## 🎓 Learning Paths

### Path 1: Local Development Setup (1 hour)
1. Clone repository
2. Follow [GETTING-STARTED.md - Quick Start](docs/GETTING-STARTED.md#quick-start-5-minutes)
3. Review [DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md) for your language
4. Start with your first task/issue

### Path 2: Full System Understanding (3 hours)
1. [GETTING-STARTED.md](docs/GETTING-STARTED.md) - Overview (30 min)
2. [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Deep dive (45 min)
3. [MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md) - Each module (90 min)
4. Walk the codebase with docs in hand

### Path 3: Write Tests & Deploy (2 hours)
1. [TESTING.md](docs/TESTING.md) - Testing strategy (30 min)
2. [backend/tests/](backend/tests/) - Review examples (30 min)
3. Write your first test following examples
4. [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Understand deployment (30 min)

---

## 🔍 Common Questions & Answers

### "How do I get started?"
→ [GETTING-STARTED.md](docs/GETTING-STARTED.md)

### "What does each module do?"
→ [MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md)

### "How should I format code?"
→ [DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)

### "How do I write tests?"
→ [TESTING.md](docs/TESTING.md)

### "How do I deploy?"
→ [DEPLOYMENT.md](docs/DEPLOYMENT.md)

### "What's the system architecture?"
→ [ARCHITECTURE.md](docs/ARCHITECTURE.md)

### "Where do I find the cleanup script?"
→ [scripts/Cleanup-Workspace.ps1](scripts/Cleanup-Workspace.ps1)

### "What are the backend dependencies?"
→ [backend/requirements.txt](backend/requirements.txt)

### "How's the CI/CD set up?"
→ [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

### "What was actually built?"
→ [EXECUTION-SUMMARY.md](EXECUTION-SUMMARY.md)

---

## 📋 Command Reference

### Setup & Installation
```bash
# Clone and install all modules
git clone https://github.com/yourorg/phoneapp.git
cd phoneapp
npm install                    # Root dependencies
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..
# ... repeat for mobile, desktop
```

### Development - Start All Services
```bash
# From root directory
npm run dev

# Or start individually:
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
cd mobile && npm start
```

### Testing
```bash
# Backend tests
cd backend && pytest -v --cov

# Frontend tests
cd frontend && npm test

# All tests
npm run test:all
```

### Code Quality
```bash
cd backend
black .               # Format Python
flake8 .              # Lint Python
mypy .                # Type check

cd ../frontend
npm run lint          # Lint TypeScript
npm run format        # Format with Prettier
```

### Database
```bash
cd backend
alembic upgrade head           # Run migrations
alembic downgrade -1           # Undo last migration
python scripts/seed_data.py    # Load seed data
```

### Cleanup
```bash
# Archive backups and remove duplicates
.\scripts/Cleanup-Workspace.ps1 -Force -BackupPath "C:\Backups\PhoneApp_..."
```

---

## 🔗 External References

- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React Docs:** https://react.dev
- **Capacitor Docs:** https://capacitorjs.com
- **SQLAlchemy Docs:** https://docs.sqlalchemy.org
- **Pytest Docs:** https://docs.pytest.org
- **GitHub Actions:** https://docs.github.com/en/actions

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] All dependencies installed (`npm list`, `pip list`)
- [ ] Environment variables set (`.env` file exists)
- [ ] Database initialized (`alembic upgrade head`)
- [ ] Services start without error (`npm run dev`)
- [ ] Tests pass locally (`pytest`, `npm test`)
- [ ] Linting passes (`npm run lint`, `flake8`)

---

## 🆘 Need Help?

1. **Quick answers:** Check [DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)
2. **Technical issues:** Search [GETTING-STARTED.md - Common Issues](docs/GETTING-STARTED.md#common-issues--solutions)
3. **Deployment:** Review [DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. **Testing:** Refer to [TESTING.md - Troubleshooting](docs/TESTING.md#troubleshooting-tests)
5. **Not found:** Check [MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md) for context

---

## 📅 Documentation Maintenance

- **Updated:** January 23, 2026
- **Reviewed by:** Development Team
- **Next Review:** April 23, 2026

---

## 📞 Support

For questions about:
- **Code standards:** See [DEVELOPMENT-STANDARDS.md](docs/DEVELOPMENT-STANDARDS.md)
- **Specific module:** See [MODULE_PURPOSES.md](docs/MODULE_PURPOSES.md)
- **Testing:** See [TESTING.md](docs/TESTING.md)
- **Operations:** See [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---


**🎉 Welcome to PhoneApp 2.0 Development!**

Start with [GETTING-STARTED.md](docs/GETTING-STARTED.md) and happy coding! 🚀

---

## Key VA Public Resources

<div style="color: white; background: #1a1a1a; padding: 1em; border-radius: 8px;">

<ul>
  <li><b>38 CFR (Code of Federal Regulations):</b> <a href="https://www.ecfr.gov/current/title-38" style="color: white; text-decoration: underline;">https://www.ecfr.gov/current/title-38</a></li>
  <li><b>VA Forms Directory:</b> <a href="https://www.va.gov/find-forms/" style="color: white; text-decoration: underline;">https://www.va.gov/find-forms/</a></li>
  <li><b>VA Main Site:</b> <a href="https://www.va.gov/" style="color: white; text-decoration: underline;">https://www.va.gov/</a></li>
</ul>

<p><b>Note:</b> The M21-1 Adjudication Procedures Manual (https://www.knowva.ebenefits.va.gov/) is not reliably accessible to the public as of January 2026. For regulatory guidance, use the 38 CFR link above.</p>

</div>


