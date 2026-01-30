/**
 * Employment Matcher
 * Matches veterans with job opportunities based on MOS, skills, and preferences
 */

import {
  Prediction,
  EmploymentMatch,
  DataContract,
  ConfidenceLevel
} from '../types/IntelligenceTypes';
import { VeteranProfile } from '../../types/benefitsTypes';

export class EmploymentMatcher {
  private readonly MODEL_VERSION = '1.0.0';

  /**
   * Find and score job matches for a veteran
   */
  public async findJobMatches(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[],
    jobListings: any[]
  ): Promise<Prediction<EmploymentMatch[]>> {
    const employmentData = engineData.find(d => d.engineId === 'employment');
    const transitionData = engineData.find(d => d.engineId === 'transition');

    const matches: EmploymentMatch[] = [];

    for (const job of jobListings) {
      const match = this.scoreJobMatch(job, profile, employmentData, transitionData);
      if (match.matchScore >= 50) { // 50% minimum threshold
        matches.push(match);
      }
    }

    // Sort by match score
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    const confidenceScore = this.calculateMatchConfidence(sortedMatches, profile);
    const rationale = this.buildMatchRationale(sortedMatches, profile);

    return {
      id: crypto.randomUUID(),
      type: 'employment-match',
      subject: 'Job Match Analysis',
      prediction: sortedMatches,
      confidence: this.scoreToConfidence(confidenceScore),
      confidenceScore,
      rationale,
      dataUsed: [employmentData, transitionData].filter(Boolean) as DataContract[],
      recommendedNextSteps: this.generateEmploymentRecommendations(sortedMatches),
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date()
    };
  }

  /**
   * Score a single job match
   */
  private scoreJobMatch(
    job: any,
    profile: VeteranProfile,
    employmentData?: DataContract,
    transitionData?: DataContract
  ): EmploymentMatch {
    const mos = profile.mos || '';
    const branch = profile.branch || '';
    const location = profile.location;
    const preferredSalary = employmentData?.data.preferredSalary || 0;

    // Calculate individual match factors
    const mosAlignment = this.calculateMOSAlignment(mos, branch, job);
    const skillsMatch = this.calculateSkillsMatch(profile, job);
    const locationFit = this.calculateLocationFit(location, job);
    const compensationFit = this.calculateCompensationFit(preferredSalary, job);
    const cultureMatch = this.calculateCultureMatch(profile, job);

    // Weighted overall score
    const matchScore = Math.round(
      mosAlignment * 0.30 +
      skillsMatch * 0.30 +
      locationFit * 0.20 +
      compensationFit * 0.10 +
      cultureMatch * 0.10
    );

    // Build reasons and concerns
    const reasons: string[] = [];
    const concerns: string[] = [];

    if (mosAlignment >= 80) {
      reasons.push('🎯 Strong MOS alignment - your military role directly translates');
    } else if (mosAlignment >= 60) {
      reasons.push('✓ Good MOS alignment - transferable skills');
    } else if (mosAlignment < 40) {
      concerns.push('⚠️ Limited MOS alignment - may need additional training');
    }

    if (skillsMatch >= 80) {
      reasons.push('💪 Excellent skills match - you have most required qualifications');
    } else if (skillsMatch < 50) {
      concerns.push('⚠️ Skills gap - consider upskilling or certification');
    }

    if (locationFit >= 80) {
      reasons.push('📍 Perfect location fit - matches your preferences');
    } else if (locationFit < 40) {
      concerns.push('📍 Location mismatch - may require relocation');
    }

    if (compensationFit >= 80) {
      reasons.push('💰 Salary exceeds your target range');
    } else if (compensationFit < 50) {
      concerns.push('💰 Below target salary range');
    }

    if (cultureMatch >= 70) {
      reasons.push('🤝 Company culture values veterans');
    }

    // Generate next steps
    const nextSteps: string[] = [];
    if (matchScore >= 80) {
      nextSteps.push('Apply immediately - strong match');
      nextSteps.push('Tailor resume to highlight relevant MOS experience');
      nextSteps.push('Prepare military-to-civilian translation for interview');
    } else if (matchScore >= 60) {
      nextSteps.push('Research company culture and requirements');
      nextSteps.push('Identify skill gaps and address in cover letter');
      nextSteps.push('Consider applying if willing to adapt');
    } else {
      nextSteps.push('Use as backup option');
      nextSteps.push('Consider additional training or certifications');
    }

    return {
      jobId: job.id,
      jobTitle: job.title,
      employer: job.company,
      matchScore,
      matchFactors: {
        mosAlignment,
        skillsMatch,
        locationFit,
        compensationFit,
        cultureMatch
      },
      reasons,
      concerns,
      nextSteps
    };
  }

  /**
   * Calculate MOS alignment score (0-100)
   */
  private calculateMOSAlignment(mos: string, branch: string, job: any): number {
    // MOS translation database (simplified)
    const mosTranslations = this.getMOSTranslations();
    const mosKey = `${branch}-${mos}`.toUpperCase();
    const civilianRoles = mosTranslations[mosKey] || [];

    // Check if job title matches known civilian equivalents
    const jobTitle = (job.title || '').toLowerCase();
    const jobCategory = (job.category || '').toLowerCase();

    let score = 0;

    for (const civilianRole of civilianRoles) {
      if (jobTitle.includes(civilianRole.toLowerCase())) {
        score = 90;
        break;
      }
      if (jobCategory.includes(civilianRole.toLowerCase())) {
        score = Math.max(score, 70);
      }
    }

    // Check for keywords in job description
    const description = (job.description || '').toLowerCase();
    const mosKeywords = this.getMOSKeywords(mos);

    let keywordMatches = 0;
    for (const keyword of mosKeywords) {
      if (description.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }

    if (keywordMatches > 0) {
      const keywordScore = Math.min(85, 40 + (keywordMatches * 10));
      score = Math.max(score, keywordScore);
    }

    // Check if job explicitly mentions veteran-friendly
    if (job.veteranFriendly || description.includes('veteran')) {
      score = Math.max(score, 50);
    }

    return Math.min(100, score);
  }

  /**
   * Calculate skills match (0-100)
   */
  private calculateSkillsMatch(profile: VeteranProfile, job: any): number {
    const veteranSkills = this.extractSkillsFromProfile(profile);
    const requiredSkills = job.requiredSkills || [];
    const preferredSkills = job.preferredSkills || [];

    if (requiredSkills.length === 0) {
      return 70; // No specific requirements - moderate match
    }

    let matchedRequired = 0;
    let matchedPreferred = 0;

    for (const required of requiredSkills) {
      if (veteranSkills.some(v => this.skillsMatch(v, required))) {
        matchedRequired++;
      }
    }

    for (const preferred of preferredSkills) {
      if (veteranSkills.some(v => this.skillsMatch(v, preferred))) {
        matchedPreferred++;
      }
    }

    // Required skills are critical (70% weight)
    const requiredScore = (matchedRequired / requiredSkills.length) * 70;

    // Preferred skills are nice-to-have (30% weight)
    const preferredScore = preferredSkills.length > 0
      ? (matchedPreferred / preferredSkills.length) * 30
      : 30; // Assume all preferred if none listed

    return Math.round(requiredScore + preferredScore);
  }

  /**
   * Calculate location fit (0-100)
   */
  private calculateLocationFit(veteranLocation: any, job: any): number {
    if (!veteranLocation || !job.location) {
      return 50; // Neutral if missing data
    }

    // Remote work is always a perfect fit
    if (job.remote) {
      return 100;
    }

    // Check state match
    if (veteranLocation.state === job.location.state) {
      // Check city match
      if (veteranLocation.city && job.location.city) {
        if (veteranLocation.city.toLowerCase() === job.location.city.toLowerCase()) {
          return 100; // Same city
        }
        // Same state but different city
        return 70;
      }
      return 80; // Same state, no city specified
    }

    // Different state
    const willingToRelocate = veteranLocation.willingToRelocate || false;
    return willingToRelocate ? 40 : 20;
  }

  /**
   * Calculate compensation fit (0-100)
   */
  private calculateCompensationFit(preferredSalary: number, job: any): number {
    if (!preferredSalary || !job.salary) {
      return 50; // Neutral if missing data
    }

    const jobSalary = typeof job.salary === 'number'
      ? job.salary
      : job.salary.max || job.salary.min || 0;

    if (jobSalary >= preferredSalary * 1.2) {
      return 100; // 20%+ above target
    }

    if (jobSalary >= preferredSalary) {
      return 90; // Meets or exceeds target
    }

    if (jobSalary >= preferredSalary * 0.9) {
      return 75; // Within 10% of target
    }

    if (jobSalary >= preferredSalary * 0.8) {
      return 60; // Within 20% of target
    }

    if (jobSalary >= preferredSalary * 0.7) {
      return 40; // 30% below target
    }

    return 20; // Significantly below target
  }

  /**
   * Calculate culture match (0-100)
   */
  private calculateCultureMatch(profile: VeteranProfile, job: any): number {
    let score = 50; // Baseline

    // Veteran-friendly employer
    if (job.veteranFriendly) {
      score += 30;
    }

    // Federal/government roles (familiar structure for veterans)
    if (job.company?.toLowerCase().includes('government') ||
        job.company?.toLowerCase().includes('federal')) {
      score += 20;
    }

    // Companies with veteran hiring programs
    if (job.veteranHiringProgram) {
      score += 20;
    }

    // Security clearance positions (veteran advantage)
    if (job.clearanceRequired && profile.clearanceLevel) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Extract skills from veteran profile
   */
  private extractSkillsFromProfile(profile: VeteranProfile): string[] {
    const skills: string[] = [];

    // Add MOS-based skills
    if (profile.mos) {
      skills.push(...this.getMOSKeywords(profile.mos));
    }

    // Add education
    if (profile.education) {
      skills.push(profile.education);
    }

    // Add certifications
    if (profile.certifications) {
      skills.push(...profile.certifications);
    }

    // Leadership experience
    if (profile.rank && this.isLeadershipRank(profile.rank)) {
      skills.push('leadership', 'team management', 'personnel development');
    }

    // Add generic military skills
    skills.push(
      'discipline',
      'time management',
      'teamwork',
      'problem solving',
      'adaptability'
    );

    return skills;
  }

  /**
   * Check if two skills match (fuzzy matching)
   */
  private skillsMatch(skill1: string, skill2: string): boolean {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return true;

    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Synonyms
    const synonyms: Record<string, string[]> = {
      'leadership': ['management', 'supervision', 'lead'],
      'technical': ['technical', 'technology', 'tech'],
      'communication': ['communications', 'communicating'],
      'analysis': ['analytical', 'analyze'],
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if ((s1.includes(key) || values.some(v => s1.includes(v))) &&
          (s2.includes(key) || values.some(v => s2.includes(v)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate employment recommendations
   */
  private generateEmploymentRecommendations(matches: EmploymentMatch[]): any[] {
    const recommendations = [];
    const topMatches = matches.filter(m => m.matchScore >= 80);
    const goodMatches = matches.filter(m => m.matchScore >= 60 && m.matchScore < 80);

    if (topMatches.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: `Apply to ${topMatches.length} Top Job Match${topMatches.length > 1 ? 'es' : ''}`,
        description: 'These positions are excellent fits for your background',
        actionType: 'application' as const,
        estimatedImpact: {
          type: 'time',
          value: 3,
          unit: 'months',
          description: 'Potential time saved in job search'
        },
        steps: topMatches.slice(0, 3).map((match, i) => ({
          id: crypto.randomUUID(),
          order: i + 1,
          title: `Apply to ${match.jobTitle} at ${match.employer}`,
          description: `Match score: ${match.matchScore}% - ${match.reasons[0] || 'Strong fit'}`,
          completed: false,
          required: false,
          estimatedTime: '30-45 minutes'
        })),
        requiredData: ['resume', 'cover-letter'],
        confidence: 'high' as const,
        rationale: [`${topMatches.length} high-match opportunities`, 'Strong MOS and skills alignment'],
        automated: false,
        canOverride: true
      });
    }

    if (goodMatches.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: `Review ${goodMatches.length} Good Job Match${goodMatches.length > 1 ? 'es' : ''}`,
        description: 'These positions are solid opportunities with some gaps to address',
        actionType: 'review' as const,
        estimatedImpact: {
          type: 'other',
          value: goodMatches.length,
          unit: 'opportunities',
          description: 'Additional job prospects'
        },
        steps: [],
        requiredData: [],
        confidence: 'medium' as const,
        rationale: ['Moderate alignment with skills and preferences'],
        automated: false,
        canOverride: true
      });
    }

    return recommendations;
  }

  /**
   * Calculate confidence in match results
   */
  private calculateMatchConfidence(matches: EmploymentMatch[], profile: VeteranProfile): number {
    if (matches.length === 0) {
      return 40; // Low confidence if no matches
    }

    // Higher confidence if we have good profile data
    let confidence = 60;

    if (profile.mos) confidence += 15;
    if (profile.location) confidence += 10;
    if (profile.yearsOfService) confidence += 10;

    // Higher confidence if we found strong matches
    const topMatches = matches.filter(m => m.matchScore >= 80).length;
    confidence += Math.min(15, topMatches * 3);

    return Math.min(95, confidence);
  }

  /**
   * Build rationale for matches
   */
  private buildMatchRationale(matches: EmploymentMatch[], profile: VeteranProfile): string[] {
    const rationale: string[] = [];

    rationale.push(`Analyzed ${matches.length} job opportunities`);

    const excellent = matches.filter(m => m.matchScore >= 80).length;
    const good = matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length;
    const moderate = matches.filter(m => m.matchScore >= 40 && m.matchScore < 60).length;

    if (excellent > 0) {
      rationale.push(`🎯 ${excellent} excellent match${excellent > 1 ? 'es' : ''} (80%+)`);
    }
    if (good > 0) {
      rationale.push(`✓ ${good} good match${good > 1 ? 'es' : ''} (60-79%)`);
    }
    if (moderate > 0) {
      rationale.push(`○ ${moderate} moderate match${moderate > 1 ? 'es' : ''} (40-59%)`);
    }

    if (profile.mos) {
      rationale.push(`MOS: ${profile.mos} translated to civilian equivalents`);
    }

    return rationale;
  }

  // Helper data methods

  private getMOSTranslations(): Record<string, string[]> {
    // Simplified MOS translation database
    return {
      'ARMY-11B': ['Security Guard', 'Law Enforcement', 'Tactical Operations'],
      'ARMY-25B': ['IT Specialist', 'Network Administrator', 'Systems Administrator'],
      'ARMY-68W': ['Paramedic', 'Emergency Medical Technician', 'Healthcare Provider'],
      'NAVY-IT': ['Information Technology Specialist', 'Systems Administrator'],
      'AIRFORCE-3D0X2': ['Cyber Systems Operations', 'IT Security Specialist'],
      'MARINES-0311': ['Security Officer', 'Law Enforcement', 'Tactical Instructor'],
      // Add more as needed
    };
  }

  private getMOSKeywords(mos: string): string[] {
    // Simplified keyword extraction
    const keywords: Record<string, string[]> = {
      '11B': ['security', 'tactical', 'operations', 'weapons', 'combat'],
      '25B': ['IT', 'network', 'systems', 'technology', 'computers'],
      '68W': ['medical', 'healthcare', 'emergency', 'patient care'],
    };

    return keywords[mos] || ['military experience', 'veteran'];
  }

  private isLeadershipRank(rank: string): boolean {
    const leadershipRanks = ['SGT', 'SSG', 'SFC', 'MSG', 'SGM', 'CPL', 'CPT', 'MAJ', 'LTC', 'COL'];
    return leadershipRanks.some(r => rank?.toUpperCase().includes(r));
  }

  private scoreToConfidence(score: number): ConfidenceLevel {
    if (score >= 90) return 'very-high';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'very-low';
  }
}
