# Core Types
Before diving into the components, it's helpful to understand the two core data structures used throughout the library.

## FileContents

FileContents represents a single file. Use it when rendering a file with the `File` component, or pass two of them as `oldFile` and `newFile` to diff components.

```ts
import type { FileContents } from '@pierre/diffs';

// FileContents represents a single file
interface FileContents {
  // The filename (used for display and language detection)
  name: string;

  // The file's text content
  contents: string;

  // Optional: Override the detected language for syntax highlighting
  // See: https://shiki.style/languages
  lang?: SupportedLanguages;

  // Optional: Cache key for AST caching in Worker Pool.
  // When provided, rendered AST results are cached and reused.
  // IMPORTANT: The key must change whenever the content, filename
  // or lang changes!
  cacheKey?: string;
}

// Example usage
const file: FileContents = {
  name: 'example.tsx',
  contents: 'export function Hello() { return <div>Hello</div>; }',
  cacheKey: 'example-file-v1', // Must change if contents change
};

// With explicit language override
const jsonFile: FileContents = {
  name: 'config', // No extension, so we specify lang
  contents: '{ "key": "value" }',
  lang: 'json',
  cacheKey: 'config-file',
};
```

## FileDiffMetadata
FileDiffMetadata represents the differences between two files. It contains the hunks (changed regions), line counts, and optionally the full file contents for expansion.

Tip: You can generate FileDiffMetadata using parseDiffFromFile (from two file versions) or parsePatchFiles (from a patch string).

```ts
import type { FileDiffMetadata, Hunk } from '@pierre/diffs';

// FileDiffMetadata represents the differences between two files
interface FileDiffMetadata {
  // Current filename
  name: string;

  // Previous filename (for renames)
  prevName: string | undefined;

  // Optional: Override language for syntax highlighting
  lang?: SupportedLanguages;

  // Type of change: 'change' | 'rename-pure' | 'rename-changed' | 'new' | 'deleted'
  type: ChangeTypes;

  // Array of diff hunks containing the actual changes
  hunks: Hunk[];

  // Line counts for split and unified views
  splitLineCount: number;
  unifiedLineCount: number;

  // Full file contents (when generated using parseDiffFromFile,
  // enables expansion around hunks)
  oldLines?: string[];
  newLines?: string[];

  // Optional: Cache key for AST caching in Worker Pool.
  // When provided, rendered diff AST results are cached and reused.
  // IMPORTANT: The key must change whenever the diff changes!
  cacheKey?: string;
}

// Hunk represents a single changed region in the diff
// Think of it like the sections defined by the '@@' lines in patches
interface Hunk {
  // Addition/deletion counts, parsed out from patch data
  additionCount: number;
  additionStart: number;
  additionLines: number;
  deletionCount: number;
  deletionStart: number;
  deletionLines: number;

  // The actual content of the hunk (context and changes)
  hunkContent: (ContextContent | ChangeContent)[];

  // Optional context shown in hunk headers (e.g., function name)
  hunkContext: string | undefined;

  // Line position information, mostly used internally for 
  // rendering optimizations
  splitLineStart: number;
  splitLineCount: number;
  unifiedLineStart: number;
  unifiedLineCount: number;
}

// ContextContent represents unchanged lines surrounding changes
interface ContextContent {
  type: 'context';
  lines: string[];
  // 'true' if the file does not have a blank newline at the end
  noEOFCR: boolean;
}

// ChangeContent represents a group of additions and deletions
interface ChangeContent {
  type: 'change';
  deletions: string[];
  additions: string[];
  // 'true' if the file does not have a blank newline at the end
  noEOFCRDeletions: boolean;
  noEOFCRAdditions: boolean;
}
```
