/**
 * Export Service for rallyforge
 * Handles PDF and Markdown export of claim strategies
 */

import { WizardState, Disability, ClaimStrategyExport } from '../types/wizard.types';

/**
 * Generate Markdown export of claim strategy
 */
export function generateMarkdownExport(wizardState: WizardState): string {
  const timestamp = new Date().toLocaleString();
  const allConditions = [
    ...wizardState.serviceConnectedDisabilities,
    ...wizardState.candidateConditions,
    ...wizardState.deniedConditions,
  ];

  let md = `# VA Disability Claim Strategy\n\n`;
  md += `**Generated:** ${timestamp}  \n`;
  md += `**Complexity:** ${wizardState.complexity.toUpperCase()}  \n`;
  md += `**Total Conditions:** ${allConditions.length}\n\n`;

  md += `---\n\n`;

  // Executive Summary
  md += `## Executive Summary\n\n`;
  md += `This claim strategy document outlines your current VA disability status and planned claim strategy. `;
  md += `It includes AI-generated theories of entitlement, recommended evidence, and next steps.\n\n`;

  md += `### Summary Statistics\n\n`;
  md += `- **Service-Connected Conditions:** ${wizardState.serviceConnectedDisabilities.length}\n`;
  md += `- **Planned/Current Claims:** ${wizardState.candidateConditions.length}\n`;
  md += `- **Previously Denied Conditions:** ${wizardState.deniedConditions.length}\n`;
  md += `- **Conditions with AI Theories:** ${allConditions.filter(c => c.aiTheory).length}\n`;

  const totalCurrentRating = wizardState.serviceConnectedDisabilities.reduce(
    (sum, c) => sum + (c.currentRating || 0), 0
  );
  md += `- **Current Combined Rating:** ${totalCurrentRating}%\n\n`;

  md += `---\n\n`;

  // Service-Connected Conditions
  if (wizardState.serviceConnectedDisabilities.length > 0) {
    md += `## Current Service-Connected Conditions\n\n`;
    md += `These are your existing service-connected disabilities with current ratings:\n\n`;

    wizardState.serviceConnectedDisabilities.forEach((condition, idx) => {
      md += `### ${idx + 1}. ${condition.name}\n\n`;
      md += `- **Current Rating:** ${condition.currentRating}%\n`;
      md += `- **Service Connection Type:** ${formatConnectionType(condition.serviceConnectionType)}\n`;
      if (condition.effectiveDate) {
        md += `- **Effective Date:** ${new Date(condition.effectiveDate).toLocaleDateString()}\n`;
      }
      if (condition.description) {
        md += `- **Description:** ${condition.description}\n`;
      }
      md += `\n`;
    });

    md += `---\n\n`;
  }

  // Planned/Current Claims
  if (wizardState.candidateConditions.length > 0) {
    md += `## Planned/Current Claims\n\n`;
    md += `These are conditions you are planning to file for or have currently filed:\n\n`;

    wizardState.candidateConditions.forEach((condition, idx) => {
      md += `### ${idx + 1}. ${condition.name}\n\n`;
      md += `- **Status:** ${formatStatus(condition.status)}\n`;
      md += `- **Service Connection Type:** ${formatConnectionType(condition.serviceConnectionType)}\n`;

      // Secondary linkage
      if (condition.primaryConditionIds.length > 0) {
        const primaryCondition = allConditions.find(c => c.id === condition.primaryConditionIds[0]);
        if (primaryCondition) {
          md += `- **Secondary to:** ${primaryCondition.name} (${primaryCondition.currentRating || 0}%)\n`;
        }
      }

      if (condition.diagnosedInService) {
        md += `- **Diagnosed in Service:** Yes ✓\n`;
      }

      if (condition.description) {
        md += `\n**Description:**  \n${condition.description}\n`;
      }

      // AI Theory
      if (condition.aiTheory) {
        md += `\n#### Theory of Entitlement\n\n`;
        md += `${condition.aiTheory.primaryTheory}\n\n`;

        if (condition.aiTheory.nexusRationale) {
          md += `**Medical Nexus:**  \n${(condition.aiTheory.nexusRationale as any).medicalBasis || 'See details below'}\n\n`;
          md += `**Legal Basis:**  \n${(condition.aiTheory.nexusRationale as any).legalBasis || 'See details below'}\n\n`;
        }

        if ((condition.aiTheory as any).policyReferences && (condition.aiTheory as any).policyReferences.length > 0) {
          md += `**Policy References:**\n\n`;
          (condition.aiTheory as any).policyReferences.forEach((ref: any) => {
            md += `- **${ref.source}** - ${ref.citation}: ${ref.relevance}\n`;
          });
          md += `\n`;
        }

        if (condition.aiTheory.recommendedEvidence && condition.aiTheory.recommendedEvidence.length > 0) {
          md += `**Recommended Evidence:**\n\n`;
          condition.aiTheory.recommendedEvidence.forEach(evidence => {
            md += `- **[${evidence.priority.toUpperCase()}]** ${evidence.description}\n`;
            md += `  - *Where to obtain:* ${(evidence as any).whereToObtain || 'Contact VA'}\n`;
          });
          md += `\n`;
        }

        if (condition.aiTheory.strengthAssessment) {
          md += `**Claim Strength Assessment:** ${condition.aiTheory.strengthAssessment.toUpperCase()}\n\n`;
        }

        if (condition.aiTheory.challenges && condition.aiTheory.challenges.length > 0) {
          md += `**Potential Challenges:**\n\n`;
          condition.aiTheory.challenges.forEach(challenge => {
            md += `- ${challenge}\n`;
          });
          md += `\n`;
        }

        if (condition.aiTheory.opportunities && condition.aiTheory.opportunities.length > 0) {
          md += `**Opportunities:**\n\n`;
          condition.aiTheory.opportunities.forEach(opp => {
            md += `- ${opp}\n`;
          });
          md += `\n`;
        }

        if ((condition.aiTheory as any).nextSteps && (condition.aiTheory as any).nextSteps.length > 0) {
          md += `**Next Steps:**\n\n`;
          (condition.aiTheory as any).nextSteps.forEach((step: any, stepIdx: any) => {
            md += `${stepIdx + 1}. ${step}\n`;
          });
          md += `\n`;
        }
      }

      md += `---\n\n`;
    });
  }

  // Denied Conditions
  if (wizardState.deniedConditions.length > 0) {
    md += `## Previously Denied Conditions\n\n`;
    md += `These conditions were previously denied and may be eligible for supplemental or appeal:\n\n`;

    wizardState.deniedConditions.forEach((condition, idx) => {
      md += `### ${idx + 1}. ${condition.name}\n\n`;
      md += `- **Service Connection Type:** ${formatConnectionType(condition.serviceConnectionType)}\n`;

      if (condition.denialDate) {
        md += `- **Denial Date:** ${new Date(condition.denialDate).toLocaleDateString()}\n`;
      }
      if ((condition as any).denialReason) {
        md += `- **Denial Reason:** ${(condition as any).denialReason}\n`;
      }

      if (condition.description) {
        md += `\n**Description:**  \n${condition.description}\n`;
      }

      if (condition.aiTheory) {
        md += `\n#### Recovery Strategy\n\n`;
        md += `${condition.aiTheory.primaryTheory}\n\n`;

        if (condition.aiTheory.recommendedEvidence && condition.aiTheory.recommendedEvidence.length > 0) {
          md += `**New Evidence Needed for Supplemental Claim:**\n\n`;
          condition.aiTheory.recommendedEvidence.forEach(evidence => {
            md += `- **[${evidence.priority.toUpperCase()}]** ${evidence.description}\n`;
          });
          md += `\n`;
        }
      }

      md += `---\n\n`;
    });
  }

  // Professional Recommendations
  md += `## Professional Recommendations\n\n`;
  const shouldRecommendPro = shouldRecommendProfessional(wizardState);
  if (shouldRecommendPro.recommend) {
    md += `⚠️ **We recommend consulting with a Veterans Service Officer (VSO) or VA-accredited attorney for the following reasons:**\n\n`;
    shouldRecommendPro.reasons.forEach(reason => {
      md += `- ${reason}\n`;
    });
    md += `\n`;
    md += `**Find a VSO:** Visit [VA.gov VSO Directory](https://www.va.gov/vso/)  \n`;
    md += `**Find an Attorney:** Visit [VA Office of General Counsel](https://www.va.gov/ogc/apps/accreditation/index.asp)\n\n`;
  } else {
    md += `Your claim appears straightforward enough to file on your own, but you may still benefit from VSO assistance (always free).\n\n`;
  }

  md += `---\n\n`;

  // Resources
  md += `## Additional Resources\n\n`;
  md += `### VA Resources\n\n`;
  md += `- **VA Claims Portal:** [VA.gov](https://www.va.gov/disability/)\n`;
  md += `- **eVetRecs (Records Request):** [eVetRecs.archives.gov](https://www.evetrecs.archives.gov/)\n`;
  md += `- **VA Forms:** [VA.gov Forms](https://www.va.gov/vaforms/)\n`;
  md += `- **M21-1 Adjudication Manual:** [VA Knowledge Base](https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/topic/554400000003559)\n`;
  md += `- **38 CFR Regulations:** [eCFR.gov Title 38](https://www.ecfr.gov/current/title-38/chapter-I/part-3)\n\n`;

  md += `### Key Forms\n\n`;
  md += `- **VA Form 21-526EZ:** Application for Disability Compensation\n`;
  md += `- **VA Form 21-4138:** Statement in Support of Claim (for lay statements)\n`;
  md += `- **VA Form 21-0781:** PTSD Statement\n`;
  md += `- **VA Form 21-0781a:** PTSD Statement (Personal Trauma)\n\n`;

  md += `---\n\n`;

  // Disclaimers
  md += `## Important Disclaimers\n\n`;
  md += `⚖️ **This is NOT legal advice.** This document is generated using AI analysis and is intended as educational guidance only.\n\n`;
  md += `**You should:**\n`;
  md += `- Consult with a Veterans Service Officer (VSO) or VA-accredited attorney before filing\n`;
  md += `- Verify all information and recommendations with official VA sources\n`;
  md += `- Understand that individual claim outcomes vary based on specific facts and evidence\n`;
  md += `- Keep in mind that VA regulations and policies change over time\n\n`;
  md += `**rallyforge:**\n`;
  md += `- Is not affiliated with the Department of Veterans Affairs\n`;
  md += `- Does not guarantee claim approval or specific ratings\n`;
  md += `- Is not responsible for claim outcomes\n`;
  md += `- Provides educational tools and information only\n\n`;

  md += `---\n\n`;
  md += `*Document generated by rallyforge on ${timestamp}*\n`;

  return md;
}

/**
 * Download Markdown file
 */
export function downloadMarkdown(wizardState: WizardState, filename?: string): void {
  const content = generateMarkdownExport(wizardState);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `rallyforge-claim-strategy-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate PDF export (placeholder - requires jsPDF library)
 */
export async function generatePDFExport(wizardState: WizardState): Promise<void> {
  try {
    // Attempt to use jsPDF for PDF export
    // @ts-ignore
    const jsPDF = (await import('jspdf')).jsPDF;
    const doc = new jsPDF();
    doc.text('rallyforge Claim Strategy Export', 10, 10);
    // Add more content as needed from wizardState
    doc.text('Exported on: ' + new Date().toLocaleString(), 10, 20);
    // ... (add more detailed export logic here)
    doc.save('rallyforge-claim-strategy.pdf');
  } catch (err) {
    // Robust fallback: warn user and fallback to markdown
    console.warn('PDF export failed or jsPDF not available. Falling back to Markdown.', err);
    downloadMarkdown(wizardState);
  }
  // ... add content
  // doc.save(`claim-strategy-${Date.now()}.pdf`);
}

/**
 * Create exportable JSON of wizard state
 */
export function exportToJSON(wizardState: WizardState): any {
  return {
    version: '1.0',
    wizardState,
    metadata: {
      totalConditions: wizardState.serviceConnectedDisabilities.length +
                      wizardState.candidateConditions.length +
                      wizardState.deniedConditions.length,
      complexity: wizardState.complexity,
      conditionsWithTheories: [
        ...wizardState.serviceConnectedDisabilities,
        ...wizardState.candidateConditions,
        ...wizardState.deniedConditions,
      ].filter(c => c.aiTheory).length,
    },
  };
}

/**
 * Download JSON export
 */
export function downloadJSON(wizardState: WizardState, filename?: string): void {
  const exportData = exportToJSON(wizardState);
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `rallyforge-export-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatConnectionType(type: string): string {
  const types: Record<string, string> = {
    'direct': 'Direct Service Connection',
    'secondary': 'Secondary to Service-Connected Condition',
    'aggravation': 'Aggravation of Pre-Existing Condition',
    'presumptive': 'Presumptive Service Connection',
  };
  return types[type] || type;
}

function formatStatus(status: string): string {
  const statuses: Record<string, string> = {
    'planned': 'Planned (not yet filed)',
    'filed': 'Currently Filed',
    'denied': 'Previously Denied',
    'granted': 'Granted',
    'service-connected': 'Service-Connected',
  };
  return statuses[status] || status;
}

function shouldRecommendProfessional(wizardState: WizardState): {
  recommend: boolean;
  reasons: string[];
} {
  const totalConditions = wizardState.serviceConnectedDisabilities.length +
                         wizardState.candidateConditions.length +
                         wizardState.deniedConditions.length;
  const hasDenials = wizardState.deniedConditions.length > 0;
  const hasComplexSecondary = wizardState.candidateConditions.some(
    c => c.primaryConditionIds.length > 0
  );
  const isTDIUCandidate = (wizardState as any).userPreferences?.isTDIUCandidate || false;
  const hasMultipleDenials = wizardState.deniedConditions.length > 1;

  const reasons: string[] = [];

  if (hasMultipleDenials) {
    reasons.push('You have multiple previously denied conditions that may require appeals strategy');
  } else if (hasDenials) {
    reasons.push('You have a previously denied condition that may benefit from professional review');
  }

  if (totalConditions > 8) {
    reasons.push(`Your claim involves ${totalConditions} conditions (high complexity)`);
  }

  if (hasComplexSecondary) {
    reasons.push('Complex secondary condition chains may benefit from expert medical nexus opinions');
  }

  if (isTDIUCandidate) {
    reasons.push('TDIU (Total Disability Individual Unemployability) eligibility requires careful documentation');
  }

  if (wizardState.complexity === 'complex') {
    reasons.push('Overall claim complexity rating is HIGH - professional guidance recommended');
  }

  return {
    recommend: reasons.length > 0,
    reasons,
  };
}

