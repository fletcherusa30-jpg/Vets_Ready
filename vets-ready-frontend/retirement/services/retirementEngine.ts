import {
  Guidance,
  IncomeStream,
  RetirementPlanInput,
  RetirementPlanResult,
  YearlyBalance,
  WithdrawalProjection,
} from "../types"
import { applyInflation, projectAccountGrowth, safeWithdrawalAmount } from "../utils/finance"
import { calculateMilitaryPension, projectPension } from "./pensionEngine"
import { calculateSocialSecurity, lifetimeValue, projectSocialSecurity } from "./socialSecurityEngine"
import { projectTsp } from "./tspEngine"
import { estimateVaIncome, projectVaIncome } from "./vaEngine"
import { DEFAULT_INFLATION } from "../../shared/constants/finance"
import { adjustForInflation } from "../../shared/utils/math"

function aggregateAccounts(plan: RetirementPlanInput): { combined: YearlyBalance[]; tspOnly: YearlyBalance[] } {
  const years = plan.projectionYears
  const tspAccounts = plan.accounts.filter((a) => a.type === "tsp")
  const otherAccounts = plan.accounts.filter((a) => a.type !== "tsp")

  const projectList = (accounts: typeof plan.accounts) => {
    const merged: YearlyBalance[] = []
    for (let year = 1; year <= years; year++) {
      let nominalBalance = 0
      let contributions = 0
      let growth = 0
      accounts.forEach((account) => {
        const projection = account.type === "tsp" ? projectTsp(account, year) : projectAccountGrowth(account.balance, account.monthlyContribution, account.expectedReturn, year)
        const latest = projection[projection.length - 1]
        nominalBalance += latest.nominalBalance
        contributions += latest.contributions
        growth += latest.growth
      })
      merged.push({
        year,
        age: plan.currentAge + year,
        nominalBalance,
        realBalance: adjustForInflation(nominalBalance, plan.inflation.general ?? DEFAULT_INFLATION, year),
        contributions,
        growth,
      })
    }
    return merged
  }

  return {
    combined: projectList(plan.accounts),
    tspOnly: projectList(tspAccounts),
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
    suggestions.push("On track. Focus on tax efficiency and distribution strategy.")
  }

  allocationIdeas.push("Consider growth tilt in TSP C/S funds with >10y horizon.")
  allocationIdeas.push("Maintain 3-6 months cash in taxable accounts for flexibility.")
  spendingAdjustments.push("Test a 5% discretionary reduction to improve readiness.")
  riskNotes.push("Revisit healthcare inflation and long-term care assumptions annually.")

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

function buildWithdrawals(portfolioBalance: number, strategy: RetirementPlanInput["withdrawal"]): WithdrawalProjection[] {
  return [
    {
      strategy: "3% rule",
      annualWithdrawal: portfolioBalance * 0.03,
      successProbability: 0.95,
    },
    {
      strategy: "4% rule",
      annualWithdrawal: portfolioBalance * 0.04,
      successProbability: 0.9,
    },
    {
      strategy: "5% rule",
      annualWithdrawal: portfolioBalance * 0.05,
      successProbability: 0.78,
    },
    {
      strategy: "Dynamic",
      annualWithdrawal: safeWithdrawalAmount(portfolioBalance, strategy),
      successProbability: 0.85,
    },
  ]
}

export function runRetirementPlan(plan: RetirementPlanInput): RetirementPlanResult {
  const yearsUntilRetirement = Math.max(plan.retirementAge - plan.currentAge, 0)
  const projectionYears = plan.projectionYears

  const { combined, tspOnly } = aggregateAccounts(plan)
  const { incomes, pension, va, ss } = buildIncomes(plan)

  const portfolioAtRetirement = combined[Math.min(yearsUntilRetirement, combined.length) - 1] ?? combined[combined.length - 1]
  const totalMonthlyIncomeNominal = incomes.reduce((sum, i) => sum + i.monthly, 0)
  const totalMonthlyIncomeReal = adjustForInflation(totalMonthlyIncomeNominal, plan.inflation.general ?? DEFAULT_INFLATION, yearsUntilRetirement)

  const annualSpending =
    (plan.spending.baselineMonthly + plan.spending.healthcareMonthly + plan.spending.housingMonthly + plan.spending.otherMonthly) * 12
  const readinessRatio = annualSpending > 0 ? (totalMonthlyIncomeReal * 12) / annualSpending : 1
  const readinessScore = Math.max(0, Math.min(100, Math.round(readinessRatio * 90 + 10)))

  const withdrawals = buildWithdrawals(portfolioAtRetirement?.nominalBalance ?? 0, plan.withdrawal)

  const colaTable = Array.from({ length: projectionYears }, (_, idx) => {
    const year = idx + 1
    return {
      year,
      colaMultiplier: Math.pow(1 + plan.inflation.cola, year),
      inflationMultiplier: Math.pow(1 + plan.inflation.general, year),
    }
  })

  const guidance = buildGuidance(readinessScore, plan)

  const combinedProjection: YearlyBalance[] = combined.map((b) => ({ ...b }))

  // additional signals
  const ssLifetimeValue = lifetimeValue(ss, plan.socialSecurity.fullAge, plan.retirementAge + projectionYears)
  const incomesWithLifetime: IncomeStream[] = [
    ...incomes,
    { source: "SS Lifetime", annual: ssLifetimeValue, monthly: ssLifetimeValue / 12 },
  ]

  return {
    summary: {
      projectedPortfolioAtRetirement: portfolioAtRetirement?.nominalBalance ?? 0,
      readinessScore,
      monthlyIncomeNominal: totalMonthlyIncomeNominal,
      monthlyIncomeReal: totalMonthlyIncomeReal,
    },
    balances: combined,
    incomes: incomesWithLifetime,
    withdrawals,
    tspOnly,
    combinedProjection,
    colaTable,
    guidance,
  }
}
