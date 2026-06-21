export function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-surface-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {message ?? 'No updates found for this filter — try another category or refresh.'}
      </p>
    </div>
  )
}
