/**
 * State Benefits Integration
 * Stub for future integration with state-specific benefits APIs
 */

export interface StateBenefitsIntegration {
  /**
   * Get state-specific benefits
   */
  getStateBenefits(state: string, veteranProfile?: any): Promise<StateBenefit[]>;

  /**
   * Search state programs
   */
  searchPrograms(state: string, query: string): Promise<StateBenefit[]>;

  /**
   * Check eligibility for state benefit
   */
  checkEligibility(state: string, benefitId: string, veteranProfile?: any): Promise<EligibilityResult>;

  /**
   * Get state veteran commission info
   */
  getStateCounts(state: string): Promise<StateVeteranServices>;

  /**
   * Get state property tax benefits
   */
  getPropertyTaxBenefits(state: string): Promise<PropertyTaxBenefit[]>;
}

export interface StateBenefit {
  id: string;
  name: string;
  state: string;
  type: string;
  description: string;
  eligibilityRequirements: string[];
  applicationUrl: string;
  contactInfo: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  nextSteps?: string[];
}

export interface StateVeteranServices {
  state: string;
  veteranCommission: string;
  phone: string;
  website: string;
  services: string[];
}

export interface PropertyTaxBenefit {
  state: string;
  benefitType: string;
  description: string;
  eligibility: string[];
  applicationUrl: string;
}
