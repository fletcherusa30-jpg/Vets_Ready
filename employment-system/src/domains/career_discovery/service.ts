import { VeteranProfile, CareerPath, BranchServiceRecord } from '../../../data/models/index.js';

/**
 * Career Discovery & Pathfinding Service
 * Helps veterans discover career paths based on their military experience and interests
 */

export interface CareerRecommendation {
  career: CareerPath;
  matchScore: number;
  reasons: string[];
  nextSteps: string[];
}

/**
 * Discover career paths for a veteran
 */
export async function discoverCareerPaths(
  veteran: VeteranProfile,
  limit: number = 5
): Promise<CareerRecommendation[]> {
  // Get all available career paths (in production, this would query a database)
  const allPaths = await getAllCareerPaths();

  const recommendations: CareerRecommendation[] = [];

  for (const path of allPaths) {
    const matchScore = calculateCareerMatch(veteran, path);

    if (matchScore > 40) {
      const reasons = generateMatchReasons(veteran, path, matchScore);
      const nextSteps = generateNextSteps(veteran, path);

      recommendations.push({
        career: path,
        matchScore,
        reasons,
        nextSteps,
      });
    }
  }

  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  return recommendations.slice(0, limit);
}

/**
 * Calculate how well a veteran matches a career path
 */
function calculateCareerMatch(veteran: VeteranProfile, path: CareerPath): number {
  let score = 0;
  let factors = 0;

  // MOS/AFSC alignment (30% weight)
  if (path.relevantMOS && path.relevantMOS.length > 0) {
    for (const serviceRecord of veteran.branchHistory) {
      if (path.relevantMOS.includes(serviceRecord.mosOrAfscOrRating)) {
        score += 30;
        factors++;
        break;
      }
    }
  }

  // Skill match (40% weight)
  const veteranSkillNames = veteran.skills.map(s => s.name.toLowerCase());
  const pathSkillNames = path.requiredSkills.map(s => s.toLowerCase());

  const matchingSkills = veteranSkillNames.filter(vs =>
    pathSkillNames.some(ps => vs.includes(ps) || ps.includes(vs))
  );

  const skillMatchPercent = pathSkillNames.length > 0
    ? (matchingSkills.length / pathSkillNames.length) * 100
    : 50;

  score += (skillMatchPercent / 100) * 40;
  factors++;

  // Interest alignment (20% weight)
  if (veteran.targetIndustries.includes(path.industry)) {
    score += 20;
  }
  factors++;

  // Salary alignment (10% weight)
  if (veteran.desiredSalaryRange) {
    const salaryOverlap = calculateSalaryOverlap(veteran.desiredSalaryRange, path.salaryRange);
    score += (salaryOverlap / 100) * 10;
  }
  factors++;

  return Math.round(score);
}

function calculateSalaryOverlap(desired: any, offered: any): number {
  const overlapStart = Math.max(desired.min, offered.min);
  const overlapEnd = Math.min(desired.max, offered.max);

  if (overlapEnd < overlapStart) return 0;

  const overlapSize = overlapEnd - overlapStart;
  const desiredSize = desired.max - desired.min;

  return (overlapSize / desiredSize) * 100;
}

/**
 * Generate reasons why this career matches
 */
function generateMatchReasons(veteran: VeteranProfile, path: CareerPath, score: number): string[] {
  const reasons: string[] = [];

  // MOS alignment
  const relevantMOS = veteran.branchHistory.find(br =>
    path.relevantMOS?.includes(br.mosOrAfscOrRating)
  );
  if (relevantMOS) {
    reasons.push(`Your ${relevantMOS.branch} experience as ${relevantMOS.title} directly transfers to this field`);
  }

  // Skill alignment
  const veteranSkillNames = veteran.skills.map(s => s.name);
  const matchingSkills = veteranSkillNames.filter(vs =>
    path.requiredSkills.some(ps => vs.toLowerCase().includes(ps.toLowerCase()) || ps.toLowerCase().includes(vs.toLowerCase()))
  );

  if (matchingSkills.length > 0) {
    reasons.push(`You already have ${matchingSkills.length} of the key skills needed`);
  }

  // Growth outlook
  if (path.growthOutlook === 'high-growth') {
    reasons.push('This field is experiencing high growth with strong job demand');
  }

  // Veteran fit
  if (path.veteranFit && path.veteranFit >= 80) {
    reasons.push('This career is highly rated by other veterans with similar backgrounds');
  }

  // Salary
  if (veteran.desiredSalaryRange && path.salaryRange.min >= veteran.desiredSalaryRange.min) {
    reasons.push('Salary range meets or exceeds your target');
  }

  return reasons;
}

/**
 * Generate next steps for pursuing this career
 */
function generateNextSteps(veteran: VeteranProfile, path: CareerPath): string[] {
  const steps: string[] = [];

  // Identify missing skills
  const veteranSkillNames = veteran.skills.map(s => s.name.toLowerCase());
  const missingSkills = path.requiredSkills.filter(rs =>
    !veteranSkillNames.some(vs => vs.includes(rs.toLowerCase()) || rs.toLowerCase().includes(vs))
  );

  if (missingSkills.length > 0) {
    steps.push(`Develop skills in: ${missingSkills.slice(0, 3).join(', ')}`);
  }

  // Identify missing credentials
  const veteranCredNames = veteran.credentials.map(c => c.name.toLowerCase());
  const missingCreds = path.requiredCredentials?.filter(rc =>
    !veteranCredNames.some(vc => vc.includes(rc.toLowerCase()) || rc.toLowerCase().includes(vc))
  ) || [];

  if (missingCreds.length > 0) {
    steps.push(`Obtain certifications: ${missingCreds.slice(0, 2).join(', ')}`);
  }

  // Entry-level roles
  if (path.entryLevelRoles.length > 0) {
    steps.push(`Apply for entry-level roles like: ${path.entryLevelRoles.slice(0, 2).join(' or ')}`);
  }

  // Networking
  steps.push('Connect with veterans already working in this field');

  // Resume
  steps.push('Tailor your resume to highlight relevant military experience');

  return steps;
}

/**
 * Get all available career paths
 * TODO: Replace with database query in production
 */
async function getAllCareerPaths(): Promise<CareerPath[]> {
  return [
    {
      id: 'it-cybersecurity',
      title: 'Cybersecurity Analyst',
      industry: 'Information Technology',
      description: 'Protect organizations from cyber threats',
      requiredSkills: ['network security', 'incident response', 'risk assessment'],
      preferredSkills: ['penetration testing', 'malware analysis'],
      requiredCredentials: ['Security+', 'CEH'],
      educationLevel: "Bachelor's degree preferred",
      entryLevelRoles: ['Security Operations Center Analyst', 'Junior Security Analyst'],
      midLevelRoles: ['Cybersecurity Engineer', 'Security Architect'],
      seniorLevelRoles: ['CISO', 'Director of Security'],
      salaryRange: { min: 75000, max: 150000, currency: 'USD', period: 'yearly' },
      growthOutlook: 'high-growth',
      demandLevel: 'very-high',
      physicalDemands: 'low',
      stressLevel: 'moderate',
      travelRequirement: 'occasional',
      relevantMOS: ['25B', '25D', '35N', '35Q', '35S', '17C', 'CTN'],
      veteranFit: 95,
    },
    {
      id: 'logistics-manager',
      title: 'Logistics Manager',
      industry: 'Supply Chain',
      description: 'Oversee supply chain operations and distribution',
      requiredSkills: ['supply chain management', 'inventory control', 'logistics coordination'],
      preferredSkills: ['SAP', 'Lean Six Sigma'],
      requiredCredentials: ['APICS CPIM'],
      educationLevel: "Bachelor's degree",
      entryLevelRoles: ['Logistics Coordinator', 'Supply Chain Analyst'],
      midLevelRoles: ['Logistics Manager', 'Supply Chain Manager'],
      seniorLevelRoles: ['Director of Operations', 'VP of Supply Chain'],
      salaryRange: { min: 65000, max: 120000, currency: 'USD', period: 'yearly' },
      growthOutlook: 'growing',
      demandLevel: 'high',
      physicalDemands: 'moderate',
      stressLevel: 'moderate',
      travelRequirement: 'occasional',
      relevantMOS: ['88N', '92A', '92Y', '3043', 'LS', 'SK'],
      veteranFit: 90,
    },
    {
      id: 'project-manager',
      title: 'Project Manager',
      industry: 'Business',
      description: 'Lead projects from inception to completion',
      requiredSkills: ['project management', 'leadership', 'risk management'],
      preferredSkills: ['agile methodology', 'stakeholder management'],
      requiredCredentials: ['PMP'],
      educationLevel: "Bachelor's degree",
      entryLevelRoles: ['Project Coordinator', 'Associate Project Manager'],
      midLevelRoles: ['Project Manager', 'Senior Project Manager'],
      seniorLevelRoles: ['Program Manager', 'Director of PMO'],
      salaryRange: { min: 70000, max: 130000, currency: 'USD', period: 'yearly' },
      growthOutlook: 'stable',
      demandLevel: 'high',
      physicalDemands: 'low',
      stressLevel: 'high',
      travelRequirement: 'occasional',
      relevantMOS: ['All leadership positions'],
      veteranFit: 85,
    },
  ];
}
