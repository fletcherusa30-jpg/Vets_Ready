/**
 * Federal Employment Service
 * Navigate USAJobs and federal hiring processes with veteran preference
 */

import type { VeteranProfile, JobPosting } from '../../data/models/index.js';

export interface FederalJobPosting extends JobPosting {
  agencyName: string;
  positionSchedule: 'Full-time' | 'Part-time' | 'Intermittent';
  securityClearance?: string;
  payPlan: string; // GS, WG, etc.
  gradeLevel: string; // GS-9, GS-11, etc.
  veteranPreference: boolean;
  appointmentType: 'Permanent' | 'Term' | 'Temporary';
  teleworkEligible: boolean;
  announcement Number: string;
  closingDate: string;
}

export interface VeteranPreferenceEligibility {
  eligible: boolean;
  category: 'None' | 'TP' | 'CP' | 'CPS' | 'XP' | 'SSP';
  categoryName: string;
  description: string;
  requiredDocumentation: string[];
  points: number;
}

export interface FederalResumeRequirements {
  sections: {
    name: string;
    required: boolean;
    description: string;
    tips: string[];
  }[];
  formatGuidelines: string[];
  commonMistakes: string[];
}

const MOCK_FEDERAL_JOBS: FederalJobPosting[] = [
  {
    id: 'fed-job-1',
    title: 'Cybersecurity Specialist',
    companyName: 'Department of Defense',
    agencyName: 'Defense Information Systems Agency',
    industry: 'Federal Government',
    location: 'Fort Meade, MD',
    remoteOption: false,
    teleworkEligible: true,
    jobType: 'full-time',
    positionSchedule: 'Full-time',
    appointmentType: 'Permanent',
    payPlan: 'GS',
    gradeLevel: 'GS-12',
    salaryRange: { min: 86335, max: 112280, currency: 'USD', period: 'yearly' },
    description: 'Protect DOD information systems from cyber threats',
    requiredSkills: ['Network Security', 'Incident Response', 'Risk Assessment'],
    preferredSkills: ['SIEM', 'Penetration Testing'],
    requiredCredentials: ['Security+', 'CISSP'],
    securityClearance: 'Top Secret',
    clearanceRequired: 'Top Secret',
    veteranPreference: true,
    veteranFriendly: true,
    announcementNumber: 'DOD-2024-0123',
    closingDate: '2024-12-31',
    postedDate: new Date().toISOString()
  },
  {
    id: 'fed-job-2',
    title: 'Logistics Management Specialist',
    companyName: 'Department of Veterans Affairs',
    agencyName: 'Veterans Health Administration',
    industry: 'Federal Government',
    location: 'Washington, DC',
    remoteOption: false,
    teleworkEligible: true,
    jobType: 'full-time',
    positionSchedule: 'Full-time',
    appointmentType: 'Permanent',
    payPlan: 'GS',
    gradeLevel: 'GS-11',
    salaryRange: { min: 72750, max: 94581, currency: 'USD', period: 'yearly' },
    description: 'Manage medical supply chain for VA facilities',
    requiredSkills: ['Supply Chain Management', 'Inventory Management', 'Data Analysis'],
    preferredSkills: ['ERP Systems', 'Process Improvement'],
    veteranPreference: true,
    veteranFriendly: true,
    announcementNumber: 'VA-2024-0456',
    closingDate: '2024-12-15',
    postedDate: new Date().toISOString()
  }
];

/**
 * Determine veteran preference eligibility
 */
export async function assessVeteranPreference(
  veteran: VeteranProfile
): Promise<VeteranPreferenceEligibility> {
  // Check service-connected disability
  const hasDisability = veteran.vaDisabilityRating && veteran.vaDisabilityRating >= 10;
  const hasPurpleHeart = veteran.branchHistory.some(s =>
    s.awards?.includes('Purple Heart')
  );
  const honorableDischarge = true; // Assume honorable for this example

  if (!honorableDischarge) {
    return {
      eligible: false,
      category: 'None',
      categoryName: 'Not Eligible',
      description: 'Must have honorable or general discharge',
      requiredDocumentation: [],
      points: 0
    };
  }

  // 10-point preference categories
  if (hasDisability && veteran.vaDisabilityRating! >= 30) {
    return {
      eligible: true,
      category: 'CPS',
      categoryName: '10-Point Compensable (30% or more)',
      description: '30% or more disability rating',
      requiredDocumentation: [
        'DD-214',
        'SF-15 (Application for 10-Point Veteran Preference)',
        'VA letter showing disability rating of 30% or more'
      ],
      points: 10
    };
  }

  if (hasDisability && veteran.vaDisabilityRating! < 30) {
    return {
      eligible: true,
      category: 'CP',
      categoryName: '10-Point Compensable (less than 30%)',
      description: '10% to 20% disability rating',
      requiredDocumentation: [
        'DD-214',
        'SF-15',
        'VA letter showing disability rating'
      ],
      points: 10
    };
  }

  if (hasPurpleHeart) {
    return {
      eligible: true,
      category: 'XP',
      categoryName: '10-Point Purple Heart',
      description: 'Awarded Purple Heart',
      requiredDocumentation: [
        'DD-214 showing Purple Heart award',
        'SF-15'
      ],
      points: 10
    };
  }

  // 5-point preference
  return {
    eligible: true,
    category: 'TP',
    categoryName: '5-Point Preference',
    description: 'Honorably discharged veteran',
    requiredDocumentation: [
      'DD-214 or other proof of honorable service'
    ],
    points: 5
  };
}

/**
 * Search federal jobs with veteran preference
 */
export async function searchFederalJobs(
  keywords?: string,
  location?: string,
  payGrade?: string
): Promise<FederalJobPosting[]> {
  let results = [...MOCK_FEDERAL_JOBS];

  if (keywords) {
    results = results.filter(job =>
      job.title.toLowerCase().includes(keywords.toLowerCase()) ||
      job.description.toLowerCase().includes(keywords.toLowerCase())
    );
  }

  if (location) {
    results = results.filter(job =>
      job.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (payGrade) {
    results = results.filter(job => job.gradeLevel === payGrade);
  }

  return results;
}

/**
 * Get federal resume requirements and guidance
 */
export async function getFederalResumeRequirements(): Promise<FederalResumeRequirements> {
  return {
    sections: [
      {
        name: 'Contact Information',
        required: true,
        description: 'Full name, mailing address, email, and phone',
        tips: [
          'Include country code if applying from overseas',
          'Use professional email address',
          'Make sure contact info is current'
        ]
      },
      {
        name: 'Citizenship',
        required: true,
        description: 'U.S. citizenship status',
        tips: [
          'State "U.S. Citizen" clearly',
          'Required for most federal positions'
        ]
      },
      {
        name: 'Veterans Preference',
        required: false,
        description: 'Claim veteran preference if eligible',
        tips: [
          'State your veteran preference category (5-point or 10-point)',
          'Include branch of service and dates',
          'Mention if you have a service-connected disability'
        ]
      },
      {
        name: 'Security Clearance',
        required: false,
        description: 'Current or past security clearance',
        tips: [
          'List clearance level and status (active/inactive)',
          'Include date granted and issuing agency',
          'This can be a major advantage'
        ]
      },
      {
        name: 'Work Experience',
        required: true,
        description: 'Detailed work history with specific dates',
        tips: [
          'Use MM/YYYY format for dates',
          'Include employer name, address, and supervisor contact',
          'List hours per week',
          'Describe duties in detail - federal resumes are LONG',
          'Translate military experience to civilian terms',
          'Quantify achievements with numbers'
        ]
      },
      {
        name: 'Education',
        required: true,
        description: 'All degrees and relevant coursework',
        tips: [
          'Include school name, location, degree, major, and graduation date',
          'List relevant coursework if no degree',
          'Include military training schools'
        ]
      },
      {
        name: 'Certifications',
        required: false,
        description: 'Professional certifications and licenses',
        tips: [
          'List certification name, issuing organization, and date',
          'Include expiration dates if applicable',
          'Security certifications are highly valued'
        ]
      },
      {
        name: 'Skills',
        required: false,
        description: 'Relevant technical and professional skills',
        tips: [
          'Match skills to job announcement keywords',
          'Be specific (not just "computer skills")',
          'Include software, tools, and technologies'
        ]
      }
    ],
    formatGuidelines: [
      'Length: 3-5 pages is normal (unlike private sector)',
      'Use reverse chronological order',
      'No photos or graphics',
      'Plain text format is safest for USAJOBS upload',
      'Mirror language from job announcement',
      'Use full sentences and paragraphs',
      'Do NOT use acronyms without spelling out first'
    ],
    commonMistakes: [
      'Resume too short - federal resumes need detail',
      'Missing required information (dates, addresses, hours/week)',
      'Using military jargon without translation',
      'Not tailoring resume to specific announcement',
      'Forgetting to claim veteran preference',
      'Not including supervisor contact information',
      'Leaving out volunteer work or collateral duties'
    ]
  };
}

/**
 * Calculate equivalent GS grade based on civilian salary
 */
export async function calculateGSEquivalent(
  currentSalary: number,
  location: string = 'Rest of U.S.'
): Promise<{
  suggestedGrades: string[];
  salaryRanges: { grade: string; min: number; max: number }[];
  recommendations: string[];
}> {
  // Simplified GS pay scale (2024 base)
  const gsScale: { [key: string]: { min: number; max: number } } = {
    'GS-7': { min: 46696, max: 60703 },
    'GS-9': { min: 53433, max: 69447 },
    'GS-11': { min: 64649, max: 84044 },
    'GS-12': { min: 77505, max: 100757 },
    'GS-13': { min: 92143, max: 119802 },
    'GS-14': { min: 108885, max: 141579 },
    'GS-15': { min: 128078, max: 166500 }
  };

  const suggested: string[] = [];
  const ranges: { grade: string; min: number; max: number }[] = [];

  for (const [grade, range] of Object.entries(gsScale)) {
    if (currentSalary >= range.min && currentSalary <= range.max) {
      suggested.push(grade);
    }
    ranges.push({ grade, ...range });
  }

  if (suggested.length === 0) {
    // Find closest
    for (const [grade, range] of Object.entries(gsScale)) {
      if (Math.abs(currentSalary - range.min) < 10000) {
        suggested.push(grade);
      }
    }
  }

  const recommendations: string[] = [
    'Federal salaries include excellent benefits (health, retirement, TSP matching)',
    'Apply to positions at your current grade and one grade higher',
    'Some positions allow negotiation of step within grade',
    'Locality pay varies significantly by location',
    'Consider total compensation, not just salary'
  ];

  return {
    suggestedGrades: suggested.length > 0 ? suggested : ['GS-11', 'GS-12'],
    salaryRanges: ranges,
    recommendations
  };
}
