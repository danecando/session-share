import { Readable } from "node:stream";
import { Parser } from "tar";
import { parseMetadataTxt } from "./bundle-metadata";
import type { BundleMetadata } from "./bundle-metadata";

// MARK: Types

export type ExtractedImage = {
  data: Buffer;
  mimeType: string;
};

export type ExtractedTarball = {
  metadata: BundleMetadata;
  jsonlContent: string;
  images: Map<string, ExtractedImage>;
  sourceJsonlContent?: string;
};

// MARK: Main Extraction Function

const IMAGE_EXTENSIONS: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function getMimeType(filename: string): string | null {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext ? (IMAGE_EXTENSIONS[ext] ?? null) : null;
}

export async function extractTarball(data: ArrayBuffer): Promise<ExtractedTarball> {
  return new Promise((resolve, reject) => {
    let metadata: BundleMetadata | null = null;
    let jsonlContent = "";
    let sourceJsonlContent: string | undefined;
    const images = new Map<string, ExtractedImage>();

    const parser = new Parser({
      onReadEntry: (entry) => {
        const name = entry.path.replace(/^\.\//, "");
        const chunks: Array<Buffer> = [];

        entry.on("data", (chunk: Buffer) => chunks.push(chunk));
        entry.on("end", () => {
          if (name === "metadata.txt") {
            const content = Buffer.concat(chunks).toString("utf-8");
            metadata = parseMetadataTxt(content);
          } else if (name.endsWith(".jsonl") && !name.includes("/")) {
            const content = Buffer.concat(chunks).toString("utf-8");
            jsonlContent = content;
          } else if (name === "source-session.jsonl") {
            sourceJsonlContent = Buffer.concat(chunks).toString("utf-8");
          } else if (name.startsWith("images/")) {
            const mimeType = getMimeType(name);
            if (mimeType) {
              // Store with original path (from images/ dir) as key
              const originalPath = name.slice("images/".length);
              images.set(originalPath, {
                data: Buffer.concat(chunks),
                mimeType,
              });
            }
          }
        });
      },
    });

    parser.on("end", () => {
      if (!metadata) {
        reject(new Error("Missing metadata.txt in tarball"));
      } else if (!jsonlContent) {
        reject(new Error("Missing JSONL file in tarball"));
      } else {
        resolve({ metadata, jsonlContent, images, sourceJsonlContent });
      }
    });

    parser.on("error", reject);

    // Convert ArrayBuffer to Node.js Readable stream and pipe to parser
    const readable = Readable.from(Buffer.from(data));
    readable.pipe(parser);
  });
}
