/**
 * Explanation Engine
 * Provides human-readable explanations for all recommendations and predictions
 */

import {
  DataContract,
  Insight,
  Prediction,
  RecommendedAction
} from '../types/IntelligenceTypes';

export class ExplanationEngine {
  private insights: Map<string, Insight> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private recommendations: Map<string, RecommendedAction> = new Map();

  /**
   * Store an insight for later explanation
   */
  public storeInsight(insight: Insight): void {
    this.insights.set(insight.id, insight);
  }

  /**
   * Store a prediction for later explanation
   */
  public storePrediction(prediction: Prediction): void {
    this.predictions.set(prediction.id, prediction);
  }

  /**
   * Store a recommendation for later explanation
   */
  public storeRecommendation(recommendation: RecommendedAction): void {
    this.recommendations.set(recommendation.id, recommendation);
  }

  /**
   * Generate a full explanation for any item
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
    switch (itemType) {
      case 'insight':
        return this.explainInsight(itemId);
      case 'prediction':
        return this.explainPrediction(itemId);
      case 'recommendation':
        return this.explainRecommendation(itemId);
      default:
        throw new Error(`Unknown item type: ${itemType}`);
    }
  }

  /**
   * Explain an insight
   */
  private async explainInsight(insightId: string): Promise<{
    explanation: string[];
    dataUsed: DataContract[];
    reasoning: string[];
    confidence: number;
  }> {
    const insight = this.insights.get(insightId);
    if (!insight) {
      throw new Error(`Insight not found: ${insightId}`);
    }

    const explanation: string[] = [
      `## ${insight.title}`,
      '',
      insight.description,
      '',
      '### Why This Matters',
      ...this.formatRationale(insight.rationale),
      '',
      '### Data Sources',
      ...this.formatDataSources(insight.dataUsed),
      '',
      '### Confidence Level',
      this.formatConfidence(insight.confidence, insight.confidenceScore),
      '',
      '### Recommended Actions',
      ...this.formatActions(insight.recommendedActions)
    ];

    return {
      explanation,
      dataUsed: insight.dataUsed,
      reasoning: insight.rationale,
      confidence: insight.confidenceScore
    };
  }

  /**
   * Explain a prediction
   */
  private async explainPrediction(predictionId: string): Promise<{
    explanation: string[];
    dataUsed: DataContract[];
    reasoning: string[];
    confidence: number;
  }> {
    const prediction = this.predictions.get(predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${predictionId}`);
    }

    const explanation: string[] = [
      `## Prediction: ${prediction.subject}`,
      '',
      `**Type:** ${prediction.type}`,
      `**Model Version:** ${prediction.modelVersion}`,
      `**Generated:** ${prediction.createdAt.toLocaleString()}`,
      '',
      '### Prediction Result',
      JSON.stringify(prediction.prediction, null, 2),
      '',
      '### How We Made This Prediction',
      ...this.formatRationale(prediction.rationale),
      '',
      '### Data Used',
      ...this.formatDataSources(prediction.dataUsed),
      '',
      '### Confidence Analysis',
      this.formatConfidence(prediction.confidence, prediction.confidenceScore),
      this.explainConfidenceLevel(prediction.confidenceScore),
      '',
      '### Next Steps',
      ...this.formatRecommendedActions(prediction.recommendedNextSteps)
    ];

    if (prediction.expiresAt) {
      explanation.push('', `**Note:** This prediction expires on ${prediction.expiresAt.toLocaleString()}`);
    }

    if (prediction.validationStatus) {
      explanation.push('', `**Validation Status:** ${prediction.validationStatus}`);
    }

    return {
      explanation,
      dataUsed: prediction.dataUsed,
      reasoning: prediction.rationale,
      confidence: prediction.confidenceScore
    };
  }

  /**
   * Explain a recommendation
   */
  private async explainRecommendation(recommendationId: string): Promise<{
    explanation: string[];
    dataUsed: DataContract[];
    reasoning: string[];
    confidence: number;
  }> {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error(`Recommendation not found: ${recommendationId}`);
    }

    const explanation: string[] = [
      `## ${recommendation.title}`,
      '',
      recommendation.description,
      '',
      '### Estimated Impact',
      `- **Type:** ${recommendation.estimatedImpact.type}`,
      `- **Value:** ${recommendation.estimatedImpact.value} ${recommendation.estimatedImpact.unit}`,
      `- **Description:** ${recommendation.estimatedImpact.description}`,
      '',
      '### Why We Recommend This',
      ...this.formatRationale(recommendation.rationale),
      '',
      '### Steps to Complete',
      ...this.formatSteps(recommendation.steps),
      '',
      '### Required Information',
      ...recommendation.requiredData.map(d => `- ${d}`),
      '',
      '### Confidence Level',
      this.formatConfidence(recommendation.confidence, 0),
      '',
      '### Automation Status',
      recommendation.automated
        ? '✅ This action can be partially automated by rallyforge'
        : '👤 This action requires manual completion',
      '',
      recommendation.canOverride
        ? '⚠️ You can choose to skip or modify this recommendation'
        : '🔒 This recommendation is based on regulatory requirements'
    ];

    return {
      explanation,
      dataUsed: [],
      reasoning: recommendation.rationale,
      confidence: 0 // Recommendations don't have numeric confidence in current model
    };
  }

  /**
   * Format rationale as bulleted list
   */
  private formatRationale(rationale: string[]): string[] {
    return rationale.map(r => `- ${r}`);
  }

  /**
   * Format data sources with metadata
   */
  private formatDataSources(dataUsed: DataContract[]): string[] {
    return dataUsed.map(data =>
      `- **${data.engineId}** (v${data.version}) - ${data.timestamp.toLocaleString()}`
    );
  }

  /**
   * Format confidence level
   */
  private formatConfidence(level: string, score: number): string {
    const emoji = {
      'very-low': '🔴',
      'low': '🟠',
      'medium': '🟡',
      'high': '🟢',
      'very-high': '🟢🟢'
    }[level] || '⚪';

    return score > 0
      ? `${emoji} **${level.toUpperCase()}** (${score}% confidence)`
      : `${emoji} **${level.toUpperCase()}**`;
  }

  /**
   * Explain what a confidence score means
   */
  private explainConfidenceLevel(score: number): string {
    if (score >= 90) {
      return 'This prediction is based on strong patterns in similar cases and comprehensive data.';
    } else if (score >= 70) {
      return 'This prediction is well-supported by data but has some uncertainty.';
    } else if (score >= 50) {
      return 'This prediction has moderate confidence - additional information could improve accuracy.';
    } else {
      return 'This prediction has low confidence and should be verified with additional sources.';
    }
  }

  /**
   * Format recommended actions
   */
  private formatActions(actions: RecommendedAction[]): string[] {
    return actions.map((action, i) =>
      `${i + 1}. **${action.title}** - ${action.description} (Impact: ${action.estimatedImpact.value} ${action.estimatedImpact.unit})`
    );
  }

  /**
   * Format simple action list
   */
  private formatRecommendedActions(actions: RecommendedAction[]): string[] {
    return actions.map((action, i) =>
      `${i + 1}. ${action.title}`
    );
  }

  /**
   * Format action steps
   */
  private formatSteps(steps: ActionStep[]): string[] {
    const sorted = steps.sort((a, b) => a.order - b.order);
    return sorted.map(step => {
      const checkbox = step.completed ? '✅' : '⬜';
      const required = step.required ? ' (Required)' : ' (Optional)';
      const time = step.estimatedTime ? ` - ~${step.estimatedTime}` : '';
      return `${checkbox} **Step ${step.order}: ${step.title}**${required}${time}\n   ${step.description}`;
    });
  }

  /**
   * Generate a plain-text summary (for accessibility)
   */
  public async generatePlainTextSummary(
    itemId: string,
    itemType: 'insight' | 'prediction' | 'recommendation'
  ): Promise<string> {
    const explanation = await this.explain(itemId, itemType);
    return explanation.explanation.join('\n');
  }

  /**
   * Generate a comparison explanation (e.g., "Why is option A better than option B?")
   */
  public async compareOptions(
    optionAId: string,
    optionBId: string,
    itemType: 'insight' | 'prediction' | 'recommendation'
  ): Promise<string[]> {
    const optionA = await this.explain(optionAId, itemType);
    const optionB = await this.explain(optionBId, itemType);

    const comparison: string[] = [
      '## Comparison',
      '',
      '### Option A',
      `- Confidence: ${optionA.confidence}%`,
      `- Data Sources: ${optionA.dataUsed.length}`,
      `- Reasoning Points: ${optionA.reasoning.length}`,
      '',
      '### Option B',
      `- Confidence: ${optionB.confidence}%`,
      `- Data Sources: ${optionB.dataUsed.length}`,
      `- Reasoning Points: ${optionB.reasoning.length}`,
      '',
      '### Recommendation',
      optionA.confidence > optionB.confidence
        ? '**Option A** has higher confidence and stronger supporting evidence.'
        : optionB.confidence > optionA.confidence
        ? '**Option B** has higher confidence and stronger supporting evidence.'
        : 'Both options have similar confidence levels. Review detailed reasoning to decide.'
    ];

    return comparison;
  }
}

import { ActionStep } from '../types/IntelligenceTypes';

