import { useState } from 'react'
import { isValidEmail } from '../../lib/validation'
import { XIcon } from '../ui/icons'

/**
 * Tag-style multi-email input: Enter or comma confirms an address as a
 * removable pill; invalid entries show an inline error.
 */
export function EmailPillInput({ emails, onChange }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const commitDraft = () => {
    const value = draft.trim().replace(/,$/, '')
    if (!value) return true
    if (!isValidEmail(value)) {
      setError('Invalid email')
      return false
    }
    if (!emails.includes(value)) onChange([...emails, value])
    setDraft('')
    setError('')
    return true
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft()
    } else if (event.key === 'Backspace' && !draft && emails.length > 0) {
      onChange(emails.slice(0, -1))
    }
  }

  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 focus-within:ring-1 dark:bg-surface-800 ${
          error
            ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:border-accent-500 focus-within:ring-accent-500 dark:border-surface-700'
        }`}
      >
        {emails.map((email) => (
          <span
            key={email}
            className="flex items-center gap-1 rounded-full bg-accent-600/10 px-2.5 py-1 text-xs font-medium text-accent-600 dark:bg-accent-500/20 dark:text-accent-400"
          >
            {email}
            <button
              type="button"
              onClick={() => onChange(emails.filter((e) => e !== email))}
              aria-label={`Remove ${email}`}
              className="rounded-full hover:text-accent-400"
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError('')
          }}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={emails.length === 0 ? 'name@example.com — Enter or comma to add' : ''}
          aria-label="Recipient email addresses"
          aria-invalid={Boolean(error)}
          className={`min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm focus:outline-none ${
            error ? 'underline decoration-red-500 decoration-wavy' : ''
          }`}
        />
      </div>
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}
