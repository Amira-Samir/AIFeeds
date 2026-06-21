import { MAX_ITEMS_PER_SOURCE } from '../config/constants'
import { deriveTags } from './classify'

/**
 * @typedef {Object} Article
 * @property {string} id            canonical URL — stable across refetches
 * @property {string} url
 * @property {string} title
 * @property {string} excerpt       cleaned 2–3 sentence fallback summary, always present
 * @property {string} sourceId
 * @property {string} sourceName
 * @property {string} favicon
 * @property {string|null} publishedAt ISO string
 * @property {string[]} tags        category ids
 */

/** Strips HTML tags and decodes entities via a throwaway document. */
export function stripHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** Truncates plain text to ~280 chars, preferring a sentence boundary. */
export function cleanExcerpt(plainText, maxLength = 280) {
  if (plainText.length <= maxLength) return plainText
  const slice = plainText.slice(0, maxLength)
  const sentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '))
  if (sentenceEnd > maxLength * 0.4) return slice.slice(0, sentenceEnd + 1)
  const wordEnd = slice.lastIndexOf(' ')
  return `${slice.slice(0, wordEnd > 0 ? wordEnd : maxLength)}…`
}

/** Canonicalizes a URL for dedupe: drops hash, utm_* params, and trailing slash. */
export function canonicalUrl(url) {
  try {
    const u = new URL(url)
    u.hash = ''
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith('utm_')) u.searchParams.delete(key)
    }
    let result = u.toString()
    if (result.endsWith('/')) result = result.slice(0, -1)
    return result.toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

function toIsoDate(raw) {
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  // Clamp future-dated posts (bad feed clocks) so "ago" text stays sane.
  return (date.getTime() > Date.now() ? new Date() : date).toISOString()
}

/** Converts raw parsed feed items from one source into Article objects. */
export function normalizeItems(rawItems, source) {
  return rawItems
    .filter((raw) => raw.title && raw.link)
    .slice(0, MAX_ITEMS_PER_SOURCE)
    .map((raw) => {
      const title = stripHtml(raw.title)
      const body = stripHtml(raw.body)
      const article = {
        id: canonicalUrl(raw.link),
        url: raw.link,
        title,
        excerpt: cleanExcerpt(body) || title,
        sourceId: source.id,
        sourceName: source.name,
        favicon: source.favicon,
        publishedAt: toIsoDate(raw.publishedAt),
        tags: [],
      }
      article.tags = deriveTags(article, source)
      return article
    })
}

/** Merges per-source article lists: dedupes by canonical URL, sorts newest first. */
export function mergeArticles(perSourceLists) {
  const byId = new Map()
  for (const article of perSourceLists.flat()) {
    if (!byId.has(article.id)) byId.set(article.id, article)
  }
  return [...byId.values()].sort((a, b) => {
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(b.publishedAt) - new Date(a.publishedAt)
  })
}
