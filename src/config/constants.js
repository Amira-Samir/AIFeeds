/**
 * Feed categories. `id` is stored on articles; `color` classes drive the tag chips
 * and filter bar in both themes.
 */
export const CATEGORIES = [
  {
    id: 'model-updates',
    label: 'Model Updates',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  },
  {
    id: 'research',
    label: 'Research',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    id: 'frontend-ai',
    label: 'Frontend AI',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  },
  {
    id: 'tools-libraries',
    label: 'Tools & Libraries',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    id: 'industry-news',
    label: 'Industry News',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    id: 'open-source',
    label: 'Open Source',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

/**
 * Feed transports tried in order. The local /api/feed middleware (see
 * feedProxyPlugin.js) serves dev and `vite preview`; the public CORS proxies
 * cover static deployments where no server middleware exists.
 */
export const PROXIES = [
  (url) => `/api/feed?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
]

export const FETCH_TIMEOUT_MS = 10_000
export const MAX_ITEMS_PER_SOURCE = 15

export const CACHE_KEYS = {
  items: 'aifeed:items',
  summaries: 'aifeed:summaries',
  bookmarks: 'aifeed:bookmarks',
  theme: 'aifeed:theme',
}

export const ITEMS_CACHE_TTL_MS = 15 * 60 * 1000 // re-fetch feeds after 15 minutes
export const SUMMARIES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const SUMMARIES_CACHE_MAX_ENTRIES = 300

export const AI = {
  model: 'claude-sonnet-4-6',
  endpoint: 'https://api.anthropic.com/v1/messages',
  version: '2023-06-01',
  batchSize: 8, // articles summarized per request
  concurrency: 2, // max in-flight requests
  maxTokens: 1500,
}

/** @type {'mailto' | 'resend' | 'emailjs'} — swap providers without touching UI code. */
export const EMAIL_PROVIDER = 'mailto'

export const SUBJECT_WRAP_LIMIT = 78 // email clients wrap subjects beyond this
export const DIGEST_SIZE_WARNING = 10 // selecting more articles than this shows a warning
export const MAILTO_BODY_LIMIT = 1900 // conservative mailto: URI length budget
