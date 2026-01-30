/**
 * AppealsEngine.ts
 * Analyzes VA rating decisions and generates appeal issue cards
 * Educational tool only - does NOT provide legal advice
 */

import { VeteranProfile } from '../contexts/VeteranProfileContext';

export interface AppealIssueCard {
  conditionName: string;
  currentStatus: 'granted' | 'denied';
  rating?: number;
  diagnosticCode?: string;
  effectiveDate?: string;
  vaReason: string;
  potentialConcerns: {
    ratingTooLow: boolean;
    ratingTooLowExplanation?: string;
    denialReasonType?: 'evidence' | 'nexus' | 'in-service-event' | 'aggravation' | 'other';
    effectiveDateConcern: boolean;
    effectiveDateExplanation?: string;
    missedSecondaryOrPresumptive: boolean;
    missedSecondaryExplanation?: string;
  };
  appealOptions: {
    hlr: AppealOption;
    supplemental: AppealOption;
    board: AppealOption;
  };
  evidenceSuggestions: string[];
}

export interface AppealOption {
  name: string;
  description: string;
  whenToUse: string;
  timeLimit: string;
  timeline: string;
}

export interface AppealsAnalysis {
  totalIssues: number;
  deniedConditions: number;
  lowRatedConditions: number;
  effectiveDateIssues: number;
  issueCards: AppealIssueCard[];
}

/**
 * Standard appeal options (educational only)
 */
const APPEAL_OPTIONS = {
  hlr: {
    name: 'Higher-Level Review (HLR)',
    description: 'A senior reviewer re-examines your case using existing evidence',
    whenToUse: 'If you believe the VA made an error reviewing the evidence already on file',
    timeLimit: 'Within 1 year of decision date',
    timeline: 'Average 125 days'
  },
  supplemental: {
    name: 'Supplemental Claim',
    description: 'Submit new and relevant evidence to support your claim',
    whenToUse: 'When you have new medical evidence, nexus opinions, or buddy statements',
    timeLimit: 'Within 1 year to preserve effective date',
    timeline: 'Average 152 days'
  },
  board: {
    name: 'Board Appeal',
    description: 'Request a Veterans Law Judge review your case',
    whenToUse: 'For complex legal or medical issues requiring judicial review',
    timeLimit: 'Within 1 year of decision date',
    timeline: '6 months to several years depending on docket'
  }
};

/**
 * Analyze VA rating decision and generate appeal issue cards
 */
export function analyzeRatingDecision(profile: VeteranProfile): AppealsAnalysis {
  const issueCards: AppealIssueCard[] = [];

  // Process each disability
  (profile.disabilities || []).forEach(disability => {
    const issue = analyzeCondition(disability, profile);
    if (issue) {
      issueCards.push(issue);
    }
  });

  return {
    totalIssues: issueCards.length,
    deniedConditions: issueCards.filter(i => i.currentStatus === 'denied').length,
    lowRatedConditions: issueCards.filter(i => i.potentialConcerns.ratingTooLow).length,
    effectiveDateIssues: issueCards.filter(i => i.potentialConcerns.effectiveDateConcern).length,
    issueCards
  };
}

/**
 * Analyze individual condition for appeal issues
 */
function analyzeCondition(disability: any, profile: VeteranProfile): AppealIssueCard | null {
  const conditionName = disability.name || disability.condition || 'Unknown Condition';
  const rating = disability.rating || 0;
  const isDenied = rating === 0 || disability.denied === true;

  // Generate issue card
  const issue: AppealIssueCard = {
    conditionName,
    currentStatus: isDenied ? 'denied' : 'granted',
    rating: isDenied ? undefined : rating,
    diagnosticCode: disability.diagnosticCode || disability.cfrCode,
    effectiveDate: disability.effectiveDate,
    vaReason: generateVAReason(disability, isDenied),
    potentialConcerns: {
      ratingTooLow: checkIfRatingTooLow(disability, rating),
      ratingTooLowExplanation: getRatingTooLowExplanation(disability, rating),
      denialReasonType: isDenied ? classifyDenialReason(disability) : undefined,
      effectiveDateConcern: checkEffectiveDateConcern(disability, profile),
      effectiveDateExplanation: getEffectiveDateExplanation(disability, profile),
      missedSecondaryOrPresumptive: checkMissedSecondary(disability, profile),
      missedSecondaryExplanation: getMissedSecondaryExplanation(disability, profile)
    },
    appealOptions: APPEAL_OPTIONS,
    evidenceSuggestions: generateEvidenceSuggestions(disability, isDenied)
  };

  return issue;
}

/**
 * Generate plain-language VA reason summary
 */
function generateVAReason(disability: any, isDenied: boolean): string {
  if (isDenied) {
    return disability.denialReason ||
           'VA determined there was insufficient evidence to establish service connection for this condition.';
  }

  return `VA granted service connection at ${disability.rating || 0}% based on the severity of symptoms as described in the rating criteria.`;
}

/**
 * Check if rating appears too low compared to symptoms
 */
function checkIfRatingTooLow(disability: any, rating: number): boolean {
  // This would integrate with CFR criteria checker from Matrix Engine
  // For now, use heuristics:

  if (rating === 0) return false; // Denied, not low-rated

  // Check if symptoms suggest higher criteria
  if (disability.severeSymptoms && rating < 50) return true;
  if (disability.moderateSymptoms && rating < 30) return true;
  if (disability.mildSymptoms && rating < 10) return true;

  return false;
}

/**
 * Get explanation for why rating may be too low
 */
function getRatingTooLowExplanation(disability: any, rating: number): string | undefined {
  if (!checkIfRatingTooLow(disability, rating)) return undefined;

  return `Your current ${rating}% rating may not reflect the full severity of your symptoms. ` +
         `Review the CFR criteria for this condition to determine if a higher rating may be appropriate.`;
}

/**
 * Classify denial reason type
 */
function classifyDenialReason(disability: any): 'evidence' | 'nexus' | 'in-service-event' | 'aggravation' | 'other' {
  const reason = (disability.denialReason || '').toLowerCase();

  if (reason.includes('nexus') || reason.includes('link') || reason.includes('connection')) {
    return 'nexus';
  }
  if (reason.includes('in-service') || reason.includes('during service') || reason.includes('event')) {
    return 'in-service-event';
  }
  if (reason.includes('evidence') || reason.includes('insufficient')) {
    return 'evidence';
  }
  if (reason.includes('aggravat')) {
    return 'aggravation';
  }

  return 'other';
}

/**
 * Check for effective date concerns
 */
function checkEffectiveDateConcern(disability: any, profile: VeteranProfile): boolean {
  // Check if there's mention of earlier claims, reopened claims, etc.
  if (disability.earlierClaim) return true;
  if (disability.claimReopened) return true;
  if (disability.stagedRating) return true;

  return false;
}

/**
 * Get effective date concern explanation
 */
function getEffectiveDateExplanation(disability: any, profile: VeteranProfile): string | undefined {
  if (!checkEffectiveDateConcern(disability, profile)) return undefined;

  return 'The effective date of your rating may be earlier if you can provide evidence of an ' +
         'earlier claim, intent to file, or clear and unmistakable error.';
}

/**
 * Check for missed secondary or presumptive angles
 */
function checkMissedSecondary(disability: any, profile: VeteranProfile): boolean {
  // This would integrate with Secondary Condition Finder from Matrix Engine
  // For now, use basic heuristics

  const commonSecondaries: Record<string, string[]> = {
    'PTSD': ['depression', 'anxiety', 'insomnia', 'erectile dysfunction'],
    'Tinnitus': ['hearing loss', 'sleep disturbance'],
    'Diabetes': ['peripheral neuropathy', 'erectile dysfunction', 'retinopathy'],
    'Back Condition': ['radiculopathy', 'sciatica', 'hip condition', 'knee condition']
  };

  const conditionName = (disability.name || '').toLowerCase();

  for (const [primary, secondaries] of Object.entries(commonSecondaries)) {
    if (conditionName.includes(primary.toLowerCase())) {
      const claimedConditions = (profile.disabilities || [])
        .map(d => (d.name || '').toLowerCase());

      const missedSecondaries = secondaries.filter(sec =>
        !claimedConditions.some(claimed => claimed.includes(sec))
      );

      if (missedSecondaries.length > 0) return true;
    }
  }

  return false;
}

/**
 * Get missed secondary explanation
 */
function getMissedSecondaryExplanation(disability: any, profile: VeteranProfile): string | undefined {
  if (!checkMissedSecondary(disability, profile)) return undefined;

  return 'This condition is commonly associated with secondary conditions that were not addressed in your claim. ' +
         'Review the Secondary Conditions section of the Dashboard for potential additional claims.';
}

/**
 * Generate evidence suggestions based on issue type
 */
function generateEvidenceSuggestions(disability: any, isDenied: boolean): string[] {
  const suggestions: string[] = [];

  if (isDenied) {
    const denialType = classifyDenialReason(disability);

    switch (denialType) {
      case 'nexus':
        suggestions.push('Nexus letter from medical professional linking condition to service');
        suggestions.push('Independent Medical Opinion (IMO)');
        suggestions.push('Medical literature supporting service connection');
        break;

      case 'in-service-event':
        suggestions.push('Service Treatment Records (STRs)');
        suggestions.push('Buddy statements from fellow service members');
        suggestions.push('Unit records or deployment documentation');
        suggestions.push('Personal statements describing the in-service event');
        break;

      case 'evidence':
        suggestions.push('Current medical records documenting condition');
        suggestions.push('Treatment history and continuity of care');
        suggestions.push('Diagnostic testing results');
        break;

      default:
        suggestions.push('Comprehensive medical evidence');
        suggestions.push('Nexus opinion');
        suggestions.push('Service records');
    }
  } else {
    // For low ratings
    suggestions.push('Updated medical records showing current severity');
    suggestions.push('Disability Benefits Questionnaire (DBQ)');
    suggestions.push('Private medical opinion on symptom severity');
    suggestions.push('Detailed functional impact statement');
  }

  return suggestions;
}

/**
 * Generate downloadable appeals checklist
 */
export function generateAppealsChecklist(analysis: AppealsAnalysis): string {
  let checklist = 'APPEALS & EVIDENCE CHECKLIST\\n';
  checklist += '================================\\n\\n';
  checklist += `Total Issues Identified: ${analysis.totalIssues}\\n`;
  checklist += `Denied Conditions: ${analysis.deniedConditions}\\n`;
  checklist += `Low-Rated Conditions: ${analysis.lowRatedConditions}\\n`;
  checklist += `Effective Date Concerns: ${analysis.effectiveDateIssues}\\n\\n`;

  analysis.issueCards.forEach((issue, index) => {
    checklist += `\\n--- ISSUE ${index + 1}: ${issue.conditionName} ---\\n`;
    checklist += `Status: ${issue.currentStatus.toUpperCase()}\\n`;
    if (issue.rating !== undefined) checklist += `Current Rating: ${issue.rating}%\\n`;
    checklist += `VA Reason: ${issue.vaReason}\\n\\n`;

    checklist += 'EVIDENCE NEEDED:\\n';
    issue.evidenceSuggestions.forEach(ev => {
      checklist += `  • ${ev}\\n`;
    });

    checklist += '\\n';
  });

  checklist += '\\n\\nIMPORTANT: This is educational information only. Consult with an accredited representative.\\n';

  return checklist;
}
