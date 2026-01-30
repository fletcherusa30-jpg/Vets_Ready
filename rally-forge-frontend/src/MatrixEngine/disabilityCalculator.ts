/**
 * VA Disability Calculator Engine
 *
 * Purpose: Calculate combined VA disability rating using true VA math
 *
 * Features:
 * - VA Combined Ratings Table algorithm
 * - Bilateral factor application
 * - Special loss categories
 * - Step-by-step calculation display
 * - Auto-rounding rules (nearest 10%)
 *
 * Integration:
 * - Digital Twin (store combined rating)
 * - Opportunity Radar (trigger benefit updates)
 * - Readiness Index (update benefits category)
 * - Mission Packs (unlock housing/family missions)
 * - Evidence Builder (guide evidence requirements)
 */

export interface Disability {
  id: string;
  conditionName: string;
  diagnosticCode?: string;
  percentage: number;
  bodyPart?: string;
  side?: 'left' | 'right' | 'bilateral' | 'n/a';
  effectiveDate?: string;
  isServiceConnected: boolean;
  isPermanentAndTotal?: boolean;
  source?: 'narrative' | 'manual' | 'dd214';
}

export interface CalculationStep {
  stepNumber: number;
  description: string;
  currentCombined: number;
  newDisability: number;
  efficiency: number;
  additionalRating: number;
  newCombined: number;
}

export interface DisabilityCalculationResult {
  disabilities: Disability[];
  combinedRating: number;
  roundedRating: number;
  bilateralFactorApplied: boolean;
  bilateralFactorPercentage?: number;
  steps: CalculationStep[];
  totalDisabilityBefore: number;
  totalDisabilityAfter: number;
  isPermanentAndTotal: boolean;
  eligibleFor100Percent: boolean;
  nextMilestone?: {
    targetRating: number;
    pointsNeeded: number;
    suggestions: string[];
  };
}

/**
 * Calculate combined VA disability rating using VA math
 *
 * VA Math Rules:
 * 1. Sort disabilities from highest to lowest
 * 2. Start with highest rating
 * 3. For each subsequent rating:
 *    - Calculate efficiency (100 - current combined)
 *    - Multiply new rating by efficiency
 *    - Add to current combined
 * 4. Round to nearest 10%
 * 5. Apply bilateral factor if applicable
 *
 * @param disabilities - Array of disabilities with percentages
 * @returns Calculation result with combined rating and steps
 */
export function calculateCombinedRating(
  disabilities: Disability[]
): DisabilityCalculationResult {
  // Filter service-connected disabilities only
  const serviceConnected = disabilities.filter((d) => d.isServiceConnected && d.percentage > 0);

  if (serviceConnected.length === 0) {
    return {
      disabilities: [],
      combinedRating: 0,
      roundedRating: 0,
      bilateralFactorApplied: false,
      steps: [],
      totalDisabilityBefore: 0,
      totalDisabilityAfter: 0,
      isPermanentAndTotal: false,
      eligibleFor100Percent: false,
    };
  }

  // Check for bilateral factor eligibility
  const bilateralFactorResult = calculateBilateralFactor(serviceConnected);
  let workingDisabilities = [...serviceConnected];

  // If bilateral factor applies, add it as a disability
  if (bilateralFactorResult.applies) {
    workingDisabilities.push({
      id: 'bilateral-factor',
      conditionName: 'Bilateral Factor',
      percentage: bilateralFactorResult.percentage,
      isServiceConnected: true,
      source: 'manual',
    });
  }

  // Sort disabilities by percentage (highest first)
  const sorted = workingDisabilities.sort((a, b) => b.percentage - a.percentage);

  // Calculate combined rating step by step
  const steps: CalculationStep[] = [];
  let currentCombined = 0;

  sorted.forEach((disability, index) => {
    if (index === 0) {
      // First disability becomes the starting point
      currentCombined = disability.percentage;
      steps.push({
        stepNumber: index + 1,
        description: `Start with ${disability.conditionName}`,
        currentCombined: 0,
        newDisability: disability.percentage,
        efficiency: 100,
        additionalRating: disability.percentage,
        newCombined: currentCombined,
      });
    } else {
      // Subsequent disabilities use VA math
      const efficiency = 100 - currentCombined;
      const additionalRating = (disability.percentage * efficiency) / 100;
      const newCombined = currentCombined + additionalRating;

      steps.push({
        stepNumber: index + 1,
        description: `Add ${disability.conditionName}`,
        currentCombined: Math.round(currentCombined * 100) / 100,
        newDisability: disability.percentage,
        efficiency: Math.round(efficiency * 100) / 100,
        additionalRating: Math.round(additionalRating * 100) / 100,
        newCombined: Math.round(newCombined * 100) / 100,
      });

      currentCombined = newCombined;
    }
  });

  // Round to nearest 10%
  const rounded = roundToNearest10(currentCombined);

  // Check for P&T status
  const isPermanentAndTotal =
    rounded === 100 && serviceConnected.some((d) => d.isPermanentAndTotal);

  // Calculate next milestone
  const nextMilestone = calculateNextMilestone(rounded, currentCombined);

  return {
    disabilities: serviceConnected,
    combinedRating: Math.round(currentCombined * 100) / 100,
    roundedRating: rounded,
    bilateralFactorApplied: bilateralFactorResult.applies,
    bilateralFactorPercentage: bilateralFactorResult.percentage,
    steps,
    totalDisabilityBefore: currentCombined,
    totalDisabilityAfter: rounded,
    isPermanentAndTotal,
    eligibleFor100Percent: rounded >= 95,
    nextMilestone,
  };
}

/**
 * Calculate bilateral factor
 *
 * Bilateral Factor Rules:
 * - Applies when veteran has disabilities on both sides of the body
 * - Qualifying body parts: arms, legs, hands, feet, eyes, ears, kidneys
 * - Factor = 10% of combined rating of bilateral disabilities
 * - Example: 30% left knee + 20% right knee = 50% combined × 10% = 5% bilateral factor
 *
 * @param disabilities - Array of disabilities
 * @returns Bilateral factor result
 */
export function calculateBilateralFactor(disabilities: Disability[]): {
  applies: boolean;
  percentage: number;
  affectedDisabilities: Disability[];
} {
  const bilateralBodyParts = [
    'arm',
    'leg',
    'knee',
    'ankle',
    'foot',
    'hand',
    'wrist',
    'elbow',
    'shoulder',
    'hip',
    'eye',
    'ear',
    'kidney',
  ];

  // Find disabilities marked as bilateral OR disabilities on left/right sides
  const bilateralDisabilities = disabilities.filter(
    (d) =>
      d.side === 'bilateral' ||
      (d.bodyPart &&
        bilateralBodyParts.some((part) => d.bodyPart?.toLowerCase().includes(part)))
  );

  // Group by body part
  const bodyPartGroups: Record<string, Disability[]> = {};
  bilateralDisabilities.forEach((d) => {
    const part = d.bodyPart?.toLowerCase().split(' ').pop() || 'unknown';
    if (!bodyPartGroups[part]) {
      bodyPartGroups[part] = [];
    }
    bodyPartGroups[part].push(d);
  });

  // Check if any body part has both left and right disabilities
  let hasBilateral = false;
  const affectedDisabilities: Disability[] = [];

  Object.values(bodyPartGroups).forEach((group) => {
    const hasLeft = group.some((d) => d.side === 'left');
    const hasRight = group.some((d) => d.side === 'right');
    const isBilateral = group.some((d) => d.side === 'bilateral');

    if ((hasLeft && hasRight) || isBilateral) {
      hasBilateral = true;
      affectedDisabilities.push(...group);
    }
  });

  if (!hasBilateral) {
    return { applies: false, percentage: 0, affectedDisabilities: [] };
  }

  // Calculate combined rating of bilateral disabilities
  const bilateralResult = calculateCombinedRating(affectedDisabilities);
  const bilateralFactor = Math.round(bilateralResult.combinedRating * 0.1);

  return {
    applies: true,
    percentage: bilateralFactor,
    affectedDisabilities,
  };
}

/**
 * Round to nearest 10% using VA rules
 *
 * VA Rounding Rules:
 * - 0-4: Round down (e.g., 94 → 90)
 * - 5-9: Round up (e.g., 95 → 100)
 *
 * @param rating - Raw combined rating
 * @returns Rounded rating
 */
export function roundToNearest10(rating: number): number {
  const rounded = Math.round(rating / 10) * 10;
  return rounded;
}

/**
 * Calculate next milestone (10%, 30%, 50%, 70%, 100%)
 *
 * @param currentRounded - Current rounded rating
 * @param currentExact - Current exact rating
 * @returns Next milestone info
 */
export function calculateNextMilestone(
  currentRounded: number,
  currentExact: number
): {
  targetRating: number;
  pointsNeeded: number;
  suggestions: string[];
} | undefined {
  const milestones = [10, 30, 50, 70, 100];
  const nextMilestone = milestones.find((m) => m > currentRounded);

  if (!nextMilestone) {
    return undefined;
  }

  // Calculate points needed to reach next milestone
  // We need currentExact to round up to nextMilestone
  // For nextMilestone to round up, we need >= nextMilestone - 4.5
  const targetExact = nextMilestone - 4.5;
  const pointsNeeded = Math.max(0, targetExact - currentExact);

  const suggestions: string[] = [];

  if (nextMilestone === 10) {
    suggestions.push('File your first VA disability claim');
    suggestions.push('Get a C&P examination');
  } else if (nextMilestone === 30) {
    suggestions.push('File claims for additional conditions');
    suggestions.push('Request increase for existing conditions');
    suggestions.push('File for secondary conditions');
  } else if (nextMilestone === 50) {
    suggestions.push('File for secondary conditions related to your primary disabilities');
    suggestions.push('Request increases for conditions that have worsened');
    suggestions.push('File for bilateral conditions if applicable');
  } else if (nextMilestone === 70) {
    suggestions.push('File for PTSD or mental health conditions');
    suggestions.push('Request increases for physical conditions');
    suggestions.push('File for sleep apnea if you have PTSD or other qualifying conditions');
  } else if (nextMilestone === 100) {
    suggestions.push('Request TDIU (Total Disability Individual Unemployability)');
    suggestions.push('File for additional secondary conditions');
    suggestions.push('Request increases for all existing conditions');
    suggestions.push('File for SMC (Special Monthly Compensation) if applicable');
  }

  return {
    targetRating: nextMilestone,
    pointsNeeded: Math.round(pointsNeeded * 100) / 100,
    suggestions,
  };
}

/**
 * Estimate monthly compensation based on rating
 *
 * 2024 VA Compensation Rates (without dependents)
 *
 * @param rating - Rounded rating (0, 10, 20, ..., 100)
 * @param hasDependents - Has spouse or children
 * @returns Monthly compensation estimate
 */
export function estimateMonthlyCompensation(
  rating: number,
  hasDependents: boolean = false
): number {
  const rates2024: Record<number, { single: number; withDependents: number }> = {
    10: { single: 171.23, withDependents: 171.23 },
    20: { single: 338.49, withDependents: 338.49 },
    30: { single: 524.31, withDependents: 586.31 },
    40: { single: 755.28, withDependents: 847.28 },
    50: { single: 1075.16, withDependents: 1203.16 },
    60: { single: 1361.88, withDependents: 1533.88 },
    70: { single: 1716.28, withDependents: 1882.28 },
    80: { single: 1995.01, withDependents: 2161.01 },
    90: { single: 2241.91, withDependents: 2407.91 },
    100: { single: 3737.85, withDependents: 3946.25 },
  };

  const rateInfo = rates2024[rating] || { single: 0, withDependents: 0 };
  return hasDependents ? rateInfo.withDependents : rateInfo.single;
}

/**
 * Validate disability percentage
 *
 * Valid percentages: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
 *
 * @param percentage - Percentage to validate
 * @returns true if valid
 */
export function validateDisabilityPercentage(percentage: number): boolean {
  const validPercentages = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  return validPercentages.includes(percentage);
}

/**
 * Add disability to existing list and recalculate
 *
 * @param existing - Existing disabilities
 * @param newDisability - New disability to add
 * @returns Updated calculation result
 */
export function addDisability(
  existing: Disability[],
  newDisability: Disability
): DisabilityCalculationResult {
  return calculateCombinedRating([...existing, newDisability]);
}

/**
 * Remove disability and recalculate
 *
 * @param existing - Existing disabilities
 * @param disabilityId - ID of disability to remove
 * @returns Updated calculation result
 */
export function removeDisability(
  existing: Disability[],
  disabilityId: string
): DisabilityCalculationResult {
  const updated = existing.filter((d) => d.id !== disabilityId);
  return calculateCombinedRating(updated);
}

/**
 * Update disability percentage and recalculate
 *
 * @param existing - Existing disabilities
 * @param disabilityId - ID of disability to update
 * @param newPercentage - New percentage
 * @returns Updated calculation result
 */
export function updateDisabilityPercentage(
  existing: Disability[],
  disabilityId: string,
  newPercentage: number
): DisabilityCalculationResult {
  const updated = existing.map((d) =>
    d.id === disabilityId ? { ...d, percentage: newPercentage } : d
  );
  return calculateCombinedRating(updated);
}
