/**
 * Employment Domain Service
 * Career discovery, resume tools, job matching
 */

export interface CareerProfile {
  id: string;
  veteranId: string;
  targetRole: string;
  keySkills: string[];
  experienceLevel: string;
  preferredIndustries: string[];
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number; // 0-100
  skillsMatched: string[];
  skillsGap: string[];
  salaryRange: { min: number; max: number };
  url: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  template: string;
  militaryTranslated: boolean;
  format: 'chronological' | 'functional' | 'combination';
}

export interface SkillTranslation {
  militaryRole: string;
  civilianiSkills: string[];
  jobTitles: string[];
  industries: string[];
}

export interface IEmploymentService {
  // Career Discovery
  discoverCareers(veteranId: string): Promise<string[]>;
  getCareerPathways(targetRole: string): Promise<CareerPathway[]>;
  assessSkills(veteranId: string): Promise<SkillAssessment>;

  // Job Matching
  findMatches(veteranId: string): Promise<JobMatch[]>;
  searchJobs(query: string, filters?: JobFilter): Promise<JobMatch[]>;
  getJobDetails(jobId: string): Promise<JobDetails>;

  // Resume Tools
  generateResume(veteranId: string, templateId: string): Promise<string>;
  translateMilitaryExperience(veteranId: string): Promise<SkillTranslation>;
  improveResume(veteranId: string, resume: string): Promise<ResumeFeedback>;

  // Networking
  findMentors(veteranId: string, industry: string): Promise<Mentor[]>;
  connectToResourceCenter(): Promise<ResourceCenter>;
}

export interface CareerPathway {
  role: string;
  steps: PathwayStep[];
  estimatedTimelineMonths: number;
  requiredSkills: string[];
  trainingResources: string[];
}

export interface PathwayStep {
  order: number;
  title: string;
  description: string;
  resources: string[];
}

export interface SkillAssessment {
  militarySkills: string[];
  translatedCivilianSkills: string[];
  marketableLevels: { skill: string; level: string }[];
  gaps: string[];
}

export interface JobFilter {
  location?: string;
  industry?: string;
  salaryMin?: number;
  salaryMax?: number;
  remote?: boolean;
  veteranPreferred?: boolean;
}

export interface JobDetails {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
}

export interface ResumeFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  availability: string;
  contactUrl: string;
}

export interface ResourceCenter {
  name: string;
  location: string;
  services: string[];
  phone: string;
  website: string;
}
