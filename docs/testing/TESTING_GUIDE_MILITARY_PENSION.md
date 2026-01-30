# Testing Guide: Military Pension & CRSC Features

## Access the Page
**URL**: http://localhost:5173/retirement

---

## Test Scenario 1: 20-Year Military Retiree with CRDP

### Setup
1. Navigate to **Overview** tab
2. Set the following values:
   - **Branch**: Army (or any branch)
   - **Rank/Pay Grade**: E-7
   - **Years of Service**: 20
   - **VA Disability Rating**: 50% or higher

### Expected Results
✅ **Military Retirement Benefits panel appears** (blue highlight)
- Shows: "🎖️ Military Retirement Benefits"
- Message: "You qualify for military retirement pension (20+ years)"
- Checkbox: "Auto-calculate pension from my rank" (checked by default)

✅ **Manual pension input is hidden**
- No "Expected Monthly Pension (Manual)" field visible

✅ **Results Summary shows**:
- Pension amount calculated from E-7 pay + 20 years
- "✅ CRDP Eligible" badge appears
- Shows: "You receive full disability pay without pension offset ($X,XXX/month)"

---

## Test Scenario 2: CRSC Eligibility

### Setup
1. Continue from Scenario 1 OR start fresh
2. Set:
   - **Years of Service**: 20+
   - **VA Disability Rating**: 50% (slider)
3. Check the checkbox: **"I have combat-related disabilities (CRSC eligible)"**

### Expected Results
✅ **CRSC Eligibility panel appears** (purple highlight)
- Shows: "⭐ CRSC Eligible"
- Amount: "Combat-Related Special Compensation available ($X,XXX/month)"

✅ **Comparison panel shows** (if both CRDP and CRSC eligible):
```
📋 You Can Choose:
CRDP          CRSC
All taxable   Tax-free portion

Consult with VA to elect which is best for you
```

---

## Test Scenario 3: Manual Pension Entry

### Setup
1. Set **Years of Service**: 20+
2. **Uncheck**: "Auto-calculate pension from my rank"

### Expected Results
✅ **Military Retirement Benefits panel still shows**
- Message: "When unchecked, you can manually enter your pension amount below"

✅ **Manual pension input appears** (yellow highlight)
- Field: "Expected Monthly Pension (Manual)"
- Tip: "💡 Tip: Enable 'Auto-calculate pension' above to calculate from your rank"

✅ **Can enter custom pension amount**
- Type a value (e.g., 3000)
- Results update to use manual amount instead of calculated

---

## Test Scenario 4: Less Than 20 Years (No Military Retirement)

### Setup
1. Set **Years of Service**: 15 (or any value < 20)

### Expected Results
✅ **No military retirement benefits panel**
- Blue panel does not appear
- No auto-calculate option

✅ **Manual pension input appears directly**
- Yellow panel: "Expected Monthly Pension (Manual)"
- Message: "Enter your expected retirement pension amount"
- No tip about auto-calculation

✅ **Standard retirement planning flow**
- Works as before for non-retirees
- All other features functional

---

## Test Scenario 5: Low Disability (CRSC Not Available)

### Setup
1. Set:
   - **Years of Service**: 20+
   - **VA Disability Rating**: 40% (below 50% for CRDP)
   - **Auto-calculate pension**: Checked

### Expected Results
✅ **Military retirement benefits panel shows**
- Auto-calculate checkbox visible

✅ **CRSC checkbox appears** (if disability ≥ 10%)
- Option: "I have combat-related disabilities (CRSC eligible)"

✅ **No CRDP badge** (requires 50%+ disability)

✅ **If CRSC checked and disability ≥ 10%**:
- CRSC eligibility panel appears
- No comparison panel (CRDP not eligible)

---

## Test Scenario 6: High-Rank Officer (O-5/O-6)

### Setup
1. Set:
   - **Rank/Pay Grade**: O-5 or O-6
   - **Years of Service**: 30
   - **Retirement System**: High-3
   - **VA Disability Rating**: 100%
   - **Auto-calculate pension**: Checked
   - **CRSC**: Checked

### Expected Results
✅ **High pension calculation**
- O-5/O-6 base pay × 2.5% × 30 years = ~75% of base pay
- Displays in "Pension" box (should be $5,000-$8,000+ range)

✅ **Both CRDP and CRSC eligible**
- Blue CRDP badge
- Purple CRSC badge
- Comparison panel visible

✅ **Investment income adds on top**
- Total retirement income = Pension + Disability + Investments

---

## Real-Time Calculation Tests

### Test: Rank Change
1. Keep **Years of Service** at 20
2. Change **Rank** from E-5 → E-7 → O-3
3. **Expected**: Pension amount updates immediately

### Test: Years of Service Slider
1. Keep **Rank** at E-7
2. Slide **Years of Service** from 20 → 25 → 30
3. **Expected**:
   - Pension increases with each year
   - At 19 years: Military benefits panel disappears
   - At 20 years: Panel reappears

### Test: Retirement System Switch
1. Set E-7, 20 years
2. Toggle between **BRS** (2.0%) and **High-3** (2.5%)
3. **Expected**: Pension changes (High-3 should be ~25% higher)

---

## Budget Impact Tests

### Test: Auto vs Manual Pension
1. Set **E-7, 20 years, auto-calculate ON**
2. Note the **Monthly Surplus/Deficit**
3. Turn **auto-calculate OFF**
4. Enter **manual pension** (try $2000, then $5000)
5. **Expected**: Budget status changes based on pension amount

### Test: CRSC Impact
1. Set **20 years, 50% disability**
2. Note **Total Monthly Income** without CRSC
3. Check **CRSC checkbox**
4. **Expected**:
   - Total income same (CRSC is alternative, not additional)
   - Tax treatment different (shown in comparison)

---

## Accessibility Tests

### Keyboard Navigation
1. Use **Tab** to navigate through form
2. **Expected**:
   - All checkboxes reachable
   - Aria-labels present (screen reader support)
   - Visual focus indicators

### Screen Reader
1. Enable screen reader (NVDA/JAWS)
2. Navigate to military retirement section
3. **Expected**:
   - Reads "Auto-calculate pension from rank"
   - Reads "I have combat-related disabilities CRSC eligible"
   - Announces changes to pension amounts

---

## Edge Cases

### Test: Zero Disability
1. Set **Disability Rating**: 0%
2. **Expected**: No CRSC checkbox (requires ≥10%)

### Test: Exactly 20 Years
1. Set **Years of Service**: exactly 20
2. **Expected**: Military benefits panel appears

### Test: 19 vs 20 Years
1. Set to 19 years → no panel
2. Slide to 20 years → panel appears
3. **Expected**: Smooth transition, no errors

### Test: Switching Auto-Calculate Rapidly
1. Toggle checkbox on/off multiple times
2. **Expected**:
   - No errors in console
   - UI updates correctly
   - Values persist

---

## Visual Inspection Checklist

✅ **Color Coding**:
- Blue = Military retirement benefits / CRDP
- Purple = CRSC
- Yellow = Manual input warning
- Green = Positive (surplus/income)

✅ **Panel Borders**:
- Left border on all informational panels
- Rounded corners
- Proper padding and spacing

✅ **Typography**:
- Emoji icons for visual cues (🎖️, ⭐, 💡)
- Clear hierarchy (headers, labels, help text)
- Readable font sizes

✅ **Responsive Design**:
- Test at different screen widths
- Mobile view (< 768px): stacks properly
- Tablet view (768-1024px): readable
- Desktop view (> 1024px): optimal layout

---

## Console Checks

### Open Browser DevTools
**F12** or **Right-click → Inspect**

### Console Tab
✅ **No errors** related to:
- Retirement.tsx
- useState updates
- Calculation functions

✅ **Hot Module Replacement (HMR)** working:
- Updates without full page reload
- State preserved when possible

### Network Tab
✅ **No failed requests**
✅ **Only static assets loaded** (no unnecessary API calls)

---

## Data Validation Tests

### Test: Invalid Inputs
1. Try entering negative numbers
2. Try extremely high values (> max)
3. **Expected**: Input constrained by min/max/step

### Test: NaN Prevention
1. Clear a number field completely
2. **Expected**: Defaults to 0, no "NaN" displayed

### Test: Calculation Accuracy
1. Set **E-7, 20 years, BRS**:
   - E-7 base pay (2026): ~$4,500
   - 2.0% × 20 = 40%
   - Expected pension: ~$1,800/month
2. Verify calculation matches

---

## Performance Tests

### Load Time
1. Fresh page load
2. **Expected**: < 2 seconds to interactive

### Calculation Speed
1. Change values rapidly
2. **Expected**: Updates within 100ms

### Memory Leaks
1. Switch between tabs multiple times
2. Toggle options extensively
3. **Expected**: No console warnings about memory

---

## Success Criteria

### ✅ All Features Working
- Auto-calculate pension toggles correctly
- Manual input appears when auto-calculate off
- CRSC checkbox appears for eligible users
- Results panels show correct information

### ✅ No Errors
- No console errors
- No TypeScript errors
- No accessibility violations

### ✅ Good UX
- Clear instructions and tooltips
- Color-coded panels make sense
- Smooth transitions
- Responsive at all screen sizes

### ✅ Accurate Calculations
- Pension matches pay tables
- CRDP/CRSC eligibility correct
- Budget totals add up
- Projections make sense

---

## Report Issues

If you find any bugs, note:
1. **Scenario**: What you were testing
2. **Expected**: What should happen
3. **Actual**: What actually happened
4. **Screenshot**: If visual issue
5. **Console**: Any error messages

---

**Testing Status**: Ready for comprehensive testing
**Documentation**: See MILITARY_PENSION_CRSC_IMPLEMENTATION.md
**Code Location**: rally-forge-frontend/src/pages/Retirement.tsx

