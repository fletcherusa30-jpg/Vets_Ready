# VetsReady Implementation Tasks

**Project Root:** `C:\Dev\Vets Ready`
**Master Spec:** `docs/VETSREADY_MASTER_SPEC.md`
**Last Updated:** January 24, 2026

---

## Current Implementation Status

### ✅ **COMPLETED** (Ready for Production/Testing)

#### Frontend - Core Wizard System
- ✅ **Disability Wizard** (5-step flow) - `DisabilityWizard.tsx`
  - Step 1: Service-Connected Disabilities
  - Step 2: Add Conditions (with secondary linking)
  - Step 3: AI Secondary Suggestions
  - Step 4: Theory Builder
  - Step 5: Review & Export
- ✅ **AI Service** (mock data implementation) - `services/aiService.ts`
  - `generateSecondarySuggestions()`
  - `generateTheory()`
  - `analyzeClaimStrategy()`
  - Mock data for 6+ condition types
  - Environment-controlled API switching
- ✅ **Export Service** (Markdown functional) - `services/exportService.ts`
  - Markdown generation with 8 sections
  - Browser download functionality
  - JSON export
  - PDF infrastructure (needs jsPDF library)
- ✅ **Evidence Organizer** (UI complete) - `components/EvidenceOrganizer.tsx`
  - 5 evidence types with icons
  - Upload modal with categorization
  - Tag and note system
  - OCR/AI integration points ready
- ✅ **Claim Tracker** (full UI) - `components/ClaimTracker.tsx`
  - 12 claim statuses with progress visualization
  - Timeline history
  - Status update modal
  - Educational explanations

#### Frontend - Type System
- ✅ **TypeScript Types** - `types/wizard.types.ts`
  - Disability, AiEntitlementTheory, AiSuggestion
  - WizardState, ClaimStrategyExport
  - EvidenceDocument, Claim types

#### Backend - Infrastructure
- ✅ **FastAPI Setup** - `vets-ready-backend/app/main.py`
- ✅ **Database Connection** - `database.py`
- ✅ **Existing Routers** (need alignment with spec):
  - `claims.py`, `conditions.py`, `retirement.py`
  - `legal.py`, `business.py`, etc.
- ✅ **Existing Services**:
  - `claims_service.py`, `condition_service.py`
  - `retirement_service.py`, `legal_reference_service.py`

#### Documentation
- ✅ **Wizard README** - `vets-ready-frontend/WIZARD_README.md`
- ✅ **Master Specification** - `docs/VETSREADY_MASTER_SPEC.md`

---

## 🔨 **IN PROGRESS** (Needs Completion/Testing)

### Phase 1: Core Claims Tools (Current Focus)

#### P1.1: Backend API Alignment with Spec ⏳
**Priority**: CRITICAL
**Effort**: 3-5 days
**Status**: Partial - routers exist but don't match spec

**Tasks**:
- [ ] **Create/Update AI Router** (`app/routers/ai.py`)
  - [ ] `POST /api/ai/generate-theory` - Generate theory of entitlement
  - [ ] `POST /api/ai/secondary-suggestions` - Get secondary condition suggestions
  - [ ] `POST /api/ai/chat` - AI Battle Buddy chat endpoint
  - [ ] Request/response schemas matching frontend types

- [ ] **Create/Update Disabilities Router** (`app/routers/disabilities.py`)
  - [ ] `GET /api/disabilities` - Get all disabilities for user
  - [ ] `POST /api/disabilities` - Create new disability
  - [ ] `PUT /api/disabilities/:id` - Update disability
  - [ ] `DELETE /api/disabilities/:id` - Delete disability
  - [ ] Align with existing `conditions.py` or replace

- [ ] **Create/Update Evidence Router** (`app/routers/evidence.py`)
  - [ ] `POST /api/evidence/upload` - Upload evidence document (multipart)
  - [ ] `POST /api/evidence/ocr` - Trigger OCR processing
  - [ ] `GET /api/evidence/:id` - Get evidence document
  - [ ] `DELETE /api/evidence/:id` - Delete evidence document

- [ ] **Create/Update Claims Tracker Router** (`app/routers/claims.py`)
  - [ ] `GET /api/claims` - Get all claims for user
  - [ ] `POST /api/claims` - Create new claim
  - [ ] `PUT /api/claims/:id/status` - Update claim status
  - [ ] Align with existing claims.py or enhance

- [ ] **Create Effective Date Router** (`app/routers/effective_dates.py`)
  - [ ] `POST /api/effective-date/calculate` - Calculate effective date with AMA rules
  - [ ] Implement all AMA scenarios (ITF, supplemental, increased, etc.)

**Files to Create/Modify**:
- `vets-ready-backend/app/routers/ai.py` (NEW)
- `vets-ready-backend/app/routers/disabilities.py` (NEW or align with conditions.py)
- `vets-ready-backend/app/routers/evidence.py` (NEW)
- `vets-ready-backend/app/routers/claims.py` (ENHANCE existing)
- `vets-ready-backend/app/routers/effective_dates.py` (NEW)

---

#### P1.2: Backend Services Layer ⏳
**Priority**: CRITICAL
**Effort**: 5-7 days
**Status**: Partial - some services exist but need AI integration

**Tasks**:
- [ ] **AI Service** (`app/services/ai_service.py`)
  - [ ] OpenAI API client setup
  - [ ] `generate_theory()` - Theory generation with GPT-4
  - [ ] `generate_secondary_suggestions()` - Secondary suggestions
  - [ ] `chat()` - AI Battle Buddy chat
  - [ ] Prompt templates for each function
  - [ ] Response parsing and error handling
  - [ ] Caching strategy (Redis, 24-hour TTL)
  - [ ] Rate limiting (10 requests/hour per user)

- [ ] **OCR Service** (`app/services/ocr_service.py`)
  - [ ] Tesseract integration OR AWS Textract
  - [ ] `extract_text(file_path)` - Extract text from PDF/image
  - [ ] `generate_summary(text)` - AI summary of extracted text
  - [ ] File cleanup after processing

- [ ] **Effective Date Service** (`app/services/effective_date_service.py`)
  - [ ] `calculate_effective_date()` - AMA logic
  - [ ] Scenarios: ITF, original, supplemental, increased, dependency, reopened
  - [ ] Plain-language explanations
  - [ ] Recommendations based on scenario

- [ ] **Evidence Service** (`app/services/evidence_service.py`)
  - [ ] File upload handling (S3 or local storage)
  - [ ] Metadata management (type, tags, notes)
  - [ ] Integration with OCR service
  - [ ] Integration with AI service (summaries)

- [ ] **Theory Service** (`app/services/theory_service.py`)
  - [ ] Wrapper around AI service with business logic
  - [ ] CFR reference validation
  - [ ] Evidence recommendation logic
  - [ ] Strength assessment rules

**Files to Create/Modify**:
- `vets-ready-backend/app/services/ai_service.py` (NEW)
- `vets-ready-backend/app/services/ocr_service.py` (NEW)
- `vets-ready-backend/app/services/effective_date_service.py` (NEW)
- `vets-ready-backend/app/services/evidence_service.py` (NEW)
- `vets-ready-backend/app/services/theory_service.py` (NEW)

---

#### P1.3: Backend Data Models & Schemas ⏳
**Priority**: HIGH
**Effort**: 2-3 days
**Status**: Partial - some models exist

**Tasks**:
- [ ] **SQLAlchemy Models** (`app/models/`)
  - [ ] `disability.py` - Disability model (align with conditions.py or replace)
  - [ ] `evidence.py` - Evidence document model
  - [ ] `claim.py` - Claim tracker model (align with existing)
  - [ ] `profile.py` - Veteran profile model (if needed)

- [ ] **Pydantic Schemas** (`app/schemas/`)
  - [ ] `disability_schemas.py` - DisabilityCreate, DisabilityResponse
  - [ ] `ai_schemas.py` - TheoryRequest, TheoryResponse, SuggestionRequest, SuggestionResponse
  - [ ] `evidence_schemas.py` - EvidenceUpload, EvidenceResponse
  - [ ] `claim_schemas.py` - ClaimCreate, ClaimUpdate, ClaimResponse
  - [ ] `effective_date_schemas.py` - EffectiveDateRequest, EffectiveDateResponse

- [ ] **Alembic Migrations**
  - [ ] Create migration for new models
  - [ ] Run migrations to update database schema

**Files to Create/Modify**:
- `vets-ready-backend/app/models/disability.py` (NEW or align with condition.py)
- `vets-ready-backend/app/models/evidence.py` (NEW)
- `vets-ready-backend/app/models/claim.py` (ENHANCE existing)
- `vets-ready-backend/app/schemas/disability_schemas.py` (NEW)
- `vets-ready-backend/app/schemas/ai_schemas.py` (NEW)
- `vets-ready-backend/app/schemas/evidence_schemas.py` (NEW)
- `vets-ready-backend/app/schemas/claim_schemas.py` (NEW)
- `vets-ready-backend/app/schemas/effective_date_schemas.py` (NEW)

---

#### P1.4: Frontend - Connect to Backend APIs ⏳
**Priority**: HIGH
**Effort**: 2-3 days
**Status**: Not started - currently using mock data

**Tasks**:
- [ ] **Update aiService.ts**
  - [ ] Replace mock data with API calls to `/api/ai/*`
  - [ ] Add error handling for API failures
  - [ ] Add loading states
  - [ ] Keep mock data as fallback (controlled by env var)

- [ ] **Update EvidenceOrganizer.tsx**
  - [ ] Connect to `/api/evidence/upload` for file uploads
  - [ ] Trigger OCR processing after upload
  - [ ] Display OCR text and AI summary
  - [ ] Add error handling for upload failures

- [ ] **Update ClaimTracker.tsx**
  - [ ] Load claims from `/api/claims` on mount
  - [ ] Sync status updates to backend
  - [ ] Add error handling and retry logic

- [ ] **Create API Client** (`services/apiClient.ts`)
  - [ ] Axios or fetch wrapper
  - [ ] Authentication headers (if needed)
  - [ ] Error handling and retry logic
  - [ ] Request/response interceptors

**Files to Modify**:
- `vets-ready-frontend/src/services/aiService.ts`
- `vets-ready-frontend/src/components/EvidenceOrganizer.tsx`
- `vets-ready-frontend/src/components/ClaimTracker.tsx`
- `vets-ready-frontend/src/services/apiClient.ts` (NEW)

---

#### P1.5: OpenAI Integration & Prompt Engineering ⏳
**Priority**: HIGH
**Effort**: 3-4 days
**Status**: Not started

**Tasks**:
- [ ] **Set up OpenAI Client** (`app/services/ai_service.py`)
  - [ ] API key configuration (from env vars)
  - [ ] Model selection (GPT-4 Turbo vs GPT-3.5)
  - [ ] Temperature and parameter tuning

- [ ] **Prompt Templates** (`app/prompts/`)
  - [ ] `theory_generation.py` - System + user prompts for theories
  - [ ] `secondary_suggestions.py` - Prompts for secondary conditions
  - [ ] `chat_assistant.py` - System prompt for AI Battle Buddy
  - [ ] Include CFR knowledge in system prompts

- [ ] **Response Parsing**
  - [ ] JSON extraction from markdown code blocks
  - [ ] Validation of response structure
  - [ ] Fallback to mock data if parsing fails

- [ ] **Testing & Tuning**
  - [ ] Test with real condition examples
  - [ ] Adjust prompts for accuracy and tone
  - [ ] Validate CFR citations are correct

**Files to Create**:
- `vets-ready-backend/app/prompts/theory_generation.py` (NEW)
- `vets-ready-backend/app/prompts/secondary_suggestions.py` (NEW)
- `vets-ready-backend/app/prompts/chat_assistant.py` (NEW)

---

#### P1.6: PDF Export Integration ⏳
**Priority**: MEDIUM
**Effort**: 1-2 days
**Status**: Infrastructure ready, needs library

**Tasks**:
- [ ] **Install jsPDF Library**
  - [ ] `npm install jspdf` in frontend
  - [ ] Configure for TypeScript

- [ ] **Implement PDF Generation** (`services/exportService.ts`)
  - [ ] Update `generatePDFExport()` function
  - [ ] Format Markdown content for PDF layout
  - [ ] Add styling (headers, bullet points, page breaks)
  - [ ] Test with complex claim strategies

- [ ] **Add PDF Download Button** (StepReview.tsx)
  - [ ] Wire up to `generatePDFExport()`
  - [ ] Show loading state during generation
  - [ ] Handle errors

**Files to Modify**:
- `vets-ready-frontend/package.json` (add jsPDF)
- `vets-ready-frontend/src/services/exportService.ts`
- `vets-ready-frontend/src/components/wizard/StepReview.tsx`

---

## 📋 **NOT STARTED** (Future Phases)

### Phase 2: Financial & Effective Date Tools

#### P2.1: Effective Date Calculator Frontend
**Priority**: HIGH
**Effort**: 3-4 days
**Status**: Not started

**Tasks**:
- [ ] **Create UI Component** (`pages/EffectiveDateCalculator.tsx`)
  - [ ] Form inputs for scenario (claim type, dates, etc.)
  - [ ] Call backend `/api/effective-date/calculate`
  - [ ] Display effective date with plain-language explanation
  - [ ] Show CFR citations and recommendations

- [ ] **Integration with Wizard**
  - [ ] Add effective date projections to StepReview
  - [ ] Show estimated effective dates for each condition

**Files to Create**:
- `vets-ready-frontend/src/pages/EffectiveDateCalculator.tsx` (NEW)

---

#### P2.2: Financial Tools Suite
**Priority**: HIGH
**Effort**: 5-7 days
**Status**: Not started

**Tasks**:
- [ ] **Compensation Estimator** (`components/CompensationEstimator.tsx`)
  - [ ] Input current ratings
  - [ ] VA combined rating table calculation
  - [ ] Dependent allowances
  - [ ] Monthly compensation display
  - [ ] Projection with new claims

- [ ] **COLA Calculator** (`components/COLACalculator.tsx`)
  - [ ] Historical COLA data
  - [ ] Future projections
  - [ ] Year-over-year comparison

- [ ] **Retirement Planner** (`components/RetirementPlanner.tsx`)
  - [ ] Disability + military retirement combination
  - [ ] CRDP/CRSC calculations
  - [ ] Tax implications
  - [ ] Social Security interaction

- [ ] **Backend Endpoints** (`app/routers/financial.py`)
  - [ ] `POST /api/financial/compensation-estimate`
  - [ ] `POST /api/financial/cola-projection`
  - [ ] VA rate table data (2026 rates)

**Files to Create**:
- `vets-ready-frontend/src/components/FinancialTools.tsx` (NEW)
- `vets-ready-frontend/src/components/CompensationEstimator.tsx` (NEW)
- `vets-ready-frontend/src/components/COLACalculator.tsx` (NEW)
- `vets-ready-frontend/src/components/RetirementPlanner.tsx` (NEW)
- `vets-ready-backend/app/routers/financial.py` (ENHANCE or NEW)
- `vets-ready-backend/app/services/financial_service.py` (NEW)

---

#### P2.3: AI Battle Buddy (Chat Interface)
**Priority**: MEDIUM
**Effort**: 4-5 days
**Status**: Not started

**Tasks**:
- [ ] **Chat UI Component** (`components/AIBattleBuddy.tsx`)
  - [ ] Message history display
  - [ ] Input field and send button
  - [ ] Streaming responses (Server-Sent Events)
  - [ ] Context awareness (include user's claim data)
  - [ ] Suggested questions
  - [ ] Educational disclaimers

- [ ] **Backend Chat Endpoint** (`app/routers/ai.py`)
  - [ ] `POST /api/ai/chat` - Chat completion
  - [ ] System prompt with CFR knowledge
  - [ ] Include user's WizardState in context
  - [ ] Streaming responses

- [ ] **Chat Service** (`app/services/ai_service.py`)
  - [ ] `chat(messages, context)` - OpenAI chat completion
  - [ ] Context injection (user's conditions, theories)
  - [ ] Response streaming

**Files to Create**:
- `vets-ready-frontend/src/components/AIBattleBuddy.tsx` (NEW)
- `vets-ready-frontend/src/pages/AIBattleBuddy.tsx` (NEW)
- Update `app/routers/ai.py` (add chat endpoint)
- Update `app/services/ai_service.py` (add chat method)

---

### Phase 3: Ecosystem & Community

#### P3.1: VSO Locator
**Priority**: MEDIUM
**Effort**: 4-5 days
**Status**: Not started

**Tasks**:
- [ ] **VSO Locator Component** (`components/VSOLocator.tsx`)
  - [ ] Geolocation detection (browser API)
  - [ ] ZIP code search
  - [ ] Map interface (Mapbox or Google Maps)
  - [ ] Filter by organization (VFW, DAV, etc.)
  - [ ] VSO cards with contact info, hours, website

- [ ] **Backend VSO Endpoint** (`app/routers/vso.py`)
  - [ ] `GET /api/vso/search?zip=12345&radius=25` - Search VSOs
  - [ ] `GET /api/vso/:id` - Get VSO details
  - [ ] Load VSO data from VA directory (public data)

- [ ] **VSO Data Seeding**
  - [ ] Download VA VSO directory data
  - [ ] Create seed data file (`data/seed_vso.json`)
  - [ ] Database migration for VSO table

**Files to Create**:
- `vets-ready-frontend/src/components/VSOLocator.tsx` (NEW)
- `vets-ready-frontend/src/pages/VSOLocator.tsx` (NEW)
- `vets-ready-backend/app/routers/vso.py` (NEW)
- `vets-ready-backend/app/services/vso_service.py` (NEW)
- `vets-ready-backend/app/models/vso.py` (NEW)
- `data/seed_vso.json` (NEW)

---

#### P3.2: Business Directory
**Priority**: LOW
**Effort**: 3-4 days
**Status**: Exists (enhance with spec requirements)

**Tasks**:
- [ ] **Enhance Business Directory** (`pages/BusinessDirectory.tsx`)
  - [ ] Search by category
  - [ ] Geolocation-based results
  - [ ] Veteran ownership verification
  - [ ] Rating/review system

- [ ] **Backend Enhancement** (`app/routers/business.py`)
  - [ ] Already exists - align with spec

**Files to Modify**:
- Enhance existing business directory components

---

#### P3.3: Events Calendar
**Priority**: LOW
**Effort**: 3-4 days
**Status**: Not started

**Tasks**:
- [ ] **Events Calendar Component** (`components/EventsCalendar.tsx`)
  - [ ] Calendar view (month/week/day)
  - [ ] Event types (VA appointments, webinars, community)
  - [ ] Add to calendar (iCal export)
  - [ ] RSVP/registration links

- [ ] **Backend Events Endpoint** (`app/routers/events.py`)
  - [ ] `GET /api/events?start=date&end=date` - Get events
  - [ ] `POST /api/events` - Create event (admin only)

**Files to Create**:
- `vets-ready-frontend/src/components/EventsCalendar.tsx` (NEW)
- `vets-ready-backend/app/routers/events.py` (NEW)
- `vets-ready-backend/app/models/event.py` (NEW)

---

#### P3.4: User Authentication (Optional Backend Sync)
**Priority**: LOW
**Effort**: 3-4 days
**Status**: Auth exists (enhance with spec requirements)

**Tasks**:
- [ ] **User Registration/Login** (already exists in pages/)
  - [ ] Enhance with JWT tokens
  - [ ] Secure password hashing

- [ ] **Backend User Sync**
  - [ ] Save wizard state to backend
  - [ ] Sync evidence documents
  - [ ] Sync claim tracker data

- [ ] **Privacy Controls**
  - [ ] User can delete all data
  - [ ] Data export (GDPR compliance)

**Files to Modify**:
- Enhance existing `Login.tsx`, `Register.tsx`
- Update backend auth routers

---

### Phase 4: Mobile & Advanced Features

#### P4.1: Mobile App (Capacitor)
**Priority**: LOW
**Effort**: 5-7 days
**Status**: Stub exists

**Tasks**:
- [ ] **Capacitor Configuration** (`capacitor.config.ts`)
  - [ ] App ID, name, version
  - [ ] iOS and Android configuration

- [ ] **Native Builds**
  - [ ] Build iOS app (requires Mac)
  - [ ] Build Android app
  - [ ] Test on devices

- [ ] **Native Features**
  - [ ] Camera integration (document scanning)
  - [ ] Push notifications (claim status updates)
  - [ ] Biometric authentication

- [ ] **Offline Support**
  - [ ] PWA configuration
  - [ ] Service worker for offline caching
  - [ ] localStorage sync when online

**Files to Modify**:
- `vets-ready-mobile/capacitor.config.ts`
- `vets-ready-mobile/ios/` (build files)
- `vets-ready-mobile/android/` (build files)

---

#### P4.2: Offline Support (PWA)
**Priority**: LOW
**Effort**: 2-3 days
**Status**: Not started

**Tasks**:
- [ ] **Service Worker** (`public/sw.js`)
  - [ ] Cache static assets
  - [ ] Cache API responses
  - [ ] Background sync for data

- [ ] **PWA Manifest** (`public/manifest.json`)
  - [ ] App metadata
  - [ ] Icons for home screen

- [ ] **Offline UI**
  - [ ] Offline indicator
  - [ ] Sync status display

**Files to Create**:
- `vets-ready-frontend/public/sw.js` (NEW)
- `vets-ready-frontend/public/manifest.json` (NEW)

---

### Phase 5: Advanced Suites (Future)

#### P5.1: Transitioning Service Member Suite
**Priority**: LOW
**Effort**: 10+ days
**Status**: Not started

**Tasks**:
- [ ] Pre-separation timeline tool
- [ ] BDD (Benefits Delivery at Discharge) guidance
- [ ] IDES (Integrated Disability Evaluation System) tracker

---

#### P5.2: Employment Suite
**Priority**: LOW
**Effort**: 10+ days
**Status**: Job board exists (enhance)

**Tasks**:
- [ ] VR&E (Vocational Rehab) guidance
- [ ] Resume builder
- [ ] Enhance existing job board
- [ ] Skills translator (MOS → civilian jobs)

---

#### P5.3: Health & Wellness Suite
**Priority**: LOW
**Effort**: 10+ days
**Status**: Not started

**Tasks**:
- [ ] VA healthcare enrollment guidance
- [ ] PACT Act exposure tracking
- [ ] Mental health resources
- [ ] Caregiver support program info

---

#### P5.4: Family & Survivor Support Suite
**Priority**: LOW
**Effort**: 10+ days
**Status**: Not started

**Tasks**:
- [ ] DIC (Dependency & Indemnity Compensation) eligibility
- [ ] Survivor benefits calculator
- [ ] Education benefits (DEA, Fry Scholarship)

---

#### P5.5: State Benefits Navigator
**Priority**: LOW
**Effort**: 10+ days
**Status**: Not started

**Tasks**:
- [ ] State-by-state veteran benefits database
- [ ] Property tax exemptions
- [ ] State education benefits
- [ ] Hunting/fishing licenses

---

## 🔧 **DevOps & Infrastructure**

### D1: Scripts & Automation
**Priority**: MEDIUM
**Effort**: 2-3 days
**Status**: Partial - some scripts exist

**Tasks**:
- [ ] **PowerShell Scripts** (`scripts/`)
  - [ ] `Start-VetsReady.ps1` - One-click dev startup (exists, needs update)
  - [ ] `Build-VetsReady.ps1` - Build all services
  - [ ] `Test-VetsReady.ps1` - Run all tests
  - [ ] `Deploy-VetsReady.ps1` - Deploy to AWS

- [ ] **Docker Compose**
  - [ ] Update `docker-compose.yml` for all services
  - [ ] Add Redis for caching
  - [ ] Add volume mounts for development

- [ ] **Environment Variables**
  - [ ] Create `.env.example` with all required vars
  - [ ] Document each variable in README

**Files to Create/Modify**:
- `scripts/Start-VetsReady.ps1` (UPDATE)
- `scripts/Build-VetsReady.ps1` (NEW)
- `scripts/Test-VetsReady.ps1` (NEW)
- `scripts/Deploy-VetsReady.ps1` (NEW)
- `docker-compose.yml` (UPDATE)
- `.env.example` (NEW)

---

### D2: CI/CD Pipeline
**Priority**: LOW
**Effort**: 2-3 days
**Status**: Not started

**Tasks**:
- [ ] **GitHub Actions** (`.github/workflows/`)
  - [ ] `test.yml` - Run tests on PR
  - [ ] `deploy.yml` - Deploy to AWS on merge to main
  - [ ] `build.yml` - Build Docker images

- [ ] **AWS Deployment**
  - [ ] ECS/Fargate configuration
  - [ ] RDS PostgreSQL setup
  - [ ] ElastiCache Redis setup
  - [ ] S3 for evidence storage
  - [ ] CloudFront for frontend CDN

**Files to Create**:
- `.github/workflows/test.yml` (NEW)
- `.github/workflows/deploy.yml` (NEW)
- `.github/workflows/build.yml` (NEW)

---

### D3: Testing Suite
**Priority**: MEDIUM
**Effort**: 5-7 days
**Status**: Partial - some tests exist

**Tasks**:
- [ ] **Frontend Tests** (`vets-ready-frontend/tests/`)
  - [ ] Wizard component tests (Jest + React Testing Library)
  - [ ] Service tests (aiService, exportService)
  - [ ] Integration tests (full wizard flow)

- [ ] **Backend Tests** (`vets-ready-backend/app/tests/`)
  - [ ] Unit tests for services (pytest)
  - [ ] API endpoint tests (pytest + TestClient)
  - [ ] Effective date calculation tests (critical!)

- [ ] **E2E Tests** (Playwright or Cypress)
  - [ ] Full user journey (wizard → export)
  - [ ] Evidence upload flow
  - [ ] Claim tracker flow

**Files to Create**:
- `vets-ready-frontend/tests/wizard.test.tsx` (NEW)
- `vets-ready-frontend/tests/services.test.ts` (NEW)
- `vets-ready-backend/app/tests/test_ai_service.py` (NEW)
- `vets-ready-backend/app/tests/test_effective_date.py` (NEW)
- `e2e/wizard.spec.ts` (NEW)

---

## 📚 **Documentation**

### DOC1: Compliance & Privacy
**Priority**: HIGH
**Effort**: 1-2 days
**Status**: Not started

**Tasks**:
- [ ] **Create COMPLIANCE_AND_PRIVACY.md** (`docs/`)
  - [ ] Data handling policies
  - [ ] Security practices
  - [ ] Legal boundaries (no VA scraping, etc.)
  - [ ] VA non-affiliation disclaimer
  - [ ] GDPR/CCPA compliance

- [ ] **Create PRIVACY_POLICY.md** (`docs/`)
  - [ ] What data is collected
  - [ ] How data is used
  - [ ] User rights (delete, export)

- [ ] **Create TERMS_OF_SERVICE.md** (`docs/`)
  - [ ] Liability limitations
  - [ ] No guarantees
  - [ ] Educational disclaimers

**Files to Create**:
- `docs/COMPLIANCE_AND_PRIVACY.md` (NEW)
- `docs/PRIVACY_POLICY.md` (exists, needs update)
- `docs/TERMS_OF_SERVICE.md` (exists, needs update)

---

### DOC2: Developer Onboarding
**Priority**: HIGH
**Effort**: 1-2 days
**Status**: Partial - some docs exist

**Tasks**:
- [ ] **Create DEVELOPER_ONBOARDING.md** (`docs/`)
  - [ ] Project overview
  - [ ] How to run frontend/backend
  - [ ] How to run tests
  - [ ] Coding standards
  - [ ] Branching strategy
  - [ ] How to contribute

- [ ] **Update README.md** (root)
  - [ ] Project overview
  - [ ] Quick start guide
  - [ ] Scripts usage
  - [ ] Architecture diagram
  - [ ] Link to all docs

**Files to Create/Modify**:
- `docs/DEVELOPER_ONBOARDING.md` (NEW)
- `README.md` (UPDATE)

---

### DOC3: Technical Guide
**Priority**: MEDIUM
**Effort**: 2-3 days
**Status**: Partial - API docs exist

**Tasks**:
- [ ] **Create TECHNICAL_GUIDE.md** (`docs/`)
  - [ ] Full API endpoint documentation
  - [ ] Data models (with examples)
  - [ ] AI integration notes
  - [ ] Database schema
  - [ ] Authentication flow
  - [ ] Error handling patterns

- [ ] **Create API_REFERENCE.md** (`docs/`)
  - [ ] Auto-generated from OpenAPI spec
  - [ ] Request/response examples for all endpoints

**Files to Create/Modify**:
- `docs/TECHNICAL_GUIDE.md` (UPDATE existing)
- `docs/API_REFERENCE.md` (UPDATE existing)

---

### DOC4: UX Guidelines
**Priority**: LOW
**Effort**: 1 day
**Status**: Not started

**Tasks**:
- [ ] **Create UX_GUIDELINES.md** (`docs/`)
  - [ ] Design principles (clarity, veteran-centric, etc.)
  - [ ] Copy guidelines (plain language, disclaimers)
  - [ ] Component patterns (cards, modals, steppers)
  - [ ] Accessibility standards (WCAG 2.1 AA)

**Files to Create**:
- `docs/UX_GUIDELINES.md` (NEW)

---

## 🎯 **Priority Matrix**

### **CRITICAL** (Week 1-2)
1. Backend API endpoints for AI, disabilities, evidence, claims
2. Backend services (AI service with OpenAI, OCR, effective date)
3. Backend data models and schemas
4. Frontend API integration (replace mock data)
5. OpenAI integration and prompt engineering
6. Compliance documentation

### **HIGH** (Week 3-4)
7. PDF export integration (jsPDF)
8. Effective Date Calculator UI
9. Financial Tools Suite
10. Testing suite (unit + integration tests)
11. Developer onboarding docs
12. DevOps scripts (start, build, test)

### **MEDIUM** (Week 5-8)
13. AI Battle Buddy (chat interface)
14. VSO Locator
15. User authentication enhancements
16. CI/CD pipeline
17. Technical guide and API reference

### **LOW** (Week 9+)
18. Business Directory enhancements
19. Events Calendar
20. Mobile app (Capacitor)
21. Offline support (PWA)
22. Advanced suites (transitioning, employment, health, family, state benefits)

---

## 📊 **Progress Tracking**

### Overall Completion: ~35% ✅

| Phase | Completion | Status |
|-------|-----------|--------|
| **Phase 1: Core Claims Tools** | 60% | 🔨 In Progress |
| **Phase 2: Financial & Effective Date** | 0% | ⏳ Not Started |
| **Phase 3: Ecosystem & Community** | 0% | ⏳ Not Started |
| **Phase 4: Mobile & Advanced** | 0% | ⏳ Not Started |
| **Phase 5: Advanced Suites** | 0% | ⏳ Not Started |
| **DevOps & Infrastructure** | 30% | 🔨 In Progress |
| **Documentation** | 40% | 🔨 In Progress |

---

## 🚀 **Next Steps (Immediate Actions)**

### **This Week** (January 24-31, 2026)

1. **Create Backend AI Router** (`app/routers/ai.py`)
   - POST /api/ai/generate-theory
   - POST /api/ai/secondary-suggestions

2. **Create AI Service with OpenAI** (`app/services/ai_service.py`)
   - OpenAI client setup
   - Prompt templates
   - Theory generation function

3. **Create Backend Disabilities Router** (`app/routers/disabilities.py`)
   - CRUD endpoints
   - Align with frontend types

4. **Create Backend Evidence Router** (`app/routers/evidence.py`)
   - File upload endpoint
   - OCR integration

5. **Update Frontend aiService.ts**
   - Replace mock data with API calls
   - Add error handling

6. **Create Compliance Documentation** (`docs/COMPLIANCE_AND_PRIVACY.md`)
   - Data handling policies
   - Legal boundaries
   - Disclaimers

---

## 📝 **Notes & Decisions**

### Architectural Decisions
- **Mock-first pattern**: Enabled parallel frontend/backend development
- **Local-first storage**: Browser localStorage with optional backend sync
- **Environment-controlled AI**: Toggle between mock and real API
- **No VA scraping**: Manual data entry only (compliance)

### Technical Debt
- Some existing routers (claims.py, conditions.py) need alignment with spec
- Frontend routing needs organization (some pages exist, some don't)
- Database models need migration to match spec types
- Testing coverage is minimal (needs comprehensive tests)

### Open Questions
- **OCR Service**: Tesseract.js (client-side) vs AWS Textract (server-side)?
  - **Decision**: Start with Tesseract.js for local dev, add AWS Textract for production
- **File Storage**: S3 vs local filesystem vs database BLOBs?
  - **Decision**: S3 for production, local filesystem for dev
- **User Authentication**: Required or optional?
  - **Decision**: Optional (local-first, backend sync opt-in)
- **Payment/Subscription**: Needed for platform sustainability?
  - **Decision**: Phase 6 (future) - keep free initially

---

**END OF IMPLEMENTATION TASKS**
