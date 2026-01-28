/**
 * Family Support Domain Service
 * Family benefits, caregiver support, family-centered planning
 */

export interface FamilyBenefit {
  id: string;
  name: string;
  type: 'spouse' | 'child' | 'dependent' | 'caregiver';
  description: string;
  eligibility: string[];
  monthlyAmount?: number;
  applicationProcess: string;
  applicationUrl: string;
  relatedBenefits: string[];
}

export interface CaregiverSupport {
  id: string;
  category: 'financial' | 'respite' | 'training' | 'counseling' | 'resources';
  title: string;
  description: string;
  eligibility: string[];
  contact: string;
  website: string;
}

export interface FamilyPlanningSummary {
  veteranId: string;
  dependents: Dependent[];
  activeBenefits: FamilyBenefit[];
  potentialBenefits: FamilyBenefit[];
  caregiverStatus: string;
  nextSteps: string[];
}

export interface Dependent {
  name: string;
  relationship: string;
  dob: Date;
  dependencyStatus: boolean;
}

export interface FamilyGoal {
  id: string;
  description: string;
  targetDate: Date;
  status: 'not_started' | 'in_progress' | 'completed';
  resources: string[];
}

export interface IFamilySupportService {
  // Family Benefits
  getFamilyBenefits(dependents: Dependent[]): Promise<FamilyBenefit[]>;
  searchFamilyBenefits(type: string): Promise<FamilyBenefit[]>;
  getBenefitDetails(benefitId: string): Promise<FamilyBenefit>;

  // Spouse Benefits
  getSpouseBenefits(veteranId: string): Promise<FamilyBenefit[]>;
  checkSpouseEligibility(veteranId: string, benefitId: string): Promise<EligibilityResult>;

  // Child Benefits
  getChildBenefits(veteranId: string, childAge: number): Promise<FamilyBenefit[]>;
  trackDependentStatus(veteranId: string): Promise<DependentStatus[]>;

  // Caregiver Support
  getCaregiverResources(): Promise<CaregiverSupport[]>;
  findCaregiverSupport(category?: string): Promise<CaregiverSupport[]>;
  getCaregiverTraining(): Promise<TrainingResource[]>;
  getCaregiverCounseling(): Promise<CounselingResource[]>;

  // Family Planning
  assessFamilyNeeds(veteranId: string): Promise<FamilyPlanningSummary>;
  createFamilyPlan(veteranId: string): Promise<FamilyPlan>;
  setFamilyGoals(veteranId: string, goals: FamilyGoal[]): Promise<FamilyGoal[]>;

  // Resources
  findFamilyResources(): Promise<FamilyResource[]>;
  findChildcareAssistance(veteranId: string): Promise<ChildcareResource[]>;
}

export interface EligibilityResult {
  isEligible: boolean;
  conditions: string[];
  benefitAmount?: number;
}

export interface DependentStatus {
  dependent: Dependent;
  activeBenefits: string[];
  status: 'active' | 'inactive' | 'expired';
}

export interface FamilyPlan {
  id: string;
  veteranId: string;
  goals: FamilyGoal[];
  benefits: FamilyBenefit[];
  timeline: Date;
  notes: string;
  createdAt: Date;
}

export interface TrainingResource {
  id: string;
  title: string;
  provider: string;
  format: string;
  duration: string;
  cost: number;
  url: string;
}

export interface CounselingResource {
  name: string;
  type: string;
  contact: string;
  availability: string;
  specializations: string[];
  cost?: string;
}

export interface FamilyResource {
  id: string;
  name: string;
  type: string;
  description: string;
  url: string;
  phone?: string;
}

export interface ChildcareResource {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  acceptsVeteranSubsidies: boolean;
  contact: string;
  website: string;
}
