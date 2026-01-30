# Disability Service Connection Wizard

## Overview

The Disability Service Connection Wizard is a comprehensive, multi-step guided experience that helps veterans build strategic VA disability claim strategies. It combines AI-powered insights, legal framework guidance, and practical claim-building tools.

## Architecture

### Component Structure

```
DisabilityWizard (Main Orchestrator)
├── WizardStepper (Progress UI)
├── StepServiceConnected (Step 1) ✅
├── StepAddConditions (Step 2) ✅
├── StepAISuggestions (Step 3) ✅
├── StepTheoryBuilder (Step 4) ✅
└── StepReview (Step 5) ✅
```

### Files Created

1. **Type Definitions** (`wizard.types.ts` - 450+ lines)
   - Comprehensive TypeScript interfaces
   - Service connection types, claim statuses, evidence types
   - Disability, AiEntitlementTheory, WizardState models
   - Export and questionnaire types

2. **Main Orchestrator** (`DisabilityWizard.tsx` - 315 lines)
   - 5-step wizard flow management
   - State management and persistence
   - Complexity auto-calculation
   - Integration with DisabilityContext

3. **UI Components**:
   - `WizardStepper.tsx` (120 lines) - Progress indicator with accessibility
   - `StepServiceConnected.tsx` (350 lines) - Confirm service-connected disabilities
   - `StepAddConditions.tsx` (450 lines) - Add current/planned/denied conditions
   - `StepAISuggestions.tsx` (400 lines) - AI secondary condition suggestions
   - `StepTheoryBuilder.tsx` (500 lines) - Generate theories of entitlement
   - `StepReview.tsx` (450 lines) - Review & export claim strategy

## Features

### Step 1: Service-Connected Disabilities
- Confirm existing service-connected conditions
- Add/edit/remove disabilities
- Rating management (0-100% in 10% increments)
- **Required** - Must have at least 1 to proceed

### Step 2: Add Conditions
- Add new conditions to file for
- Add previously denied conditions
- **Secondary Linking** - Link conditions to primary service-connected disabilities
- Service connection type selection (direct, secondary, aggravation, presumptive)
- Claim status tracking (planned, filed, denied)

### Step 3: AI Suggestions
- **AI-powered secondary condition discovery**
- Suggestions based on medical literature and VA approval patterns
- Commonality ratings (very-common, common, possible, rare)
- Medical basis explanations
- Accept/dismiss suggestions
- Mock data included (OpenAI integration ready)

### Step 4: Theory Builder
- **AI-generated theories of entitlement**
- Legal framework (38 CFR § 3.303, § 3.310, etc.)
- Medical nexus rationale
- Policy references (CFR, M21-1, case law)
- Recommended evidence with priorities
- Strength assessment (strong, moderate, weak)
- Challenges and opportunities analysis
- Mock theory generation (OpenAI integration ready)

### Step 5: Review & Export
- Comprehensive summary of all conditions
- **Professional recommendations** (VSO/Attorney based on complexity)
- **Complexity indicator** (simple/medium/complex)
- **Export to Markdown** (✅ functional)
- **Export to PDF** (placeholder - coming soon)
- **Save scenarios** - Multiple claim strategies with localStorage
- Linked condition visualization
- Effective date projections (integration point ready)

## Complexity Calculation

The wizard auto-calculates claim complexity based on:
- **Simple**: < 5 total conditions
- **Medium**: 5-10 conditions OR any denials OR secondary chains
- **Complex**: > 10 conditions OR > 2 denials OR long secondary chains

## Data Flow

```
DisabilityContext (Existing Data)
        ↓
DisabilityWizard (Initialize WizardState)
        ↓
Step Components (Local State + Callbacks)
        ↓
WizardState (Central State Management)
        ↓
Export / Save (Output)
```

## Integration Points

### 1. DisabilityContext
- Reads `serviceConnectedConditions` and `deniedConditions` on mount
- Converts to unified `Disability` format
- Maintains separate wizard state (does not write back to context by default)

### 2. Effective Date Calculator (Ready for Integration)
- `EffectiveDateProjection` type defined in wizard.types.ts
- Integration point in StepReview component
- Can show projected back pay for each condition

### 3. AI Services (Ready for Implementation)

**OpenAI Integration Points**:
```typescript
// Generate secondary suggestions
async function generateSecondarySuggestions(
  primaryCondition: Disability
): Promise<AiSuggestion[]>

// Generate theory of entitlement
async function generateTheory(
  condition: Disability,
  primaryConditions: Disability[]
): Promise<AiEntitlementTheory>
```

**Mock Data Included**:
- `StepAISuggestions.tsx` - Mock secondary condition suggestions
- `StepTheoryBuilder.tsx` - Mock theory generation with full structure

## User Requirements Implementation Status

### ✅ Completed

1. **Phase 1: Analysis** - Analyzed existing Claims page structure
2. **Phase 2: Data Model** - Comprehensive type system created
3. **Phase 4: Wizard Flow** - All 5 steps implemented
4. **Phase 7: Technical Requirements** - Component architecture complete

### ⏳ Partially Complete

3. **Phase 3: Secondary Linking**
   - ✅ Types support relationship tracking
   - ✅ UI for secondary linkage in StepAddConditions
   - ✅ AI suggestions for secondary conditions
   - ⏳ Backend integration for AI (mock data ready)

6. **Phase 6: Output & Export**
   - ✅ Markdown export functional
   - ⏳ PDF export (placeholder, needs library integration)
   - ✅ Save scenarios to localStorage

### ⏳ Pending

5. **Phase 5: Effective Date Integration** - Type system ready, connection needed
8. **Phase 8: Additional Recommendations** - VSO/Attorney logic implemented, needs tuning

## Professional Recommendation Logic

The wizard recommends professional assistance when:
- User has denied conditions (suggests attorney for appeals)
- Claim involves > 8 conditions (high complexity)
- Complex secondary condition chains
- TDIU candidacy indicated
- Multiple prior denials

## Export Formats

### Markdown Export (Functional)
- Complete claim strategy document
- All conditions with theories
- Policy references
- Recommended evidence
- Disclaimers

### PDF Export (Coming Soon)
Requires integration of PDF generation library:
- **Option 1**: jsPDF (client-side, lightweight)
- **Option 2**: pdfmake (client-side, more features)
- **Option 3**: Server-side generation (Node + Puppeteer)

## Local Storage Features

### Save Scenarios
- Save complete wizard state with custom name
- Load previous scenarios
- Compare different claim strategies
- Stored in browser localStorage

## Accessibility

All components include:
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Semantic HTML
- ✅ Color contrast compliance
- ✅ Screen reader support

## Styling

- **Tailwind CSS** for all styling
- **Responsive design** (mobile, tablet, desktop)
- **Gradient accents** for visual interest
- **Color coding** by condition type:
  - Green: Service-connected
  - Blue: Planned/current
  - Red: Denied
  - Purple: AI-generated

## Next Steps for Full Implementation

### 1. AI Integration (Priority: HIGH)

Create `src/services/aiService.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Or use backend proxy
});

export async function generateSecondarySuggestions(
  primaryCondition: Disability
): Promise<AiSuggestion[]> {
  const prompt = `
    You are an expert in VA disability claims. Given the service-connected
    condition "${primaryCondition.name}", identify 3-5 potential secondary
    conditions that are medically recognized and have established patterns
    of VA approval.

    For each suggestion, provide:
    - Condition name
    - Commonality (very-common, common, possible, rare)
    - Medical basis (2-3 sentences)
    - VA approval patterns
    - Confidence score (0-1)

    Format as JSON array.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateTheory(
  condition: Disability,
  primaryConditions: Disability[]
): Promise<AiEntitlementTheory> {
  // Similar implementation
}
```

### 2. PDF Export (Priority: MEDIUM)

Install library:
```bash
npm install jspdf jspdf-autotable
```

Create `src/services/exportService.ts`:
```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generatePDF(wizardState: WizardState): void {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('VA Disability Claim Strategy', 20, 20);

  // Add content sections
  // ... implementation details

  doc.save(`claim-strategy-${Date.now()}.pdf`);
}
```

### 3. Effective Date Integration (Priority: MEDIUM)

Update `StepReview.tsx`:
```typescript
import { calculateEffectiveDate } from '../utils/effectiveDateCalculator';

// For each condition
const effectiveDate = calculateEffectiveDate(condition);
// Display projected back pay
```

### 4. Backend API Endpoints (If Needed)

```typescript
// POST /api/wizard/save - Save wizard state to database
// GET /api/wizard/:id - Load saved wizard
// POST /api/ai/suggestions - Generate AI suggestions (server-side)
// POST /api/ai/theory - Generate theory (server-side)
// POST /api/export/pdf - Generate PDF server-side
```

### 5. Testing

Create test files:
- `DisabilityWizard.test.tsx` - Component rendering
- `wizard.types.test.ts` - Type validation
- `wizardState.test.ts` - State management logic
- `complexity.test.ts` - Complexity calculation
- Integration tests for full wizard flow

## Known Limitations

1. **AI Mock Data**: Currently using mock suggestions/theories - needs OpenAI integration
2. **PDF Export**: Placeholder only - needs library integration
3. **Effective Date**: Integration point exists but not connected
4. **Backend**: All state is client-side (localStorage) - no database persistence
5. **Secondary Chain Depth**: No limit on chain depth - may need validation

## Performance Considerations

- **Lazy Loading**: Consider code-splitting for step components
- **Debouncing**: AI API calls should be debounced
- **Caching**: Cache AI responses for same inputs
- **Pagination**: For users with many conditions (> 20)

## Security Notes

- **API Keys**: Never expose OpenAI API key in client code - use backend proxy
- **Data Privacy**: All PII stored in browser localStorage - educate users
- **HIPAA Compliance**: If handling actual medical records, consider compliance requirements

## Future Enhancements

1. **Multi-language Support** - Spanish, Tagalog for veteran populations
2. **Voice Input** - For veterans with physical disabilities
3. **Collaboration Mode** - Share with VSO/attorney
4. **Evidence Upload** - Attach medical records, nexus letters
5. **Timeline Visualization** - Service dates, onset dates, filing deadlines
6. **Rating Calculator Integration** - Project combined rating with new claims
7. **Appeals Support** - Specific guidance for BVA/Court appeals
8. **Mobile App** - React Native version

## Support Resources

- **VA Policy**: [M21-1 Adjudication Procedures Manual](https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/topic/554400000003559)
- **CFR Regulations**: [38 CFR Part 3](https://www.ecfr.gov/current/title-38/chapter-I/part-3)
- **VSO Locator**: [VA VSO Directory](https://www.va.gov/vso/)
- **Accredited Attorneys**: [VA Office of General Counsel](https://www.va.gov/ogc/apps/accreditation/index.asp)

## License

Copyright © 2025 rallyforge. All rights reserved.

---

**DISCLAIMER**: This wizard is educational software and does not provide legal advice. Veterans should consult with a Veterans Service Officer (VSO) or VA-accredited attorney before filing claims.

