# Overview

Diffs is in early active development. APIs are subject to change.

Diffs is a library for rendering code and diffs on the web. This includes both high-level, easy-to-use components, as well as exposing many of the internals if you want to selectively use specific pieces. We've built syntax highlighting on top of Shiki which provides a lot of great theme and language support.

```diff
main.zig
-1
+1
const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hi you, {s}!\n", .{"world"});
}
const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello there, {s}!\n", .{"zig"});
}
```
We have an opinionated stance in our architecture: browsers are rather efficient at rendering raw HTML. We lean into this by having all the lower level APIs purely rendering strings (the raw HTML) that are then consumed by higher-order components and utilities. This gives us great performance and flexibility to support popular libraries like React as well as provide great tools if you want to stick to vanilla JavaScript and HTML. The higher-order components render all this out into Shadow DOM and CSS grid layout.

Generally speaking, you're probably going to want to use the higher level components since they provide an easy-to-use API that you can get started with rather quickly. We currently only have components for vanilla JavaScript and React, but will add more if there's demand.

For this overview, we'll talk about the vanilla JavaScript components for now but there are React equivalents for all of these.

## Rendering Diffs
Our goal with visualizing diffs was to provide some flexible and approachable APIs for how you may want to render diffs. For this, we provide a component called FileDiff.

There are two ways to render diffs with FileDiff:

- Provide two versions of a file or code snippet to compare.
- Consume a patch file.
You can see examples of these approaches below, in both JavaScript and React.

```ts
import { type FileContents, FileDiff } from '@pierre/diffs';

// Store file objects in variables rather than inlining them.
// FileDiff uses reference equality to detect changes and skip
// unnecessary re-renders, so keep these references stable.
const oldFile: FileContents = {
  name: 'main.zig',
  contents: `const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hi you, {s}!\\\\n", .{"world"});
}
`,
};

const newFile: FileContents = {
  name: 'main.zig',
  contents: `const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello there, {s}!\\\\n", .{"zig"});
}
`,
};

// We automatically detect the language based on the filename
// You can also provide a lang property when instantiating FileDiff.
const fileDiffInstance = new FileDiff({ theme: 'pierre-dark' });

// render() is synchronous. Syntax highlighting happens async in the
// background and the diff updates automatically when complete.
fileDiffInstance.render({
  oldFile,
  newFile,
  // where to render the diff into
  containerWrapper: document.body,
});
```

## Installation
Diffs is published as an npm package. Install Diffs with the package manager of your choice:

```bash
npm install @pierre/diffs
```

## Package Exports
The package provides several entry points for different use cases:

| Package | Description |
| --- | --- |
| `@pierre/diffs` | Vanilla JS components and utility functions for parsing and rendering diffs |
| `@pierre/diffs/react` | React components for rendering diffs with full interactivity |
| `@pierre/diffs/ssr` | Server-side rendering utilities for pre-rendering diffs with syntax highlighting |
| `@pierre/diffs/worker` | Worker pool utilities for offloading syntax highlighting to background threads |
