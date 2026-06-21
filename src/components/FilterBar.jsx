import { CATEGORIES } from '../config/constants'
import { BookmarkIcon } from './ui/icons'

/**
 * Multi-select category chips plus the Saved (bookmarks) tab.
 * "All" is the empty selection.
 */
export function FilterBar({ activeFilters, onToggleFilter, onClearFilters, showSaved, onToggleSaved, savedCount }) {
  const allActive = activeFilters.size === 0 && !showSaved

  const chipClass = (active) =>
    `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'bg-accent-600 text-white'
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-surface-800 dark:text-gray-300 dark:hover:bg-surface-700'
    }`

  return (
    <nav
      aria-label="Feed filters"
      className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button type="button" className={chipClass(allActive)} onClick={onClearFilters} aria-pressed={allActive}>
        All
      </button>
      {CATEGORIES.map((category) => {
        const active = activeFilters.has(category.id)
        return (
          <button
            key={category.id}
            type="button"
            className={chipClass(active)}
            onClick={() => onToggleFilter(category.id)}
            aria-pressed={active}
          >
            {category.label}
          </button>
        )
      })}
      <button
        type="button"
        className={`${chipClass(showSaved)} flex items-center gap-1`}
        onClick={onToggleSaved}
        aria-pressed={showSaved}
      >
        <BookmarkIcon className="size-3" filled={showSaved} />
        Saved{savedCount > 0 ? ` (${savedCount})` : ''}
      </button>
    </nav>
  )
}
