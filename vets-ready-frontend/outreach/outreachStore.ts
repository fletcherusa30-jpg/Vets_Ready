import { create } from "zustand"
import { PublicPage, UserBookmark, PageSubmission } from "../types"

export type OutreachState = {
  pages: PublicPage[]
  bookmarks: UserBookmark[]
  submissions: PageSubmission[]
  setPages: (pages: PublicPage[]) => void
  addBookmark: (bookmark: UserBookmark) => void
  removeBookmark: (bookmarkId: string) => void
  getBookmarksByUser: (userId: string) => UserBookmark[]
  submitPage: (submission: PageSubmission) => void
  getSubmissions: (status?: string) => PageSubmission[]
}

export const useOutreachStore = create<OutreachState>((set, get) => ({
  pages: [],
  bookmarks: [],
  submissions: [],

  setPages: (pages) => set({ pages }),

  addBookmark: (bookmark) =>
    set((state) => ({
      bookmarks: [...state.bookmarks, bookmark],
    })),

  removeBookmark: (bookmarkId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
    })),

  getBookmarksByUser: (userId) => {
    return get().bookmarks.filter((b) => b.userId === userId)
  },

  submitPage: (submission) =>
    set((state) => ({
      submissions: [...state.submissions, submission],
    })),

  getSubmissions: (status) => {
    const allSubmissions = get().submissions
    return status ? allSubmissions.filter((s) => s.status === status) : allSubmissions
  },
}))
