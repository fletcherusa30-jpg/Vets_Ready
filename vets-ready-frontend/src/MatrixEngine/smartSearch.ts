/**
 * VETERAN SMART SEARCH (GLOBAL)
 *
 * Global search that can find anything in the app.
 * Context-aware using Digital Twin.
 *
 * INTEGRATIONS:
 * - Digital Twin (context for ranking)
 * - All modules (deep links)
 * - Benefits catalog
 * - Discounts catalog
 * - Local resources
 * - Documents
 * - Conditions
 * - Evidence templates
 * - Mission Packs
 * - Tools
 */

import { DigitalTwin } from '../types/digitalTwin';

export type SearchResultType =
  | 'benefit'
  | 'discount'
  | 'local-resource'
  | 'document'
  | 'condition'
  | 'evidence-template'
  | 'mission-pack'
  | 'tool'
  | 'page'
  | 'calculator'
  | 'help';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  icon: string;
  url: string;
  relevanceScore: number;
  category?: string;
  tags?: string[];
}

/**
 * Global search function
 */
export function searchGlobal(
  query: string,
  digitalTwin: DigitalTwin,
  options: {
    types?: SearchResultType[];
    maxResults?: number;
  } = {}
): SearchResult[] {
  const { types, maxResults = 20 } = options;

  if (!query || query.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  // Search benefits
  if (!types || types.includes('benefit')) {
    // Simplified - would integrate with actual benefits catalog
    const benefitResults: SearchResult[] = [
      {
        id: 'benefit-disability',
        type: 'benefit',
        title: 'Disability Compensation',
        description: 'Monthly payments for service-connected disabilities',
        icon: '💰',
        url: '/benefits/disability-compensation',
        relevanceScore: 0,
        category: 'Disability',
        tags: ['compensation', 'rating', 'monthly-payment'],
      },
      {
        id: 'benefit-healthcare',
        type: 'benefit',
        title: 'VA Healthcare',
        description: 'Comprehensive healthcare services',
        icon: '🏥',
        url: '/benefits/healthcare',
        relevanceScore: 0,
        category: 'Healthcare',
        tags: ['medical', 'healthcare', 'hospital'],
      },
      {
        id: 'benefit-home-loan',
        type: 'benefit',
        title: 'VA Home Loan',
        description: 'Home loan guarantee program',
        icon: '🏠',
        url: '/benefits/home-loan',
        relevanceScore: 0,
        category: 'Housing',
        tags: ['housing', 'loan', 'mortgage', 'home'],
      },
      {
        id: 'benefit-education',
        type: 'benefit',
        title: 'GI Bill Education Benefits',
        description: 'Education and training assistance',
        icon: '🎓',
        url: '/benefits/education',
        relevanceScore: 0,
        category: 'Education',
        tags: ['education', 'school', 'training', 'gi-bill'],
      },
    ];

    benefitResults.forEach(result => {
      const score = calculateRelevance(query, result, digitalTwin);
      if (score > 0) {
        results.push({ ...result, relevanceScore: score });
      }
    });
  }

  // Search tools
  if (!types || types.includes('tool') || types.includes('calculator')) {
    const toolResults: SearchResult[] = [
      {
        id: 'tool-disability-calculator',
        type: 'calculator',
        title: 'VA Disability Calculator',
        description: 'Calculate your combined VA disability rating',
        icon: '🧮',
        url: '/tools/disability-calculator',
        relevanceScore: 0,
        tags: ['calculator', 'rating', 'disability', 'combined'],
      },
      {
        id: 'tool-lay-statement',
        type: 'tool',
        title: 'Lay Statement Builder',
        description: 'Create supporting statements for your claim',
        icon: '📝',
        url: '/tools/lay-statement-builder',
        relevanceScore: 0,
        tags: ['statement', 'claim', 'evidence', 'support'],
      },
      {
        id: 'tool-secondary-finder',
        type: 'tool',
        title: 'Secondary Condition Finder',
        description: 'Find potential secondary service-connected conditions',
        icon: '🔍',
        url: '/tools/secondary-condition-finder',
        relevanceScore: 0,
        tags: ['secondary', 'condition', 'finder', 'related'],
      },
    ];

    toolResults.forEach(result => {
      const score = calculateRelevance(query, result, digitalTwin);
      if (score > 0) {
        results.push({ ...result, relevanceScore: score });
      }
    });
  }

  // Search mission packs
  if (!types || types.includes('mission-pack')) {
    const missionPackResults: SearchResult[] = [
      {
        id: 'pack-file-claim',
        type: 'mission-pack',
        title: 'File for Disability Compensation',
        description: 'Step-by-step guide to filing your first claim',
        icon: '📋',
        url: '/mission-packs/file-disability-claim',
        relevanceScore: 0,
        tags: ['claim', 'disability', 'file', 'apply'],
      },
      {
        id: 'pack-home-loan',
        type: 'mission-pack',
        title: 'Apply for VA Home Loan',
        description: 'Complete guide to getting your VA home loan',
        icon: '🏡',
        url: '/mission-packs/va-home-loan',
        relevanceScore: 0,
        tags: ['home', 'loan', 'mortgage', 'buy'],
      },
    ];

    missionPackResults.forEach(result => {
      const score = calculateRelevance(query, result, digitalTwin);
      if (score > 0) {
        results.push({ ...result, relevanceScore: score });
      }
    });
  }

  // Search pages
  if (!types || types.includes('page')) {
    const pageResults: SearchResult[] = [
      {
        id: 'page-dashboard',
        type: 'page',
        title: 'Dashboard',
        description: 'Your personalized veteran dashboard',
        icon: '🏠',
        url: '/dashboard',
        relevanceScore: 0,
        tags: ['home', 'dashboard', 'overview'],
      },
      {
        id: 'page-wizard',
        type: 'page',
        title: 'Setup Wizard',
        description: 'Complete your veteran profile',
        icon: '🧭',
        url: '/wizard',
        relevanceScore: 0,
        tags: ['wizard', 'setup', 'profile', 'start'],
      },
      {
        id: 'page-discounts',
        type: 'page',
        title: 'Military Discounts',
        description: 'Find veteran and military discounts',
        icon: '🎁',
        url: '/discounts',
        relevanceScore: 0,
        tags: ['discount', 'perks', 'savings', 'deals'],
      },
    ];

    pageResults.forEach(result => {
      const score = calculateRelevance(query, result, digitalTwin);
      if (score > 0) {
        results.push({ ...result, relevanceScore: score });
      }
    });
  }

  // Sort by relevance
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Limit results
  return results.slice(0, maxResults);
}

/**
 * Calculate relevance score for a search result
 */
function calculateRelevance(
  query: string,
  result: SearchResult,
  digitalTwin: DigitalTwin
): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Title exact match
  if (result.title.toLowerCase() === queryLower) {
    score += 100;
  }

  // Title contains query
  if (result.title.toLowerCase().includes(queryLower)) {
    score += 50;
  }

  // Description contains query
  if (result.description.toLowerCase().includes(queryLower)) {
    score += 30;
  }

  // Tag exact match
  if (result.tags?.some(tag => tag === queryLower)) {
    score += 40;
  }

  // Tag contains query
  if (result.tags?.some(tag => tag.includes(queryLower))) {
    score += 20;
  }

  // Context boost based on Digital Twin

  // Boost disability-related results if user has disabilities
  if ((digitalTwin.disabilities?.length || 0) > 0) {
    if (result.tags?.includes('disability') || result.tags?.includes('rating')) {
      score += 10;
    }
  }

  // Boost home loan if buying-home life situation
  if (digitalTwin.lifeSituation?.currentMode === 'buying-home') {
    if (result.tags?.includes('home') || result.tags?.includes('loan')) {
      score += 15;
    }
  }

  // Boost education if going-to-school
  if (digitalTwin.lifeSituation?.currentMode === 'going-to-school') {
    if (result.tags?.includes('education') || result.tags?.includes('gi-bill')) {
      score += 15;
    }
  }

  // Boost claim-related if filing-claim
  if (digitalTwin.lifeSituation?.currentMode === 'filing-claim') {
    if (result.tags?.includes('claim') || result.tags?.includes('evidence')) {
      score += 15;
    }
  }

  return score;
}

/**
 * Get search suggestions (autocomplete)
 */
export function getSearchSuggestions(
  query: string,
  digitalTwin: DigitalTwin
): string[] {
  if (!query || query.length < 2) {
    // Return popular searches if no query
    return [
      'disability rating',
      'home loan',
      'GI Bill',
      'healthcare',
      'file a claim',
      'discounts',
      'secondary conditions',
    ];
  }

  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  // Common search terms
  const commonSearches = [
    'disability compensation',
    'disability calculator',
    'disability rating',
    'VA home loan',
    'GI Bill',
    'healthcare enrollment',
    'file a claim',
    'lay statement',
    'secondary conditions',
    'military discounts',
    'appeal decision',
    'medical records',
    'DD-214',
    'rating letter',
    'C&P exam',
    'TDIU',
    'VR&E',
    'dependent benefits',
  ];

  commonSearches.forEach(term => {
    if (term.toLowerCase().includes(queryLower)) {
      suggestions.push(term);
    }
  });

  return suggestions.slice(0, 5);
}

/**
 * Group results by type
 */
export function groupSearchResults(results: SearchResult[]): Record<string, SearchResult[]> {
  const grouped: Record<string, SearchResult[]> = {};

  results.forEach(result => {
    if (!grouped[result.type]) {
      grouped[result.type] = [];
    }
    grouped[result.type].push(result);
  });

  return grouped;
}

/**
 * Get type label
 */
export function getSearchTypeLabel(type: SearchResultType): string {
  const labels: Record<SearchResultType, string> = {
    benefit: 'Benefits',
    discount: 'Discounts',
    'local-resource': 'Local Resources',
    document: 'Documents',
    condition: 'Conditions',
    'evidence-template': 'Evidence Templates',
    'mission-pack': 'Mission Packs',
    tool: 'Tools',
    calculator: 'Calculators',
    page: 'Pages',
    help: 'Help',
  };

  return labels[type] || type;
}
