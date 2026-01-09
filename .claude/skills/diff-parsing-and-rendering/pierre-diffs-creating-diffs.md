# Creating Diffs
There are two ways to create a FileDiffMetadata.

## From Two Files
Use parseDiffFromFile when you have both file versions. This approach includes the full file contents, enabling the "expand unchanged" feature.

```ts
import {
  parseDiffFromFile,
  type FileContents,
  type FileDiffMetadata,
} from '@pierre/diffs';

// Define your two file versions
const oldFile: FileContents = {
  name: 'greeting.ts',
  contents: 'export const greeting = "Hello";',
  cacheKey: 'greeting-old', // Optional: enables AST caching
};

const newFile: FileContents = {
  name: 'greeting.ts',
  contents: 'export const greeting = "Hello, World!";',
  cacheKey: 'greeting-new',
};

// Generate the diff metadata
const diff: FileDiffMetadata = parseDiffFromFile(oldFile, newFile);

// The resulting diff includes oldLines and newLines,
// which enables "expand unchanged" functionality in the UI.
// If both files have cacheKey, the diff will have a combined
// cacheKey of "greeting-old:greeting-new" for AST caching.
```

## From a Patch String
Use parsePatchFiles when you have a unified diff or patch file. This is useful when working with git output or patch files from APIs.

```ts
import {
  parsePatchFiles,
  type ParsedPatch,
  type FileDiffMetadata,
} from '@pierre/diffs';

// Parse a unified diff / patch string
const patchString = `--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,3 @@
 const x = 1;
-const y = 2;
+const y = 3;
 const z = 4;`;

// Returns an array of ParsedPatch objects (one per commit in the patch)
// Pass an optional cacheKeyPrefix to enable AST caching with Worker Pool
const patches: ParsedPatch[] = parsePatchFiles(patchString, 'my-patch-key');

// Each ParsedPatch contains an array of FileDiffMetadata
const files: FileDiffMetadata[] = patches[0].files;

// With cacheKeyPrefix, each diff gets a cacheKey like "my-patch-0",
// "my-patch-1", etc.
// This enables AST caching in Worker Pool for parsed patches.

// Note: Diffs from patch files don't include oldLines/newLines,
// so "expand unchanged" won't work unless you add them manually
```

Tip: If you need to change the language after creating a FileContents or FileDiffMetadata, use the setLanguageOverride utility function.
