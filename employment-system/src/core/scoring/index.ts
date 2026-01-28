import { Skill, Credential, SalaryRange, SkillMatchDetail, CredentialMatchDetail } from '../../../data/models/index.js';

/**
 * Scoring algorithms for job matching
 */

// ==================== SKILL MATCHING ====================

export interface SkillMatchResult {
  score: number;
  details: SkillMatchDetail[];
}

/**
 * Calculate skill match score between veteran skills and job requirements
 */
export function calculateSkillMatch(
  veteranSkills: Skill[],
  requiredSkills: string[],
  preferredSkills: string[] = []
): SkillMatchResult {
  const details: SkillMatchDetail[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;

  // Required skills (higher weight)
  for (const requiredSkill of requiredSkills) {
    const weight = 1.0;
    totalWeight += weight;

    const match = findSkillMatch(veteranSkills, requiredSkill);

    if (match.status === 'matched' || match.status === 'transferable') {
      matchedWeight += weight;
    } else if (match.status === 'partial') {
      matchedWeight += weight * 0.5;
    }

    details.push({
      skillId: `req-${requiredSkill}`,
      skillName: requiredSkill,
      status: match.status,
      weight,
      matchReason: match.reason,
      veteranLevel: match.veteranLevel,
      requiredLevel: 'required',
    });
  }

  // Preferred skills (lower weight)
  for (const preferredSkill of preferredSkills) {
    const weight = 0.5;
    totalWeight += weight;

    const match = findSkillMatch(veteranSkills, preferredSkill);

    if (match.status === 'matched' || match.status === 'transferable') {
      matchedWeight += weight;
    } else if (match.status === 'partial') {
      matchedWeight += weight * 0.5;
    }

    details.push({
      skillId: `pref-${preferredSkill}`,
      skillName: preferredSkill,
      status: match.status,
      weight,
      matchReason: match.reason,
      veteranLevel: match.veteranLevel,
      requiredLevel: 'preferred',
    });
  }

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

  return { score, details };
}

interface SkillMatchInfo {
  status: 'matched' | 'partial' | 'missing' | 'transferable';
  reason?: string;
  veteranLevel?: string;
}

function findSkillMatch(veteranSkills: Skill[], targetSkill: string): SkillMatchInfo {
  const normalizedTarget = targetSkill.toLowerCase().trim();

  // Exact match
  for (const skill of veteranSkills) {
    if (skill.name.toLowerCase().trim() === normalizedTarget) {
      return {
        status: 'matched',
        reason: 'Exact match',
        veteranLevel: skill.level,
      };
    }
  }

  // Partial match (contains keyword)
  for (const skill of veteranSkills) {
    if (skill.name.toLowerCase().includes(normalizedTarget) || normalizedTarget.includes(skill.name.toLowerCase())) {
      return {
        status: 'partial',
        reason: 'Related skill',
        veteranLevel: skill.level,
      };
    }
  }

  // Transferable skills check (common military-to-civilian mappings)
  const transferableMatch = checkTransferableSkill(veteranSkills, normalizedTarget);
  if (transferableMatch) {
    return transferableMatch;
  }

  return { status: 'missing' };
}

function checkTransferableSkill(veteranSkills: Skill[], targetSkill: string): SkillMatchInfo | null {
  // Map military skills to civilian equivalents
  const transferableMap: Record<string, string[]> = {
    'leadership': ['team leadership', 'squad leadership', 'management', 'supervision'],
    'project management': ['mission planning', 'operations coordination', 'logistics'],
    'communication': ['briefing', 'reporting', 'coordination'],
    'problem solving': ['troubleshooting', 'tactical planning', 'adaptability'],
    'security': ['security operations', 'force protection', 'access control'],
    'it support': ['network administration', 'troubleshooting', 'help desk'],
  };

  for (const [civilianSkill, militaryEquivalents] of Object.entries(transferableMap)) {
    if (targetSkill.includes(civilianSkill)) {
      for (const militarySkill of militaryEquivalents) {
        const match = veteranSkills.find(s => s.name.toLowerCase().includes(militarySkill));
        if (match) {
          return {
            status: 'transferable',
            reason: `Military "${match.name}" transfers to "${civilianSkill}"`,
            veteranLevel: match.level,
          };
        }
      }
    }
  }

  return null;
}

// ==================== CREDENTIAL MATCHING ====================

export interface CredentialMatchResult {
  score: number;
  details: CredentialMatchDetail[];
}

export function calculateCredentialMatch(
  veteranCredentials: Credential[],
  requiredCredentials: string[] = [],
  preferredCredentials: string[] = []
): CredentialMatchResult {
  const details: CredentialMatchDetail[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;

  // Required credentials
  for (const requiredCred of requiredCredentials) {
    const weight = 1.0;
    totalWeight += weight;

    const match = findCredentialMatch(veteranCredentials, requiredCred);

    if (match.status === 'matched') {
      matchedWeight += weight;
    } else if (match.status === 'alternative-available') {
      matchedWeight += weight * 0.7;
    } else if (match.status === 'in-progress') {
      matchedWeight += weight * 0.3;
    }

    details.push({
      credentialId: `req-${requiredCred}`,
      credentialName: requiredCred,
      status: match.status,
      weight,
      alternative: match.alternative,
    });
  }

  // Preferred credentials
  for (const preferredCred of preferredCredentials) {
    const weight = 0.5;
    totalWeight += weight;

    const match = findCredentialMatch(veteranCredentials, preferredCred);

    if (match.status === 'matched') {
      matchedWeight += weight;
    } else if (match.status === 'alternative-available') {
      matchedWeight += weight * 0.7;
    }

    details.push({
      credentialId: `pref-${preferredCred}`,
      credentialName: preferredCred,
      status: match.status,
      weight,
      alternative: match.alternative,
    });
  }

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;

  return { score, details };
}

interface CredentialMatchInfo {
  status: 'matched' | 'missing' | 'alternative-available' | 'in-progress';
  alternative?: string;
}

function findCredentialMatch(veteranCredentials: Credential[], targetCredential: string): CredentialMatchInfo {
  const normalizedTarget = targetCredential.toLowerCase().trim();

  // Exact match - completed
  for (const cred of veteranCredentials) {
    if (cred.name.toLowerCase().trim() === normalizedTarget && cred.status === 'completed') {
      return { status: 'matched' };
    }
  }

  // In progress
  for (const cred of veteranCredentials) {
    if (cred.name.toLowerCase().trim() === normalizedTarget && cred.status === 'in-progress') {
      return { status: 'in-progress' };
    }
  }

  // Check for alternative/equivalent credentials
  const alternative = findAlternativeCredential(veteranCredentials, normalizedTarget);
  if (alternative) {
    return { status: 'alternative-available', alternative };
  }

  return { status: 'missing' };
}

function findAlternativeCredential(veteranCredentials: Credential[], targetCredential: string): string | undefined {
  // Map equivalent credentials
  const equivalents: Record<string, string[]> = {
    'comptia a+': ['it fundamentals', 'a+ ce'],
    'comptia network+': ['network+ ce', 'ccna'],
    'comptia security+': ['security+ ce', 'cissp', 'ceh'],
    'pmp': ['capm', 'prince2'],
    'ccna': ['network+', 'jncia'],
  };

  for (const [primary, alternatives] of Object.entries(equivalents)) {
    if (targetCredential.includes(primary)) {
      for (const alt of alternatives) {
        const match = veteranCredentials.find(c =>
          c.name.toLowerCase().includes(alt) && c.status === 'completed'
        );
        if (match) {
          return match.name;
        }
      }
    }
  }

  return undefined;
}

// ==================== LOCATION MATCHING ====================

export function calculateLocationMatch(
  preferences: string[],
  jobLocation: string,
  remoteOption: boolean
): number {
  if (remoteOption) {
    return 100; // Perfect match for remote work
  }

  if (preferences.length === 0) {
    return 75; // No preference specified
  }

  const normalizedJobLocation = jobLocation.toLowerCase().trim();

  for (const pref of preferences) {
    const normalizedPref = pref.toLowerCase().trim();

    // Exact match
    if (normalizedJobLocation === normalizedPref) {
      return 100;
    }

    // Contains match (e.g., "San Diego, CA" contains "San Diego")
    if (normalizedJobLocation.includes(normalizedPref) || normalizedPref.includes(normalizedJobLocation)) {
      return 90;
    }

    // State match
    if (normalizedJobLocation.includes(', ') && normalizedPref.includes(', ')) {
      const jobState = normalizedJobLocation.split(', ').pop();
      const prefState = normalizedPref.split(', ').pop();
      if (jobState === prefState) {
        return 60;
      }
    }
  }

  return 30; // Location doesn't match preferences
}

// ==================== SALARY MATCHING ====================

export function calculateSalaryMatch(
  desiredRange: SalaryRange | undefined,
  jobRange: SalaryRange | undefined
): number {
  if (!desiredRange || !jobRange) {
    return 75; // Neutral score if salary not specified
  }

  // Check if ranges overlap
  const overlapStart = Math.max(desiredRange.min, jobRange.min);
  const overlapEnd = Math.min(desiredRange.max, jobRange.max);

  if (overlapEnd < overlapStart) {
    // No overlap - how far apart?
    if (jobRange.max < desiredRange.min) {
      // Job pays less than desired
      const gap = desiredRange.min - jobRange.max;
      const percentGap = (gap / desiredRange.min) * 100;
      return Math.max(0, 100 - percentGap);
    } else {
      // Job pays more than desired (positive!)
      return 100;
    }
  }

  // Calculate overlap percentage
  const overlapSize = overlapEnd - overlapStart;
  const desiredSize = desiredRange.max - desiredRange.min;
  const overlapPercent = (overlapSize / desiredSize) * 100;

  return Math.round(overlapPercent);
}

// ==================== CLEARANCE MATCHING ====================

export function calculateClearanceMatch(
  veteranClearance: string | undefined,
  clearanceStatus: string | undefined,
  requiredClearance: string | undefined
): number {
  if (!requiredClearance || requiredClearance === 'None') {
    return 100; // No clearance required
  }

  if (!veteranClearance || veteranClearance === 'None') {
    return 0; // Clearance required but veteran doesn't have one
  }

  if (clearanceStatus === 'expired') {
    return 40; // Expired clearance has some value (can be renewed)
  }

  // Map clearance levels to numeric values
  const clearanceLevels: Record<string, number> = {
    'None': 0,
    'Confidential': 1,
    'Secret': 2,
    'Top Secret': 3,
    'TS/SCI': 4,
  };

  const veteranLevel = clearanceLevels[veteranClearance] || 0;
  const requiredLevel = clearanceLevels[requiredClearance] || 0;

  if (veteranLevel >= requiredLevel) {
    return 100; // Meets or exceeds requirement
  } else if (veteranLevel === requiredLevel - 1) {
    return 60; // One level below (may be acceptable)
  } else {
    return 30; // Multiple levels below
  }
}
