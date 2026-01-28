import { RetirementPlanInput, RetirementPlanResult } from '../types'
import { CRSCToRetirementContract } from '../../src/types/crscContract'

/**
 * Apply CRSC as a tax-free income stream to an existing retirement result.
 * Non-mutating: returns a cloned result with CRSC income and updated readiness.
 */
export function applyCrscToRetirementResult(
  plan: RetirementPlanInput,
  baseResult: RetirementPlanResult,
  crsc: CRSCToRetirementContract
): RetirementPlanResult {
  const crscMonthly = crsc.crscFinalPayment || 0
  const crscAnnual = crscMonthly * 12

  // Clone result to avoid mutation
  const updated: RetirementPlanResult = JSON.parse(JSON.stringify(baseResult))

  // Inject CRSC income entry
  updated.incomes = [
    ...updated.incomes,
    {
      source: 'CRSC — Tax-Free',
      annual: crscAnnual,
      monthly: crscMonthly
    }
  ]

  // Recompute monthly income sums
  const totalMonthlyIncomeNominal = updated.incomes.reduce((sum, i) => sum + i.monthly, 0)

  const yearsUntilRetirement = Math.max(plan.retirementAge - plan.currentAge, 0)
  const annualSpending =
    (plan.spending.baselineMonthly + plan.spending.healthcareMonthly + plan.spending.housingMonthly + plan.spending.otherMonthly) * 12

  const readinessRatio = annualSpending > 0 ? (totalMonthlyIncomeNominal * 12) / annualSpending : 1
  const readinessScore = Math.max(0, Math.min(100, Math.round(readinessRatio * 90 + 10)))

  updated.summary.monthlyIncomeNominal = totalMonthlyIncomeNominal
  updated.summary.monthlyIncomeReal = totalMonthlyIncomeNominal // CRSC is tax-free; treat nominal ≈ real here
  updated.summary.readinessScore = readinessScore

  return updated
}
