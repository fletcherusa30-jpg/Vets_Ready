/**
 * Workflow Automation Framework
 * Intelligent automation for claims, applications, and document generation
 */

import {
  WorkflowAutomation,
  RecommendedAction,
  AuditEntry
} from '../types/IntelligenceTypes';
import { VeteranProfile } from '../../types/benefitsTypes';
import { AuditLogger } from '../core/AuditLogger';

export class WorkflowAutomationEngine {
  private workflows: Map<string, WorkflowAutomation> = new Map();
  private auditLogger: AuditLogger;

  constructor() {
    this.auditLogger = new AuditLogger();
    this.initializeDefaultWorkflows();
  }

  /**
   * Execute a workflow
   */
  public async executeWorkflow(
    workflowId: string,
    context: {
      veteranId: string;
      profile: VeteranProfile;
      data?: any;
    }
  ): Promise<{
    success: boolean;
    results: any[];
    errors: string[];
    auditTrail: string[];
  }> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (!workflow.enabled) {
      throw new Error(`Workflow is disabled: ${workflow.name}`);
    }

    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'decision',
      veteranId: context.veteranId,
      action: `workflow-start:${workflowId}`,
      details: { workflowName: workflow.name },
      result: 'success',
      lineage: {
        sourceData: [context.veteranId],
        transformations: ['workflow-execution'],
        outputs: []
      }
    });

    const results: any[] = [];
    const errors: string[] = [];
    const auditTrail: string[] = [];
    let stepsPending = 0;

    for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
      try {
        auditTrail.push(`Step ${step.order}: ${step.action} - ${step.automated ? 'Automated' : 'Manual'}`);

        if (step.automated) {
          const result = await this.executeAutomatedStep(step, context);
          results.push(result);
          auditTrail.push(`  ✓ Completed: ${result.summary || 'Success'}`);
        } else if (step.requiresApproval) {
          stepsPending++;
          auditTrail.push(`  ⏸ Pending user approval`);
        } else {
          stepsPending++;
          auditTrail.push(`  ⏸ Pending manual completion`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Step ${step.order} failed: ${errorMsg}`);
        auditTrail.push(`  ✗ Failed: ${errorMsg}`);
      }
    }

    // Update workflow stats
    workflow.lastRun = new Date();
    workflow.runCount++;
    if (errors.length === 0) {
      workflow.successRate = (workflow.successRate * (workflow.runCount - 1) + 1) / workflow.runCount;
    } else {
      workflow.successRate = (workflow.successRate * (workflow.runCount - 1)) / workflow.runCount;
    }

    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'decision',
      veteranId: context.veteranId,
      action: `workflow-complete:${workflowId}`,
      details: {
        workflowName: workflow.name,
        stepsCompleted: results.length,
        stepsPending,
        errors: errors.length
      },
      result: errors.length === 0 ? 'success' : 'failure',
      lineage: {
        sourceData: [context.veteranId],
        transformations: ['workflow-execution'],
        outputs: results.map((r, i) => `step-${i}-output`)
      }
    });

    return {
      success: errors.length === 0,
      results,
      errors,
      auditTrail
    };
  }

  /**
   * Create a new workflow
   */
  public createWorkflow(workflow: WorkflowAutomation): string {
    const id = workflow.id || crypto.randomUUID();
    this.workflows.set(id, { ...workflow, id });
    return id;
  }

  /**
   * Get workflow by ID
   */
  public getWorkflow(id: string): WorkflowAutomation | undefined {
    return this.workflows.get(id);
  }

  /**
   * List all workflows
   */
  public listWorkflows(filter?: {
    enabled?: boolean;
    triggerType?: string;
  }): WorkflowAutomation[] {
    let workflows = Array.from(this.workflows.values());

    if (filter?.enabled !== undefined) {
      workflows = workflows.filter(w => w.enabled === filter.enabled);
    }

    if (filter?.triggerType) {
      workflows = workflows.filter(w => w.trigger.type === filter.triggerType);
    }

    return workflows;
  }

  /**
   * Execute an automated step
   */
  private async executeAutomatedStep(
    step: WorkflowAutomation['steps'][0],
    context: any
  ): Promise<any> {
    // Route to appropriate automation handler
    switch (step.action) {
      case 'generate-claim-packet':
        return await this.generateClaimPacket(context);
      case 'generate-crsc-application':
        return await this.generateCRSCApplication(context);
      case 'map-evidence':
        return await this.mapEvidence(context);
      case 'generate-resume':
        return await this.generateResume(context);
      case 'check-eligibility':
        return await this.checkEligibility(context);
      default:
        throw new Error(`Unknown automated action: ${step.action}`);
    }
  }

  /**
   * Generate VA claim packet
   */
  private async generateClaimPacket(context: any): Promise<any> {
    const { profile, data } = context;

    const packet = {
      claimType: data?.claimType || 'disability',
      conditions: data?.conditions || profile.serviceConnectedConditions || [],
      personalInfo: {
        name: `${profile.firstName} ${profile.lastName}`,
        ssn: profile.ssn,
        dob: profile.dateOfBirth,
        branch: profile.branch,
        serviceNumber: profile.serviceNumber
      },
      serviceInfo: {
        entryDate: profile.entryDate,
        separationDate: profile.separationDate,
        rank: profile.rank,
        mos: profile.mos
      },
      forms: [
        '21-526EZ (Application for Disability Compensation)',
        data?.includeDependent ? '21-686c (Declaration of Status of Dependents)' : null,
        data?.includeDirectDeposit ? '21-0781 (PTSD Support)' : null
      ].filter(Boolean),
      evidenceChecklist: this.buildEvidenceChecklist(data?.conditions || []),
      generatedAt: new Date(),
      summary: `Generated ${data?.conditions?.length || 0} condition claim packet`
    };

    return packet;
  }

  /**
   * Generate CRSC application
   */
  private async generateCRSCApplication(context: any): Promise<any> {
    const { profile } = context;

    return {
      applicationType: 'CRSC',
      form: 'DD Form 149',
      applicant: {
        name: `${profile.firstName} ${profile.lastName}`,
        ssn: profile.ssn,
        branch: profile.branch
      },
      combatService: {
        deployments: profile.deployments || [],
        combatAwards: profile.awards?.filter((a: string) =>
          a.includes('Combat') || a.includes('Purple Heart')
        ) || []
      },
      disabilityInfo: {
        rating: profile.disabilityRating,
        conditions: profile.serviceConnectedConditions
      },
      requiredDocuments: [
        'DD214',
        'VA rating decision',
        'Combat documentation',
        'Medical records showing combat-related disability'
      ],
      generatedAt: new Date(),
      summary: 'Generated CRSC application packet'
    };
  }

  /**
   * Map evidence to claimed conditions
   */
  private async mapEvidence(context: any): Promise<any> {
    const { data } = context;
    const conditions = data?.conditions || [];
    const evidence = data?.evidence || [];

    const mapping = conditions.map((condition: string) => {
      const relatedEvidence = evidence.filter((e: any) =>
        e.condition === condition || e.tags?.includes(condition)
      );

      return {
        condition,
        evidence: relatedEvidence,
        gaps: this.identifyEvidenceGaps(condition, relatedEvidence),
        strength: this.assessEvidenceStrength(relatedEvidence)
      };
    });

    return {
      mapping,
      overallStrength: this.calculateOverallStrength(mapping),
      summary: `Mapped evidence for ${conditions.length} conditions`,
      generatedAt: new Date()
    };
  }

  /**
   * Generate professional resume
   */
  private async generateResume(context: any): Promise<any> {
    const { profile } = context;

    return {
      personalInfo: {
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        phone: profile.phone,
        location: `${profile.location?.city}, ${profile.location?.state}`
      },
      summary: this.generateProfessionalSummary(profile),
      experience: this.translateMilitaryExperience(profile),
      education: profile.education || 'High School Diploma',
      skills: this.extractSkills(profile),
      certifications: profile.certifications || [],
      securityClearance: profile.clearanceLevel,
      generatedAt: new Date(),
      summary: 'Generated professional resume with MOS translation'
    };
  }

  /**
   * Check benefit eligibility
   */
  private async checkEligibility(context: any): Promise<any> {
    const { profile, data } = context;
    const benefitType = data?.benefitType;

    // Simplified eligibility check
    const eligible = this.performEligibilityCheck(profile, benefitType);

    return {
      benefitType,
      eligible,
      reasons: eligible.reasons,
      nextSteps: eligible.nextSteps,
      generatedAt: new Date(),
      summary: `Checked eligibility for ${benefitType}: ${eligible.result ? 'Eligible' : 'Not Eligible'}`
    };
  }

  /**
   * Initialize default automation workflows
   */
  private initializeDefaultWorkflows(): void {
    // Workflow 1: Disability Claim Preparation
    this.createWorkflow({
      id: 'disability-claim-prep',
      name: 'Disability Claim Preparation',
      description: 'Automated assistance for preparing VA disability claims',
      trigger: {
        type: 'user-action',
        config: { action: 'start-disability-claim' }
      },
      steps: [
        {
          id: crypto.randomUUID(),
          order: 1,
          action: 'check-eligibility',
          automated: true,
          requiresApproval: false,
          config: { benefitType: 'va-disability' }
        },
        {
          id: crypto.randomUUID(),
          order: 2,
          action: 'map-evidence',
          automated: true,
          requiresApproval: false,
          config: {}
        },
        {
          id: crypto.randomUUID(),
          order: 3,
          action: 'generate-claim-packet',
          automated: true,
          requiresApproval: true, // User reviews before submission
          config: {}
        }
      ],
      enabled: true,
      createdAt: new Date(),
      runCount: 0,
      successRate: 0
    });

    // Workflow 2: CRSC Application
    this.createWorkflow({
      id: 'crsc-application',
      name: 'CRSC Application Workflow',
      description: 'Automated CRSC application preparation',
      trigger: {
        type: 'prediction',
        config: { predictionType: 'crsc-eligibility', minConfidence: 0.8 }
      },
      steps: [
        {
          id: crypto.randomUUID(),
          order: 1,
          action: 'generate-crsc-application',
          automated: true,
          requiresApproval: true,
          config: {}
        }
      ],
      enabled: true,
      createdAt: new Date(),
      runCount: 0,
      successRate: 0
    });

    // Workflow 3: Job Application Assistance
    this.createWorkflow({
      id: 'job-application-assist',
      name: 'Job Application Assistance',
      description: 'Automated resume generation and job application prep',
      trigger: {
        type: 'user-action',
        config: { action: 'apply-to-job' }
      },
      steps: [
        {
          id: crypto.randomUUID(),
          order: 1,
          action: 'generate-resume',
          automated: true,
          requiresApproval: true,
          config: {}
        }
      ],
      enabled: true,
      createdAt: new Date(),
      runCount: 0,
      successRate: 0
    });
  }

  // Helper methods

  private buildEvidenceChecklist(conditions: string[]): string[] {
    const checklist = ['DD Form 214'];

    conditions.forEach(condition => {
      checklist.push(`Medical records for ${condition}`);
      checklist.push(`Nexus letter for ${condition}`);
    });

    checklist.push('Service Treatment Records');
    checklist.push('Private medical records (if applicable)');

    return checklist;
  }

  private identifyEvidenceGaps(condition: string, evidence: any[]): string[] {
    const gaps: string[] = [];

    const hasNexus = evidence.some(e => e.type === 'nexus-letter');
    const hasMedical = evidence.some(e => e.type === 'medical-record');
    const hasService = evidence.some(e => e.type === 'service-record');

    if (!hasNexus) gaps.push('Nexus letter');
    if (!hasMedical) gaps.push('Current medical diagnosis');
    if (!hasService) gaps.push('Service documentation');

    return gaps;
  }

  private assessEvidenceStrength(evidence: any[]): 'weak' | 'moderate' | 'strong' {
    if (evidence.length === 0) return 'weak';
    if (evidence.length < 3) return 'moderate';

    const hasNexus = evidence.some(e => e.type === 'nexus-letter');
    return hasNexus ? 'strong' : 'moderate';
  }

  private calculateOverallStrength(mapping: any[]): number {
    const strengths = mapping.map(m => {
      if (m.strength === 'strong') return 3;
      if (m.strength === 'moderate') return 2;
      return 1;
    });

    const avg = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
    return Math.round((avg / 3) * 100);
  }

  private generateProfessionalSummary(profile: VeteranProfile): string {
    const years = profile.yearsOfService || 0;
    const branch = profile.branch || 'Military';
    const mos = profile.mos || '';

    return `Motivated ${branch} veteran with ${years} years of experience in ${mos}. ` +
           `Proven track record of leadership, adaptability, and mission accomplishment. ` +
           `Seeking to leverage military experience and skills in civilian career.`;
  }

  private translateMilitaryExperience(profile: VeteranProfile): any[] {
    return [{
      title: this.translateMOSToJobTitle(profile.mos || ''),
      organization: profile.branch || 'Military',
      startDate: profile.entryDate,
      endDate: profile.separationDate || 'Present',
      responsibilities: [
        'Led teams in high-pressure environments',
        'Maintained equipment and ensured operational readiness',
        'Demonstrated strong problem-solving and decision-making skills'
      ]
    }];
  }

  private translateMOSToJobTitle(mos: string): string {
    const translations: Record<string, string> = {
      '11B': 'Security Specialist / Operations Manager',
      '25B': 'IT Systems Administrator',
      '68W': 'Emergency Medical Technician / Healthcare Provider'
    };

    return translations[mos] || 'Military Professional';
  }

  private extractSkills(profile: VeteranProfile): string[] {
    const skills = [
      'Leadership',
      'Team Management',
      'Problem Solving',
      'Time Management',
      'Adaptability'
    ];

    if (profile.clearanceLevel) {
      skills.push(`Security Clearance (${profile.clearanceLevel})`);
    }

    return skills;
  }

  private performEligibilityCheck(profile: VeteranProfile, benefitType: string): any {
    // Simplified check
    return {
      result: true,
      reasons: ['Meets service requirements', 'Eligibility criteria satisfied'],
      nextSteps: ['Complete application', 'Gather required documents']
    };
  }
}

export const workflowAutomationEngine = new WorkflowAutomationEngine();
