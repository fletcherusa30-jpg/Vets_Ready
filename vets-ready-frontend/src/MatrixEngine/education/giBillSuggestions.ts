/**
 * GI Bill Suggestions Engine
 * Recommends GI Bill programs based on veteran profile and education goals
 */

export interface GIBillProgram {
  id: string;
  name: string;
  type: 'Post-9/11' | 'Montgomery Active Duty' | 'Montgomery Selected Reserve' | 'VEAP' | 'DEA';
  description: string;
  monthlyHousingAllowance: boolean;
  bookStipend: number;
  tuitionCoverage: string;
  monthsAvailable: number;
  transferable: boolean;
  yellowRibbonEligible: boolean;
  eligibilityRequirements: string[];
  bestFor: string[];
  limitations: string[];
}

export interface EducationGoal {
  degreeType: '2-year' | '4-year' | 'Graduate' | 'Certificate' | 'Apprenticeship' | 'OJT';
  fieldOfStudy: string;
  timeline: 'Full-time' | 'Part-time';
  location: 'In-person' | 'Online' | 'Hybrid';
  estimatedCost: number;
}

export interface GIBillRecommendation {
  program: GIBillProgram;
  matchScore: number;
  monthlyBenefit: number;
  totalBenefit: number;
  reasoning: string[];
  actionSteps: string[];
}

// GI Bill Programs Database
const GI_BILL_PROGRAMS: GIBillProgram[] = [
  {
    id: 'post-911',
    name: 'Post-9/11 GI Bill (Chapter 33)',
    type: 'Post-9/11',
    description: 'The most comprehensive education benefit for veterans who served after September 10, 2001',
    monthlyHousingAllowance: true,
    bookStipend: 1000,
    tuitionCoverage: 'Up to 100% at public schools, up to $28,937.36/year at private schools',
    monthsAvailable: 36,
    transferable: true,
    yellowRibbonEligible: true,
    eligibilityRequirements: [
      'Served on active duty for 90+ days after 9/10/2001',
      'Honorable discharge',
      'Still serving on active duty',
    ],
    bestFor: [
      'Full-time college students',
      'Veterans attending expensive private schools (with Yellow Ribbon)',
      'Those needing housing allowance',
      'Veterans with dependents who want to transfer benefits',
    ],
    limitations: [
      'Benefits expire 15 years after discharge',
      'Part-time students receive prorated housing allowance',
      'Private school tuition capped annually',
    ],
  },
  {
    id: 'mgib-ad',
    name: 'Montgomery GI Bill Active Duty (Chapter 30)',
    type: 'Montgomery Active Duty',
    description: 'Monthly benefit for veterans who contributed $100/month for 12 months while on active duty',
    monthlyHousingAllowance: false,
    bookStipend: 0,
    tuitionCoverage: 'Up to $2,210/month for 36 months',
    monthsAvailable: 36,
    transferable: false,
    yellowRibbonEligible: false,
    eligibilityRequirements: [
      'Contributed $1,200 ($100/month for 12 months)',
      'High school diploma or GED before completing service',
      'Honorable discharge',
      'Served 2+ years active duty',
    ],
    bestFor: [
      'Veterans who paid into MGIB and want flat monthly payment',
      'Those using benefits for non-degree programs',
      'Apprenticeships and on-the-job training',
    ],
    limitations: [
      'No housing allowance (flat payment only)',
      'No book stipend',
      'Benefits expire 10 years after discharge',
      'Cannot be used simultaneously with Post-9/11',
    ],
  },
  {
    id: 'vrne',
    name: 'VR&E (Veteran Readiness & Employment)',
    type: 'Post-9/11',
    description: 'Education and training for veterans with service-connected disabilities seeking employment',
    monthlyHousingAllowance: true,
    bookStipend: 0,
    tuitionCoverage: 'Full tuition, fees, books, supplies covered',
    monthsAvailable: 48,
    transferable: false,
    yellowRibbonEligible: false,
    eligibilityRequirements: [
      '10%+ VA disability rating',
      'Employment handicap due to service-connected disability',
      'Within 12 years of discharge (or 12 years from disability rating date)',
    ],
    bestFor: [
      'Veterans with service-connected disabilities affecting employment',
      'Those needing comprehensive support beyond GI Bill',
      'Veterans requiring assistive technology or accommodations',
      'Those needing job placement assistance',
    ],
    limitations: [
      'Requires approval from VR&E counselor',
      'Must pursue employment goal',
      'Focuses on employability',
    ],
  },
  {
    id: 'dea',
    name: 'DEA (Dependents\' Educational Assistance - Chapter 35)',
    type: 'DEA',
    description: 'Education benefits for dependents of veterans with 100% P&T or who died from service-connected causes',
    monthlyHousingAllowance: false,
    bookStipend: 0,
    tuitionCoverage: 'Up to $1,298/month for 45 months',
    monthsAvailable: 45,
    transferable: false,
    yellowRibbonEligible: false,
    eligibilityRequirements: [
      'Dependent of veteran with 100% Permanent & Total disability',
      'Or dependent of veteran who died from service-connected condition',
      'Or dependent of servicemember MIA or POW',
    ],
    bestFor: [
      'Spouses and children of 100% P&T veterans',
      'Survivors of veterans who died from service-connected causes',
    ],
    limitations: [
      'Lower monthly payment than Post-9/11',
      'Age restrictions for children (18-26)',
      'Time restrictions for spouses (10 years)',
    ],
  },
];

/**
 * Calculate GI Bill percentage based on service time
 */
export function calculateGIBillPercentage(daysOfService: number): number {
  if (daysOfService >= 1095) return 100; // 36 months (3 years)
  if (daysOfService >= 730) return 90;   // 24 months (2 years)
  if (daysOfService >= 548) return 80;   // 18 months
  if (daysOfService >= 365) return 70;   // 12 months
  if (daysOfService >= 180) return 60;   // 6 months
  if (daysOfService >= 90) return 50;    // 90 days
  return 0;
}

/**
 * Calculate monthly housing allowance
 */
export function calculateMonthlyHousingAllowance(
  zipCode: string,
  giBillPercentage: number,
  isOnline: boolean,
  dependents: number = 0
): number {
  // Base BAH rates (simplified - would use actual BAH tables in production)
  const baseBah = isOnline ? 916.50 : 2000; // Online gets half of national average
  const percentageMultiplier = giBillPercentage / 100;

  return Math.round(baseBah * percentageMultiplier);
}

/**
 * Get GI Bill recommendations
 */
export function getGIBillRecommendations(
  profile: {
    daysOfService: number;
    disabilityRating?: number;
    honorableDischarge: boolean;
    post911Service: boolean;
    dependents?: number;
  },
  goal: EducationGoal
): GIBillRecommendation[] {
  const recommendations: GIBillRecommendation[] = [];
  const giPercentage = calculateGIBillPercentage(profile.daysOfService);

  // Post-9/11 GI Bill
  if (profile.post911Service && profile.honorableDischarge && profile.daysOfService >= 90) {
    const housingAllowance = calculateMonthlyHousingAllowance(
      '00000',
      giPercentage,
      goal.location === 'Online'
    );

    const reasoning: string[] = [
      `You're eligible for ${giPercentage}% of Post-9/11 GI Bill benefits`,
      `Monthly housing allowance: $${housingAllowance.toLocaleString()}`,
      `Book stipend: $1,000/year`,
    ];

    if (giPercentage === 100) {
      reasoning.push('Full tuition covered at public schools');
      reasoning.push('Yellow Ribbon program available for private schools');
    }

    recommendations.push({
      program: GI_BILL_PROGRAMS[0],
      matchScore: 95,
      monthlyBenefit: housingAllowance,
      totalBenefit: (housingAllowance * 36) + (1000 * 3), // 36 months + 3 years books
      reasoning,
      actionSteps: [
        'Apply at VA.gov',
        'Request Certificate of Eligibility (COE)',
        'Verify school participates in GI Bill',
        'Submit COE to school certifying official',
      ],
    });
  }

  // VR&E
  if (profile.disabilityRating && profile.disabilityRating >= 10) {
    recommendations.push({
      program: GI_BILL_PROGRAMS[2],
      matchScore: 90,
      monthlyBenefit: 2000, // Estimated
      totalBenefit: 96000, // 48 months
      reasoning: [
        `You have ${profile.disabilityRating}% disability rating`,
        'VR&E covers full tuition, books, and supplies',
        'Provides 48 months of benefits (12 more than GI Bill)',
        'Includes job placement assistance',
        'Can use VR&E first, then GI Bill for additional education',
      ],
      actionSteps: [
        'Schedule VR&E orientation at VA.gov',
        'Meet with VR&E counselor',
        'Develop rehabilitation plan',
        'Get counselor approval for program',
      ],
    });
  }

  // MGIB (if contributed)
  if (profile.daysOfService >= 730 && profile.honorableDischarge) {
    recommendations.push({
      program: GI_BILL_PROGRAMS[1],
      matchScore: 70,
      monthlyBenefit: 2210,
      totalBenefit: 79560,
      reasoning: [
        'Flat $2,210/month payment for 36 months',
        'Good for part-time or non-degree programs',
        'Can be used for apprenticeships',
      ],
      actionSteps: [
        'Verify you contributed $1,200 during service',
        'Apply at VA.gov',
        'Consider if Post-9/11 might be better (one-time irreversible switch)',
      ],
    });
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Compare GI Bill programs
 */
export function compareGIBillPrograms(programs: GIBillProgram[]): {
  program: string;
  tuition: string;
  housing: string;
  books: string;
  duration: string;
  transferable: string;
}[] {
  return programs.map(p => ({
    program: p.name,
    tuition: p.tuitionCoverage,
    housing: p.monthlyHousingAllowance ? 'Yes (BAH rate)' : 'No',
    books: p.bookStipend > 0 ? `$${p.bookStipend}/year` : 'No',
    duration: `${p.monthsAvailable} months`,
    transferable: p.transferable ? 'Yes' : 'No',
  }));
}

/**
 * Get GI Bill tips
 */
export function getGIBillTips(): string[] {
  return [
    'Use VR&E first if eligible (save GI Bill for later)',
    'Yellow Ribbon program can cover private school costs beyond the cap',
    'Housing allowance is based on school ZIP code (online = national average ÷ 2)',
    'Part-time students get prorated housing allowance',
    'Kicker bonuses (if you have one) add to monthly payment',
    'Post-9/11 is usually better than MGIB, but compare both',
    'Transfer benefits to dependents before leaving service (must serve additional time)',
    'Benefits expire 15 years after discharge (Post-9/11)',
    'Can use GI Bill for certifications, apprenticeships, licensing',
    'Yellow Ribbon schools listed at VA.gov',
  ];
}
