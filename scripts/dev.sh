#!/usr/bin/env zsh
set -euo pipefail

typeset -i CLEANED_UP=0
FIREBASE_PID=""
WEBSITE_PID=""

cleanup() {
  if (( CLEANED_UP )); then
    return
  fi
  CLEANED_UP=1

  echo ""
  echo "[dev] Shutting down services..."

  # Ask foreground processes to exit gracefully.
  if [[ -n "${FIREBASE_PID}" ]] && kill -0 "${FIREBASE_PID}" 2>/dev/null; then
    kill -INT "${FIREBASE_PID}" 2>/dev/null || true
  fi
  if [[ -n "${WEBSITE_PID}" ]] && kill -0 "${WEBSITE_PID}" 2>/dev/null; then
    kill -INT "${WEBSITE_PID}" 2>/dev/null || true
  fi

  wait "${FIREBASE_PID}" 2>/dev/null || true
  wait "${WEBSITE_PID}" 2>/dev/null || true

  # Always tear down docker services so ports are released.
  npm run mockserver:down || true
  npm run db:down || true
}

on_signal() {
  cleanup
  # Ctrl+C should shut down cleanly without surfacing as a task failure.
  exit 0
}

trap on_signal INT TERM
trap cleanup EXIT

# Defensive cleanup in case a previous run crashed.
npm run mockserver:down || true
npm run db:down || true

# Start required docker services fresh.
npm run db:up
npm run mockserver:up

# Start long-running foreground processes.
npm run firebase:serve &
FIREBASE_PID=$!

npm run website:serve &
WEBSITE_PID=$!

# Exit when either process exits, then tear everything down.
wait -n "${FIREBASE_PID}" "${WEBSITE_PID}"
EXIT_CODE=$?
cleanup
exit "${EXIT_CODE}"
