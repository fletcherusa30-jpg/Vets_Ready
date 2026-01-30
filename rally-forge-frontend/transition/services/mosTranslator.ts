import { MOSCode, MOSTranslation } from "../types"

// Sample MOS-to-civilian mapping database
const MOS_TRANSLATIONS: Record<MOSCode, MOSTranslation> = {
  "11B": {
    mosCode: "11B",
    mosTitle: "Infantry Squad Leader",
    civilianRoles: ["Operations Manager", "Project Manager", "Security Director", "Team Lead"],
    certifications: ["PMP", "CISSP", "CompTIA Security+"],
    careerPaths: ["Management", "Operations", "Security", "Consulting"],
    description: "Leadership and tactical skills translate to management, operations, and security roles",
  },
  "25B": {
    mosCode: "25B",
    mosTitle: "Information Technology Specialist",
    civilianRoles: ["IT Systems Administrator", "Network Engineer", "Cybersecurity Analyst", "IT Manager"],
    certifications: ["CompTIA A+", "Network+", "Security+", "CISSP"],
    careerPaths: ["IT Management", "Cybersecurity", "Infrastructure", "Cloud Engineering"],
    description: "IT specialists have direct civilian equivalents in tech industry",
  },
  "68W": {
    mosCode: "68W",
    mosTitle: "Combat Medic",
    civilianRoles: ["Paramedic", "EMT", "Nursing Assistant", "Healthcare Administrator"],
    certifications: ["Paramedic Certification", "RN", "Healthcare Management"],
    careerPaths: ["Emergency Medicine", "Healthcare Administration", "Public Health"],
    description: "Medical training transfers directly to healthcare sector",
  },
}

export function translateMOS(mosCode: MOSCode): MOSTranslation | null {
  return MOS_TRANSLATIONS[mosCode] || null
}

export function getAllMOSTranslations(): MOSTranslation[] {
  return Object.values(MOS_TRANSLATIONS)
}

export function searchMOSByRole(role: string): MOSTranslation[] {
  const query = role.toLowerCase()
  return Object.values(MOS_TRANSLATIONS).filter(
    (mos) => mos.mosTitle.toLowerCase().includes(query) || mos.civilianRoles.some((r) => r.toLowerCase().includes(query))
  )
}
