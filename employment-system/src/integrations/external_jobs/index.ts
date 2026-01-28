/**
 * External Jobs API Integration
 * Fetches job postings from external sources (Indeed, LinkedIn, USAJobs, etc.)
 */

import { JobPosting } from '../../../data/models/index.js';

export interface ExternalJobSource {
  name: string;
  apiKey?: string;
  baseUrl: string;
  rateLimit: number;
}

/**
 * Fetch jobs from Indeed API
 */
export async function fetchIndeedJobs(
  keywords: string,
  location: string,
  limit: number = 50
): Promise<JobPosting[]> {
  // In production, make API call to Indeed
  // For now, return mock data
  return getMockExternalJobs('Indeed', keywords, location, limit);
}

/**
 * Fetch jobs from LinkedIn API
 */
export async function fetchLinkedInJobs(
  keywords: string,
  location: string,
  limit: number = 50
): Promise<JobPosting[]> {
  // In production, make API call to LinkedIn
  return getMockExternalJobs('LinkedIn', keywords, location, limit);
}

/**
 * Fetch jobs from USAJobs (federal positions)
 */
export async function fetchUSAJobs(
  keywords: string,
  location: string,
  limit: number = 50
): Promise<JobPosting[]> {
  // In production, make API call to USAJobs
  return getMockExternalJobs('USAJobs', keywords, location, limit);
}

/**
 * Fetch veteran-specific job boards
 */
export async function fetchVeteranJobBoards(
  keywords: string,
  location: string,
  limit: number = 50
): Promise<JobPosting[]> {
  // Sources: Hire Heroes USA, RecruitMilitary, etc.
  return getMockExternalJobs('Veteran Job Boards', keywords, location, limit);
}

/**
 * Aggregate jobs from all sources
 */
export async function aggregateJobsFromAllSources(
  keywords: string,
  location: string
): Promise<JobPosting[]> {
  const results = await Promise.all([
    fetchIndeedJobs(keywords, location, 20),
    fetchLinkedInJobs(keywords, location, 20),
    fetchUSAJobs(keywords, location, 10),
    fetchVeteranJobBoards(keywords, location, 10)
  ]);

  // Flatten and deduplicate
  const allJobs = results.flat();
  return deduplicateJobs(allJobs);
}

/**
 * Deduplicate job postings
 */
function deduplicateJobs(jobs: JobPosting[]): JobPosting[] {
  const seen = new Set<string>();
  const unique: JobPosting[] = [];

  for (const job of jobs) {
    const key = `${job.companyName}-${job.title}-${job.location}`.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  return unique;
}

/**
 * Mock external jobs (replace with real API calls)
 */
function getMockExternalJobs(
  source: string,
  keywords: string,
  location: string,
  limit: number
): JobPosting[] {
  const mockJobs: JobPosting[] = [];

  for (let i = 0; i < Math.min(limit, 5); i++) {
    mockJobs.push({
      id: `external-${source}-${i}`,
      title: `${keywords} - Position ${i + 1}`,
      companyName: `${source} Company ${i + 1}`,
      industry: 'Technology',
      location,
      remoteOption: i % 2 === 0,
      jobType: 'full-time',
      salaryRange: { min: 60000 + (i * 10000), max: 100000 + (i * 15000), currency: 'USD', period: 'yearly' },
      description: `${keywords} position from ${source}`,
      requiredSkills: keywords.split(' '),
      preferredSkills: [],
      veteranFriendly: source === 'Veteran Job Boards',
      postedDate: new Date().toISOString(),
      externalUrl: `https://${source.toLowerCase()}.com/job/${i}`
    });
  }

  return mockJobs;
}

/**
 * Search clearance jobs
 */
export async function fetchClearanceJobs(
  clearanceLevel: string,
  keywords: string,
  limit: number = 50
): Promise<JobPosting[]> {
  // In production, call ClearanceJobs.com API
  const mockJobs: JobPosting[] = [];

  for (let i = 0; i < Math.min(limit, 3); i++) {
    mockJobs.push({
      id: `clearance-${i}`,
      title: `${keywords} (${clearanceLevel} Clearance Required)`,
      companyName: `Defense Contractor ${i + 1}`,
      industry: 'Defense',
      location: 'Washington, DC',
      remoteOption: false,
      jobType: 'full-time',
      salaryRange: { min: 90000 + (i * 20000), max: 140000 + (i * 25000), currency: 'USD', period: 'yearly' },
      description: `${keywords} position requiring ${clearanceLevel} clearance`,
      requiredSkills: keywords.split(' '),
      preferredSkills: [],
      clearanceRequired: clearanceLevel,
      veteranFriendly: true,
      postedDate: new Date().toISOString()
    });
  }

  return mockJobs;
}
