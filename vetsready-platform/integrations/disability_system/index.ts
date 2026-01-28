/**
 * Disability System Integration
 * Interfaces for querying disability ratings and conditions (Educational)
 */

export interface DisabilitySystemIntegration {
  /**
   * Query disability condition information
   */
  getCondition(conditionCode: string): Promise<ConditionInfo | null>;

  /**
   * Search disability conditions
   */
  searchConditions(query: string): Promise<ConditionInfo[]>;

  /**
   * Get rating criteria
   */
  getRatingCriteria(conditionCode: string): Promise<RatingCriteria>;

  /**
   * Calculate total disability rating
   */
  calculateTotalRating(conditions: any[]): Promise<number>;

  /**
   * Get evidence requirements
   */
  getEvidenceRequirements(conditionCode: string): Promise<string[]>;
}

export interface ConditionInfo {
  code: string;
  name: string;
  description: string;
  symptoms: string[];
  relatedConditions: string[];
}

export interface RatingCriteria {
  code: string;
  ratingPercentages: number[];
  criteria: RatingLevel[];
}

export interface RatingLevel {
  percentage: number;
  description: string;
  symptoms: string[];
  functionalImpact: string[];
}
