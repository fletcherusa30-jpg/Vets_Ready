import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { PublicPage, PageSubmission, VeteranBusiness, VeteranNonprofit } from "../types/outreachTypes"

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000"

// Search public pages
export function useOutreachSearch(filters: { keyword?: string; category?: string; minFollowers?: number }) {
  return useQuery({
    queryKey: ["outreach-pages", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.keyword) params.append("keyword", filters.keyword)
      if (filters.category) params.append("category", filters.category)
      if (filters.minFollowers) params.append("minFollowers", filters.minFollowers.toString())

      const res = await fetch(`${API_BASE}/api/outreach/pages?${params}`)
      if (!res.ok) throw new Error("Failed to search pages")
      return res.json()
    },
  })
}

// Get pages by category
export function usePagesByCategory(category: string | null) {
  return useQuery({
    queryKey: ["outreach-pages-category", category],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/outreach/pages/category/${category}`)
      if (!res.ok) throw new Error("Failed to fetch pages")
      return res.json()
    },
    enabled: !!category,
  })
}

// Get trending pages
export function useTrendingPages() {
  return useQuery({
    queryKey: ["outreach-trending-pages"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/outreach/pages/trending`)
      if (!res.ok) throw new Error("Failed to fetch trending pages")
      return res.json()
    },
  })
}

// Submit a page
export function useSubmitPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (submission: Omit<PageSubmission, "id" | "status" | "createdAt">) => {
      const res = await fetch(`${API_BASE}/api/outreach/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      })
      if (!res.ok) throw new Error("Failed to submit page")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-pages"] })
    },
  })
}

// Search businesses
export function useBusinessSearch(filters: { keyword?: string; category?: string; location?: string }) {
  return useQuery({
    queryKey: ["outreach-businesses", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.keyword) params.append("keyword", filters.keyword)
      if (filters.category) params.append("category", filters.category)
      if (filters.location) params.append("location", filters.location)

      const res = await fetch(`${API_BASE}/api/outreach/businesses?${params}`)
      if (!res.ok) throw new Error("Failed to search businesses")
      return res.json()
    },
  })
}

// Search nonprofits
export function useNonprofitSearch(filters: { keyword?: string; mission?: string }) {
  return useQuery({
    queryKey: ["outreach-nonprofits", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.keyword) params.append("keyword", filters.keyword)
      if (filters.mission) params.append("mission", filters.mission)

      const res = await fetch(`${API_BASE}/api/outreach/nonprofits?${params}`)
      if (!res.ok) throw new Error("Failed to search nonprofits")
      return res.json()
    },
  })
}

// Scan text for veteran keywords
export function useKeywordScan() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`${API_BASE}/api/outreach/scan-keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error("Failed to scan keywords")
      return res.json()
    },
  })
}

// Get directory statistics
export function useDirectoryStats() {
  return useQuery({
    queryKey: ["outreach-stats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/outreach/stats`)
      if (!res.ok) throw new Error("Failed to fetch statistics")
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Manage bookmarks (hook for bookmark operations)
export function useBookmarkOperations(userId: string | null) {
  const queryClient = useQueryClient()

  const addBookmark = useMutation({
    mutationFn: async (pageId: string) => {
      const res = await fetch(`${API_BASE}/api/outreach/bookmarks/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, action: "add" }),
      })
      if (!res.ok) throw new Error("Failed to add bookmark")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-bookmarks", userId] })
    },
  })

  const removeBookmark = useMutation({
    mutationFn: async (pageId: string) => {
      const res = await fetch(`${API_BASE}/api/outreach/bookmarks/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      })
      if (!res.ok) throw new Error("Failed to remove bookmark")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-bookmarks", userId] })
    },
  })

  return { addBookmark, removeBookmark }
}

// Get user's bookmarks
export function useUserBookmarks(userId: string | null) {
  return useQuery({
    queryKey: ["outreach-bookmarks", userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/outreach/bookmarks/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch bookmarks")
      return res.json()
    },
    enabled: !!userId,
  })
}
