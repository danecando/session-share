import type { ToolOutput } from "./session-schema";
import type { JsonValue } from "./types";
import type { PrerenderedEntry } from "./prerender-entries";

export const VERBOSE_ONLY_TYPES = new Set(["thinking", "todo_list"]);

export function isVerboseOnlyEntry(entry: PrerenderedEntry): boolean {
  return VERBOSE_ONLY_TYPES.has(entry.type);
}

export const toDisplayPath = (value?: string, cwd?: string): string => {
  if (!value) return "";
  if (cwd && value.startsWith(cwd)) {
    const remainder = value.slice(cwd.length);
    if (!remainder) return "~";
    return remainder.startsWith("/") ? `~${remainder}` : `~/${remainder}`;
  }
  return value.replace(/^\/Users\/[^/]+/, "~");
};

export const toolOutputToText = (output?: ToolOutput): string => {
  if (!output) return "";
  if (output.type === "text") return output.text;
  if (output.type === "json") return JSON.stringify(output.data, null, 2);
  // error type
  const message = output.message;
  const data = output.data ? `\n${JSON.stringify(output.data, null, 2)}` : "";
  return `${message}${data}`;
};

export const joinContentText = (content: Array<string>): string => content.filter(Boolean).join("\n");

export const asObjectInput = (input: JsonValue | undefined): Record<string, JsonValue> | undefined => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  return input as Record<string, JsonValue>;
};

/**
 * Compute a GitHub file URL from a file path and session metadata.
 * Expects repo to be a clean GitHub HTTPS URL (https://github.com/owner/repo).
 */
export function getGithubFileUrl(filePath: string, repo?: string, branch?: string, cwd?: string): string | undefined {
  if (!repo?.startsWith("https://github.com/")) return undefined;

  const branchName = branch || "main";

  // Get relative path from cwd
  let relativePath = filePath;
  if (cwd && filePath.startsWith(cwd)) {
    relativePath = filePath.slice(cwd.length);
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.slice(1);
    }
  }

  return `${repo}/blob/${branchName}/${relativePath}`;
}

/**
 * Returns the GitHub repo URL if valid, undefined otherwise.
 * Expects repo to be a clean GitHub HTTPS URL (https://github.com/owner/repo).
 */
export function getGithubRepoUrl(repo?: string): string | undefined {
  if (!repo?.startsWith("https://github.com/")) return undefined;
  return repo;
}
