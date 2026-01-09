import { FileDiff } from "@pierre/diffs/react";
import { ChevronsUpDownIcon, ExternalLink, FileDiffIcon } from "lucide-react";
import type { FileDiffMetadata } from "@pierre/diffs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DiffPanelProps {
  filePath: string;
  diffData: FileDiffMetadata;
  prerenderedHtml?: string;
  defaultOpen?: boolean;
  stats?: React.ReactNode;
  disableBackground?: boolean;
  githubFileUrl?: string;
}

export function DiffPanel({
  filePath,
  diffData,
  prerenderedHtml,
  defaultOpen = true,
  stats,
  disableBackground = false,
  githubFileUrl,
}: DiffPanelProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "diff" : undefined}
      className="rounded-lg border border-border overflow-hidden"
    >
      <AccordionItem value="diff" className="border-none">
        <AccordionTrigger className="py-2.5 px-3 hover:no-underline bg-black rounded-b-none">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileDiffIcon className="size-4 shrink-0 text-sky-600" />
            <div className="font-mono text-xs tracking-tight truncate min-w-0">{filePath}</div>
            {githubFileUrl ? (
              <a
                href={githubFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="View on GitHub"
              >
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
          <div className="flex items-center gap-3 shrink-0">{stats}</div>
          <ChevronsUpDownIcon className="size-4 text-zinc-400" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-border">
          <FileDiff
            className="-mt-1.5"
            fileDiff={diffData}
            options={{
              theme: "github-dark-high-contrast",
              diffStyle: "unified",
              disableFileHeader: true,
              disableBackground,
            }}
            prerenderedHTML={prerenderedHtml}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
