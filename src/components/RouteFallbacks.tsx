import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, Compass, Home, RefreshCw } from "lucide-react";
import * as Sentry from "@sentry/tanstackstart-react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const isDev = import.meta.env.DEV;

type StatusLayoutProps = {
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: React.ReactNode;
  children?: React.ReactNode;
};

function StatusLayout({ badge, title, description, icon, actions, children }: StatusLayoutProps) {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 via-background to-cyan-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-border/60 bg-card/70 shadow-sm backdrop-blur">
            {icon}
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{badge}</p>
          <h1 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
          {children}
        </div>
      </div>
    </main>
  );
}

export function RouteNotFound() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <StatusLayout
      badge="404"
      title="This page is off the map"
      description="The link you followed does not exist here. Double-check the URL or head back home."
      icon={<Compass className="h-7 w-7 text-muted-foreground" />}
      actions={
        <>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Back home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        </>
      }
    >
      <div className="mt-10 rounded-lg border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
        Requested path: <span className="font-mono text-foreground">{pathname}</span>
      </div>
    </StatusLayout>
  );
}

export function RouteError({ error }: ErrorComponentProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const message = error instanceof Error ? error.message : "Unexpected error.";
  const stack = error instanceof Error ? error.stack : null;

  return (
    <StatusLayout
      badge="500"
      title="Something broke"
      description="An unexpected error stopped this page from loading. Try again or return to safety."
      icon={<AlertTriangle className="h-7 w-7 text-destructive" />}
      actions={
        <>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Back home
            </Link>
          </Button>
        </>
      }
    >
      <div className="mt-10 space-y-3 text-left">
        <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur">
          {message}
        </div>
        {isDev && stack ? (
          <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-card/70 p-4 text-xs text-muted-foreground shadow-sm backdrop-blur">
            {stack}
          </pre>
        ) : null}
      </div>
    </StatusLayout>
  );
}
