import { RetirementPlanInput, RetirementPlanResult } from '../../../retirement/types'
import { runRetirementPlan } from '../../../retirement/services/retirementEngine'
import { applyCrscToRetirementResult } from '../../../retirement/services/crscRetirementAdapter'
import { CRSCComputationResult } from '../../types/crscTypes'

export interface CrscScenarioResult {
  crscPayment: number;
  before: RetirementPlanResult;
  after: RetirementPlanResult;
}

/**
 * Simulate "What if my CRSC is approved?" without mutating profile or plan.
 */
export function runCrscApprovalScenario(
  plan: RetirementPlanInput,
  crsc: CRSCComputationResult,
  evidenceStrength: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
): CrscScenarioResult {
  const base = runRetirementPlan(plan)
  const crscPayment = crsc?.crscFinalPayment || 0
  const contract = {
    crscFinalPayment: crscPayment,
    combatRelatedPercentage: crsc?.combatRelatedPercentage || 0,
    retiredPayOffset: crsc?.retiredPayOffset || 0,
    crscEligibleAmount: crsc?.crscEligibleAmount || 0,
    crscRationale: crsc?.rationale || [],
    evidenceStrength,
    timestamp: new Date().toISOString(),
    version: 'v1' as const
  }
  const after = applyCrscToRetirementResult(plan, base, contract)
  return {
    crscPayment,
    before: base,
    after
  }
}
