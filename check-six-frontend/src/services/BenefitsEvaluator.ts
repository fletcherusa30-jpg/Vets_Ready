/**
 * Benefits Evaluation Engine
 * rallyforge Platform - Educational & Preparatory Tool
 *
 * Rules-based evaluation engine that matches veteran inputs
 * against Federal and State benefit eligibility criteria.
 *
 * IMPORTANT: This tool is for educational and preparatory purposes only.
 * It does NOT file claims, transmit data, or make legal determinations.
 * Always verify eligibility with official VA sources.
 */

import benefitsRulesData from '../data/benefitsRules.json';
import type {
  VeteranInputs,
  Benefit,
  EvaluatedBenefit,
  BenefitsEvaluationResult,
  BenefitsRulesDatabase
} from '../types/benefitsTypes';

const benefitsRules = benefitsRulesData as BenefitsRulesDatabase;

/**
 * Evaluates a single benefit against veteran inputs
 */
function evaluateBenefit(
  benefit: Benefit,
  inputs: VeteranInputs
): { matches: boolean; matchReason: string; matchedCriteria: string[] } {
  const criteria = benefit.criteria;
  const matchedCriteria: string[] = [];
  let matchReason = '';

  // Rating minimum check
  if (criteria.rating_min !== undefined) {
    if (inputs.vaDisabilityRating >= criteria.rating_min) {
      matchedCriteria.push(`VA rating ${inputs.vaDisabilityRating}% meets minimum ${criteria.rating_min}%`);
    } else {
      return {
        matches: false,
        matchReason: `VA rating ${inputs.vaDisabilityRating}% does not meet minimum ${criteria.rating_min}%`,
        matchedCriteria: []
      };
    }
  }

  // Rating maximum check
  if (criteria.rating_max !== undefined) {
    if (inputs.vaDisabilityRating <= criteria.rating_max) {
      matchedCriteria.push(`VA rating ${inputs.vaDisabilityRating}% within maximum ${criteria.rating_max}%`);
    } else {
      return {
        matches: false,
        matchReason: `VA rating ${inputs.vaDisabilityRating}% exceeds maximum ${criteria.rating_max}%`,
        matchedCriteria: []
      };
    }
  }

  // Permanent and Total check
  if (criteria.permanent_and_total === true) {
    if (inputs.isPermanentAndTotal) {
      matchedCriteria.push('Veteran has Permanent & Total (P&T) status');
    } else {
      return {
        matches: false,
        matchReason: 'Requires Permanent & Total (P&T) status',
        matchedCriteria: []
      };
    }
  }

  // Service-connected check
  if (criteria.service_connected === true) {
    if (inputs.vaDisabilityRating > 0 || (inputs.serviceConnectedDisabilities && inputs.serviceConnectedDisabilities.length > 0)) {
      matchedCriteria.push('Has service-connected disabilities');
    } else {
      return {
        matches: false,
        matchReason: 'Requires at least one service-connected disability',
        matchedCriteria: []
      };
    }
  }

  // Dependents check
  if (criteria.has_dependents === true) {
    if (inputs.hasDependents) {
      matchedCriteria.push('Has eligible dependents');
    } else {
      return {
        matches: false,
        matchReason: 'Requires eligible dependents',
        matchedCriteria: []
      };
    }
  }

  // Aid and Attendance check
  if (criteria.requires_aid_attendance === true) {
    if (inputs.requiresAidAndAttendance) {
      matchedCriteria.push('Requires aid and attendance');
    } else {
      return {
        matches: false,
        matchReason: 'Requires aid and attendance qualification',
        matchedCriteria: []
      };
    }
  }

  // Prosthetic device check
  if (criteria.has_prosthetic_device === true) {
    if (inputs.hasProstheticDevice) {
      matchedCriteria.push('Has prosthetic device or medication that damages clothing');
    } else {
      return {
        matches: false,
        matchReason: 'Requires prosthetic device or qualifying medication',
        matchedCriteria: []
      };
    }
  }

  // SAH Grant check
  if (criteria.has_sah_grant === true) {
    if (inputs.hasSAHGrant) {
      matchedCriteria.push('Has SAH grant');
    } else {
      return {
        matches: false,
        matchReason: 'Requires SAH (Specially Adapted Housing) grant',
        matchedCriteria: []
      };
    }
  }

  // SGLI check
  if (criteria.had_sgli === true) {
    if (inputs.hadSGLI) {
      matchedCriteria.push('Had SGLI while in service');
    } else {
      return {
        matches: false,
        matchReason: 'Requires SGLI coverage during service',
        matchedCriteria: []
      };
    }
  }

  // Caregiver check
  if (criteria.requires_caregiver === true) {
    if (inputs.requiresCaregiver) {
      matchedCriteria.push('Requires family caregiver');
    } else {
      return {
        matches: false,
        matchReason: 'Requires family caregiver qualification',
        matchedCriteria: []
      };
    }
  }

  // Post-9/11 check
  if (criteria.post_911 === true) {
    if (inputs.isPost911) {
      matchedCriteria.push('Served post-9/11');
    } else {
      return {
        matches: false,
        matchReason: 'Requires post-9/11 service',
        matchedCriteria: []
      };
    }
  }

  // State check
  if (criteria.state) {
    if (inputs.state && inputs.state.toLowerCase() === criteria.state.toLowerCase()) {
      matchedCriteria.push(`Resident of ${criteria.state}`);
    } else {
      return {
        matches: false,
        matchReason: `Requires residency in ${criteria.state}`,
        matchedCriteria: []
      };
    }
  }

  // Homeowner check
  if (criteria.homeowner === true) {
    if (inputs.isHomeowner) {
      matchedCriteria.push('Homeowner');
    } else {
      return {
        matches: false,
        matchReason: 'Requires homeownership',
        matchedCriteria: []
      };
    }
  }

  // Qualifying disability check
  if (criteria.qualifying_disability && criteria.qualifying_disability.length > 0) {
    if (inputs.qualifyingDisabilities && inputs.qualifyingDisabilities.some(d =>
      criteria.qualifying_disability!.includes(d)
    )) {
      matchedCriteria.push(`Has qualifying disability: ${inputs.qualifyingDisabilities.filter(d =>
        criteria.qualifying_disability!.includes(d)
      ).join(', ')}`);
    } else {
      return {
        matches: false,
        matchReason: `Requires one of: ${criteria.qualifying_disability.join(', ')}`,
        matchedCriteria: []
      };
    }
  }

  // All criteria matched
  matchReason = matchedCriteria.length > 0
    ? `Qualified: ${matchedCriteria.join('; ')}`
    : 'Meets eligibility criteria';

  return {
    matches: true,
    matchReason,
    matchedCriteria
  };
}

/**
 * Determines action required for benefit
 */
function determineActionRequired(benefit: Benefit, inputs: VeteranInputs): string {
  // Check if benefit requires application
  if (benefit.links.apply) {
    return 'Apply online at VA.gov';
  }

  // Some benefits are automatic
  if (benefit.benefitId.includes('commissary') || benefit.benefitId.includes('exchange')) {
    return 'Automatic - show VA ID card';
  }

  if (benefit.benefitId.includes('healthcare') && inputs.vaDisabilityRating >= 50) {
    return 'Enroll at VA.gov/health-care';
  }

  return 'Contact VA or state agency';
}

/**
 * Estimates value of benefit (if applicable)
 */
function estimateBenefitValue(benefit: Benefit, inputs: VeteranInputs): string | undefined {
  // Property tax reduction
  if (benefit.benefitId === 'idaho_property_tax_reduction' && benefit.reductionTable) {
    const rating = inputs.vaDisabilityRating;
    if (rating === 100) return benefit.reductionTable['100%'];
    if (rating >= 70) return benefit.reductionTable['70-90%'];
    if (rating >= 50) return benefit.reductionTable['50-60%'];
    if (rating >= 30) return benefit.reductionTable['30-40%'];
    if (rating >= 10) return benefit.reductionTable['10-20%'];
  }

  // Fixed grants
  if (benefit.maxGrant) {
    return benefit.maxGrant;
  }

  // Healthcare value
  if (benefit.benefitId === 'federal_healthcare_free') {
    return 'No copays - estimated $5,000-$15,000/year value';
  }

  return undefined;
}

/**
 * Main evaluation function
 * Evaluates all benefits against veteran inputs
 */
export function evaluateBenefits(inputs: VeteranInputs): BenefitsEvaluationResult {
  const startTime = Date.now();

  const federalMatches: EvaluatedBenefit[] = [];
  const stateMatches: EvaluatedBenefit[] = [];

  // Evaluate Federal benefits
  for (const benefit of benefitsRules.federalBenefits) {
    const evaluation = evaluateBenefit(benefit, inputs);

    if (evaluation.matches) {
      federalMatches.push({
        ...benefit,
        matchReason: evaluation.matchReason,
        matchedCriteria: evaluation.matchedCriteria,
        estimatedValue: estimateBenefitValue(benefit, inputs),
        actionRequired: determineActionRequired(benefit, inputs)
      });
    }
  }

  // Evaluate State benefits (if state is provided)
  if (inputs.state && benefitsRules.stateBenefits[inputs.state.toLowerCase()]) {
    const stateBenefits = benefitsRules.stateBenefits[inputs.state.toLowerCase()];

    for (const benefit of stateBenefits) {
      const evaluation = evaluateBenefit(benefit, inputs);

      if (evaluation.matches) {
        stateMatches.push({
          ...benefit,
          matchReason: evaluation.matchReason,
          matchedCriteria: evaluation.matchedCriteria,
          estimatedValue: estimateBenefitValue(benefit, inputs),
          actionRequired: determineActionRequired(benefit, inputs)
        });
      }
    }
  }

  const executionTime = Date.now() - startTime;

  console.log(`[Benefits Evaluator] Evaluated ${benefitsRules.federalBenefits.length} federal and ${inputs.state ? benefitsRules.stateBenefits[inputs.state.toLowerCase()]?.length || 0 : 0} state benefits in ${executionTime}ms`);
  console.log(`[Benefits Evaluator] Found ${federalMatches.length} federal and ${stateMatches.length} state matches`);

  return {
    veteran: inputs,
    matchedBenefits: {
      federal: federalMatches,
      state: stateMatches,
      claimPrep: benefitsRules.claimPreparationTools
    },
    totalMatches: federalMatches.length + stateMatches.length,
    evaluatedAt: new Date().toISOString(),
    disclaimer: 'This tool is for educational and preparatory purposes only. It does not file claims or make legal determinations. Always verify eligibility with official VA sources at VA.gov.'
  };
}

/**
 * Get benefits by category
 */
export function getBenefitsByCategory(benefits: EvaluatedBenefit[]): Record<string, EvaluatedBenefit[]> {
  const categorized: Record<string, EvaluatedBenefit[]> = {};

  for (const benefit of benefits) {
    if (!categorized[benefit.category]) {
      categorized[benefit.category] = [];
    }
    categorized[benefit.category].push(benefit);
  }

  return categorized;
}

/**
 * Validate veteran inputs
 */
export function validateVeteranInputs(inputs: VeteranInputs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (inputs.vaDisabilityRating < 0 || inputs.vaDisabilityRating > 100) {
    errors.push('VA disability rating must be between 0 and 100');
  }

  if (!inputs.state || inputs.state.trim() === '') {
    errors.push('State is required');
  }

  if (inputs.numberOfDependents !== undefined && inputs.numberOfDependents < 0) {
    errors.push('Number of dependents cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

