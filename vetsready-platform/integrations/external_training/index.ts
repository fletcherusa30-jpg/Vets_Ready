/**
 * External Training Integration
 * Stub for future integration with training program APIs
 */

export interface ExternalTrainingIntegration {
  /**
   * Search training programs
   */
  searchPrograms(query: string, filters?: ProgramSearchFilters): Promise<ExternalProgram[]>;

  /**
   * Get program details
   */
  getProgramDetails(programId: string, provider: string): Promise<ExternalProgram>;

  /**
   * Check GI Bill eligibility for program
   */
  checkGIBillEligibility(programId: string, provider: string): Promise<GIBillEligibilityInfo>;

  /**
   * Get program reviews
   */
  getProgramReviews(programId: string, provider: string): Promise<ProgramReview[]>;
}

export interface ExternalProgram {
  id: string;
  name: string;
  provider: string;
  field: string;
  level: string;
  duration: string;
  cost: number;
  format: 'online' | 'in_person' | 'hybrid';
  startDate?: Date;
  detailsUrl: string;
}

export interface ProgramSearchFilters {
  field?: string;
  level?: string;
  format?: string;
  location?: string;
  maxCost?: number;
}

export interface GIBillEligibilityInfo {
  isEligible: boolean;
  approvalNumber?: string;
  monthlyBenefits?: number;
  tuitionCovered?: number;
}

export interface ProgramReview {
  rating: number;
  comment: string;
  reviewer: string;
  date: Date;
}
