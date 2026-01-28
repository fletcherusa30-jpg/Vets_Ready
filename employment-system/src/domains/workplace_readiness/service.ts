import { VeteranProfile } from '../../../data/models/index.js';

/**
 * Workplace Readiness Service
 * Prepares veterans for civilian workplace culture and expectations
 */

export interface ReadinessAssessment {
  veteranId: string;
  overallScore: number; // 0-100
  dimensions: ReadinessDimension[];
  strengths: string[];
  developmentAreas: string[];
  actionPlan: ReadinessAction[];
}

export interface ReadinessDimension {
  name: string;
  score: number; // 0-100
  description: string;
  examples: string[];
}

export interface ReadinessAction {
  dimension: string;
  action: string;
  resources: string[];
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Assess veteran's workplace readiness
 */
export async function assessWorkplaceReadiness(
  veteran: VeteranProfile
): Promise<ReadinessAssessment> {
  // Calculate scores for each dimension
  const dimensions = calculateReadinessDimensions(veteran);

  // Calculate overall score
  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );

  // Identify strengths and development areas
  const strengths = dimensions.filter(d => d.score >= 80).map(d => d.name);
  const developmentAreas = dimensions.filter(d => d.score < 70).map(d => d.name);

  // Generate action plan
  const actionPlan = generateActionPlan(dimensions);

  return {
    veteranId: veteran.id,
    overallScore,
    dimensions,
    strengths,
    developmentAreas,
    actionPlan
  };
}

/**
 * Calculate readiness across key dimensions
 */
function calculateReadinessDimensions(veteran: VeteranProfile): ReadinessDimension[] {
  return [
    {
      name: 'Communication Style',
      score: 70,
      description: 'Ability to communicate without military jargon',
      examples: [
        'Using civilian terminology instead of military acronyms',
        'Adapting to less formal communication styles',
        'Written and verbal communication clarity'
      ]
    },
    {
      name: 'Cultural Adaptation',
      score: 65,
      description: 'Understanding civilian workplace culture',
      examples: [
        'Navigating less structured environment',
        'Understanding corporate hierarchies vs military rank',
        'Adapting to slower decision-making processes'
      ]
    },
    {
      name: 'Professional Networking',
      score: 50,
      description: 'Building and leveraging professional relationships',
      examples: [
        'LinkedIn presence and engagement',
        'Informational interviews',
        'Professional association memberships'
      ]
    },
    {
      name: 'Resume/Cover Letter',
      score: 75,
      description: 'Translating military experience for civilian employers',
      examples: [
        'Quantified achievements',
        'Civilian-friendly language',
        'ATS optimization'
      ]
    },
    {
      name: 'Interview Skills',
      score: 70,
      description: 'Effectively presenting value in interviews',
      examples: [
        'STAR method responses',
        'Avoiding military jargon',
        'Asking insightful questions'
      ]
    },
    {
      name: 'Work-Life Balance',
      score: 60,
      description: 'Adjusting expectations around work hours and structure',
      examples: [
        'Understanding flexible work arrangements',
        'Setting boundaries',
        'Managing time without military structure'
      ]
    },
    {
      name: 'Technology Proficiency',
      score: hasITBackground(veteran) ? 90 : 65,
      description: 'Comfort with civilian workplace technology',
      examples: [
        'Microsoft Office Suite',
        'Collaboration tools (Slack, Teams, Zoom)',
        'Project management software (Jira, Asana)'
      ]
    },
    {
      name: 'Salary Negotiation',
      score: 55,
      description: 'Advocating for fair compensation',
      examples: [
        'Researching market rates',
        'Negotiating offers confidently',
        'Understanding total compensation packages'
      ]
    }
  ];
}

/**
 * Check if veteran has IT background
 */
function hasITBackground(veteran: VeteranProfile): boolean {
  const itMOS = ['25D', '25B', '17C', '35Q', 'CTN', '1B4X1'];
  return veteran.branchHistory.some(bh => itMOS.includes(bh.mosOrAfscOrRating));
}

/**
 * Generate action plan based on assessment
 */
function generateActionPlan(dimensions: ReadinessDimension[]): ReadinessAction[] {
  const actions: ReadinessAction[] = [];

  for (const dimension of dimensions) {
    if (dimension.score < 70) {
      const action = createActionForDimension(dimension);
      if (action) actions.push(action);
    }
  }

  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Create action item for a dimension
 */
function createActionForDimension(dimension: ReadinessDimension): ReadinessAction | null {
  const actionMap: Record<string, ReadinessAction> = {
    'Communication Style': {
      dimension: 'Communication Style',
      action: 'Practice translating military experience to civilian language',
      resources: [
        'Military Skills Translator (online tool)',
        'LinkedIn Learning: Business Communication',
        'Practice with civilian mentors'
      ],
      timeframe: '2-4 weeks',
      priority: 'high'
    },
    'Cultural Adaptation': {
      dimension: 'Cultural Adaptation',
      action: 'Learn about civilian workplace culture through informational interviews',
      resources: [
        'Veterati mentorship platform',
        'LinkedIn article series on civilian transitions',
        'Corporate culture books (e.g., "The Culture Code")'
      ],
      timeframe: '1-2 months',
      priority: 'high'
    },
    'Professional Networking': {
      dimension: 'Professional Networking',
      action: 'Build LinkedIn presence and connect with 50+ industry professionals',
      resources: [
        'LinkedIn profile optimization guide',
        'American Corporate Partners (ACP)',
        'Industry-specific veteran groups'
      ],
      timeframe: '4-6 weeks',
      priority: 'high'
    },
    'Resume/Cover Letter': {
      dimension: 'Resume/Cover Letter',
      action: 'Create ATS-optimized resume with quantified achievements',
      resources: [
        'VetsReady Resume Builder',
        'Resume review services (Hire Heroes USA)',
        'ATS optimization tools'
      ],
      timeframe: '1 week',
      priority: 'high'
    },
    'Interview Skills': {
      dimension: 'Interview Skills',
      action: 'Practice STAR method responses and veteran-specific questions',
      resources: [
        'Mock interview practice (VetsReady)',
        'Interview coaching services',
        'YouTube interview prep videos'
      ],
      timeframe: '2-3 weeks',
      priority: 'medium'
    },
    'Work-Life Balance': {
      dimension: 'Work-Life Balance',
      action: 'Set realistic expectations about civilian work schedules',
      resources: [
        'Transition counseling',
        'Veteran support groups',
        'Time management training'
      ],
      timeframe: 'Ongoing',
      priority: 'medium'
    },
    'Technology Proficiency': {
      dimension: 'Technology Proficiency',
      action: 'Complete Microsoft Office certification and learn collaboration tools',
      resources: [
        'Microsoft Office training (LinkedIn Learning)',
        'Google Workspace tutorials',
        'Free Coursera courses'
      ],
      timeframe: '3-4 weeks',
      priority: 'medium'
    },
    'Salary Negotiation': {
      dimension: 'Salary Negotiation',
      action: 'Research market rates and practice negotiation scenarios',
      resources: [
        'Glassdoor salary research',
        'Negotiation training (Ramit Sethi, Chris Voss)',
        'Mock negotiation practice'
      ],
      timeframe: '1-2 weeks',
      priority: 'low'
    }
  };

  return actionMap[dimension.name] || null;
}

/**
 * Generate workplace culture guide
 */
export interface CultureGuide {
  differences: CultureDifference[];
  tips: CultureTip[];
  commonChallenges: string[];
  successStrategies: string[];
}

export async function generateCultureGuide(): Promise<CultureGuide> {
  return {
    differences: [
      {
        aspect: 'Decision Making',
        military: 'Centralized, hierarchical, quick',
        civilian: 'Collaborative, consensus-driven, slower',
        adaptation: 'Be patient with longer decision cycles; provide input when asked'
      },
      {
        aspect: 'Communication',
        military: 'Direct, concise, formal',
        civilian: 'Varied formality, more small talk',
        adaptation: 'Balance directness with relationship-building; engage in casual conversation'
      },
      {
        aspect: 'Feedback',
        military: 'Immediate, direct, structured (counselings)',
        civilian: 'Less frequent, often indirect, annual reviews',
        adaptation: 'Seek feedback proactively; don\'t wait for formal reviews'
      },
      {
        aspect: 'Hierarchy',
        military: 'Clear rank structure, salute/address by rank',
        civilian: 'Less formal, first names common',
        adaptation: 'Use first names unless told otherwise; hierarchy exists but is subtler'
      },
      {
        aspect: 'Work Hours',
        military: '24/7 availability, long hours expected',
        civilian: '9-5 (mostly), work-life balance valued',
        adaptation: 'Respect boundaries; it\'s okay to disconnect after hours'
      }
    ],
    tips: [
      'Observe before acting - watch how colleagues interact for first 30 days',
      'Ask questions - "civilian stupid" questions are welcomed',
      'Find a mentor - preferably another veteran who\'s made the transition',
      'Be patient with yourself - culture adaptation takes 6-12 months',
      'Maintain military strengths - punctuality, discipline, work ethic',
      'Let go of military habits - excessive formality, waiting for orders'
    ],
    commonChallenges: [
      'Frustration with slower pace and lack of urgency',
      'Difficulty with ambiguity and less structure',
      'Impatience with "analysis paralysis" in decision-making',
      'Feeling like colleagues don\'t work as hard',
      'Missing camaraderie and sense of mission',
      'Adjusting to self-promotion culture (vs military modesty)'
    ],
    successStrategies: [
      'Embrace adaptability - it\'s a military strength',
      'Build relationships - civilian success requires strong networks',
      'Translate military achievements - use business language',
      'Show initiative - don\'t wait to be told what to do',
      'Be a continuous learner - ask questions and stay curious',
      'Find your tribe - connect with other veterans in the company'
    ]
  };
}

interface CultureDifference {
  aspect: string;
  military: string;
  civilian: string;
  adaptation: string;
}

interface CultureTip {
  // Future expansion
}
