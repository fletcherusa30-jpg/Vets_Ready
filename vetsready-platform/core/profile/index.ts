/**
 * Veteran Profile Service
 * CRUD operations and aggregation for veteran profiles
 */

import {
  VeteranProfile,
  DisabilityProfile,
  BenefitsProfile,
  EmploymentProfile,
  EducationProfile,
  WellnessProfile,
  FinancialProfile,
  FamilyProfile,
  Goal,
  ServiceHistory
} from '../../data/models';

export interface IProfileService {
  // Veteran Profile CRUD
  createProfile(data: VeteranProfile): Promise<VeteranProfile>;
  getProfile(id: string): Promise<VeteranProfile | null>;
  updateProfile(id: string, data: Partial<VeteranProfile>): Promise<VeteranProfile>;
  deleteProfile(id: string): Promise<void>;
  getAllProfiles(filter?: ProfileFilter): Promise<VeteranProfile[]>;

  // Sub-profile Management
  getDisabilityProfile(veteranId: string): Promise<DisabilityProfile | null>;
  getBenefitsProfile(veteranId: string): Promise<BenefitsProfile | null>;
  getEmploymentProfile(veteranId: string): Promise<EmploymentProfile | null>;
  getEducationProfile(veteranId: string): Promise<EducationProfile | null>;
  getWellnessProfile(veteranId: string): Promise<WellnessProfile | null>;
  getFinancialProfile(veteranId: string): Promise<FinancialProfile | null>;
  getFamilyProfile(veteranId: string): Promise<FamilyProfile | null>;

  // Aggregation
  getFullProfile(veteranId: string): Promise<AggregatedProfile | null>;
  getProfileSummary(veteranId: string): Promise<ProfileSummary | null>;

  // Service History
  addServiceRecord(veteranId: string, service: ServiceHistory): Promise<ServiceHistory>;
  updateServiceRecord(veteranId: string, serviceId: string, data: Partial<ServiceHistory>): Promise<ServiceHistory>;
  removeServiceRecord(veteranId: string, serviceId: string): Promise<void>;

  // Goals
  addGoal(veteranId: string, goal: Goal): Promise<Goal>;
  updateGoal(veteranId: string, goalId: string, data: Partial<Goal>): Promise<Goal>;
  removeGoal(veteranId: string, goalId: string): Promise<void>;
  getGoals(veteranId: string, status?: string): Promise<Goal[]>;
}

export interface ProfileFilter {
  branch?: string;
  dischargeType?: string;
  location?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface AggregatedProfile {
  veteran: VeteranProfile;
  disability?: DisabilityProfile;
  benefits?: BenefitsProfile;
  employment?: EmploymentProfile;
  education?: EducationProfile;
  wellness?: WellnessProfile;
  financial?: FinancialProfile;
  family?: FamilyProfile;
}

export interface ProfileSummary {
  veteranId: string;
  name: string;
  branch: string;
  dischargeType: string;
  location: string;
  activeGoals: number;
  benefitsCount: number;
  skillsCount: number;
  credentialsCount: number;
  lastUpdated: Date;
}
