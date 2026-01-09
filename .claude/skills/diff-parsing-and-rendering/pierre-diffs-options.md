# Shared Props and Options

The three diff components (MultiFileDiff, PatchDiff, and FileDiff) share a common set of props for configuration, annotations, and styling. The File component has similar props, but uses LineAnnotation instead of DiffLineAnnotation (no side property).

```tsx
// These options are shared by MultiFileDiff, PatchDiff, and FileDiff.
// Pass them via the `options` prop.
import { MultiFileDiff } from '@pierre/diffs/react';

<MultiFileDiff
  {...}
  options={{
    theme: { dark: 'pierre-dark', light: 'pierre-light' },
    diffStyle: 'split',
    // ... see below for all available options
  }}
/>

interface DiffOptions {
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
  onLineSelected(range: SelectedLineRange | null) {
    // Fires continuously during drag
  },
  onLineSelectionStart(range: SelectedLineRange | null) {
    // Fires on mouse down
  },
  onLineSelectionEnd(range: SelectedLineRange | null) {
    // Fires on mouse up - good for saving selection
  },

  // -------------------------------------------------------------
  // MOUSE EVENTS
  // -------------------------------------------------------------

  // Must be true to enable renderHoverUtility prop
  enableHoverUtility: false,

  // Callbacks for mouse events on diff lines
  onLineClick({ lineNumber, side, event }) {
    // Fires when clicking anywhere on a line
  },
  onLineNumberClick({ lineNumber, side, event }) {
    // Fires when clicking anywhere in the line number column
  },
  onLineEnter({ lineNumber, side }) {
    // Fires when mouse enters a line
  },
  onLineLeave({ lineNumber, side }) {
    // Fires when mouse leaves a line
  },
}
```
