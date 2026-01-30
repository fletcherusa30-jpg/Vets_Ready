/**
 * Eligibility Predictor
 * Predicts benefit eligibility, CRSC viability, and appeal success likelihood
 */

import {
  Prediction,
  EligibilityPrediction,
  DataContract,
  ConfidenceLevel
} from '../types/IntelligenceTypes';
import { VeteranProfile } from '../../types/benefitsTypes';

export class EligibilityPredictor {
  private readonly MODEL_VERSION = '1.0.0';

  /**
   * Predict benefit eligibility across all programs
   */
  public async predictBenefitEligibility(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EligibilityPrediction>[]> {
    const predictions: Prediction<EligibilityPrediction>[] = [];

    // Predict VA Disability eligibility
    predictions.push(await this.predictVADisability(veteranId, profile, engineData));

    // Predict CRSC eligibility
    predictions.push(await this.predictCRSC(veteranId, profile, engineData));

    // Predict Chapter 31 Voc Rehab eligibility
    predictions.push(await this.predictVocRehab(veteranId, profile, engineData));

    // Predict GI Bill benefits
    predictions.push(await this.predictGIBill(veteranId, profile, engineData));

    // Predict state benefits
    predictions.push(...await this.predictStateBenefits(veteranId, profile, engineData));

    return predictions.filter(p => p.confidenceScore >= 50);
  }

  /**
   * Predict CRSC viability
   */
  public async predictCRSC(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EligibilityPrediction>> {
    const benefitsData = engineData.find(d => d.engineId === 'benefits');
    const evidenceData = engineData.find(d => d.engineId === 'evidence');

    // Check eligibility factors
    const hasCombatService = profile.combatService || false;
    const hasDisabilityRating = (profile.disabilityRating || 0) >= 10;
    const hasMilitaryRetirement = profile.yearsOfService && profile.yearsOfService >= 20;
    const hasCombatRelatedDocs = this.checkCombatRelatedEvidence(evidenceData);
    const currentlyReceivingCRSC = benefitsData?.data.crscApplied || false;

    // Calculate confidence
    let confidenceScore = 0;
    const rationale: string[] = [];
    const requiredActions: string[] = [];
    const blockers: string[] = [];

    // Combat service (required)
    if (hasCombatService) {
      confidenceScore += 30;
      rationale.push('✅ Combat service confirmed in military records');
    } else {
      blockers.push('Combat service not documented');
      rationale.push('❌ No combat service found - required for CRSC');
    }

    // Disability rating (required)
    if (hasDisabilityRating) {
      confidenceScore += 30;
      rationale.push(`✅ Disability rating (${profile.disabilityRating}%) meets minimum threshold`);
    } else {
      blockers.push('No disability rating or rating below 10%');
      rationale.push('❌ Disability rating required (minimum 10%)');
    }

    // Military retirement (required)
    if (hasMilitaryRetirement) {
      confidenceScore += 20;
      rationale.push('✅ Military retirement pay confirmed');
    } else {
      blockers.push('Not receiving military retirement pay');
      rationale.push('❌ Must be receiving military retirement pay');
    }

    // Combat-related medical evidence (helpful)
    if (hasCombatRelatedDocs) {
      confidenceScore += 15;
      rationale.push('✅ Combat-related medical evidence on file');
    } else {
      requiredActions.push('Obtain medical documentation linking disability to combat');
      rationale.push('⚠️ Combat-related medical evidence recommended');
    }

    // Not already receiving CRSC
    if (!currentlyReceivingCRSC) {
      confidenceScore += 5;
      rationale.push('✅ Not currently receiving CRSC');
    } else {
      blockers.push('Already receiving CRSC');
      rationale.push('ℹ️ Already enrolled in CRSC program');
    }

    const eligible = confidenceScore >= 75 && blockers.length === 0;
    const confidence = this.scoreToConfidence(confidenceScore);

    const prediction: EligibilityPrediction = {
      benefitType: 'CRSC (Combat-Related Special Compensation)',
      eligible,
      estimatedValue: eligible ? this.estimateCRSCValue(profile) : 0,
      timeframe: '90-180 days',
      requiredActions,
      blockers,
      opportunities: eligible ? [
        'Tax-free additional monthly compensation',
        'Retroactive payments possible',
        'No offset against VA disability pay (for qualifying conditions)'
      ] : []
    };

    return {
      id: crypto.randomUUID(),
      type: 'eligibility',
      subject: 'CRSC Eligibility',
      prediction,
      confidence,
      confidenceScore,
      rationale,
      dataUsed: [benefitsData, evidenceData].filter(Boolean) as DataContract[],
      recommendedNextSteps: eligible ? [
        {
          id: crypto.randomUUID(),
          title: 'Prepare CRSC Application',
          description: 'Gather required documentation and complete application',
          actionType: 'application',
          estimatedImpact: {
            type: 'financial',
            value: this.estimateCRSCValue(profile),
            unit: 'USD/month',
            description: 'Estimated monthly CRSC benefit'
          },
          steps: [],
          requiredData: requiredActions,
          confidence: 'high',
          rationale: ['Strong eligibility indicators'],
          automated: false,
          canOverride: true
        }
      ] : [],
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date()
    };
  }

  /**
   * Predict VA Disability eligibility and potential rating
   */
  private async predictVADisability(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EligibilityPrediction>> {
    const evidenceData = engineData.find(d => d.engineId === 'evidence');
    const benefitsData = engineData.find(d => d.engineId === 'benefits');

    const hasServiceConnection = this.checkServiceConnection(profile);
    const hasCurrentDiagnosis = this.checkCurrentDiagnosis(evidenceData);
    const hasNexusEvidence = this.checkNexusEvidence(evidenceData);
    const currentRating = profile.disabilityRating || 0;

    let confidenceScore = 0;
    const rationale: string[] = [];
    const requiredActions: string[] = [];
    const blockers: string[] = [];

    if (hasServiceConnection) {
      confidenceScore += 35;
      rationale.push('✅ Service connection documented');
    } else {
      requiredActions.push('Document in-service injury or illness');
      rationale.push('⚠️ Service connection evidence needed');
    }

    if (hasCurrentDiagnosis) {
      confidenceScore += 35;
      rationale.push('✅ Current diagnosis confirmed');
    } else {
      requiredActions.push('Obtain current medical diagnosis');
      rationale.push('⚠️ Current diagnosis required');
    }

    if (hasNexusEvidence) {
      confidenceScore += 30;
      rationale.push('✅ Medical nexus opinion on file');
    } else {
      requiredActions.push('Get medical nexus letter linking condition to service');
      rationale.push('⚠️ Nexus evidence strongly recommended');
    }

    const eligible = confidenceScore >= 60;
    const estimatedRating = this.estimateDisabilityRating(profile, evidenceData);

    const prediction: EligibilityPrediction = {
      benefitType: 'VA Disability Compensation',
      eligible,
      estimatedValue: this.getMonthlyCompensation(estimatedRating),
      timeframe: '3-6 months',
      requiredActions,
      blockers,
      opportunities: [
        'Monthly tax-free compensation',
        'Healthcare access at VA facilities',
        'Priority for other VA benefits',
        currentRating < estimatedRating ? `Potential increase from ${currentRating}% to ${estimatedRating}%` : ''
      ].filter(Boolean)
    };

    return {
      id: crypto.randomUUID(),
      type: 'eligibility',
      subject: 'VA Disability Compensation',
      prediction,
      confidence: this.scoreToConfidence(confidenceScore),
      confidenceScore,
      rationale,
      dataUsed: [benefitsData, evidenceData].filter(Boolean) as DataContract[],
      recommendedNextSteps: [],
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date()
    };
  }

  /**
   * Predict Voc Rehab (Chapter 31) eligibility
   */
  private async predictVocRehab(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EligibilityPrediction>> {
    const rating = profile.disabilityRating || 0;
    const employmentData = engineData.find(d => d.engineId === 'employment');

    const eligible = rating >= 10;
    const hasEmploymentBarrier = employmentData?.data.employmentBarriers?.length > 0;

    let confidenceScore = eligible ? 70 : 30;
    const rationale: string[] = [];

    if (rating >= 20) {
      confidenceScore += 20;
      rationale.push(`✅ ${rating}% disability rating qualifies for Chapter 31`);
    } else if (rating >= 10) {
      confidenceScore += 10;
      rationale.push(`✅ ${rating}% rating meets minimum (10%) threshold`);
    } else {
      rationale.push('❌ Disability rating below 10% minimum');
    }

    if (hasEmploymentBarrier) {
      confidenceScore += 10;
      rationale.push('✅ Employment barriers documented');
    }

    const prediction: EligibilityPrediction = {
      benefitType: 'Vocational Rehabilitation (Chapter 31)',
      eligible,
      timeframe: '30-60 days',
      requiredActions: eligible ? ['Schedule VR&E appointment'] : ['Increase disability rating to 10%+'],
      blockers: !eligible ? ['Disability rating below 10%'] : [],
      opportunities: eligible ? [
        'Free job training and education',
        'Employment assistance',
        'Subsistence allowance during training',
        'Job placement support'
      ] : []
    };

    return {
      id: crypto.randomUUID(),
      type: 'eligibility',
      subject: 'Vocational Rehabilitation Eligibility',
      prediction,
      confidence: this.scoreToConfidence(confidenceScore),
      confidenceScore,
      rationale,
      dataUsed: [employmentData].filter(Boolean) as DataContract[],
      recommendedNextSteps: [],
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date()
    };
  }

  /**
   * Predict GI Bill eligibility
   */
  private async predictGIBill(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EligibilityPrediction>> {
    const yearsOfService = profile.yearsOfService || 0;
    const activeService = profile.status === 'active';

    const eligible = yearsOfService >= 3 || activeService;
    const percentage = Math.min(100, Math.floor((yearsOfService / 3) * 100));

    const rationale: string[] = [
      `Service time: ${yearsOfService} years`,
      `Eligibility percentage: ${percentage}%`
    ];

    const prediction: EligibilityPrediction = {
      benefitType: `Post-9/11 GI Bill (${percentage}%)`,
      eligible,
      timeframe: '30 days',
      requiredActions: eligible ? ['Apply for Certificate of Eligibility'] : [],
      blockers: !eligible ? ['Insufficient active duty service time'] : [],
      opportunities: eligible ? [
        'Full tuition coverage (at percentage)',
        'Monthly housing allowance',
        'Books and supplies stipend',
        'Transfer to dependents (if eligible)'
      ] : []
    };

    return {
      id: crypto.randomUUID(),
      type: 'eligibility',
      subject: 'GI Bill Education Benefits',
      prediction,
      confidence: eligible ? 'very-high' : 'low',
      confidenceScore: eligible ? 95 : 20,
      rationale,
      dataUsed: [],
      recommendedNextSteps: [],
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date()
    };
  }

  /**
   * Predict state-specific benefits
   */
  private async predictStateBenefits(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EligibilityPrediction>[]> {
    const predictions: Prediction<EligibilityPrediction>[] = [];
    const state = profile.location?.state;

    if (!state) return predictions;

    // State-specific benefit rules
    const stateBenefits = this.getStateBenefits(state, profile);

    for (const benefit of stateBenefits) {
      predictions.push({
        id: crypto.randomUUID(),
        type: 'eligibility',
        subject: `${state} State Benefit: ${benefit.name}`,
        prediction: benefit,
        confidence: 'medium',
        confidenceScore: 70,
        rationale: benefit.requiredActions,
        dataUsed: [],
        recommendedNextSteps: [],
        modelVersion: this.MODEL_VERSION,
        createdAt: new Date()
      });
    }

    return predictions;
  }

  // Helper methods

  private scoreToConfidence(score: number): ConfidenceLevel {
    if (score >= 90) return 'very-high';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'very-low';
  }

  private estimateCRSCValue(profile: VeteranProfile): number {
    const rating = profile.disabilityRating || 0;
    // Rough estimate based on rating
    if (rating >= 50) return 800;
    if (rating >= 30) return 500;
    if (rating >= 10) return 300;
    return 0;
  }

  private checkCombatRelatedEvidence(evidenceData?: DataContract): boolean {
    if (!evidenceData) return false;
    const docs = evidenceData.data.uploadedDocuments || [];
    return docs.some((doc: any) =>
      doc.type === 'combat-documentation' ||
      doc.tags?.includes('combat')
    );
  }

  private checkServiceConnection(profile: VeteranProfile): boolean {
    return profile.serviceConnectedConditions?.length > 0;
  }

  private checkCurrentDiagnosis(evidenceData?: DataContract): boolean {
    if (!evidenceData) return false;
    const docs = evidenceData.data.uploadedDocuments || [];
    return docs.some((doc: any) => doc.type === 'medical-record' || doc.type === 'diagnosis');
  }

  private checkNexusEvidence(evidenceData?: DataContract): boolean {
    if (!evidenceData) return false;
    const docs = evidenceData.data.uploadedDocuments || [];
    return docs.some((doc: any) => doc.type === 'nexus-letter');
  }

  private estimateDisabilityRating(profile: VeteranProfile, evidenceData?: DataContract): number {
    const conditions = profile.serviceConnectedConditions?.length || 0;
    const severity = this.assessSeverity(evidenceData);

    // Simple estimation logic
    const baseRating = conditions * 10;
    const severityBonus = severity * 20;

    return Math.min(100, baseRating + severityBonus);
  }

  private assessSeverity(evidenceData?: DataContract): number {
    if (!evidenceData) return 1;
    const docs = evidenceData.data.uploadedDocuments || [];
    return Math.min(3, Math.floor(docs.length / 3) + 1);
  }

  private getMonthlyCompensation(rating: number): number {
    // 2024 rates (simplified)
    const rates: Record<number, number> = {
      10: 165, 20: 327, 30: 508, 40: 731, 50: 1041,
      60: 1319, 70: 1663, 80: 1933, 90: 2172, 100: 3737
    };

    return rates[Math.floor(rating / 10) * 10] || 0;
  }

  private getStateBenefits(state: string, profile: VeteranProfile): EligibilityPrediction[] {
    // This would be populated with actual state benefit data
    // For now, return sample data
    return [
      {
        benefitType: `${state} Property Tax Exemption`,
        eligible: (profile.disabilityRating || 0) >= 10,
        timeframe: '60 days',
        requiredActions: ['Contact county assessor', 'Provide disability documentation'],
        blockers: [],
        opportunities: ['Annual property tax savings']
      }
    ];
  }
}
