/**
 * VetsReady Matrix Engine
 *
 * Central evaluation engine that processes veteran profile data once
 * and generates all outputs: Benefits, Theories, Evidence, CFR Codes, etc.
 *
 * All modules are "views" of the same data - no standalone pages.
 */

import type { VeteranProfile } from '../contexts/VeteranProfileContext';
import { evaluateBenefits } from './BenefitsEvaluator';
import { findDiagnosticCode, generateEvidenceChecklist, suggestSecondaryConditions } from './ClaimPreparationEngine';
import { calculateCRSC } from './crsc/CRSCRatingCalculator';
import { applyCombatFlags } from './crsc/CRSCQuestionnaire';
import { mapEvidenceToConditions } from './crsc/CRSCEvidenceMapper';
import { generateCRSCPacket } from './crsc/CRSCPacketGenerator';
import { CRSCComputationResult, CRSCPacket, CRSCEvidenceMappingResult } from '../types/crscTypes';

export interface MatrixOutput {
  // Benefits Matrix
  benefits: {
    federal: any[];
    state: any[];
    totalCount: number;
  };

  // Theories of Entitlement
  theories: Theory[];

  // Evidence Requirements
  evidence: {
    serviceConnection: EvidenceItem[];
    diagnosis: EvidenceItem[];
    nexus: EvidenceItem[];
    severity: EvidenceItem[];
    conditionSpecific: EvidenceItem[];
  };

  // CFR Diagnostic Codes
  cfrCodes: CFRMatch[];

  // Secondary Conditions
  secondaryConditions: SecondaryCondition[];

  // Claim Strategy
  strategy: ClaimStrategy;

  // Profile Completeness
  profileScore: number;
  missingFields: string[];

  // CRSC (Combat-Related Special Compensation)
  crsc?: {
    calculation: CRSCComputationResult | null;
    evidenceMap: CRSCEvidenceMappingResult | null;
    packet: CRSCPacket | null;
  };
}

export interface Theory {
  id: string;
  name: string;
  description: string;
  applies: boolean;
  reason: string;
  requiredEvidence: string[];
  cfr: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface EvidenceItem {
  item: string;
  required: boolean;
  category: string;
  status?: 'complete' | 'pending' | 'missing';
}

export interface CFRMatch {
  code: string;
  condition: string;
  currentRating: number;
  nextRating?: number;
  criteria: string;
  bodySystem: string;
}

export interface SecondaryCondition {
  primary: string;
  secondary: string;
  nexus: string;
  strength: 'strong' | 'moderate' | 'possible';
}

export interface ClaimStrategy {
  claimType: 'new' | 'increase' | 'secondary' | 'supplemental';
  primaryCondition: string;
  targetRating: number;
  currentRating: number;
  steps: string[];
  timeline: string;
  keyEvidence: string[];
}

/**
 * Main Matrix Evaluation Function
 * Processes veteran profile and returns all outputs
 */
export function evaluateMatrix(profile: VeteranProfile): MatrixOutput {
  // 1. Evaluate Benefits Matrix
  const benefitsResult = evaluateBenefits({
    ...profile,
    state: profile.state || '' // Ensure state is defined
  });
  const benefits = {
    federal: benefitsResult.matchedBenefits.federal || [],
    state: benefitsResult.matchedBenefits.state || [],
    totalCount: benefitsResult.totalMatches || 0
  };

  // 2. Generate Theories of Entitlement
  const theories = generateTheories(profile);

  // 3. Build Evidence Requirements
  const evidence = generateEvidenceMatrix(profile);

  // 4. Match CFR Diagnostic Codes
  const cfrCodes = matchCFRCodes(profile);

  // 5. Identify Secondary Conditions
  const secondaryConditions = identifySecondaryConditions(profile);

  // 6. Generate Claim Strategy
  const strategy = generateStrategy(profile);

  // 7. Calculate Profile Completeness
  const { score, missing } = calculateProfileScore(profile);

  // 8. CRSC Calculation & artifacts (non-destructive to other benefits logic)
  const crsc = buildCRSCView(profile);

  return {
    benefits,
    theories,
    evidence,
    cfrCodes,
    secondaryConditions,
    strategy,
    profileScore: score,
    missingFields: missing,
    crsc
  };
}

/**
 * Generate Theories of Entitlement based on profile
 */
function generateTheories(profile: VeteranProfile): Theory[] {
  const theories: Theory[] = [];

  // Theory 1: Direct Service Connection
  theories.push({
    id: 'direct-service',
    name: 'Direct Service Connection',
    description: 'Condition occurred during active duty service',
    applies: profile.serviceConnectedConditions.length > 0,
    reason: profile.serviceConnectedConditions.length > 0
      ? `You have ${profile.serviceConnectedConditions.length} service-connected condition(s)`
      : 'No service-connected conditions reported',
    requiredEvidence: [
      'Service medical records',
      'In-service diagnosis or treatment',
      'Lay statements describing in-service occurrence'
    ],
    cfr: '38 CFR § 3.303',
    strength: profile.serviceConnectedConditions.length > 0 ? 'strong' : 'weak'
  });

  // Theory 2: Secondary Service Connection
  theories.push({
    id: 'secondary-service',
    name: 'Secondary Service Connection',
    description: 'Condition caused or aggravated by service-connected condition',
    applies: profile.serviceConnectedConditions.length > 0 && profile.vaDisabilityRating >= 10,
    reason: profile.serviceConnectedConditions.length > 0
      ? 'You have service-connected conditions that could cause secondary conditions'
      : 'No primary service-connected conditions',
    requiredEvidence: [
      'Medical nexus letter',
      'Treatment records showing relationship',
      'Medical research linking conditions'
    ],
    cfr: '38 CFR § 3.310',
    strength: profile.serviceConnectedConditions.length >= 2 ? 'strong' : 'moderate'
  });

  // Theory 3: Aggravation
  theories.push({
    id: 'aggravation',
    name: 'Aggravation of Pre-Existing Condition',
    description: 'Pre-existing condition worsened beyond natural progression during service',
    applies: true,
    reason: 'Applicable if you had a condition before service that worsened during service',
    requiredEvidence: [
      'Pre-service medical records',
      'In-service treatment records',
      'Medical opinion on worsening beyond natural progression'
    ],
    cfr: '38 CFR § 3.306',
    strength: 'moderate'
  });

  // Theory 4: Presumptive Service Connection (Combat)
  if (profile.hasCombatService) {
    theories.push({
      id: 'presumptive-combat',
      name: 'Presumptive Service Connection (Combat)',
      description: 'Combat veterans receive presumption for certain conditions',
      applies: true,
      reason: 'You have documented combat service',
      requiredEvidence: [
        'DD-214 showing combat service',
        'Current diagnosis',
        'Lay statement linking to combat experience'
      ],
      cfr: '38 CFR § 3.304(f)',
      strength: 'strong'
    });
  }

  // Theory 5: Presumptive - Toxic Exposure (PACT Act)
  const pactLocations = ['Vietnam', 'Iraq', 'Afghanistan', 'Gulf War', 'Southwest Asia'];
  const hasPresumptiveLocation = profile.deployments.some(d =>
    pactLocations.some(loc => d.location.includes(loc))
  );

  if (hasPresumptiveLocation) {
    theories.push({
      id: 'presumptive-pact',
      name: 'Presumptive Service Connection (PACT Act)',
      description: 'Presumptive conditions for toxic exposure veterans',
      applies: true,
      reason: 'Your deployment locations qualify for PACT Act presumptive conditions',
      requiredEvidence: [
        'DD-214 showing qualifying service dates/locations',
        'Current diagnosis of presumptive condition',
        'No additional nexus required for presumptive conditions'
      ],
      cfr: '38 CFR § 3.309',
      strength: 'strong'
    });
  }

  // Theory 6: 100% Scheduler Rating (P&T)
  if (profile.vaDisabilityRating >= 100 || profile.isPermanentAndTotal) {
    theories.push({
      id: 'pt-status',
      name: 'Permanent & Total (P&T) Status',
      description: 'Unlock additional benefits with P&T designation',
      applies: profile.isPermanentAndTotal || false,
      reason: profile.isPermanentAndTotal
        ? 'You have P&T status - qualifies for ChampVA, DEA, property tax exemption'
        : 'Not currently P&T - consider requesting static rating',
      requiredEvidence: [
        '100% scheduler or TDIU rating',
        'Medical evidence of permanence',
        'Request for static rating in claim'
      ],
      cfr: '38 CFR § 3.340',
      strength: profile.isPermanentAndTotal ? 'strong' : 'moderate'
    });
  }

  // Theory 7: Total Disability Individual Unemployability (TDIU)
  if (profile.vaDisabilityRating >= 60 && !profile.isTDIU) {
    theories.push({
      id: 'tdiu',
      name: 'Total Disability Individual Unemployability (TDIU)',
      description: 'Receive 100% benefits if unable to work due to service-connected disabilities',
      applies: profile.vaDisabilityRating >= 60,
      reason: profile.vaDisabilityRating >= 60
        ? 'Your rating qualifies - may be eligible if unemployable'
        : 'Need 60%+ rating to qualify',
      requiredEvidence: [
        'Employment records showing inability to work',
        'Medical evidence linking unemployability to service-connected conditions',
        'VA Form 21-8940 (TDIU application)',
        'Employer statements or termination records'
      ],
      cfr: '38 CFR § 4.16',
      strength: profile.vaDisabilityRating >= 70 ? 'strong' : 'moderate'
    });
  }

  // Theory 8: Special Monthly Compensation (SMC)
  const smcQualifiers = [
    profile.hasLossOfUseOfLimb,
    profile.hasBlindness,
    profile.hasAidAndAttendanceNeeds,
    profile.isHousebound
  ];

  if (smcQualifiers.some(q => q)) {
    theories.push({
      id: 'smc',
      name: 'Special Monthly Compensation (SMC)',
      description: 'Additional compensation for severe disabilities',
      applies: true,
      reason: 'You may qualify for SMC based on special circumstances',
      requiredEvidence: [
        'Medical evidence of anatomical loss or loss of use',
        'Doctor statement of aid and attendance needs',
        'Range of motion measurements',
        'Activities of daily living assessment'
      ],
      cfr: '38 CFR § 3.350',
      strength: 'strong'
    });
  }

  return theories;
}

/**
 * Generate comprehensive evidence matrix
 */
function generateEvidenceMatrix(profile: VeteranProfile): MatrixOutput['evidence'] {
  const evidence: MatrixOutput['evidence'] = {
    serviceConnection: [],
    diagnosis: [],
    nexus: [],
    severity: [],
    conditionSpecific: []
  };

  // Service Connection Evidence
  evidence.serviceConnection = [
    { item: 'DD-214 (Certificate of Discharge)', required: true, category: 'service' },
    { item: 'Service Medical Records (SMRs)', required: true, category: 'service' },
    { item: 'Service Personnel Records', required: false, category: 'service' },
  ];

  if (profile.hasCombatService) {
    evidence.serviceConnection.push(
      { item: 'Combat Action Badge/Ribbon documentation', required: false, category: 'combat' },
      { item: 'Unit deployment records', required: false, category: 'combat' }
    );
  }

  // Diagnosis Evidence
  evidence.diagnosis = [
    { item: 'Current diagnosis from healthcare provider', required: true, category: 'medical' },
    { item: 'Diagnostic test results (X-rays, MRI, etc.)', required: true, category: 'medical' },
    { item: 'Treatment records (last 2 years minimum)', required: true, category: 'medical' },
    { item: 'Prescription medication records', required: false, category: 'medical' }
  ];

  // Nexus Evidence
  evidence.nexus = [
    { item: 'Medical nexus letter (IMO/DBQ)', required: true, category: 'nexus' },
    { item: 'Lay statement from veteran', required: true, category: 'nexus' },
    { item: 'Buddy statements from service members', required: false, category: 'nexus' },
    { item: 'Spouse/family statements', required: false, category: 'nexus' }
  ];

  // Severity Evidence
  evidence.severity = [
    { item: 'Disability Benefits Questionnaire (DBQ)', required: true, category: 'rating' },
    { item: 'Range of motion measurements', required: false, category: 'rating' },
    { item: 'Functional impact statement', required: true, category: 'rating' },
    { item: 'Employment records showing impact', required: false, category: 'rating' }
  ];

  // Condition-Specific Evidence
  profile.serviceConnectedConditions.forEach(condition => {
    const checklists = generateEvidenceChecklist(condition.name, 'increase');
    if (Array.isArray(checklists)) {
      checklists.forEach((checklist: any) => {
        if (checklist.required) {
          evidence.conditionSpecific.push(...checklist.required.map((item: string) => ({
            item: `${condition.name}: ${item}`,
            required: true,
            category: condition.name
          })));
        }
      });
    } else {
      // Single checklist object
      const checklist = checklists as any;
      if (checklist.required) {
        evidence.conditionSpecific.push(...checklist.required.map((item: string) => ({
          item: `${condition.name}: ${item}`,
          required: true,
          category: condition.name
        })));
      }
    }
  });

  return evidence;
}

/**
 * Match conditions to CFR diagnostic codes
 */
function matchCFRCodes(profile: VeteranProfile): CFRMatch[] {
  const matches: CFRMatch[] = [];

  profile.serviceConnectedConditions.forEach(condition => {
    const cfrCode = findDiagnosticCode(condition.name);

    if (cfrCode) {
      // Find current rating level
      const currentLevel = cfrCode.ratingLevels.find(
        level => level.rating === condition.rating
      );

      // Find next higher rating
      const nextLevel = cfrCode.ratingLevels.find(
        level => level.rating > condition.rating
      );

      matches.push({
        code: cfrCode.code,
        condition: cfrCode.condition,
        currentRating: condition.rating,
        nextRating: nextLevel?.rating,
        criteria: currentLevel?.criteria || 'No criteria found',
        bodySystem: cfrCode.bodySystem
      });
    }
  });

  return matches;
}

/**
 * Identify potential secondary conditions
 */
function identifySecondaryConditions(profile: VeteranProfile): SecondaryCondition[] {
  const secondaries: SecondaryCondition[] = [];

  profile.serviceConnectedConditions.forEach(primary => {
    const suggestions = suggestSecondaryConditions(primary.name);

    suggestions.forEach(secondary => {
      secondaries.push({
        primary: primary.name,
        secondary: secondary,
        nexus: getSecondaryNexus(primary.name, secondary),
        strength: getSecondaryStrength(primary.name, secondary)
      });
    });
  });

  return secondaries;
}

/**
 * Get nexus explanation for secondary condition
 */
function getSecondaryNexus(primary: string, secondary: string): string {
  const nexusMap: Record<string, Record<string, string>> = {
    'PTSD': {
      'Sleep Apnea': 'PTSD-related hypervigilance and anxiety disrupt sleep patterns, contributing to obstructive sleep apnea',
      'Depression': 'PTSD and depression frequently co-occur due to shared neurobiological pathways',
      'Migraines': 'PTSD-related stress and hyperarousal trigger migraine headaches'
    },
    'Sleep Apnea': {
      'Hypertension': 'Untreated sleep apnea causes repeated oxygen deprivation, leading to high blood pressure',
      'GERD': 'Sleep apnea and acid reflux share bidirectional relationship through diaphragm dysfunction'
    },
    'Knee': {
      'Lower Back': 'Altered gait due to knee pain causes compensatory strain on lumbar spine',
      'Hip': 'Knee dysfunction shifts weight distribution, stressing hip joints'
    }
  };

  return nexusMap[primary]?.[secondary] || `${secondary} may be caused or aggravated by ${primary}`;
}

/**
 * Determine secondary condition strength
 */
function getSecondaryStrength(primary: string, secondary: string): 'strong' | 'moderate' | 'possible' {
  const strongPairs = [
    ['PTSD', 'Sleep Apnea'],
    ['PTSD', 'Depression'],
    ['Sleep Apnea', 'Hypertension'],
    ['Knee', 'Lower Back']
  ];

  const isStrong = strongPairs.some(
    pair => (pair[0] === primary && pair[1] === secondary) ||
            (pair[1] === primary && pair[0] === secondary)
  );

  return isStrong ? 'strong' : 'moderate';
}

/**
 * Generate personalized claim strategy
 */
function generateStrategy(profile: VeteranProfile): ClaimStrategy {
  // Determine claim type based on profile
  let claimType: ClaimStrategy['claimType'] = 'new';
  let primaryCondition = 'Not specified';
  let currentRating = profile.vaDisabilityRating;
  let targetRating = currentRating;

  if (profile.serviceConnectedConditions.length === 0) {
    claimType = 'new';
    primaryCondition = 'Initial service connection';
    targetRating = 10;
  } else if (profile.serviceConnectedConditions.length > 0) {
    // Check for increase potential
    const lowestRated = profile.serviceConnectedConditions.reduce(
      (min, c) => c.rating < min.rating ? c : min
    );

    if (lowestRated.rating < 100) {
      claimType = 'increase';
      primaryCondition = lowestRated.name;
      currentRating = lowestRated.rating;
      targetRating = Math.min(currentRating + 10, 100);
    }
  }

  return {
    claimType,
    primaryCondition,
    targetRating,
    currentRating,
    steps: generateSteps(claimType, primaryCondition),
    timeline: getTimeline(claimType),
    keyEvidence: getKeyEvidence(claimType)
  };
}

function generateSteps(claimType: string, condition: string): string[] {
  switch (claimType) {
    case 'new':
      return [
        'Gather service medical records proving in-service occurrence',
        'Obtain current diagnosis from healthcare provider',
        'Get medical nexus letter linking condition to service',
        'Complete Disability Benefits Questionnaire (DBQ)',
        'Write detailed lay statement describing symptoms',
        'Submit claim on VA.gov with all evidence'
      ];
    case 'increase':
      return [
        `Document worsening of ${condition} since last rating`,
        'Collect recent medical records (last 2 years)',
        'Get updated DBQ showing increased severity',
        'Obtain medical opinion on functional impact',
        'Write lay statement describing daily limitations',
        'Submit increase claim with new evidence'
      ];
    case 'secondary':
      return [
        'Identify primary service-connected condition',
        'Get current diagnosis for secondary condition',
        'Obtain medical nexus letter linking secondary to primary',
        'Gather treatment records for secondary condition',
        'Complete DBQ for secondary condition',
        'Submit secondary claim with nexus evidence'
      ];
    default:
      return ['Consult with VSO for guidance'];
  }
}

function getTimeline(claimType: string): string {
  switch (claimType) {
    case 'new':
      return '4-6 months average processing time';
    case 'increase':
      return '3-5 months average processing time';
    case 'secondary':
      return '5-7 months average processing time';
    case 'supplemental':
      return '3-4 months average processing time';
    default:
      return 'Varies by claim type';
  }
}

function getKeyEvidence(claimType: string): string[] {
  switch (claimType) {
    case 'new':
      return ['Service medical records', 'Current diagnosis', 'Nexus letter', 'DBQ'];
    case 'increase':
      return ['Recent medical records', 'Updated DBQ', 'Lay statement', 'Doctor opinion'];
    case 'secondary':
      return ['Nexus letter', 'Treatment records', 'DBQ', 'Medical research'];
    case 'supplemental':
      return ['New evidence', 'Updated medical records', 'Corrected nexus'];
    default:
      return [];
  }
}

/**
 * Calculate profile completeness score
 */
function calculateProfileScore(profile: VeteranProfile): { score: number; missing: string[] } {
  const requiredFields = [
    { field: 'branch', label: 'Branch of Service' },
    { field: 'serviceStartDate', label: 'Service Start Date' },
    { field: 'serviceEndDate', label: 'Service End Date' },
    { field: 'vaDisabilityRating', label: 'VA Disability Rating' },
    { field: 'state', label: 'State of Residence' },
    { field: 'isMarried', label: 'Marital Status' },
    { field: 'numberOfChildren', label: 'Number of Children' }
  ];

  const missing: string[] = [];
  let completed = 0;

  requiredFields.forEach(({ field, label }) => {
    const value = profile[field as keyof VeteranProfile];
    if (value === '' || value === undefined || value === null) {
      missing.push(label);
    } else {
      completed++;
    }
  });

  const score = Math.round((completed / requiredFields.length) * 100);

  return { score, missing };
}

// --- CRSC Helpers ---------------------------------------------------------
function buildCRSCView(profile: VeteranProfile): MatrixOutput['crsc'] {
  const crscData = profile.crscData;

  if (!crscData || !crscData.retirementType) {
    return { calculation: null, evidenceMap: null, packet: null };
  }

  // Map service-connected conditions into combat-aware structure
  const baseConditions = (profile.serviceConnectedConditions || []).map((condition, idx) => ({
    id: condition.name || `condition-${idx}`,
    name: condition.name,
    rating: condition.rating,
    diagnosticCode: findDiagnosticCode(condition.name)?.code,
    combatFlags: {},
  }));

  const enrichedConditions = applyCombatFlags(baseConditions, crscData.combatFlagsPerCondition);

  // Compute CRSC using combat-only ratings
  const calculation: CRSCComputationResult = calculateCRSC({
    conditions: enrichedConditions,
    retirementType: crscData.retirementType,
    retiredPayAmount: crscData.retiredPay || profile.retirementPayAmount || 0,
    vaCompensationAmount: crscData.vaCompensation || 0,
    vaWaiverAmount: crscData.vaWaiver || 0
  });

  // Evidence mapping placeholder (can be enriched when evidence vault data available)
  const evidenceMap: CRSCEvidenceMappingResult = mapEvidenceToConditions({
    conditions: enrichedConditions,
    evidence: crscData.evidenceInventory || profile.crscEvidenceInventory || {}
  });

  const packet: CRSCPacket = generateCRSCPacket({
    veteranProfile: profile as any,
    crscProfile: crscData,
    computation: calculation,
    evidenceMap
  });

  return { calculation, evidenceMap, packet };
}
