import { Link } from "@tanstack/react-router";
import { Copy, ExternalLink, Github, Info, Share2 } from "lucide-react";
import { trackEvent } from "fathom-client";
import { toast } from "sonner";
import type { SessionMeta } from "@/lib/session-schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSessionViewerContext } from "@/lib/session-viewer-context";
import { getGithubRepoUrl } from "@/lib/session-utils";

const formatRepoLabel = (repo?: string): string | undefined => {
  if (!repo?.startsWith("https://github.com/")) return undefined;
  // Extract owner/repo from https://github.com/owner/repo
  const parts = repo.replace("https://github.com/", "").split("/");
  if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return undefined;
};

const formatSessionMetadata = (metadata: SessionMeta) => {
  return metadata.title || "";
};

export function SessionHeader() {
  const { metadata, agent, state, toggleVerbose } = useSessionViewerContext();
  const metadataLabel = formatSessionMetadata(metadata);
  const displayLabel = metadataLabel;
  const canShare = typeof window !== "undefined";
  const agentLabel = agent ? `${agent.name ?? "Agent"}${agent.version ? ` v${agent.version}` : ""}` : null;

  const handleCopyUrl = async () => {
    if (!canShare) return;
    trackEvent("copy url");
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleShareToTwitter = () => {
    if (!canShare) return;
    trackEvent("share twitter");
    const url = window.location.href;
    const text = "Check out this Claude Code session";
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      text
    )}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleVerbose = () => {
    trackEvent("toggle verbose");
    toggleVerbose();
  };

  return (
    <header
      data-slot="header"
      className="bg-background/80 backdrop-blur sticky top-0 z-40 border-b border-transparent -mb-px transition-[border-color,box-shadow] duration-200"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link to="/" className="text-foreground hover:text-foreground/80 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.2996 6.73967C10.5814 7.0432 10.5639 7.51775 10.2603 7.7996L7.35221 10.5L10.2603 13.2004C10.5639 13.4823 10.5814 13.9568 10.2996 14.2603C10.0177 14.5639 9.54319 14.5815 9.23966 14.2996L5.73966 11.0496C5.58684 10.9077 5.5 10.7086 5.5 10.5C5.5 10.2915 5.58684 10.0923 5.73966 9.95041L9.23966 6.70041C9.54319 6.41856 10.0177 6.43613 10.2996 6.73967Z"
                fill="#FFF"
              />
              <path
                d="M13.7397 7.7996C13.4361 7.51775 13.4186 7.0432 13.7004 6.73967C13.9823 6.43613 14.4568 6.41856 14.7603 6.70041L18.2603 9.95041C18.4132 10.0923 18.5 10.2915 18.5 10.5C18.5 10.7086 18.4132 10.9077 18.2603 11.0496L14.7603 14.2996C14.4568 14.5815 13.9823 14.5639 13.7004 14.2603C13.4186 13.9568 13.4361 13.4823 13.7397 13.2004L16.6478 10.5L13.7397 7.7996Z"
                fill="#FFF"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1.5 4.25C1.5 3.2835 2.2835 2.5 3.25 2.5H20.75C21.7165 2.5 22.5 3.2835 22.5 4.25V16.75C22.5 17.7165 21.7165 18.5 20.75 18.5H11.0607L7.48744 22.0732C7.21418 22.3465 6.84356 22.5 6.45711 22.5C5.65237 22.5 5 21.8476 5 21.0429V18.5H3.25C2.2835 18.5 1.5 17.7165 1.5 16.75V4.25ZM3.25 4C3.11193 4 3 4.11193 3 4.25V16.75C3 16.8881 3.11193 17 3.25 17H5.75C6.16421 17 6.5 17.3358 6.5 17.75V20.9393L10.2197 17.2197C10.3603 17.079 10.5511 17 10.75 17H20.75C20.8881 17 21 16.8881 21 16.75V4.25C21 4.11193 20.8881 4 20.75 4H3.25Z"
                fill="#FFF"
              />
            </svg>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <small className="text-muted-foreground text-sm leading-5 min-w-0 flex-1 truncate" title={displayLabel}>
              {displayLabel}
            </small>
            {agentLabel ? (
              <span className="shrink-0 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {agentLabel}
              </span>
            ) : null}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Session info"
                >
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Session Info</h4>
                  <dl className="space-y-2 text-sm">
                    {metadata.title ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">Title</dt>
                        <dd className="font-mono text-xs">{metadata.title}</dd>
                      </div>
                    ) : null}
                    {metadata.startedAt ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">Started</dt>
                        <dd className="font-mono text-xs">{new Date(metadata.startedAt).toLocaleString()}</dd>
                      </div>
                    ) : null}
                    {metadata.environment?.repo ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">Repository</dt>
                        <dd className="font-mono text-xs break-all">
                          {getGithubRepoUrl(metadata.environment.repo) ? (
                            <a
                              href={getGithubRepoUrl(metadata.environment.repo)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-foreground hover:underline"
                            >
                              {formatRepoLabel(metadata.environment.repo)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            metadata.environment.repo
                          )}
                        </dd>
                      </div>
                    ) : null}
                    {metadata.environment?.gitBranch ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">Branch</dt>
                        <dd className="font-mono text-xs">{metadata.environment.gitBranch}</dd>
                      </div>
                    ) : null}
                    {agent ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">Agent</dt>
                        <dd className="font-mono text-xs">
                          {agent.name ?? "Unknown"}
                          {agent.version ? ` v${agent.version}` : ""}
                        </dd>
                      </div>
                    ) : null}
                    {metadata.models?.length ? (
                      <div>
                        <dt className="text-muted-foreground text-xs">Models</dt>
                        <dd className="font-mono text-xs">{metadata.models.join(", ")}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-muted-foreground text-xs">Session ID</dt>
                      <dd className="font-mono text-xs break-all">{metadata.id}</dd>
                    </div>
                  </dl>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <nav className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Verbose</span>
            <button
              type="button"
              role="switch"
              aria-checked={state.verbose}
              aria-label="Toggle verbose mode"
              onClick={handleToggleVerbose}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full border border-transparent transition-colors",
                state.verbose ? "bg-foreground" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
                  state.verbose ? "translate-x-4" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareToTwitter}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share to X
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border-border mx-1 h-5 w-px border-l" />
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/danecando/session-share"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
