import { AI } from '../config/constants'

export const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''

const SYSTEM_PROMPT = `You summarize AI-news items for a tech-savvy feed reader.
For each article you receive, write a plain-English summary of 2-3 sentences.
Respond with ONLY a JSON array: [{"id": "<id as given>", "summary": "<2-3 sentences>"}, ...]
No markdown fences, no commentary.`

function buildUserPrompt(articles) {
  return articles
    .map((a) => `id: ${a.id}\ntitle: ${a.title}\nexcerpt: ${a.excerpt}`)
    .join('\n---\n')
}

function parseModelJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array')
  return parsed
}

/**
 * Summarizes one batch of articles via the Anthropic Messages API.
 * Browser-direct call — acceptable for this local demo app only; production
 * deployments must route through a server-side proxy instead.
 *
 * @returns {Promise<Record<string, string>>} summaries keyed by article id;
 *   articles missing from the model output are simply absent (caller keeps excerpts).
 */
export async function summarizeBatch(articles, { signal } = {}) {
  const response = await fetch(AI.endpoint, {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': AI.version,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI.model,
      max_tokens: AI.maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(articles) }],
    }),
  })

  if (!response.ok) throw new Error(`Anthropic API error ${response.status}`)
  const data = await response.json()
  // Safety refusals return 200 with stop_reason "refusal" and possibly no content.
  if (data.stop_reason === 'refusal' || data.content?.[0]?.type !== 'text') {
    throw new Error('Model declined to summarize this batch')
  }

  const entries = parseModelJson(data.content[0].text)
  const validIds = new Set(articles.map((a) => a.id))
  const result = {}
  for (const entry of entries) {
    if (validIds.has(entry?.id) && typeof entry.summary === 'string' && entry.summary.trim()) {
      result[entry.id] = entry.summary.trim()
    }
  }
  return result
}
