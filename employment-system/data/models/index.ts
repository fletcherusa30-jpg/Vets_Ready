import { z } from 'zod';

/**
 * Core data models for the VetsReady Employment System
 */

// ==================== VETERAN PROFILE ====================

export const DeploymentSchema = z.object({
  location: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  duration: z.number().describe('Duration in months'),
  combatZone: z.boolean().optional(),
});

export const BranchServiceRecordSchema = z.object({
  branch: z.enum(['Army', 'Marines', 'Navy', 'Air Force', 'Coast Guard', 'Space Force']),
  mosOrAfscOrRating: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  deployments: z.array(DeploymentSchema).optional(),
  rankAtSeparation: z.string(),
  honorableDischarge: z.boolean().optional(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  level: z.enum(['basic', 'intermediate', 'advanced', 'expert']),
  source: z.enum(['MOS', 'self-reported', 'inferred', 'training', 'certification']),
  yearsExperience: z.number().optional(),
  keywords: z.array(z.string()).optional(),
});

export const CredentialSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['certification', 'license', 'degree', 'apprenticeship', 'training']),
  provider: z.string(),
  status: z.enum(['planned', 'in-progress', 'completed', 'expired']),
  dateCompleted: z.string().optional(),
  expirationDate: z.string().optional(),
  renewalDate: z.string().optional(),
  credentialNumber: z.string().optional(),
});

export const EmploymentGoalSchema = z.object({
  id: z.string(),
  type: z.enum(['employment', 'entrepreneurship', 'education', 'federal']),
  targetRole: z.string().optional(),
  targetIndustry: z.string().optional(),
  targetSalary: z.number().optional(),
  timeline: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['active', 'paused', 'completed']),
});

export const VeteranProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),

  // Military background
  branchHistory: z.array(BranchServiceRecordSchema),
  primaryBranch: z.string().optional(),
  yearsOfService: z.number(),

  // Skills and qualifications
  skills: z.array(SkillSchema),
  softSkills: z.array(z.string()).optional(),
  credentials: z.array(CredentialSchema),

  // Career preferences
  interests: z.array(z.string()),
  targetIndustries: z.array(z.string()),
  targetRoles: z.array(z.string()),
  locationPreferences: z.array(z.string()),
  remotePreference: z.enum(['required', 'preferred', 'no-preference', 'not-desired']).optional(),
  travelWillingness: z.enum(['none', 'occasional', 'frequent', 'constant']).optional(),

  // Security and special considerations
  clearanceLevel: z.enum(['None', 'Confidential', 'Secret', 'Top Secret', 'TS/SCI']).optional(),
  clearanceStatus: z.enum(['active', 'expired', 'none']).optional(),
  disabilityStatus: z.string().optional(),
  disabilityRating: z.number().optional(),
  accommodationsNeeded: z.array(z.string()).optional(),

  // Employment goals and status
  employmentGoals: z.array(EmploymentGoalSchema),
  currentEmploymentStatus: z.enum(['unemployed', 'employed', 'underemployed', 'student', 'entrepreneur']).optional(),
  desiredSalaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default('USD'),
  }).optional(),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().optional(),
});

export type Deployment = z.infer<typeof DeploymentSchema>;
export type BranchServiceRecord = z.infer<typeof BranchServiceRecordSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Credential = z.infer<typeof CredentialSchema>;
export type EmploymentGoal = z.infer<typeof EmploymentGoalSchema>;
export type VeteranProfile = z.infer<typeof VeteranProfileSchema>;

// ==================== JOB POSTING ====================

export const SalaryRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  currency: z.string().default('USD'),
  period: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly']).default('yearly'),
});

export const JobPostingSchema = z.object({
  id: z.string(),
  title: z.string(),
  employer: z.string(),
  employerId: z.string().optional(),

  // Location
  location: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('USA'),
  remoteOption: z.boolean(),
  hybrid: z.boolean().optional(),

  // Compensation
  salaryRange: SalaryRangeSchema.optional(),
  benefits: z.array(z.string()).optional(),

  // Requirements
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()).optional(),
  requiredCredentials: z.array(z.string()).optional(),
  preferredCredentials: z.array(z.string()).optional(),
  yearsExperience: z.number().optional(),
  educationLevel: z.string().optional(),

  // Security
  clearanceRequired: z.enum(['None', 'Confidential', 'Secret', 'Top Secret', 'TS/SCI']).optional(),
  canSponsorClearance: z.boolean().optional(),

  // Veteran specific
  veteranFriendly: z.boolean(),
  veteranPreference: z.boolean().optional(),
  militarySkillsTranslated: z.boolean().optional(),

  // Job details
  jobType: z.enum(['full-time', 'part-time', 'contract', 'temporary', 'internship', 'apprenticeship']),
  industry: z.string(),
  description: z.string(),
  responsibilities: z.array(z.string()).optional(),

  // Source
  source: z.string(),
  sourceUrl: z.string().url().optional(),
  postedDate: z.string().datetime(),
  applicationDeadline: z.string().datetime().optional(),

  // Metadata
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SalaryRange = z.infer<typeof SalaryRangeSchema>;
export type JobPosting = z.infer<typeof JobPostingSchema>;

// ==================== MATCH RESULT ====================

export const SkillMatchDetailSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  status: z.enum(['matched', 'partial', 'missing', 'transferable']),
  weight: z.number().min(0).max(1),
  matchReason: z.string().optional(),
  veteranLevel: z.string().optional(),
  requiredLevel: z.string().optional(),
});

export const CredentialMatchDetailSchema = z.object({
  credentialId: z.string(),
  credentialName: z.string(),
  status: z.enum(['matched', 'missing', 'alternative-available', 'in-progress']),
  weight: z.number().min(0).max(1),
  alternative: z.string().optional(),
});

export const MatchResultSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  veteranId: z.string(),
  matchScore: z.number().min(0).max(100),

  // Detailed match breakdown
  skillMatchDetails: z.array(SkillMatchDetailSchema),
  credentialMatchDetails: z.array(CredentialMatchDetailSchema),

  // Category scores
  skillMatchScore: z.number().min(0).max(100),
  credentialMatchScore: z.number().min(0).max(100),
  locationMatchScore: z.number().min(0).max(100),
  salaryMatchScore: z.number().min(0).max(100).optional(),
  clearanceMatchScore: z.number().min(0).max(100).optional(),

  // Insights
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
  notes: z.array(z.string()).optional(),

  // Metadata
  matchedAt: z.string().datetime(),
  rank: z.number().optional(),
});

export type SkillMatchDetail = z.infer<typeof SkillMatchDetailSchema>;
export type CredentialMatchDetail = z.infer<typeof CredentialMatchDetailSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;

// ==================== CAREER PATH ====================

export const CareerPathSchema = z.object({
  id: z.string(),
  title: z.string(),
  industry: z.string(),
  description: z.string(),

  // Entry requirements
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()).optional(),
  requiredCredentials: z.array(z.string()).optional(),
  educationLevel: z.string().optional(),

  // Career progression
  entryLevelRoles: z.array(z.string()),
  midLevelRoles: z.array(z.string()),
  seniorLevelRoles: z.array(z.string()),

  // Outlook
  salaryRange: SalaryRangeSchema,
  growthOutlook: z.enum(['declining', 'stable', 'growing', 'high-growth']),
  demandLevel: z.enum(['low', 'moderate', 'high', 'very-high']),

  // Fit indicators
  physicalDemands: z.enum(['low', 'moderate', 'high']).optional(),
  stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
  travelRequirement: z.enum(['none', 'occasional', 'frequent', 'constant']).optional(),

  // Metadata
  relevantMOS: z.array(z.string()).optional(),
  veteranFit: z.number().min(0).max(100).optional(),
});

export type CareerPath = z.infer<typeof CareerPathSchema>;
