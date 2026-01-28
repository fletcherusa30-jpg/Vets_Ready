/**
 * Veteran Entrepreneurship Service
 * Helps veterans start and grow businesses
 */

import type { VeteranProfile } from '../../data/models/index.js';

export interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  industry: string;
  targetMarket: string;
  requiredSkills: string[];
  estimatedStartupCost: number;
  timeToLaunch: string;
  veteranAdvantages: string[];
}

export interface EntrepreneurshipAssessment {
  readinessScore: number;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  suggestedBusinessTypes: BusinessIdea[];
  resourcesNeeded: {
    category: string;
    resource: string;
    cost: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
}

export interface FundingOption {
  id: string;
  name: string;
  type: 'grant' | 'loan' | 'investment' | 'program';
  provider: string;
  amount: { min: number; max: number };
  veteranSpecific: boolean;
  eligibility: string[];
  applicationUrl: string;
  deadline?: string;
}

const VETERAN_BUSINESS_IDEAS: BusinessIdea[] = [
  {
    id: 'idea-1',
    name: 'Cybersecurity Consulting',
    description: 'Provide security assessments and consulting to small/medium businesses',
    industry: 'Information Technology',
    targetMarket: 'Small and medium businesses needing security compliance',
    requiredSkills: ['Network Security', 'Risk Assessment', 'Business Development'],
    estimatedStartupCost: 15000,
    timeToLaunch: '3-6 months',
    veteranAdvantages: [
      'Military security clearance experience',
      'Discipline and attention to detail',
      'Strong work ethic',
      'Government contracting opportunities'
    ]
  },
  {
    id: 'idea-2',
    name: 'Logistics and Supply Chain Consulting',
    description: 'Help businesses optimize their supply chain and logistics operations',
    industry: 'Logistics',
    targetMarket: 'E-commerce and manufacturing companies',
    requiredSkills: ['Supply Chain Management', 'Project Management', 'Data Analysis'],
    estimatedStartupCost: 10000,
    timeToLaunch: '2-4 months',
    veteranAdvantages: [
      'Military logistics experience',
      'Crisis management skills',
      'Global operations knowledge',
      'Process optimization expertise'
    ]
  },
  {
    id: 'idea-3',
    name: 'Leadership Training and Development',
    description: 'Provide leadership coaching and training programs for corporate clients',
    industry: 'Professional Services',
    targetMarket: 'Corporate teams and executives',
    requiredSkills: ['Leadership', 'Public Speaking', 'Coaching', 'Curriculum Development'],
    estimatedStartupCost: 8000,
    timeToLaunch: '2-3 months',
    veteranAdvantages: [
      'Proven leadership experience',
      'Team building expertise',
      'Crisis leadership',
      'Diverse team management'
    ]
  }
];

const VETERAN_FUNDING_OPTIONS: FundingOption[] = [
  {
    id: 'fund-1',
    name: 'SBA Veterans Advantage',
    type: 'loan',
    provider: 'Small Business Administration',
    amount: { min: 5000, max: 5000000 },
    veteranSpecific: true,
    eligibility: ['Honorable discharge', 'Business plan', 'Credit check'],
    applicationUrl: 'https://www.sba.gov/veterans'
  },
  {
    id: 'fund-2',
    name: 'Boots to Business',
    type: 'program',
    provider: 'SBA',
    amount: { min: 0, max: 0 },
    veteranSpecific: true,
    eligibility: ['Any veteran', 'Service member', 'Military spouse'],
    applicationUrl: 'https://sbavets.force.com/s/new-boots-to-business'
  },
  {
    id: 'fund-3',
    name: 'Veteran Business Fund',
    type: 'grant',
    provider: 'StreetShares Foundation',
    amount: { min: 5000, max: 25000 },
    veteranSpecific: true,
    eligibility: ['Veteran-owned business', 'In operation 1+ year'],
    applicationUrl: 'https://www.streetsharesfoundation.org/'
  }
];

/**
 * Assess veteran's readiness for entrepreneurship
 */
export async function assessEntrepreneurshipReadiness(
  veteran: VeteranProfile
): Promise<EntrepreneurshipAssessment> {
  let readinessScore = 0;
  const strengths: string[] = [];
  const challenges: string[] = [];
  const recommendations: string[] = [];

  // Leadership experience (20 points)
  const hasLeadership = veteran.skills.some(s =>
    s.category === 'Leadership' && s.level !== 'beginner'
  );
  if (hasLeadership) {
    readinessScore += 20;
    strengths.push('Strong leadership background from military service');
  }

  // Financial readiness (20 points)
  if (veteran.desiredSalaryRange && veteran.desiredSalaryRange.min >= 60000) {
    readinessScore += 20;
    strengths.push('Financial stability to support startup phase');
  } else {
    challenges.push('May need additional funding or part-time income during startup');
    recommendations.push('Consider starting business while employed');
  }

  // Technical skills (20 points)
  const technicalSkills = veteran.skills.filter(s =>
    s.category === 'Information Technology' ||
    s.category === 'Technical'
  );
  if (technicalSkills.length >= 3) {
    readinessScore += 20;
    strengths.push('Strong technical skill set');
  }

  // Industry experience (20 points)
  const yearsExperience = veteran.branchHistory.reduce((total, service) => {
    const start = new Date(service.startDate);
    const end = service.endDate ? new Date(service.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);

  if (yearsExperience >= 5) {
    readinessScore += 20;
    strengths.push(`${yearsExperience} years of professional experience`);
  }

  // Entrepreneurial interests (20 points)
  if (veteran.interests?.some(i =>
    i.toLowerCase().includes('business') ||
    i.toLowerCase().includes('entrepreneur')
  )) {
    readinessScore += 20;
    strengths.push('Demonstrated interest in entrepreneurship');
  }

  // General recommendations
  recommendations.push('Complete SBA\'s Boots to Business program');
  recommendations.push('Connect with veteran entrepreneur mentor');
  recommendations.push('Develop comprehensive business plan');
  recommendations.push('Research veteran-specific funding options');

  // Suggest business types based on skills
  const suggestedBusinesses: BusinessIdea[] = [];
  if (veteran.skills.some(s => s.category === 'Information Technology')) {
    suggestedBusinesses.push(VETERAN_BUSINESS_IDEAS[0]); // Cybersecurity
  }
  if (veteran.branchHistory.some(s => s.mosOrAfscOrRating.includes('88') || s.title.toLowerCase().includes('logistics'))) {
    suggestedBusinesses.push(VETERAN_BUSINESS_IDEAS[1]); // Logistics
  }
  if (hasLeadership) {
    suggestedBusinesses.push(VETERAN_BUSINESS_IDEAS[2]); // Leadership training
  }

  // Resources needed
  const resourcesNeeded = [
    { category: 'Legal', resource: 'LLC Formation', cost: 500, priority: 'critical' as const },
    { category: 'Financial', resource: 'Business Bank Account', cost: 0, priority: 'critical' as const },
    { category: 'Technology', resource: 'Website and Email', cost: 500, priority: 'high' as const },
    { category: 'Insurance', resource: 'Liability Insurance', cost: 1200, priority: 'high' as const },
    { category: 'Marketing', resource: 'Logo and Branding', cost: 1000, priority: 'medium' as const }
  ];

  return {
    readinessScore,
    strengths,
    challenges,
    recommendations,
    suggestedBusinessTypes: suggestedBusinesses,
    resourcesNeeded
  };
}

/**
 * Get veteran-specific funding options
 */
export async function getVeteranFundingOptions(
  businessType: string,
  fundingNeeded: number
): Promise<FundingOption[]> {
  return VETERAN_FUNDING_OPTIONS.filter(option => {
    if (fundingNeeded > 0) {
      return option.amount.max >= fundingNeeded || option.amount.max === 0;
    }
    return true;
  });
}

/**
 * Generate business plan outline
 */
export async function generateBusinessPlanOutline(
  businessIdea: BusinessIdea,
  veteran: VeteranProfile
): Promise<{
  sections: {
    title: string;
    description: string;
    keyPoints: string[];
  }[];
}> {
  return {
    sections: [
      {
        title: 'Executive Summary',
        description: 'Overview of your business concept',
        keyPoints: [
          `Business Name: ${businessIdea.name}`,
          `Industry: ${businessIdea.industry}`,
          `Funding Needed: $${businessIdea.estimatedStartupCost.toLocaleString()}`,
          'Veteran-owned business advantages'
        ]
      },
      {
        title: 'Company Description',
        description: 'What your business does and what makes it unique',
        keyPoints: [
          businessIdea.description,
          `Target Market: ${businessIdea.targetMarket}`,
          'Veteran-owned differentiators',
          'Mission and vision statements'
        ]
      },
      {
        title: 'Market Analysis',
        description: 'Research on your industry and target customers',
        keyPoints: [
          'Industry size and growth trends',
          'Target customer demographics',
          'Competitive landscape analysis',
          'Market entry strategy'
        ]
      },
      {
        title: 'Organization & Management',
        description: 'Your business structure and team',
        keyPoints: [
          'Legal structure (LLC, S-Corp, etc.)',
          'Ownership structure',
          `Your military background: ${veteran.branchHistory[0]?.title}`,
          'Key team members and advisors'
        ]
      },
      {
        title: 'Services & Products',
        description: 'What you\'re offering to customers',
        keyPoints: [
          'Service/product descriptions',
          'Pricing strategy',
          'Development roadmap',
          'Competitive advantages'
        ]
      },
      {
        title: 'Marketing & Sales',
        description: 'How you\'ll attract and retain customers',
        keyPoints: [
          'Marketing channels',
          'Sales process',
          'Customer acquisition strategy',
          'Veteran business certifications (SDVOSB, etc.)'
        ]
      },
      {
        title: 'Financial Projections',
        description: '3-5 year financial forecasts',
        keyPoints: [
          'Startup costs breakdown',
          'Revenue projections',
          'Expense forecasts',
          'Break-even analysis',
          'Funding requirements'
        ]
      }
    ]
  };
}
