/**
 * VETERAN PROFILE COMPLETENESS METER
 *
 * Calculates how complete the veteran's profile is across all categories.
 * Provides actionable insights on what's missing.
 *
 * INTEGRATIONS:
 * - Digital Twin (data source)
 * - GIE (uses completeness for integrity scoring)
 * - Readiness Index (documentation dimension)
 * - Mission Packs (suggests packs to fill gaps)
 * - Dashboard (prominent display)
 */

import { DigitalTwin } from '../types/digitalTwin';

/**
 * Completeness categories
 */
export interface CompletenessCategory {
  category: string;
  label: string;
  percentage: number;
  maxPoints: number;
  earnedPoints: number;
  missingItems: string[];
  icon: string;
}

/**
 * Overall completeness result
 */
export interface ProfileCompleteness {
  overallPercentage: number;
  categories: CompletenessCategory[];
  totalPossiblePoints: number;
  totalEarnedPoints: number;
  criticalGaps: string[];
  nextSteps: string[];
  lastUpdated: Date;
}

/**
 * Calculate Service Information completeness
 */
function calculateServiceCompleteness(digitalTwin: DigitalTwin): CompletenessCategory {
  const checks = [
    { name: 'Branch selected', points: 5, met: !!digitalTwin.branch },
    { name: 'Rank entered', points: 5, met: !!digitalTwin.rank },
    { name: 'MOS/AFSC/Rating entered', points: 5, met: !!digitalTwin.mos },
    { name: 'Service dates entered', points: 10, met: !!digitalTwin.serviceStartDate && !!digitalTwin.serviceEndDate },
    { name: 'DD-214 uploaded', points: 15, met: !!digitalTwin.dd214Uploaded },
    { name: 'Units listed', points: 5, met: (digitalTwin.units?.length || 0) > 0 },
    { name: 'Deployments listed', points: 5, met: (digitalTwin.deployments?.length || 0) > 0 },
  ];

  const maxPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const earnedPoints = checks.filter(c => c.met).reduce((sum, check) => sum + check.points, 0);
  const missingItems = checks.filter(c => !c.met).map(c => c.name);

  return {
    category: 'service',
    label: 'Service Information',
    percentage: Math.round((earnedPoints / maxPoints) * 100),
    maxPoints,
    earnedPoints,
    missingItems,
    icon: '🎖️',
  };
}

/**
 * Calculate Disabilities & Ratings completeness
 */
function calculateDisabilitiesCompleteness(digitalTwin: DigitalTwin): CompletenessCategory {
  const hasDisabilities = (digitalTwin.disabilities?.length || 0) > 0;
  const hasDiagnosticCodes = digitalTwin.disabilities?.some(d => d.diagnosticCode);
  const hasRatingLetter = !!digitalTwin.ratingLetterUploaded;
  const hasCombinedRating = digitalTwin.combinedRating !== undefined && digitalTwin.combinedRating > 0;

  const checks = [
    { name: 'At least one condition entered', points: 10, met: hasDisabilities },
    { name: 'Conditions have diagnostic codes', points: 10, met: hasDiagnosticCodes },
    { name: 'Combined rating calculated', points: 10, met: hasCombinedRating },
    { name: 'Rating decision letter uploaded', points: 15, met: hasRatingLetter },
    { name: 'Effective dates entered', points: 5, met: digitalTwin.disabilities?.some(d => d.effectiveDate) },
  ];

  const maxPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const earnedPoints = checks.filter(c => c.met).reduce((sum, check) => sum + check.points, 0);
  const missingItems = checks.filter(c => !c.met).map(c => c.name);

  return {
    category: 'disabilities',
    label: 'Disabilities & Ratings',
    percentage: Math.round((earnedPoints / maxPoints) * 100),
    maxPoints,
    earnedPoints,
    missingItems,
    icon: '🏥',
  };
}

/**
 * Calculate Family Information completeness
 */
function calculateFamilyCompleteness(digitalTwin: DigitalTwin): CompletenessCategory {
  const checks = [
    { name: 'Marital status selected', points: 5, met: !!digitalTwin.maritalStatus },
    { name: 'Number of children entered', points: 5, met: digitalTwin.children !== undefined },
    { name: 'Dependents count entered', points: 5, met: digitalTwin.dependents !== undefined },
    { name: 'Spouse information (if married)', points: 5, met: digitalTwin.maritalStatus !== 'married' || !!digitalTwin.spouseName },
  ];

  const maxPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const earnedPoints = checks.filter(c => c.met).reduce((sum, check) => sum + check.points, 0);
  const missingItems = checks.filter(c => !c.met).map(c => c.name);

  return {
    category: 'family',
    label: 'Family Information',
    percentage: Math.round((earnedPoints / maxPoints) * 100),
    maxPoints,
    earnedPoints,
    missingItems,
    icon: '👨‍👩‍👧‍👦',
  };
}

/**
 * Calculate Documents completeness
 */
function calculateDocumentsCompleteness(digitalTwin: DigitalTwin): CompletenessCategory {
  const checks = [
    { name: 'DD-214 uploaded', points: 15, met: !!digitalTwin.dd214Uploaded },
    { name: 'Rating decision letter uploaded', points: 15, met: !!digitalTwin.ratingLetterUploaded },
    { name: 'Medical records uploaded', points: 10, met: (digitalTwin.medicalRecordsCount || 0) > 0 },
    { name: 'Supporting statements uploaded', points: 5, met: (digitalTwin.statementsCount || 0) > 0 },
  ];

  const maxPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const earnedPoints = checks.filter(c => c.met).reduce((sum, check) => sum + check.points, 0);
  const missingItems = checks.filter(c => !c.met).map(c => c.name);

  return {
    category: 'documents',
    label: 'Documents',
    percentage: Math.round((earnedPoints / maxPoints) * 100),
    maxPoints,
    earnedPoints,
    missingItems,
    icon: '📄',
  };
}

/**
 * Calculate Goals & Situation completeness
 */
function calculateGoalsCompleteness(digitalTwin: DigitalTwin): CompletenessCategory {
  const checks = [
    { name: 'Current address entered', points: 10, met: !!digitalTwin.state && !!digitalTwin.zip },
    { name: 'Life situation selected', points: 10, met: digitalTwin.lifeSituation?.currentMode !== 'not-set' },
    { name: 'Goals identified', points: 5, met: (digitalTwin.lifeSituation?.goals?.length || 0) > 0 },
    { name: 'Employment status entered', points: 5, met: !!digitalTwin.employment?.status },
    { name: 'Education status entered', points: 5, met: !!digitalTwin.education?.status },
  ];

  const maxPoints = checks.reduce((sum, check) => sum + check.points, 0);
  const earnedPoints = checks.filter(c => c.met).reduce((sum, check) => sum + check.points, 0);
  const missingItems = checks.filter(c => !c.met).map(c => c.name);

  return {
    category: 'goals',
    label: 'Goals & Situation',
    percentage: Math.round((earnedPoints / maxPoints) * 100),
    maxPoints,
    earnedPoints,
    missingItems,
    icon: '🎯',
  };
}

/**
 * Calculate overall profile completeness
 */
export function calculateProfileCompleteness(digitalTwin: DigitalTwin): ProfileCompleteness {
  const categories = [
    calculateServiceCompleteness(digitalTwin),
    calculateDisabilitiesCompleteness(digitalTwin),
    calculateFamilyCompleteness(digitalTwin),
    calculateDocumentsCompleteness(digitalTwin),
    calculateGoalsCompleteness(digitalTwin),
  ];

  const totalPossiblePoints = categories.reduce((sum, cat) => sum + cat.maxPoints, 0);
  const totalEarnedPoints = categories.reduce((sum, cat) => sum + cat.earnedPoints, 0);
  const overallPercentage = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);

  // Identify critical gaps (high-value missing items)
  const criticalGaps: string[] = [];
  categories.forEach(cat => {
    if (cat.missingItems.includes('DD-214 uploaded')) {
      criticalGaps.push('Upload your DD-214 to unlock service history');
    }
    if (cat.missingItems.includes('Rating decision letter uploaded')) {
      criticalGaps.push('Upload rating letter to verify disability ratings');
    }
    if (cat.missingItems.includes('At least one condition entered')) {
      criticalGaps.push('Add your service-connected conditions');
    }
    if (cat.missingItems.includes('Current address entered')) {
      criticalGaps.push('Enter your current address for local resources');
    }
  });

  // Generate next steps
  const nextSteps: string[] = [];

  // Prioritize by category percentage
  const sortedCategories = [...categories].sort((a, b) => a.percentage - b.percentage);

  sortedCategories.slice(0, 3).forEach(cat => {
    if (cat.missingItems.length > 0) {
      nextSteps.push(`${cat.label}: ${cat.missingItems[0]}`);
    }
  });

  return {
    overallPercentage,
    categories,
    totalPossiblePoints,
    totalEarnedPoints,
    criticalGaps,
    nextSteps,
    lastUpdated: new Date(),
  };
}

/**
 * Get completeness level label
 */
export function getCompletenessLevel(percentage: number): {
  level: string;
  color: string;
  message: string;
} {
  if (percentage >= 90) {
    return {
      level: 'Excellent',
      color: 'green',
      message: 'Your profile is comprehensive and ready for maximum benefit discovery.',
    };
  } else if (percentage >= 70) {
    return {
      level: 'Good',
      color: 'blue',
      message: 'Your profile is solid. Complete a few more items for full optimization.',
    };
  } else if (percentage >= 50) {
    return {
      level: 'Fair',
      color: 'yellow',
      message: 'You\'re making progress. Add more information to unlock personalized insights.',
    };
  } else if (percentage >= 30) {
    return {
      level: 'Getting Started',
      color: 'orange',
      message: 'Keep going! More complete profiles receive better recommendations.',
    };
  } else {
    return {
      level: 'Just Started',
      color: 'red',
      message: 'Welcome! Let\'s build your profile to discover your benefits and opportunities.',
    };
  }
}

/**
 * Get suggested Mission Packs based on gaps
 */
export function getSuggestedPacksForGaps(completeness: ProfileCompleteness): string[] {
  const packs: string[] = [];

  if (completeness.criticalGaps.some(g => g.includes('DD-214'))) {
    packs.push('Get Your DD-214');
  }

  if (completeness.criticalGaps.some(g => g.includes('rating letter'))) {
    packs.push('Request Rating Decision Letter');
  }

  if (completeness.criticalGaps.some(g => g.includes('conditions'))) {
    packs.push('File for Disability Compensation');
  }

  const serviceCategory = completeness.categories.find(c => c.category === 'service');
  if (serviceCategory && serviceCategory.percentage < 50) {
    packs.push('Complete Your Service Profile');
  }

  const documentsCategory = completeness.categories.find(c => c.category === 'documents');
  if (documentsCategory && documentsCategory.percentage < 50) {
    packs.push('Organize Your Documents');
  }

  return packs;
}

/**
 * Check if profile is complete enough for specific features
 */
export function canAccessFeature(
  completeness: ProfileCompleteness,
  feature: 'matrixEngine' | 'opportunityRadar' | 'missionPacks' | 'localResources'
): { allowed: boolean; reason?: string } {
  switch (feature) {
    case 'matrixEngine':
      // Need at least service info and some disability data
      const serviceCategory = completeness.categories.find(c => c.category === 'service');
      const disabilitiesCategory = completeness.categories.find(c => c.category === 'disabilities');

      if (!serviceCategory || serviceCategory.percentage < 30) {
        return { allowed: false, reason: 'Please complete basic service information first.' };
      }

      if (!disabilitiesCategory || disabilitiesCategory.percentage < 20) {
        return { allowed: false, reason: 'Please add at least one disability to use Matrix Engine.' };
      }

      return { allowed: true };

    case 'opportunityRadar':
      // Need basic profile
      if (completeness.overallPercentage < 20) {
        return { allowed: false, reason: 'Please complete at least 20% of your profile.' };
      }
      return { allowed: true };

    case 'missionPacks':
      // Always accessible
      return { allowed: true };

    case 'localResources':
      // Need location
      const goalsCategory = completeness.categories.find(c => c.category === 'goals');
      if (!goalsCategory || goalsCategory.missingItems.includes('Current address entered')) {
        return { allowed: false, reason: 'Please enter your address to see local resources.' };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}
