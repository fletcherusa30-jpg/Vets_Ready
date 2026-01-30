/**
 * Mission Pack Generator
 * Creates step-by-step mission packs for common veteran goals
 */

export interface MissionPack {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Benefits' | 'Employment' | 'Education' | 'Housing' | 'Health' | 'Transition';
  steps: MissionStep[];
  requiredDocuments: string[];
  tips: string[];
}

export interface MissionStep {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  actions: string[];
  resources: {
    name: string;
    url?: string;
    type: 'Form' | 'Website' | 'Phone' | 'Document';
  }[];
  completed: boolean;
}

export const MISSION_PACKS: MissionPack[] = [
  {
    id: 'file-first-claim',
    name: 'File Your First VA Disability Claim',
    description: 'Complete step-by-step guide to filing your first disability claim',
    estimatedDuration: '2-4 weeks',
    difficulty: 'Beginner',
    category: 'Benefits',
    steps: [
      {
        id: 1,
        title: 'Gather Your DD-214',
        description: 'You need your DD-214 to prove military service',
        estimatedTime: '15 minutes',
        actions: [
          'Download DD-214 from ebenefits.va.gov',
          'Or request from National Archives (takes 2-4 weeks)',
          'Upload to Digital Wallet',
        ],
        resources: [
          { name: 'eBenefits Login', url: 'https://ebenefits.va.gov', type: 'Website' },
          { name: 'National Archives Request', url: 'https://vetrecs.archives.gov', type: 'Website' },
        ],
        completed: false,
      },
      {
        id: 2,
        title: 'List Your Conditions',
        description: 'Identify all service-connected conditions to claim',
        estimatedTime: '30 minutes',
        actions: [
          'Review service medical records',
          'List all current symptoms',
          'Connect symptoms to service events/exposures',
          'Use Symptom Tracker to document',
        ],
        resources: [
          { name: 'VA Disability Conditions List', url: 'https://va.gov', type: 'Website' },
        ],
        completed: false,
      },
      {
        id: 3,
        title: 'Gather Evidence',
        description: 'Collect medical records, lay statements, and buddy statements',
        estimatedTime: '1-2 weeks',
        actions: [
          'Request service medical records',
          'Get current medical records from doctor',
          'Write lay statement using Evidence Builder',
          'Request buddy statements if applicable',
        ],
        resources: [
          { name: 'Lay Statement Builder', type: 'Website' },
          { name: 'VA Form 21-4138', url: 'https://va.gov', type: 'Form' },
        ],
        completed: false,
      },
      {
        id: 4,
        title: 'Submit Your Claim',
        description: 'File online, by mail, or with VSO help',
        estimatedTime: '1 hour',
        actions: [
          'Create account at VA.gov',
          'Complete VA Form 21-526EZ online',
          'Upload all evidence',
          'Submit and save confirmation number',
        ],
        resources: [
          { name: 'VA.gov - File a Claim', url: 'https://va.gov/disability/file-disability-claim-form-21-526ez', type: 'Website' },
          { name: 'VA Form 21-526EZ', type: 'Form' },
        ],
        completed: false,
      },
      {
        id: 5,
        title: 'Attend C&P Exam',
        description: 'Complete VA compensation & pension examination',
        estimatedTime: '1-2 hours',
        actions: [
          'Wait for VA to schedule (usually 30-60 days)',
          'Attend exam on time',
          'Be honest about symptoms',
          'Describe worst days, not best days',
        ],
        resources: [
          { name: 'C&P Exam Tips', type: 'Website' },
        ],
        completed: false,
      },
      {
        id: 6,
        title: 'Wait for Decision',
        description: 'VA reviews evidence and makes decision',
        estimatedTime: '3-6 months',
        actions: [
          'Check status at VA.gov',
          'Respond to any VA requests immediately',
          'Don\'t submit duplicate evidence',
        ],
        resources: [
          { name: 'VA Claim Status', url: 'https://va.gov/claim-or-appeal-status', type: 'Website' },
        ],
        completed: false,
      },
      {
        id: 7,
        title: 'Review Decision',
        description: 'Check your rating and plan next steps',
        estimatedTime: '1 hour',
        actions: [
          'Download decision letter from eBenefits',
          'Review rating for each condition',
          'If denied or low rating, consider filing supplemental claim or appeal',
          'Set up direct deposit for payments',
        ],
        resources: [
          { name: 'eBenefits', url: 'https://ebenefits.va.gov', type: 'Website' },
        ],
        completed: false,
      },
    ],
    requiredDocuments: [
      'DD-214',
      'Service medical records',
      'Current medical records',
      'Lay statement',
    ],
    tips: [
      'Don\'t wait - file even if you don\'t have all evidence yet',
      'VSOs can help you file for free',
      'Never pay anyone to file a claim',
      'More evidence = better chance of approval',
      'You can add conditions later',
    ],
  },
  {
    id: 'get-job',
    name: 'Land Your First Civilian Job',
    description: 'Translate military skills and get hired',
    estimatedDuration: '4-8 weeks',
    difficulty: 'Intermediate',
    category: 'Employment',
    steps: [
      {
        id: 1,
        title: 'Translate Your MOS',
        description: 'Convert military experience to civilian skills',
        estimatedTime: '30 minutes',
        actions: [
          'Use MOS Translator in Employment Hub',
          'List all technical and leadership skills',
          'Identify civilian job titles that match',
        ],
        resources: [
          { name: 'MOS Translator', type: 'Website' },
        ],
        completed: false,
      },
      {
        id: 2,
        title: 'Build Your Resume',
        description: 'Create veteran-friendly resume',
        estimatedTime: '2-4 hours',
        actions: [
          'Use Resume Builder in Employment Hub',
          'Remove military jargon',
          'Quantify achievements',
          'Highlight security clearance if you have one',
        ],
        resources: [
          { name: 'Resume Builder', type: 'Website' },
        ],
        completed: false,
      },
      {
        id: 3,
        title: 'Apply to Jobs',
        description: 'Target veteran-friendly employers',
        estimatedTime: 'Ongoing',
        actions: [
          'Apply to 10-15 jobs per week',
          'Use veteran job boards',
          'Check federal jobs at USAJOBS.gov',
          'Tailor resume for each application',
        ],
        resources: [
          { name: 'USAJOBS', url: 'https://usajobs.gov', type: 'Website' },
          { name: 'Hire Heroes USA', url: 'https://hireheroesusa.org', type: 'Website' },
        ],
        completed: false,
      },
    ],
    requiredDocuments: [
      'Resume',
      'Cover letter template',
      'Reference list',
    ],
    tips: [
      'Networking is more effective than online applications',
      'Attend veteran hiring events',
      'Get resume reviewed by transition counselor',
      'Practice interview answers',
    ],
  },
];

export function getMissionPackById(id: string): MissionPack | undefined {
  return MISSION_PACKS.find(pack => pack.id === id);
}

export function getMissionPacksByCategory(category: string): MissionPack[] {
  return MISSION_PACKS.filter(pack => pack.category === category);
}

export function calculateMissionProgress(missionPack: MissionPack): {
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
} {
  const completedSteps = missionPack.steps.filter(step => step.completed).length;
  const totalSteps = missionPack.steps.length;
  const percentComplete = Math.round((completedSteps / totalSteps) * 100);

  return {
    completedSteps,
    totalSteps,
    percentComplete,
  };
}
