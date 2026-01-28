import { describe, it, expect } from 'vitest'
import { buildCrscAnalyticsEvent, aggregateCrscEvents } from '../CrscEnterpriseBridge'
import { CRSCComputationResult, CRSCEvidenceMappingResult } from '../../../types/crscTypes'

describe('CrscEnterpriseBridge', () => {
  it('aggregates events into dashboard view', () => {
    const computation: CRSCComputationResult = {
      combatRelatedPercentage: 70,
      combatRelatedConditions: [],
      crscEligibleAmount: 1000,
      retiredPayOffset: 500,
      crscFinalPayment: 500,
      rationale: []
    }
    const evidenceMap: CRSCEvidenceMappingResult = {
      conditions: [
        { conditionId: '1', name: 'TBI', combatCategory: 'armed_conflict', evidence: [], confidence: 'HIGH', gaps: [] },
        { conditionId: '2', name: 'Knee', combatCategory: 'hazardous_service', evidence: [], confidence: 'MEDIUM', gaps: [] }
      ]
    }

    const event = buildCrscAnalyticsEvent({
      cohortId: 'cohort-1',
      eligibilityStatus: 'Likely',
      computation,
      evidenceMap,
      retirementImpactScore: 0.2
    })

    const view = aggregateCrscEvents([event])
    expect(view.eligibilityDistribution['Likely']).toBe(1)
    expect(view.combatCategoryBreakdown.armed_conflict).toBe(1)
    expect(view.evidenceStrengthDistribution.HIGH + view.evidenceStrengthDistribution.MEDIUM + view.evidenceStrengthDistribution.LOW).toBeGreaterThan(0)
    expect(view.payableRangeDistribution.length).toBeGreaterThan(0)
    expect(view.retirementImpactTrend.length).toBeGreaterThan(0)
  })
})
