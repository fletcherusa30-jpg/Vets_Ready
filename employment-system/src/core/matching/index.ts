import { VeteranProfile, JobPosting, MatchResult, Skill, SkillMatchDetail, CredentialMatchDetail } from '../../../data/models/index.js';
import { calculateSkillMatch, calculateCredentialMatch, calculateLocationMatch, calculateSalaryMatch, calculateClearanceMatch } from '../scoring/index.js';

/**
 * Core Job Matching Engine
 * Matches veterans to jobs based on skills, credentials, location, salary, and clearance
 */

export interface MatchingOptions {
  skillWeight?: number;
  credentialWeight?: number;
  locationWeight?: number;
  salaryWeight?: number;
  clearanceWeight?: number;
  minMatchScore?: number;
  maxResults?: number;
}

const DEFAULT_MATCHING_OPTIONS: MatchingOptions = {
  skillWeight: 0.4,
  credentialWeight: 0.25,
  locationWeight: 0.15,
  salaryWeight: 0.1,
  clearanceWeight: 0.1,
  minMatchScore: 50,
  maxResults: 50,
};

/**
 * Match a veteran to a list of job postings
 */
export async function matchVeteranToJobs(
  veteran: VeteranProfile,
  jobs: JobPosting[],
  options: MatchingOptions = {}
): Promise<MatchResult[]> {
  const opts = { ...DEFAULT_MATCHING_OPTIONS, ...options };
  const matches: MatchResult[] = [];

  for (const job of jobs) {
    const matchResult = await matchVeteranToJob(veteran, job, opts);

    if (matchResult.matchScore >= (opts.minMatchScore || 0)) {
      matches.push(matchResult);
    }
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Apply max results limit
  const limitedMatches = matches.slice(0, opts.maxResults || matches.length);

  // Add rank to each result
  limitedMatches.forEach((match, index) => {
    match.rank = index + 1;
  });

  return limitedMatches;
}

/**
 * Match a veteran to a single job posting
 */
export async function matchVeteranToJob(
  veteran: VeteranProfile,
  job: JobPosting,
  options: MatchingOptions = {}
): Promise<MatchResult> {
  const opts = { ...DEFAULT_MATCHING_OPTIONS, ...options };

  // Calculate component scores
  const { score: skillScore, details: skillMatchDetails } = calculateSkillMatch(veteran.skills, job.requiredSkills, job.preferredSkills);
  const { score: credentialScore, details: credentialMatchDetails } = calculateCredentialMatch(veteran.credentials, job.requiredCredentials, job.preferredCredentials);
  const locationScore = calculateLocationMatch(veteran.locationPreferences, job.location, job.remoteOption);
  const salaryScore = calculateSalaryMatch(veteran.desiredSalaryRange, job.salaryRange);
  const clearanceScore = calculateClearanceMatch(veteran.clearanceLevel, veteran.clearanceStatus, job.clearanceRequired);

  // Calculate weighted overall match score
  const matchScore = Math.round(
    (skillScore * (opts.skillWeight || 0.4)) +
    (credentialScore * (opts.credentialWeight || 0.25)) +
    (locationScore * (opts.locationWeight || 0.15)) +
    (salaryScore * (opts.salaryWeight || 0.1)) +
    (clearanceScore * (opts.clearanceWeight || 0.1))
  );

  // Generate insights
  const strengths = generateStrengths(skillMatchDetails, credentialMatchDetails, locationScore, salaryScore, clearanceScore);
  const gaps = generateGaps(skillMatchDetails, credentialMatchDetails);
  const recommendations = generateRecommendations(gaps, veteran, job);

  const matchResult: MatchResult = {
    id: `match-${veteran.id}-${job.id}-${Date.now()}`,
    jobId: job.id,
    veteranId: veteran.id,
    matchScore,
    skillMatchDetails,
    credentialMatchDetails,
    skillMatchScore: skillScore,
    credentialMatchScore: credentialScore,
    locationMatchScore: locationScore,
    salaryMatchScore: salaryScore,
    clearanceMatchScore: clearanceScore,
    strengths,
    gaps,
    recommendations,
    matchedAt: new Date().toISOString(),
  };

  return matchResult;
}

/**
 * Generate strengths based on match details
 */
function generateStrengths(
  skillMatches: SkillMatchDetail[],
  credentialMatches: CredentialMatchDetail[],
  locationScore: number,
  salaryScore: number,
  clearanceScore: number
): string[] {
  const strengths: string[] = [];

  // Skill strengths
  const matchedSkills = skillMatches.filter(s => s.status === 'matched');
  if (matchedSkills.length > 0) {
    strengths.push(`Strong match on ${matchedSkills.length} key skills`);
  }

  // Credential strengths
  const matchedCredentials = credentialMatches.filter(c => c.status === 'matched');
  if (matchedCredentials.length > 0) {
    strengths.push(`Holds ${matchedCredentials.length} required certifications`);
  }

  // Location strength
  if (locationScore >= 80) {
    strengths.push('Excellent location match');
  }

  // Salary strength
  if (salaryScore >= 80) {
    strengths.push('Salary aligns with expectations');
  }

  // Clearance strength
  if (clearanceScore === 100) {
    strengths.push('Active security clearance meets requirements');
  }

  return strengths;
}

/**
 * Generate gaps based on match details
 */
function generateGaps(
  skillMatches: SkillMatchDetail[],
  credentialMatches: CredentialMatchDetail[]
): string[] {
  const gaps: string[] = [];

  // Missing skills
  const missingSkills = skillMatches.filter(s => s.status === 'missing');
  if (missingSkills.length > 0) {
    gaps.push(`Missing ${missingSkills.length} preferred skills: ${missingSkills.slice(0, 3).map(s => s.skillName).join(', ')}`);
  }

  // Missing credentials
  const missingCredentials = credentialMatches.filter(c => c.status === 'missing');
  if (missingCredentials.length > 0) {
    gaps.push(`Missing ${missingCredentials.length} required certifications`);
  }

  return gaps;
}

/**
 * Generate recommendations to improve match
 */
function generateRecommendations(
  gaps: string[],
  veteran: VeteranProfile,
  job: JobPosting
): string[] {
  const recommendations: string[] = [];

  if (gaps.length === 0) {
    recommendations.push('Excellent candidate! Apply immediately.');
    return recommendations;
  }

  // Skill-based recommendations
  const missingSkills = gaps.find(g => g.includes('skills'));
  if (missingSkills) {
    recommendations.push('Consider online courses or certifications to fill skill gaps');
  }

  // Credential-based recommendations
  const missingCredentials = gaps.find(g => g.includes('certifications'));
  if (missingCredentials) {
    recommendations.push('Explore GI Bill-eligible certification programs');
  }

  // Clearance recommendations
  if (job.clearanceRequired && job.clearanceRequired !== 'None') {
    if (!veteran.clearanceLevel || veteran.clearanceLevel === 'None') {
      if (job.canSponsorClearance) {
        recommendations.push('Employer can sponsor security clearance - emphasize military background');
      } else {
        recommendations.push('Consider roles that can sponsor security clearance first');
      }
    }
  }

  // General recommendations
  if (job.veteranFriendly) {
    recommendations.push('This employer is veteran-friendly - highlight military experience in application');
  }

  return recommendations;
}

/**
 * Batch match multiple veterans to multiple jobs
 */
export async function batchMatchVeteransToJobs(
  veterans: VeteranProfile[],
  jobs: JobPosting[],
  options: MatchingOptions = {}
): Promise<Map<string, MatchResult[]>> {
  const results = new Map<string, MatchResult[]>();

  for (const veteran of veterans) {
    const matches = await matchVeteranToJobs(veteran, jobs, options);
    results.set(veteran.id, matches);
  }

  return results;
}
