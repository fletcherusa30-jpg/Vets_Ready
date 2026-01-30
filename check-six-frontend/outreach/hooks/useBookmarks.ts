import { useState } from "react"
import { useOutreachStore } from "../outreachStore"
import { UserBookmark } from "../types"

export function useBookmarks(userId: string) {
  const { bookmarks, addBookmark, removeBookmark, getBookmarksByUser } = useOutreachStore()
  const [userBookmarks, setUserBookmarks] = useState<UserBookmark[]>(() => getBookmarksByUser(userId))

  const toggleBookmark = (pageId: string, category: any) => {
    const exists = userBookmarks.find((b) => b.pageId === pageId)
    if (exists) {
      removeBookmark(exists.id)
      setUserBookmarks(userBookmarks.filter((b) => b.id !== exists.id))
    } else {
      const newBookmark: UserBookmark = {
        id: `bm-${Date.now()}`,
        userId,
        pageId,
        category,
        savedAt: new Date(),
      }
      addBookmark(newBookmark)
      setUserBookmarks([...userBookmarks, newBookmark])
    }
  }

  const isBookmarked = (pageId: string) => userBookmarks.some((b) => b.pageId === pageId)

  return { bookmarks: userBookmarks, toggleBookmark, isBookmarked }
}
