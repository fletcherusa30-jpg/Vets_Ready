/**
 * MOS to Skills Translator
 * Translates Military Occupational Specialty codes to civilian skills
 *
 * POLICY COMPLIANCE:
 * - Supports all branches (Army, Navy, Air Force, Marine Corps, Coast Guard, Space Force)
 * - Graceful degradation for unknown MOS codes
 * - No-doc mode support (manual skill entry)
 * - Multiple service periods support
 */

import mosMapData from '../catalogs/mosMap.json';

export interface MilitarySkill {
  id: string;
  name: string;
  category: 'Technical' | 'Leadership' | 'Administrative' | 'Medical' | 'Security' | 'Logistics' | 'Communication';
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsExperience?: number;
  certifications?: string[];
  source?: 'mos-catalog' | 'user-entered' | 'inferred';
  confidence?: 'high' | 'medium' | 'low';
}

export interface MOSMapping {
  mosCode: string;
  branch: 'Army' | 'Navy' | 'Air Force' | 'Marine Corps' | 'Coast Guard' | 'Space Force' | 'Unknown';
  title: string;
  skills: MilitarySkill[];
  civilianEquivalents: string[];
  recommendedCertifications: string[];
  isApproximate?: boolean; // True if MOS not found and using generic fallback
  confidence?: 'high' | 'medium' | 'low';
}

// Type for the imported JSON
interface MOSCatalog {
  [branch: string]: {
    [mosCode: string]: {
      title: string;
      skills: string[];
      civilianEquivalents: string[];
      recommendedCertifications: string[];
    };
  };
}

const MOS_CATALOG = mosMapData as MOSCatalog;

/**
 * Categorize skills based on keywords
 */
function categorizeSkill(skillName: string): MilitarySkill['category'] {
  const lowerSkill = skillName.toLowerCase();

  if (lowerSkill.includes('network') || lowerSkill.includes('system') || lowerSkill.includes('software') ||
      lowerSkill.includes('technical') || lowerSkill.includes('it') || lowerSkill.includes('cyber')) {
    return 'Technical';
  }
  if (lowerSkill.includes('lead') || lowerSkill.includes('manage') || lowerSkill.includes('supervis') ||
      lowerSkill.includes('team') || lowerSkill.includes('coordinate')) {
    return 'Leadership';
  }
  if (lowerSkill.includes('medical') || lowerSkill.includes('health') || lowerSkill.includes('patient') ||
      lowerSkill.includes('emergency') || lowerSkill.includes('clinical')) {
    return 'Medical';
  }
  if (lowerSkill.includes('security') || lowerSkill.includes('protect') || lowerSkill.includes('guard') ||
      lowerSkill.includes('defense')) {
    return 'Security';
  }
  if (lowerSkill.includes('supply') || lowerSkill.includes('logistics') || lowerSkill.includes('inventory') ||
      lowerSkill.includes('warehouse') || lowerSkill.includes('transport')) {
    return 'Logistics';
  }
  if (lowerSkill.includes('communication') || lowerSkill.includes('radio') || lowerSkill.includes('signal') ||
      lowerSkill.includes('message')) {
    return 'Communication';
  }
  return 'Administrative';
}

/**
 * Determine proficiency level based on skill name
 */
function determineProficiency(skillName: string): MilitarySkill['proficiencyLevel'] {
  const lowerSkill = skillName.toLowerCase();

  if (lowerSkill.includes('advanced') || lowerSkill.includes('expert') || lowerSkill.includes('master')) {
    return 'Expert';
  }
  if (lowerSkill.includes('senior') || lowerSkill.includes('specialist')) {
    return 'Advanced';
  }
  if (lowerSkill.includes('basic') || lowerSkill.includes('fundamental') || lowerSkill.includes('entry')) {
    return 'Beginner';
  }
  return 'Intermediate'; // Default
}

/**
 * Translate MOS code to civilian skills
 * POLICY: Graceful degradation - returns generic military skills if MOS not found
 */
export function translateMOSToSkills(mosCode: string, branch: string): MOSMapping | null {
  const normalizedCode = mosCode.toUpperCase().trim();
  const normalizedBranch = branch.trim();

  // Try to find exact match
  const branchData = MOS_CATALOG[normalizedBranch];
  if (branchData && branchData[normalizedCode]) {
    const mosData = branchData[normalizedCode];
    return {
      mosCode: normalizedCode,
      branch: normalizedBranch as any,
      title: mosData.title,
      skills: mosData.skills.map((skillName, idx) => ({
        id: `${normalizedCode}-${idx}`,
        name: skillName,
        category: categorizeSkill(skillName),
        proficiencyLevel: determineProficiency(skillName),
        source: 'mos-catalog',
        confidence: 'high',
      })),
      civilianEquivalents: mosData.civilianEquivalents,
      recommendedCertifications: mosData.recommendedCertifications,
      confidence: 'high',
    };
  }

  // POLICY: No-doc fallback - return generic military skills
  const genericData = MOS_CATALOG['Unknown']['GENERIC'];
  return {
    mosCode: normalizedCode,
    branch: normalizedBranch as any,
    title: `${normalizedBranch} ${normalizedCode} (Skills estimated)`,
    skills: genericData.skills.map((skillName, idx) => ({
      id: `generic-${idx}`,
      name: skillName,
      category: categorizeSkill(skillName),
      proficiencyLevel: 'Intermediate',
      source: 'inferred',
      confidence: 'low',
    })),
    civilianEquivalents: genericData.civilianEquivalents,
    recommendedCertifications: genericData.recommendedCertifications,
    isApproximate: true,
    confidence: 'low',
  };
}

/**
 * Get all skills from veteran's military background
 * POLICY: Supports multiple service periods
 */
export function extractAllSkills(profile: {
  mosCode?: string;
  branch?: string;
  yearsOfService?: number;
  rank?: string;
  leadership?: boolean;
  servicePeriods?: Array<{
    mosCode?: string;
    branch?: string;
    yearsOfService?: number;
    rank?: string;
  }>;
}): MilitarySkill[] {
  const skills: MilitarySkill[] = [];
  const seenSkills = new Set<string>(); // Deduplicate skills

  // POLICY: Multiple service periods support
  if (profile.servicePeriods && profile.servicePeriods.length > 0) {
    profile.servicePeriods.forEach((period, idx) => {
      if (period.mosCode && period.branch) {
        const mosMapping = translateMOSToSkills(period.mosCode, period.branch);
        if (mosMapping) {
          mosMapping.skills.forEach(skill => {
            const key = `${skill.name}-${skill.category}`;
            if (!seenSkills.has(key)) {
              seenSkills.add(key);
              skills.push({
                ...skill,
                id: `period${idx}-${skill.id}`,
                yearsExperience: period.yearsOfService,
              });
            }
          });
        }
      }
    });
  } else {
    // Single service period fallback
    if (profile.mosCode && profile.branch) {
      const mosMapping = translateMOSToSkills(profile.mosCode, profile.branch);
      if (mosMapping) {
        skills.push(...mosMapping.skills.map(skill => ({
          ...skill,
          yearsExperience: profile.yearsOfService,
        })));
      }
    }
  }

  // Add universal military skills based on total years of service
  const totalYears = profile.servicePeriods?.reduce((sum, p) => sum + (p.yearsOfService || 0), 0) || profile.yearsOfService || 0;

  if (totalYears >= 1) {
    if (!seenSkills.has('Discipline & Work Ethic-Leadership')) {
      skills.push({
        id: 'universal-1',
        name: 'Discipline & Work Ethic',
        category: 'Leadership',
        proficiencyLevel: totalYears >= 10 ? 'Expert' : totalYears >= 5 ? 'Advanced' : 'Intermediate',
        yearsExperience: totalYears,
        source: 'inferred',
        confidence: 'high',
      });
    }
    if (!seenSkills.has('Teamwork & Collaboration-Leadership')) {
      skills.push({
        id: 'universal-2',
        name: 'Teamwork & Collaboration',
        category: 'Leadership',
        proficiencyLevel: totalYears >= 10 ? 'Expert' : totalYears >= 5 ? 'Advanced' : 'Intermediate',
        yearsExperience: totalYears,
        source: 'inferred',
        confidence: 'high',
      });
    }
  }

  // Add leadership skills based on rank or leadership roles
  if (profile.leadership || (profile.rank && ['NCO', 'Officer', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'O-'].some(r => profile.rank?.includes(r)))) {
    if (!seenSkills.has('Personnel Management-Leadership')) {
      skills.push({
        id: 'leadership-universal',
        name: 'Personnel Management',
        category: 'Leadership',
        proficiencyLevel: 'Advanced',
        yearsExperience: totalYears,
        source: 'inferred',
        confidence: 'medium',
      });
    }
  }

  return skills;
}

/**
 * Group skills by category
 */
export function groupSkillsByCategory(skills: MilitarySkill[]): Record<string, MilitarySkill[]> {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, MilitarySkill[]>);
}

/**
 * Get skill proficiency summary
 */
export function getSkillSummary(skills: MilitarySkill[]): {
  totalSkills: number;
  byProficiency: Record<string, number>;
  byCategory: Record<string, number>;
  topSkills: MilitarySkill[];
} {
  const byProficiency: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  skills.forEach(skill => {
    byProficiency[skill.proficiencyLevel] = (byProficiency[skill.proficiencyLevel] || 0) + 1;
    byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
  });

  // Get top skills (Expert and Advanced level)
  const topSkills = skills
    .filter(s => s.proficiencyLevel === 'Expert' || s.proficiencyLevel === 'Advanced')
    .sort((a, b) => {
      const order = { 'Expert': 0, 'Advanced': 1, 'Intermediate': 2, 'Beginner': 3 };
      return order[a.proficiencyLevel] - order[b.proficiencyLevel];
    });

  return {
    totalSkills: skills.length,
    byProficiency,
    byCategory,
    topSkills: topSkills.slice(0, 10),
  };
}

/**
 * Suggest skills to add based on MOS and experience
 */
export function suggestAdditionalSkills(mosCode: string, yearsOfService: number): MilitarySkill[] {
  const suggestions: MilitarySkill[] = [];

  // Universal suggestions based on years of service
  if (yearsOfService >= 4) {
    suggestions.push({
      id: 'suggest-1',
      name: 'Project Management',
      category: 'Leadership',
      proficiencyLevel: 'Intermediate',
    });
  }

  if (yearsOfService >= 6) {
    suggestions.push({
      id: 'suggest-2',
      name: 'Strategic Planning',
      category: 'Leadership',
      proficiencyLevel: 'Intermediate',
    });
  }

  // Add communication skills
  suggestions.push({
    id: 'suggest-3',
    name: 'Written Communication',
    category: 'Communication',
    proficiencyLevel: 'Advanced',
  });

  return suggestions;
}
