export type ChecklistCategory = "finance" | "healthcare" | "employment" | "education" | "housing" | "legal" | "benefits"

export type ChecklistItem = {
  id: string
  category: ChecklistCategory
  title: string
  description: string
  completed: boolean
  dueDate?: Date
  priority: "low" | "medium" | "high"
}

export type TransitionChecklist = {
  id: string
  userId: string
  items: ChecklistItem[]
  completedCount: number
  totalCount: number
  progressPercent: number
}

export type MOSCode = string

export type MOSTranslation = {
  mosCode: MOSCode
  mosTitle: string
  civilianRoles: string[]
  certifications: string[]
  careerPaths: string[]
  description: string
}

export type VABenefitsType = "healthcare" | "disability" | "education" | "housing" | "employment"

export type VABenefit = {
  type: VABenefitsType
  name: string
  description: string
  eligibility: string
  applicationUrl: string
  processingTime: string
}

export type VANavigatorStep = {
  id: string
  step: number
  title: string
  description: string
  benefits: VABenefit[]
  actions: string[]
}

export type DocumentType = "dd214" | "str" | "medical" | "awards" | "training" | "discharge" | "other"

export type Document = {
  id: string
  type: DocumentType
  name: string
  uploadedAt: Date
  fileUrl: string
  verified: boolean
}

export type DocumentChecklist = {
  userId: string
  documents: Document[]
  completedCount: number
  totalCount: number
}

export type TransitionTimelineTask = {
  id: string
  monthsBeforeSeparation: number
  category: ChecklistCategory
  title: string
  description: string
  priority: "low" | "medium" | "high"
  completed: boolean
}

export type TransitionTimeline = {
  userId: string
  separationDate: Date
  tasks: TransitionTimelineTask[]
}

export type MilitaryExperienceEntry = {
  role: string
  duration: string
  achievements: string[]
  responsibilities: string[]
}

export type ResumeBulletPoint = {
  id: string
  original: string
  civilian: string
}

export type ResumeBuild = {
  id: string
  userId: string
  name: string
  militaryExperience: MilitaryExperienceEntry[]
  civilianBullets: ResumeBulletPoint[]
  skills: string[]
  certifications: string[]
  education: string[]
  exportFormat: "pdf" | "docx" | "txt"
}
