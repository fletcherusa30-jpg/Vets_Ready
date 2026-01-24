import { SocialSecurityInput } from "../types"

export function calculateSocialSecurity(input: SocialSecurityInput) {
  const earlyBenefit = input.estimatedFullBenefit * 0.7
  const delayedBenefit = input.estimatedFullBenefit * 1.24
  return {
    early: earlyBenefit,
    full: input.estimatedFullBenefit,
    delayed: delayedBenefit,
    colaRate: input.colaRate,
  }
}

export function projectSocialSecurity(ss: ReturnType<typeof calculateSocialSecurity>, years: number) {
  const table: { year: number; annual: number }[] = []
  let current = ss.full * 12
  for (let i = 0; i < years; i++) {
    table.push({ year: i + 1, annual: current })
    current *= 1 + ss.colaRate
  }
  return table
}

export function lifetimeValue(ss: ReturnType<typeof calculateSocialSecurity>, startAge: number, expectedLongevity: number) {
  const years = Math.max(expectedLongevity - startAge, 0)
  return ss.full * 12 * years
}
