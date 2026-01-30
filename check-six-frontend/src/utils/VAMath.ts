/**
 * VA Math Utilities
 *
 * Implements official VA combined rating calculation formulas.
 *
 * Sources:
 * - 38 CFR §4.25 - Combined ratings table
 * - VA Combined Ratings Calculator
 *
 * Legal Compliance:
 * - Educational estimates only
 * - Not official VA calculations
 * - Veterans must verify with VA
 */

export interface DisabilityRating {
  conditionName: string;
  rating: number;
  extremity?: 'left' | 'right' | 'bilateral' | '';
  isPaired?: boolean;
  diagnosticCode?: string;
  serviceConnected: boolean;
}

export interface VAMathResult {
  combinedRating: number;
  roundedRating: number;
  bilateralFactor: number;
  calculations: string[];
  explanation: string;
}

/**
 * Calculate combined VA disability rating
 *
 * Uses official VA combined rating formula:
 * Combined = 100 - [(100 - rating1) × (100 - rating2) × ... / 100^n]
 *
 * @param ratings - Array of disability ratings
 * @returns Combined rating calculation result
 */
export function calculateCombinedRating(ratings: DisabilityRating[]): VAMathResult {
  const calculations: string[] = [];
  calculations.push('VA Combined Rating Calculation');
  calculations.push('================================');

  // Filter only service-connected ratings
  const validRatings = ratings.filter(r => r.serviceConnected && r.rating > 0);

  if (validRatings.length === 0) {
    return {
      combinedRating: 0,
      roundedRating: 0,
      bilateralFactor: 0,
      calculations: ['No service-connected ratings to combine'],
      explanation: 'No service-connected disabilities found.'
    };
  }

  // Step 1: Sort ratings highest to lowest
  const sortedRatings = [...validRatings].sort((a, b) => b.rating - a.rating);
  calculations.push('\nStep 1: Sort ratings highest to lowest');
  sortedRatings.forEach((r, i) => {
    calculations.push(`  ${i + 1}. ${r.conditionName}: ${r.rating}%`);
  });

  // Step 2: Check for bilateral conditions
  const bilateralResult = applyBilateralFactor(sortedRatings);
  const bilateralFactor = bilateralResult.bilateralFactor;

  if (bilateralFactor > 0) {
    calculations.push('\nStep 2: Apply bilateral factor');
    calculations.push(`  Bilateral factor: ${bilateralFactor}%`);
    calculations.push(`  ${bilateralResult.explanation}`);
  }

  // Step 3: Calculate combined rating
  const ratingsToUse = bilateralResult.adjustedRatings.map(r => r.rating);

  calculations.push('\nStep 3: Calculate combined rating');
  calculations.push('  Formula: 100 - [(100 - R1) × (100 - R2) × ... / 100^n]');

  let efficiency = 100; // Start with 100% efficiency

  ratingsToUse.forEach((rating, index) => {
    const previousEfficiency = efficiency;
    efficiency = efficiency * (100 - rating) / 100;
    calculations.push(`  After rating ${index + 1} (${rating}%): ${previousEfficiency.toFixed(2)} × ${(100 - rating) / 100} = ${efficiency.toFixed(2)}% efficiency remaining`);
  });

  const combinedRating = 100 - efficiency;
  calculations.push(`\n  Combined rating (exact): ${combinedRating.toFixed(2)}%`);

  // Step 4: Round to nearest 10%
  const roundedRating = roundToNearest10(combinedRating);
  calculations.push(`\nStep 4: Round to nearest 10%`);
  calculations.push(`  ${combinedRating.toFixed(2)}% rounds to ${roundedRating}%`);

  // Generate plain language explanation
  const explanation = generateExplanation(
    sortedRatings.length,
    bilateralFactor > 0,
    combinedRating,
    roundedRating
  );

  return {
    combinedRating,
    roundedRating,
    bilateralFactor,
    calculations,
    explanation
  };
}

/**
 * Apply bilateral factor for paired extremities
 *
 * VA rule: When both extremities of a pair are rated, apply 10% factor
 * to the combined value of the paired extremities before combining with other ratings.
 *
 * @param ratings - All ratings sorted highest to lowest
 * @returns Adjusted ratings with bilateral factor applied
 */
function applyBilateralFactor(ratings: DisabilityRating[]): {
  adjustedRatings: DisabilityRating[];
  bilateralFactor: number;
  explanation: string;
} {
  // Find paired extremities
  const leftArm = ratings.filter(r => r.extremity === 'left' && r.conditionName.toLowerCase().includes('arm'));
  const rightArm = ratings.filter(r => r.extremity === 'right' && r.conditionName.toLowerCase().includes('arm'));
  const leftLeg = ratings.filter(r => r.extremity === 'left' && r.conditionName.toLowerCase().includes('leg'));
  const rightLeg = ratings.filter(r => r.extremity === 'right' && r.conditionName.toLowerCase().includes('leg'));

  const hasBilateralArms = leftArm.length > 0 && rightArm.length > 0;
  const hasBilateralLegs = leftLeg.length > 0 && rightLeg.length > 0;

  if (!hasBilateralArms && !hasBilateralLegs) {
    return {
      adjustedRatings: ratings,
      bilateralFactor: 0,
      explanation: 'No bilateral conditions found.'
    };
  }

  // Calculate bilateral factor
  let bilateralFactor = 0;
  let explanation = '';

  if (hasBilateralArms) {
    const leftTotal = leftArm.reduce((sum, r) => sum + r.rating, 0);
    const rightTotal = rightArm.reduce((sum, r) => sum + r.rating, 0);
    const armsCombined = leftTotal + rightTotal;
    bilateralFactor += armsCombined * 0.1;
    explanation += `Both arms rated (${leftTotal}% + ${rightTotal}%): Bilateral factor = ${armsCombined} × 10% = ${bilateralFactor}%. `;
  }

  if (hasBilateralLegs) {
    const leftTotal = leftLeg.reduce((sum, r) => sum + r.rating, 0);
    const rightTotal = rightLeg.reduce((sum, r) => sum + r.rating, 0);
    const legsCombined = leftTotal + rightTotal;
    const legsBilateral = legsCombined * 0.1;
    bilateralFactor += legsBilateral;
    explanation += `Both legs rated (${leftTotal}% + ${rightTotal}%): Bilateral factor = ${legsCombined} × 10% = ${legsBilateral}%. `;
  }

  // Add bilateral factor as a separate "condition"
  const adjustedRatings = [...ratings];
  if (bilateralFactor > 0) {
    adjustedRatings.push({
      conditionName: 'Bilateral Factor',
      rating: Math.round(bilateralFactor),
      serviceConnected: true
    });
  }

  return {
    adjustedRatings: adjustedRatings.sort((a, b) => b.rating - a.rating),
    bilateralFactor: Math.round(bilateralFactor),
    explanation
  };
}

/**
 * Round to nearest 10% per VA rounding rules
 *
 * VA rule: Ratings ending in 5 or more round up, less than 5 round down
 * Example: 94% rounds to 90%, 95% rounds to 100%
 */
export function roundToNearest10(rating: number): number {
  const ones = rating % 10;

  if (ones >= 5) {
    return Math.ceil(rating / 10) * 10;
  } else {
    return Math.floor(rating / 10) * 10;
  }
}

/**
 * Generate plain language explanation
 */
function generateExplanation(
  conditionCount: number,
  hasBilateral: boolean,
  exactRating: number,
  roundedRating: number
): string {
  let explanation = `You have ${conditionCount} service-connected ${conditionCount === 1 ? 'condition' : 'conditions'}. `;

  if (hasBilateral) {
    explanation += 'Because you have bilateral (both sides) extremity ratings, a 10% bilateral factor was added. ';
  }

  explanation += `\n\nYour exact combined rating is ${exactRating.toFixed(2)}%, which rounds to ${roundedRating}% for VA compensation purposes. `;

  explanation += '\n\nIMPORTANT: This is an educational estimate only. Your official rating is determined by the VA. ';
  explanation += 'The VA uses a combined rating table found in 38 CFR §4.25.';

  return explanation;
}

/**
 * Calculate what rating is needed to reach target
 *
 * @param currentRating - Current combined rating
 * @param targetRating - Desired rating (e.g., 100)
 * @returns Rating needed on new condition
 */
export function calculateRatingNeeded(currentRating: number, targetRating: number): number {
  if (currentRating >= targetRating) return 0;

  const currentEfficiency = 100 - currentRating;
  const targetEfficiency = 100 - targetRating;

  // Solve for needed rating:
  // targetEfficiency = currentEfficiency × (100 - needed) / 100
  // needed = 100 - (targetEfficiency × 100 / currentEfficiency)

  const needed = 100 - (targetEfficiency * 100 / currentEfficiency);

  return Math.ceil(needed);
}

/**
 * Validate rating (must be 0-100, in 10% increments)
 */
export function isValidVARating(rating: number): boolean {
  return rating >= 0 && rating <= 100 && rating % 10 === 0;
}
