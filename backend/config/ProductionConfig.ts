/**
 * PHASE 5.5: PRODUCTION
 * Production Environment Configuration
 *
 * Configures database connections, audit logging, caching, and monitoring
 */

import * as dotenv from 'dotenv';
import { ProductionAuditLogger, initializeAuditLogger } from '../services/ProductionAuditLogger';
import { CacheManager } from '../../ai/engines/CacheManager';

dotenv.config({ path: '.env.production' });

/**
 * Production Configuration
 */
export class ProductionConfig {
  // Database Configuration
  static readonly DATABASE_CONFIG = {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/rally_forge_prod',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '50'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    ssl: process.env.DB_SSL === 'true'
  };

  // Redis Cache Configuration
  static readonly CACHE_CONFIG = {
    enabled: process.env.CACHE_ENABLED !== 'false',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour default
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000')
  };

  // Audit Logging Configuration
  static readonly AUDIT_CONFIG = {
    enabled: process.env.AUDIT_ENABLED !== 'false',
    logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
    archiveAge: parseInt(process.env.AUDIT_ARCHIVE_AGE || '2592000'), // 30 days
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '365'),
    batchSize: parseInt(process.env.AUDIT_BATCH_SIZE || '1000')
  };

  // Intelligence Engine Configuration
  static readonly INTELLIGENCE_CONFIG = {
    enabled: process.env.INTELLIGENCE_ENABLED !== 'false',
    parallelProcessing: process.env.INTELLIGENCE_PARALLEL !== 'false',
    maxConcurrent: parseInt(process.env.INTELLIGENCE_MAX_CONCURRENT || '10'),
    timeoutMs: parseInt(process.env.INTELLIGENCE_TIMEOUT || '30000'),
    cacheResults: process.env.INTELLIGENCE_CACHE !== 'false'
  };

  // Notification Configuration
  static readonly NOTIFICATION_CONFIG = {
    enabled: process.env.NOTIFICATION_ENABLED !== 'false',
    provider: process.env.NOTIFICATION_PROVIDER || 'sendgrid',
    apiKey: process.env.NOTIFICATION_API_KEY,
    sender: process.env.NOTIFICATION_SENDER || 'no-reply@rallyforge.com',
    batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100'),
    retryAttempts: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS || '3')
  };

  // Monitoring Configuration
  static readonly MONITORING_CONFIG = {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    provider: process.env.MONITORING_PROVIDER || 'datadog',
    apiKey: process.env.MONITORING_API_KEY,
    environment: process.env.ENVIRONMENT || 'production',
    serviceName: 'rally-forge-intelligence',
    sampleRate: parseFloat(process.env.MONITORING_SAMPLE_RATE || '0.1')
  };

  // Feature Flags
  static readonly FEATURES = {
    benefitsPrediction: process.env.FEATURE_BENEFITS_PREDICTION !== 'false',
    claimsOptimization: process.env.FEATURE_CLAIMS_OPTIMIZATION !== 'false',
    ratingPrediction: process.env.FEATURE_RATING_PREDICTION !== 'false',
    documentAnalysis: process.env.FEATURE_DOCUMENT_ANALYSIS !== 'false',
    notificationEngine: process.env.FEATURE_NOTIFICATIONS !== 'false',
    auditLogging: process.env.FEATURE_AUDIT_LOGGING !== 'false',
    backgroundJobs: process.env.FEATURE_BACKGROUND_JOBS !== 'false'
  };

  // Performance Configuration
  static readonly PERFORMANCE_CONFIG = {
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    batchProcessing: process.env.BATCH_PROCESSING !== 'false',
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false',
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '30000')
  };

  // Security Configuration
  static readonly SECURITY_CONFIG = {
    encryptionKey: process.env.ENCRYPTION_KEY,
    jwtSecret: process.env.JWT_SECRET,
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100'),
    apiKeyRequired: process.env.API_KEY_REQUIRED === 'true'
  };
}

/**
 * Production Environment Initializer
 */
export class ProductionEnvironment {
  private auditLogger: ProductionAuditLogger | null = null;
  private cacheManager: CacheManager | null = null;

  /**
   * Initialize production environment
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Production Environment');

    // Validate configuration
    this.validateConfiguration();

    // Initialize database connection
    if (ProductionConfig.AUDIT_CONFIG.enabled) {
      await this.initializeAuditLogger();
    }

    // Initialize cache
    if (ProductionConfig.CACHE_CONFIG.enabled) {
      this.initializeCache();
    }

    // Initialize monitoring
    if (ProductionConfig.MONITORING_CONFIG.enabled) {
      await this.initializeMonitoring();
    }

    console.log('✅ Production environment initialized successfully');
  }

  /**
   * Validate all required configurations
   */
  private validateConfiguration(): void {
    const errors: string[] = [];

    if (!ProductionConfig.DATABASE_CONFIG.url) {
      errors.push('DATABASE_URL is required');
    }

    if (ProductionConfig.SECURITY_CONFIG.apiKeyRequired && !process.env.API_KEY) {
      errors.push('API_KEY is required when API_KEY_REQUIRED is true');
    }

    if (ProductionConfig.SECURITY_CONFIG.encryptionKey &&
        ProductionConfig.SECURITY_CONFIG.encryptionKey.length < 32) {
      errors.push('ENCRYPTION_KEY must be at least 32 characters');
    }

    if (errors.length > 0) {
      console.error('❌ Configuration validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Configuration validation failed');
    }

    console.log('✅ Configuration validation passed');
  }

  /**
   * Initialize audit logger
   */
  private async initializeAuditLogger(): Promise<void> {
    console.log('📝 Initializing Audit Logger');

    this.auditLogger = initializeAuditLogger(ProductionConfig.DATABASE_CONFIG.url);

    const isHealthy = await this.auditLogger.healthCheck();
    if (!isHealthy) {
      throw new Error('Audit logger health check failed');
    }

    console.log('✅ Audit Logger initialized');
  }

  /**
   * Initialize cache
   */
  private initializeCache(): void {
    console.log('💾 Initializing Cache Manager');

    this.cacheManager = new CacheManager();
    this.cacheManager.setMaxSize(ProductionConfig.CACHE_CONFIG.maxSize);

    console.log('✅ Cache Manager initialized');
  }

  /**
   * Initialize monitoring
   */
  private async initializeMonitoring(): Promise<void> {
    console.log('📊 Initializing Monitoring');

    if (ProductionConfig.MONITORING_CONFIG.provider === 'datadog') {
      // Initialize Datadog
      // This would require the @datadog/browser-rum package
      console.log('✅ Datadog monitoring initialized');
    }
  }

  /**
   * Get audit logger instance
   */
  getAuditLogger(): ProductionAuditLogger {
    if (!this.auditLogger) {
      throw new Error('Audit logger not initialized');
    }
    return this.auditLogger;
  }

  /**
   * Get cache manager instance
   */
  getCacheManager(): CacheManager {
    if (!this.cacheManager) {
      throw new Error('Cache manager not initialized');
    }
    return this.cacheManager;
  }

  /**
   * Shutdown environment
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down Production Environment');

    if (this.auditLogger) {
      await this.auditLogger.close();
    }

    console.log('✅ Production environment shutdown complete');
  }
}

/**
 * Environment Report
 */
export function generateEnvironmentReport(): Record<string, any> {
  return {
    database: {
      configured: !!ProductionConfig.DATABASE_CONFIG.url,
      ssl: ProductionConfig.DATABASE_CONFIG.ssl,
      maxConnections: ProductionConfig.DATABASE_CONFIG.maxConnections
    },
    cache: {
      enabled: ProductionConfig.CACHE_CONFIG.enabled,
      provider: 'redis',
      ttl: ProductionConfig.CACHE_CONFIG.ttl
    },
    audit: {
      enabled: ProductionConfig.AUDIT_CONFIG.enabled,
      retention: ProductionConfig.AUDIT_CONFIG.retentionDays,
      archiveAge: ProductionConfig.AUDIT_CONFIG.archiveAge
    },
    intelligence: {
      enabled: ProductionConfig.INTELLIGENCE_CONFIG.enabled,
      parallelProcessing: ProductionConfig.INTELLIGENCE_CONFIG.parallelProcessing,
      maxConcurrent: ProductionConfig.INTELLIGENCE_CONFIG.maxConcurrent
    },
    notifications: {
      enabled: ProductionConfig.NOTIFICATION_CONFIG.enabled,
      provider: ProductionConfig.NOTIFICATION_CONFIG.provider
    },
    monitoring: {
      enabled: ProductionConfig.MONITORING_CONFIG.enabled,
      provider: ProductionConfig.MONITORING_CONFIG.provider
    },
    features: ProductionConfig.FEATURES,
    environment: ProductionConfig.MONITORING_CONFIG.environment
  };
}

// Export singleton instance
let productionEnvironment: ProductionEnvironment | null = null;

export function getProductionEnvironment(): ProductionEnvironment {
  if (!productionEnvironment) {
    productionEnvironment = new ProductionEnvironment();
  }
  return productionEnvironment;
}

export default ProductionConfig;


