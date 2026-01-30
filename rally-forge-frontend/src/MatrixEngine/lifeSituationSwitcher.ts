/**
 * VETERAN LIFE SITUATION SWITCHER
 *
 * Allows veterans to declare their current life situation.
 * Automatically adjusts UI, priorities, and recommendations.
 *
 * INTEGRATIONS:
 * - Digital Twin (stores current mode)
 * - Dashboard (layout changes)
 * - Mission Packs (prioritization)
 * - Opportunity Radar (filtering)
 * - Local Resources (prioritization)
 * - Evidence Builder (suggestions)
 * - GIE (consistency checks)
 * - Readiness Index (mode-relative scoring)
 */

import { DigitalTwin } from '../types/digitalTwin';

/**
 * Available life situation modes
 */
export type LifeSituationMode =
  | 'transitioning'
  | 'filing-claim'
  | 'appealing'
  | 'buying-home'
  | 'going-to-school'
  | 'changing-careers'
  | 'starting-business'
  | 'retired'
  | 'disabled-stable'
  | 'family-focused'
  | 'not-set';

/**
 * Life situation configuration
 */
export interface LifeSituationConfig {
  mode: LifeSituationMode;
  label: string;
  description: string;
  icon: string;
  color: string;

  // Dashboard preferences
  dashboardLayout: 'wizard-focused' | 'benefits-focused' | 'resources-focused' | 'balanced';

  // Priority order for Mission Packs
  priorityMissionPacks: string[];

  // Opportunity Radar filters
  opportunityFilters: {
    categories: string[];
    urgency: 'high' | 'medium' | 'low' | 'all';
  };

  // Local resources priorities
  localResourcePriorities: string[];

  // Evidence suggestions
  evidenceFocus: string[];

  // Notification preferences
  notificationTypes: string[];
}

/**
 * All life situation configurations
 */
export const LIFE_SITUATIONS: Record<LifeSituationMode, LifeSituationConfig> = {
  'transitioning': {
    mode: 'transitioning',
    label: 'Transitioning from Service',
    description: 'Recently separated or about to separate from military',
    icon: '🎖️➡️🏠',
    color: '#3b82f6',
    dashboardLayout: 'wizard-focused',
    priorityMissionPacks: [
      'Transition Checklist',
      'File Initial VA Claim',
      'Apply for VA Healthcare',
      'Update DEERS',
      'Get DD-214',
      'Register for Benefits',
    ],
    opportunityFilters: {
      categories: ['Healthcare', 'Employment', 'Education', 'Benefits Enrollment'],
      urgency: 'high',
    },
    localResourcePriorities: ['TAP Centers', 'VSOs', 'Employment Services', 'VA Medical Centers'],
    evidenceFocus: ['Service records', 'Initial medical evidence', 'Transition documents'],
    notificationTypes: ['deadlines', 'new-benefits', 'transition-tips'],
  },

  'filing-claim': {
    mode: 'filing-claim',
    label: 'Filing a VA Claim',
    description: 'Actively working on a disability compensation claim',
    icon: '📋',
    color: '#10b981',
    dashboardLayout: 'wizard-focused',
    priorityMissionPacks: [
      'File for Disability Compensation',
      'Gather Medical Evidence',
      'Request C&P Exam',
      'Build Lay Statements',
      'Find Secondary Conditions',
      'Track Claim Status',
    ],
    opportunityFilters: {
      categories: ['Disability Benefits', 'Medical Evidence', 'Secondary Conditions'],
      urgency: 'high',
    },
    localResourcePriorities: ['VSOs', 'VA Medical Centers', 'Accredited Attorneys'],
    evidenceFocus: ['Medical records', 'Lay statements', 'Nexus letters', 'Service records'],
    notificationTypes: ['claim-updates', 'evidence-tips', 'deadlines'],
  },

  'appealing': {
    mode: 'appealing',
    label: 'Appealing a Decision',
    description: 'Appealing a VA decision or rating',
    icon: '⚖️',
    color: '#f59e0b',
    dashboardLayout: 'wizard-focused',
    priorityMissionPacks: [
      'Appeal Decision Guide',
      'Request Decision Review',
      'Gather New Evidence',
      'File Supplemental Claim',
      'Find VSO for Appeal',
    ],
    opportunityFilters: {
      categories: ['Appeals', 'Legal Assistance', 'Medical Evidence'],
      urgency: 'high',
    },
    localResourcePriorities: ['Accredited Attorneys', 'VSOs', 'VA Regional Offices'],
    evidenceFocus: ['New medical evidence', 'Expert opinions', 'Legal briefs'],
    notificationTypes: ['appeal-deadlines', 'new-evidence-tips', 'legal-updates'],
  },

  'buying-home': {
    mode: 'buying-home',
    label: 'Buying a Home',
    description: 'Looking to purchase a home with VA loan',
    icon: '🏡',
    color: '#8b5cf6',
    dashboardLayout: 'resources-focused',
    priorityMissionPacks: [
      'Apply for VA Home Loan',
      'Get COE',
      'Find VA-Approved Lender',
      'Home Buying Checklist',
      'Property Tax Exemptions',
    ],
    opportunityFilters: {
      categories: ['Housing', 'Financial Benefits', 'State Benefits'],
      urgency: 'medium',
    },
    localResourcePriorities: ['VA-Approved Lenders', 'Real Estate Agents', 'County Offices'],
    evidenceFocus: ['COE', 'Financial documents', 'Eligibility proof'],
    notificationTypes: ['housing-tips', 'rate-changes', 'local-programs'],
  },

  'going-to-school': {
    mode: 'going-to-school',
    label: 'Going Back to School',
    description: 'Planning to use education benefits',
    icon: '🎓',
    color: '#06b6d4',
    dashboardLayout: 'benefits-focused',
    priorityMissionPacks: [
      'Apply for GI Bill',
      'Choose a School',
      'Verify Enrollment',
      'Apply for VR&E',
      'Find Tutoring Resources',
    ],
    opportunityFilters: {
      categories: ['Education', 'Financial Benefits', 'Career Development'],
      urgency: 'medium',
    },
    localResourcePriorities: ['Schools', 'VA Education Offices', 'VR&E Counselors'],
    evidenceFocus: ['Enrollment documents', 'GI Bill eligibility', 'Transcripts'],
    notificationTypes: ['enrollment-deadlines', 'education-tips', 'new-programs'],
  },

  'changing-careers': {
    mode: 'changing-careers',
    label: 'Changing Careers',
    description: 'Transitioning to a new career field',
    icon: '💼',
    color: '#ec4899',
    dashboardLayout: 'resources-focused',
    priorityMissionPacks: [
      'Career Transition Plan',
      'Apply for VR&E',
      'Update Resume',
      'Find Job Training',
      'Network with Employers',
    ],
    opportunityFilters: {
      categories: ['Employment', 'Education', 'Skills Training'],
      urgency: 'medium',
    },
    localResourcePriorities: ['Employment Centers', 'VR&E Counselors', 'Job Fairs', 'Training Programs'],
    evidenceFocus: ['Resume', 'Certifications', 'Skills assessments'],
    notificationTypes: ['job-postings', 'training-opportunities', 'career-tips'],
  },

  'starting-business': {
    mode: 'starting-business',
    label: 'Starting a Business',
    description: 'Launching or growing a veteran-owned business',
    icon: '🚀',
    color: '#14b8a6',
    dashboardLayout: 'resources-focused',
    priorityMissionPacks: [
      'Start a Business Guide',
      'Get Veteran Business Certification',
      'Find SBA Resources',
      'Access Capital',
      'Federal Contracting',
    ],
    opportunityFilters: {
      categories: ['Entrepreneurship', 'Financial Benefits', 'Business Resources'],
      urgency: 'medium',
    },
    localResourcePriorities: ['SBA Offices', 'Veteran Business Centers', 'SCORE Mentors', 'Chambers of Commerce'],
    evidenceFocus: ['Business plan', 'Veteran status proof', 'Financial documents'],
    notificationTypes: ['business-opportunities', 'grants-loans', 'contracting-tips'],
  },

  'retired': {
    mode: 'retired',
    label: 'Retired',
    description: 'Enjoying retirement and managing benefits',
    icon: '🌴',
    color: '#a855f7',
    dashboardLayout: 'balanced',
    priorityMissionPacks: [
      'Maximize Retirement Benefits',
      'Healthcare Enrollment',
      'Financial Planning',
      'Recreation Programs',
      'Estate Planning',
    ],
    opportunityFilters: {
      categories: ['Healthcare', 'Financial Benefits', 'Recreation', 'State Benefits'],
      urgency: 'low',
    },
    localResourcePriorities: ['VA Medical Centers', 'Senior Centers', 'Recreation Programs', 'Financial Advisors'],
    evidenceFocus: ['Healthcare enrollment', 'Retirement documents', 'Financial records'],
    notificationTypes: ['healthcare-updates', 'benefit-changes', 'local-events'],
  },

  'disabled-stable': {
    mode: 'disabled-stable',
    label: 'Disabled & Stable',
    description: 'Managing service-connected disabilities',
    icon: '🏥',
    color: '#ef4444',
    dashboardLayout: 'benefits-focused',
    priorityMissionPacks: [
      'Maximize Disability Benefits',
      'Healthcare Enrollment',
      'Adaptive Housing',
      'Caregiver Support',
      'TDIU Application',
    ],
    opportunityFilters: {
      categories: ['Healthcare', 'Disability Benefits', 'Adaptive Equipment', 'Caregiver Support'],
      urgency: 'medium',
    },
    localResourcePriorities: ['VA Medical Centers', 'Adaptive Sports', 'Support Groups', 'Caregiver Resources'],
    evidenceFocus: ['Medical records', 'Treatment history', 'Caregiver documentation'],
    notificationTypes: ['healthcare-updates', 'benefit-increases', 'support-resources'],
  },

  'family-focused': {
    mode: 'family-focused',
    label: 'Family-Focused',
    description: 'Prioritizing family benefits and support',
    icon: '👨‍👩‍👧‍👦',
    color: '#f97316',
    dashboardLayout: 'benefits-focused',
    priorityMissionPacks: [
      'Family Benefits Guide',
      'Education for Dependents',
      'Healthcare for Family',
      'Survivor Benefits',
      'Family Support Programs',
    ],
    opportunityFilters: {
      categories: ['Family Benefits', 'Education', 'Healthcare', 'Survivor Benefits'],
      urgency: 'medium',
    },
    localResourcePriorities: ['Family Support Centers', 'Schools', 'Healthcare Providers', 'Counseling Services'],
    evidenceFocus: ['Dependent documentation', 'Marriage certificate', 'Birth certificates'],
    notificationTypes: ['family-benefits', 'education-opportunities', 'support-programs'],
  },

  'not-set': {
    mode: 'not-set',
    label: 'Not Set',
    description: 'Choose your current life situation',
    icon: '❓',
    color: '#6b7280',
    dashboardLayout: 'balanced',
    priorityMissionPacks: [],
    opportunityFilters: {
      categories: [],
      urgency: 'all',
    },
    localResourcePriorities: [],
    evidenceFocus: [],
    notificationTypes: ['general'],
  },
};

/**
 * Set life situation mode
 */
export function setLifeSituation(
  digitalTwin: DigitalTwin,
  mode: LifeSituationMode
): DigitalTwin {
  return {
    ...digitalTwin,
    lifeSituation: {
      ...digitalTwin.lifeSituation,
      currentMode: mode,
      changedAt: new Date().toISOString(),
    },
  };
}

/**
 * Get current life situation configuration
 */
export function getCurrentLifeSituation(digitalTwin: DigitalTwin): LifeSituationConfig {
  const mode = digitalTwin.lifeSituation?.currentMode || 'not-set';
  return LIFE_SITUATIONS[mode];
}

/**
 * Suggest life situation based on profile
 */
export function suggestLifeSituation(digitalTwin: DigitalTwin): LifeSituationMode {
  // Transitioning if separated within last 12 months
  if (digitalTwin.serviceEndDate) {
    const endDate = new Date(digitalTwin.serviceEndDate);
    const monthsSinceSeparation = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceSeparation < 12) {
      return 'transitioning';
    }
  }

  // Filing claim if no rating yet
  if (!digitalTwin.combinedRating || digitalTwin.combinedRating === 0) {
    return 'filing-claim';
  }

  // Disabled-stable if high rating
  if (digitalTwin.combinedRating >= 70) {
    return 'disabled-stable';
  }

  // Family-focused if has dependents
  if ((digitalTwin.children || 0) > 0) {
    return 'family-focused';
  }

  // Default to not-set
  return 'not-set';
}

/**
 * Get actionable items for current mode
 */
export function getActionableItems(config: LifeSituationConfig): Array<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const items: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }> = [];

  // Add top 3 mission packs as high priority
  config.priorityMissionPacks.slice(0, 3).forEach(pack => {
    items.push({
      title: pack,
      description: `Complete this mission pack for your ${config.label.toLowerCase()} journey`,
      priority: 'high',
    });
  });

  // Add resource connections
  config.localResourcePriorities.slice(0, 2).forEach(resource => {
    items.push({
      title: `Connect with ${resource}`,
      description: `Find local ${resource.toLowerCase()} in your area`,
      priority: 'medium',
    });
  });

  return items;
}

/**
 * Check if mode is consistent with profile
 */
export function validateLifeSituationConsistency(
  digitalTwin: DigitalTwin
): { consistent: boolean; warnings: string[] } {
  const mode = digitalTwin.lifeSituation?.currentMode || 'not-set';
  const warnings: string[] = [];

  // Mode-specific validation
  if (mode === 'filing-claim' && digitalTwin.combinedRating > 0) {
    warnings.push('You have an existing rating. Consider "Appealing a Decision" or "Disabled & Stable" mode.');
  }

  if (mode === 'transitioning' && digitalTwin.serviceEndDate) {
    const endDate = new Date(digitalTwin.serviceEndDate);
    const monthsSinceSeparation = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceSeparation > 24) {
      warnings.push('It\'s been over 2 years since separation. Consider updating your life situation.');
    }
  }

  if (mode === 'buying-home' && digitalTwin.combinedRating < 10) {
    warnings.push('VA home loan is available to all eligible veterans, regardless of disability rating.');
  }

  return {
    consistent: warnings.length === 0,
    warnings,
  };
}
