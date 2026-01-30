import { DEFAULT_TSP_FUND_RETURNS } from "../../shared/constants/finance"
import { InvestmentAccount, YearlyBalance } from "../types"
import { compoundMonthly } from "../../shared/utils/math"
import { weightedFundReturn } from "../utils/finance"

export function projectTsp(account: InvestmentAccount, years: number): YearlyBalance[] {
  const allocations = account.tspAllocations?.length
    ? account.tspAllocations.map((a) => ({ percentage: a.percentage, expected: DEFAULT_TSP_FUND_RETURNS[a.fund] ?? account.expectedReturn }))
    : [{ percentage: 1, expected: account.expectedReturn }]

  const expectedReturn = weightedFundReturn(allocations)
  const employerMatch = (account.employerMatchPercent ?? 0.05) * account.monthlyContribution
  const base = compoundMonthly(account.balance, account.monthlyContribution + employerMatch, expectedReturn, years)

  return base.map((row) => ({
    year: row.year,
    age: 0,
    nominalBalance: row.nominal,
    realBalance: row.nominal,
    contributions: row.contributions,
    growth: row.growth,
  }))
}
