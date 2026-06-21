# AIFeed

An AI news feed that aggregates, summarizes, and displays the latest AI updates — model
releases, capability updates, research, and AI tooling for frontend development.

Built with React (hooks only), Vite, and Tailwind CSS v4. No backend required.

## Features

- **Live feed** from ~14 curated sources (OpenAI, Anthropic, DeepMind, Hugging Face,
  TechCrunch AI, The Verge AI, arXiv cs.AI, Vercel, dev.to, Hacker News, …) via RSS/Atom
- **AI summaries** — 2–3 sentence digests generated with the Anthropic API, upgraded
  progressively after first paint; falls back to article excerpts without an API key
- **Filters & search** — multi-select category chips, live search, three sort modes
- **Bookmarks** — saved articles live in a dedicated Saved tab (localStorage)
- **Email share** — share one article or compose a multi-article digest with
  drag-and-drop ordering, tag-style recipient input, and validation
- **Dark/light mode**, skeleton loaders, offline-tolerant caching

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. The app works immediately — feeds are fetched through the
dev server's built-in proxy middleware (`feedProxyPlugin.js`).

### AI summaries (optional)

Copy `.env.example` to `.env.local` and set `VITE_ANTHROPIC_API_KEY`. Without a key the
feed shows cleaned RSS excerpts instead. **The key is exposed to the browser — local
dev/demo use only.** A production deployment should proxy Anthropic calls server-side.

### Email provider

`EMAIL_PROVIDER` in `src/config/constants.js` selects the delivery mechanism:

| Provider  | Status           | Notes                                                   |
| --------- | ---------------- | ------------------------------------------------------- |
| `mailto`  | default, working | Opens the user's mail client with the composed message  |
| `resend`  | stub, documented | Needs a serverless relay — see `resendProvider.js`      |
| `emailjs` | stub, documented | Needs EmailJS service ids — see `emailjsProvider.js`    |

The UI only talks to `getEmailProvider().send(payload)`, so swapping providers is a
one-word change.

## Architecture

```
src/
├── config/      sources registry + all tunables (categories, proxies, TTLs, AI model)
├── lib/         fetch/parse/normalize/classify pipeline, Anthropic client, caching
├── lib/email/   provider abstraction + plain-text and HTML email templates
├── hooks/       useFeed, useSummaries, useBookmarks, useTheme, useSelection
└── components/  feed UI, email modals, shared UI primitives
```

Feed pipeline: sources → CORS-safe transport (local middleware, then public proxies) →
RSS2/Atom parse → normalize + dedupe → keyword classification → render with excerpts →
progressive AI summary upgrade (batched, concurrency-limited, cached by URL for 7 days).

## Commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Dev server with feed proxy       |
| `npm run build`   | Production build                 |
| `npm run preview` | Serve the build (proxy included) |
| `npm run lint`    | ESLint                           |
