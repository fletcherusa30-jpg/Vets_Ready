/**
 * VetsReady Employment System
 * Main entry point
 */

// Core exports
export * from './src/core/matching/index.js';
export * from './src/core/scoring/index.js';

// Domain exports
export * from './src/domains/career_discovery/service.js';
export * from './src/domains/skills_translation/service.js';
export * from './src/domains/resume_tools/service.js';
export * from './src/domains/interview_prep/service.js';
export * from './src/domains/credentialing/service.js';
export * from './src/domains/job_matching/service.js';
export * from './src/domains/workplace_readiness/service.js';
export * from './src/domains/ai_coaching/service.js';
export * from './src/domains/predictive_forecasting/service.js';
export * from './src/domains/application_automation/service.js';
export * from './src/domains/digital_twin/service.js';

// Integration exports
export * from './src/integrations/mos_engine/index.js';
export * from './src/integrations/benefits_engine/index.js';
export * from './src/integrations/external_jobs/index.js';

// Data model exports
export * from './data/models/index.js';
