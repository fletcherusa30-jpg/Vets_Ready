/**
 * CFR Part 4 Diagnostic Code Function
 *
 * MANDATORY SINGLE SOURCE OF TRUTH for all disability diagnostic codes in rallyforge.
 *
 * Purpose:
 * - Unified lookup system for all CFR Part 4 diagnostic codes (38 CFR §4.1-4.150)
 * - Provides condition names, rating criteria, body systems, special rules
 * - Search capabilities: exact, partial, fuzzy, synonym, multi-word
 * - Auto-complete support for all UI components
 *
 * Integration Points:
 * - Wizard: Auto-fill diagnostic codes when veteran enters condition name
 * - Digital Twin: Store diagnosticCode for each disability
 * - Matrix Engine: Use rating criteria and special rules in all benefit calculations
 * - Evidence Builder: Suggest evidence types based on diagnostic code requirements
 * - Opportunity Radar: Surface code-specific claim opportunities
 * - Readiness Index: Score evidence completeness by diagnostic code
 *
 * Data Source: cfrPart4.json (CFR Part 4 §4.71a-4.130)
 */

import cfrPart4Data from './cfrPart4.json';

export interface CFRCondition {
  diagnosticCode: string;
  conditionName: string;
  bodySystem: string;
  ratingCriteria: Record<string, string>; // percentage -> description
  minimumRating: number;
  maximumRating: number;
  specialRules: string[];
  crossReferences: string[];
  isPresumptive: boolean;
  presumptiveNotes?: string;
  synonyms: string[];
}

export interface CFRSearchResult {
  condition: CFRCondition;
  matchScore: number; // 0-100, higher = better match
  matchType: 'exact' | 'partial' | 'synonym' | 'fuzzy';
  matchedField: 'code' | 'name' | 'synonym';
}

export interface CFRSuggestion {
  diagnosticCode: string;
  conditionName: string;
  matchType: string;
  preview: string; // First rating criteria or description
}

// Pre-indexed cache for fast lookups
let indexedConditions: Map<string, CFRCondition> | null = null;
let synonymIndex: Map<string, string[]> | null = null; // synonym -> [diagnosticCodes]
let bodySystemIndex: Map<string, string[]> | null = null; // bodySystem -> [diagnosticCodes]

/**
 * Initialize indexes for fast lookups
 */
function initializeIndexes(): void {
  if (indexedConditions) return; // Already initialized

  indexedConditions = new Map();
  synonymIndex = new Map();
  bodySystemIndex = new Map();

  cfrPart4Data.conditions.forEach((condition: CFRCondition) => {
    // Index by diagnostic code
    indexedConditions!.set(condition.diagnosticCode, condition);

    // Index by synonyms
    condition.synonyms.forEach((synonym) => {
      const normalizedSynonym = synonym.toLowerCase().trim();
      const existing = synonymIndex!.get(normalizedSynonym) || [];
      existing.push(condition.diagnosticCode);
      synonymIndex!.set(normalizedSynonym, existing);
    });

    // Index by body system
    const existing = bodySystemIndex!.get(condition.bodySystem) || [];
    existing.push(condition.diagnosticCode);
    bodySystemIndex!.set(condition.bodySystem, existing);
  });
}

/**
 * Search for diagnostic codes by condition name or code
 *
 * Supports:
 * - Exact code match: "9411" -> PTSD
 * - Partial code match: "94" -> All 94XX codes
 * - Exact name match: "PTSD" -> Post-Traumatic Stress Disorder
 * - Partial name match: "knee" -> All knee-related conditions
 * - Synonym match: "flat feet" -> Pes Planus
 * - Multi-word match: "sleep apnea" -> Sleep Apnea Syndrome
 * - Fuzzy match: "sciatica" -> Paralysis of the Sciatic Nerve
 *
 * @param query - Search query (code or condition name)
 * @param limit - Maximum results to return (default 10)
 * @returns Array of search results sorted by match score (highest first)
 */
export function searchDiagnosticCode(
  query: string,
  limit: number = 10
): CFRSearchResult[] {
  initializeIndexes();

  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: CFRSearchResult[] = [];

  cfrPart4Data.conditions.forEach((condition: CFRCondition) => {
    let matchScore = 0;
    let matchType: CFRSearchResult['matchType'] = 'fuzzy';
    let matchedField: CFRSearchResult['matchedField'] = 'name';

    // Exact code match (highest priority)
    if (condition.diagnosticCode === query) {
      matchScore = 100;
      matchType = 'exact';
      matchedField = 'code';
    }
    // Partial code match
    else if (condition.diagnosticCode.startsWith(query)) {
      matchScore = 90;
      matchType = 'partial';
      matchedField = 'code';
    }
    // Exact name match
    else if (condition.conditionName.toLowerCase() === normalizedQuery) {
      matchScore = 95;
      matchType = 'exact';
      matchedField = 'name';
    }
    // Exact synonym match
    else if (condition.synonyms.some((syn) => syn.toLowerCase() === normalizedQuery)) {
      matchScore = 90;
      matchType = 'synonym';
      matchedField = 'synonym';
    }
    // Partial name match (contains all query words)
    else if (containsAllWords(condition.conditionName.toLowerCase(), normalizedQuery)) {
      matchScore = 80;
      matchType = 'partial';
      matchedField = 'name';
    }
    // Partial synonym match
    else if (
      condition.synonyms.some((syn) =>
        containsAllWords(syn.toLowerCase(), normalizedQuery)
      )
    ) {
      matchScore = 75;
      matchType = 'partial';
      matchedField = 'synonym';
    }
    // Fuzzy name match (contains any query word)
    else if (containsAnyWord(condition.conditionName.toLowerCase(), normalizedQuery)) {
      matchScore = 60;
      matchType = 'fuzzy';
      matchedField = 'name';
    }
    // Fuzzy synonym match
    else if (
      condition.synonyms.some((syn) => containsAnyWord(syn.toLowerCase(), normalizedQuery))
    ) {
      matchScore = 55;
      matchType = 'fuzzy';
      matchedField = 'synonym';
    }

    if (matchScore > 0) {
      results.push({
        condition,
        matchScore,
        matchType,
        matchedField,
      });
    }
  });

  // Sort by match score (highest first) and return top results
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

/**
 * Get diagnostic code details by exact code
 *
 * @param code - Diagnostic code (e.g., "9411", "5260")
 * @returns CFRCondition or null if not found
 */
export function getDiagnosticCodeDetails(code: string): CFRCondition | null {
  initializeIndexes();
  return indexedConditions!.get(code) || null;
}

/**
 * Validate that a diagnostic code exists in CFR Part 4
 *
 * @param code - Diagnostic code to validate
 * @returns true if code exists, false otherwise
 */
export function validateDiagnosticCode(code: string): boolean {
  initializeIndexes();
  return indexedConditions!.has(code);
}

/**
 * Suggest matching conditions for auto-complete
 * Used in searchable dropdowns and form inputs
 *
 * @param input - Partial input from user
 * @param limit - Maximum suggestions to return (default 5)
 * @returns Array of suggestions sorted by relevance
 */
export function suggestMatchingConditions(
  input: string,
  limit: number = 5
): CFRSuggestion[] {
  const searchResults = searchDiagnosticCode(input, limit);

  return searchResults.map((result) => {
    const firstRating = Object.entries(result.condition.ratingCriteria)[0];
    const preview = firstRating
      ? `${firstRating[0]}%: ${firstRating[1].slice(0, 80)}...`
      : result.condition.conditionName;

    return {
      diagnosticCode: result.condition.diagnosticCode,
      conditionName: result.condition.conditionName,
      matchType: `${result.matchType} (${result.matchedField})`,
      preview,
    };
  });
}

/**
 * Get all conditions for a specific body system
 *
 * @param bodySystem - Body system name (e.g., "Musculoskeletal", "Mental Health")
 * @returns Array of conditions in that body system
 */
export function getConditionsByBodySystem(bodySystem: string): CFRCondition[] {
  initializeIndexes();
  const codes = bodySystemIndex!.get(bodySystem) || [];
  return codes.map((code) => indexedConditions!.get(code)!).filter(Boolean);
}

/**
 * Get all unique body systems
 *
 * @returns Array of body system names
 */
export function getAllBodySystems(): string[] {
  initializeIndexes();
  return Array.from(bodySystemIndex!.keys()).sort();
}

/**
 * Get rating criteria for a specific diagnostic code and percentage
 *
 * @param code - Diagnostic code
 * @param percentage - Rating percentage (0, 10, 20, 30, 40, 50, 60, 70, 100)
 * @returns Rating criteria description or null if not found
 */
export function getRatingCriteria(code: string, percentage: number): string | null {
  const condition = getDiagnosticCodeDetails(code);
  if (!condition) return null;

  return condition.ratingCriteria[percentage.toString()] || null;
}

/**
 * Get all available rating percentages for a diagnostic code
 *
 * @param code - Diagnostic code
 * @returns Array of available rating percentages sorted ascending
 */
export function getAvailableRatings(code: string): number[] {
  const condition = getDiagnosticCodeDetails(code);
  if (!condition) return [];

  return Object.keys(condition.ratingCriteria)
    .map((p) => parseInt(p, 10))
    .sort((a, b) => a - b);
}

/**
 * Check if a condition is presumptive service-connected
 *
 * @param code - Diagnostic code
 * @returns true if presumptive, false otherwise
 */
export function isPresumptiveCondition(code: string): boolean {
  const condition = getDiagnosticCodeDetails(code);
  return condition?.isPresumptive || false;
}

/**
 * Get cross-references for a diagnostic code
 * Used to suggest related conditions or alternative rating codes
 *
 * @param code - Diagnostic code
 * @returns Array of cross-reference notes
 */
export function getCrossReferences(code: string): string[] {
  const condition = getDiagnosticCodeDetails(code);
  return condition?.crossReferences || [];
}

/**
 * Get special rules for a diagnostic code
 * Used to guide evidence gathering and claim preparation
 *
 * @param code - Diagnostic code
 * @returns Array of special rule notes
 */
export function getSpecialRules(code: string): string[] {
  const condition = getDiagnosticCodeDetails(code);
  return condition?.specialRules || [];
}

/**
 * Find secondary condition opportunities based on primary condition
 *
 * @param primaryCode - Primary diagnostic code
 * @returns Array of potential secondary conditions
 */
export function findSecondaryOpportunities(primaryCode: string): CFRCondition[] {
  const condition = getDiagnosticCodeDetails(primaryCode);
  if (!condition) return [];

  const opportunities: CFRCondition[] = [];

  // PTSD -> Sleep Apnea, IBS, GERD, Migraines
  if (primaryCode === '9411') {
    const codes = ['6847', '7304', '7203', '8100'];
    codes.forEach((code) => {
      const secondary = getDiagnosticCodeDetails(code);
      if (secondary) opportunities.push(secondary);
    });
  }

  // Back (IVDS/Strain) -> Sciatica, Knee, Hip
  if (primaryCode === '5243' || primaryCode === '5237') {
    const codes = ['8520', '5260', '5252'];
    codes.forEach((code) => {
      const secondary = getDiagnosticCodeDetails(code);
      if (secondary) opportunities.push(secondary);
    });
  }

  // TBI -> PTSD, Migraines, Tinnitus
  if (primaryCode === '8045') {
    const codes = ['9411', '8100', '6260'];
    codes.forEach((code) => {
      const secondary = getDiagnosticCodeDetails(code);
      if (secondary) opportunities.push(secondary);
    });
  }

  // Knee -> Back (secondary to compensatory gait)
  if (primaryCode === '5260' || primaryCode === '5257') {
    const codes = ['5243', '5237'];
    codes.forEach((code) => {
      const secondary = getDiagnosticCodeDetails(code);
      if (secondary) opportunities.push(secondary);
    });
  }

  // Rhinitis/Sinusitis -> Sleep Apnea
  if (primaryCode === '6522' || primaryCode === '6510') {
    const secondary = getDiagnosticCodeDetails('6847');
    if (secondary) opportunities.push(secondary);
  }

  return opportunities;
}

/**
 * Get evidence requirements for a diagnostic code
 * Based on special rules and rating criteria
 *
 * @param code - Diagnostic code
 * @returns Array of evidence requirement notes
 */
export function getEvidenceRequirements(code: string): string[] {
  const condition = getDiagnosticCodeDetails(code);
  if (!condition) return [];

  const requirements: string[] = [];

  // Mental health conditions
  if (condition.bodySystem === 'Mental Health') {
    requirements.push('C&P examination with mental health specialist');
    requirements.push('Lay statements describing occupational and social impairment');
    requirements.push('Service treatment records showing diagnosis or stressor');
    if (code === '9411') {
      requirements.push('Stressor statement describing in-service traumatic event');
      requirements.push('Buddy statements corroborating stressor (if available)');
    }
  }

  // Musculoskeletal conditions
  if (condition.bodySystem === 'Musculoskeletal') {
    requirements.push('C&P examination with range of motion measurements');
    requirements.push('X-rays or MRI showing condition');
    requirements.push('Service treatment records showing onset');
    if (code.startsWith('5')) {
      requirements.push('Lay statements describing functional limitations');
      requirements.push('Goniometer measurements from private physician (if available)');
    }
  }

  // Respiratory conditions
  if (condition.bodySystem === 'Respiratory') {
    if (code === '6847') {
      requirements.push('Sleep study showing apnea-hypopnea index (AHI)');
      requirements.push('Documentation of CPAP usage (if prescribed)');
      requirements.push('Buddy/spouse statement about snoring and breathing pauses');
    } else if (code === '6602') {
      requirements.push('Pulmonary function tests (PFTs)');
      requirements.push('Medication records showing treatment');
      requirements.push('ER visits or hospitalizations for exacerbations');
    }
  }

  // Neurological conditions
  if (condition.bodySystem === 'Neurological') {
    requirements.push('C&P neurological examination');
    if (code === '8045') {
      requirements.push('Traumatic brain injury documentation (acute phase)');
      requirements.push('Cognitive testing results');
      requirements.push('Lay statements from family/friends describing changes');
    } else if (code === '8520') {
      requirements.push('EMG/NCS (nerve conduction study) results');
      requirements.push('Evidence of radiculopathy or nerve damage');
    }
  }

  // Cardiovascular conditions
  if (condition.bodySystem === 'Cardiovascular') {
    if (code === '7101') {
      requirements.push('Blood pressure readings over 12 months (multiple dates)');
      requirements.push('Medication records showing treatment');
      requirements.push('Evidence of continuous medication for 20% or higher');
    }
  }

  // Digestive conditions
  if (condition.bodySystem === 'Digestive') {
    if (code === '7203') {
      requirements.push('Endoscopy report showing GERD findings');
      requirements.push('Medication records (PPIs, H2 blockers)');
    } else if (code === '7304') {
      requirements.push('Diagnosis from gastroenterologist');
      requirements.push('Colonoscopy ruling out IBD (if performed)');
      requirements.push('Lay statements describing frequency and severity');
    }
  }

  // Ear conditions
  if (condition.bodySystem === 'Ear') {
    if (code === '6100') {
      requirements.push('Audiogram showing hearing thresholds');
      requirements.push('Speech discrimination testing');
      requirements.push('Evidence of noise exposure in service');
    } else if (code === '6260') {
      requirements.push('C&P examination confirming tinnitus');
      requirements.push('Lay statement describing tinnitus characteristics');
    }
  }

  // Add special rules as evidence requirements
  condition.specialRules.forEach((rule) => {
    if (
      rule.includes('requires') ||
      rule.includes('must') ||
      rule.includes('need') ||
      rule.includes('documentation')
    ) {
      requirements.push(rule);
    }
  });

  return requirements;
}

// Helper functions

/**
 * Check if text contains all words from query
 */
function containsAllWords(text: string, query: string): boolean {
  const queryWords = query.split(/\s+/);
  return queryWords.every((word) => text.includes(word));
}

/**
 * Check if text contains any word from query
 */
function containsAnyWord(text: string, query: string): boolean {
  const queryWords = query.split(/\s+/);
  return queryWords.some((word) => text.includes(word));
}

/**
 * Export all conditions for reference
 */
export function getAllConditions(): CFRCondition[] {
  initializeIndexes();
  return Array.from(indexedConditions!.values());
}

/**
 * Get statistics about CFR Part 4 catalog
 */
export function getCatalogStats() {
  initializeIndexes();
  return {
    totalConditions: indexedConditions!.size,
    totalBodySystems: bodySystemIndex!.size,
    presumptiveConditions: Array.from(indexedConditions!.values()).filter(
      (c) => c.isPresumptive
    ).length,
    conditionsByBodySystem: Object.fromEntries(
      Array.from(bodySystemIndex!.entries()).map(([system, codes]) => [
        system,
        codes.length,
      ])
    ),
  };
}

