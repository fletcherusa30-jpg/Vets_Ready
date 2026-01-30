/**
 * Transition & Separation Engine
 *
 * Provides transition benefits, resources, and TAP-like checklists
 * for service members transitioning to veteran status.
 *
 * Legal Compliance:
 * - Educational and preparatory only
 * - Does not file claims
 * - Redirects to official resources
 */

export interface TransitionTask {
  id: string;
  category: 'health' | 'education' | 'disability' | 'records' | 'financial' | 'career';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string; // Relative to separation date
  completed: boolean;
  resources: Array<{
    name: string;
    url: string;
    type: 'form' | 'website' | 'guide' | 'video';
  }>;
}

export interface TransitionBenefit {
  id: string;
  name: string;
  category: 'education' | 'employment' | 'health' | 'housing' | 'business';
  description: string;
  eligibility: string[];
  howToApply: string;
  officialUrl: string;
}

export interface TransitionStatus {
  isTransitioning: boolean;
  separationDate?: string;
  daysUntilSeparation?: number;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
}

/**
 * Evaluate if veteran is transitioning
 */
export function evaluateTransitionStatus(profile: any): TransitionStatus {
  const isTransitioning = profile.veteranStatus === 'transitioning' ||
                          profile.veteranStatus === 'active' ||
                          profile.isTransitioning === true;

  const separationDate = profile.separationDate || profile.serviceEndDate;
  let daysUntilSeparation: number | undefined;

  if (separationDate) {
    const sepDate = new Date(separationDate);
    const today = new Date();
    const diffTime = sepDate.getTime() - today.getTime();
    daysUntilSeparation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const tasks = generateTAPChecklist(profile);
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    isTransitioning,
    separationDate,
    daysUntilSeparation,
    completedTasks,
    totalTasks,
    completionPercentage
  };
}

/**
 * Generate TAP-like checklist
 *
 * TAP (Transition Assistance Program) provides a comprehensive checklist
 * for transitioning service members.
 */
export function generateTAPChecklist(profile: any): TransitionTask[] {
  const tasks: TransitionTask[] = [
    // Healthcare Tasks
    {
      id: 'health-1',
      category: 'health',
      title: 'Enroll in VA Healthcare',
      description: 'Apply for VA healthcare benefits. You may be eligible for up to 5 years of free healthcare after separation.',
      priority: 'critical',
      deadline: 'Before separation',
      completed: profile.vaHealthcareEnrolled || false,
      resources: [
        {
          name: 'VA Healthcare Enrollment',
          url: 'https://www.va.gov/health-care/how-to-apply/',
          type: 'website'
        },
        {
          name: 'Form 10-10EZ',
          url: 'https://www.va.gov/vaforms/medical/pdf/10-10EZ-fillable.pdf',
          type: 'form'
        }
      ]
    },
    {
      id: 'health-2',
      category: 'health',
      title: 'Schedule Separation Health Assessment',
      description: 'Complete your separation physical and mental health assessments.',
      priority: 'critical',
      deadline: '90-180 days before separation',
      completed: false,
      resources: [
        {
          name: 'Separation Health Assessment Guide',
          url: 'https://www.health.mil/Military-Health-Topics/Health-Readiness/Reserve-Health-Readiness-Program/Our-Services/Separation-Health-Assessment',
          type: 'guide'
        }
      ]
    },
    {
      id: 'health-3',
      category: 'health',
      title: 'Request Medical Records',
      description: 'Obtain copies of your complete military medical records.',
      priority: 'high',
      deadline: '120 days before separation',
      completed: false,
      resources: [
        {
          name: 'Request Medical Records',
          url: 'https://www.va.gov/records/get-military-service-records/',
          type: 'website'
        }
      ]
    },

    // Disability Tasks
    {
      id: 'disability-1',
      category: 'disability',
      title: 'File BDD Claim (Benefits Delivery at Discharge)',
      description: 'File your disability claim 90-180 days before separation for faster processing.',
      priority: 'critical',
      deadline: '90-180 days before separation',
      completed: false,
      resources: [
        {
          name: 'BDD Program Information',
          url: 'https://www.va.gov/disability/how-to-file-claim/when-to-file/pre-discharge-claim/',
          type: 'website'
        }
      ]
    },
    {
      id: 'disability-2',
      category: 'disability',
      title: 'Attend VA Benefits Briefing',
      description: 'Attend a VA benefits briefing to understand your disability claim options.',
      priority: 'high',
      deadline: '180 days before separation',
      completed: false,
      resources: [
        {
          name: 'Find a VA Benefits Briefing',
          url: 'https://www.benefits.va.gov/tap/',
          type: 'website'
        }
      ]
    },
    {
      id: 'disability-3',
      category: 'disability',
      title: 'Gather Evidence for Claim',
      description: 'Collect service treatment records, buddy statements, and private medical records.',
      priority: 'high',
      deadline: '120 days before separation',
      completed: false,
      resources: [
        {
          name: 'Evidence Guide',
          url: 'https://www.va.gov/disability/how-to-file-claim/evidence-needed/',
          type: 'guide'
        }
      ]
    },

    // Records Tasks
    {
      id: 'records-1',
      category: 'records',
      title: 'Request DD214',
      description: 'Ensure you receive your DD214 at separation and store it safely.',
      priority: 'critical',
      deadline: 'At separation',
      completed: false,
      resources: [
        {
          name: 'DD214 Information',
          url: 'https://www.archives.gov/veterans/military-service-records',
          type: 'website'
        }
      ]
    },
    {
      id: 'records-2',
      category: 'records',
      title: 'Request Service Records',
      description: 'Get copies of your complete service records (201 file, OMPFs).',
      priority: 'high',
      deadline: '60 days before separation',
      completed: false,
      resources: [
        {
          name: 'Request Service Records',
          url: 'https://www.va.gov/records/',
          type: 'website'
        }
      ]
    },

    // Education Tasks
    {
      id: 'education-1',
      category: 'education',
      title: 'Apply for GI Bill Benefits',
      description: 'Apply for Post-9/11 GI Bill or Montgomery GI Bill benefits.',
      priority: 'high',
      deadline: 'Before or after separation',
      completed: false,
      resources: [
        {
          name: 'GI Bill Comparison Tool',
          url: 'https://www.va.gov/education/gi-bill-comparison-tool/',
          type: 'website'
        },
        {
          name: 'Apply for Education Benefits',
          url: 'https://www.va.gov/education/how-to-apply/',
          type: 'website'
        }
      ]
    },
    {
      id: 'education-2',
      category: 'education',
      title: 'Explore VET TEC or VR&E',
      description: 'Consider Veteran Employment Through Technology Education Courses (VET TEC) or Vocational Rehabilitation.',
      priority: 'medium',
      deadline: 'After separation',
      completed: false,
      resources: [
        {
          name: 'VET TEC Program',
          url: 'https://www.va.gov/education/about-gi-bill-benefits/how-to-use-benefits/vettec-high-tech-program/',
          type: 'website'
        },
        {
          name: 'VR&E Services',
          url: 'https://www.va.gov/careers-employment/vocational-rehabilitation/',
          type: 'website'
        }
      ]
    },

    // Career/Employment Tasks
    {
      id: 'career-1',
      category: 'career',
      title: 'Update Resume and LinkedIn',
      description: 'Translate military skills to civilian terms and optimize your resume.',
      priority: 'high',
      deadline: '90 days before separation',
      completed: false,
      resources: [
        {
          name: 'Military Skills Translator',
          url: 'https://www.careeronestop.org/Toolkit/Skills/skills-translator.aspx',
          type: 'website'
        }
      ]
    },
    {
      id: 'career-2',
      category: 'career',
      title: 'Register with VA for Veterans',
      description: 'Register with VA for Veterans (V4V) for employment assistance.',
      priority: 'medium',
      deadline: 'After separation',
      completed: false,
      resources: [
        {
          name: 'VA for Veterans',
          url: 'https://www.va.gov/careers-employment/',
          type: 'website'
        }
      ]
    },

    // Financial Tasks
    {
      id: 'financial-1',
      category: 'financial',
      title: 'Create Post-Separation Budget',
      description: 'Plan your finances for the transition period, including healthcare and housing.',
      priority: 'high',
      deadline: '90 days before separation',
      completed: false,
      resources: [
        {
          name: 'Financial Planning Guide',
          url: 'https://finred.usalearning.gov/',
          type: 'guide'
        }
      ]
    },
    {
      id: 'financial-2',
      category: 'financial',
      title: 'Understand TSP and Retirement',
      description: 'Learn about your Thrift Savings Plan and retirement options.',
      priority: 'medium',
      deadline: '60 days before separation',
      completed: false,
      resources: [
        {
          name: 'TSP Information',
          url: 'https://www.tsp.gov/',
          type: 'website'
        }
      ]
    }
  ];

  return tasks;
}

/**
 * Get transition benefits
 */
export function getTransitionBenefits(profile: any): TransitionBenefit[] {
  const benefits: TransitionBenefit[] = [
    // Education Benefits
    {
      id: 'edu-1',
      name: 'Post-9/11 GI Bill',
      category: 'education',
      description: 'Covers tuition, housing, and books for college, vocational, or technical training.',
      eligibility: [
        'Served at least 90 days on active duty after September 10, 2001',
        'Received honorable discharge'
      ],
      howToApply: 'Apply online at VA.gov or submit Form 22-1990',
      officialUrl: 'https://www.va.gov/education/about-gi-bill-benefits/post-9-11/'
    },
    {
      id: 'edu-2',
      name: 'Montgomery GI Bill (MGIB)',
      category: 'education',
      description: 'Monthly education benefit for up to 36 months.',
      eligibility: [
        'Contributed to MGIB during service',
        'Served at least 2 years on active duty',
        'Received honorable discharge'
      ],
      howToApply: 'Apply online at VA.gov or submit Form 22-1990',
      officialUrl: 'https://www.va.gov/education/about-gi-bill-benefits/montgomery-active-duty/'
    },
    {
      id: 'edu-3',
      name: 'VET TEC',
      category: 'education',
      description: 'High-tech training and certification programs at no cost.',
      eligibility: [
        'Have at least 1 day of unexpired GI Bill entitlement',
        'Not on active duty',
        'Not enrolled in another education program'
      ],
      howToApply: 'Apply online at VA.gov',
      officialUrl: 'https://www.va.gov/education/about-gi-bill-benefits/how-to-use-benefits/vettec-high-tech-program/'
    },

    // Employment Benefits
    {
      id: 'emp-1',
      name: 'Vocational Rehabilitation & Employment (VR&E)',
      category: 'employment',
      description: 'Career counseling, job training, and employment assistance for veterans with service-connected disabilities.',
      eligibility: [
        'Have service-connected disability rating of at least 10%',
        'Received honorable discharge',
        'Employment handicap due to disability'
      ],
      howToApply: 'Apply online at VA.gov or submit Form 28-1900',
      officialUrl: 'https://www.va.gov/careers-employment/vocational-rehabilitation/'
    },
    {
      id: 'emp-2',
      name: 'VA for Veterans (V4V)',
      category: 'employment',
      description: 'Employment assistance, resume help, and job search support.',
      eligibility: ['All veterans'],
      howToApply: 'Register at VA.gov',
      officialUrl: 'https://www.va.gov/careers-employment/'
    },

    // Healthcare Benefits
    {
      id: 'health-1',
      name: 'VA Healthcare',
      category: 'health',
      description: 'Comprehensive healthcare coverage through the VA health system.',
      eligibility: [
        'Served on active duty',
        'Separated under conditions other than dishonorable'
      ],
      howToApply: 'Apply online at VA.gov or submit Form 10-10EZ',
      officialUrl: 'https://www.va.gov/health-care/'
    },
    {
      id: 'health-2',
      name: 'TRICARE (if eligible)',
      category: 'health',
      description: 'Continued healthcare coverage for retirees and families.',
      eligibility: [
        'Retired from active duty with 20+ years',
        'Medically retired'
      ],
      howToApply: 'Contact TRICARE directly',
      officialUrl: 'https://www.tricare.mil/'
    },

    // Housing Benefits
    {
      id: 'housing-1',
      name: 'VA Home Loan',
      category: 'housing',
      description: 'No down payment, no PMI, competitive interest rates.',
      eligibility: [
        'Meet minimum service requirements',
        'Received honorable discharge',
        'Meet credit and income standards'
      ],
      howToApply: 'Apply through VA-approved lender',
      officialUrl: 'https://www.va.gov/housing-assistance/home-loans/'
    },

    // Business Benefits
    {
      id: 'business-1',
      name: 'Veteran Entrepreneur Portal',
      category: 'business',
      description: 'Resources, training, and support for veteran-owned businesses.',
      eligibility: ['All veterans and transitioning service members'],
      howToApply: 'Register at Veteran Entrepreneur Portal',
      officialUrl: 'https://www.va.gov/osdbu/'
    },
    {
      id: 'business-2',
      name: 'Boots to Business',
      category: 'business',
      description: 'Entrepreneurship training program as part of TAP.',
      eligibility: ['Transitioning service members and veterans within 180 days of separation'],
      howToApply: 'Enroll through your TAP counselor',
      officialUrl: 'https://ivmf.syracuse.edu/programs/entrepreneurship/boots-to-business/'
    }
  ];

  return benefits;
}

/**
 * Get healthcare transition guidance
 */
export function getHealthcareGuidance(profile: any): {
  timeline: string;
  steps: string[];
  resources: Array<{ name: string; url: string }>;
} {
  return {
    timeline: 'Start 180 days before separation',
    steps: [
      'Complete separation health assessment',
      'Gather all medical records',
      'Document all conditions and symptoms',
      'Apply for VA healthcare (Form 10-10EZ)',
      'Schedule initial VA appointments',
      'Understand your priority group',
      'Enroll family in TRICARE if eligible'
    ],
    resources: [
      {
        name: 'VA Healthcare Enrollment',
        url: 'https://www.va.gov/health-care/how-to-apply/'
      },
      {
        name: 'Healthcare Priority Groups',
        url: 'https://www.va.gov/health-care/eligibility/priority-groups/'
      },
      {
        name: 'Find a VA Facility',
        url: 'https://www.va.gov/find-locations/'
      }
    ]
  };
}
