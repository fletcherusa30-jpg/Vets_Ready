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
  const table = []
  let current = ss.full * 12
  for (let i = 0; i < years; i++) {
    table.push({ year: i + 1, annual: current })
    current *= 1 + ss.colaRate
  }
  return table
}
