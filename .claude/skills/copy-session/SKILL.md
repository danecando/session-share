---
name: copy-session
description: Copy a session between production and local R2 instances using wrangler.
allowed-tools: Bash(*)
---

# Copy Session

Copy sessions between production and local R2 storage.

## Usage

Copy from production to local:
```bash
bash .claude/skills/copy-session/scripts/copy-session.sh <session_id> [--to-prod]
```

- Default: copies from production → local
- `--to-prod`: copies from local → production

## Examples

```bash
# Copy production session to local for testing
bash .claude/skills/copy-session/scripts/copy-session.sh 71XmYE4uKw

# Copy local session to production
bash .claude/skills/copy-session/scripts/copy-session.sh myLocalId --to-prod
```
