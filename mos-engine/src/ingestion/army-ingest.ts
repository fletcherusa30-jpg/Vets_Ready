import fs from 'fs/promises';
import path from 'path';
import { MilitaryJob, RawJobDataSchema } from '../models/MilitaryJob.js';
import { MOS_SKILLS } from './data/army-mos-data.js';

const BRANCH = 'Army';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'processed', 'army.json');

/**
 * Ingest Army MOS codes
 * Data source: Existing ResumeSkills.tsx + official Army sources
 */
export async function ingestArmyJobs(): Promise<MilitaryJob[]> {
  const jobs: MilitaryJob[] = [];

  console.log(`[Army Ingestion] Starting...`);

  // Convert existing MOS_SKILLS data
  for (const [mosCode, skills] of Object.entries(MOS_SKILLS)) {
    // Only process Army MOS codes (numeric format like 11B, 25B, etc.)
    if (!/^\d{2}[A-Z]/.test(mosCode)) continue;

    const job: MilitaryJob = {
      id: mosCode,
      branch: BRANCH,
      category: getCategoryFromMOS(mosCode),
      title: skills[0] || `MOS ${mosCode}`,
      description: `Army ${skills[0] || 'Military Occupational Specialty'} - ${mosCode}`,
      source: 'Manual',
      lastVerified: new Date().toISOString(),
      status: 'active',
      skills: skills.slice(1), // First item is often the title
      softSkills: extractSoftSkills(skills),
      certifications: suggestCertifications(mosCode, skills),
      civilianMatches: [],
      resumeBullets: [],
      impactExamples: [],
      keywords: skills,
      securityClearance: getSecurityClearance(mosCode),
    };

    jobs.push(job);
  }

  console.log(`[Army Ingestion] Processed ${jobs.length} MOS codes`);

  // Write to file
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(jobs, null, 2));
  console.log(`[Army Ingestion] Saved to ${OUTPUT_PATH}`);

  return jobs;
}

/**
 * Determine category from MOS code
 */
function getCategoryFromMOS(mos: string): string {
  const series = mos.substring(0, 2);

  const categoryMap: Record<string, string> = {
    '11': 'Infantry',
    '12': 'Combat Engineering',
    '13': 'Field Artillery',
    '15': 'Aviation',
    '18': 'Special Forces',
    '19': 'Armor/Cavalry',
    '25': 'Signal/IT',
    '31': 'Military Police',
    '35': 'Intelligence',
    '36': 'Finance',
    '37': 'Psychological Operations',
    '38': 'Civil Affairs',
    '42': 'Human Resources',
    '68': 'Medical',
    '74': 'CBRN',
    '88': 'Transportation',
    '89': 'Ammunition',
    '91': 'Maintenance',
    '92': 'Logistics',
  };

  return categoryMap[series] || 'Other';
}

/**
 * Extract soft skills from skill list
 */
function extractSoftSkills(skills: string[]): string[] {
  const softSkillKeywords = [
    'leadership', 'team', 'communication', 'coordination', 'training',
    'mentoring', 'collaboration', 'problem solving', 'adaptability', 'critical thinking'
  ];

  return skills.filter(skill =>
    softSkillKeywords.some(keyword => skill.toLowerCase().includes(keyword))
  );
}

/**
 * Suggest relevant certifications based on MOS
 */
function suggestCertifications(mos: string, skills: string[]): string[] {
  const certs: string[] = [];

  // IT/Signal MOS
  if (mos.startsWith('25')) {
    certs.push('CompTIA A+', 'CompTIA Network+', 'CompTIA Security+', 'CCNA');
  }

  // Medical MOS
  if (mos.startsWith('68')) {
    certs.push('EMT', 'Paramedic', 'Licensed Practical Nurse (LPN)');
  }

  // Intelligence MOS
  if (mos.startsWith('35')) {
    certs.push('Security+ CE', 'Certified Information Systems Security Professional (CISSP)');
  }

  // Leadership positions
  if (skills.some(s => s.toLowerCase().includes('leadership') || s.toLowerCase().includes('management'))) {
    certs.push('Project Management Professional (PMP)');
  }

  return certs;
}

/**
 * Determine typical security clearance for MOS
 */
function getSecurityClearance(mos: string): 'None' | 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI' | undefined {
  // Intelligence and Special Forces typically require high clearances
  if (mos.startsWith('35') || mos.startsWith('18')) {
    return 'Secret';
  }

  // Signal/IT often requires Secret
  if (mos.startsWith('25')) {
    return 'Secret';
  }

  return undefined;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestArmyJobs();
}
