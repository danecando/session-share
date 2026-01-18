import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import type { ToolCallEntry as ToolCallEntryType } from "@/lib/session-schema";
import { asObjectInput, toDisplayPath, toolOutputToText } from "@/lib/session-utils";
import { useSessionViewerContext } from "@/lib/session-viewer-context";
import { cn } from "@/lib/utils";

interface ToolCallEntryProps {
  entry: ToolCallEntryType;
}

function parseMcpToolName(name: string): { server: string; fn: string } | null {
  const match = name.match(/^mcp__([^_]+)__(.+)$/);
  if (!match) return null;
  return { server: match[1], fn: match[2] };
}

function getMcpInputSummary(input: Record<string, unknown> | undefined): string | null {
  if (!input) return null;

  // Priority order of common input parameter names
  const primaryKeys = [
    "query", // search tools (tanstack, sentry)
    "naturalLanguageQuery", // sentry search
    "url", // web fetch tools
    "path", // file/doc tools
    "pattern", // pattern matching
    "prompt", // AI tools
    "command", // command execution
    "issueUrl", // sentry issue tools
    "issueId", // sentry issue tools
  ];

  for (const key of primaryKeys) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) {
      const trimmed = value.trim();
      // Truncate long values
      if (trimmed.length > 50) {
        return trimmed.slice(0, 47) + "...";
      }
      return trimmed;
    }
  }

  return null;
}

function getResultSummary(toolName: string, result: string | undefined): string | null {
  if (!result) return null;

  switch (toolName) {
    case "Read": {
      const lines = result.split("\n").length;
      return `Read ${lines} line${lines !== 1 ? "s" : ""}`;
    }
    case "Glob": {
      const files = result.split("\n").filter((line) => line.trim()).length;
      if (files === 0) return "No files found";
      return `Found ${files} file${files !== 1 ? "s" : ""}`;
    }
    case "Grep": {
      const lines = result.split("\n").filter((line) => line.trim()).length;
      if (lines === 0) return "No matches";
      return `Found ${lines} match${lines !== 1 ? "es" : ""}`;
    }
    case "Bash": {
      const trimmed = result.trim();
      if (!trimmed) return "Completed";
      const lines = trimmed.split("\n").length;
      return `${lines} line${lines !== 1 ? "s" : ""} of output`;
    }
    case "Skill": {
      if (result) return "Loaded skill";
      return null;
    }
    case "Write": {
      const match = result.match(/Wrote\s+(\d+)\s+lines?/i);
      if (match) return `Wrote ${match[1]} lines`;
      return null;
    }
    case "Edit": {
      const addMatch = result.match(/Added\s+(\d+)\s+lines?/i);
      const removeMatch = result.match(/removed\s+(\d+)\s+lines?/i);
      if (addMatch || removeMatch) {
        const parts: Array<string> = [];
        if (addMatch) parts.push(`Added ${addMatch[1]} lines`);
        if (removeMatch) parts.push(`removed ${removeMatch[1]} lines`);
        return parts.join(", ");
      }
      return null;
    }
    default: {
      // Handle MCP tools
      if (parseMcpToolName(toolName)) {
        try {
          const data = JSON.parse(result);
          if (Array.isArray(data.results)) return `${data.results.length} result${data.results.length !== 1 ? "s" : ""}`;
          if (Array.isArray(data.items)) return `${data.items.length} item${data.items.length !== 1 ? "s" : ""}`;
          if (Array.isArray(data.issues)) return `${data.issues.length} issue${data.issues.length !== 1 ? "s" : ""}`;
          if (Array.isArray(data)) return `${data.length} item${data.length !== 1 ? "s" : ""}`;
          return "Completed";
        } catch {
          return "Completed";
        }
      }
      return null;
    }
  }
}

export function ToolCallEntry({ entry }: ToolCallEntryProps) {
  const { metadata } = useSessionViewerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const toolName = entry.name;
  const input = asObjectInput(entry.input);
  const result = toolOutputToText(entry.result);

  const filePath =
    typeof input?.file_path === "string"
      ? toDisplayPath(input.file_path, metadata.environment?.cwd)
      : typeof input?.path === "string"
        ? toDisplayPath(input.path, metadata.environment?.cwd)
        : "";
  const command = typeof input?.command === "string" ? input.command.trim() : "";
  const pattern = typeof input?.pattern === "string" ? input.pattern.trim() : "";

  const getToolTitle = (): string => {
    switch (toolName) {
      case "Read":
        return filePath ? `Read(${filePath})` : "Read";
      case "Bash":
        return command ? `Bash(${command})` : "Bash";
      case "Grep":
        return pattern ? `Grep(${pattern})` : "Grep";
      case "Glob":
        return pattern ? `Search(${pattern})` : "Search";
      case "Write":
        return filePath ? `Write(${filePath})` : "Write";
      case "Edit":
        return filePath ? `Edit(${filePath})` : "Edit";
      case "Skill": {
        const skillName = typeof input?.skill === "string" ? input.skill : "";
        return skillName ? `Skill(${skillName})` : "Skill";
      }
      case "Task": {
        const desc = typeof input?.description === "string" ? input.description : "";
        const subagent = typeof input?.subagent_type === "string" ? input.subagent_type : "";
        const label = desc || subagent;
        return label ? `Task(${label})` : "Task";
      }
      default: {
        const mcpInfo = parseMcpToolName(toolName);
        if (mcpInfo) {
          const inputSummary = getMcpInputSummary(input);
          if (inputSummary) {
            return `MCP: ${mcpInfo.server}.${mcpInfo.fn}("${inputSummary}")`;
          }
          return `MCP: ${mcpInfo.server}.${mcpInfo.fn}`;
        }
        return toolName;
      }
    }
  };

  const title = getToolTitle();
  const isMcpTool = toolName.startsWith("mcp__");
  const isCompactTool = isMcpTool || ["Read", "Bash", "Grep", "Glob", "Skill", "Write", "Edit"].includes(toolName);
  const resultSummary = isCompactTool ? getResultSummary(toolName, result) : null;
  const isErrorResult = entry.result?.type === "error";
  const isExpandable = isMcpTool && result;

  return (
    <div className="space-y-2 min-w-0">
      <div className="text-sm min-w-0 break-words">
        {isExpandable ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-start gap-1 font-mono font-medium break-all text-left",
              isErrorResult ? "text-red-500/80 hover:text-red-500" : "text-foreground/80 hover:text-foreground"
            )}
          >
            <ChevronRight
              className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-90")}
            />
            <span className="break-all">
              {title}
              {resultSummary && (
                <span className={cn("opacity-70", isErrorResult ? "text-red-500" : "text-muted-foreground")}>
                  {" "}
                  - {resultSummary}
                </span>
              )}
            </span>
          </button>
        ) : (
          <span className={cn("font-mono font-medium break-all", isErrorResult ? "text-red-500/80" : "text-foreground/80")}>
            {title}
            {resultSummary && (
              <span className={cn("opacity-70", isErrorResult ? "text-red-500" : "text-muted-foreground")}>
                {" "}
                - {resultSummary}
              </span>
            )}
          </span>
        )}
      </div>

      {isExpandable && isExpanded && result && <CodeBlock>{result}</CodeBlock>}

      {!isCompactTool && entry.input && <CodeBlock>{JSON.stringify(entry.input, null, 2)}</CodeBlock>}

      {result && !isCompactTool && <CodeBlock>{result}</CodeBlock>}
    </div>
  );
}
