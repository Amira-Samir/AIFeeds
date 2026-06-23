---
name: feature-branch-workflow
description: >-
  Use to ship a change end-to-end on a feature branch: create the branch, run a
  code review on the working changes, then commit with a descriptive Conventional
  Commits message that links the work-item ID, push, and open a PR. Trigger whenever
  the user wants to "commit my changes", "open a PR", "create a feature branch", "ship
  this", "raise a pull request", mentions an Azure DevOps work item / story / task ID
  (e.g. #1234) to attach to a commit, or asks for a review before committing — even if
  they only name one step, prefer running the full branch → review → commit → push → PR flow.
---

# Feature Branch Workflow

Take a set of working changes and ship them safely: an isolated feature branch, a
real code review _before_ anything is committed, a clean Conventional Commit that
carries the work-item ID, and a pull request — with a human confirmation at the point of
no easy return (the push).

The point of this skill is to make the review happen _before_ the commit, so the
commit history stays clean and review findings never get buried under "fix review"
commits. Work through the phases in order; each one gates the next.

## Phase 0 — Orient

Before doing anything, understand the current state:

```bash
git status              # what's changed, am I on a branch already?
git branch --show-current
git remote -v           # is there a remote to push/PR to?
```

Decide which case you're in:

- **Already on a `feature/...` branch** → skip branch creation, go to Phase 2.
- **On `main` (or another base) with uncommitted changes** → create a branch in Phase 1.
- **No changes at all** → stop and tell the user there's nothing to ship.

## Phase 1 — Create the feature branch

You need an **Azure DevOps work-item ID** (the numeric story/task ID, e.g. `1234`) and a
**short description** to name the branch. If the user gave them, use them. If not, ask —
don't invent a work-item ID, because the commit footer depends on it being correct.

Branch naming (this exact pattern, because the work-item ID is later parsed back out of it):

```
feature/<WORK-ITEM-ID>-<short-kebab-description>
```

Example: work item `1234`, "add email subscribe input" → `feature/1234-add-subscribe-input`

```bash
git checkout -b feature/1234-add-subscribe-input
```

Keep the description short (3–5 words), lowercase, hyphen-separated. Strip anything
that isn't `[a-z0-9-]`.

## Phase 2 — Code review BEFORE committing

Review the working changes (staged + unstaged) using the **pr-review-toolkit** agents.
Run them against the working diff, not a PR. Get the diff first so you can scope the review:

```bash
git --no-pager diff HEAD        # everything not yet committed
git --no-pager diff --stat HEAD
```

Dispatch the relevant pr-review-toolkit reviewer agents in parallel (one message,
multiple agent calls) and tell each one to focus on the working diff above:

- `pr-review-toolkit:code-reviewer` — always, for guideline/style/correctness.
- `pr-review-toolkit:silent-failure-hunter` — when the diff touches error handling,
  catch blocks, fallbacks, or async/network code.
- `pr-review-toolkit:pr-test-analyzer` — when the change adds logic that should be tested.
- Add `type-design-analyzer` / `comment-analyzer` only if the diff introduces new types
  or substantial comments/docs.

Match the review depth to the change. A one-line copy tweak doesn't need four agents;
a new feature module does. Don't spawn reviewers that have nothing to look at.

Collect findings and present them to the user grouped by severity (blocking vs.
nice-to-have), each as `file:line — issue — suggested fix`.

## Phase 3 — Fix loop

For each blocking finding: fix it, or, if you disagree, say why and let the user decide.
Don't perform agreement — apply the [receiving-code-review](skill) mindset: verify each
suggestion is actually correct before implementing it.

After applying fixes, re-review the changed areas (a focused re-run is fine — you don't
need the full panel again if only one file changed). Repeat until there are **no
blocking findings left**, or the user explicitly accepts the remaining ones.

Only leave this phase when the review is clean or consciously waived.

## Phase 4 — Commit

Infer the work-item ID from the branch name — take the numeric segment right after
`feature/`. `feature/1234-add-subscribe-input` → `1234`. If the branch doesn't match the
pattern (e.g. the user was already on some other branch), ask the user for the work-item
ID rather than guessing.

Write a **Conventional Commits** message. The footer carries the work item as `#<ID>`
so it matches the Azure DevOps reference style the repo's `post-commit-link` hook checks
for (it warns on any commit lacking a `#NNN` reference):

```
<type>(<scope>): <imperative subject, ≤72 chars>

<body: what changed and WHY — the reasoning, not a restatement of the diff>

Refs: #<WORK-ITEM-ID>
```

- `type`: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`, `build`, `ci`.
- `scope`: the area touched (e.g. `auth`, `feed`, `ui`) — omit if it spans many.
- The body explains intent, so a future reader understands the change without the ticket.
- The `Refs:` footer links the work item with a `#`. Keep it as the last line. If a
  separate task ID applies, reference both, e.g. `Refs: story #1234 task #1240`.

Stage and commit (use a heredoc so the body and footer survive newlines):

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(ui): add email subscribe input with validation

Adds a controlled subscribe field so visitors can join the AIFeed list
without leaving the page. Validates format client-side before enabling
the submit button to cut down on bad addresses.

Refs: #1234
EOF
)"
```

**Example commit messages:**

Input: fixed the feed proxy timing out on slow sources
Output:

```
fix(feed): raise feed proxy timeout for slow sources

Slow upstream feeds were hitting the default timeout and returning empty
results. Bumps the proxy timeout and surfaces a clear error so the UI can
distinguish "slow" from "broken".

Refs: #2014
```

Input: renamed a bunch of variables, no behavior change
Output:

```
refactor(feed): clarify feed-parser variable names

Renames terse locals in the parser for readability; no behavior change.

Refs: #1980
```

## Phase 5 — Confirm, push, open PR

This is the point of no easy return, so **confirm with the user before pushing.** Show:

```bash
git --no-pager show --stat HEAD     # the commit that will be pushed
```

Display the commit subject/body and the file summary, and ask the user to confirm.
Only after they confirm:

```bash
git push -u origin <branch-name>
```

Then open the PR with the GitHub CLI, targeting **main**:

```bash
gh pr create --base main --head <branch-name> \
  --title "<type>(<scope>): <subject>" \
  --body "$(cat <<'EOF'
## Summary
<1–3 sentences on what this delivers and why>

## Changes
- <key change>
- <key change>

## Review
Reviewed pre-commit with pr-review-toolkit; <blocking findings resolved / notes>.

Refs: #1234
EOF
)"
```

If `gh` isn't installed or authenticated (`gh auth status` fails), don't block —
print the compare URL so the user can open the PR in the browser:

```
https://github.com/<owner>/<repo>/compare/main...<branch-name>?expand=1
```

Finally, give the user the PR URL (`gh pr create` prints it) so they can jump to it.

## Guardrails

- **Never** push or open a PR without the Phase 5 confirmation.
- Don't commit over unfinished review fixes — the review gates the commit, not the reverse.
- Don't fabricate a work-item ID. If you can't derive it from the branch and the user
  didn't supply one, ask.
- If `git status` shows nothing to commit, stop early — there's nothing to ship.
