/**
 * Evidence Gap Analyzer
 * Detects missing documentation and suggests evidence to strengthen claims
 */

import {
  Prediction,
  EvidenceGap,
  DataContract,
  ConfidenceLevel
} from '../types/IntelligenceTypes';
import { VeteranProfile } from '../../types/benefitsTypes';

export class EvidenceGapAnalyzer {
  private readonly MODEL_VERSION = '1.0.0';

  /**
   * Analyze evidence gaps for all claimed conditions
   */
  public async analyzeEvidenceGaps(
    veteranId: string,
    profile: VeteranProfile,
    engineData: DataContract[]
  ): Promise<Prediction<EvidenceGap[]>> {
    const evidenceData = engineData.find(d => d.engineId === 'evidence');
    const benefitsData = engineData.find(d => d.engineId === 'benefits');

    const gaps: EvidenceGap[] = [];
    const claimedConditions = profile.serviceConnectedConditions || [];
    const uploadedDocs = evidenceData?.data.uploadedDocuments || [];

    // Analyze each claimed condition
    for (const condition of claimedConditions) {
      gaps.push(...this.analyzeConditionEvidence(condition, uploadedDocs));
    }

    // Check for general documentation gaps
    gaps.push(...this.checkGeneralDocumentation(profile, uploadedDocs));

    // Prioritize gaps by severity
    const sortedGaps = gaps.sort((a, b) => {
      const severityOrder = { critical: 4, major: 3, moderate: 2, minor: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    const confidenceScore = this.calculateGapConfidence(sortedGaps, uploadedDocs);
    const rationale = this.buildGapRationale(sortedGaps, uploadedDocs);

    return {
      id: crypto.randomUUID(),
      type: 'evidence-gap',
      subject: 'Evidence Completeness Analysis',
      prediction: sortedGaps,
      confidence: this.scoreToConfidence(confidenceScore),
      confidenceScore,
      rationale,
      dataUsed: [evidenceData, benefitsData].filter(Boolean) as DataContract[],
      recommendedNextSteps: this.generateEvidenceRecommendations(sortedGaps),
      modelVersion: this.MODEL_VERSION,
      createdAt: new Date()
    };
  }

  /**
   * Analyze evidence for a specific condition
   */
  private analyzeConditionEvidence(
    condition: any,
    uploadedDocs: any[]
  ): EvidenceGap[] {
    const gaps: EvidenceGap[] = [];
    const conditionName = condition.name || condition;

    // Check for nexus letter
    const hasNexus = uploadedDocs.some(doc =>
      doc.type === 'nexus-letter' &&
      doc.condition === conditionName
    );

    if (!hasNexus) {
      gaps.push({
        gapType: 'nexus',
        severity: 'critical',
        description: `Missing medical nexus letter for ${conditionName}`,
        impact: 'Service connection may be denied without medical opinion linking condition to service',
        suggestedDocuments: [
          'Independent Medical Opinion (IMO)',
          'Nexus letter from treating physician',
          'VA examiner statement'
        ],
        alternativeEvidence: [
          'Buddy statements from service members',
          'Service treatment records showing initial injury',
          'Contemporaneous medical records'
        ]
      });
    }

    // Check for current diagnosis
    const hasDiagnosis = uploadedDocs.some(doc =>
      (doc.type === 'medical-record' || doc.type === 'diagnosis') &&
      doc.condition === conditionName
    );

    if (!hasDiagnosis) {
      gaps.push({
        gapType: 'medical',
        severity: 'critical',
        description: `Missing current diagnosis for ${conditionName}`,
        impact: 'Cannot establish disability without current medical evidence',
        suggestedDocuments: [
          'Recent medical examination report',
          'Diagnostic test results',
          'Treatment records from past 12 months'
        ],
        alternativeEvidence: [
          'VA C&P examination results',
          'Hospital discharge summaries',
          'Prescription records'
        ]
      });
    }

    // Check for service connection evidence
    const hasServiceEvidence = uploadedDocs.some(doc =>
      doc.type === 'service-record' &&
      (doc.condition === conditionName || doc.tags?.includes(conditionName))
    );

    if (!hasServiceEvidence) {
      gaps.push({
        gapType: 'service',
        severity: 'major',
        description: `Missing service records documenting ${conditionName}`,
        impact: 'Difficult to prove condition originated in or was aggravated by service',
        suggestedDocuments: [
          'Service Treatment Records (STRs)',
          'Line of duty determinations',
          'Medical board proceedings'
        ],
        alternativeEvidence: [
          'DD214 with relevant duty stations',
          'Deployment records',
          'Unit history documentation'
        ]
      });
    }

    // Check for lay statements
    const hasLayStatements = uploadedDocs.some(doc =>
      doc.type === 'lay-statement' &&
      doc.condition === conditionName
    );

    if (!hasLayStatements) {
      gaps.push({
        gapType: 'other',
        severity: 'moderate',
        description: `No lay statements supporting ${conditionName} claim`,
        impact: 'Personal testimony can strengthen claim credibility',
        suggestedDocuments: [
          'Personal statement describing onset and progression',
          'Buddy statements from witnesses',
          'Spouse/family member statements'
        ],
        alternativeEvidence: [
          'Journal or diary entries',
          'Photos or videos showing condition',
          'Employment records showing impact'
        ]
      });
    }

    // Check for continuity of treatment
    const recentMedicalDocs = uploadedDocs.filter(doc =>
      doc.type === 'medical-record' &&
      doc.condition === conditionName &&
      this.isRecentDoc(doc.date)
    );

    if (recentMedicalDocs.length < 3) {
      gaps.push({
        gapType: 'medical',
        severity: 'moderate',
        description: `Limited recent treatment history for ${conditionName}`,
        impact: 'Continuous treatment records strengthen severity and persistence claims',
        suggestedDocuments: [
          'Treatment records from past 2 years',
          'Medication logs',
          'Physical therapy records'
        ],
        alternativeEvidence: [
          'Prescription renewal history',
          'Insurance claims showing treatment',
          'Medical appointment calendar'
        ]
      });
    }

    return gaps;
  }

  /**
   * Check for general documentation gaps
   */
  private checkGeneralDocumentation(
    profile: VeteranProfile,
    uploadedDocs: any[]
  ): EvidenceGap[] {
    const gaps: EvidenceGap[] = [];

    // DD214
    const hasDD214 = uploadedDocs.some(doc => doc.type === 'dd214');
    if (!hasDD214) {
      gaps.push({
        gapType: 'service',
        severity: 'critical',
        description: 'Missing DD Form 214 (Certificate of Release or Discharge)',
        impact: 'Required to verify military service and eligibility',
        suggestedDocuments: [
          'DD Form 214',
          'NGB 22 (for National Guard)',
          'Discharge certificate'
        ],
        alternativeEvidence: []
      });
    }

    // Service Treatment Records
    const hasSTRs = uploadedDocs.some(doc => doc.type === 'service-treatment-records');
    if (!hasSTRs) {
      gaps.push({
        gapType: 'service',
        severity: 'major',
        description: 'Missing Service Treatment Records (STRs)',
        impact: 'STRs are primary evidence for establishing in-service incurrence',
        suggestedDocuments: [
          'Complete Service Treatment Records',
          'Inpatient treatment records',
          'Sick call logs'
        ],
        alternativeEvidence: [
          'VA request STRs from archives',
          'Personal health records if kept',
          'Medical board documentation'
        ]
      });
    }

    // Personnel records
    const hasPersonnelRecords = uploadedDocs.some(doc => doc.type === 'personnel-records');
    if (!hasPersonnelRecords && profile.combatService) {
      gaps.push({
        gapType: 'service',
        severity: 'moderate',
        description: 'Missing personnel records for combat veteran',
        impact: 'Combat documentation can enable presumptions and strengthen claims',
        suggestedDocuments: [
          'Orders showing combat deployment',
          'Combat Action Ribbon documentation',
          'Unit commendations'
        ],
        alternativeEvidence: [
          'DD214 showing combat ribbons',
          'Deployment records',
          'Awards and decorations'
        ]
      });
    }

    // DBQ (Disability Benefits Questionnaire)
    const hasDBQ = uploadedDocs.some(doc => doc.type === 'dbq');
    const conditions = profile.serviceConnectedConditions?.length || 0;
    if (!hasDBQ && conditions > 0) {
      gaps.push({
        gapType: 'medical',
        severity: 'moderate',
        description: 'No Disability Benefits Questionnaires (DBQs) on file',
        impact: 'DBQs provide standardized medical evidence format preferred by VA',
        suggestedDocuments: [
          'Completed DBQ forms for each condition',
          'DBQ completed by private physician',
          'Request for VA C&P examination'
        ],
        alternativeEvidence: [
          'Comprehensive medical opinion letters',
          'Detailed treatment summaries',
          'Specialist evaluation reports'
        ]
      });
    }

    return gaps;
  }

  /**
   * Generate evidence recommendations
   */
  private generateEvidenceRecommendations(gaps: EvidenceGap[]): any[] {
    const recommendations = [];
    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    const majorGaps = gaps.filter(g => g.severity === 'major');

    if (criticalGaps.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: 'Address Critical Evidence Gaps',
        description: `${criticalGaps.length} critical documentation gap(s) detected`,
        actionType: 'document' as const,
        estimatedImpact: {
          type: 'eligibility',
          value: 60,
          unit: 'percentage points',
          description: 'Estimated improvement in claim success rate'
        },
        steps: criticalGaps.slice(0, 3).map((gap, i) => ({
          id: crypto.randomUUID(),
          order: i + 1,
          title: gap.description,
          description: gap.suggestedDocuments[0] || 'Obtain required documentation',
          completed: false,
          required: true,
          estimatedTime: '1-2 weeks'
        })),
        requiredData: criticalGaps.flatMap(g => g.suggestedDocuments).slice(0, 5),
        confidence: 'high' as const,
        rationale: [`${criticalGaps.length} critical gaps identified`, 'High impact on claim outcome'],
        automated: false,
        canOverride: false
      });
    }

    if (majorGaps.length > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: 'Strengthen Claim with Additional Evidence',
        description: `${majorGaps.length} major evidence gap(s) found`,
        actionType: 'document' as const,
        estimatedImpact: {
          type: 'eligibility',
          value: 30,
          unit: 'percentage points',
          description: 'Additional improvement potential'
        },
        steps: majorGaps.slice(0, 3).map((gap, i) => ({
          id: crypto.randomUUID(),
          order: i + 1,
          title: gap.description,
          description: gap.suggestedDocuments[0] || 'Obtain supporting documentation',
          completed: false,
          required: false,
          estimatedTime: '1 week'
        })),
        requiredData: majorGaps.flatMap(g => g.suggestedDocuments).slice(0, 5),
        confidence: 'medium' as const,
        rationale: ['Additional evidence recommended', 'Can improve claim strength'],
        automated: false,
        canOverride: true
      });
    }

    return recommendations;
  }

  /**
   * Calculate confidence in gap analysis
   */
  private calculateGapConfidence(gaps: EvidenceGap[], uploadedDocs: any[]): number {
    // High confidence if we have enough data to make determination
    const docCount = uploadedDocs.length;

    if (docCount === 0) {
      return 60; // Medium confidence - we know there are gaps
    }

    if (docCount < 5) {
      return 75; // High confidence - likely missing key docs
    }

    if (docCount >= 10) {
      return 90; // Very high confidence - thorough analysis possible
    }

    return 80; // High confidence - reasonable doc set
  }

  /**
   * Build rationale for gap analysis
   */
  private buildGapRationale(gaps: EvidenceGap[], uploadedDocs: any[]): string[] {
    const rationale: string[] = [];

    rationale.push(`Analyzed ${uploadedDocs.length} uploaded documents`);

    const critical = gaps.filter(g => g.severity === 'critical').length;
    const major = gaps.filter(g => g.severity === 'major').length;
    const moderate = gaps.filter(g => g.severity === 'moderate').length;
    const minor = gaps.filter(g => g.severity === 'minor').length;

    if (critical > 0) {
      rationale.push(`⚠️ ${critical} critical gap(s) - claim may be denied`);
    }
    if (major > 0) {
      rationale.push(`⚠️ ${major} major gap(s) - claim strength significantly reduced`);
    }
    if (moderate > 0) {
      rationale.push(`ℹ️ ${moderate} moderate gap(s) - opportunities for improvement`);
    }
    if (minor > 0) {
      rationale.push(`ℹ️ ${minor} minor gap(s) - minor enhancements possible`);
    }

    if (gaps.length === 0) {
      rationale.push('✅ Evidence appears complete for submitted claims');
    }

    return rationale;
  }

  /**
   * Check if document is recent (within 2 years)
   */
  private isRecentDoc(date: any): boolean {
    if (!date) return false;
    const docDate = new Date(date);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return docDate >= twoYearsAgo;
  }

  /**
   * Convert score to confidence level
   */
  private scoreToConfidence(score: number): ConfidenceLevel {
    if (score >= 90) return 'very-high';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'very-low';
  }

  /**
   * Get specific recommendations for a gap
   */
  public getGapRemediation(gap: EvidenceGap): {
    priority: string;
    steps: string[];
    resources: string[];
  } {
    const priority = gap.severity === 'critical' ? 'Urgent' :
                     gap.severity === 'major' ? 'High' :
                     gap.severity === 'moderate' ? 'Medium' : 'Low';

    const steps = [
      ...gap.suggestedDocuments.map(doc => `Obtain: ${doc}`),
      'Upload to rallyforge Evidence Vault',
      'Update claim status'
    ];

    const resources = [
      'VA records request (eBenefits)',
      'National Archives (NARA) for old records',
      'Private physician for new evaluations',
      'VSO assistance for complex cases'
    ];

    return { priority, steps, resources };
  }
}

