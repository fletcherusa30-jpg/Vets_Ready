/**
 * Audit Logger
 * Comprehensive audit trail for all intelligence decisions, data access, and overrides
 */

import {
  AuditEntry,
  DecisionLog,
  EngineType
} from '../types/IntelligenceTypes';

export class AuditLogger {
  private auditEntries: AuditEntry[] = [];
  private decisionLogs: DecisionLog[] = [];
  private readonly MAX_ENTRIES = 10000;
  private readonly STORAGE_KEY_AUDIT = 'rallyforge_audit_log';
  private readonly STORAGE_KEY_DECISIONS = 'rallyforge_decision_log';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Log an audit event
   */
  public async logEvent(entry: AuditEntry): Promise<void> {
    this.auditEntries.push(entry);

    // Trim if exceeds max
    if (this.auditEntries.length > this.MAX_ENTRIES) {
      this.auditEntries = this.auditEntries.slice(-this.MAX_ENTRIES);
    }

    await this.persistToStorage();

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Audit]', entry.eventType, entry.action, entry.details);
    }
  }

  /**
   * Log a decision
   */
  public async logDecision(log: DecisionLog): Promise<void> {
    this.decisionLogs.push(log);

    // Trim if exceeds max
    if (this.decisionLogs.length > this.MAX_ENTRIES) {
      this.decisionLogs = this.decisionLogs.slice(-this.MAX_ENTRIES);
    }

    // Also create audit entry
    await this.logEvent({
      id: log.id,
      timestamp: log.timestamp,
      eventType: 'decision',
      userId: log.userId,
      veteranId: log.veteranId,
      engineId: log.engineId,
      action: log.action,
      details: {
        input: log.input,
        output: log.output,
        reasoning: log.reasoning,
        confidence: log.confidence,
        overridden: log.overridden
      },
      result: log.overridden ? 'warning' : 'success',
      lineage: {
        sourceData: log.dataUsed.map(d => `${d.engineId}:${d.version}`),
        transformations: ['intelligence-processing'],
        outputs: [log.id]
      }
    });

    await this.persistToStorage();
  }

  /**
   * Get decision history for a veteran
   */
  public async getDecisionHistory(
    veteranId: string,
    limit: number = 50
  ): Promise<DecisionLog[]> {
    return this.decisionLogs
      .filter(log => log.veteranId === veteranId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get audit trail with filters
   */
  public async getAuditTrail(
    filters: {
      veteranId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      eventType?: AuditEntry['eventType'];
      engineId?: EngineType;
    },
    limit: number = 100
  ): Promise<AuditEntry[]> {
    let entries = this.auditEntries;

    // Apply filters
    if (filters.veteranId) {
      entries = entries.filter(e => e.veteranId === filters.veteranId);
    }
    if (filters.userId) {
      entries = entries.filter(e => e.userId === filters.userId);
    }
    if (filters.startDate) {
      entries = entries.filter(e => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      entries = entries.filter(e => e.timestamp <= filters.endDate!);
    }
    if (filters.eventType) {
      entries = entries.filter(e => e.eventType === filters.eventType);
    }
    if (filters.engineId) {
      entries = entries.filter(e => e.engineId === filters.engineId);
    }

    // Sort and limit
    return entries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get data lineage for a specific output
   */
  public async getDataLineage(outputId: string): Promise<{
    sourceData: string[];
    transformations: string[];
    intermediateSteps: any[];
  }> {
    const entry = this.auditEntries.find(e =>
      e.lineage.outputs.includes(outputId)
    );

    if (!entry) {
      return {
        sourceData: [],
        transformations: [],
        intermediateSteps: []
      };
    }

    // Recursively trace back through lineage
    const sourceData = new Set<string>();
    const transformations = new Set<string>();
    const intermediateSteps: any[] = [];

    const traceLineage = (currentEntry: AuditEntry) => {
      currentEntry.lineage.sourceData.forEach(source => {
        sourceData.add(source);
        // Find entries that produced this source
        const sourceEntries = this.auditEntries.filter(e =>
          e.lineage.outputs.includes(source)
        );
        sourceEntries.forEach(traceLineage);
      });

      currentEntry.lineage.transformations.forEach(t =>
        transformations.add(t)
      );

      intermediateSteps.push({
        timestamp: currentEntry.timestamp,
        action: currentEntry.action,
        result: currentEntry.result
      });
    };

    traceLineage(entry);

    return {
      sourceData: Array.from(sourceData),
      transformations: Array.from(transformations),
      intermediateSteps
    };
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    failedEvents: number;
    overriddenDecisions: number;
    dataAccessEvents: number;
    modelUpdates: number;
  }> {
    const entries = await this.getAuditTrail(
      { startDate, endDate },
      Number.MAX_SAFE_INTEGER
    );

    const report = {
      totalEvents: entries.length,
      eventsByType: {} as Record<string, number>,
      failedEvents: 0,
      overriddenDecisions: 0,
      dataAccessEvents: 0,
      modelUpdates: 0
    };

    entries.forEach(entry => {
      // Count by type
      report.eventsByType[entry.eventType] =
        (report.eventsByType[entry.eventType] || 0) + 1;

      // Count failures
      if (entry.result === 'failure') {
        report.failedEvents++;
      }

      // Count overrides
      if (entry.eventType === 'override') {
        report.overriddenDecisions++;
      }

      // Count data access
      if (entry.eventType === 'data-access') {
        report.dataAccessEvents++;
      }

      // Count model updates
      if (entry.eventType === 'model-update') {
        report.modelUpdates++;
      }
    });

    return report;
  }

  /**
   * Export audit log for external review
   */
  public async exportAuditLog(
    filters?: {
      startDate?: Date;
      endDate?: Date;
      veteranId?: string;
    }
  ): Promise<string> {
    const entries = await this.getAuditTrail(filters || {}, Number.MAX_SAFE_INTEGER);

    // Export as JSON
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      filters,
      totalEntries: entries.length,
      entries: entries.map(e => ({
        id: e.id,
        timestamp: e.timestamp.toISOString(),
        eventType: e.eventType,
        action: e.action,
        result: e.result,
        userId: e.userId,
        veteranId: e.veteranId,
        engineId: e.engineId,
        details: e.details,
        lineage: e.lineage
      }))
    }, null, 2);
  }

  /**
   * Search audit log
   */
  public async searchAuditLog(
    searchTerm: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    const lowerSearch = searchTerm.toLowerCase();

    return this.auditEntries
      .filter(entry => {
        const actionMatch = entry.action.toLowerCase().includes(lowerSearch);
        const detailsMatch = JSON.stringify(entry.details)
          .toLowerCase()
          .includes(lowerSearch);
        return actionMatch || detailsMatch;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Mark decision outcome (for self-improvement tracking)
   */
  public async recordOutcome(
    decisionId: string,
    outcome: {
      status: 'success' | 'failure' | 'partial';
      actualResult?: any;
    }
  ): Promise<void> {
    const decision = this.decisionLogs.find(d => d.id === decisionId);

    if (decision) {
      decision.outcome = {
        ...outcome,
        timestamp: new Date()
      };

      await this.logEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        eventType: 'decision',
        veteranId: decision.veteranId,
        action: 'outcome-recorded',
        details: {
          decisionId,
          outcome
        },
        result: outcome.status === 'success' ? 'success' : 'failure',
        lineage: {
          sourceData: [decisionId],
          transformations: ['outcome-tracking'],
          outputs: ['outcome-recorded']
        }
      });

      await this.persistToStorage();
    }
  }

  /**
   * Get prediction accuracy metrics
   */
  public async getPredictionAccuracy(
    engineId?: EngineType,
    startDate?: Date
  ): Promise<{
    totalPredictions: number;
    validatedPredictions: number;
    accurateCount: number;
    accuracy: number;
    byConfidenceLevel: Record<string, { total: number; accurate: number }>;
  }> {
    let decisions = this.decisionLogs;

    if (engineId) {
      decisions = decisions.filter(d => d.engineId === engineId);
    }
    if (startDate) {
      decisions = decisions.filter(d => d.timestamp >= startDate);
    }

    const withOutcomes = decisions.filter(d => d.outcome);
    const accurate = withOutcomes.filter(d => d.outcome?.status === 'success');

    const byConfidenceLevel: Record<string, { total: number; accurate: number }> = {};

    withOutcomes.forEach(decision => {
      const confidence = decision.confidence || 0;
      const level = this.getConfidenceLevel(confidence);

      if (!byConfidenceLevel[level]) {
        byConfidenceLevel[level] = { total: 0, accurate: 0 };
      }

      byConfidenceLevel[level].total++;
      if (decision.outcome?.status === 'success') {
        byConfidenceLevel[level].accurate++;
      }
    });

    return {
      totalPredictions: decisions.length,
      validatedPredictions: withOutcomes.length,
      accurateCount: accurate.length,
      accuracy: withOutcomes.length > 0
        ? accurate.length / withOutcomes.length
        : 0,
      byConfidenceLevel
    };
  }

  private getConfidenceLevel(score: number): string {
    if (score >= 0.9) return 'very-high';
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'low';
    return 'very-low';
  }

  /**
   * Persist to localStorage (or other storage)
   */
  private async persistToStorage(): Promise<void> {
    try {
      // In production, this would persist to a database
      // For now, use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          this.STORAGE_KEY_AUDIT,
          JSON.stringify(this.auditEntries.slice(-1000)) // Keep last 1000
        );
        localStorage.setItem(
          this.STORAGE_KEY_DECISIONS,
          JSON.stringify(this.decisionLogs.slice(-1000))
        );
      }
    } catch (error) {
      console.error('[AuditLogger] Failed to persist to storage:', error);
    }
  }

  /**
   * Load from storage on initialization
   */
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const auditData = localStorage.getItem(this.STORAGE_KEY_AUDIT);
        const decisionData = localStorage.getItem(this.STORAGE_KEY_DECISIONS);

        if (auditData) {
          const parsed = JSON.parse(auditData);
          this.auditEntries = parsed.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp)
          }));
        }

        if (decisionData) {
          const parsed = JSON.parse(decisionData);
          this.decisionLogs = parsed.map((d: any) => ({
            ...d,
            timestamp: new Date(d.timestamp),
            outcome: d.outcome ? {
              ...d.outcome,
              timestamp: new Date(d.outcome.timestamp)
            } : undefined
          }));
        }
      }
    } catch (error) {
      console.error('[AuditLogger] Failed to load from storage:', error);
    }
  }

  /**
   * Clear old entries (data retention policy)
   */
  public async clearOldEntries(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalCount = this.auditEntries.length;
    this.auditEntries = this.auditEntries.filter(e => e.timestamp >= cutoffDate);
    this.decisionLogs = this.decisionLogs.filter(d => d.timestamp >= cutoffDate);

    await this.persistToStorage();

    return originalCount - this.auditEntries.length;
  }
}

