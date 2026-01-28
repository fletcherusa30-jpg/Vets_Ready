# 🎖️ VETS READY - MASTER APPLICATION GUIDE & WORKFLOW
## Complete Technical Specification, Architecture & Flow Chart Documentation

**Version:** 2.0
**Date:** January 26, 2026
**Purpose:** Ultimate guide for developers, architects, and stakeholders to understand the complete Vets Ready ecosystem

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Complete Application Structure](#complete-application-structure)
4. [User Journey & Flow Charts](#user-journey-flow-charts)
5. [Module Functionality Map](#module-functionality-map)
6. [Data Flow & Integration Patterns](#data-flow-integration-patterns)
7. [API Endpoint Reference](#api-endpoint-reference)
8. [Component Hierarchy](#component-hierarchy)
9. [State Management & Context](#state-management-context)
10. [Deployment & Infrastructure](#deployment-infrastructure)

---

## 1. EXECUTIVE SUMMARY

### Platform Mission
**Empowering veterans through clarity, connection, and technology** by providing a comprehensive digital ecosystem that simplifies VA benefits navigation, claims readiness, financial planning, and community connection.

### Target Audience
- **Primary:** Veterans from all branches (Active, Reserve, Guard, Retired, Separated)
- **Secondary:** Family members, caregivers, VSO representatives, attorneys
- **Tertiary:** Transitioning service members, veteran-owned businesses

### Core Value Proposition
1. **Transparency:** CFR-aligned guidance with clear explanations
2. **Accuracy:** Validated calculators for disability ratings, retirement, SMC
3. **Accessibility:** Mobile-first, desktop-compatible, offline-capable design
4. **Community:** Connection to peers, businesses, and support organizations
5. **Trust:** Privacy-first, veteran-centric approach with no VA affiliation claims

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Web application UI |
| **Backend** | FastAPI (Python 3.11+) | REST API server |
| **Database** | PostgreSQL 15+ | Structured data persistence |
| **Mobile** | Capacitor + React | Cross-platform mobile app |
| **AI Engine** | OpenAI GPT-4 + LangChain | AI-powered guidance |
| **Document Processing** | Tesseract OCR + PDF.js | DD-214, medical records scanning |
| **Authentication** | JWT + bcrypt | Secure user sessions |
| **Payment** | Stripe | Subscription & payment processing |
| **Hosting** | Docker + Nginx | Containerized deployment |

---

## 2. SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Safari, Edge)  │  Mobile App (Android/iOS) │
│  Desktop App (Electron - Future)     │                           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Application (React + TypeScript)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Pages: Home, Claims, Benefits, Transition, Retirement     │ │
│  │ Components: Wizards, Calculators, Dashboards, Forms       │ │
│  │ Services: API Client, State Management, Auth Handling     │ │
│  │ Contexts: Veteran Profile, Settings, Theme, Digital Twin  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP/HTTPS (REST API)
                   │ WebSocket (Real-time updates - Future)
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (FastAPI)                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Routers:                                                    │ │
│  │  • Claims Management  • DD-214 OCR  • Retirement Planning  │ │
│  │  • Benefits Matrix    • User Auth   • Payments & Stripe   │ │
│  │  • Transition Tools   • Theme/Settings  • AI Integration  │ │
│  │                                                             │ │
│  │ Services:                                                   │ │
│  │  • Disability Calculator  • SMC Estimator                  │ │
│  │  • Evidence Analyzer      • Document Scanner               │ │
│  │  • Benefits Recommendation Engine                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  AI Engine (Python + LangChain + OpenAI)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • CFR Interpreter (38 CFR Part 3 & 4)                      │ │
│  │ • Claim Strategy Generator (Primary/Secondary mapping)     │ │
│  │ • Evidence Inference Engine (DBQ recommendations)          │ │
│  │ • Secondary Condition Mapper (Medical logic chains)        │ │
│  │ • Retirement Advisor (Financial planning AI)               │ │
│  │ • Document OCR Processor (DD-214, medical records)         │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Core Tables:                                                │ │
│  │  • users, veteran_profiles, service_periods                │ │
│  │  • claims, conditions, evidence_uploads                    │ │
│  │  • smc_rates, state_benefits, cfr_references              │ │
│  │  • subscriptions, payments, invoices                       │ │
│  │  • organizations, veteran_businesses, jobs                 │ │
│  │                                                             │ │
│  │ JSON Data Seeds:                                            │ │
│  │  • seed_conditions.json (1000+ medical conditions)         │ │
│  │  • seed_organizations.json (VSO, nonprofits, services)    │ │
│  │  • cfr_part4.json (Rating schedules)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION ENVIRONMENT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │   CloudFlare    │────▶│  Nginx Reverse  │                   │
│  │   CDN + SSL     │     │     Proxy       │                   │
│  └─────────────────┘     └────────┬────────┘                   │
│                                    │                             │
│         ┌──────────────────────────┼──────────────────┐         │
│         │                          │                  │         │
│         ▼                          ▼                  ▼         │
│  ┌─────────────┐          ┌─────────────┐    ┌─────────────┐  │
│  │  Frontend   │          │   Backend   │    │  AI Engine  │  │
│  │  (Docker)   │          │  (Docker)   │    │  (Docker)   │  │
│  │  Port 5173  │          │  Port 8000  │    │  Port 8001  │  │
│  └─────────────┘          └──────┬──────┘    └─────────────┘  │
│                                   │                             │
│                          ┌────────┴────────┐                   │
│                          ▼                 ▼                    │
│                   ┌─────────────┐   ┌─────────────┐            │
│                   │ PostgreSQL  │   │    Redis    │            │
│                   │  Database   │   │    Cache    │            │
│                   │  Port 5432  │   │  Port 6379  │            │
│                   └─────────────┘   └─────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPLETE APPLICATION STRUCTURE

### Root Project Structure

```
C:\Dev\Vets Ready\
│
├── 📁 vets-ready-frontend/          ← React TypeScript Web Application
│   ├── src/
│   │   ├── App.tsx                  ← Main application router (288 lines)
│   │   ├── main.tsx                 ← Entry point with providers
│   │   ├── index.css                ← Global styles
│   │   │
│   │   ├── pages/                   ← Main page components (20+ pages)
│   │   │   ├── HomePage.tsx         ← Landing page with features
│   │   │   ├── OnboardingWizard.tsx ← Initial user setup wizard
│   │   │   ├── WizardPage.tsx       ← 6-step disability wizard
│   │   │   ├── ClaimsHub.tsx        ← Claims management dashboard
│   │   │   ├── MyTotalBenefitsCenter.tsx ← Benefits navigator (1020 lines)
│   │   │   ├── VAKnowledgeCenter.tsx ← CFR search & AI guidance
│   │   │   ├── TransitionPage.tsx   ← Career transition tools
│   │   │   ├── EmploymentPage.tsx   ← Job search & resume builder
│   │   │   ├── EducationPage.tsx    ← GI Bill & education benefits
│   │   │   ├── Retirement.tsx       ← Financial planning & retirement
│   │   │   ├── JobBoard.tsx         ← Veteran job opportunities
│   │   │   ├── Evidence.tsx         ← Evidence organizer
│   │   │   ├── Benefits.tsx         ← Benefits overview
│   │   │   ├── Login.tsx            ← Authentication
│   │   │   ├── Register.tsx         ← User registration
│   │   │   ├── VeteranProfile.tsx   ← Profile management
│   │   │   ├── BenefitsDashboard.tsx ← Benefits summary
│   │   │   ├── WalletPage.tsx       ← Digital credentials
│   │   │   ├── LifeMapPage.tsx      ← Life planning tool
│   │   │   └── OpportunityRadarPage.tsx ← Opportunity finder
│   │   │
│   │   ├── components/              ← Reusable UI components
│   │   │   ├── pages/
│   │   │   │   └── MilitaryDiscountsPage.tsx ← Location-based discounts
│   │   │   ├── Wizard/
│   │   │   │   ├── VeteranBasicsPage.tsx ← Wizard Step 1 (1441 lines)
│   │   │   │   ├── DisabilityConditionsPage.tsx ← Wizard Step 2
│   │   │   │   ├── MilitaryBackgroundsPage.tsx ← Wizard Step 3
│   │   │   │   ├── RetirementCRSCPage.tsx ← Wizard Step 4
│   │   │   │   ├── AdvancedCalculatorsPage.tsx ← Wizard Step 5
│   │   │   │   ├── ReviewSubmitPage.tsx ← Wizard Step 6
│   │   │   │   └── WizardLayout.tsx ← Wizard shell component
│   │   │   ├── BenefitsDashboard.tsx ← Benefits matrix viewer
│   │   │   ├── MatrixDashboard.tsx  ← Benefits matrix table
│   │   │   ├── CompleteClaimWizard.tsx ← Full claim wizard
│   │   │   ├── CRSCQualificationWizard.tsx ← CRSC wizard
│   │   │   ├── SettingsPanel.tsx    ← User settings drawer
│   │   │   └── [50+ other components]
│   │   │
│   │   ├── contexts/                ← React Context providers
│   │   │   ├── VeteranProfileContext.tsx ← User profile state
│   │   │   ├── SettingsContext.tsx  ← App settings & theme
│   │   │   ├── ThemeContext.tsx     ← Branch theming
│   │   │   └── DigitalTwinContext.tsx ← AI digital twin
│   │   │
│   │   ├── services/                ← API integration layer
│   │   │   ├── api/
│   │   │   │   ├── claimsApi.ts    ← Claims API calls
│   │   │   │   ├── benefitsApi.ts  ← Benefits API calls
│   │   │   │   └── authApi.ts      ← Authentication API
│   │   │   ├── DD214Scanner.ts     ← DD-214 OCR service (472 lines)
│   │   │   ├── RatingNarrativeScanner.ts ← Rating scanner
│   │   │   ├── militaryDiscountEngine.ts ← Discount finder
│   │   │   └── subscriptionService.ts ← Stripe integration
│   │   │
│   │   ├── types/                   ← TypeScript type definitions
│   │   │   ├── wizard.types.ts     ← Wizard data models
│   │   │   ├── claims.types.ts     ← Claims models
│   │   │   └── benefits.types.ts   ← Benefits models
│   │   │
│   │   ├── hooks/                   ← Custom React hooks
│   │   │   ├── useSubscription.ts  ← Subscription state
│   │   │   ├── useFeatureAccess.ts ← Tier-based access
│   │   │   └── useAuth.ts          ← Authentication hook
│   │   │
│   │   ├── utils/                   ← Helper functions
│   │   │   ├── calculations.ts     ← Disability math
│   │   │   ├── validators.ts       ← Form validation
│   │   │   └── formatters.ts       ← Data formatting
│   │   │
│   │   ├── MatrixEngine/            ← Benefits matrix calculator
│   │   │   ├── BenefitsMatrix.ts   ← Core matrix logic
│   │   │   └── MatrixTypes.ts      ← Matrix type definitions
│   │   │
│   │   ├── lib/                     ← Third-party libraries config
│   │   │   └── api.ts              ← Axios configuration
│   │   │
│   │   └── tests/                   ← Component tests
│   │       └── VAKnowledgeCenterSimulation.test.tsx
│   │
│   ├── public/                      ← Static assets
│   │   ├── assets/
│   │   │   └── background.jpg
│   │   └── index.html
│   │
│   ├── package.json                 ← Frontend dependencies
│   ├── vite.config.ts              ← Vite build configuration
│   ├── tsconfig.json               ← TypeScript config
│   └── .env                         ← Environment variables
│
├── 📁 vets-ready-backend/           ← FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                  ← FastAPI application entry
│   │   │
│   │   ├── routers/                 ← API route handlers
│   │   │   ├── dd214.py            ← DD-214 OCR endpoints (1111 lines)
│   │   │   ├── retirement.py       ← Retirement calculators
│   │   │   ├── badges.py           ← Achievement system
│   │   │   ├── theme.py            ← User theme settings
│   │   │   ├── user_data.py        ← Data export/privacy
│   │   │   ├── claims.py           ← Claims management
│   │   │   ├── benefits.py         ← Benefits queries
│   │   │   ├── auth.py             ← Authentication
│   │   │   ├── payments.py         ← Stripe webhooks
│   │   │   └── [20+ other routers]
│   │   │
│   │   ├── services/                ← Business logic layer
│   │   │   ├── dd214_scanner.py    ← OCR processing service
│   │   │   ├── disability_calculator.py ← Rating calculations
│   │   │   ├── smc_calculator.py   ← SMC estimator
│   │   │   ├── benefits_engine.py  ← Benefits recommendations
│   │   │   ├── stripe_service.py   ← Payment processing
│   │   │   └── ai_service.py       ← OpenAI integration
│   │   │
│   │   ├── models/                  ← Database ORM models
│   │   │   ├── user.py             ← User model
│   │   │   ├── claim.py            ← Claim model
│   │   │   ├── veteran_profile.py  ← Profile model
│   │   │   └── [15+ other models]
│   │   │
│   │   ├── schemas/                 ← Pydantic validation schemas
│   │   │   ├── user_schemas.py
│   │   │   ├── claim_schemas.py
│   │   │   └── [15+ other schemas]
│   │   │
│   │   ├── core/                    ← Core utilities
│   │   │   ├── security.py         ← JWT, hashing
│   │   │   ├── config.py           ← Environment config
│   │   │   └── database.py         ← DB connection
│   │   │
│   │   ├── middleware/              ← Request/response middleware
│   │   │   ├── cors.py             ← CORS configuration
│   │   │   └── auth.py             ← Auth middleware
│   │   │
│   │   ├── utils/                   ← Helper utilities
│   │   │   ├── cfr_parser.py       ← CFR regulation parser
│   │   │   ├── pdf_generator.py    ← PDF export
│   │   │   └── validators.py       ← Data validation
│   │   │
│   │   └── tests/                   ← Backend tests
│   │       └── test_dd214_scanner.py
│   │
│   ├── requirements.txt             ← Python dependencies
│   ├── alembic/                     ← Database migrations
│   │   └── versions/
│   ├── .env                         ← Backend environment vars
│   └── pytest.ini                   ← Test configuration
│
├── 📁 vets-ready-mobile/            ← Capacitor Mobile App
│   ├── android/                     ← Android project
│   ├── ios/                         ← iOS project (future)
│   ├── capacitor.config.ts          ← Capacitor configuration
│   └── package.json
│
├── 📁 config/                       ← Configuration files
│   └── appsettings.json
│
├── 📁 data/                         ← Seed data & schemas
│   ├── seed_conditions.json         ← 1000+ medical conditions
│   ├── seed_organizations.json      ← VSO, nonprofits, businesses
│   ├── schema.sql                   ← Full database schema
│   └── Documents/                   ← Document storage
│
├── 📁 docs/                         ← Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── [50+ other documentation files]
│
├── 📁 scripts/                      ← PowerShell automation
│   ├── Bootstrap-All.ps1
│   ├── Start-Dev.ps1
│   └── Deploy-Production.ps1
│
├── 📁 logs/                         ← Application logs
│   └── scanner.log
│
├── 📁 uploads/                      ← User file uploads
│   └── dd214/
│
├── docker-compose.prod.yml          ← Production Docker config
├── Start-All-Services.ps1           ← Development startup
├── Setup-Complete.ps1               ← One-time setup
├── README.md                        ← Project readme
└── LICENSE                          ← MIT License
```

---

## 4. USER JOURNEY & FLOW CHARTS

### 4.1 Primary User Flows

#### Flow 1: New Veteran Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW VETERAN JOURNEY                           │
└─────────────────────────────────────────────────────────────────┘

START: User visits http://localhost:5173
   │
   ├─► Home Page (HomePage.tsx)
   │   │
   │   ├─ View: Hero section with mission statement
   │   ├─ View: 6 feature cards (Benefits, Claims, Transition, etc.)
   │   ├─ Action: Click "Get Started" or "Start Wizard"
   │   │
   │   └─► Navigate to /wizard
   │
   ├─► Disability Wizard (WizardPage.tsx)
   │   │
   │   ├─ STEP 1: Veteran Basics (VeteranBasicsPage.tsx)
   │   │   ├─ Input: Name, DOB, SSN, Contact
   │   │   ├─ Input: Branch, Rank, MOS
   │   │   ├─ Input: Service dates (start/end)
   │   │   ├─ Feature: Multiple service periods support
   │   │   ├─ Feature: DD-214 Upload & OCR Scanner
   │   │   │   ├─ User uploads DD-214 PDF/Image
   │   │   │   ├─ Backend: POST /api/dd214/upload
   │   │   │   ├─ Backend: OCR processing with Tesseract
   │   │   │   ├─ Backend: Extract 14+ fields
   │   │   │   ├─ Frontend: Poll /api/dd214/status/{job_id}
   │   │   │   └─ Frontend: Auto-fill form fields
   │   │   └─ Validation: All fields required
   │   │
   │   ├─ STEP 2: Disability Conditions (DisabilityConditionsPage.tsx)
   │   │   ├─ Search: 1000+ medical conditions from seed data
   │   │   ├─ Select: Primary conditions (back pain, PTSD, etc.)
   │   │   ├─ Input: Rating percentage for each (0-100%)
   │   │   ├─ Feature: Secondary condition mapping
   │   │   ├─ AI: Suggest related conditions
   │   │   └─ Calculate: Combined rating (bilateral factor)
   │   │
   │   ├─ STEP 3: Military Backgrounds (MilitaryBackgroundsPage.tsx)
   │   │   ├─ Input: Combat service (Yes/No)
   │   │   ├─ Input: Deployments (locations, dates)
   │   │   ├─ Input: Awards & decorations
   │   │   ├─ Input: Special duty assignments
   │   │   └─ Context: Used for claim strategy
   │   │
   │   ├─ STEP 4: Retirement & CRSC (RetirementCRSCPage.tsx)
   │   │   ├─ Check: Retired status (Yes/No)
   │   │   ├─ Calculate: Military pension amount
   │   │   ├─ Check: CRSC eligibility
   │   │   ├─ Compare: CRSC vs CRDP
   │   │   └─ Estimate: Total monthly income
   │   │
   │   ├─ STEP 5: Advanced Calculators (AdvancedCalculatorsPage.tsx)
   │   │   ├─ SMC Calculator (Special Monthly Compensation)
   │   │   ├─ Dependents & children counts
   │   │   ├─ Aid & Attendance eligibility
   │   │   ├─ Housebound determination
   │   │   └─ Total compensation projection
   │   │
   │   └─ STEP 6: Review & Submit (ReviewSubmitPage.tsx)
   │       ├─ Display: All entered data summary
   │       ├─ Validate: Completeness check
   │       ├─ Action: Submit to backend
   │       ├─ Backend: POST /api/claims/submit
   │       ├─ Backend: Store in PostgreSQL
   │       ├─ AI: Generate claim strategy
   │       └─► Navigate to /dashboard
   │
   └─► Benefits Dashboard (BenefitsDashboard.tsx)
       │
       ├─ Display: Total disability rating
       ├─ Display: Monthly compensation estimate
       ├─ Display: SMC breakdown
       ├─ Display: State benefits summary
       ├─ Display: Federal benefits summary
       ├─ Action: View detailed recommendations
       └─ Action: Export to PDF (VA Form 21-0966)
```

#### Flow 2: Benefits Exploration

```
┌─────────────────────────────────────────────────────────────────┐
│               BENEFITS DISCOVERY JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

START: User clicks "My Benefits Center" from navigation
   │
   └─► My Total Benefits Center (MyTotalBenefitsCenter.tsx)
       │
       ├─ TAB 1: Federal Benefits
       │   ├─ Healthcare (VA Medical, TRICARE for Life)
       │   ├─ Education (GI Bill, VET TEC, Tutorial Assistance)
       │   ├─ Housing (VA Home Loan, Adaptive Housing Grants)
       │   ├─ Recreation (National Parks Access Pass)
       │   ├─ Insurance (SGLI, VGLI, S-DVI)
       │   └─ Each benefit card:
       │       ├─ Title, description
       │       ├─ Eligibility criteria
       │       ├─ Value estimate
       │       ├─ Application button → External VA.gov link
       │       └─ "Learn More" modal with details
       │
       ├─ TAB 2: State Benefits
       │   ├─ Auto-detect: User's state from profile
       │   ├─ Display: State-specific benefits
       │   ├─ Property Tax Exemptions
       │   ├─ State Parks Annual Pass
       │   ├─ Hunting/Fishing License Discounts
       │   ├─ Education Benefits (state colleges)
       │   └─ Employment Preferences
       │
       ├─ TAB 3: Military Discounts
       │   ├─ Link to: /discounts (MilitaryDiscountsPage.tsx)
       │   │
       │   └─► Military Discounts Page
       │       ├─ Input: Zip code (5 digits)
       │       ├─ Select: Radius (5, 10, 25, 50 miles)
       │       ├─ Action: Search for nearby businesses
       │       ├─ API: POST /api/discounts/search
       │       │   └─ Mock: 5 sample businesses in Scottsdale, AZ
       │       │
       │       ├─ Display: Business cards
       │       │   ├─ Name, category
       │       │   ├─ Discount percentage
       │       │   ├─ Address, phone, hours
       │       │   ├─ Distance from user
       │       │   ├─ Star rating
       │       │   ├─ "Get Directions" (Google Maps)
       │       │   └─ "Visit Website" link
       │       │
       │       └─ Toggle: Map view (placeholder for Google Maps)
       │
       └─ TAB 4: Special Perks
           ├─ Exchange & MWR Access
           ├─ Commissary Privileges
           ├─ Credit Card Fee Waivers
           └─ Banking Fee Waivers
```

#### Flow 3: Claims Management

```
┌─────────────────────────────────────────────────────────────────┐
│                  CLAIMS MANAGEMENT FLOW                          │
└─────────────────────────────────────────────────────────────────┘

START: User navigates to /claims
   │
   └─► Claims Hub (ClaimsHub.tsx)
       │
       ├─ VIEW: Active claims list
       │   ├─ Display: Claim ID, status, submission date
       │   ├─ Display: Progress tracker (Submitted → Review → Decision)
       │   └─ Action: Click claim → View details
       │
       ├─ ACTION: File New Claim
       │   └─► Navigate to /wizard (See Flow 1)
       │
       ├─ ACTION: Upload Evidence
       │   └─► Navigate to /evidence
       │       │
       │       └─► Evidence Organizer (Evidence.tsx)
       │           ├─ Upload: Medical records (PDF, JPG, PNG)
       │           ├─ Upload: Nexus letters
       │           ├─ Upload: Lay statements
       │           ├─ Upload: Service treatment records
       │           ├─ OCR: Extract diagnoses and dates
       │           ├─ AI: Identify nexus language
       │           ├─ Organize: Tag by condition
       │           ├─ Backend: POST /api/evidence/upload
       │           └─ Store: Files in /uploads/ directory
       │
       ├─ VIEW: Claim Recommendations
       │   ├─ AI-generated claim strategy
       │   ├─ Primary vs secondary conditions
       │   ├─ Evidence gaps identified
       │   ├─ Suggested DBQs (Disability Benefits Questionnaires)
       │   └─ Timeline for submission
       │
       └─ ACTION: Export Claim Packet
           ├─ Generate: VA Form 21-526EZ (PDF)
           ├─ Include: All evidence documents
           ├─ Include: Claim summary
           └─ Download: Complete package for submission
```

#### Flow 4: Transition Planning

```
┌─────────────────────────────────────────────────────────────────┐
│                 TRANSITION PLANNING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

START: User navigates to /transition
   │
   └─► Transition Page (TransitionPage.tsx)
       │
       ├─ SECTION 1: Timeline Checklist
       │   ├─ Input: Separation date
       │   ├─ Generate: Month-by-month tasks
       │   ├─ Display: Tasks by priority (High, Medium, Low)
       │   │   ├─ 12 months: Start VA claim
       │   │   ├─ 9 months: Attend TAP class
       │   │   ├─ 6 months: Upload medical records
       │   │   ├─ 3 months: Final VA exams
       │   │   └─ 1 month: Terminal leave planning
       │   └─ Track: Completion status
       │
       ├─ SECTION 2: Document Vault
       │   ├─ Upload: DD-214 (discharge papers)
       │   ├─ Upload: Service Treatment Records (STR)
       │   ├─ Upload: Medical records
       │   ├─ Upload: Awards & decorations
       │   ├─ Upload: Training certifications
       │   ├─ Verify: Document completeness
       │   └─ Export: Digital portfolio
       │
       ├─ SECTION 3: VA Benefits Navigator
       │   ├─ Check: Disability benefits eligibility
       │   ├─ Check: Education benefits (GI Bill)
       │   ├─ Check: Home loan eligibility
       │   ├─ Check: Healthcare enrollment
       │   └─ Generate: Personalized checklist
       │
       └─ SECTION 4: Career Resources
           ├─ Link to: /employment
           │   │
           │   └─► Employment Page (EmploymentPage.tsx)
           │       ├─ Resume Builder (military → civilian translator)
           │       ├─ Job Search (veteran-friendly employers)
           │       ├─ Skills Translator (MOS → civilian jobs)
           │       └─ Interview Preparation
           │
           └─ Link to: /education
               │
               └─► Education Page (EducationPage.tsx)
                   ├─ GI Bill Calculator
                   ├─ Post-9/11 vs Montgomery comparison
                   ├─ BAH (Housing Allowance) estimator
                   ├─ School search (GI Bill approved)
                   ├─ Certification & licensing programs
                   └─ Tutorial assistance information
```

#### Flow 5: Retirement & Financial Planning

```
┌─────────────────────────────────────────────────────────────────┐
│            RETIREMENT & FINANCIAL PLANNING FLOW                  │
└─────────────────────────────────────────────────────────────────┘

START: User navigates to /retirement
   │
   └─► Retirement Page (Retirement.tsx)
       │
       ├─ TOOL 1: Military Pension Calculator
       │   ├─ Input: Years of service
       │   ├─ Input: Base pay (High-3 average)
       │   ├─ Input: Retirement system (High-3, BRS, REDUX)
       │   ├─ Calculate: Monthly pension amount
       │   ├─ Display: Lifetime value projection
       │   └─ Compare: Different retirement systems
       │
       ├─ TOOL 2: CRSC vs CRDP Comparison
       │   ├─ Input: Disability rating
       │   ├─ Input: Retired pay amount
       │   ├─ Input: Combat-related conditions
       │   ├─ Calculate: CRSC eligibility & amount
       │   ├─ Calculate: CRDP amount
       │   ├─ Display: Side-by-side comparison
       │   └─ Recommend: Best option for user
       │
       ├─ TOOL 3: Total Income Estimator
       │   ├─ Sum: Military pension
       │   ├─ Sum: VA disability compensation
       │   ├─ Sum: SMC (if applicable)
       │   ├─ Sum: Social Security (estimated)
       │   ├─ Sum: Spouse income
       │   ├─ Display: Total monthly income
       │   └─ Display: Annual income projection
       │
       ├─ TOOL 4: Budget Planner
       │   ├─ Input: Monthly income (all sources)
       │   ├─ Input: Monthly expenses
       │   │   ├─ Housing (rent/mortgage)
       │   │   ├─ Utilities
       │   │   ├─ Food & groceries
       │   │   ├─ Transportation
       │   │   ├─ Healthcare
       │   │   ├─ Insurance
       │   │   ├─ Debt payments
       │   │   └─ Discretionary spending
       │   ├─ Calculate: Net monthly cash flow
       │   ├─ Display: Budget health status
       │   │   ├─ Green: Healthy (surplus)
       │   │   ├─ Yellow: Tight (break-even)
       │   │   └─ Red: Deficit (overspending)
       │   └─ Recommend: Budget optimization tips
       │
       └─ TOOL 5: Retirement Guide (AI-Powered)
           ├─ Input: Complete financial profile
           ├─ AI: Analyze income, expenses, goals
           ├─ AI: Generate personalized recommendations
           │   ├─ Debt payoff strategy
           │   ├─ Savings goals (6-month emergency fund)
           │   ├─ Investment suggestions
           │   ├─ Healthcare planning
           │   └─ Estate planning reminders
           ├─ Display: Actionable next steps
           └─ Export: Comprehensive retirement plan (PDF)
```

---

## 5. MODULE FUNCTIONALITY MAP

### 5.1 Frontend Modules (React Components)

| Module | File | Lines | Purpose | Key Features |
|--------|------|-------|---------|--------------|
| **App Router** | App.tsx | 288 | Main application routing & layout | 20+ routes, Branch theming, Header/Footer |
| **Home Page** | HomePage.tsx | 579 | Landing page | Hero section, 6 feature cards, CTA buttons |
| **Disability Wizard** | WizardPage.tsx | 800+ | 6-step claim wizard | Multi-step form, progress tracking, validation |
| **Veteran Basics** | VeteranBasicsPage.tsx | 1441 | Wizard Step 1 | DD-214 OCR, Multiple service periods, Personal info |
| **Conditions Selector** | DisabilityConditionsPage.tsx | 650+ | Wizard Step 2 | 1000+ conditions search, Combined rating calc |
| **Military Background** | MilitaryBackgroundsPage.tsx | 450+ | Wizard Step 3 | Combat service, Deployments, Awards |
| **CRSC Calculator** | RetirementCRSCPage.tsx | 550+ | Wizard Step 4 | CRSC/CRDP comparison, Retirement eligibility |
| **SMC Calculator** | AdvancedCalculatorsPage.tsx | 600+ | Wizard Step 5 | SMC rates, Dependents, Aid & Attendance |
| **Review & Submit** | ReviewSubmitPage.tsx | 500+ | Wizard Step 6 | Data summary, Validation, Submission |
| **Benefits Center** | MyTotalBenefitsCenter.tsx | 1020 | Comprehensive benefits hub | Federal/State/Discounts tabs, 40+ benefit cards |
| **Military Discounts** | MilitaryDiscountsPage.tsx | 672 | Location-based discounts | Zip code search, Radius filter, Business listings |
| **Claims Hub** | ClaimsHub.tsx | 700+ | Claims management | Active claims list, Status tracking, Evidence upload |
| **Evidence Organizer** | Evidence.tsx | 500+ | Document management | File upload, OCR tagging, Organization |
| **VA Knowledge Center** | VAKnowledgeCenter.tsx | 900+ | CFR search & AI chat | 38 CFR database, AI chatbot, Legal references |
| **Transition Page** | TransitionPage.tsx | 800+ | Career transition tools | Timeline checklist, Document vault, Resources |
| **Employment Page** | EmploymentPage.tsx | 650+ | Job search & resume | Resume builder, MOS translator, Job board |
| **Education Page** | EducationPage.tsx | 700+ | GI Bill & education | GI Bill calculator, School search, BAH estimator |
| **Retirement Page** | Retirement.tsx | 900+ | Financial planning | Pension calc, Budget planner, Retirement guide |
| **Job Board** | JobBoard.tsx | 550+ | Veteran job listings | Job search, Filters, Application tracking |
| **Benefits Dashboard** | BenefitsDashboard.tsx | 600+ | Benefits summary | Total value, Eligibility, Recommendations |
| **Matrix Dashboard** | MatrixDashboard.tsx | 450+ | Benefits matrix viewer | Interactive table, Eligibility checker |
| **Wallet Page** | WalletPage.tsx | 400+ | Digital credentials | VA card, ID cards, Certificates |
| **Life Map** | LifeMapPage.tsx | 500+ | Life planning tool | Goals tracking, Milestone planning |
| **Opportunity Radar** | OpportunityRadarPage.tsx | 450+ | Opportunity finder | Grants, Jobs, Benefits, Local resources |

### 5.2 Backend Modules (FastAPI Routers)

| Module | File | Endpoints | Purpose | Key Features |
|--------|------|-----------|---------|--------------|
| **DD-214 Scanner** | dd214.py | 5 | Document OCR processing | Upload, Status polling, Result retrieval, Export |
| **Retirement API** | retirement.py | 8 | Retirement calculations | Eligibility, Pension, Budget, Projection, SMC |
| **Badges System** | badges.py | 2 | Achievement tracking | My badges, Check achievements |
| **Theme API** | theme.py | 8 | User theming | Branch themes, Custom colors, Presets |
| **User Data** | user_data.py | 4 | Privacy & data export | Export data, Delete account, Privacy settings |
| **Claims API** | claims.py | 10 | Claims management | CRUD operations, Status updates, Recommendations |
| **Benefits API** | benefits.py | 6 | Benefits queries | Eligibility checks, State benefits, Federal benefits |
| **Auth API** | auth.py | 5 | Authentication | Register, Login, Logout, Refresh token, Profile |
| **Payments API** | payments.py | 7 | Stripe integration | Checkout, Webhooks, Invoices, Refunds |

### 5.3 Service Layer (Business Logic)

| Service | File | Purpose | Key Functions |
|---------|------|---------|---------------|
| **DD-214 Scanner** | dd214_scanner.py | OCR processing | extract_text(), parse_fields(), validate_dd214() |
| **Disability Calculator** | disability_calculator.py | Rating math | calculate_combined_rating(), apply_bilateral_factor() |
| **SMC Calculator** | smc_calculator.py | SMC estimation | determine_eligibility(), calculate_smc_amount() |
| **Benefits Engine** | benefits_engine.py | Recommendations | match_eligibility(), rank_benefits(), generate_report() |
| **Stripe Service** | stripe_service.py | Payment processing | create_checkout(), handle_webhook(), create_invoice() |
| **AI Service** | ai_service.py | OpenAI integration | generate_claim_strategy(), chat_completion() |

### 5.4 Context Providers (State Management)

| Context | File | Purpose | State Managed |
|---------|------|---------|---------------|
| **Veteran Profile** | VeteranProfileContext.tsx | User profile state | Personal info, Service history, Conditions, Ratings |
| **Settings** | SettingsContext.tsx | App settings | Theme, Branch, Background, Preferences |
| **Theme** | ThemeContext.tsx | Branch theming | Colors, Icons, Typography |
| **Digital Twin** | DigitalTwinContext.tsx | AI persona | User preferences, Learning patterns, Recommendations |

---

## 6. DATA FLOW & INTEGRATION PATTERNS

### 6.1 Claims Submission Flow (Complete)

```
┌─────────────────────────────────────────────────────────────────┐
│              CLAIMS SUBMISSION DATA FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. USER INPUT (Frontend)
   ├─ VeteranBasicsPage.tsx
   │   └─ Form data: { name, dob, ssn, branch, rank, serviceDates[] }
   │
   ├─ DisabilityConditionsPage.tsx
   │   └─ Conditions data: [{ name, rating, isPrimary, bodySystem }]
   │
   ├─ MilitaryBackgroundsPage.tsx
   │   └─ Military data: { combat, deployments[], awards[] }
   │
   ├─ RetirementCRSCPage.tsx
   │   └─ Retirement data: { isRetired, pensionAmount, crscEligible }
   │
   └─ AdvancedCalculatorsPage.tsx
       └─ SMC data: { dependents, aidAttendance, housebound }

2. FORM SUBMISSION (Frontend → Backend)
   ├─ ReviewSubmitPage.tsx
   │   ├─ Action: User clicks "Submit Claim"
   │   ├─ Validate: All required fields present
   │   ├─ API Call: POST /api/claims/submit
   │   │   └─ Payload: Complete claim object (JSON)
   │   │
   │   └─ HTTP Request
   │       ├─ URL: http://localhost:8000/api/claims/submit
   │       ├─ Method: POST
   │       ├─ Headers: { "Content-Type": "application/json" }
   │       └─ Body: {
   │             veteran: { ... },
   │             conditions: [ ... ],
   │             military: { ... },
   │             retirement: { ... },
   │             smc: { ... }
   │           }

3. BACKEND PROCESSING (FastAPI)
   ├─ routers/claims.py
   │   ├─ @router.post("/submit")
   │   ├─ Validate: Pydantic schema validation
   │   │   └─ schemas/claim_schemas.py: ClaimSubmissionSchema
   │   │
   │   └─ Call: services/claims_service.py
   │
   ├─ services/claims_service.py
   │   ├─ Function: process_claim_submission(claim_data)
   │   │
   │   ├─ Calculate: Combined disability rating
   │   │   └─ Call: disability_calculator.py
   │   │       ├─ apply_bilateral_factor()
   │   │       └─ round_to_nearest_10()
   │   │
   │   ├─ Calculate: SMC eligibility
   │   │   └─ Call: smc_calculator.py
   │   │       └─ determine_smc_level()
   │   │
   │   ├─ Generate: Claim strategy (AI)
   │   │   └─ Call: ai_service.py
   │   │       ├─ map_primary_secondary_conditions()
   │   │       ├─ identify_evidence_gaps()
   │   │       └─ generate_recommendations()
   │   │
   │   └─ Store: Database persistence
   │
   └─ database.py (PostgreSQL)
       ├─ INSERT INTO users (...)
       ├─ INSERT INTO veteran_profiles (...)
       ├─ INSERT INTO service_periods (...)
       ├─ INSERT INTO claims (...)
       ├─ INSERT INTO conditions (...)
       └─ COMMIT transaction

4. AI PROCESSING (OpenAI Integration)
   ├─ ai_service.py
   │   ├─ Prompt: "Generate claim strategy for veteran with..."
   │   ├─ Context: Service history, conditions, evidence
   │   │
   │   └─ OpenAI API Call
   │       ├─ Model: gpt-4
   │       ├─ Temperature: 0.3 (deterministic)
   │       ├─ Max tokens: 2000
   │       └─ Response: Structured claim strategy
   │
   └─ Strategy Output
       ├─ Primary conditions ranked
       ├─ Secondary conditions mapped
       ├─ Evidence recommendations
       ├─ DBQ suggestions
       └─ Timeline for submission

5. RESPONSE (Backend → Frontend)
   ├─ HTTP 201 Created
   ├─ Response Body: {
   │     claimId: "uuid-123",
   │     combinedRating: 70,
   │     monthlyCompensation: 1529.95,
   │     smcAmount: 0,
   │     strategy: { ... },
   │     recommendations: [ ... ]
   │   }
   │
   └─ Frontend: Navigate to /dashboard

6. DASHBOARD DISPLAY (Frontend)
   └─ BenefitsDashboard.tsx
       ├─ Display: "Your claim has been saved!"
       ├─ Display: Combined rating: 70%
       ├─ Display: Monthly compensation: $1,529.95
       ├─ Display: Claim strategy summary
       ├─ Action: "View Full Report"
       └─ Action: "Export to PDF"
```

### 6.2 DD-214 OCR Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 DD-214 OCR PROCESSING FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. FILE UPLOAD (Frontend)
   ├─ VeteranBasicsPage.tsx
   │   ├─ Component: DD214Scanner.ts
   │   ├─ User action: Select PDF/Image file
   │   ├─ Validation: File type (PDF, JPG, PNG)
   │   ├─ Validation: File size (< 10MB)
   │   └─ API Call: POST /api/dd214/upload

2. BACKEND UPLOAD HANDLER
   ├─ routers/dd214.py
   │   ├─ @router.post("/upload")
   │   ├─ Receive: Multipart form data
   │   ├─ Save: File to /uploads/dd214/{uuid}.pdf
   │   │
   │   └─ Create: Background job
   │       ├─ Job ID: uuid-456
   │       ├─ Status: "processing"
   │       └─ Queue: OCR processing task

3. OCR PROCESSING (Background)
   ├─ services/dd214_scanner.py
   │   │
   │   ├─ Load: PDF file
   │   │   └─ Library: PyPDF2 or pdf2image
   │   │
   │   ├─ Convert: PDF → Images (if needed)
   │   │   └─ Library: pdf2image
   │   │
   │   ├─ OCR: Extract text from images
   │   │   ├─ Library: pytesseract (Tesseract OCR)
   │   │   ├─ Language: English
   │   │   ├─ DPI: 300
   │   │   └─ Output: Raw text string
   │   │
   │   ├─ Parse: Extract structured fields
   │   │   ├─ Regex patterns for DD-214 format
   │   │   ├─ Extract: Name, SSN, DOB
   │   │   ├─ Extract: Branch, Rank, MOS
   │   │   ├─ Extract: Entry date, Separation date
   │   │   ├─ Extract: Character of discharge
   │   │   ├─ Extract: Combat service indicators
   │   │   ├─ Extract: Awards & decorations
   │   │   ├─ Extract: Training & education
   │   │   └─ Extract: Re-enlistment codes
   │   │
   │   ├─ Validate: Field completeness
   │   │   └─ Check: Required fields present
   │   │
   │   └─ Store: Parsed data
   │       ├─ Database: dd214_scans table
   │       └─ Status: "completed"

4. STATUS POLLING (Frontend)
   ├─ DD214Scanner.ts
   │   ├─ Poll: GET /api/dd214/status/{job_id}
   │   ├─ Interval: Every 2 seconds
   │   ├─ Max attempts: 30 (60 seconds total)
   │   │
   │   └─ Response states:
   │       ├─ "processing" → Continue polling
   │       ├─ "completed" → Fetch results
   │       └─ "failed" → Show error message

5. RESULTS RETRIEVAL (Frontend)
   ├─ API Call: GET /api/dd214/result/{job_id}
   │
   └─ Response: {
         name: "John Doe",
         ssn: "123-45-6789",
         dob: "1985-05-15",
         branch: "Army",
         rank: "SGT",
         mos: "11B",
         entryDate: "2005-01-10",
         separationDate: "2015-01-09",
         characterOfDischarge: "Honorable",
         combatService: true,
         awards: ["Purple Heart", "Army Commendation Medal"],
         servicePeriods: [
           { startDate: "2005-01-10", endDate: "2015-01-09" }
         ]
       }

6. AUTO-FILL FORM (Frontend)
   ├─ VeteranBasicsPage.tsx
   │   ├─ Populate: Name field
   │   ├─ Populate: SSN field
   │   ├─ Populate: DOB field
   │   ├─ Populate: Branch dropdown
   │   ├─ Populate: Rank field
   │   ├─ Populate: MOS field
   │   ├─ Populate: Service dates
   │   ├─ Populate: Combat service checkbox
   │   └─ Populate: Awards list
   │
   └─ User: Review & confirm auto-filled data
```

---

## 7. API ENDPOINT REFERENCE

### Complete Backend API Documentation

**Base URL:** `http://localhost:8000`

#### Authentication Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/auth/register` | User registration | `{ email, password, name }` | `{ userId, token }` |
| POST | `/api/auth/login` | User login | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/logout` | Logout | - | `{ message }` |
| POST | `/api/auth/refresh` | Refresh token | `{ refreshToken }` | `{ token }` |
| GET | `/api/auth/profile` | Get user profile | - | `{ user }` |

#### DD-214 Scanner Endpoints

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| POST | `/api/dd214/upload` | Upload DD-214 file | Multipart file | `{ jobId, status }` |
| GET | `/api/dd214/status/{job_id}` | Check processing status | - | `{ status, progress }` |
| GET | `/api/dd214/result/{job_id}` | Get extraction results | - | `{ fields: {...} }` |
| GET | `/api/dd214/export/hr/{job_id}` | Export HR format | - | PDF download |
| GET | `/api/dd214/health` | Health check | - | `{ status: "healthy" }` |

#### Claims Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/claims/submit` | Submit new claim | Complete claim object | `{ claimId, rating }` |
| GET | `/api/claims/my-claims` | Get user's claims | - | `[{ claimId, status }]` |
| GET | `/api/claims/{claim_id}` | Get claim details | - | `{ claim }` |
| PUT | `/api/claims/{claim_id}` | Update claim | Partial claim object | `{ claim }` |
| DELETE | `/api/claims/{claim_id}` | Delete claim | - | `{ message }` |
| POST | `/api/claims/calculate-rating` | Calculate combined rating | `{ conditions: [] }` | `{ rating, breakdown }` |
| POST | `/api/claims/strategy` | Get claim strategy | `{ veteran, conditions }` | `{ strategy }` |
| GET | `/api/claims/{claim_id}/export` | Export claim to PDF | - | PDF download |

#### Retirement Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/retirement/eligibility` | Check retirement eligibility | `{ yearsOfService, age }` | `{ eligible, reasons }` |
| POST | `/api/retirement/pension` | Calculate military pension | `{ years, basePay, system }` | `{ monthlyAmount }` |
| POST | `/api/retirement/budget` | Analyze budget | `{ income[], expenses[] }` | `{ health, recommendations }` |
| POST | `/api/retirement/projection` | Long-term projection | `{ income, expenses, goals }` | `{ timeline }` |
| POST | `/api/retirement/guide` | AI retirement guide | Complete financial profile | `{ recommendations }` |
| POST | `/api/retirement/smc-eligibility` | Check SMC eligibility | `{ conditions, dependents }` | `{ eligible, amount }` |
| GET | `/api/retirement/health` | Health check | - | `{ status: "healthy" }` |

#### Benefits Endpoints

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| GET | `/api/benefits/federal` | Get federal benefits | - | `[{ benefit }]` |
| GET | `/api/benefits/state/{state}` | Get state benefits | State code | `[{ benefit }]` |
| POST | `/api/benefits/eligibility` | Check benefit eligibility | `{ veteran, benefit }` | `{ eligible }` |
| GET | `/api/benefits/search?q={query}` | Search benefits | Query string | `[{ benefit }]` |

#### Discounts Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/discounts/search` | Search nearby discounts | `{ zipCode, radius }` | `[{ business }]` |
| GET | `/api/discounts/categories` | Get discount categories | - | `[{ category }]` |
| GET | `/api/discounts/{business_id}` | Get business details | - | `{ business }` |

#### Theme Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/theme/my-theme` | Get user's theme | - | `{ theme }` |
| POST | `/api/theme/set-branch` | Set branch theme | `{ branch }` | `{ theme }` |
| POST | `/api/theme/set-preset` | Set theme preset | `{ preset }` | `{ theme }` |
| POST | `/api/theme/set-insignia` | Set custom insignia | `{ insignia }` | `{ theme }` |
| POST | `/api/theme/set-colors` | Set custom colors | `{ colors }` | `{ theme }` |
| POST | `/api/theme/reset` | Reset to default | - | `{ theme }` |
| GET | `/api/theme/branches` | Get available branches | - | `[{ branch }]` |
| GET | `/api/theme/presets` | Get theme presets | - | `[{ preset }]` |

#### User Data & Privacy Endpoints

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| GET | `/api/user-data/export` | Export user data (GDPR) | - | ZIP download |
| DELETE | `/api/user-data/delete-account` | Request account deletion | - | `{ scheduledDate }` |
| POST | `/api/user-data/cancel-deletion` | Cancel deletion request | - | `{ message }` |
| GET | `/api/user-data/privacy-settings` | Get privacy settings | - | `{ settings }` |
| PUT | `/api/user-data/privacy-settings` | Update privacy settings | `{ settings }` | `{ settings }` |

#### Badges & Achievements

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| GET | `/api/badges/my-badges` | Get user badges | - | `[{ badge }]` |
| POST | `/api/badges/check` | Check new achievements | - | `[{ newBadge }]` |

#### Payment & Subscription Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/payments/create-checkout` | Create Stripe session | `{ tier, priceId }` | `{ sessionId, url }` |
| POST | `/api/payments/webhook` | Stripe webhook handler | Stripe event | `{ received: true }` |
| GET | `/api/payments/invoices` | Get user invoices | - | `[{ invoice }]` |
| POST | `/api/payments/cancel-subscription` | Cancel subscription | `{ subscriptionId }` | `{ message }` |
| POST | `/api/payments/update-payment-method` | Update payment | `{ paymentMethodId }` | `{ message }` |

---

## 8. COMPONENT HIERARCHY

### Frontend Component Tree

```
App.tsx (Root Component)
│
├─ VeteranProfileProvider (Context)
│  └─ ThemeProvider (Context)
│     └─ SettingsProvider (Context)
│        └─ Router (React Router)
│           │
│           ├─ Header (Global)
│           │  ├─ Logo
│           │  ├─ Navigation Links
│           │  │  ├─ Claims Management
│           │  │  ├─ Career Transition
│           │  │  ├─ Financial Planning
│           │  │  ├─ Benefits Center
│           │  │  ├─ VA Resources
│           │  │  └─ File New Claim
│           │  └─ Login Button
│           │
│           ├─ Main Content Area (Routes)
│           │  │
│           │  ├─ Route: / (Home)
│           │  │  └─ HomePage
│           │  │     ├─ Hero Section
│           │  │     ├─ Features Grid
│           │  │     │  ├─ Benefits Card
│           │  │     │  ├─ Claims Card
│           │  │     │  ├─ Transition Card
│           │  │     │  ├─ Financial Card
│           │  │     │  ├─ Education Card
│           │  │     │  └─ Community Card
│           │  │     ├─ Statistics Section
│           │  │     └─ CTA Section
│           │  │
│           │  ├─ Route: /wizard (Disability Wizard)
│           │  │  └─ WizardPage
│           │  │     └─ WizardLayout (6 steps)
│           │  │        ├─ Progress Indicator
│           │  │        ├─ Step Content
│           │  │        │  ├─ Step 1: VeteranBasicsPage
│           │  │        │  │  ├─ Personal Info Form
│           │  │        │  │  ├─ Service Info Form
│           │  │        │  │  ├─ DD214Scanner Component
│           │  │        │  │  │  ├─ File Upload
│           │  │        │  │  │  ├─ Processing Indicator
│           │  │        │  │  │  └─ Auto-fill Results
│           │  │        │  │  └─ Multiple Service Periods
│           │  │        │  │     ├─ Period Form
│           │  │        │  │     └─ Add/Remove Buttons
│           │  │        │  │
│           │  │        │  ├─ Step 2: DisabilityConditionsPage
│           │  │        │  │  ├─ Condition Search
│           │  │        │  │  ├─ Selected Conditions List
│           │  │        │  │  ├─ Rating Sliders
│           │  │        │  │  └─ Combined Rating Display
│           │  │        │  │
│           │  │        │  ├─ Step 3: MilitaryBackgroundsPage
│           │  │        │  │  ├─ Combat Service Checkbox
│           │  │        │  │  ├─ Deployments List
│           │  │        │  │  └─ Awards Input
│           │  │        │  │
│           │  │        │  ├─ Step 4: RetirementCRSCPage
│           │  │        │  │  ├─ Retirement Status
│           │  │        │  │  ├─ Pension Calculator
│           │  │        │  │  └─ CRSC vs CRDP Table
│           │  │        │  │
│           │  │        │  ├─ Step 5: AdvancedCalculatorsPage
│           │  │        │  │  ├─ SMC Calculator
│           │  │        │  │  ├─ Dependents Counter
│           │  │        │  │  └─ Total Compensation
│           │  │        │  │
│           │  │        │  └─ Step 6: ReviewSubmitPage
│           │  │        │     ├─ Data Summary
│           │  │        │     ├─ Validation Messages
│           │  │        │     └─ Submit Button
│           │  │        │
│           │  │        └─ Navigation Buttons
│           │  │           ├─ Previous
│           │  │           ├─ Next
│           │  │           └─ Save Draft
│           │  │
│           │  ├─ Route: /benefits-center
│           │  │  └─ MyTotalBenefitsCenter
│           │  │     ├─ Tab Navigation
│           │  │     │  ├─ Federal Benefits Tab
│           │  │     │  ├─ State Benefits Tab
│           │  │     │  ├─ Military Discounts Tab
│           │  │     │  └─ Special Perks Tab
│           │  │     │
│           │  │     └─ Tab Content
│           │  │        ├─ Federal Benefits
│           │  │        │  ├─ Healthcare Section
│           │  │        │  │  └─ Benefit Cards
│           │  │        │  ├─ Education Section
│           │  │        │  ├─ Housing Section
│           │  │        │  ├─ Recreation Section
│           │  │        │  │  └─ National Parks Card
│           │  │        │  └─ Insurance Section
│           │  │        │
│           │  │        ├─ State Benefits
│           │  │        │  ├─ State Selector
│           │  │        │  ├─ Property Tax Exemption
│           │  │        │  ├─ State Parks Card
│           │  │        │  ├─ License Discounts
│           │  │        │  └─ Education Benefits
│           │  │        │
│           │  │        ├─ Military Discounts
│           │  │        │  └─ Link to /discounts
│           │  │        │
│           │  │        └─ Special Perks
│           │  │           ├─ Exchange Access
│           │  │           ├─ Commissary
│           │  │           ├─ Credit Card Waivers
│           │  │           └─ Banking Perks
│           │  │
│           │  ├─ Route: /discounts
│           │  │  └─ MilitaryDiscountsPage
│           │  │     ├─ Search Section
│           │  │     │  ├─ Zip Code Input
│           │  │     │  ├─ Radius Selector
│           │  │     │  └─ Search Button
│           │  │     │
│           │  │     ├─ Results Section
│           │  │     │  ├─ Savings Summary Card
│           │  │     │  ├─ View Toggle (List/Map)
│           │  │     │  │
│           │  │     │  ├─ List View
│           │  │     │  │  └─ Business Cards
│           │  │     │  │     ├─ Business Name
│           │  │     │  │     ├─ Category & Discount
│           │  │     │  │     ├─ Address & Phone
│           │  │     │  │     ├─ Hours & Distance
│           │  │     │  │     ├─ Star Rating
│           │  │     │  │     ├─ Get Directions Button
│           │  │     │  │     └─ Visit Website Button
│           │  │     │  │
│           │  │     │  └─ Map View (Placeholder)
│           │  │     │
│           │  │     └─ Category Filters
│           │  │
│           │  ├─ Route: /claims
│           │  │  └─ ClaimsHub
│           │  │     ├─ Active Claims List
│           │  │     ├─ Claim Status Cards
│           │  │     ├─ Progress Tracker
│           │  │     ├─ File New Claim Button
│           │  │     └─ Upload Evidence Button
│           │  │
│           │  ├─ Route: /va-knowledge
│           │  │  └─ VAKnowledgeCenter
│           │  │     ├─ CFR Search
│           │  │     │  ├─ Part 3 Tab
│           │  │     │  ├─ Part 4 Tab
│           │  │     │  ├─ Search Input
│           │  │     │  └─ Results Display
│           │  │     │
│           │  │     ├─ AI Chatbot
│           │  │     │  ├─ Chat History
│           │  │     │  ├─ Message Input
│           │  │     │  └─ Send Button
│           │  │     │
│           │  │     └─ Quick References
│           │  │        ├─ Common Questions
│           │  │        └─ External Links
│           │  │
│           │  ├─ Route: /transition
│           │  │  └─ TransitionPage
│           │  │     ├─ Timeline Checklist
│           │  │     ├─ Document Vault
│           │  │     ├─ VA Navigator
│           │  │     └─ Career Resources
│           │  │
│           │  ├─ Route: /retirement
│           │  │  └─ RetirementPage
│           │  │     ├─ Pension Calculator
│           │  │     ├─ CRSC/CRDP Tool
│           │  │     ├─ Income Estimator
│           │  │     ├─ Budget Planner
│           │  │     └─ AI Retirement Guide
│           │  │
│           │  └─ [15+ other routes]
│           │
│           ├─ SettingsPanel (Side Drawer)
│           │  ├─ Branch Selector
│           │  ├─ Theme Presets
│           │  ├─ Custom Colors
│           │  └─ Background Options
│           │
│           └─ Footer (Global)
│              ├─ Logo Section
│              ├─ Links (About, Contact, Privacy)
│              ├─ Quote Section
│              └─ Copyright
│
└─ Shared Components (Used across pages)
   ├─ Loading Spinner
   ├─ Error Boundary
   ├─ Modal Dialog
   ├─ Toast Notifications
   ├─ Form Input Components
   ├─ Button Components
   └─ Card Components
```

---

## 9. STATE MANAGEMENT & CONTEXT

### Context Architecture

```
VeteranProfileContext
├─ State:
│  ├─ profile: {
│  │   name, dob, ssn, email, phone,
│  │   branch, rank, mos,
│  │   servicePeriods: [{ startDate, endDate, branch }],
│  │   vaDisabilityRating: number,
│  │   conditions: [{ name, rating, isPrimary }],
│  │   isRetired: boolean,
│  │   pensionAmount: number
│  │  }
│  │
│  ├─ Methods:
│  │  ├─ updateProfile(data)
│  │  ├─ addServicePeriod(period)
│  │  ├─ removeServicePeriod(index)
│  │  ├─ addCondition(condition)
│  │  └─ calculateCombinedRating()
│  │
│  └─ Persistence: localStorage + backend sync

SettingsContext
├─ State:
│  ├─ currentTheme: { branch, colors, icon }
│  ├─ currentBackground: string (image path)
│  ├─ settings: {
│  │   notifications: boolean,
│  │   autoSave: boolean,
│  │   privacy: string
│  │  }
│  │
│  ├─ Methods:
│  │  ├─ changeBranch(branch)
│  │  ├─ changeBackground(bg)
│  │  ├─ updateSetting(key, value)
│  │  └─ resetToDefaults()
│  │
│  └─ Persistence: localStorage

ThemeContext
├─ Themes:
│  ├─ Army: { primary: olive, accent: gold }
│  ├─ Navy: { primary: navy, accent: gold }
│  ├─ Air Force: { primary: blue, accent: silver }
│  ├─ Marine Corps: { primary: red, accent: gold }
│  ├─ Coast Guard: { primary: blue, accent: orange }
│  └─ Space Force: { primary: dark blue, accent: white }
│
└─ Apply: Dynamic CSS variables

DigitalTwinContext (AI Persona)
├─ State:
│  ├─ userPreferences: { ... }
│  ├─ learningHistory: [ ... ]
│  └─ recommendations: [ ... ]
│
└─ Methods:
   ├─ trackBehavior(action)
   ├─ generateRecommendation()
   └─ personalizeContent()
```

---

## 10. DEPLOYMENT & INFRASTRUCTURE

### Development Environment

```
Local Development Setup
│
├─ Prerequisites:
│  ├─ Node.js 20+
│  ├─ Python 3.11+
│  ├─ PostgreSQL 15+
│  └─ Redis 7+ (optional)
│
├─ Setup Commands:
│  ├─ Clone repository
│  ├─ Run: .\Setup-Complete.ps1
│  │  ├─ Install frontend dependencies (npm install)
│  │  ├─ Create Python venv
│  │  ├─ Install backend dependencies (pip install)
│  │  ├─ Create PostgreSQL database
│  │  ├─ Run migrations
│  │  └─ Seed data
│  │
│  └─ Start: .\Start-All-Services.ps1
│     ├─ Start PostgreSQL
│     ├─ Start backend (uvicorn)
│     └─ Start frontend (vite)
│
└─ Access Points:
   ├─ Frontend: http://localhost:5173
   ├─ Backend: http://localhost:8000
   ├─ API Docs: http://localhost:8000/docs
   └─ ReDoc: http://localhost:8000/redoc
```

### Production Deployment

```
Production Stack (Docker)
│
├─ docker-compose.prod.yml
│  ├─ Service: nginx (Reverse Proxy)
│  │  ├─ Port: 80, 443
│  │  ├─ SSL: Let's Encrypt
│  │  └─ Static files serving
│  │
│  ├─ Service: frontend (React)
│  │  ├─ Build: npm run build
│  │  ├─ Serve: nginx container
│  │  └─ Volume: /usr/share/nginx/html
│  │
│  ├─ Service: backend (FastAPI)
│  │  ├─ Image: python:3.11-slim
│  │  ├─ Port: 8000
│  │  ├─ Command: uvicorn --host 0.0.0.0
│  │  └─ Volume: /app
│  │
│  ├─ Service: postgres (Database)
│  │  ├─ Image: postgres:15
│  │  ├─ Port: 5432
│  │  ├─ Volume: /var/lib/postgresql/data
│  │  └─ Environment: POSTGRES_DB, POSTGRES_USER
│  │
│  └─ Service: redis (Cache)
│     ├─ Image: redis:7-alpine
│     ├─ Port: 6379
│     └─ Volume: /data
│
├─ Deployment Process:
│  ├─ 1. Build Docker images
│  ├─ 2. Push to registry (Docker Hub / AWS ECR)
│  ├─ 3. Deploy to server (AWS EC2, DigitalOcean)
│  ├─ 4. Run migrations
│  ├─ 5. Seed production data
│  ├─ 6. Configure SSL
│  └─ 7. Set up monitoring
│
└─ Monitoring & Logging:
   ├─ Application logs → CloudWatch / Datadog
   ├─ Error tracking → Sentry
   ├─ Uptime monitoring → UptimeRobot
   └─ Performance → New Relic / AppDynamics
```

---

## CONCLUSION

This master guide provides a complete technical specification and workflow documentation for the Vets Ready platform. It serves as the single source of truth for:

- **Developers:** Understanding code structure, data flows, and integration patterns
- **Architects:** Planning system enhancements and scaling strategies
- **Stakeholders:** Grasping platform capabilities and business logic
- **New Team Members:** Onboarding and rapid skill development

**Key Takeaways:**

1. **Comprehensive Coverage:** 20+ frontend pages, 30+ API endpoints, 6-step wizard, AI integration
2. **Veteran-Centric Design:** Every feature built around veteran needs and VA regulations
3. **Modern Architecture:** React + FastAPI + PostgreSQL + AI (OpenAI GPT-4)
4. **Production-Ready:** Docker deployment, Stripe payments, full authentication
5. **Extensible Foundation:** Modular design allows easy feature additions

**Next Steps for Enhancement:**

- Real-time notifications (WebSockets)
- Advanced AI recommendations (fine-tuned models)
- Mobile app deployment (iOS/Android)
- VSO partner portal
- White-label solutions for organizations

---

**Document Control:**
- Version: 2.0
- Last Updated: January 26, 2026
- Maintained by: Vets Ready Development Team
- Location: C:\Dev\Vets Ready\App\VETS_READY_MASTER_APPLICATION_GUIDE.md
