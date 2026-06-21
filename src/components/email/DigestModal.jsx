import { useMemo, useState } from 'react'
import { Modal } from './Modal'
import { EmailPillInput } from './EmailPillInput'
import { DigestPreview } from './DigestPreview'
import { SUBJECT_WRAP_LIMIT } from '../../config/constants'
import { buildDigestText, buildDigestHtml } from '../../lib/email/templates'
import { getEmailProvider } from '../../lib/email'

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

/**
 * Digest compose modal. Order and removals are local to the digest — removing
 * an article here does not deselect its card in the feed.
 */
export function DigestModal({ articles, summaries, onClose, onToast, onSent }) {
  const [emails, setEmails] = useState([])
  const [subject, setSubject] = useState(`[AIFeed] Your AI update digest · ${todayLabel()}`)
  const [personalMessage, setPersonalMessage] = useState('')
  const [digestIds, setDigestIds] = useState(() => articles.map((a) => a.id))
  const [toError, setToError] = useState('')

  const articleById = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles])
  const digestArticles = digestIds.map((id) => articleById.get(id)).filter(Boolean)

  const reorder = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= digestIds.length) return
    setDigestIds((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleSend = async () => {
    if (emails.length === 0) {
      setToError('Add at least one recipient')
      return
    }
    setToError('')
    const result = await getEmailProvider().send({
      to: emails,
      subject,
      textBody: buildDigestText(digestArticles, summaries, personalMessage),
      htmlBody: buildDigestHtml(digestArticles, summaries, personalMessage),
    })
    if (result.ok) {
      onToast(`Email sent to ${emails.length} recipient${emails.length === 1 ? '' : 's'}`)
      onSent()
      onClose()
    } else {
      onToast(result.error ?? 'Sending failed', 'error')
    }
  }

  return (
    <Modal title="Share as Digest" onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1 text-sm font-medium">
          To
          <EmailPillInput emails={emails} onChange={setEmails} />
          {toError && <span className="text-xs font-medium text-red-500">{toError}</span>}
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-surface-700 dark:bg-surface-800"
          />
          {subject.length > SUBJECT_WRAP_LIMIT && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {subject.length}/{SUBJECT_WRAP_LIMIT} — long subjects get wrapped by email clients
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Message
          <textarea
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Add a note to your recipients (optional)"
            rows={2}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-surface-700 dark:bg-surface-800"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium">
          Preview — drag to reorder
          {digestArticles.length > 0 ? (
            <DigestPreview
              articles={digestArticles}
              summaries={summaries}
              personalMessage={personalMessage}
              onReorder={reorder}
              onRemove={(id) => setDigestIds((prev) => prev.filter((d) => d !== id))}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-xs font-normal text-gray-400 dark:border-surface-700">
              All articles were removed from this digest.
            </p>
          )}
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
            disabled={digestArticles.length === 0}
            className="rounded-lg bg-accent-600 px-5 py-2 text-sm font-semibold text-white hover:bg-accent-500 disabled:opacity-50"
          >
            Send digest
          </button>
        </div>
      </form>
    </Modal>
  )
}
