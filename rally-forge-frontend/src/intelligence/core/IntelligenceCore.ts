/**
 * rallyforge Intelligence Core
 * Central reasoning hub for cross-engine insights, predictions, and adaptive behavior
 */

import {
  IntelligenceQuery,
  IntelligenceResponse,
  Insight,
  Prediction,
  RecommendedAction,
  DataContract,
  EngineType,
  DecisionLog,
  AuditEntry,
  PersonalizationContext
} from '../types/IntelligenceTypes';
import { EngineRegistry } from './EngineRegistry';
import { InsightGenerator } from './InsightGenerator';
import { ExplanationEngine } from './ExplanationEngine';
import { AuditLogger } from './AuditLogger';

/**
 * Core intelligence orchestration system
 */
export class IntelligenceCore {
  private static instance: IntelligenceCore;
  private engineRegistry: EngineRegistry;
  private insightGenerator: InsightGenerator;
  private explanationEngine: ExplanationEngine;
  private auditLogger: AuditLogger;
  private decisionCache: Map<string, IntelligenceResponse>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.engineRegistry = EngineRegistry.getInstance();
    this.insightGenerator = new InsightGenerator();
    this.explanationEngine = new ExplanationEngine();
    this.auditLogger = new AuditLogger();
    this.decisionCache = new Map();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): IntelligenceCore {
    if (!IntelligenceCore.instance) {
      IntelligenceCore.instance = new IntelligenceCore();
    }
    return IntelligenceCore.instance;
  }

  /**
   * Main intelligence query interface
   */
  public async query(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const startTime = Date.now();

    // Check cache
    const cacheKey = this.getCacheKey(query);
    const cached = this.decisionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.CACHE_TTL) {
      return cached;
    }

    // Audit the query
    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'decision',
      veteranId: query.veteranId,
      action: 'intelligence-query',
      details: { query },
      result: 'success',
      lineage: {
        sourceData: [],
        transformations: ['query-processing'],
        outputs: []
      }
    });

    // Gather data from engines
    const engineData = await this.gatherEngineData(
      query.veteranId,
      query.requiredEngines
    );

    // Generate insights
    const insights = await this.insightGenerator.generateInsights(
      engineData,
      query
    );

    // Generate predictions
    const predictions = await this.generatePredictions(
      engineData,
      query
    );

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      insights,
      predictions,
      query
    );

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      insights,
      predictions,
      recommendations
    );

    const response: IntelligenceResponse = {
      queryId: query.queryId,
      insights,
      predictions,
      recommendations,
      executionTime: Date.now() - startTime,
      enginesUsed: engineData.map(d => d.engineId),
      dataLineage: this.buildDataLineage(engineData),
      confidence,
      timestamp: new Date()
    };

    // Cache the response
    this.decisionCache.set(cacheKey, response);

    // Log decision
    await this.logDecision(query, response);

    return response;
  }

  /**
   * Get personalized insights for a veteran
   */
  public async getPersonalizedInsights(
    veteranId: string,
    context: PersonalizationContext
  ): Promise<Insight[]> {
    const query: IntelligenceQuery = {
      queryId: crypto.randomUUID(),
      veteranId,
      question: 'What opportunities and actions are most relevant for this veteran?',
      context: { personalization: context },
      includeExplanations: true,
      maxResults: 10
    };

    const response = await this.query(query);

    // Apply personalization filtering and ranking
    return this.rankInsightsByRelevance(response.insights, context);
  }

  /**
   * Get cross-engine predictions
   */
  public async getPredictions(
    veteranId: string,
    predictionTypes?: Array<Prediction['type']>
  ): Promise<Prediction[]> {
    const query: IntelligenceQuery = {
      queryId: crypto.randomUUID(),
      veteranId,
      question: 'Generate predictions across all domains',
      context: { predictionTypes },
      includeExplanations: true
    };

    const response = await this.query(query);
    return response.predictions;
  }

  /**
   * Get recommended actions with full explainability
   */
  public async getRecommendations(
    veteranId: string,
    context?: Record<string, any>
  ): Promise<RecommendedAction[]> {
    const query: IntelligenceQuery = {
      queryId: crypto.randomUUID(),
      veteranId,
      question: 'What actions should this veteran take?',
      context,
      includeExplanations: true,
      minConfidence: 0.6 // 60% minimum confidence
    };

    const response = await this.query(query);
    return response.recommendations;
  }

  /**
   * Explain a recommendation or prediction
   */
  public async explain(
    itemId: string,
    itemType: 'insight' | 'prediction' | 'recommendation'
  ): Promise<{
    explanation: string[];
    dataUsed: DataContract[];
    reasoning: string[];
    confidence: number;
  }> {
    return await this.explanationEngine.explain(itemId, itemType);
  }

  /**
   * Log user feedback on a recommendation
   */
  public async logFeedback(
    veteranId: string,
    itemId: string,
    helpful: boolean,
    comment?: string
  ): Promise<void> {
    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'data-access',
      veteranId,
      action: 'user-feedback',
      details: { itemId, helpful, comment },
      result: 'success',
      lineage: {
        sourceData: [itemId],
        transformations: ['feedback-collection'],
        outputs: ['feedback-stored']
      }
    });

    // This will be used by Phase 5 self-improvement
    this.recordOutcome(itemId, helpful ? 'success' : 'failure');
  }

  /**
   * Override a recommendation (with audit trail)
   */
  public async overrideRecommendation(
    userId: string,
    veteranId: string,
    recommendationId: string,
    reason: string
  ): Promise<void> {
    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'override',
      userId,
      veteranId,
      action: 'recommendation-override',
      details: { recommendationId, reason },
      result: 'success',
      lineage: {
        sourceData: [recommendationId],
        transformations: ['manual-override'],
        outputs: ['override-recorded']
      }
    });
  }

  /**
   * Get decision history with full audit trail
   */
  public async getDecisionHistory(
    veteranId: string,
    limit: number = 50
  ): Promise<DecisionLog[]> {
    return await this.auditLogger.getDecisionHistory(veteranId, limit);
  }

  /**
   * Get audit trail for compliance
   */
  public async getAuditTrail(
    filters: {
      veteranId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      eventType?: AuditEntry['eventType'];
    },
    limit: number = 100
  ): Promise<AuditEntry[]> {
    return await this.auditLogger.getAuditTrail(filters, limit);
  }

  // Private helper methods

  private async gatherEngineData(
    veteranId: string,
    requiredEngines?: EngineType[]
  ): Promise<DataContract[]> {
    const engines = requiredEngines || this.engineRegistry.getAllEngines();
    const dataContracts: DataContract[] = [];

    for (const engineId of engines) {
      const engine = this.engineRegistry.getEngine(engineId);
      if (engine) {
        const data = await engine.getData(veteranId);
        dataContracts.push({
          engineId,
          timestamp: new Date(),
          version: engine.getVersion(),
          data
        });
      }
    }

    return dataContracts;
  }

  private async generatePredictions(
    engineData: DataContract[],
    query: IntelligenceQuery
  ): Promise<Prediction[]> {
    // Phase 2 will implement specific predictors
    // For now, return empty array
    return [];
  }

  private async generateRecommendations(
    insights: Insight[],
    predictions: Prediction[],
    query: IntelligenceQuery
  ): Promise<RecommendedAction[]> {
    // Extract recommendations from high-confidence insights
    const recommendations: RecommendedAction[] = [];

    for (const insight of insights) {
      if (insight.confidenceScore >= (query.minConfidence || 0) * 100) {
        recommendations.push(...insight.recommendedActions);
      }
    }

    return recommendations;
  }

  private calculateOverallConfidence(
    insights: Insight[],
    predictions: Prediction[],
    recommendations: RecommendedAction[]
  ): number {
    const allItems = [
      ...insights.map(i => i.confidenceScore),
      ...predictions.map(p => p.confidenceScore)
    ];

    if (allItems.length === 0) return 0;

    return allItems.reduce((sum, score) => sum + score, 0) / allItems.length / 100;
  }

  private buildDataLineage(engineData: DataContract[]): string[] {
    return engineData.map(
      data => `${data.engineId}:${data.version}@${data.timestamp.toISOString()}`
    );
  }

  private rankInsightsByRelevance(
    insights: Insight[],
    context: PersonalizationContext
  ): Insight[] {
    return insights.sort((a, b) => {
      // Prioritize by:
      // 1. Priority level
      // 2. Confidence
      // 3. Relevance to user goals
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidenceScore - a.confidenceScore;
    });
  }

  private async logDecision(
    query: IntelligenceQuery,
    response: IntelligenceResponse
  ): Promise<void> {
    const log: DecisionLog = {
      id: query.queryId,
      timestamp: new Date(),
      veteranId: query.veteranId,
      engineId: 'benefits', // Multi-engine
      action: 'intelligence-query',
      input: query,
      output: response,
      reasoning: response.insights.flatMap(i => i.rationale),
      dataUsed: response.insights.flatMap(i => i.dataUsed),
      confidence: response.confidence,
      overridden: false
    };

    await this.auditLogger.logDecision(log);
  }

  private recordOutcome(itemId: string, outcome: 'success' | 'failure'): void {
    // Phase 5 will use this for self-improvement
    // For now, just log it
    console.log(`Outcome recorded for ${itemId}: ${outcome}`);
  }

  private getCacheKey(query: IntelligenceQuery): string {
    return `${query.veteranId}:${query.question}:${JSON.stringify(query.context || {})}`;
  }
}

// Export singleton instance
export const intelligenceCore = IntelligenceCore.getInstance();

