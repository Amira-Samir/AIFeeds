import { PROXIES, FETCH_TIMEOUT_MS } from '../config/constants'

/**
 * Fetches a cross-origin URL as text through the configured CORS proxies,
 * trying each in order with a per-attempt timeout.
 */
export async function fetchViaProxy(url, { signal } = {}) {
  let lastError = null
  for (const buildProxyUrl of PROXIES) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const onOuterAbort = () => controller.abort()
    signal?.addEventListener('abort', onOuterAbort)
    try {
      const response = await fetch(buildProxyUrl(url), { signal: controller.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()
      // Proxies can return 200 with an HTML error page (or the SPA shell when
      // /api/feed isn't served) — only accept something that looks like a feed.
      if (!/<(rss|feed|rdf)[\s>:]/i.test(text.slice(0, 2000))) {
        throw new Error('Response is not an RSS/Atom feed')
      }
      return text
    } catch (error) {
      lastError = error
      if (signal?.aborted) throw error
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onOuterAbort)
    }
  }
  throw lastError ?? new Error(`All proxies failed for ${url}`)
}
