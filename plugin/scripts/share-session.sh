#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: ./share-session.sh <transcript_path> --version <version>

Options:
  -h, --help          Show this help

Environment:
  CC_SHARE_SESSION_API    Override API endpoint (default: https://share.crapola.ai)
USAGE
}

api_url="${CC_SHARE_SESSION_API:-https://share.crapola.ai}"

input_path=""
version=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      version="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -z "$input_path" ]]; then
        input_path="$1"
        shift
      else
        echo "Unexpected argument: $1" >&2
        usage >&2
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$input_path" || -z "$version" ]]; then
  usage >&2
  exit 1
fi

if [[ ! -f "$input_path" ]]; then
  echo "Input file not found: $input_path" >&2
  exit 1
fi

input_basename="$(basename "$input_path")"

# Extract session ID from JSONL (first sessionId field found)
session_id="$(grep -o '"sessionId":"[^"]*"' "$input_path" | head -1 | sed 's/"sessionId":"//;s/"$//' || true)"

if [[ -z "$session_id" ]]; then
  session_id="${input_basename%.*}"
fi

# Extract cwd from JSONL (first cwd field found)
cwd="$(grep -o '"cwd":"[^"]*"' "$input_path" | head -1 | sed 's/"cwd":"//;s/"$//' || true)"

# Get GitHub repo URL if cwd is inside a git repo with a GitHub remote
git_remote=""
if [[ -n "$cwd" ]] && git -C "$cwd" rev-parse --is-inside-work-tree &>/dev/null 2>&1; then
  raw_remote="$(git -C "$cwd" config --get remote.origin.url 2>/dev/null || true)"
  # Only process GitHub remotes, normalize to clean HTTPS URL
  if [[ "$raw_remote" =~ github\.com ]]; then
    # Extract owner/repo from SSH (git@github.com:owner/repo.git) or HTTPS format
    if [[ "$raw_remote" =~ github\.com[:/]([^/]+)/([^/[:space:]]+) ]]; then
      owner="${BASH_REMATCH[1]}"
      repo="${BASH_REMATCH[2]%.git}"  # Remove .git suffix
      git_remote="https://github.com/${owner}/${repo}"
    fi
  fi
fi

stage_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$stage_dir"
}
trap cleanup EXIT

cp -p "$input_path" "$stage_dir/session.jsonl"

# Extract image paths from JSONL and copy them to images/
# Look for "type":"image" with "path":"..." entries
mkdir -p "$stage_dir/images"
image_paths=$(grep -oE '"type"\s*:\s*"image"[^}]*"path"\s*:\s*"[^"]*"' "$input_path" 2>/dev/null | \
  grep -oE '"path"\s*:\s*"[^"]*"' | \
  sed 's/"path"\s*:\s*"//;s/"$//' | \
  sort -u || true)

for img_path in $image_paths; do
  if [[ -f "$img_path" ]]; then
    # Store without leading slash to create valid tar paths
    dest_path="${img_path#/}"
    dest_dir="$stage_dir/images/$(dirname "$dest_path")"
    mkdir -p "$dest_dir"
    cp -p "$img_path" "$stage_dir/images/$dest_path"
  fi
done

# Write plain text metadata
cat > "$stage_dir/metadata.txt" <<EOF
BUNDLE_VERSION=1
SESSION_ID=${session_id}
AGENT=CC
AGENT_VERSION=${version}
GENERATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_REMOTE=${git_remote}
EOF

response=$(tar -czf - -C "$stage_dir" . | \
  curl -sfS -X POST \
  -H "Content-Type: application/gzip" \
  --data-binary @- \
  "${api_url}/api/sessions")

share_id=$(echo "$response" | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"$//')
if [[ -z "$share_id" ]]; then
  echo "Failed to get share ID. Response: $response" >&2
  exit 1
fi
echo "${api_url}/${share_id}"
