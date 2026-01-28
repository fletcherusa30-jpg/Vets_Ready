# VetsReady Master Specification v1.0

**Project Root:** `C:\Dev\Vets Ready`
**Last Updated:** January 24, 2026
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Philosophy](#core-philosophy)
3. [Technical Architecture](#technical-architecture)
4. [Core Modules & Features](#core-modules--features)
5. [Compliance & Legal Boundaries](#compliance--legal-boundaries)
6. [Data Models](#data-models)
7. [API Specifications](#api-specifications)
8. [Frontend UX Guidelines](#frontend-ux-guidelines)
9. [AI Integration Strategy](#ai-integration-strategy)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Roadmap & Phases](#roadmap--phases)

---

## Executive Summary

**VetsReady** is a comprehensive veteran assistance platform designed to empower veterans through their VA disability claims journey and beyond. The platform combines AI-powered legal theory generation, evidence organization, financial planning tools, and community resources—all while maintaining strict compliance with VA policies and veteran privacy.

### Mission
Enable every veteran to understand, prepare, and optimize their VA disability claims with confidence, clarity, and dignity—without requiring legal expertise or scraping VA systems.

### Key Differentiators
- **AI-Powered Theory Engine**: Generates comprehensive theories of entitlement based on 38 CFR and M21-1
- **Secondary Condition Discovery**: Identifies plausible secondary conditions based on medical literature
- **Effective Date Intelligence**: AMA-compliant effective date calculations with plain-language explanations
- **Evidence Organization**: OCR-enabled document management with AI summarization
- **Veteran-Centric UX**: Plain language, educational focus, no legal advice
- **Privacy-First**: Zero VA credential storage, no system scraping, local-first data

---

## Core Philosophy

### 1. Veteran-Centric Design
- **Plain Language**: Avoid legalese; explain CFR references in context
- **Educational, Not Legal**: All AI output labeled "educational only"
- **Empowerment**: Give veterans knowledge to make informed decisions
- **Dignity**: Respectful, trauma-informed interface design

### 2. Compliance-First
- **NO VA.gov/eBenefits scraping** - Manual data entry only
- **NO credential storage** - Never store VA login information
- **NO automated VA interactions** - No bots, no auto-filing
- **Clear disclaimers** - "Not affiliated with VA" on every page
- **Educational labeling** - All AI suggestions marked as educational guidance

### 3. Privacy & Security
- **Local-first storage**: Use browser localStorage for sensitive data
- **Optional backend sync**: Encrypted, user-controlled
- **No PII in logs**: Sanitize all logging of user data
- **Transparent data handling**: Clear privacy policy and consent flows

### 4. Open & Extensible
- **Modular architecture**: Features can be added/removed independently
- **API-first design**: All features accessible via REST API
- **Plugin system**: Future support for VSO-specific tools
- **Open-source friendly**: Clean separation of proprietary AI logic

---

## Technical Architecture

### Stack Overview

#### Frontend
- **Framework**: React 18 + TypeScript 5.2
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.3
- **Routing**: React Router v6
- **State Management**: React Context + Zustand (for complex state)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Headless UI / Radix UI
- **Mobile**: Capacitor (iOS/Android)

#### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **API Docs**: OpenAPI (auto-generated)

#### AI & ML
- **LLM**: OpenAI GPT-4 Turbo (with fallback to GPT-3.5)
- **OCR**: Tesseract.js (client) + AWS Textract (server)
- **Embeddings**: OpenAI text-embedding-3-small (for semantic search)
- **Vector DB**: Pinecone or pgvector (for CFR/case law retrieval)

#### DevOps
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: AWS (ECS/Fargate + RDS + S3 + CloudFront)
- **Monitoring**: Sentry (errors) + CloudWatch (metrics)

### Project Structure

```
C:\Dev\Vets Ready\
│
├── README.md                          # Project overview
├── LICENSE                            # License information
├── .gitignore                         # Git ignore rules
├── .env.example                       # Environment variables template
├── docker-compose.yml                 # Multi-service orchestration
├── package.json                       # Root package (optional workspace)
│
├── docs/                              # All documentation
│   ├── VETSREADY_MASTER_SPEC.md      # This file
│   ├── IMPLEMENTATION_TASKS.md       # Task list & progress
│   ├── DEVELOPER_ONBOARDING.md       # Setup guide for devs
│   ├── TECHNICAL_GUIDE.md            # API docs, data models
│   ├── COMPLIANCE_AND_PRIVACY.md     # Legal & privacy guidelines
│   ├── UX_GUIDELINES.md              # Design & copy standards
│   └── architecture/                 # Architecture diagrams
│
├── scripts/                           # Automation scripts
│   ├── scripts/Start-VetsReady.ps1   # One-click dev startup (PowerShell)
│   ├── Build-VetsReady.ps1           # Build all services
│   ├── Test-VetsReady.ps1            # Run all tests
│   ├── Deploy-VetsReady.ps1          # Deploy to AWS
│   └── seed-data.sql                 # Database seed data
│
├── vets-ready-frontend/              # React frontend
│   ├── src/
│   │   ├── main.tsx                  # App entry point
│   │   ├── App.tsx                   # Root component with routing
│   │   ├── pages/                    # Page-level components
│   │   ├── components/               # Reusable UI components
│   │   ├── contexts/                 # React contexts (state)
│   │   ├── services/                 # API clients & utilities
│   │   ├── types/                    # TypeScript type definitions
│   │   ├── hooks/                    # Custom React hooks
│   │   └── utils/                    # Helper functions
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.ts                # Vite configuration
│   └── tsconfig.json                 # TypeScript config
│
├── vets-ready-backend/               # FastAPI backend
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry
│   │   ├── config.py                 # Configuration & env vars
│   │   ├── database.py               # Database connection
│   │   ├── routers/                  # API route handlers
│   │   │   ├── disabilities.py       # Disability CRUD
│   │   │   ├── theories.py           # Theory generation
│   │   │   ├── ai.py                 # AI endpoints
│   │   │   ├── effective_dates.py    # Effective date calculations
│   │   │   ├── evidence.py           # Evidence/document management
│   │   │   ├── profile.py            # Veteran profile
│   │   │   ├── financial.py          # Compensation calculator
│   │   │   └── vso.py                # VSO locator
│   │   ├── services/                 # Business logic layer
│   │   │   ├── ai_service.py         # OpenAI integration
│   │   │   ├── theory_service.py     # Theory generation logic
│   │   │   ├── effective_date_service.py  # AMA calculations
│   │   │   ├── ocr_service.py        # OCR processing
│   │   │   └── evidence_service.py   # Evidence management
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request/response models
│   │   ├── utils/                    # Utility functions
│   │   └── tests/                    # Backend tests
│   ├── alembic/                      # Database migrations
│   ├── requirements.txt              # Python dependencies
│   └── Dockerfile                    # Backend container
│
├── vets-ready-mobile/                # Capacitor mobile app
│   ├── ios/                          # iOS-specific files
│   ├── android/                      # Android-specific files
│   └── capacitor.config.ts           # Capacitor configuration
│
├── shared/                            # Shared code (TypeScript/Python)
│   ├── types/                        # Shared TypeScript types
│   └── schemas/                      # Shared data schemas
│
├── config/                            # Configuration files
│   ├── nginx.conf                    # Nginx reverse proxy
│   └── appsettings.json              # App-level settings
│
├── logs/                              # Application logs
│
└── data/                              # Local data files
    ├── schema.sql                    # Database schema
    ├── seed_conditions.json          # Seed condition data
    └── seed_organizations.json       # Seed VSO data
```

---

## Core Modules & Features

### 1. Disability Wizard ✅ **(Implemented)**

**Purpose**: Guide veterans through building a comprehensive VA disability claim strategy.

**Features**:
- **Step 1**: Service-Connected Disabilities - Confirm existing SC conditions
- **Step 2**: Add Conditions - Add new/denied conditions with secondary linking
- **Step 3**: AI Suggestions - Discover plausible secondary conditions
- **Step 4**: Theory Builder - Generate theories of entitlement with CFR references
- **Step 5**: Review & Export - Export strategy as Markdown/PDF

**Status**: ✅ Fully implemented with mock AI data

**Files**:
- `vets-ready-frontend/src/components/wizard/DisabilityWizard.tsx`
- `vets-ready-frontend/src/components/wizard/Step*.tsx` (5 steps)
- `vets-ready-frontend/src/types/wizard.types.ts`

### 2. Service Connection Theory Engine ✅ **(Implemented)**

**Purpose**: Generate comprehensive theories of entitlement for each condition.

**Theories Supported**:
- **Direct Service Connection** (38 CFR § 3.303)
- **Secondary Service Connection** (38 CFR § 3.310(a))
- **Aggravation** (38 CFR § 3.310(b))
- **Presumptive** (38 CFR § 3.307-3.309)

**Components**:
- CFR citations with plain-language explanations
- Medical nexus rationale
- Recommended evidence (medical, service records, nexus opinions, lay statements)
- Strength assessment (strong/moderate/weak)
- VA approval patterns

**Status**: ✅ Mock implementation ready; backend API needed

**Files**:
- `vets-ready-frontend/src/services/aiService.ts` (frontend)
- `vets-ready-backend/app/services/ai_service.py` (backend - TODO)

### 3. Secondary Condition Discovery Engine ✅ **(Implemented)**

**Purpose**: Suggest plausible secondary conditions based on medical literature and VA patterns.

**Features**:
- Medical basis explanations (e.g., "PTSD/Sleep Apnea comorbidity up to 70%")
- Confidence scores (0-1 scale)
- Commonality ratings (very-common, common, possible, rare)
- VA approval patterns
- Accept/dismiss suggestions

**Mock Data Coverage**:
- PTSD → Sleep Apnea, MDD, GERD, Erectile Dysfunction
- Knee injuries → Lower back pain, Hip pain, Opposite knee
- Back conditions → Radiculopathy, Sleep disturbance, Hip pain
- Tinnitus → Migraines, Sleep disturbance
- Diabetes → Peripheral neuropathy, Erectile Dysfunction

**Status**: ✅ Mock implementation; needs OpenAI integration

### 4. Denied Condition Recovery Engine ⏳ **(Partial)**

**Purpose**: Help veterans understand why conditions were denied and build reopen strategies.

**Features** (TODO):
- Parse denial reasons (insufficient evidence, no nexus, no diagnosis, etc.)
- Suggest missing evidence types
- Generate supplemental claim strategy
- AMA appeal options (Supplemental, HLR, Board)
- Effective date considerations for reopened claims

**Status**: Theory generation supports this; needs dedicated UI

### 5. Effective Date Calculator ⏳ **(Needs AMA Updates)**

**Purpose**: Calculate effective dates for VA disability claims under AMA rules.

**Logic Required**:
- **Intent to File (ITF)**: Effective date = ITF date if filed within 1 year
- **Original Claim**: Effective date = later of (date of claim, date entitlement arose)
- **Supplemental Claim**: Effective date = date of claim (unless CUE or new evidence backdates)
- **Increased Rating**: Effective date = date of claim or date of medical increase
- **Reopened Claim**: Effective date = date of new claim (not original)
- **Dependency Claims**: Effective date = date of marriage/birth/adoption
- **Special Cases**: Combat veterans (1 year presumption), etc.

**Status**: ⏳ Exists but needs AMA rule updates

**Files**:
- `vets-ready-frontend/src/pages/EffectiveDateCalculator.tsx` (frontend)
- `vets-ready-backend/app/services/effective_date_service.py` (backend - TODO)

### 6. Claim Tracker ✅ **(Implemented)**

**Purpose**: Track VA claim status through the entire submission process.

**Features**:
- 12 claim statuses (not-filed → completed/denied/appealed)
- Progress percentage visualization
- Timeline history with dates and notes
- Status update modal
- Claim type tracking (original, supplemental, increase, appeal)
- Educational explanations for each status

**Status**: ✅ Fully implemented (frontend only; backend sync optional)

**Files**:
- `vets-ready-frontend/src/components/ClaimTracker.tsx`

### 7. Evidence Organizer + OCR ✅ **(Partial)**

**Purpose**: Upload, categorize, and organize evidence documents for claims.

**Features**:
- 5 evidence types: Medical, Service Records, Lay Statements, Nexus Opinions, Other
- Upload modal with file selection, type, notes, tags
- Grouped display by document type
- Tag system for categorization
- OCR text extraction (TODO: backend integration)
- AI summary generation (TODO: backend integration)

**Status**: ✅ UI complete; OCR/AI backend needed

**Files**:
- `vets-ready-frontend/src/components/EvidenceOrganizer.tsx`
- `vets-ready-backend/app/services/ocr_service.py` (TODO)

### 8. Export Engine ✅ **(Markdown Done, PDF Pending)**

**Purpose**: Export claim strategies to Markdown, PDF, and JSON formats.

**Features**:
- **Markdown**: ✅ Fully functional with all sections
- **PDF**: ⏳ Infrastructure ready (needs jsPDF integration)
- **JSON**: ✅ Structured data export

**Markdown Sections**:
- Executive Summary (statistics, complexity)
- Current Service-Connected Conditions (ratings, effective dates)
- Planned/Current Claims (theories, evidence, nexus)
- Previously Denied Conditions (recovery strategies)
- Professional Recommendations (VSO/Attorney based on complexity)
- VA Resources and Key Forms
- Disclaimers

**Status**: ✅ Markdown functional; PDF needs library

**Files**:
- `vets-ready-frontend/src/services/exportService.ts`

### 9. Financial Tools ⏳ **(Not Started)**

**Purpose**: Calculate VA compensation, COLA, retirement, and budgeting.

**Components**:

#### 9.1 Compensation Estimator
- Input current ratings
- Calculate combined rating using VA table
- Show monthly compensation amount (with dependents)
- Project increase with new claims
- SMC (Special Monthly Compensation) calculations

#### 9.2 COLA Calculator
- Show historical COLA adjustments
- Project future increases based on CPI trends
- Compare year-over-year changes

#### 9.3 Retirement Planner
- Combine disability + military retirement pay
- Tax implications (disability is tax-free)
- Concurrent Receipt rules (CRDP/CRSC)
- Social Security interaction

#### 9.4 Budgeting Tool
- Track income (disability, retirement, employment)
- Categorize expenses
- Identify savings opportunities

**Status**: ⏳ Not started

**Files** (TODO):
- `vets-ready-frontend/src/components/FinancialTools.tsx`
- `vets-ready-backend/app/routers/financial.py`

### 10. VSO Locator ⏳ **(Not Started)**

**Purpose**: Find nearby Veteran Service Organizations for free claim assistance.

**Features**:
- Geolocation detection
- Search by ZIP code
- Map interface (Mapbox or Google Maps)
- Filter by organization (VFW, DAV, AmVets, American Legion, etc.)
- Contact information, hours, website
- Rating/reviews (if data available)

**Data Source**: VA VSO directory (public data, not scraped)

**Status**: ⏳ Not started

**Files** (TODO):
- `vets-ready-frontend/src/components/VSOLocator.tsx`
- `vets-ready-backend/app/routers/vso.py`

### 11. AI Battle Buddy (Chat Interface) ⏳ **(Not Started)**

**Purpose**: Conversational AI assistant for claim strategy questions.

**Features**:
- Chat UI with message history
- Context-aware responses (knows about user's claims)
- Suggested questions
- Evidence recommendations
- Claim strategy simulation ("What if I add X condition?")
- Effective date estimation
- Educational disclaimers on every response

**Implementation**:
- Frontend: Chat component with streaming responses
- Backend: OpenAI Chat Completions API with system prompt
- Context: Include user's WizardState in conversation context

**Status**: ⏳ Not started

**Files** (TODO):
- `vets-ready-frontend/src/components/AIBattleBuddy.tsx`
- `vets-ready-backend/app/routers/ai.py` (chat endpoint)

### 12. Business Directory ⏳ **(Not Started)**

**Purpose**: Connect veterans with veteran-owned businesses and services.

**Features**:
- Search by category (legal, medical, financial, home services, etc.)
- Geolocation-based results
- Veteran ownership verification
- Rating/review system
- Contact information

**Status**: ⏳ Not started (part of Ecosystem Suite)

### 13. Events Calendar ⏳ **(Not Started)**

**Purpose**: Display VA-related events, webinars, and community gatherings.

**Features**:
- Calendar view (month/week/day)
- Event types: VA appointments, VSO events, webinars, community
- Add to personal calendar (iCal export)
- RSVP/registration links

**Status**: ⏳ Not started (part of Ecosystem Suite)

### 14. Mobile App (Capacitor) ⏳ **(Stub Exists)**

**Purpose**: Native iOS/Android app using Capacitor.

**Features**:
- Same UI as web (responsive)
- Offline support (localStorage sync)
- Push notifications (claim status updates)
- Camera integration (document scanning)
- Biometric authentication (optional)

**Status**: ⏳ Capacitor stub exists; needs configuration

**Files**:
- `vets-ready-mobile/` (basic structure)
- Needs: `capacitor.config.ts` updates, native builds

### 15. Additional Suites (Future Phases)

**Transitioning Service Member Suite**:
- Pre-separation timeline
- BDD (Benefits Delivery at Discharge) guidance
- IDES (Integrated Disability Evaluation System) tracker

**Employment Suite**:
- VR&E (Vocational Rehab) guidance
- Resume builder
- Job board integration
- Skills translator (MOS → civilian jobs)

**Health & Wellness Suite**:
- VA healthcare enrollment
- PACT Act exposure tracking
- Mental health resources
- Caregiver support program info

**Family & Survivor Support Suite**:
- DIC (Dependency & Indemnity Compensation) eligibility
- Survivor benefits calculator
- Education benefits (DEA, Fry Scholarship)

**State Benefits Navigator**:
- State-by-state veteran benefits
- Property tax exemptions
- State education benefits
- Hunting/fishing licenses

**Installation Partnership Suite** (for military installations):
- TAP (Transition Assistance Program) integration
- Installation-specific resources
- Local VSO partnerships

**Community & Engagement**:
- Forums / discussion boards
- Success stories
- Peer support groups

**Data & Insights** (Admin/VSO view):
- Anonymized claim success metrics
- Common denial reasons
- Regional approval patterns

---

## Compliance & Legal Boundaries

### What VetsReady DOES:

✅ **Educational guidance** on VA disability claims process
✅ **AI-generated theories** labeled as "educational only"
✅ **Evidence organization** tools for veterans
✅ **Effective date calculations** with plain-language explanations
✅ **Financial planning** tools using public VA rate tables
✅ **VSO locator** using public VA directory data
✅ **Community resources** and educational content

### What VetsReady DOES NOT DO:

❌ **NO VA.gov/eBenefits scraping** - Manual data entry only
❌ **NO credential storage** - Never store VA usernames/passwords
❌ **NO automated VA interactions** - No bots, no auto-filing, no web scraping
❌ **NO legal advice** - All content is educational; not attorney-client relationship
❌ **NO medical diagnoses** - AI suggests possibilities; only doctors diagnose
❌ **NO guarantees** - Success depends on evidence and VA evaluation
❌ **NO unauthorized claims representation** - Only accredited VSOs/attorneys can represent

### Disclaimers (Required on Every Page)

**Primary Disclaimer**:
> VetsReady is not affiliated with, endorsed by, or connected to the U.S. Department of Veterans Affairs (VA). All information and AI-generated content is for educational purposes only and does not constitute legal, medical, or financial advice. Consult with an accredited Veterans Service Officer (VSO) or VA-accredited attorney for personalized assistance with your claim.

**AI Disclaimer** (on all AI features):
> This content was generated by artificial intelligence and is provided for educational purposes only. It is based on publicly available VA regulations and medical literature, but may not be accurate, complete, or applicable to your specific situation. Always verify information with official VA sources and consult with a qualified professional.

**Privacy Disclaimer**:
> Your data is stored locally on your device by default. If you choose to sync data to our servers, it is encrypted and you can delete it at any time. We never store your VA credentials or access your VA.gov account.

### Data Handling

**Personal Information**:
- **Name, service dates, disabilities**: Stored locally (browser localStorage) or optionally encrypted on backend
- **Medical records**: Never uploaded to third-party servers without explicit consent
- **VA claim numbers**: Treated as sensitive; encrypted if stored on backend

**Logging**:
- **NO PII in logs**: Sanitize all user data before logging
- **Error logs**: Generic error messages only (no personal details)
- **AI logs**: Track usage metrics without identifying individual users

**Third-Party Services**:
- **OpenAI**: Send anonymized prompts only (no names, birthdates, SSNs)
- **AWS Textract**: OCR processing with auto-deletion of uploaded files after processing
- **Analytics**: Use privacy-respecting tools (e.g., Plausible, not Google Analytics)

### Compliance Checklist

- [ ] Disclaimers on every page
- [ ] AI output clearly labeled as educational
- [ ] No VA.gov scraping or automation
- [ ] Privacy policy with clear data handling
- [ ] Terms of Service with liability limitations
- [ ] Cookie consent (if using tracking cookies)
- [ ] GDPR/CCPA compliance (if applicable)
- [ ] Accessibility (WCAG 2.1 AA compliance)

---

## Data Models

### Disability

```typescript
interface Disability {
  id: string;                          // Unique identifier
  name: string;                        // Condition name (e.g., "PTSD")
  rating?: number;                     // Current rating (0-100)
  effectiveDate?: string;              // ISO date string
  serviceConnectionType:
    | 'direct'
    | 'secondary'
    | 'aggravation'
    | 'presumptive';
  claimStatus:
    | 'service-connected'
    | 'planned'
    | 'filed'
    | 'denied';
  linkedToIds?: string[];              // Parent condition IDs (for secondary)
  diagnosedInService?: boolean;
  currentDiagnosis?: boolean;
  symptomsDuringService?: boolean;
  aiTheory?: AiEntitlementTheory;      // AI-generated theory
  notes?: string;
  addedAt: string;                     // ISO date string
}
```

### AiEntitlementTheory

```typescript
interface AiEntitlementTheory {
  primaryTheory: string;               // Main theory of entitlement
  policyReferences: PolicyReference[]; // CFR, M21-1, case law
  recommendedEvidence: EvidenceRecommendation[];
  strengthAssessment: 'strong' | 'moderate' | 'weak';
  challenges?: string[];               // Potential obstacles
  opportunities?: string[];            // Favorable factors
  nexusRationale?: string;             // Secondary connection explanation
}

interface PolicyReference {
  source: string;                      // e.g., "38 CFR § 3.303"
  citation: string;                    // Title/description
  relevance: string;                   // Why it applies
}

interface EvidenceRecommendation {
  type: 'medical' | 'service-records' | 'lay-statement' | 'nexus-opinion';
  description: string;                 // What to obtain
  priority: 'critical' | 'important' | 'helpful';
  whereToObtain?: string;              // Source guidance
}
```

### AiSuggestion

```typescript
interface AiSuggestion {
  conditionName: string;               // Suggested condition
  medicalBasis: string;                // Why it's plausible
  commonality: 'very-common' | 'common' | 'possible' | 'rare';
  vaApprovalPattern: string;           // Historical VA approval notes
  confidence: number;                  // 0-1 score
  estimatedRating?: string;            // e.g., "10-30%"
}
```

### WizardState

```typescript
interface WizardState {
  currentStep: number;                 // 1-5
  serviceConnectedDisabilities: Disability[];
  candidateConditions: Disability[];   // New/denied conditions
  aiSuggestions: Record<string, AiSuggestion[]>; // Keyed by parent ID
  complexity: 'simple' | 'medium' | 'complex';
  completedSteps: number[];            // Array of completed step numbers
  savedAt?: string;                    // ISO date string
}
```

### EvidenceDocument

```typescript
interface EvidenceDocument {
  id: string;
  name: string;                        // Filename
  type: 'medical' | 'service-records' | 'lay-statement' | 'nexus-opinion' | 'other';
  file: File;                          // File object
  uploadedAt: string;                  // ISO date string
  ocrText?: string;                    // Extracted text (from OCR)
  aiSummary?: string;                  // AI-generated summary
  relatedConditionIds?: string[];      // Linked to which conditions
  notes?: string;
  tags?: string[];                     // User-defined tags
}
```

### Claim

```typescript
interface Claim {
  id: string;
  conditionName: string;
  claimType: 'original' | 'supplemental' | 'increase' | 'appeal';
  status: ClaimStatus;                 // 12 possible statuses
  filedDate?: string;                  // ISO date string
  claimNumber?: string;                // VA claim number
  notes?: string;
  statusHistory: StatusHistoryEntry[]; // Timeline of status changes
}

type ClaimStatus =
  | 'not-filed'
  | 'gathering-evidence'
  | 'submitted'
  | 'initial-review'
  | 'evidence-gathering'
  | 'review-of-evidence'
  | 'preparation-for-decision'
  | 'pending-decision-approval'
  | 'preparation-for-notification'
  | 'completed'
  | 'denied'
  | 'appealed';

interface StatusHistoryEntry {
  status: ClaimStatus;
  date: string;                        // ISO date string
  notes?: string;
}
```

### VeteranProfile

```typescript
interface VeteranProfile {
  id: string;
  branch?: 'Army' | 'Navy' | 'Air Force' | 'Marines' | 'Coast Guard' | 'Space Force';
  serviceStartDate?: string;           // ISO date string
  serviceEndDate?: string;             // ISO date string
  dischargeType?: 'Honorable' | 'General' | 'OTH' | 'BCD' | 'Dishonorable';
  deployments?: Deployment[];
  combinedRating?: number;             // Current combined VA rating
  hasRetirementPay?: boolean;
  hasDependents?: boolean;
  dependentsCount?: number;
}

interface Deployment {
  location: string;
  startDate: string;
  endDate: string;
  combatZone?: boolean;
}
```

---

## API Specifications

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.vetsready.com/api`

### Authentication
- **Optional**: JWT tokens for backend sync
- **Local-first**: Most operations work without authentication

### Endpoints

#### Disabilities

```http
GET    /api/disabilities              # Get all disabilities for user
POST   /api/disabilities              # Create new disability
PUT    /api/disabilities/:id          # Update disability
DELETE /api/disabilities/:id          # Delete disability
```

**POST /api/disabilities** Request:
```json
{
  "name": "PTSD",
  "serviceConnectionType": "direct",
  "claimStatus": "service-connected",
  "rating": 70,
  "effectiveDate": "2020-01-15",
  "diagnosedInService": false,
  "currentDiagnosis": true,
  "symptomsDuringService": true
}
```

**Response**:
```json
{
  "id": "dis_abc123",
  "name": "PTSD",
  "rating": 70,
  "serviceConnectionType": "direct",
  "claimStatus": "service-connected",
  "effectiveDate": "2020-01-15",
  "addedAt": "2026-01-24T10:00:00Z"
}
```

#### AI Theory Generation

```http
POST /api/ai/generate-theory          # Generate theory for a condition
POST /api/ai/secondary-suggestions    # Get secondary condition suggestions
POST /api/ai/chat                     # AI Battle Buddy chat
```

**POST /api/ai/generate-theory** Request:
```json
{
  "condition": {
    "name": "Sleep Apnea",
    "serviceConnectionType": "secondary",
    "linkedToIds": ["dis_ptsd123"]
  },
  "primaryConditions": [
    {
      "id": "dis_ptsd123",
      "name": "PTSD",
      "rating": 70
    }
  ]
}
```

**Response**:
```json
{
  "primaryTheory": "Secondary service connection for Sleep Apnea is established through its relationship to service-connected PTSD. Medical literature demonstrates up to 70% comorbidity between PTSD and Obstructive Sleep Apnea (OSA)...",
  "policyReferences": [
    {
      "source": "38 CFR § 3.310(a)",
      "citation": "Secondary Service Connection",
      "relevance": "Establishes that a disability caused by or aggravated by a service-connected condition is itself service-connected."
    }
  ],
  "recommendedEvidence": [
    {
      "type": "medical",
      "description": "Sleep study (polysomnography) showing OSA diagnosis",
      "priority": "critical",
      "whereToObtain": "VA sleep clinic or private pulmonologist"
    },
    {
      "type": "nexus-opinion",
      "description": "Medical opinion linking sleep apnea to PTSD",
      "priority": "critical",
      "whereToObtain": "Independent Medical Exam (IME) or VA C&P exam"
    }
  ],
  "strengthAssessment": "strong",
  "nexusRationale": "Well-established medical link between PTSD and sleep apnea; VA frequently grants this secondary connection with proper nexus evidence.",
  "opportunities": [
    "Strong medical literature support",
    "Common VA approval pattern",
    "Existing high PTSD rating strengthens nexus argument"
  ],
  "challenges": [
    "Requires explicit nexus opinion linking conditions",
    "Sleep study must show OSA (not just insomnia)"
  ]
}
```

**POST /api/ai/secondary-suggestions** Request:
```json
{
  "primaryCondition": {
    "id": "dis_ptsd123",
    "name": "PTSD",
    "rating": 70
  }
}
```

**Response**:
```json
{
  "suggestions": [
    {
      "conditionName": "Obstructive Sleep Apnea",
      "medicalBasis": "PTSD/Sleep Apnea comorbidity ranges from 40-70% in veteran populations. Hyperarousal and nightmares disrupt sleep architecture.",
      "commonality": "very-common",
      "vaApprovalPattern": "Frequently granted with sleep study and nexus opinion",
      "confidence": 0.85,
      "estimatedRating": "30-50%"
    },
    {
      "conditionName": "Major Depressive Disorder",
      "medicalBasis": "Up to 50% of veterans with PTSD also meet criteria for MDD. Shared neurobiological pathways.",
      "commonality": "very-common",
      "vaApprovalPattern": "Often granted but may be considered part of PTSD rating if symptoms overlap",
      "confidence": 0.90,
      "estimatedRating": "10-70%"
    }
  ]
}
```

#### Effective Date Calculation

```http
POST /api/effective-date/calculate    # Calculate effective date
```

**Request**:
```json
{
  "claimType": "supplemental",
  "dateOfClaim": "2025-12-15",
  "intentToFileDate": "2025-06-01",
  "dateEntitlementArose": "2020-01-01",
  "originalClaimDate": "2021-03-10",
  "originalDenialDate": "2021-08-15",
  "newEvidenceDate": "2025-11-20"
}
```

**Response**:
```json
{
  "effectiveDate": "2025-12-15",
  "explanation": "For a supplemental claim under AMA, the effective date is the date the supplemental claim was filed (December 15, 2025). Unlike legacy reopened claims, supplemental claims do not revert to the original claim date. However, if the new evidence shows the condition existed earlier (Clear and Unmistakable Error), you may be able to argue for an earlier effective date.",
  "ruleCitation": "38 CFR § 3.400(q)(2)",
  "recommendations": [
    "If new evidence shows medical treatment before 12/15/2025, consider arguing for earlier effective date",
    "Intent to File does not apply to supplemental claims (only original claims)",
    "Review decision letter for any CUE (Clear and Unmistakable Error) in original decision"
  ]
}
```

#### Evidence Management

```http
POST /api/evidence/upload             # Upload evidence document
POST /api/evidence/ocr                # Trigger OCR processing
GET  /api/evidence/:id                # Get evidence document
DELETE /api/evidence/:id              # Delete evidence document
```

**POST /api/evidence/upload** Request (multipart/form-data):
```
file: [binary file data]
type: "medical"
notes: "C&P exam from 2024"
tags: ["ptsd", "exam", "2024"]
```

**Response**:
```json
{
  "id": "evd_xyz789",
  "name": "cp_exam_2024.pdf",
  "type": "medical",
  "uploadedAt": "2026-01-24T10:00:00Z",
  "notes": "C&P exam from 2024",
  "tags": ["ptsd", "exam", "2024"],
  "ocrStatus": "pending"
}
```

**POST /api/evidence/ocr** Request:
```json
{
  "evidenceId": "evd_xyz789"
}
```

**Response**:
```json
{
  "evidenceId": "evd_xyz789",
  "ocrText": "COMPENSATION & PENSION EXAMINATION REPORT\nVeteran Name: [REDACTED]\nDate of Exam: January 10, 2024\n...",
  "aiSummary": "This C&P exam documents PTSD symptoms including nightmares, hypervigilance, and avoidance behaviors. Examiner noted veteran meets DSM-5 criteria for PTSD. Recommended rating: 70%.",
  "ocrStatus": "completed"
}
```

#### Claims Tracking

```http
GET  /api/claims                      # Get all claims for user
POST /api/claims                      # Create new claim
PUT  /api/claims/:id/status           # Update claim status
```

**POST /api/claims** Request:
```json
{
  "conditionName": "Sleep Apnea",
  "claimType": "supplemental",
  "filedDate": "2026-01-15",
  "claimNumber": "123456789"
}
```

**Response**:
```json
{
  "id": "clm_abc123",
  "conditionName": "Sleep Apnea",
  "claimType": "supplemental",
  "status": "submitted",
  "filedDate": "2026-01-15",
  "claimNumber": "123456789",
  "statusHistory": [
    {
      "status": "submitted",
      "date": "2026-01-15T08:00:00Z"
    }
  ]
}
```

#### Profile Management

```http
GET  /api/profile                     # Get veteran profile
POST /api/profile                     # Create/update profile
```

#### Financial Calculations

```http
POST /api/financial/compensation-estimate  # Estimate VA compensation
POST /api/financial/cola-projection        # COLA projections
```

**POST /api/financial/compensation-estimate** Request:
```json
{
  "ratings": [
    {"condition": "PTSD", "rating": 70},
    {"condition": "Tinnitus", "rating": 10},
    {"condition": "Knee", "rating": 10}
  ],
  "dependents": {
    "spouse": true,
    "children": 2
  }
}
```

**Response**:
```json
{
  "combinedRating": 80,
  "monthlyCompensation": 2172.39,
  "breakdown": {
    "base": 1933.15,
    "spouseDependency": 161.00,
    "childDependency": 78.24
  },
  "effectiveYear": 2026,
  "nextCOLADate": "2026-12-01"
}
```

---

## Frontend UX Guidelines

### Design Principles

1. **Clarity over Complexity**
   - Use plain language, avoid jargon
   - Explain CFR references in context
   - Break complex processes into simple steps

2. **Veteran-Centric Copy**
   - Address veterans with respect and dignity
   - Use "you" language (e.g., "Your service-connected disabilities")
   - Avoid passive voice and bureaucratic language

3. **Progressive Disclosure**
   - Show essential info first, advanced options later
   - Use expandable sections for details
   - Provide tooltips for technical terms

4. **Feedback & Reassurance**
   - Confirm actions (e.g., "Disability added successfully")
   - Show loading states during AI processing
   - Provide clear error messages with solutions

5. **Accessibility**
   - WCAG 2.1 AA compliance minimum
   - Keyboard navigation for all features
   - Screen reader friendly
   - High contrast mode support

### Copy Guidelines

#### Educational Disclaimers
- Place at top of AI-generated content
- Use friendly, non-alarming language
- Example: "💡 This theory was generated by AI based on VA regulations and is for educational purposes only. Always verify with official VA sources."

#### CFR References
- Always explain in plain language after citation
- Example: "38 CFR § 3.310(a) - Secondary Service Connection - This regulation allows you to claim a disability that was caused by a service-connected condition."

#### Button Labels
- Use action verbs: "Generate Theory", "Export Strategy", "Add Condition"
- Avoid generic "Submit", "OK", "Continue" unless context is clear

#### Error Messages
- Be specific and helpful
- Example: "⚠️ We couldn't generate a theory for this condition because it's not linked to a service-connected disability. Please select a primary condition in Step 2."

### Component Patterns

#### Cards
- Use for disabilities, theories, suggestions
- Include: Title, status badge, action buttons, expandable details

#### Modals
- Use for focused tasks: Add disability, upload evidence, update status
- Include: Clear title, form fields, Cancel/Save buttons
- Close on outside click or ESC key

#### Steppers
- Visual progress indicator for multi-step flows
- Show completed steps with checkmarks
- Allow navigation to previous steps

#### Forms
- Use Zod validation
- Show inline errors near fields
- Disable submit until valid
- Provide field-level help text

#### Loading States
- Show spinners for < 5 seconds
- Show progress bars for longer operations
- Use skeleton loaders for content that's loading

---

## AI Integration Strategy

### OpenAI Configuration

**Model Selection**:
- **Primary**: GPT-4 Turbo (gpt-4-turbo-preview) - Best accuracy
- **Fallback**: GPT-3.5 Turbo (gpt-3.5-turbo) - Cost optimization
- **Future**: Fine-tuned model on VA case law and M21-1

**Parameters**:
```python
{
  "model": "gpt-4-turbo-preview",
  "temperature": 0.3,           # Low temp for factual accuracy
  "max_tokens": 2000,           # Enough for detailed theories
  "top_p": 0.9,
  "frequency_penalty": 0.3,     # Reduce repetition
  "presence_penalty": 0.1
}
```

### Prompt Engineering

#### System Prompt (Theory Generation)
```
You are an expert VA disability claims assistant with deep knowledge of 38 CFR, M21-1 Manual, and VA case law. Your role is to generate educational theories of entitlement for veterans.

CRITICAL RULES:
- You provide educational information only, not legal advice
- Always cite 38 CFR sections and explain them in plain language
- Base recommendations on medical literature and VA approval patterns
- Be honest about weak theories; don't oversell
- Use veteran-friendly language; avoid legalese
- Never guarantee outcomes; focus on evidence requirements

When generating a theory of entitlement:
1. State the primary legal theory (direct, secondary, aggravation, or presumptive)
2. Cite relevant 38 CFR sections with explanations
3. Explain the medical nexus (if secondary/aggravation)
4. Recommend specific evidence with priorities
5. Assess strength as strong/moderate/weak
6. Identify challenges and opportunities
```

#### User Prompt (Secondary Connection)
```
Generate a theory of entitlement for secondary service connection:

Primary Condition: {{primaryCondition.name}} ({{primaryCondition.rating}}% service-connected)
Secondary Condition: {{secondaryCondition.name}}

Service Details:
- Branch: {{profile.branch}}
- Service Dates: {{profile.serviceStartDate}} to {{profile.serviceEndDate}}
- Deployments: {{profile.deployments}}

Current Diagnosis: {{secondaryCondition.currentDiagnosis ? 'Yes' : 'No'}}

Please provide:
1. Legal theory with CFR citations
2. Medical nexus explanation
3. Recommended evidence (medical, nexus opinion, lay statements)
4. Strength assessment
5. Challenges and opportunities
```

### Response Parsing

**Expected JSON Structure**:
```json
{
  "primaryTheory": "string",
  "policyReferences": [
    {"source": "string", "citation": "string", "relevance": "string"}
  ],
  "recommendedEvidence": [
    {"type": "medical|service-records|lay-statement|nexus-opinion", "description": "string", "priority": "critical|important|helpful"}
  ],
  "strengthAssessment": "strong|moderate|weak",
  "nexusRationale": "string",
  "challenges": ["string"],
  "opportunities": ["string"]
}
```

**Error Handling**:
- If OpenAI returns non-JSON, attempt to extract JSON from markdown code blocks
- If parsing fails, fall back to mock data or show error to user
- Log all AI errors (without PII) for debugging

### Rate Limiting & Cost Management

**Strategies**:
1. **Caching**: Cache theories by condition name + primary conditions (Redis, 24-hour TTL)
2. **Debouncing**: Wait 500ms before triggering AI calls on user input
3. **User Limits**: Max 10 theory generations per hour (per user)
4. **Model Switching**: Use GPT-3.5 for simpler tasks (suggestions), GPT-4 for theories
5. **Batch Processing**: Generate multiple theories in one API call when possible

**Cost Estimates** (as of 2026):
- GPT-4 Turbo: ~$0.01 per theory generation
- GPT-3.5 Turbo: ~$0.002 per suggestion batch
- Expected usage: ~100 requests/day = $1/day ($30/month)

### Privacy & Anonymization

**Before sending to OpenAI**:
- Remove veteran's name (replace with "the veteran")
- Remove SSNs, claim numbers, VA file numbers
- Remove specific dates of birth (use age ranges if needed)
- Remove specific unit names (use "combat unit" or "medical unit")

**Example Sanitized Prompt**:
```
The veteran served in the Marine Corps from 2010 to 2015 and deployed to a combat zone. They have service-connected PTSD at 70%. Generate a theory for secondary Sleep Apnea.
```

---

## Deployment & Infrastructure

### Docker Setup

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./vets-ready-frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000
    volumes:
      - ./vets-ready-frontend:/app
      - /app/node_modules
    command: npm run dev

  backend:
    build:
      context: ./vets-ready-backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://vetsready:password@db:5432/vetsready
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./vets-ready-backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=vetsready
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=vetsready
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables

**.env.example**:
```bash
# Backend
DATABASE_URL=postgresql://vetsready:password@localhost:5432/vetsready
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development

# OCR Service
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1

# Frontend
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_AI=false
VITE_ENVIRONMENT=development
```

### AWS Architecture (Production)

**Services**:
- **ECS/Fargate**: Run frontend + backend containers
- **RDS PostgreSQL**: Managed database
- **ElastiCache Redis**: Managed caching
- **S3**: Evidence document storage
- **CloudFront**: CDN for frontend assets
- **Route 53**: DNS management
- **Certificate Manager**: SSL/TLS certificates
- **Secrets Manager**: Store API keys securely
- **CloudWatch**: Logging and metrics
- **Textract**: OCR processing (optional)

**Estimated Monthly Cost**:
- ECS Fargate (2 tasks): ~$50
- RDS PostgreSQL (db.t3.small): ~$25
- ElastiCache Redis (cache.t3.micro): ~$12
- S3 + CloudFront: ~$10
- **Total**: ~$100/month (plus OpenAI costs)

### CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml**:
```yaml
name: Deploy VetsReady

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run backend tests
        run: |
          cd vets-ready-backend
          pip install -r requirements.txt
          pytest
      - name: Run frontend tests
        run: |
          cd vets-ready-frontend
          npm install
          npm run test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker images
        run: |
          docker build -t vetsready-frontend ./vets-ready-frontend
          docker build -t vetsready-backend ./vets-ready-backend
          # Push to ECR or Docker Hub

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS ECS
        run: |
          # Update ECS service with new task definitions
```

---

## Roadmap & Phases

### Phase 1: Core Claims Tools ✅ **(Current Focus)**

**Timeline**: Weeks 1-4

**Features**:
- ✅ Disability Wizard (5 steps) - **COMPLETE**
- ✅ AI Theory Engine (mock data) - **COMPLETE**
- ✅ Secondary Condition Discovery (mock data) - **COMPLETE**
- ✅ Evidence Organizer (UI complete) - **PARTIAL**
- ✅ Claim Tracker - **COMPLETE**
- ✅ Export to Markdown - **COMPLETE**
- ⏳ Backend API endpoints - **IN PROGRESS**
- ⏳ OpenAI integration - **TODO**
- ⏳ OCR service - **TODO**

**Deliverables**:
- Functional wizard with AI suggestions
- Markdown export working
- Backend APIs for disabilities, theories, claims
- Developer documentation

### Phase 2: Financial & Effective Date Tools

**Timeline**: Weeks 5-8

**Features**:
- [ ] Effective Date Calculator (AMA logic)
- [ ] Compensation Estimator
- [ ] COLA Calculator
- [ ] Retirement Planner
- [ ] PDF export (jsPDF integration)
- [ ] AI Battle Buddy (chat interface)

**Deliverables**:
- Complete financial suite
- Accurate effective date calculations
- AI chat assistant
- PDF export functional

### Phase 3: Ecosystem & Community

**Timeline**: Weeks 9-12

**Features**:
- [ ] VSO Locator (maps + geolocation)
- [ ] Business Directory
- [ ] Events Calendar
- [ ] User authentication (optional backend sync)
- [ ] Profile management
- [ ] Scenario saving/loading

**Deliverables**:
- VSO locator live with map interface
- Community features
- User accounts (optional)

### Phase 4: Mobile & Advanced Features

**Timeline**: Weeks 13-16

**Features**:
- [ ] Mobile app (Capacitor build)
- [ ] Offline support (PWA)
- [ ] Push notifications (claim status updates)
- [ ] Camera document scanning
- [ ] Biometric authentication

**Deliverables**:
- iOS and Android apps in beta
- Offline-first functionality
- Native device integrations

### Phase 5: Advanced Suites

**Timeline**: Weeks 17+

**Features**:
- [ ] Transitioning Service Member Suite
- [ ] Employment Suite (VR&E, resume builder)
- [ ] Health & Wellness Suite
- [ ] Family & Survivor Support
- [ ] State Benefits Navigator
- [ ] Installation Partnership Portal
- [ ] Admin/VSO Dashboard (metrics & insights)

**Deliverables**:
- Full-spectrum veteran support platform
- VSO partnership tools
- Data insights dashboard

---

## Success Metrics

### User Metrics
- **Active Users**: 10,000+ MAU by end of Phase 3
- **Claim Success Rate**: Track anecdotal success stories
- **User Satisfaction**: Net Promoter Score (NPS) > 50

### Technical Metrics
- **API Response Time**: < 500ms (p95)
- **AI Generation Time**: < 5 seconds (p95)
- **Uptime**: 99.9% availability
- **Error Rate**: < 0.1% of requests

### Business Metrics
- **Cost per User**: < $0.50/month (AI + infra)
- **Retention**: 60% monthly active retention
- **Engagement**: Avg 3+ sessions per user per month

---

## Appendices

### A. VA Regulation Quick Reference

**38 CFR § 3.303** - Direct Service Connection
**38 CFR § 3.310(a)** - Secondary Service Connection
**38 CFR § 3.310(b)** - Aggravation
**38 CFR § 3.307-3.309** - Presumptive Service Connection
**38 CFR § 3.400** - Effective Dates

### B. Common Secondary Condition Pairs

| Primary Condition | Common Secondaries |
|-------------------|-------------------|
| PTSD | Sleep Apnea, MDD, GERD, ED, Migraines |
| Knee Injury | Lower Back Pain, Hip Pain, Opposite Knee |
| Back Injury | Radiculopathy, Hip Pain, Sleep Disturbance |
| Tinnitus | Migraines, Sleep Disturbance |
| Diabetes | Peripheral Neuropathy, ED, Retinopathy |

### C. CFR § 3.310 (Secondary Connection) - Simplified

> If a service-connected disability causes or aggravates another disability, the second disability is also service-connected.

**Requirements**:
1. **Primary Condition**: Must be service-connected
2. **Secondary Condition**: Must be diagnosed by a medical professional
3. **Nexus**: Medical evidence linking the two (nexus opinion)

### D. Effective Date Scenarios (AMA)

| Scenario | Effective Date |
|----------|----------------|
| Original Claim | Later of: date of claim OR date entitlement arose |
| Supplemental Claim | Date of supplemental claim (not original) |
| Increased Rating | Date of claim OR date of medical increase |
| Dependency Claim | Date of marriage/birth/adoption |
| ITF Filed | ITF date (if claim filed within 1 year) |

---

## Version History

- **v1.0** (2026-01-24): Initial master specification
- **Future**: Updates as features are implemented and requirements evolve

---

## Contact & Support

**Project Lead**: VetsReady Development Team
**Repository**: [Internal]
**Documentation**: `C:\Dev\Vets Ready\docs\`

---

**END OF MASTER SPECIFICATION**
