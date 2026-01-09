export type BundleMetadata = {
  bundleVersion: number;
  sessionId: string;
  agent: string;
  agentVersion: string;
  generatedAt: string;
  gitRemote?: string;
};

export function parseMetadataTxt(content: string): BundleMetadata {
  const lines = content.split("\n");
  const data: Record<string, string> = {};

  for (const line of lines) {
    const eqIdx = line.indexOf("=");
    if (eqIdx > 0) {
      const key = line.slice(0, eqIdx).trim();
      const value = line.slice(eqIdx + 1).trim();
      data[key] = value;
    }
  }

  return {
    bundleVersion: parseInt(data["BUNDLE_VERSION"] || "0", 10),
    sessionId: data["SESSION_ID"] || "",
    agent: data["AGENT"] || "",
    agentVersion: data["AGENT_VERSION"] || "",
    generatedAt: data["GENERATED_AT"] || "",
    ...(data["GIT_REMOTE"] && { gitRemote: data["GIT_REMOTE"] }),
  };
}
