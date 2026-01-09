import type { FileDiffMetadata } from "@pierre/diffs";
import type { JsonValue } from "./types";

export interface SessionSchema {
  schemaVersion: string;
  agent?: {
    name?: string;
    version?: string;
  };
  meta: SessionMeta;
  entries: Array<SessionEntry>;
}

export interface SessionMeta {
  id: string;
  title?: string;
  startedAt?: string;
  models?: Array<string>;
  environment?: {
    cwd?: string;
    repo?: string;
    gitBranch?: string;
  };
}

export type SessionEntry =
  | MessageEntry
  | ThinkingEntry
  | ToolCallEntry
  | SummaryEntry
  | WriteFileEntry
  | EditFileEntry
  | TodoListEntry
  | TaskEntry
  | PlanEntry
  | QuestionnaireEntry;

export interface BaseEntry {
  id?: string;
  createdAt?: string;
  parentId?: string;
}

export interface MessageImage {
  data: string; // base64 encoded
  mimeType: string; // e.g. "image/png"
  label?: string; // original path or filename
}

export interface MessageEntry extends BaseEntry {
  type: "message";
  role: "user" | "assistant" | "system";
  content: Array<string>;
  images?: Array<MessageImage>;
  meta?: {
    model?: string;
  };
}

export interface ThinkingEntry extends BaseEntry {
  type: "thinking";
  description?: string;
  content: Array<string>;
  meta?: {
    model?: string;
  };
}

export interface ToolCallEntry extends BaseEntry {
  type: "tool_call";
  name: string;
  description?: string;
  input: JsonValue;
  result?: ToolOutput;
  issuedBy?: "assistant" | "user";
}

export interface SummaryEntry extends BaseEntry {
  type: "summary";
  content: string;
}

export interface WriteFileEntry extends BaseEntry {
  type: "write_file";
  path: string;
  content: string;
  diffData?: FileDiffMetadata;
}

export interface EditFileEntry extends BaseEntry {
  type: "edit_file";
  path: string;
  oldContent: string;
  newContent: string;
  diffData?: FileDiffMetadata;
}

export interface TodoListEntry extends BaseEntry {
  type: "todo_list";
  todos: Array<TodoItem>;
}

export interface TodoItem {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

export interface TaskEntry extends BaseEntry {
  type: "task";
  name: string;
  content: Array<string>;
  toolCalls?: Array<ToolCallEntry>;
}

export interface PlanEntry extends BaseEntry {
  type: "plan";
  status: "pending" | "approved" | "rejected";
  title: string;
  content: string;
  feedback?: string;
}

export interface QuestionnaireEntry extends BaseEntry {
  type: "questionnaire";
  questions: Array<QuestionAnswer>;
}

export interface QuestionAnswer {
  question: string;
  answer?: string;
}

export type ToolOutput =
  | { type: "text"; text: string }
  | { type: "json"; data: JsonValue }
  | { type: "error"; message: string; data?: JsonValue };
