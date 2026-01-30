/**
 * Disability Service Connection Wizard - Type Definitions
 *
 * Comprehensive type system for the VA Claims Wizard that helps veterans
 * explore service connection theories, build entitlement strategies, and
 * prepare claim documentation.
 */

export type ServiceConnectionType =
  | 'direct'
  | 'secondary'
  | 'aggravation'
  | 'presumptive'
  | 'concurrent';

export type ClaimStatus =
  | 'planned'           // Veteran is considering filing
  | 'filed'             // Claim has been submitted
  | 'denied'            // Claim was denied
  | 'granted'           // Claim was approved
  | 'pending'           // Claim is under review
  | 'service-connected' // Already service-connected
  | 'unknown';

export type ClaimType =
  | 'original'
  | 'supplemental'
  | 'increased'
  | 'reopened'
  | 'hlr'
  | 'appeal';

export type EvidenceType =
  | 'service-medical-records'
  | 'va-medical-records'
  | 'private-medical-records'
  | 'nexus-letter'
  | 'dbq'
  | 'buddy-statement'
  | 'lay-statement'
  | 'specialist-opinion'
  | 'diagnostic-test'
  | 'other';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

/**
 * Core Disability Model
 */
export interface Disability {
  id: string;
  name: string;
  description: string;

  // Service connection details
  serviceConnectionType: ServiceConnectionType;
  status: ClaimStatus;
  currentRating?: number; // 0-100%

  // Relationship tracking for secondary conditions
  isServiceConnected: boolean;
  primaryConditionIds: string[]; // For secondary conditions - links to service-connected disabilities
  secondaryConditionIds: string[]; // For service-connected disabilities - links to their secondaries

  // Claim history
  claimType?: ClaimType;
  claimDate?: string; // ISO date
  denialDate?: string; // ISO date if denied
  decisionDate?: string; // ISO date of most recent decision
  effectiveDate?: string; // ISO date when benefits started/would start

  // Medical details
  diagnosedInService: boolean;
  diagnosisDate?: string; // ISO date
  onsetDate?: string; // When symptoms actually started
  worsenedOverTime: boolean;

  // Supporting information
  symptoms: string[];
  treatments: string[];
  serviceHistory: string; // How it relates to military service
  nexusEvidence: string[]; // Evidence linking to service

  // AI-generated insights
  aiTheory?: AiEntitlementTheory;
  aiSuggestions?: AiSuggestion[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

/**
 * AI-Generated Entitlement Theory
 */
export interface AiEntitlementTheory {
  conditionId: string;
  conditionName: string;

  // Theory of entitlement
  primaryTheory: ServiceConnectionType;
  alternativeTheories: ServiceConnectionType[];
  confidence: 'high' | 'medium' | 'low';

  // Nexus rationale (plain language)
  nexusRationale: string;
  medicalRationale: string;
  legalBasis: string;

  // Educational references (not legal citations)
  cfrReferences: PolicyReference[];
  m21References: PolicyReference[];
  medicalLiterature: string[];

  // Recommended evidence
  recommendedEvidence: RecommendedEvidence[];
  criticalEvidence: string[]; // Must-have evidence
  supportingEvidence: string[]; // Nice-to-have evidence

  // Strategy guidance
  strengthAssessment: 'strong' | 'moderate' | 'weak';
  challenges: string[]; // Potential obstacles
  opportunities: string[]; // Favorable factors
  nexSteps: string[];

  // Disclaimers
  generatedAt: string;
  disclaimer: string;
}

/**
 * Policy Reference (Educational, Not Legal Citation)
 */
export interface PolicyReference {
  section: string; // e.g., "38 CFR § 3.310"
  title: string;
  summary: string; // Plain language explanation
  relevance: string; // Why it applies to this condition
  url?: string;
}

/**
 * Recommended Evidence
 */
export interface RecommendedEvidence {
  type: EvidenceType;
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'helpful';
  howToObtain: string;
  costEstimate?: string;
  timeframe?: string; // How long it takes to get
  tips: string[];
}

/**
 * AI Suggestion for Secondary Condition
 */
export interface AiSuggestion {
  id: string;
  suggestedCondition: string;
  primaryConditionId: string;
  primaryConditionName: string;

  // Rationale
  commonality: 'very-common' | 'common' | 'possible' | 'rare';
  medicalBasis: string; // Why this secondary is plausible
  vaPatterns: string; // Common VA approval patterns

  // Examples
  exampleScenarios: string[];
  successStories?: string; // Anonymized examples

  // Action
  accepted: boolean;
  dismissed: boolean;
  notes?: string;

  generatedAt: string;
}

/**
 * Wizard State Management
 */
export interface WizardState {
  // Current step in wizard
  currentStep: number;
  completedSteps: number[];

  // Disability collections
  serviceConnectedDisabilities: Disability[];
  candidateConditions: Disability[]; // Exploring for future claims
  deniedConditions: Disability[];
  grantedConditions: Disability[];

  // AI-generated suggestions
  aiSuggestions: Record<string, AiSuggestion[]>; // Key: primary condition ID
  activeSuggestions: AiSuggestion[];

  // Wizard configuration
  includeSecondaryAnalysis: boolean;
  includePolicyReferences: boolean;
  includeEffectiveDateProjections: boolean;

  // User preferences
  focusAreas: string[]; // e.g., ["mental-health", "musculoskeletal"]
  claimStrategy: 'aggressive' | 'conservative' | 'balanced';
  complexity: ComplexityLevel;

  // Metadata
  scenarioName?: string; // e.g., "Knee-Focused Strategy"
  lastSaved?: string;
  isDirty: boolean; // Unsaved changes
}

/**
 * Wizard Step Configuration
 */
export interface WizardStep {
  number: number;
  id: string;
  title: string;
  description: string;
  component: string; // Component name to render
  isComplete: boolean;
  isRequired: boolean;
  validation?: () => boolean;
}

/**
 * Effective Date Projection
 */
export interface EffectiveDateProjection {
  conditionId: string;
  claimType: ClaimType;
  projectedEffectiveDate: string; // ISO date
  explanation: string[];
  policyReferences: string[];
  backPayMonths?: number;
  backPayEstimate?: number; // In dollars (rough estimate)
  assumptions: string[];
}

/**
 * Claim Strategy Export
 */
export interface ClaimStrategyExport {
  scenarioName: string;
  generatedAt: string;

  summary: {
    totalConditions: number;
    serviceConnectedCount: number;
    candidateCount: number;
    deniedCount: number;
    complexity: ComplexityLevel;
  };

  conditions: DisabilityExport[];

  overallStrategy: {
    recommendedFilingOrder: string[];
    keyEvidence: string[];
    estimatedTimeline: string;
    vsoRecommendation: boolean;
    attorneyRecommendation: boolean;
  };

  disclaimers: string[];
}

/**
 * Individual Disability Export
 */
export interface DisabilityExport {
  condition: Disability;
  theory: AiEntitlementTheory | null;
  effectiveDate: EffectiveDateProjection | null;
  linkedConditions: {
    primary: Disability[];
    secondary: Disability[];
  };
}

/**
 * Questionnaire for Theory Builder
 */
export interface TheoryQuestionnaire {
  conditionId: string;

  // Timing questions
  whenDidItStart?: string; // Free text or date
  wasItDiagnosedInService?: boolean;
  hasItWorsened?: boolean;
  whenDidItWorsen?: string;

  // Service connection questions
  inServiceIncidents: string[]; // Incidents/exposures during service
  relatedToAnotherCondition?: boolean;
  primaryConditionId?: string;
  howDoesItRelate?: string; // How secondary relates to primary

  // Medical questions
  currentSymptoms: string[];
  symptomsFrequency: string;
  impactOnDailyLife: string;
  currentTreatments: string[];

  // Evidence questions
  hasServiceMedicalRecords?: boolean;
  hasVAMedicalRecords?: boolean;
  hasPrivateRecords?: boolean;
  hasNexusLetter?: boolean;
  hasBuddyStatements?: boolean;

  // Additional context
  additionalNotes?: string;

  // Metadata
  completedAt?: string;
}

/**
 * VSO/Attorney Recommendation Criteria
 */
export interface ProfessionalRecommendation {
  recommendationType: 'vso' | 'attorney' | 'none';
  reasons: string[];
  urgency: 'low' | 'medium' | 'high';

  triggers: {
    multipleDenials: boolean;
    complexSecondaryChain: boolean;
    tdiuEligible: boolean;
    severeFunctionalLoss: boolean;
    highStakesAppeal: boolean;
  };
}
