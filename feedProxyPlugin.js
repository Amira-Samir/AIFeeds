import { SOURCES } from './src/config/sources.js'

/**
 * Vite plugin: serves /api/feed?url=<feedUrl> from the dev/preview server,
 * fetching the feed server-side where browser CORS doesn't apply. This is the
 * primary feed transport in dev; public CORS proxies remain as fallbacks for
 * static deployments (see PROXIES in src/config/constants.js).
 *
 * Only hosts present in the source registry are fetched, so the endpoint
 * can't be used as an open proxy.
 */

const ALLOWED_HOSTS = new Set(SOURCES.map((s) => new URL(s.feedUrl).host))

async function handleFeedRequest(req, res) {
  const requested = new URL(req.url, 'http://localhost').searchParams.get('url')
  let target
  try {
    target = new URL(requested)
  } catch {
    res.statusCode = 400
    return res.end('Missing or invalid url parameter')
  }
  if (!ALLOWED_HOSTS.has(target.host)) {
    res.statusCode = 403
    return res.end('Host not in source registry')
  }
  try {
    const upstream = await fetch(target, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'user-agent': 'Mozilla/5.0 (AIFeed dev proxy)' },
    })
    const body = await upstream.text()
    res.statusCode = upstream.status
    res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/xml')
    res.end(body)
  } catch (error) {
    res.statusCode = 502
    res.end(`Upstream fetch failed: ${error.message}`)
  }
}

export default function feedProxy() {
  const register = (server) => {
    server.middlewares.use('/api/feed', (req, res) => {
      handleFeedRequest(req, res)
    })
  }
  return {
    name: 'aifeed-feed-proxy',
    configureServer: register,
    configurePreviewServer: register,
  }
}
