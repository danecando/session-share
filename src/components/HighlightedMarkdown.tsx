import * as React from "react";
import { highlightCode } from "@/lib/highlight";

interface HighlightedMarkdownProps {
  html: string;
}

function extractLanguage(className: string | null): string {
  if (!className) return "text";
  const match = className.match(/language-(\S+)/);
  return match ? match[1] : "text";
}

export function HighlightedMarkdown({ html }: HighlightedMarkdownProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find all code blocks and highlight them
    const codeBlocks = container.querySelectorAll("pre > code");

    codeBlocks.forEach(async (codeElement) => {
      const preElement = codeElement.parentElement;
      if (!preElement) return;

      const language = extractLanguage(codeElement.getAttribute("class"));
      const code = codeElement.textContent || "";

      const highlightedHtml = await highlightCode(code, language);

      // Create a wrapper and insert the highlighted HTML
      const wrapper = document.createElement("div");
      wrapper.innerHTML = highlightedHtml;

      // Get the new pre element from shiki output
      const newPre = wrapper.querySelector("pre");
      if (newPre) {
        // Copy over the styling classes
        newPre.className = preElement.className + " " + (newPre.className || "");
        preElement.replaceWith(newPre);
      }
    });
  }, [html]);

  return <div ref={containerRef} className="contents" dangerouslySetInnerHTML={{ __html: html }} />;
}
