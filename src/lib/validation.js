// Pragmatic email shape check (local@domain.tld) — full RFC 5322 is overkill for a To field.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value.trim())
}

/** Splits a comma-separated string and partitions into valid/invalid address lists. */
export function parseEmailList(raw) {
  const entries = raw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  return {
    valid: entries.filter(isValidEmail),
    invalid: entries.filter((e) => !isValidEmail(e)),
  }
}
