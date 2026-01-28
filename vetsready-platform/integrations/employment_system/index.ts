/**
 * Employment System Integration
 * Interfaces for querying employment matching and career services
 */

export interface EmploymentSystemIntegration {
  /**
   * Match skills to job profiles
   */
  matchSkillsToJobs(skills: string[]): Promise<JobProfile[]>;

  /**
   * Get career pathways
   */
  getCareerPathways(startRole: string, targetRole: string): Promise<CareerStep[]>;

  /**
   * Translate military experience
   */
  translateMilitaryExperience(mosCode: string): Promise<TranslatedExperience>;

  /**
   * Get industry insights
   */
  getIndustryInsights(industry: string): Promise<IndustryData>;

  /**
   * Salary information
   */
  getSalaryData(role: string, location: string): Promise<SalaryInfo>;
}

export interface JobProfile {
  title: string;
  industry: string;
  requiredSkills: string[];
  optionalSkills: string[];
  typicalSalary: number;
  demandLevel: string;
}

export interface CareerStep {
  order: number;
  role: string;
  description: string;
  skills: string[];
  duration: string;
}

export interface TranslatedExperience {
  civilianRoles: string[];
  skills: string[];
  industries: string[];
}

export interface IndustryData {
  name: string;
  growthRate: number;
  demandedSkills: string[];
  averageSalary: number;
  veteranFriendly: boolean;
}

export interface SalaryInfo {
  role: string;
  location: string;
  median: number;
  min: number;
  max: number;
  veteranPremium?: number;
}
