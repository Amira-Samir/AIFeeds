/**
 * Source registry. Adding a feed = adding one entry here.
 * `defaultCategory` seeds tag classification (see lib/classify.js).
 */

const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

export const SOURCES = [
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://openai.com/blog',
    feedUrl: 'https://openai.com/news/rss.xml',
    defaultCategory: 'model-updates',
    favicon: favicon('openai.com'),
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    url: 'https://www.anthropic.com/news',
    // anthropic.com publishes no RSS feed — community-maintained mirror of the newsroom
    feedUrl: 'https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml',
    defaultCategory: 'model-updates',
    favicon: favicon('anthropic.com'),
  },
  {
    id: 'deepmind',
    name: 'Google DeepMind',
    url: 'https://deepmind.google/discover/blog',
    feedUrl: 'https://deepmind.google/blog/rss.xml',
    defaultCategory: 'research',
    favicon: favicon('deepmind.google'),
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    url: 'https://huggingface.co/blog',
    feedUrl: 'https://huggingface.co/blog/feed.xml',
    defaultCategory: 'open-source',
    favicon: favicon('huggingface.co'),
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    url: 'https://mistral.ai/news',
    feedUrl: 'https://mistral.ai/rss.xml',
    defaultCategory: 'model-updates',
    favicon: favicon('mistral.ai'),
  },
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    feedUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    defaultCategory: 'industry-news',
    favicon: favicon('techcrunch.com'),
  },
  {
    id: 'verge-ai',
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence',
    feedUrl: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    defaultCategory: 'industry-news',
    favicon: favicon('theverge.com'),
  },
  {
    id: 'venturebeat-ai',
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/',
    feedUrl: 'https://venturebeat.com/category/ai/feed/',
    defaultCategory: 'industry-news',
    favicon: favicon('venturebeat.com'),
  },
  {
    id: 'wired-ai',
    name: 'Wired AI',
    url: 'https://www.wired.com/tag/artificial-intelligence/',
    feedUrl: 'https://www.wired.com/feed/tag/ai/latest/rss',
    defaultCategory: 'industry-news',
    favicon: favicon('wired.com'),
  },
  {
    id: 'arxiv-cs-ai',
    name: 'arXiv cs.AI',
    url: 'https://arxiv.org/list/cs.AI/recent',
    feedUrl: 'https://rss.arxiv.org/rss/cs.AI',
    defaultCategory: 'research',
    favicon: favicon('arxiv.org'),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    url: 'https://vercel.com/blog',
    feedUrl: 'https://vercel.com/atom',
    defaultCategory: 'frontend-ai',
    favicon: favicon('vercel.com'),
  },
  {
    id: 'devto-ai',
    name: 'DEV Community',
    url: 'https://dev.to/t/ai',
    feedUrl: 'https://dev.to/feed/tag/ai',
    defaultCategory: 'frontend-ai',
    favicon: favicon('dev.to'),
  },
  {
    id: 'hackernews-ai',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    feedUrl: 'https://hnrss.org/newest?q=AI+OR+LLM&points=50',
    defaultCategory: 'industry-news',
    favicon: favicon('news.ycombinator.com'),
  },
  {
    id: 'mit-tech-review',
    name: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    feedUrl: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    defaultCategory: 'industry-news',
    favicon: favicon('technologyreview.com'),
  },
]

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s]))
