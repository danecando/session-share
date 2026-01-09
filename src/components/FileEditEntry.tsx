import { DiffPanel } from "./DiffPanel";
import type { PrerenderedEditFileEntry } from "@/lib/prerender-entries";
import type { FileDiffMetadata } from "@pierre/diffs";
import { getGithubFileUrl, toDisplayPath } from "@/lib/session-utils";
import { useSessionViewerContext } from "@/lib/session-viewer-context";

interface FileEditEntryProps {
  entry: PrerenderedEditFileEntry;
}

const LONG_DIFF_LINE_THRESHOLD = 200;

function getDiffSummary(diffData: FileDiffMetadata | undefined): { additions: number; deletions: number } | null {
  if (!diffData?.hunks) return null;

  let additions = 0;
  let deletions = 0;

  for (const hunk of diffData.hunks) {
    additions += hunk.additionCount;
    deletions += hunk.deletionCount;
  }

  if (additions === 0 && deletions === 0) return null;
  return { additions, deletions };
}

export function FileEditEntry({ entry }: FileEditEntryProps) {
  const { metadata } = useSessionViewerContext();
  const displayPath = toDisplayPath(entry.path, metadata.environment?.cwd);
  const diffSummary = getDiffSummary(entry.diffData);
  const totalChangedLines = diffSummary ? diffSummary.additions + diffSummary.deletions : null;
  const defaultOpen = totalChangedLines === null || totalChangedLines <= LONG_DIFF_LINE_THRESHOLD;
  const githubFileUrl = getGithubFileUrl(
    entry.path,
    metadata.environment?.repo,
    metadata.environment?.gitBranch,
    metadata.environment?.cwd
  );

  if (!entry.diffData) {
    return (
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">{displayPath}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 min-w-0">
      {/* <div className="text-sm font-mono text-muted-foreground">Edit({displayPath})</div> */}
      <DiffPanel
        filePath={displayPath}
        diffData={entry.diffData}
        prerenderedHtml={entry.prerenderedHtml}
        defaultOpen={defaultOpen}
        githubFileUrl={githubFileUrl}
        stats={
          diffSummary && (
            <span className="text-xs font-mono">
              {diffSummary.additions > 0 && <span className="text-green-500">+{diffSummary.additions}</span>}
              {diffSummary.additions > 0 && diffSummary.deletions > 0 && (
                <span className="text-zinc-600 mx-0.5">/</span>
              )}
              {diffSummary.deletions > 0 && <span className="text-red-500">-{diffSummary.deletions}</span>}
            </span>
          )
        }
      />
    </div>
  );
}
