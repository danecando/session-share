# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Session Share is a Claude Code plugin + web application that lets users share their Claude Code sessions via shareable URLs. The system has two main parts:

1. **Plugin** (`plugin/`) - A Claude Code plugin that packages the current session transcript into a tarball and uploads it to the web service
2. **Web** (root directory) - A TanStack Start application deployed to Cloudflare Workers that stores sessions in R2 and renders them

## Commands

```bash
pnpm dev                 # Start dev server on port 8080
pnpm build               # Build for production (Cloudflare Workers)
pnpm deploy              # Build and deploy to Cloudflare
pnpm test                # Run vitest tests
pnpm test <pattern>      # Run single test file (e.g., pnpm test cc-tarball)
pnpm lint                # Run eslint
pnpm check-types         # Check types
pnpm generate-types      # Generate Cloudflare Worker types from wrangler.jsonc
pnpm format              # Run prettier on entire repo
```

### Adding UI components

```bash
pnpm dlx shadcn@latest add <component>   # e.g., button, tabs
```

Use the shadcn mcp for documentation and more details including registries, theming, and more.

## Architecture

### Data Flow

1. `/share` command (plugin) finds the active session JSONL in `~/.claude/projects/*/`
2. Shell script packages transcript + images into a gzipped tarball
3. Tarball POSTed to `/api/sessions` endpoint
4. Server extracts tarball, parses JSONL via `cc-converter.ts`, stores in R2
5. Viewer at `/$id` fetches and renders the session

### Session Schema

Two schema layers exist:

- **cc-schema.ts** - Types for Claude Code's raw JSONL format (CCLogEntry, CCContentPart)
- **session-schema.ts** - Normalized internal format with entry types: `message`, `tool_call`, `write_file`, `edit_file`, `todo_list`, `task`, `plan`, `questionnaire`, `summary`, `thinking`

The `cc-converter.ts` transforms the raw JSONL into the session schema, handling deduplication, filtering share-related entries, and extracting metadata.

### Claude Code Session Files

Claude Code stores session data in `~/.claude/projects/`. Each project has a hashed directory name containing:

```
~/.claude/projects/<project-hash>/
├── sessions/
│   └── <session-id>.jsonl    # Session transcript (one JSON object per line)
├── images/
│   └── <image-id>.png        # Screenshots and images referenced in session
└── ...
```

- **Project hash**: Derived from the absolute path of the project directory
- **Session JSONL**: Contains `CCLogEntry` objects (see `src/lib/cc-schema.ts`)
- **Images**: Referenced by content parts with `type: "image"` and a `source.url` starting with `file://`

### Key Files

- `plugin/scripts/share-session.sh` - Session packaging and upload
- `src/lib/cc-converter.ts` - JSONL to session schema parser (most complex file)
- `src/lib/cc-tarball.ts` - Gzip/tar extraction
- `src/routes/api/sessions.ts` - Upload endpoint
- `src/routes/$id.tsx` - Session viewer/renderer

### Infrastructure

- Cloudflare Workers (via TanStack Start)
- R2 bucket `session-share-sessions` for storage
- Sentry for error tracking
- Fathom for analytics

## Workflow

- **Don't build after every change.** Only run verification after editing actual source code (`.ts`, `.tsx` files in `src/`).
- **Use `pnpm check-types && pnpm lint`** for verification, not `pnpm build`. Build is slow and only needed for deployment.
- Skip verification entirely for non-source changes (markdown, config, tests).

## Environment Variables

### Testing the Plugin Locally

Set the API endpoint for local development:

```bash
export CC_SHARE_SESSION_API=http://localhost:8080
```
