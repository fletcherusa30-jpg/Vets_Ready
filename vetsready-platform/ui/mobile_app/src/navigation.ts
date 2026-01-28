/**
 * Mobile App Screens Configuration
 * React Native navigation structure
 */

export const mobileScreens = {
  // Authentication
  AUTH_STACK: 'AuthStack',
  LOGIN_SCREEN: 'LoginScreen',
  REGISTER_SCREEN: 'RegisterScreen',

  // Tab Navigation
  APP_TAB: 'AppTab',
  HOME_TAB: 'HomeTab',
  BENEFITS_TAB: 'BenefitsTab',
  EMPLOYMENT_TAB: 'EmploymentTab',
  PROFILE_TAB: 'ProfileTab',

  // Screens
  DASHBOARD: 'Dashboard',
  BENEFITS_EXPLORER: 'BenefitsExplorer',
  BENEFIT_DETAIL: 'BenefitDetail',
  JOB_SEARCH: 'JobSearch',
  JOB_DETAIL: 'JobDetail',
  PROFILE_VIEW: 'ProfileView',
  SETTINGS: 'Settings',
  HELP: 'Help'
};

export interface ScreenConfig {
  name: string;
  component: any;
  navigationOptions?: any;
}

export const screenConfigs: ScreenConfig[] = [
  {
    name: mobileScreens.LOGIN_SCREEN,
    component: null, // TODO: Import LoginScreen
    navigationOptions: {
      headerShown: false
    }
  },
  {
    name: mobileScreens.DASHBOARD,
    component: null, // TODO: Import DashboardScreen
    navigationOptions: {
      title: 'Dashboard',
      tabBarLabel: 'Home'
    }
  },
  {
    name: mobileScreens.BENEFITS_EXPLORER,
    component: null, // TODO: Import BenefitsExplorer
    navigationOptions: {
      title: 'Benefits',
      tabBarLabel: 'Benefits'
    }
  },
  {
    name: mobileScreens.JOB_SEARCH,
    component: null, // TODO: Import JobSearch
    navigationOptions: {
      title: 'Jobs',
      tabBarLabel: 'Jobs'
    }
  },
  {
    name: mobileScreens.PROFILE_VIEW,
    component: null, // TODO: Import ProfileView
    navigationOptions: {
      title: 'Profile',
      tabBarLabel: 'Profile'
    }
  }
];
