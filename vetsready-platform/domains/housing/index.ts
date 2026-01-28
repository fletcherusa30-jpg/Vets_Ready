/**
 * Housing Domain Service
 * Housing program exploration, educational guides
 */

export interface HousingProgram {
  id: string;
  name: string;
  type: 'va_loan' | 'grant' | 'voucher' | 'supportive_housing' | 'other';
  description: string;
  eligibilityRequirements: string[];
  benefits: string[];
  applicationProcess: string;
  applicationUrl: string;
  contactInfo: string;
  geographicCoverage: string[];
}

export interface HousingEducation {
  id: string;
  topic: string;
  content: string;
  relatedPrograms: string[];
  resources: string[];
}

export interface LocalHousingResource {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  services: string[];
  veteranFocus: boolean;
  distance?: number;
}

export interface HousingNeeds {
  veteranId: string;
  currentHousingStatus: 'stable' | 'at_risk' | 'homeless' | 'other';
  familySize: number;
  minBedrooms: number;
  maxRent: number;
  location: any;
  specialNeeds: string[];
}

export interface HousingMatch {
  program: HousingProgram;
  matchScore: number;
  eligibilityStatus: 'eligible' | 'may_qualify' | 'not_eligible';
  nextSteps: string[];
}

export interface IHousingService {
  // Program Discovery
  discoverPrograms(veteranId: string): Promise<HousingProgram[]>;
  searchPrograms(filter: HousingFilter): Promise<HousingProgram[]>;
  getProgramDetails(programId: string): Promise<HousingProgram>;

  // Eligibility
  checkEligibility(veteranId: string, programId: string): Promise<EligibilityCheck>;
  findMatchingPrograms(veteranId: string): Promise<HousingMatch[]>;

  // Educational Resources
  getEducationalGuides(): Promise<HousingEducation[]>;
  searchEducationByTopic(topic: string): Promise<HousingEducation[]>;
  getHousingTermsGlossary(): Promise<Record<string, string>>;

  // Local Resources
  findLocalResources(veteranId: string): Promise<LocalHousingResource[]>;
  findHousingCounselors(): Promise<LocalHousingResource[]>;

  // Planning
  assessNeeds(veteranId: string): Promise<HousingNeeds>;
  createHousingPlan(veteranId: string): Promise<HousingPlan>;
}

export interface HousingFilter {
  type?: string;
  state?: string;
  minBedrooms?: number;
  maxRent?: number;
  location?: any;
}

export interface EligibilityCheck {
  isEligible: boolean;
  reason?: string;
  requirements: string[];
  missingRequirements: string[];
}

export interface HousingPlan {
  id: string;
  veteranId: string;
  goals: string[];
  programs: HousingProgram[];
  timeline: Date;
  notes: string;
  createdAt: Date;
}
