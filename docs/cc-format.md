# Claude Code JSONL Format

This document describes aspects of the Claude Code JSONL format relevant to session-share conversion.

## Plan Handling

Plans are created when Claude uses the `ExitPlanMode` tool. The plan content is stored in the `tool_use` input, and the user's response determines the status.

### Scenario 1: Normal Approval

**Status:** `approved`

**Sequence:**

1. `assistant`: `tool_use` (ExitPlanMode) with `input.plan = "# Plan: ..."`
2. `user`: `tool_result` with `content = "User has approved your plan..."`

**Detection:** tool_result content matches `/approved your plan/i`

### Scenario 2: True Rejection

**Status:** `rejected`

**Sequence:**

1. `assistant`: `tool_use` (ExitPlanMode) with `input.plan = "# Plan: ..."`
2. `user`: `tool_result` with `content = "The user doesn't want to proceed..."`

**Detection:** tool_result content matches `/rejected|doesn't want to proceed/i`

User feedback may be included after "the user said:" in the result content.

### Scenario 3: Accept and Clear Context

**Status:** `approved`

This occurs when the user clicks the "Accept and clear context" button in Claude Code.

**Sequence:**

1. `assistant`: `tool_use` (ExitPlanMode) with `input.plan = "# Plan: ..."`
2. `user`: `tool_result` with `is_error=true`, `content = "The user doesn't want to proceed..."`
3. `user`: text message `"[Request interrupted by user for tool use]"`
4. `user`: text message `"Implement the following plan:\n\n# Plan: ...\n\nIf you need specific details..."`

The tool_result looks identical to a rejection, but the presence of the "Implement the following plan:" message indicates actual approval.

**Detection:** After marking a plan as "rejected", we track it in `rejectedPlanEntries`. When we later encounter "Implement the following plan:" with content that **starts with** the rejected plan text, we retroactively change status to "approved".

The "Implement" message has extra text appended by Claude Code ("If you need specific details from before exiting plan mode..."), so we use `startsWith()` matching rather than exact matching.

### Hidden Messages

The following messages are filtered from session output as they are system-generated:

- `"[Request interrupted by user for tool use]"`
- `"Implement the following plan:"`
