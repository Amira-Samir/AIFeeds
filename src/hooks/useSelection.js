import { useCallback, useMemo, useState } from 'react'

/**
 * Digest multi-select. Order of selection is preserved — it seeds the digest's
 * initial article order. Lives above the feed so it survives filter changes.
 */
export function useSelection() {
  const [selectedIds, setSelectedIds] = useState([])

  const selection = useMemo(() => new Set(selectedIds), [selectedIds])

  const toggleSelect = useCallback((articleId) => {
    setSelectedIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }, [])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  return { selectedIds, selection, toggleSelect, clearSelection }
}
