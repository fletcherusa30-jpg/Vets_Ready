/**
 * Education Domain Service
 * GI Bill planning, training program matching, educational pathways
 */

export interface TrainingProgram {
  id: string;
  name: string;
  provider: string;
  type: 'degree' | 'certificate' | 'bootcamp' | 'certification';
  field: string;
  duration: string;
  cost: number;
  giBillEligible: boolean;
  estimatedOutcome: string;
  successRate: number;
}

export interface GIBillPlan {
  id: string;
  veteranId: string;
  programId: string;
  startDate: Date;
  estimatedEndDate: Date;
  monthlyBenefitAmount: number;
  totalAvailable: number;
  totalExpected: number;
  moneyLeftOver: number;
  yellowRibbon?: boolean;
}

export interface EducationPath {
  startingPoint: string;
  targetGoal: string;
  steps: EducationStep[];
  estimatedMonths: number;
  totalCost: number;
  giBillCoverage: number;
}

export interface EducationStep {
  order: number;
  programName: string;
  institution: string;
  duration: string;
  credential: string;
  cost: number;
  giBillCoverage: number;
}

export interface IEducationService {
  // Program Discovery
  discoverPrograms(veteranId: string, interests?: string[]): Promise<TrainingProgram[]>;
  searchPrograms(query: string, filters?: ProgramFilter): Promise<TrainingProgram[]>;
  getProgramDetails(programId: string): Promise<TrainingProgramDetails>;

  // GI Bill Planning
  createGIBillPlan(veteranId: string, programId: string): Promise<GIBillPlan>;
  updateGIBillPlan(planId: string, updates: Partial<GIBillPlan>): Promise<GIBillPlan>;
  getGIBillEligibility(veteranId: string): Promise<GIBillEligibility>;
  estimateGIBillCost(veteranId: string, programId: string): Promise<CostEstimate>;

  // Career Alignment
  alignProgramToCareer(veteranId: string, targetRole: string): Promise<TrainingProgram[]>;
  buildEducationPath(veteranId: string, targetGoal: string): Promise<EducationPath>;

  // Resources
  findResources(topic: string): Promise<EducationResource[]>;
  getAffordabilityResources(): Promise<AffordabilityResource[]>;
  getVocationalGuidance(): Promise<string>;
}

export interface ProgramFilter {
  field?: string;
  type?: string;
  location?: string;
  online?: boolean;
  giBillEligible?: boolean;
  maxCost?: number;
}

export interface TrainingProgramDetails {
  program: TrainingProgram;
  accreditation: string[];
  admissionRequirements: string[];
  curriculum: string;
  careerOutcomes: string[];
  alumniSuccess: number;
  applicationDeadline: Date;
  applicationUrl: string;
}

export interface GIBillEligibility {
  eligible: boolean;
  benefits: {
    tuition: number;
    fees: number;
    books: number;
    housing: number;
    totalMonthly: number;
  };
  monthsAvailable: number;
  moneyRemaining: number;
  expirationDate: Date;
}

export interface CostEstimate {
  programCost: number;
  giBillCoverage: number;
  veteranResponsibility: number;
  otherResources: number;
}

export interface EducationResource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  provider: string;
}

export interface AffordabilityResource {
  name: string;
  type: 'grant' | 'loan' | 'scholarship' | 'employer';
  amount: number;
  requirements: string[];
  applicationUrl: string;
}
