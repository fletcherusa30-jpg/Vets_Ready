export type JobPostingStatus = "draft" | "published" | "closed" | "archived"

export type JobPosting = {
  id: string
  employerId: string
  title: string
  description: string
  requirements: string[]
  salary?: { min: number; max: number }
  location: string
  postedAt: Date
  closesAt?: Date
  status: JobPostingStatus
  mosCompatibility: string[]
  applicationUrl: string
  createdAt: Date
}

export type EmployerProfile = {
  id: string
  name: string
  description: string
  veteranFriendly: boolean
  logoUrl?: string
  website: string
  foundedYear: number
  industryFocus: string[]
}

export type JobApplication = {
  id: string
  veteranId: string
  jobId: string
  resumeUrl: string
  coverLetter?: string
  appliedAt: Date
  status: "submitted" | "reviewed" | "shortlisted" | "rejected" | "accepted"
  notes?: string
}

export type MatchScore = {
  jobId: string
  veteranId: string
  score: number
  matchedMos: string[]
  matchedSkills: string[]
  reasons: string[]
}

export type VeteranJobProfile = {
  id: string
  userId: string
  mos: string[]
  skills: string[]
  clearanceLevel?: string
  location: string
  targetRoles: string[]
  resumeUrl: string
  salaryExpectation?: number
}

export type JobSearch = {
  keyword?: string
  location?: string
  salary?: { min: number; max: number }
  status?: JobPostingStatus
  mosTags?: string[]
  veteranFriendly?: boolean
}
