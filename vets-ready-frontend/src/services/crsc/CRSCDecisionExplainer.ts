import {
  CRSCDecisionExplanation,
  CRSCComputationResult,
  CRSCEvidenceMappingResult,
  CRSCProfileData
} from '../../types/crscTypes';

interface DecisionExplanationInput {
  computation: CRSCComputationResult | null;
  evidenceMap: CRSCEvidenceMappingResult | null;
  profile: CRSCProfileData | null;
  knownOutcome?: 'approved' | 'partially_approved' | 'denied';
  outcomeReasons?: string[];
}

export function explainCRSC(input: DecisionExplanationInput): CRSCDecisionExplanation {
  const summary: string[] = [];
  const rationale: string[] = [];

  if (!input.profile?.retirementType) {
    return {
      summary: ['We need your retirement type to evaluate CRSC.'],
      eligibilityExplanation: 'No retirement type on file. CRSC requires retired pay eligibility.',
      combatRelatedExplanation: 'Combat-related conditions cannot be evaluated without retirement context.',
      paymentExplanation: 'CRSC payment depends on retired pay and VA waiver amounts.',
      evidenceStrength: 'LOW',
      recommendedNextSteps: ['Add your retirement type and VA waiver amount.']
    };
  }

  const calc = input.computation;
  const evidenceStrength = deriveEvidenceStrength(input.evidenceMap);

  if (calc) {
    summary.push(`You appear to have ${calc.combatRelatedPercentage}% in combat-related disabilities.`);
    summary.push(`CRSC payable is estimated at $${calc.crscFinalPayment.toFixed(2)} (subject to branch review).`);
    summary.push('Only combat-related disabilities were used in this estimate.');
  } else {
    summary.push('We could not calculate CRSC because combat-related flags are missing.');
  }

  if (input.knownOutcome === 'denied') {
    summary.push('Your branch decision shows a denial; review the reasons and evidence gaps below.');
  }

  const eligibilityExplanation = calc
    ? 'You may be eligible because you have combat-related disabilities and retired pay with a VA waiver.'
    : 'Eligibility cannot be confirmed without combat-related flags and VA waiver information.';

  const combatRelatedExplanation = buildCombatRelatedExplanation(input.evidenceMap);

  const paymentExplanation = calc
    ? `We combined only combat-related ratings using VA math to ${calc.combatRelatedPercentage}%. The payable amount is the lesser of your VA waiver and the VA compensation at that percentage.`
    : 'Payment could not be estimated. We need combat-related flags and VA waiver amount.';

  const recommendedNextSteps = buildNextSteps(input, evidenceStrength);

  return {
    summary,
    eligibilityExplanation,
    combatRelatedExplanation,
    paymentExplanation,
    evidenceStrength,
    recommendedNextSteps
  };
}

function deriveEvidenceStrength(evidenceMap: CRSCEvidenceMappingResult | null): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (!evidenceMap) return 'LOW';
  const confidences = evidenceMap.conditions.map(c => c.confidence);
  if (confidences.includes('LOW')) return 'LOW';
  if (confidences.includes('MEDIUM')) return 'MEDIUM';
  return confidences.length > 0 ? 'HIGH' : 'LOW';
}

function buildCombatRelatedExplanation(evidenceMap: CRSCEvidenceMappingResult | null): string {
  if (!evidenceMap) return 'Combat-related conditions were not identified. Add combat flags for each condition.';
  const parts = evidenceMap.conditions.map(c => {
    const category = c.combatCategory ? c.combatCategory.replace(/_/g, ' ') : 'not confirmed';
    return `${c.name}: ${category} (${c.confidence} evidence)`;
  });
  return parts.join('; ');
}

function buildNextSteps(
  input: DecisionExplanationInput,
  strength: 'LOW' | 'MEDIUM' | 'HIGH'
): string[] {
  const steps: string[] = [];

  if (!input.profile?.vaWaiver) {
    steps.push('Add your VA waiver amount so we can cap CRSC payable correctly.');
  }
  if (!input.profile?.retiredPay) {
    steps.push('Add your retired pay amount for accurate offset calculations.');
  }
  if (strength === 'LOW') {
    steps.push('Link evidence to each combat-related condition (STR entries, LOD, AAR, award citations).');
  }
  if (input.outcomeReasons && input.outcomeReasons.length > 0) {
    steps.push('Review the branch decision reasons and address each with evidence or clarification.');
  }
  if (steps.length === 0) {
    steps.push('Review your packet and submit supporting evidence for each combat-related condition.');
  }
  return steps;
}
