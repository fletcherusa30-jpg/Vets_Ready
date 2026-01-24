import { useState } from "react"
import { useOutreachStore } from "../outreachStore"
import { PageSubmission, SocialPlatform, PageCategory } from "../types"

export function usePageSubmission(userId: string) {
  const { submitPage } = useOutreachStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: {
    platform: SocialPlatform
    pageName: string
    pageUrl: string
    category: PageCategory
    description: string
  }) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const submission: PageSubmission = {
        id: `sub-${Date.now()}`,
        submittedBy: userId,
        platform: data.platform,
        pageName: data.pageName,
        pageUrl: data.pageUrl,
        category: data.category,
        description: data.description,
        status: "pending",
        submittedAt: new Date(),
      }

      submitPage(submission)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit page")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting, error }
}
