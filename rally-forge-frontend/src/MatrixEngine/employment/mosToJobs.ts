/**
 * MOS to Jobs Mapper
 * Maps Military Occupational Specialty codes to civilian job opportunities
 */

import { translateMOSToSkills } from './mosToSkills';

export interface JobOpportunity {
  id: string;
  title: string;
  company?: string;
  location: string;
  salaryRange: {
    min: number;
    max: number;
  };
  matchScore: number; // 0-100
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  clearanceRequired?: 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
  veteranFriendly: boolean;
  postedDate: string;
  url?: string;
}

export interface CareerPath {
  title: string;
  description: string;
  entryLevelJobs: string[];
  midLevelJobs: string[];
  seniorLevelJobs: string[];
  requiredEducation: string[];
  requiredCertifications: string[];
  averageSalary: number;
  growthRate: string;
}

// Mock job database
const MOCK_JOBS: JobOpportunity[] = [
  {
    id: 'job-1',
    title: 'Network Administrator',
    company: 'Tech Solutions Inc',
    location: 'Remote',
    salaryRange: { min: 65000, max: 95000 },
    matchScore: 0,
    requiredSkills: ['Network Administration', 'Windows/Linux', 'TCP/IP'],
    preferredSkills: ['CCNA', 'Security+', 'Active Directory'],
    description: 'Manage and maintain company network infrastructure. Veteran-friendly employer with excellent benefits.',
    jobType: 'Full-time',
    veteranFriendly: true,
    postedDate: '2026-01-20',
    url: 'https://example.com/jobs/network-admin',
  },
  {
    id: 'job-2',
    title: 'IT Support Specialist',
    company: 'Veterans First Tech',
    location: 'Hybrid - Multiple Locations',
    salaryRange: { min: 50000, max: 70000 },
    matchScore: 0,
    requiredSkills: ['Technical Support', 'Customer Service', 'Troubleshooting'],
    preferredSkills: ['CompTIA A+', 'Help Desk Experience'],
    description: 'Provide technical support to end users. Military skills translator program available.',
    jobType: 'Full-time',
    veteranFriendly: true,
    postedDate: '2026-01-22',
  },
  {
    id: 'job-3',
    title: 'Paramedic',
    company: 'City Fire & Rescue',
    location: 'Various Cities',
    salaryRange: { min: 48000, max: 72000 },
    matchScore: 0,
    requiredSkills: ['EMT-P Certification', 'Emergency Medical Care', 'Trauma Response'],
    preferredSkills: ['ACLS', 'PALS', 'Military Medical Experience'],
    description: 'Emergency medical response for city fire department. Veterans preferred.',
    jobType: 'Full-time',
    veteranFriendly: true,
    postedDate: '2026-01-18',
  },
  {
    id: 'job-4',
    title: 'Security Operations Manager',
    company: 'Global Security Services',
    location: 'Multiple States',
    salaryRange: { min: 70000, max: 105000 },
    matchScore: 0,
    requiredSkills: ['Security Management', 'Team Leadership', 'Risk Assessment'],
    preferredSkills: ['Military Experience', 'Active Clearance'],
    description: 'Lead security operations for corporate clients. Security clearance a plus.',
    jobType: 'Full-time',
    clearanceRequired: 'Secret',
    veteranFriendly: true,
    postedDate: '2026-01-15',
  },
  {
    id: 'job-5',
    title: 'Supply Chain Analyst',
    company: 'Logistics Corp',
    location: 'Dallas, TX',
    salaryRange: { min: 58000, max: 82000 },
    matchScore: 0,
    requiredSkills: ['Inventory Management', 'Data Analysis', 'Supply Chain Software'],
    preferredSkills: ['Military Logistics Experience', 'Six Sigma'],
    description: 'Analyze and optimize supply chain operations. Military logistics experience valued.',
    jobType: 'Full-time',
    veteranFriendly: true,
    postedDate: '2026-01-21',
  },
];

/**
 * Match jobs to veteran's MOS and skills
 */
export function matchJobsToMOS(mosCode: string, branch: string, location?: string): JobOpportunity[] {
  const mosMapping = translateMOSToSkills(mosCode, branch);
  if (!mosMapping) {
    return [];
  }

  const veteranSkills = mosMapping.skills.map(s => s.name.toLowerCase());
  const civilianTitles = mosMapping.civilianEquivalents.map(t => t.toLowerCase());

  // Score each job
  const scoredJobs = MOCK_JOBS.map(job => {
    let score = 0;

    // Check if job title matches civilian equivalent
    if (civilianTitles.some(title => job.title.toLowerCase().includes(title))) {
      score += 40;
    }

    // Check required skills match
    const matchedRequired = job.requiredSkills.filter(req =>
      veteranSkills.some(vs => req.toLowerCase().includes(vs) || vs.includes(req.toLowerCase()))
    );
    score += (matchedRequired.length / job.requiredSkills.length) * 40;

    // Check preferred skills match
    const matchedPreferred = job.preferredSkills.filter(pref =>
      veteranSkills.some(vs => pref.toLowerCase().includes(vs) || vs.includes(pref.toLowerCase()))
    );
    score += (matchedPreferred.length / Math.max(job.preferredSkills.length, 1)) * 20;

    // Bonus for veteran-friendly
    if (job.veteranFriendly) {
      score += 10;
    }

    return {
      ...job,
      matchScore: Math.min(Math.round(score), 100),
    };
  });

  // Filter and sort by match score
  return scoredJobs
    .filter(job => job.matchScore >= 50) // Only show jobs with 50%+ match
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get career paths for MOS
 */
export function getCareerPaths(mosCode: string, branch: string): CareerPath[] {
  const mosMapping = translateMOSToSkills(mosCode, branch);
  if (!mosMapping) {
    return [];
  }

  const paths: CareerPath[] = [];

  // IT Career Path (for 25B and similar)
  if (mosCode === '25B') {
    paths.push({
      title: 'Information Technology',
      description: 'Build a career in IT support, network administration, or cybersecurity',
      entryLevelJobs: ['Help Desk Technician', 'IT Support Specialist', 'Junior Network Admin'],
      midLevelJobs: ['Network Administrator', 'Systems Administrator', 'IT Manager'],
      seniorLevelJobs: ['IT Director', 'Chief Technology Officer', 'Senior Security Architect'],
      requiredEducation: ['Associate or Bachelor in IT/CS (preferred)', 'Certifications can substitute'],
      requiredCertifications: ['CompTIA A+', 'Network+', 'Security+'],
      averageSalary: 75000,
      growthRate: '11% (Faster than average)',
    });
  }

  // Healthcare Path (for 68W and similar)
  if (mosCode === '68W') {
    paths.push({
      title: 'Emergency Medical Services',
      description: 'Transition to civilian EMS, nursing, or healthcare administration',
      entryLevelJobs: ['EMT-Basic', 'Emergency Room Technician', 'Patient Care Technician'],
      midLevelJobs: ['Paramedic', 'Emergency Room RN', 'Charge Nurse'],
      seniorLevelJobs: ['EMS Director', 'Nurse Manager', 'Healthcare Administrator'],
      requiredEducation: ['EMT-B Certification', 'Associate or BSN for RN'],
      requiredCertifications: ['NREMT', 'State EMT/Paramedic License', 'RN License'],
      averageSalary: 65000,
      growthRate: '15% (Much faster than average)',
    });
  }

  // Security/Law Enforcement Path (for 11B and similar)
  if (mosCode === '11B') {
    paths.push({
      title: 'Security & Law Enforcement',
      description: 'Apply military training to security management or law enforcement',
      entryLevelJobs: ['Security Officer', 'Police Officer', 'Correctional Officer'],
      midLevelJobs: ['Security Manager', 'Detective', 'Federal Agent'],
      seniorLevelJobs: ['Director of Security', 'Police Chief', 'Special Agent in Charge'],
      requiredEducation: ['High School Diploma (minimum)', 'Associate/Bachelor preferred'],
      requiredCertifications: ['State Police Academy', 'Security+', 'CPO'],
      averageSalary: 68000,
      growthRate: '7% (Steady growth)',
    });
  }

  // Logistics Path (for 92Y and similar)
  if (mosCode === '92Y') {
    paths.push({
      title: 'Supply Chain & Logistics',
      description: 'Manage supply chains, inventory, and logistics operations',
      entryLevelJobs: ['Warehouse Associate', 'Inventory Specialist', 'Logistics Coordinator'],
      midLevelJobs: ['Supply Chain Analyst', 'Warehouse Manager', 'Logistics Manager'],
      seniorLevelJobs: ['Supply Chain Director', 'VP of Operations', 'Chief Operating Officer'],
      requiredEducation: ['Associate or Bachelor in Business/Logistics'],
      requiredCertifications: ['APICS CPIM', 'Six Sigma Green Belt', 'PMP'],
      averageSalary: 72000,
      growthRate: '9% (Faster than average)',
    });
  }

  return paths;
}

/**
 * Filter jobs by criteria
 */
export function filterJobs(
  jobs: JobOpportunity[],
  filters: {
    veteranFriendlyOnly?: boolean;
    minSalary?: number;
    location?: string;
    clearanceRequired?: boolean;
    jobType?: string;
  }
): JobOpportunity[] {
  return jobs.filter(job => {
    if (filters.veteranFriendlyOnly && !job.veteranFriendly) return false;
    if (filters.minSalary && job.salaryRange.max < filters.minSalary) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase()) && job.location !== 'Remote') return false;
    if (filters.clearanceRequired !== undefined && !job.clearanceRequired) return false;
    if (filters.jobType && job.jobType !== filters.jobType) return false;
    return true;
  });
}

/**
 * Get job search tips for MOS
 */
export function getJobSearchTips(mosCode: string): string[] {
  const tips = [
    'Highlight your security clearance if you have one - it\'s valuable to employers',
    'Use veteran job boards like Hire Heroes USA, RecruitMilitary, and LinkedIn Veterans',
    'Translate military jargon to civilian terms on your resume',
    'Network with other veterans in your target industry',
    'Consider federal jobs at USAJOBS.gov - veterans get preference',
  ];

  // MOS-specific tips
  if (mosCode === '25B') {
    tips.push('Get CompTIA certifications - many are free for veterans through VET TEC');
    tips.push('Build a home lab to practice skills and add to your resume');
  }

  if (mosCode === '68W') {
    tips.push('Many states offer expedited EMT/Paramedic licensing for combat medics');
    tips.push('Consider VA healthcare jobs - they actively recruit veteran medical personnel');
  }

  if (mosCode === '11B') {
    tips.push('Law enforcement agencies often have veteran hiring programs');
    tips.push('Consider federal law enforcement (CBP, ICE, DEA) with veteran preference');
  }

  return tips;
}
