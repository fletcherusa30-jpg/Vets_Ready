import { useState } from "react"
import { SearchQuery, PageCategory } from "../types"

export const CATEGORIES: PageCategory[] = [
  "nonprofit",
  "government",
  "educational",
  "business",
  "support-group",
  "military-branch",
  "veteran-resource",
  "community",
  "healthcare",
  "transition-assistance",
]

export function SearchFilters({ onSearch }: { onSearch: (query: SearchQuery) => void }) {
  const [keyword, setKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<PageCategory | "">("")
  const [minFollowers, setMinFollowers] = useState("")

  const handleSearch = () => {
    onSearch({
      keyword: keyword || undefined,
      category: (selectedCategory || undefined) as PageCategory | undefined,
      minFollowers: minFollowers ? parseInt(minFollowers) : undefined,
    })
  }

  return (
    <div className="search-filters">
      <div className="filter-group">
        <label>Keyword</label>
        <input type="text" placeholder="Search veteran pages..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as PageCategory | "")}>
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace("-", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Minimum Followers</label>
        <input type="number" placeholder="e.g., 10000" value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)} />
      </div>

      <button onClick={handleSearch} className="btn-search">
        Search
      </button>
    </div>
  )
}
