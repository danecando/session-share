import { createServerOnlyFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import * as Sentry from "@sentry/tanstackstart-react";
import type { SessionSchema } from "./session-schema";

export const getSession = createServerOnlyFn(async (id: string): Promise<SessionSchema | undefined> => {
  return Sentry.startSpan({ name: "getSession", op: "r2.get" }, async () => {
    try {
      const object = await env.R2_SESSIONS.get(id);
      if (!object) return;
      const content = await object.text();
      return JSON.parse(content) as SessionSchema;
    } catch (error) {
      Sentry.captureException(error, { extra: { sessionId: id } });
      throw error;
    }
  });
});
