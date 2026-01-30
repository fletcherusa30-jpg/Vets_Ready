/**
 * PHASE 5.5: PRODUCTION
 * Database-Backed Audit Logger
 *
 * Replaces localStorage-based logging with PostgreSQL persistence
 */

import { Pool, QueryResult } from 'pg';
import * as crypto from 'crypto';

interface AuditEntry {
  id: string;
  veteranId: string;
  action: string;
  actionType: string;
  timestamp: Date;
  userId?: string;
  details?: Record<string, any>;
  resultStatus: 'success' | 'error' | 'pending';
  duration?: number;
}

interface AuditQueryOptions {
  veteranId?: string;
  actionType?: string;
  resultStatus?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface AuditReport {
  totalRecords: number;
  period: {
    start: Date;
    end: Date;
  };
  actionBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  averageDuration: number;
}

/**
 * Production Audit Logger with Database Backend
 */
export class ProductionAuditLogger {
  private pool: Pool;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(connectionString: string, maxConnections: number = 20) {
    this.pool = new Pool({
      connectionString,
      max: maxConnections
    });

    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  /**
   * Log an action to the database
   */
  async logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<string> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const client = await this.pool.connect();
        try {
          const id = crypto.randomUUID();
          const result = await client.query(
            `INSERT INTO audit_logs
             (id, veteran_id, action, action_type, user_id, details, result_status, duration_ms)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              id,
              entry.veteranId,
              entry.action,
              entry.actionType,
              entry.userId || null,
              entry.details ? JSON.stringify(entry.details) : null,
              entry.resultStatus,
              entry.duration || null
            ]
          );

          return result.rows[0].id;
        } finally {
          client.release();
        }
      } catch (error) {
        retries++;
        if (retries >= this.maxRetries) {
          console.error('Failed to log action after retries:', error);
          throw error;
        }
        await this.delay(this.retryDelay * retries);
      }
    }

    throw new Error('Failed to log action');
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(options: AuditQueryOptions = {}): Promise<{
    records: AuditEntry[];
    total: number;
  }> {
    const client = await this.pool.connect();

    try {
      const {
        veteranId,
        actionType,
        resultStatus,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = options;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (veteranId) {
        conditions.push(`veteran_id = $${paramIndex}`);
        params.push(veteranId);
        paramIndex++;
      }

      if (actionType) {
        conditions.push(`action_type = $${paramIndex}`);
        params.push(actionType);
        paramIndex++;
      }

      if (resultStatus) {
        conditions.push(`result_status = $${paramIndex}`);
        params.push(resultStatus);
        paramIndex++;
      }

      if (startDate) {
        conditions.push(`timestamp >= $${paramIndex}`);
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        conditions.push(`timestamp <= $${paramIndex}`);
        params.push(endDate);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`;
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count);

      // Get records
      params.push(limit);
      params.push(offset);

      const query = `
        SELECT * FROM audit_logs
        ${whereClause}
        ORDER BY timestamp DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await client.query(query, params);

      const records: AuditEntry[] = result.rows.map(row => ({
        id: row.id,
        veteranId: row.veteran_id,
        action: row.action,
        actionType: row.action_type,
        timestamp: new Date(row.timestamp),
        userId: row.user_id,
        details: row.details,
        resultStatus: row.result_status,
        duration: row.duration_ms
      }));

      return { records, total };
    } finally {
      client.release();
    }
  }

  /**
   * Get audit logs for a specific veteran
   */
  async getVeteranAuditTrail(veteranId: string, limit: number = 500): Promise<AuditEntry[]> {
    const { records } = await this.getAuditLogs({
      veteranId,
      limit
    });
    return records;
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(
    startDate: Date,
    endDate: Date
  ): Promise<AuditReport> {
    const client = await this.pool.connect();

    try {
      // Get total records in period
      const countResult = await client.query(
        `SELECT COUNT(*) as count FROM audit_logs
         WHERE timestamp >= $1 AND timestamp <= $2`,
        [startDate, endDate]
      );
      const totalRecords = parseInt(countResult.rows[0].count);

      // Get action breakdown
      const actionResult = await client.query(
        `SELECT action_type, COUNT(*) as count
         FROM audit_logs
         WHERE timestamp >= $1 AND timestamp <= $2
         GROUP BY action_type`,
        [startDate, endDate]
      );

      const actionBreakdown: Record<string, number> = {};
      actionResult.rows.forEach(row => {
        actionBreakdown[row.action_type] = parseInt(row.count);
      });

      // Get status breakdown
      const statusResult = await client.query(
        `SELECT result_status, COUNT(*) as count
         FROM audit_logs
         WHERE timestamp >= $1 AND timestamp <= $2
         GROUP BY result_status`,
        [startDate, endDate]
      );

      const statusBreakdown: Record<string, number> = {};
      statusResult.rows.forEach(row => {
        statusBreakdown[row.result_status] = parseInt(row.count);
      });

      // Get average duration
      const durationResult = await client.query(
        `SELECT AVG(duration_ms) as avg_duration
         FROM audit_logs
         WHERE timestamp >= $1 AND timestamp <= $2 AND duration_ms IS NOT NULL`,
        [startDate, endDate]
      );

      const averageDuration = durationResult.rows[0].avg_duration || 0;

      return {
        totalRecords,
        period: { start: startDate, end: endDate },
        actionBreakdown,
        statusBreakdown,
        averageDuration: Math.round(averageDuration)
      };
    } finally {
      client.release();
    }
  }

  /**
   * Archive old logs to cold storage
   */
  async archiveOldLogs(beforeDate: Date): Promise<number> {
    const client = await this.pool.connect();

    try {
      // Export to backup
      const result = await client.query(
        `SELECT * FROM audit_logs WHERE timestamp < $1`,
        [beforeDate]
      );

      const archivedCount = result.rows.length;

      // Delete archived logs
      await client.query(
        `DELETE FROM audit_logs WHERE timestamp < $1`,
        [beforeDate]
      );

      return archivedCount;
    } finally {
      client.release();
    }
  }

  /**
   * Search audit logs
   */
  async searchLogs(query: string, options?: AuditQueryOptions): Promise<AuditEntry[]> {
    const client = await this.pool.connect();

    try {
      const { veteranId, actionType, limit = 100 } = options || {};

      const conditions: string[] = [
        `(action ILIKE $1 OR details::text ILIKE $1)`
      ];
      const params: any[] = [`%${query}%`];
      let paramIndex = 2;

      if (veteranId) {
        conditions.push(`veteran_id = $${paramIndex}`);
        params.push(veteranId);
        paramIndex++;
      }

      if (actionType) {
        conditions.push(`action_type = $${paramIndex}`);
        params.push(actionType);
        paramIndex++;
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      params.push(limit);

      const result = await client.query(
        `SELECT * FROM audit_logs
         ${whereClause}
         ORDER BY timestamp DESC
         LIMIT $${paramIndex}`,
        params
      );

      return result.rows.map(row => ({
        id: row.id,
        veteranId: row.veteran_id,
        action: row.action,
        actionType: row.action_type,
        timestamp: new Date(row.timestamp),
        userId: row.user_id,
        details: row.details,
        resultStatus: row.result_status,
        duration: row.duration_ms
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Export audit logs as CSV
   */
  async exportAsCSV(
    options: AuditQueryOptions,
    outputPath: string
  ): Promise<void> {
    const { records } = await this.getAuditLogs(options);
    const fs = await import('fs').then(m => m.promises);

    const csv = [
      'ID,Veteran ID,Action,Action Type,Timestamp,User ID,Result Status,Duration (ms)',
      ...records.map(r =>
        `"${r.id}","${r.veteranId}","${r.action}","${r.actionType}","${r.timestamp.toISOString()}","${r.userId || ''}","${r.resultStatus}",${r.duration || ''}`
      )
    ].join('\n');

    await fs.writeFile(outputPath, csv);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Close pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Utility: delay for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global audit logger instance (singleton pattern)
 */
let auditLogger: ProductionAuditLogger | null = null;

export function initializeAuditLogger(connectionString: string): ProductionAuditLogger {
  if (!auditLogger) {
    auditLogger = new ProductionAuditLogger(connectionString);
  }
  return auditLogger;
}

export function getAuditLogger(): ProductionAuditLogger {
  if (!auditLogger) {
    throw new Error('Audit logger not initialized. Call initializeAuditLogger first.');
  }
  return auditLogger;
}

export default ProductionAuditLogger;
