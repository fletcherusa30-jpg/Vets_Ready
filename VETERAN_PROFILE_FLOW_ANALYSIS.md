# Rally Forge Veteran Profile Information Flow Review
**Date:** January 29, 2026 | **Status:** Complete Flow Analysis

---

## 📋 Executive Summary

Your wizard **successfully collects all essential VA benefit determination data** in 5 logical steps. The flow is well-structured, but there are **3 minor optimization opportunities** to reduce redundancy and improve clarity:

1. **Dependent entry is well-consolidated** (Step 2 + verification at Step 4) ✅
2. **CRSC eligibility is appropriately conditional** (only shows for qualified veterans) ✅
3. **No major redundant questions detected** ✅

---

## 🔄 Current Information Flow Breakdown

### **Step 1: Personal & Service Information**
**Primary Focus:** Establish identity and military service context

**Data Collected:**
- Personal: First name, last name, date of birth
- Service: Branch, years of service, rank, character of discharge
- Document: DD-214 upload (optional) or manual entry
- Service Periods: Track multiple periods (Active, Reserve, Guard)
- Special: Combat service indicator

**Assessment:** ✅ **APPROPRIATE**
- Captures all necessary service identity
- Optional OCR reduces data entry burden
- Multiple service periods prevent loss of non-primary service credit
- Character of discharge correctly triggers discharge upgrade CTA

**Data Used For:**
- Eligibility determination (20+ year retirement threshold)
- CRSC qualification (combat service required)
- VA benefits calculator baseline
- Overall profile summary

---

### **Step 2: Disability & VA Rating + Dependents**
**Primary Focus:** Capture service-connected disabilities and dependent information

**Data Collected:**

#### 2A: VA Rating Letter Upload
- Combined disability rating (auto-extracted)
- Individual service-connected conditions (name, rating %, diagnostic code, effective date)
- Bilateral condition indicators
- Denied conditions and denial reasons
- Dependent information from rating letter
- Validation warnings for data quality

#### 2B: Disabilities List & Calculator
- Manual disability entry with VA rating percentages
- Real-time combined rating calculation (using VA math)
- List management (add/remove/clear)

#### 2C: Special Eligibility Indicators
- Aid & Attendance (A&A) needs
- Housebound status
- Loss of use of limb
- Blindness
- Need for special adapted housing

#### 2D: Dependent Information (CONSOLIDATED HERE)
- Spouse: Yes/No
- Number of dependent children (0-20)
- Ages/school enrollment implied in benefits calculator

**Assessment:** ✅ **EXCELLENT - Well Consolidated**
- VA rating letter upload **eliminates manual data entry** and reduces errors
- OCR extraction + manual override = flexibility
- Single location for disability entry (no duplication)
- **Dependent entry consolidated with disabilities** (user suggestion implemented correctly)
- Special SMC indicators properly grouped
- Real-time calculator provides immediate feedback

**Data Used For:**
- Combined VA disability rating (essential for all benefits)
- Individual condition information (appeals, evidence gathering)
- A&A/Housebound determination (affects SMC rates)
- Dependent count (monthly benefit multiplier)
- CRSC eligibility check (Step 3)

---

### **Step 3: CRSC Qualification (Conditional)**
**Primary Focus:** Assess Combat-Related Special Compensation eligibility

**Visible Only If:**
- Military OR medically retired, AND
- VA disability rating ≥ 10%, AND
- Combat service indicated

**Data Collected:**
- Self-identified combat-related disability: Yes/No
- Injury type checkboxes:
  - Combat injury (IED, gunfire, shrapnel, explosion)
  - Training accident
  - Hazardous duty (airborne, diving, flight ops, etc.)
  - Toxic exposure (burn pits, Agent Orange, Gulf War syndrome)
  - PTSD/mental health from combat

**Assessment:** ✅ **APPROPRIATE - Conditional Logic Correct**
- **Reduces cognitive load** by only showing when relevant
- Eligibility criteria clearly displayed
- Multi-select conditions allow nuanced qualification assessment
- Provides action steps when user qualifies
- Educational disclaimer present

**Data Used For:**
- CRSC benefit calculation (tax-free compensation)
- Personalized application guidance

---

### **Step 4: Verify Dependent Information**
**Primary Focus:** Final review before profile completion

**Data Displayed (Read-Only Summary):**
- Spouse: Yes/No
- Dependent children: Number
- Total dependents: Calculated total
- Dependent benefit impact: $20-100/child note
- School enrollment rule callout (ages 18-23)

**Functionality:**
- Edit button links back to Step 2 to modify dependents
- Clear verification prevents accidental submission

**Assessment:** ✅ **APPROPRIATE - Verification Pattern Correct**
- Follows standard "review before submit" UX pattern
- Prevents erroneous dependent entry
- Links back to Step 2 for edits
- Reinforces school enrollment requirement
- Not asking new questions (read-only)

**Data Used For:**
- Final confirmation before Step 5 summary

---

### **Step 5: Review Your Profile (Final Summary)**
**Primary Focus:** Complete profile summary before submission

**Data Displayed:**
- **Personal Info:** Name, branch, years of service
- **Disability:** Combined rating %, A&A, housebound status
- **Retirement:** Retirement status, DoD retirement pay, CRSC eligibility
- **Dependents:** Spouse yes/no, children count, school enrollment

**Assessment:** ✅ **APPROPRIATE - Summary Complete**
- Displays all key data points
- Organized into logical sections
- No new questions asked (read-only)
- Success message confirms profile completeness

---

## 🔍 Redundancy Analysis

### **Question Frequency Check:**

| Data Point | Locations | Assessment |
|------------|-----------|-----------|
| **Years of Service** | Step 1 | ✅ Single location |
| **Disability Rating** | Step 2 (upload + manual) | ✅ Consolidated in Step 2 |
| **Branch of Service** | Step 1 | ✅ Single location |
| **Dependents** | Step 2 (entry) + Step 4 (verify) | ✅ Appropriate (entry then review) |
| **Combat Service** | Step 1 (checkbox) + Step 3 (questionnaire) | ⚠️ See below |
| **Retirement Status** | Step 1 (years) + Step 3 (eligibility check) | ✅ Used for filtering, not re-asked |
| **Character of Discharge** | Step 1 | ✅ Single location |

### **Finding: Combat Service Question Appears Twice**

**Location 1 - Step 1:**
```
"I have combat or deployment service" (checkbox)
```

**Location 2 - Step 3:**
```
"I believe my disability is combat-related" (checkbox, with sub-options)
```

**Analysis:**
- **NOT redundant** - these ask different things:
  - Step 1: "Did you deploy/serve in combat zone?" (service history)
  - Step 3: "Is your disability combat-related?" (disability causation)
- **Appropriate pattern:** Veterans may deploy without combat injury, or have non-combat service connections
- **Example:** Mechanic deployed to Iraq (combat zone) but injured in barracks accident = deployed, but non-combat-related disability

✅ **Verdict: This is correct and necessary**

---

## 📊 Information Capture Completeness Assessment

### **Required for Benefits Determination:**

| Category | Required Data | Collected? | Method |
|----------|---------------|-----------|--------|
| **Identity** | Name, DOB | ✅ | Manual entry (Step 1) |
| **Service** | Branch, years, rank, discharge | ✅ | DD-214 OCR + manual (Step 1) |
| **Disability** | Combined rating, conditions | ✅ | Rating letter OCR + manual (Step 2) |
| **Special Rates** | A&A, housebound, loss of limb, blindness, housing | ✅ | Checkboxes (Step 2) |
| **Dependents** | Spouse, children | ✅ | Manual entry + verification (Step 2/4) |
| **CRSC** | Combat relationship to disability | ✅ | Conditional questionnaire (Step 3) |
| **Retirement** | Retirement type/status | ✅ | Derived from Step 1 data |

### **Analysis:**
✅ **All critical VA benefit determination data is collected**

**Missing Nothing:**
- Retirement status derived from (years of service ≥ 20 OR medically retired)
- Medical retirement years derived from Step 1
- Combat zone determination from service periods
- Eligible for all major VA benefits

---

## 🎯 Recommendations for Minor Optimization

### **Recommendation 1: Clarify "Dependents Impact" Earlier**
**Current State:** Dependent benefit info mentioned in Step 4 and Step 5
**Suggestion:** Add 2-line summary in Step 2 after dependent entry
```
"Dependents increase your monthly benefits:
 • Spouse: +$50-100/month
 • Each child: +$20-30/month (must be under 23 and enrolled in school full-time)"
```
**Impact:** Helps veterans understand value of accurate dependent entry immediately
**Complexity:** Low - just informational callout

---

### **Recommendation 2: Add "Dependent Verification Requirement" Reminder in Step 2**
**Current State:** School enrollment rule mentioned in Step 4
**Suggestion:** Add note in Step 2 after children input:
```
"💡 Note: Children age 18-23 must be enrolled full-time in an accredited school
   to qualify. You'll verify this information in the next step."
```
**Impact:** Sets expectations and prevents data quality issues
**Complexity:** Low - just informational note

---

### **Recommendation 3: Pre-populate Step 5 Retirement Status from Step 1 Data**
**Current State:** Step 5 shows "Medical Retiree (<20 years)" but this is inferred, not explicitly confirmed
**Suggestion:** If profile shows no medical retirement checkbox in Step 1, but displays retirement status in Step 5, add edit link or confirmation
```
"Retirement: Medical Retiree (<20 years)
 [Edit if incorrect] ← add link back to Step 1"
```
**Impact:** Prevents accidental misclassification that affects CRSC eligibility
**Complexity:** Low - add edit link to Step 5 review section

---

### **Recommendation 4: Add "Dependent Type" Clarification**
**Current State:** Step 2 asks "Spouse: Yes/No" and "Number of Children"
**Suggestion:** Add optional text field for spouse name and children names (optional)
```
"Dependents on VA Rating:
 [Optional: Add names of dependents or school enrollment dates if known]"
```
**Impact:** Allows easy reference to rating decision letter dependents
**Complexity:** Medium - requires data model update

---

## 🔐 Data Flow Validation

### **Are we capturing what's needed for the benefits calculator?**

The benefits calculator needs:
- ✅ VA disability rating (collected Step 2)
- ✅ A&A status (collected Step 2)
- ✅ Housebound status (collected Step 2)
- ✅ Dependent count (collected Step 2 + verified Step 4)
- ✅ Retirement status (collected Step 1, inferred)
- ✅ CRSC eligibility (collected Step 3)
- ✅ Service years (collected Step 1)

**Verdict:** ✅ **All necessary data is collected**

---

## ⚡ User Experience Flow Optimizations

### **Current Flow Statistics:**
- **Steps:** 5 (appropriate for complexity)
- **Questions per step:**
  - Step 1: ~12 questions + optional file upload
  - Step 2: ~20+ questions (rating extraction, conditions, special SMC, dependents)
  - Step 3: 1-6 questions (conditional)
  - Step 4: 0 questions (read-only review)
  - Step 5: 0 questions (read-only summary)
- **Estimated completion time:** 10-15 minutes for complete entry

### **Cognitive Load Assessment:**
- ✅ Step 1: Moderate (document upload option reduces burden)
- ✅ Step 2: Moderate-to-High (OCR upload significantly reduces burden vs manual)
- ✅ Step 3: Low (only appears for eligible veterans)
- ✅ Step 4-5: Very Low (review-only steps)

---

## 🎓 Information Quality Assurance

### **How data quality is ensured:**

1. **OCR Validation:**
   - Rating letter extraction includes confidence scoring
   - Warnings display if data seems incomplete
   - Manual override available

2. **Dependent Verification:**
   - Step 4 displays back what was entered
   - Edit button available for corrections
   - School enrollment requirement noted

3. **Disability Rating Validation:**
   - Manual calculator provides real-time combined rating
   - Individual conditions editable with validation
   - Denied conditions clearly separated

4. **Profile Review:**
   - Step 5 shows complete summary
   - No submission without verification

---

## ✅ Final Verdict

### **Question Redundancy:** ❌ **NONE DETECTED** (beyond intentional verification)
- All questions serve distinct purposes
- No duplicate data collection
- Appropriate verification steps in place

### **Information Completeness:** ✅ **COMPLETE**
- All VA benefits determination data captured
- OCR automation reduces manual entry burden
- Optional/conditional sections appropriately gated

### **User Experience:** ✅ **GOOD**
- Logical progression
- Appropriate step count
- Review-before-submit pattern implemented
- Conditional sections reduce cognitive load for ineligible veterans

### **Recommended Priority:**
1. **High:** Recommendation 3 (add edit link to Step 5 retirement status)
2. **Medium:** Recommendation 1 & 2 (add dependency benefit info earlier)
3. **Low:** Recommendation 4 (optional name fields)

---

## 📝 Next Steps

1. Review CRSC eligibility rules with VA compliance team
2. Implement edit links in Step 5 for critical fields
3. Add dependent benefit calculations to Step 2 display
4. Test with 10+ veteran users to validate flow clarity
5. Monitor for most-edited fields in Step 4/5 (indicates confusion points)

