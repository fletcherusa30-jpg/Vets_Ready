import { Static, Type } from "@sinclair/typebox"

export const FundAllocationSchema = Type.Object({
  fund: Type.String({ minLength: 1 }),
  percentage: Type.Number({ minimum: 0, maximum: 1 }),
})
export type FundAllocation = Static<typeof FundAllocationSchema>

export const InvestmentAccountSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  type: Type.Union([
    Type.Literal("tsp"),
    Type.Literal("401k"),
    Type.Literal("403b"),
    Type.Literal("ira"),
    Type.Literal("roth-ira"),
    Type.Literal("sep-ira"),
    Type.Literal("brokerage"),
    Type.Literal("annuity"),
  ]),
  balance: Type.Number({ minimum: 0 }),
  monthlyContribution: Type.Number({ minimum: 0 }),
  employerMatchPercent: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  expectedReturn: Type.Number({ minimum: -0.1, maximum: 0.25 }),
  expenseRatio: Type.Optional(Type.Number({ minimum: 0, maximum: 0.05 })),
  taxTreatment: Type.Union([
    Type.Literal("pre-tax"),
    Type.Literal("roth"),
    Type.Literal("taxable"),
  ]),
  withdrawalAge: Type.Number({ minimum: 0, maximum: 100 }),
  tspAllocations: Type.Optional(Type.Array(FundAllocationSchema)),
})
export type InvestmentAccount = Static<typeof InvestmentAccountSchema>

export const PensionInputSchema = Type.Object({
  yearsOfService: Type.Number({ minimum: 0, maximum: 40 }),
  high3Average: Type.Number({ minimum: 0 }),
  multiplier: Type.Number({ minimum: 0, maximum: 0.04 }),
  colaRate: Type.Number({ minimum: 0, maximum: 0.1 }),
  retirementAge: Type.Number({ minimum: 30, maximum: 80 }),
  sbpCoverage: Type.Number({ minimum: 0, maximum: 0.55 }),
})
export type PensionInput = Static<typeof PensionInputSchema>

export const VaDisabilitySchema = Type.Object({
  rating: Type.Number({ minimum: 0, maximum: 100 }),
  dependents: Type.Number({ minimum: 0, maximum: 10 }),
  colaRate: Type.Number({ minimum: 0, maximum: 0.1 }),
})
export type VaDisabilityInput = Static<typeof VaDisabilitySchema>

export const SocialSecuritySchema = Type.Object({
  estimatedFullBenefit: Type.Number({ minimum: 0 }),
  earlyAge: Type.Number({ minimum: 60, maximum: 70 }),
  fullAge: Type.Number({ minimum: 66, maximum: 70 }),
  delayedAge: Type.Number({ minimum: 70, maximum: 75 }),
  colaRate: Type.Number({ minimum: 0, maximum: 0.1 }),
})
export type SocialSecurityInput = Static<typeof SocialSecuritySchema>

export const SpendingSchema = Type.Object({
  baselineMonthly: Type.Number({ minimum: 0 }),
  healthcareMonthly: Type.Number({ minimum: 0 }),
  housingMonthly: Type.Number({ minimum: 0 }),
  otherMonthly: Type.Number({ minimum: 0 }),
})
export type SpendingInput = Static<typeof SpendingSchema>

export const InflationSchema = Type.Object({
  general: Type.Number({ minimum: 0, maximum: 0.1 }),
  cola: Type.Number({ minimum: 0, maximum: 0.1 }),
  healthcare: Type.Number({ minimum: 0, maximum: 0.1 }),
  housing: Type.Number({ minimum: 0, maximum: 0.1 }),
})
export type InflationInput = Static<typeof InflationSchema>

export const WithdrawalStrategySchema = Type.Object({
  strategy: Type.Union([
    Type.Literal("three-percent"),
    Type.Literal("four-percent"),
    Type.Literal("five-percent"),
    Type.Literal("dynamic"),
  ]),
  guardrailDrop: Type.Number({ minimum: 0, maximum: 0.1 }),
  guardrailRaise: Type.Number({ minimum: 0, maximum: 0.1 }),
})
export type WithdrawalStrategyInput = Static<typeof WithdrawalStrategySchema>

export const RetirementPlanInputSchema = Type.Object({
  retirementAge: Type.Number({ minimum: 40, maximum: 80 }),
  currentAge: Type.Number({ minimum: 18, maximum: 75 }),
  projectionYears: Type.Number({ minimum: 5, maximum: 60 }),
  accounts: Type.Array(InvestmentAccountSchema),
  pension: PensionInputSchema,
  vaDisability: VaDisabilitySchema,
  socialSecurity: SocialSecuritySchema,
  spending: SpendingSchema,
  inflation: InflationSchema,
  withdrawal: WithdrawalStrategySchema,
})
export type RetirementPlanInput = Static<typeof RetirementPlanInputSchema>

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

export const ScenarioRequestSchema = Type.Object({
  base: RetirementPlanInputSchema,
  scenarios: Type.Array(
    Type.Object({
      name: Type.String({ minLength: 1 }),
      overrides: Type.Partial(RetirementPlanInputSchema),
    })
  ),
})
export type ScenarioRequest = Static<typeof ScenarioRequestSchema>

export type ScenarioResult = {
  name: string
  result: RetirementPlanResult
}
