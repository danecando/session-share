import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import * as Sentry from "@sentry/tanstackstart-react";
import type { SessionSchema } from "@/lib/session-schema";
import type { PrerenderedEntry } from "@/lib/prerender-entries";
import { getSession } from "@/lib/sessions.server";
import { prerenderEntries } from "@/lib/prerender-entries";
import { EntryRenderer } from "@/components/EntryRenderer";
import { SessionViewerProvider, useSessionViewerContext } from "@/lib/session-viewer-context";
import { SessionHeader } from "@/components/SessionHeader";
import { SessionNavigator } from "@/components/SessionNavigator";
import { seo } from "@/lib/seo";
import { isVerboseOnlyEntry } from "@/lib/session-utils";

const loadSession = createServerFn()
  .inputValidator((id: string) => {
    return id;
  })
  .handler(async ({ data }) => {
    return Sentry.startSpan({ name: "loadSession", op: "function.server" }, async () => {
      try {
        const session = await getSession(data);

        if (!session) {
          throw notFound();
        }

        const prerenderedEntries = await prerenderEntries(session.entries);

        setResponseHeaders(
          new Headers({
            "Cache-Control": "public, max-age=31536000, immutable",
          })
        );

        return {
          ...session,
          entries: prerenderedEntries,
        };
      } catch (err) {
        Sentry.captureException(err, { extra: { sessionId: data } });
        throw new Error("Failed to load session");
      }
    });
  });

export const Route = createFileRoute("/$id")({
  loader: async ({ params }) => {
    return loadSession({ data: params.id });
  },
  pendingComponent: SessionLoadingView,
  component: SessionViewerPage,
  head: ({ loaderData }) => {
    const session = loaderData as SessionSchema | undefined;
    const title = session?.meta.title ?? "Claude Code Session";
    const date = session?.meta.startedAt
      ? new Date(session.meta.startedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined;

    const descriptionParts = ["Claude Code Session"];
    if (date) descriptionParts.push(date);
    const description = descriptionParts.join(" - ");

    return {
      meta: seo({
        title,
        description,
        type: "article",
        article: {
          publishedTime: session?.meta.startedAt,
        },
      }),
    };
  },
});

function SessionLoadingView() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-foreground font-medium">Loading session</p>
        </div>
      </div>
    </main>
  );
}

function SessionViewerPage() {
  const session = Route.useLoaderData();

  return (
    <SessionViewerProvider metadata={session.meta} agent={session.agent}>
      <SessionHeader />
      <SessionContent entries={session.entries} />
    </SessionViewerProvider>
  );
}

function SessionContent({ entries }: { entries: Array<PrerenderedEntry> }) {
  const { state } = useSessionViewerContext();

  const visibleEntries = state.verbose
    ? entries
    : entries.filter((entry: PrerenderedEntry) => !isVerboseOnlyEntry(entry));

  return (
    <main className="min-h-screen bg-background flex flex-col w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col flex-1">
        {visibleEntries.map((entry: PrerenderedEntry, index: number) => (
          <div
            key={entry.id ?? `entry-${index}`}
            data-entry-id={entry.id ?? `entry-${index}`}
            className="mt-6 first:mt-0 min-w-0"
          >
            <EntryRenderer entry={entry} />
          </div>
        ))}
      </div>
      <SessionNavigator entries={entries} />
    </main>
  );
}
