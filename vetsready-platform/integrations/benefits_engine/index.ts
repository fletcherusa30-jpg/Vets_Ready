/**
 * Benefits Engine Integration
 * Interfaces for querying VA and state benefits
 */

export interface BenefitsEngineIntegration {
  /**
   * Query VA benefits database
   */
  queryVABenefits(veteranProfile: any): Promise<string[]>;

  /**
   * Query state benefits
   */
  queryStateBenefits(state: string, veteranProfile: any): Promise<string[]>;

  /**
   * Calculate estimated benefit amounts
   */
  calculateBenefitAmount(benefitType: string, parameters: any): Promise<number>;

  /**
   * Check benefit eligibility
   */
  checkEligibility(benefitType: string, veteranProfile: any): Promise<boolean>;

  /**
   * Get benefit details
   */
  getBenefitDetails(benefitType: string): Promise<BenefitDetails>;
}

export interface BenefitDetails {
  name: string;
  description: string;
  monthlyAmount?: number;
  requirements: string[];
  applicationUrl: string;
}
