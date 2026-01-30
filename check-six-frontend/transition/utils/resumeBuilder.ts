import { ResumeBulletPoint, MilitaryExperienceEntry } from "../types"

const MILITARY_TO_CIVILIAN_VOCABULARY: Record<string, string[]> = {
  "led team": ["managed", "oversaw", "supervised", "directed"],
  "tactical operations": ["strategic planning", "project execution", "operational management"],
  "security clearance": ["high security", "trusted responsibility", "classified information handling"],
  "command": ["leadership", "direction", "oversight"],
  "execute mission": ["accomplish objectives", "deliver results", "complete project"],
  training: ["mentoring", "development", "coaching"],
  discipline: ["accountability", "reliability", "consistency"],
}

export function convertMilitaryBullet(militaryBullet: string): string {
  let civilian = militaryBullet
  Object.entries(MILITARY_TO_CIVILIAN_VOCABULARY).forEach(([military, alternatives]) => {
    if (militaryBullet.toLowerCase().includes(military.toLowerCase())) {
      const alt = alternatives[0]
      civilian = civilian.replace(new RegExp(military, "gi"), alt)
    }
  })
  return civilian
}

export function buildResumeSummary(experience: MilitaryExperienceEntry[]): string {
  if (experience.length === 0) return ""
  const totalYears = experience.reduce((sum, e) => {
    const match = e.duration.match(/(\d+)/)
    return sum + (match ? parseInt(match[0]) : 0)
  }, 0)

  const uniqueSkills = new Set<string>()
  experience.forEach((e) => {
    e.responsibilities.forEach((r) => uniqueSkills.add(r))
  })

  return `Dedicated professional with ${totalYears}+ years of leadership and operational experience. Skilled in ${Array.from(uniqueSkills)
    .slice(0, 3)
    .join(", ")}.`
}

export function extractSkillsFromExperience(experience: MilitaryExperienceEntry[]): string[] {
  const skills = new Set<string>()
  experience.forEach((e) => {
    e.responsibilities.forEach((r) => skills.add(r))
    e.achievements.forEach((a) => skills.add(a))
  })
  return Array.from(skills)
}
