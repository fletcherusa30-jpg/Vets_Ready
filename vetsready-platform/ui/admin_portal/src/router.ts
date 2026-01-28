/**
 * Admin Portal Routes
 * Administrative interface for managing platform content and rules
 */

export const adminRoutes = {
  // Dashboard
  ADMIN_DASHBOARD: '/admin',

  // Rules Management
  RULES: '/admin/rules',
  RULES_CREATE: '/admin/rules/create',
  RULES_EDIT: '/admin/rules/:id',
  RULES_LIST: '/admin/rules/list',

  // Content Management
  CONTENT: '/admin/content',
  CONTENT_BENEFITS: '/admin/content/benefits',
  CONTENT_RESOURCES: '/admin/content/resources',
  CONTENT_PROGRAMS: '/admin/content/programs',

  // Users
  USERS: '/admin/users',
  USERS_DETAIL: '/admin/users/:id',
  USERS_PERMISSIONS: '/admin/users/:id/permissions',

  // Analytics
  ANALYTICS: '/admin/analytics',
  ANALYTICS_REPORTS: '/admin/analytics/reports',
  ANALYTICS_METRICS: '/admin/analytics/metrics',
  ANALYTICS_USERS: '/admin/analytics/users',

  // Settings
  ADMIN_SETTINGS: '/admin/settings',
  SETTINGS_INTEGRATIONS: '/admin/settings/integrations',
  SETTINGS_NOTIFICATIONS: '/admin/settings/notifications',

  // Support
  SUPPORT: '/admin/support',
  SUPPORT_TICKETS: '/admin/support/tickets',
  SUPPORT_FEEDBACK: '/admin/support/feedback'
};

export interface AdminRouteConfig {
  path: string;
  component: any;
  requiredRole: 'admin' | 'moderator';
  title: string;
}

export const adminRouteConfigs: AdminRouteConfig[] = [
  {
    path: adminRoutes.ADMIN_DASHBOARD,
    component: null, // TODO: Import AdminDashboard
    requiredRole: 'admin',
    title: 'Admin Dashboard'
  },
  {
    path: adminRoutes.RULES,
    component: null, // TODO: Import RulesManager
    requiredRole: 'admin',
    title: 'Rules Management'
  },
  {
    path: adminRoutes.CONTENT,
    component: null, // TODO: Import ContentManager
    requiredRole: 'admin',
    title: 'Content Management'
  },
  {
    path: adminRoutes.ANALYTICS,
    component: null, // TODO: Import Analytics
    requiredRole: 'admin',
    title: 'Analytics'
  },
  {
    path: adminRoutes.USERS,
    component: null, // TODO: Import UserManagement
    requiredRole: 'admin',
    title: 'User Management'
  }
];
