import { PublicPage, PageCategory, SearchQuery, SocialPlatform } from "../types"
import { matchConfidenceScore } from "../utils/keywordEngine"

// Mock database of public pages (in production, this would come from APIs)
const SAMPLE_PAGES: PublicPage[] = [
  {
    id: "page-1",
    externalId: "fb_american_legion",
    platform: "facebook",
    source: "approved",
    name: "American Legion",
    category: "nonprofit",
    description: "Serving America's veterans since 1919",
    pageUrl: "https://facebook.com/americanlegion",
    followerCount: 250000,
    verified: true,
    confidenceScore: 0.99,
    foundAt: new Date("2024-01-15"),
  },
  {
    id: "page-2",
    externalId: "fb_vfw",
    platform: "facebook",
    source: "approved",
    name: "Veterans of Foreign Wars",
    category: "nonprofit",
    description: "VFW - Honoring the sacrifice of all who fought for freedom",
    pageUrl: "https://facebook.com/vfw",
    followerCount: 180000,
    verified: true,
    confidenceScore: 0.99,
    foundAt: new Date("2024-01-10"),
  },
  {
    id: "page-3",
    externalId: "fb_dav",
    platform: "facebook",
    source: "approved",
    name: "Disabled American Veterans",
    category: "nonprofit",
    description: "Supporting disabled veterans and their families",
    pageUrl: "https://facebook.com/disabledamericanveterans",
    followerCount: 120000,
    verified: true,
    confidenceScore: 0.98,
    foundAt: new Date("2024-01-08"),
  },
  {
    id: "page-4",
    platform: "facebook",
    source: "facebook",
    name: "Army Veteran Support Group",
    category: "support-group",
    description: "Community for Army veterans to share experiences and support each other",
    pageUrl: "https://facebook.com/armyvetsmemories",
    followerCount: 45000,
    verified: false,
    confidenceScore: 0.87,
    foundAt: new Date("2024-01-20"),
  },
]

export function searchPublicPages(query: SearchQuery): PublicPage[] {
  let results = [...SAMPLE_PAGES]

  if (query.keyword) {
    const keyword = query.keyword.toLowerCase()
    results = results.filter(
      (page) => page.name.toLowerCase().includes(keyword) || page.description.toLowerCase().includes(keyword)
    )
  }

  if (query.category) {
    results = results.filter((page) => page.category === query.category)
  }

  if (query.platform) {
    results = results.filter((page) => page.platform === query.platform)
  }

  if (query.verified !== undefined) {
    results = results.filter((page) => page.verified === query.verified)
  }

  if (query.minFollowers) {
    results = results.filter((page) => (page.followerCount ?? 0) >= query.minFollowers)
  }

  return results.sort((a, b) => b.confidenceScore - a.confidenceScore)
}

export function getPagesByCategory(category: PageCategory): PublicPage[] {
  return SAMPLE_PAGES.filter((page) => page.category === category).sort((a, b) => b.followerCount - a.followerCount)
}

export function getTrendingPages(limit: number = 10): PublicPage[] {
  return [...SAMPLE_PAGES].sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0)).slice(0, limit)
}

export function getPageDetails(pageId: string): PublicPage | null {
  return SAMPLE_PAGES.find((page) => page.id === pageId) || null
}

export function getDirectoryStats() {
  const categories: Record<PageCategory, number> = {} as any
  SAMPLE_PAGES.forEach((page) => {
    categories[page.category] = (categories[page.category] ?? 0) + 1
  })

  return {
    totalPages: SAMPLE_PAGES.length,
    verifiedPages: SAMPLE_PAGES.filter((p) => p.verified).length,
    byCategory: categories,
    lastUpdated: new Date(),
  }
}

export function suggestPages(text: string): PublicPage[] {
  const score = matchConfidenceScore(text)
  if (score > 0.6) {
    const keyword = text.split(" ")[0]?.toLowerCase()
    return searchPublicPages({ keyword })
  }
  return []
}
