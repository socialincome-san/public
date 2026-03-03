#!/usr/bin/env zsh
set -euo pipefail

typeset -i CLEANED_UP=0
PIDS=()

cleanup() {
  (( CLEANED_UP )) && return
  CLEANED_UP=1

  echo ""
  echo "[dev] Shutting down services..."

  for pid in "${PIDS[@]}"; do
    kill -0 "$pid" 2>/dev/null && kill -INT "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true

  npm run mockserver:down || true
  npm run db:down || true
}

trap 'exit 0'   INT   # Ctrl+C — clean shutdown, not a failure
trap 'exit 143' TERM  # 128 + 15 (SIGTERM)
trap cleanup    EXIT

# Defensive cleanup in case a previous run crashed.
npm run mockserver:down || true
npm run db:down || true

# Start required docker services fresh.
npm run db:up
npm run mockserver:up

# Start long-running foreground processes.
npm run firebase:serve &
PIDS+=($!)

if ! npm run website:build-paths; then
  echo "[dev] website:build-paths failed; aborting startup."
  exit 1
fi

npm run website:serve &
PIDS+=($!)

# Exit when either process dies
while kill -0 "${PIDS[1]}" 2>/dev/null && kill -0 "${PIDS[2]}" 2>/dev/null; do
  sleep 1
done
