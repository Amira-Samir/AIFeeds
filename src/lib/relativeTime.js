const UNITS = [
  { limit: 60, divisor: 1, singular: 'just now' },
  { limit: 3600, divisor: 60, unit: 'minute' },
  { limit: 86400, divisor: 3600, unit: 'hour' },
  { limit: 604800, divisor: 86400, unit: 'day' },
  { limit: 2629800, divisor: 604800, unit: 'week' },
  { limit: 31557600, divisor: 2629800, unit: 'month' },
  { limit: Infinity, divisor: 31557600, unit: 'year' },
]

/** "2 hours ago" / "just now". Future or invalid dates clamp to "just now". */
export function relativeTime(isoString, now = Date.now()) {
  if (!isoString) return ''
  const then = new Date(isoString).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.max(0, Math.floor((now - then) / 1000))
  for (const u of UNITS) {
    if (seconds < u.limit) {
      if (!u.unit) return u.singular
      const n = Math.floor(seconds / u.divisor)
      return `${n} ${u.unit}${n === 1 ? '' : 's'} ago`
    }
  }
  return ''
}
