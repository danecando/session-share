import { MessageEntry } from "./MessageEntry";
import { ToolCallEntry } from "./ToolCallEntry";
import { FileWriteEntry } from "./FileWriteEntry";
import { FileEditEntry } from "./FileEditEntry";
import { PlanEntry } from "./PlanEntry";
import { TodoListEntry } from "./TodoListEntry";
import { TaskEntry } from "./TaskEntry";
import { QuestionnaireEntry } from "./QuestionnaireEntry";
import { SummaryEntry } from "./SummaryEntry";
import { ThinkingEntry } from "./ThinkingEntry";
import type { PrerenderedEntry } from "@/lib/prerender-entries";

interface EntryRendererProps {
  entry: PrerenderedEntry;
}

export const VERBOSE_ONLY_TYPES = new Set(["thinking", "todo_list"]);

export function isVerboseOnlyEntry(entry: PrerenderedEntry): boolean {
  return VERBOSE_ONLY_TYPES.has(entry.type);
}

export function EntryRenderer({ entry }: EntryRendererProps) {
  switch (entry.type) {
    case "message":
      return <MessageEntry entry={entry} />;
    case "tool_call":
      return <ToolCallEntry entry={entry} />;
    case "write_file":
      return <FileWriteEntry entry={entry} />;
    case "edit_file":
      return <FileEditEntry entry={entry} />;
    case "plan":
      return <PlanEntry entry={entry} />;
    case "todo_list":
      return <TodoListEntry entry={entry} />;
    case "task":
      return <TaskEntry entry={entry} />;
    case "questionnaire":
      return <QuestionnaireEntry entry={entry} />;
    case "summary":
      return <SummaryEntry entry={entry} />;
    case "thinking":
      return <ThinkingEntry entry={entry} />;
  }
}
