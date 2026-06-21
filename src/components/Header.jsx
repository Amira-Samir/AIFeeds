import { useEffect, useState } from 'react'
import { relativeTime } from '../lib/relativeTime'
import { SearchBar } from './SearchBar'
import { MoonIcon, RefreshIcon, SunIcon } from './ui/icons'

export function Header({ searchQuery, onSearchChange, onRefresh, isLoading, lastUpdated, theme, onToggleTheme }) {
  // Re-render every minute so "Last updated" stays current.
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-surface-800 dark:bg-surface-950/90">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <h1 className="shrink-0 text-xl font-extrabold tracking-tight">
          AI<span className="text-accent-500">Feed</span>
        </h1>
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {lastUpdated && (
            <span className="mr-1 hidden text-xs text-gray-400 sm:block" title="Last refreshed">
              Updated {relativeTime(new Date(lastUpdated).toISOString())}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh feed"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-surface-800 dark:hover:text-gray-100"
          >
            <RefreshIcon className={`size-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-800 dark:hover:text-gray-100"
          >
            {theme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}
