---
name: upload-test-sessions
description: Upload test sessions from local/sessions/ to the local dev server. Returns markdown table rows with session IDs and URLs.
allowed-tools: Bash(*)
---

# Upload Test Sessions

This skill uploads all test sessions from the `local/sessions/` directory to the local dev server.

## How to use

Run the upload script:

```bash
bash .claude/skills/upload-test-sessions/scripts/upload.sh
```

## What the script does

1. Starts the dev server on localhost:8080 if not already running
2. Uploads each `.jsonl` file from `local/sessions/`
3. Outputs table rows in format: `| session_id | url |`
