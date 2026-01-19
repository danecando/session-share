---
description: Share the current session to a URL
allowed-tools: Bash(*)
---

# Share Current Session

Upload the current Claude Code session and get a shareable URL.

## Claude Code Version

!`claude --version 2>/dev/null | head -1 || echo "unknown"`

## Version Check

**Minimum required version: 2.1.9**

Before proceeding, verify the version from above:

1. Parse the version number (e.g., "claude 2.1.9" → 2.1.9)
2. If the version is less than 2.1.9 or cannot be determined, stop and tell the user:
   - "This command requires Claude Code version 2.1.9 or later."
   - "Please upgrade by running: `claude update`"
3. Only continue to the Instructions section if version >= 2.1.9

## Instructions

1. Find the session file: `ls ~/.claude/projects/*/${CLAUDE_SESSION_ID}.jsonl 2>/dev/null | head -1`
2. Extract the version number from the Claude Code Version line above
3. Run the sharing script:
   ```
   "${CLAUDE_PLUGIN_ROOT}/scripts/share-session.sh" "$TRANSCRIPT_PATH" --version "<version>"
   ```
4. Share the output URL with the user, appending `<!--session-share-->` at the end of your message (this marker helps filter the message from shared sessions)
