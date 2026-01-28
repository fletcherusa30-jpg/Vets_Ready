/**
 * Entrepreneurship Domain Service
 * Business planning, compliance guidance, funding discovery
 */

export interface BusinessPlan {
  id: string;
  veteranId: string;
  businessName: string;
  industry: string;
  businessDescription: string;
  missionStatement: string;
  sections: BusinessPlanSection[];
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessPlanSection {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

export interface FundingSource {
  id: string;
  name: string;
  type: 'grant' | 'loan' | 'investment' | 'accelerator';
  amount: number;
  eligibilityRequirements: string[];
  applicationDeadline?: Date;
  url: string;
  veteranSpecific: boolean;
}

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: 'legal' | 'tax' | 'licensing' | 'insurance';
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  resources: string[];
  completed: boolean;
}

export interface BusinessLicense {
  type: string;
  state: string;
  agency: string;
  cost: number;
  processingTime: string;
  applicationUrl: string;
}

export interface IEntrepreneurshipService {
  // Business Planning
  createBusinessPlan(veteranId: string, basicInfo: any): Promise<BusinessPlan>;
  updateBusinessPlan(planId: string, updates: any): Promise<BusinessPlan>;
  getBusinessPlan(veteranId: string): Promise<BusinessPlan | null>;
  generatePlanPDF(planId: string): Promise<string>;

  // Compliance
  getComplianceChecklist(businessType: string, state: string): Promise<ComplianceItem[]>;
  markComplianceItemComplete(itemId: string): Promise<void>;
  getLicensingRequirements(businessType: string, state: string): Promise<BusinessLicense[]>;

  // Funding
  findFundingSources(businessType: string): Promise<FundingSource[]>;
  getVeteranFundingOpportunities(): Promise<FundingSource[]>;
  generateFundingApplication(planId: string, sourceId: string): Promise<string>;

  // Resources
  getBusinessResources(): Promise<BusinessResource[]>;
  findMentors(businessType: string): Promise<Mentor[]>;
  getTrainingPrograms(): Promise<TrainingProgram[]>;
}

export interface BusinessResource {
  id: string;
  title: string;
  type: string;
  url: string;
  provider: string;
  isVeteranSpecific: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  availability: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  topic: string;
  provider: string;
  duration: string;
  cost: number;
  format: 'online' | 'in_person' | 'hybrid';
}
