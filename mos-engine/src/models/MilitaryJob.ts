import { z } from 'zod';

/**
 * Unified schema for all military jobs across all branches
 */
export const MilitaryJobSchema = z.object({
  // Core identifiers
  id: z.string().describe('MOS, AFSC, Rating, or NEC code'),
  branch: z.enum(['Army', 'Marines', 'Navy', 'Air Force', 'Coast Guard', 'Space Force']),
  category: z.string().describe('Functional area (e.g., Infantry, Aviation, Medical)'),

  // Job details
  title: z.string().describe('Official military job title'),
  description: z.string().describe('Plain-language job description'),

  // Metadata
  source: z.string().describe('Data source URL or "Manual"'),
  lastVerified: z.string().datetime().describe('ISO 8601 date of last verification'),
  status: z.enum(['active', 'retired', 'unknown']),

  // Skills and qualifications
  skills: z.array(z.string()).describe('Civilian-translatable hard skills'),
  softSkills: z.array(z.string()).describe('Leadership, communication, teamwork, etc.'),
  certifications: z.array(z.string()).describe('Relevant civilian certifications'),

  // Career mapping
  civilianMatches: z.array(z.object({
    title: z.string(),
    socCode: z.string().optional(),
    industry: z.string(),
    matchScore: z.number().min(0).max(100).optional(),
  })).describe('Equivalent civilian job titles'),

  // Resume generation
  resumeBullets: z.array(z.string()).describe('Pre-generated resume phrases'),
  impactExamples: z.array(z.string()).describe('Quantifiable achievement examples'),
  keywords: z.array(z.string()).describe('ATS-optimized keywords'),

  // Experience context
  typicalDuration: z.object({
    min: z.number(),
    max: z.number(),
    unit: z.enum(['months', 'years']),
  }).optional().describe('Typical time in this role'),

  rankRange: z.object({
    min: z.string(),
    max: z.string(),
  }).optional().describe('Typical rank range for this MOS/AFSC'),

  // Additional metadata
  securityClearance: z.enum(['None', 'Confidential', 'Secret', 'Top Secret', 'TS/SCI']).optional(),
  deploymentLikelihood: z.enum(['Low', 'Medium', 'High']).optional(),
});

export type MilitaryJob = z.infer<typeof MilitaryJobSchema>;

/**
 * Simplified schema for raw data ingestion
 */
export const RawJobDataSchema = z.object({
  id: z.string(),
  branch: z.string(),
  title: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export type RawJobData = z.infer<typeof RawJobDataSchema>;

/**
 * Schema for update reports
 */
export const UpdateReportSchema = z.object({
  timestamp: z.string().datetime(),
  added: z.array(z.string()),
  removed: z.array(z.string()),
  changed: z.array(z.object({
    id: z.string(),
    field: z.string(),
    oldValue: z.string(),
    newValue: z.string(),
  })),
  summary: z.object({
    totalJobs: z.number(),
    addedCount: z.number(),
    removedCount: z.number(),
    changedCount: z.number(),
  }),
});

export type UpdateReport = z.infer<typeof UpdateReportSchema>;
