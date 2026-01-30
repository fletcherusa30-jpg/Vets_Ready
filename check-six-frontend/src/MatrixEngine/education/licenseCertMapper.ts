/**
 * License & Certification Mapper
 * Maps military training to civilian certifications and licenses
 */

export interface Certification {
  id: string;
  name: string;
  provider: string;
  category: 'IT' | 'Healthcare' | 'Trade' | 'Business' | 'Safety' | 'Other';
  militaryEquivalent: string[];
  cost: number;
  giBillCovered: boolean;
  duration: string;
  renewalPeriod?: string;
  description: string;
  examInfo?: {
    passingScore: number;
    format: string;
    questions: number;
  };
  careerImpact: string;
  website: string;
}

const CERTIFICATIONS_DATABASE: Certification[] = [
  {
    id: 'cert-1',
    name: 'CompTIA A+',
    provider: 'CompTIA',
    category: 'IT',
    militaryEquivalent: ['25B', '25U', '3D1X1', 'IT'],
    cost: 246,
    giBillCovered: true,
    duration: '3-6 months prep',
    renewalPeriod: '3 years',
    description: 'Entry-level IT certification covering hardware, software, networking, and troubleshooting',
    examInfo: { passingScore: 675, format: 'Multiple choice', questions: 90 },
    careerImpact: 'Required for many IT support roles, $5-10K salary boost',
    website: 'https://comptia.org',
  },
  {
    id: 'cert-2',
    name: 'NREMT (Paramedic)',
    provider: 'National Registry of Emergency Medical Technicians',
    category: 'Healthcare',
    militaryEquivalent: ['68W', 'HM', '4N0X1'],
    cost: 125,
    giBillCovered: true,
    duration: '6-12 months training',
    renewalPeriod: '2 years',
    description: 'National certification for paramedics - required in most states',
    examInfo: { passingScore: 70, format: 'Computer adaptive', questions: 80-150 },
    careerImpact: 'Required for paramedic jobs, average salary $48-72K',
    website: 'https://nremt.org',
  },
  {
    id: 'cert-3',
    name: 'Project Management Professional (PMP)',
    provider: 'Project Management Institute',
    category: 'Business',
    militaryEquivalent: ['All NCO/Officer ranks'],
    cost: 555,
    giBillCovered: false,
    duration: '3-6 months prep',
    renewalPeriod: '3 years',
    description: 'Gold standard for project management professionals',
    examInfo: { passingScore: 61, format: 'Multiple choice', questions: 180 },
    careerImpact: 'Average $15-20K salary increase',
    website: 'https://pmi.org',
  },
  {
    id: 'cert-4',
    name: 'Certified Nursing Assistant (CNA)',
    provider: 'State Boards of Nursing',
    category: 'Healthcare',
    militaryEquivalent: ['68W', 'HM', 'Medical MOSs'],
    cost: 1500,
    giBillCovered: true,
    duration: '4-12 weeks',
    renewalPeriod: '2 years',
    description: 'Entry-level healthcare certification for patient care',
    careerImpact: 'Entry to nursing career path, average $30-40K',
    website: 'https://nursingassistantcentral.com',
  },
];

export function findMatchingCertifications(mosCode: string): Certification[] {
  return CERTIFICATIONS_DATABASE.filter(cert =>
    cert.militaryEquivalent.some(equiv =>
      equiv.toLowerCase().includes(mosCode.toLowerCase()) ||
      mosCode.toLowerCase().includes(equiv.toLowerCase())
    )
  );
}

export function getCertificationRoadmap(goal: string): {
  entryCerts: Certification[];
  intermediateCerts: Certification[];
  advancedCerts: Certification[];
} {
  if (goal === 'IT') {
    return {
      entryCerts: CERTIFICATIONS_DATABASE.filter(c => c.id === 'cert-1'),
      intermediateCerts: [],
      advancedCerts: [],
    };
  }

  return {
    entryCerts: [],
    intermediateCerts: [],
    advancedCerts: [],
  };
}
