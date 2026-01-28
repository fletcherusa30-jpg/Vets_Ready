/**
 * MOS Engine Integration
 * Connects employment system to military job intelligence
 */

import { BranchServiceRecord, Skill } from '../../../data/models/index.js';

export interface MOSData {
  code: string;
  branch: string;
  title: string;
  category: string;
  skills: string[];
  civilianJobs: string[];
  certifications: string[];
  securityClearance?: string;
}

/**
 * Fetch MOS data from MOS Engine
 */
export async function fetchMOSData(
  branch: string,
  mosCode: string
): Promise<MOSData | null> {
  try {
    // In production, this would call the MOS Engine API
    // For now, return mock data
    const mockData = getMockMOSData(branch, mosCode);
    return mockData;
  } catch (error) {
    console.error(`Error fetching MOS data for ${branch} ${mosCode}:`, error);
    return null;
  }
}

/**
 * Convert military service to skills using MOS Engine
 */
export async function convertMilitaryServiceToSkills(
  service: BranchServiceRecord
): Promise<Skill[]> {
  const mosData = await fetchMOSData(service.branch, service.mosOrAfscOrRating);

  if (!mosData) {
    return [];
  }

  const skills: Skill[] = [];

  for (const skillName of mosData.skills) {
    skills.push({
      id: `skill-${skillName.toLowerCase().replace(/\s+/g, '-')}`,
      name: skillName,
      category: mosData.category,
      level: 'advanced', // MOS skills are assumed advanced
      source: 'MOS',
      yearsOfExperience: calculateYearsOfExperience(service)
    });
  }

  return skills;
}

/**
 * Calculate years of experience from service record
 */
function calculateYearsOfExperience(service: BranchServiceRecord): number {
  const start = new Date(service.startDate);
  const end = service.endDate ? new Date(service.endDate) : new Date();
  const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.floor(years);
}

/**
 * Get civilian job recommendations from MOS
 */
export async function getCivilianJobsFromMOS(
  branch: string,
  mosCode: string
): Promise<string[]> {
  const mosData = await fetchMOSData(branch, mosCode);
  return mosData?.civilianJobs || [];
}

/**
 * Get recommended certifications from MOS
 */
export async function getCertificationsFromMOS(
  branch: string,
  mosCode: string
): Promise<string[]> {
  const mosData = await fetchMOSData(branch, mosCode);
  return mosData?.certifications || [];
}

/**
 * Mock MOS data (replace with actual MOS Engine integration)
 */
function getMockMOSData(branch: string, mosCode: string): MOSData | null {
  const mosDatabase: Record<string, MOSData> = {
    '25D': {
      code: '25D',
      branch: 'Army',
      title: 'Cyber Network Defender',
      category: 'Information Technology',
      skills: [
        'Network Security',
        'Incident Response',
        'Vulnerability Assessment',
        'Security Operations Center (SOC)',
        'Intrusion Detection'
      ],
      civilianJobs: [
        'Cybersecurity Analyst',
        'Security Operations Center Analyst',
        'Network Security Engineer',
        'Information Security Analyst'
      ],
      certifications: ['Security+', 'CEH', 'CISSP', 'GIAC GSEC'],
      securityClearance: 'Secret'
    },
    '25B': {
      code: '25B',
      branch: 'Army',
      title: 'Information Technology Specialist',
      category: 'Information Technology',
      skills: [
        'Network Administration',
        'Help Desk Support',
        'System Troubleshooting',
        'Active Directory',
        'Windows Server'
      ],
      civilianJobs: [
        'IT Support Specialist',
        'Network Administrator',
        'Systems Administrator',
        'Help Desk Technician'
      ],
      certifications: ['CompTIA A+', 'Network+', 'MCSA', 'CCNA']
    },
    '88N': {
      code: '88N',
      branch: 'Army',
      title: 'Transportation Management Coordinator',
      category: 'Logistics',
      skills: [
        'Transportation Management',
        'Logistics Coordination',
        'Route Planning',
        'Cargo Management',
        'Fleet Operations'
      ],
      civilianJobs: [
        'Logistics Coordinator',
        'Transportation Manager',
        'Supply Chain Analyst',
        'Operations Manager'
      ],
      certifications: ['APICS CPIM', 'CLTD', 'CTL']
    },
    '92A': {
      code: '92A',
      branch: 'Army',
      title: 'Automated Logistical Specialist',
      category: 'Logistics',
      skills: [
        'Supply Chain Management',
        'Inventory Control',
        'Warehouse Operations',
        'Procurement',
        'Asset Management'
      ],
      civilianJobs: [
        'Supply Chain Manager',
        'Warehouse Manager',
        'Inventory Control Specialist',
        'Procurement Specialist'
      ],
      certifications: ['APICS CPIM', 'CSCP', 'Six Sigma']
    },
    '68W': {
      code: '68W',
      branch: 'Army',
      title: 'Combat Medic Specialist',
      category: 'Healthcare',
      skills: [
        'Emergency Medical Care',
        'Trauma Care',
        'Patient Assessment',
        'IV Therapy',
        'Medical Documentation'
      ],
      civilianJobs: [
        'Paramedic',
        'Emergency Medical Technician',
        'Licensed Practical Nurse',
        'Emergency Room Technician'
      ],
      certifications: ['EMT-P', 'NREMT', 'LPN License', 'ACLS']
    },
    '35F': {
      code: '35F',
      branch: 'Army',
      title: 'Intelligence Analyst',
      category: 'Analysis',
      skills: [
        'Intelligence Analysis',
        'Data Analysis',
        'Report Writing',
        'Threat Assessment',
        'Research'
      ],
      civilianJobs: [
        'Intelligence Analyst',
        'Data Analyst',
        'Business Analyst',
        'Research Analyst'
      ],
      certifications: ['CISA', 'Certified Analytics Professional'],
      securityClearance: 'Top Secret'
    }
  };

  return mosDatabase[mosCode] || null;
}

/**
 * Batch fetch MOS data for multiple service records
 */
export async function batchFetchMOSData(
  services: BranchServiceRecord[]
): Promise<Map<string, MOSData>> {
  const results = new Map<string, MOSData>();

  for (const service of services) {
    const data = await fetchMOSData(service.branch, service.mosOrAfscOrRating);
    if (data) {
      results.set(`${service.branch}-${service.mosOrAfscOrRating}`, data);
    }
  }

  return results;
}
