import { createFileRoute } from "@tanstack/react-router";
import * as Sentry from "@sentry/tanstackstart-react";
import { getSession } from "@/lib/sessions.server";

export const Route = createFileRoute("/api/sessions/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const session = await getSession(params.id);

          if (!session) {
            return new Response("Session not found", { status: 404 });
          }

          return new Response(JSON.stringify(session), {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (error) {
          Sentry.captureException(error, { extra: { sessionId: params.id } });
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    },
  },
});
