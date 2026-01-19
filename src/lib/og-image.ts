const OG_API_BASE = "https://og-api-theta.vercel.app/api/og";
const LOGO_URL = "https://share.crapola.ai/logo512.png";
const APP_URL = "share.crapola.ai";

export function buildOgImageUrl(options: {
  title: string;
  date?: string;
  agentName?: string;
  agentVersion?: string;
}): string {
  const params = new URLSearchParams({
    title: options.title,
    subtitle: "Session Share",
    tag: APP_URL,
    logo: LOGO_URL,
    theme: "dark",
    accent: "0ea5e9",
  });

  const footerParts: Array<string> = [];
  if (options.date) footerParts.push(options.date);
  if (options.agentName) {
    const agent = options.agentVersion
      ? `${options.agentName} ${options.agentVersion}`
      : options.agentName;
    footerParts.push(agent);
  }

  if (footerParts.length > 0) {
    params.set("footer", footerParts.join(" · "));
  }

  return `${OG_API_BASE}?${params.toString()}`;
}
