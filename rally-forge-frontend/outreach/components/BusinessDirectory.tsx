import { useState } from "react"
import { searchBusinesses, getBusinessesByCategory, getBusinessesByLocation } from "../services/businessDirectory"
import { VeteranBusiness } from "../types"

export function BusinessDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [results, setResults] = useState<VeteranBusiness[]>([])

  const handleSearch = () => {
    let found: VeteranBusiness[] = []

    if (searchQuery) {
      found = searchBusinesses(searchQuery)
    } else if (selectedCategory) {
      found = getBusinessesByCategory(selectedCategory)
    } else if (selectedLocation) {
      found = getBusinessesByLocation(selectedLocation)
    } else {
      found = []
    }

    setResults(found)
  }

  return (
    <div className="business-directory">
      <h2>Veteran Business Directory</h2>
      <p>Support veteran-owned businesses in your area</p>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search business name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input type="text" placeholder="Location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="businesses-grid">
        {results.map((business) => (
          <div key={business.id} className="business-card">
            <h3>{business.name}</h3>
            <p className="owner">Owner: {business.ownerName}</p>
            <p className="description">{business.description}</p>

            <div className="categories">
              {business.category.map((cat) => (
                <span key={cat} className="category-tag">
                  {cat}
                </span>
              ))}
            </div>

            <div className="contact">
              <p>📍 {business.location}</p>
              {business.phone && <p>📞 {business.phone}</p>}
              {business.email && <p>📧 {business.email}</p>}
            </div>

            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="btn-visit">
                Visit Website
              </a>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && searchQuery && <p className="no-results">No businesses found. Try a different search.</p>}
    </div>
  )
}
