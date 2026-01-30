/**
 * CRSC Types
 * Modular, auditable definitions for combat-related special compensation flows.
 */

export type CombatCategory =
  | 'armed_conflict'
  | 'hazardous_service'
  | 'simulated_war'
  | 'instrumentality_of_war'
  | 'purple_heart'
  | 'not_combat_related';

export interface CombatFlags {
  armedConflict?: boolean;
  hazardousService?: boolean;
  simulatedWar?: boolean;
  instrumentalityOfWar?: boolean;
  purpleHeart?: boolean;
  notCombatRelated?: boolean;
}

export interface ConditionCombatProfile {
  id: string;
  name: string;
  rating: number;
  diagnosticCode?: string;
  combatFlags: CombatFlags;
  isCombatRelated?: boolean; // derived
}

export interface CRSCProfileData {
  retirementType?:
    | '20-year'
    | 'chapter_61'
    | 'tera'
    | 'reserve_guard'
    | 'tdrl'
    | 'pdrl';
  vaRating?: number;
  vaWaiver?: number;
  vaCompensation?: number;
  retiredPay?: number;
  combatFlagsPerCondition?: Record<string, CombatFlags>;
  documentationAvailable?: string[];
  evidenceInventory?: EvidenceInventory;
}

export interface VACompensationTableEntry {
  percentage: number;
  baseAmount: number; // veteran alone for now; can be swapped with family tables later
}

export interface CRSCComputationInput {
  conditions: ConditionCombatProfile[];
  retirementType?: CRSCProfileData['retirementType'];
  retiredPayAmount: number;
  vaCompensationAmount: number;
  vaWaiverAmount: number;
  vaCompensationTable?: VACompensationTableEntry[];
}

export interface CRSCComputationResult {
  combatRelatedPercentage: number;
  combatRelatedConditions: ConditionCombatProfile[];
  crscEligibleAmount: number;
  retiredPayOffset: number;
  crscFinalPayment: number;
  rationale: string[];
}

export interface EvidenceInventory {
  strEntries?: CRSCEvidenceItem[];
  dd214?: CRSCEvidenceItem[];
  lod?: CRSCEvidenceItem[];
  aar?: CRSCEvidenceItem[];
  awards?: CRSCEvidenceItem[];
  vaDecision?: CRSCEvidenceItem[];
  other?: CRSCEvidenceItem[];
}

export interface CRSCQuestion {
  id: string;
  prompt: string;
  type: 'single-select' | 'boolean' | 'number' | 'multiselect';
  options?: { value: string; label: string }[];
  helperText?: string;
}

export interface CRSCQuestionSection {
  id: string;
  title: string;
  questions: CRSCQuestion[];
}

export interface CRSCEvidenceItem {
  type: 'STR' | 'DD214' | 'LOD' | 'AAR' | 'AWARD' | 'VA_DECISION' | 'OTHER';
  referenceId: string;
  summary: string;
  date: string | null;
}

export interface CRSCEvidenceConditionMap {
  conditionId: string;
  name: string;
  combatCategory: CombatCategory | null;
  evidence: CRSCEvidenceItem[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  gaps: string[];
}

export interface CRSCEvidenceMappingResult {
  conditions: CRSCEvidenceConditionMap[];
}

export interface CRSCPacketConditionEntry {
  conditionId: string;
  name: string;
  rating: number;
  combatCategory: CombatCategory | null;
  evidenceReferences: CRSCEvidenceItem[];
  justification: string;
}

export interface CRSCPacketExportOptions {
  pdfTemplateId: string;
  docxTemplateId: string;
}

export interface CRSCPacket {
  veteranInfo: Record<string, any>;
  retirementInfo: Record<string, any>;
  crscSummary: {
    combatRelatedPercentage: number;
    crscEligibleAmount: number;
    crscFinalPayment: number;
  };
  conditions: CRSCPacketConditionEntry[];
  evidenceIndex: CRSCEvidenceItem[];
  exportOptions: CRSCPacketExportOptions;
}

export interface CRSCDecisionExplanation {
  summary: string[];
  eligibilityExplanation: string;
  combatRelatedExplanation: string;
  paymentExplanation: string;
  evidenceStrength: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedNextSteps: string[];
}

export interface CRSCAppealStrategy {
  appealViability: 'LOW' | 'MEDIUM' | 'HIGH';
  keyIssues: string[];
  evidenceToHighlight: string[];
  additionalEvidenceToConsider: string[];
  strategyOutline: string[];
  veteranSummary: string[];
}

export interface CRSCAnalyticsSnapshot {
  eligibilityDistribution: Record<string, number>;
  combatCategoryBreakdown: Record<string, number>;
  evidenceStrength: Record<'LOW' | 'MEDIUM' | 'HIGH', number>;
  combatRelatedPercentageDistribution: Array<{ bucket: string; count: number }>;
  averageCrscPayable: number;
  readinessImpact: number;
  approvalIndicators: string[];
  trends: Array<{ period: string; eligibilityLikely: number; eligibilityUnclear: number }>;
}

export interface CrscAnalyticsEvent {
  cohortId: string;
  timestamp: string;
  eligibilityStatus: string;
  combatRelatedPercentage: number;
  evidenceStrength: 'LOW' | 'MEDIUM' | 'HIGH';
  crscPayableEstimate: number;
  retirementImpactScore: number;
  combatCategoryCounts: {
    armedConflict: number;
    hazardousService: number;
    simulatedWar: number;
    instrumentalityOfWar: number;
    purpleHeart: number;
  };
  branch?: string;
  installation?: string;
}

export interface CrscLineageRecord {
  recordId: string;
  timestamp: string;
  sourceModule: string;
  inputHashes: string[];
  outputHash: string;
  transformationSummary: string;
  version: string;
}

export interface CrscAuditEvent {
  eventId: string;
  timestamp: string;
  actorType: 'VETERAN' | 'SYSTEM';
  action: string;
  module: string;
  metadata: Record<string, any>;
}

export interface CrscEvidenceRecord {
  documentId: string;
  type: string;
  extractedData: Record<string, any>;
  combatTags: string[];
  linkedConditions: string[];
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}
