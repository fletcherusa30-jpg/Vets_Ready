# CRSC Wizard Testing Guide

## 🧪 How to Test the New CRSC Qualification Wizard

### Prerequisites
- Frontend must be running: `npm run dev` (localhost:5173)
- Backend must be running: `python -m uvicorn main:app --reload` (localhost:8000)

---

## Test Scenario 1: Qualified Veteran (Happy Path)

### Steps:
1. Navigate to **Retirement** page
2. Fill in Stage 1 (Profile):
   - Years of Service: `24`
   - Branch: `Army`
   - Pay Grade: `E-7`
   - Current Age: `45`

3. Move to Stage 2 (Income)
4. Fill in:
   - VA Disability Rating: `60%` (use slider)

5. **CRSC Section Should Appear** (since years ≥ 20 and disability ≥ 10%)
6. Click **"Check CRSC Eligibility"** button

### CRSC Wizard Flow:

#### Step 1: Service & Retirement
- Years of Service: Should auto-fill `24`
- Receives retirement pay: Select **"Yes"**
- Retirement type: **"20+ Year Regular Retirement"**
- Click **Next →**

#### Step 2: VA Disability
- Has VA disability rating: **"Yes"**
- Disability rating slider: Move to **60%**
- Check: **"I have service-connected conditions"**
- Click **Next →**

#### Step 3: Combat Service
- Combat deployment: **"Yes"**
- Combat zones: Check **"Afghanistan (OEF/OFS)"** and **"Iraq (OIF/OND)"**
- Combat awards: Check **"Combat Infantryman Badge (CIB)"** and **"Purple Heart"**
- Click **Next →**

#### Step 4: Disability Connection
- Combat-related disability: **"Yes"**
- Disability types: Check **"Combat injury (IED, gunshot, shrapnel, etc.)"** and **"Combat-related PTSD"**
- Click **Next →**

#### Step 5: Documentation
- Has documentation: **"Yes"**
- Documentation types: Check:
  - Purple Heart award citation
  - Combat casualty care records
  - VA rating decision mentioning combat
  - Service treatment records (STRs) showing combat injury
- Click **Next →**

#### Step 6: Results
**Expected Results:**
- ✅ **"You Likely Qualify for CRSC!"** (green banner)
- **Qualification Summary** should show:
  - ✅ You receive military retirement pay
  - ✅ You have 60% VA disability rating
  - ✅ You deployed to combat zone(s)
  - ✅ Your disability is documented as combat-related
- **Estimated Monthly Benefit**: ~$2,400 (60% × $40)
- **CRDP vs CRSC** comparison box should appear (since 20+ years and 50%+ rating)
- **Next Steps** should list 5 action items
- Click **Complete Assessment ✓**

#### After Wizard:
- Wizard should close
- **"CRSC Qualified"** green badge should appear next to the button
- `formData.hasCombatRelatedDisability` should be `true`

---

## Test Scenario 2: Disqualified Veteran (No Combat Deployment)

### Steps:
1. Navigate to **Retirement** page
2. Fill in:
   - Years of Service: `22`
   - VA Disability Rating: `40%`

3. Click **"Check CRSC Eligibility"**

### CRSC Wizard Flow:

#### Step 1-2: Same as above
- Fill in service and disability info

#### Step 3: Combat Service
- Combat deployment: **"No combat deployments"**
- Click **Next →** (combat zones/awards skip)

#### Step 4: Disability Connection
- Combat-related disability: **"No, not directly from combat"**
- Click **Next →** (disability types skip)

#### Step 5: Documentation
- Has documentation: **"No"**
- Click **Next →**

#### Step 6: Results
**Expected Results:**
- ⚠️ **"Additional Requirements Needed"** (red/orange banner)
- **Qualification Summary** should show:
  - ❌ Must have combat deployment or hostile fire zone service
  - ❌ Disability must be combat-related (occurred during combat operations)
  - ✅ You receive military retirement pay
  - ✅ You have 40% VA disability rating
- **Next Steps** should provide guidance on:
  - Gathering deployment documentation
  - Evidence linking disability to service
- NO estimated benefit shown
- Click **Complete Assessment ✓**

#### After Wizard:
- Wizard should close
- NO green "CRSC Qualified" badge appears
- `formData.hasCombatRelatedDisability` should be `false`

---

## Test Scenario 3: CRDP vs CRSC Comparison

### Steps:
1. Fill in:
   - Years of Service: `20`
   - VA Disability Rating: `70%`

2. Click **"Check CRSC Eligibility"**
3. Go through wizard as qualified veteran (combat deployment, combat-related, etc.)

### Step 6: Results
**Expected Additional Content:**
- **CRDP vs CRSC** purple comparison box should appear
- Should state: "You qualify for both CRDP and CRSC. You can only receive ONE."
- Two-column comparison:
  - **CRDP (Automatic)**: No application, full retirement + disability, taxable, faster
  - **CRSC (Must Apply)**: Application required, only combat portion, tax-free, may be higher

---

## Test Scenario 4: Insufficient Disability Rating

### Steps:
1. Fill in:
   - Years of Service: `22`
   - VA Disability Rating: `0%` or less than `10%`

2. **CRSC Section Should NOT Appear** (doesn't meet minimum 10% requirement)
3. No wizard button should be visible

---

## Test Scenario 5: Insufficient Years of Service

### Steps:
1. Fill in:
   - Years of Service: `15` (less than 20)
   - VA Disability Rating: `50%`

2. **CRSC Section Should NOT Appear** (doesn't meet minimum 20 years requirement)
3. No wizard button should be visible

---

## Visual Checks

### CRSC Section Appearance:
- Gradient background (yellow-50 to orange-50)
- Yellow border (border-yellow-400)
- ⚔️ Emoji icon
- Bold heading: **"Combat-Related Special Compensation (CRSC)"**
- Clear description text
- Yellow **"Check CRSC Eligibility →"** button
- Quick facts section at bottom with border-top

### Wizard Modal:
- **Header**: Yellow gradient background with white text
- **Progress bar**: 6 segments (green = complete, white = current, dark yellow = upcoming)
- **Step indicator**: "Step X of 6"
- **Content area**: White background, scrollable
- **Info boxes**: Blue, purple, red, orange, green (one per step)
- **Footer**: Gray background, Previous/Next buttons

### Results Step:
- **Qualified**: Green banner with ✅ emoji, large heading
- **Not Qualified**: Red banner with ⚠️ emoji
- **Estimated Benefit**: Blue box with large dollar amount
- **CRDP Comparison**: Purple box with two columns
- **Next Steps**: Yellow box with numbered list

---

## Edge Cases to Test

### 1. Wizard Cancel
- Open wizard
- Click **"Cancel"** (Step 1 only)
- Wizard should close, no data saved

### 2. Wizard Back Navigation
- Go to Step 3
- Click **← Previous**
- Should go back to Step 2
- Data should be preserved

### 3. Re-open Wizard After Qualification
- Complete wizard as qualified
- Green badge appears
- Click **"Check CRSC Eligibility"** again
- Wizard should re-open with previous data pre-filled

### 4. Multiple Combat Zones
- Select 5+ combat zones
- All should be saved
- Should appear in qualification summary

### 5. No Combat Awards
- Select "None of the above" for awards
- Should show warning in results
- Should still qualify if other criteria met

---

## Success Criteria

✅ **Wizard launches when requirements met** (20+ years, 10%+ disability)
✅ **All 6 steps display correctly** with proper content
✅ **Progress bar updates** on each step
✅ **Data persists** when going back/forward
✅ **Qualification logic works** correctly
✅ **Results display properly** (qualified vs not qualified)
✅ **CRDP comparison shows** when eligible (20+ years, 50%+ rating)
✅ **Estimated benefit calculates** correctly
✅ **Badge appears** after qualification
✅ **Form data updates** (`hasCombatRelatedDisability`)
✅ **Educational content helpful** and accurate
✅ **Mobile responsive** (test on smaller screens)

---

## Common Issues & Fixes

### Issue: Wizard doesn't appear
**Fix**: Check that `yearsOfService >= 20` AND `disabilityRating >= 10`

### Issue: Progress bar not updating
**Fix**: Check that `setStep()` is being called in Next button

### Issue: Data not saving after completion
**Fix**: Check `onComplete` callback in Retirement.tsx

### Issue: CRDP comparison not showing
**Fix**: Check that `yearsOfService >= 20` AND `disabilityRating >= 50`

### Issue: TypeScript errors
**Fix**: Ensure `CRSCQualificationData` interface is exported correctly

---

## Browser Testing
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)
- ✅ Mobile Chrome
- ✅ Mobile Safari

---

*Test all scenarios to ensure veterans get proper CRSC eligibility guidance!*
