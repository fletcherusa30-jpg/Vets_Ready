import { JobPosting, VeteranJobProfile, MatchScore } from "../types"

export function calculateMatchScore(job: JobPosting, veteran: VeteranJobProfile): MatchScore {
  let score = 0
  const matchedMos: string[] = []
  const matchedSkills: string[] = []
  const reasons: string[] = []

  // MOS matching
  const moMatches = job.mosCompatibility.filter((mos) => veteran.mos.includes(mos))
  if (moMatches.length > 0) {
    matchedMos.push(...moMatches)
    score += 40
    reasons.push(`${moMatches.length} MOS match(es)`)
  }

  // Skills matching
  const skillMatches = job.requirements.filter((req) => veteran.skills.some((skill) => skill.toLowerCase().includes(req.toLowerCase())))
  if (skillMatches.length > 0) {
    matchedSkills.push(...skillMatches)
    score += 30
    reasons.push(`${skillMatches.length} skill match(es)`)
  }

  // Location preference (small boost if match)
  if (job.location.toLowerCase() === veteran.location.toLowerCase()) {
    score += 10
    reasons.push("Location match")
  }

  // Salary alignment
  if (job.salary && veteran.salaryExpectation) {
    if (veteran.salaryExpectation <= job.salary.max) {
      score += 20
      reasons.push("Salary within range")
    }
  } else if (job.salary || veteran.salaryExpectation) {
    score += 10
    reasons.push("Salary not specified")
  }

  return {
    jobId: job.id,
    veteranId: veteran.id,
    score: Math.min(100, score),
    matchedMos,
    matchedSkills,
    reasons,
  }
}

export function searchJobs(jobs: JobPosting[], query: string): JobPosting[] {
  const q = query.toLowerCase()
  return jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
  )
}

export function filterJobs(
  jobs: JobPosting[],
  filters: { location?: string; minSalary?: number; maxSalary?: number; veteranFriendly?: boolean }
): JobPosting[] {
  return jobs.filter((job) => {
    if (filters.location && job.location.toLowerCase() !== filters.location.toLowerCase()) return false
    if (filters.minSalary && (!job.salary || job.salary.min < filters.minSalary)) return false
    if (filters.maxSalary && (!job.salary || job.salary.max > filters.maxSalary)) return false
    return true
  })
}

export function rankJobsByMatch(jobs: JobPosting[], veteran: VeteranJobProfile): JobPosting[] {
  return jobs.sort((a, b) => {
    const scoreA = calculateMatchScore(a, veteran)
    const scoreB = calculateMatchScore(b, veteran)
    return scoreB.score - scoreA.score
  })
}
