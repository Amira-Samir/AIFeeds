import { DIGEST_SIZE_WARNING } from '../../config/constants'
import { EnvelopeIcon, XIcon } from '../ui/icons'

/** Bottom toolbar shown while one or more cards are selected for a digest. */
export function SelectionToolbar({ count, onShareDigest, onClearSelection }) {
  if (count === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-surface-700 dark:bg-surface-900/95">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-white">
            {count}
          </span>
          {count === 1 ? '1 article selected' : `${count} articles selected`}
        </span>
        {count > DIGEST_SIZE_WARNING && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Long digests may be hard to read — consider limiting to your top picks
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onShareDigest}
            className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-500"
          >
            <EnvelopeIcon className="size-4" />
            Share as digest
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-surface-800"
          >
            <XIcon className="size-4" />
            Clear selection
          </button>
        </div>
      </div>
    </div>
  )
}
