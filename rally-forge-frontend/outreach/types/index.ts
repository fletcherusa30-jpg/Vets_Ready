export type PageCategory =
  | "nonprofit"
  | "government"
  | "educational"
  | "business"
  | "support-group"
  | "military-branch"
  | "veteran-resource"
  | "community"
  | "healthcare"
  | "transition-assistance"
  | "other"

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "youtube"

export type PageSource = "facebook" | "linkedin" | "manual" | "approved"

export type PublicPage = {
  id: string
  externalId?: string
  platform: SocialPlatform
  source: PageSource
  name: string
  category: PageCategory
  description: string
  profileImageUrl?: string
  followerCount?: number
  pageUrl: string
  location?: string
  contactEmail?: string
  phone?: string
  verified: boolean
  confidenceScore: number // 0-1, how confident we are it's veteran-related
  foundAt: Date
}

export type VeteranBusiness = {
  id: string
  name: string
  ownerName: string
  description: string
  category: string[]
  location: string
  website?: string
  phone?: string
  email?: string
  socialMedia?: Record<SocialPlatform, string>
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

export type VeteranNonprofit = {
  id: string
  name: string
  ein?: string
  description: string
  missionArea: string[]
  location: string
  website?: string
  phone?: string
  email?: string
  donationUrl?: string
  taxExemptStatus: boolean
  createdAt: Date
  updatedAt: Date
}

export type UserBookmark = {
  id: string
  userId: string
  pageId: string
  category: PageCategory
  savedAt: Date
  notes?: string
}

export type PageSubmission = {
  id: string
  submittedBy: string
  platform: SocialPlatform
  pageName: string
  pageUrl: string
  category: PageCategory
  description: string
  status: "pending" | "approved" | "rejected"
  moderationNotes?: string
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

export type KeywordTag = {
  keyword: string
  category: PageCategory
  confidence: number // 0-1
}

export type OutreachTemplate = {
  id: string
  type: "email" | "social-post" | "resource-card"
  title: string
  content: string
  variables: string[]
  category: PageCategory
  createdAt: Date
  updatedAt: Date
}

export type SearchQuery = {
  keyword?: string
  category?: PageCategory
  location?: string
  platform?: SocialPlatform
  verified?: boolean
  minFollowers?: number
}

export type DirectoryStats = {
  totalPages: number
  verifiedPages: number
  byCategory: Record<PageCategory, number>
  lastUpdated: Date
}
