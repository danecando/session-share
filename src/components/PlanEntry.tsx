import { ClipboardList, User } from "lucide-react";
import { HighlightedMarkdown } from "./HighlightedMarkdown";
import type { PrerenderedPlanEntry } from "@/lib/prerender-entries";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { cn } from "@/lib/utils";

interface PlanEntryProps {
  entry: PrerenderedPlanEntry;
}

function PlanContentBody({ entry }: PlanEntryProps) {
  return entry.prerenderedHtml ? (
    <div className="markdown-content">
      <HighlightedMarkdown html={entry.prerenderedHtml} />
    </div>
  ) : (
    <div className="markdown-content whitespace-pre-wrap">{entry.content}</div>
  );
}

function UserFeedback({ feedback }: { feedback: string }) {
  return (
    <div className="relative min-w-0 flex items-start gap-2 lg:block mt-4">
      <div className="flex items-center justify-center shrink-0 lg:absolute lg:-left-8 lg:top-0.5">
        <User className="h-5 w-5 text-red-500" />
      </div>
      <div className="min-w-0 flex-1 font-medium markdown-content text-foreground whitespace-pre-wrap">
        {feedback}
      </div>
    </div>
  );
}

export function PlanEntry({ entry }: PlanEntryProps) {
  const statusLabel = entry.status === "approved" ? "Approved" : entry.status === "rejected" ? "Rejected" : "Pending";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-indigo-500" />
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            entry.status === "approved" && "bg-green-500/20 text-green-400",
            entry.status === "rejected" && "bg-red-500/20 text-red-400",
            entry.status === "pending" && "bg-yellow-500/20 text-yellow-400"
          )}
        >
          {statusLabel}
        </span>
      </div>

      {entry.status === "rejected" ? (
        <>
          {/* Title always visible for rejected plans */}
          {entry.title && (
            <div className="markdown-content font-medium text-foreground">Plan: {entry.title}</div>
          )}

          {/* Plan content collapsed by default */}
          <CollapsiblePanel title="Read full plan" defaultOpen={false}>
            <PlanContentBody entry={entry} />
          </CollapsiblePanel>

          {/* Feedback always visible */}
          {entry.feedback && <UserFeedback feedback={entry.feedback} />}
        </>
      ) : (
        <PlanContentBody entry={entry} />
      )}
    </div>
  );
}
