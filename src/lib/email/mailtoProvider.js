import { MAILTO_BODY_LIMIT } from '../../config/constants'

/**
 * Default provider: composes a mailto: URI and opens the user's mail client.
 * No backend, no credentials — but delivery can't be confirmed, and overlong
 * URIs get silently dropped by some clients, so the body is budgeted.
 */

function truncateAtSeparator(body, limit) {
  if (body.length <= limit) return body
  const cut = body.lastIndexOf('\n\n────', limit)
  const truncated = cut > 0 ? body.slice(0, cut) : body.slice(0, limit)
  return `${truncated}\n\n[Digest truncated — too long for a mailto link]`
}

/** @param {{to: string[], subject: string, textBody: string}} payload */
async function send({ to, subject, textBody }) {
  const body = truncateAtSeparator(textBody, MAILTO_BODY_LIMIT)
  const uri = `mailto:${to.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = uri
  return { ok: true }
}

export default { id: 'mailto', send }
