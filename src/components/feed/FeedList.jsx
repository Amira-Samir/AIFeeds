import { useMemo } from 'react'
import { ArticleCard } from './ArticleCard'
import { SkeletonCard } from './SkeletonCard'
import { EmptyState } from './EmptyState'
import { ErrorBanner } from './ErrorBanner'

function relevanceScore(article, summaryText, query) {
  let score = 0
  if (query) {
    const q = query.toLowerCase()
    if (article.title.toLowerCase().includes(q)) score += 3
    if (summaryText.toLowerCase().includes(q)) score += 1
  } else {
    score = article.tags.length
  }
  return score
}

function applySort(articles, sortMode, summaries, query) {
  const sorted = [...articles]
  if (sortMode === 'relevant') {
    sorted.sort((a, b) => {
      const diff =
        relevanceScore(b, summaries[b.id]?.text ?? b.excerpt, query) -
        relevanceScore(a, summaries[a.id]?.text ?? a.excerpt, query)
      return diff !== 0 ? diff : new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0)
    })
  } else if (sortMode === 'source') {
    sorted.sort(
      (a, b) =>
        a.sourceName.localeCompare(b.sourceName) ||
        new Date(b.publishedAt ?? 0) - new Date(a.publishedAt ?? 0),
    )
  }
  // 'newest' keeps pipeline order (already newest-first).
  return sorted
}

export function FeedList({
  items,
  status,
  summaries,
  activeFilters,
  showSaved,
  searchQuery,
  sortMode,
  bookmarks,
  onToggleBookmark,
  selection,
  onToggleSelect,
  onShare,
  onCopyLink,
  onRetry,
}) {
  const visibleItems = useMemo(() => {
    let result = items
    if (showSaved) {
      result = result.filter((a) => bookmarks.has(a.id))
    }
    if (activeFilters.size > 0) {
      result = result.filter((a) => a.tags.some((tag) => activeFilters.has(tag)))
    }
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter((a) => {
        const summaryText = summaries[a.id]?.text ?? a.excerpt
        return a.title.toLowerCase().includes(query) || summaryText.toLowerCase().includes(query)
      })
    }
    return applySort(result, sortMode, summaries, query)
  }, [items, showSaved, activeFilters, searchQuery, sortMode, summaries, bookmarks])

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return <ErrorBanner onRetry={onRetry} />
  }

  if (visibleItems.length === 0) {
    return (
      <EmptyState
        message={
          showSaved && bookmarks.size === 0
            ? 'No bookmarks yet — tap the bookmark icon on any card to save it here.'
            : undefined
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {visibleItems.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          summary={summaries[article.id]}
          isBookmarked={bookmarks.has(article.id)}
          onToggleBookmark={onToggleBookmark}
          isSelected={selection.has(article.id)}
          onToggleSelect={onToggleSelect}
          onShare={onShare}
          onCopyLink={onCopyLink}
        />
      ))}
    </div>
  )
}
