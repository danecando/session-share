import { CollapsiblePanel } from "./CollapsiblePanel";
import type { ThinkingEntry as ThinkingEntryType } from "@/lib/session-schema";
import { joinContentText } from "@/lib/session-utils";

interface ThinkingEntryProps {
  entry: ThinkingEntryType;
}

export function ThinkingEntry({ entry }: ThinkingEntryProps) {
  const content = joinContentText(entry.content);
  if (!content) return null;

  return (
    <div>
      <CollapsiblePanel title="Thinking">
        <div className="text-muted-foreground whitespace-pre-wrap text-sm">{content}</div>
      </CollapsiblePanel>
    </div>
  );
}
