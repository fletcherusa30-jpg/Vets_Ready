/**
 * Insight Generator
 * Analyzes cross-engine data to discover patterns and generate actionable insights
 */

import {
  Insight,
  DataContract,
  IntelligenceQuery,
  RecommendedAction,
  ConfidenceLevel,
  EngineType
} from '../types/IntelligenceTypes';

export class InsightGenerator {
  /**
   * Generate insights from cross-engine data
   */
  public async generateInsights(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Cross-engine pattern detection
    insights.push(...this.detectEligibilityOpportunities(engineData, query));
    insights.push(...this.detectEvidenceGaps(engineData, query));
    insights.push(...this.detectEmploymentMatches(engineData, query));
    insights.push(...this.detectTransitionRisks(engineData, query));
    insights.push(...this.detectFinancialOptimizations(engineData, query));

    // Filter by confidence threshold
    const minConfidence = query.minConfidence || 0.5;
    return insights
      .filter(insight => insight.confidenceScore / 100 >= minConfidence)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, query.maxResults || 20);
  }

  /**
   * Detect eligibility opportunities across benefits
   */
  private detectEligibilityOpportunities(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Insight[] {
    const insights: Insight[] = [];
    const benefitsData = this.getEngineData(engineData, 'benefits');
    const evidenceData = this.getEngineData(engineData, 'evidence');

    if (!benefitsData) return insights;

    // Example: CRSC eligibility opportunity
    const hasCombatService = this.checkCombatService(benefitsData);
    const hasDisabilityRating = this.checkDisabilityRating(benefitsData);
    const hasMedicalEvidence = evidenceData && this.checkMedicalEvidence(evidenceData);

    if (hasCombatService && hasDisabilityRating && !benefitsData.data.crscApplied) {
      insights.push({
        id: crypto.randomUUID(),
        title: 'You May Qualify for Combat-Related Special Compensation (CRSC)',
        description: 'Based on your combat service and disability rating, you may be eligible for additional tax-free compensation.',
        category: 'eligibility',
        confidence: 'high',
        confidenceScore: 85,
        rationale: [
          'Combat service confirmed in service records',
          'Disability rating meets CRSC threshold (10% or higher)',
          hasMedicalEvidence ? 'Medical evidence supports combat-related disability' : 'Medical evidence review recommended',
          'No CRSC application detected in records'
        ],
        dataUsed: [benefitsData, evidenceData].filter(Boolean) as DataContract[],
        recommendedActions: [
          {
            id: crypto.randomUUID(),
            title: 'Apply for CRSC',
            description: 'Submit a Combat-Related Special Compensation application',
            actionType: 'application',
            estimatedImpact: {
              type: 'financial',
              value: 500,
              unit: 'USD/month',
              description: 'Estimated additional monthly tax-free benefit'
            },
            steps: [
              {
                id: crypto.randomUUID(),
                order: 1,
                title: 'Gather Combat Documentation',
                description: 'Collect service records showing combat deployment',
                completed: false,
                required: true,
                estimatedTime: '30 minutes'
              },
              {
                id: crypto.randomUUID(),
                order: 2,
                title: 'Complete DD Form 149',
                description: 'Fill out CRSC application form',
                completed: false,
                required: true,
                estimatedTime: '1 hour'
              },
              {
                id: crypto.randomUUID(),
                order: 3,
                title: 'Submit to Branch',
                description: 'Send application to your branch of service',
                completed: false,
                required: true,
                estimatedTime: '15 minutes'
              }
            ],
            requiredData: ['combat-service-records', 'disability-rating', 'dd214'],
            confidence: 'high',
            rationale: ['Strong eligibility indicators', 'Clear application pathway'],
            automated: false,
            canOverride: true
          }
        ],
        priority: 'high',
        createdAt: new Date(),
        sourceEngines: ['benefits', 'evidence']
      });
    }

    return insights;
  }

  /**
   * Detect evidence gaps that could impact claims
   */
  private detectEvidenceGaps(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Insight[] {
    const insights: Insight[] = [];
    const evidenceData = this.getEngineData(engineData, 'evidence');
    const benefitsData = this.getEngineData(engineData, 'benefits');

    if (!evidenceData || !benefitsData) return insights;

    // Example: Missing nexus letter for claimed condition
    const claimedConditions = benefitsData.data.claimedConditions || [];
    const uploadedDocs = evidenceData.data.uploadedDocuments || [];

    for (const condition of claimedConditions) {
      const hasNexusLetter = uploadedDocs.some((doc: any) =>
        doc.type === 'nexus-letter' && doc.condition === condition.name
      );

      if (!hasNexusLetter && condition.rating === 0) {
        insights.push({
          id: crypto.randomUUID(),
          title: `Missing Evidence for ${condition.name}`,
          description: 'A medical nexus letter could strengthen your claim significantly.',
          category: 'evidence',
          confidence: 'high',
          confidenceScore: 90,
          rationale: [
            'No nexus letter found for this condition',
            'Current rating is 0% - evidence gap likely cause',
            'Medical nexus is critical for service-connection',
            'Similar claims with nexus letters show 80% higher success rate'
          ],
          dataUsed: [evidenceData, benefitsData],
          recommendedActions: [
            {
              id: crypto.randomUUID(),
              title: 'Obtain Nexus Letter',
              description: 'Get a medical opinion linking your condition to service',
              actionType: 'document',
              estimatedImpact: {
                type: 'eligibility',
                value: 80,
                unit: 'percentage points',
                description: 'Estimated increase in claim approval likelihood'
              },
              steps: [
                {
                  id: crypto.randomUUID(),
                  order: 1,
                  title: 'Schedule Medical Exam',
                  description: 'Book appointment with VA-approved physician',
                  completed: false,
                  required: true,
                  estimatedTime: '1 week'
                },
                {
                  id: crypto.randomUUID(),
                  order: 2,
                  title: 'Provide Service Records',
                  description: 'Share relevant service documentation with physician',
                  completed: false,
                  required: true,
                  estimatedTime: '30 minutes'
                },
                {
                  id: crypto.randomUUID(),
                  order: 3,
                  title: 'Request Nexus Opinion',
                  description: 'Ask physician for written medical nexus statement',
                  completed: false,
                  required: true,
                  estimatedTime: '2 weeks'
                },
                {
                  id: crypto.randomUUID(),
                  order: 4,
                  title: 'Upload to rallyforge',
                  description: 'Add nexus letter to your evidence file',
                  completed: false,
                  required: true,
                  estimatedTime: '5 minutes'
                }
              ],
              requiredData: ['service-records', 'medical-history'],
              confidence: 'high',
              rationale: ['Critical evidence gap identified', 'High impact on claim success'],
              automated: false,
              canOverride: false
            }
          ],
          priority: 'critical',
          createdAt: new Date(),
          sourceEngines: ['evidence', 'benefits']
        });
      }
    }

    return insights;
  }

  /**
   * Detect employment matches based on MOS and skills
   */
  private detectEmploymentMatches(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Insight[] {
    const insights: Insight[] = [];
    const employmentData = this.getEngineData(engineData, 'employment');
    const transitionData = this.getEngineData(engineData, 'transition');

    if (!employmentData) return insights;

    // Example: High-match job opportunities
    const matches = employmentData.data.matches || [];
    const highMatches = matches.filter((m: any) => m.matchScore >= 80);

    if (highMatches.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        title: `${highMatches.length} High-Match Job Opportunities Found`,
        description: 'We found roles that align closely with your military experience and skills.',
        category: 'employment',
        confidence: 'high',
        confidenceScore: 85,
        rationale: [
          `${highMatches.length} jobs match your MOS skills at 80%+`,
          'Salary ranges align with your target compensation',
          'Employers actively seeking veteran candidates',
          'Location preferences matched'
        ],
        dataUsed: [employmentData, transitionData].filter(Boolean) as DataContract[],
        recommendedActions: [
          {
            id: crypto.randomUUID(),
            title: 'Review Top Job Matches',
            description: 'Explore your best employment opportunities',
            actionType: 'review',
            estimatedImpact: {
              type: 'time',
              value: 3,
              unit: 'months',
              description: 'Potential time saved in job search'
            },
            steps: [
              {
                id: crypto.randomUUID(),
                order: 1,
                title: 'View Match Details',
                description: 'Review why each job is a good fit',
                completed: false,
                required: true,
                estimatedTime: '20 minutes'
              },
              {
                id: crypto.randomUUID(),
                order: 2,
                title: 'Tailor Resume',
                description: 'Customize resume for top 3 matches',
                completed: false,
                required: true,
                estimatedTime: '2 hours'
              },
              {
                id: crypto.randomUUID(),
                order: 3,
                title: 'Submit Applications',
                description: 'Apply to selected positions',
                completed: false,
                required: true,
                estimatedTime: '1 hour'
              }
            ],
            requiredData: ['resume', 'work-preferences'],
            confidence: 'high',
            rationale: ['Strong skill alignment', 'Active hiring'],
            automated: false,
            canOverride: true
          }
        ],
        priority: 'medium',
        createdAt: new Date(),
        sourceEngines: ['employment', 'transition']
      });
    }

    return insights;
  }

  /**
   * Detect transition risks that need attention
   */
  private detectTransitionRisks(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Insight[] {
    const insights: Insight[] = [];
    const transitionData = this.getEngineData(engineData, 'transition');
    const benefitsData = this.getEngineData(engineData, 'benefits');
    const employmentData = this.getEngineData(engineData, 'employment');

    if (!transitionData) return insights;

    // Example: Approaching separation without key milestones
    const daysToSeparation = this.calculateDaysToSeparation(transitionData);
    const completedMilestones = transitionData.data.completedMilestones || [];

    if (daysToSeparation < 180 && completedMilestones.length < 5) {
      insights.push({
        id: crypto.randomUUID(),
        title: 'Transition Timeline Risk Detected',
        description: 'You\'re approaching separation with several critical milestones incomplete.',
        category: 'transition',
        confidence: 'very-high',
        confidenceScore: 95,
        rationale: [
          `${daysToSeparation} days until separation`,
          `Only ${completedMilestones.length}/10 key milestones completed`,
          'Benefits application not yet started',
          'Employment search in early stages',
          'Risk of gaps in healthcare and income'
        ],
        dataUsed: [transitionData, benefitsData, employmentData].filter(Boolean) as DataContract[],
        recommendedActions: [
          {
            id: crypto.randomUUID(),
            title: 'Accelerate Transition Plan',
            description: 'Focus on critical milestones to ensure smooth transition',
            actionType: 'update',
            estimatedImpact: {
              type: 'other',
              value: 90,
              unit: 'risk reduction %',
              description: 'Reduction in transition disruption risk'
            },
            steps: [
              {
                id: crypto.randomUUID(),
                order: 1,
                title: 'File VA Disability Claim',
                description: 'Submit claim before separation (BDD program)',
                completed: false,
                required: true,
                estimatedTime: '3 days',
                resources: ['BDD-guide', 'claim-wizard']
              },
              {
                id: crypto.randomUUID(),
                order: 2,
                title: 'Secure Healthcare Coverage',
                description: 'Enroll in TRICARE or alternative',
                completed: false,
                required: true,
                estimatedTime: '1 day'
              },
              {
                id: crypto.randomUUID(),
                order: 3,
                title: 'Finalize Employment',
                description: 'Accept job offer or secure income plan',
                completed: false,
                required: true,
                estimatedTime: '2 weeks'
              }
            ],
            requiredData: ['separation-date', 'service-records'],
            confidence: 'very-high',
            rationale: ['Time-sensitive', 'High-impact milestones'],
            automated: false,
            canOverride: false
          }
        ],
        priority: 'critical',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sourceEngines: ['transition', 'benefits', 'employment']
      });
    }

    return insights;
  }

  /**
   * Detect financial optimization opportunities
   */
  private detectFinancialOptimizations(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Insight[] {
    const insights: Insight[] = [];
    const benefitsData = this.getEngineData(engineData, 'benefits');
    const retirementData = this.getEngineData(engineData, 'retirement');

    if (!benefitsData || !retirementData) return insights;

    // Example: Retirement timing optimization
    const currentAge = this.calculateAge(retirementData);
    const yearsOfService = this.calculateYearsOfService(retirementData);
    const projectedBenefits = retirementData.data.projectedBenefits || 0;

    if (yearsOfService >= 18 && yearsOfService < 20) {
      const additionalMonthlyAt20 = this.estimateAdditionalBenefitsAt20(retirementData);

      insights.push({
        id: crypto.randomUUID(),
        title: 'Retirement Timing Optimization Opportunity',
        description: `Staying until 20 years could increase your monthly retirement by $${additionalMonthlyAt20}`,
        category: 'financial',
        confidence: 'high',
        confidenceScore: 88,
        rationale: [
          `Currently at ${yearsOfService} years of service`,
          '20-year retirement threshold provides significant benefit increase',
          `Estimated additional monthly: $${additionalMonthlyAt20}`,
          `Lifetime value: $${additionalMonthlyAt20 * 12 * 30} (30 years)`,
          'No pension at current service length vs. guaranteed pension at 20'
        ],
        dataUsed: [benefitsData, retirementData],
        recommendedActions: [
          {
            id: crypto.randomUUID(),
            title: 'Compare Retirement Scenarios',
            description: 'See detailed financial projections for different retirement dates',
            actionType: 'review',
            estimatedImpact: {
              type: 'financial',
              value: additionalMonthlyAt20 * 12 * 30,
              unit: 'USD (lifetime)',
              description: 'Potential lifetime benefit increase'
            },
            steps: [
              {
                id: crypto.randomUUID(),
                order: 1,
                title: 'Run Retirement Calculator',
                description: 'Compare scenarios at current vs. 20 years',
                completed: false,
                required: true,
                estimatedTime: '15 minutes'
              },
              {
                id: crypto.randomUUID(),
                order: 2,
                title: 'Consider Career Goals',
                description: 'Weigh financial benefits against civilian opportunities',
                completed: false,
                required: true,
                estimatedTime: '1 week'
              },
              {
                id: crypto.randomUUID(),
                order: 3,
                title: 'Consult Financial Advisor',
                description: 'Get personalized retirement planning advice',
                completed: false,
                required: false,
                estimatedTime: '1 hour'
              }
            ],
            requiredData: ['service-record', 'pay-grade'],
            confidence: 'high',
            rationale: ['Significant financial impact', 'Clear threshold benefit'],
            automated: false,
            canOverride: true
          }
        ],
        priority: 'high',
        createdAt: new Date(),
        sourceEngines: ['retirement', 'benefits']
      });
    }

    return insights;
  }

  // Helper methods

  private getEngineData(
    engineData: DataContract[],
    engineId: EngineType
  ): DataContract | undefined {
    return engineData.find(d => d.engineId === engineId);
  }

  private checkCombatService(benefitsData: DataContract): boolean {
    return benefitsData.data.combatService === true;
  }

  private checkDisabilityRating(benefitsData: DataContract): boolean {
    return (benefitsData.data.disabilityRating || 0) >= 10;
  }

  private checkMedicalEvidence(evidenceData: DataContract): boolean {
    const docs = evidenceData.data.uploadedDocuments || [];
    return docs.some((doc: any) => doc.type === 'medical-record');
  }

  private calculateDaysToSeparation(transitionData: DataContract): number {
    const sepDate = new Date(transitionData.data.separationDate);
    const today = new Date();
    return Math.floor((sepDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateAge(retirementData: DataContract): number {
    const dob = new Date(retirementData.data.dateOfBirth);
    const today = new Date();
    return today.getFullYear() - dob.getFullYear();
  }

  private calculateYearsOfService(retirementData: DataContract): number {
    return retirementData.data.yearsOfService || 0;
  }

  private estimateAdditionalBenefitsAt20(retirementData: DataContract): number {
    const basePay = retirementData.data.basePay || 5000;
    return Math.floor(basePay * 0.5 * 0.025 * 2); // 2 additional years at 2.5% per year
  }
}

