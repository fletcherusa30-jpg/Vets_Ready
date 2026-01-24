import { useState, useMemo } from "react"
import { searchNonprofits, getMissionAreas, getNonprofitsByMission } from "../services/nonprofitDirectory"
import { VeteranNonprofit } from "../types"

export function NonprofitDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMission, setSelectedMission] = useState("")
  const [results, setResults] = useState<VeteranNonprofit[]>([])

  const missionAreas = useMemo(() => getMissionAreas(), [])

  const handleSearch = () => {
    let found: VeteranNonprofit[] = []

    if (searchQuery) {
      found = searchNonprofits(searchQuery)
    } else if (selectedMission) {
      found = getNonprofitsByMission(selectedMission)
    }

    setResults(found)
  }

  return (
    <div className="nonprofit-directory">
      <h2>Veteran Nonprofit Directory</h2>
      <p>Find and support veteran-focused nonprofit organizations</p>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search organization name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select value={selectedMission} onChange={(e) => setSelectedMission(e.target.value)}>
          <option value="">All Mission Areas</option>
          {missionAreas.map((mission) => (
            <option key={mission} value={mission}>
              {mission.replace("-", " ").toUpperCase()}
            </option>
          ))}
        </select>

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="nonprofits-grid">
        {results.map((org) => (
          <div key={org.id} className="nonprofit-card">
            <h3>{org.name}</h3>
            <p className="description">{org.description}</p>

            <div className="mission-areas">
              {org.missionArea.map((mission) => (
                <span key={mission} className="mission-tag">
                  {mission.replace("-", " ")}
                </span>
              ))}
            </div>

            <div className="contact">
              <p>📍 {org.location}</p>
              {org.phone && <p>📞 {org.phone}</p>}
              {org.ein && <p>EIN: {org.ein}</p>}
            </div>

            <div className="action-buttons">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="btn-visit">
                  Visit Website
                </a>
              )}
              {org.donationUrl && (
                <a href={org.donationUrl} target="_blank" rel="noopener noreferrer" className="btn-donate">
                  Donate
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (searchQuery || selectedMission) && (
        <p className="no-results">No organizations found. Try a different search.</p>
      )}
    </div>
  )
}
