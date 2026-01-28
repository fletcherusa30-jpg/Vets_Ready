/**
 * Job Match Engine
 * Advanced job matching using profile, skills, location, and preferences
 */

import { extractAllSkills, type MilitarySkill } from './mosToSkills';
import { matchJobsToMOS, type JobOpportunity } from './mosToJobs';

export interface JobMatchCriteria {
  mosCode: string;
  branch: string;
  yearsOfService: number;
  location?: string;
  targetSalary?: number;
  clearance?: 'Confidential' | 'Secret' | 'Top Secret' | 'TS/SCI';
  willingToRelocate: boolean;
  preferredIndustries?: string[];
  jobType?: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
}

export interface JobMatch {
  job: JobOpportunity;
  matchScore: number;
  matchReasons: string[];
  gaps: string[];
  recommendations: string[];
}

/**
 * Generate comprehensive job matches with explanations
 */
export function generateJobMatches(
  profile: JobMatchCriteria,
  skills: MilitarySkill[]
): JobMatch[] {
  // Get base jobs from MOS
  const baseJobs = matchJobsToMOS(profile.mosCode, profile.branch, profile.location);

  // Enhance matching with detailed analysis
  const matches: JobMatch[] = baseJobs.map(job => {
    const match = analyzeJobMatch(job, profile, skills);
    return match;
  });

  // Sort by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Analyze individual job match
 */
function analyzeJobMatch(
  job: JobOpportunity,
  profile: JobMatchCriteria,
  skills: MilitarySkill[]
): JobMatch {
  const matchReasons: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];
  let baseScore = job.matchScore;

  // Analyze skills match
  const skillNames = skills.map(s => s.name.toLowerCase());
  const requiredSkillsMatch = job.requiredSkills.filter(req =>
    skillNames.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
  );

  if (requiredSkillsMatch.length > 0) {
    matchReasons.push(`You have ${requiredSkillsMatch.length} of ${job.requiredSkills.length} required skills`);
  }

  const missingRequired = job.requiredSkills.filter(req =>
    !skillNames.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
  );

  if (missingRequired.length > 0) {
    gaps.push(`Missing required skills: ${missingRequired.join(', ')}`);
    recommendations.push(`Consider training in: ${missingRequired.slice(0, 2).join(', ')}`);
  }

  // Location match
  if (profile.location) {
    if (job.location === 'Remote' || job.location.toLowerCase().includes(profile.location.toLowerCase())) {
      matchReasons.push('Location matches your preference');
      baseScore += 5;
    } else if (!profile.willingToRelocate) {
      baseScore -= 15;
      gaps.push('Location requires relocation');
    }
  }

  // Salary match
  if (profile.targetSalary) {
    if (job.salaryRange.max >= profile.targetSalary) {
      matchReasons.push('Salary meets your target');
      baseScore += 5;
    } else {
      gaps.push(`Salary below target ($${job.salaryRange.max.toLocaleString()} vs $${profile.targetSalary.toLocaleString()})`);
      baseScore -= 10;
    }
  }

  // Clearance match
  if (profile.clearance && job.clearanceRequired) {
    const clearanceLevels = ['Confidential', 'Secret', 'Top Secret', 'TS/SCI'];
    const profileLevel = clearanceLevels.indexOf(profile.clearance);
    const jobLevel = clearanceLevels.indexOf(job.clearanceRequired);

    if (profileLevel >= jobLevel) {
      matchReasons.push(`Your ${profile.clearance} clearance qualifies for this role`);
      baseScore += 15; // Clearance is very valuable
    } else {
      gaps.push(`Requires ${job.clearanceRequired} clearance (you have ${profile.clearance})`);
    }
  } else if (!profile.clearance && job.clearanceRequired) {
    gaps.push(`Requires ${job.clearanceRequired} clearance`);
    recommendations.push('Consider roles that sponsor clearance or get clearance through current employer');
  }

  // Veteran-friendly bonus
  if (job.veteranFriendly) {
    matchReasons.push('Company has veteran hiring program');
  }

  // Experience level
  if (profile.yearsOfService >= 4) {
    matchReasons.push('Your military experience demonstrates work ethic and discipline');
  }

  // Job type preference
  if (profile.jobType === 'Remote' && job.location === 'Remote') {
    matchReasons.push('This is a remote position');
    baseScore += 10;
  }

  // Final score adjustments
  const finalScore = Math.max(0, Math.min(100, baseScore));

  return {
    job,
    matchScore: finalScore,
    matchReasons,
    gaps,
    recommendations,
  };
}

/**
 * Get top job matches
 */
export function getTopMatches(matches: JobMatch[], count: number = 10): JobMatch[] {
  return matches.slice(0, count);
}

/**
 * Get matches by score tier
 */
export function getMatchesByTier(matches: JobMatch[]): {
  excellent: JobMatch[];
  good: JobMatch[];
  fair: JobMatch[];
} {
  return {
    excellent: matches.filter(m => m.matchScore >= 80),
    good: matches.filter(m => m.matchScore >= 60 && m.matchScore < 80),
    fair: matches.filter(m => m.matchScore >= 40 && m.matchScore < 60),
  };
}

/**
 * Generate job search strategy
 */
export function generateJobSearchStrategy(
  profile: JobMatchCriteria,
  matches: JobMatch[]
): {
  immediateActions: string[];
  shortTerm: string[];
  longTerm: string[];
  prioritySkills: string[];
} {
  const allGaps = matches.flatMap(m => m.gaps);
  const commonGaps = findCommonGaps(allGaps);

  const strategy = {
    immediateActions: [
      'Update resume with military-to-civilian skill translations',
      'Set up job alerts on veteran job boards',
      'Connect with veterans in target industries on LinkedIn',
    ],
    shortTerm: [
      'Apply to top 5 job matches this week',
      'Attend virtual job fair or veteran hiring event',
      'Request informational interviews with hiring managers',
    ],
    longTerm: [
      'Complete recommended certifications',
      'Build portfolio or home lab for technical roles',
      'Consider additional education if career path requires degree',
    ],
    prioritySkills: commonGaps.slice(0, 3),
  };

  // Customize based on clearance
  if (profile.clearance) {
    strategy.immediateActions.push('Highlight security clearance prominently on resume');
    strategy.shortTerm.push('Search for cleared jobs on ClearanceJobs.com');
  }

  return strategy;
}

/**
 * Find common gaps across job matches
 */
function findCommonGaps(gaps: string[]): string[] {
  const gapCounts: Record<string, number> = {};

  gaps.forEach(gap => {
    // Extract skill name from gap message
    const skillMatch = gap.match(/Missing required skills?: (.+)/);
    if (skillMatch) {
      const skills = skillMatch[1].split(',').map(s => s.trim());
      skills.forEach(skill => {
        gapCounts[skill] = (gapCounts[skill] || 0) + 1;
      });
    }
  });

  // Sort by frequency
  return Object.entries(gapCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);
}
