/**
 * Secondary Condition Finder
 *
 * Purpose: Identify medically-recognized secondary conditions based on primary disabilities
 *
 * Features:
 * - Educational suggestions only (never medical advice)
 * - Confidence scoring (low/medium/high)
 * - Evidence type suggestions
 * - Integration with CFR diagnostic codes
 * - Medical literature references
 *
 * Integration Points:
 * - Wizard (auto-suggest secondary conditions)
 * - Claims Assistant (suggest secondary claims)
 * - Evidence Builder (provide templates)
 * - Digital Twin (store relationships)
 * - Opportunity Radar (surface opportunities)
 * - Mission Packs (trigger secondary claim missions)
 */

import secondaryRelationshipsData from './catalogs/secondaryRelationships.json';
import { getDiagnosticCodeDetails, type CFRCondition } from './catalogs/cfrDiagnosticCodeFunction';

export interface SecondaryCondition {
  code: string;
  name: string;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  evidenceTypes: string[];
  medicalLiterature: string;
}

export interface SecondaryRelationship {
  primaryCode: string;
  primaryName: string;
  secondaryConditions: SecondaryCondition[];
}

export interface SecondaryConditionSuggestion {
  primaryCondition: {
    code: string;
    name: string;
  };
  secondaryCondition: SecondaryCondition;
  cfrDetails?: CFRCondition;
  nextSteps: string[];
  disclaimers: string[];
}

/**
 * Find secondary conditions for a given primary condition
 *
 * @param primaryCode - CFR diagnostic code of primary condition
 * @returns Array of secondary condition suggestions
 */
export function findSecondaryConditions(primaryCode: string): SecondaryConditionSuggestion[] {
  const relationship = secondaryRelationshipsData.relationships.find(
    (r) => r.primaryCode === primaryCode
  );

  if (!relationship) {
    return [];
  }

  return relationship.secondaryConditions.map((secondary) => {
    const cfrDetails = getDiagnosticCodeDetails(secondary.code);

    return {
      primaryCondition: {
        code: relationship.primaryCode,
        name: relationship.primaryName,
      },
      secondaryCondition: {
        code: secondary.code,
        name: secondary.name,
        confidence: secondary.confidence as 'low' | 'medium' | 'high',
        explanation: secondary.explanation,
        evidenceTypes: secondary.evidenceTypes,
        medicalLiterature: secondary.medicalLiterature,
      },
      cfrDetails: cfrDetails || undefined,
      nextSteps: generateNextSteps({
        ...secondary,
        confidence: secondary.confidence as 'low' | 'medium' | 'high',
      }),
      disclaimers: [
        'This is educational information only, not medical advice.',
        'Consult with a healthcare provider for diagnosis and treatment.',
        'Secondary condition claims require medical nexus evidence.',
        'VA raters make final determinations on service connection.',
      ],
    };
  });
}

/**
 * Find all secondary conditions for multiple primary conditions
 *
 * @param primaryCodes - Array of CFR diagnostic codes
 * @returns Array of all secondary suggestions, deduplicated
 */
export function findAllSecondaryConditions(
  primaryCodes: string[]
): SecondaryConditionSuggestion[] {
  const allSuggestions: SecondaryConditionSuggestion[] = [];
  const seen = new Set<string>();

  primaryCodes.forEach((code) => {
    const suggestions = findSecondaryConditions(code);
    suggestions.forEach((suggestion) => {
      const key = `${suggestion.primaryCondition.code}-${suggestion.secondaryCondition.code}`;
      if (!seen.has(key)) {
        seen.add(key);
        allSuggestions.push(suggestion);
      }
    });
  });

  // Sort by confidence (high first)
  return allSuggestions.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    return (
      confidenceOrder[b.secondaryCondition.confidence] -
      confidenceOrder[a.secondaryCondition.confidence]
    );
  });
}

/**
 * Check if a condition has known secondary relationships
 *
 * @param primaryCode - CFR diagnostic code
 * @returns true if secondary relationships exist
 */
export function hasSecondaryConditions(primaryCode: string): boolean {
  return secondaryRelationshipsData.relationships.some((r) => r.primaryCode === primaryCode);
}

/**
 * Get count of secondary conditions for a primary
 *
 * @param primaryCode - CFR diagnostic code
 * @returns Number of known secondary conditions
 */
export function getSecondaryConditionCount(primaryCode: string): number {
  const relationship = secondaryRelationshipsData.relationships.find(
    (r) => r.primaryCode === primaryCode
  );
  return relationship?.secondaryConditions.length || 0;
}

/**
 * Generate next steps for pursuing a secondary condition claim
 *
 * @param secondary - Secondary condition
 * @returns Array of action items
 */
function generateNextSteps(secondary: SecondaryCondition): string[] {
  const steps: string[] = [];

  // Step 1: Get diagnosed
  steps.push(
    `Get a current diagnosis for ${secondary.name} from a healthcare provider.`
  );

  // Step 2: Establish timeline
  steps.push(
    'Document when symptoms started and how they progressed over time.'
  );

  // Step 3: Nexus evidence
  steps.push(
    `Obtain a nexus letter explaining how ${secondary.name} is caused by or aggravated by your primary condition.`
  );

  // Step 4: Gather supporting evidence
  secondary.evidenceTypes.forEach((evidenceType) => {
    steps.push(`Gather evidence: ${evidenceType}`);
  });

  // Step 5: File claim
  steps.push(
    `File a secondary service-connected claim for ${secondary.name} through VA.gov or with VSO assistance.`
  );

  return steps;
}

/**
 * Build evidence checklist for a secondary condition
 *
 * @param secondary - Secondary condition
 * @returns Evidence checklist with status tracking
 */
export function buildEvidenceChecklist(secondary: SecondaryCondition): Array<{
  item: string;
  required: boolean;
  completed: boolean;
  tips: string;
}> {
  const checklist: Array<{
    item: string;
    required: boolean;
    completed: boolean;
    tips: string;
  }> = [];

  // Required: Current diagnosis
  checklist.push({
    item: 'Current medical diagnosis',
    required: true,
    completed: false,
    tips: `Get a diagnosis for ${secondary.name} from a healthcare provider. This can be from VA or private provider.`,
  });

  // Required: Nexus letter
  checklist.push({
    item: 'Medical nexus opinion',
    required: true,
    completed: false,
    tips: `Get a statement from a doctor explaining how ${secondary.name} is "at least as likely as not" caused by your primary condition.`,
  });

  // Required: Lay statement
  checklist.push({
    item: 'Personal lay statement',
    required: true,
    completed: false,
    tips: 'Write a statement describing when symptoms started, how they progressed, and how they affect your daily life.',
  });

  // Recommended: Evidence types
  secondary.evidenceTypes.forEach((evidenceType) => {
    checklist.push({
      item: evidenceType,
      required: false,
      completed: false,
      tips: `This evidence strengthens your claim by providing objective medical proof of ${secondary.name}.`,
    });
  });

  // Recommended: Timeline documentation
  checklist.push({
    item: 'Timeline documentation',
    required: false,
    completed: false,
    tips: 'Show when symptoms started relative to your primary condition. Medical records with dates are ideal.',
  });

  // Recommended: Buddy/spouse statement
  checklist.push({
    item: 'Buddy or spouse statement',
    required: false,
    completed: false,
    tips: 'A statement from someone who witnessed your symptoms can add credibility to your claim.',
  });

  return checklist;
}

/**
 * Generate a lay statement template for a secondary condition
 *
 * @param primaryName - Name of primary condition
 * @param secondaryName - Name of secondary condition
 * @param veteranName - Veteran's name
 * @returns Lay statement template
 */
export function generateSecondaryLayStatementTemplate(
  primaryName: string,
  secondaryName: string,
  veteranName: string
): string {
  const today = new Date().toLocaleDateString();

  return `STATEMENT IN SUPPORT OF SECONDARY CONDITION CLAIM

Veteran Name: ${veteranName}
Date: ${today}

RE: Secondary Service Connection for ${secondaryName}

I, ${veteranName}, make this statement in support of my claim for secondary service connection for ${secondaryName} as caused by or aggravated by my service-connected ${primaryName}.

BACKGROUND:

I am currently service-connected for ${primaryName}. [Describe when you were service-connected, at what percentage, and how the condition has affected you.]

ONSET OF SECONDARY CONDITION:

I began experiencing symptoms of ${secondaryName} in approximately [MONTH/YEAR]. [Describe the first time you noticed symptoms and what you experienced.]

RELATIONSHIP TO PRIMARY CONDITION:

I believe my ${secondaryName} is directly caused by my service-connected ${primaryName} because: [Explain in your own words how you think one condition led to the other. Examples: medication side effects, compensatory movement causing new injuries, stress from primary condition, etc.]

PROGRESSION OVER TIME:

Since the onset of ${secondaryName}, my symptoms have: [Describe how symptoms have changed, worsened, or stayed the same. Mention any medical treatment you've sought.]

FUNCTIONAL IMPACT:

My ${secondaryName} affects my daily life in the following ways: [Describe specific impacts on work, relationships, physical activities, mental health, etc.]

CURRENT TREATMENT:

I am currently: [List medications, therapies, medical appointments, assistive devices, etc.]

SUPPORTING EVIDENCE:

I have attached the following evidence to support this claim:
- Medical records showing diagnosis of ${secondaryName}
- Nexus letter from [DOCTOR NAME] explaining the relationship
- [List any other evidence]

CERTIFICATION:

I certify that the above statements are true and correct to the best of my knowledge.

_________________________________
Signature

_________________________________
${veteranName} (Printed Name)

_________________________________
Date
`;
}

/**
 * Calculate secondary condition opportunity score
 *
 * Used by Opportunity Radar to prioritize secondary claims
 *
 * @param suggestion - Secondary condition suggestion
 * @returns Score (0-100)
 */
export function calculateSecondaryOpportunityScore(
  suggestion: SecondaryConditionSuggestion
): number {
  let score = 0;

  // Confidence weight (50 points max)
  if (suggestion.secondaryCondition.confidence === 'high') {
    score += 50;
  } else if (suggestion.secondaryCondition.confidence === 'medium') {
    score += 30;
  } else {
    score += 10;
  }

  // CFR rating potential (30 points max)
  if (suggestion.cfrDetails) {
    const maxRating = suggestion.cfrDetails.maximumRating;
    score += (maxRating / 100) * 30;
  }

  // Evidence availability (20 points max)
  const evidenceCount = suggestion.secondaryCondition.evidenceTypes.length;
  score += Math.min(20, evidenceCount * 4);

  return Math.round(score);
}

/**
 * Get all unique primary conditions with secondary relationships
 *
 * @returns Array of primary conditions
 */
export function getAllPrimaryConditionsWithSecondaries(): Array<{
  code: string;
  name: string;
  secondaryCount: number;
}> {
  return secondaryRelationshipsData.relationships.map((r) => ({
    code: r.primaryCode,
    name: r.primaryName,
    secondaryCount: r.secondaryConditions.length,
  }));
}

/**
 * Filter secondary suggestions by confidence level
 *
 * @param suggestions - Array of suggestions
 * @param minConfidence - Minimum confidence level
 * @returns Filtered suggestions
 */
export function filterByConfidence(
  suggestions: SecondaryConditionSuggestion[],
  minConfidence: 'low' | 'medium' | 'high'
): SecondaryConditionSuggestion[] {
  const confidenceOrder = { low: 1, medium: 2, high: 3 };
  const minLevel = confidenceOrder[minConfidence];

  return suggestions.filter(
    (s) => confidenceOrder[s.secondaryCondition.confidence] >= minLevel
  );
}
