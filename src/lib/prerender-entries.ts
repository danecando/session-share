import { preloadFileDiff } from "@pierre/diffs/ssr";
import { renderMarkdown } from "./markdown";
import type { EditFileEntry, MessageEntry, PlanEntry, SessionEntry, WriteFileEntry } from "./session-schema";

interface PrerenderedHtml {
  prerenderedHtml?: string;
}

export type PrerenderedMessageEntry = MessageEntry & PrerenderedHtml;
export type PrerenderedPlanEntry = PlanEntry & PrerenderedHtml;
export type PrerenderedWriteFileEntry = WriteFileEntry & PrerenderedHtml;
export type PrerenderedEditFileEntry = EditFileEntry & PrerenderedHtml;

export type PrerenderedEntry =
  | PrerenderedMessageEntry
  | PrerenderedPlanEntry
  | PrerenderedWriteFileEntry
  | PrerenderedEditFileEntry
  | Exclude<SessionEntry, MessageEntry | PlanEntry | WriteFileEntry | EditFileEntry>;

export async function prerenderEntries(entries: Array<SessionEntry>): Promise<Array<PrerenderedEntry>> {
  const entryPromises = entries.map(async (entry) => {
    // Render file diffs for write and edit entries.
    if ((entry.type === "write_file" || entry.type === "edit_file") && entry.diffData) {
      const result = await preloadFileDiff({
        fileDiff: entry.diffData,
        options: {
          theme: "github-dark-high-contrast",
          diffStyle: "unified",
          disableFileHeader: true,
          disableBackground: entry.type === "write_file",
        },
      });
      return { ...entry, prerenderedHtml: result.prerenderedHTML } satisfies
        | PrerenderedWriteFileEntry
        | PrerenderedEditFileEntry;
    }

    // Render markdown for assistant messages.
    if (entry.type === "message" && entry.role === "assistant" && entry.content.length > 0) {
      const content = entry.content.join("\n\n");
      const result = await renderMarkdown(content);
      return { ...entry, prerenderedHtml: result.markup } satisfies PrerenderedMessageEntry;
    }

    // Render markdown for plans.
    if (entry.type === "plan" && entry.content) {
      const result = await renderMarkdown(entry.content);
      return { ...entry, prerenderedHtml: result.markup } satisfies PrerenderedPlanEntry;
    }

    return { ...entry } satisfies PrerenderedEntry;
  });

  return await Promise.all(entryPromises);
}
