import { VeteranBusiness } from "../types"

const SAMPLE_BUSINESSES: VeteranBusiness[] = [
  {
    id: "biz-1",
    name: "Veteran's Tactical Gear",
    ownerName: "John Smith",
    description: "Premium tactical equipment and apparel for veterans and first responders",
    category: ["retail", "military-gear"],
    location: "Denver, CO",
    website: "https://veterantacticalgear.com",
    phone: "(303) 555-0100",
    email: "info@veterantacticalgear.com",
    verified: true,
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "biz-2",
    name: "Veteran Consulting Group",
    ownerName: "Sarah Johnson",
    description: "Strategic consulting for military transition and career development",
    category: ["consulting", "career-services"],
    location: "Washington, DC",
    website: "https://veteranconsulting.com",
    phone: "(202) 555-0200",
    email: "hello@veteranconsulting.com",
    verified: true,
    createdAt: new Date("2023-08-20"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "biz-3",
    name: "Operation Trades",
    ownerName: "Michael Brown",
    description: "Trade training and apprenticeships for veteran employment",
    category: ["trades", "training"],
    location: "Austin, TX",
    website: "https://operationtrades.org",
    phone: "(512) 555-0300",
    email: "contact@operationtrades.org",
    verified: true,
    createdAt: new Date("2023-05-10"),
    updatedAt: new Date("2024-01-10"),
  },
]

export function searchBusinesses(keyword?: string, category?: string): VeteranBusiness[] {
  let results = [...SAMPLE_BUSINESSES]

  if (keyword) {
    const q = keyword.toLowerCase()
    results = results.filter((biz) => biz.name.toLowerCase().includes(q) || biz.description.toLowerCase().includes(q))
  }

  if (category) {
    results = results.filter((biz) => biz.category.includes(category))
  }

  return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getBusinessesByLocation(location: string): VeteranBusiness[] {
  return SAMPLE_BUSINESSES.filter((biz) => biz.location.toLowerCase().includes(location.toLowerCase()))
}

export function getBusinessesByCategory(category: string): VeteranBusiness[] {
  return SAMPLE_BUSINESSES.filter((biz) => biz.category.includes(category))
}

export function getBusinessDetails(businessId: string): VeteranBusiness | null {
  return SAMPLE_BUSINESSES.find((biz) => biz.id === businessId) || null
}

export function getTrendingBusinesses(limit: number = 5): VeteranBusiness[] {
  return SAMPLE_BUSINESSES.slice(0, limit)
}
