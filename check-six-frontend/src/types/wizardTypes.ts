/**
 * CFR Diagnostic Code Types
 * 38 CFR Part 4 - VA Rating Schedule
 */

export interface CFRRatingLevel {
  rating: number;
  criteria: string;
}

export interface CFRDiagnosticCode {
  code: string;
  condition: string;
  bodySystem: string;
  ratingLevels: CFRRatingLevel[];
  notes: string;
  secondaryConditions: string[];
  evidenceRequired: string[];
}

export interface CFRDatabase {
  musculoskeletal: CFRDiagnosticCode[];
  mental: CFRDiagnosticCode[];
  respiratory: CFRDiagnosticCode[];
  digestive: CFRDiagnosticCode[];
  neurological: CFRDiagnosticCode[];
  cardiovascular: CFRDiagnosticCode[];
  skin: CFRDiagnosticCode[];
}

export interface ClaimPreparationData {
  condition: string;
  diagnosticCode?: string;
  currentRating: number;
  targetRating?: number;
  claimType: 'new' | 'increase' | 'secondary' | 'supplemental';
  primaryCondition?: string; // For secondary claims
  evidenceProvided: string[];
  evidenceMissing: string[];
  cfrCriteria: string;
  suggestedStrategy: string;
  layStatementTopics: string[];
  secondaryConnectionSuggestions: string[];
}

export interface EvidenceChecklist {
  category: string;
  items: Array<{
    item: string;
    required: boolean;
    provided: boolean;
    notes?: string;
  }>;
}

export interface WizardStep {
  stepNumber: number;
  stepName: string;
  completed: boolean;
  data: any;
}

export interface VeteranWizardData {
  // Step 1: Veteran Basics
  basics: {
    branch: string;
    serviceStartDate: string;
    serviceEndDate: string;
    state: string;
    deployments: Array<{
      location: string;
      startDate: string;
      endDate: string;
      combatZone: boolean;
    }>;
    combatVeteran: boolean;
    dischargeType: string;
  };

  // Step 2: Disability Information
  disability: {
    currentRating: number;
    isPermanentAndTotal: boolean;
    isTDIU: boolean;
    hasSMC: boolean;
    // SMC Qualifiers
    smcQualifiers: {
      hasAidAndAttendance: boolean;
      isHousebound: boolean;
      hasLossOfUseOfLimb: boolean;
      hasBlindness: boolean;
    };
    conditions: Array<{
      name: string;
      rating: number;
      bilateral: boolean;
      diagnosticCode?: string;
    }>;
  };

  // Step 3: Symptoms & Evidence
  symptomsEvidence: {
    symptoms: string[];
    evidenceUploaded: Array<{
      type: 'medical' | 'lay' | 'buddy' | 'dbq' | 'private';
      filename: string;
      uploadDate: string;
    }>;
    layStatements: string[];
    buddyStatements: number;
    hasDBQ: boolean;
    hasPrivateMedicalOpinion: boolean;
  };

  // Step 4: Claim Goals
  claimGoals: {
    goalType: 'new' | 'increase' | 'secondary' | 'supplemental' | 'help_decide';
    targetCondition?: string;
    primaryCondition?: string; // For secondary claims
    targetRating?: number;
    reasoning?: string;
  };

  // Step 5: Benefits Matrix (auto-populated from existing Benefits Matrix)
  benefits: {
    federalBenefits: any[];
    stateBenefits: any[];
    estimatedValue: string;
  };

  // Step 6: Claim Preparation Summary (generated)
  claimPrep: {
    cfrCriteria: string;
    evidenceChecklist: EvidenceChecklist[];
    missingEvidence: string[];
    suggestedStrategy: string;
    secondaryConnections: string[];
    layStatementTemplates: string[];
    dbqGuidance: string;
    nextSteps: string[];
  };
}
