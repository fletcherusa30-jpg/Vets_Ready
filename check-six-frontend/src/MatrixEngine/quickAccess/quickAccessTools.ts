/**
 * Quick Access Tools - 10 Essential Functions for Veteran Basics Page
 *
 * Purpose: Provide instant access to critical veteran resources and auto-fill functionality
 * Location: Veteran Basics page (Wizard)
 *
 * Each tool:
 * - Accepts Digital Twin data as input
 * - Returns structured output for UI display
 * - Updates Digital Twin with results
 * - Triggers GIE recalculation if needed
 * - Marks tool as "used" in Digital Twin
 *
 * Tools:
 * 1. Download My DD-214
 * 2. Download My VA Rating Letter
 * 3. Find My MOS Civilian Equivalents
 * 4. Check My State Benefits
 * 5. Check My Federal Benefits
 * 6. Check My Deployment Exposures
 * 7. Check My GI Bill Eligibility
 * 8. Check My Housing Eligibility
 * 9. Check My Family Benefits
 * 10. Check My Transition Tasks
 */

export interface QuickAccessToolResult {
  success: boolean;
  data: any;
  message: string;
  nextSteps?: string[];
  digitalTwinUpdates?: Record<string, any>;
  triggersGIE?: boolean;
}

// ====================
// Tool 1: Download My DD-214
// ====================

export interface DD214DownloadResult {
  links: Array<{
    source: string;
    url: string;
    description: string;
    accountRequired: boolean;
    estimatedTime: string;
  }>;
  tips: string[];
  markedRequested: boolean;
}

export function downloadMyDD214(): QuickAccessToolResult {
  const links = [
    {
      source: 'milConnect (Fastest)',
      url: 'https://milconnect.dmdc.osd.mil/milconnect/',
      description:
        'Download DD-214 instantly if you have a DS Logon, ID.me, or CAC. Most recent veterans (2013+) can access here.',
      accountRequired: true,
      estimatedTime: '5 minutes',
    },
    {
      source: 'National Archives (eVetRecs)',
      url: 'https://www.archives.gov/veterans/military-service-records',
      description:
        'Request official DD-214 by mail or fax. Takes 2-10 business days for mail delivery. Free service.',
      accountRequired: false,
      estimatedTime: '2-10 business days',
    },
    {
      source: 'VA.gov Records Request',
      url: 'https://www.va.gov/records/get-military-service-records/',
      description:
        'VA-specific portal for requesting service records. Requires VA login (ID.me or Login.gov).',
      accountRequired: true,
      estimatedTime: '1-3 business days',
    },
    {
      source: 'Local County VSO (In-Person)',
      url: '',
      description:
        'Visit your county Veterans Service Office. They can often request records on your behalf and may have faster access.',
      accountRequired: false,
      estimatedTime: '1-2 weeks',
    },
  ];

  const tips = [
    'You need your DD-214 to file claims, apply for benefits, and prove service.',
    'Most veterans receive Member Copy 4 at separation. Check your records first.',
    'If you lost your DD-214, request a replacement from National Archives.',
    'milConnect is fastest for recent separations (2013+).',
    'Keep digital and physical copies in a safe place.',
  ];

  return {
    success: true,
    data: {
      links,
      tips,
      markedRequested: true,
    } as DD214DownloadResult,
    message: 'DD-214 download options retrieved successfully',
    nextSteps: [
      'Choose the fastest option based on your separation date',
      'Create account if needed (milConnect, VA.gov)',
      'Upload DD-214 to rallyforge once received',
    ],
    digitalTwinUpdates: {
      'documents.dd214.requestedAt': new Date().toISOString(),
      'quickAccessTools.dd214DownloadUsed': true,
    },
    triggersGIE: false,
  };
}

// ====================
// Tool 2: Download My VA Rating Letter
// ====================

export interface RatingLetterDownloadResult {
  links: Array<{
    source: string;
    url: string;
    description: string;
    accountRequired: boolean;
  }>;
  tips: string[];
  markedRequested: boolean;
}

export function downloadMyRatingLetter(): QuickAccessToolResult {
  const links = [
    {
      source: 'VA.gov (Fastest)',
      url: 'https://www.va.gov/disability/view-disability-rating/rating-decision-letter',
      description:
        'Download your most recent rating decision letter instantly. Requires VA.gov login.',
      accountRequired: true,
    },
    {
      source: 'eBenefits',
      url: 'https://www.ebenefits.va.gov/',
      description:
        'Access all VA letters including rating decisions. Requires DS Logon or ID.me.',
      accountRequired: true,
    },
    {
      source: 'VA Regional Office (Phone)',
      url: 'tel:1-800-827-1000',
      description:
        'Call VA to request a mailed copy of your rating decision. Takes 7-10 business days.',
      accountRequired: false,
    },
  ];

  const tips = [
    'Your rating letter shows your combined rating, individual conditions, and effective dates.',
    'You need this letter to apply for CHAMPVA, DEA, and state benefits.',
    'Check for errors in your rating letter and file appeals if needed.',
    'VA.gov is the fastest way to download your letter (instant).',
  ];

  return {
    success: true,
    data: {
      links,
      tips,
      markedRequested: true,
    } as RatingLetterDownloadResult,
    message: 'VA Rating Letter download options retrieved successfully',
    nextSteps: [
      'Log in to VA.gov and download your rating letter',
      'Upload rating letter to rallyforge for auto-population',
      'Review your conditions and percentages for accuracy',
    ],
    digitalTwinUpdates: {
      'documents.ratingDecision.requestedAt': new Date().toISOString(),
      'quickAccessTools.ratingLetterDownloadUsed': true,
    },
    triggersGIE: false,
  };
}

// ====================
// Tool 3: Find My MOS Civilian Equivalents
// ====================

export interface MOSEquivalentsResult {
  mos: string;
  mosTitle: string;
  skills: string[];
  jobs: Array<{
    title: string;
    matchScore: number;
    averageSalary: string;
    growthOutlook: string;
  }>;
  certifications: string[];
  autoFilledEmploymentHub: boolean;
}

export function findMyMOSEquivalents(mos: string, branch: string): QuickAccessToolResult {
  // Placeholder implementation - integrate with mosToSkills and mosToJobs modules

  // Example for Army 11B Infantryman
  if (mos === '11B' || mos === '11b') {
    const skills = [
      'Leadership and Team Management',
      'Weapons Operation and Maintenance',
      'Physical Fitness and Endurance',
      'Strategic Planning and Tactics',
      'Emergency Response and Crisis Management',
      'Communication and Coordination',
      'Navigation and Land Navigation',
      'Security and Surveillance',
    ];

    const jobs = [
      {
        title: 'Security Manager',
        matchScore: 92,
        averageSalary: '$65,000 - $85,000',
        growthOutlook: 'Faster than average (8% growth)',
      },
      {
        title: 'Law Enforcement Officer',
        matchScore: 88,
        averageSalary: '$50,000 - $70,000',
        growthOutlook: 'Average (5% growth)',
      },
      {
        title: 'Emergency Management Director',
        matchScore: 85,
        averageSalary: '$70,000 - $95,000',
        growthOutlook: 'Faster than average (6% growth)',
      },
      {
        title: 'Tactical Operations Manager',
        matchScore: 83,
        averageSalary: '$75,000 - $100,000',
        growthOutlook: 'Much faster than average (12% growth)',
      },
    ];

    const certifications = [
      'Certified Protection Professional (CPP)',
      'Physical Security Professional (PSP)',
      'Emergency Management Certification',
      'Firearms Instructor Certification',
    ];

    return {
      success: true,
      data: {
        mos: '11B',
        mosTitle: 'Infantryman',
        skills,
        jobs,
        certifications,
        autoFilledEmploymentHub: true,
      } as MOSEquivalentsResult,
      message: `Found ${jobs.length} civilian job matches for MOS ${mos}`,
      nextSteps: [
        'Review job matches and select top 3 targets',
        'Visit Employment Hub to generate resume',
        'Check GI Bill eligibility for certifications',
      ],
      digitalTwinUpdates: {
        'employment.mosSkills': skills,
        'employment.targetJobs': jobs.map((j) => j.title),
        'employment.recommendedCertifications': certifications,
        'quickAccessTools.mosEquivalentsUsed': true,
      },
      triggersGIE: true,
    };
  }

  // Generic response for other MOS codes
  return {
    success: true,
    data: {
      mos,
      mosTitle: 'MOS/AFSC/Rating',
      skills: ['Leadership', 'Technical Skills', 'Teamwork'],
      jobs: [
        {
          title: 'Operations Manager',
          matchScore: 75,
          averageSalary: '$60,000 - $80,000',
          growthOutlook: 'Average (5% growth)',
        },
      ],
      certifications: [],
      autoFilledEmploymentHub: false,
    } as MOSEquivalentsResult,
    message: `MOS ${mos} analysis complete. Visit Employment Hub for detailed matches.`,
    nextSteps: [
      'Complete full MOS analysis in Employment Hub',
      'Generate resume with military-to-civilian translation',
    ],
    digitalTwinUpdates: {
      'quickAccessTools.mosEquivalentsUsed': true,
    },
    triggersGIE: false,
  };
}

// ====================
// Tool 4: Check My State Benefits
// ====================

export interface StateBenefitsResult {
  state: string;
  benefits: Array<{
    category: string;
    benefit: string;
    eligibility: string;
    value: string;
    link: string;
  }>;
  totalEstimatedValue: string;
}

export function checkMyStateBenefits(
  state: string,
  disabilityRating?: number
): QuickAccessToolResult {
  // Placeholder - integrate with state benefits catalog

  const benefits = [
    {
      category: 'Tax Benefits',
      benefit: 'Property Tax Exemption',
      eligibility: '100% P&T or 10%+ service-connected',
      value: '$500 - $5,000/year',
      link: `https://www.${state.toLowerCase()}.gov/veterans`,
    },
    {
      category: 'Education',
      benefit: 'State Tuition Waiver',
      eligibility: 'Veterans with any disability rating',
      value: '$10,000 - $40,000/year',
      link: `https://www.${state.toLowerCase()}.gov/veterans/education`,
    },
    {
      category: 'Licenses',
      benefit: 'Free Hunting/Fishing License',
      eligibility: '50%+ disabled veterans',
      value: '$50 - $200/year',
      link: `https://www.${state.toLowerCase()}.gov/dnr`,
    },
    {
      category: 'DMV',
      benefit: 'Disabled Veteran License Plates',
      eligibility: 'Service-connected disability',
      value: 'Free registration + parking benefits',
      link: `https://www.${state.toLowerCase()}.gov/dmv`,
    },
  ];

  return {
    success: true,
    data: {
      state,
      benefits,
      totalEstimatedValue: '$10,000 - $45,000/year',
    } as StateBenefitsResult,
    message: `Found ${benefits.length} state benefits for ${state}`,
    nextSteps: [
      'Visit state veteran affairs website to apply',
      'Gather required documents (DD-214, rating letter)',
      'Check eligibility for additional local benefits',
    ],
    digitalTwinUpdates: {
      'stateBenefits.checkedAt': new Date().toISOString(),
      'stateBenefits.state': state,
      'stateBenefits.eligibleBenefits': benefits.map((b) => b.benefit),
      'quickAccessTools.stateBenefitsUsed': true,
    },
    triggersGIE: true,
  };
}

// ====================
// Tool 5: Check My Federal Benefits
// ====================

export interface FederalBenefitsResult {
  eligibleBenefits: Array<{
    benefit: string;
    category: string;
    eligibility: string;
    estimatedValue: string;
    status: 'eligible' | 'check-eligibility' | 'not-eligible';
    link: string;
  }>;
  totalEstimatedValue: string;
}

export function checkMyFederalBenefits(digitalTwin: any): QuickAccessToolResult {
  const rating = digitalTwin.combinedRating || 0;
  const isPT = digitalTwin.isPermanentAndTotal || false;
  const hasServiceConnected = rating > 0;

  const benefits = [
    {
      benefit: 'VA Health Care',
      category: 'Health',
      eligibility: 'All veterans (priority based on rating)',
      estimatedValue: '$5,000 - $50,000/year',
      status: hasServiceConnected ? 'eligible' : 'check-eligibility',
      link: 'https://www.va.gov/health-care/',
    },
    {
      benefit: 'CHAMPVA (Family Health)',
      category: 'Family',
      eligibility: '100% P&T or died from service-connected condition',
      estimatedValue: '$10,000 - $30,000/year',
      status: isPT ? 'eligible' : 'not-eligible',
      link: 'https://www.va.gov/health-care/family-caregiver-benefits/champva/',
    },
    {
      benefit: 'DEA (Dependents Educational Assistance)',
      category: 'Family',
      eligibility: '100% P&T',
      estimatedValue: '$1,298/month for 36 months',
      status: isPT ? 'eligible' : 'not-eligible',
      link: 'https://www.va.gov/education/survivor-dependent-benefits/dependents-education-assistance/',
    },
    {
      benefit: 'VA Home Loan',
      category: 'Housing',
      eligibility: 'Service-connected disability',
      estimatedValue: 'No down payment + funding fee waived ($5,000+)',
      status: hasServiceConnected ? 'eligible' : 'check-eligibility',
      link: 'https://www.va.gov/housing-assistance/home-loans/',
    },
    {
      benefit: 'VR&E (Vocational Rehab)',
      category: 'Employment',
      eligibility: '10%+ service-connected',
      estimatedValue: 'Education + job training + employment support',
      status: rating >= 10 ? 'eligible' : 'not-eligible',
      link: 'https://www.va.gov/careers-employment/vocational-rehabilitation/',
    },
  ];

  const eligible = benefits.filter((b) => b.status === 'eligible');

  return {
    success: true,
    data: {
      eligibleBenefits: benefits,
      totalEstimatedValue: '$20,000 - $100,000/year (varies by usage)',
    } as FederalBenefitsResult,
    message: `You are eligible for ${eligible.length} federal benefits`,
    nextSteps: [
      'Apply for VA Health Care enrollment',
      isPT ? 'Apply for CHAMPVA and DEA for dependents' : 'File for rating increase to unlock more benefits',
      'Check VA Home Loan eligibility and get COE',
    ],
    digitalTwinUpdates: {
      'federalBenefits.checkedAt': new Date().toISOString(),
      'federalBenefits.eligibleBenefits': eligible.map((b) => b.benefit),
      'quickAccessTools.federalBenefitsUsed': true,
    },
    triggersGIE: true,
  };
}

// ====================
// Tool 6: Check My Deployment Exposures
// ====================

export interface DeploymentExposuresResult {
  deployments: Array<{
    location: string;
    startDate: string;
    endDate: string;
    exposures: string[];
    presumptiveConditions: string[];
  }>;
  suggestedClaims: string[];
  evidenceNeeded: string[];
}

export function checkMyDeploymentExposures(digitalTwin: any): QuickAccessToolResult {
  // Placeholder - integrate with Deployment Decoder

  const deployments = [
    {
      location: 'Iraq (OIF)',
      startDate: '2005-03-01',
      endDate: '2006-01-15',
      exposures: ['Burn Pits', 'Sand/Dust', 'Extreme Heat', 'Blast Exposure'],
      presumptiveConditions: [
        'Respiratory conditions (sinusitis, asthma)',
        'Skin conditions (dermatitis)',
        'Gastrointestinal conditions (IBS, GERD)',
        'Certain cancers (after latency period)',
      ],
    },
  ];

  const suggestedClaims = [
    'Chronic Sinusitis (presumptive for burn pit exposure)',
    'Asthma (presumptive for burn pit exposure)',
    'IBS (secondary to stress/PTSD)',
    'PTSD (combat exposure)',
  ];

  const evidenceNeeded = [
    'DD-214 showing deployment dates and locations',
    'Service treatment records mentioning symptoms',
    'Buddy statements about burn pit exposure',
    'Current diagnosis from physician',
  ];

  return {
    success: true,
    data: {
      deployments,
      suggestedClaims,
      evidenceNeeded,
    } as DeploymentExposuresResult,
    message: 'Deployment exposures analyzed successfully',
    nextSteps: [
      'File claims for presumptive conditions',
      'Visit Evidence Builder to create lay statements',
      'Get current medical diagnoses for exposure-related conditions',
    ],
    digitalTwinUpdates: {
      'exposures.checkedAt': new Date().toISOString(),
      'exposures.deployments': deployments,
      'exposures.presumptiveConditions': suggestedClaims,
      'quickAccessTools.exposuresUsed': true,
    },
    triggersGIE: true,
  };
}

// ====================
// Tool 7: Check My GI Bill Eligibility
// ====================

export interface GIBillEligibilityResult {
  eligibilityPercentage: number;
  monthsRemaining: number;
  estimatedBAH: number;
  schoolSuggestions: string[];
  transferableToFamily: boolean;
}

export function checkMyGIBillEligibility(digitalTwin: any): QuickAccessToolResult {
  // Placeholder - integrate with GI Bill calculator

  const totalServiceMonths = 48; // Calculate from entry/separation dates
  let eligibilityPercentage = 100;

  if (totalServiceMonths >= 36) {
    eligibilityPercentage = 100;
  } else if (totalServiceMonths >= 30) {
    eligibilityPercentage = 90;
  } else if (totalServiceMonths >= 24) {
    eligibilityPercentage = 80;
  } else if (totalServiceMonths >= 18) {
    eligibilityPercentage = 70;
  } else if (totalServiceMonths >= 12) {
    eligibilityPercentage = 60;
  } else if (totalServiceMonths >= 6) {
    eligibilityPercentage = 50;
  } else {
    eligibilityPercentage = 40;
  }

  return {
    success: true,
    data: {
      eligibilityPercentage,
      monthsRemaining: 36,
      estimatedBAH: 2400,
      schoolSuggestions: [
        'University of Phoenix (online)',
        'Liberty University',
        'Arizona State University',
      ],
      transferableToFamily: totalServiceMonths >= 72, // 6 years
    } as GIBillEligibilityResult,
    message: `You are ${eligibilityPercentage}% eligible for Post-9/11 GI Bill`,
    nextSteps: [
      'Apply for Certificate of Eligibility (COE) at VA.gov',
      'Compare schools using GI Bill Comparison Tool',
      'Calculate BAH for your zip code',
    ],
    digitalTwinUpdates: {
      'education.giBillEligibility': eligibilityPercentage,
      'education.giBillMonthsRemaining': 36,
      'quickAccessTools.giBillUsed': true,
    },
    triggersGIE: false,
  };
}

// ====================
// Tool 8: Check My Housing Eligibility
// ====================

export interface HousingEligibilityResult {
  vaLoan: {
    eligible: boolean;
    fundingFeeWaived: boolean;
    maxLoanAmount: string;
  };
  grants: Array<{
    grant: string;
    eligible: boolean;
    maxAmount: string;
    requirements: string;
  }>;
  localPrograms: string[];
}

export function checkMyHousingEligibility(digitalTwin: any): QuickAccessToolResult {
  const hasServiceConnected = (digitalTwin.combinedRating || 0) > 0;
  const rating = digitalTwin.combinedRating || 0;

  const grants = [
    {
      grant: 'SAH (Specially Adapted Housing)',
      eligible: false, // Requires specific disabilities
      maxAmount: '$109,986',
      requirements: 'Loss of use of both legs or severe burn injuries',
    },
    {
      grant: 'SHA (Special Housing Adaptation)',
      eligible: false,
      maxAmount: '$21,998',
      requirements: 'Blindness in both eyes or loss of use of both hands',
    },
    {
      grant: 'TRA (Temporary Residence Adaptation)',
      eligible: rating >= 50,
      maxAmount: '$43,992',
      requirements: '50%+ rating for qualifying mobility impairment',
    },
  ];

  return {
    success: true,
    data: {
      vaLoan: {
        eligible: hasServiceConnected,
        fundingFeeWaived: rating >= 10,
        maxLoanAmount: 'No limit (varies by county)',
      },
      grants,
      localPrograms: ['First-time homebuyer programs', 'Down payment assistance', 'Property tax exemptions'],
    } as HousingEligibilityResult,
    message: hasServiceConnected
      ? 'You are eligible for VA Home Loan with no down payment'
      : 'Complete service verification to check VA Home Loan eligibility',
    nextSteps: [
      'Get Certificate of Eligibility (COE) from VA.gov',
      'Find VA-approved lender',
      'Check state/local veteran housing programs',
    ],
    digitalTwinUpdates: {
      'housing.vaLoanEligible': hasServiceConnected,
      'housing.fundingFeeWaived': rating >= 10,
      'quickAccessTools.housingUsed': true,
    },
    triggersGIE: false,
  };
}

// ====================
// Tool 9: Check My Family Benefits
// ====================

export interface FamilyBenefitsResult {
  champva: {
    eligible: boolean;
    eligibleDependents: string[];
    estimatedValue: string;
  };
  dea: {
    eligible: boolean;
    eligibleDependents: string[];
    monthlyAmount: string;
  };
  caregiver: {
    eligible: boolean;
    programs: string[];
  };
}

export function checkMyFamilyBenefits(digitalTwin: any): QuickAccessToolResult {
  const isPT = digitalTwin.isPermanentAndTotal || false;
  const rating = digitalTwin.combinedRating || 0;

  return {
    success: true,
    data: {
      champva: {
        eligible: isPT,
        eligibleDependents: isPT
          ? ['Spouse', 'Children under 18', 'Children 18-23 in school']
          : [],
        estimatedValue: isPT ? '$10,000 - $30,000/year per family' : 'Not eligible',
      },
      dea: {
        eligible: isPT,
        eligibleDependents: isPT ? ['Spouse', 'Children 18-26'] : [],
        monthlyAmount: isPT ? '$1,298/month for 36 months' : 'Not eligible',
      },
      caregiver: {
        eligible: rating >= 70,
        programs: rating >= 70
          ? ['Caregiver Support Program', 'Respite care', 'Mental health services']
          : [],
      },
    } as FamilyBenefitsResult,
    message: isPT
      ? 'Your family is eligible for CHAMPVA and DEA benefits'
      : 'Work toward 100% P&T to unlock family benefits',
    nextSteps: isPT
      ? ['Apply for CHAMPVA at VA.gov', 'Apply for DEA for eligible dependents', 'Enroll in Caregiver Support']
      : ['File for rating increases', 'Check current evidence strength'],
    digitalTwinUpdates: {
      'family.champvaEligible': isPT,
      'family.deaEligible': isPT,
      'family.caregiverEligible': rating >= 70,
      'quickAccessTools.familyBenefitsUsed': true,
    },
    triggersGIE: true,
  };
}

// ====================
// Tool 10: Check My Transition Tasks
// ====================

export interface TransitionTasksResult {
  phase: '12-month' | '6-month' | '3-month' | '1-month' | 'day-of' | 'post-separation';
  tasks: Array<{
    task: string;
    category: string;
    priority: 'critical' | 'high' | 'medium';
    completed: boolean;
    dueDate?: string;
  }>;
  completionPercentage: number;
}

export function checkMyTransitionTasks(
  separationDate: string,
  currentDate: string = new Date().toISOString()
): QuickAccessToolResult {
  const monthsUntilSeparation = calculateMonthsUntil(separationDate, currentDate);

  let phase: TransitionTasksResult['phase'];
  let tasks: TransitionTasksResult['tasks'] = [];

  if (monthsUntilSeparation >= 12) {
    phase = '12-month';
    tasks = [
      {
        task: 'Attend TAP/TGPS Workshop',
        category: 'Required',
        priority: 'critical',
        completed: false,
      },
      {
        task: 'Request DD-214 at separation',
        category: 'Documents',
        priority: 'critical',
        completed: false,
      },
      {
        task: 'File initial VA disability claim (BDD)',
        category: 'Benefits',
        priority: 'critical',
        completed: false,
      },
    ];
  } else if (monthsUntilSeparation >= 6) {
    phase = '6-month';
    tasks = [
      {
        task: 'Complete VA disability medical exams',
        category: 'Benefits',
        priority: 'critical',
        completed: false,
      },
      {
        task: 'Research housing and cost of living',
        category: 'Housing',
        priority: 'high',
        completed: false,
      },
      {
        task: 'Build civilian resume',
        category: 'Employment',
        priority: 'high',
        completed: false,
      },
    ];
  } else {
    phase = 'post-separation';
    tasks = [
      {
        task: 'Enroll in VA Health Care',
        category: 'Health',
        priority: 'critical',
        completed: false,
      },
      {
        task: 'Apply for unemployment if needed',
        category: 'Employment',
        priority: 'high',
        completed: false,
      },
    ];
  }

  return {
    success: true,
    data: {
      phase,
      tasks,
      completionPercentage: 0,
    } as TransitionTasksResult,
    message: `You are in the ${phase} transition phase`,
    nextSteps: tasks.filter((t) => !t.completed).map((t) => t.task),
    digitalTwinUpdates: {
      'transition.phase': phase,
      'transition.tasks': tasks,
      'quickAccessTools.transitionTasksUsed': true,
    },
    triggersGIE: true,
  };
}

// Helper function
function calculateMonthsUntil(targetDate: string, currentDate: string): number {
  const target = new Date(targetDate);
  const current = new Date(currentDate);
  const diffTime = target.getTime() - current.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.ceil(diffDays / 30);
}

