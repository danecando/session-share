import { load, trackPageview } from "fathom-client";
import { Suspense, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

function TrackPageView() {
  const { pathname, searchStr } = useLocation();

  useEffect(() => {
    load(import.meta.env.VITE_FATHOM_ID, {
      auto: false,
    });
  }, []);

  useEffect(() => {
    if (!pathname) return;

    trackPageview({
      url: pathname + searchStr,
      referrer: document.referrer,
    });
  }, [pathname, searchStr]);

  return null;
}

export function FathomAnalytics() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
