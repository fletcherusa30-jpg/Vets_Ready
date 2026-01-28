# VetsReady Implementation Roadmap

**Last Updated:** January 25, 2026
**Purpose:** Phased development plan for completing the VetsReady Veteran Operating System.

---

## Table of Contents

1. [Phase Overview](#phase-overview)
2. [Phase 1 — Foundation (COMPLETED)](#phase-1--foundation-completed)
3. [Phase 2 — Wallet, Life Map, Opportunity Radar](#phase-2--wallet-life-map-opportunity-radar)
4. [Phase 3 — Employment, Education, Local Resources](#phase-3--employment-education-local-resources)
5. [Phase 4 — Evidence, Family, Mental Health, Business](#phase-4--evidence-family-mental-health-business)
6. [Phase 5 — Polish, Performance, Ecosystem](#phase-5--polish-performance-ecosystem)
7. [Dependencies & Critical Path](#dependencies--critical-path)
8. [Success Metrics](#success-metrics)

---

## Phase Overview

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| **Phase 1** | Foundation & Cohesion | 2 weeks | ✅ **COMPLETE** |
| **Phase 2** | Wallet, Life Map, Opportunity Radar | 3 weeks | ⬜ Not Started |
| **Phase 3** | Employment, Education, Local Resources | 4 weeks | ⬜ Not Started |
| **Phase 4** | Evidence, Family, Mental Health, Business | 3 weeks | ⬜ Not Started |
| **Phase 5** | Polish, Performance, Ecosystem | 2 weeks | ⬜ Not Started |

**Total Estimated Time:** 14 weeks (3.5 months)

---

## Phase 1 — Foundation (COMPLETED)

**Goal:** Establish global architecture, layout system, theme system, and wizard flow.

### ✅ Completed Deliverables

1. **Global Layout System**
   - [x] Header component with theme toggle
   - [x] Footer component with disclaimers
   - [x] Sidebar component with 9 dashboard views
   - [x] ContentShell with configurable widths
   - [x] AppLayout master wrapper

2. **Theme System**
   - [x] ThemeContext with 3 modes (light/dark/high-contrast)
   - [x] 7 branch accent colors
   - [x] Theme persistence in localStorage
   - [x] WCAG AA contrast compliance

3. **Wizard System**
   - [x] WizardLayout with progress tracking
   - [x] 7 steps fully implemented:
     - StepVeteranBasics (personal + service info)
     - StepDisabilities (rating + conditions)
     - StepRetirementCrsc (retirement status + CRSC screening)
     - StepUploads (DD214/rating decision placeholders)
     - StepHousing (homeownership + accessibility)
     - StepAppeals (appeals overview + issue detection)
     - StepSummary (completeness score + CTA)
   - [x] VeteranProfileContext expanded with all fields

4. **Dashboard Intelligence Components**
   - [x] ReadinessScore (0-100% with circular progress)
   - [x] MissingInformationDetector (field-by-field analysis)
   - [x] SmartRecommendationsPanel (8 recommendation types)

5. **Bug Fixes & Quality**
   - [x] Fixed provider ordering (VeteranProfileProvider → ThemeProvider)
   - [x] Fixed TypeScript errors
   - [x] Verified application loads correctly

### Lessons Learned

- Provider order matters when contexts depend on each other
- Inline styles acceptable for prototyping, but should be moved to CSS modules in Phase 5
- Wizard completeness score is powerful UX motivator

---

## Phase 2 — Wallet, Life Map, Opportunity Radar

**Goal:** Implement next-generation features that differentiate VetsReady from competitors.

**Duration:** 3 weeks

**Dependencies:** Phase 1 (layout system, theme system, profile context)

---

### Week 1: Digital Wallet

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/wallet/documentTagger.ts`
     - Auto-tags documents (DD214, Rating Decision, Evidence, Lay Statement)
     - Extracts dates, names, conditions, ratings
   - [ ] Create `MatrixEngine/wallet/autoExtractor.ts`
     - OCR integration (optional, can use placeholder)
     - Metadata extraction from PDFs
   - [ ] Create `MatrixEngine/wallet/packetBuilder.ts`
     - Assembles documents into claim/appeal packets
     - Generates cover sheets

2. **UI Components**
   - [ ] Create `src/components/Wallet/DocumentGrid.tsx`
     - Grid of document cards (4 columns desktop, 2 tablet, 1 mobile)
     - Thumbnail preview
     - Tags display
   - [ ] Create `src/components/Wallet/DocumentTags.tsx`
     - Tag management (add/remove/edit)
     - Color-coded tags
   - [ ] Create `src/components/Wallet/PacketBuilder.tsx`
     - Modal with drag-and-drop interface
     - Document selection
     - Cover sheet generator
     - Export to PDF
   - [ ] Create `src/components/Wallet/DocumentUploader.tsx`
     - Drag-and-drop file upload
     - Progress indicator
     - Auto-tagging on upload

3. **Page**
   - [ ] Create `src/pages/WalletPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="wide"
     - Filter panel (left)
     - Document grid (center)

4. **Routing**
   - [ ] Add `/wallet` route to App.tsx

**Success Criteria:**
- Users can upload documents
- Documents are auto-tagged
- Users can build packets and export to PDF

---

### Week 2: Life Map

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/lifeMap/timelineBuilder.ts`
     - Extracts events from profile:
       - Service dates (enlistment, deployments, discharge)
       - Injuries/diagnoses
       - Rating decisions
       - Appeals filed
       - Employment events
       - Education events
       - Housing events
       - Family events
     - Sorts events chronologically
     - Color-codes by event type
   - [ ] Create `MatrixEngine/lifeMap/eventExtractor.ts`
     - Parses uploaded documents for dates/events
     - Extracts deployment dates from DD214
     - Extracts rating decisions from rating letters

2. **UI Components**
   - [ ] Create `src/components/LifeMap/TimelineView.tsx`
     - Horizontal timeline (zoomable)
     - Vertical timeline (mobile)
     - Color-coded event markers
     - Today indicator
   - [ ] Create `src/components/LifeMap/EventCard.tsx`
     - Expandable event details
     - Linked documents (if applicable)
     - Edit capability (for user-added events)

3. **Page**
   - [ ] Create `src/pages/LifeMapPage.tsx`
     - AppLayout without Sidebar (full width)
     - ContentShell width="full"
     - Timeline view

4. **Routing**
   - [ ] Add `/lifemap` route to App.tsx

**Success Criteria:**
- Timeline displays all service, benefits, and life events
- Users can zoom/scroll timeline
- Events are color-coded and expandable

---

### Week 3: Opportunity Radar

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/opportunityRadar/benefitScanner.ts`
     - Scans federal/state/local benefits catalog
     - Matches veteran profile to benefits
     - Scores by relevance
   - [ ] Create `MatrixEngine/opportunityRadar/jobScanner.ts`
     - Scans job catalog (or external API)
     - Matches MOS + skills to jobs
     - Scores by match percentage
   - [ ] Create `MatrixEngine/opportunityRadar/educationScanner.ts`
     - Scans GI Bill programs, apprenticeships
     - Matches to veteran goals
   - [ ] Create `MatrixEngine/opportunityRadar/housingScanner.ts`
     - Scans housing programs
     - Matches to veteran location + needs
   - [ ] Create `MatrixEngine/opportunityRadar/localScanner.ts`
     - Scans local orgs, VSOs, attorneys
     - Matches to veteran location + needs
   - [ ] Create `MatrixEngine/opportunityRadar/eventScanner.ts`
     - Scans local events
     - Matches to veteran interests

2. **UI Components**
   - [ ] Create `src/components/OpportunityRadar/Top5Opportunities.tsx`
     - Displays top 5 opportunities
     - Numbered cards (1-5)
     - Expandable details
   - [ ] Create `src/components/OpportunityRadar/OpportunityCard.tsx`
     - Displays single opportunity
     - "Why this applies to you" section
     - Action button (Learn More, Apply, etc.)

3. **Page**
   - [ ] Create `src/pages/OpportunityRadarPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="medium"
     - Hero: "Your Top 5 Opportunities This Week"
     - Category filters

4. **Routing**
   - [ ] Add `/opportunities` route to App.tsx

5. **Automation**
   - [ ] Create weekly cron job (or manual trigger) to refresh opportunities

**Success Criteria:**
- Top 5 opportunities displayed weekly
- Opportunities span benefits, jobs, education, housing, local resources
- "Why this applies to you" explanations are clear

---

### Phase 2 Milestones

- [ ] Digital Wallet functional (upload, tag, packet builder)
- [ ] Life Map displays full service timeline
- [ ] Opportunity Radar surfaces weekly Top 5
- [ ] All Phase 2 routes integrated into global layout

---

## Phase 3 — Employment, Education, Local Resources

**Goal:** Build out core tools that help veterans transition to civilian life.

**Duration:** 4 weeks

**Dependencies:** Phase 1 (layout system), Phase 2 (catalogs, scanners)

---

### Week 1-2: Employment Hub

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/employment/mosToSkills.ts`
     - Maps MOS code → civilian skills
     - Uses `catalogs/mosMap.json`
   - [ ] Create `MatrixEngine/employment/mosToJobs.ts`
     - Maps MOS code → civilian job titles
     - Uses `catalogs/mosMap.json`
   - [ ] Create `MatrixEngine/employment/jobMatchEngine.ts`
     - Matches veteran skills to jobs
     - Scores by direct match vs transferable skills
   - [ ] Create `MatrixEngine/employment/employerSearchEngine.ts`
     - Filters employer database by industry, location, size
   - [ ] Create `MatrixEngine/employment/resumeBuilder.ts`
     - Generates resume content from profile
     - Formats for ATS compatibility

2. **Data Catalogs**
   - [ ] Create `MatrixEngine/catalogs/mosMap.json`
     - MOS code → skills/jobs mapping
     - Start with top 50 MOS codes (Army, Navy, AF, Marines)
   - [ ] Create `MatrixEngine/catalogs/jobsCatalog.json`
     - Sample jobs with descriptions, skills, salary ranges
     - Can use external API later

3. **UI Components**
   - [ ] Create `src/components/Employment/MosTranslator.tsx`
     - Input: MOS code
     - Output: Civilian skills + job titles
   - [ ] Create `src/components/Employment/JobMatchList.tsx`
     - Displays matched jobs
     - Sortable by match percentage, salary, location
   - [ ] Create `src/components/Employment/EmployerSearchPanel.tsx`
     - Filters: industry, location, size, veteran-friendly
     - Search bar
   - [ ] Create `src/components/Employment/ResumeBuilder.tsx`
     - Modal with guided prompts
     - Live preview
     - Export to PDF/DOCX
   - [ ] Create `src/components/Employment/SkillsGapPlanner.tsx`
     - Compares veteran skills to job requirements
     - Suggests certifications/training

4. **Page**
   - [ ] Create `src/pages/EmploymentPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="wide"
     - MOS translator (top)
     - Job match list (left)
     - Employer search (right)

5. **Routing**
   - [ ] Add `/employment` route to App.tsx

**Success Criteria:**
- MOS translator returns accurate civilian job titles
- Job match engine scores jobs by relevance
- Resume builder generates ATS-friendly resumes

---

### Week 3: Education Hub

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/education/giBillSuggestions.ts`
     - Matches veteran eligibility to GI Bill programs
     - Considers service dates, discharge status
   - [ ] Create `MatrixEngine/education/apprenticeshipFinder.ts`
     - Searches apprenticeship database by location + industry
   - [ ] Create `MatrixEngine/education/licenseCertMapper.ts`
     - Maps licenses/certs to jobs
     - Suggests relevant certifications

2. **Data Catalogs**
   - [ ] Create `MatrixEngine/catalogs/giBillPrograms.json`
     - Post-9/11 GI Bill
     - Montgomery GI Bill
     - VR&E
     - Fry Scholarship
     - DEA
   - [ ] Create `MatrixEngine/catalogs/apprenticeships.json`
     - Sample apprenticeships (can use external API later)
   - [ ] Create `MatrixEngine/catalogs/certifications.json`
     - IT certs, trade licenses, professional certifications

3. **UI Components**
   - [ ] Create `src/components/Education/GiBillProgramCards.tsx`
     - Grid of GI Bill program cards
     - Eligibility badges
     - "Learn More" links
   - [ ] Create `src/components/Education/ApprenticeshipFinder.tsx`
     - Search bar + filters
     - Results list
   - [ ] Create `src/components/Education/LicenseCertCrosswalk.tsx`
     - Table: Cert → Jobs
     - Sortable by demand, salary, time to complete
   - [ ] Create `src/components/Education/BahEstimator.tsx`
     - Calculator card (educational only)
     - Inputs: ZIP code, enrollment status
     - Output: Estimated BAH

4. **Page**
   - [ ] Create `src/pages/EducationPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="wide"
     - GI Bill program cards (top)
     - Apprenticeship finder (middle)
     - License/cert crosswalk (bottom)

5. **Routing**
   - [ ] Add `/education` route to App.tsx

**Success Criteria:**
- GI Bill program suggestions match veteran eligibility
- Apprenticeship finder returns relevant results
- License/cert mapper suggests high-value certifications

---

### Week 4: Local Resources Hub

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/local/orgMatcher.ts`
     - Matches veteran location + needs to local orgs
     - Filters by services (employment, housing, mental health, etc.)
   - [ ] Create `MatrixEngine/local/vsoMatcher.ts`
     - Matches veteran to VSOs by location + branch
   - [ ] Create `MatrixEngine/local/attorneyMatcher.ts`
     - Matches veteran to VA-accredited attorneys/agents
     - Filters by specialty (claims, appeals, CRSC, etc.)
   - [ ] Create `MatrixEngine/local/eventMatcher.ts`
     - Matches veteran to local events (job fairs, stand-downs, etc.)

2. **Data Catalogs**
   - [ ] Create `MatrixEngine/catalogs/localOrgs.json`
     - Mission 43, Team RWB, Travis Manion Foundation, etc.
     - Fields: name, location, services, website, phone
   - [ ] Create `MatrixEngine/catalogs/vsos.json`
     - VFW, American Legion, DAV, etc.
     - Fields: name, location, contact
   - [ ] Create `MatrixEngine/catalogs/attorneys.json`
     - VA-accredited attorneys/agents
     - Fields: name, location, specialty, contact
   - [ ] Create `MatrixEngine/catalogs/events.json`
     - Sample local events (can integrate external API later)

3. **UI Components**
   - [ ] Create `src/components/Local/LocalOrgFinder.tsx`
     - Map view (left, 60% width)
     - List view (right, 40% width)
     - Filters: services, distance
   - [ ] Create `src/components/Local/VsoFinder.tsx`
     - Search bar + filters
     - Results list with contact info
   - [ ] Create `src/components/Local/AttorneyFinder.tsx`
     - Search bar + filters (specialty, location)
     - Results list with contact info
   - [ ] Create `src/components/Local/EventsCalendar.tsx`
     - Calendar view (month/week/day)
     - Event cards with registration links

4. **Page**
   - [ ] Create `src/pages/LocalResourcesPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="full"
     - Tabs: Organizations, VSOs, Attorneys, Events

5. **Routing**
   - [ ] Add `/local` route to App.tsx

**Success Criteria:**
- Local org finder displays orgs within 50 miles
- VSO finder returns VA-accredited VSOs
- Attorney finder returns VA-accredited attorneys
- Events calendar displays relevant local events

---

### Phase 3 Milestones

- [ ] Employment Hub functional (MOS translator, job match, resume builder)
- [ ] Education Hub functional (GI Bill planner, apprenticeship finder, cert mapper)
- [ ] Local Resources Hub functional (orgs, VSOs, attorneys, events)
- [ ] All Phase 3 modules integrated into Opportunity Radar

---

## Phase 4 — Evidence, Family, Mental Health, Business

**Goal:** Build specialized tools for complex veteran needs.

**Duration:** 3 weeks

**Dependencies:** Phase 1 (layout system), Phase 2 (Digital Wallet for evidence storage)

---

### Week 1: Evidence Builder

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/evidence/layStatementBuilder.ts`
     - Generates lay statement templates
     - Prompts: condition, onset date, symptoms, impact
   - [ ] Create `MatrixEngine/evidence/buddyStatementBuilder.ts`
     - Generates buddy statement templates
     - Prompts: witness info, incident, corroboration
   - [ ] Create `MatrixEngine/evidence/stressorBuilder.ts`
     - Generates stressor statement templates for PTSD
     - Prompts: incident, location, date, details
   - [ ] Create `MatrixEngine/evidence/crscNarrativeBuilder.ts`
     - Generates CRSC narrative templates
     - Prompts: combat status, injury circumstances
   - [ ] Create `MatrixEngine/evidence/dischargeUpgradeNarrativeBuilder.ts`
     - Generates discharge upgrade narrative templates
     - Prompts: discharge reason, mitigating factors

2. **UI Components**
   - [ ] Create `src/components/Evidence/LayStatementBuilder.tsx`
     - Guided prompts (step-by-step)
     - Live preview (right panel)
     - Export to PDF, save to Wallet
   - [ ] Create `src/components/Evidence/BuddyStatementBuilder.tsx`
     - Same structure as LayStatementBuilder
   - [ ] Create `src/components/Evidence/StressorBuilder.tsx`
     - Same structure, PTSD-specific prompts

3. **Integration**
   - [ ] Integrate Evidence Builder into Claims Assistant
   - [ ] Integrate Evidence Builder into Appeals view (Dashboard)
   - [ ] Add "Build Evidence" button to relevant Dashboard cards

**Success Criteria:**
- Users can generate lay statements with guided prompts
- Statements auto-format to VA-friendly templates
- Statements export to Digital Wallet

---

### Week 2: Family Hub, Mental Health Navigator

**Tasks:**

1. **MatrixEngine Modules**
   - [ ] Create `MatrixEngine/family/champvaMapper.ts`
     - CHAMPVA eligibility logic
     - Input: veteran rating, dependents
     - Output: eligible/not eligible + explanation
   - [ ] Create `MatrixEngine/family/deaMapper.ts`
     - DEA eligibility logic
     - Input: veteran rating (100% P&T), dependents
   - [ ] Create `MatrixEngine/family/caregiverMapper.ts`
     - Caregiver program eligibility
     - Input: veteran rating, care needs

2. **Data Catalogs**
   - [ ] Create `MatrixEngine/catalogs/mentalHealthResources.json`
     - Veterans Crisis Line: 988 then 1
     - PTSD resources
     - MST resources
     - Peer support groups (local + online)
     - Community orgs

3. **UI Components**
   - [ ] Create `src/components/Family/ChampvaCard.tsx`
     - Eligibility badge
     - "Learn More" link to VA.gov
   - [ ] Create `src/components/Family/DeaCard.tsx`
     - Same structure
   - [ ] Create `src/components/Family/CaregiverCard.tsx`
     - Same structure

4. **Pages**
   - [ ] Create `src/pages/FamilyHubPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="medium"
     - 2-column card grid
   - [ ] Create `src/pages/MentalHealthNavigatorPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="medium"
     - Crisis hotline (hero)
     - Resource cards (PTSD, MST, peer support)

5. **Routing**
   - [ ] Add `/family` route
   - [ ] Add `/mentalhealth` route

**Success Criteria:**
- Family Hub displays accurate CHAMPVA/DEA/caregiver eligibility
- Mental Health Navigator lists crisis resources prominently
- All resources link to official VA.gov pages

---

### Week 3: Business & Travel Hubs

**Tasks:**

1. **Data Catalogs**
   - [ ] Create `MatrixEngine/catalogs/businessPrograms.json`
     - SBA programs (educational)
     - VOSB/SDVOSB certification info
     - State certifications
     - Incubators/accelerators
     - Grants (educational)
   - [ ] Create `MatrixEngine/catalogs/travelBenefits.json`
     - Space-A travel info
     - DMV benefits by state
     - Disabled plates/placards
     - Toll exemptions
     - National park passes
     - Transit discounts

2. **Pages**
   - [ ] Create `src/pages/BusinessHubPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="medium"
     - Program cards
   - [ ] Create `src/pages/TravelHubPage.tsx`
     - AppLayout with Sidebar
     - ContentShell width="medium"
     - Benefit cards

3. **Routing**
   - [ ] Add `/business` route
   - [ ] Add `/travel` route

**Success Criteria:**
- Business Hub lists SBA programs and VOSB/SDVOSB info
- Travel Hub lists DMV benefits and Space-A info

---

### Phase 4 Milestones

- [ ] Evidence Builder functional for lay/buddy/stressor statements
- [ ] Family Hub displays CHAMPVA/DEA/caregiver eligibility
- [ ] Mental Health Navigator lists crisis resources
- [ ] Business & Travel Hubs display relevant programs

---

## Phase 5 — Polish, Performance, Ecosystem

**Goal:** Optimize performance, harden accessibility, and prepare for ecosystem expansion.

**Duration:** 2 weeks

**Dependencies:** All previous phases

---

### Week 1: Performance & Accessibility

**Tasks:**

1. **Performance Optimization**
   - [ ] Implement skeleton loaders for all data-fetching components
   - [ ] Implement lazy loading for all routes (React.lazy + Suspense)
   - [ ] Implement caching for MatrixEngine outputs (in-memory or localStorage)
   - [ ] Optimize images (compress, WebP format, lazy load)
   - [ ] Code splitting (separate bundles for each major route)
   - [ ] Analyze bundle size (use Vite analyzer)

2. **Accessibility Hardening**
   - [ ] Full keyboard navigation audit (Tab, Shift+Tab, Arrow keys, Esc)
   - [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
   - [ ] Color contrast audit (use axe DevTools)
   - [ ] Focus management (modals, dropdowns, wizards)
   - [ ] ARIA labels/landmarks audit
   - [ ] Add skip links to all pages

3. **Micro-Interactions**
   - [ ] Hover states for all interactive elements
   - [ ] Transitions for theme changes
   - [ ] Toasts for success/error messages
   - [ ] Loading spinners for async operations
   - [ ] Animations for wizard step transitions (optional, respect prefers-reduced-motion)

**Success Criteria:**
- Lighthouse score >90 (Performance, Accessibility, Best Practices)
- All interactive elements keyboard navigable
- WCAG 2.1 AA compliance verified

---

### Week 2: Ecosystem Preparation

**Tasks:**

1. **Digital Twin Integration**
   - [ ] Wire Digital Twin to all MatrixEngine modules
   - [ ] Implement auto-update when profile changes
   - [ ] Implement auto-update when documents uploaded
   - [ ] Display "Last Updated" timestamp on all outputs

2. **API Preparation (Future)**
   - [ ] Document all MatrixEngine modules (inputs/outputs)
   - [ ] Create API documentation (for future VSO/employer/school integrations)
   - [ ] Mock API endpoints (for testing external integrations)

3. **Documentation**
   - [ ] Update all README files
   - [ ] Create developer onboarding guide
   - [ ] Create user guide (PDF or in-app)
   - [ ] Create VSO guide (how to use VetsReady to help veterans)

4. **Advanced Features (If Time)**
   - [ ] Expiration Tracker dashboard widget
   - [ ] Benefits expiration alerts (email/SMS placeholders)
   - [ ] Life Map enhancements (add user-generated events)
   - [ ] Digital Wallet enhancements (OCR for DD214/rating letters)

**Success Criteria:**
- Digital Twin auto-updates across all modules
- API documentation complete
- User guide published

---

### Phase 5 Milestones

- [ ] Lighthouse score >90 on all pages
- [ ] WCAG 2.1 AA compliance verified
- [ ] Digital Twin fully integrated
- [ ] User documentation complete

---

## Dependencies & Critical Path

### Critical Path

1. **Phase 1** (Foundation) → Must complete before any other phase
2. **Phase 2** (Wallet, Life Map, Opportunity Radar) → Can start after Phase 1
3. **Phase 3** (Employment, Education, Local) → Can start after Phase 1 (benefits from Phase 2 catalogs but not blocked)
4. **Phase 4** (Evidence, Family, Mental Health, Business) → Can start after Phase 1 (Evidence Builder needs Digital Wallet from Phase 2)
5. **Phase 5** (Polish, Performance, Ecosystem) → Must complete after all other phases

### Parallel Work Opportunities

- **Employment Hub** (Phase 3) can be built in parallel with **Wallet/Life Map** (Phase 2)
- **Education Hub** (Phase 3) can be built in parallel with **Family Hub** (Phase 4)
- **Local Resources Hub** (Phase 3) can be built in parallel with **Mental Health Navigator** (Phase 4)

### Key Dependencies

| Feature | Depends On |
|---------|------------|
| Digital Wallet | Phase 1 (Layout, Theme, Profile Context) |
| Life Map | Phase 1 (Profile Context) |
| Opportunity Radar | Phase 2 (Wallet, Life Map modules), Phase 3 (Employment, Education, Local modules) |
| Evidence Builder | Phase 2 (Digital Wallet for storage) |
| Employment Hub | Phase 1 (Layout, Theme), Phase 2 (catalogs/mosMap.json) |
| Education Hub | Phase 1 (Layout, Theme), Phase 2 (catalogs/giBillPrograms.json) |
| Local Resources Hub | Phase 1 (Layout, Theme), Phase 2 (catalogs/localOrgs.json) |
| Digital Twin | All MatrixEngine modules from Phases 2-4 |

---

## Success Metrics

### Phase 1 (Foundation)

- ✅ All layout components render correctly
- ✅ Theme system works across all 3 modes
- ✅ Wizard completes without errors
- ✅ Profile context stores all veteran data

### Phase 2 (Wallet, Life Map, Opportunity Radar)

- [ ] Users can upload 5+ documents to Wallet
- [ ] Documents are auto-tagged with >80% accuracy
- [ ] Life Map displays 10+ events
- [ ] Opportunity Radar surfaces 5 relevant opportunities weekly

### Phase 3 (Employment, Education, Local)

- [ ] MOS translator returns accurate job titles for top 50 MOS codes
- [ ] Job match engine scores jobs with >70% accuracy
- [ ] GI Bill planner matches veterans to eligible programs
- [ ] Local Resources Hub lists 20+ local orgs per location

### Phase 4 (Evidence, Family, Mental Health, Business)

- [ ] Evidence Builder generates VA-compliant statements
- [ ] Family Hub accurately displays CHAMPVA/DEA eligibility
- [ ] Mental Health Navigator lists crisis resources prominently
- [ ] Business/Travel Hubs list 10+ programs each

### Phase 5 (Polish, Performance, Ecosystem)

- [ ] Lighthouse score >90 on all pages
- [ ] WCAG 2.1 AA compliance on all pages
- [ ] Digital Twin auto-updates across all modules
- [ ] User documentation complete

---

**End of Implementation Roadmap**
