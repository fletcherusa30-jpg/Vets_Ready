import {
  Guidance,
  IncomeStream,
  RetirementPlanInput,
  RetirementPlanResult,
  YearlyBalance,
} from "../types"
import { adjustForInflation } from "../utils/finance"
import { aggregateAccounts, projectAccount } from "./accountService"
import { calculateMilitaryPension, projectPension } from "./pensionService"
import { calculateSocialSecurity, projectSocialSecurity } from "./socialSecurityService"
import { projectTsp } from "./tspService"
import { estimateVaIncome, projectVaIncome } from "./vaService"
import { buildWithdrawalProjections } from "./withdrawalService"

function projectAccounts(plan: RetirementPlanInput): { combined: YearlyBalance[]; tspOnly: YearlyBalance[] } {
  const years = plan.projectionYears
  const tspAccounts = plan.accounts.filter((a) => a.type === "tsp")
  const otherAccounts = plan.accounts.filter((a) => a.type !== "tsp")

  const tspProjections = tspAccounts.map((account) => projectTsp(account, years))
  const otherProjections = otherAccounts.map((account) => projectAccount(account, years))

  const combined = aggregateAccounts(plan.accounts, years).map((row, idx) => {
    const year = idx + 1
    return {
      ...row,
      age: plan.currentAge + year,
      realBalance: adjustForInflation(row.nominalBalance, plan.inflation.general, year),
    }
  })

  const tspOnly = aggregateAccounts(tspAccounts, years).map((row, idx) => {
    const year = idx + 1
    return {
      ...row,
      age: plan.currentAge + year,
      realBalance: adjustForInflation(row.nominalBalance, plan.inflation.general, year),
    }
  })

  // Attach richer contributions/growth by summing projections
  const mergeProjections = (projections: YearlyBalance[][]): YearlyBalance[] => {
    const merged: YearlyBalance[] = []
    for (let i = 0; i < years; i++) {
      let nominalBalance = 0
      let contributions = 0
      let growth = 0
      projections.forEach((balances) => {
        const entry = balances[Math.min(i, balances.length - 1)]
        nominalBalance += entry.nominalBalance
        contributions += entry.contributions
        growth += entry.growth
      })
      const year = i + 1
      merged.push({
        year,
        age: plan.currentAge + year,
        nominalBalance,
        realBalance: adjustForInflation(nominalBalance, plan.inflation.general, year),
        contributions,
        growth,
      })
    }
    return merged
  }

  return {
    combined: tspProjections.length || otherProjections.length ? mergeProjections([...tspProjections, ...otherProjections]) : combined,
    tspOnly: tspProjections.length ? mergeProjections(tspProjections) : tspOnly,
  }
}

function buildGuidance(readinessScore: number, plan: RetirementPlanInput): Guidance {
  const suggestions: string[] = []
  const allocationIdeas: string[] = []
  const riskNotes: string[] = []
  const spendingAdjustments: string[] = []

  if (readinessScore < 60) {
    suggestions.push("Increase savings rate by 5-10% over the next 12 months.")
    riskNotes.push("Portfolio may be underfunded for desired retirement age.")
  } else if (readinessScore < 80) {
    suggestions.push("Stay the course but revisit allocations annually to capture growth.")
  } else {
    suggestions.push("You are on track; focus on tax efficiency and withdrawal planning.")
  }

  allocationIdeas.push("Consider tilting TSP toward C/S funds if time horizon > 10 years.")
  allocationIdeas.push("Use Roth buckets for growth and taxable for flexibility.")

  if (plan.spending.baselineMonthly > 0) {
    spendingAdjustments.push("Model a 5% reduction in discretionary spend to boost readiness.")
  }

  riskNotes.push("Review healthcare cost assumptions annually to match actual premiums.")

  return { suggestions, allocationIdeas, riskNotes, spendingAdjustments }
}

function buildIncomes(plan: RetirementPlanInput) {
  const pension = calculateMilitaryPension(plan.pension)
  const va = estimateVaIncome(plan.vaDisability)
  const ss = calculateSocialSecurity(plan.socialSecurity)

  const incomes: IncomeStream[] = [
    { source: "Pension", annual: pension.annualPension, monthly: pension.annualPension / 12 },
    { source: "VA Disability", annual: va.annual, monthly: va.monthly },
    { source: "Social Security", annual: ss.full * 12, monthly: ss.full },
  ]

  const pensionProjection = projectPension(pension, plan.projectionYears)
  const vaProjection = projectVaIncome(va, plan.projectionYears)
  const ssProjection = projectSocialSecurity(ss, plan.projectionYears)

  return { incomes, pension, va, ss, pensionProjection, vaProjection, ssProjection }
}

export function runRetirementPlan(plan: RetirementPlanInput): RetirementPlanResult {
  const yearsUntilRetirement = Math.max(plan.retirementAge - plan.currentAge, 0)
  const projectionYears = plan.projectionYears

  const { combined, tspOnly } = projectAccounts(plan)
  const { incomes, pension, va, ss, pensionProjection, vaProjection, ssProjection } = buildIncomes(plan)

  const portfolioAtRetirement = combined[Math.min(yearsUntilRetirement, combined.length) - 1] ?? combined[combined.length - 1]
  const totalMonthlyIncomeNominal = incomes.reduce((sum, i) => sum + i.monthly, 0)
  const totalMonthlyIncomeReal = adjustForInflation(totalMonthlyIncomeNominal, plan.inflation.general, yearsUntilRetirement)

  const annualSpending =
    (plan.spending.baselineMonthly + plan.spending.healthcareMonthly + plan.spending.housingMonthly + plan.spending.otherMonthly) * 12
  const readinessRatio = annualSpending > 0 ? (totalMonthlyIncomeReal * 12) / annualSpending : 1
  const readinessScore = Math.max(0, Math.min(100, Math.round(readinessRatio * 90 + 10)))

  const withdrawals = buildWithdrawalProjections(portfolioAtRetirement?.nominalBalance ?? 0, plan.withdrawal)

  const colaTable = Array.from({ length: projectionYears }, (_, idx) => {
    const year = idx + 1
    return {
      year,
      colaMultiplier: Math.pow(1 + plan.inflation.cola, year),
      inflationMultiplier: Math.pow(1 + plan.inflation.general, year),
    }
  })

  const guidance = buildGuidance(readinessScore, plan)

  // Build combinedProjection including income streams into nominal balance if desired later
  const combinedProjection: YearlyBalance[] = combined.map((b) => ({ ...b }))

  return {
    summary: {
      projectedPortfolioAtRetirement: portfolioAtRetirement?.nominalBalance ?? 0,
      readinessScore,
      monthlyIncomeNominal: totalMonthlyIncomeNominal,
      monthlyIncomeReal: totalMonthlyIncomeReal,
    },
    balances: combined,
    incomes,
    withdrawals,
    tspOnly,
    combinedProjection,
    colaTable,
    guidance,
  }
}
