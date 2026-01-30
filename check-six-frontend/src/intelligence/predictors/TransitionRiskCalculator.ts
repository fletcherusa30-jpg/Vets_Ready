/**
 * Transition Risk Calculator
 * Predicts transition challenges and provides risk mitigation strategies
 */

import {
  Prediction,
  TransitionRisk,
  DataContract,
  ConfidenceLevel
} from '../types/IntelligenceTypes';
import { VeteranProfile } from '../../types/benefitsTypes';

export class TransitionRiskCalculator {
  private readonly MODEL_VERSION = '1.0.0';

  /**
   * Calculate comprehensive transition risk assessment
   */
  public async calculateTransitionRisk(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<TransitionRisk>> {
    const transitionData = engineData.find(d => d.engineId === 'transition');
    const employmentData = engineData.find(d => d.engineId === 'employment');
    const benefitsData = engineData.find(d => d.engineId === 'benefits');
    const financialData = this.extractFinancialData(benefitsData);

    // Assess individual risk factors
    const riskFactors: TransitionRisk['riskFactors'] = [];
    let totalRiskScore = 0;

    // 1. Timeline Risk
    const timelineRisk = this.assessTimelineRisk(profile, transitionData);
    if (timelineRisk) {
      riskFactors.push(timelineRisk);
      totalRiskScore += this.severityToScore(timelineRisk.severity);
    }

    // 2. Financial Risk
    const financialRisk = this.assessFinancialRisk(profile, financialData, employmentData);
    if (financialRisk) {
      riskFactors.push(financialRisk);
      totalRiskScore += this.severityToScore(financialRisk.severity);
    }

    // 3. Employment Risk
    const employmentRisk = this.assessEmploymentRisk(profile, employmentData);
    if (employmentRisk) {
      riskFactors.push(employmentRisk);
      totalRiskScore += this.severityToScore(employmentRisk.severity);
    }

    // 4. Healthcare Risk
    const healthcareRisk = this.assessHealthcareRisk(profile, benefitsData);
    if (healthcareRisk) {
      riskFactors.push(healthcareRisk);
      totalRiskScore += this.severityToScore(healthcareRisk.severity);
    }

    // 5. Education/Training Risk
    const educationRisk = this.assessEducationRisk(profile, employmentData);
    if (educationRisk) {
      riskFactors.push(educationRisk);
      totalRiskScore += this.severityToScore(educationRisk.severity);
    }

    // 6. Housing Risk
    const housingRisk = this.assessHousingRisk(profile, financialData);
    if (housingRisk) {
      riskFactors.push(housingRisk);
      totalRiskScore += this.severityToScore(housingRisk.severity);
    }

    // 7. Family Support Risk
    const familyRisk = this.assessFamilyRisk(profile);
    if (familyRisk) {
      riskFactors.push(familyRisk);
      totalRiskScore += this.severityToScore(familyRisk.severity);
    }

    // 8. Mental Health Risk
    const mentalHealthRisk = this.assessMentalHealthRisk(profile, benefitsData);
    if (mentalHealthRisk) {
      riskFactors.push(mentalHealthRisk);
      totalRiskScore += this.severityToScore(mentalHealthRisk.severity);
    }

    // Calculate overall risk level
    const maxPossibleScore = riskFactors.length * 3; // Max severity = 3
    const riskScore = maxPossibleScore > 0
      ? Math.round((totalRiskScore / maxPossibleScore) * 100)
      : 0;

    const riskLevel = this.scoreToRiskLevel(riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskFactors);

    // Identify support resources
    const supportResources = this.identifySupportResources(riskFactors, profile);

    const transitionRisk: TransitionRisk = {
      riskLevel,
      riskScore,
      riskFactors,
      recommendations,
      supportResources
    };

    const confidenceScore = this.calculateConfidence(profile, transitionData);
    const rationale = this.buildRationale(riskFactors, riskLevel, profile);

    return {
      id: crypto.randomUUID(),
      type: 'transition-risk',
      subject: 'Transition Risk Assessment',
      prediction: transitionRisk,
      confidence: this.scoreToConfidence(confidenceScore),
      confidenceScore,
      rationale,
      dataUsed: [transitionData, employmentData, benefitsData].filter(Boolean) as DataContract[],
      recommendedNextSteps: this.generateActionableSteps(riskFactors),
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }

  /**
   * Assess timeline/separation date risk
   */
  private assessTimelineRisk(
    profile: VeteranProfile,
    transitionData?: DataContract
  ): TransitionRisk['riskFactors'][0] | null {
    const separationDate = transitionData?.data.separationDate;
    if (!separationDate) return null;

    const daysUntilSeparation = Math.floor(
      (new Date(separationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const completedMilestones = transitionData?.data.completedMilestones?.length || 0;
    const totalMilestones = 10; // Standard transition milestones

    let severity: 'low' | 'moderate' | 'high' = 'low';
    let description = '';
    const mitigation: string[] = [];

    if (daysUntilSeparation < 90 && completedMilestones < totalMilestones * 0.7) {
      severity = 'high';
      description = `Only ${daysUntilSeparation} days until separation with ${completedMilestones}/${totalMilestones} milestones completed`;
      mitigation.push('Immediately prioritize critical milestones (benefits, healthcare, employment)');
      mitigation.push('Consider extending separation date if possible');
      mitigation.push('Enroll in TAP/ACAP classes immediately');
    } else if (daysUntilSeparation < 180 && completedMilestones < totalMilestones * 0.5) {
      severity = 'moderate';
      description = `${daysUntilSeparation} days until separation with incomplete transition prep`;
      mitigation.push('Accelerate transition planning');
      mitigation.push('Schedule all required appointments and briefings');
      mitigation.push('Begin benefits claims process (BDD program)');
    } else if (daysUntilSeparation < 365) {
      severity = 'low';
      description = `${daysUntilSeparation} days until separation - adequate time for preparation`;
      mitigation.push('Follow standard transition timeline');
      mitigation.push('Complete one milestone per month');
    }

    return severity !== 'low' || daysUntilSeparation < 365 ? {
      factor: 'Transition Timeline',
      severity,
      description,
      mitigation
    } : null;
  }

  /**
   * Assess financial preparedness risk
   */
  private assessFinancialRisk(
    profile: VeteranProfile,
    financialData: any,
    employmentData?: DataContract
  ): TransitionRisk['riskFactors'][0] | null {
    const emergencyFund = financialData?.emergencyFund || 0;
    const monthlyExpenses = financialData?.monthlyExpenses || 3000;
    const hasJobOffer = employmentData?.data.hasJobOffer || false;
    const estimatedIncome = employmentData?.data.estimatedStartingSalary || 0;

    const monthsOfExpenses = emergencyFund / monthlyExpenses;

    let severity: 'low' | 'moderate' | 'high' = 'low';
    let description = '';
    const mitigation: string[] = [];

    if (monthsOfExpenses < 2 && !hasJobOffer) {
      severity = 'high';
      description = `Only ${monthsOfExpenses.toFixed(1)} months of expenses saved with no job secured`;
      mitigation.push('File for unemployment compensation immediately upon separation');
      mitigation.push('Reduce non-essential expenses now');
      mitigation.push('Explore part-time or temporary work opportunities');
      mitigation.push('File VA disability claim ASAP (BDD for faster processing)');
    } else if (monthsOfExpenses < 4) {
      severity = 'moderate';
      description = `${monthsOfExpenses.toFixed(1)} months emergency fund - below recommended 6 months`;
      mitigation.push('Increase savings before separation');
      mitigation.push('Create detailed post-transition budget');
      mitigation.push('Identify additional income sources (VA benefits, reserves)');
    } else if (hasJobOffer && estimatedIncome < monthlyExpenses * 12) {
      severity = 'moderate';
      description = 'Job secured but salary may not cover current expenses';
      mitigation.push('Negotiate salary or benefits package');
      mitigation.push('Adjust expense expectations');
      mitigation.push('Maximize VA benefits to supplement income');
    }

    return severity !== 'low' ? {
      factor: 'Financial Stability',
      severity,
      description,
      mitigation
    } : null;
  }

  /**
   * Assess employment readiness risk
   */
  private assessEmploymentRisk(
    profile: VeteranProfile,
    employmentData?: DataContract
  ): TransitionRisk['riskFactors'][0] | null {
    const hasJobOffer = employmentData?.data.hasJobOffer || false;
    const activeApplications = employmentData?.data.activeApplications?.length || 0;
    const resumeCompleted = employmentData?.data.resumeCompleted || false;
    const linkedInProfile = employmentData?.data.linkedInComplete || false;

    let severity: 'low' | 'moderate' | 'high' = 'low';
    let description = '';
    const mitigation: string[] = [];

    if (!hasJobOffer && !resumeCompleted) {
      severity = 'high';
      description = 'No job secured and job search not yet started';
      mitigation.push('Build civilian resume immediately (use rallyforge resume builder)');
      mitigation.push('Translate MOS to civilian job titles');
      mitigation.push('Network with veteran employment organizations');
      mitigation.push('Apply to 10+ positions per week');
    } else if (!hasJobOffer && activeApplications < 5) {
      severity = 'moderate';
      description = 'Job search underway but limited activity';
      mitigation.push('Increase application volume');
      mitigation.push('Attend job fairs and veteran hiring events');
      mitigation.push('Leverage SkillBridge or apprenticeship programs');
    } else if (!hasJobOffer && !linkedInProfile) {
      severity = 'moderate';
      description = 'Active job search but missing professional networking presence';
      mitigation.push('Create/optimize LinkedIn profile');
      mitigation.push('Connect with fellow veterans in target industry');
      mitigation.push('Join veteran professional networks');
    }

    return severity !== 'low' ? {
      factor: 'Employment Readiness',
      severity,
      description,
      mitigation
    } : null;
  }

  /**
   * Assess healthcare continuity risk
   */
  private assessHealthcareRisk(
    profile: VeteranProfile,
    benefitsData?: DataContract
  ): TransitionRisk['riskFactors'][0] | null {
    const hasDisability = (profile.disabilityRating || 0) > 0;
    const benefitsClaimFiled = benefitsData?.data.claimsFiled || false;
    const familySize = profile.dependents?.length || 0;
    const hasHealthcarePlan = benefitsData?.data.healthcarePlan || false;

    let severity: 'low' | 'moderate' | 'high' = 'low';
    let description = '';
    const mitigation: string[] = [];

    if (hasDisability && !benefitsClaimFiled) {
      severity = 'high';
      description = 'Service-connected disability but no VA claim filed';
      mitigation.push('File VA disability claim immediately (use BDD if still active)');
      mitigation.push('Schedule C&P exam before separation');
      mitigation.push('Enroll in VA healthcare system');
    } else if (!hasHealthcarePlan && familySize > 0) {
      severity = 'high';
      description = 'No healthcare plan for family members';
      mitigation.push('Enroll in TRICARE Retired Reserve or TRICARE Young Adult');
      mitigation.push('Research Affordable Care Act options');
      mitigation.push('Check employer health benefits in job offers');
    } else if (!hasHealthcarePlan) {
      severity = 'moderate';
      description = 'No healthcare coverage plan for post-separation';
      mitigation.push('Enroll in VA healthcare');
      mitigation.push('Review TRICARE eligibility');
      mitigation.push('Factor healthcare costs into budget');
    }

    return severity !== 'low' ? {
      factor: 'Healthcare Continuity',
      severity,
      description,
      mitigation
    } : null;
  }

  /**
   * Assess education/training gap risk
   */
  private assessEducationRisk(
    profile: VeteranProfile,
    employmentData?: DataContract
  ): TransitionRisk['riskFactors'][0] | null {
    const education = profile.education || 'High School';
    const certifications = profile.certifications?.length || 0;
    const targetJobs = employmentData?.data.targetJobs || [];
    const skillGaps = employmentData?.data.identifiedSkillGaps?.length || 0;

    let severity: 'low' | 'moderate' | 'high' = 'low';
    let description = '';
    const mitigation: string[] = [];

    if (skillGaps > 3 && certifications === 0) {
      severity = 'moderate';
      description = 'Significant skill gaps for target roles with no certifications';
      mitigation.push('Use GI Bill for training/education');
      mitigation.push('Pursue industry certifications (often free for veterans)');
      mitigation.push('Consider Chapter 31 Voc Rehab for career training');
    } else if (targetJobs.some((j: any) => j.requiresDegree) && !education.includes('Bachelor')) {
      severity = 'moderate';
      description = 'Target jobs require degree you don\'t have';
      mitigation.push('Enroll in degree program using GI Bill');
      mitigation.push('Look for companies with tuition assistance');
      mitigation.push('Consider alternative roles that value military experience');
    }

    return severity !== 'low' ? {
      factor: 'Education & Skills',
      severity,
      description,
      mitigation
    } : null;
  }

  /**
   * Assess housing stability risk
   */
  private assessHousingRisk(
    profile: VeteranProfile,
    financialData: any
  ): TransitionRisk['riskFactors'][0] | null {
    const hasHousing = financialData?.hasSecuredHousing || false;
    const homelessRisk = profile.riskFactors?.includes('housing-instability') || false;

    let severity: 'low' | 'moderate' | 'high' = 'low';
    let description = '';
    const mitigation: string[] = [];

    if (homelessRisk || (!hasHousing && financialData?.emergencyFund < 5000)) {
      severity = 'high';
      description = 'High risk of housing instability post-separation';
      mitigation.push('Contact VA Homeless Programs immediately (877-424-3838)');
      mitigation.push('Apply for HUD-VASH voucher program');
      mitigation.push('Reach out to SSVF (Supportive Services for Veteran Families)');
      mitigation.push('Contact local veteran service organizations for emergency housing');
    } else if (!hasHousing) {
      severity = 'moderate';
      description = 'No permanent housing secured for post-separation';
      mitigation.push('Begin housing search 3-6 months before separation');
      mitigation.push('Research VA home loan benefits');
      mitigation.push('Consider temporary housing with family/friends during transition');
    }

    return severity !== 'low' ? {
      factor: 'Housing Stability',
      severity,
      description,
      mitigation
    } : null;
  }

  /**
   * Assess family support system risk
   */
  private assessFamilyRisk(profile: VeteranProfile): TransitionRisk['riskFactors'][0] | null {
    const hasDependents = (profile.dependents?.length || 0) > 0;
    const isMarried = profile.maritalStatus === 'married';

    // This is a simplified assessment - real implementation would need more data
    if (hasDependents && !isMarried) {
      return {
        factor: 'Family Support',
        severity: 'moderate',
        description: 'Single parent transition - additional support needed',
        mitigation: [
          'Connect with family support programs',
          'Research childcare assistance programs',
          'Build support network before separation'
        ]
      };
    }

    return null;
  }

  /**
   * Assess mental health risk
   */
  private assessMentalHealthRisk(
    profile: VeteranProfile,
    benefitsData?: DataContract
  ): TransitionRisk['riskFactors'][0] | null {
    const hasPTSD = profile.serviceConnectedConditions?.some(
      (c: any) => c.toLowerCase().includes('ptsd')
    ) || false;
    const hasMentalHealthClaim = benefitsData?.data.mentalHealthClaim || false;

    if (hasPTSD && !hasMentalHealthClaim) {
      return {
        factor: 'Mental Health Support',
        severity: 'high',
        description: 'PTSD diagnosis but no mental health support plan',
        mitigation: [
          'Enroll in VA mental health services immediately',
          'File mental health disability claim',
          'Join peer support groups',
          'Crisis line: 988 then press 1 (24/7 veteran crisis support)'
        ]
      };
    }

    return null;
  }

  // Helper methods

  private extractFinancialData(benefitsData?: DataContract): any {
    return benefitsData?.data.financialData || {};
  }

  private severityToScore(severity: 'low' | 'moderate' | 'high'): number {
    return { low: 1, moderate: 2, high: 3 }[severity];
  }

  private scoreToRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very-high' {
    if (score >= 75) return 'very-high';
    if (score >= 50) return 'high';
    if (score >= 25) return 'moderate';
    return 'low';
  }

  private generateRecommendations(riskFactors: TransitionRisk['riskFactors']): string[] {
    const recommendations: string[] = [];

    // Prioritize by severity
    const highRisks = riskFactors.filter(r => r.severity === 'high');
    const moderateRisks = riskFactors.filter(r => r.severity === 'moderate');

    if (highRisks.length > 0) {
      recommendations.push(`⚠️ URGENT: Address ${highRisks.length} high-risk area(s) immediately`);
      highRisks.forEach(risk => {
        recommendations.push(`• ${risk.factor}: ${risk.mitigation[0]}`);
      });
    }

    if (moderateRisks.length > 0) {
      recommendations.push(`Focus on ${moderateRisks.length} moderate-risk area(s) in next 30 days`);
    }

    recommendations.push('Schedule weekly check-ins to track progress');
    recommendations.push('Connect with a Veterans Service Officer (VSO) for personalized guidance');

    return recommendations;
  }

  private identifySupportResources(
    riskFactors: TransitionRisk['riskFactors'],
    profile: VeteranProfile
  ): string[] {
    const resources: string[] = [];

    // General transition resources
    resources.push('Transition Assistance Program (TAP/ACAP)');
    resources.push('Veterans Service Organizations (VFW, American Legion, DAV)');

    // Risk-specific resources
    const riskTypes = riskFactors.map(r => r.factor);

    if (riskTypes.includes('Financial Stability')) {
      resources.push('Financial counseling through Military OneSource');
      resources.push('VA Financial Hardship programs');
    }

    if (riskTypes.includes('Employment Readiness')) {
      resources.push('Hiring Our Heroes');
      resources.push('SkillBridge program');
      resources.push('Veterans Employment and Training Service (VETS)');
    }

    if (riskTypes.includes('Healthcare Continuity')) {
      resources.push('VA Enrollment: 1-877-222-VETS');
      resources.push('TRICARE information line');
    }

    if (riskTypes.includes('Housing Stability')) {
      resources.push('SSVF (Supportive Services for Veteran Families)');
      resources.push('HUD-VASH program');
    }

    if (riskTypes.includes('Mental Health Support')) {
      resources.push('Veterans Crisis Line: 988 then press 1');
      resources.push('Vet Centers for readjustment counseling');
    }

    return resources;
  }

  private generateActionableSteps(riskFactors: TransitionRisk['riskFactors']): any[] {
    // Convert top 3 highest-severity risks into actionable steps
    const topRisks = riskFactors
      .sort((a, b) => this.severityToScore(b.severity) - this.severityToScore(a.severity))
      .slice(0, 3);

    return topRisks.map((risk, i) => ({
      id: crypto.randomUUID(),
      title: `Mitigate ${risk.factor} Risk`,
      description: risk.description,
      actionType: 'other' as const,
      estimatedImpact: {
        type: 'other',
        value: this.severityToScore(risk.severity) * 20,
        unit: 'risk reduction %',
        description: 'Reduction in transition risk'
      },
      steps: risk.mitigation.map((m, j) => ({
        id: crypto.randomUUID(),
        order: j + 1,
        title: m,
        description: '',
        completed: false,
        required: risk.severity === 'high',
        estimatedTime: '1-2 weeks'
      })),
      requiredData: [],
      confidence: 'high' as const,
      rationale: [risk.description],
      automated: false,
      canOverride: risk.severity !== 'high'
    }));
  }

  private calculateConfidence(profile: VeteranProfile, transitionData?: DataContract): number {
    let confidence = 70;

    if (transitionData?.data.separationDate) confidence += 15;
    if (profile.yearsOfService) confidence += 10;
    if (transitionData?.data.completedMilestones) confidence += 10;

    return Math.min(95, confidence);
  }

  private buildRationale(
    riskFactors: TransitionRisk['riskFactors'],
    riskLevel: string,
    profile: VeteranProfile
  ): string[] {
    const rationale: string[] = [];

    rationale.push(`Overall transition risk: ${riskLevel.toUpperCase()}`);
    rationale.push(`Assessed ${riskFactors.length} risk factor(s)`);

    const high = riskFactors.filter(r => r.severity === 'high').length;
    const moderate = riskFactors.filter(r => r.severity === 'moderate').length;
    const low = riskFactors.filter(r => r.severity === 'low').length;

    if (high > 0) rationale.push(`⚠️ ${high} high-severity risk(s) require immediate attention`);
    if (moderate > 0) rationale.push(`ℹ️ ${moderate} moderate risk(s) need planning`);
    if (low > 0) rationale.push(`✓ ${low} low-severity risk(s) being monitored`);

    return rationale;
  }

  private scoreToConfidence(score: number): ConfidenceLevel {
    if (score >= 90) return 'very-high';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'very-low';
  }
}

