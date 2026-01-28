/**
 * Apprenticeship Programs Service
 * Discover and apply to registered apprenticeship programs
 */

import type { VeteranProfile } from '../../data/models/index.js';

export interface ApprenticeshipProgram {
  id: string;
  title: string;
  occupation: string;
  industry: string;
  sponsor: string;
  location: string;
  duration: string;
  hoursRequired: number;
  wage: {
    starting: number;
    ending: number;
    currency: string;
  };
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  credentialsEarned: string[];
  veteranFriendly: boolean;
  giBillEligible: boolean;
  contactEmail: string;
  applicationUrl?: string;
}

export interface ApprenticeshipMatch {
  program: ApprenticeshipProgram;
  matchScore: number;
  matchReasons: string[];
  gapAnalysis: string[];
  financialBenefits: {
    totalEarnings: number;
    giiBillMonthlyStipend?: number;
    credentialValue: number;
  };
}

const MOCK_APPRENTICESHIP_PROGRAMS: ApprenticeshipProgram[] = [
  {
    id: 'apprentice-1',
    title: 'Cybersecurity Analyst Apprenticeship',
    occupation: 'Information Security Analyst',
    industry: 'Information Technology',
    sponsor: 'CompTIA',
    location: 'Remote',
    duration: '12 months',
    hoursRequired: 2000,
    wage: {
      starting: 45000,
      ending: 65000,
      currency: 'USD'
    },
    description: 'Earn while you learn cybersecurity through hands-on experience and mentorship',
    requiredSkills: ['Basic Networking', 'Computer Fundamentals'],
    preferredSkills: ['Security+', 'Linux'],
    credentialsEarned: ['CompTIA CySA+', 'Department of Labor Certificate'],
    veteranFriendly: true,
    giBillEligible: true,
    contactEmail: 'apprenticeships@comptia.org'
  },
  {
    id: 'apprentice-2',
    title: 'Electrician Apprenticeship',
    occupation: 'Electrician',
    industry: 'Construction',
    sponsor: 'IBEW Local 46',
    location: 'Seattle, WA',
    duration: '5 years',
    hoursRequired: 8000,
    wage: {
      starting: 25.50 * 2080, // Hourly to annual
      ending: 51.00 * 2080,
      currency: 'USD'
    },
    description: 'Become a licensed electrician through union apprenticeship program',
    requiredSkills: [],
    preferredSkills: ['Basic Math', 'Physical Fitness'],
    credentialsEarned: ['Journeyman Electrician License'],
    veteranFriendly: true,
    giBillEligible: true,
    contactEmail: 'apprentice@ibew46.com'
  },
  {
    id: 'apprentice-3',
    title: 'HVAC Technician Apprenticeship',
    occupation: 'HVAC Mechanic',
    industry: 'Construction',
    sponsor: 'UA Local 290',
    location: 'Portland, OR',
    duration: '4 years',
    hoursRequired: 6400,
    wage: {
      starting: 22.00 * 2080,
      ending: 44.00 * 2080,
      currency: 'USD'
    },
    description: 'Train in heating, ventilation, air conditioning, and refrigeration',
    requiredSkills: [],
    preferredSkills: ['Mechanical Aptitude'],
    credentialsEarned: ['EPA 608 Certification', 'Journeyman HVAC License'],
    veteranFriendly: true,
    giBillEligible: true,
    contactEmail: 'training@ua290.org'
  }
];

/**
 * Find apprenticeship programs matching veteran profile
 */
export async function findApprenticeshipPrograms(
  veteran: VeteranProfile,
  industry?: string
): Promise<ApprenticeshipMatch[]> {
  let programs = [...MOCK_APPRENTICESHIP_PROGRAMS];

  if (industry) {
    programs = programs.filter(p => p.industry === industry);
  }

  const matches: ApprenticeshipMatch[] = [];

  for (const program of programs) {
    let score = 0;
    const reasons: string[] = [];
    const gaps: string[] = [];

    // Skill matching
    const veteranSkillNames = veteran.skills.map(s => s.name.toLowerCase());
    const matchedSkills = program.requiredSkills.filter(reqSkill =>
      veteranSkillNames.some(vSkill => vSkill.includes(reqSkill.toLowerCase()))
    );

    if (matchedSkills.length > 0) {
      score += 30;
      reasons.push(`You have ${matchedSkills.length}/${program.requiredSkills.length} required skills`);
    }

    const missingSkills = program.requiredSkills.filter(reqSkill =>
      !veteranSkillNames.some(vSkill => vSkill.includes(reqSkill.toLowerCase()))
    );

    if (missingSkills.length > 0) {
      gaps.push(`Need to develop: ${missingSkills.join(', ')}`);
    }

    // Location preference
    if (veteran.locationPreferences?.some(loc =>
      program.location.toLowerCase().includes(loc.toLowerCase()) ||
      program.location === 'Remote'
    )) {
      score += 20;
      reasons.push('Matches location preference');
    }

    // GI Bill eligibility
    if (program.giBillEligible) {
      score += 25;
      reasons.push('Eligible for GI Bill benefits during apprenticeship');
    }

    // Veteran friendly
    if (program.veteranFriendly) {
      score += 15;
      reasons.push('Veteran-friendly program with dedicated support');
    }

    // Career progression
    score += 10;
    reasons.push('Earn while you learn - no student debt');

    // Calculate financial benefits
    const totalEarnings = ((program.wage.starting + program.wage.ending) / 2) *
      (parseInt(program.duration) || 2);

    const giiBillMonthlyStipend = program.giBillEligible ?
      (veteran.giBillMonthsRemaining || 0) > 0 ? 1200 : undefined
      : undefined;

    const credentialValue = 50000; // Estimated value of credential

    matches.push({
      program,
      matchScore: Math.min(100, score),
      matchReasons: reasons,
      gapAnalysis: gaps,
      financialBenefits: {
        totalEarnings,
        giiBillMonthlyStipend,
        credentialValue
      }
    });
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

/**
 * Get GI Bill benefits for apprenticeships
 */
export async function getApprenticeshipGIBillBenefits(
  monthsInProgram: number
): Promise<{
  monthlyStipend: number[];
  totalBenefit: number;
  explanation: string;
}> {
  // GI Bill pays decreasing amounts during apprenticeship
  const stipends: number[] = [];
  const baseRate = 2050; // 2024 base rate

  for (let month = 1; month <= monthsInProgram; month++) {
    let rate: number;
    if (month <= 6) {
      rate = baseRate * 1.0; // 100% for first 6 months
    } else if (month <= 12) {
      rate = baseRate * 0.80; // 80% for months 7-12
    } else if (month <= 18) {
      rate = baseRate * 0.60; // 60% for months 13-18
    } else {
      rate = baseRate * 0.40; // 40% for months 19+
    }
    stipends.push(Math.round(rate));
  }

  const total = stipends.reduce((sum, amt) => sum + amt, 0);

  return {
    monthlyStipend: stipends,
    totalBenefit: total,
    explanation: 'GI Bill pays 100% for first 6 months, then decreases as you progress. You also earn your regular wage.'
  };
}

/**
 * Generate apprenticeship application checklist
 */
export async function generateApplicationChecklist(
  program: ApprenticeshipProgram
): Promise<{
  items: {
    task: string;
    completed: boolean;
    priority: 'critical' | 'high' | 'medium';
  }[];
}> {
  return {
    items: [
      {
        task: 'Obtain DD-214 (Certificate of Release or Discharge)',
        completed: false,
        priority: 'critical'
      },
      {
        task: 'Apply for GI Bill Certificate of Eligibility',
        completed: false,
        priority: 'critical'
      },
      {
        task: 'Research program requirements and expectations',
        completed: false,
        priority: 'high'
      },
      {
        task: 'Prepare resume highlighting military experience',
        completed: false,
        priority: 'high'
      },
      {
        task: 'Gather letters of recommendation',
        completed: false,
        priority: 'medium'
      },
      {
        task: `Complete application at ${program.contactEmail}`,
        completed: false,
        priority: 'critical'
      },
      {
        task: 'Prepare for aptitude test if required',
        completed: false,
        priority: 'high'
      },
      {
        task: 'Schedule interview with program sponsor',
        completed: false,
        priority: 'high'
      }
    ]
  };
}
