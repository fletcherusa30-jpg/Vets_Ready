import { VeteranProfile, JobPosting, Skill } from '../../../data/models/index.js';

/**
 * Predictive Career Forecasting Service
 * Uses historical data and trends to predict career trajectories and opportunities
 */

export interface CareerForecast {
  veteranId: string;
  timeframe: '1-year' | '3-year' | '5-year' | '10-year';
  projections: CareerProjection[];
  marketTrends: MarketTrend[];
  recommendations: ForecastRecommendation[];
}

export interface CareerProjection {
  role: string;
  industry: string;
  probabilityOfAchieving: number; // 0-100
  estimatedSalary: { min: number; max: number };
  requiredSteps: string[];
  estimatedTimeToRole: string;
}

export interface MarketTrend {
  skill: string;
  trendDirection: 'rising' | 'stable' | 'declining';
  demandGrowth: number; // Percentage
  salaryGrowth: number; // Percentage
  hotMarkets: string[]; // Geographic locations
}

export interface ForecastRecommendation {
  type: 'skill-development' | 'certification' | 'networking' | 'industry-pivot';
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  timeframe: string;
}

/**
 * Generate career forecast for a veteran
 */
export async function generateCareerForecast(
  veteran: VeteranProfile,
  timeframe: '1-year' | '3-year' | '5-year' | '10-year' = '5-year'
): Promise<CareerForecast> {
  const projections = await generateProjections(veteran, timeframe);
  const marketTrends = await analyzeMarketTrends(veteran.skills);
  const recommendations = generateForecastRecommendations(veteran, projections, marketTrends);

  return {
    veteranId: veteran.id,
    timeframe,
    projections,
    marketTrends,
    recommendations
  };
}

/**
 * Generate career projections
 */
async function generateProjections(
  veteran: VeteranProfile,
  timeframe: string
): Promise<CareerProjection[]> {
  const projections: CareerProjection[] = [];

  // Current level (1 year)
  if (timeframe === '1-year') {
    projections.push({
      role: `${veteran.targetRoles[0] || 'Entry-level position'}`,
      industry: veteran.targetIndustries[0] || 'Technology',
      probabilityOfAchieving: 85,
      estimatedSalary: { min: 60000, max: 85000 },
      requiredSteps: [
        'Optimize resume with ATS keywords',
        'Apply to 20+ positions',
        'Network with 10+ industry professionals'
      ],
      estimatedTimeToRole: '3-6 months'
    });
  }

  // Mid-career (3-5 years)
  if (timeframe === '3-year' || timeframe === '5-year') {
    const experience = veteran.branchHistory.reduce((total, bh) => {
      const start = new Date(bh.startDate);
      const end = bh.endDate ? new Date(bh.endDate) : new Date();
      return total + (end.getFullYear() - start.getFullYear());
    }, 0);

    projections.push({
      role: `Senior ${veteran.targetRoles[0] || 'Specialist'}`,
      industry: veteran.targetIndustries[0] || 'Technology',
      probabilityOfAchieving: 70,
      estimatedSalary: { min: 90000, max: 130000 },
      requiredSteps: [
        'Gain 3+ years civilian experience',
        'Obtain advanced certification (e.g., PMP, CISSP)',
        'Lead 2+ major projects',
        'Build professional brand (LinkedIn, conferences)'
      ],
      estimatedTimeToRole: '3-5 years'
    });
  }

  // Leadership (10 years)
  if (timeframe === '10-year') {
    projections.push({
      role: `Director / VP of ${veteran.targetIndustries[0] || 'Operations'}`,
      industry: veteran.targetIndustries[0] || 'Technology',
      probabilityOfAchieving: 45,
      estimatedSalary: { min: 150000, max: 250000 },
      requiredSteps: [
        'Earn MBA or equivalent advanced degree',
        'Manage teams of 20+ people',
        'P&L responsibility',
        'Executive presence and strategic thinking',
        'Board memberships or advisory roles'
      ],
      estimatedTimeToRole: '8-12 years'
    });
  }

  return projections;
}

/**
 * Analyze market trends for veteran's skills
 */
async function analyzeMarketTrends(skills: Skill[]): Promise<MarketTrend[]> {
  const trends: MarketTrend[] = [];

  // Analyze each skill category
  const skillsByCategory = new Map<string, Skill[]>();
  for (const skill of skills) {
    if (!skillsByCategory.has(skill.category)) {
      skillsByCategory.set(skill.category, []);
    }
    skillsByCategory.get(skill.category)!.push(skill);
  }

  // Mock trend data (in production, fetch from labor market APIs)
  const trendData: Record<string, MarketTrend> = {
    'Information Technology': {
      skill: 'Cybersecurity',
      trendDirection: 'rising',
      demandGrowth: 35,
      salaryGrowth: 12,
      hotMarkets: ['Washington DC', 'San Diego CA', 'Austin TX', 'Northern VA']
    },
    'Leadership': {
      skill: 'Project Management',
      trendDirection: 'stable',
      demandGrowth: 8,
      salaryGrowth: 5,
      hotMarkets: ['Major metros nationwide']
    },
    'Logistics': {
      skill: 'Supply Chain Management',
      trendDirection: 'rising',
      demandGrowth: 22,
      salaryGrowth: 10,
      hotMarkets: ['Memphis TN', 'Atlanta GA', 'Los Angeles CA']
    },
    'Healthcare': {
      skill: 'Emergency Medicine',
      trendDirection: 'stable',
      demandGrowth: 15,
      salaryGrowth: 7,
      hotMarkets: ['Nationwide - rural areas especially']
    }
  };

  for (const [category, _skills] of skillsByCategory.entries()) {
    const trend = trendData[category];
    if (trend) {
      trends.push(trend);
    }
  }

  return trends;
}

/**
 * Generate recommendations based on forecast
 */
function generateForecastRecommendations(
  veteran: VeteranProfile,
  projections: CareerProjection[],
  trends: MarketTrend[]
): ForecastRecommendation[] {
  const recommendations: ForecastRecommendation[] = [];

  // Skill development recommendations based on rising trends
  for (const trend of trends) {
    if (trend.trendDirection === 'rising' && trend.demandGrowth > 20) {
      recommendations.push({
        type: 'skill-development',
        priority: 'critical',
        action: `Develop expertise in ${trend.skill} - ${trend.demandGrowth}% demand growth projected`,
        impact: `Increase earning potential by ${trend.salaryGrowth}% and job opportunities by ${trend.demandGrowth}%`,
        timeframe: '6-12 months'
      });
    }
  }

  // Geographic recommendations
  const topMarkets = trends.flatMap(t => t.hotMarkets).slice(0, 3);
  if (topMarkets.length > 0 && !veteran.locationPreferences.some(loc => topMarkets.includes(loc))) {
    recommendations.push({
      type: 'networking',
      priority: 'medium',
      action: `Consider relocation to hot markets: ${topMarkets.join(', ')}`,
      impact: 'Access to 30-50% more job opportunities and higher salaries',
      timeframe: 'Strategic consideration for next role'
    });
  }

  // Certification recommendations
  const highValueCerts = [
    { name: 'PMP', value: '$15-20K salary increase' },
    { name: 'CISSP', value: '$20-25K salary increase' },
    { name: 'AWS Certified', value: '$15K salary increase' }
  ];

  const veteranCertNames = veteran.credentials.map(c => c.name.toLowerCase());
  for (const cert of highValueCerts) {
    if (!veteranCertNames.includes(cert.name.toLowerCase())) {
      recommendations.push({
        type: 'certification',
        priority: 'high',
        action: `Obtain ${cert.name} certification`,
        impact: cert.value,
        timeframe: '3-6 months'
      });
      break; // Only recommend one cert at a time
    }
  }

  // Network building
  recommendations.push({
    type: 'networking',
    priority: 'high',
    action: 'Build LinkedIn network to 500+ connections in target industry',
    impact: '70% of jobs are filled through networking',
    timeframe: 'Ongoing - add 10 connections/week'
  });

  return recommendations;
}

/**
 * Predict optimal career path
 */
export interface CareerPathPrediction {
  path: string[];
  estimatedTimeline: string[];
  estimatedSalaryProgression: number[];
  keyMilestones: string[];
  riskFactors: string[];
}

export async function predictOptimalCareerPath(
  veteran: VeteranProfile
): Promise<CareerPathPrediction> {
  const branch = veteran.branchHistory[0]?.branch || 'Military';
  const mos = veteran.branchHistory[0]?.title || 'Service Member';

  // Generate path based on profile
  const path: string[] = [];
  const timeline: string[] = [];
  const salary: number[] = [];
  const milestones: string[] = [];

  // Entry level
  path.push(`Junior ${veteran.targetRoles[0] || 'Specialist'}`);
  timeline.push('Year 0-2');
  salary.push(65000);
  milestones.push('Translate military experience to civilian resume');
  milestones.push('Land first civilian role');

  // Mid-level
  path.push(`${veteran.targetRoles[0] || 'Specialist'}`);
  timeline.push('Year 2-5');
  salary.push(90000);
  milestones.push('Obtain professional certification');
  milestones.push('Lead significant projects');

  // Senior level
  path.push(`Senior ${veteran.targetRoles[0] || 'Specialist'}`);
  timeline.push('Year 5-8');
  salary.push(120000);
  milestones.push('Mentor junior team members');
  milestones.push('Develop specialized expertise');

  // Leadership
  path.push(`Manager / Director`);
  timeline.push('Year 8-12');
  salary.push(160000);
  milestones.push('Transition to people management');
  milestones.push('Strategic leadership role');

  const riskFactors = [
    'Civilian corporate culture adjustment (12-18 months typically)',
    'Avoiding military jargon in professional communication',
    'Building professional network from scratch',
    'Competing with candidates who have civilian experience'
  ];

  return {
    path,
    estimatedTimeline: timeline,
    estimatedSalaryProgression: salary,
    keyMilestones: milestones,
    riskFactors
  };
}
