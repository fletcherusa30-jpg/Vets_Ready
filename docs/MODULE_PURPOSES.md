# Module Purposes & Responsibilities

## Core Application Modules

### **Frontend** (`frontend/`)
**Purpose:** User-facing web application for veterans and representatives

**Responsibilities:**
- Veterans dashboard (profile, claims history, benefits status)
- Claims analyzer interface with real-time input validation
- Condition selector with AI-powered recommendations
- Benefits calculator with SMC breakdown
- Document upload & management
- Authentication flow (OAuth2 integration)
- Responsive design (mobile-first)
- Error handling & user feedback
- State management (Redux/Zustand)
- API client integration (REST calls)

**Technology:** React 18+, TypeScript, Vite, Tailwind CSS, React Router, Axios/Fetch

**Key Files:**
- `src/pages/` - Route components
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/services/` - API integration
- `src/store/` - State management

---

### **Mobile** (`mobile/`)
**Purpose:** Cross-platform native mobile application (iOS & Android)

**Responsibilities:**
- Native mobile UI optimized for small screens
- Offline-first functionality with local storage
- Document scanning via camera
- Push notification handling
- Biometric authentication (Touch/Face ID)
- Native file system access
- Background sync for data
- Deep linking support
- App permissions management

**Technology:** React Native, Capacitor, TypeScript, React Navigation

**Key Files:**
- `src/screens/` - Mobile-specific screens
- `src/native/` - Native module bridges
- `capacitor.config.ts` - Capacitor configuration
- `package.json` - Mobile dependencies

---

### **Android** (`android/`)
**Purpose:** Native Android application using Gradle build system

**Responsibilities:**
- Native Android build & packaging
- Capacitor runtime & plugin integration
- Android manifest configuration
- Resource management (layouts, drawables, strings)
- Native module implementations
- App signing & release builds
- Android-specific permissions

**Technology:** Gradle, Java/Kotlin, Capacitor, AndroidX

**Key Files:**
- `app/build.gradle` - App-level build configuration
- `src/main/AndroidManifest.xml` - App manifest
- `src/main/java/` - Kotlin/Java code
- `src/main/res/` - Android resources

**Build Variants:**
- `debug` - Development builds with debug symbols
- `release` - Optimized APK for distribution

---

### **Desktop** (`desktop/`)
**Purpose:** Cross-platform desktop application (Windows, Mac, Linux)

**Responsibilities:**
- Native desktop window management
- File system operations (drag-drop import)
- Offline document processing
- System tray integration
- Native menu & shortcuts
- Auto-update handling
- Security sandbox (preload script)
- System notifications
- Crash reporting

**Technology:** Electron, React, TypeScript, electron-builder

**Key Files:**
- `electron/main.js` - Electron main process
- `electron/preload.js` - IPC bridge (security)
- `src/` - React UI (shared with web)
- `electron-builder.yml` - Build configuration

---

### **Backend** (`backend/`)
**Purpose:** Core API server providing business logic & data persistence

**Responsibilities:**
- RESTful API endpoints (CRUD operations)
- Request/response validation (Pydantic)
- Authentication & authorization (JWT/OAuth2)
- Database operations (SQLAlchemy ORM)
- Business logic (calculations, rules engine)
- AI engine orchestration
- Email notifications
- Logging & monitoring
- CORS & security headers
- Rate limiting

**Technology:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic, python-jose, passlib

**Key Files:**
- `app/main.py` - FastAPI app entrypoint
- `app/api/` - Route handlers (conditions, claims, benefits, auth, organizations)
- `app/models/` - SQLAlchemy database models
- `app/schemas/` - Pydantic request/response schemas
- `app/services/` - Business logic layer
- `app/database.py` - Database connection & migrations
- `requirements.txt` - Python dependencies

**API Endpoints:**
- `GET/POST /api/conditions` - Condition management
- `POST /api/claims/analyze` - Claims analysis
- `GET /api/benefits` - Benefits lookup
- `POST /api/auth/login` - Authentication
- `GET /api/organizations` - VA facilities

---

### **AI Engine** (`ai-engine/`)
**Purpose:** Machine learning & intelligent analysis for claims optimization

**Responsibilities:**
- CFR (Code of Federal Regulations) interpretation
- Medical evidence analysis
- Claims strategy optimization
- Secondary condition inference
- SMC qualification determination
- Priority recommendation calculation
- Confidence scoring

**Technology:** Python, TensorFlow/PyTorch, NLP models

**Key Modules:**
- `cfr_interpreter.py` - Parse & understand VA regulations
- `claimstrategyengine.py` - Generate optimal strategies
- `evidence_inference.py` - Analyze medical evidence
- `secondaryconditionmapper.py` - Map related conditions
- `model.json` - Pre-trained model weights

**Input:** Medical history, primary conditions, evidence
**Output:** Benefit recommendations, SMC calculations, strategy guidance

---

### **Data Layer** (`data/`)
**Purpose:** Seed data & database schema for VA benefits system

**Responsibilities:**
- Database schema definition (SQL)
- Master data initialization (conditions, organizations, benefits)
- Data validation rules
- Reference data maintenance

**Key Files:**
- `schema.sql` - Database schema (tables, relationships, indexes)
- `seed_conditions.json` - ~3000 VA service-connected conditions with:
  - Diagnostic codes (ICD-9/ICD-10)
  - Disability percentages (10-100%)
  - Secondary conditions list
- `seed_organizations.json` - VA medical facilities with:
  - Regional offices
  - Medical centers
  - Contact information
- `seed_benefits.json` - Federal & state benefits with:
  - Benefit names & descriptions
  - Rates by effective date
  - Eligibility requirements

---

### **Config** (`config/`)
**Purpose:** Environment-specific configuration & settings

**Files:**
- `appsettings.json` - Main configuration (dev/staging/prod)
- Settings for:
  - Database connections
  - API URLs
  - JWT secrets
  - Logging levels
  - Feature flags

---

### **Scripts** (`scripts/`)
**Purpose:** Automation & operational scripts

**Key Scripts:**
- `Bootstrap-All.ps1` - Initial project setup
- `Cleanup-Workspace.ps1` - Archive backups, remove duplicates
- `Start-Backend.bat` - Launch backend server
- Build scripts for Android/Desktop
- Deployment automation

---

### **Tests** (`tests/`)
**Purpose:** Test suites for all modules

**Coverage:**
- Frontend: Jest, React Testing Library
- Backend: pytest, coverage reports
- Mobile: Detox (E2E)
- Integration tests

---

### **Docs** (`docs/`)
**Purpose:** Project documentation

**Key Documents:**
- `ARCHITECTURE.md` - System design & module overview
- `MODULE_PURPOSES.md` - This file
- API documentation (Swagger/OpenAPI)
- Deployment guides
- Developer setup instructions

---

### **SQL** (`SQL/`)
**Purpose:** Database migrations & initialization scripts

**Files:**
- Migration scripts for schema updates
- Data migration procedures
- Backup/restore procedures

---

## Integration Points

### Frontend ↔ Backend
- REST API calls via HTTP/HTTPS
- JWT token authentication
- Request/response validation
- CORS-enabled endpoints

### Backend ↔ AI Engine
- Function calls (Python)
- JSON input/output
- Async processing for long-running tasks

### Backend ↔ Database
- SQLAlchemy ORM
- Connection pooling
- Transaction management
- Migration framework (Alembic)

### Mobile/Desktop ↔ Frontend
- Capacitor plugins for native features
- Shared React component library
- Common state management

---

## Deployment Architecture

### Development Environment
- All modules run locally
- SQLite database
- Frontend dev server (Vite)
- Backend dev server (uvicorn)
- Mobile/Desktop emulators/simulators

### Production Environment
- Frontend: Deployed to CDN (S3 + CloudFront)
- Backend: Docker container on ECS/Container Instances
- Database: PostgreSQL (RDS) or managed SQLite
- AI Engine: Serverless function or dedicated container
- Monitoring: CloudWatch/Azure Monitor

---

## Technology Summary

| Module | Language | Framework | Database |
|--------|----------|-----------|----------|
| Frontend | TypeScript | React + Vite | N/A |
| Mobile | TypeScript | React Native | Local Storage |
| Android | Kotlin | Gradle | N/A |
| Desktop | TypeScript | Electron | N/A |
| Backend | Python | FastAPI | SQLAlchemy/SQLite |
| AI Engine | Python | TensorFlow | N/A |
| Data | JSON/SQL | N/A | SQLite Schema |

