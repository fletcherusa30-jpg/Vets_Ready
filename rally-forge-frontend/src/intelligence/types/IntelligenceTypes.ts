/**
 * rallyforge Intelligence Platform - Core Type Definitions
 * Provides type-safe contracts for cross-engine reasoning, predictions, and adaptive behavior
 */

import { VeteranProfile } from '../../types/benefitsTypes';

/**
 * Confidence levels for predictions and recommendations
 */
export type ConfidenceLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

/**
 * Supported engine types in the rallyforge platform
 */
export type EngineType =
  | 'benefits'
  | 'evidence'
  | 'retirement'
  | 'transition'
  | 'employment'
  | 'resources';

/**
 * Data contract for cross-engine communication
 */
export interface DataContract<T = any> {
  engineId: EngineType;
  timestamp: Date;
  version: string;
  data: T;
  metadata?: Record<string, any>;
}

/**
 * Insight generated from cross-engine reasoning
 */
export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'eligibility' | 'evidence' | 'employment' | 'transition' | 'financial' | 'general';
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  rationale: string[];
  dataUsed: DataContract[];
  recommendedActions: RecommendedAction[];
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  sourceEngines: EngineType[];
}

/**
 * Recommended action with full auditability
 */
export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  actionType: 'claim' | 'document' | 'application' | 'review' | 'update' | 'other';
  estimatedImpact: {
    type: 'financial' | 'time' | 'eligibility' | 'other';
    value: number;
    unit: string;
    description: string;
  };
  steps: ActionStep[];
  requiredData: string[];
  confidence: ConfidenceLevel;
  rationale: string[];
  automated: boolean;
  canOverride: boolean;
}

/**
 * Individual step in a recommended action
 */
export interface ActionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  estimatedTime?: string;
  resources?: string[];
}

/**
 * Prediction with full explainability
 */
export interface Prediction<T = any> {
  id: string;
  type: 'eligibility' | 'evidence-gap' | 'employment-match' | 'transition-risk' | 'financial';
  subject: string;
  prediction: T;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  rationale: string[];
  dataUsed: DataContract[];
  recommendedNextSteps: RecommendedAction[];
  modelVersion: string;
  createdAt: Date;
  expiresAt?: Date;
  validationStatus?: 'pending' | 'validated' | 'rejected';
  actualOutcome?: any;
}

/**
 * Eligibility prediction result
 */
export interface EligibilityPrediction {
  benefitType: string;
  eligible: boolean;
  estimatedValue?: number;
  timeframe?: string;
  requiredActions: string[];
  blockers: string[];
  opportunities: string[];
}

/**
 * Evidence gap analysis
 */
export interface EvidenceGap {
  gapType: 'medical' | 'service' | 'employment' | 'nexus' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  impact: string;
  suggestedDocuments: string[];
  alternativeEvidence: string[];
}

/**
 * Employment match result
 */
export interface EmploymentMatch {
  jobId: string;
  jobTitle: string;
  employer: string;
  matchScore: number; // 0-100
  matchFactors: {
    mosAlignment: number;
    skillsMatch: number;
    locationFit: number;
    compensationFit: number;
    cultureMatch: number;
  };
  reasons: string[];
  concerns: string[];
  nextSteps: string[];
}

/**
 * Transition risk assessment
 */
export interface TransitionRisk {
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  riskScore: number; // 0-100
  riskFactors: {
    factor: string;
    severity: 'low' | 'moderate' | 'high';
    description: string;
    mitigation: string[];
  }[];
  recommendations: string[];
  supportResources: string[];
}

/**
 * Decision log entry for full auditability
 */
export interface DecisionLog {
  id: string;
  timestamp: Date;
  userId?: string;
  veteranId?: string;
  engineId: EngineType;
  action: string;
  input: any;
  output: any;
  reasoning: string[];
  dataUsed: DataContract[];
  modelVersion?: string;
  confidence?: number;
  overridden: boolean;
  overrideReason?: string;
  outcome?: {
    status: 'success' | 'failure' | 'partial';
    actualResult?: any;
    timestamp: Date;
  };
}

/**
 * Audit trail entry
 */
export interface AuditEntry {
  id: string;
  timestamp: Date;
  eventType: 'decision' | 'prediction' | 'recommendation' | 'data-access' | 'model-update' | 'override';
  userId?: string;
  veteranId?: string;
  engineId?: EngineType;
  action: string;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'warning';
  lineage: {
    sourceData: string[];
    transformations: string[];
    outputs: string[];
  };
}

/**
 * Personalization context
 */
export interface PersonalizationContext {
  veteranId: string;
  profile: VeteranProfile;
  goals: string[];
  preferences: {
    communicationStyle?: 'technical' | 'simple' | 'detailed';
    priorityAreas?: string[];
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  };
  history: {
    completedActions: string[];
    dismissedRecommendations: string[];
    feedback: { actionId: string; helpful: boolean; comment?: string }[];
  };
  context: {
    branch: string;
    mos: string;
    era: string;
    location: {
      state: string;
      city?: string;
      rural: boolean;
    };
    financialReadiness?: 'low' | 'medium' | 'high';
    employmentReadiness?: 'low' | 'medium' | 'high';
  };
}

/**
 * Adaptive UI configuration
 */
export interface AdaptiveUIConfig {
  veteranId: string;
  layout: {
    dashboardOrder: string[];
    hiddenSections: string[];
    pinnedItems: string[];
  };
  content: {
    languageLevel: 'basic' | 'intermediate' | 'advanced';
    branchSpecific: boolean;
    mosSpecific: boolean;
  };
  guidance: {
    showTooltips: boolean;
    showExplanations: boolean;
    guidedMode: boolean;
  };
  lastUpdated: Date;
  autoAdapted: boolean;
}

/**
 * Model version tracking for safe updates
 */
export interface ModelVersion {
  id: string;
  modelName: string;
  version: string;
  deployedAt: Date;
  status: 'active' | 'deprecated' | 'archived';
  performance: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    userSatisfaction?: number;
  };
  changeLog: string[];
  rollbackTo?: string;
  canRollback: boolean;
}

/**
 * Workflow automation configuration
 */
export interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'data-change' | 'user-action' | 'schedule' | 'prediction';
    config: Record<string, any>;
  };
  steps: {
    id: string;
    order: number;
    action: string;
    automated: boolean;
    requiresApproval: boolean;
    config: Record<string, any>;
  }[];
  enabled: boolean;
  createdAt: Date;
  lastRun?: Date;
  runCount: number;
  successRate: number;
}

/**
 * Intelligence query for cross-engine reasoning
 */
export interface IntelligenceQuery {
  queryId: string;
  veteranId: string;
  question: string;
  context?: Record<string, any>;
  requiredEngines?: EngineType[];
  minConfidence?: number;
  maxResults?: number;
  includeExplanations: boolean;
}

/**
 * Intelligence response
 */
export interface IntelligenceResponse {
  queryId: string;
  insights: Insight[];
  predictions: Prediction[];
  recommendations: RecommendedAction[];
  executionTime: number;
  enginesUsed: EngineType[];
  dataLineage: string[];
  confidence: number;
  timestamp: Date;
}

