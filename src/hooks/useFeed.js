import { useCallback, useEffect, useRef, useState } from 'react'
import { SOURCES } from '../config/sources'
import { CACHE_KEYS, ITEMS_CACHE_TTL_MS } from '../config/constants'
import { fetchViaProxy } from '../lib/corsProxy'
import { parseFeed } from '../lib/rssParser'
import { normalizeItems, mergeArticles } from '../lib/normalize'
import { getFresh, safeGet, setWithTimestamp } from '../lib/cache'

/**
 * Feed state machine: cache-first load, parallel per-source fetching with
 * per-source error tolerance, manual refresh.
 *
 * status: 'loading' | 'ready' | 'error'  ('error' = every source failed AND no cache)
 */
function readItemsCache() {
  const fresh = getFresh(CACHE_KEYS.items, ITEMS_CACHE_TTL_MS)
  if (!fresh?.length) return null
  return { items: fresh, ts: safeGet(CACHE_KEYS.items)?.ts ?? Date.now() }
}

export function useFeed() {
  const [cached] = useState(readItemsCache)
  const [items, setItems] = useState(cached?.items ?? [])
  const [status, setStatus] = useState(cached ? 'ready' : 'loading')
  const [sourceErrors, setSourceErrors] = useState([])
  const [lastUpdated, setLastUpdated] = useState(cached?.ts ?? null)
  const abortRef = useRef(null)

  const fetchAll = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const results = await Promise.allSettled(
      SOURCES.map(async (source) => {
        const xml = await fetchViaProxy(source.feedUrl, { signal: controller.signal })
        return normalizeItems(parseFeed(xml), source)
      }),
    )
    if (controller.signal.aborted) return

    const succeeded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
    const failed = SOURCES.filter((_, i) => results[i].status === 'rejected').map((s) => s.name)
    setSourceErrors(failed)

    if (succeeded.length === 0) {
      const cached = safeGet(CACHE_KEYS.items)
      if (cached?.data?.length) {
        setItems(cached.data)
        setLastUpdated(cached.ts)
        setStatus('ready')
      } else {
        setStatus('error')
      }
      return
    }

    const merged = mergeArticles(succeeded)
    setItems(merged)
    setLastUpdated(Date.now())
    setStatus('ready')
    setWithTimestamp(CACHE_KEYS.items, merged)
  }, [])

  // User-triggered refresh/retry: show skeletons again when recovering from error.
  const refresh = useCallback(() => {
    setStatus((prev) => (prev === 'ready' ? 'ready' : 'loading'))
    return fetchAll()
  }, [fetchAll])

  useEffect(() => {
    // False positive: fetchAll is async and every setState inside it runs after
    // an `await`, so nothing here triggers a synchronous cascading render.
    // Initial data fetch on mount is the standard effect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!cached) fetchAll() // status already starts as 'loading' when uncached
    return () => abortRef.current?.abort()
  }, [cached, fetchAll])

  return { items, status, sourceErrors, lastUpdated, refresh }
}
