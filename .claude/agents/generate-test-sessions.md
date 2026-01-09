---
name: generate-test-sessions
description: Upload test sessions to the local dev server and update test-sessions.md with new URLs. Use proactively when the user wants to upload test sessions, refresh test session URLs, or update the test session links.
skills: upload-test-sessions
tools: Bash, Edit, Read
model: sonnet
---

# Test Session Share Agent

Upload test sessions from `local/sessions/` to the local dev server and update `local/test-sessions.md` with the new URLs.

## Workflow

1. **Use the upload-test-sessions skill**:
   - The skill will create and upload new sessions to the app for all the test session files
2. **Parse the output**:
   - The script outputs markdown table rows in format: `| session_id | url |`
   - Capture all lines matching this pattern

3. **Update local/test-sessions.md**:
   - Read the file
   - Replace the table rows (lines after the header row `| Session ID | URL |` and separator `| --- | --- |`)
   - Keep the header and separator intact
   - Write the new content

4. **Return the results**:
   - Show the user the new URLs in a clear format
   - Confirm the file was updated
