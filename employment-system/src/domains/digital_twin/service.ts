import { VeteranProfile } from '../../../data/models/index.js';

/**
 * Digital Twin Service
 * Creates a virtual representation of veteran's career trajectory and simulates outcomes
 */

export interface DigitalTwin {
  veteranId: string;
  currentState: CareerState;
  simulations: CareerSimulation[];
  predictions: CareerPrediction[];
  recommendations: TwinRecommendation[];
  lastUpdated: string;
}

export interface CareerState {
  currentRole: string;
  yearsExperience: number;
  skillInventory: SkillLevel[];
  marketValue: number; // estimated salary
  careerMomentum: 'rising' | 'stable' | 'declining';
  riskFactors: string[];
  opportunities: string[];
}

export interface SkillLevel {
  skill: string;
  proficiency: number; // 0-100
  marketDemand: number; // 0-100
  trendDirection: 'hot' | 'stable' | 'declining';
  yearsToMaster: number;
}

export interface CareerSimulation {
  id: string;
  scenario: string;
  timeline: '1-year' | '3-year' | '5-year';
  probability: number; // 0-100
  outcomes: SimulationOutcome[];
}

export interface SimulationOutcome {
  aspect: string;
  current: string | number;
  projected: string | number;
  change: string;
}

export interface CareerPrediction {
  category: 'salary' | 'role' | 'skills' | 'market-demand';
  prediction: string;
  confidence: number; // 0-100
  basedOn: string[];
}

export interface TwinRecommendation {
  type: 'skill' | 'certification' | 'networking' | 'job-change';
  action: string;
  impactScore: number; // 0-100
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
}

/**
 * Create or update digital twin
 */
export async function createDigitalTwin(
  veteran: VeteranProfile
): Promise<DigitalTwin> {
  const currentState = analyzeCurrentState(veteran);
  const simulations = runCareerSimulations(veteran, currentState);
  const predictions = generatePredictions(veteran, currentState);
  const recommendations = generateTwinRecommendations(simulations, predictions);

  return {
    veteranId: veteran.id,
    currentState,
    simulations,
    predictions,
    recommendations,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Analyze current career state
 */
function analyzeCurrentState(veteran: VeteranProfile): CareerState {
  const yearsExperience = veteran.branchHistory.reduce((total, bh) => {
    const start = new Date(bh.startDate);
    const end = bh.endDate ? new Date(bh.endDate) : new Date();
    return total + (end.getFullYear() - start.getFullYear());
  }, 0);

  const skillInventory: SkillLevel[] = veteran.skills.map(s => ({
    skill: s.name,
    proficiency: s.level === 'expert' ? 90 : s.level === 'advanced' ? 75 : s.level === 'intermediate' ? 60 : 40,
    marketDemand: calculateMarketDemand(s.name, s.category),
    trendDirection: determineSkillTrend(s.name, s.category),
    yearsToMaster: s.level === 'expert' ? 0 : s.level === 'advanced' ? 1 : s.level === 'intermediate' ? 2 : 3
  }));

  const marketValue = calculateMarketValue(veteran, yearsExperience);
  const careerMomentum = determineCareerMomentum(veteran);
  const riskFactors = identifyRiskFactors(veteran);
  const opportunities = identifyOpportunities(veteran);

  return {
    currentRole: veteran.currentEmploymentStatus || 'Transitioning Veteran',
    yearsExperience,
    skillInventory,
    marketValue,
    careerMomentum,
    riskFactors,
    opportunities
  };
}

function calculateMarketDemand(skillName: string, category: string): number {
  // Mock data - in production, fetch from labor market APIs
  const highDemandSkills = ['cybersecurity', 'cloud computing', 'data analysis', 'project management'];
  const skill = skillName.toLowerCase();

  for (const highDemand of highDemandSkills) {
    if (skill.includes(highDemand)) return 90;
  }

  if (category === 'Information Technology') return 80;
  if (category === 'Leadership') return 75;

  return 60;
}

function determineSkillTrend(skillName: string, category: string): 'hot' | 'stable' | 'declining' {
  const hotSkills = ['ai', 'machine learning', 'cybersecurity', 'cloud', 'devops'];
  const skill = skillName.toLowerCase();

  for (const hot of hotSkills) {
    if (skill.includes(hot)) return 'hot';
  }

  return 'stable';
}

function calculateMarketValue(veteran: VeteranProfile, yearsExperience: number): number {
  let baseValue = 55000; // Base for entry-level
  baseValue += yearsExperience * 5000; // $5K per year of experience

  // Clearance bonus
  if (veteran.clearanceLevel === 'Top Secret' || veteran.clearanceLevel === 'TS/SCI') {
    baseValue += 20000;
  } else if (veteran.clearanceLevel === 'Secret') {
    baseValue += 10000;
  }

  // IT skills bonus
  const hasITSkills = veteran.skills.some(s => s.category === 'Information Technology');
  if (hasITSkills) baseValue += 15000;

  // Certifications bonus
  const certCount = veteran.credentials.filter(c => c.type === 'certification' && c.status === 'completed').length;
  baseValue += certCount * 5000;

  return baseValue;
}

function determineCareerMomentum(veteran: VeteranProfile): 'rising' | 'stable' | 'declining' {
  // Check if recently acquired new skills/credentials
  const recentCredentials = veteran.credentials.filter(c => {
    if (!c.completionDate) return false;
    const completionDate = new Date(c.completionDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return completionDate > sixMonthsAgo;
  });

  if (recentCredentials.length >= 2) return 'rising';
  if (recentCredentials.length === 1) return 'stable';

  return 'stable';
}

function identifyRiskFactors(veteran: VeteranProfile): string[] {
  const risks: string[] = [];

  if (!veteran.credentials.some(c => c.type === 'certification')) {
    risks.push('Lack of industry certifications may limit opportunities');
  }

  if (veteran.skills.length < 5) {
    risks.push('Limited documented skill set - expand and validate skills');
  }

  if (veteran.clearanceLevel && veteran.clearanceStatus === 'expired') {
    risks.push('Expired security clearance reduces value to employers');
  }

  const itSkills = veteran.skills.filter(s => s.category === 'Information Technology');
  if (itSkills.length === 0 && veteran.targetIndustries.includes('Technology')) {
    risks.push('Limited IT skills for target technology industry');
  }

  return risks;
}

function identifyOpportunities(veteran: VeteranProfile): string[] {
  const opportunities: string[] = [];

  if (veteran.clearanceLevel && veteran.clearanceLevel !== 'None') {
    opportunities.push('Active clearance opens high-paying defense contractor roles');
  }

  if (veteran.branchHistory.some(bh => bh.deployments && bh.deployments.length > 0)) {
    opportunities.push('Deployment experience demonstrates adaptability and leadership');
  }

  const hasLeadershipSkills = veteran.skills.some(s => s.category === 'Leadership');
  if (hasLeadershipSkills) {
    opportunities.push('Leadership experience qualifies for management track positions');
  }

  if (veteran.disabilityRating && veteran.disabilityRating >= 30) {
    opportunities.push('VOW Act and veteran hiring preferences available');
  }

  return opportunities;
}

/**
 * Run career trajectory simulations
 */
function runCareerSimulations(
  veteran: VeteranProfile,
  currentState: CareerState
): CareerSimulation[] {
  const simulations: CareerSimulation[] = [];

  // Scenario 1: Stay current path
  simulations.push({
    id: 'sim-1',
    scenario: 'Continue current trajectory without major changes',
    timeline: '3-year',
    probability: 60,
    outcomes: [
      {
        aspect: 'Salary',
        current: currentState.marketValue,
        projected: currentState.marketValue * 1.15,
        change: '+15%'
      },
      {
        aspect: 'Role',
        current: currentState.currentRole,
        projected: currentState.currentRole,
        change: 'No change'
      },
      {
        aspect: 'Skills',
        current: currentState.skillInventory.length,
        projected: currentState.skillInventory.length + 2,
        change: '+2 skills'
      }
    ]
  });

  // Scenario 2: Aggressive upskilling
  simulations.push({
    id: 'sim-2',
    scenario: 'Obtain 2+ certifications and actively network',
    timeline: '3-year',
    probability: 75,
    outcomes: [
      {
        aspect: 'Salary',
        current: currentState.marketValue,
        projected: currentState.marketValue * 1.40,
        change: '+40%'
      },
      {
        aspect: 'Role',
        current: currentState.currentRole,
        projected: `Senior ${veteran.targetRoles[0] || 'Specialist'}`,
        change: 'Promotion to senior level'
      },
      {
        aspect: 'Skills',
        current: currentState.skillInventory.length,
        projected: currentState.skillInventory.length + 5,
        change: '+5 high-demand skills'
      }
    ]
  });

  // Scenario 3: Industry pivot
  simulations.push({
    id: 'sim-3',
    scenario: 'Pivot to high-growth industry (e.g., cybersecurity)',
    timeline: '5-year',
    probability: 50,
    outcomes: [
      {
        aspect: 'Salary',
        current: currentState.marketValue,
        projected: currentState.marketValue * 1.65,
        change: '+65%'
      },
      {
        aspect: 'Role',
        current: currentState.currentRole,
        projected: 'Cybersecurity Analyst → Senior Security Engineer',
        change: 'Complete career pivot'
      },
      {
        aspect: 'Skills',
        current: currentState.skillInventory.length,
        projected: currentState.skillInventory.length + 8,
        change: '+8 specialized skills'
      }
    ]
  });

  return simulations;
}

/**
 * Generate AI-driven predictions
 */
function generatePredictions(
  veteran: VeteranProfile,
  currentState: CareerState
): CareerPrediction[] {
  return [
    {
      category: 'salary',
      prediction: `Your market value will reach $${Math.round(currentState.marketValue * 1.3)} within 3 years with strategic skill development`,
      confidence: 78,
      basedOn: ['Years of experience', 'Current skill trajectory', 'Market trends']
    },
    {
      category: 'skills',
      prediction: 'Cybersecurity and cloud computing skills will yield highest ROI for your background',
      confidence: 85,
      basedOn: ['MOS background', 'Security clearance', 'Market demand data']
    },
    {
      category: 'role',
      prediction: `Senior ${veteran.targetRoles[0] || 'Specialist'} role achievable within 2-3 years`,
      confidence: 72,
      basedOn: ['Military leadership experience', 'Technical skills', 'Industry averages']
    },
    {
      category: 'market-demand',
      prediction: 'Defense contractor roles will remain strong demand for next 5+ years',
      confidence: 90,
      basedOn: ['Government spending trends', 'Veteran hiring initiatives', 'Clearance requirements']
    }
  ];
}

/**
 * Generate recommendations based on simulations
 */
function generateTwinRecommendations(
  simulations: CareerSimulation[],
  predictions: CareerPrediction[]
): TwinRecommendation[] {
  return [
    {
      type: 'certification',
      action: 'Obtain Security+ certification within 3 months',
      impactScore: 95,
      effort: 'medium',
      timeframe: '3 months'
    },
    {
      type: 'skill',
      action: 'Develop cloud computing skills (AWS/Azure)',
      impactScore: 88,
      effort: 'medium',
      timeframe: '6 months'
    },
    {
      type: 'networking',
      action: 'Connect with 50+ professionals in target industry on LinkedIn',
      impactScore: 75,
      effort: 'low',
      timeframe: '1 month'
    },
    {
      type: 'job-change',
      action: 'Target defense contractor roles leveraging security clearance',
      impactScore: 92,
      effort: 'high',
      timeframe: '6-12 months'
    }
  ];
}

/**
 * Update digital twin with new data
 */
export async function updateDigitalTwin(
  twinId: string,
  veteran: VeteranProfile
): Promise<DigitalTwin> {
  // Recreate twin with updated veteran data
  return createDigitalTwin(veteran);
}
