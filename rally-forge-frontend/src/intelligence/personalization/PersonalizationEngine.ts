/**
 * Personalization Engine
 * Adapts content, recommendations, and UI based on veteran context and behavior
 */

import {
  PersonalizationContext,
  AdaptiveUIConfig,
  Insight,
  RecommendedAction
} from '../types/IntelligenceTypes';
import { VeteranProfile } from '../../types/benefitsTypes';

export class PersonalizationEngine {
  private readonly MODEL_VERSION = '1.0.0';
  private contextCache: Map<string, PersonalizationContext> = new Map();

  /**
   * Build comprehensive personalization context
   */
  public async buildContext(
    veteranId: string,
    profile: VeteranProfile,
    userHistory?: any
  ): Promise<PersonalizationContext> {
    // Check cache
    const cached = this.contextCache.get(veteranId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const context: PersonalizationContext = {
      veteranId,
      profile,
      goals: this.extractGoals(profile, userHistory),
      preferences: {
        communicationStyle: this.determineCommunicationStyle(profile, userHistory),
        priorityAreas: this.identifyPriorityAreas(profile),
        riskTolerance: this.assessRiskTolerance(profile, userHistory)
      },
      history: {
        completedActions: userHistory?.completedActions || [],
        dismissedRecommendations: userHistory?.dismissedRecommendations || [],
        feedback: userHistory?.feedback || []
      },
      context: {
        branch: profile.branch || 'Army',
        mos: profile.mos || '',
        era: this.determineEra(profile),
        location: {
          state: profile.location?.state || '',
          city: profile.location?.city,
          rural: this.isRuralLocation(profile.location)
        },
        financialReadiness: this.assessFinancialReadiness(profile),
        employmentReadiness: this.assessEmploymentReadiness(profile)
      }
    };

    // Cache for future use
    this.contextCache.set(veteranId, context);

    return context;
  }

  /**
   * Personalize insights based on context
   */
  public personalizeInsights(
    insights: Insight[],
    context: PersonalizationContext
  ): Insight[] {
    return insights.map(insight => {
      // Adjust description based on communication style
      const personalizedDescription = this.personalizeText(
        insight.description,
        context
      );

      // Filter recommended actions based on preferences and readiness
      const personalizedActions = this.filterRecommendedActions(
        insight.recommendedActions,
        context
      );

      // Adjust priority based on user goals
      const adjustedPriority = this.adjustPriority(insight, context);

      return {
        ...insight,
        description: personalizedDescription,
        recommendedActions: personalizedActions,
        priority: adjustedPriority
      };
    });
  }

  /**
   * Rank items by personal relevance
   */
  public rankByRelevance<T extends { id: string }>(
    items: T[],
    context: PersonalizationContext,
    scorer: (item: T, context: PersonalizationContext) => number
  ): T[] {
    const scored = items.map(item => ({
      item,
      score: scorer(item, context)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
  }

  /**
   * Generate adaptive UI configuration
   */
  public generateAdaptiveUI(
    veteranId: string,
    context: PersonalizationContext,
    usage: any
  ): AdaptiveUIConfig {
    return {
      veteranId,
      layout: {
        dashboardOrder: this.determineDashboardOrder(context, usage),
        hiddenSections: this.identifyHiddenSections(context, usage),
        pinnedItems: this.identifyPinnedItems(context, usage)
      },
      content: {
        languageLevel: context.preferences.communicationStyle === 'simple'
          ? 'basic'
          : context.preferences.communicationStyle === 'technical'
          ? 'advanced'
          : 'intermediate',
        branchSpecific: true,
        mosSpecific: !!context.context.mos
      },
      guidance: {
        showTooltips: context.preferences.communicationStyle !== 'technical',
        showExplanations: context.preferences.communicationStyle !== 'simple',
        guidedMode: context.history.completedActions.length < 5 // New users get guided mode
      },
      lastUpdated: new Date(),
      autoAdapted: true
    };
  }

  /**
   * Personalize text content based on communication style and context
   */
  private personalizeText(
    text: string,
    context: PersonalizationContext
  ): string {
    let personalized = text;

    // Branch-specific terminology
    personalized = this.applyBranchTerminology(personalized, context.context.branch);

    // MOS-specific context
    if (context.context.mos) {
      personalized = this.addMOSContext(personalized, context.context.mos);
    }

    // Communication style adjustment
    switch (context.preferences.communicationStyle) {
      case 'simple':
        personalized = this.simplifyLanguage(personalized);
        break;
      case 'technical':
        personalized = this.addTechnicalDetails(personalized);
        break;
      case 'detailed':
        personalized = this.expandExplanations(personalized);
        break;
    }

    return personalized;
  }

  /**
   * Apply branch-specific terminology
   */
  private applyBranchTerminology(text: string, branch: string): string {
    const terminology: Record<string, Record<string, string>> = {
      'Army': {
        'enlisted': 'Soldier',
        'unit': 'unit',
        'deployment': 'deployment'
      },
      'Navy': {
        'enlisted': 'Sailor',
        'unit': 'command',
        'deployment': 'cruise'
      },
      'Air Force': {
        'enlisted': 'Airman',
        'unit': 'squadron',
        'deployment': 'deployment'
      },
      'Marine Corps': {
        'enlisted': 'Marine',
        'unit': 'unit',
        'deployment': 'deployment'
      },
      'Coast Guard': {
        'enlisted': 'Coastguardsman',
        'unit': 'station',
        'deployment': 'patrol'
      }
    };

    const branchTerms = terminology[branch] || terminology['Army'];
    let updated = text;

    Object.entries(branchTerms).forEach(([generic, specific]) => {
      const regex = new RegExp(`\\b${generic}\\b`, 'gi');
      updated = updated.replace(regex, specific);
    });

    return updated;
  }

  /**
   * Add MOS-specific context
   */
  private addMOSContext(text: string, mos: string): string {
    // Would add MOS-specific examples and context
    // For now, return as-is
    return text;
  }

  /**
   * Simplify language for simple communication style
   */
  private simplifyLanguage(text: string): string {
    // Replace complex terms with simpler alternatives
    const simplifications: Record<string, string> = {
      'compensation': 'payment',
      'eligibility': 'qualification',
      'documentation': 'paperwork',
      'nexus': 'connection',
      'service-connected': 'related to your military service',
      'adjudication': 'decision'
    };

    let simplified = text;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    });

    return simplified;
  }

  /**
   * Add technical details for technical communication style
   */
  private addTechnicalDetails(text: string): string {
    // Would add regulatory references, CFR citations, etc.
    return text;
  }

  /**
   * Expand explanations for detailed communication style
   */
  private expandExplanations(text: string): string {
    // Would add more context and background information
    return text;
  }

  /**
   * Filter recommended actions based on readiness
   */
  private filterRecommendedActions(
    actions: RecommendedAction[],
    context: PersonalizationContext
  ): RecommendedAction[] {
    return actions.filter(action => {
      // Filter out financial actions if financial readiness is low
      if (action.estimatedImpact.type === 'financial' &&
          context.context.financialReadiness === 'low' &&
          action.estimatedImpact.value > 1000) {
        return false;
      }

      // Filter out employment actions if employment readiness is high
      if (action.actionType === 'application' &&
          context.context.employmentReadiness === 'high') {
        return false;
      }

      // Check against dismissed recommendations
      if (context.history.dismissedRecommendations.includes(action.id)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Adjust insight priority based on user goals
   */
  private adjustPriority(
    insight: Insight,
    context: PersonalizationContext
  ): Insight['priority'] {
    let priority = insight.priority;

    // Boost priority if aligns with user goals
    const alignsWithGoals = context.goals.some(goal =>
      insight.title.toLowerCase().includes(goal.toLowerCase()) ||
      insight.category.toLowerCase().includes(goal.toLowerCase())
    );

    if (alignsWithGoals && priority === 'medium') {
      priority = 'high';
    } else if (alignsWithGoals && priority === 'high') {
      priority = 'critical';
    }

    // Lower priority if in non-priority areas
    const isPriorityArea = context.preferences.priorityAreas?.some(area =>
      insight.category.toLowerCase().includes(area.toLowerCase())
    );

    if (!isPriorityArea && priority === 'critical') {
      priority = 'high';
    } else if (!isPriorityArea && priority === 'high') {
      priority = 'medium';
    }

    return priority;
  }

  /**
   * Determine dashboard order based on context and usage
   */
  private determineDashboardOrder(
    context: PersonalizationContext,
    usage: any
  ): string[] {
    const sections = [
      'overview',
      'benefits',
      'claims',
      'employment',
      'transition',
      'retirement',
      'resources'
    ];

    // Score each section
    const scored = sections.map(section => ({
      section,
      score: this.scoreSectionRelevance(section, context, usage)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .map(s => s.section);
  }

  /**
   * Score section relevance
   */
  private scoreSectionRelevance(
    section: string,
    context: PersonalizationContext,
    usage: any
  ): number {
    let score = 0;

    // Goal alignment
    if (context.goals.some(g => g.toLowerCase().includes(section))) {
      score += 50;
    }

    // Priority areas
    if (context.preferences.priorityAreas?.some(a => a.toLowerCase().includes(section))) {
      score += 40;
    }

    // Usage frequency
    const usageCount = usage?.sectionViews?.[section] || 0;
    score += Math.min(30, usageCount * 2);

    // Context-specific relevance
    if (section === 'transition' && this.isApproachingSeparation(context)) {
      score += 60;
    }
    if (section === 'employment' && context.context.employmentReadiness === 'low') {
      score += 50;
    }
    if (section === 'benefits' && (context.profile.disabilityRating || 0) > 0) {
      score += 40;
    }

    return score;
  }

  /**
   * Identify sections to hide
   */
  private identifyHiddenSections(
    context: PersonalizationContext,
    usage: any
  ): string[] {
    const hiddenSections: string[] = [];

    // Hide retirement if veteran is young and not approaching retirement
    if (context.profile.yearsOfService && context.profile.yearsOfService < 10) {
      hiddenSections.push('retirement');
    }

    // Hide sections never used after 30 days
    if (usage?.accountAge > 30) {
      Object.entries(usage?.sectionViews || {}).forEach(([section, views]) => {
        if (views === 0) {
          hiddenSections.push(section);
        }
      });
    }

    return hiddenSections;
  }

  /**
   * Identify items to pin
   */
  private identifyPinnedItems(
    context: PersonalizationContext,
    usage: any
  ): string[] {
    const pinnedItems: string[] = [];

    // Pin frequently accessed items
    if (usage?.frequentItems) {
      pinnedItems.push(...usage.frequentItems.slice(0, 3));
    }

    // Pin based on approaching deadlines
    if (this.isApproachingSeparation(context)) {
      pinnedItems.push('transition-checklist');
    }

    return pinnedItems;
  }

  // Helper methods

  private extractGoals(profile: VeteranProfile, userHistory: any): string[] {
    const goals: string[] = [];

    // Infer from profile
    if (profile.separationDate) {
      goals.push('successful transition');
    }
    if (!profile.employed) {
      goals.push('employment');
    }
    if ((profile.disabilityRating || 0) === 0 && profile.serviceConnectedConditions) {
      goals.push('disability benefits');
    }

    // Add explicit goals from history
    if (userHistory?.explicitGoals) {
      goals.push(...userHistory.explicitGoals);
    }

    return goals;
  }

  private determineCommunicationStyle(
    profile: VeteranProfile,
    userHistory: any
  ): PersonalizationContext['preferences']['communicationStyle'] {
    // Could be based on user settings, education level, or inferred from behavior
    if (userHistory?.preferredStyle) {
      return userHistory.preferredStyle;
    }

    const education = profile.education || '';
    if (education.includes('Advanced') || education.includes('Master')) {
      return 'technical';
    }
    if (education.includes('Bachelor')) {
      return 'detailed';
    }
    return 'simple';
  }

  private identifyPriorityAreas(profile: VeteranProfile): string[] {
    const priorities: string[] = [];

    if ((profile.disabilityRating || 0) > 0) {
      priorities.push('benefits', 'healthcare');
    }
    if (!profile.employed) {
      priorities.push('employment');
    }
    if (this.isApproachingSeparation({ profile } as PersonalizationContext)) {
      priorities.push('transition');
    }

    return priorities;
  }

  private assessRiskTolerance(
    profile: VeteranProfile,
    userHistory: any
  ): PersonalizationContext['preferences']['riskTolerance'] {
    // Could be based on financial decisions, career choices, etc.
    return userHistory?.riskTolerance || 'moderate';
  }

  private determineEra(profile: VeteranProfile): string {
    const year = profile.entryYear || new Date().getFullYear();

    if (year >= 2001) return 'post-9/11';
    if (year >= 1990) return 'gulf-war';
    if (year >= 1964 && year <= 1975) return 'vietnam';
    return 'other';
  }

  private isRuralLocation(location: any): boolean {
    // Would use actual rural/urban classification
    // For now, simple heuristic
    return location?.rural === true;
  }

  private assessFinancialReadiness(profile: VeteranProfile): 'low' | 'medium' | 'high' {
    // Simplified assessment
    const rating = profile.disabilityRating || 0;
    const employed = profile.employed || false;

    if (rating >= 50 || employed) return 'high';
    if (rating >= 10 || profile.yearsOfService && profile.yearsOfService >= 20) return 'medium';
    return 'low';
  }

  private assessEmploymentReadiness(profile: VeteranProfile): 'low' | 'medium' | 'high' {
    // Simplified assessment
    if (profile.employed) return 'high';
    if (profile.education?.includes('Bachelor') || profile.certifications?.length > 0) return 'medium';
    return 'low';
  }

  private isApproachingSeparation(context: PersonalizationContext): boolean {
    const separationDate = context.profile.separationDate;
    if (!separationDate) return false;

    const daysUntil = Math.floor(
      (new Date(separationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntil > 0 && daysUntil < 365;
  }

  private isCacheValid(context: PersonalizationContext): boolean {
    // Cache is valid for 1 hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return true; // Simplified - would check actual timestamp
  }
}

export const personalizationEngine = new PersonalizationEngine();
