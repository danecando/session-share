import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangleIcon, BotMessageSquareIcon, MessageSquareCodeIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeLink, Command, Comment } from "@/components/CodeBlock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: seo({
      title: "Claude Code Session Sharing",
      description: "A Claude Code plugin to share agent sessions to a public URL",
      type: "website",
      image: {
        url: "https://share.crapola.ai/og.png",
        width: 1200,
        height: 630,
      },
    }),
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 via-background to-cyan-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 flex-1">
        <div className="space-y-16 md:space-y-20">
          <header className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-violet-600 to-cyan-600 blur-xl opacity-50" />
                <MessageSquareCodeIcon className="relative w-16 h-16 text-foreground" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-foreground">Session Share</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              The hottest place to share your Claude Code sessions blazingly fast.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" asChild>
                <Link to="/$id" params={{ id: "-pdYfEVVb5" }}>
                  <BotMessageSquareIcon />
                  Example Session
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://github.com/danecando/session-share" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 0.75C5.64625 0.75 0.5 5.89625 0.5 12.25C0.5 17.3387 3.79187 21.6369 8.36312 23.1606C8.93812 23.2612 9.15375 22.9162 9.15375 22.6144C9.15375 22.3412 9.13938 21.4356 9.13938 20.4725C6.25 21.0044 5.5025 19.7681 5.2725 19.1212C5.14313 18.7906 4.5825 17.77 4.09375 17.4969C3.69125 17.2812 3.11625 16.7494 4.07938 16.735C4.985 16.7206 5.63188 17.5687 5.8475 17.9137C6.8825 19.6531 8.53563 19.1644 9.19688 18.8625C9.2975 18.115 9.59938 17.6119 9.93 17.3244C7.37125 17.0369 4.6975 16.045 4.6975 11.6462C4.6975 10.3956 5.14312 9.36062 5.87625 8.55562C5.76125 8.26812 5.35875 7.08937 5.99125 5.50812C5.99125 5.50812 6.95438 5.20625 9.15375 6.68687C10.0738 6.42812 11.0513 6.29875 12.0288 6.29875C13.0063 6.29875 13.9838 6.42812 14.9038 6.68687C17.1031 5.19187 18.0662 5.50812 18.0662 5.50812C18.6987 7.08937 18.2962 8.26812 18.1812 8.55562C18.9144 9.36062 19.36 10.3812 19.36 11.6462C19.36 16.0594 16.6719 17.0369 14.1131 17.3244C14.53 17.6837 14.8894 18.3737 14.8894 19.4519C14.8894 20.99 14.875 22.2262 14.875 22.6144C14.875 22.9162 15.0906 23.2756 15.6656 23.1606C20.2081 21.6369 23.5 17.3244 23.5 12.25C23.5 5.89625 18.3538 0.75 12 0.75Z"
                      fill="#FFF"
                    />
                  </svg>
                  View on GitHub
                </a>
              </Button>
            </div>
          </header>

          {/* Installation */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center">Install the Claude Code plugin</h2>
            <div className="relative group mt-6">
              <p className="mb-2 text-center text-muted-foreground">Add the plugin marketplace</p>
              <CodeBlock>
                <Command>/plugin marketplace add danecando/session-share</Command>
              </CodeBlock>
            </div>
            <div className="relative group mt-6">
              <p className="mb-2 text-center text-muted-foreground">Install the share-session plugin</p>
              <CodeBlock>
                <Command>/plugin install share-session@danecando</Command>
              </CodeBlock>
            </div>
          </section>

          {/* Share a session */}
          <section className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center">Share a session</h2>
            <p className="text-center text-muted-foreground mt-4 max-w-prose mx-auto">
              After installing the plugin, use the <code>/share-session:share</code> command in Claude Code to share
              your current session.
            </p>

            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl mt-6">
              <CodeBlock copyable={false}>
                ❯ <Command>/share-session:share</Command>
                {"\n\n"}⏺ Bash("/plugin/scripts/share-session.sh" "/.claude/pro…)
                {"\n"}⎿ <CodeLink href="https://share.crapola.ai/-pdYfEVVb5" />
                {"\n\n"}⏺ Your session has been shared: <CodeLink href="https://share.crapola.ai/-pdYfEVVb5" />
              </CodeBlock>
            </div>

            <Alert variant="warning" className="mt-6">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                The plugin does not currently scrub the contents of your session to redact sensitive information. Make
                sure that you don't share any sessions that contain sensitive information.
              </AlertDescription>
            </Alert>
          </section>
        </div>
      </div>
    </div>
  );
}
