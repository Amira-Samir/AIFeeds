export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded bg-gray-200 dark:bg-surface-700" />
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-surface-700" />
        </div>
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-surface-700" />
      </div>
      <div className="mt-4 h-5 w-4/5 rounded bg-gray-200 dark:bg-surface-700" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-surface-700" />
        <div className="h-3 w-11/12 rounded bg-gray-200 dark:bg-surface-700" />
        <div className="h-3 w-3/5 rounded bg-gray-200 dark:bg-surface-700" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-surface-700" />
        <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-surface-700" />
      </div>
    </div>
  )
}
