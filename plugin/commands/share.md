---
description: Share the current session to a URL
allowed-tools: Bash(*)
---

# Share Current Session

Upload the current Claude Code session and get a shareable URL.

## Claude Code Version

!`claude --version 2>/dev/null | head -1 || echo "unknown"`

## Instructions

1. Find the session file: `ls ~/.claude/projects/*/${CLAUDE_SESSION_ID}.jsonl 2>/dev/null | head -1`
2. Extract the version number from the Claude Code Version line above
3. Run the sharing script:
   ```
   "${CLAUDE_PLUGIN_ROOT}/scripts/share-session.sh" "$TRANSCRIPT_PATH" --version "<version>"
   ```
4. Share the output URL with the user
