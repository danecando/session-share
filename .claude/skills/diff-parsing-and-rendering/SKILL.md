---
name: diff-parsing-and-rendering
description: Reference for the @pierre/diffs code/file diff rendering library (React, vanilla JS, SSR, worker pool, caching). Use when you need API usage, setup, or configuration details for parsing diffs, rendering files, or tuning options.
---

# Pierre Diffs Docs

Use this skill to navigate the Pierre Diffs documentation and pull exact API patterns, types, and options.

## How to use

Open [pierre-diffs-docs.md](pierre-diffs-docs.md) to pick the right file, then jump to the relevant section using search. Prefer targeted searches (e.g., "MultiFileDiff", "parsePatchFiles", "WorkerPool", "preload").

## Section map

- **Overview + installation**: [pierre-diffs-overview.md](pierre-diffs-overview.md)
- **Core types**: [pierre-diffs-core-types.md](pierre-diffs-core-types.md)
- **Creating diffs**: [pierre-diffs-creating-diffs.md](pierre-diffs-creating-diffs.md)
- **React API**: [pierre-diffs-react.md](pierre-diffs-react.md)
- **Shared props/options**: [pierre-diffs-options.md](pierre-diffs-options.md)
- **Vanilla JS API + utilities + styling**: [pierre-diffs-vanilla.md](pierre-diffs-vanilla.md)
- **Worker pool + caching + API reference**: [pierre-diffs-worker-pool.md](pierre-diffs-worker-pool.md)
- **Architecture**: [pierre-diffs-architecture.md](pierre-diffs-architecture.md)
- **SSR + preloaders**: [pierre-diffs-ssr.md](pierre-diffs-ssr.md)

## Usage reminders

- Keep `FileContents` and `FileDiffMetadata` objects stable; components use reference equality.
- Use `cacheKey` consistently when enabling worker pool caching; change the key whenever content changes.
- `expandUnchanged` requires `oldLines`/`newLines` (available when using `parseDiffFromFile`).
