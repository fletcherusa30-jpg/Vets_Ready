import { VeteranProfile, JobPosting, MatchResult } from '../../../data/models/index.js';
import { matchVeteranToJobs, MatchingOptions } from '../../core/matching/index.js';

/**
 * Job Matching Service
 * Finds and ranks job opportunities for veterans
 */

export interface JobSearchCriteria {
  industries?: string[];
  locations?: string[];
  salaryMin?: number;
  salaryMax?: number;
  remoteOnly?: boolean;
  veteranFriendlyOnly?: boolean;
  clearanceRequired?: string;
  keywords?: string[];
  limit?: number;
}

/**
 * Search for jobs matching veteran profile and criteria
 */
export async function searchJobs(
  veteran: VeteranProfile,
  criteria: JobSearchCriteria = {}
): Promise<MatchResult[]> {
  // Get all available jobs (in production, this would be a database query)
  let jobs = await getAllJobs();

  // Filter by criteria
  jobs = filterJobsByCriteria(jobs, criteria);

  // Match veteran to filtered jobs
  const matchOptions: MatchingOptions = {
    minMatchScore: 50,
    maxResults: criteria.limit || 50
  };

  const matches = await matchVeteranToJobs(veteran, jobs, matchOptions);

  return matches;
}

/**
 * Filter jobs by search criteria
 */
function filterJobsByCriteria(jobs: JobPosting[], criteria: JobSearchCriteria): JobPosting[] {
  return jobs.filter(job => {
    // Industry filter
    if (criteria.industries && criteria.industries.length > 0) {
      if (!job.industry || !criteria.industries.includes(job.industry)) {
        return false;
      }
    }

    // Location filter
    if (criteria.locations && criteria.locations.length > 0) {
      const matchesLocation = criteria.locations.some(loc =>
        job.location.toLowerCase().includes(loc.toLowerCase())
      );
      if (!matchesLocation && !job.remoteOption) {
        return false;
      }
    }

    // Remote filter
    if (criteria.remoteOnly && !job.remoteOption) {
      return false;
    }

    // Veteran-friendly filter
    if (criteria.veteranFriendlyOnly && !job.veteranFriendly) {
      return false;
    }

    // Salary filter
    if (criteria.salaryMin && job.salaryRange && job.salaryRange.max < criteria.salaryMin) {
      return false;
    }
    if (criteria.salaryMax && job.salaryRange && job.salaryRange.min > criteria.salaryMax) {
      return false;
    }

    // Clearance filter
    if (criteria.clearanceRequired) {
      if (job.clearanceRequired !== criteria.clearanceRequired) {
        return false;
      }
    }

    // Keyword filter
    if (criteria.keywords && criteria.keywords.length > 0) {
      const jobText = `${job.title} ${job.description} ${job.requiredSkills.join(' ')}`.toLowerCase();
      const hasKeyword = criteria.keywords.some(kw => jobText.includes(kw.toLowerCase()));
      if (!hasKeyword) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get job recommendations based on veteran's MOS/AFSC
 */
export async function getRecommendedJobs(
  veteran: VeteranProfile,
  limit: number = 10
): Promise<MatchResult[]> {
  const jobs = await getAllJobs();

  // Filter to jobs that match veteran's MOS/background
  const relevantJobs = jobs.filter(job => {
    // Check if job has MOS mapping
    if (job.relevantMOS && job.relevantMOS.length > 0) {
      return veteran.branchHistory.some(bh =>
        job.relevantMOS!.includes(bh.mosOrAfscOrRating)
      );
    }
    return false;
  });

  // Match and rank
  const matches = await matchVeteranToJobs(veteran, relevantJobs, {
    minMatchScore: 60,
    maxResults: limit
  });

  return matches;
}

/**
 * Get similar jobs to a given job posting
 */
export async function getSimilarJobs(
  jobId: string,
  limit: number = 5
): Promise<JobPosting[]> {
  const allJobs = await getAllJobs();
  const targetJob = allJobs.find(j => j.id === jobId);

  if (!targetJob) {
    return [];
  }

  // Find jobs with similar characteristics
  const similar = allJobs
    .filter(j => j.id !== jobId)
    .map(job => ({
      job,
      similarity: calculateJobSimilarity(targetJob, job)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.job);

  return similar;
}

/**
 * Calculate similarity between two jobs
 */
function calculateJobSimilarity(job1: JobPosting, job2: JobPosting): number {
  let score = 0;

  // Same industry (30 points)
  if (job1.industry === job2.industry) {
    score += 30;
  }

  // Similar salary range (20 points)
  if (job1.salaryRange && job2.salaryRange) {
    const overlap = calculateSalaryOverlap(job1.salaryRange, job2.salaryRange);
    score += (overlap / 100) * 20;
  }

  // Overlapping skills (30 points)
  const skill1Set = new Set(job1.requiredSkills);
  const skill2Set = new Set(job2.requiredSkills);
  const overlap = [...skill1Set].filter(s => skill2Set.has(s)).length;
  const total = new Set([...skill1Set, ...skill2Set]).size;
  score += (overlap / total) * 30;

  // Same clearance requirement (10 points)
  if (job1.clearanceRequired === job2.clearanceRequired) {
    score += 10;
  }

  // Same remote option (10 points)
  if (job1.remoteOption === job2.remoteOption) {
    score += 10;
  }

  return score;
}

function calculateSalaryOverlap(range1: any, range2: any): number {
  const overlapStart = Math.max(range1.min, range2.min);
  const overlapEnd = Math.min(range1.max, range2.max);

  if (overlapEnd < overlapStart) return 0;

  const overlapSize = overlapEnd - overlapStart;
  const avgSize = ((range1.max - range1.min) + (range2.max - range2.min)) / 2;

  return Math.min(100, (overlapSize / avgSize) * 100);
}

/**
 * Save a job for later
 */
export async function saveJob(
  veteranId: string,
  jobId: string
): Promise<void> {
  // In production, save to database
  console.log(`Saved job ${jobId} for veteran ${veteranId}`);
}

/**
 * Track job application
 */
export interface JobApplication {
  id: string;
  veteranId: string;
  jobId: string;
  appliedAt: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  notes?: string;
}

export async function trackApplication(
  veteranId: string,
  jobId: string,
  status: JobApplication['status']
): Promise<JobApplication> {
  const application: JobApplication = {
    id: `app-${veteranId}-${jobId}-${Date.now()}`,
    veteranId,
    jobId,
    appliedAt: new Date().toISOString(),
    status
  };

  // In production, save to database
  console.log(`Tracked application:`, application);

  return application;
}

/**
 * Get all jobs (mock data - replace with database query in production)
 */
async function getAllJobs(): Promise<JobPosting[]> {
  return [
    {
      id: 'job-1',
      title: 'Cybersecurity Analyst',
      companyName: 'TechSecure Inc.',
      industry: 'Information Technology',
      location: 'San Diego, CA',
      remoteOption: true,
      jobType: 'full-time',
      salaryRange: { min: 75000, max: 110000, currency: 'USD', period: 'yearly' },
      description: 'Protect our systems from cyber threats',
      requiredSkills: ['Network Security', 'Incident Response', 'SIEM'],
      preferredSkills: ['Penetration Testing', 'Python'],
      requiredCredentials: ['Security+'],
      preferredCredentials: ['CEH', 'CISSP'],
      clearanceRequired: 'Secret',
      veteranFriendly: true,
      canSponsorClearance: false,
      relevantMOS: ['25D', '17C', '35Q', 'CTN', '1B4X1'],
      postedDate: new Date().toISOString()
    },
    {
      id: 'job-2',
      title: 'Logistics Coordinator',
      companyName: 'GlobalSupply Co.',
      industry: 'Supply Chain',
      location: 'Norfolk, VA',
      remoteOption: false,
      jobType: 'full-time',
      salaryRange: { min: 55000, max: 75000, currency: 'USD', period: 'yearly' },
      description: 'Coordinate supply chain operations',
      requiredSkills: ['Inventory Management', 'Logistics', 'Warehouse Operations'],
      preferredSkills: ['SAP', 'Lean Six Sigma'],
      clearanceRequired: 'None',
      veteranFriendly: true,
      relevantMOS: ['88N', '92A', '92Y', '3043', 'LS', 'SK'],
      postedDate: new Date().toISOString()
    },
    {
      id: 'job-3',
      title: 'Project Manager',
      companyName: 'Defense Contractor LLC',
      industry: 'Defense',
      location: 'Washington, DC',
      remoteOption: false,
      jobType: 'full-time',
      salaryRange: { min: 85000, max: 120000, currency: 'USD', period: 'yearly' },
      description: 'Manage defense projects',
      requiredSkills: ['Project Management', 'Leadership', 'Risk Management'],
      preferredSkills: ['Agile', 'PMP'],
      requiredCredentials: ['PMP'],
      clearanceRequired: 'Top Secret',
      canSponsorClearance: true,
      veteranFriendly: true,
      relevantMOS: ['All leadership MOSs'],
      postedDate: new Date().toISOString()
    }
  ];
}
