/**
 * Resend (resend.com) provider — production path, NOT wired by default.
 *
 * Resend's REST API blocks browser CORS calls by design: the request below
 * must run from a serverless function (Vercel Edge Function / Next.js API
 * route) that holds RESEND_API_KEY. To activate:
 *   1. Deploy a function that accepts {to, subject, html} and forwards it:
 *        await fetch('https://api.resend.com/emails', {
 *          method: 'POST',
 *          headers: {
 *            authorization: `Bearer ${process.env.RESEND_API_KEY}`,
 *            'content-type': 'application/json',
 *          },
 *          body: JSON.stringify({ from: 'AIFeed <digest@yourdomain>', to, subject, html }),
 *        })
 *   2. Point ENDPOINT below at that function.
 *   3. Set EMAIL_PROVIDER = 'resend' in src/config/constants.js.
 */

const ENDPOINT = '' // e.g. '/api/send-email'

/** @param {{to: string[], subject: string, textBody: string, htmlBody?: string}} payload */
async function send({ to, subject, textBody, htmlBody }) {
  if (!ENDPOINT) {
    return {
      ok: false,
      error: 'Resend is not configured — see src/lib/email/resendProvider.js for setup steps.',
    }
  }
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to, subject, text: textBody, html: htmlBody }),
    })
    if (!response.ok) return { ok: false, error: `Send failed (HTTP ${response.status})` }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}

export default { id: 'resend', send }
