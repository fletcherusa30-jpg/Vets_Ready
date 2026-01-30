# DD-214 to VA Benefits Determination Guide

## Overview
The DD-214 (Certificate of Release or Discharge from Active Duty) contains critical information needed to determine a veteran's VA benefits eligibility and entitlements.

---

## SECTION 1: ELIGIBILITY DETERMINATION FIELDS

### 1.1 Character of Service (CRITICAL)
**Field Location:** DD-214 Block 24-28
**Determines:** Basic VA benefits eligibility
**Valid Values:**
- `Honorable` → Full VA benefits eligibility ✅
- `General (Under Honorable Conditions)` → Generally eligible (some restrictions)
- `Under Other Than Honorable Conditions (OTH)` → Limited/No benefits
- `Bad Conduct Discharge` → No benefits (requires appeal)
- `Dishonorable` → No benefits (felony conviction)
- `Entry Level Separation` → Limited benefits

**Impact:** Character determines up to 95% of benefit eligibility decisions

---

### 1.2 Service Branch
**Field Location:** DD-214 Block 11
**Values:** Army, Navy, Air Force, Marine Corps, Coast Guard, Space Force
**Impact:** Determines:
- Specific VA medical center assignments
- Branch-specific benefits programs
- Reserve component status options

---

### 1.3 Service Dates
**Field Location:** DD-214 Block 13 & 14
**Required:** Entry date and separation date
**Calculates:** Total service time (years/months/days)

**Benefit Thresholds:**
- **Less than 90 days**: Only eligibility for disability from service-connected condition
- **90+ days**: Full VA healthcare eligibility
- **20+ years**: Retirement/pension eligibility
- **24 months**: Montgomery GI Bill eligibility
- **2 years active duty (after 9/30/1966)**: Post-9/11 GI Bill eligibility

**Field on DD-214:** Block 12 (Net Active Service)

---

### 1.4 Pay Grade/Rank
**Field Location:** DD-214 Block 18
**Impact:** Determines:
- Disability compensation calculation (rating × rank multiplier)
- Pension amount calculations
- Survivor benefit eligibility

**Example:** E-5 rating vs O-4 rating produces different benefit amounts for same disability

---

## SECTION 2: DISABILITY DETERMINATION FIELDS

### 2.1 Military Occupational Specialty (MOS)
**Field Location:** DD-214 Block 11A, 11B, 11C
**Impact:** Determines:
- Presumptive conditions eligibility
- PTSD/service-connection likelihood by specialty
- Occupational hazard exposure

**Examples with Presumptive Conditions:**
- **Combat Infantry (11B)**: Combat-related PTSD presumptive
- **Aircraft Maintenance (MOS 2851)**: Agent Orange exposure (Vietnam era)
- **Nuclear Specialist (MOS 33S)**: Radiation exposure
- **Supply (92F)**: Burn pit exposure (Iraq/Afghanistan)

---

### 2.2 Deployment History / Overseas Service
**Field Location:** DD-214 Block 27 (Narrative Comments)
**Required for Establishing:**
- Agent Orange presumption (Vietnam service)
- Burn pit/environmental exposure presumptions
- Combat-related PTSD presumption
- Foreign service benefits

**High-Benefit Deployments:**
- Vietnam (1962-1975): Agent Orange exposure
- Gulf War (1990-1991): Gulf War Illness presumptions
- Iraq/Afghanistan (2001-present): Burn pit, depleted uranium
- Korea DMZ: Agent Orange, DMZ service benefits

---

### 2.3 Combat/Combat Zone Indicators
**Field Location:** DD-214 Block 27, 28, awards/decorations
**Indicates:** PTSD presumptive eligibility

**Combat Indicators:**
- Combat Infantry Badge (CIB)
- Combat Action Badge (CAB)
- Army Commendation Medal with "V" device
- Bronze Star with "V" device
- Purple Heart (any wound/injury = disability presumption)

---

### 2.4 Awards, Decorations, Medals
**Field Location:** DD-214 Blocks 28-32
**Combat Indicators:**
- **Purple Heart** → Any service-connected injury presumed
- **Bronze Star with "V"** → Combat participation
- **Silver Star** → Combat service
- **Medal of Honor** → Higher priority processing
- **Combat Action Medal** → Service in combat zone

**Non-Combat but Important:**
- Good Conduct Medal → Supports discharge character appeal
- POW Medal → Special considerations

---

## SECTION 3: BENEFIT-SPECIFIC REQUIREMENTS

### 3.1 GI Bill Eligibility
**Required Fields:**
1. **Separation Code** (Block 26): Determines GI Bill access
2. **Service Dates**: Post-9/11 GI Bill requires 90+ days active duty after 9/10/2001
3. **Character of Service**: Honorable or General under Honorable required

**Specific Codes Blocking GI Bill:**
- JFF (Fraudulent Entry)
- VST (Victim of Sexual Trauma - may have exceptions)
- TSC (Termination of Service Contract)

---

### 3.2 Pension Eligibility (Aid & Attendance)
**Required Fields:**
1. **Age**: Must be 65+ (or permanently/totally disabled)
2. **Service Dates**: At least 1 day of active service (WWI era) to 90+ days (modern)
3. **Discharge Character**: Honorable only
4. **Income/Assets**: VA means testing

---

### 3.3 Survivor Benefits (DIC - Dependency & Indemnity Compensation)
**Required Fields:**
1. **Discharge Character**: Honorable required
2. **Cause of Death**: Must be service-connected or rated at 100%
3. **Family Status**: Surviving spouse/children details

---

### 3.4 Home Loan Benefits (VA Mortgage)
**Required Fields:**
1. **Service Dates**: At least 90 consecutive days
2. **Character of Service**: Honorable or General under Honorable
3. **Loan Entitlement**: $200,000+ for most properties

**Blocking Factors:**
- OTH discharge
- Bad Conduct or Dishonorable discharge
- Service less than 90 consecutive days (with exceptions)

---

## SECTION 4: PRESUMPTIVE CONDITIONS by ERA

### 4.1 Vietnam Era (1962-1975)
**Automatic Service Connection:**
- Agent Orange exposure (all Vietnam service)
- Conditions: Prostate cancer, diabetes type 2, PTSD, CLL, Parkinson's
- **Location Field Needed:** Vietnam service indication

---

### 4.2 Gulf War Era (1990-1991)
**Presumptive Conditions:**
- Chronic Fatigue Syndrome
- Fibromyalgia
- IBS (Irritable Bowel Syndrome)
- **Location Field Needed:** Kuwait/Saudi Arabia/Iraq service

---

### 4.3 Iraq/Afghanistan (OIF/OEF 2001-2021)
**Presumptive Conditions:**
- Burn pit exposure: Lung disease, COPD
- Depleted uranium: Multiple cancers
- Camp Lejeune water contamination (if applicable)
- **Location Field Needed:** Specific base/deployment location

---

### 4.4 Cold War Era (1945-1991)
**Radiation Exposure Presumptions:**
- Nuclear weapons testing participants
- Hiroshima/Nagasaki occupation forces
- Reactor/radiological exposure

---

## SECTION 5: SEPARATION/DISCHARGE INFORMATION

### 5.1 Separation Code (Block 26)
**Examples:**
- **JFF** (Fraudulent Entry) → BLOCKS all benefits
- **HOR** (Honorable) → No issues
- **STY** (Personality Disorder) → May appeal
- **TCS** (Termination) → Limited benefits

**Impact:** Over 30 codes that affect eligibility

---

### 5.2 Narrative Reason for Separation (Block 27)
**Important Keywords for Appeals:**
- "Service-connected injury" → Disability presumption
- "Medical" → Possibly service-connected condition
- "Administrative separation" → Possible appeal basis
- "Convenience of Government" → Often appealable

---

### 5.3 Reentry Code (Block 33)
**Impact:** Can prevent future military service or require waivers
- RE1 → Can reenlist
- RE2-RE4 → Requires waivers
- RE9 → Permanent ban

---

## SECTION 6: OCCUPATIONAL HAZARD MAPPING

### 6.1 MOS to Presumptive Conditions Matrix

| MOS Range | Job Title | Presumptive Conditions |
|-----------|-----------|----------------------|
| 68 | Combat Medic | Infectious Disease, Combat PTSD |
| 11 | Infantryman | Combat PTSD, Agent Orange (if Vietnam) |
| 2X | Aircraft Maintenance | Burn pit exposure (if Iraq/Afghan) |
| 33S | Nuclear Specialist | Radiation exposure |
| 92 | Supply/Logistics | Burn pit, Agent Orange (location dependent) |
| 51 | Water/Fuel Handler | Agent Orange, petroleum exposure |
| 36 | Infantry Officer | Combat PTSD |

---

## SECTION 7: CRITICAL EXTRACTION CHECKLIST

### Must-Extract Fields:
- [ ] Character of Service (eligibility gatekeeper)
- [ ] Service Branch
- [ ] Entry Date
- [ ] Separation Date
- [ ] Pay Grade/Rank
- [ ] Primary MOS
- [ ] Secondary MOS
- [ ] Separation Code
- [ ] Narrative Reason
- [ ] Awards & Decorations (especially combat medals)
- [ ] Deployment Locations
- [ ] Reentry Code

### Benefits Calculation Fields:
- [ ] Net Active Service
- [ ] Total Service Time (calculated)
- [ ] Pay Grade (for disability rating multiplier)
- [ ] Combat Status (from medals/decorations)

---

## SECTION 8: COMMON DD-214 SCANNING ISSUES

### Why Scanner Fails:
1. **Image Quality**: Blurry scans produce OCR errors
2. **Handwritten Sections**: Military often hand-fills portions
3. **Multiple Blocks**: Fields span multiple pages
4. **Special Characters**: Military codes contain unusual characters
5. **Form Variations**: Different versions (old vs. new DD-214s)

### Solution Strategy:
1. **Multiple OCR Attempts**: Try different engines
2. **Manual Correction UI**: Allow veteran to verify/correct
3. **Fallback to Manual Entry**: Provide data entry form
4. **Field Validation**: Check for logical inconsistencies

---

## SECTION 9: BENEFITS ELIGIBILITY DECISION TREE

```
1. START: Check Character of Service
   ├─ Honorable → Continue
   ├─ General (UHC) → Continue (some limitations)
   ├─ Other Than Honorable → Limited/No benefits
   └─ Bad Conduct/Dishonorable → STOP - No VA benefits

2. Check Service Dates
   ├─ 90+ days active duty → Healthcare + disability benefits
   ├─ Less than 90 days → Only disability from SC condition
   └─ 24+ months → GI Bill eligible

3. Check for Combat Service
   ├─ Purple Heart or Combat Badge → PTSD presumptive
   ├─ Vietnam Service → Agent Orange presumptive
   └─ Gulf War Service → Illness presumptive

4. Check MOS & Deployment Location
   ├─ Agent Orange era + appropriate service → Presumptions apply
   ├─ Burn pit/depleted uranium exposure areas → Presumptions apply
   └─ Other locations → Standard SC determination needed

5. Calculate Benefit Amounts
   ├─ Disability Rating % (0-100%)
   ├─ Service Years × Pay Grade = Pension amount
   └─ Deployment/Combat status = Tier determinations
```

---

## SECTION 10: NEXT STEPS FOR IMPLEMENTATION

### Immediate Fixes:
1. **Enhance OCR**: Implement multi-pass OCR with error correction
2. **Add Manual Entry**: Form fields for all critical data
3. **Validation Rules**: Flag missing critical fields
4. **Veteran Verification**: Show extracted data for confirmation

### Benefits Calculation Module:
1. Map extracted MOS to known hazard exposures
2. Implement presumptive condition eligibility engine
3. Calculate estimated benefit amounts based on:
   - Character of discharge
   - Service dates
   - Pay grade
   - Combat status

### Future Enhancements:
1. Automated VA Form filing suggestions
2. Appeal preparation guidance
3. Estimated benefits calculator
4. Timeline to benefits realization

---

## Conclusion

A DD-214 contains an entire roadmap to a veteran's benefits. The key is extracting the right fields and knowing how to interpret them. The most critical fields are **Character of Service** (eligibility), **Service Dates** (benefit types), **MOS/Deployment** (presumptive conditions), and **Awards** (combat status).
