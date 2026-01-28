/**
 * Claim Preparation Engine
 * VetsReady Platform - Educational & Preparatory Tool
 *
 * Analyzes veteran's claim goals and generates comprehensive
 * preparation guidance including evidence checklists, CFR criteria,
 * secondary condition suggestions, and strategic recommendations.
 *
 * DOES NOT file claims - provides preparation guidance only.
 */

import cfrDatabase from '../data/cfrDiagnosticCodes.json';
import type {
  CFRDatabase,
  CFRDiagnosticCode,
  ClaimPreparationData,
  EvidenceChecklist
} from '../types/wizardTypes';

const cfrCodes = cfrDatabase as CFRDatabase;

/**
 * Find CFR diagnostic code by condition name
 */
export function findDiagnosticCode(conditionName: string): CFRDiagnosticCode | null {
  const normalizedName = conditionName.toLowerCase();

  // Search all body systems
  for (const system of Object.keys(cfrCodes)) {
    const codes = (cfrCodes as any)[system] as CFRDiagnosticCode[];
    const match = codes.find(code =>
      code.condition.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(code.condition.toLowerCase())
    );
    if (match) return match;
  }

  return null;
}

/**
 * Get all CFR codes for a body system
 */
export function getCodesForBodySystem(bodySystem: string): CFRDiagnosticCode[] {
  return (cfrCodes as any)[bodySystem.toLowerCase()] || [];
}

/**
 * Generate evidence checklist for condition
 */
export function generateEvidenceChecklist(
  condition: string,
  claimType: 'new' | 'increase' | 'secondary' | 'supplemental'
): EvidenceChecklist[] {
  const code = findDiagnosticCode(condition);
  const checklists: EvidenceChecklist[] = [];

  // Service Connection Evidence
  if (claimType === 'new' || claimType === 'secondary') {
    checklists.push({
      category: 'Service Connection Evidence',
      items: [
        {
          item: 'Service medical records showing in-service injury, event, or diagnosis',
          required: true,
          provided: false,
          notes: 'Critical for establishing service connection'
        },
        {
          item: 'Lay statement describing in-service event or onset of symptoms',
          required: true,
          provided: false,
          notes: 'Your personal account is powerful evidence'
        },
        {
          item: 'Buddy statements from fellow service members',
          required: false,
          provided: false,
          notes: 'Corroborates your account'
        }
      ]
    });
  }

  // Current Diagnosis
  checklists.push({
    category: 'Current Diagnosis',
    items: [
      {
        item: 'Official diagnosis from healthcare provider',
        required: true,
        provided: false,
        notes: 'Must be formally diagnosed'
      },
      {
        item: 'Recent medical records (within 12 months)',
        required: true,
        provided: false,
        notes: 'Shows current severity'
      },
      {
        item: 'Diagnostic test results (X-rays, MRI, blood work, etc.)',
        required: code ? true : false,
        provided: false,
        notes: code ? `Required for ${condition}` : 'If applicable'
      }
    ]
  });

  // Nexus (Medical Link)
  if (claimType === 'new' || claimType === 'secondary') {
    checklists.push({
      category: 'Nexus (Medical Link)',
      items: [
        {
          item: 'Nexus letter from healthcare provider',
          required: true,
          provided: false,
          notes: 'Must state "at least as likely as not" caused by service or primary condition'
        },
        {
          item: 'Medical journal articles or research supporting connection',
          required: false,
          provided: false,
          notes: 'Strengthens nexus argument'
        }
      ]
    });
  }

  // Severity Evidence
  checklists.push({
    category: 'Severity Evidence',
    items: [
      {
        item: 'Symptom log or journal',
        required: false,
        provided: false,
        notes: 'Documents frequency and severity'
      },
      {
        item: 'Medication list and prescription records',
        required: true,
        provided: false,
        notes: 'Shows treatment and severity'
      },
      {
        item: 'ER visits or hospitalizations',
        required: false,
        provided: false,
        notes: 'Demonstrates acute exacerbations'
      },
      {
        item: 'Work impact documentation',
        required: false,
        provided: false,
        notes: 'Sick leave, reduced hours, job changes'
      }
    ]
  });

  // Condition-Specific Evidence
  if (code && code.evidenceRequired.length > 0) {
    checklists.push({
      category: `${condition} - Specific Evidence`,
      items: code.evidenceRequired.map(item => ({
        item,
        required: true,
        provided: false,
        notes: `Required per 38 CFR ${code.code}`
      }))
    });
  }

  // DBQ (Disability Benefits Questionnaire)
  checklists.push({
    category: 'DBQ (Optional but Recommended)',
    items: [
      {
        item: `DBQ for ${condition}`,
        required: false,
        provided: false,
        notes: 'Standardized form that VA uses - can expedite claim'
      }
    ]
  });

  return checklists;
}

/**
 * Get CFR rating criteria for condition
 */
export function getCFRCriteria(condition: string, currentRating?: number): string {
  const code = findDiagnosticCode(condition);

  if (!code) {
    return `No CFR diagnostic code found for "${condition}". Consult 38 CFR Part 4 for rating criteria.`;
  }

  let criteria = `**38 CFR ${code.code} - ${code.condition}**\n\n`;
  criteria += `**Body System:** ${code.bodySystem}\n\n`;
  criteria += `**Rating Levels:**\n`;

  for (const level of code.ratingLevels) {
    const isCurrent = currentRating === level.rating;
    criteria += `${isCurrent ? '→ ' : '  '}**${level.rating}%** - ${level.criteria}\n`;
  }

  criteria += `\n**Notes:** ${code.notes}\n`;

  return criteria;
}

/**
 * Suggest secondary conditions
 */
export function suggestSecondaryConditions(primaryCondition: string): string[] {
  const code = findDiagnosticCode(primaryCondition);
  return code ? code.secondaryConditions : [];
}

/**
 * Generate claim preparation strategy
 */
export function generateClaimStrategy(
  condition: string,
  claimType: 'new' | 'increase' | 'secondary' | 'supplemental',
  currentRating: number = 0,
  targetRating?: number,
  primaryCondition?: string
): ClaimPreparationData {
  const code = findDiagnosticCode(condition);
  const evidenceChecklists = generateEvidenceChecklist(condition, claimType);

  // Calculate missing evidence
  const evidenceMissing: string[] = [];
  evidenceChecklists.forEach(checklist => {
    checklist.items
      .filter(item => item.required && !item.provided)
      .forEach(item => evidenceMissing.push(item.item));
  });

  // Generate strategy
  let strategy = '';

  if (claimType === 'new') {
    strategy = `**New Service Connection Claim for ${condition}**\n\n`;
    strategy += `1. **Establish Service Connection:** Prove in-service event, injury, or onset\n`;
    strategy += `2. **Current Diagnosis:** Obtain formal diagnosis from healthcare provider\n`;
    strategy += `3. **Nexus:** Get medical opinion linking condition to service\n`;
    strategy += `4. **Severity:** Document current symptoms and functional impact\n`;
  } else if (claimType === 'increase') {
    const nextLevel = code?.ratingLevels.find(l => l.rating > currentRating);
    strategy = `**Increased Rating Claim for ${condition}**\n\n`;
    strategy += `Current Rating: ${currentRating}%\n`;
    if (targetRating) strategy += `Target Rating: ${targetRating}%\n`;
    if (nextLevel) {
      strategy += `\nNext Rating Level: ${nextLevel.rating}%\n`;
      strategy += `Criteria: ${nextLevel.criteria}\n`;
    }
    strategy += `\n1. **Document Worsening:** Show symptoms have increased since last rating\n`;
    strategy += `2. **Meet Higher Criteria:** Demonstrate you meet criteria for higher rating\n`;
    strategy += `3. **Functional Impact:** Prove increased impact on work and daily life\n`;
  } else if (claimType === 'secondary') {
    strategy = `**Secondary Service Connection Claim**\n\n`;
    strategy += `Primary Condition: ${primaryCondition}\n`;
    strategy += `Secondary Condition: ${condition}\n\n`;
    strategy += `1. **Primary Must Be Service-Connected:** ${primaryCondition} must already be rated\n`;
    strategy += `2. **Medical Nexus:** Prove ${condition} was caused or aggravated by ${primaryCondition}\n`;
    strategy += `3. **Current Diagnosis:** Get formal diagnosis of ${condition}\n`;
    strategy += `4. **Medical Research:** Find studies linking the two conditions\n`;
  } else if (claimType === 'supplemental') {
    strategy = `**Supplemental Claim for ${condition}**\n\n`;
    strategy += `1. **New Evidence:** Provide new and relevant evidence not previously submitted\n`;
    strategy += `2. **Address Previous Denial:** Directly address reasons for denial\n`;
    strategy += `3. **Stronger Nexus:** Get more definitive medical opinion\n`;
    strategy += `4. **Additional Documentation:** More detailed evidence of severity\n`;
  }

  // Lay statement topics
  const layStatementTopics: string[] = [
    `Describe when symptoms first began`,
    `Detail how condition affects daily activities`,
    `Explain impact on work and employment`,
    `Describe frequency and severity of flare-ups`,
    `Document any hospitalizations or ER visits`,
    `Explain treatment history and medications`,
    `Describe how condition has worsened over time`
  ];

  return {
    condition,
    diagnosticCode: code?.code,
    currentRating,
    targetRating,
    claimType,
    primaryCondition,
    evidenceProvided: [],
    evidenceMissing,
    cfrCriteria: getCFRCriteria(condition, currentRating),
    suggestedStrategy: strategy,
    layStatementTopics,
    secondaryConnectionSuggestions: code?.secondaryConditions || []
  };
}

/**
 * Generate lay statement template
 */
export function generateLayStatementTemplate(
  condition: string,
  veteranName: string,
  topics: string[]
): string {
  let template = `**LAY STATEMENT**\n\n`;
  template += `**TO:** Department of Veterans Affairs\n`;
  template += `**FROM:** ${veteranName}\n`;
  template += `**DATE:** ${new Date().toLocaleDateString()}\n`;
  template += `**RE:** Service Connection for ${condition}\n\n`;
  template += `**STATEMENT:**\n\n`;
  template += `I, ${veteranName}, hereby provide this lay statement in support of my claim for service connection for ${condition}.\n\n`;

  topics.forEach((topic, idx) => {
    template += `**${idx + 1}. ${topic}:**\n`;
    template += `[Provide detailed description here]\n\n`;
  });

  template += `I declare under penalty of perjury that the foregoing is true and correct to the best of my knowledge and belief.\n\n`;
  template += `Signature: _______________________\n`;
  template += `Date: ${new Date().toLocaleDateString()}\n`;

  return template;
}

/**
 * Get all conditions from CFR database
 */
export function getAllConditions(): Array<{ code: string; condition: string; bodySystem: string }> {
  const allConditions: Array<{ code: string; condition: string; bodySystem: string }> = [];

  for (const system of Object.keys(cfrCodes)) {
    const codes = (cfrCodes as any)[system] as CFRDiagnosticCode[];
    codes.forEach(code => {
      allConditions.push({
        code: code.code,
        condition: code.condition,
        bodySystem: code.bodySystem
      });
    });
  }

  return allConditions.sort((a, b) => a.condition.localeCompare(b.condition));
}

/**
 * Search CFR database
 */
export function searchCFRDatabase(query: string): CFRDiagnosticCode[] {
  const normalizedQuery = query.toLowerCase();
  const results: CFRDiagnosticCode[] = [];

  for (const system of Object.keys(cfrCodes)) {
    const codes = (cfrCodes as any)[system] as CFRDiagnosticCode[];
    codes.forEach(code => {
      if (
        code.condition.toLowerCase().includes(normalizedQuery) ||
        code.code.includes(normalizedQuery) ||
        code.bodySystem.toLowerCase().includes(normalizedQuery)
      ) {
        results.push(code);
      }
    });
  }

  return results;
}
