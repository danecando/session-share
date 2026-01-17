import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  copyable?: boolean;
}

export function Comment({ children }: { children: React.ReactNode }) {
  return <span className="text-gray-500">{children}</span>;
}

export function Command({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold">{children}</span>;
}

export function CodeLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
      {href}
    </a>
  );
}

export function CodeBlock({ children, className, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const codeRef = React.useRef<HTMLElement>(null);

  const handleCopy = async () => {
    const text = codeRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group w-full max-w-full", className)}>
      <pre className="border border-border rounded-lg p-4 sm:p-6 overflow-x-auto text-sm sm:text-lg leading-relaxed bg-[#0a0c10] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.3)] max-w-full">
        <code ref={codeRef} className="text-[#f0f3f6] font-mono">
          {children}
        </code>
      </pre>
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-md bg-card hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity border border-border"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
