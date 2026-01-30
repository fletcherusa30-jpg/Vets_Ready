import { useState, useMemo } from "react"
import { useJobBoardStore } from "../jobBoardStore"
import { calculateMatchScore } from "../services/jobMatcher"
import { JobPosting } from "../types"

export function JobBoard() {
  const { jobs, veteranProfile } = useJobBoardStore()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [jobs, searchQuery])

  const jobsWithMatch = useMemo(() => {
    if (!veteranProfile) return filteredJobs.map((job) => ({ job, match: null }))
    return filteredJobs.map((job) => ({
      job,
      match: calculateMatchScore(job, veteranProfile),
    }))
  }, [filteredJobs, veteranProfile])

  const sortedJobs = useMemo(() => {
    return jobsWithMatch.sort((a, b) => {
      if (!a.match || !b.match) return 0
      return b.match.score - a.match.score
    })
  }, [jobsWithMatch])

  return (
    <div className="job-board">
      <h2>Veteran Job Board</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search jobs by title or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="result-count">{sortedJobs.length} jobs found</span>
      </div>

      <div className="job-listings">
        {sortedJobs.map(({ job, match }) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
              {match && <div className="match-score">{match.score}% Match</div>}
            </div>

            <p className="location">{job.location}</p>
            {job.salary && <p className="salary">${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}</p>}

            <p className="description">{job.description.substring(0, 150)}...</p>

            <div className="requirements">
              <strong>Key Requirements:</strong>
              <ul>
                {job.requirements.slice(0, 3).map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            {match && match.matchedMos.length > 0 && (
              <div className="match-details">
                <p>
                  <strong>Matched MOS:</strong> {match.matchedMos.join(", ")}
                </p>
              </div>
            )}

            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-apply">
              Apply Now
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
