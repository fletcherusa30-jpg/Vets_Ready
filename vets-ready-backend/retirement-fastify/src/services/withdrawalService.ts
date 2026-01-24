import { WithdrawalStrategyInput, WithdrawalProjection } from "../types"
import { safeWithdrawalAmount } from "../utils/finance"

export function buildWithdrawalProjections(balance: number, strategy: WithdrawalStrategyInput): WithdrawalProjection[] {
  return [
    {
      strategy: "3% rule",
      annualWithdrawal: balance * 0.03,
      successProbability: 0.95,
    },
    {
      strategy: "4% rule",
      annualWithdrawal: balance * 0.04,
      successProbability: 0.9,
    },
    {
      strategy: "5% rule",
      annualWithdrawal: balance * 0.05,
      successProbability: 0.78,
    },
    {
      strategy: "Dynamic",
      annualWithdrawal: safeWithdrawalAmount(balance, strategy),
      successProbability: 0.85,
    },
  ]
}
