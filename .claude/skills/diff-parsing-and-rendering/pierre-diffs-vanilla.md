# Vanilla JS API
Import vanilla JavaScript classes, components, and methods from @pierre/diffs.

## Components
The Vanilla JS API exposes two core components: FileDiff (compare two file versions or render a pre-parsed FileDiffMetadata) and File (render a single code file without diff). Typically you'll want to interface with these as they'll handle all the complicated aspects of syntax highlighting, theming, and full interactivity for you.

```ts
import { FileDiff, type FileContents } from '@pierre/diffs';

// Create the instance with options
const instance = new FileDiff({
  theme: { dark: 'pierre-dark', light: 'pierre-light' },
  diffStyle: 'split',
});

// Define your files (keep references stable to avoid re-renders)
const oldFile: FileContents = {
  name: 'example.ts',
  contents: 'console.log("Hello world")',
};

const newFile: FileContents = {
  name: 'example.ts',
  contents: 'console.warn("Updated message")',
};

// Render the diff into a container
instance.render({
  oldFile,
  newFile,
  containerWrapper: document.getElementById('diff-container'),
});

// Update options later if needed (full replacement, not merge)
instance.setOptions({ ...instance.options, diffStyle: 'unified' });
instance.rerender(); // Must call rerender() after updating options

// Clean up when done
instance.cleanUp();
```

## Props
Both FileDiff and File accept an options object in their constructor. The File component has similar options, but excludes diff-specific settings and uses LineAnnotation instead of DiffLineAnnotation (no side property).

```ts
import { FileDiff } from '@pierre/diffs';

// All available options for the FileDiff class
const instance = new FileDiff({

  // -------------------------------------------------------------
  // THEMING
  // -------------------------------------------------------------

  // Theme for syntax highlighting. Can be a single theme name or an
  // object with 'dark' and 'light' keys for automatic switching.
  // Built-in options: 'pierre-dark', 'pierre-light', or any Shiki theme.
  // See: https://shiki.style/themes
  theme: { dark: 'pierre-dark', light: 'pierre-light' },

  // When using dark/light theme object, this controls which is used:
  // 'system' (default) - follows OS preference
  // 'dark' or 'light' - forces specific theme
  themeType: 'system',

  // -------------------------------------------------------------
  // DIFF DISPLAY
  // -------------------------------------------------------------

  // 'split' (default) - side-by-side view
  // 'unified' - single column view
  diffStyle: 'split',

  // Line change indicators:
  // 'bars' (default) - colored bars on left edge
  // 'classic' - '+' and '-' characters
  // 'none' - no indicators
  diffIndicators: 'bars',

  // Show colored backgrounds on changed lines (default: true)
  disableBackground: false,

  // -------------------------------------------------------------
  // HUNK SEPARATORS
  // -------------------------------------------------------------

  // What to show between diff hunks:
  // 'line-info' (default) - shows collapsed line count, clickable to expand
  // 'metadata' - shows patch format like '@@ -60,6 +60,22 @@'
  // 'simple' - subtle bar separator
  // Or pass a function for custom rendering (see Hunk Separators section)
  hunkSeparators: 'line-info',

  // Force unchanged context to always render (default: false)
  // Requires oldFile/newFile API or FileDiffMetadata with newLines
  expandUnchanged: false,

  // Lines revealed per click when expanding collapsed regions
  expansionLineCount: 100,

  // -------------------------------------------------------------
  // INLINE CHANGE HIGHLIGHTING
  // -------------------------------------------------------------

  // Highlight changed portions within modified lines:
  // 'word-alt' (default) - word boundaries, minimizes single-char gaps
  // 'word' - word boundaries
  // 'char' - character-level granularity
  // 'none' - disable inline highlighting
  lineDiffType: 'word-alt',

  // Skip inline diff for lines exceeding this length
  maxLineDiffLength: 1000,

  // -------------------------------------------------------------
  // LAYOUT & DISPLAY
  // -------------------------------------------------------------

  // Show line numbers (default: true)
  disableLineNumbers: false,

  // Long line handling: 'scroll' (default) or 'wrap'
  overflow: 'scroll',

  // Hide the file header with filename and stats
  disableFileHeader: false,

  // Skip syntax highlighting for lines exceeding this length
  tokenizeMaxLineLength: 1000,

  // -------------------------------------------------------------
  // LINE SELECTION
  // -------------------------------------------------------------

  // Enable click-to-select on line numbers
  enableLineSelection: false,

  // Callbacks for selection events
  onLineSelected(range) {
    // Fires continuously during drag
  },
  onLineSelectionStart(range) {
    // Fires on mouse down
  },
  onLineSelectionEnd(range) {
    // Fires on mouse up - good for saving selection
  },

  // -------------------------------------------------------------
  // MOUSE EVENTS
  // -------------------------------------------------------------

  // Must be true to enable renderHoverUtility
  enableHoverUtility: false,

  // Fires when clicking anywhere on a line
  onLineClick({ lineNumber, side, event }) {},

  // Fires when clicking anywhere in the line number column
  onLineNumberClick({ lineNumber, side, event }) {},

  // Fires when mouse enters a line
  onLineEnter({ lineNumber, side }) {},

  // Fires when mouse leaves a line
  onLineLeave({ lineNumber, side }) {},

  // -------------------------------------------------------------
  // RENDER CALLBACKS
  // -------------------------------------------------------------

  // Render custom content in the file header (after +/- stats)
  renderHeaderMetadata({ oldFile, newFile, fileDiff }) {
    const span = document.createElement('span');
    span.textContent = fileDiff?.newName ?? '';
    return span;
  },

  // Render annotations on specific lines
  renderAnnotation(annotation) {
    const element = document.createElement('div');
    element.textContent = annotation.metadata.threadId;
    return element;
  },

  // Render UI in the line number column on hover
  // Requires enableHoverUtility: true
  renderHoverUtility(getHoveredLine) {
    const button = document.createElement('button');
    button.textContent = '+';
    button.addEventListener('click', () => {
      const { lineNumber, side } = getHoveredLine();
      console.log('Clicked line', lineNumber, 'on', side);
    });
    return button;
  },

});

// -------------------------------------------------------------
// INSTANCE METHODS
// -------------------------------------------------------------

// Render the diff
instance.render({
  oldFile: { name: 'file.ts', contents: '...' },
  newFile: { name: 'file.ts', contents: '...' },
  lineAnnotations: [{ side: 'additions', lineNumber: 5, metadata: {} }],
  containerWrapper: document.body,
});

// Update options (full replacement, not merge)
instance.setOptions({ ...instance.options, diffStyle: 'unified' });

// Update line annotations after initial render
instance.setLineAnnotations([
  { side: 'additions', lineNumber: 5, metadata: { threadId: 'abc' } }
]);

// Programmatically control selected lines
instance.setSelectedLines({
  start: 12,
  end: 22,
  side: 'additions',
  endSide: 'deletions',
});

// Force re-render (useful after changing options)
instance.rerender();

// Programmatically expand a collapsed hunk
instance.expandHunk(0, 'down'); // hunkIndex, direction: 'up' | 'down' | 'all'

// Change the active theme type
instance.setThemeType('dark'); // 'dark' | 'light' | 'system'

// Clean up (removes DOM, event listeners, clears state)
instance.cleanUp();
```

## Custom Hunk Separators
If you want to render custom hunk separators that won't scroll with the content, there are a few tricks you will need to employ. See the following code snippet:

```ts
import { FileDiff } from '@pierre/diffs';

// A hunk separator that utilizes the existing grid to have
// a number column and a content column where neither will
// scroll with the code
const instance = new FileDiff({
  hunkSeparators(hunkData: HunkData) {
    const fragment = document.createDocumentFragment();
    const numCol = document.createElement('div');
    numCol.textContent = `${hunkData.lines}`;
    numCol.style.position = 'sticky';
    numCol.style.left = '0';
    numCol.style.backgroundColor = 'var(--diffs-bg)';
    numCol.style.zIndex = '2';
    fragment.appendChild(numCol);
    const contentCol = document.createElement('div');
    contentCol.textContent = 'unmodified lines';
    contentCol.style.position = 'sticky';
    contentCol.style.width = 'var(--diffs-column-content-width)';
    contentCol.style.left = 'var(--diffs-column-number-width)';
    fragment.appendChild(contentCol);
    return fragment;
  },
})

// If you want to create a single column that spans both colums
// and doesn't scroll, you can do something like this:
const instance2 = new FileDiff({
  hunkSeparators(hunkData: HunkData) {
    const wrapper = document.createElement('div');
    wrapper.style.gridColumn = 'span 2';
    const contentCol = document.createElement('div');
    contentCol.textContent = `${hunkData.lines} unmodified lines`;
    contentCol.style.position = 'sticky';
    contentCol.style.width = 'var(--diffs-column-width)';
    contentCol.style.left = '0';
    wrapper.appendChild(contentCol);
    return wrapper;
  },
})

// If you want to create a single column that's aligned with the content
// column and doesn't scroll, you can do something like this:
const instance3 = new FileDiff({
  hunkSeparators(hunkData: HunkData) {
    const wrapper = document.createElement('div');
    wrapper.style.gridColumn = '2 / 3';
    wrapper.textContent = `${hunkData.lines} unmodified lines`;
    wrapper.style.position = 'sticky';
    wrapper.style.width = 'var(--diffs-column-content-width)';
    wrapper.style.left = 'var(--diffs-column-number-width)';
    return wrapper;
  },
})
```

## Renderers
For most use cases, you should use the higher-level components like FileDiff and File (vanilla JS) or the React components (MultiFileDiff, FileDiff, PatchDiff, File). These renderers are low-level building blocks intended for advanced use cases.

These renderer classes handle the low-level work of parsing and rendering code with syntax highlighting. Useful when you need direct access to the rendered output as HAST nodes or HTML strings for custom rendering pipelines.

### DiffHunksRenderer
Takes a FileDiffMetadata data structure and renders out the raw HAST (Hypertext Abstract Syntax Tree) elements for diff hunks. You can generate FileDiffMetadata via parseDiffFromFile or parsePatchFiles utility functions.

```ts
import {
  DiffHunksRenderer,
  type FileDiffMetadata,
  type HunksRenderResult,
  parseDiffFromFile,
} from '@pierre/diffs';

const instance = new DiffHunksRenderer();

// Set options (this is a full replacement, not a merge)
instance.setOptions({ theme: 'github-dark', diffStyle: 'split' });

// Parse diff content from 2 versions of a file
const fileDiff: FileDiffMetadata = parseDiffFromFile(
  { name: 'file.ts', contents: 'const greeting = "Hello";' },
  { name: 'file.ts', contents: 'const greeting = "Hello, World!";' }
);

// Render hunks (async - waits for highlighter initialization)
const result: HunksRenderResult = await instance.asyncRender(fileDiff);

// result contains hast nodes for each column based on diffStyle:
// - 'split' mode: additionsAST and deletionsAST (side-by-side)
// - 'unified' mode: unifiedAST only (single column)
// - preNode: the wrapper <pre> element as a hast node
// - headerNode: the file header element
// - hunkData: metadata about each hunk (for custom separators)

// Render to a complete HTML string (includes <pre> and <code> wrappers)
const fullHTML: string = instance.renderFullHTML(result);

// Or render just a specific column to HTML
const additionsHTML: string = instance.renderPartialHTML(
  result.additionsAST,
  'additions' // wraps in <code data-additions>
);

// Or render without the <code> wrapper
const rawHTML: string = instance.renderPartialHTML(result.additionsAST);

// Or get the full AST for further transformation
const fullAST = instance.renderFullAST(result);
```

### FileRenderer
Takes a FileContents object (just a filename and contents string) and renders syntax-highlighted code as HAST elements. Useful for rendering single files without any diff context.

```ts
import {
  FileRenderer,
  type FileContents,
  type FileRenderResult,
} from '@pierre/diffs';

const instance = new FileRenderer();

// Set options (this is a full replacement, not a merge)
instance.setOptions({
  theme: 'pierre-dark',
  overflow: 'scroll',
  disableLineNumbers: false,
  disableFileHeader: false,
  // Starting line number (useful for showing snippets)
  startingLineNumber: 1,
  // Skip syntax highlighting for very long lines
  tokenizeMaxLineLength: 1000,
});

const file: FileContents = {
  name: 'example.ts',
  contents: `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}

export { greet };`,
};

// Render file (async - waits for highlighter initialization)
const result: FileRenderResult = await instance.asyncRender(file);

// result contains:
// - codeAST: array of hast ElementContent nodes for each line
// - preAST: the wrapper <pre> element as a hast node
// - headerAST: the file header element (if not disabled)
// - totalLines: number of lines in the file
// - themeStyles: CSS custom properties for theming

// Render to a complete HTML string (includes <pre> wrapper)
const fullHTML: string = instance.renderFullHTML(result);

// Or render just the code lines to HTML
const partialHTML: string = instance.renderPartialHTML(result.codeAST);

// Or get the full AST for further transformation
const fullAST = instance.renderFullAST(result);
```

## Utilities
Import utility functions from @pierre/diffs. These can be used with any framework or rendering approach.

### diffAcceptRejectHunk
Programmatically accept or reject individual hunks in a diff. This is useful for building interactive code review interfaces, AI-assisted coding tools, or any workflow where users need to selectively apply changes.

When you accept a hunk, the new (additions) version is kept and the hunk is converted to context lines. When you reject a hunk, the old (deletions) version is restored. The function returns a new FileDiffMetadata object with all line numbers properly adjusted for subsequent hunks.

```ts
import {
  diffAcceptRejectHunk,
  FileDiff,
  parseDiffFromFile,
  type FileDiffMetadata,
} from '@pierre/diffs';

// Parse a diff from two file versions
let fileDiff: FileDiffMetadata = parseDiffFromFile(
  { name: 'file.ts', contents: 'const x = 1;\nconst y = 2;' },
  { name: 'file.ts', contents: 'const x = 1;\nconst y = 3;\nconst z = 4;' }
);

// Create a FileDiff instance
const instance = new FileDiff({ theme: 'pierre-dark' });

// Render the initial diff showing the changes
instance.render({
  fileDiff,
  containerWrapper: document.getElementById('diff-container')!,
});

// Accept a hunk - keeps the new (additions) version.
// The hunk is converted to context lines (no longer shows as a change).
// Note: If the diff has a cacheKey, it's automatically updated by 
// this function.
fileDiff = diffAcceptRejectHunk(fileDiff, 0, 'accept');

// Or reject a hunk - reverts to the old (deletions) version.
// fileDiff = diffAcceptRejectHunk(fileDiff, 0, 'reject');

// Re-render with the updated fileDiff - the accepted hunk
// now appears as context lines instead of additions/deletions
instance.render({
  fileDiff,
  containerWrapper: document.getElementById('diff-container')!,
});
```

### disposeHighlighter
Dispose the shared Shiki highlighter instance to free memory. Useful when cleaning up resources in single-page applications.

```ts
import { disposeHighlighter } from '@pierre/diffs';

// Dispose the shared highlighter instance to free memory.
// This is useful when you're done rendering diffs and want
// to clean up resources (e.g., in a single-page app when
// navigating away from a diff view).
//
// Note: After calling this, all themes and languages will
// need to be reloaded on the next render.
disposeHighlighter();
```

### getSharedHighlighter
Get direct access to the shared Shiki highlighter instance used internally by all components. Useful for custom highlighting operations.

```ts
import { getSharedHighlighter } from '@pierre/diffs';

// Get the shared Shiki highlighter instance.
// This is the same instance used internally by all FileDiff
// and File components. Useful if you need direct access to
// Shiki for custom highlighting operations.
//
// The highlighter is initialized lazily - themes and languages
// are loaded on demand as you render different files.
const highlighter = await getSharedHighlighter();

// You can use it directly for custom highlighting
const tokens = highlighter.codeToTokens('const x = 1;', {
  lang: 'typescript',
  theme: 'pierre-dark',
});
```

### parseDiffFromFile
Compare two versions of a file and generate a FileDiffMetadata structure. Use this when you have the full contents of both file versions rather than a patch string.

If both oldFile and newFile have a cacheKey, the resulting FileDiffMetadata will automatically receive a combined cache key (format: oldKey:newKey). See Render Cache for more information.

```ts
import {
  parseDiffFromFile,
  type FileDiffMetadata,
} from '@pierre/diffs';

// Parse a diff by comparing two versions of a file.
// This is useful when you have the full file contents
// rather than a patch/diff string.
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
}

export { greet };`,
};

const fileDiff: FileDiffMetadata = parseDiffFromFile(oldFile, newFile);

// fileDiff contains:
// - name: the filename
// - hunks: array of diff hunks with line information
// - oldLines/newLines: full file contents split by line
// - Various line counts for rendering
```

### parsePatchFiles
Parse unified diff / patch file content into structured data. Handles both single patches and multi-commit patch files (like those from GitHub pull request .patch URLs). An optional second parameter cacheKeyPrefix can be provided to generate cache keys for each file in the patch (format: prefix-patchIndex-fileIndex), enabling caching of rendered diff results in the worker pool.

```ts
import {
  parsePatchFiles,
  type ParsedPatch,
} from '@pierre/diffs';

// Parse unified diff / patch file content.
// Handles both single patches and multi-commit patch files
// (like those from GitHub PR .patch URLs).
const patchContent = `diff --git a/example.ts b/example.ts
index abc123..def456 100644
--- a/example.ts
+++ b/example.ts
@@ -1,3 +1,4 @@
 function greet(name: string) {
-  console.log("Hello, " + name);
+  console.log(\`Hello, \${name}!\`);
 }
+export { greet };
`;

// Basic usage
const patches: ParsedPatch[] = parsePatchFiles(patchContent);

// With cache key prefix for worker pool caching
// Each file gets a key like 'my-pr-123-0-0', 'my-pr-123-0-1', etc.
// IMPORTANT: The prefix must change when patchContent changes!
// Use a stable identifier like a commit SHA or content hash.
const cachedPatches = parsePatchFiles(patchContent, 'my-pr-123-abc456');

// Each ParsedPatch contains:
// - message: commit message (if present)
// - files: array of FileDiffMetadata for each file in the patch

for (const patch of patches) {
  console.log('Commit:', patch.message);
  for (const file of patch.files) {
    console.log('  File:', file.name);
    console.log('  Hunks:', file.hunks.length);
  }
}
```

### preloadHighlighter
Preload specific themes and languages before rendering to ensure instant highlighting with no async loading delay.

```ts
import { preloadHighlighter } from '@pierre/diffs';

// Preload specific themes and languages before rendering.
// This ensures the highlighter is ready with the assets you
// need, avoiding any flash of unstyled content on first render.
//
// By default, themes and languages are loaded on demand,
// but preloading is useful when you know which languages
// you'll be rendering ahead of time.
await preloadHighlighter({
  // Themes to preload
  themes: ['pierre-dark', 'pierre-light', 'github-dark'],
  // Languages to preload
  langs: ['typescript', 'javascript', 'python', 'rust', 'go'],
});

// After preloading, rendering diffs in these languages
// will be instant with no async loading delay.
```

### registerCustomTheme
Register a custom Shiki theme for use with any component. The theme name you register must match the name field inside your theme JSON file.

```ts
import { registerCustomTheme } from '@pierre/diffs';

// Register a custom Shiki theme before using it.
// The theme name you register must match the 'name' field
// inside your theme JSON file.

// Option 1: Dynamic import (recommended for code splitting)
registerCustomTheme('my-custom-theme', () => import('./my-theme.json'));

// Option 2: Inline theme object
registerCustomTheme('inline-theme', async () => ({
  name: 'inline-theme',
  type: 'dark',
  colors: {
    'editor.background': '#1a1a2e',
    'editor.foreground': '#eaeaea',
    // ... other VS Code theme colors
  },
  tokenColors: [
    {
      scope: ['comment'],
      settings: { foreground: '#6a6a8a' },
    },
    // ... other token rules
  ],
}));

// Once registered, use the theme name in your components:
// <FileDiff options={{ theme: 'my-custom-theme' }} ... />
```

### setLanguageOverride
Override the syntax highlighting language for a FileContents or FileDiffMetadata object. This is useful when the filename doesn't have an extension or doesn't match the actual language.

```ts
import {
  setLanguageOverride,
  parsePatchFiles,
  type FileContents,
  type FileDiffMetadata,
} from '@pierre/diffs';

// setLanguageOverride creates a new FileContents or FileDiffMetadata
// with the language explicitly set. This is useful when:
// - The filename doesn't have an extension
// - The extension doesn't match the actual language
// - You're parsing patches and need to override the detected language

// Example 1: Override language on a FileContents
const file: FileContents = {
  name: 'Dockerfile',  // No extension, would default to 'text'
  contents: 'FROM node:20\nRUN npm install',
};
const dockerFile = setLanguageOverride(file, 'dockerfile');

// Example 2: Override language on a FileDiffMetadata
const patches = parsePatchFiles(patchString);
const diff: FileDiffMetadata = patches[0].files[0];
const typescriptDiff = setLanguageOverride(diff, 'typescript');

// The function returns a new object with the lang property set,
// leaving the original unchanged (immutable operation).
```

## Styling
Diff and code components are rendered using shadow DOM APIs, allowing styles to be well-isolated from your page's existing CSS. However, it also means you may have to utilize some custom CSS variables to override default styles. These can be done in your global CSS, as style props on parent components, or on the FileDiff component directly.

```css
:root {
  /* Available Custom CSS Variables. Most should be self explanatory */
  /* Sets code font, very important */
  --diffs-font-family: 'Berkeley Mono', monospace;
  --diffs-font-size: 14px;
  --diffs-line-height: 1.5;
  /* Controls tab character size */
  --diffs-tab-size: 2;
  /* Font used in header and separator components,
   * typically not a monospace font, but it's your call */
  --diffs-header-font-family: Helvetica;
  /* Override or customize any 'font-feature-settings'
   * for your code font */
  --diffs-font-features: normal;
  /* Override the minimum width for the number column. By default
   * it should take into account the number of digits required
   * based on the lines in the file itself, but you can manually
   * override if desired.  Generally we recommend using ch units
   * because they work well with monospaced fonts */
  --diffs-min-number-column-width: 3ch;

  /* By default we try to inherit the deletion/addition/modified
   * colors from the existing Shiki theme, however if you'd like
   * to override them, you can do so via these css variables: */
  --diffs-deletion-color-override: orange;
  --diffs-addition-color-override: yellow;
  --diffs-modified-color-override: purple;

  /* Line selection colors - customize the highlighting when users
   * select lines via enableLineSelection. These support light-dark()
   * for automatic theme adaptation. */
  --diffs-selection-color-override: rgb(37, 99, 235);
  --diffs-bg-selection-override: rgba(147, 197, 253, 0.28);
  --diffs-bg-selection-number-override: rgba(96, 165, 250, 0.55);
  --diffs-bg-selection-background-override: rgba(96, 165, 250, 0.2);
  --diffs-bg-selection-number-background-override: rgba(59, 130, 246, 0.4);

  /* Some basic variables for tweaking the layouts of some of the built in
   * components */
  --diffs-gap-inline: 8px;
  --diffs-gap-block: 8px;
}
```

```tsx
<FileDiff
  style={{
    '--diffs-font-family': 'JetBrains Mono, monospace',
    '--diffs-font-size': '13px'
  } as React.CSSProperties}
  // ... other props
/>
```

### Advanced: Unsafe CSS
For advanced customization, you can inject arbitrary CSS into the shadow DOM using the unsafeCSS option. This CSS will be wrapped in an @layer unsafe block, giving it the highest priority in the cascade. Use this sparingly and with caution, as it bypasses the normal style isolation.

We also recommend that any CSS you apply uses simple, direct selectors targeting the existing data attributes. Avoid structural selectors like :first-child, :last-child, :nth-child(), sibling combinators (+ or ~), deeply nested descendant selectors, or bare tag selectors--these are susceptible to breaking in future versions or in edge cases that may be difficult to anticipate.

We cannot currently guarantee backwards compatibility for this feature across any future changes to the library, even in patch versions. Please reach out so that we can discuss a more permanent solution for modifying styles.

```tsx
<FileDiff
  options={{
    unsafeCSS: /* css */ `
[data-line-index='0'] {
  border-top: 1px solid var(--diffs-bg-context);
}

[data-line] {
  border-bottom: 1px solid var(--diffs-bg-context);
}

[data-column-number] {
  border-right: 1px solid var(--diffs-bg-context);
}`
  }}
  // ... other props
/>
```
