/**
 * Integrity Report Builder
 *
 * Formats and presents integrity check results in user-friendly formats.
 * Provides structured reports for Dashboard, Wizard, and AI Mentor.
 *
 * Phase A - Step A1: Foundational Intelligence Expansion
 */

import { IntegrityReport, IntegrityCheck } from './integrityOrchestrator';

export interface DashboardIntegrityCard {
  title: string;
  status: 'good' | 'warning' | 'critical';
  score: number;
  summary: string;
  alerts: {
    severity: 'critical' | 'warning' | 'info';
    message: string;
    action: string;
    module: string;
  }[];
  completionPercentage: number;
}

export interface WizardIntegrityGate {
  canProceed: boolean;
  blockers: {
    checkName: string;
    message: string;
    actions: string[];
  }[];
  warnings: {
    checkName: string;
    message: string;
    actions: string[];
  }[];
  summary: string;
}

export interface MentorIntegrityResponse {
  question: string;
  answer: string;
  gaps: {
    category: string;
    item: string;
    impact: string;
    nextStep: string;
  }[];
  recommendations: string[];
  educationalNote: string;
}

/**
 * Build Dashboard Integrity Alert Card
 */
export function buildDashboardIntegrityCard(report: IntegrityReport): DashboardIntegrityCard {
  // Determine overall status
  let status: 'good' | 'warning' | 'critical' = 'good';
  if (report.criticalIssues.length > 0) {
    status = 'critical';
  } else if (report.warnings.length > 0) {
    status = 'warning';
  }

  // Build summary
  let summary = '';
  if (status === 'critical') {
    summary = `${report.criticalIssues.length} critical issue(s) need attention`;
  } else if (status === 'warning') {
    summary = `Your profile is ${report.completenessScore}% complete`;
  } else {
    summary = 'Your profile looks great! All critical items complete.';
  }

  // Build alerts (top 5 most important)
  const alerts = [];

  // Add critical issues first
  for (const check of report.criticalIssues.slice(0, 3)) {
    alerts.push({
      severity: 'critical' as const,
      message: check.message,
      action: check.suggestedActions[0],
      module: check.affectedModules[0] || 'system',
    });
  }

  // Add warnings if room
  const remainingSlots = 5 - alerts.length;
  for (const check of report.warnings.slice(0, remainingSlots)) {
    alerts.push({
      severity: 'warning' as const,
      message: check.message,
      action: check.suggestedActions[0],
      module: check.affectedModules[0] || 'system',
    });
  }

  return {
    title: 'System Integrity',
    status,
    score: report.completenessScore,
    summary,
    alerts,
    completionPercentage: report.completenessScore,
  };
}

/**
 * Build Wizard Summary Integrity Gate
 */
export function buildWizardIntegrityGate(report: IntegrityReport): WizardIntegrityGate {
  const blockers = report.blockers.map(check => ({
    checkName: check.checkName,
    message: check.message,
    actions: check.suggestedActions,
  }));

  const warnings = report.warnings.slice(0, 5).map(check => ({
    checkName: check.checkName,
    message: check.message,
    actions: check.suggestedActions,
  }));

  const canProceed = blockers.length === 0;

  let summary = '';
  if (!canProceed) {
    summary = `Please complete ${blockers.length} critical item(s) before proceeding.`;
  } else if (warnings.length > 0) {
    summary = `You can proceed, but consider addressing ${warnings.length} recommended item(s) for a more complete profile.`;
  } else {
    summary = 'Your profile is complete and ready to use!';
  }

  return {
    canProceed,
    blockers,
    warnings,
    summary,
  };
}

/**
 * Build AI Mentor "What Am I Missing?" Response
 */
export function buildMentorMissingItemsResponse(report: IntegrityReport): MentorIntegrityResponse {
  const gaps = [];

  // Extract gaps from checks
  for (const check of [...report.criticalIssues, ...report.warnings].slice(0, 10)) {
    gaps.push({
      category: check.category,
      item: check.checkName,
      impact: check.message,
      nextStep: check.suggestedActions[0],
    });
  }

  // Build recommendations
  const recommendations = report.nextSteps.slice(0, 5);

  // Build educational note
  const educationalNote =
    'This analysis is educational only. rallyforge identifies potential gaps in your profile ' +
    'to help you build a more complete picture of your service and benefits. You are always ' +
    'in control of what information you provide.';

  return {
    question: 'What am I missing?',
    answer: buildMentorAnswer(report),
    gaps,
    recommendations,
    educationalNote,
  };
}

function buildMentorAnswer(report: IntegrityReport): string {
  let answer = '';

  if (report.completenessScore === 100) {
    answer = 'Great news! Your profile appears complete with all critical information provided. ';
    answer += 'You\'re well-positioned to explore benefits and opportunities.';
  } else if (report.criticalIssues.length > 0) {
    answer = `I've identified ${report.criticalIssues.length} critical item(s) that would significantly improve your profile. `;
    answer += 'These are important for accessing benefits and building strong claims.';
  } else if (report.warnings.length > 0) {
    answer = `Your profile is ${report.completenessScore}% complete. `;
    answer += `I've found ${report.warnings.length} area(s) where additional information would be helpful.`;
  } else {
    answer = 'Your core profile is complete. Consider exploring additional modules like Employment, Education, and Housing.';
  }

  return answer;
}

/**
 * Build Wallet Coverage Meter
 */
export function buildWalletCoverageMeter(report: IntegrityReport): {
  overallCoverage: number;
  criticalDocuments: {
    name: string;
    status: 'uploaded' | 'missing' | 'recommended';
    importance: 'critical' | 'high' | 'medium';
    description: string;
  }[];
  summary: string;
} {
  const docChecks = report.criticalIssues
    .concat(report.warnings)
    .concat(report.infoItems)
    .filter(c => c.category === 'documents');

  const criticalDocuments = [
    {
      name: 'DD-214',
      status: docChecks.some(c => c.checkId === 'doc-dd214-missing') ? 'missing' as const : 'uploaded' as const,
      importance: 'critical' as const,
      description: 'Required for most VA benefits and claims',
    },
    {
      name: 'VA Rating Decision',
      status: docChecks.some(c => c.checkId === 'doc-rating-missing') ? 'missing' as const : 'uploaded' as const,
      importance: 'high' as const,
      description: 'Verifies your current service-connected disabilities and ratings',
    },
    {
      name: 'Medical Records',
      status: docChecks.some(c => c.checkId === 'doc-medical-missing') ? 'recommended' as const : 'uploaded' as const,
      importance: 'medium' as const,
      description: 'Strengthens claims and appeals',
    },
  ];

  const uploadedCount = criticalDocuments.filter(d => d.status === 'uploaded').length;
  const overallCoverage = Math.round((uploadedCount / criticalDocuments.length) * 100);

  let summary = '';
  if (overallCoverage === 100) {
    summary = 'Excellent! All critical documents are uploaded.';
  } else if (overallCoverage >= 66) {
    summary = 'Good document coverage. Consider adding remaining documents.';
  } else {
    summary = 'Important documents are missing. Upload them to improve your profile.';
  }

  return {
    overallCoverage,
    criticalDocuments,
    summary,
  };
}

/**
 * Build Mission Pack Blockers Display
 */
export function buildMissionPackBlockers(report: IntegrityReport, missionPackId: string): {
  isBlocked: boolean;
  blockers: {
    checkName: string;
    message: string;
    action: string;
  }[];
  warnings: {
    checkName: string;
    message: string;
    action: string;
  }[];
} {
  // Filter checks relevant to this mission pack
  const missionChecks = report.criticalIssues
    .concat(report.warnings)
    .filter(c => c.category === 'missions' && c.checkId.includes(missionPackId.toLowerCase()));

  const blockers = missionChecks
    .filter(c => c.blocksCompletion)
    .map(c => ({
      checkName: c.checkName,
      message: c.message,
      action: c.suggestedActions[0],
    }));

  const warnings = missionChecks
    .filter(c => !c.blocksCompletion)
    .map(c => ({
      checkName: c.checkName,
      message: c.message,
      action: c.suggestedActions[0],
    }));

  return {
    isBlocked: blockers.length > 0,
    blockers,
    warnings,
  };
}

/**
 * Build Readiness Index Integrity Contribution
 * Returns how integrity checks affect the Readiness Index
 */
export function buildReadinessIndexContribution(report: IntegrityReport): {
  documentsScore: number;
  profileScore: number;
  benefitsScore: number;
  evidenceScore: number;
  adjustments: {
    category: string;
    penalty: number;
    reason: string;
  }[];
} {
  const adjustments = [];

  // Document penalties
  if (report.categoryScores.documents < 100) {
    const penalty = (100 - report.categoryScores.documents) / 10; // Max 10 point penalty
    adjustments.push({
      category: 'Documents',
      penalty: Math.round(penalty),
      reason: 'Missing critical documents',
    });
  }

  // Profile penalties
  if (report.categoryScores.profile < 100) {
    const penalty = (100 - report.categoryScores.profile) / 10;
    adjustments.push({
      category: 'Profile',
      penalty: Math.round(penalty),
      reason: 'Incomplete profile information',
    });
  }

  return {
    documentsScore: report.categoryScores.documents,
    profileScore: report.categoryScores.profile,
    benefitsScore: report.categoryScores.benefits,
    evidenceScore: report.categoryScores.evidence,
    adjustments,
  };
}

/**
 * Format integrity report as plain text for logging/export
 */
export function formatReportAsText(report: IntegrityReport): string {
  let text = '=== rallyforge INTEGRITY REPORT ===\n';
  text += `Timestamp: ${report.timestamp.toLocaleString()}\n`;
  text += `Overall Status: ${report.overallStatus.toUpperCase()}\n`;
  text += `Completeness Score: ${report.completenessScore}%\n\n`;

  if (report.criticalIssues.length > 0) {
    text += '=== CRITICAL ISSUES ===\n';
    for (const issue of report.criticalIssues) {
      text += `\n[${issue.checkName}]\n`;
      text += `  ${issue.message}\n`;
      text += `  Actions:\n`;
      for (const action of issue.suggestedActions) {
        text += `    - ${action}\n`;
      }
    }
    text += '\n';
  }

  if (report.warnings.length > 0) {
    text += '=== WARNINGS ===\n';
    for (const warning of report.warnings) {
      text += `\n[${warning.checkName}]\n`;
      text += `  ${warning.message}\n`;
      text += `  Recommended: ${warning.suggestedActions[0]}\n`;
    }
    text += '\n';
  }

  text += '=== NEXT STEPS ===\n';
  for (const step of report.nextSteps) {
    text += `${step}\n`;
  }

  return text;
}

