# SSR
Import SSR utilities from @pierre/diffs/ssr.

The SSR API allows you to pre-render file diffs on the server with syntax highlighting, then hydrate them on the client for full interactivity.

## Usage
Each preload function returns an object containing the original inputs plus a prerenderedHTML string. This object can be spread directly into the corresponding React component for automatic hydration.

Inputs used for pre-rendering must exactly match what's rendered in the client component. We recommend spreading the entire result object into your File or Diff component to ensure the client receives the same inputs that were used to generate the pre-rendered HTML.

### Server Component
```tsx
// app/diff/page.tsx (Server Component)
import { preloadMultiFileDiff } from '@pierre/diffs/ssr';
import { DiffViewer } from './DiffViewer';

const oldFile = {
  name: 'example.ts',
  contents: `function greet(name: string) {
  console.log("Hello, " + name);
}`,
};

const newFile = {
  name: 'example.ts',
  contents: `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}`,
};

export default async function DiffPage() {
  const preloaded = await preloadMultiFileDiff({
    oldFile,
    newFile,
    options: { theme: 'pierre-dark', diffStyle: 'split' },
  });

  return <DiffViewer preloaded={preloaded} />;
}
```

### Client Component
```tsx
// app/diff/DiffViewer.tsx (Client Component)
'use client';

import { MultiFileDiff } from '@pierre/diffs/react';
import type { PreloadMultiFileDiffResult } from '@pierre/diffs/ssr';

interface Props {
  preloaded: PreloadMultiFileDiffResult;
}

export function DiffViewer({ preloaded }: Props) {
  // Spread the entire result to ensure inputs match what was pre-rendered
  return <MultiFileDiff {...preloaded} />;
}
```

## Preloaders
We provide several preload functions to handle different input formats. Choose the one that matches your data source.

### preloadFile
Preloads a single file with syntax highlighting (no diff). Use this when you want to render a file without any diff context. Spread into the File component.

```ts
import { preloadFile } from '@pierre/diffs/ssr';

const file = {
  name: 'example.ts',
  contents: 'export function hello() { return "world"; }',
};

const result = await preloadFile({
  file,
  options: { theme: 'pierre-dark' },
});

// Spread result into <File {...result} />
```

### preloadFileDiff
Preloads a diff from a FileDiffMetadata object. Use this when you already have parsed diff metadata (e.g., from parseDiffFromFile or parsePatchFiles). Spread into the FileDiff component.

```ts
import { preloadFileDiff } from '@pierre/diffs/ssr';
import { parseDiffFromFile } from '@pierre/diffs';

const oldFile = { name: 'example.ts', contents: 'const x = 1;' };
const newFile = { name: 'example.ts', contents: 'const x = 2;' };

// First parse the diff to get FileDiffMetadata
const fileDiff = parseDiffFromFile(oldFile, newFile);

// Then preload for SSR
const result = await preloadFileDiff({
  fileDiff,
  options: { theme: 'pierre-dark' },
});

// Spread result into <FileDiff {...result} />
```

### preloadMultiFileDiff
Preloads a diff directly from old and new file contents. This is the simplest option when you have the raw file contents and want to generate a diff. Spread into the MultiFileDiff component.

```ts
import { preloadMultiFileDiff } from '@pierre/diffs/ssr';

const oldFile = { name: 'example.ts', contents: 'const x = 1;' };
const newFile = { name: 'example.ts', contents: 'const x = 2;' };

const result = await preloadMultiFileDiff({
  oldFile,
  newFile,
  options: { theme: 'pierre-dark', diffStyle: 'split' },
});

// Spread result into <MultiFileDiff {...result} />
```

### preloadPatchDiff
Preloads a diff from a unified patch string for a single file. Use this when you have a patch in unified diff format. Spread into the PatchDiff component.

```ts
import { preloadPatchDiff } from '@pierre/diffs/ssr';

const patch = `--- a/example.ts
+++ b/example.ts
@@ -1 +1 @@
-const x = 1;
+const x = 2;`;

const result = await preloadPatchDiff({
  patch,
  options: { theme: 'pierre-dark' },
});

// Spread result into <PatchDiff {...result} />
```

### preloadPatchFile
Preloads multiple diffs from a multi-file patch string. Returns an array of results, one for each file in the patch. Each result can be spread into a FileDiff component.

```ts
import { preloadPatchFile } from '@pierre/diffs/ssr';

// A patch containing multiple file changes
const patch = `diff --git a/foo.ts b/foo.ts
--- a/foo.ts
+++ b/foo.ts
@@ -1 +1 @@
-const a = 1;
+const a = 2;
diff --git a/bar.ts b/bar.ts
--- a/bar.ts
+++ b/bar.ts
@@ -1 +1 @@
-const b = 1;
+const b = 2;`;

const results = await preloadPatchFile({
  patch,
  options: { theme: 'pierre-dark' },
});

// Spread each result into <FileDiff {...results[i]} />
```
