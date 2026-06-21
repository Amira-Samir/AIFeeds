import { useState } from 'react'
import { Modal } from './Modal'
import { SUBJECT_WRAP_LIMIT } from '../../config/constants'
import { parseEmailList } from '../../lib/validation'
import { relativeTime } from '../../lib/relativeTime'
import { buildSingleText } from '../../lib/email/templates'
import { getEmailProvider } from '../../lib/email'

/** Single-article "Share via Email" modal. */
export function ShareModal({ article, summary, onClose, onToast }) {
  const summaryText = summary?.text ?? article.excerpt
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState(`[AIFeed] ${article.title}`)
  const [toError, setToError] = useState('')

  const validateTo = () => {
    const { valid, invalid } = parseEmailList(to)
    if (invalid.length > 0) {
      setToError('Invalid email')
      return null
    }
    if (valid.length === 0) {
      setToError('Add at least one recipient')
      return null
    }
    setToError('')
    return valid
  }

  const handleSend = async () => {
    const recipients = validateTo()
    if (!recipients) return
    const result = await getEmailProvider().send({
      to: recipients,
      subject,
      textBody: buildSingleText(article, summaryText),
    })
    if (result.ok) {
      onToast(`Email sent to ${recipients.length} recipient${recipients.length === 1 ? '' : 's'}`)
      onClose()
    } else {
      onToast(result.error ?? 'Sending failed', 'error')
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-surface-800 ${
      hasError
        ? 'border-red-500 underline decoration-red-500 decoration-wavy focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-accent-500 focus:ring-accent-500 dark:border-surface-700'
    }`

  return (
    <Modal title="Share via Email" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          To
          <input
            type="text"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              if (toError) setToError('')
            }}
            onBlur={() => to.trim() && validateTo()}
            placeholder="name@example.com, other@example.com"
            aria-invalid={Boolean(toError)}
            className={inputClass(Boolean(toError))}
          />
          {toError && <span className="text-xs font-medium text-red-500">{toError}</span>}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass(false)}
          />
          {subject.length > SUBJECT_WRAP_LIMIT && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {subject.length}/{SUBJECT_WRAP_LIMIT} — long subjects get wrapped by email clients
            </span>
          )}
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium">
          Preview
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <p className="text-sm font-bold">{article.title}</p>
            <p className="mt-2 text-sm font-normal leading-relaxed text-gray-600 dark:text-gray-300">
              {summaryText}
            </p>
            <p className="mt-2 text-xs font-normal text-gray-400">
              {article.sourceName} · {relativeTime(article.publishedAt)}
            </p>
            <p className="mt-3 text-sm font-semibold text-accent-500 dark:text-accent-400">
              Read full article →
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-accent-600 px-5 py-2 text-sm font-semibold text-white hover:bg-accent-500"
          >
            Send
          </button>
        </div>
      </form>
    </Modal>
  )
}
