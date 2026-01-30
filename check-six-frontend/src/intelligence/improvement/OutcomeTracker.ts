/**
 * Outcome Tracker
 * Maps predictions to actual results for model accuracy tracking
 */

import { AuditLogger } from '../core/AuditLogger';

export interface PredictionOutcome {
  predictionId: string;
  predictionType: string;
  predictedValue: any;
  actualValue: any;
  confidence: number;
  correct: boolean;
  partiallyCorrect?: boolean;
  timestamp: Date;
  feedbackReceived?: {
    helpful: boolean;
    comment?: string;
    timestamp: Date;
  };
}

export interface OutcomeSummary {
  totalPredictions: number;
  validatedPredictions: number;
  accuracy: number;
  byType: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  byConfidenceLevel: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  trends: {
    accuracyTrend: 'improving' | 'declining' | 'stable';
    recentAccuracy: number; // Last 30 days
    overallAccuracy: number;
  };
}

export class OutcomeTracker {
  private outcomes: Map<string, PredictionOutcome> = new Map();
  private auditLogger: AuditLogger;

  constructor() {
    this.auditLogger = new AuditLogger();
    this.loadOutcomesFromStorage();
  }

  /**
   * Record a prediction outcome
   */
  public recordOutcome(
    predictionId: string,
    predictionType: string,
    predictedValue: any,
    actualValue: any,
    confidence: number
  ): void {
    const correct = this.evaluateCorrectness(predictedValue, actualValue);
    const partiallyCorrect = this.evaluatePartialCorrectness(predictedValue, actualValue);

    const outcome: PredictionOutcome = {
      predictionId,
      predictionType,
      predictedValue,
      actualValue,
      confidence,
      correct,
      partiallyCorrect,
      timestamp: new Date()
    };

    this.outcomes.set(predictionId, outcome);
    this.saveOutcomesToStorage();

    // Audit the outcome
    this.auditLogger.recordOutcome(predictionId, {
      status: correct ? 'success' : 'failure',
      actualResult: actualValue
    });
  }

  /**
   * Add user feedback to a prediction outcome
   */
  public addFeedback(
    predictionId: string,
    helpful: boolean,
    comment?: string
  ): void {
    const outcome = this.outcomes.get(predictionId);
    if (!outcome) {
      console.warn(`Outcome not found for prediction: ${predictionId}`);
      return;
    }

    outcome.feedbackReceived = {
      helpful,
      comment,
      timestamp: new Date()
    };

    this.outcomes.set(predictionId, outcome);
    this.saveOutcomesToStorage();

    // Audit the feedback
    this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'data-access',
      action: 'user-feedback-added',
      details: {
        predictionId,
        helpful,
        comment
      },
      result: 'success',
      lineage: {
        sourceData: [predictionId],
        transformations: ['feedback-collection'],
        outputs: ['feedback-stored']
      }
    });
  }

  /**
   * Get outcome summary
   */
  public getSummary(since?: Date): OutcomeSummary {
    const filteredOutcomes = Array.from(this.outcomes.values()).filter(
      outcome => !since || outcome.timestamp >= since
    );

    const totalPredictions = filteredOutcomes.length;
    const validatedPredictions = filteredOutcomes.filter(o => o.actualValue !== undefined).length;
    const correctPredictions = filteredOutcomes.filter(o => o.correct).length;
    const accuracy = validatedPredictions > 0 ? correctPredictions / validatedPredictions : 0;

    // Group by type
    const byType: Record<string, { total: number; correct: number; accuracy: number }> = {};
    filteredOutcomes.forEach(outcome => {
      if (!byType[outcome.predictionType]) {
        byType[outcome.predictionType] = { total: 0, correct: 0, accuracy: 0 };
      }
      byType[outcome.predictionType].total++;
      if (outcome.correct) {
        byType[outcome.predictionType].correct++;
      }
    });

    Object.keys(byType).forEach(type => {
      byType[type].accuracy = byType[type].total > 0
        ? byType[type].correct / byType[type].total
        : 0;
    });

    // Group by confidence level
    const byConfidenceLevel = this.groupByConfidenceLevel(filteredOutcomes);

    // Calculate trends
    const trends = this.calculateTrends();

    return {
      totalPredictions,
      validatedPredictions,
      accuracy,
      byType,
      byConfidenceLevel,
      trends
    };
  }

  /**
   * Get outcomes for a specific prediction type
   */
  public getOutcomesByType(predictionType: string): PredictionOutcome[] {
    return Array.from(this.outcomes.values()).filter(
      outcome => outcome.predictionType === predictionType
    );
  }

  /**
   * Get recent outcomes (last N days)
   */
  public getRecentOutcomes(days: number = 30): PredictionOutcome[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Array.from(this.outcomes.values()).filter(
      outcome => outcome.timestamp >= cutoffDate
    );
  }

  /**
   * Get outcomes with user feedback
   */
  public getOutcomesWithFeedback(): PredictionOutcome[] {
    return Array.from(this.outcomes.values()).filter(
      outcome => outcome.feedbackReceived !== undefined
    );
  }

  /**
   * Export outcomes for analysis
   */
  public exportOutcomes(format: 'json' | 'csv' = 'json'): string {
    const outcomes = Array.from(this.outcomes.values());

    if (format === 'json') {
      return JSON.stringify(outcomes, null, 2);
    }

    // CSV format
    const headers = [
      'predictionId',
      'predictionType',
      'predictedValue',
      'actualValue',
      'confidence',
      'correct',
      'partiallyCorrect',
      'timestamp',
      'feedbackHelpful',
      'feedbackComment'
    ];

    const rows = outcomes.map(outcome => [
      outcome.predictionId,
      outcome.predictionType,
      JSON.stringify(outcome.predictedValue),
      JSON.stringify(outcome.actualValue),
      outcome.confidence,
      outcome.correct,
      outcome.partiallyCorrect || false,
      outcome.timestamp.toISOString(),
      outcome.feedbackReceived?.helpful || '',
      outcome.feedbackReceived?.comment || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Private helper methods

  private evaluateCorrectness(predicted: any, actual: any): boolean {
    // Handle different types of predictions
    if (typeof predicted === 'boolean' && typeof actual === 'boolean') {
      return predicted === actual;
    }

    if (typeof predicted === 'number' && typeof actual === 'number') {
      // For numeric predictions, allow 10% tolerance
      const tolerance = Math.abs(predicted) * 0.1;
      return Math.abs(predicted - actual) <= tolerance;
    }

    if (typeof predicted === 'string' && typeof actual === 'string') {
      return predicted.toLowerCase() === actual.toLowerCase();
    }

    if (typeof predicted === 'object' && typeof actual === 'object') {
      // For object predictions (like eligibility), check key properties
      if (predicted.eligible !== undefined && actual.eligible !== undefined) {
        return predicted.eligible === actual.eligible;
      }
    }

    return JSON.stringify(predicted) === JSON.stringify(actual);
  }

  private evaluatePartialCorrectness(predicted: any, actual: any): boolean {
    // For complex predictions, check if partially correct
    if (typeof predicted === 'object' && typeof actual === 'object') {
      const predictedKeys = Object.keys(predicted);
      const matchingKeys = predictedKeys.filter(
        key => predicted[key] === actual[key]
      );

      return matchingKeys.length > 0 && matchingKeys.length < predictedKeys.length;
    }

    return false;
  }

  private groupByConfidenceLevel(
    outcomes: PredictionOutcome[]
  ): Record<string, { total: number; correct: number; accuracy: number }> {
    const levels = {
      'very-high': { total: 0, correct: 0, accuracy: 0 },
      'high': { total: 0, correct: 0, accuracy: 0 },
      'medium': { total: 0, correct: 0, accuracy: 0 },
      'low': { total: 0, correct: 0, accuracy: 0 }
    };

    outcomes.forEach(outcome => {
      let level: keyof typeof levels;
      if (outcome.confidence >= 90) level = 'very-high';
      else if (outcome.confidence >= 75) level = 'high';
      else if (outcome.confidence >= 50) level = 'medium';
      else level = 'low';

      levels[level].total++;
      if (outcome.correct) {
        levels[level].correct++;
      }
    });

    Object.keys(levels).forEach(level => {
      const key = level as keyof typeof levels;
      levels[key].accuracy = levels[key].total > 0
        ? levels[key].correct / levels[key].total
        : 0;
    });

    return levels;
  }

  private calculateTrends(): {
    accuracyTrend: 'improving' | 'declining' | 'stable';
    recentAccuracy: number;
    overallAccuracy: number;
  } {
    const recentOutcomes = this.getRecentOutcomes(30);
    const allOutcomes = Array.from(this.outcomes.values());

    const recentCorrect = recentOutcomes.filter(o => o.correct).length;
    const recentAccuracy = recentOutcomes.length > 0
      ? recentCorrect / recentOutcomes.length
      : 0;

    const overallCorrect = allOutcomes.filter(o => o.correct).length;
    const overallAccuracy = allOutcomes.length > 0
      ? overallCorrect / allOutcomes.length
      : 0;

    let accuracyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAccuracy > overallAccuracy + 0.05) {
      accuracyTrend = 'improving';
    } else if (recentAccuracy < overallAccuracy - 0.05) {
      accuracyTrend = 'declining';
    }

    return {
      accuracyTrend,
      recentAccuracy,
      overallAccuracy
    };
  }

  private loadOutcomesFromStorage(): void {
    try {
      const stored = localStorage.getItem('intelligence-outcomes');
      if (stored) {
        const outcomes: PredictionOutcome[] = JSON.parse(stored);
        outcomes.forEach(outcome => {
          // Restore Date objects
          outcome.timestamp = new Date(outcome.timestamp);
          if (outcome.feedbackReceived) {
            outcome.feedbackReceived.timestamp = new Date(outcome.feedbackReceived.timestamp);
          }
          this.outcomes.set(outcome.predictionId, outcome);
        });
      }
    } catch (error) {
      console.error('Failed to load outcomes from storage:', error);
    }
  }

  private saveOutcomesToStorage(): void {
    try {
      const outcomes = Array.from(this.outcomes.values());
      localStorage.setItem('intelligence-outcomes', JSON.stringify(outcomes));
    } catch (error) {
      console.error('Failed to save outcomes to storage:', error);
    }
  }
}

export const outcomeTracker = new OutcomeTracker();
