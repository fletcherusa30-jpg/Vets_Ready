import { useState } from "react"
import { usePageSubmission } from "../hooks/usePageSubmission"
import { CATEGORIES } from "./SearchFilters"
import { PageCategory, SocialPlatform } from "../types"

const SOCIAL_PLATFORMS: SocialPlatform[] = ["facebook", "instagram", "linkedin", "twitter", "tiktok", "youtube"]

export function SubmitPageForm({ userId }: { userId: string }) {
  const { submit, isSubmitting, error } = usePageSubmission(userId)
  const [platform, setPlatform] = useState<SocialPlatform>("facebook")
  const [pageName, setPageName] = useState("")
  const [pageUrl, setPageUrl] = useState("")
  const [category, setCategory] = useState<PageCategory>("community")
  const [description, setDescription] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")

    try {
      await submit({ platform, pageName, pageUrl, category, description })
      setSuccessMessage("Thank you! Your submission has been received and will be reviewed by our team.")
      setPageName("")
      setPageUrl("")
      setDescription("")
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <div className="submit-page-form">
      <h3>Submit a Veteran Page</h3>
      <p>Know a veteran resource we should feature? Submit it here for our team to review.</p>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Social Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)} required>
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Page Name</label>
          <input type="text" value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="e.g., Veterans Support Group" required />
        </div>

        <div className="form-group">
          <label>Page URL</label>
          <input
            type="url"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            placeholder="https://facebook.com/yourpage"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as PageCategory)} required>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the page and its purpose"
            rows={4}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-submit">
          {isSubmitting ? "Submitting..." : "Submit Page"}
        </button>
      </form>
    </div>
  )
}
