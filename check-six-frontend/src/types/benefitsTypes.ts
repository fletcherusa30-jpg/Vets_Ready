/**
 * Benefits Matrix Type Definitions
 * rallyforge Platform - Educational & Preparatory Tool
 *
 * TypeScript interfaces for the Benefits Matrix Engine
 */

export interface BenefitCriteria {
  rating_min?: number;
  rating_max?: number;
  permanent_and_total?: boolean;
  service_connected?: boolean;
  has_dependents?: boolean;
  requires_aid_attendance?: boolean;
  has_prosthetic_device?: boolean;
  has_sah_grant?: boolean;
  had_sgli?: boolean;
  separated_within?: string;
  requires_caregiver?: boolean;
  post_911?: boolean;
  homeowner?: boolean;
  state?: string;
  veteran?: boolean;
  qualifying_disability?: string[];
}

export interface Benefit {
  benefitId: string;
  name: string;
  category: string;
  description: string;
  criteria: BenefitCriteria;
  priorityGroup?: string;
  benefits: string[];
  links: {
    learnMore: string;
    apply?: string;
    exchange?: string;
    criteria?: string;
  };
  state?: string;
  reductionTable?: Record<string, string>;
  maxGrant?: string;
}

export interface ClaimPreparationTool {
  toolId: string;
  name: string;
  description: string;
  category: string;
  includes: string[];
}

export interface BenefitsRulesDatabase {
  federalBenefits: Benefit[];
  stateBenefits: {
    [state: string]: Benefit[];
  };
  claimPreparationTools: ClaimPreparationTool[];
}

export interface VeteranInputs {
  // Service Information
  branchOfService?: string;
  yearsOfService?: number;
  separationDate?: Date | string;

  // Disability Information
  vaDisabilityRating: number;
  isPermanentAndTotal?: boolean;
  isTDIU?: boolean;
  hasSMC?: boolean;
  requiresAidAndAttendance?: boolean;

  // Service-Connected Disabilities
  serviceConnectedDisabilities?: Array<{
    name: string;
    rating: number;
    effectiveDate?: string;
  }>;

  // Family Information
  hasDependents?: boolean;
  numberOfDependents?: number;
  hasSpouse?: boolean;
  hasChildren?: boolean;

  // Location
  state: string;
  isHomeowner?: boolean;

  // Special Circumstances
  hasProstheticDevice?: boolean;
  hadSGLI?: boolean;
  hasSAHGrant?: boolean;
  requiresCaregiver?: boolean;
  isPost911?: boolean;

  // Qualifying Disabilities
  qualifyingDisabilities?: string[];
}

export interface EvaluatedBenefit extends Benefit {
  matchReason: string;
  matchedCriteria: string[];
  estimatedValue?: string;
  actionRequired?: string;
}

export interface BenefitsEvaluationResult {
  veteran: VeteranInputs;
  matchedBenefits: {
    federal: EvaluatedBenefit[];
    state: EvaluatedBenefit[];
    claimPrep: ClaimPreparationTool[];
  };
  totalMatches: number;
  evaluatedAt: string;
  disclaimer: string;
}

export interface BenefitCategory {
  category: string;
  benefits: EvaluatedBenefit[];
  totalEstimatedValue?: string;
}

/**
 * Utility type for benefit evaluation logging
 */
export interface EvaluationLog {
  timestamp: string;
  veteranId?: string;
  inputHash: string;
  totalBenefitsFound: number;
  categories: string[];
  executionTimeMs: number;
}

