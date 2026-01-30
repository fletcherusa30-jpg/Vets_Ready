import { VeteranNonprofit } from "../types"

const SAMPLE_NONPROFITS: VeteranNonprofit[] = [
  {
    id: "org-1",
    name: "Team Rubicon",
    ein: "27-3278407",
    description: "Uniting the skills and resources of the military community with the needs of the civilian sector",
    missionArea: ["disaster-relief", "veteran-employment", "community-service"],
    location: "Los Angeles, CA",
    website: "https://teamrubicon.org",
    phone: "(888) 840-7826",
    email: "info@teamrubicon.org",
    donationUrl: "https://teamrubicon.org/donate",
    taxExemptStatus: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "org-2",
    name: "The Mission Continues",
    ein: "26-2979149",
    description: "Empowering post-9/11 veterans to discover purpose through community service",
    missionArea: ["veteran-mental-health", "community-service", "veteran-leadership"],
    location: "St. Louis, MO",
    website: "https://missioncontinues.org",
    phone: "(314) 446-1044",
    email: "info@missioncontinues.org",
    donationUrl: "https://missioncontinues.org/donate",
    taxExemptStatus: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "org-3",
    name: "Wounded Warrior Project",
    ein: "20-3625476",
    description: "Supporting wounded, ill, and injured service members and veterans",
    missionArea: ["veteran-healthcare", "veteran-mental-health", "veteran-employment"],
    location: "Jacksonville, FL",
    website: "https://woundedwarriorproject.org",
    phone: "(888) 997-2586",
    email: "info@woundedwarriorproject.org",
    donationUrl: "https://woundedwarriorproject.org/donate",
    taxExemptStatus: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "org-4",
    name: "Veteran's Community Care Network",
    ein: "45-1234567",
    description: "Connecting veterans with local support resources and community services",
    missionArea: ["veteran-support", "community-connection", "resource-navigation"],
    location: "Multiple Locations",
    website: "https://veterancare.org",
    phone: "(866) 555-0123",
    email: "help@veterancare.org",
    donationUrl: "https://veterancare.org/donate",
    taxExemptStatus: true,
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-01-20"),
  },
]

export function searchNonprofits(keyword?: string, missionArea?: string): VeteranNonprofit[] {
  let results = [...SAMPLE_NONPROFITS]

  if (keyword) {
    const q = keyword.toLowerCase()
    results = results.filter((org) => org.name.toLowerCase().includes(q) || org.description.toLowerCase().includes(q))
  }

  if (missionArea) {
    results = results.filter((org) => org.missionArea.includes(missionArea))
  }

  return results
}

export function getNonprofitsByMission(missionArea: string): VeteranNonprofit[] {
  return SAMPLE_NONPROFITS.filter((org) => org.missionArea.includes(missionArea))
}

export function getNonprofitsByLocation(location: string): VeteranNonprofit[] {
  return SAMPLE_NONPROFITS.filter((org) => org.location.toLowerCase().includes(location.toLowerCase()))
}

export function getNonprofitDetails(nonprofitId: string): VeteranNonprofit | null {
  return SAMPLE_NONPROFITS.find((org) => org.id === nonprofitId) || null
}

export function getHighRatedNonprofits(limit: number = 5): VeteranNonprofit[] {
  return SAMPLE_NONPROFITS.slice(0, limit)
}

export function getMissionAreas(): string[] {
  const areas = new Set<string>()
  SAMPLE_NONPROFITS.forEach((org) => org.missionArea.forEach((area) => areas.add(area)))
  return Array.from(areas)
}
