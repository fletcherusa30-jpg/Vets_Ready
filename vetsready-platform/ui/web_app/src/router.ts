/**
 * Web App Router Configuration
 * React Router v6 route structure
 */

export const webAppRoutes = {
  // Authentication
  LOGIN: '/',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Onboarding
  ONBOARDING: '/onboarding',
  ONBOARDING_STEP: '/onboarding/:step',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Main App Routes
  BENEFITS: '/benefits',
  BENEFITS_DETAIL: '/benefits/:id',
  BENEFITS_COMPARE: '/benefits/compare',
  BENEFITS_PLAN: '/benefits/plan',

  DISABILITIES: '/disabilities',
  DISABILITIES_DETAIL: '/disabilities/:id',
  DISABILITIES_RATINGS: '/disabilities/ratings',
  DISABILITIES_EVIDENCE: '/disabilities/evidence',

  EMPLOYMENT: '/employment',
  EMPLOYMENT_DISCOVERY: '/employment/discovery',
  EMPLOYMENT_RESUME: '/employment/resume',
  EMPLOYMENT_MATCHING: '/employment/matching',
  EMPLOYMENT_NETWORKING: '/employment/networking',

  EDUCATION: '/education',
  EDUCATION_PROGRAMS: '/education/programs',
  EDUCATION_GIBILL: '/education/gibill',
  EDUCATION_PLANNING: '/education/planning',

  WELLNESS: '/wellness',
  WELLNESS_ASSESSMENT: '/wellness/assessment',
  WELLNESS_ROUTINES: '/wellness/routines',
  WELLNESS_RESOURCES: '/wellness/resources',

  FINANCES: '/finances',
  FINANCES_DASHBOARD: '/finances/dashboard',
  FINANCES_BUDGET: '/finances/budget',
  FINANCES_SCENARIOS: '/finances/scenarios',
  FINANCES_DEBT: '/finances/debt',

  COMMUNITY: '/community',
  COMMUNITY_MENTORS: '/community/mentors',
  COMMUNITY_GROUPS: '/community/groups',
  COMMUNITY_EVENTS: '/community/events',

  ENTREPRENEURSHIP: '/entrepreneurship',
  ENTREPRENEURSHIP_PLAN: '/entrepreneurship/plan',
  ENTREPRENEURSHIP_FUNDING: '/entrepreneurship/funding',
  ENTREPRENEURSHIP_COMPLIANCE: '/entrepreneurship/compliance',

  LEGAL: '/legal',
  LEGAL_USERRA: '/legal/userra',
  LEGAL_ADA: '/legal/ada',
  LEGAL_RESOURCES: '/legal/resources',

  HOUSING: '/housing',
  HOUSING_PROGRAMS: '/housing/programs',
  HOUSING_EDUCATION: '/housing/education',
  HOUSING_PLANNING: '/housing/planning',

  FAMILY: '/family',
  FAMILY_BENEFITS: '/family/benefits',
  FAMILY_PLANNING: '/family/planning',
  FAMILY_CAREGIVER: '/family/caregiver',

  // Settings & Profile
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  SETTINGS: '/settings',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_PRIVACY: '/settings/privacy',

  // Goals
  GOALS: '/goals',
  GOALS_CREATE: '/goals/create',
  GOALS_DETAIL: '/goals/:id',

  // Help & Support
  HELP: '/help',
  FAQ: '/faq',
  CONTACT: '/contact'
};

export interface RouteConfig {
  path: string;
  component: any;
  layout: 'authenticated' | 'public';
  requiresAuth: boolean;
  title: string;
}

export const routeConfigs: RouteConfig[] = [
  // Public routes
  {
    path: webAppRoutes.LOGIN,
    component: null, // TODO: Import Login component
    layout: 'public',
    requiresAuth: false,
    title: 'Login'
  },
  {
    path: webAppRoutes.REGISTER,
    component: null, // TODO: Import Register component
    layout: 'public',
    requiresAuth: false,
    title: 'Register'
  },

  // Authenticated routes
  {
    path: webAppRoutes.DASHBOARD,
    component: null, // TODO: Import Dashboard component
    layout: 'authenticated',
    requiresAuth: true,
    title: 'Dashboard'
  },
  {
    path: webAppRoutes.BENEFITS,
    component: null, // TODO: Import Benefits component
    layout: 'authenticated',
    requiresAuth: true,
    title: 'Benefits'
  },
  {
    path: webAppRoutes.EMPLOYMENT,
    component: null, // TODO: Import Employment component
    layout: 'authenticated',
    requiresAuth: true,
    title: 'Employment'
  },
  {
    path: webAppRoutes.PROFILE,
    component: null, // TODO: Import Profile component
    layout: 'authenticated',
    requiresAuth: true,
    title: 'My Profile'
  }
];
