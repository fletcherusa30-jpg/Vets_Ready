import { UUID } from 'crypto';

/**
 * Core data models for VetsReady Platform
 * These define the primary entities and relationships in the system
 */

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export enum Branch {
  ARMY = 'army',
  NAVY = 'navy',
  MARINES = 'marines',
  AIR_FORCE = 'air_force',
  COAST_GUARD = 'coast_guard',
  SPACE_FORCE = 'space_force',
  NATIONAL_GUARD = 'national_guard'
}

export enum DischargeType {
  HONORABLE = 'honorable',
  GENERAL = 'general',
  OTHER = 'other_than_honorable',
  BAD_CONDUCT = 'bad_conduct',
  DISHONORABLE = 'dishonorable'
}

export enum GoalType {
  BENEFITS = 'benefits',
  EMPLOYMENT = 'employment',
  EDUCATION = 'education',
  BUSINESS = 'business',
  FINANCIAL = 'financial',
  WELLNESS = 'wellness',
  HOUSING = 'housing',
  OTHER = 'other'
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface ServiceHistory {
  id: string;
  branch: Branch;
  mosOrAfscOrRating: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  rankAtSeparation: string;
  deployments: Deployment[];
}

export interface Deployment {
  id: string;
  location: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Location {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  status: GoalStatus;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// ============================================================================
// VETERAN PROFILE
// ============================================================================

export interface VeteranProfile {
  id: string;
  // Personal Information
  firstName: string;
  lastName: string;
  dob: Date;
  email: string;
  contactInfo: ContactInfo;

  // Location
  location: Location;

  // Military Service
  branchHistory: ServiceHistory[];
  dischargeType: DischargeType;
  dischargeDate: Date;

  // Profile Attributes
  goals: Goal[];

  // Relationships to sub-profiles
  disabilityProfileId?: string;
  benefitsProfileId?: string;
  employmentProfileId?: string;
  educationProfileId?: string;
  wellnessProfileId?: string;
  financialProfileId?: string;
  familyProfileId?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

// ============================================================================
// DISABILITY PROFILE (Educational)
// ============================================================================

export interface DisabilityCondition {
  id: string;
  name: string;
  icdCode?: string;
  symptoms: string[];
  onsetDate?: Date;
  notes?: string;
}

export interface DisabilityRating {
  id: string;
  conditionId: string;
  percentage: number;
  effectiveDate: Date;
  source: 'VA' | 'Other';
  notes?: string;
}

export interface ClaimHistory {
  id: string;
  filedDate: Date;
  status: 'submitted' | 'under_review' | 'approved' | 'denied';
  decisionDate?: Date;
  result?: string;
  notes?: string;
}

export interface DisabilityProfile {
  id: string;
  veteranId: string;

  // Medical Information (Educational)
  conditions: DisabilityCondition[];
  symptoms: string[];
  ratings: DisabilityRating[];

  // Functional Impact
  functionalImpact: string[];

  // Claim Tracking
  claimHistory: ClaimHistory[];
  totalRating?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// BENEFITS PROFILE
// ============================================================================

export interface Benefit {
  id: string;
  type: string;
  name: string;
  status: 'eligible' | 'applied' | 'approved' | 'active' | 'inactive';
  amount?: number;
  effectiveDate?: Date;
  expirationDate?: Date;
  notes?: string;
}

export interface BenefitsProfile {
  id: string;
  veteranId: string;

  // Benefits
  vaBenefits: Benefit[];
  stateBenefits: Benefit[];
  otherBenefits: Benefit[];

  // Eligibility
  eligibilityFlags: string[];

  // Utilization
  utilizationStatus: {
    benefitId: string;
    utilization: number; // Percentage
    lastUpdated: Date;
  }[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EMPLOYMENT PROFILE
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  source: 'military' | 'civilian' | 'training';
}

export interface Credential {
  id: string;
  name: string;
  issuer: string;
  dateObtained: Date;
  expirationDate?: Date;
  url?: string;
}

export interface JobHistory {
  id: string;
  title: string;
  company: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
}

export interface EmploymentProfile {
  id: string;
  veteranId: string;

  // Skills & Credentials
  skills: Skill[];
  credentials: Credential[];

  // Career Information
  jobHistory: JobHistory[];
  targetRoles: string[];
  jobSearchStatus: 'not_searching' | 'passive' | 'active';

  // Preferences
  industryPreferences: string[];
  locationPreferences: Location[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EDUCATION PROFILE
// ============================================================================

export interface EducationLevel {
  level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'other';
  fieldOfStudy?: string;
  institution?: string;
  graduationDate?: Date;
}

export interface TrainingProgram {
  id: string;
  name: string;
  provider: string;
  startDate: Date;
  endDate?: Date;
  status: 'completed' | 'in_progress' | 'planned';
  certificateUrl?: string;
}

export interface GIBillUsage {
  id: string;
  type: string; // Chapter 33, etc.
  entitlementMonths: number;
  usedMonths: number;
  remainingMonths: number;
  expirationDate?: Date;
  balance?: number;
}

export interface EducationProfile {
  id: string;
  veteranId: string;

  // Education History
  highestEducation: EducationLevel;
  educationHistory: EducationLevel[];

  // Training
  trainingHistory: TrainingProgram[];
  targetPrograms: string[];

  // GI Bill
  giBillUsage: GIBillUsage[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// WELLNESS PROFILE
// ============================================================================

export interface WellnessRoutine {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

export interface WellnessProfile {
  id: string;
  veteranId: string;

  // Self-Assessment
  selfReportedStatus: 'excellent' | 'good' | 'fair' | 'poor';
  stressIndicators: string[];

  // Routines & Habits
  routines: WellnessRoutine[];
  nonClinicalResourcesUsed: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FINANCIAL PROFILE
// ============================================================================

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'benefit' | 'investment' | 'other';
  monthlyAmount: number;
  startDate: Date;
  endDate?: Date;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  monthlyAmount: number;
}

export interface Debt {
  id: string;
  type: 'student_loan' | 'credit_card' | 'mortgage' | 'personal' | 'other';
  totalAmount: number;
  currentBalance: number;
  interestRate?: number;
  monthlyPayment: number;
}

export interface FinancialGoal {
  id: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
}

export interface FinancialProfile {
  id: string;
  veteranId: string;

  // Income
  incomeSources: IncomeSource[];

  // Expenses
  expenses: Expense[];

  // Debt
  debts: Debt[];

  // Goals
  financialGoals: FinancialGoal[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FAMILY PROFILE
// ============================================================================

export interface Dependent {
  id: string;
  name: string;
  relationship: string;
  dob: Date;
  dependencyStatus: boolean;
}

export interface FamilyProfile {
  id: string;
  veteranId: string;

  // Family Structure
  dependents: Dependent[];
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  caregiverStatus: 'none' | 'primary_caregiver' | 'requires_care';

  // Needs & Support
  familyNeeds: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  domain: string;
  timestamp: Date;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface UserMetrics {
  userId: string;
  profileCompletion: number;
  goalsCreated: number;
  goalsCompleted: number;
  lastActive: Date;
  sessionCount: number;
  avgSessionDuration: number;
}
