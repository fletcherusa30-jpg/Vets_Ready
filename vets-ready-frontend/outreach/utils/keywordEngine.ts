import { KeywordTag, PageCategory } from "../types"

const KEYWORD_MAPPINGS: KeywordTag[] = [
  // High confidence military/veteran keywords
  { keyword: "veteran", category: "veteran-resource", confidence: 0.95 },
  { keyword: "veterans", category: "veteran-resource", confidence: 0.95 },
  { keyword: "military", category: "military-branch", confidence: 0.85 },
  { keyword: "armed forces", category: "military-branch", confidence: 0.9 },
  { keyword: "veteran support", category: "support-group", confidence: 0.95 },
  { keyword: "transition assistance", category: "transition-assistance", confidence: 0.95 },
  { keyword: "veteran nonprofit", category: "nonprofit", confidence: 0.95 },
  { keyword: "VSO", category: "veteran-resource", confidence: 0.95 },
  { keyword: "VA benefits", category: "veteran-resource", confidence: 0.9 },
  { keyword: "GI bill", category: "educational", confidence: 0.9 },
  { keyword: "military spouse", category: "support-group", confidence: 0.85 },

  // Military branch keywords
  { keyword: "Army", category: "military-branch", confidence: 0.8 },
  { keyword: "Marine Corps", category: "military-branch", confidence: 0.9 },
  { keyword: "Navy", category: "military-branch", confidence: 0.7 },
  { keyword: "Air Force", category: "military-branch", confidence: 0.8 },
  { keyword: "Space Force", category: "military-branch", confidence: 0.85 },
  { keyword: "Coast Guard", category: "military-branch", confidence: 0.9 },
  { keyword: "National Guard", category: "military-branch", confidence: 0.85 },

  // Healthcare and mental health
  { keyword: "military healthcare", category: "healthcare", confidence: 0.9 },
  { keyword: "TRICARE", category: "healthcare", confidence: 0.95 },
  { keyword: "veteran mental health", category: "healthcare", confidence: 0.9 },
  { keyword: "PTSD support", category: "support-group", confidence: 0.85 },
  { keyword: "combat veteran", category: "support-group", confidence: 0.9 },

  // Resource and education keywords
  { keyword: "veteran business", category: "business", confidence: 0.9 },
  { keyword: "veteran entrepreneur", category: "business", confidence: 0.9 },
  { keyword: "military education", category: "educational", confidence: 0.85 },
  { keyword: "vocational training", category: "educational", confidence: 0.6 },

  // Community and government
  { keyword: "veteran community", category: "community", confidence: 0.85 },
  { keyword: "American Legion", category: "nonprofit", confidence: 0.95 },
  { keyword: "VFW", category: "nonprofit", confidence: 0.95 },
  { keyword: "Disabled American Veterans", category: "nonprofit", confidence: 0.95 },
  { keyword: "Department of Veterans Affairs", category: "government", confidence: 0.95 },
]

export function scanForVeteranKeywords(text: string): { tags: KeywordTag[]; confidence: number } {
  const lowerText = text.toLowerCase()
  const foundTags: KeywordTag[] = []
  const matched = new Set<string>()

  KEYWORD_MAPPINGS.forEach((tag) => {
    if (lowerText.includes(tag.keyword.toLowerCase()) && !matched.has(tag.keyword)) {
      foundTags.push(tag)
      matched.add(tag.keyword)
    }
  })

  // Calculate overall confidence
  const avgConfidence = foundTags.length > 0 ? foundTags.reduce((sum, t) => sum + t.confidence, 0) / foundTags.length : 0
  return { tags: foundTags, confidence: Math.min(avgConfidence * 1.1, 1) } // Boost if multiple keywords found
}

export function getCategoryFromKeywords(text: string): PageCategory {
  const { tags } = scanForVeteranKeywords(text)
  if (tags.length === 0) return "other"
  return tags.reduce((best, current) => (current.confidence > (tags[0]?.confidence ?? 0) ? current.category : best), tags[0]?.category ?? "other")
}

export function getKeywordsByCategory(category: PageCategory): string[] {
  return KEYWORD_MAPPINGS.filter((tag) => tag.category === category).map((tag) => tag.keyword)
}

export function matchConfidenceScore(text: string): number {
  const { confidence } = scanForVeteranKeywords(text)
  return confidence
}
