import { BranchServiceRecord, Skill } from '../../../data/models/index.js';

/**
 * Military-to-Civilian Skills Translation Service
 * Translates military experience into civilian-relevant skills
 */

export interface TranslationResult {
  militarySkill: string;
  civilianEquivalents: string[];
  category: string;
  proficiencyLevel: string;
  examples: string[];
}

/**
 * Translate all military experience to civilian skills
 */
export async function translateMilitaryExperience(
  branchHistory: BranchServiceRecord[]
): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];

  for (const service of branchHistory) {
    const mosTranslations = await translateMOS(
      service.branch,
      service.mosOrAfscOrRating,
      service.title
    );
    results.push(...mosTranslations);
  }

  return results;
}

/**
 * Translate a specific MOS/AFSC/Rating to civilian skills
 */
export async function translateMOS(
  branch: string,
  code: string,
  title: string
): Promise<TranslationResult[]> {
  const translations: TranslationResult[] = [];

  // Leadership skills (universal across all military roles)
  translations.push({
    militarySkill: 'Military Leadership',
    civilianEquivalents: [
      'Team Leadership',
      'Personnel Management',
      'Performance Management',
      'Mentoring & Coaching',
      'Decision Making Under Pressure'
    ],
    category: 'Leadership',
    proficiencyLevel: 'Advanced',
    examples: [
      'Led teams of 5-50+ personnel in high-stakes environments',
      'Managed performance evaluations and professional development',
      'Made critical decisions with limited information'
    ]
  });

  // Communication skills
  translations.push({
    militarySkill: 'Military Communication',
    civilianEquivalents: [
      'Written Communication',
      'Verbal Communication',
      'Presentation Skills',
      'Technical Documentation',
      'Cross-functional Collaboration'
    ],
    category: 'Communication',
    proficiencyLevel: 'Advanced',
    examples: [
      'Briefed senior leadership on complex operations',
      'Created and maintained detailed operational reports',
      'Coordinated across multiple teams and departments'
    ]
  });

  // MOS-specific translations
  const mosSpecific = getMOSSpecificTranslations(branch, code, title);
  translations.push(...mosSpecific);

  return translations;
}

/**
 * Get MOS-specific skill translations
 */
function getMOSSpecificTranslations(branch: string, code: string, title: string): TranslationResult[] {
  const translations: TranslationResult[] = [];

  // Cybersecurity/IT MOSs
  if (['25D', '25B', '17C', '35Q', '35S', 'CTN', '1B4X1'].includes(code)) {
    translations.push({
      militarySkill: title,
      civilianEquivalents: [
        'Network Security',
        'Cybersecurity Analysis',
        'Incident Response',
        'Vulnerability Assessment',
        'Security Operations Center (SOC) Operations'
      ],
      category: 'Information Technology',
      proficiencyLevel: 'Advanced',
      examples: [
        'Monitored and defended critical network infrastructure',
        'Conducted security assessments and penetration testing',
        'Responded to cybersecurity incidents and breaches'
      ]
    });
  }

  // Logistics MOSs
  if (['88N', '92A', '92Y', '3043', 'LS', 'SK', '2T0X1'].includes(code)) {
    translations.push({
      militarySkill: title,
      civilianEquivalents: [
        'Supply Chain Management',
        'Inventory Control',
        'Warehouse Management',
        'Logistics Coordination',
        'Procurement'
      ],
      category: 'Logistics',
      proficiencyLevel: 'Advanced',
      examples: [
        'Managed multi-million dollar inventory systems',
        'Coordinated complex supply chain operations',
        'Optimized distribution and transportation logistics'
      ]
    });
  }

  // Medical MOSs
  if (['68W', '68C', 'HM', '4N0X1'].includes(code)) {
    translations.push({
      militarySkill: title,
      civilianEquivalents: [
        'Emergency Medical Care',
        'Patient Assessment',
        'Trauma Care',
        'Medical Documentation',
        'Clinical Procedures'
      ],
      category: 'Healthcare',
      proficiencyLevel: 'Advanced',
      examples: [
        'Provided emergency medical care in high-stress environments',
        'Performed patient assessments and triage',
        'Maintained detailed medical records'
      ]
    });
  }

  // Intelligence MOSs
  if (['35F', '35M', '35L', '0231', 'IS', '1N0X1'].includes(code)) {
    translations.push({
      militarySkill: title,
      civilianEquivalents: [
        'Data Analysis',
        'Intelligence Analysis',
        'Report Writing',
        'Research & Investigation',
        'Threat Assessment'
      ],
      category: 'Analysis',
      proficiencyLevel: 'Advanced',
      examples: [
        'Analyzed complex datasets to identify patterns and threats',
        'Produced intelligence reports for senior decision-makers',
        'Conducted investigations and assessments'
      ]
    });
  }

  // Maintenance/Mechanical MOSs
  if (['91B', '91F', '2M0X1', 'AD', 'AM'].includes(code)) {
    translations.push({
      militarySkill: title,
      civilianEquivalents: [
        'Mechanical Repair',
        'Preventive Maintenance',
        'Troubleshooting',
        'Quality Control',
        'Equipment Diagnostics'
      ],
      category: 'Maintenance',
      proficiencyLevel: 'Advanced',
      examples: [
        'Performed diagnostics and repairs on complex equipment',
        'Conducted preventive maintenance programs',
        'Ensured quality and safety standards'
      ]
    });
  }

  return translations;
}

/**
 * Generate a skills summary for a resume
 */
export async function generateSkillsSummary(
  branchHistory: BranchServiceRecord[],
  targetIndustry?: string
): Promise<string[]> {
  const translations = await translateMilitaryExperience(branchHistory);

  // Group by category
  const categorized = new Map<string, Set<string>>();

  for (const translation of translations) {
    if (!categorized.has(translation.category)) {
      categorized.set(translation.category, new Set());
    }

    for (const skill of translation.civilianEquivalents) {
      categorized.get(translation.category)!.add(skill);
    }
  }

  // Convert to array format
  const summary: string[] = [];

  for (const [category, skills] of categorized.entries()) {
    const skillsList = Array.from(skills).slice(0, 5).join(', ');
    summary.push(`${category}: ${skillsList}`);
  }

  return summary;
}

/**
 * Generate skill keywords for ATS optimization
 */
export async function generateATSKeywords(
  branchHistory: BranchServiceRecord[],
  targetJobTitle?: string
): Promise<string[]> {
  const translations = await translateMilitaryExperience(branchHistory);
  const keywords = new Set<string>();

  for (const translation of translations) {
    for (const skill of translation.civilianEquivalents) {
      keywords.add(skill);
    }
  }

  // Add industry-specific keywords based on target job
  if (targetJobTitle) {
    const industryKeywords = getIndustryKeywords(targetJobTitle);
    industryKeywords.forEach(kw => keywords.add(kw));
  }

  return Array.from(keywords);
}

function getIndustryKeywords(jobTitle: string): string[] {
  const title = jobTitle.toLowerCase();

  if (title.includes('cyber') || title.includes('security')) {
    return [
      'NIST', 'ISO 27001', 'Risk Assessment', 'Compliance',
      'Incident Response', 'SIEM', 'Firewall', 'IDS/IPS'
    ];
  }

  if (title.includes('project') || title.includes('manager')) {
    return [
      'Agile', 'Scrum', 'Stakeholder Management', 'Budget Management',
      'Risk Management', 'Microsoft Project', 'Jira'
    ];
  }

  if (title.includes('logistics') || title.includes('supply')) {
    return [
      'SAP', 'ERP', 'Lean Six Sigma', 'Inventory Management',
      'Distribution', 'Forecasting', 'Vendor Management'
    ];
  }

  return [];
}
