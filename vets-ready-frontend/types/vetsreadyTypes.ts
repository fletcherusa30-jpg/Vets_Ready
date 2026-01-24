import { z } from 'zod'

export const VetsReadyBenefitSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  eligibility_summary: z.string(),
  link: z.string().url(),
  tier: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

export type VetsReadyBenefit = z.infer<typeof VetsReadyBenefitSchema>

export const VetsReadyStateBenefitSchema = z.object({
  id: z.string().uuid(),
  state: z.string().length(2).toUpperCase(),
  benefit_type: z.string(),
  title: z.string(),
  description: z.string(),
  link: z.string().url(),
  status: z.enum(['active', 'inactive']),
})

export type VetsReadyStateBenefit = z.infer<typeof VetsReadyStateBenefitSchema>

export const CreateClaimProfileSchema = z.object({
  title: z.string().min(1),
  conditions: z.array(z.string()).optional(),
})

export type CreateClaimProfile = z.infer<typeof CreateClaimProfileSchema>

export const VetsReadyClaimProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  status: z.enum(['draft', 'ready', 'submitted', 'approved', 'denied']),
  conditions: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type VetsReadyClaimProfile = z.infer<typeof VetsReadyClaimProfileSchema>

export const CreateBudgetSchema = z.object({
  title: z.string().min(1),
  monthly_income: z.number().min(0),
  categories: z.record(z.number()).optional(),
})

export type CreateBudget = z.infer<typeof CreateBudgetSchema>

export const VetsReadyResourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  link: z.string().url(),
  resource_type: z.enum(['guide', 'form', 'tool', 'external', 'other']),
  status: z.enum(['active', 'inactive']),
})

export type VetsReadyResource = z.infer<typeof VetsReadyResourceSchema>

export const VetsReadyPartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['employer', 'business', 'sponsor', 'affiliate', 'other']),
  tier: z.enum(['free', 'basic', 'featured', 'premium']),
  link: z.string().url(),
  status: z.enum(['active', 'inactive']),
  created_at: z.string().datetime(),
})

export type VetsReadyPartner = z.infer<typeof VetsReadyPartnerSchema>

export const CreatePartnerSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['employer', 'business', 'sponsor', 'affiliate', 'other']),
  tier: z.enum(['free', 'basic', 'featured', 'premium']).optional(),
  link: z.string().url(),
})

export type CreatePartner = z.infer<typeof CreatePartnerSchema>
