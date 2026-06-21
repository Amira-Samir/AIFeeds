import { SearchIcon } from './ui/icons'

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles by title or summary"
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-surface-700 dark:bg-surface-800 dark:text-gray-100"
      />
    </div>
  )
}
