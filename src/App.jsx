import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFeed } from './hooks/useFeed'
import { useSummaries } from './hooks/useSummaries'
import { useBookmarks } from './hooks/useBookmarks'
import { useTheme } from './hooks/useTheme'
import { useSelection } from './hooks/useSelection'
import { useDebounce } from './hooks/useDebounce'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { SortControl } from './components/SortControl'
import { FeedList } from './components/feed/FeedList'
import { SelectionToolbar } from './components/email/SelectionToolbar'
import { ShareModal } from './components/email/ShareModal'
import { DigestModal } from './components/email/DigestModal'
import { ToastStack } from './components/ui/Toast'

function App() {
  const { items, status, sourceErrors, lastUpdated, refresh } = useFeed()
  const { summaries, aiFailed } = useSummaries(items)
  const { bookmarks, toggleBookmark } = useBookmarks()
  const { theme, toggleTheme } = useTheme()
  const { selectedIds, selection, toggleSelect, clearSelection } = useSelection()

  const [activeFilters, setActiveFilters] = useState(() => new Set())
  const [showSaved, setShowSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState('newest')
  const [modal, setModal] = useState(null) // {type:'share', article} | {type:'digest'} | null
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)

  const debouncedQuery = useDebounce(searchQuery)

  const addToast = useCallback((message, kind = 'success') => {
    toastIdRef.current += 1
    setToasts((prev) => [...prev, { id: toastIdRef.current, message, kind }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // One quiet heads-up when AI summaries are unavailable; excerpts still show.
  const aiToastShownRef = useRef(false)
  useEffect(() => {
    if (aiFailed && !aiToastShownRef.current) {
      aiToastShownRef.current = true
      addToast('AI summaries unavailable — showing article excerpts', 'error')
    }
  }, [aiFailed, addToast])

  const toggleFilter = (categoryId) => {
    setShowSaved(false)
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const clearFilters = () => {
    setActiveFilters(new Set())
    setShowSaved(false)
  }

  const copyLink = async (article) => {
    try {
      await navigator.clipboard.writeText(article.url)
      addToast('Link copied to clipboard')
    } catch {
      addToast('Couldn’t access the clipboard', 'error')
    }
  }

  const selectedArticles = useMemo(() => {
    const byId = new Map(items.map((a) => [a.id, a]))
    return selectedIds.map((id) => byId.get(id)).filter(Boolean)
  }, [items, selectedIds])

  return (
    <div className="min-h-screen pb-24">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refresh}
        isLoading={status === 'loading'}
        lastUpdated={lastUpdated}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between gap-4">
          <FilterBar
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            onClearFilters={clearFilters}
            showSaved={showSaved}
            onToggleSaved={() => setShowSaved((prev) => !prev)}
            savedCount={bookmarks.size}
          />
          <SortControl sortMode={sortMode} onChange={setSortMode} />
        </div>

        {sourceErrors.length > 0 && status === 'ready' && (
          <p className="mb-3 text-xs text-gray-400">
            Some sources didn’t respond: {sourceErrors.join(', ')}
          </p>
        )}

        <FeedList
          items={items}
          status={status}
          summaries={summaries}
          activeFilters={activeFilters}
          showSaved={showSaved}
          searchQuery={debouncedQuery}
          sortMode={sortMode}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          selection={selection}
          onToggleSelect={toggleSelect}
          onShare={(article) => setModal({ type: 'share', article })}
          onCopyLink={copyLink}
          onRetry={refresh}
        />
      </main>

      <SelectionToolbar
        count={selectedIds.length}
        onShareDigest={() => setModal({ type: 'digest' })}
        onClearSelection={clearSelection}
      />

      {modal?.type === 'share' && (
        <ShareModal
          article={modal.article}
          summary={summaries[modal.article.id]}
          onClose={() => setModal(null)}
          onToast={addToast}
        />
      )}
      {modal?.type === 'digest' && (
        <DigestModal
          articles={selectedArticles}
          summaries={summaries}
          onClose={() => setModal(null)}
          onToast={addToast}
          onSent={clearSelection}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
