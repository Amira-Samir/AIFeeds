/**
 * EmailJS (emailjs.com) provider — client-side sending, NOT wired by default.
 *
 * To activate:
 *   1. `npm install @emailjs/browser` and create a service + template at
 *      emailjs.com (template variables: to_email, subject, body).
 *   2. Fill in the three ids below (the public key is safe to expose).
 *   3. Set EMAIL_PROVIDER = 'emailjs' in src/config/constants.js.
 */

const SERVICE_ID = ''
const TEMPLATE_ID = ''
const PUBLIC_KEY = ''

/** @param {{to: string[], subject: string, textBody: string}} payload */
async function send({ to, subject, textBody }) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    return {
      ok: false,
      error: 'EmailJS is not configured — see src/lib/email/emailjsProvider.js for setup steps.',
    }
  }
  try {
    // The package is only installed when this provider is activated; a variable
    // specifier keeps Vite from trying to resolve it at transform time.
    const moduleName = '@emailjs/browser'
    const { default: emailjs } = await import(/* @vite-ignore */ moduleName)
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      { to_email: to.join(','), subject, body: textBody },
      { publicKey: PUBLIC_KEY },
    )
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error?.text ?? error.message }
  }
}

export default { id: 'emailjs', send }
