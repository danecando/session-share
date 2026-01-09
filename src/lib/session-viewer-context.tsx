import * as React from "react";
import type { SessionMeta, SessionSchema } from "./session-schema";

const VERBOSE_STORAGE_KEY = "session-verbose-mode";

interface SessionViewerState {
  verbose: boolean;
}

interface SessionViewerContextValue {
  metadata: SessionMeta;
  agent?: SessionSchema["agent"];
  state: SessionViewerState;
  toggleVerbose: () => void;
}

const SessionViewerContext = React.createContext<SessionViewerContextValue | null>(null);

export function SessionViewerProvider({
  metadata,
  agent,
  children,
}: React.PropsWithChildren<{ metadata: SessionMeta; agent?: SessionSchema["agent"] }>) {
  const [state, setState] = React.useState<SessionViewerState>({
    verbose: false,
  });

  React.useEffect(() => {
    const stored = localStorage.getItem(VERBOSE_STORAGE_KEY);
    if (stored !== null) {
      setState((prev) => ({ ...prev, verbose: stored === "true" }));
    }
  }, []);

  const toggleVerbose = React.useCallback(() => {
    setState((prev) => {
      const newVerbose = !prev.verbose;
      localStorage.setItem(VERBOSE_STORAGE_KEY, String(newVerbose));
      return { ...prev, verbose: newVerbose };
    });
  }, []);

  return (
    <SessionViewerContext.Provider value={{ metadata, agent, state, toggleVerbose }}>
      {children}
    </SessionViewerContext.Provider>
  );
}

export function useSessionViewerContext(): SessionViewerContextValue {
  const context = React.use(SessionViewerContext);
  if (!context) {
    throw new Error("useSessionViewerContext must be used within a SessionViewerProvider");
  }
  return context;
}

export function useOptionalSessionViewerContext(): SessionViewerContextValue | null {
  return React.use(SessionViewerContext);
}
