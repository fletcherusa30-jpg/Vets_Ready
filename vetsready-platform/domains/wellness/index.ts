/**
 * Wellness Domain Service
 * Non-clinical wellness tools, routines, and resources
 */

export interface WellnessActivity {
  id: string;
  name: string;
  category: 'exercise' | 'meditation' | 'social' | 'creative' | 'learning' | 'nutrition' | 'sleep';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  duration: number; // minutes
  difficulty: 'easy' | 'moderate' | 'challenging';
  tags: string[];
}

export interface WellnessRoutine {
  id: string;
  veteranId: string;
  name: string;
  activities: WellnessActivity[];
  frequency: string;
  isActive: boolean;
  createdAt: Date;
  progress?: {
    completedDays: number;
    streak: number;
    lastCompleted: Date;
  };
}

export interface ProgressTracker {
  routineId: string;
  date: Date;
  completed: boolean;
  notes?: string;
  mood?: number; // 1-10
  stressLevel?: number; // 1-10
}

export interface StressAssessment {
  currentLevel: number; // 1-10
  triggers: string[];
  copingStrategies: string[];
  resources: string[];
  recommendedActivities: WellnessActivity[];
}

export interface IWellnessService {
  // Activity Discovery
  discoverActivities(preferences?: ActivityFilter): Promise<WellnessActivity[]>;
  getActivitiesByCategory(category: string): Promise<WellnessActivity[]>;
  getActivityDetails(activityId: string): Promise<WellnessActivityDetails>;

  // Routine Building
  createRoutine(veteranId: string, routine: WellnessRoutine): Promise<WellnessRoutine>;
  updateRoutine(routineId: string, updates: Partial<WellnessRoutine>): Promise<WellnessRoutine>;
  getActiveRoutines(veteranId: string): Promise<WellnessRoutine[]>;
  deleteRoutine(routineId: string): Promise<void>;

  // Progress Tracking
  logActivity(routineId: string, tracker: ProgressTracker): Promise<void>;
  getProgress(routineId: string, days?: number): Promise<ProgressTracker[]>;
  getStreak(routineId: string): Promise<number>;

  // Assessment & Recommendation
  assessStress(veteranId: string): Promise<StressAssessment>;
  recommendActivities(veteranId: string, preference?: string): Promise<WellnessActivity[]>;
  getWellnessScore(veteranId: string): Promise<WellnessScore>;

  // Resources
  getResourceDirectory(): Promise<WellnessResource[]>;
  findLocalResources(veteranId: string): Promise<LocalResource[]>;
}

export interface ActivityFilter {
  category?: string;
  difficulty?: string;
  duration?: number;
  onlineOnly?: boolean;
  cost?: 'free' | 'paid' | 'any';
}

export interface WellnessActivityDetails {
  activity: WellnessActivity;
  benefits: string[];
  howToStart: string;
  tips: string[];
  resources: string[];
  videoUrl?: string;
}

export interface WellnessScore {
  overall: number; // 0-100
  categories: {
    physical: number;
    mental: number;
    social: number;
    sleep: number;
    stress: number;
  };
  trends: string[];
  recommendations: string[];
}

export interface WellnessResource {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  url: string;
  isVeteranSpecific: boolean;
}

export interface LocalResource {
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  services: string[];
  distance: number; // miles
}
