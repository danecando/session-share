#!/usr/bin/env bash
set -euo pipefail

API_URL="http://localhost:8080"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Check if dev server is running (check if port 8080 is in use)
server_running() {
  lsof -i :8080 >/dev/null 2>&1
}

# Start dev server if not running
if ! server_running; then
  echo "Starting dev server..."
  cd "$PROJECT_DIR" && pnpm dev > /dev/null 2>&1 &

  # Wait for server to be ready (max 30s)
  echo "Waiting for server to start..."
  for i in {1..30}; do
    if server_running; then
      echo "Dev server ready on $API_URL"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "Error: Dev server failed to start after 30 seconds" >&2
      exit 1
    fi
    sleep 1
  done
else
  echo "Dev server already running on $API_URL"
fi

# Upload each session and output results
echo ""
echo "Uploading test sessions..."
echo ""

for jsonl in "$PROJECT_DIR"/local/sessions/*.jsonl; do
  if [ ! -f "$jsonl" ]; then
    echo "No session files found in $PROJECT_DIR/local/sessions/"
    exit 1
  fi

  session_id=$(basename "$jsonl" .jsonl)

  url=$(CC_SHARE_SESSION_API="$API_URL" "$PROJECT_DIR/plugin/scripts/share-session.sh" \
    "$jsonl" --version "1.0.0")

  echo "| $session_id | $url |"
done

echo ""
echo "Done! Update README.md with the table rows above."
