import type { SummaryEntry as SummaryEntryType } from "@/lib/session-schema";

interface SummaryEntryProps {
  entry: SummaryEntryType;
}

export function SummaryEntry({ entry }: SummaryEntryProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{entry.content || "Summary"}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
