# ⚡ VETS READY - QUICK START GUIDE
## Immediate Actions to Enable Document Scanning → Strategy Generation

**Date:** January 26, 2026
**Timeline:** Days, not weeks
**Goal:** Get core functionality working FAST

---

## 🎯 THE MISSION

**Enable veterans to:**
1. Upload their DD-214 → auto-populate profile
2. Upload VA rating decision → extract current ratings
3. Click "Generate Strategy" → receive claim recommendations

**What we're building:** Minimal Viable Product (MVP) for document-driven strategy

---

## 🚀 PHASE 1: FIX DD-214 AUTO-POPULATION (2-4 Hours)

### Current Problem
- DD-214 uploads and extracts data successfully ✅
- BUT: Extracted data doesn't save to profile ❌
- Veteran must manually re-enter everything ❌

### The Fix

**File:** `vets-ready-frontend/src/pages/VeteranProfile.tsx`

**Step 1:** Add confirmation modal after extraction completes

```typescript
// After DD-214 extraction completes in handleDD214Upload
if (extractedData) {
  setDD214Data(extractedData);
  setShowDD214ConfirmModal(true); // NEW
}
```

**Step 2:** Create confirmation modal component

```typescript
{showDD214ConfirmModal && dd214Data && (
  <div className="modal-overlay">
    <div className="confirmation-modal">
      <h2>DD-214 Extracted Successfully!</h2>
      <p>Review the extracted data below. Click "Apply to Profile" to use this data.</p>

      <div className="extracted-data-preview">
        <div className="data-row">
          <span>Branch:</span>
          <strong>{dd214Data.branch}</strong>
        </div>
        <div className="data-row">
          <span>Service Dates:</span>
          <strong>{dd214Data.entryDate} to {dd214Data.separationDate}</strong>
        </div>
        <div className="data-row">
          <span>Rank:</span>
          <strong>{dd214Data.rank} ({dd214Data.payGrade})</strong>
        </div>
        <div className="data-row">
          <span>Character of Service:</span>
          <strong>{dd214Data.characterOfService}</strong>
        </div>
        <div className="data-row">
          <span>MOS:</span>
          <strong>{dd214Data.mosCode} - {dd214Data.mosTitle}</strong>
        </div>
        {/* Show more fields */}
      </div>

      <div className="modal-actions">
        <button onClick={handleApplyDD214Data} className="btn-primary">
          ✅ Apply to Profile
        </button>
        <button onClick={() => setShowDD214ConfirmModal(false)} className="btn-secondary">
          ❌ Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

**Step 3:** Create handler to apply data to profile

```typescript
const handleApplyDD214Data = () => {
  if (!dd214Data) return;

  // Update profile with all DD-214 fields
  updateProfile({
    branch: dd214Data.branch as any,
    serviceStart: dd214Data.entryDate,
    serviceEnd: dd214Data.separationDate,
    dischargeStatus: dd214Data.characterOfService,
    separationCode: dd214Data.separationCode,
    narrativeReason: dd214Data.narrativeReasonForSeparation,
    payGrade: dd214Data.payGrade,
    rank: dd214Data.rank,
    militaryOccupationalSpecialty: `${dd214Data.mosCode} - ${dd214Data.mosTitle}`,
    awards: dd214Data.awards.join(', '),
    combatService: dd214Data.hasCombatService,
    deployments: dd214Data.deploymentLocations.join(', '),
  });

  // Close modal
  setShowDD214ConfirmModal(false);

  // Show success notification
  alert('DD-214 data applied to your profile successfully! ✅');

  // Optionally: advance to next step
  setCurrentStep(currentStep + 1);
};
```

**Result:** Veteran uploads DD-214 → reviews extracted data → clicks "Apply" → profile auto-fills ✅

**Time:** 2-4 hours

---

## 🚀 PHASE 2: BUILD RATING DECISION SCANNER (1-2 Days)

### Current Problem
- No way to upload VA rating decision ❌
- Veterans must manually enter current ratings ❌

### The Build

**Backend File:** `vets-ready-backend/app/routers/rating_decision.py` (CREATE NEW)

**Copy structure from:** `dd214.py` (it's already perfect!)

```python
"""
VA Rating Decision Document Processing Router
Extracts disability ratings from VA rating decision letters
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import re

router = APIRouter(prefix="/api/rating-decision", tags=["rating_decision"])

class RatingDecisionExtractedData(BaseModel):
    """Rating decision extraction result"""
    # Core Rating Info
    combinedRating: int = 0
    effectiveDate: str = ""
    decisionDate: str = ""

    # Individual Conditions
    individualRatings: List[dict] = []  # [{condition, code, percentage, serviceConnection}]

    # Additional Benefits
    specialMonthlyCompensation: bool = False
    smcType: str = ""

    # Metadata
    extractionConfidence: str = "low"
    extractedFields: List[str] = []

@router.post("/upload")
async def upload_rating_decision(file: UploadFile = File(...)):
    """Upload and extract VA rating decision"""

    # 1. Save file
    file_path = save_file(file)

    # 2. Extract text (OCR)
    text = extract_text_from_pdf(file_path)

    # 3. Parse rating information
    extracted_data = parse_rating_decision(text)

    # 4. Return result
    return {
        "success": True,
        "data": extracted_data.dict(),
        "file_path": str(file_path)
    }

def parse_rating_decision(text: str) -> RatingDecisionExtractedData:
    """Parse VA rating decision text"""
    data = RatingDecisionExtractedData()

    # Extract combined rating
    combined_match = re.search(r'combined.*?(\d+)%', text, re.IGNORECASE)
    if combined_match:
        data.combinedRating = int(combined_match.group(1))
        data.extractedFields.append('combinedRating')

    # Extract effective date
    effective_match = re.search(r'effective date[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
    if effective_match:
        data.effectiveDate = effective_match.group(1)
        data.extractedFields.append('effectiveDate')

    # Extract individual condition ratings
    # Pattern: "Condition name ... XX% service connected"
    condition_pattern = r'([A-Za-z\s]+)\s+(\d+)%\s+(service connected|not service connected)'
    conditions = re.findall(condition_pattern, text, re.IGNORECASE)

    for condition_name, percentage, connection_status in conditions:
        data.individualRatings.append({
            'condition': condition_name.strip(),
            'percentage': int(percentage),
            'serviceConnection': 'yes' if 'service connected' in connection_status.lower() else 'no',
            'diagnosticCode': ''  # Can be extracted with more regex
        })
        data.extractedFields.append(f'{condition_name.strip()}')

    # Set confidence
    if len(data.extractedFields) >= 3:
        data.extractionConfidence = 'high'
    elif len(data.extractedFields) >= 1:
        data.extractionConfidence = 'medium'
    else:
        data.extractionConfidence = 'low'

    return data
```

**Frontend File:** `vets-ready-frontend/src/services/RatingDecisionScanner.ts` (CREATE NEW)

**Copy structure from:** `DD214Scanner.ts`

```typescript
export interface RatingDecisionExtractedData {
  combinedRating: number;
  effectiveDate: string;
  decisionDate: string;
  individualRatings: Array<{
    condition: string;
    code: string;
    percentage: number;
    serviceConnection: string;
  }>;
  specialMonthlyCompensation: boolean;
  smcType?: string;
  extractionConfidence: 'high' | 'medium' | 'low';
  extractedFields: string[];
}

export async function extractRatingDecisionData(
  file: File
): Promise<RatingDecisionExtractedData> {
  // Upload to backend
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/rating-decision/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Rating decision extraction failed');
  }

  const result = await response.json();
  return result.data;
}
```

**Update VeteranProfile.tsx:** Add rating decision upload section

```typescript
// Add upload handler
const handleRatingDecisionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setIsProcessingRating(true);

  try {
    const extractedData = await extractRatingDecisionData(file);
    setRatingDecisionData(extractedData);
    setShowRatingConfirmModal(true);
  } catch (error) {
    alert('Rating decision extraction failed: ' + error);
  } finally {
    setIsProcessingRating(false);
  }
};

// Add UI in render
<div className="rating-decision-upload">
  <h3>📊 VA Rating Decision</h3>
  <p>Upload your VA rating decision letter to extract your current disability ratings</p>

  <input
    type="file"
    accept=".pdf,image/*"
    onChange={handleRatingDecisionUpload}
    disabled={isProcessingRating}
  />

  {isProcessingRating && (
    <div className="processing">⏳ Extracting rating data...</div>
  )}
</div>

// Add confirmation modal (similar to DD-214)
{showRatingConfirmModal && ratingDecisionData && (
  <div className="modal-overlay">
    <div className="confirmation-modal">
      <h2>Rating Decision Extracted!</h2>

      <div className="extracted-data-preview">
        <div className="rating-summary">
          <h3>Combined Rating: {ratingDecisionData.combinedRating}%</h3>
          <p>Effective Date: {ratingDecisionData.effectiveDate}</p>
        </div>

        <h4>Individual Conditions:</h4>
        {ratingDecisionData.individualRatings.map((rating, idx) => (
          <div key={idx} className="condition-row">
            <span>{rating.condition}</span>
            <span>{rating.percentage}%</span>
            <span>{rating.serviceConnection}</span>
          </div>
        ))}
      </div>

      <button onClick={handleApplyRatingData}>
        ✅ Apply to Profile
      </button>
    </div>
  </div>
)}
```

**Result:** Veteran uploads rating decision → ratings extracted → profile updated ✅

**Time:** 1-2 days (8-16 hours)

---

## 🚀 PHASE 3: BASIC STRATEGY GENERATOR (1-2 Days)

### Current Problem
- No strategy generation ❌
- Veteran uploads docs but gets no recommendations ❌

### The Build (MVP Version)

**Backend File:** `vets-ready-backend/app/routers/strategy.py` (CREATE NEW)

```python
"""
Simple strategy generator (MVP)
Analyzes DD-214 + Rating Decision to provide basic recommendations
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/strategy", tags=["strategy"])

class StrategyRecommendation(BaseModel):
    type: str  # 'increase', 'new_claim', 'secondary'
    condition: str
    currentRating: int
    projectedRating: int
    rationale: str
    nextSteps: List[str]
    priority: str  # 'high', 'medium', 'low'

class Strategy(BaseModel):
    veteranSummary: dict
    currentConditions: List[dict]
    recommendations: List[StrategyRecommendation]
    projectedIncrease: dict
    actionPlan: List[str]

@router.post("/generate")
async def generate_strategy(
    veteran_id: str,
    db: Session = Depends(get_db)
):
    """
    Generate basic strategy from uploaded documents
    """

    # 1. Get veteran's profile data
    profile = get_veteran_profile(db, veteran_id)

    # 2. Check for uploaded DD-214
    dd214 = get_dd214_extraction(db, veteran_id)

    # 3. Check for uploaded rating decision
    rating_decision = get_rating_decision_extraction(db, veteran_id)

    # 4. Generate recommendations
    recommendations = []

    # Example: If veteran has PTSD at 30%, recommend increase
    for condition in rating_decision.individualRatings:
        if condition['condition'].lower() == 'ptsd' and condition['percentage'] < 50:
            recommendations.append(StrategyRecommendation(
                type='increase',
                condition='PTSD',
                currentRating=condition['percentage'],
                projectedRating=50,
                rationale='Common for PTSD symptoms to worsen over time. Consider filing for increase if symptoms have worsened.',
                nextSteps=[
                    'Document current symptoms (frequency, severity)',
                    'Get updated medical evaluation',
                    'File VA Form 21-526EZ for increase',
                    'Request VA C&P exam'
                ],
                priority='high'
            ))

    # Example: If combat veteran, recommend PTSD if not claimed
    if dd214 and dd214.hasCombatService:
        has_ptsd = any(c['condition'].lower() == 'ptsd' for c in rating_decision.individualRatings)
        if not has_ptsd:
            recommendations.append(StrategyRecommendation(
                type='new_claim',
                condition='PTSD',
                currentRating=0,
                projectedRating=50,
                rationale='Combat veterans are eligible for PTSD claims. Documentation shows deployment to combat zone.',
                nextSteps=[
                    'Get PTSD evaluation from VA or private provider',
                    'File VA Form 21-0966 for PTSD',
                    'Provide combat documentation (DD-214 shows deployment)',
                    'Attend C&P exam'
                ],
                priority='high'
            ))

    # 5. Calculate projected increase
    current_combined = rating_decision.combinedRating
    projected_combined = calculate_combined_rating([
        r['percentage'] for r in rating_decision.individualRatings
    ] + [r.projectedRating for r in recommendations])

    monthly_increase = get_monthly_rate(projected_combined) - get_monthly_rate(current_combined)

    # 6. Create action plan
    action_plan = []
    for rec in sorted(recommendations, key=lambda x: x.priority, reverse=True):
        action_plan.extend(rec.nextSteps[:2])  # Top 2 steps per recommendation

    # 7. Return strategy
    return Strategy(
        veteranSummary={
            'name': profile.firstName + ' ' + profile.lastName,
            'branch': profile.branch,
            'currentRating': current_combined,
            'combatVeteran': dd214.hasCombatService if dd214 else False
        },
        currentConditions=[
            {
                'condition': c['condition'],
                'rating': c['percentage'],
                'serviceConnected': c['serviceConnection']
            }
            for c in rating_decision.individualRatings
        ],
        recommendations=[r.dict() for r in recommendations],
        projectedIncrease={
            'currentRating': current_combined,
            'projectedRating': projected_combined,
            'monthlyIncrease': monthly_increase,
            'annualIncrease': monthly_increase * 12
        },
        actionPlan=action_plan
    )
```

**Frontend Component:** `vets-ready-frontend/src/components/StrategyDisplay.tsx` (CREATE NEW)

```typescript
interface Strategy {
  veteranSummary: any;
  currentConditions: any[];
  recommendations: any[];
  projectedIncrease: any;
  actionPlan: string[];
}

export const StrategyDisplay: React.FC<{ strategy: Strategy }> = ({ strategy }) => {
  return (
    <div className="strategy-display">
      <h2>🎯 Your Personalized Claim Strategy</h2>

      {/* Veteran Summary */}
      <div className="summary-card">
        <h3>{strategy.veteranSummary.name}</h3>
        <p>Branch: {strategy.veteranSummary.branch}</p>
        <p>Current Rating: {strategy.veteranSummary.currentRating}%</p>
        {strategy.veteranSummary.combatVeteran && (
          <span className="badge">Combat Veteran</span>
        )}
      </div>

      {/* Current Conditions */}
      <div className="current-conditions">
        <h3>Current Service-Connected Conditions</h3>
        {strategy.currentConditions.map((condition, idx) => (
          <div key={idx} className="condition-card">
            <strong>{condition.condition}</strong>
            <span>{condition.rating}%</span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <h3>Claim Recommendations ({strategy.recommendations.length})</h3>
        {strategy.recommendations.map((rec, idx) => (
          <div key={idx} className={`rec-card priority-${rec.priority}`}>
            <div className="rec-header">
              <h4>{rec.condition}</h4>
              <span className="badge">{rec.type}</span>
            </div>
            <div className="rec-rating">
              {rec.currentRating}% → {rec.projectedRating}%
            </div>
            <p>{rec.rationale}</p>
            <div className="next-steps">
              <h5>Next Steps:</h5>
              <ul>
                {rec.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Projected Increase */}
      <div className="projected-increase">
        <h3>💰 Projected Financial Impact</h3>
        <div className="increase-grid">
          <div>
            <label>Current Rating</label>
            <strong>{strategy.projectedIncrease.currentRating}%</strong>
          </div>
          <div>
            <label>Projected Rating</label>
            <strong>{strategy.projectedIncrease.projectedRating}%</strong>
          </div>
          <div className="highlight">
            <label>Monthly Increase</label>
            <strong>${strategy.projectedIncrease.monthlyIncrease}</strong>
          </div>
          <div className="highlight">
            <label>Annual Increase</label>
            <strong>${strategy.projectedIncrease.annualIncrease}</strong>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="action-plan">
        <h3>📋 Action Plan</h3>
        <ol>
          {strategy.actionPlan.map((action, idx) => (
            <li key={idx}>{action}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
```

**Add to VeteranProfile or DocumentCenter:**

```typescript
const [strategy, setStrategy] = useState(null);

const handleGenerateStrategy = async () => {
  setGeneratingStrategy(true);

  try {
    const response = await fetch('http://localhost:8000/api/strategy/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ veteran_id: profile.id })
    });

    const result = await response.json();
    setStrategy(result);
  } catch (error) {
    alert('Strategy generation failed: ' + error);
  } finally {
    setGeneratingStrategy(false);
  }
};

// UI
{dd214Uploaded && ratingDecisionUploaded && (
  <button onClick={handleGenerateStrategy} disabled={generatingStrategy}>
    🤖 Generate My Strategy
  </button>
)}

{strategy && <StrategyDisplay strategy={strategy} />}
```

**Result:** Veteran uploads DD-214 + rating decision → clicks "Generate Strategy" → receives recommendations ✅

**Time:** 1-2 days (8-16 hours)

---

## 📊 QUICK WINS SUMMARY

### What You'll Have After These 3 Phases

1. **DD-214 Auto-Population** ✅
   - Upload DD-214 → auto-fills profile
   - No more manual data entry
   - **Time saved per veteran:** 15-20 minutes

2. **Rating Decision Extraction** ✅
   - Upload rating decision → current conditions extracted
   - Disability percentages automatically captured
   - **Time saved per veteran:** 10-15 minutes

3. **Basic Strategy Generator** ✅
   - Analyzes uploaded documents
   - Recommends claim increases
   - Suggests new claims (e.g., PTSD for combat vets)
   - Projects financial impact
   - Provides action plan
   - **Value delivered:** Personalized roadmap to higher benefits

### Total Implementation Time
- **Phase 1:** 2-4 hours
- **Phase 2:** 1-2 days
- **Phase 3:** 1-2 days
- **TOTAL:** 3-5 days for MVP

### Total Value Delivered
- Veteran uploads 2 documents
- Gets complete claim strategy
- Knows exactly what to do next
- Sees projected financial benefit
- **Achieves goal:** "Scan docs → receive strategy" ✅

---

## 🚀 START HERE (Right Now!)

### Immediate Action (Next 30 Minutes)

1. **Open VeteranProfile.tsx**
2. **Add state variables:**
   ```typescript
   const [showDD214ConfirmModal, setShowDD214ConfirmModal] = useState(false);
   const [dd214Data, setDD214Data] = useState<DD214ExtractedData | null>(null);
   ```

3. **Find `handleDD214Upload` function**
4. **Add after successful extraction:**
   ```typescript
   setDD214Data(extractedData);
   setShowDD214ConfirmModal(true);
   ```

5. **Add confirmation modal JSX** (see Phase 1 above)

6. **Test it:**
   - Upload a DD-214
   - See modal with extracted data
   - Click "Apply to Profile"
   - Verify profile fields update

**Congrats! You just fixed the #1 issue.** 🎉

---

## ✅ SUCCESS CHECKLIST

Use this to track progress:

- [ ] Phase 1: DD-214 auto-population working
  - [ ] Confirmation modal shows extracted data
  - [ ] "Apply to Profile" button works
  - [ ] Profile fields update correctly
  - [ ] Veteran doesn't need to re-enter data

- [ ] Phase 2: Rating decision scanner working
  - [ ] Backend endpoint `/api/rating-decision/upload` exists
  - [ ] File upload processes successfully
  - [ ] Combined rating extracted
  - [ ] Individual conditions extracted
  - [ ] Frontend displays extracted ratings
  - [ ] Profile updated with current ratings

- [ ] Phase 3: Basic strategy generator working
  - [ ] Backend endpoint `/api/strategy/generate` exists
  - [ ] Strategy analyzes DD-214 data
  - [ ] Strategy analyzes rating decision data
  - [ ] Recommendations generated (increase/new claims)
  - [ ] Financial projection calculated
  - [ ] Action plan created
  - [ ] Frontend displays strategy beautifully

**When all boxes checked:** You have a working MVP! 🚀

---

## 📞 NEXT STEPS AFTER MVP

Once the MVP is working, enhance with:

1. **STR/PMR/Nexus scanners** (Week 2)
2. **Advanced strategy logic** (Week 3-4)
3. **PDF export of strategy** (Week 4)
4. **Document Center page** (Week 5)
5. **App-wide personalization** (Week 6)

But don't wait! **Start with the MVP and get something working TODAY.**

---

**LET'S GO! 🚀**

*Remember: Done is better than perfect. Get Phase 1 working first, then move to Phase 2.*
