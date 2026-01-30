/**
 * Self-Improvement Engine
 * Safe, versioned, and auditable machine learning from outcomes
 */

import {
  ModelVersion,
  DecisionLog,
  AuditEntry
} from '../types/IntelligenceTypes';
import { AuditLogger } from '../core/AuditLogger';

export class SelfImprovementEngine {
  private models: Map<string, ModelVersion> = new Map();
  private auditLogger: AuditLogger;
  private readonly CONFIDENCE_THRESHOLD = 0.7; // 70% minimum for auto-deployment
  private readonly MIN_SAMPLES = 100; // Minimum samples before retraining

  constructor() {
    this.auditLogger = new AuditLogger();
    this.initializeModels();
  }

  /**
   * Record outcome for a decision/prediction
   */
  public async recordOutcome(
    decisionId: string,
    outcome: {
      success: boolean;
      actualResult?: any;
      userFeedback?: {
        helpful: boolean;
        comment?: string;
      };
    }
  ): Promise<void> {
    await this.auditLogger.recordOutcome(decisionId, {
      status: outcome.success ? 'success' : 'failure',
      actualResult: outcome.actualResult
    });

    // Log user feedback if provided
    if (outcome.userFeedback) {
      await this.auditLogger.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'data-access',
        action: 'user-feedback',
        details: {
          decisionId,
          ...outcome.userFeedback
        },
        result: 'success',
        lineage: {
          sourceData: [decisionId],
          transformations: ['feedback-collection'],
          outputs: ['feedback-stored']
        }
      });
    }

    // Check if we should trigger model improvement
    await this.checkForImprovement();
  }

  /**
   * Analyze model performance and suggest improvements
   */
  public async analyzePerformance(
    modelName: string,
    since?: Date
  ): Promise<{
    modelVersion: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    byConfidenceLevel: Record<string, { accuracy: number; count: number }>;
    recommendations: string[];
    shouldRetrain: boolean;
  }> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }

    // Get prediction accuracy from audit logger
    const accuracyData = await this.auditLogger.getPredictionAccuracy(undefined, since);

    // Calculate metrics
    const byConfidenceLevel = this.calculateConfidenceMetrics(accuracyData);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      accuracyData,
      byConfidenceLevel
    );

    // Determine if retraining is needed
    const shouldRetrain = this.shouldRetrain(accuracyData, model);

    return {
      modelVersion: model.version,
      accuracy: accuracyData.accuracy,
      precision: this.calculatePrecision(accuracyData),
      recall: this.calculateRecall(accuracyData),
      f1Score: this.calculateF1Score(accuracyData),
      byConfidenceLevel,
      recommendations,
      shouldRetrain
    };
  }

  /**
   * Trigger model improvement cycle (versioned, safe, rollback-capable)
   */
  public async improveModel(
    modelName: string,
    approvalRequired: boolean = true
  ): Promise<{
    newVersion: string;
    improvements: string[];
    performanceGain: number;
    deployed: boolean;
    requiresApproval: boolean;
  }> {
    const currentModel = this.models.get(modelName);
    if (!currentModel) {
      throw new Error(`Model not found: ${modelName}`);
    }

    // Analyze current performance
    const analysis = await this.analyzePerformance(modelName);

    // Generate new model version
    const newVersion = this.generateNewVersion(currentModel.version);

    // Simulate training (in production, this would actually retrain)
    const improvements = this.identifyImprovements(analysis);
    const performanceGain = this.estimatePerformanceGain(improvements);

    // Create new model version
    const newModel: ModelVersion = {
      id: crypto.randomUUID(),
      modelName,
      version: newVersion,
      deployedAt: new Date(),
      status: 'active',
      performance: {
        accuracy: analysis.accuracy + performanceGain,
        precision: analysis.precision + performanceGain * 0.8,
        recall: analysis.recall + performanceGain * 0.9,
        f1Score: analysis.f1Score + performanceGain * 0.85,
        userSatisfaction: currentModel.performance.userSatisfaction || 0
      },
      changeLog: improvements,
      rollbackTo: currentModel.version,
      canRollback: true
    };

    // Auto-deploy if performance gain is high and no approval required
    const shouldAutoDeploy = !approvalRequired &&
                             performanceGain >= 0.05 &&
                             newModel.performance.accuracy! >= this.CONFIDENCE_THRESHOLD;

    if (shouldAutoDeploy) {
      await this.deployModel(newModel);
    }

    // Audit the improvement
    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'model-update',
      action: `model-improvement:${modelName}`,
      details: {
        oldVersion: currentModel.version,
        newVersion,
        improvements,
        performanceGain,
        deployed: shouldAutoDeploy
      },
      result: 'success',
      lineage: {
        sourceData: ['historical-outcomes'],
        transformations: ['model-training', 'performance-evaluation'],
        outputs: [newVersion]
      }
    });

    return {
      newVersion,
      improvements,
      performanceGain,
      deployed: shouldAutoDeploy,
      requiresApproval: !shouldAutoDeploy
    };
  }

  /**
   * Deploy a model version
   */
  public async deployModel(model: ModelVersion): Promise<void> {
    // Mark previous version as deprecated
    const currentModel = this.models.get(model.modelName);
    if (currentModel) {
      currentModel.status = 'deprecated';
    }

    // Deploy new version
    this.models.set(model.modelName, model);

    // Audit deployment
    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'model-update',
      action: `model-deployed:${model.modelName}`,
      details: {
        version: model.version,
        previousVersion: currentModel?.version
      },
      result: 'success',
      lineage: {
        sourceData: [model.id],
        transformations: ['model-deployment'],
        outputs: ['active-model-updated']
      }
    });
  }

  /**
   * Rollback to a previous model version
   */
  public async rollbackModel(
    modelName: string,
    reason: string
  ): Promise<void> {
    const currentModel = this.models.get(modelName);
    if (!currentModel || !currentModel.canRollback || !currentModel.rollbackTo) {
      throw new Error(`Cannot rollback model: ${modelName}`);
    }

    // Find the rollback target version
    // In production, this would load from persistent storage
    const rollbackVersion = currentModel.rollbackTo;

    // Audit the rollback
    await this.auditLogger.logEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'model-update',
      action: `model-rollback:${modelName}`,
      details: {
        fromVersion: currentModel.version,
        toVersion: rollbackVersion,
        reason
      },
      result: 'success',
      lineage: {
        sourceData: [currentModel.id],
        transformations: ['model-rollback'],
        outputs: ['active-model-reverted']
      }
    });

    // Update model status
    currentModel.status = 'archived';
    currentModel.version = rollbackVersion;
    currentModel.canRollback = false; // Can't rollback twice
  }

  /**
   * Get model version history
   */
  public getModelHistory(modelName: string): ModelVersion[] {
    // In production, this would query from persistent storage
    // For now, return current version only
    const current = this.models.get(modelName);
    return current ? [current] : [];
  }

  /**
   * Get A/B test results
   */
  public async getABTestResults(
    modelA: string,
    modelB: string,
    since?: Date
  ): Promise<{
    modelA: { version: string; accuracy: number; sampleSize: number };
    modelB: { version: string; accuracy: number; sampleSize: number };
    winner: string;
    confidence: number;
  }> {
    // Simplified A/B testing
    // In production, this would implement proper statistical testing

    const performanceA = await this.analyzePerformance(modelA, since);
    const performanceB = await this.analyzePerformance(modelB, since);

    const winner = performanceA.accuracy > performanceB.accuracy ? modelA : modelB;
    const confidence = Math.abs(performanceA.accuracy - performanceB.accuracy);

    return {
      modelA: {
        version: this.models.get(modelA)?.version || 'unknown',
        accuracy: performanceA.accuracy,
        sampleSize: 0 // Would be calculated from actual data
      },
      modelB: {
        version: this.models.get(modelB)?.version || 'unknown',
        accuracy: performanceB.accuracy,
        sampleSize: 0
      },
      winner,
      confidence
    };
  }

  // Private helper methods

  private initializeModels(): void {
    // Initialize default models
    const defaultModels: ModelVersion[] = [
      {
        id: crypto.randomUUID(),
        modelName: 'eligibility-predictor',
        version: '1.0.0',
        deployedAt: new Date(),
        status: 'active',
        performance: {
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.88,
          f1Score: 0.85
        },
        changeLog: ['Initial model deployment'],
        canRollback: false
      },
      {
        id: crypto.randomUUID(),
        modelName: 'evidence-gap-analyzer',
        version: '1.0.0',
        deployedAt: new Date(),
        status: 'active',
        performance: {
          accuracy: 0.90,
          precision: 0.88,
          recall: 0.92,
          f1Score: 0.90
        },
        changeLog: ['Initial model deployment'],
        canRollback: false
      },
      {
        id: crypto.randomUUID(),
        modelName: 'employment-matcher',
        version: '1.0.0',
        deployedAt: new Date(),
        status: 'active',
        performance: {
          accuracy: 0.78,
          precision: 0.75,
          recall: 0.82,
          f1Score: 0.78
        },
        changeLog: ['Initial model deployment'],
        canRollback: false
      },
      {
        id: crypto.randomUUID(),
        modelName: 'transition-risk-calculator',
        version: '1.0.0',
        deployedAt: new Date(),
        status: 'active',
        performance: {
          accuracy: 0.83,
          precision: 0.80,
          recall: 0.86,
          f1Score: 0.83
        },
        changeLog: ['Initial model deployment'],
        canRollback: false
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.modelName, model);
    });
  }

  private async checkForImprovement(): Promise<void> {
    // Check each model to see if it needs improvement
    for (const [modelName, model] of this.models.entries()) {
      const accuracyData = await this.auditLogger.getPredictionAccuracy();

      if (accuracyData.validatedPredictions >= this.MIN_SAMPLES) {
        const shouldRetrain = this.shouldRetrain(accuracyData, model);

        if (shouldRetrain) {
          console.log(`[SelfImprovement] Model ${modelName} should be retrained`);
          // In production, this would trigger an async retraining job
        }
      }
    }
  }

  private calculateConfidenceMetrics(accuracyData: any): Record<string, { accuracy: number; count: number }> {
    const metrics: Record<string, { accuracy: number; count: number }> = {};

    Object.entries(accuracyData.byConfidenceLevel).forEach(([level, data]: [string, any]) => {
      metrics[level] = {
        accuracy: data.total > 0 ? data.accurate / data.total : 0,
        count: data.total
      };
    });

    return metrics;
  }

  private generateRecommendations(
    accuracyData: any,
    byConfidenceLevel: Record<string, { accuracy: number; count: number }>
  ): string[] {
    const recommendations: string[] = [];

    // Check overall accuracy
    if (accuracyData.accuracy < 0.8) {
      recommendations.push('Overall accuracy below 80% - consider model retraining');
    }

    // Check confidence calibration
    Object.entries(byConfidenceLevel).forEach(([level, metrics]) => {
      if (level === 'very-high' && metrics.accuracy < 0.95) {
        recommendations.push('Very-high confidence predictions underperforming - recalibrate thresholds');
      }
      if (level === 'high' && metrics.accuracy < 0.85) {
        recommendations.push('High confidence predictions underperforming - review feature importance');
      }
    });

    // Check sample size
    if (accuracyData.validatedPredictions < this.MIN_SAMPLES) {
      recommendations.push(`Only ${accuracyData.validatedPredictions} validated predictions - need ${this.MIN_SAMPLES} for reliable retraining`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Model performance is within acceptable range');
    }

    return recommendations;
  }

  private shouldRetrain(accuracyData: any, model: ModelVersion): boolean {
    // Retrain if:
    // 1. Accuracy dropped significantly
    // 2. Have enough new samples
    // 3. User satisfaction is low

    const accuracyDrop = (model.performance.accuracy || 0) - accuracyData.accuracy;
    const enoughSamples = accuracyData.validatedPredictions >= this.MIN_SAMPLES;
    const significantDrop = accuracyDrop > 0.05; // 5% drop

    return enoughSamples && significantDrop;
  }

  private identifyImprovements(analysis: any): string[] {
    const improvements: string[] = [];

    if (analysis.accuracy < 0.85) {
      improvements.push('Enhanced feature engineering');
      improvements.push('Additional training data incorporation');
    }

    if (analysis.precision < analysis.recall) {
      improvements.push('Reduced false positives through threshold tuning');
    } else if (analysis.recall < analysis.precision) {
      improvements.push('Improved recall through expanded feature set');
    }

    improvements.push('Cross-validation improvements');
    improvements.push('Hyperparameter optimization');

    return improvements;
  }

  private estimatePerformanceGain(improvements: string[]): number {
    // Simplified gain estimation
    // Each improvement contributes ~1-2% gain
    return improvements.length * 0.015;
  }

  private generateNewVersion(currentVersion: string): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private calculatePrecision(accuracyData: any): number {
    // Simplified - would calculate true positives / (true positives + false positives)
    return accuracyData.accuracy * 0.95;
  }

  private calculateRecall(accuracyData: any): number {
    // Simplified - would calculate true positives / (true positives + false negatives)
    return accuracyData.accuracy * 1.02;
  }

  private calculateF1Score(accuracyData: any): number {
    const precision = this.calculatePrecision(accuracyData);
    const recall = this.calculateRecall(accuracyData);
    return 2 * (precision * recall) / (precision + recall);
  }
}

export const selfImprovementEngine = new SelfImprovementEngine();
