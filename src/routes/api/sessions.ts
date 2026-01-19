import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { nanoid } from "nanoid";
import * as Sentry from "@sentry/tanstackstart-react";
import { extractTarball } from "@/lib/cc-tarball";
import { ccSessionToSession } from "@/lib/cc-converter";

export const Route = createFileRoute("/api/sessions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") || "";

        let tarballData: ArrayBuffer;

        if (
          contentType.includes("application/gzip") ||
          contentType.includes("application/x-gzip") ||
          contentType.includes("application/octet-stream")
        ) {
          tarballData = await request.arrayBuffer();
        } else if (contentType.includes("multipart/form-data")) {
          const formData = await request.formData();
          const file = formData.get("file");
          if (!(file instanceof File)) {
            return new Response("Missing file in form data", { status: 400 });
          }
          tarballData = await file.arrayBuffer();
        } else {
          return new Response("Unsupported content type. Use application/gzip or multipart/form-data", { status: 415 });
        }

        try {
          const extracted = await extractTarball(tarballData);
          const session = ccSessionToSession(extracted.jsonlContent, extracted.images, extracted.metadata);

          const id = nanoid(10);

          await env.R2_SESSIONS.put(id, JSON.stringify(session), {
            customMetadata: {
              createdAt: new Date().toISOString(),
            },
          });

          Sentry.logger.info("Session created", {
            id: id,
            sessionId: extracted.metadata.sessionId,
            agentVersion: extracted.metadata.agentVersion,
            tarballSize: tarballData.byteLength,
            imageCount: extracted.images.size,
            entryCount: session.entries.length,
            gitRemote: extracted.metadata.gitRemote || null,
          });

          return Response.json({ id });
        } catch (error) {
          Sentry.captureException(error);
          const message = error instanceof Error ? error.message : "Failed to process tarball";
          return new Response(message, { status: 400 });
        }
      },
    },
  },
});
