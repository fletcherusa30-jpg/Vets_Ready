/**
 * PHASE 5.4: TESTING
 * Unit Tests for Intelligence Engine Classes
 *
 * Tests cover:
 * - VeteranProfileAnalyzer
 * - ConditionAnalyzer
 * - BenefitsPredictor
 * - ClaimsOptimizer
 * - EvidenceGatherer
 * - DocumentAnalyzer
 * - RatingPredictor
 * - TimelineAnalyzer
 * - CombinationEngine
 * - AuditLogger
 * - CacheManager
 * - NotificationEngine
 * - RecommendationEngine
 * - WorkflowOrchestrator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  VeteranProfileAnalyzer,
  ConditionAnalyzer,
  BenefitsPredictor,
  ClaimsOptimizer,
  EvidenceGatherer,
  DocumentAnalyzer,
  RatingPredictor,
  TimelineAnalyzer,
  CombinationEngine,
  AuditLogger,
  CacheManager,
  NotificationEngine,
  RecommendationEngine,
  WorkflowOrchestrator
} from '../intelligence';

// ============================================================================
// VETERAN PROFILE ANALYZER TESTS
// ============================================================================
describe('VeteranProfileAnalyzer', () => {
  let analyzer: VeteranProfileAnalyzer;

  beforeEach(() => {
    analyzer = new VeteranProfileAnalyzer();
  });

  it('should parse military history correctly', async () => {
    const profile = {
      militaryHistory: {
        branch: 'Army',
        startDate: '2010-01-15',
        endDate: '2018-06-30',
        rank: 'E-5'
      }
    };

    const analysis = await analyzer.analyzeMilitaryHistory(profile);
    expect(analysis.yearsOfService).toBe(8.5);
    expect(analysis.rankLevel).toBe('E-5');
  });

  it('should identify service-connected conditions', async () => {
    const profile = {
      conditions: [
        { name: 'PTSD', rating: 50 },
        { name: 'Knee Pain', rating: 20 }
      ]
    };

    const analysis = await analyzer.identifyServiceConnected(profile);
    expect(analysis.count).toBe(2);
    expect(analysis.combinedRating).toBeGreaterThan(0);
  });

  it('should calculate compensation rate', async () => {
    const profile = {
      rating: 60,
      dependents: 2,
      hasSpouse: true
    };

    const compensation = await analyzer.calculateCompensation(profile);
    expect(compensation.baseRate).toBeGreaterThan(0);
    expect(compensation.withDependents).toBeGreaterThan(compensation.baseRate);
  });

  it('should flag for additional benefits investigation', async () => {
    const profile = {
      rating: 50,
      age: 35,
      education: 'high school',
      income: 45000
    };

    const flags = await analyzer.flagBenefitsOpportunities(profile);
    expect(Array.isArray(flags)).toBe(true);
  });
});

// ============================================================================
// CONDITION ANALYZER TESTS
// ============================================================================
describe('ConditionAnalyzer', () => {
  let analyzer: ConditionAnalyzer;

  beforeEach(() => {
    analyzer = new ConditionAnalyzer();
  });

  it('should classify condition severity', async () => {
    const condition = {
      name: 'Severe PTSD',
      symptoms: ['nightmares', 'anxiety', 'hypervigilance'],
      rating: 70
    };

    const classification = await analyzer.classifySeverity(condition);
    expect(classification.level).toMatch(/severe|moderate|mild/i);
  });

  it('should identify related conditions', async () => {
    const condition = { name: 'PTSD' };
    const related = await analyzer.findRelatedConditions(condition);
    expect(Array.isArray(related)).toBe(true);
    expect(related.length).toBeGreaterThan(0);
  });

  it('should extract diagnostic codes', async () => {
    const condition = {
      name: 'Major Depressive Disorder',
      diagnosticCode: '6260'
    };

    const code = await analyzer.extractDiagnosticCode(condition);
    expect(code).toBeDefined();
    expect(typeof code).toBe('string');
  });

  it('should assess ratable vs non-ratable', async () => {
    const conditions = [
      { name: 'PTSD', rating: 50 },
      { name: 'Scar', rating: null }
    ];

    const assessment = await analyzer.assessRatability(conditions);
    expect(assessment.ratable).toEqual(1);
    expect(assessment.nonRatable).toEqual(1);
  });

  it('should identify secondary conditions', async () => {
    const primaryCondition = { name: 'Knee Injury' };
    const secondary = await analyzer.identifySecondary(primaryCondition);
    expect(Array.isArray(secondary)).toBe(true);
  });
});

// ============================================================================
// BENEFITS PREDICTOR TESTS
// ============================================================================
describe('BenefitsPredictor', () => {
  let predictor: BenefitsPredictor;

  beforeEach(() => {
    predictor = new BenefitsPredictor();
  });

  it('should predict eligible benefits based on rating', async () => {
    const profile = { rating: 50, age: 40 };
    const benefits = await predictor.predictEligible(profile);

    expect(Array.isArray(benefits)).toBe(true);
    expect(benefits.length).toBeGreaterThan(0);
    expect(benefits[0]).toHaveProperty('name');
    expect(benefits[0]).toHaveProperty('eligibilityScore');
  });

  it('should calculate estimated benefit amounts', async () => {
    const profile = { rating: 70, dependents: 2 };
    const amounts = await predictor.estimateAmounts(profile);

    expect(amounts.monthlyAmount).toBeGreaterThan(0);
    expect(amounts.annualAmount).toBe(amounts.monthlyAmount * 12);
  });

  it('should identify hidden benefits', async () => {
    const profile = { rating: 30, education: 'some college' };
    const hidden = await predictor.findHiddenBenefits(profile);

    expect(Array.isArray(hidden)).toBe(true);
  });

  it('should assess benefit readiness', async () => {
    const profile = { conditions: [{ name: 'PTSD' }] };
    const readiness = await predictor.assessReadiness(profile);

    expect(readiness).toHaveProperty('ready');
    expect(readiness).toHaveProperty('gaps');
  });
});

// ============================================================================
// CLAIMS OPTIMIZER TESTS
// ============================================================================
describe('ClaimsOptimizer', () => {
  let optimizer: ClaimsOptimizer;

  beforeEach(() => {
    optimizer = new ClaimsOptimizer();
  });

  it('should optimize claim filing strategy', async () => {
    const profile = {
      conditions: [
        { name: 'PTSD', rating: 50 },
        { name: 'Knee Pain', rating: 20 }
      ]
    };

    const strategy = await optimizer.optimizeStrategy(profile);
    expect(strategy).toHaveProperty('order');
    expect(strategy).toHaveProperty('rationale');
  });

  it('should analyze combined rating scenarios', async () => {
    const conditions = [
      { rating: 50 },
      { rating: 30 },
      { rating: 10 }
    ];

    const scenarios = await optimizer.analyzeRatingScenarios(conditions);
    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios.length).toBeGreaterThan(1);
  });

  it('should estimate timeline for claim approval', async () => {
    const profile = { conditions: [{ name: 'PTSD' }] };
    const timeline = await optimizer.estimateTimeline(profile);

    expect(timeline).toHaveProperty('minDays');
    expect(timeline).toHaveProperty('maxDays');
    expect(timeline.minDays).toBeLessThanOrEqual(timeline.maxDays);
  });

  it('should flag high-value opportunities', async () => {
    const profile = { rating: 40 };
    const opportunities = await optimizer.findHighValue(profile);

    expect(Array.isArray(opportunities)).toBe(true);
  });
});

// ============================================================================
// EVIDENCE GATHERER TESTS
// ============================================================================
describe('EvidenceGatherer', () => {
  let gatherer: EvidenceGatherer;

  beforeEach(() => {
    gatherer = new EvidenceGatherer();
  });

  it('should identify required evidence for condition', async () => {
    const condition = { name: 'PTSD' };
    const required = await gatherer.getRequiredEvidence(condition);

    expect(Array.isArray(required)).toBe(true);
    expect(required.length).toBeGreaterThan(0);
  });

  it('should prioritize evidence gathering', async () => {
    const evidence = [
      { type: 'medical', priority: 'high', available: false },
      { type: 'service record', priority: 'critical', available: true }
    ];

    const prioritized = await gatherer.prioritize(evidence);
    expect(prioritized[0].priority).toBe('critical');
  });

  it('should analyze evidence gaps', async () => {
    const conditions = [{ name: 'PTSD' }];
    const gaps = await gatherer.analyzeGaps(conditions);

    expect(gaps).toHaveProperty('missing');
    expect(gaps).toHaveProperty('available');
  });

  it('should suggest evidence sources', async () => {
    const condition = { name: 'Knee Injury' };
    const sources = await gatherer.suggestSources(condition);

    expect(Array.isArray(sources)).toBe(true);
  });
});

// ============================================================================
// DOCUMENT ANALYZER TESTS
// ============================================================================
describe('DocumentAnalyzer', () => {
  let analyzer: DocumentAnalyzer;

  beforeEach(() => {
    analyzer = new DocumentAnalyzer();
  });

  it('should extract relevant information from documents', async () => {
    const document = {
      type: 'medical record',
      content: 'Patient diagnosed with PTSD on 2020-01-15'
    };

    const extraction = await analyzer.extract(document);
    expect(extraction).toHaveProperty('diagnosis');
    expect(extraction.diagnosis).toContain('PTSD');
  });

  it('should validate document completeness', async () => {
    const document = {
      type: 'DD Form 214',
      fields: ['branch', 'rank', 'serviceDate']
    };

    const validation = await analyzer.validateCompleteness(document);
    expect(validation).toHaveProperty('complete');
    expect(validation).toHaveProperty('missingFields');
  });

  it('should score evidence quality', async () => {
    const document = { type: 'VA medical record', vintage: 'recent' };
    const score = await analyzer.scoreQuality(document);

    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should detect document issues', async () => {
    const document = { scanned: true, quality: 'low' };
    const issues = await analyzer.detectIssues(document);

    expect(Array.isArray(issues)).toBe(true);
  });
});

// ============================================================================
// RATING PREDICTOR TESTS
// ============================================================================
describe('RatingPredictor', () => {
  let predictor: RatingPredictor;

  beforeEach(() => {
    predictor = new RatingPredictor();
  });

  it('should predict VA rating for conditions', async () => {
    const conditions = [
      { name: 'PTSD', severity: 'severe' },
      { name: 'Knee Pain', severity: 'moderate' }
    ];

    const prediction = await predictor.predictRatings(conditions);
    expect(prediction).toHaveProperty('individualRatings');
    expect(prediction).toHaveProperty('combinedRating');
  });

  it('should apply VA rating formula correctly', async () => {
    const ratings = [50, 30, 10];
    const combined = await predictor.combineRatings(ratings);

    expect(combined).toBeGreaterThan(50);
    expect(combined).toBeLessThanOrEqual(100);
  });

  it('should analyze likelihood of appeal success', async () => {
    const currentRating = 30;
    const targetRating = 50;

    const analysis = await predictor.analyzeAppealLikelihood(currentRating, targetRating);
    expect(analysis).toHaveProperty('likelihood');
  });

  it('should identify underrated conditions', async () => {
    const profile = {
      conditions: [
        { name: 'PTSD', currentRating: 30, severity: 'severe' }
      ]
    };

    const underrated = await predictor.findUnderrated(profile);
    expect(Array.isArray(underrated)).toBe(true);
  });
});

// ============================================================================
// TIMELINE ANALYZER TESTS
// ============================================================================
describe('TimelineAnalyzer', () => {
  let analyzer: TimelineAnalyzer;

  beforeEach(() => {
    analyzer = new TimelineAnalyzer();
  });

  it('should calculate service connection timeline', async () => {
    const profile = {
      deployments: [
        { start: '2010-01-01', end: '2011-12-31', location: 'Afghanistan' }
      ],
      condition: { name: 'PTSD', onsetDate: '2011-06-15' }
    };

    const timeline = await analyzer.calculateServiceConnection(profile);
    expect(timeline).toHaveProperty('connectionLogic');
  });

  it('should identify timeline gaps and issues', async () => {
    const records = [
      { date: '2010-01-01', event: 'Deployment' },
      { date: '2015-01-01', event: 'Medical record' }
    ];

    const gaps = await analyzer.identifyGaps(records);
    expect(Array.isArray(gaps)).toBe(true);
  });

  it('should estimate claim processing timeline', async () => {
    const claimSize = 'complex';
    const estimate = await analyzer.estimateProcessing(claimSize);

    expect(estimate).toHaveProperty('minDays');
    expect(estimate).toHaveProperty('maxDays');
  });

  it('should track milestone progression', async () => {
    const claim = { status: 'in progress' };
    const milestones = await analyzer.trackMilestones(claim);

    expect(Array.isArray(milestones)).toBe(true);
  });
});

// ============================================================================
// COMBINATION ENGINE TESTS
// ============================================================================
describe('CombinationEngine', () => {
  let engine: CombinationEngine;

  beforeEach(() => {
    engine = new CombinationEngine();
  });

  it('should generate benefit combinations', async () => {
    const profile = {
      rating: 50,
      conditions: [{ name: 'PTSD' }],
      dependents: 2
    };

    const combinations = await engine.generate(profile);
    expect(Array.isArray(combinations)).toBe(true);
    expect(combinations.length).toBeGreaterThan(1);
  });

  it('should calculate total value for combinations', async () => {
    const combination = {
      benefits: ['VA Disability', 'Education'],
      rating: 50
    };

    const value = await engine.calculateValue(combination);
    expect(value).toHaveProperty('monthlyTotal');
    expect(value.monthlyTotal).toBeGreaterThan(0);
  });

  it('should identify optimal combinations', async () => {
    const profile = { rating: 40, income: 50000 };
    const optimal = await engine.findOptimal(profile);

    expect(optimal).toHaveProperty('recommendation');
    expect(optimal).toHaveProperty('reasoning');
  });

  it('should flag conflicting benefits', async () => {
    const benefits = ['TDIU', 'Work-Study Program'];
    const conflicts = await engine.findConflicts(benefits);

    expect(Array.isArray(conflicts)).toBe(true);
  });
});

// ============================================================================
// AUDIT LOGGER TESTS
// ============================================================================
describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  it('should log analysis actions', async () => {
    const action = {
      type: 'benefits_prediction',
      veteranId: 'vet123',
      timestamp: new Date()
    };

    await logger.log(action);
    expect(logger.getLogs().length).toBeGreaterThan(0);
  });

  it('should track user interactions', async () => {
    const interaction = {
      userId: 'user123',
      action: 'view_benefits',
      timestamp: new Date()
    };

    await logger.trackInteraction(interaction);
    const interactions = logger.getInteractions();
    expect(interactions.length).toBeGreaterThan(0);
  });

  it('should generate audit reports', async () => {
    await logger.log({
      type: 'analysis',
      veteranId: 'vet123',
      timestamp: new Date()
    });

    const report = logger.generateReport('vet123');
    expect(report).toHaveProperty('actions');
  });

  it('should handle large volumes of logs', async () => {
    for (let i = 0; i < 1000; i++) {
      await logger.log({
        type: 'action',
        veteranId: `vet${i}`,
        timestamp: new Date()
      });
    }

    expect(logger.getLogs().length).toBe(1000);
  });
});

// ============================================================================
// CACHE MANAGER TESTS
// ============================================================================
describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager();
  });

  it('should cache analysis results', async () => {
    const key = 'benefits_analysis_vet123';
    const value = { benefits: ['VA Disability', 'Education'] };

    cache.set(key, value);
    const retrieved = cache.get(key);
    expect(retrieved).toEqual(value);
  });

  it('should handle cache expiration', async () => {
    cache.set('temp_key', 'value', 100); // 100ms TTL
    expect(cache.get('temp_key')).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cache.get('temp_key')).toBeUndefined();
  });

  it('should clear cache when full', async () => {
    cache.setMaxSize(3);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4');

    expect(cache.size()).toBeLessThanOrEqual(3);
  });

  it('should manage cache statistics', async () => {
    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('key1');

    const stats = cache.getStats();
    expect(stats.hits).toBeGreaterThan(0);
  });
});

// ============================================================================
// NOTIFICATION ENGINE TESTS
// ============================================================================
describe('NotificationEngine', () => {
  let engine: NotificationEngine;

  beforeEach(() => {
    engine = new NotificationEngine();
  });

  it('should send benefit eligibility notifications', async () => {
    const notification = {
      type: 'new_benefit_eligible',
      veteranId: 'vet123',
      benefitName: 'Vocational Rehab'
    };

    const result = await engine.send(notification);
    expect(result.sent).toBe(true);
  });

  it('should batch notifications efficiently', async () => {
    const notifications = [
      { type: 'update', veteranId: 'vet1' },
      { type: 'update', veteranId: 'vet2' },
      { type: 'update', veteranId: 'vet3' }
    ];

    const results = await engine.batchSend(notifications);
    expect(results.length).toBe(3);
  });

  it('should respect user notification preferences', async () => {
    const prefs = { email: true, sms: false };
    engine.setPreferences('vet123', prefs);

    const result = await engine.send({
      type: 'update',
      veteranId: 'vet123',
      channel: 'sms'
    });

    expect(result.blocked).toBe(true);
  });

  it('should retry failed notifications', async () => {
    const notification = {
      type: 'update',
      veteranId: 'vet123',
      retryable: true
    };

    const result = await engine.sendWithRetry(notification);
    expect(result).toHaveProperty('attempts');
  });
});

// ============================================================================
// RECOMMENDATION ENGINE TESTS
// ============================================================================
describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;

  beforeEach(() => {
    engine = new RecommendationEngine();
  });

  it('should generate personalized recommendations', async () => {
    const profile = {
      rating: 50,
      conditions: [{ name: 'PTSD' }],
      goals: ['education', 'employment']
    };

    const recommendations = await engine.generate(profile);
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations[0]).toHaveProperty('priority');
  });

  it('should score recommendation relevance', async () => {
    const recommendation = 'Apply for vocational rehabilitation';
    const profile = { rating: 50, goals: ['employment'] };

    const score = await engine.scoreRelevance(recommendation, profile);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should track recommendation outcomes', async () => {
    const recommendation = { id: 'rec1', text: 'Apply for VR&E' };
    await engine.trackOutcome(recommendation.id, 'accepted');

    const outcome = engine.getOutcome(recommendation.id);
    expect(outcome).toBe('accepted');
  });

  it('should adapt recommendations based on feedback', async () => {
    const profile = { rating: 50 };
    const feedback = { recommendationId: 'rec1', helpful: false };

    await engine.recordFeedback(feedback);
    const adapted = await engine.generate(profile);

    expect(Array.isArray(adapted)).toBe(true);
  });
});

// ============================================================================
// WORKFLOW ORCHESTRATOR TESTS
// ============================================================================
describe('WorkflowOrchestrator', () => {
  let orchestrator: WorkflowOrchestrator;

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator();
  });

  it('should execute analysis workflow', async () => {
    const workflow = {
      steps: ['analyze_profile', 'predict_benefits', 'optimize_claims']
    };

    const result = await orchestrator.execute(workflow, {});
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('results');
  });

  it('should handle workflow errors gracefully', async () => {
    const workflow = {
      steps: ['invalid_step'],
      errorHandler: 'retry'
    };

    const result = await orchestrator.execute(workflow, {});
    expect(result).toHaveProperty('errors');
  });

  it('should parallelize independent steps', async () => {
    const workflow = {
      steps: [
        { name: 'analyze', parallel: true },
        { name: 'predict', parallel: true }
      ]
    };

    const startTime = Date.now();
    await orchestrator.execute(workflow, {});
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000);
  });

  it('should generate workflow execution report', async () => {
    await orchestrator.execute(
      { steps: ['step1', 'step2'] },
      {}
    );

    const report = orchestrator.getLastReport();
    expect(report).toHaveProperty('duration');
    expect(report).toHaveProperty('stepsCompleted');
  });
});
