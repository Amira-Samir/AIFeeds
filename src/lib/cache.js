import { CACHE_KEYS } from '../config/constants'

/**
 * localStorage helpers that never throw: private browsing, disabled storage,
 * and quota overruns all degrade to "no cache" instead of crashing the app.
 */

export function safeGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function safeSet(key, value) {
  const raw = JSON.stringify(value)
  try {
    localStorage.setItem(key, raw)
    return true
  } catch {
    // Likely QuotaExceededError — the summaries cache is the biggest entry, drop it and retry.
    try {
      localStorage.removeItem(CACHE_KEYS.summaries)
      localStorage.setItem(key, raw)
      return true
    } catch {
      return false
    }
  }
}

export function safeRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Reads a `{ts, data}` envelope written by setWithTimestamp; null when stale or absent. */
export function getFresh(key, ttlMs) {
  const entry = safeGet(key)
  if (!entry || typeof entry.ts !== 'number') return null
  if (Date.now() - entry.ts > ttlMs) return null
  return entry.data ?? null
}

export function setWithTimestamp(key, data) {
  return safeSet(key, { ts: Date.now(), data })
}
