# Retirement Tool - Copilot Instruction Block

## Mission
Rebuild the rallyforge Retirement Planning Tool into a comprehensive, veteran-centric retirement calculator featuring accurate VA pension calculations, retirement income projections, survivor benefits analysis, and long-term financial planning with world-class UX.

## Core Requirements

### Section 1: Global Rules (Foundation)
- **Modularity**: Separate concerns (calculation engine → schemas → API → frontend) with clear dependencies
- **Testability**: 100% test coverage minimum (unit, integration, component tests required)
- **Readability**: Self-documenting code with clear variable names, comprehensive comments on complex logic
- **Determinism**: Same inputs always produce same outputs; no randomness in core calculations
- **Accessibility**: WCAG 2.1 AA standard, keyboard navigation, screen reader support
- **Type Safety**: Use TypeScript (frontend) and Pydantic V2 (backend) with full type hints
- **Veterans-First**: Language and UI designed for veteran audience, acknowledge military context

### Section 2: Functional Requirements

#### 2.1 Core Calculations
**VA High-3 Retirement Pay**
- Input: Years of service (20+), military rank
- Calculate: High-3 average salary × 2.5% × years of service
- Output: Monthly retirement pay amount with verification source
- Validation: Years 20-50, rank validation against DOD data

**Survivor Benefit Plan (SBP)**
- Input: Retirement pay amount, beneficiary selection, coverage percentage
- Calculate: Cost (6.5% of covered amount), monthly benefit to survivor
- Options: Veteran only (0%), Spouse+Children (55%), Family (75%)
- Output: Monthly SBP cost, spousal/child benefit amounts, break-even analysis

**Combat-Related Special Compensation (CRSC)**
- Input: Combat-related disability conditions, disability rating, retirement status
- Business Logic: If VA disability rating ≥10% + combat-related injury → eligible
- Calculate: Offset between VA disability + retirement pay
- Output: Combined CRSC benefit amount, monthly payment scenarios

**Dependency and Indemnity Compensation (DIC)**
- Input: Veteran status (deceased), surviving spouse/children
- Calculate: Spousal DIC ($4,169/mo base) + child DIC ($1,432/mo per child)
- Output: Total monthly benefit, eligibility timeline

**Civil Service Retirement System (CSRS) Integration**
- Input: CSRS service years, high-3 CSRS salary, VA disability rating
- Business Logic: Military + CSRS years don't double-dip; reduction applies
- Calculate: Combined military + CSRS pension with offset rules
- Output: Military pension, CSRS pension, combined benefit, total monthly income

#### 2.2 Income Projections
**Scenario Planning**
- Inputs: Current age, retirement age, life expectancy, inflation rate (3% default)
- Calculate: Year-by-year income projection to age 90+
- Features:
  - Multiple scenario comparison (Conservative/Moderate/Aggressive)
  - Cost-of-living adjustments (COLA) 2% annual
  - Healthcare cost escalation
  - Inflation impact on purchasing power

**Breakeven Analysis**
- For SBP: When spousal benefit cost = cumulative spousal benefit received
- For CRSC: When combined offset benefit > VA disability pay alone
- Visualizations: Timeline showing break-even points

**Milestone Tracking**
- Age 62: Early retirement eligibility (military)
- Age 66-67: Full Social Security eligibility
- Age 70: Max Social Security benefit
- Age 59.5: IRA withdrawal without penalty
- Automatic alerts for upcoming milestone dates

#### 2.3 Comparison & Analysis
**Benefit Comparison Matrix**
- VA Disability vs. Retirement Pay selection
- Military Pension vs. CSRS vs. Combined
- SBP cost-benefit over spouse lifetime
- Show which option maximizes lifetime income

**Tax Impact**
- Military pension: Fully taxable
- VA disability: Tax-exempt
- Display estimated federal/state taxes
- Show net benefit after taxes

**Survivor Analysis**
- If veteran deceased: DIC eligibility calculator
- Timeline: When survivor benefits begin, amounts
- Compare DIC vs. spouse continuing SBP

### Section 3: Frontend Requirements (React Component)

#### 3.1 Component Architecture
**DisabilityCalculator-Pattern Structure**
```
RetirementTool.tsx (Main Container)
├── Input Panels (Tabs or Collapsible)
│   ├── Basic Info (Age, Years Service, Rank, Branch)
│   ├── Military Service Details
│   ├── Disability Status
│   ├── Benefits Selection (VA/Military/CSRS)
│   └── Beneficiary Info (Spouse, Children)
├── Results Display
│   ├── Annual/Monthly Income Cards
│   ├── Comparison Matrix
│   ├── Timeline Visualization
│   └── Scenarios Panel
├── Analysis Sections (Expandable)
│   ├── Tax Impact Calculator
│   ├── Break-even Analysis
│   ├── Survivor Benefits
│   └── Detailed Calculation Steps
└── Export/Save Options
    ├── Download PDF Report
    ├── Save Scenario to Profile
    └── Print-Friendly View
```

**Input Validation**
- Age: 18-100 (numeric)
- Years of Service: 0-50 (numeric, ≥20 for retirement)
- Disability Rating: 0-100% (10% increments, dropdown)
- Rank: Dropdown (E-1 through O-10 + warrant officer)
- Beneficiary Count: 0-10 (numeric)
- Coverage Percentage: 0%, 55%, 75% (SBP only)

**Dynamic Visibility**
- Show CSRS fields only if user selects CSRS option
- Show SBP fields only if user has dependents
- Show DIC fields only if scenario = veteran deceased
- Show CRSC fields if disability rating ≥10% + combat flag checked

**Real-time Calculation**
- On ANY input change: API call to backend
- Show loading spinner during calculation
- Display results immediately on return
- Error messages for invalid inputs with recovery suggestions

#### 3.2 Results Display (Professional Cards)
**Primary Metrics (3-column layout, responsive)**
1. **Monthly Benefit**
   - Main value: Large font (3rem), blue accent
   - Subtext: "Total Monthly Income"
   - Includes: Pension + SBP cost subtracted + VA disability combined

2. **Annual Income**
   - Value: Monthly × 12
   - Subtext: "Before Taxes"
   - Shows annual total with COLA projection

3. **Lifetime Value**
   - Value: Projection to age 90
   - Subtext: "Present Value"
   - Toggle: Show current dollars vs. inflated dollars

**Secondary Metrics (2-column)**
- SBP Cost: -$X/month (if applicable)
- Tax Impact: Estimated federal taxes owed
- Break-even Date: When SBP investment recovered

#### 3.3 Comparison Matrix
**Table Structure**
| Scenario | Monthly | Annual | Lifetime | Survivor | Tax Impact |
|----------|---------|--------|----------|----------|-----------|
| VA Only | $X | $Y | $Z | $0 | $Tax |
| Military Pension | $X | $Y | $Z | $Y (DIC) | $Tax |
| Military + SBP | $X | $Y | $Z | $Y+SBP | $Tax |

**Interactive Features**
- Click row to expand details
- Highlight recommended scenario (max lifetime income)
- Color-code: Green = best for survivor, Blue = best for individual
- Toggle: Show after-tax values

#### 3.4 Visualization Options
**Timeline Chart**
- X-axis: Age (current to 100)
- Y-axis: Monthly benefit amount
- Multiple lines: Different scenarios overlaid
- Milestones marked: Age 62, 66, 70, 80
- Tooltip on hover: Show exact values

**Scenario Comparison**
- 3 bars side-by-side: Conservative/Moderate/Aggressive
- Stacked sections: Pension + SBP + VA disability colors
- Labels: Dollar amounts, percentages

#### 3.5 Expandable Sections
**Calculation Details**
- Step-by-step breakdown of High-3 calculation
- Year-by-year COLA adjustments shown
- Offset calculations for CSRS/CRSC
- Surviving spouse/child benefit calculations
- Tax computation methodology

**Notes/Explanations**
- SBP break-even age
- Why certain scenarios recommended
- Tax filing implications
- When to apply (DFAS contacts)
- Links to official VA/DoD resources

#### 3.6 UX Patterns
- **Empty State**: "Enter your service details to calculate benefits"
- **Loading State**: Spinner with "Calculating your retirement benefits..."
- **Error State**: Clear message + suggested fix (e.g., "Years of Service must be ≥20 for military pension")
- **Success State**: Smooth animation on results load
- **Mobile**: Single-column layout, dropdowns instead of tabs, stack cards vertically

### Section 4: Backend Requirements (FastAPI)

#### 4.1 Core Endpoints

**POST /api/retirement/calculate**
- Request Schema:
  ```json
  {
    "current_age": int (18-100),
    "years_of_service": int (0-50),
    "military_rank": string (E-1 to O-10),
    "service_branch": string (Army|Navy|Air Force|Marines|Coast Guard|Space Force),
    "high_3_salary": float (required for accurate calculation),
    "disability_rating": int (0-100, 10% increments),
    "is_combat_related": boolean,
    "has_crsc_eligible_condition": boolean,
    "retirement_type": string (military|csrs|blended),
    "csrs_years": int (0, if not applicable),
    "csrs_high_3": float (0, if not applicable),
    "sbp_selected": boolean,
    "sbp_coverage_percentage": int (0|55|75),
    "has_dependent_spouse": boolean,
    "num_dependent_children": int (0-10),
    "beneficiary_on_sgli": boolean,
    "scenario_type": string (conservative|moderate|aggressive|deceased_veteran),
    "cost_of_living_adjustment": float (0.02 default),
    "inflation_rate": float (0.03 default),
    "life_expectancy": int (90 default)
  }
  ```
- Response Schema:
  ```json
  {
    "monthly_benefit": float,
    "annual_benefit": float,
    "lifetime_value": float (to age 90, present value),
    "sbp_monthly_cost": float,
    "tax_estimated_annual": float,
    "net_monthly": float (after SBP/taxes),
    "scenarios": [
      {
        "name": "Military Pension Only",
        "monthly": float,
        "annual": float,
        "lifetime": float,
        "sbp_cost": float,
        "tax": float,
        "recommended": boolean
      }
    ],
    "breakeven_analysis": {
      "sbp_breakeven_age": int,
      "sbp_breakeven_years": int,
      "crsc_benefit_vs_va": float
    },
    "survivor_benefits": {
      "spouse_dic_monthly": float,
      "child_dic_monthly": float,
      "sbp_benefit_spouse": float,
      "total_survivor_monthly": float
    },
    "milestones": [
      {
        "age": int,
        "event": string,
        "benefit_change": float,
        "description": string
      }
    ],
    "steps": [string],
    "notes": [string],
    "disclaimer": string
  }
  ```

**GET /api/retirement/help**
- Returns documentation, links to official resources, contact info for DFAS

**POST /api/retirement/scenarios**
- Request: Base calculation + array of scenario overrides
- Response: Multiple scenarios for comparison

**POST /api/retirement/export-pdf**
- Request: Calculation result + format preferences
- Response: PDF binary stream for download

#### 4.2 Calculation Engine (retirement_calculator.py)

**RetirementCalculator Class**
```python
class RetirementCalculator:
    def calculate_military_pension(self, rank: str, years: int, high_3: float) -> float:
        """High-3 military pension formula: High-3 × 2.5% × years"""

    def calculate_sbp_cost(self, pension: float, coverage: int) -> float:
        """SBP cost: pension × coverage% × 6.5%"""

    def calculate_survivor_dic(self, deceased: bool, dependents: int) -> float:
        """DIC calculation for surviving spouse/children"""

    def calculate_crsc_benefit(self, disability_rating: int, is_combat: bool) -> float:
        """CRSC offset if eligible (rating ≥10% + combat)"""

    def calculate_csrs_offset(self, military: float, csrs: float, csrs_years: int) -> dict:
        """Apply offset rules for combined CSRS + military pension"""

    def apply_cola(self, base_amount: float, years: int, rate: float) -> float:
        """Apply COLA escalation"""

    def project_to_age(self, annual_amount: float, current_age: int,
                       target_age: int, cola_rate: float) -> dict:
        """Year-by-year projection with COLA"""

    def breakeven_analysis(self, sbp_cost: float, survivor_benefit: float) -> int:
        """Calculate age when SBP cost equals survivor benefit"""

    def estimate_taxes(self, pension: float, va_disability: float) -> float:
        """Estimate federal/state taxes (pension taxable, disability not)"""

    def generate_scenarios(self, base_params: dict) -> list[dict]:
        """Generate Conservative/Moderate/Aggressive scenarios"""

    def calculate_full_retirement(self, params: dict) -> dict:
        """Main orchestrator method"""
```

**Validation Functions**
```python
def validate_rank(rank: str) -> bool:
    """Verify valid military rank"""

def validate_disability_rating(rating: int) -> bool:
    """0-100, increments of 10"""

def validate_years_of_service(years: int, retirement_type: str) -> bool:
    """20+ for military pension, 5+ for CSRS"""

def validate_high_3_salary(salary: float, rank: str) -> bool:
    """Basic sanity check against DoD pay scales"""
```

**Data Classes**
```python
@dataclass
class RetirementScenario:
    name: str
    monthly_benefit: float
    annual_benefit: float
    lifetime_value: float
    sbp_cost: float
    sbp_benefit_spouse: float
    dic_benefit: float
    tax_annual: float
    net_monthly: float
    recommended: bool
    reason: str

@dataclass
class BenefitMilestone:
    age: int
    event: str  # "Early Retirement", "Full Social Security", etc.
    benefit_change: float
    description: str

@dataclass
class BreakEvenAnalysis:
    sbp_breakeven_age: int
    sbp_breakeven_years: int
    crsc_benefit_vs_va: float
    explanation: str
```

#### 4.3 Key Business Logic

**Military Pension Formula**
```
Pension = High-3 Average Salary × 2.5% × Years of Service
Minimum: 20 years = 50% of High-3
Maximum: 30+ years = 75% of High-3
```

**SBP Calculation**
```
Monthly Cost = Covered Amount × Coverage% × 6.5%
Coverage Options:
  - Veteran Only: 0% (no SBP)
  - Spouse+Children: 55% of pension
  - Family: 75% of pension

Survivor Benefit = Pension × Coverage%
```

**CRSC Eligibility**
```
IF disability_rating >= 10% AND is_combat_related:
    CRSC Amount = (VA Disability × percentage) - Offset Rules

Veteran receives HIGHER of:
  - Military Pension alone, OR
  - Military Pension + CRSC offset
```

**CSRS/Military Blended**
```
Military Pension = Calculated above
CSRS Pension = High-3 CSRS × 1.7% × CSRS Years

Total = Military Pension + CSRS Pension
(No double-dipping; reduction applies to avoid overpayment)
```

**DIC (Survivor Benefits)**
```
IF veteran deceased:
    Spouse DIC = $4,169/month (as of 2024)
    Child DIC = $1,432/month per child (as of 2024)
    Total = Spouse + (num_children × child_amount)

INDICES: Update annually per VA COLA schedule
```

**Tax Calculation**
```
Taxable Income:
  - Military Pension: 100% taxable
  - CSRS Pension: 100% taxable

Tax-Exempt:
  - VA Disability: $0 tax
  - SBP Cost: Deducted pre-tax
  - DIC: $0 tax

Estimate: Use 2024 federal tax brackets + state taxes
```

### Section 5: VA Retirement Math (Official Reference)

**High-3 Definition**
- Average of 36 highest-paid months (basic pay + allowances, excluding bonuses)
- Taken during any point in service
- Used only for military retirement, NOT disability

**Retired Pay Entitlement**
- 20 years: 50% of High-3
- 21 years: 52.5% of High-3
- 30 years: 75% of High-3
- Formula: High-3 × 2.5% × Years of Service

**COLA Adjustments**
- Applied annually, typically each December
- 2024 COLA: 3.2% increase
- Affects pension + SBP benefits (not DIC)

**Survivor Benefit Plan (SBP)**
- Converts to income for survivors upon veteran death
- Cost taken from pension payment
- Pre-tax deduction (reduces taxable income)
- Cannot be canceled after retirement
- Best for: Young veterans with dependents

**Combat-Related Special Compensation (CRSC)**
- Pays offset between VA disability + military pension
- Allows "double-dip" for combat-related conditions
- Eligibility: VA rating ≥10% + combat-related injury
- Cannot receive both VA disability + military pension equally; CRSC bridges gap

**Dependency and Indemnity Compensation (DIC)**
- Tax-free benefit for survivors of deceased veterans
- Spouse receives $4,169/month (2024)
- Each child: $1,432/month to age 23 (2024)
- Updated annually per VA COLA
- Non-reduced (unlike SBP)

### Section 6: Testing Requirements

**Unit Tests (backend/tests/test_retirement_calculator.py)**
- High-3 calculation accuracy
- Military pension formulas (20-50 years)
- SBP cost calculations (all coverage options)
- CRSC eligibility logic
- CSRS blended pension
- DIC survivor benefits
- COLA application
- Tax estimation
- Break-even analysis
- Edge cases: 20 years exactly, 50+ years, rank changes

**Integration Tests (backend/tests/test_retirement_endpoint.py)**
- POST /api/retirement/calculate endpoint
- All input validations
- Error responses (400 for invalid data)
- Scenario generation
- Response schema completeness
- Complex scenarios (CSRS + CRSC + SBP)

**Component Tests (frontend/src/components/RetirementTool.test.tsx)**
- Component rendering (input fields, results, tabs)
- Input validation (age, years, rank validation)
- API integration (calls made, results displayed)
- Real-time recalculation
- Scenario comparison
- Expandable sections
- Mobile responsiveness
- Accessibility (keyboard navigation, screen reader)

**Real-World Test Scenarios**
1. **Enlisted E-7 (20 years)**: $50k High-3 → $25k/year pension
2. **Officer O-4 (30 years)**: $100k High-3 → $75k/year pension
3. **CSRS Blended**: 20-year military + 10-year CSRS
4. **CRSC Eligible**: 50% disability rating + combat injury
5. **SBP with Dependents**: Young veteran with spouse + 2 children
6. **Survivor Scenario**: Deceased veteran, surviving spouse + 3 children

### Section 7: UX & Accessibility

**Keyboard Navigation**
- Tab through all inputs
- Enter to submit calculation
- Arrow keys in dropdowns
- Space/Enter to expand sections

**Screen Reader Support**
- All inputs have associated labels
- Results cards have semantic structure (headings, lists)
- Expandable sections use role="region"
- Error messages announced with aria-live="polite"

**Color & Contrast**
- WCAG AA standard (4.5:1 contrast minimum)
- Blue primary (#3b82f6), green accesses (#10b981), red errors (#ef4444)
- No color-only differentiation (use icons + color)

**Mobile Responsive**
- Single-column layout at 640px and below
- Touch-friendly: Buttons ≥44px
- Dropdowns instead of multi-select
- Collapsible sections instead of tabs

**Veteran-Friendly Language**
- "Survivor Benefits" not "Dependent Death Benefits"
- "Retirement Pay" not "Pension" (clearer for vets)
- Explain CRSC/DIC/CSRS acronyms on first use
- Military rank abbreviations acceptable (E-7, O-4)

### Section 8: Primary Objective

**Deliverable**: A professional, accurate, veteran-centric Retirement Planning Tool that accurately calculates VA military pension, SBP, CRSC, DIC, CSRS benefits with confidence-inspiring accuracy, comprehensive scenario planning, and financial clarity for veterans approaching or in retirement.

**Success Criteria**:
✅ Calculations match official VA/DoD formulas (verified against tables)
✅ SBP break-even analysis accurate to nearest month
✅ CRSC eligibility logic matches VA official guidance
✅ All scenarios testable with real military service data
✅ Survivor benefits reflect current (2024) DIC amounts
✅ UX simple enough for non-technical veterans
✅ Accessible to disabled veterans (WCAG AA)
✅ 40+ comprehensive tests covering all logic
✅ Professional styling with veteran-centric tone
✅ Complete documentation with examples

---

## Implementation Phases

### Phase 1: Core Calculation Engine (2-3 hours)
- [ ] RetirementCalculator class with all methods
- [ ] Pydantic V2 schemas for validation
- [ ] 25+ unit tests verifying VA math

### Phase 2: Backend Integration (1-2 hours)
- [ ] FastAPI endpoints (POST /calculate, GET /help)
- [ ] Error handling for invalid inputs
- [ ] 15+ integration tests

### Phase 3: Frontend Component (2-3 hours)
- [ ] RetirementTool React component (350+ lines)
- [ ] Professional CSS styling (600+ lines)
- [ ] Input validation and real-time calculation

### Phase 4: Testing & Documentation (1-2 hours)
- [ ] 15+ component tests
- [ ] Complete reference documentation
- [ ] Implementation summary with examples

**Total Estimated Effort**: 6-10 hours
**Deadline**: Same session completion (following Disability Calculator pattern)

---

## Reference Materials

- [VA Combined Ratings Formula](https://www.va.gov/disability/static/68a4a2c4/rating-combined.pdf)
- [Military Pay Calculator](https://militarypay.defense.gov/)
- [DFAS Retirement Calculator](https://www.dfas.mil/)
- [VA DIC Rates (2024)](https://www.va.gov/disability/rates/)
- [Survivor Benefit Plan](https://militarytimes.com/pay-benefits/military-benefits/retirement/sbp/)
- [CRSC Eligibility Guide](https://www.militarybenefits.info/combat-related-special-compensation/)

---

**Status**: Ready for implementation
**Pattern**: Following Disability Calculator architecture (proven, tested, documented)
**Quality**: Same standards as Disability Tool (40+ tests, accessibility, professional UX)

