import { useEffect } from 'react'
import { CheckIcon, XIcon } from './icons'

/** Transient notification stack, bottom-center. App owns the toast state. */
export function ToastStack({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isError = toast.kind === 'error'
  return (
    <div
      className={`pointer-events-auto flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
        isError
          ? 'bg-red-600 text-white'
          : 'bg-gray-900 text-white dark:bg-surface-700 dark:text-gray-100'
      }`}
    >
      {isError ? <XIcon className="size-4 shrink-0" /> : <CheckIcon className="size-4 shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        className="rounded p-1 opacity-70 hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}
