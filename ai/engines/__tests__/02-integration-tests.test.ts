/**
 * PHASE 5.4: TESTING
 * Integration Tests for Intelligence Platform
 *
 * Tests cross-engine communication, data flow, and system interactions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntelligenceCore } from '../intelligence';
import { VeteranProfileAnalyzer } from '../intelligence';
import { BenefitsPredictor } from '../intelligence';
import { ClaimsOptimizer } from '../intelligence';

describe('Intelligence Platform Integration', () => {
  let core: IntelligenceCore;

  beforeEach(() => {
    core = new IntelligenceCore();
  });

  describe('End-to-End Profile Analysis', () => {
    it('should process complete veteran profile through all engines', async () => {
      const profile = {
        id: 'vet_integration_001',
        militaryHistory: {
          branch: 'Army',
          rank: 'E-5',
          startDate: '2010-01-15',
          endDate: '2018-06-30'
        },
        conditions: [
          { name: 'PTSD', rating: 50, onsetDate: '2011-06-15' },
          { name: 'Knee Pain', rating: 20, onsetDate: '2012-03-10' }
        ],
        documents: [
          { type: 'DD214', uploaded: true },
          { type: 'Medical Records', uploaded: true }
        ]
      };

      const result = await core.analyzeProfile(profile);

      expect(result).toHaveProperty('profileAnalysis');
      expect(result).toHaveProperty('conditionAnalysis');
      expect(result).toHaveProperty('benefitsPrediction');
      expect(result).toHaveProperty('claimsStrategy');
    });

    it('should maintain data consistency across engines', async () => {
      const profile = {
        id: 'vet_consistency_001',
        conditions: [{ name: 'PTSD', rating: 50 }]
      };

      const analysis1 = await core.analyzeProfile(profile);
      const analysis2 = await core.analyzeProfile(profile);

      expect(analysis1.profileAnalysis).toEqual(analysis2.profileAnalysis);
      expect(analysis1.benefitsPrediction).toEqual(analysis2.benefitsPrediction);
    });
  });

  describe('Benefits to Claims Integration', () => {
    it('should link predicted benefits to claim strategy', async () => {
      const profile = {
        id: 'vet_benefits_claims_001',
        rating: 40,
        conditions: [{ name: 'Back Pain' }]
      };

      const benefits = await core.predictBenefits(profile);
      const strategy = await core.optimizeClaimsStrategy(profile);

      expect(strategy.benefitsConsideration).toContain(
        benefits[0].name || 'benefits included'
      );
    });

    it('should optimize filing order based on benefits', async () => {
      const profile = {
        id: 'vet_filing_order_001',
        conditions: [
          { name: 'PTSD', rating: 0 },
          { name: 'Knee Pain', rating: 20 },
          { name: 'Hearing Loss', rating: 0 }
        ]
      };

      const strategy = await core.optimizeClaimsStrategy(profile);

      expect(strategy.recommendedOrder).toBeDefined();
      expect(strategy.recommendedOrder.length).toBe(3);
      expect(strategy.rationale).toBeDefined();
    });
  });

  describe('Evidence Flow Through Engines', () => {
    it('should track evidence requirements across conditions', async () => {
      const profile = {
        id: 'vet_evidence_flow_001',
        conditions: [
          { name: 'PTSD' },
          { name: 'Knee Pain' },
          { name: 'TBI' }
        ]
      };

      const requirements = await core.getEvidenceRequirements(profile);

      expect(requirements).toHaveProperty('byCondition');
      expect(Object.keys(requirements.byCondition).length).toBe(3);
      expect(requirements).toHaveProperty('priority');
    });

    it('should identify evidence gaps progressively', async () => {
      const profile = {
        id: 'vet_gaps_001',
        conditions: [{ name: 'PTSD' }],
        availableEvidence: ['service record']
      };

      const gaps = await core.analyzeEvidenceGaps(profile);

      expect(gaps).toHaveProperty('missing');
      expect(gaps).toHaveProperty('available');
      expect(gaps.available).toContain('service record');
    });

    it('should validate evidence quality across documents', async () => {
      const profile = {
        id: 'vet_quality_001',
        documents: [
          { type: 'VA Medical', quality: 'high' },
          { type: 'Personal Medical', quality: 'moderate' },
          { type: 'Buddy Statement', quality: 'low' }
        ]
      };

      const validation = await core.validateDocumentQuality(profile);

      expect(validation).toHaveProperty('overallQuality');
      expect(validation).toHaveProperty('byDocument');
    });
  });

  describe('Rating Calculation Through Engines', () => {
    it('should calculate combined rating with multiple conditions', async () => {
      const profile = {
        id: 'vet_rating_calc_001',
        conditions: [
          { name: 'PTSD', predictedRating: 50 },
          { name: 'Knee Pain', predictedRating: 30 },
          { name: 'Hearing Loss', predictedRating: 10 }
        ]
      };

      const rating = await core.calculateCombinedRating(profile);

      expect(rating.combined).toBeGreaterThan(50);
      expect(rating.combined).toBeLessThanOrEqual(100);
      expect(rating).toHaveProperty('individual');
      expect(rating.individual.length).toBe(3);
    });

    it('should identify underrating opportunities', async () => {
      const profile = {
        id: 'vet_underrating_001',
        conditions: [
          { name: 'PTSD', currentRating: 30, severity: 'severe' },
          { name: 'Depression', currentRating: 20, severity: 'moderate' }
        ]
      };

      const underrated = await core.findUnderratedConditions(profile);

      expect(Array.isArray(underrated)).toBe(true);
      expect(underrated.some(c => c.name === 'PTSD')).toBe(true);
    });

    it('should model rating increase scenarios', async () => {
      const profile = {
        id: 'vet_scenarios_001',
        currentRating: 30,
        conditions: [{ name: 'PTSD' }]
      };

      const scenarios = await core.modelRatingScenarios(profile);

      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBeGreaterThan(1);
      scenarios.forEach(scenario => {
        expect(scenario).toHaveProperty('conditions');
        expect(scenario).toHaveProperty('projectedRating');
      });
    });
  });

  describe('Timeline Coordination', () => {
    it('should generate coordinated timeline for claims', async () => {
      const profile = {
        id: 'vet_timeline_001',
        conditions: [{ name: 'PTSD' }],
        processingComplexity: 'high'
      };

      const timeline = await core.generateClaimsTimeline(profile);

      expect(timeline).toHaveProperty('start');
      expect(timeline).toHaveProperty('milestones');
      expect(timeline).toHaveProperty('estimatedCompletion');
      expect(timeline.milestones.length).toBeGreaterThan(0);
    });

    it('should coordinate with VA processing timelines', async () => {
      const profile = {
        id: 'vet_va_timeline_001',
        claimType: 'service_connected_disability'
      };

      const timeline = await core.generateClaimsTimeline(profile);

      expect(timeline.estimatedDays).toBeGreaterThan(100);
      expect(timeline.estimatedDays).toBeLessThan(600);
    });
  });

  describe('Notification Triggering', () => {
    it('should trigger notifications on milestone completion', async () => {
      const profile = {
        id: 'vet_notif_001',
        email: 'vet@example.com'
      };

      const analysis = await core.analyzeProfile(profile);
      const notifications = core.getPendingNotifications();

      expect(Array.isArray(notifications)).toBe(true);
      notifications.forEach(notif => {
        expect(notif).toHaveProperty('type');
        expect(notif).toHaveProperty('veteranId');
      });
    });

    it('should send benefit eligibility notifications', async () => {
      const profile = {
        id: 'vet_benefit_notif_001',
        rating: 50
      };

      await core.analyzeProfile(profile);
      const notifications = core.getPendingNotifications();

      const benefitNotifs = notifications.filter(n =>
        n.type === 'new_benefit_eligible'
      );
      expect(benefitNotifs.length).toBeGreaterThan(0);
    });
  });

  describe('Cache Performance Integration', () => {
    it('should cache profile analysis results', async () => {
      const profile = {
        id: 'vet_cache_001',
        conditions: [{ name: 'PTSD' }]
      };

      const start1 = Date.now();
      const result1 = await core.analyzeProfile(profile);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const result2 = await core.analyzeProfile(profile);
      const time2 = Date.now() - start2;

      expect(result1).toEqual(result2);
      expect(time2).toBeLessThan(time1);
    });

    it('should invalidate cache on profile updates', async () => {
      const profile = {
        id: 'vet_cache_invalid_001',
        conditions: [{ name: 'PTSD' }]
      };

      await core.analyzeProfile(profile);

      profile.conditions.push({ name: 'Knee Pain' });
      const updated = await core.analyzeProfile(profile);

      expect(updated.conditionAnalysis.length).toBe(2);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle missing data gracefully', async () => {
      const incompleteProfile = {
        id: 'vet_incomplete_001'
      };

      const result = await core.analyzeProfile(incompleteProfile);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('warnings');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should provide fallback data when engines fail', async () => {
      const profile = {
        id: 'vet_fallback_001',
        conditions: [{ name: 'Unknown Condition' }]
      };

      const result = await core.analyzeProfile(profile);

      expect(result.benefitsPrediction).toBeDefined();
      expect(result.benefitsPrediction.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Audit and Compliance', () => {
    it('should log all analysis operations', async () => {
      const profile = {
        id: 'vet_audit_001',
        conditions: [{ name: 'PTSD' }]
      };

      await core.analyzeProfile(profile);

      const logs = core.getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('operation');
      expect(logs[0]).toHaveProperty('profileId');
    });

    it('should maintain audit trail for compliance', async () => {
      const profile = { id: 'vet_compliance_001' };

      await core.analyzeProfile(profile);

      const trail = core.getComplianceAuditTrail();
      expect(trail).toHaveProperty('operations');
      expect(trail).toHaveProperty('timestamp');
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete profile analysis within performance targets', async () => {
      const profile = {
        id: 'vet_perf_001',
        conditions: Array(10).fill({ name: 'Test Condition' })
      };

      const start = Date.now();
      await core.analyzeProfile(profile);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // 5 second target
    });

    it('should handle multiple concurrent analyses', async () => {
      const profiles = Array(10).fill(null).map((_, i) => ({
        id: `vet_concurrent_${i}`,
        conditions: [{ name: 'PTSD' }]
      }));

      const start = Date.now();
      const results = await Promise.all(
        profiles.map(p => core.analyzeProfile(p))
      );
      const duration = Date.now() - start;

      expect(results.length).toBe(10);
      expect(duration).toBeLessThan(15000); // 15 second target for batch
    });
  });
});

describe('Cross-Engine Data Validation', () => {
  let core: IntelligenceCore;

  beforeEach(() => {
    core = new IntelligenceCore();
  });

  it('should validate consistency between rating calculations', async () => {
    const profile = {
      id: 'vet_validation_001',
      conditions: [
        { name: 'PTSD', rating: 50 },
        { name: 'Knee Pain', rating: 30 }
      ]
    };

    const analysis = await core.analyzeProfile(profile);

    const ratingFromPredictor = analysis.ratingPrediction.combined;
    const ratingFromOptimizer = analysis.claimsStrategy.projectedRating;

    // Should be within 5 points
    expect(Math.abs(ratingFromPredictor - ratingFromOptimizer)).toBeLessThan(5);
  });

  it('should validate benefits eligibility consistency', async () => {
    const profile = {
      id: 'vet_consistency_002',
      rating: 50
    };

    const benefits = await core.predictBenefits(profile);
    const recommendations = await core.getRecommendations(profile);

    const benefitNames = benefits.map(b => b.name);
    recommendations.forEach(rec => {
      if (rec.includes('benefit')) {
        expect(
          benefitNames.some(b => rec.includes(b)) ||
          rec.includes('general')
        ).toBe(true);
      }
    });
  });
});
