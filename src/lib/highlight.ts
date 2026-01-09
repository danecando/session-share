import { bundledLanguages, codeToHtml } from "shiki";
import type { BundledLanguage } from "shiki";

const supportedLanguages = new Set(Object.keys(bundledLanguages));

export function isSupportedLanguage(lang: string): lang is BundledLanguage {
  return supportedLanguages.has(lang);
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  if (!isSupportedLanguage(lang)) {
    // Return escaped HTML for unsupported languages
    return escapeHtml(code);
  }

  return codeToHtml(code, {
    lang,
    theme: "github-dark-high-contrast",
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
