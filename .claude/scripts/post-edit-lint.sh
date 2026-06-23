#!/usr/bin/env bash
# .claude/scripts/post-edit-lint.sh
# PostToolUse hook (matcher: Write|Edit|MultiEdit). Tool input arrives as JSON
# on STDIN. Auto-formats the file that was just edited.
# Failures are SOFT (always exit 0 so Claude is never blocked) but NOT silent:
# formatter stderr is preserved, and missing tools are reported.

set -o pipefail

INPUT="$(cat)"
FILEPATH=""
if command -v node >/dev/null 2>&1; then
  FILEPATH="$(printf '%s' "$INPUT" | node -e 'let s=require("fs").readFileSync(0,"utf8");let d;try{d=JSON.parse(s)}catch(e){d={}};process.stdout.write(((d.tool_input||{}).file_path)||"")' 2>/dev/null)"
elif command -v jq >/dev/null 2>&1; then
  FILEPATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // ""')"
else
  echo "post-edit-lint: neither node nor jq found, skipping format" >&2
  exit 0
fi

[ -z "$FILEPATH" ] && exit 0
[ ! -f "$FILEPATH" ] && exit 0

EXT="${FILEPATH##*.}"

case "$EXT" in
  ts|tsx|js|jsx|mjs|cjs)
    if command -v npx >/dev/null 2>&1; then
      npx prettier --write "$FILEPATH" || true
      npx eslint --fix "$FILEPATH" || true
    else
      echo "post-edit-lint: npx not found, skipping JS/TS format for $FILEPATH" >&2
    fi
    ;;
  py)
    if command -v black >/dev/null 2>&1; then
      black "$FILEPATH" || true
    else
      echo "post-edit-lint: black not found, skipping Python format for $FILEPATH" >&2
    fi
    if command -v isort >/dev/null 2>&1; then
      isort "$FILEPATH" || true
    fi
    ;;
  cs)
    if command -v dotnet >/dev/null 2>&1; then
      dotnet format --include "$FILEPATH" || true
    else
      echo "post-edit-lint: dotnet not found, skipping C# format for $FILEPATH" >&2
    fi
    ;;
  json|md|markdown)
    if command -v npx >/dev/null 2>&1; then
      npx prettier --write "$FILEPATH" || true
    else
      echo "post-edit-lint: npx not found, skipping format for $FILEPATH" >&2
    fi
    ;;
esac

exit 0
