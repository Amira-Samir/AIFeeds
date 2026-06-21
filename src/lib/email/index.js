import { EMAIL_PROVIDER } from '../../config/constants'
import mailto from './mailtoProvider'
import resend from './resendProvider'
import emailjs from './emailjsProvider'

/**
 * @typedef {Object} EmailPayload
 * @property {string[]} to
 * @property {string} subject
 * @property {string} textBody
 * @property {string} [htmlBody]  used by HTML-capable providers (resend)
 */

const providers = { mailto, resend, emailjs }

/** @returns {{id: string, send: (p: EmailPayload) => Promise<{ok: boolean, error?: string}>}} */
export function getEmailProvider() {
  return providers[EMAIL_PROVIDER] ?? mailto
}
