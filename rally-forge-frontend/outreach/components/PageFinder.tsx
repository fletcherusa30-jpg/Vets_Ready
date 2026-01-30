import { usePageSearch } from "../hooks/usePageSearch"
import { useBookmarks } from "../hooks/useBookmarks"
import { PageCard } from "./PageCard"
import { SearchFilters } from "./SearchFilters"

export function PageFinder({ userId }: { userId: string }) {
  const { results, search, trending, searchByCategory } = usePageSearch()
  const { isBookmarked, toggleBookmark } = useBookmarks(userId)

  const pagesToDisplay = results.length > 0 ? results : trending

  return (
    <div className="page-finder">
      <h2>Veteran Page Finder</h2>
      <p>Discover veteran-owned businesses, nonprofits, and support communities</p>

      <SearchFilters onSearch={search} />

      <div className="pages-grid">
        {pagesToDisplay.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            isBookmarked={isBookmarked(page.id)}
            onBookmark={() => toggleBookmark(page.id, page.category)}
          />
        ))}
      </div>

      {pagesToDisplay.length === 0 && <p className="no-results">No pages found. Try adjusting your filters.</p>}
    </div>
  )
}
