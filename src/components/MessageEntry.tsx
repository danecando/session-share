import { Bot, CircleSlash, User } from "lucide-react";
import { ContentParts } from "./ContentParts";
import { HighlightedMarkdown } from "./HighlightedMarkdown";
import type { MessageImage } from "@/lib/session-schema";
import type { PrerenderedMessageEntry } from "@/lib/prerender-entries";
import { joinContentText } from "@/lib/session-utils";

interface MessageEntryProps {
  entry: PrerenderedMessageEntry;
}

function ImageGallery({ images }: { images: Array<MessageImage> }) {
  if (!images.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((img, i) => (
        <img
          key={i}
          src={`data:${img.mimeType};base64,${img.data}`}
          alt={img.label || "Image"}
          className="max-w-full max-h-96 rounded-lg border border-border"
        />
      ))}
    </div>
  );
}

export function MessageEntry({ entry }: MessageEntryProps) {
  const contentText = joinContentText(entry.content);
  const hasImages = entry.images && entry.images.length > 0;

  // Handle interrupted request
  const interruptedMessage = entry.role === "user" && contentText.trim().startsWith("[Request interrupted by user");
  if (interruptedMessage) {
    return (
      <div className="relative min-w-0 flex items-start gap-2 lg:block">
        <div className="flex items-center justify-center shrink-0 lg:absolute lg:-left-8 lg:top-0.5">
          <CircleSlash className="h-5 w-5 text-red-500" />
        </div>
        <div className="min-w-0 text-red-500/80 italic">Interrupted</div>
      </div>
    );
  }

  if (entry.role === "user") {
    if (!contentText && !hasImages) return null;
    return (
      <div className="relative min-w-0 flex items-start gap-2 lg:block">
        <div className="flex items-center justify-center shrink-0 lg:absolute lg:-left-8 lg:top-0.5">
          <User className="h-5 w-5 text-sky-500" />
        </div>
        <div className="min-w-0 flex-1 font-medium markdown-content text-foreground">
          {contentText && <ContentParts content={entry.content} />}
          {hasImages && <ImageGallery images={entry.images!} />}
        </div>
      </div>
    );
  }

  // Assistant message with preprocessed markdown
  if (entry.prerenderedHtml) {
    return (
      <div className="relative min-w-0 flex items-start gap-2 lg:block">
        <div className="flex items-center justify-center shrink-0 lg:absolute lg:-left-8 lg:top-0.5">
          <Bot className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="min-w-0 flex-1 markdown-content">
          <HighlightedMarkdown html={entry.prerenderedHtml} />
          {hasImages && <ImageGallery images={entry.images!} />}
        </div>
      </div>
    );
  }

  // Fallback to plain text rendering
  return (
    <div className="relative min-w-0 flex items-start gap-2 lg:block">
      <div className="flex items-center justify-center shrink-0 lg:absolute lg:-left-8 lg:top-0.5">
        <Bot className="h-5 w-5 text-emerald-500" />
      </div>
      <div className="min-w-0 flex-1 markdown-content">
        {contentText && <ContentParts content={entry.content} />}
        {hasImages && <ImageGallery images={entry.images!} />}
      </div>
    </div>
  );
}
