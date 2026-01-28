# React Component Specification - Retirement Tool

## Component File: `frontend/src/components/RetirementTool.tsx`

### File Structure
```
frontend/src/components/
├── RetirementTool.tsx          (Main component, 450+ lines)
├── RetirementTool.css          (Styling, 700+ lines)
├── RetirementTool.test.tsx     (Tests, 350+ lines)
└── subcomponents/ (optional)
    ├── RetirementInputPanel.tsx
    ├── RetirementResults.tsx
    └── RetirementComparison.tsx
```

---

## Component Specification: RetirementTool.tsx

### Imports & Dependencies
```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RetirementTool.css';

// Types
interface RetirementInputs {
  current_age: number;
  years_of_service: number;
  military_rank: string;
  service_branch: string;
  high_3_salary: number;
  disability_rating: number;
  is_combat_related: boolean;
  has_crsc_eligible_condition: boolean;
  retirement_type: string;
  csrs_years: number;
  csrs_high_3: number;
  sbp_selected: boolean;
  sbp_coverage_percentage: number;
  has_dependent_spouse: boolean;
  num_dependent_children: number;
  beneficiary_on_sgli: boolean;
  scenario_type: string;
  cost_of_living_adjustment: number;
  inflation_rate: number;
  life_expectancy: number;
}

interface RetirementScenario {
  name: string;
  monthly_benefit: number;
  annual_benefit: number;
  lifetime_value: number;
  sbp_cost: number;
  sbp_benefit_spouse: number;
  dic_benefit: number;
  tax_annual: number;
  net_monthly: number;
  recommended: boolean;
  reason: string;
}

interface RetirementResults {
  monthly_benefit: number;
  annual_benefit: number;
  lifetime_value: number;
  sbp_monthly_cost: number;
  tax_estimated_annual: number;
  net_monthly: number;
  scenarios: RetirementScenario[];
  breakeven_analysis: {
    sbp_breakeven_age: number;
    sbp_breakeven_years: number;
    crsc_benefit_vs_va: number;
  };
  survivor_benefits: {
    spouse_dic_monthly: number;
    child_dic_monthly: number;
    sbp_benefit_spouse: number;
    total_survivor_monthly: number;
  };
  milestones: Array<{
    age: number;
    event: string;
    benefit_change: number;
    description: string;
  }>;
  steps: string[];
  notes: string[];
  disclaimer: string;
}
```

---

### Component Structure

#### State Variables
```typescript
const [inputs, setInputs] = useState<RetirementInputs>({
  current_age: 40,
  years_of_service: 20,
  military_rank: 'E-7',
  service_branch: 'Army',
  high_3_salary: 50000,
  disability_rating: 0,
  is_combat_related: false,
  has_crsc_eligible_condition: false,
  retirement_type: 'military',
  csrs_years: 0,
  csrs_high_3: 0,
  sbp_selected: false,
  sbp_coverage_percentage: 0,
  has_dependent_spouse: false,
  num_dependent_children: 0,
  beneficiary_on_sgli: false,
  scenario_type: 'moderate',
  cost_of_living_adjustment: 0.02,
  inflation_rate: 0.03,
  life_expectancy: 90,
});

const [results, setResults] = useState<RetirementResults | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>('');
const [expandedSections, setExpandedSections] = useState({
  calculationDetails: false,
  scenarioComparison: false,
  survivorBenefits: false,
  taxImpact: false,
  milestones: false,
});
const [activeTab, setActiveTab] = useState<'basic' | 'military' | 'disability' | 'sbp' | 'beneficiary'>('basic');
```

---

### Key Functions

#### Input Handling
```typescript
const handleInputChange = (field: keyof RetirementInputs, value: any) => {
  setInputs(prev => ({
    ...prev,
    [field]: value
  }));
  // Trigger recalculation when input changes
  triggerCalculation({
    ...inputs,
    [field]: value
  });
};

const handleTabChange = (tab: 'basic' | 'military' | 'disability' | 'sbp' | 'beneficiary') => {
  setActiveTab(tab);
};

const toggleSection = (section: keyof typeof expandedSections) => {
  setExpandedSections(prev => ({
    ...prev,
    [section]: !prev[section]
  }));
};
```

#### API Integration
```typescript
const triggerCalculation = async (currentInputs: RetirementInputs) => {
  // Validation before API call
  const validationError = validateInputs(currentInputs);
  if (validationError) {
    setError(validationError);
    setResults(null);
    return;
  }

  setLoading(true);
  setError('');

  try {
    const response = await axios.post(
      `${process.env.VITE_API_URL}/api/retirement/calculate`,
      currentInputs,
      { timeout: 5000 }
    );
    setResults(response.data);
  } catch (err: any) {
    const errorMsg = err.response?.data?.detail || 'Failed to calculate retirement benefits. Please check your inputs.';
    setError(errorMsg);
    setResults(null);
  } finally {
    setLoading(false);
  }
};

const validateInputs = (data: RetirementInputs): string => {
  if (data.current_age < 18 || data.current_age > 100) {
    return 'Age must be between 18 and 100';
  }
  if (data.years_of_service < 0 || data.years_of_service > 50) {
    return 'Years of service must be between 0 and 50';
  }
  if (data.high_3_salary < 10000) {
    return 'High-3 salary seems low (minimum $10,000). Please verify.';
  }
  if (data.retirement_type === 'military' && data.years_of_service < 20) {
    return 'Military pension requires 20+ years of service';
  }
  if (data.sbp_selected && !data.has_dependent_spouse && data.num_dependent_children === 0) {
    return 'SBP requires at least one dependent (spouse or child)';
  }
  if (data.disability_rating % 10 !== 0) {
    return 'Disability rating must be in 10% increments (0%, 10%, 20%, etc.)';
  }
  return '';
};
```

---

### Render Structure

```typescript
return (
  <div className="retirement-tool-container">
    {/* Header */}
    <div className="retirement-header">
      <h1>Military Retirement Benefits Calculator</h1>
      <p>Accurate calculations for VA pension, SBP, CRSC, and survivor benefits</p>
    </div>

    {/* Error Display */}
    {error && (
      <div className="error-message" role="alert">
        <span>⚠️</span>
        <div>
          <strong>Input Error</strong>
          <p>{error}</p>
        </div>
      </div>
    )}

    {/* Loading Spinner */}
    {loading && (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Calculating your retirement benefits...</p>
      </div>
    )}

    {/* Main Content Grid */}
    <div className="retirement-grid">
      {/* Left: Input Panel */}
      <div className="retirement-inputs">
        <div className="input-tabs">
          <button
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => handleTabChange('basic')}
          >
            Basic Info
          </button>
          <button
            className={activeTab === 'military' ? 'active' : ''}
            onClick={() => handleTabChange('military')}
          >
            Military Service
          </button>
          <button
            className={activeTab === 'disability' ? 'active' : ''}
            onClick={() => handleTabChange('disability')}
          >
            Disability & CRSC
          </button>
          <button
            className={activeTab === 'sbp' ? 'active' : ''}
            onClick={() => handleTabChange('sbp')}
          >
            SBP & Benefits
          </button>
          <button
            className={activeTab === 'beneficiary' ? 'active' : ''}
            onClick={() => handleTabChange('beneficiary')}
          >
            Dependents
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'basic' && <BasicInfoTab inputs={inputs} handleChange={handleInputChange} />}
        {activeTab === 'military' && <MilitaryServiceTab inputs={inputs} handleChange={handleInputChange} />}
        {activeTab === 'disability' && <DisabilityTab inputs={inputs} handleChange={handleInputChange} />}
        {activeTab === 'sbp' && <SBPTab inputs={inputs} handleChange={handleInputChange} />}
        {activeTab === 'beneficiary' && <BeneficiaryTab inputs={inputs} handleChange={handleInputChange} />}
      </div>

      {/* Right: Results Panel */}
      <div className="retirement-results">
        {!results ? (
          <div className="empty-state">
            <p>📋 Enter your service details to calculate benefits</p>
          </div>
        ) : (
          <>
            {/* Primary Metrics */}
            <div className="metrics-grid">
              <MetricCard
                title="Monthly Benefit"
                value={`$${results.monthly_benefit.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                subtext="Total Monthly Income"
                accent="primary"
              />
              <MetricCard
                title="Annual Income"
                value={`$${results.annual_benefit.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                subtext="Before Taxes"
                accent="secondary"
              />
              <MetricCard
                title="Lifetime Value"
                value={`$${results.lifetime_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                subtext={`To Age ${inputs.life_expectancy}`}
                accent="tertiary"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="secondary-metrics">
              {results.sbp_monthly_cost > 0 && (
                <div className="metric-item">
                  <strong>SBP Monthly Cost:</strong> -${results.sbp_monthly_cost.toFixed(2)}
                </div>
              )}
              <div className="metric-item">
                <strong>Estimated Annual Taxes:</strong> ${results.tax_estimated_annual.toFixed(2)}
              </div>
              <div className="metric-item">
                <strong>Net Monthly (After SBP/Tax):</strong> ${results.net_monthly.toFixed(2)}
              </div>
            </div>

            {/* Expandable Sections */}
            <ExpandableSection
              title="Scenario Comparison"
              isExpanded={expandedSections.scenarioComparison}
              onToggle={() => toggleSection('scenarioComparison')}
            >
              <ScenarioComparisonTable scenarios={results.scenarios} />
            </ExpandableSection>

            <ExpandableSection
              title="Survivor Benefits"
              isExpanded={expandedSections.survivorBenefits}
              onToggle={() => toggleSection('survivorBenefits')}
            >
              <SurvivorBenefitsPanel benefits={results.survivor_benefits} />
            </ExpandableSection>

            <ExpandableSection
              title="Break-Even Analysis"
              isExpanded={expandedSections.breakEven}
              onToggle={() => toggleSection('breakEven')}
            >
              <BreakEvenPanel analysis={results.breakeven_analysis} />
            </ExpandableSection>

            <ExpandableSection
              title="▶ Calculation Details"
              isExpanded={expandedSections.calculationDetails}
              onToggle={() => toggleSection('calculationDetails')}
            >
              <CalculationDetailsPanel steps={results.steps} notes={results.notes} />
            </ExpandableSection>

            {/* Milestones */}
            <div className="milestones-section">
              <h3>📍 Benefit Milestones</h3>
              <div className="milestones-list">
                {results.milestones.map((milestone, idx) => (
                  <div key={idx} className="milestone-item">
                    <div className="milestone-age">Age {milestone.age}</div>
                    <div className="milestone-event">{milestone.event}</div>
                    <div className="milestone-change">
                      ${milestone.benefit_change > 0 ? '+' : ''}${milestone.benefit_change.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {results.notes.length > 0 && (
              <div className="notes-section">
                <h4>📌 Important Notes</h4>
                <ul>
                  {results.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="disclaimer">
              <p>{results.disclaimer}</p>
            </div>

            {/* Export Options */}
            <div className="export-options">
              <button className="btn-export" onClick={() => exportToPDF(results)}>
                📥 Download PDF Report
              </button>
              <button className="btn-export" onClick={() => saveToDB(results)}>
                💾 Save to Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
```

---

### Sub-Components (In Same File)

#### BasicInfoTab Component
```typescript
const BasicInfoTab: React.FC<{
  inputs: RetirementInputs;
  handleChange: (field: keyof RetirementInputs, value: any) => void;
}> = ({ inputs, handleChange }) => (
  <div className="input-section">
    <label>Current Age</label>
    <input
      type="number"
      min={18}
      max={100}
      value={inputs.current_age}
      onChange={(e) => handleChange('current_age', parseInt(e.target.value))}
      aria-label="Current Age"
    />

    <label>Service Branch</label>
    <select
      value={inputs.service_branch}
      onChange={(e) => handleChange('service_branch', e.target.value)}
      aria-label="Service Branch"
    >
      <option value="">Select branch...</option>
      <option value="Army">Army</option>
      <option value="Navy">Navy</option>
      <option value="Air Force">Air Force</option>
      <option value="Marines">Marines</option>
      <option value="Coast Guard">Coast Guard</option>
      <option value="Space Force">Space Force</option>
    </select>

    <label>Scenario Type</label>
    <select
      value={inputs.scenario_type}
      onChange={(e) => handleChange('scenario_type', e.target.value)}
      aria-label="Scenario Type"
    >
      <option value="conservative">Conservative (3% growth)</option>
      <option value="moderate">Moderate (5% growth)</option>
      <option value="aggressive">Aggressive (7% growth)</option>
      <option value="deceased_veteran">Survivor Scenario (Deceased Veteran)</option>
    </select>
  </div>
);
```

#### MilitaryServiceTab Component
```typescript
const MilitaryServiceTab: React.FC<{
  inputs: RetirementInputs;
  handleChange: (field: keyof RetirementInputs, value: any) => void;
}> = ({ inputs, handleChange }) => (
  <div className="input-section">
    <label>Military Rank</label>
    <select
      value={inputs.military_rank}
      onChange={(e) => handleChange('military_rank', e.target.value)}
      aria-label="Military Rank"
    >
      <option value="">Select rank...</option>
      <optgroup label="Enlisted">
        <option value="E-1">E-1 (Private/Seaman)</option>
        <option value="E-4">E-4 (Specialist/Petty Officer 3rd)</option>
        <option value="E-7">E-7 (Sergeant First Class/Chief Petty Officer)</option>
        <option value="E-9">E-9 (Master Sergeant/Master Chief)</option>
      </optgroup>
      <optgroup label="Officer">
        <option value="O-3">O-3 (Captain/Lieutenant)</option>
        <option value="O-4">O-4 (Major/Commander)</option>
        <option value="O-6">O-6 (Colonel/Captain)</option>
      </optgroup>
    </select>

    <label>Years of Service</label>
    <input
      type="number"
      min={0}
      max={50}
      value={inputs.years_of_service}
      onChange={(e) => handleChange('years_of_service', parseInt(e.target.value))}
      aria-label="Years of Service"
    />
    {inputs.years_of_service < 20 && inputs.retirement_type === 'military' && (
      <p className="warning">⚠️ Military pension requires 20+ years of service</p>
    )}

    <label>High-3 Average Salary (Last 3 Years)</label>
    <input
      type="number"
      min={10000}
      step={1000}
      value={inputs.high_3_salary}
      onChange={(e) => handleChange('high_3_salary', parseFloat(e.target.value))}
      aria-label="High-3 Salary"
    />
    <small>Average of highest-paid 36 months (basic pay + BAH + BAS)</small>

    <label>Retirement Type</label>
    <div className="radio-group">
      <label>
        <input
          type="radio"
          value="military"
          checked={inputs.retirement_type === 'military'}
          onChange={(e) => handleChange('retirement_type', e.target.value)}
        />
        Military Pension Only
      </label>
      <label>
        <input
          type="radio"
          value="csrs"
          checked={inputs.retirement_type === 'csrs'}
          onChange={(e) => handleChange('retirement_type', e.target.value)}
        />
        CSRS Civilian Service
      </label>
      <label>
        <input
          type="radio"
          value="blended"
          checked={inputs.retirement_type === 'blended'}
          onChange={(e) => handleChange('retirement_type', e.target.value)}
        />
        Military + CSRS Blended
      </label>
    </div>

    {inputs.retirement_type !== 'military' && (
      <>
        <label>CSRS Years of Service</label>
        <input
          type="number"
          min={0}
          max={50}
          value={inputs.csrs_years}
          onChange={(e) => handleChange('csrs_years', parseInt(e.target.value))}
          aria-label="CSRS Years"
        />

        <label>CSRS High-3 Salary</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={inputs.csrs_high_3}
          onChange={(e) => handleChange('csrs_high_3', parseFloat(e.target.value))}
          aria-label="CSRS High-3 Salary"
        />
      </>
    )}
  </div>
);
```

#### DisabilityTab Component
```typescript
const DisabilityTab: React.FC<{
  inputs: RetirementInputs;
  handleChange: (field: keyof RetirementInputs, value: any) => void;
}> = ({ inputs, handleChange }) => (
  <div className="input-section">
    <label>VA Disability Rating</label>
    <select
      value={inputs.disability_rating}
      onChange={(e) => handleChange('disability_rating', parseInt(e.target.value))}
      aria-label="VA Disability Rating"
    >
      <option value={0}>0% - No Disability</option>
      <option value={10}>10%</option>
      <option value={20}>20%</option>
      <option value={30}>30%</option>
      <option value={40}>40%</option>
      <option value={50}>50%</option>
      <option value={60}>60%</option>
      <option value={70}>70%</option>
      <option value={80}>80%</option>
      <option value={90}>90%</option>
      <option value={100}>100%</option>
    </select>

    <label>
      <input
        type="checkbox"
        checked={inputs.is_combat_related}
        onChange={(e) => handleChange('is_combat_related', e.target.checked)}
        aria-label="Combat-Related Injury"
      />
      Is disability combat-related?
    </label>

    {inputs.disability_rating >= 10 && inputs.is_combat_related && (
      <div className="info-box">
        ✓ You may be eligible for CRSC (Combat-Related Special Compensation)
      </div>
    )}

    <label>
      <input
        type="checkbox"
        checked={inputs.has_crsc_eligible_condition}
        onChange={(e) => handleChange('has_crsc_eligible_condition', e.target.checked)}
        aria-label="CRSC Eligible Condition"
        disabled={inputs.disability_rating < 10}
      />
      CRSC-Eligible Condition
    </label>

    <small>
      CRSC allows you to receive both military pension and VA disability combined.
      Only applies if disability rating ≥10% and is combat-related.
    </small>
  </div>
);
```

#### SBPTab Component
```typescript
const SBPTab: React.FC<{
  inputs: RetirementInputs;
  handleChange: (field: keyof RetirementInputs, value: any) => void;
}> = ({ inputs, handleChange }) => (
  <div className="input-section">
    <h3>Survivor Benefit Plan (SBP)</h3>

    <label>
      <input
        type="checkbox"
        checked={inputs.sbp_selected}
        onChange={(e) => handleChange('sbp_selected', e.target.checked)}
        aria-label="Elect SBP"
      />
      Elect Survivor Benefit Plan
    </label>

    {inputs.sbp_selected && (
      <>
        <label>Coverage Option</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value={0}
              checked={inputs.sbp_coverage_percentage === 0}
              onChange={(e) => handleChange('sbp_coverage_percentage', parseInt(e.target.value))}
            />
            Veteran Only (No SBP)
          </label>
          <label>
            <input
              type="radio"
              value={55}
              checked={inputs.sbp_coverage_percentage === 55}
              onChange={(e) => handleChange('sbp_coverage_percentage', parseInt(e.target.value))}
            />
            Spouse & Children (55% Coverage)
          </label>
          <label>
            <input
              type="radio"
              value={75}
              checked={inputs.sbp_coverage_percentage === 75}
              onChange={(e) => handleChange('sbp_coverage_percentage', parseInt(e.target.value))}
            />
            Family (75% Coverage)
          </label>
        </div>

        <div className="info-box">
          💡 SBP breaks even when survivor receives benefits equal to your cost.
          Best for young veterans with dependents.
        </div>
      </>
    )}
  </div>
);
```

#### BeneficiaryTab Component
```typescript
const BeneficiaryTab: React.FC<{
  inputs: RetirementInputs;
  handleChange: (field: keyof RetirementInputs, value: any) => void;
}> = ({ inputs, handleChange }) => (
  <div className="input-section">
    <h3>Dependents Information</h3>

    <label>
      <input
        type="checkbox"
        checked={inputs.has_dependent_spouse}
        onChange={(e) => handleChange('has_dependent_spouse', e.target.checked)}
        aria-label="Has Dependent Spouse"
      />
      Do you have a dependent spouse?
    </label>

    <label>Number of Dependent Children (under 23)</label>
    <input
      type="number"
      min={0}
      max={10}
      value={inputs.num_dependent_children}
      onChange={(e) => handleChange('num_dependent_children', parseInt(e.target.value))}
      aria-label="Number of Children"
    />

    <label>
      <input
        type="checkbox"
        checked={inputs.beneficiary_on_sgli}
        onChange={(e) => handleChange('beneficiary_on_sgli', e.target.checked)}
        aria-label="Beneficiary on SGLI"
      />
      Beneficiary on SGLI (Servicemembers Group Life Insurance)
    </label>

    <div className="info-box">
      📌 Dependents affect:
      - SBP coverage options (55% or 75%)
      - Survivor Benefit amounts
      - DIC calculations if you pass
    </div>
  </div>
);
```

---

### Helper Functions

#### MetricCard Component
```typescript
const MetricCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  accent: 'primary' | 'secondary' | 'tertiary';
}> = ({ title, value, subtext, accent }) => (
  <div className={`metric-card accent-${accent}`}>
    <div className="metric-value">{value}</div>
    <div className="metric-title">{title}</div>
    <div className="metric-subtext">{subtext}</div>
  </div>
);
```

#### ExpandableSection Component
```typescript
const ExpandableSection: React.FC<{
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isExpanded, onToggle, children }) => (
  <div className="expandable-section">
    <button
      className="expand-toggle"
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
      {title}
    </button>
    {isExpanded && (
      <div className="expand-content">
        {children}
      </div>
    )}
  </div>
);
```

#### ScenarioComparisonTable Component
```typescript
const ScenarioComparisonTable: React.FC<{
  scenarios: RetirementScenario[];
}> = ({ scenarios }) => (
  <div className="scenario-table-wrapper">
    <table className="scenario-table">
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Monthly</th>
          <th>Annual</th>
          <th>Lifetime</th>
          <th>SBP Cost</th>
          <th>Tax</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {scenarios.map((scenario, idx) => (
          <tr key={idx} className={scenario.recommended ? 'recommended' : ''}>
            <td><strong>{scenario.name}</strong></td>
            <td>${scenario.monthly_benefit.toFixed(2)}</td>
            <td>${scenario.annual_benefit.toFixed(0)}</td>
            <td>${scenario.lifetime_value.toFixed(0)}</td>
            <td>-${scenario.sbp_cost.toFixed(2)}</td>
            <td>${scenario.tax_annual.toFixed(2)}</td>
            <td>{scenario.recommended && <span className="badge">Recommended</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

---

### Styling Classes (RetirementTool.css)

```css
/* Container */
.retirement-tool-container {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.retirement-header {
  margin-bottom: 32px;
  text-align: center;
}

.retirement-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.retirement-header p {
  font-size: 1rem;
  color: #666;
}

/* Grid Layout */
.retirement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin: 32px 0;
}

@media (max-width: 1024px) {
  .retirement-grid {
    grid-template-columns: 1fr;
  }
}

/* Input Panel */
.retirement-inputs {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.input-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.input-tabs button {
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.input-tabs button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-section label {
  font-weight: 600;
  color: #333;
  margin-top: 8px;
}

.input-section input,
.input-section select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.3s ease;
}

.input-section input:focus,
.input-section select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.warning {
  color: #f59e0b;
  font-size: 0.875rem;
  padding: 8px 12px;
  background: #fffbeb;
  border-radius: 6px;
}

.info-box {
  padding: 12px 16px;
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e40af;
}

/* Results Panel */
.retirement-results {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
  color: #999;
  font-size: 1.125rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.metric-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border-left: 4px solid;
}

.metric-card.accent-primary {
  background: #dbeafe;
  border-left-color: #3b82f6;
}

.metric-card.accent-secondary {
  background: #f3e8ff;
  border-left-color: #a855f7;
}

.metric-card.accent-tertiary {
  background: #dcfce7;
  border-left-color: #10b981;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.metric-subtext {
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

/* Secondary Metrics */
.secondary-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.metric-item {
  font-size: 0.875rem;
  color: #333;
}

.metric-item strong {
  color: #000;
}

/* Expandable Sections */
.expandable-section {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.expand-toggle {
  width: 100%;
  padding: 16px;
  background: #f9fafb;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.3s ease;
}

.expand-toggle:hover {
  background: #f3f4f6;
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 0.875rem;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.expand-content {
  padding: 16px;
  animation: slideDown 0.3s ease;
}

/* Scenario Table */
.scenario-table-wrapper {
  overflow-x: auto;
}

.scenario-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.scenario-table th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

.scenario-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.scenario-table tr.recommended {
  background: #f0fdf4;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  background: #10b981;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Error Message */
.error-message {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  margin-bottom: 24px;
  color: #991b1b;
}

.error-message span {
  font-size: 1.25rem;
}

.error-message strong {
  color: #7f1d1d;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 1000;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .retirement-tool-container {
    padding: 16px;
  }

  .retirement-header h1 {
    font-size: 1.5rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .input-tabs {
    flex-wrap: wrap;
  }

  .input-tabs button {
    flex: 0 0 auto;
    font-size: 0.875rem;
    padding: 8px 12px;
  }
}
```

---

## Testing Structure (RetirementTool.test.tsx)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import RetirementTool from './RetirementTool';

jest.mock('axios');

describe('RetirementTool Component', () => {
  describe('Rendering', () => {
    test('renders component with title', () => {
      render(<RetirementTool />);
      expect(screen.getByText('Military Retirement Benefits Calculator')).toBeInTheDocument();
    });

    test('renders all input tabs', () => {
      render(<RetirementTool />);
      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Military Service')).toBeInTheDocument();
      expect(screen.getByText('Disability & CRSC')).toBeInTheDocument();
      expect(screen.getByText('SBP & Benefits')).toBeInTheDocument();
      expect(screen.getByText('Dependents')).toBeInTheDocument();
    });

    test('shows empty state initially', () => {
      render(<RetirementTool />);
      expect(screen.getByText(/Enter your service details/)).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('validates age range', async () => {
      render(<RetirementTool />);
      const ageInput = screen.getByLabelText('Current Age');

      await userEvent.clear(ageInput);
      await userEvent.type(ageInput, '150');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/Age must be between 18 and 100/)).toBeInTheDocument();
      });
    });

    test('validates military pension requires 20+ years', async () => {
      render(<RetirementTool />);
      // ... test validation
    });

    test('validates SBP requires dependents', async () => {
      render(<RetirementTool />);
      // ... test validation
    });
  });

  describe('API Integration', () => {
    test('calls /api/retirement/calculate on input change', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          monthly_benefit: 3500,
          annual_benefit: 42000,
          // ... mock response
        }
      });

      render(<RetirementTool />);
      // ... trigger input change and verify API call

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      });
    });

    test('displays results after successful calculation', async () => {
      // ... test results display
    });

    test('shows error message on API failure', async () => {
      (axios.post as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Invalid input' } }
      });

      render(<RetirementTool />);
      // ... trigger calculation

      await waitFor(() => {
        expect(screen.getByText(/Invalid input/)).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    test('displays primary metrics (monthly, annual, lifetime)', async () => {
      // ... test metric card rendering
    });

    test('displays scenario comparison table', async () => {
      // ... test scenario table
    });

    test('displays survivor benefits section', async () => {
      // ... test survivor section
    });
  });

  describe('Expandable Sections', () => {
    test('expandable sections hidden by default', () => {
      // ... test
    });

    test('expands section on click', async () => {
      // ... test
    });

    test('collapses section on second click', async () => {
      // ... test
    });
  });

  describe('Accessibility', () => {
    test('all inputs have associated labels', () => {
      render(<RetirementTool />);
      expect(screen.getByLabelText('Current Age')).toBeInTheDocument();
      expect(screen.getByLabelText('Service Branch')).toBeInTheDocument();
    });

    test('keyboard navigation works', async () => {
      // ... test tab through inputs
    });

    test('error messages announced to screen readers', async () => {
      // ... test aria-live
    });
  });

  describe('Mobile Responsive', () => {
    test('renders single column layout on mobile', () => {
      window.innerWidth = 500;
      render(<RetirementTool />);
      const grid = screen.getByRole('main').parentElement;
      expect(grid).toHaveStyle('grid-template-columns: 1fr');
    });
  });
});
```

---

## Integration with App

In `frontend/src/App.tsx`:
```typescript
import RetirementTool from './components/RetirementTool';

// In routing:
<Route path="/retirement" element={<RetirementTool />} />
```

---

## Type Definitions File

Create `frontend/src/types/retirement.ts`:
```typescript
export interface RetirementInputs {
  // ... all input types
}

export interface RetirementScenario {
  // ... scenario types
}

export interface RetirementResults {
  // ... result types
}
```

---

**Status**: Complete spec ready for implementation
**Estimated LOC**: 450+ component + 700+ CSS + 350+ tests = 1,500+ total lines
**Pattern**: Follows Disability Calculator architecture (proven, tested)
