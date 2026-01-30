/**
 * Opportunity Radar - Benefit Scanner
 * Scans federal, state, and local benefits catalog for matches
 */

export interface Benefit {
  id: string;
  name: string;
  category: 'federal' | 'state' | 'local';
  type: string; // Healthcare, Housing, Education, Employment, Financial, etc.
  description: string;
  eligibilityCriteria: string[];
  provider: string;
  website?: string;
  phone?: string;
  applicationProcess?: string;
}

export interface BenefitMatch {
  benefit: Benefit;
  relevanceScore: number; // 0-100
  eligibilityStatus: 'Eligible' | 'Likely Eligible' | 'Maybe Eligible' | 'Not Eligible';
  reasoning: string;
  actionItems?: string[];
}

/**
 * Mock benefits catalog (in production, this would be loaded from JSON file or API)
 */
const MOCK_BENEFITS: Benefit[] = [
  {
    id: 'fed-voc-rehab',
    name: 'Veteran Readiness and Employment (VR&E)',
    category: 'federal',
    type: 'Employment',
    description: 'Helps veterans with service-connected disabilities prepare for, find, and maintain suitable employment.',
    eligibilityCriteria: [
      'Have a service-connected disability rating of at least 10%',
      'Have an employment handicap (20%+ rating)',
      'Apply within 12 years of separation or notice of rating',
    ],
    provider: 'Department of Veterans Affairs',
    website: 'https://www.va.gov/careers-employment/vocational-rehabilitation/',
    phone: '1-800-827-1000',
  },
  {
    id: 'fed-gi-bill',
    name: 'Post-9/11 GI Bill',
    category: 'federal',
    type: 'Education',
    description: 'Provides financial support for education and housing to veterans who served after September 10, 2001.',
    eligibilityCriteria: [
      'Served on active duty for at least 90 days after 9/11/2001',
      'Received honorable discharge',
    ],
    provider: 'Department of Veterans Affairs',
    website: 'https://www.va.gov/education/about-gi-bill-benefits/post-9-11/',
    phone: '1-888-442-4551',
  },
  {
    id: 'fed-healthcare',
    name: 'VA Healthcare',
    category: 'federal',
    type: 'Healthcare',
    description: 'Comprehensive healthcare services for eligible veterans.',
    eligibilityCriteria: [
      'Served in active military, naval, or air service',
      'Separated under conditions other than dishonorable',
    ],
    provider: 'Department of Veterans Affairs',
    website: 'https://www.va.gov/health-care/',
    phone: '1-877-222-8387',
  },
  {
    id: 'fed-va-loan',
    name: 'VA Home Loan Guarantee',
    category: 'federal',
    type: 'Housing',
    description: 'Helps veterans purchase, build, repair, or adapt a home with no down payment.',
    eligibilityCriteria: [
      'Served minimum service requirements',
      'Obtained Certificate of Eligibility (COE)',
      'Meet lender credit and income requirements',
    ],
    provider: 'Department of Veterans Affairs',
    website: 'https://www.va.gov/housing-assistance/home-loans/',
    phone: '1-877-827-3702',
  },
];

/**
 * Scans benefits catalog and returns matches based on veteran profile
 */
export function scanBenefits(profile: {
  branch?: string;
  dischargeType?: string;
  serviceConnectedRating?: number;
  enlistmentDate?: Date | string;
  dischargeDate?: Date | string;
  post911Service?: boolean;
  hasEmploymentNeeds?: boolean;
  hasEducationGoals?: boolean;
  hasHousingNeeds?: boolean;
}): BenefitMatch[] {
  const matches: BenefitMatch[] = [];

  for (const benefit of MOCK_BENEFITS) {
    const match = matchBenefit(benefit, profile);
    if (match.relevanceScore > 30) {
      // Only include if relevance > 30%
      matches.push(match);
    }
  }

  // Sort by relevance score (highest first)
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return matches;
}

/**
 * Matches a single benefit to veteran profile
 */
function matchBenefit(
  benefit: Benefit,
  profile: {
    branch?: string;
    dischargeType?: string;
    serviceConnectedRating?: number;
    enlistmentDate?: Date | string;
    dischargeDate?: Date | string;
    post911Service?: boolean;
    hasEmploymentNeeds?: boolean;
    hasEducationGoals?: boolean;
    hasHousingNeeds?: boolean;
  }
): BenefitMatch {
  let relevanceScore = 0;
  let eligibilityStatus: BenefitMatch['eligibilityStatus'] = 'Not Eligible';
  const reasoning: string[] = [];
  const actionItems: string[] = [];

  // Base relevance: Does the benefit type match veteran's stated needs?
  if (benefit.type === 'Employment' && profile.hasEmploymentNeeds) {
    relevanceScore += 30;
    reasoning.push('Matches employment needs');
  }
  if (benefit.type === 'Education' && profile.hasEducationGoals) {
    relevanceScore += 30;
    reasoning.push('Matches education goals');
  }
  if (benefit.type === 'Housing' && profile.hasHousingNeeds) {
    relevanceScore += 30;
    reasoning.push('Matches housing needs');
  }
  if (benefit.type === 'Healthcare') {
    relevanceScore += 20; // Always somewhat relevant
    reasoning.push('Healthcare is important for all veterans');
  }

  // Check specific eligibility criteria
  if (benefit.id === 'fed-voc-rehab') {
    if (profile.serviceConnectedRating && profile.serviceConnectedRating >= 10) {
      relevanceScore += 40;
      eligibilityStatus = profile.serviceConnectedRating >= 20 ? 'Eligible' : 'Likely Eligible';
      reasoning.push(`${profile.serviceConnectedRating}% rating meets minimum requirement`);
    } else {
      reasoning.push('Requires 10%+ service-connected rating');
      actionItems.push('File claim for service-connected conditions');
    }
  }

  if (benefit.id === 'fed-gi-bill') {
    if (profile.post911Service) {
      relevanceScore += 40;
      if (profile.dischargeType === 'Honorable') {
        eligibilityStatus = 'Eligible';
        reasoning.push('Served post-9/11 with honorable discharge');
      } else {
        eligibilityStatus = 'Likely Eligible';
        reasoning.push('Served post-9/11, verify discharge status');
      }
    } else {
      reasoning.push('Requires post-9/11 service');
    }
  }

  if (benefit.id === 'fed-healthcare') {
    if (profile.dischargeType !== 'Dishonorable') {
      relevanceScore += 30;
      eligibilityStatus = 'Eligible';
      reasoning.push('Eligible for VA Healthcare with non-dishonorable discharge');
      actionItems.push('Enroll at VA.gov or call 1-877-222-8387');
    } else {
      reasoning.push('Requires non-dishonorable discharge');
    }
  }

  if (benefit.id === 'fed-va-loan') {
    if (profile.dischargeType === 'Honorable') {
      relevanceScore += 35;
      eligibilityStatus = 'Likely Eligible';
      reasoning.push('Honorable discharge meets basic requirement');
      actionItems.push('Obtain Certificate of Eligibility (COE)');
      actionItems.push('Contact VA-approved lender');
    }
  }

  // Cap relevance at 100
  relevanceScore = Math.min(relevanceScore, 100);

  return {
    benefit,
    relevanceScore,
    eligibilityStatus,
    reasoning: reasoning.join('. '),
    actionItems: actionItems.length > 0 ? actionItems : undefined,
  };
}

/**
 * Gets top N opportunities
 */
export function getTopOpportunities(
  matches: BenefitMatch[],
  count: number = 5
): BenefitMatch[] {
  return matches.slice(0, count);
}

/**
 * Filters benefits by category
 */
export function filterByCategory(
  matches: BenefitMatch[],
  category: 'federal' | 'state' | 'local'
): BenefitMatch[] {
  return matches.filter(match => match.benefit.category === category);
}

/**
 * Filters benefits by type
 */
export function filterByType(
  matches: BenefitMatch[],
  type: string
): BenefitMatch[] {
  return matches.filter(match => match.benefit.type === type);
}
