import { InvestmentAccount, YearlyBalance } from "../types"
import { compoundMonthly, weightedReturn } from "../utils/finance"

const DEFAULT_TSP_FUNDS: Record<string, number> = {
  G: 0.02,
  F: 0.04,
  C: 0.07,
  S: 0.08,
  I: 0.06,
  L2050: 0.065,
}

export function projectTsp(account: InvestmentAccount, years: number): YearlyBalance[] {
  const allocations = account.tspAllocations?.length
    ? account.tspAllocations.map((a) => ({ percentage: a.percentage, expected: DEFAULT_TSP_FUNDS[a.fund] ?? account.expectedReturn }))
    : [{ percentage: 1, expected: account.expectedReturn }]

  const expected = weightedReturn(allocations)
  const employerMatch = (account.employerMatchPercent ?? 0.05) * account.monthlyContribution
  const balances = compoundMonthly(account.balance, account.monthlyContribution + employerMatch, expected, years)
  return balances
}
