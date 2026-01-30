import { z } from 'zod'

export const rallyforgeBenefitSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  eligibility_summary: z.string(),
  link: z.string().url(),
  tier: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

export type rallyforgeBenefit = z.infer<typeof rallyforgeBenefitSchema>

export const rallyforgeStateBenefitSchema = z.object({
  id: z.string().uuid(),
  state: z.string().length(2).toUpperCase(),
  benefit_type: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  status: z.enum(['active', 'inactive']),
})

export type rallyforgeStateBenefit = z.infer<typeof rallyforgeStateBenefitSchema>

export const CreateClaimProfileSchema = z.object({
  title: z.string().min(1),
  conditions: z.array(z.string()).optional(),
})

export type CreateClaimProfile = z.infer<typeof CreateClaimProfileSchema>

export const rallyforgeClaimProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  status: z.enum(['draft', 'ready', 'submitted', 'approved', 'denied']),
  conditions: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type rallyforgeClaimProfile = z.infer<typeof rallyforgeClaimProfileSchema>

export const CreateBudgetSchema = z.object({
  title: z.string().min(1),
  monthly_income: z.number().min(0),
  categories: z.record(z.number()).optional(),
})

export type CreateBudget = z.infer<typeof CreateBudgetSchema>

export const rallyforgeResourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  link: z.string().url(),
  resource_type: z.enum(['guide', 'form', 'tool', 'external', 'other']),
  status: z.enum(['active', 'inactive']),
})

export type rallyforgeResource = z.infer<typeof rallyforgeResourceSchema>

export const rallyforgePartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['employer', 'business', 'sponsor', 'affiliate', 'other']),
  tier: z.enum(['free', 'basic', 'featured', 'premium']),
  link: z.string().url(),
  status: z.enum(['active', 'inactive']),
  created_at: z.string().datetime(),
})

export type rallyforgePartner = z.infer<typeof rallyforgePartnerSchema>

export const CreatePartnerSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['employer', 'business', 'sponsor', 'affiliate', 'other']),
  tier: z.enum(['free', 'basic', 'featured', 'premium']).optional(),
  link: z.string().url(),
})

export type CreatePartner = z.infer<typeof CreatePartnerSchema>

