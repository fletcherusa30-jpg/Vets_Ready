/**
 * Disabilities Domain Service (Educational)
 * Educational information on disabilities, conditions, and ratings
 * NO MEDICAL ADVICE - EDUCATIONAL ONLY
 */

export interface DisabilityEducationalResource {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  relatedConditions: string[];
  lastUpdated: Date;
}

export interface RatingExplanation {
  percentage: number;
  description: string;
  symptoms: string[];
  functionalImpact: string[];
  monthlyAmount: number;
  resourceLinks: string[];
}

export interface ConditionResources {
  conditionName: string;
  medicalInformation: DisabilityEducationalResource[];
  ratingExplanations: RatingExplanation[];
  relatedConditions: string[];
  supportGroups: string[];
  officalResources: string[];
}

export interface IDisabilitiesService {
  // Educational Resources
  getConditionInformation(conditionName: string): Promise<ConditionResources>;
  searchConditions(query: string): Promise<DisabilityEducationalResource[]>;
  getAllConditions(): Promise<string[]>;

  // Rating Information (Educational)
  getRatingExplanation(percentage: number): Promise<RatingExplanation>;
  explainRatingSystem(): Promise<string>;
  getTotalDisabilityExplanation(): Promise<string>;

  // Evidence Organization (Educational)
  getEvidenceRequirements(conditionName: string): Promise<string[]>;
  getDocumentationGuidance(): Promise<string>;

  // Organization Tools
  organizeConditions(veteranId: string): Promise<void>;
  trackSymptoms(veteranId: string, symptoms: string[]): Promise<void>;

  // Disclaimer
  getDisclaimerText(): Promise<string>;
}
