/**
 * Document Intelligence Layer - Narrative Letter Extractor
 *
 * Extracts structured data from VA Rating Decision (Narrative) Letters.
 * Auto-populates disability ratings and triggers benefit suggestions.
 *
 * Phase A - Step A2: Document Intelligence
 */

export interface NarrativeLetterData {
  // Veteran Information
  veteranName?: string;
  fileNumber?: string;
  ssnLast4?: string;

  // Decision Information
  decisionDate: Date;
  effectiveDate?: Date;
  claimNumber?: string;

  // Ratings
  combinedRating: number;
  isPermanentAndTotal: boolean;

  // Service-Connected Conditions
  conditions: {
    name: string;
    percentage: number;
    effectiveDate?: Date;
    isServiceConnected: boolean;
    isBilateral?: boolean;
    isDeferredOrRemanded?: boolean;
    decision: 'Granted' | 'Denied' | 'Deferred' | 'Remanded';
    reasoning?: string;
  }[];

  // Special Monthly Compensation (SMC)
  hasSpecialMonthlyCompensation: boolean;
  smcLevel?: string; // K, L, M, N, O, P, R, S

  // Individual Unemployability
  hasTDIU: boolean;
  tdiuType?: 'Schedular' | 'Extra-schedular';

  // Evidence Cited
  evidenceCited?: string[];

  // Appeal Rights
  appealDeadline?: Date;
  decisionReviewOptions?: string[];

  // Document metadata
  extractedAt: Date;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

/**
 * Extract data from VA Rating Decision (Narrative) Letter
 * In production, this would use OCR and NLP
 */
export async function extractNarrativeLetterData(file: File): Promise<NarrativeLetterData> {
  console.log('Extracting narrative letter data from:', file.name);

  // Demo: Return mock extracted data
  // This simulates extraction from a VA decision letter
  return {
    veteranName: 'John A. Smith',
    fileNumber: '123-45-6789',
    decisionDate: new Date('2024-03-15'),
    effectiveDate: new Date('2024-03-15'),
    claimNumber: 'EP 400 123456',
    combinedRating: 70,
    isPermanentAndTotal: false,
    conditions: [
      {
        name: 'PTSD',
        percentage: 50,
        effectiveDate: new Date('2024-03-15'),
        isServiceConnected: true,
        decision: 'Granted',
        reasoning: 'Evidence shows in-service stressor and current diagnosis',
      },
      {
        name: 'Tinnitus',
        percentage: 10,
        effectiveDate: new Date('2024-03-15'),
        isServiceConnected: true,
        decision: 'Granted',
        reasoning: 'Linked to noise exposure during service',
      },
      {
        name: 'Left knee strain',
        percentage: 10,
        effectiveDate: new Date('2024-03-15'),
        isServiceConnected: true,
        decision: 'Granted',
        reasoning: 'Service treatment records show injury',
      },
      {
        name: 'Hypertension',
        percentage: 0,
        isServiceConnected: false,
        decision: 'Denied',
        reasoning: 'No evidence of in-service diagnosis or nexus to service',
      },
    ],
    hasSpecialMonthlyCompensation: false,
    hasTDIU: false,
    evidenceCited: [
      'Service Treatment Records',
      'VA Compensation & Pension Exam (March 2024)',
      'Private treatment records from Dr. Johnson',
      'Lay statement from veteran',
      'DD-214',
    ],
    appealDeadline: new Date('2025-03-15'), // 1 year from decision
    decisionReviewOptions: [
      'Supplemental Claim',
      'Higher-Level Review',
      'Board Appeal',
    ],
    extractedAt: new Date(),
    confidence: 'high',
    warnings: [],
  };
}

/**
 * Validate extracted narrative letter data
 */
export function validateNarrativeLetterData(data: NarrativeLetterData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical validations
  if (!data.decisionDate) {
    errors.push('Decision date is required');
  }

  if (data.combinedRating === undefined || data.combinedRating === null) {
    errors.push('Combined rating is required');
  }

  if (data.combinedRating < 0 || data.combinedRating > 100) {
    errors.push('Combined rating must be between 0 and 100');
  }

  if (data.combinedRating % 10 !== 0) {
    warnings.push('VA ratings are typically in 10% increments - verify this rating');
  }

  if (!data.conditions || data.conditions.length === 0) {
    warnings.push('No conditions found in decision letter');
  }

  // Validate P&T logic
  if (data.isPermanentAndTotal && data.combinedRating < 100) {
    warnings.push('P&T status typically requires 100% rating - verify this is correct');
  }

  // Validate SMC logic
  if (data.hasSpecialMonthlyCompensation && !data.smcLevel) {
    warnings.push('SMC indicated but level not specified');
  }

  // Validate TDIU logic
  if (data.hasTDIU && !data.tdiuType) {
    warnings.push('TDIU indicated but type not specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Map narrative letter data to Digital Twin structure
 */
export function mapNarrativeLetterToDigitalTwin(narrativeData: NarrativeLetterData): Partial<any> {
  const serviceConnectedConditions = narrativeData.conditions.filter(c => c.isServiceConnected && c.decision === 'Granted');

  return {
    combinedRating: narrativeData.combinedRating,
    isPT: narrativeData.isPermanentAndTotal,
    hasTDIU: narrativeData.hasTDIU,
    tdiuType: narrativeData.tdiuType,
    disabilities: serviceConnectedConditions.map(condition => ({
      condition: condition.name,
      rating: condition.percentage,
      effectiveDate: condition.effectiveDate,
      serviceConnected: true,
      bilateral: condition.isBilateral,
      evidence: narrativeData.evidenceCited || [],
    })),
    benefits: {
      ...calculateTriggeredBenefits(narrativeData),
    },
    documents: {
      ratingNarrative: {
        uploaded: true,
        uploadedAt: narrativeData.extractedAt,
        extractedData: narrativeData,
        verified: true,
        decisionDate: narrativeData.decisionDate,
      },
    },
  };
}

/**
 * Calculate which benefits are triggered by this rating
 */
function calculateTriggeredBenefits(narrativeData: NarrativeLetterData): any {
  const benefits: any = {};

  // 100% P&T triggers many benefits
  if (narrativeData.isPermanentAndTotal && narrativeData.combinedRating === 100) {
    benefits.champvaEligible = true;
    benefits.deaEligible = true;
    benefits.vaHomeLoanFundingFeeWaiver = true;
    benefits.commissaryAccess = true;
    benefits.propertyTaxExemption = true;
  }

  // 30%+ triggers vocational rehab eligibility
  if (narrativeData.combinedRating >= 30) {
    benefits.vrAndEEligible = true;
  }

  // Any service-connected disability triggers VA home loan
  if (narrativeData.conditions.some(c => c.isServiceConnected)) {
    benefits.vaHomeLoanEligible = true;
  }

  // 10%+ may trigger state benefits
  if (narrativeData.combinedRating >= 10) {
    benefits.stateBenefitsLikely = true;
  }

  return benefits;
}

/**
 * Identify potential increases or additional claims
 */
export function identifyClaimOpportunities(narrativeData: NarrativeLetterData): {
  type: 'Increase' | 'New Claim' | 'Appeal' | 'Secondary';
  condition: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}[] {
  const opportunities = [];

  // Check for denied claims that should be appealed
  for (const condition of narrativeData.conditions) {
    if (condition.decision === 'Denied') {
      opportunities.push({
        type: 'Appeal' as const,
        condition: condition.name,
        reason: 'This claim was denied. Review the reasoning and consider appeal options if you have new evidence.',
        priority: 'high' as const,
      });
    }
  }

  // Check for low ratings that might warrant increase
  for (const condition of narrativeData.conditions) {
    if (condition.isServiceConnected && condition.percentage > 0 && condition.percentage < 100) {
      if (condition.name.toLowerCase().includes('ptsd') && condition.percentage < 70) {
        opportunities.push({
          type: 'Increase' as const,
          condition: condition.name,
          reason: 'PTSD ratings can increase if symptoms worsen. Document current symptoms and functional impact.',
          priority: 'high' as const,
        });
      }
    }
  }

  // Check for potential secondary conditions
  const serviceConnectedConditions = narrativeData.conditions.filter(c => c.isServiceConnected);

  if (serviceConnectedConditions.some(c => c.name.toLowerCase().includes('ptsd'))) {
    // PTSD commonly causes secondary conditions
    opportunities.push({
      type: 'Secondary' as const,
      condition: 'Sleep Apnea (secondary to PTSD)',
      reason: 'PTSD often causes or worsens sleep disorders. Consider evaluation and secondary claim.',
      priority: 'medium' as const,
    });

    opportunities.push({
      type: 'Secondary' as const,
      condition: 'IBS or GERD (secondary to PTSD)',
      reason: 'PTSD can cause or aggravate gastrointestinal issues. Document symptoms and connection.',
      priority: 'medium' as const,
    });
  }

  if (serviceConnectedConditions.some(c => c.name.toLowerCase().includes('knee') || c.name.toLowerCase().includes('ankle'))) {
    opportunities.push({
      type: 'Secondary' as const,
      condition: 'Back pain (secondary to knee/ankle)',
      reason: 'Lower extremity injuries often cause compensatory back problems. Consider orthopedic evaluation.',
      priority: 'medium' as const,
    });
  }

  return opportunities;
}

/**
 * Calculate monthly compensation estimate
 */
export function calculateMonthlyCompensation(narrativeData: NarrativeLetterData, hasDependents: boolean = false): {
  baseCompensation: number;
  smcAmount: number;
  totalMonthly: number;
  annualAmount: number;
  notes: string[];
} {
  // 2024 VA compensation rates (simplified)
  const ratesWithoutDependents: { [key: number]: number } = {
    10: 171.23,
    20: 338.49,
    30: 524.31,
    40: 755.28,
    50: 1075.16,
    60: 1361.88,
    70: 1716.28,
    80: 1995.01,
    90: 2241.91,
    100: 3737.85,
  };

  const ratesWithDependents: { [key: number]: number } = {
    10: 171.23,
    20: 338.49,
    30: 573.31,
    40: 828.28,
    50: 1179.16,
    60: 1496.88,
    70: 1882.28,
    80: 2187.01,
    90: 2463.91,
    100: 3946.25,
  };

  const rates = hasDependents ? ratesWithDependents : ratesWithoutDependents;
  const baseCompensation = rates[narrativeData.combinedRating] || 0;

  // SMC adds additional amounts (simplified)
  let smcAmount = 0;
  if (narrativeData.hasSpecialMonthlyCompensation) {
    smcAmount = 500; // Simplified - actual SMC varies widely
  }

  const totalMonthly = baseCompensation + smcAmount;
  const annualAmount = totalMonthly * 12;

  const notes: string[] = [];
  notes.push('These are 2024 rates and may change annually');
  if (hasDependents) {
    notes.push('Rate includes basic dependent allowance');
  }
  if (narrativeData.hasSpecialMonthlyCompensation) {
    notes.push('SMC amount is estimated - actual varies by level');
  }

  return {
    baseCompensation: Math.round(baseCompensation * 100) / 100,
    smcAmount: Math.round(smcAmount * 100) / 100,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    annualAmount: Math.round(annualAmount * 100) / 100,
    notes,
  };
}
