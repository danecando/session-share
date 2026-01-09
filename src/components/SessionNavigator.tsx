import { useState } from "react";
import { List, User } from "lucide-react";
import type { MessageEntry, SessionEntry } from "@/lib/session-schema";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { joinContentText } from "@/lib/session-utils";

interface SessionNavigatorProps {
  entries: Array<SessionEntry>;
}

interface UserMessageItem {
  entryId: string;
  index: number;
  preview: string;
  messageNumber: number;
}

function getMessagePreview(entry: MessageEntry, maxLength = 50): string {
  const text = joinContentText(entry.content).trim();
  if (!text) return "(empty message)";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function SessionNavigator({ entries }: SessionNavigatorProps) {
  const [open, setOpen] = useState(false);

  const userMessages: Array<UserMessageItem> = entries
    .map((entry, index) => ({ entry, index }))
    .filter(
      (item): item is { entry: MessageEntry; index: number } =>
        item.entry.type === "message" && item.entry.role === "user"
    )
    .filter((item) => {
      const text = joinContentText(item.entry.content).trim();
      return text && !text.startsWith("[Request interrupted by user");
    })
    .map((item, messageIndex) => ({
      entryId: item.entry.id ?? `entry-${item.index}`,
      index: item.index,
      preview: getMessagePreview(item.entry),
      messageNumber: messageIndex + 1,
    }));

  if (userMessages.length === 0) return null;

  const scrollToEntry = (entryId: string) => {
    const element = document.querySelector(`[data-entry-id="${entryId}"]`);
    if (element) {
      const headerHeight = 60;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-6xl mx-auto px-4 flex justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="pointer-events-auto h-12 w-12 rounded-full shadow-lg bg-background/70 backdrop-blur border"
            >
              <List className="h-5 w-5" />
              <span className="sr-only">Navigate to user messages</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-80 max-h-96 overflow-y-auto p-2 pointer-events-auto">
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 flex items-center gap-2">
                <div className="flex items-center justify-center shrink-0 h-5 w-5 rounded-full bg-sky-500/10 text-sky-500">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">User Messages ({userMessages.length})</span>
              </div>
              {userMessages.map((item) => (
                <button
                  key={item.entryId}
                  onClick={() => scrollToEntry(item.entryId)}
                  className="flex items-center w-full text-left px-2 py-1.5 gap-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <span className="text-xs text-muted-foreground shrink-0">#{item.messageNumber}</span>
                  <span className="text-sm text-foreground truncate min-w-0">{item.preview}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
