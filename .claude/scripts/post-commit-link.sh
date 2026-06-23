#!/usr/bin/env bash
# .claude/scripts/post-commit-link.sh
# PostToolUse hook (matcher: Bash). Tool input arrives as JSON on STDIN.
# After an actual `git commit`, warns (non-blocking) if the latest commit
# message carries no work-item reference (#NNN). Amending is the user's call,
# so this only nudges — it never blocks.

set -o pipefail

# --- Was the command that just ran a git commit? ---
# Prefer node (always present in this JS project), fall back to jq.
INPUT="$(cat)"
CMD=""
if command -v node >/dev/null 2>&1; then
  CMD="$(printf '%s' "$INPUT" | node -e 'let s=require("fs").readFileSync(0,"utf8");let d;try{d=JSON.parse(s)}catch(e){d={}};process.stdout.write(((d.tool_input||{}).command)||"")' 2>/dev/null)"
elif command -v jq >/dev/null 2>&1; then
  CMD="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')"
else
  echo "post-commit-link: neither node nor jq found, skipping work-item check" >&2
  exit 0
fi

# Only react to git commits (skip --amend? no — an amend is still worth checking).
printf '%s' "$CMD" | grep -qE '\bgit\b.*\bcommit\b' || exit 0

git rev-parse --git-dir >/dev/null 2>&1 || exit 0

LAST_MSG="$(git log -1 --format='%B' 2>/dev/null || echo '')"
[ -z "$LAST_MSG" ] && exit 0

STATE_FILE=".claude/state/current-session.json"
STORY_ID=""
TASK_ID=""
if [ -f "$STATE_FILE" ] && command -v node >/dev/null 2>&1; then
  STORY_ID="$(node -e 'let d;try{d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))}catch(e){d={}};process.stdout.write((d.story_id||"")+"")' "$STATE_FILE" 2>/dev/null || echo '')"
  TASK_ID="$(node -e 'let d;try{d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))}catch(e){d={}};process.stdout.write((d.task_id||"")+"")' "$STATE_FILE" 2>/dev/null || echo '')"
fi

if ! printf '%s' "$LAST_MSG" | grep -qE '#[0-9]+'; then
  {
    echo ""
    echo "WARNING: Last commit has no work item reference (#NNN)."
    echo "  Commit: $(printf '%s' "$LAST_MSG" | head -1)"
    if [ -n "$STORY_ID" ] && [ -n "$TASK_ID" ]; then
      echo "  Expected format: '<description> - story #$STORY_ID task #$TASK_ID'"
    else
      echo "  Expected format: '<description> - story #<ID> task #<ID>'"
    fi
    echo "  Amend with: git commit --amend"
  } >&2
fi

exit 0
