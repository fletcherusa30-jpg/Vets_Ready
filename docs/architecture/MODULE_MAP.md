# rallyforge Module Map

**Last Updated:** January 25, 2026
**Purpose:** Comprehensive map of all rallyforge modules, file structure, and system boundaries.

---

## Table of Contents

1. [Core Routes](#core-routes)
2. [MatrixEngine Structure](#matrixengine-structure)
3. [Next-Generation Features](#next-generation-features)
4. [Component Organization](#component-organization)
5. [Data Catalogs](#data-catalogs)

---

## Core Routes

rallyforge supports 16 primary routes, each representing a major system:

| Route | Purpose | Key Features |
|-------|---------|--------------|
| `/` | Home | Mission statement, wizard entry, quick tools |
| `/profile` | Veteran Profile | Master record, single source of truth |
| `/claims` | Claims Assistant | Conditions, evidence, lay statements |
| `/wizard` | Guided Wizard | 7-step intake flow |
| `/matrix` | Benefits Matrix | Federal, state, local benefit cards |
| `/dashboard` | Veteran Dashboard | 9-view command center |
| `/employment` | Employment Hub | MOS translator, job match, employer search |
| `/education` | Education Hub | GI Bill planner, apprenticeships |
| `/local` | Local Resources | Orgs, VSOs, attorneys, events |
| `/wallet` | Digital Wallet | Secure document vault |
| `/lifemap` | Life Map | Interactive service timeline |
| `/opportunities` | Opportunity Radar | Weekly Top 5 opportunities |
| `/family` | Family Hub | CHAMPVA, DEA, caregiver programs |
| `/business` | Entrepreneurship | SBA, VOSB/SDVOSB programs |
| `/travel` | Travel Hub | Space-A, DMV benefits, park passes |
| `/mentalhealth` | Mental Health Navigator | Peer support, crisis resources |

---

## MatrixEngine Structure

The Matrix Engine is the core intelligence layer. All eligibility logic lives here, not in UI components.

```
MatrixEngine/
├─ core/
│   ├─ digitalTwin.ts           # Living model of veteran's complete context
│   ├─ profileNormalizer.ts     # Standardizes profile data
│   ├─ rulesEngine.ts            # Central eligibility rules
│   └─ scoring.ts                # Readiness/completeness scoring
│
├─ lifeMap/
│   ├─ timelineBuilder.ts        # Constructs service timeline
│   └─ eventExtractor.ts         # Extracts events from profile/docs
│
├─ wallet/
│   ├─ documentTagger.ts         # Auto-tags uploaded documents
│   ├─ autoExtractor.ts          # Extracts metadata from documents
│   └─ packetBuilder.ts          # Assembles claim/appeal packets
│
├─ opportunityRadar/
│   ├─ benefitScanner.ts         # Scans for relevant benefits
│   ├─ jobScanner.ts             # Scans for job matches
│   ├─ educationScanner.ts       # Scans for education programs
│   ├─ housingScanner.ts         # Scans for housing programs
│   ├─ localScanner.ts           # Scans for local resources
│   └─ eventScanner.ts           # Scans for relevant events
│
├─ employment/
│   ├─ mosToSkills.ts            # Maps MOS → civilian skills
│   ├─ mosToJobs.ts              # Maps MOS → civilian job titles
│   ├─ jobMatchEngine.ts         # Matches veteran to jobs
│   ├─ employerSearchEngine.ts   # Filters employer database
│   └─ resumeBuilder.ts          # Generates resume content
│
├─ education/
│   ├─ giBillSuggestions.ts      # Suggests GI Bill programs
│   ├─ apprenticeshipFinder.ts   # Finds apprenticeships/OJT
│   └─ licenseCertMapper.ts      # Maps licenses/certs to jobs
│
├─ local/
│   ├─ orgMatcher.ts             # Matches veteran to local orgs
│   ├─ vsoMatcher.ts             # Matches veteran to VSOs
│   ├─ attorneyMatcher.ts        # Matches veteran to attorneys
│   └─ eventMatcher.ts           # Matches veteran to local events
│
├─ family/
│   ├─ champvaMapper.ts          # CHAMPVA eligibility logic
│   ├─ deaMapper.ts              # DEA eligibility logic
│   └─ caregiverMapper.ts        # Caregiver program logic
│
├─ evidence/
│   ├─ layStatementBuilder.ts           # Generates lay statement templates
│   ├─ buddyStatementBuilder.ts         # Generates buddy statement templates
│   ├─ stressorBuilder.ts               # Generates stressor statement templates
│   ├─ crscNarrativeBuilder.ts          # Generates CRSC narrative templates
│   └─ dischargeUpgradeNarrativeBuilder.ts  # Generates discharge upgrade narratives
│
├─ meta/
│   ├─ readinessScore.ts         # Calculates Readiness Score (0-100%)
│   ├─ expirationTracker.ts      # Tracks benefit expirations
│   └─ smartRecommendations.ts   # Generates personalized recommendations
│
└─ catalogs/
    ├─ mosMap.json               # Complete MOS → skills/jobs mapping
    ├─ benefitsCatalog.json      # Federal, state, local benefits
    ├─ giBillPrograms.json       # All GI Bill programs
    ├─ localOrgs.json            # Mission 43, Team RWB, etc.
    ├─ vsos.json                 # VA-accredited VSOs
    ├─ attorneys.json            # VA-accredited attorneys/agents
    ├─ events.json               # Local veteran events
    └─ certifications.json       # License/cert database
```

---

## Next-Generation Features

### 1. Veteran Digital Twin™

**Module:** `MatrixEngine/core/digitalTwin.ts`

**Inputs:**
- Complete veteran profile
- All uploaded documents
- Rating decisions
- Employment history
- Education history
- Housing status
- Family status

**Outputs:**
- Living model of veteran's complete context
- Auto-updates when any source data changes
- Feeds all other modules

**Integration Points:**
- All MatrixEngine modules consume Digital Twin
- All UI components read from Digital Twin

---

### 2. Veteran Life Map™

**Module:** `MatrixEngine/lifeMap/`

**Inputs:**
- Service dates
- Deployments
- Injuries/diagnoses
- Rating decisions
- Appeals
- Education events
- Employment events
- Housing events
- Family events

**Outputs:**
- Interactive timeline
- Color-coded event types
- Expandable event cards

**UI Component:** `/lifemap` route, `LifeMapPage.tsx`

---

### 3. Veteran Digital Wallet™

**Module:** `MatrixEngine/wallet/`

**Inputs:**
- Uploaded documents (DD214, rating decisions, evidence, etc.)
- Auto-extracted metadata

**Outputs:**
- Organized document vault
- Tagged documents
- Claim/appeal packets

**UI Component:** `/wallet` route, `WalletPage.tsx`

**Features:**
- Document grid with tags/filters
- Auto-extraction of dates, names, ratings
- Packet builder modal
- Export to PDF

---

### 4. Veteran Opportunity Radar™

**Module:** `MatrixEngine/opportunityRadar/`

**Inputs:**
- Veteran profile
- Digital Twin
- All catalogs

**Outputs:**
- Weekly "Top 5 Opportunities"
- Categorized by: benefits, jobs, education, housing, local resources, events

**UI Component:** `/opportunities` route, `OpportunityRadarPage.tsx`

**Features:**
- Auto-updates weekly or when profile changes
- "Why this applies to you" explanations
- Category filters

---

### 5. MOS-Driven Employment Engine

**Modules:** `MatrixEngine/employment/`

**Inputs:**
- MOS code
- Service dates
- Skills
- Certifications
- Location preferences

**Outputs:**
- MOS → civilian job translations
- Matched jobs
- Employer search results
- Resume/LinkedIn content
- Skills gap analysis
- Certification recommendations

**UI Component:** `/employment` route, `EmploymentPage.tsx`

**Features:**
- MOS translator card
- Job match list
- Resume builder modal
- Employer search panel
- Skills gap planner

---

### 6. GI Bill & Education Hub

**Modules:** `MatrixEngine/education/`

**Inputs:**
- Service dates
- Education history
- Location
- Career goals

**Outputs:**
- GI Bill program suggestions
- Apprenticeship matches
- License/cert recommendations
- BAH estimates (educational)

**UI Component:** `/education` route, `EducationPage.tsx`

**Features:**
- GI Bill program cards
- Apprenticeship finder
- License/cert crosswalk
- BAH estimator

---

### 7. Local Resources Hub

**Modules:** `MatrixEngine/local/`

**Inputs:**
- Veteran location
- Service branch
- Needs (employment, housing, mental health, etc.)

**Outputs:**
- Matched local orgs
- Matched VSOs
- Matched attorneys/agents
- Matched local events

**UI Component:** `/local` route, `LocalResourcesPage.tsx`

**Features:**
- Map + list view
- Filters: orgs, VSOs, attorneys, events
- Distance sorting

---

### 8. Veteran Family Hub

**Modules:** `MatrixEngine/family/`

**Inputs:**
- Veteran rating
- Service dates
- Dependents
- Marital status

**Outputs:**
- CHAMPVA eligibility
- DEA eligibility
- Caregiver program eligibility
- Survivor benefits overview

**UI Component:** `/family` route, `FamilyHubPage.tsx`

**Features:**
- CHAMPVA card with eligibility hints
- DEA card with eligibility hints
- Caregiver program card
- Transition resources

---

### 9. Veteran Evidence Builder

**Modules:** `MatrixEngine/evidence/`

**Inputs:**
- Veteran profile
- Selected conditions
- CRSC status
- Discharge status

**Outputs:**
- Lay statement templates
- Buddy statement templates
- Stressor statement templates
- CRSC narrative templates
- Discharge upgrade narrative templates

**UI Component:** Integrated into Claims Assistant, Appeals view, Dashboard

**Features:**
- Guided prompts
- Auto-formatting preview
- Export to Digital Wallet
- Print/download

---

### 10. Veteran Readiness Score™

**Module:** `MatrixEngine/meta/readinessScore.ts`

**Inputs:**
- Profile completeness
- Document completeness
- Benefits awareness
- Employment status
- Education status
- Housing status

**Outputs:**
- Score (0-100%)
- Category breakdowns
- Improvement suggestions

**UI Component:** Dashboard ReadinessScore widget (already implemented)

---

### 11. Veteran Expiration Tracker™

**Module:** `MatrixEngine/meta/expirationTracker.ts`

**Inputs:**
- GI Bill start date
- VR&E enrollment date
- Appeal filing dates
- Benefit enrollment dates
- Housing program dates

**Outputs:**
- Calendar view
- Alerts for upcoming deadlines
- Days remaining

**UI Component:** Dashboard widget, `/opportunities` integration

---

### 12. Mental Health Navigator

**Module:** `MatrixEngine/catalogs/mentalHealthResources.json`

**Inputs:**
- Veteran location
- Service history
- MST/PTSD indicators (optional)

**Outputs:**
- Crisis hotlines
- Peer support groups
- MST/PTSD resources
- Community organizations

**UI Component:** `/mentalhealth` route, `MentalHealthNavigatorPage.tsx`

---

### 13. Business & Entrepreneurship Hub

**Module:** `MatrixEngine/catalogs/businessPrograms.json`

**Inputs:**
- Veteran status
- Service-disabled status
- Location
- Business type

**Outputs:**
- SBA programs overview
- VOSB/SDVOSB certification info
- State certifications
- Incubators/accelerators
- Grants (educational)

**UI Component:** `/business` route, `BusinessHubPage.tsx`

---

### 14. Travel & Transportation Hub

**Module:** `MatrixEngine/catalogs/travelBenefits.json`

**Inputs:**
- Veteran status
- Service-disabled status
- Location

**Outputs:**
- Space-A travel info
- DMV benefits by state
- Disabled plates/placards
- Toll exemptions
- National park passes
- Transit discounts

**UI Component:** `/travel` route, `TravelHubPage.tsx`

---

## Component Organization

```
src/
├─ components/
│   ├─ Layout/
│   │   ├─ Header.tsx
│   │   ├─ Footer.tsx
│   │   ├─ Sidebar.tsx
│   │   ├─ ContentShell.tsx
│   │   └─ AppLayout.tsx
│   │
│   ├─ Dashboard/
│   │   ├─ ReadinessScore.tsx               # ✅ Implemented
│   │   ├─ MissingInformationDetector.tsx   # ✅ Implemented
│   │   ├─ SmartRecommendationsPanel.tsx    # ✅ Implemented
│   │   ├─ OverviewView.tsx                 # ⬜ Not started
│   │   ├─ BenefitsView.tsx                 # ⬜ Not started
│   │   ├─ ClaimsView.tsx                   # ⬜ Not started
│   │   ├─ AppealsView.tsx                  # ⬜ Not started
│   │   ├─ RetirementView.tsx               # ⬜ Not started
│   │   ├─ HousingView.tsx                  # ⬜ Not started
│   │   ├─ EmploymentView.tsx               # ⬜ Not started
│   │   ├─ EducationView.tsx                # ⬜ Not started
│   │   └─ DocumentsView.tsx                # ⬜ Not started
│   │
│   ├─ wizard/
│   │   ├─ WizardLayout.tsx                 # ✅ Implemented
│   │   └─ steps/
│   │       ├─ StepVeteranBasics.tsx        # ✅ Implemented
│   │       ├─ StepDisabilities.tsx         # ✅ Implemented
│   │       ├─ StepRetirementCrsc.tsx       # ✅ Implemented
│   │       ├─ StepUploads.tsx              # ✅ Implemented
│   │       ├─ StepHousing.tsx              # ✅ Implemented
│   │       ├─ StepAppeals.tsx              # ✅ Implemented
│   │       └─ StepSummary.tsx              # ✅ Implemented
│   │
│   ├─ Employment/
│   │   ├─ MosTranslator.tsx                # ⬜ Not started
│   │   ├─ JobMatchList.tsx                 # ⬜ Not started
│   │   ├─ EmployerSearchPanel.tsx          # ⬜ Not started
│   │   ├─ ResumeBuilder.tsx                # ⬜ Not started
│   │   └─ SkillsGapPlanner.tsx             # ⬜ Not started
│   │
│   ├─ Education/
│   │   ├─ GiBillProgramCards.tsx           # ⬜ Not started
│   │   ├─ ApprenticeshipFinder.tsx         # ⬜ Not started
│   │   ├─ LicenseCertCrosswalk.tsx         # ⬜ Not started
│   │   └─ BahEstimator.tsx                 # ⬜ Not started
│   │
│   ├─ Local/
│   │   ├─ LocalOrgFinder.tsx               # ⬜ Not started
│   │   ├─ VsoFinder.tsx                    # ⬜ Not started
│   │   ├─ AttorneyFinder.tsx               # ⬜ Not started
│   │   └─ EventsCalendar.tsx               # ⬜ Not started
│   │
│   ├─ Wallet/
│   │   ├─ DocumentGrid.tsx                 # ⬜ Not started
│   │   ├─ DocumentTags.tsx                 # ⬜ Not started
│   │   ├─ PacketBuilder.tsx                # ⬜ Not started
│   │   └─ DocumentUploader.tsx             # ⬜ Not started
│   │
│   ├─ LifeMap/
│   │   ├─ TimelineView.tsx                 # ⬜ Not started
│   │   └─ EventCard.tsx                    # ⬜ Not started
│   │
│   ├─ OpportunityRadar/
│   │   ├─ Top5Opportunities.tsx            # ⬜ Not started
│   │   └─ OpportunityCard.tsx              # ⬜ Not started
│   │
│   ├─ Evidence/
│   │   ├─ LayStatementBuilder.tsx          # ⬜ Not started
│   │   ├─ BuddyStatementBuilder.tsx        # ⬜ Not started
│   │   └─ StressorBuilder.tsx              # ⬜ Not started
│   │
│   └─ Family/
│       ├─ ChampvaCard.tsx                  # ⬜ Not started
│       ├─ DeaCard.tsx                      # ⬜ Not started
│       └─ CaregiverCard.tsx                # ⬜ Not started
│
├─ pages/
│   ├─ HomePage.tsx                         # ⬜ Not started
│   ├─ ProfilePage.tsx                      # ⬜ Needs redesign
│   ├─ WizardPage.tsx                       # ✅ Implemented
│   ├─ DashboardPage.tsx                    # ⬜ Not started
│   ├─ MatrixPage.tsx                       # ⬜ Not started
│   ├─ EmploymentPage.tsx                   # ⬜ Not started
│   ├─ EducationPage.tsx                    # ⬜ Not started
│   ├─ LocalResourcesPage.tsx               # ⬜ Not started
│   ├─ WalletPage.tsx                       # ⬜ Not started
│   ├─ LifeMapPage.tsx                      # ⬜ Not started
│   ├─ OpportunityRadarPage.tsx             # ⬜ Not started
│   ├─ FamilyHubPage.tsx                    # ⬜ Not started
│   ├─ BusinessHubPage.tsx                  # ⬜ Not started
│   ├─ TravelHubPage.tsx                    # ⬜ Not started
│   └─ MentalHealthNavigatorPage.tsx        # ⬜ Not started
│
├─ contexts/
│   ├─ VeteranProfileContext.tsx            # ✅ Implemented
│   ├─ ThemeContext.tsx                     # ✅ Implemented
│   └─ SettingsContext.tsx                  # ✅ Implemented
│
└─ MatrixEngine/
    └─ [See MatrixEngine Structure above]
```

---

## Data Catalogs

All catalogs stored in `MatrixEngine/catalogs/`:

| Catalog | Format | Purpose |
|---------|--------|---------|
| `mosMap.json` | `{ mosCode: { skills: [], jobs: [] } }` | MOS → skills/jobs mapping |
| `benefitsCatalog.json` | `{ federal: [], state: [], local: [] }` | All benefits with eligibility rules |
| `giBillPrograms.json` | `{ programs: [] }` | All GI Bill programs |
| `localOrgs.json` | `{ orgs: [] }` | Mission 43, Team RWB, etc. |
| `vsos.json` | `{ vsos: [] }` | VA-accredited VSOs |
| `attorneys.json` | `{ attorneys: [] }` | VA-accredited attorneys/agents |
| `events.json` | `{ events: [] }` | Local veteran events |
| `certifications.json` | `{ certs: [] }` | License/cert database |
| `mentalHealthResources.json` | `{ resources: [] }` | Crisis hotlines, peer support |
| `businessPrograms.json` | `{ programs: [] }` | SBA, VOSB/SDVOSB programs |
| `travelBenefits.json` | `{ benefits: [] }` | Space-A, DMV, park passes |

---

## Integration Rules

1. **All UI components must read from Digital Twin or MatrixEngine outputs**
2. **No eligibility logic in UI components**
3. **All catalogs loaded once at app start, cached in memory**
4. **MatrixEngine modules must be pure functions (no side effects)**
5. **All recommendations must include "Why this applies to you" explanations**

---

**End of Module Map**

