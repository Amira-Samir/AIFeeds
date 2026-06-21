/**
 * Tag classification: keyword heuristics over title + excerpt, seeded by the
 * source's default category. Articles get 1–2 tags.
 */

const KEYWORD_RULES = [
  {
    tag: 'model-updates',
    pattern:
      /\b(model|gpt-?\d|claude|gemini|llama|mistral|sonnet|opus|haiku|releases?|launch(es|ed)?|announc\w+|unveil\w+|introduc\w+|upgrade\w*|version|benchmark)\b/i,
  },
  {
    tag: 'research',
    pattern: /\b(paper|study|research\w*|arxiv|findings?|experiment\w*|dataset|training|fine-?tun\w+|rlhf|transformer)\b/i,
  },
  {
    tag: 'frontend-ai',
    pattern: /\b(react|next\.?js|vue|svelte|frontend|front-end|css|tailwind|javascript|typescript|ui|web dev\w*|component|vercel|copilot)\b/i,
  },
  {
    tag: 'tools-libraries',
    pattern: /\b(sdk|api|librar(y|ies)|framework|cli|plugin|extension|tool(s|kit|ing)?|integration|npm|package)\b/i,
  },
  {
    tag: 'open-source',
    pattern: /\b(open[ -]?sourc\w+|open[ -]?weights?|hugging ?face|github|apache|mit licen\w+|community)\b/i,
  },
  {
    tag: 'industry-news',
    pattern: /\b(funding|raises?|acqui\w+|startup|valuation|ipo|lawsuit|regulat\w+|partnership|ceo|billion|invest\w+)\b/i,
  },
]

const MAX_TAGS = 2

/** @returns {string[]} 1–2 category ids, most-specific keyword matches first. */
export function deriveTags(article, source) {
  const haystack = `${article.title} ${article.excerpt}`
  const matched = KEYWORD_RULES.filter((rule) => rule.pattern.test(haystack)).map((rule) => rule.tag)
  const tags = [...new Set([...matched, source.defaultCategory])]
  return tags.slice(0, MAX_TAGS)
}
