export type FundCode = "G" | "F" | "C" | "S" | "I" | `L${number}`

export type FundAllocation = {
  fund: FundCode
  percentage: number // 0-1
}

export type InvestmentAccountType =
  | "tsp"
  | "401k"
  | "403b"
  | "ira"
  | "roth-ira"
  | "sep-ira"
  | "brokerage"
  | "annuity"

export type InvestmentAccount = {
  id: string
  type: InvestmentAccountType
  balance: number
  monthlyContribution: number
  employerMatchPercent?: number
  expectedReturn: number
  expenseRatio?: number
  taxTreatment: "pre-tax" | "roth" | "taxable"
  withdrawalAge: number
  tspAllocations?: FundAllocation[]
}

export type PensionInput = {
  yearsOfService: number
  high3Average: number
  multiplier: number
  colaRate: number
  retirementAge: number
  sbpCoverage: number
}

export type VaDisabilityInput = {
  rating: number
  dependents: number
  colaRate: number
}

export type SocialSecurityInput = {
  estimatedFullBenefit: number
  earlyAge: number
  fullAge: number
  delayedAge: number
  colaRate: number
}

export type SpendingInput = {
  baselineMonthly: number
  healthcareMonthly: number
  housingMonthly: number
  otherMonthly: number
}

export type InflationInput = {
  general: number
  cola: number
  healthcare: number
  housing: number
}

export type WithdrawalStrategyInput = {
  strategy: "three-percent" | "four-percent" | "five-percent" | "dynamic"
  guardrailDrop: number
  guardrailRaise: number
}

export type RetirementPlanInput = {
  retirementAge: number
  currentAge: number
  projectionYears: number
  accounts: InvestmentAccount[]
  pension: PensionInput
  vaDisability: VaDisabilityInput
  socialSecurity: SocialSecurityInput
  spending: SpendingInput
  inflation: InflationInput
  withdrawal: WithdrawalStrategyInput
}

export type YearlyBalance = {
  year: number
  age: number
  nominalBalance: number
  realBalance: number
  contributions: number
  growth: number
}

export type IncomeStream = {
  source: string
  annual: number
  monthly: number
}

export type WithdrawalProjection = {
  strategy: string
  annualWithdrawal: number
  successProbability: number
}

export type Guidance = {
  suggestions: string[]
  allocationIdeas: string[]
  riskNotes: string[]
  spendingAdjustments: string[]
}

export type RetirementPlanResult = {
  summary: {
    projectedPortfolioAtRetirement: number
    readinessScore: number
    monthlyIncomeNominal: number
    monthlyIncomeReal: number
  }
  balances: YearlyBalance[]
  incomes: IncomeStream[]
  withdrawals: WithdrawalProjection[]
  tspOnly: YearlyBalance[]
  combinedProjection: YearlyBalance[]
  colaTable: { year: number; colaMultiplier: number; inflationMultiplier: number }[]
  guidance: Guidance
}

export type ScenarioRequest = {
  base: RetirementPlanInput
  scenarios: { name: string; overrides: Partial<RetirementPlanInput> }[]
}

export type ScenarioResult = { name: string; result: RetirementPlanResult }
