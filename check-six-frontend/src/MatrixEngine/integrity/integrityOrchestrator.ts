/**
 * Global Integrity Engine (GIE) - Orchestrator
 *
 * Central orchestration of all integrity checks across the rallyforge platform.
 * Ensures no gaps, no misses, and comprehensive validation at all layers.
 *
 * Phase A - Step A1: Foundational Intelligence Expansion
 */

import { DigitalTwin } from '../types/DigitalTwin';

export interface IntegrityCheck {
  category: 'profile' | 'documents' | 'benefits' | 'evidence' | 'employment' | 'education' | 'housing' | 'family' | 'local' | 'missions' | 'system';
  severity: 'critical' | 'warning' | 'info';
  checkId: string;
  checkName: string;
  status: 'pass' | 'fail' | 'incomplete';
  message: string;
  suggestedActions: string[];
  blocksCompletion: boolean;
  affectedModules: string[];
}

export interface IntegrityReport {
  timestamp: Date;
  overallStatus: 'complete' | 'incomplete' | 'conflicted';
  completenessScore: number; // 0-100
  criticalIssues: IntegrityCheck[];
  warnings: IntegrityCheck[];
  infoItems: IntegrityCheck[];
  affectedCategories: string[];
  blockers: IntegrityCheck[];
  nextSteps: string[];
  categoryScores: {
    profile: number;
    documents: number;
    benefits: number;
    evidence: number;
    employment: number;
    education: number;
    housing: number;
    family: number;
    local: number;
    missions: number;
  };
}

export interface ValidationContext {
  digitalTwin: DigitalTwin;
  documentData?: any;
  uploadedFiles?: any[];
  wizardAnswers?: any;
}

/**
 * Run comprehensive integrity checks across all modules
 */
export function runIntegrityChecks(context: ValidationContext): IntegrityReport {
  const checks: IntegrityCheck[] = [];

  // Layer 1: Profile validation
  checks.push(...validateProfile(context));

  // Layer 2: Document validation
  checks.push(...validateDocuments(context));

  // Layer 3: Cross-module consistency
  checks.push(...validateCrossModuleConsistency(context));

  // Layer 4: Benefits coverage
  checks.push(...validateBenefitsCoverage(context));

  // Layer 5: Evidence completeness
  checks.push(...validateEvidenceCompleteness(context));

  // Layer 6: Mission pack readiness
  checks.push(...validateMissionPackReadiness(context));

  // Build the report
  return buildIntegrityReport(checks, context);
}

/**
 * Layer 1: Profile Validation
 * Validates core veteran profile data
 */
function validateProfile(context: ValidationContext): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];
  const { digitalTwin } = context;

  // Critical: Branch
  if (!digitalTwin.branch) {
    checks.push({
      category: 'profile',
      severity: 'critical',
      checkId: 'profile-branch-missing',
      checkName: 'Branch of Service',
      status: 'fail',
      message: 'Branch of service is required',
      suggestedActions: [
        'Complete the Veteran Basics step in the Wizard',
        'Upload your DD-214 for auto-population',
      ],
      blocksCompletion: true,
      affectedModules: ['wizard', 'employment', 'education', 'local'],
    });
  }

  // Critical: Service dates
  if (!digitalTwin.entryDate || !digitalTwin.separationDate) {
    checks.push({
      category: 'profile',
      severity: 'critical',
      checkId: 'profile-dates-missing',
      checkName: 'Service Dates',
      status: 'fail',
      message: 'Entry and separation dates are required',
      suggestedActions: [
        'Enter your service dates in the Wizard',
        'Upload your DD-214 for auto-population',
      ],
      blocksCompletion: true,
      affectedModules: ['wizard', 'benefits', 'education'],
    });
  }

  // Critical: Character of Service
  if (!digitalTwin.characterOfService) {
    checks.push({
      category: 'profile',
      severity: 'critical',
      checkId: 'profile-character-missing',
      checkName: 'Character of Service',
      status: 'fail',
      message: 'Character of service is required for benefit eligibility',
      suggestedActions: [
        'Enter your character of service in the Wizard',
        'Upload your DD-214 for auto-population',
      ],
      blocksCompletion: true,
      affectedModules: ['wizard', 'benefits', 'housing'],
    });
  }

  // Warning: MOS/AFSC
  if (!digitalTwin.mos && !digitalTwin.afsc) {
    checks.push({
      category: 'profile',
      severity: 'warning',
      checkId: 'profile-mos-missing',
      checkName: 'Military Occupational Specialty',
      status: 'incomplete',
      message: 'MOS/AFSC helps us match you to civilian jobs and certifications',
      suggestedActions: [
        'Enter your MOS/AFSC in the Wizard',
        'Upload your DD-214 for auto-population',
      ],
      blocksCompletion: false,
      affectedModules: ['employment', 'education'],
    });
  }

  // Warning: Rank
  if (!digitalTwin.rank) {
    checks.push({
      category: 'profile',
      severity: 'warning',
      checkId: 'profile-rank-missing',
      checkName: 'Rank at Separation',
      status: 'incomplete',
      message: 'Rank helps us understand your leadership experience and skill level',
      suggestedActions: [
        'Enter your rank at separation in the Wizard',
        'Upload your DD-214 for auto-population',
      ],
      blocksCompletion: false,
      affectedModules: ['employment', 'education'],
    });
  }

  // Date consistency check
  if (digitalTwin.entryDate && digitalTwin.separationDate) {
    const entry = new Date(digitalTwin.entryDate);
    const separation = new Date(digitalTwin.separationDate);

    if (separation <= entry) {
      checks.push({
        category: 'profile',
        severity: 'critical',
        checkId: 'profile-dates-inconsistent',
        checkName: 'Service Date Consistency',
        status: 'fail',
        message: 'Separation date must be after entry date',
        suggestedActions: [
          'Verify your service dates in the Wizard',
          'Check your DD-214 for correct dates',
        ],
        blocksCompletion: true,
        affectedModules: ['wizard', 'benefits'],
      });
    }
  }

  return checks;
}

/**
 * Layer 2: Document Validation
 * Validates presence and consistency of key documents
 */
function validateDocuments(context: ValidationContext): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];
  const { digitalTwin } = context;

  // Critical: DD-214
  if (!digitalTwin.documents?.dd214?.uploaded) {
    checks.push({
      category: 'documents',
      severity: 'critical',
      checkId: 'doc-dd214-missing',
      checkName: 'DD-214 Upload',
      status: 'fail',
      message: 'DD-214 is required for most VA benefits and claims',
      suggestedActions: [
        'Upload your DD-214 in the Wizard',
        'Use the DD-214 Download Helper if you need a copy',
        'Visit your local VSO for assistance obtaining your DD-214',
      ],
      blocksCompletion: false, // Not hard blocker but strongly recommended
      affectedModules: ['wallet', 'benefits', 'claims', 'housing'],
    });
  }

  // Warning: Rating Decision
  if (digitalTwin.disabilities && digitalTwin.disabilities.length > 0 && !digitalTwin.documents?.ratingNarrative?.uploaded) {
    checks.push({
      category: 'documents',
      severity: 'warning',
      checkId: 'doc-rating-missing',
      checkName: 'VA Rating Decision Letter',
      status: 'incomplete',
      message: 'You indicated disabilities but have not uploaded your rating decision letter',
      suggestedActions: [
        'Upload your most recent VA rating decision letter',
        'This helps us verify your current ratings and suggest additional benefits',
        'Visit VA.gov or eBenefits to download your decision letter',
      ],
      blocksCompletion: false,
      affectedModules: ['wallet', 'benefits', 'evidence'],
    });
  }

  // Info: Medical Records
  if (digitalTwin.disabilities && digitalTwin.disabilities.length > 0 && !digitalTwin.documents?.medicalRecords) {
    checks.push({
      category: 'documents',
      severity: 'info',
      checkId: 'doc-medical-missing',
      checkName: 'Medical Records',
      status: 'incomplete',
      message: 'Medical records strengthen VA claims',
      suggestedActions: [
        'Consider uploading relevant medical records',
        'Request your military medical records from NPRC',
        'Request your VA medical records from your VA facility',
      ],
      blocksCompletion: false,
      affectedModules: ['wallet', 'evidence'],
    });
  }

  return checks;
}

/**
 * Layer 3: Cross-Module Consistency
 * Validates consistency across different data sources
 */
function validateCrossModuleConsistency(context: ValidationContext): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];
  const { digitalTwin, documentData } = context;

  // Check: Profile vs DD-214 consistency
  if (digitalTwin.documents?.dd214?.uploaded && documentData?.dd214) {
    // Branch consistency
    if (digitalTwin.branch && documentData.dd214.branch && digitalTwin.branch !== documentData.dd214.branch) {
      checks.push({
        category: 'profile',
        severity: 'warning',
        checkId: 'consistency-branch-mismatch',
        checkName: 'Branch Mismatch',
        status: 'fail',
        message: `Profile shows ${digitalTwin.branch} but DD-214 shows ${documentData.dd214.branch}`,
        suggestedActions: [
          'Review your profile information',
          'Verify the correct branch from your DD-214',
          'Update your profile to match your DD-214',
        ],
        blocksCompletion: false,
        affectedModules: ['wizard', 'profile', 'wallet'],
      });
    }

    // Dates consistency
    if (digitalTwin.separationDate && documentData.dd214.separationDate) {
      const profileDate = new Date(digitalTwin.separationDate).toISOString().split('T')[0];
      const docDate = new Date(documentData.dd214.separationDate).toISOString().split('T')[0];

      if (profileDate !== docDate) {
        checks.push({
          category: 'profile',
          severity: 'warning',
          checkId: 'consistency-date-mismatch',
          checkName: 'Separation Date Mismatch',
          status: 'fail',
          message: 'Separation date in profile does not match DD-214',
          suggestedActions: [
            'Review your service dates in the Wizard',
            'Use the date from your DD-214 as the authoritative source',
          ],
          blocksCompletion: false,
          affectedModules: ['wizard', 'profile', 'wallet'],
        });
      }
    }
  }

  // Check: Disabilities vs Rating Decision consistency
  if (digitalTwin.disabilities && digitalTwin.disabilities.length > 0 && documentData?.ratingNarrative) {
    const profileConditions = digitalTwin.disabilities.map(d => d.condition.toLowerCase().trim());
    const narrativeConditions = documentData.ratingNarrative.conditions?.map((c: any) => c.name.toLowerCase().trim()) || [];

    // Find conditions in profile but not in narrative
    const missingInNarrative = profileConditions.filter(c => !narrativeConditions.includes(c));

    if (missingInNarrative.length > 0) {
      checks.push({
        category: 'profile',
        severity: 'warning',
        checkId: 'consistency-condition-mismatch',
        checkName: 'Condition Mismatch',
        status: 'fail',
        message: `Some conditions in your profile are not in your rating decision: ${missingInNarrative.join(', ')}`,
        suggestedActions: [
          'Review your disability list in the Wizard',
          'Verify conditions against your rating decision letter',
          'Consider if these are pending claims or not yet service-connected',
        ],
        blocksCompletion: false,
        affectedModules: ['wizard', 'profile', 'benefits', 'evidence'],
      });
    }
  }

  return checks;
}

/**
 * Layer 4: Benefits Coverage
 * Identifies benefits the veteran likely qualifies for but hasn't claimed
 */
function validateBenefitsCoverage(context: ValidationContext): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];
  const { digitalTwin } = context;

  // Check: 100% P&T → CHAMPVA for family
  if (digitalTwin.combinedRating === 100 && digitalTwin.isPT && digitalTwin.hasDependents && !digitalTwin.benefits?.champva) {
    checks.push({
      category: 'benefits',
      severity: 'info',
      checkId: 'benefits-champva-available',
      checkName: 'CHAMPVA Eligibility',
      status: 'incomplete',
      message: 'Your dependents may qualify for CHAMPVA healthcare',
      suggestedActions: [
        'Visit the Family Hub to check CHAMPVA eligibility',
        'CHAMPVA provides healthcare coverage for your spouse and children',
        'This is a valuable benefit worth thousands per year',
      ],
      blocksCompletion: false,
      affectedModules: ['family', 'benefits'],
    });
  }

  // Check: 100% P&T → DEA for dependents
  if (digitalTwin.combinedRating === 100 && digitalTwin.isPT && digitalTwin.hasDependents && !digitalTwin.benefits?.dea) {
    checks.push({
      category: 'benefits',
      severity: 'info',
      checkId: 'benefits-dea-available',
      checkName: 'DEA Education Benefits',
      status: 'incomplete',
      message: 'Your dependents may qualify for DEA education benefits ($1,298/month)',
      suggestedActions: [
        'Visit the Family Hub to check DEA eligibility',
        'DEA provides up to 45 months of education benefits for your children',
        'This benefit is in addition to any transferred GI Bill',
      ],
      blocksCompletion: false,
      affectedModules: ['family', 'benefits'],
    });
  }

  // Check: Service-connected disability → VA Home Loan
  if (digitalTwin.combinedRating && digitalTwin.combinedRating > 0 && !digitalTwin.benefits?.vaHomeLoan) {
    checks.push({
      category: 'benefits',
      severity: 'info',
      checkId: 'benefits-valoan-available',
      checkName: 'VA Home Loan',
      status: 'incomplete',
      message: 'You likely qualify for VA Home Loan benefits',
      suggestedActions: [
        'Visit the Housing Hub to check VA Home Loan eligibility',
        'VA loans offer 0% down payment and no PMI',
        'If you have a service-connected disability, you may qualify for reduced or waived funding fees',
      ],
      blocksCompletion: false,
      affectedModules: ['housing', 'benefits'],
    });
  }

  // Check: 10%+ rating → State tax benefits
  if (digitalTwin.combinedRating && digitalTwin.combinedRating >= 10 && !digitalTwin.benefits?.stateTaxBenefits && digitalTwin.state) {
    checks.push({
      category: 'benefits',
      severity: 'info',
      checkId: 'benefits-statetax-available',
      checkName: 'State Tax Benefits',
      status: 'incomplete',
      message: `${digitalTwin.state} may offer property tax exemptions or income tax benefits for veterans`,
      suggestedActions: [
        'Visit the State Migration Advisor to compare state benefits',
        'Many states offer significant property tax reductions for disabled veterans',
        'Check your local county assessor for property tax exemptions',
      ],
      blocksCompletion: false,
      affectedModules: ['benefits', 'local'],
    });
  }

  return checks;
}

/**
 * Layer 5: Evidence Completeness
 * Validates evidence strength for claims
 */
function validateEvidenceCompleteness(context: ValidationContext): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];
  const { digitalTwin } = context;

  // Check: Disabilities without evidence
  if (digitalTwin.disabilities) {
    const disabilitiesWithoutEvidence = digitalTwin.disabilities.filter(d => !d.evidence || d.evidence.length === 0);

    if (disabilitiesWithoutEvidence.length > 0) {
      checks.push({
        category: 'evidence',
        severity: 'warning',
        checkId: 'evidence-missing-for-conditions',
        checkName: 'Missing Evidence',
        status: 'incomplete',
        message: `${disabilitiesWithoutEvidence.length} condition(s) have no supporting evidence`,
        suggestedActions: [
          'Visit the Evidence Builder to create lay statements',
          'Upload relevant medical records for each condition',
          'Consider buddy statements from fellow service members',
        ],
        blocksCompletion: false,
        affectedModules: ['evidence', 'wallet', 'claims'],
      });
    }
  }

  // Check: Deployments without documentation
  if (digitalTwin.deployments && digitalTwin.deployments.length > 0) {
    const deploymentsWithoutDocs = digitalTwin.deployments.filter(d => !d.documentedBy || d.documentedBy.length === 0);

    if (deploymentsWithoutDocs.length > 0) {
      checks.push({
        category: 'evidence',
        severity: 'info',
        checkId: 'evidence-deployment-docs',
        checkName: 'Deployment Documentation',
        status: 'incomplete',
        message: `${deploymentsWithoutDocs.length} deployment(s) could benefit from additional documentation`,
        suggestedActions: [
          'Upload deployment orders or awards',
          'Deployment documentation helps establish exposure claims',
          'Consider VA Form 21-0781 for PTSD-related claims',
        ],
        blocksCompletion: false,
        affectedModules: ['evidence', 'wallet', 'claims'],
      });
    }
  }

  return checks;
}

/**
 * Layer 6: Mission Pack Readiness
 * Validates readiness to complete mission packs
 */
function validateMissionPackReadiness(context: ValidationContext): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];
  const { digitalTwin } = context;

  // Mission: File First Claim
  if (!digitalTwin.documents?.dd214?.uploaded) {
    checks.push({
      category: 'missions',
      severity: 'warning',
      checkId: 'mission-firstclaim-blocked',
      checkName: 'File First Claim Mission',
      status: 'fail',
      message: 'Cannot complete "File First Claim" mission without DD-214',
      suggestedActions: [
        'Upload your DD-214 to unlock this mission pack',
        'Use the DD-214 Download Helper if needed',
      ],
      blocksCompletion: false,
      affectedModules: ['missions', 'wallet'],
    });
  }

  // Mission: Get First Job
  if (!digitalTwin.mos && !digitalTwin.afsc) {
    checks.push({
      category: 'missions',
      severity: 'info',
      checkId: 'mission-job-incomplete',
      checkName: 'Get First Job Mission',
      status: 'incomplete',
      message: '"Get First Job" mission will be more effective with your MOS/AFSC',
      suggestedActions: [
        'Enter your MOS/AFSC in the Wizard',
        'This helps us match you to the best civilian jobs',
      ],
      blocksCompletion: false,
      affectedModules: ['missions', 'employment'],
    });
  }

  return checks;
}

/**
 * Build comprehensive integrity report from all checks
 */
function buildIntegrityReport(checks: IntegrityCheck[], context: ValidationContext): IntegrityReport {
  const criticalIssues = checks.filter(c => c.severity === 'critical');
  const warnings = checks.filter(c => c.severity === 'warning');
  const infoItems = checks.filter(c => c.severity === 'info');
  const blockers = checks.filter(c => c.blocksCompletion);

  // Calculate overall status
  let overallStatus: 'complete' | 'incomplete' | 'conflicted' = 'complete';
  if (criticalIssues.length > 0) {
    overallStatus = 'conflicted';
  } else if (warnings.length > 0 || infoItems.length > 0) {
    overallStatus = 'incomplete';
  }

  // Calculate completeness score (0-100)
  const totalChecks = checks.length || 1;
  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const completenessScore = Math.round((passedChecks / totalChecks) * 100);

  // Calculate category scores
  const categoryScores = calculateCategoryScores(checks);

  // Extract unique affected categories
  const affectedCategories = Array.from(new Set(checks.flatMap(c => c.affectedModules)));

  // Build next steps
  const nextSteps = buildNextSteps(checks, context);

  return {
    timestamp: new Date(),
    overallStatus,
    completenessScore,
    criticalIssues,
    warnings,
    infoItems,
    affectedCategories,
    blockers,
    nextSteps,
    categoryScores,
  };
}

/**
 * Calculate category-specific scores
 */
function calculateCategoryScores(checks: IntegrityCheck[]): IntegrityReport['categoryScores'] {
  const categories = ['profile', 'documents', 'benefits', 'evidence', 'employment', 'education', 'housing', 'family', 'local', 'missions'] as const;

  const scores: any = {};

  for (const category of categories) {
    const categoryChecks = checks.filter(c => c.category === category);
    if (categoryChecks.length === 0) {
      scores[category] = 100; // No checks = assumed complete
    } else {
      const passed = categoryChecks.filter(c => c.status === 'pass').length;
      scores[category] = Math.round((passed / categoryChecks.length) * 100);
    }
  }

  return scores;
}

/**
 * Build prioritized next steps
 */
function buildNextSteps(checks: IntegrityCheck[], context: ValidationContext): string[] {
  const steps: string[] = [];

  // Priority 1: Critical blockers
  const criticalBlockers = checks.filter(c => c.severity === 'critical' && c.blocksCompletion);
  if (criticalBlockers.length > 0) {
    steps.push('CRITICAL: Complete the following to proceed:');
    criticalBlockers.forEach(c => {
      steps.push(`  • ${c.checkName}: ${c.suggestedActions[0]}`);
    });
  }

  // Priority 2: Critical non-blockers
  const criticalNonBlockers = checks.filter(c => c.severity === 'critical' && !c.blocksCompletion);
  if (criticalNonBlockers.length > 0) {
    steps.push('HIGH PRIORITY: Address these important items:');
    criticalNonBlockers.forEach(c => {
      steps.push(`  • ${c.checkName}: ${c.suggestedActions[0]}`);
    });
  }

  // Priority 3: Warnings
  const warnings = checks.filter(c => c.severity === 'warning');
  if (warnings.length > 0 && steps.length < 10) {
    steps.push('RECOMMENDED: Consider these improvements:');
    warnings.slice(0, 3).forEach(c => {
      steps.push(`  • ${c.checkName}: ${c.suggestedActions[0]}`);
    });
  }

  return steps;
}

/**
 * Run integrity checks on life event change
 * Triggered when major profile changes occur
 */
export function runLifeEventIntegrityCheck(eventType: string, context: ValidationContext): IntegrityReport {
  console.log(`Running integrity check for life event: ${eventType}`);

  // Run full integrity check
  const report = runIntegrityChecks(context);

  // Add event-specific checks
  // This can be expanded based on event type

  return report;
}

/**
 * Get quick integrity status (lightweight check)
 */
export function getQuickIntegrityStatus(digitalTwin: DigitalTwin): {
  status: 'complete' | 'incomplete' | 'conflicted';
  score: number;
  criticalCount: number;
} {
  const context: ValidationContext = { digitalTwin };
  const report = runIntegrityChecks(context);

  return {
    status: report.overallStatus,
    score: report.completenessScore,
    criticalCount: report.criticalIssues.length,
  };
}

