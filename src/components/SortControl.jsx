const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'relevant', label: 'Most Relevant' },
  { id: 'source', label: 'By Source' },
]

export function SortControl({ sortMode, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      Sort
      <select
        value={sortMode}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort articles"
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-accent-500 focus:outline-none dark:border-surface-700 dark:bg-surface-800 dark:text-gray-200"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
