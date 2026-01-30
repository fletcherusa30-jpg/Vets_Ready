# 🚀 Rally Forge - IMPLEMENTATION ROADMAP
## Document Scanning → Strategy Generation Pipeline

**Created:** January 26, 2026
**Purpose:** Step-by-step implementation plan for complete document scanning and strategy generation
**Timeline:** 6 weeks
**Goal:** Enable veterans to scan DD-214, VA rating decision, STRs, PMRs, and nexus letters to receive automated claim strategy

---

## 📅 WEEK 1: FOUNDATION - Fix DD-214 & Add Rating Decision Scanner

### Day 1-2: Fix DD-214 Auto-Population

**File:** `rally-forge-frontend/src/pages/VeteranProfile.tsx`

**Changes Needed:**
1. After DD-214 extraction completes, show confirmation modal with extracted data
2. Add "Confirm & Apply to Profile" button
3. On confirm, update profile context with all extracted fields:
   - branch, entryDate, separationDate, characterOfService
   - separationCode, narrativeReasonForSeparation
   - payGrade, rank, awards
   - combatIndicators, deploymentLocations
   - mosCode, mosTitle, specialties

**Code Addition:**
```typescript
const handleDD214Confirmation = (extractedData: DD214ExtractedData) => {
  updateProfile({
    branch: extractedData.branch,
    serviceStart: extractedData.entryDate,
    serviceEnd: extractedData.separationDate,
    dischargeStatus: extractedData.characterOfService,
    rank: extractedData.rank,
    // ... map all fields
  });

  showNotification('DD-214 data applied to your profile!');
};
```

**Estimated:** 6 hours

---

### Day 3-5: Build VA Rating Decision Scanner

**Backend:** `rally-forge-backend/app/routers/rating_decision.py` (NEW FILE)

**Features:**
- Copy structure from dd214.py
- Add OCR extraction for:
  - Combined disability rating percentage
  - Individual condition ratings (name, diagnostic code, percentage)
  - Service connection status (direct, secondary, presumptive)
  - Effective dates for each rating
  - SMC (Special Monthly Compensation) if applicable

**Frontend:** `rally-forge-frontend/src/services/RatingDecisionScanner.ts`

**Interface:**
```typescript
export interface RatingDecisionExtractedData {
  combinedRating: number;
  individualRatings: Array<{
    condition: string;
    diagnosticCode: string;
    percentage: number;
    serviceConnection: 'direct' | 'secondary' | 'presumptive';
    effectiveDate: string;
  }>;
  specialMonthlyCompensation: boolean;
  smcType?: string;
  decisionDate: string;
  extractionConfidence: 'high' | 'medium' | 'low';
}
```

**Integration:**
- Add upload component to VeteranProfile.tsx
- Connect to backend endpoint: `/api/rating-decision/upload`
- Display extraction results
- Auto-populate serviceConnectedConditions in profile

**Estimated:** 2.5 days (20 hours)

---

## 📅 WEEK 2: DOCUMENT CENTER HUB

### Day 1-3: Create Unified Document Center

**New Page:** `rally-forge-frontend/src/pages/DocumentCenter.tsx`

**Structure:**
```typescript
const DocumentCenter = () => {
  return (
    <div className="document-center">
      {/* Header */}
      <HeroSection title="Document Center" />

      {/* Upload Section */}
      <div className="upload-grid">
        <DocumentUpload
          type="dd214"
          title="DD-214"
          description="Certificate of Release or Discharge from Active Duty"
          icon="📋"
          status={uploadStatus.dd214}
        />

        <DocumentUpload
          type="rating_decision"
          title="VA Rating Decision"
          description="Your current disability rating letter"
          icon="📊"
          status={uploadStatus.ratingDecision}
        />

        <DocumentUpload
          type="str"
          title="Service Treatment Records (STRs)"
          description="Medical records from your time in service"
          icon="🏥"
          status={uploadStatus.str}
        />

        <DocumentUpload
          type="pmr"
          title="Private Medical Records (PMRs)"
          description="Medical records from private doctors"
          icon="🏥"
          status={uploadStatus.pmr}
        />

        <DocumentUpload
          type="nexus"
          title="Nexus Letters"
          description="Medical opinions linking conditions to service"
          icon="📝"
          status={uploadStatus.nexus}
        />
      </div>

      {/* Strategy Generator CTA */}
      {allDocumentsUploaded && (
        <StrategyGeneratorButton
          onClick={generateStrategy}
          disabled={generatingStrategy}
        />
      )}

      {/* Document Vault */}
      <DocumentVault documents={uploadedDocuments} />

      {/* Strategy Display */}
      {strategy && <StrategyDisplay strategy={strategy} />}
    </div>
  );
};
```

**Route:** `/documents`

**Estimated:** 2 days (16 hours)

---

### Day 4-5: Build STR Scanner (Basic)

**Backend:** `rally-forge-backend/app/routers/str_scanner.py` (NEW FILE)

**Extract:**
- Visit dates
- Provider names
- Conditions mentioned
- Treatments/procedures
- Medications prescribed

**Frontend:** Integration in DocumentCenter

**Estimated:** 1.5 days (12 hours)

---

## 📅 WEEK 3: MEDICAL DOCUMENT SCANNERS

### Day 1-2: Build PMR Scanner

**Backend:** `rally-forge-backend/app/routers/pmr_scanner.py` (NEW FILE)

**Extract:**
- Current diagnoses
- Treatment history
- Medication lists
- Functional limitations
- Provider statements

**Estimated:** 1.5 days (12 hours)

---

### Day 3-4: Build Nexus Letter Scanner

**Backend:** `rally-forge-backend/app/routers/nexus_scanner.py` (NEW FILE)

**Extract:**
- Doctor's name and credentials
- Opinion on service connection
- Medical rationale
- Supporting evidence cited
- Confidence level of opinion

**Estimated:** 1.5 days (12 hours)

---

### Day 5: Connect WalletPage to Uploads

**File:** `rally-forge-frontend/src/pages/WalletPage.tsx`

**Changes:**
- Remove mock data
- Fetch actual uploaded documents from API
- Display extraction results for each document
- Add document viewer/preview

**Estimated:** 1 day (8 hours)

---

## 📅 WEEK 4: STRATEGY GENERATION ENGINE (Part 1)

### Day 1-2: Build Document Analysis Service

**Backend:** `rally-forge-backend/app/services/strategy_generator.py` (NEW FILE)

**Class:** `StrategyGeneratorService`

**Methods:**

```python
class StrategyGeneratorService:
    def analyze_documents(self, veteran_id: str) -> StrategyAnalysis:
        """
        Analyze all uploaded documents for a veteran
        """
        # 1. Fetch all uploaded documents
        dd214 = self.get_dd214_extraction(veteran_id)
        rating_decision = self.get_rating_decision_extraction(veteran_id)
        strs = self.get_str_extractions(veteran_id)
        pmrs = self.get_pmr_extractions(veteran_id)
        nexus_letters = self.get_nexus_extractions(veteran_id)

        # 2. Build current condition profile
        current_conditions = self.build_condition_profile(
            rating_decision, pmrs
        )

        # 3. Identify new conditions from STRs/PMRs
        new_conditions = self.identify_new_conditions(
            strs, pmrs, current_conditions
        )

        # 4. Match conditions to M21-1 for ratings
        rating_projections = self.project_ratings(new_conditions)

        # 5. Identify evidence gaps
        evidence_gaps = self.analyze_evidence_gaps(
            current_conditions, new_conditions, strs, pmrs, nexus_letters
        )

        # 6. Generate action plan
        action_plan = self.generate_action_plan(
            current_conditions, new_conditions, evidence_gaps
        )

        return StrategyAnalysis(
            current_conditions=current_conditions,
            new_claim_recommendations=new_conditions,
            evidence_gaps=evidence_gaps,
            rating_projections=rating_projections,
            action_plan=action_plan
        )
```

**Estimated:** 2 days (16 hours)

---

### Day 3-4: Build Condition Matching Algorithm

**Function:** Match conditions found in medical records to M21-1 diagnostic codes

```python
def match_condition_to_m21_1(condition_text: str) -> List[ConditionMatch]:
    """
    Use NLP to match condition text to M21-1 diagnostic codes
    """
    # Use keyword matching + medical terminology database
    # Example: "low back pain" → M5416 (Lumbar strain)

    matches = []

    # Check common synonyms
    condition_lower = condition_text.lower()

    if 'back pain' in condition_lower or 'lumbar' in condition_lower:
        matches.append(ConditionMatch(
            code='M5416',
            name='Lumbar strain',
            confidence=0.9
        ))

    if 'ptsd' in condition_lower or 'post-traumatic stress' in condition_lower:
        matches.append(ConditionMatch(
            code='F4310',
            name='Post-Traumatic Stress Disorder',
            confidence=0.95
        ))

    # ... more matching logic

    return matches
```

**Estimated:** 2 days (16 hours)

---

### Day 5: Build Rating Projection Calculator

**Function:** Project disability ratings based on evidence

```python
def project_rating(condition_code: str, evidence: MedicalEvidence) -> RatingProjection:
    """
    Project disability rating based on M21-1 criteria and evidence
    """
    # Get M21-1 criteria
    m21_1_criteria = legal_reference_service.get_m21_1_reference(condition_code)

    # Analyze evidence against criteria
    symptom_matches = match_symptoms_to_criteria(
        evidence.symptoms, m21_1_criteria['rating_criteria']
    )

    # Project rating
    if symptom_matches['severe']:
        projected_rating = 70
    elif symptom_matches['moderate']:
        projected_rating = 30
    else:
        projected_rating = 10

    return RatingProjection(
        condition_code=condition_code,
        projected_rating=projected_rating,
        confidence='high' if symptom_matches['count'] > 5 else 'medium',
        rationale=f"Evidence shows {len(symptom_matches)} symptoms matching {projected_rating}% criteria"
    )
```

**Estimated:** 1 day (8 hours)

---

## 📅 WEEK 5: STRATEGY GENERATION ENGINE (Part 2)

### Day 1-2: Build Evidence Gap Analyzer

```python
def analyze_evidence_gaps(
    condition: Condition,
    strs: List[STRExtraction],
    pmrs: List[PMRExtraction],
    nexus_letters: List[NexusExtraction]
) -> List[EvidenceGap]:
    """
    Identify missing evidence for a condition
    """
    gaps = []

    # Check for in-service documentation
    if not any(condition.name in str.conditions for str in strs):
        gaps.append(EvidenceGap(
            type='in_service_documentation',
            description=f'No in-service documentation of {condition.name} found in STRs',
            recommendation='Request full STRs or provide buddy statement',
            priority='high'
        ))

    # Check for current diagnosis
    if not any(condition.name in pmr.diagnoses for pmr in pmrs):
        gaps.append(EvidenceGap(
            type='current_diagnosis',
            description=f'No current diagnosis of {condition.name} in PMRs',
            recommendation='Obtain current medical evaluation',
            priority='critical'
        ))

    # Check for nexus opinion
    if not any(condition.name in nexus.conditions for nexus in nexus_letters):
        gaps.append(EvidenceGap(
            type='medical_nexus',
            description=f'No nexus letter linking {condition.name} to service',
            recommendation='Request nexus letter from treating physician',
            priority='high'
        ))

    return gaps
```

**Estimated:** 2 days (16 hours)

---

### Day 3-4: Build Action Plan Generator

```python
def generate_action_plan(
    current_conditions: List[Condition],
    new_conditions: List[Condition],
    evidence_gaps: List[EvidenceGap]
) -> ActionPlan:
    """
    Generate step-by-step action plan
    """
    immediate_actions = []
    short_term_actions = []
    long_term_actions = []

    # Immediate: File claims with complete evidence
    for condition in new_conditions:
        condition_gaps = [g for g in evidence_gaps if g.condition == condition.name]
        if not condition_gaps:
            immediate_actions.append(
                f"File claim for {condition.name} (evidence ready)"
            )

    # Short-term: Gather missing evidence
    for gap in evidence_gaps:
        if gap.priority == 'critical':
            short_term_actions.append(gap.recommendation)

    # Long-term: Monitor and plan
    long_term_actions.append("Monitor for secondary conditions")
    long_term_actions.append("Request re-evaluation if symptoms worsen")

    # Generate timeline
    timeline = {
        'week1': immediate_actions[0] if immediate_actions else 'Gather evidence',
        'week2-4': 'Complete evidence gathering',
        'month2-3': 'File all claims',
        'month4-6': 'Attend C&P exams and await decisions'
    }

    return ActionPlan(
        immediate=immediate_actions,
        short_term=short_term_actions,
        long_term=long_term_actions,
        timeline=timeline
    )
```

**Estimated:** 2 days (16 hours)

---

### Day 5: Create Strategy API Endpoint

**Backend:** `rally-forge-backend/app/routers/strategy.py` (NEW FILE)

```python
@router.post("/api/strategy/generate")
async def generate_strategy(
    veteran_id: str,
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive claim strategy from uploaded documents
    """
    service = StrategyGeneratorService(db)

    try:
        strategy = service.analyze_documents(veteran_id)

        return {
            "success": True,
            "strategy": strategy.dict(),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Strategy generation failed: {str(e)}"
        )
```

**Estimated:** 1 day (8 hours)

---

## 📅 WEEK 6: UI INTEGRATION & REORGANIZATION

### Day 1-2: Build Strategy Display Component

**Frontend:** `rally-forge-frontend/src/components/StrategyDisplay.tsx`

**Sections:**
1. Veteran Summary
2. Current Conditions (from rating decision)
3. New Claim Recommendations
4. Evidence Gaps
5. Rating Projections & Financial Impact
6. Action Plan with Timeline
7. Export Button (PDF download)

**Estimated:** 2 days (16 hours)

---

### Day 3: Consolidate Benefits Pages

**Changes:**
- Redirect `/benefits-center` → `/benefits`
- Merge BenefitsDashboard + MyTotalBenefitsCenter functionality
- Remove duplicate Benefits.tsx (legacy)
- Update navigation

**Estimated:** 1 day (8 hours)

---

### Day 4: Merge Claims Workflows

**Changes:**
- Merge /wizard functionality into /claims
- Keep ClaimsHub as main hub
- Remove duplicate WizardPage route
- Add "File New Claim" wizard as modal or tab in ClaimsHub

**Estimated:** 1 day (8 hours)

---

### Day 5: Add Personalization Throughout

**Changes:**

1. **ClaimsHub** - Show strategy recommendations
2. **Benefits** - Filter by veteran's eligibility (from DD-214)
3. **TransitionPage** - Use MOS for job matching
4. **Retirement** - Auto-fill calculator from DD-214
5. **VAKnowledgeCenter** - Reference veteran's documents in AI responses
6. **EducationPage** - Calculate GI Bill eligibility from service dates

**Estimated:** 1 day (8 hours)

---

## 📊 IMPLEMENTATION CHECKLIST

### Week 1
- [ ] Fix DD-214 auto-population (6 hrs)
- [ ] Build VA Rating Decision Scanner backend (16 hrs)
- [ ] Build VA Rating Decision Scanner frontend (4 hrs)
- [ ] Test rating decision extraction (2 hrs)

### Week 2
- [ ] Create DocumentCenter page (16 hrs)
- [ ] Add routing for /documents (1 hr)
- [ ] Build STR scanner backend (8 hrs)
- [ ] Build STR scanner frontend (4 hrs)

### Week 3
- [ ] Build PMR scanner backend (8 hrs)
- [ ] Build PMR scanner frontend (4 hrs)
- [ ] Build Nexus scanner backend (8 hrs)
- [ ] Build Nexus scanner frontend (4 hrs)
- [ ] Connect WalletPage to uploads (8 hrs)

### Week 4
- [ ] Build document analysis service (16 hrs)
- [ ] Build condition matching algorithm (16 hrs)
- [ ] Build rating projection calculator (8 hrs)

### Week 5
- [ ] Build evidence gap analyzer (16 hrs)
- [ ] Build action plan generator (16 hrs)
- [ ] Create strategy API endpoint (8 hrs)

### Week 6
- [ ] Build StrategyDisplay component (16 hrs)
- [ ] Consolidate benefits pages (8 hrs)
- [ ] Merge claims workflows (8 hrs)
- [ ] Add personalization throughout (8 hrs)

---

## 🎯 SUCCESS CRITERIA

**The implementation is complete when:**

1. ✅ Veteran can upload all 5 document types (DD-214, rating decision, STR, PMR, nexus)
2. ✅ All documents are extracted via OCR
3. ✅ Extracted data auto-populates veteran profile
4. ✅ Veteran clicks "Generate Strategy" button
5. ✅ Strategy displays:
   - Current conditions summary
   - New claim recommendations with projected ratings
   - Evidence gaps with specific recommendations
   - Financial projection (monthly/annual increase)
   - Action plan with timeline
6. ✅ Strategy can be exported as PDF
7. ✅ All duplicate pages removed
8. ✅ Veteran's data used throughout app (no re-entry)

---

## 📈 TESTING PLAN

### Unit Tests
- [ ] DD-214 extraction accuracy (test with sample DD-214s)
- [ ] Rating decision extraction accuracy
- [ ] STR/PMR/Nexus extraction accuracy
- [ ] Condition matching algorithm (test medical terms)
- [ ] Rating projection calculator (verify against M21-1)
- [ ] Evidence gap analyzer (test various scenarios)

### Integration Tests
- [ ] Full document upload workflow
- [ ] Strategy generation end-to-end
- [ ] Profile auto-population
- [ ] Document vault display

### User Acceptance Tests
- [ ] Test Scenario 1: New veteran (zero claims)
- [ ] Test Scenario 2: Veteran with current rating (increase request)
- [ ] Test Scenario 3: Secondary condition claim
- [ ] Test Scenario 4: Complex multi-condition claim

---

## 📝 NOTES

### Technical Dependencies
- `pytesseract` - OCR engine (already installed)
- `pdf2image` - PDF to image conversion (already installed)
- Medical terminology database (to build)
- M21-1 diagnostic code mapping (already exists in legal_reference_service)

### Performance Considerations
- OCR processing can take 10-60 seconds per document
- Use background jobs for all extractions
- Cache extraction results
- Generate strategy asynchronously

### Legal Compliance
- All extracted data requires veteran review
- Disclaimer: "Strategy is educational only, not legal advice"
- No automatic claim filing (veteran must review and approve)

---

**END OF IMPLEMENTATION ROADMAP**

*Created: January 26, 2026*
*Estimated Total Effort: 240 hours (6 weeks @ 40 hrs/week)*
*Next Review: Weekly progress check-ins*

