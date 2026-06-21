import { useEffect, useRef, useState } from 'react'
import { AI, CACHE_KEYS, SUMMARIES_CACHE_MAX_ENTRIES, SUMMARIES_CACHE_TTL_MS } from '../config/constants'
import { API_KEY, summarizeBatch } from '../lib/summarize'
import { getFresh, setWithTimestamp } from '../lib/cache'

function chunk(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size))
  return chunks
}

function pruneCache(entries) {
  const keys = Object.keys(entries)
  if (keys.length <= SUMMARIES_CACHE_MAX_ENTRIES) return entries
  // Insertion order ≈ oldest first; keep the newest N.
  return Object.fromEntries(keys.slice(-SUMMARIES_CACHE_MAX_ENTRIES).map((k) => [k, entries[k]]))
}

function persist(summaryMap) {
  const aiOnly = Object.fromEntries(
    Object.entries(summaryMap)
      .filter(([, v]) => v.kind === 'ai')
      .map(([id, v]) => [id, v.text]),
  )
  setWithTimestamp(CACHE_KEYS.summaries, pruneCache(aiOnly))
}

/**
 * Progressive AI summary upgrade. Articles render with excerpts immediately;
 * this hook batches uncached articles to the Anthropic API (max 2 batches
 * in flight) and merges results in as they land. Without an API key it does
 * nothing and cards keep showing excerpts.
 *
 * @returns {{summaries: Record<string, {text: string, kind: 'ai'|'excerpt'}>, aiFailed: boolean}}
 */
export function useSummaries(items) {
  const [summaries, setSummaries] = useState(() => {
    const cached = getFresh(CACHE_KEYS.summaries, SUMMARIES_CACHE_TTL_MS) ?? {}
    return Object.fromEntries(Object.entries(cached).map(([id, text]) => [id, { text, kind: 'ai' }]))
  })
  const [aiFailed, setAiFailed] = useState(false)
  const summariesRef = useRef(summaries)
  const inFlightRef = useRef(new Set()) // ids queued or being summarized
  const failedRef = useRef(false) // stop after the first failure this session

  // Keep a ref in sync so the batching effect below can read the latest
  // summaries without re-running on every batch merge.
  useEffect(() => {
    summariesRef.current = summaries
  }, [summaries])

  useEffect(() => {
    if (!API_KEY || items.length === 0 || failedRef.current) return undefined

    const pending = items.filter(
      (a) => !summariesRef.current[a.id] && !inFlightRef.current.has(a.id),
    )
    if (pending.length === 0) return undefined

    pending.forEach((a) => inFlightRef.current.add(a.id))
    const controller = new AbortController()
    const batches = chunk(pending, AI.batchSize)

    const runWorker = async () => {
      while (batches.length > 0 && !controller.signal.aborted && !failedRef.current) {
        const batch = batches.shift()
        try {
          const results = await summarizeBatch(batch, { signal: controller.signal })
          if (controller.signal.aborted) return
          setSummaries((prev) => {
            const next = { ...prev }
            for (const article of batch) {
              const text = results[article.id]
              if (text) next[article.id] = { text, kind: 'ai' }
            }
            persist(next)
            return next
          })
        } catch (error) {
          if (controller.signal.aborted) return
          failedRef.current = true
          setAiFailed(true)
          console.warn('AI summarization unavailable:', error.message)
        } finally {
          batch.forEach((a) => inFlightRef.current.delete(a.id))
        }
      }
    }

    Array.from({ length: AI.concurrency }, runWorker)

    return () => controller.abort()
  }, [items])

  return { summaries, aiFailed }
}
