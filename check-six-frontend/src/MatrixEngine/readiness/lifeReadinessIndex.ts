/**
 * Readiness Index Calculator
 * Calculates overall life readiness score across multiple categories
 */

export interface ReadinessCategory {
  name: string;
  score: number; // 0-100
  weight: number; // importance weight
  factors: ReadinessFactor[];
  recommendations: string[];
}

export interface ReadinessFactor {
  name: string;
  status: 'Complete' | 'In Progress' | 'Not Started' | 'Needs Attention';
  impact: 'High' | 'Medium' | 'Low';
}

export interface ReadinessIndex {
  overallScore: number; // 0-100
  categories: ReadinessCategory[];
  topPriorities: string[];
  strengths: string[];
  quickWins: string[];
}

export function calculateReadinessIndex(profile: {
  hasDD214: boolean;
  disabilityRating?: number;
  claimsStatus?: 'None' | 'Pending' | 'Approved' | 'Denied';
  employmentStatus?: 'Employed' | 'Unemployed' | 'Student' | 'Retired';
  educationPlan?: boolean;
  housingSecure?: boolean;
  healthcareEnrolled?: boolean;
  hasEmergencyFund?: boolean;
  socialConnections?: boolean;
  mentalHealthSupport?: boolean;
}): ReadinessIndex {
  const categories: ReadinessCategory[] = [];

  // Benefits & Claims Category
  const benefitsFactors: ReadinessFactor[] = [
    {
      name: 'DD-214 on file',
      status: profile.hasDD214 ? 'Complete' : 'Needs Attention',
      impact: 'High',
    },
    {
      name: 'Disability rating established',
      status: profile.disabilityRating ? 'Complete' : 'Not Started',
      impact: 'High',
    },
    {
      name: 'Healthcare enrolled',
      status: profile.healthcareEnrolled ? 'Complete' : 'Needs Attention',
      impact: 'High',
    },
  ];

  const benefitsScore = calculateCategoryScore(benefitsFactors);
  categories.push({
    name: 'Benefits & Claims',
    score: benefitsScore,
    weight: 0.25,
    factors: benefitsFactors,
    recommendations: benefitsScore < 70 ? [
      'Upload DD-214 to Digital Wallet',
      'File disability claim if you have service-connected conditions',
      'Enroll in VA healthcare',
    ] : [],
  });

  // Employment & Education Category
  const employmentFactors: ReadinessFactor[] = [
    {
      name: 'Employment status',
      status: profile.employmentStatus === 'Employed' ? 'Complete' : 'Needs Attention',
      impact: 'High',
    },
    {
      name: 'Education/training plan',
      status: profile.educationPlan ? 'Complete' : 'Not Started',
      impact: 'Medium',
    },
  ];

  const employmentScore = calculateCategoryScore(employmentFactors);
  categories.push({
    name: 'Employment & Education',
    score: employmentScore,
    weight: 0.20,
    factors: employmentFactors,
    recommendations: employmentScore < 70 ? [
      'Visit Employment Hub to translate your MOS to civilian jobs',
      'Create resume using Resume Builder',
      'Explore GI Bill benefits in Education Hub',
    ] : [],
  });

  // Housing & Financial Category
  const housingFactors: ReadinessFactor[] = [
    {
      name: 'Secure housing',
      status: profile.housingSecure ? 'Complete' : 'Needs Attention',
      impact: 'High',
    },
    {
      name: 'Emergency fund',
      status: profile.hasEmergencyFund ? 'Complete' : 'Not Started',
      impact: 'Medium',
    },
  ];

  const housingScore = calculateCategoryScore(housingFactors);
  categories.push({
    name: 'Housing & Financial',
    score: housingScore,
    weight: 0.20,
    factors: housingFactors,
    recommendations: housingScore < 70 ? [
      'Explore VA Home Loan in Housing Hub',
      'Set up emergency fund (3-6 months expenses)',
      'Check eligibility for housing grants (SAH/SHA)',
    ] : [],
  });

  // Health & Wellness Category
  const healthFactors: ReadinessFactor[] = [
    {
      name: 'Mental health support',
      status: profile.mentalHealthSupport ? 'Complete' : 'Needs Attention',
      impact: 'High',
    },
  ];

  const healthScore = calculateCategoryScore(healthFactors);
  categories.push({
    name: 'Health & Wellness',
    score: healthScore,
    weight: 0.20,
    factors: healthFactors,
    recommendations: healthScore < 70 ? [
      'Visit Mental Health Navigator',
      'Call Veterans Crisis Line: 988 then press 1',
      'Schedule wellness check with VA provider',
    ] : [],
  });

  // Community & Support Category
  const communityFactors: ReadinessFactor[] = [
    {
      name: 'Social connections',
      status: profile.socialConnections ? 'Complete' : 'Needs Attention',
      impact: 'Medium',
    },
  ];

  const communityScore = calculateCategoryScore(communityFactors);
  categories.push({
    name: 'Community & Support',
    score: communityScore,
    weight: 0.15,
    factors: communityFactors,
    recommendations: communityScore < 70 ? [
      'Find local veteran organizations in Local Resources Hub',
      'Connect with VSO for claims support',
      'Join Team RWB or Team Rubicon for social connections',
    ] : [],
  });

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    categories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0)
  );

  // Identify top priorities (lowest scoring categories)
  const topPriorities = categories
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(cat => cat.name);

  // Identify strengths (highest scoring categories)
  const strengths = categories
    .filter(cat => cat.score >= 80)
    .map(cat => cat.name);

  // Quick wins (incomplete items with high impact)
  const quickWins: string[] = [];
  categories.forEach(cat => {
    cat.factors.forEach(factor => {
      if (factor.status !== 'Complete' && factor.impact === 'High') {
        quickWins.push(factor.name);
      }
    });
  });

  return {
    overallScore,
    categories,
    topPriorities,
    strengths,
    quickWins: quickWins.slice(0, 3),
  };
}

function calculateCategoryScore(factors: ReadinessFactor[]): number {
  const statusScores = {
    'Complete': 100,
    'In Progress': 50,
    'Not Started': 0,
    'Needs Attention': 25,
  };

  const totalScore = factors.reduce((sum, factor) => sum + statusScores[factor.status], 0);
  return Math.round(totalScore / factors.length);
}

export function getReadinessLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 90) {
    return {
      label: 'Thriving',
      color: '#22c55e',
      description: 'You\'re doing great! Keep up the momentum.',
    };
  } else if (score >= 70) {
    return {
      label: 'On Track',
      color: '#3b82f6',
      description: 'Good progress. Focus on a few key areas to improve.',
    };
  } else if (score >= 50) {
    return {
      label: 'Building',
      color: '#f59e0b',
      description: 'You\'re making progress. Tackle your top priorities this month.',
    };
  } else {
    return {
      label: 'Getting Started',
      color: '#ef4444',
      description: 'Let\'s build a foundation. Start with quick wins.',
    };
  }
}
