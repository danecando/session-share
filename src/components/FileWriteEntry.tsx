import { DiffPanel } from "./DiffPanel";
import type { FileDiffMetadata } from "@pierre/diffs";
import type { PrerenderedWriteFileEntry } from "@/lib/prerender-entries";
import { useSessionViewerContext } from "@/lib/session-viewer-context";
import { getGithubFileUrl, toDisplayPath } from "@/lib/session-utils";

interface FileWriteEntryProps {
  entry: PrerenderedWriteFileEntry;
}

const LONG_DIFF_LINE_THRESHOLD = 200;

function getWriteSummary(diffData: FileDiffMetadata | undefined): number | null {
  if (!diffData?.hunks) return null;

  let lines = 0;
  for (const hunk of diffData.hunks) {
    lines += hunk.additionCount;
  }

  return lines > 0 ? lines : null;
}

export function FileWriteEntry({ entry }: FileWriteEntryProps) {
  const { metadata } = useSessionViewerContext();
  const displayPath = toDisplayPath(entry.path, metadata.environment?.cwd);
  const lineCount = getWriteSummary(entry.diffData);
  const defaultOpen = lineCount === null || lineCount <= LONG_DIFF_LINE_THRESHOLD;
  const githubFileUrl = getGithubFileUrl(
    entry.path,
    metadata.environment?.repo,
    metadata.environment?.gitBranch,
    metadata.environment?.cwd
  );

  if (!entry.diffData) {
    return (
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          {displayPath}
          <span className="text-xs opacity-60">(new file)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-w-0">
      {/* <div className="text-sm font-mono text-muted-foreground">Write({displayPath})</div> */}
      <DiffPanel
        filePath={displayPath}
        diffData={entry.diffData}
        prerenderedHtml={entry.prerenderedHtml}
        defaultOpen={defaultOpen}
        githubFileUrl={githubFileUrl}
        stats={lineCount !== null && <span className="text-xs font-mono text-green-500">+{lineCount}</span>}
        disableBackground
      />
    </div>
  );
}
