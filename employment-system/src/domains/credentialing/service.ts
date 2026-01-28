import { Credential, VeteranProfile } from '../../../data/models/index.js';

/**
 * Credentialing Service
 * Helps veterans identify, plan, and obtain valuable certifications and licenses
 */

export interface CredentialRecommendation {
  credential: CredentialInfo;
  priority: 'high' | 'medium' | 'low';
  reasons: string[];
  cost: number;
  timeToComplete: string;
  giBillEligible: boolean;
  providerOptions: CredentialProvider[];
}

export interface CredentialInfo {
  id: string;
  name: string;
  type: 'certification' | 'license' | 'degree' | 'apprenticeship';
  industry: string;
  description: string;
  requirements: string[];
  renewalPeriod?: string;
  demandLevel: 'very-high' | 'high' | 'moderate' | 'low';
}

export interface CredentialProvider {
  name: string;
  cost: number;
  duration: string;
  format: 'online' | 'in-person' | 'hybrid';
  giBillAccepted: boolean;
  veteranDiscount?: number;
  url?: string;
}

/**
 * Recommend credentials for a veteran based on their profile and goals
 */
export async function recommendCredentials(
  veteran: VeteranProfile,
  targetIndustry?: string
): Promise<CredentialRecommendation[]> {
  const allCredentials = await getAllCredentials();
  const recommendations: CredentialRecommendation[] = [];

  for (const cred of allCredentials) {
    // Skip if veteran already has this credential
    const alreadyHas = veteran.credentials.some(
      vc => vc.name.toLowerCase() === cred.name.toLowerCase() && vc.status === 'completed'
    );
    if (alreadyHas) continue;

    // Calculate priority
    const priority = calculateCredentialPriority(veteran, cred, targetIndustry);

    if (priority !== 'low' || !targetIndustry) {
      const reasons = generateCredentialReasons(veteran, cred);
      const providers = await getCredentialProviders(cred.id);
      const avgCost = providers.reduce((sum, p) => sum + p.cost, 0) / providers.length;

      recommendations.push({
        credential: cred,
        priority,
        reasons,
        cost: avgCost,
        timeToComplete: providers[0]?.duration || 'Varies',
        giBillEligible: providers.some(p => p.giBillAccepted),
        providerOptions: providers
      });
    }
  }

  // Sort by priority
  const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Calculate credential priority
 */
function calculateCredentialPriority(
  veteran: VeteranProfile,
  cred: CredentialInfo,
  targetIndustry?: string
): 'high' | 'medium' | 'low' {
  let score = 0;

  // Industry match
  if (targetIndustry && cred.industry === targetIndustry) {
    score += 40;
  } else if (veteran.targetIndustries.includes(cred.industry)) {
    score += 30;
  }

  // Demand level
  if (cred.demandLevel === 'very-high') score += 30;
  else if (cred.demandLevel === 'high') score += 20;
  else if (cred.demandLevel === 'moderate') score += 10;

  // Related skills
  const hasRelatedSkills = veteran.skills.some(s =>
    cred.requirements.some(req => req.toLowerCase().includes(s.name.toLowerCase()))
  );
  if (hasRelatedSkills) score += 20;

  // MOS relevance
  const mosRelevant = checkMOSRelevance(veteran, cred);
  if (mosRelevant) score += 10;

  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Check if credential is relevant to veteran's MOS
 */
function checkMOSRelevance(veteran: VeteranProfile, cred: CredentialInfo): boolean {
  const itMOS = ['25D', '25B', '17C', '35Q', 'CTN', '1B4X1'];
  const logisticsMOS = ['88N', '92A', '92Y', '3043', 'LS', 'SK'];
  const medicalMOS = ['68W', '68C', 'HM', '4N0X1'];

  for (const service of veteran.branchHistory) {
    const code = service.mosOrAfscOrRating;

    if (cred.industry === 'Information Technology' && itMOS.includes(code)) {
      return true;
    }
    if (cred.industry === 'Supply Chain' && logisticsMOS.includes(code)) {
      return true;
    }
    if (cred.industry === 'Healthcare' && medicalMOS.includes(code)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate reasons for credential recommendation
 */
function generateCredentialReasons(veteran: VeteranProfile, cred: CredentialInfo): string[] {
  const reasons: string[] = [];

  if (cred.demandLevel === 'very-high' || cred.demandLevel === 'high') {
    reasons.push(`High demand certification in ${cred.industry}`);
  }

  if (checkMOSRelevance(veteran, cred)) {
    reasons.push('Directly aligns with your military experience');
  }

  if (veteran.targetIndustries.includes(cred.industry)) {
    reasons.push('Matches your target industry');
  }

  const hasPrereqs = cred.requirements.every(req =>
    veteran.skills.some(s => s.name.toLowerCase().includes(req.toLowerCase()))
  );
  if (hasPrereqs) {
    reasons.push('You already have the prerequisite knowledge');
  }

  return reasons;
}

/**
 * Get credential providers
 */
async function getCredentialProviders(credentialId: string): Promise<CredentialProvider[]> {
  // In production, query database
  const providers: Record<string, CredentialProvider[]> = {
    'comptia-security-plus': [
      {
        name: 'CompTIA Official',
        cost: 381,
        duration: '3-4 months',
        format: 'online',
        giBillAccepted: true,
        veteranDiscount: 10,
        url: 'https://www.comptia.org/certifications/security'
      },
      {
        name: 'Udemy Course + Exam',
        cost: 500,
        duration: '2-3 months',
        format: 'online',
        giBillAccepted: false,
        veteranDiscount: 0
      }
    ],
    'pmp': [
      {
        name: 'PMI Official',
        cost: 555,
        duration: '6 months',
        format: 'hybrid',
        giBillAccepted: true,
        url: 'https://www.pmi.org/certifications/project-management-pmp'
      }
    ]
  };

  return providers[credentialId] || [];
}

/**
 * Create a credential roadmap
 */
export interface CredentialRoadmap {
  phase1: CredentialRecommendation[];
  phase2: CredentialRecommendation[];
  phase3: CredentialRecommendation[];
  totalCost: number;
  totalTime: string;
}

export async function createCredentialRoadmap(
  veteran: VeteranProfile,
  targetRole: string
): Promise<CredentialRoadmap> {
  const recommendations = await recommendCredentials(veteran);

  const phase1 = recommendations.filter(r => r.priority === 'high').slice(0, 2);
  const phase2 = recommendations.filter(r => r.priority === 'medium').slice(0, 2);
  const phase3 = recommendations.filter(r => r.priority === 'low').slice(0, 1);

  const totalCost = [...phase1, ...phase2, ...phase3].reduce((sum, r) => sum + r.cost, 0);

  return {
    phase1,
    phase2,
    phase3,
    totalCost,
    totalTime: '12-18 months'
  };
}

/**
 * Get all credentials (mock data)
 */
async function getAllCredentials(): Promise<CredentialInfo[]> {
  return [
    {
      id: 'comptia-security-plus',
      name: 'CompTIA Security+',
      type: 'certification',
      industry: 'Information Technology',
      description: 'Foundational cybersecurity certification',
      requirements: ['Basic networking knowledge', '2 years IT experience'],
      renewalPeriod: '3 years',
      demandLevel: 'very-high'
    },
    {
      id: 'comptia-network-plus',
      name: 'CompTIA Network+',
      type: 'certification',
      industry: 'Information Technology',
      description: 'Networking fundamentals certification',
      requirements: ['Basic IT knowledge'],
      renewalPeriod: '3 years',
      demandLevel: 'very-high'
    },
    {
      id: 'pmp',
      name: 'Project Management Professional (PMP)',
      type: 'certification',
      industry: 'Business',
      description: 'Premier project management certification',
      requirements: ['4-6 years project management experience', '35 hours training'],
      renewalPeriod: '3 years',
      demandLevel: 'very-high'
    },
    {
      id: 'cissp',
      name: 'Certified Information Systems Security Professional (CISSP)',
      type: 'certification',
      industry: 'Information Technology',
      description: 'Advanced cybersecurity certification',
      requirements: ['5 years security experience', 'Security+ or equivalent'],
      renewalPeriod: '3 years',
      demandLevel: 'very-high'
    },
    {
      id: 'apics-cpim',
      name: 'APICS CPIM',
      type: 'certification',
      industry: 'Supply Chain',
      description: 'Production and inventory management certification',
      requirements: ['Supply chain knowledge'],
      renewalPeriod: '5 years',
      demandLevel: 'high'
    }
  ];
}
