import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { extractTarball } from "@/lib/cc-tarball";

function createTestTarball(files: Array<{ name: string; content: string }>): ArrayBuffer {
  const dir = mkdtempSync(join(tmpdir(), "tarball-test-"));

  try {
    for (const file of files) {
      const filePath = join(dir, file.name);
      const fileDir = dirname(filePath);
      if (fileDir !== dir) {
        execSync(`mkdir -p "${fileDir}"`);
      }
      writeFileSync(filePath, file.content);
    }

    const tarball = execSync(`tar -czf - -C "${dir}" .`);
    return tarball.buffer.slice(tarball.byteOffset, tarball.byteOffset + tarball.byteLength);
  } finally {
    rmSync(dir, { recursive: true });
  }
}

describe("extractTarball", () => {
  it("extracts valid tarball with metadata and JSONL", async () => {
    const metadata = `BUNDLE_VERSION=1
SESSION_ID=test-session-123
AGENT=CC
AGENT_VERSION=1.0.0
GENERATED_AT=2025-01-10T12:00:00Z`;

    const jsonl = `{"type":"user","message":{"role":"user","content":"hello"}}
{"type":"assistant","message":{"role":"assistant","content":"hi"}}`;

    const tarball = createTestTarball([
      { name: "metadata.txt", content: metadata },
      { name: "session.jsonl", content: jsonl },
    ]);

    const result = await extractTarball(tarball);

    expect(result.metadata.bundleVersion).toBe(1);
    expect(result.metadata.sessionId).toBe("test-session-123");
    expect(result.metadata.agent).toBe("CC");
    expect(result.metadata.agentVersion).toBe("1.0.0");
    expect(result.metadata.generatedAt).toBe("2025-01-10T12:00:00Z");
    expect(result.jsonlContent).toBe(jsonl);
  });

  it("throws error when metadata.txt is missing", async () => {
    const jsonl = `{"type":"user","message":{"role":"user","content":"hello"}}`;

    const tarball = createTestTarball([{ name: "session.jsonl", content: jsonl }]);

    await expect(extractTarball(tarball)).rejects.toThrow("Missing metadata.txt in tarball");
  });

  it("throws error when JSONL file is missing", async () => {
    const metadata = `BUNDLE_VERSION=1
SESSION_ID=test-session-123
AGENT=CC
AGENT_VERSION=1.0.0
GENERATED_AT=2025-01-10T12:00:00Z`;

    const tarball = createTestTarball([{ name: "metadata.txt", content: metadata }]);

    await expect(extractTarball(tarball)).rejects.toThrow("Missing JSONL file in tarball");
  });

  it("ignores JSONL files in subdirectories", async () => {
    const metadata = `BUNDLE_VERSION=1
SESSION_ID=test-session-123
AGENT=CC
AGENT_VERSION=1.0.0
GENERATED_AT=2025-01-10T12:00:00Z`;

    const tarball = createTestTarball([
      { name: "metadata.txt", content: metadata },
      { name: "subdir/session.jsonl", content: "should be ignored" },
    ]);

    await expect(extractTarball(tarball)).rejects.toThrow("Missing JSONL file in tarball");
  });

  it("parses metadata with missing optional fields", async () => {
    const metadata = `BUNDLE_VERSION=1
SESSION_ID=minimal-session`;

    const jsonl = `{"type":"user"}`;

    const tarball = createTestTarball([
      { name: "metadata.txt", content: metadata },
      { name: "session.jsonl", content: jsonl },
    ]);

    const result = await extractTarball(tarball);

    expect(result.metadata.bundleVersion).toBe(1);
    expect(result.metadata.sessionId).toBe("minimal-session");
    expect(result.metadata.agent).toBe("");
    expect(result.metadata.agentVersion).toBe("");
    expect(result.metadata.generatedAt).toBe("");
  });
});
