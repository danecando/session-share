#!/usr/bin/env bash
set -euo pipefail

BUCKET="session-share-sessions"

usage() {
  cat <<'USAGE'
Usage: copy-session.sh <session_id> [--to-prod]

Copy sessions between production and local R2 instances.

Options:
  --to-prod    Copy from local to production (default: prod to local)
  -h, --help   Show this help
USAGE
}

session_id=""
to_prod=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --to-prod) to_prod=true; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
    *) session_id="$1"; shift ;;
  esac
done

if [[ -z "$session_id" ]]; then
  echo "Error: session_id required" >&2
  usage >&2
  exit 1
fi

tmp_file=$(mktemp)
trap "rm -f $tmp_file" EXIT

if $to_prod; then
  echo "Copying $session_id from local → production..."
  wrangler r2 object get "$BUCKET/$session_id" --local --pipe > "$tmp_file"
  wrangler r2 object put "$BUCKET/$session_id" --file "$tmp_file"
else
  echo "Copying $session_id from production → local..."
  wrangler r2 object get "$BUCKET/$session_id" --pipe > "$tmp_file"
  wrangler r2 object put "$BUCKET/$session_id" --file "$tmp_file" --local
fi

echo "Done! Session $session_id copied."
