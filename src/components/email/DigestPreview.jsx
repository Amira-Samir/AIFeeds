import { useState } from 'react'
import { relativeTime } from '../../lib/relativeTime'
import { ArrowDownIcon, ArrowUpIcon, GripIcon, XIcon } from '../ui/icons'

/**
 * Live digest preview: numbered article blocks, drag-and-drop reordering
 * (with ↑/↓ buttons as the touch/keyboard path), and per-article remove.
 */
export function DigestPreview({ articles, summaries, personalMessage, onReorder, onRemove }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const handleDrop = (targetIndex) => {
    if (dragIndex !== null && dragIndex !== targetIndex) {
      onReorder(dragIndex, targetIndex)
    }
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-surface-700 dark:bg-surface-800">
      <div className="border-b border-gray-200 px-4 py-3 text-center dark:border-surface-700">
        <p className="text-sm font-extrabold">
          AI<span className="text-accent-500">Feed</span> Digest
        </p>
        <p className="text-xs text-gray-400">Your AI update digest</p>
      </div>

      {personalMessage?.trim() && (
        <p className="border-b border-gray-200 px-4 py-3 text-sm italic text-gray-600 dark:border-surface-700 dark:text-gray-300">
          {personalMessage.trim()}
        </p>
      )}

      <ol>
        {articles.map((article, index) => (
          <li
            key={article.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(index))
              e.dataTransfer.effectAllowed = 'move'
              setDragIndex(index)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setOverIndex(index)
            }}
            onDragLeave={() => setOverIndex((prev) => (prev === index ? null : prev))}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(index)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            className={`relative flex cursor-grab gap-2 border-b border-gray-200 px-3 py-3 last:border-b-0 active:cursor-grabbing dark:border-surface-700 ${
              dragIndex === index ? 'opacity-50' : ''
            } ${overIndex === index && dragIndex !== index ? 'border-t-2 border-t-accent-500' : ''}`}
          >
            <GripIcon className="mt-0.5 size-4 shrink-0 text-gray-300 dark:text-gray-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug">
                {index + 1}. {article.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {article.sourceName} · {relativeTime(article.publishedAt)}
              </p>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {summaries[article.id]?.text ?? article.excerpt}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-accent-500 dark:text-accent-400">
                Read more →
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => onRemove(article.id)}
                aria-label={`Remove "${article.title}" from digest`}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-surface-700 dark:hover:text-gray-200"
              >
                <XIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onReorder(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-surface-700 dark:hover:text-gray-200"
              >
                <ArrowUpIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onReorder(index, index + 1)}
                disabled={index === articles.length - 1}
                aria-label="Move down"
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 dark:hover:bg-surface-700 dark:hover:text-gray-200"
              >
                <ArrowDownIcon className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <p className="px-4 py-2.5 text-center text-[11px] text-gray-400">Sent via AIFeed · Unsubscribe</p>
    </div>
  )
}
