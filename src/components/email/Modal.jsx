import { useEffect, useRef } from 'react'
import { XIcon } from '../ui/icons'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Shared modal shell: backdrop, Escape to close, focus trap with focus
 * restore. Renders as a centered dialog on desktop and a bottom sheet on
 * mobile.
 */
export function Modal({ title, onClose, children, wide = false }) {
  const panelRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const panel = panelRef.current
    panel.querySelector(FOCUSABLE)?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      // Keep Tab cycling inside the dialog.
      const focusable = [...panel.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener('keydown', handleKeyDown)
    return () => {
      panel.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-surface-900 sm:rounded-2xl ${
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-surface-800">
          <h2 className="text-base font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-surface-800 dark:hover:text-gray-200"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
