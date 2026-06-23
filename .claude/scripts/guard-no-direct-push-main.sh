#!/usr/bin/env bash
# .claude/scripts/guard-no-direct-push-main.sh
# PreToolUse hook (matcher: Bash). Tool input arrives as JSON on STDIN.
# Blocks: (a) any force push, (b) any push whose destination is a protected
# branch (main/master/develop) on ANY remote, in ANY refspec form.
#
# Safety stance: FAIL CLOSED. If a command contains a `git push` that this
# script cannot confidently classify as safe, it is blocked (exit 2) so a
# human looks at it. A guard that fails open is worse than no guard.
#
# Exit codes: 0 = allow, 2 = block (Claude Code shows stderr and stops the call).

set -o pipefail

PROTECTED='^(main|master|develop)$'

block() {
  {
    echo ""
    echo "BLOCKED by guard-no-direct-push-main: $1"
    echo "  Command: $CMD"
    echo ""
    echo "  Never push directly to main/master/develop, and never force-push."
    echo "  Instead: push a feature/* branch, then open a PR for review."
  } >&2
  exit 2
}

# --- Read the command being run from the JSON on stdin ---
# Prefer node (always present in this JS project), fall back to jq.
INPUT="$(cat)"
CMD=""
if command -v node >/dev/null 2>&1; then
  CMD="$(printf '%s' "$INPUT" | node -e 'let s=require("fs").readFileSync(0,"utf8");let d;try{d=JSON.parse(s)}catch(e){d={}};process.stdout.write(((d.tool_input||{}).command)||"")' 2>/dev/null)"
elif command -v jq >/dev/null 2>&1; then
  CMD="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')"
else
  # Neither parser available. If the raw payload even mentions a push we can't
  # safely classify it, so fail closed rather than wave it through.
  if printf '%s' "$INPUT" | grep -qE '\bgit\b.*\bpush\b'; then
    CMD="$INPUT"
    block "neither node nor jq is available to parse the push command safely"
  fi
  exit 0
fi

# Fast path: nothing resembling a git push -> allow.
printf '%s' "$CMD" | grep -qE '\bgit\b.*\bpush\b' || exit 0

# A command may chain several invocations (&&, ||, |, ;, newline). Check each.
SEGMENTS="$(printf '%s' "$CMD" | tr '\n' ';' | sed -E 's/\|\||&&|\||;/\n/g')"

while IFS= read -r SEG; do
  # Only inspect segments that actually run a git push.
  printf '%s' "$SEG" | grep -qE '\bgit\b.*\bpush\b' || continue

  # Force push in any form (-f, -fu, --force, --force-with-lease, ...) -> block.
  if printf '%s' "$SEG" | grep -qE '(--force[A-Za-z-]*|(^|[[:space:]])-[A-Za-z]*f)([[:space:]]|=|$)'; then
    block "force push detected"
  fi

  # Everything after the literal 'push' token holds the remote + refspecs.
  AFTER="$(printf '%s' "$SEG" | sed -E 's/.*\bpush\b//')"

  # Gather the non-flag (positional) tokens: [remote] [refspec...]
  POSITIONAL=()
  for TOK in $AFTER; do
    case "$TOK" in
      -*) ;;                     # skip flags / options
      *)  POSITIONAL+=("$TOK") ;;
    esac
  done

  if [ "${#POSITIONAL[@]}" -le 1 ]; then
    # `git push` or `git push <remote>` with no explicit refspec:
    # destination is the current branch. Resolve it; if we can't, fail closed.
    DST="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
    [ -z "$DST" ] && block "cannot resolve current branch for a push with no refspec"
    printf '%s\n' "$DST" | grep -qE "$PROTECTED" \
      && block "push of current branch '$DST' to a protected branch"
  else
    # POSITIONAL[0] = remote/URL; the rest are refspecs (src:dst | +src:dst | dst).
    for R in "${POSITIONAL[@]:1}"; do
      DST="${R##*:}"            # text after the last ':' (or the whole token)
      DST="${DST#+}"            # drop a leading '+'
      DST="${DST#refs/heads/}"  # normalise refs/heads/<branch>
      printf '%s\n' "$DST" | grep -qE "$PROTECTED" \
        && block "push to protected branch '$DST'"
    done
  fi
done <<EOF
$SEGMENTS
EOF

exit 0
