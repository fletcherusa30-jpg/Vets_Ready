import { CRSCAnalyticsSnapshot, CRSCComputationResult, CRSCEvidenceMappingResult } from '../../types/crscTypes';

interface AnalyticsInput {
  computations: CRSCComputationResult[];
  evidenceMaps: CRSCEvidenceMappingResult[];
  eligibilityBuckets: Array<{ status: string }>; // Likely / Possible / Unclear / Unlikely
  readinessImprovements?: number[]; // deltas in retirement readiness from CRSC
}

export function buildCrscAnalytics(input: AnalyticsInput): CRSCAnalyticsSnapshot {
  const combatRelatedPercentageDistribution: Array<{ bucket: string; count: number }> = [];
  const bucketCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const evidenceStrengthCounts: Record<'LOW' | 'MEDIUM' | 'HIGH', number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  let totalPayable = 0;

  input.computations.forEach(result => {
    const bucket = bucketize(result.combatRelatedPercentage);
    bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
    totalPayable += result.crscFinalPayment;
  });

  Object.entries(bucketCounts).forEach(([bucket, count]) => {
    combatRelatedPercentageDistribution.push({ bucket, count });
  });

  input.evidenceMaps.forEach(map => {
    map.conditions.forEach(cond => {
      const cat = cond.combatCategory || 'unassigned';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      evidenceStrengthCounts[cond.confidence] = (evidenceStrengthCounts[cond.confidence] || 0) + 1;
    });
  });

  const eligibilityDistribution: Record<string, number> = {};
  input.eligibilityBuckets.forEach(e => {
    eligibilityDistribution[e.status] = (eligibilityDistribution[e.status] || 0) + 1;
  });

  const readinessImpact = average(input.readinessImprovements || []);

  return {
    eligibilityDistribution,
    combatCategoryBreakdown: categoryCounts,
    evidenceStrength: evidenceStrengthCounts,
    combatRelatedPercentageDistribution,
    averageCrscPayable: input.computations.length ? totalPayable / input.computations.length : 0,
    readinessImpact,
    approvalIndicators: deriveApprovalIndicators(evidenceStrengthCounts),
    trends: []
  };
}

function bucketize(pct: number): string {
  if (pct >= 90) return '90-100%';
  if (pct >= 70) return '70-89%';
  if (pct >= 50) return '50-69%';
  if (pct >= 30) return '30-49%';
  return '0-29%';
}

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function deriveApprovalIndicators(counts: Record<'LOW' | 'MEDIUM' | 'HIGH', number>): string[] {
  const indicators: string[] = [];
  if ((counts.HIGH || 0) > (counts.LOW || 0)) {
    indicators.push('Higher evidence strength correlates with better CRSC outcomes.');
  }
  if ((counts.MEDIUM || 0) > (counts.LOW || 0)) {
    indicators.push('Moderate evidence strength still appears viable; emphasize documentation.');
  }
  return indicators;
}
