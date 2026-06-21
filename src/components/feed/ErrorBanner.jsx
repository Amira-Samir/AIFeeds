import { RefreshIcon } from '../ui/icons'

export function ErrorBanner({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-500/30 dark:bg-red-500/10"
    >
      <p className="text-sm font-medium text-red-700 dark:text-red-300">
        We couldn’t load the feed right now. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        <RefreshIcon className="size-4" />
        Retry
      </button>
    </div>
  )
}
