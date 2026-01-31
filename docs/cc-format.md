# Claude Code JSONL Session Format

Reference for the Claude Code session log format as consumed by the session-share converter (`src/lib/cc-converter.ts`). This document tracks format changes across Claude Code versions to inform parser development.

## File Structure

Sessions are stored as newline-delimited JSON (JSONL) at:
```
~/.claude/projects/<project-path>/<session-uuid>.jsonl
```

Each line is a JSON object with a `type` field. Sessions also contain subagent logs in separate files (not parsed by the converter).

## Entry Types

### Common Fields (`CCBaseEntry`)

Every entry may have:

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | string | Unique entry ID |
| `parentUuid` | string\|null | Parent entry (for threading / dedup) |
| `sessionId` | string | Session UUID |
| `type` | string | Entry type discriminator |
| `timestamp` | string | ISO 8601 timestamp |
| `slug` | string | Human-readable session slug (persists across "accept and clear context") |
| `cwd` | string | Working directory |
| `gitBranch` | string | Git branch at time of entry |
| `version` | string | Claude Code version |
| `isMeta` | boolean | System injection, not shown in UI |
| `isVisibleInTranscriptOnly` | boolean | Context continuation summary |
| `toolUseResult` | object | Structured result data for tool_result entries |
| `planContent` | string | Plan text (new format, see below) |
| `permissionMode` | string | e.g. `"plan"` for planning sessions |

### `user` / `assistant` / `system`

Chat messages. Contain a `message` object with `role`, `content` (string or array of content parts), and optionally `model`.

**Content part types:**
- `text` — `{ type: "text", text: string }`
- `thinking` — `{ type: "thinking", thinking: string }`
- `tool_use` — `{ type: "tool_use", id: string, name: string, input: object }`
- `tool_result` — `{ type: "tool_result", tool_use_id: string, content: ... }`
- `image` — `{ type: "image", path?: string, url?: string, source?: { type: "base64", data: string, media_type: string } }`

### `summary`

Context compaction summary. Has `summary` (string) and `leafUuid` fields.

### `custom-title`

User-set title via `/title`. Has `customTitle` (string).

### `file-history-snapshot`

File backup metadata. Skipped by converter.

## Tool Names We Handle

| Tool | Converter behavior |
|------|--------------------|
| `Write` | → `write_file` entry with diff |
| `Edit` | → `edit_file` entry with diff |
| `Bash` | → generic `tool_call` (filtered if share-related) |
| `Read`, `Glob`, `Grep` | → generic `tool_call` |
| `Task` (subagent) | → `task` entry grouped by `subagent_type` |
| `AskUserQuestion` | → `questionnaire` entry (matched with result) |
| `ExitPlanMode` | → `plan` entry (status from result text) |
| `TodoWrite` | → `todo_list` entry |
| `TaskCreate` | → `todo_list` entry (via task state tracking) |
| `TaskUpdate` | → updates task state, re-emits `todo_list` |
| `TaskList`, `TaskGet` | → skipped (no output entry) |
| `Skill` | → generic `tool_call` (filtered if share plugin) |

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

### Scenario 3: Accept and Clear Context (old format)

**Status:** `approved`

This occurs when the user clicks the "Accept and clear context" button in Claude Code (pre-January 2026).

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

---

## Format Changes Log

### January 2026 — Tasks replace Todos, Plan via `planContent`, Session Chains

**Observed in:** Claude Code sessions from late January 2026
**Session example:** `d0b49a73-d799-4548-bb62-379877461c11`

#### Change 1: `TaskCreate`/`TaskUpdate`/`TaskList`/`TaskGet` tools

Claude Code now uses structured Task tools instead of `TodoWrite` for tracking work items.

**`TaskCreate` tool_use input:**
```json
{
  "subject": "Fix authentication bug",
  "description": "Detailed description...",
  "status": "pending",
  "activeForm": "Fixing authentication bug"
}
```

**`TaskCreate` tool_result (on user entry):**
The entry has a top-level `toolUseResult` field:
```json
{
  "toolUseResult": {
    "task": {
      "id": "1",
      "subject": "Fix authentication bug"
    }
  }
}
```

The task ID is assigned server-side and only available in the result, not the input.

**`TaskUpdate` tool_use input:**
```json
{
  "taskId": "1",
  "status": "completed"
}
```

**Converter handling:** Task state is tracked in a map. Each create/update emits a `todo_list` entry (replacing the previous one) representing the full task list snapshot.

#### Change 2: `planContent` field on user messages

When a user accepts a plan with "Accept and clear context", Claude Code now:
1. Creates a **new session** with a fresh UUID but the **same slug**
2. Injects the plan as a `planContent` top-level field on the first user message
3. Sets `message.content` to `"Implement the following plan:\n\n{plan text}\n\n...read the full transcript at: /path/to/source-session.jsonl"`

**Key differences from `ExitPlanMode`:**
- `planContent` is a top-level field on the user entry, NOT a tool_use input
- The plan is always "approved" (the user explicitly accepted it)
- No `EnterPlanMode` or `ExitPlanMode` tool calls exist in the implementation session
- The source session reference is in `message.content` but NOT in `planContent`
- `parentUuid` is `null` on the plan entry (new conversation thread)

**Example entry:**
```json
{
  "type": "user",
  "parentUuid": null,
  "sessionId": "d0b49a73-...",
  "slug": "replicated-meandering-storm",
  "planContent": "# Plan Title\n\n## Section...",
  "message": {
    "role": "user",
    "content": "Implement the following plan:\n\n# Plan Title\n\n## Section...\n\nIf you need specific details from before exiting plan mode... read the full transcript at: /path/to/ce443fa8-....jsonl"
  }
}
```

#### Change 3: `permissionMode` field

Planning sessions have `permissionMode: "plan"` on the initial user message. This indicates the session was started in plan mode. Implementation sessions created via "accept and clear context" do NOT have this field.

#### Change 4: Session chains ("Accept and clear context")

"Accept and clear context" now creates a chain of separate sessions:
```
ce443fa8 (planning) → d0b49a73 (implementation) → 6ac21770 (further work)
```

All sessions in the chain share the same `slug`. Each implementation session's first `message.content` includes a file path to its source (planning) session JSONL. The planning conversation (thinking, exploration, tool calls) is NOT carried over — only the final plan text.

**Implication for session-share:** The original user prompt that motivated the plan lives in the source session, not the implementation session. To show this context, the bundler includes the source session JSONL in the tarball as `source-session.jsonl`, and the converter extracts the first user prompt from it.

### Pre-January 2026 — Original Format

**Plans:** `ExitPlanMode` tool_use with `input.plan` containing the plan text. Result text indicates approval/rejection status. See "Plan Handling" section above.

**Todos:** `TodoWrite` tool_use with `input.todos` array containing `{ content, status }` objects.

**"Accept and clear context":** Stayed within the same session. `ExitPlanMode` result says "rejected/doesn't want to proceed", then an "Implement the following plan:" user message follows in the same JSONL file.
