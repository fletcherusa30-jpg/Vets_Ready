/**
 * PHASE 5.5: PRODUCTION
 * Database Migration Setup
 *
 * Migrates audit logs from localStorage to PostgreSQL
 * Maintains data consistency and enables persistence
 */

import { Pool, QueryResult } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface AuditLogEntry {
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

interface MigrationContext {
  pool: Pool;
  logFile: string;
  startTime: Date;
  recordsProcessed: number;
  recordsFailed: number;
  errors: Error[];
}

/**
 * Database Migration Manager
 * Handles migration of audit logs from localStorage to PostgreSQL
 */
export class DatabaseMigrationManager {
  private pool: Pool;
  private context: MigrationContext;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.context = {
      pool: this.pool,
      logFile: path.join(__dirname, 'migration.log'),
      startTime: new Date(),
      recordsProcessed: 0,
      recordsFailed: 0,
      errors: []
    };
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Drop existing tables if migration is re-run
      await client.query('DROP TABLE IF EXISTS audit_logs_migration CASCADE');
      await client.query('DROP TABLE IF EXISTS migration_status CASCADE');

      // Create migration status table
      await client.query(`
        CREATE TABLE IF NOT EXISTS migration_status (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          records_processed INTEGER DEFAULT 0,
          records_failed INTEGER DEFAULT 0,
          error_details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create audit logs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          veteran_id VARCHAR(255) NOT NULL,
          action VARCHAR(255) NOT NULL,
          action_type VARCHAR(100) NOT NULL,
          timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          user_id VARCHAR(255),
          details JSONB,
          result_status VARCHAR(50) NOT NULL DEFAULT 'pending',
          duration_ms INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_veteran_id (veteran_id),
          INDEX idx_timestamp (timestamp),
          INDEX idx_action_type (action_type)
        )
      `);

      // Create indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_veteran_timestamp
        ON audit_logs(veteran_id, timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp
        ON audit_logs(action_type, timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_status
        ON audit_logs(result_status)
      `);

      this.log('Database schema initialized successfully');
    } catch (error) {
      this.log(`Schema initialization failed: ${error}`, 'error');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Record migration start
   */
  async recordMigrationStart(migrationName: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO migration_status (migration_name, status, started_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (migration_name)
         DO UPDATE SET status = $2, started_at = NOW()`,
        [migrationName, 'in_progress']
      );
    } finally {
      client.release();
    }
  }

  /**
   * Migrate audit logs from localStorage JSON file
   */
  async migrateFromLocalStorage(localStorageFile: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Read localStorage data
      const data = fs.readFileSync(localStorageFile, 'utf-8');
      const logs: AuditLogEntry[] = JSON.parse(data);

      this.log(`Starting migration of ${logs.length} audit logs`);

      // Begin transaction
      await client.query('BEGIN');

      // Insert logs in batches for performance
      const batchSize = 1000;
      for (let i = 0; i < logs.length; i += batchSize) {
        const batch = logs.slice(i, Math.min(i + batchSize, logs.length));

        const values: any[] = [];
        let paramCount = 1;
        let query = `
          INSERT INTO audit_logs
          (veteran_id, action, action_type, timestamp, user_id, details, result_status, duration_ms)
          VALUES
        `;

        const valuePlaceholders = batch.map((log, idx) => {
          const offset = idx * 8;
          values.push(
            log.veteranId,
            log.action,
            log.actionType,
            log.timestamp,
            log.userId || null,
            log.details ? JSON.stringify(log.details) : null,
            log.resultStatus,
            log.duration || null
          );
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
        }).join(',');

        query += valuePlaceholders;

        try {
          await client.query(query, values);
          this.context.recordsProcessed += batch.length;
          this.log(`Processed ${this.context.recordsProcessed} / ${logs.length} records`);
        } catch (batchError) {
          this.context.recordsFailed += batch.length;
          this.context.errors.push(batchError as Error);
          this.log(`Batch processing error: ${batchError}`, 'error');
        }
      }

      // Commit transaction
      await client.query('COMMIT');
      this.log(`Migration completed: ${this.context.recordsProcessed} records migrated successfully`);

    } catch (error) {
      await client.query('ROLLBACK');
      this.log(`Migration failed: ${error}`, 'error');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate data integrity after migration
   */
  async validateDataIntegrity(
    sourceFile: string,
    expectedCount: number
  ): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        'SELECT COUNT(*) as count FROM audit_logs'
      );
      const dbCount = parseInt(result.rows[0].count);

      if (dbCount !== expectedCount) {
        this.log(
          `Data integrity check failed: Expected ${expectedCount}, got ${dbCount}`,
          'error'
        );
        return false;
      }

      // Verify sample records
      const sampleResult = await client.query(
        'SELECT * FROM audit_logs LIMIT 5'
      );

      if (sampleResult.rows.length === 0 && expectedCount > 0) {
        this.log('Data integrity check failed: No records found', 'error');
        return false;
      }

      this.log('Data integrity validation passed');
      return true;
    } finally {
      client.release();
    }
  }

  /**
   * Create backup before migration
   */
  async createBackup(backupDir: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `audit_logs_backup_${timestamp}.json`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM audit_logs');
      fs.writeFileSync(backupFile, JSON.stringify(result.rows, null, 2));
      this.log(`Backup created: ${backupFile}`);
      return backupFile;
    } finally {
      client.release();
    }
  }

  /**
   * Record migration completion
   */
  async recordMigrationCompletion(
    migrationName: string,
    status: 'success' | 'failed'
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `UPDATE migration_status
         SET status = $1, completed_at = NOW(),
             records_processed = $2, records_failed = $3,
             error_details = $4
         WHERE migration_name = $5`,
        [
          status,
          this.context.recordsProcessed,
          this.context.recordsFailed,
          this.context.errors.length > 0
            ? JSON.stringify(this.context.errors.map(e => e.message))
            : null,
          migrationName
        ]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Get migration report
   */
  async getMigrationReport(): Promise<Record<string, any>> {
    return {
      startTime: this.context.startTime,
      endTime: new Date(),
      duration: Date.now() - this.context.startTime.getTime(),
      recordsProcessed: this.context.recordsProcessed,
      recordsFailed: this.context.recordsFailed,
      errors: this.context.errors,
      logFile: this.context.logFile,
      successRate: this.context.recordsProcessed > 0
        ? (this.context.recordsProcessed / (this.context.recordsProcessed + this.context.recordsFailed)) * 100
        : 0
    };
  }

  /**
   * Cleanup and close connections
   */
  async cleanup(): Promise<void> {
    await this.pool.end();
    this.log('Database connections closed');
  }

  /**
   * Internal logging
   */
  private log(message: string, level: string = 'info'): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    fs.appendFileSync(this.context.logFile, logMessage);
    console.log(logMessage);
  }
}

/**
 * Execute migration
 */
export async function executeMigration(config: {
  databaseUrl: string;
  localStorageFile: string;
  backupDir: string;
}): Promise<void> {
  const manager = new DatabaseMigrationManager(config.databaseUrl);

  try {
    console.log('🚀 Starting database migration...\n');

    // Initialize schema
    console.log('📋 Initializing database schema...');
    await manager.initializeSchema();

    // Record migration start
    await manager.recordMigrationStart('audit_logs_migration');

    // Create backup
    console.log('💾 Creating backup...');
    await manager.createBackup(config.backupDir);

    // Read localStorage file
    const localStorageData = fs.readFileSync(config.localStorageFile, 'utf-8');
    const logs = JSON.parse(localStorageData) as AuditLogEntry[];
    const expectedCount = logs.length;

    // Perform migration
    console.log(`\n🔄 Migrating ${expectedCount} audit log records...`);
    await manager.migrateFromLocalStorage(config.localStorageFile);

    // Validate integrity
    console.log('\n✅ Validating data integrity...');
    const isValid = await manager.validateDataIntegrity(
      config.localStorageFile,
      expectedCount
    );

    if (!isValid) {
      throw new Error('Data integrity validation failed');
    }

    // Record completion
    await manager.recordMigrationCompletion('audit_logs_migration', 'success');

    // Get report
    const report = await manager.getMigrationReport();
    console.log('\n📊 Migration Report:');
    console.log(JSON.stringify(report, null, 2));

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await manager.recordMigrationCompletion('audit_logs_migration', 'failed');
    throw error;
  } finally {
    await manager.cleanup();
  }
}

/**
 * Rollback migration (restore from backup)
 */
export async function rollbackMigration(config: {
  databaseUrl: string;
  backupFile: string;
}): Promise<void> {
  const manager = new DatabaseMigrationManager(config.databaseUrl);

  try {
    console.log('⏮️  Starting migration rollback...\n');

    const client = await manager['pool'].connect();
    try {
      await client.query('BEGIN');

      // Truncate audit logs
      await client.query('TRUNCATE TABLE audit_logs');

      // Restore from backup
      const backupData = fs.readFileSync(config.backupFile, 'utf-8');
      const logs = JSON.parse(backupData) as AuditLogEntry[];

      const values: any[] = [];
      const placeholders = logs.map((log, idx) => {
        values.push(
          log.id,
          log.veteranId,
          log.action,
          log.actionType,
          log.timestamp,
          log.userId || null,
          log.details ? JSON.stringify(log.details) : null,
          log.resultStatus,
          log.duration || null
        );
        const offset = idx * 9;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
      }).join(',');

      await client.query(
        `INSERT INTO audit_logs
         (id, veteran_id, action, action_type, timestamp, user_id, details, result_status, duration_ms)
         VALUES ${placeholders}`,
        values
      );

      await client.query('COMMIT');
      console.log('✨ Rollback completed successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await manager.cleanup();
  }
}

// Export for CLI execution
if (require.main === module) {
  const config = {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/rally_forge',
    localStorageFile: process.env.LOCALSTORAGE_FILE || './data/audit_logs.json',
    backupDir: process.env.BACKUP_DIR || './backups'
  };

  executeMigration(config).catch(console.error);
}

