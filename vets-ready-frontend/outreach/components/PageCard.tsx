import { PublicPage } from "../types"

export function PageCard({ page, isBookmarked, onBookmark }: { page: PublicPage; isBookmarked: boolean; onBookmark: () => void }) {
  return (
    <div className="page-card">
      <div className="card-header">
        {page.profileImageUrl && <img src={page.profileImageUrl} alt={page.name} className="page-image" />}
        <div className="header-info">
          <h3>{page.name}</h3>
          <span className={`category-badge ${page.category}`}>{page.category}</span>
          {page.verified && <span className="verified-badge">✓ Verified</span>}
        </div>
        <button onClick={onBookmark} className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}>
          {isBookmarked ? "★" : "☆"}
        </button>
      </div>

      <p className="description">{page.description}</p>

      <div className="card-stats">
        {page.followerCount && (
          <div className="stat">
            <span className="label">Followers:</span>
            <span className="value">{(page.followerCount / 1000).toFixed(1)}K</span>
          </div>
        )}
        <div className="stat">
          <span className="label">Match Score:</span>
          <span className="value">{Math.round(page.confidenceScore * 100)}%</span>
        </div>
      </div>

      {page.location && <p className="location">📍 {page.location}</p>}

      <a href={page.pageUrl} target="_blank" rel="noopener noreferrer" className="btn-visit">
        Visit Page
      </a>
    </div>
  )
}
