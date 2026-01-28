/**
 * Benefits Domain Service
 * Benefits matrix integration, eligibility exploration, and maximization planning
 */

export interface BenefitOpportunity {
  id: string;
  name: string;
  description: string;
  type: string;
  estimatedValue: number;
  applicationUrl: string;
  timeToProcess: string;
  requirements: string[];
}

export interface BenefitsComparison {
  benefit1: BenefitOpportunity;
  benefit2: BenefitOpportunity;
  differences: string[];
  estimatedCombinedValue: number;
}

export interface BenefitMaximizationPlan {
  id: string;
  veteranId: string;
  recommendations: BenefitOpportunity[];
  estimatedTotalValue: number;
  steps: PlanStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanStep {
  order: number;
  title: string;
  description: string;
  estimatedDuration: string;
  benefitId: string;
}

export interface IBenefitsService {
  // Benefit Discovery
  discoverAvailableBenefits(veteranId: string): Promise<BenefitOpportunity[]>;
  searchBenefits(query: string): Promise<BenefitOpportunity[]>;
  getBenefitDetails(benefitId: string): Promise<BenefitOpportunity>;

  // Eligibility
  checkBenefitEligibility(veteranId: string, benefitId: string): Promise<EligibilityCheck>;
  getEligibleBenefits(veteranId: string): Promise<BenefitOpportunity[]>;

  // Comparison
  compareBenefits(benefit1Id: string, benefit2Id: string): Promise<BenefitsComparison>;
  compareMultipleBenefits(benefitIds: string[]): Promise<string>;

  // Planning
  createMaximizationPlan(veteranId: string): Promise<BenefitMaximizationPlan>;
  updateMaximizationPlan(planId: string, updates: Partial<BenefitMaximizationPlan>): Promise<BenefitMaximizationPlan>;
  getMaximizationPlan(veteranId: string): Promise<BenefitMaximizationPlan | null>;

  // Simulation (What-If Analysis)
  simulateRatingChange(veteranId: string, newRating: number): Promise<BenefitImpact>;
  simulateMoveToState(veteranId: string, newState: string): Promise<BenefitImpact>;
}

export interface EligibilityCheck {
  isEligible: boolean;
  reason: string;
  requirements: string[];
  missingRequirements: string[];
}

export interface BenefitImpact {
  currentBenefits: number;
  projectedBenefits: number;
  change: number;
  percentageChange: number;
  affectedBenefits: string[];
}
