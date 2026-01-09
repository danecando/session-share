# React API
Import React components from @pierre/diffs/react.

We offer a variety of components to render diffs and files. Many of them share similar types of props, which you can find documented in Shared Props.

## Components
The React API exposes four main components:

- MultiFileDiff compares two file versions.
- PatchDiff renders from a patch string.
- FileDiff renders a pre-parsed FileDiffMetadata.
- File renders a single code file without a diff.

```tsx
import { type FileContents, MultiFileDiff } from '@pierre/diffs/react';

// MultiFileDiff compares two file versions directly.
// Use this when you have the old and new file contents.

// Keep file objects stable (useState/useMemo) to avoid re-renders.
// The component uses reference equality for change detection.
const oldFile: FileContents = {
  name: 'example.ts',
  contents: 'console.log("Hello world")',
};

const newFile: FileContents = {
  name: 'example.ts',
  contents: 'console.warn("Updated message")',
};

export function MyDiff() {
  return (
    <MultiFileDiff
      // Required: the two file versions to compare
      oldFile={oldFile}
      newFile={newFile}

      options={{
        theme: { dark: 'pierre-dark', light: 'pierre-light' },
        diffStyle: 'split',
      }}

      // See shared props for all available props:
      // lineAnnotations, renderAnnotation, renderHeaderMetadata,
      // renderHoverUtility, selectedLines, className, style, etc.
    />
  );
}
```

For shared props and `DiffOptions`, see `pierre-diffs-options.md`.
