import { useCallback, useState } from 'react'
import { CACHE_KEYS } from '../config/constants'
import { safeGet, safeSet } from '../lib/cache'

/** Bookmarked article ids, persisted to localStorage. */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => new Set(safeGet(CACHE_KEYS.bookmarks) ?? []))

  const toggleBookmark = useCallback((articleId) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(articleId)) {
        next.delete(articleId)
      } else {
        next.add(articleId)
      }
      safeSet(CACHE_KEYS.bookmarks, [...next])
      return next
    })
  }, [])

  return { bookmarks, toggleBookmark }
}
