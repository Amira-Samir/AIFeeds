# AIFeed — Claude Code Workshop Exercises

A set of hands-on exercises for learning to **build features with Claude Code** using the
AIFeed codebase (React 19 + Vite + Tailwind v4, no backend).

## How to use these

Each exercise is a self-contained "card": a goal, where it lives, hints, sample prompts you
can paste into Claude Code, acceptance criteria, and a stretch goal.

**The point is the workflow, not the code.** For every exercise, practice the full loop:

1. **Explore first** — ask Claude to read the relevant files and explain the pattern before editing.
2. **Make the change** — let Claude implement; review the diff yourself.
3. **Verify** — run `npm run dev` and check it in the browser at http://localhost:5173.
4. **Lint & review** — this repo has quality gates (see `CLAUDE.md`). Run `npm run lint`
   and try `/project:review` on your changes.

> Tip: don't paste the whole solution prompt at once. Start small, read Claude's plan,
> then refine. Learning to *steer* is the skill.

The exercises increase in difficulty. Do them in order if you're new.

---

## Exercise 1 — Add a new feed source 🟢 Warm-up

**Goal:** Add a new AI news source to the feed so its articles appear alongside the others.

**Where it lives:** [src/config/sources.js](src/config/sources.js)

**Why it's a good first task:** Adding a feed is *one array entry* — no logic. It teaches you
to ask Claude to **discover and follow an existing convention** instead of inventing one.

**Hints**
- Each source is an object with `id`, `name`, `url`, `feedUrl`, `defaultCategory`, and `favicon`.
- `defaultCategory` must be one of the category ids in
  [src/config/constants.js](src/config/constants.js) (`model-updates`, `research`,
  `frontend-ai`, `tools-libraries`, `industry-news`, `open-source`).
- The `favicon()` helper at the top of the file builds the icon URL from a domain — reuse it.
- Good candidate feeds: Google AI Blog, Meta AI, Stability AI, GitHub Blog, Cohere.

**Sample prompts**
```
Read src/config/sources.js and explain the shape of a source entry and how favicon works.
```
```
Add Google's AI blog as a new source, following the existing pattern. Pick the right
defaultCategory from constants.js. Verify the RSS feed URL is valid.
```

**Acceptance criteria**
- [ ] A new entry exists in `SOURCES` with all required fields.
- [ ] `defaultCategory` is a real category id.
- [ ] App still loads; the new source's articles appear (or it fails gracefully — the feed
      tolerates per-source errors).
- [ ] `npm run lint` passes.

**Stretch:** Notice that two entries share `id: 'openai'`. Ask Claude whether duplicate ids
cause a problem (look at `SOURCE_BY_ID` and `mergeArticles`) and fix it if so.

---

## Exercise 2 — "Copy summary" button on each article card 🟡 Core

**Goal:** Add a button to each article card that copies the article's summary + link to the
clipboard, with a confirmation toast — mirroring the existing "copy link" button.

**Where it lives:**
- [src/components/feed/ArticleCard.jsx](src/components/feed/ArticleCard.jsx) (the button + icon)
- [src/App.jsx](src/App.jsx) (the handler, like `copyLink`)

**Why it's a good task:** It's a complete feature that touches a component *and* the parent
that wires it. You'll trace an existing pattern (`onCopyLink`) **end-to-end** and copy it.

**Hints**
- `copyLink` in `App.jsx` (around line 70) is your template: it uses `navigator.clipboard.writeText`
  and `addToast`. Write a `copySummary` next to it.
- The summary text is `summary?.text ?? article.excerpt`. Combine it with `article.url`.
- `ArticleCard` already receives `summary` and `onCopyLink` as props — add an `onCopySummary`
  prop and a new button in the icon row (look for `LinkIcon` / `EnvelopeIcon` around line 90).
- For the icon, reuse one from [src/components/ui/icons.jsx](src/components/ui/icons.jsx) or ask
  Claude to add a small one.

**Sample prompts**
```
Show me how the "copy link" feature works — trace it from the button in ArticleCard.jsx
to the handler in App.jsx.
```
```
Add a "copy summary" button next to copy-link. It should copy the summary text plus the
article URL, show a success toast, and follow the exact pattern copyLink already uses.
Add an appropriate icon.
```

**Acceptance criteria**
- [ ] A new button appears in each card's action row with an accessible `aria-label` and `title`.
- [ ] Clicking it copies summary + link and shows a toast.
- [ ] Falls back to the excerpt when no AI summary exists.
- [ ] `npm run lint` passes.

**Stretch:** Format the copied text nicely (title on the first line, summary, then the link).

---

## Exercise 3 — Remember the user's filters & sort across reloads 🟡 Core

**Goal:** Currently, selected category filters and sort mode reset every time the page reloads.
Persist them to `localStorage` so the user's view is restored.

**Where it lives:**
- [src/App.jsx](src/App.jsx) (`activeFilters`, `sortMode`, `showSaved` state — around lines 24–27)
- New hook in [src/hooks/](src/hooks/) (model it on `useBookmarks`)
- [src/config/constants.js](src/config/constants.js) (`CACHE_KEYS`)

**Why it's a good task:** It teaches you to **build by analogy** — there's already a working
localStorage pattern in the repo. You'll reuse the caching helpers instead of writing raw
`localStorage` calls.

**Hints**
- [src/hooks/useBookmarks.js](src/hooks/useBookmarks.js) is a near-perfect template: it
  initializes state from `safeGet(...)` and writes back with `safeSet(...)` on every change.
- The cache helpers live in [src/lib/cache.js](src/lib/cache.js) (`safeGet`, `safeSet`).
- Add new keys to `CACHE_KEYS` in `constants.js` (e.g. `filters`, `sort`).
- `activeFilters` is a `Set` — remember it needs to be serialized to an array (see how
  `useBookmarks` does `[...next]`).

**Sample prompts**
```
Explain how useBookmarks persists state to localStorage, including the cache helpers it uses.
```
```
Persist the active category filters and the sort mode to localStorage so they survive a
page reload. Follow the useBookmarks pattern and add any new keys to CACHE_KEYS. Don't use
raw localStorage — use the cache.js helpers.
```

**Acceptance criteria**
- [ ] Selecting filters / changing sort, then reloading, restores the same view.
- [ ] Uses `safeGet` / `safeSet`, not raw `localStorage`.
- [ ] New keys are added to `CACHE_KEYS`.
- [ ] `npm run lint` passes.

**Stretch:** Add a "Reset view" affordance, and decide whether the Saved tab (`showSaved`)
should persist too — discuss the UX trade-off with Claude.

---

## Exercise 4 — "New articles available" auto-refresh banner 🔴 Stretch

**Goal:** Poll for fresh articles on an interval. When new ones are found, show a dismissible
banner ("3 new articles — refresh") instead of jarringly replacing the list.

**Where it lives:**
- [src/hooks/useFeed.js](src/hooks/useFeed.js) (the feed state machine)
- [src/App.jsx](src/App.jsx) (render the banner)

**Why it's a good task:** This is the **debugging-heavy** exercise. Intervals + React effects +
async fetches are a classic source of stale-closure bugs. It's a great chance to practice
`systematic-debugging` with Claude when something doesn't behave as expected.

**Hints**
- `useFeed` already fetches all sources, merges, and caches. `ITEMS_CACHE_TTL_MS` (15 min) is
  in `constants.js` — a sensible poll interval.
- The cleanest approach: have the hook compare freshly-fetched article ids against the current
  ones and expose something like `{ newCount, applyNew }` rather than auto-replacing `items`.
- Watch for **stale closures**: a `setInterval` callback captures the `items` from the render
  it was created in. Use a ref or the functional-update form. (Ask Claude to explain the risk.)
- Don't forget to **clear the interval** on unmount, like the existing `abortRef` cleanup.
- Be careful not to interrupt the user — apply new items only when they click the banner.

**Sample prompts**
```
Walk me through useFeed.js — the state machine, the abort handling, and how caching works.
Where would polling fit in?
```
```
Add interval polling to useFeed that fetches in the background and reports how many NEW
articles were found without replacing the current list. Expose newCount and an applyNew()
function. Watch out for stale closures and clean up the interval on unmount.
```
```
Render a dismissible banner in App.jsx when newCount > 0. Clicking it applies the new
articles and scrolls to top.
```

**Acceptance criteria**
- [ ] A background fetch runs on an interval (no full-list flicker).
- [ ] When new articles arrive, a banner appears with the count.
- [ ] Clicking the banner shows the new articles; dismissing hides it.
- [ ] The interval is cleared on unmount; no console errors / duplicate fetches.
- [ ] `npm run lint` passes.

**Stretch:** Pause polling when the browser tab is hidden (`document.visibilityState`) to
avoid wasted fetches, and resume on focus.

---

## Facilitator notes

- **Quality gates:** `CLAUDE.md` documents lint + build gates and a `/project:review` command.
  Encourage participants to run them after each exercise — that turns the workshop into a lesson
  about the *Claude Code workflow*, not just feature code.
- **No API key needed:** the app works without an Anthropic key (it shows RSS excerpts instead
  of AI summaries), so nobody is blocked. Exercise 2 works fine with excerpts.
- **Order:** 1 → 2 → 3 → 4 is an intentional difficulty curve (single-file → multi-file →
  build-by-analogy → debugging-heavy). Each teaches a distinct Claude Code skill.
- **Time budget:** roughly 10 / 25 / 25 / 40 minutes respectively.
