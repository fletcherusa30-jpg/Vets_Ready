import { InvestmentAccount, YearlyBalance } from "../types"
import { compoundMonthly } from "../utils/finance"

export function projectAccount(account: InvestmentAccount, years: number): YearlyBalance[] {
  return compoundMonthly(account.balance, account.monthlyContribution, account.expectedReturn, years)
}

export function aggregateAccounts(accounts: InvestmentAccount[], years: number): YearlyBalance[] {
  const yearly: YearlyBalance[] = []
  for (let year = 1; year <= years; year++) {
    let nominalBalance = 0
    let contributions = 0
    let growth = 0
    accounts.forEach((account) => {
      const projection = projectAccount(account, year)
      const latest = projection[projection.length - 1]
      nominalBalance += latest.nominalBalance
      contributions += latest.contributions
      growth += latest.growth
    })
    yearly.push({
      year,
      age: 0,
      nominalBalance,
      realBalance: nominalBalance,
      contributions,
      growth,
    })
  }
  return yearly
}
