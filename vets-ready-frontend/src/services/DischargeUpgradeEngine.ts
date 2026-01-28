/**
 * DischargeUpgradeEngine.ts
 * Educational tool for veterans seeking discharge upgrade guidance
 *
 * IMPORTANT: This is EDUCATIONAL ONLY. Does NOT provide legal advice.
 */

import { VeteranProfile } from '../contexts/VeteranProfileContext';

export interface DischargeUpgradeAnalysis {
  needsUpgrade: boolean;
  currentDischarge: string;
  boardPathways: BoardPathway[];
  liberalConsiderationFlags: LiberalConsiderationFlag[];
  evidenceChecklist: EvidenceItem[];
  narrativePrompts: NarrativePrompt[];
  timeline: string;
}

export interface BoardPathway {
  id: 'drb' | 'bcmr' | 'darb';
  name: string;
  fullName: string;
  description: string;
  eligibility: string;
  timeWindow: string;
  process: string;
  considerations: string[];
  officialUrl: string;
}

export interface LiberalConsiderationFlag {
  factor: string;
  detected: boolean;
  explanation: string;
  doDGuidance: string;
}

export interface EvidenceItem {
  category: string;
  item: string;
  description: string;
  priority: 'required' | 'highly recommended' | 'helpful';
}

export interface NarrativePrompt {
  section: string;
  prompt: string;
  guidance: string;
  examplePoints: string[];
}

/**
 * Board pathway definitions
 */
const BOARD_PATHWAYS: Record<string, BoardPathway> = {
  drb: {
    id: 'drb',
    name: 'DRB',
    fullName: 'Discharge Review Board',
    description: 'Service-branch board that reviews discharge characterizations',
    eligibility: 'Available to most veterans who received a discharge less than honorable',
    timeWindow: 'Generally within 15 years of discharge (exceptions may apply)',
    process: 'Can be done through records review or personal appearance hearing',
    considerations: [
      'Reviews propriety and equity of discharge',
      'Can consider post-service conduct and achievements',
      'Liberal consideration policy for mental health conditions',
      'Each military branch has its own DRB'
    ],
    officialUrl: 'https://www.ebenefits.va.gov/ebenefits/about/feature?feature=discharge-upgrade'
  },
  bcmr: {
    id: 'bcmr',
    fullName: 'Board for Correction of Military/Naval Records',
    description: 'Civilian board that can correct errors or injustices in military records',
    eligibility: 'Available when DRB denies or is not applicable',
    timeWindow: 'Generally within 3 years of discovering the error (interest of justice exceptions)',
    process: 'Records-based review, can request hearing in some cases',
    considerations: [
      'Broader authority than DRB',
      'Can correct any military record error or injustice',
      'Liberal consideration for mental health, PTSD, TBI, MST',
      'BCMR (Army, Air Force, Coast Guard) or BCNR (Navy, Marines)'
    ],
    officialUrl: 'https://www.ebenefits.va.gov/ebenefits/about/feature?feature=military-personnel-file'
  },
  darb: {
    id: 'darb',
    name: 'DARB',
    fullName: 'DoD Discharge Appeal Review Board',
    description: 'Final DoD-level review board',
    eligibility: 'After exhausting DRB and/or BCMR remedies',
    timeWindow: 'After denial from lower boards',
    process: 'Final administrative review within DoD',
    considerations: [
      'Final DoD review authority',
      'Requires prior DRB/BCMR action',
      'Limited to review of previous board decisions',
      'Not available to all service branches'
    ],
    officialUrl: 'https://www.ebenefits.va.gov/ebenefits/about/feature?feature=discharge-upgrade'
  }
};

/**
 * Analyze discharge status and provide upgrade guidance
 */
export function analyzeDischargeUpgrade(profile: VeteranProfile): DischargeUpgradeAnalysis {
  const needsUpgrade = checkIfNeedsUpgrade(profile);
  const liberalFlags = assessLiberalConsideration(profile);

  return {
    needsUpgrade,
    currentDischarge: profile.characterOfDischarge || 'Not Specified',
    boardPathways: Object.values(BOARD_PATHWAYS),
    liberalConsiderationFlags: liberalFlags,
    evidenceChecklist: generateEvidenceChecklist(profile),
    narrativePrompts: generateNarrativePrompts(profile),
    timeline: estimateTimeline(profile)
  };
}

/**
 * Check if veteran needs discharge upgrade
 */
function checkIfNeedsUpgrade(profile: VeteranProfile): boolean {
  const discharge = profile.characterOfDischarge;
  return discharge !== 'Honorable' && discharge !== '';
}

/**
 * Assess liberal consideration factors
 */
function assessLiberalConsideration(profile: VeteranProfile): LiberalConsiderationFlag[] {
  const flags: LiberalConsiderationFlag[] = [];

  // PTSD
  flags.push({
    factor: 'PTSD (Post-Traumatic Stress Disorder)',
    detected: profile.hasPTSD || false,
    explanation: profile.hasPTSD
      ? 'PTSD was identified in your profile. This is a significant factor for liberal consideration.'
      : 'No PTSD indicated. If you experienced trauma during service and developed PTSD symptoms, this could be relevant.',
    doDGuidance: 'DoD guidance requires liberal consideration for discharge upgrade requests based on PTSD or other mental health conditions that may have contributed to misconduct.'
  });

  // TBI
  flags.push({
    factor: 'TBI (Traumatic Brain Injury)',
    detected: profile.hasTBI || false,
    explanation: profile.hasTBI
      ? 'TBI was identified in your profile. Cognitive and behavioral effects of TBI may be relevant to your discharge.'
      : 'No TBI indicated. If you experienced head injury during service, this could be a mitigating factor.',
    doDGuidance: 'TBI and its effects on behavior and decision-making should be liberally considered when reviewing discharge upgrade requests.'
  });

  // MST
  flags.push({
    factor: 'MST (Military Sexual Trauma)',
    detected: profile.hasMST || false,
    explanation: profile.hasMST
      ? 'MST was identified in your profile. Sexual harassment or assault during service is a critical factor for liberal consideration.'
      : 'No MST indicated. If you experienced sexual harassment or assault during service, this is highly relevant.',
    doDGuidance: 'DoD policy mandates liberal consideration for veterans whose misconduct may be connected to MST or sexual harassment/assault experienced during service.'
  });

  // Other Mental Health
  flags.push({
    factor: 'Other Service-Connected Mental Health Conditions',
    detected: profile.hasOtherMentalHealth || false,
    explanation: profile.hasOtherMentalHealth
      ? 'Other mental health conditions were identified. These may have contributed to the circumstances of your discharge.'
      : 'No other mental health conditions indicated. Depression, anxiety, or other conditions linked to service may be relevant.',
    doDGuidance: 'Any mental health condition that existed during service and may have contributed to misconduct should be liberally considered.'
  });

  return flags;
}

/**
 * Generate evidence checklist
 */
function generateEvidenceChecklist(profile: VeteranProfile): EvidenceItem[] {
  const checklist: EvidenceItem[] = [
    {
      category: 'Military Records',
      item: 'DD214 (Certificate of Discharge)',
      description: 'Your discharge document showing character of discharge and separation code',
      priority: 'required'
    },
    {
      category: 'Military Records',
      item: 'Complete Service Personnel Records',
      description: 'Performance evaluations, awards, disciplinary records',
      priority: 'required'
    },
    {
      category: 'Military Records',
      item: 'Service Treatment Records (STRs)',
      description: 'Medical and mental health records from your time in service',
      priority: 'highly recommended'
    },
    {
      category: 'Medical Evidence',
      item: 'Post-Service Medical Records',
      description: 'Documentation of PTSD, TBI, or other mental health treatment after discharge',
      priority: 'highly recommended'
    },
    {
      category: 'Medical Evidence',
      item: 'VA Disability Rating Decision',
      description: 'If service-connected for mental health conditions',
      priority: 'highly recommended'
    },
    {
      category: 'Medical Evidence',
      item: 'Nexus Letter / Medical Opinion',
      description: 'Professional opinion linking mental health condition to service and/or misconduct',
      priority: 'highly recommended'
    },
    {
      category: 'Supporting Statements',
      item: 'Personal Statement',
      description: 'Your narrative explaining circumstances, mental health factors, and post-service growth',
      priority: 'required'
    },
    {
      category: 'Supporting Statements',
      item: 'Buddy Statements',
      description: 'Statements from fellow service members who witnessed your condition or circumstances',
      priority: 'helpful'
    },
    {
      category: 'Supporting Statements',
      item: 'Family/Friend Statements',
      description: 'Character references and observations about your mental health during/after service',
      priority: 'helpful'
    },
    {
      category: 'Rehabilitation Evidence',
      item: 'Employment Records',
      description: 'Documentation of stable employment and positive contributions',
      priority: 'helpful'
    },
    {
      category: 'Rehabilitation Evidence',
      item: 'Education/Training Certificates',
      description: 'Evidence of continued self-improvement',
      priority: 'helpful'
    },
    {
      category: 'Rehabilitation Evidence',
      item: 'Community Service/Volunteer Work',
      description: 'Demonstration of positive citizenship',
      priority: 'helpful'
    }
  ];

  // Add prior board decision if applicable
  if (profile.hasPriorUpgradeAttempts) {
    checklist.push({
      category: 'Prior Applications',
      item: 'Previous Board Decisions',
      description: 'Copies of any prior DRB, BCMR, or DARB decisions',
      priority: 'required'
    });
  }

  return checklist;
}

/**
 * Generate narrative prompts for personal statement
 */
function generateNarrativePrompts(profile: VeteranProfile): NarrativePrompt[] {
  const prompts: NarrativePrompt[] = [
    {
      section: 'Introduction',
      prompt: 'Introduce yourself and your service.',
      guidance: 'Brief overview of your military service, dates, branch, and role.',
      examplePoints: [
        'When and why you joined the military',
        'Your MOS/rating and duties',
        'Deployments or significant assignments',
        'Your initial service record (if positive)'
      ]
    },
    {
      section: 'Circumstances Leading to Discharge',
      prompt: 'Explain what led to your discharge.',
      guidance: 'Factual, honest account of the events or conduct that resulted in your discharge.',
      examplePoints: [
        'What happened (without minimizing)',
        'Timeline of events',
        'Your state of mind at the time',
        'Any disciplinary actions or warnings'
      ]
    },
    {
      section: 'Mental Health and Mitigating Factors',
      prompt: 'Describe any mental health conditions, trauma, or other factors.',
      guidance: 'Explain how PTSD, TBI, MST, or other conditions affected your behavior and contributed to the circumstances.',
      examplePoints: [
        'When symptoms began',
        'How the condition affected your behavior/judgment',
        'Whether you sought help (and barriers if you didn\'t)',
        'Connection between condition and misconduct'
      ]
    },
    {
      section: 'Post-Service Growth and Rehabilitation',
      prompt: 'Describe how you have changed since your discharge.',
      guidance: 'Evidence of personal growth, treatment, stability, and contributions to society.',
      examplePoints: [
        'Mental health treatment received',
        'Employment and stability',
        'Education or training completed',
        'Family and community involvement',
        'How you\'ve addressed the issues that led to discharge'
      ]
    },
    {
      section: 'Why You Deserve an Upgrade',
      prompt: 'Explain why your discharge characterization should be upgraded.',
      guidance: 'Your argument for why the discharge was too harsh or unjust given all circumstances.',
      examplePoints: [
        'How your service was otherwise honorable',
        'How mental health factors were not considered',
        'The impact of the discharge on your life and benefits',
        'Why an upgrade is equitable and just'
      ]
    }
  ];

  return prompts;
}

/**
 * Estimate timeline (educational estimate only)
 */
function estimateTimeline(profile: VeteranProfile): string {
  return 'DRB decisions typically take 6-12 months. BCMR/BCNR decisions may take 12-24 months or longer. ' +
         'Timeline varies by board, complexity, and backlog. This is an educational estimate only.';
}

/**
 * Generate downloadable worksheet
 */
export function generateDischargeUpgradeWorksheet(
  profile: VeteranProfile,
  analysis: DischargeUpgradeAnalysis,
  narrativeResponses: Record<string, string>
): string {
  let worksheet = 'DISCHARGE UPGRADE HELPER WORKSHEET\n';
  worksheet += '====================================\n\n';
  worksheet += 'EDUCATIONAL TOOL ONLY - NOT LEGAL ADVICE\n\n';

  worksheet += '--- YOUR DISCHARGE DETAILS ---\n';
  worksheet += `Current Discharge: ${analysis.currentDischarge}\n`;
  worksheet += `Branch: ${profile.branch}\n`;
  worksheet += `Years of Service: ${profile.yearsOfService}\n`;
  if (profile.separationCode) worksheet += `Separation Code: ${profile.separationCode}\n`;
  if (profile.narrativeReasonForSeparation) {
    worksheet += `Reason: ${profile.narrativeReasonForSeparation}\n`;
  }
  worksheet += '\n';

  worksheet += '--- LIBERAL CONSIDERATION FACTORS ---\n';
  analysis.liberalConsiderationFlags.forEach(flag => {
    if (flag.detected) {
      worksheet += `✓ ${flag.factor}\n`;
      worksheet += `  ${flag.explanation}\n\n`;
    }
  });
  worksheet += '\n';

  worksheet += '--- BOARD PATHWAYS (EDUCATIONAL) ---\n';
  analysis.boardPathways.forEach(pathway => {
    worksheet += `${pathway.name} - ${pathway.fullName}\n`;
    worksheet += `  ${pathway.description}\n`;
    worksheet += `  Eligibility: ${pathway.eligibility}\n`;
    worksheet += `  Time Window: ${pathway.timeWindow}\n`;
    worksheet += `  Learn more: ${pathway.officialUrl}\n\n`;
  });

  worksheet += '--- EVIDENCE CHECKLIST ---\n';
  const required = analysis.evidenceChecklist.filter(e => e.priority === 'required');
  const recommended = analysis.evidenceChecklist.filter(e => e.priority === 'highly recommended');
  const helpful = analysis.evidenceChecklist.filter(e => e.priority === 'helpful');

  worksheet += 'REQUIRED:\n';
  required.forEach(item => worksheet += `  [ ] ${item.item}\n`);
  worksheet += '\nHIGHLY RECOMMENDED:\n';
  recommended.forEach(item => worksheet += `  [ ] ${item.item}\n`);
  worksheet += '\nHELPFUL:\n';
  helpful.forEach(item => worksheet += `  [ ] ${item.item}\n`);
  worksheet += '\n';

  worksheet += '--- YOUR NARRATIVE (DRAFT) ---\n';
  analysis.narrativePrompts.forEach(prompt => {
    worksheet += `\n${prompt.section.toUpperCase()}\n`;
    worksheet += `${narrativeResponses[prompt.section] || '[Not yet completed]'}\n`;
  });

  worksheet += '\n\n';
  worksheet += '--- IMPORTANT DISCLAIMERS ---\n';
  worksheet += 'This worksheet is for educational and organizational purposes only.\n';
  worksheet += 'VetsReady does NOT provide legal advice or representation.\n';
  worksheet += 'We do NOT guarantee or predict outcomes of discharge upgrade applications.\n';
  worksheet += 'For legal representation, contact a veterans law attorney or accredited VSO.\n';

  return worksheet;
}
