// Minimal CSV helpers for client-side export (no dependency, static-export safe).

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote if it contains a comma, quote, or newline; double internal quotes.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build a CSV string from a header row + array of row objects keyed by header. */
export function toCSV<T>(
  headers: { key: keyof T; label: string }[],
  rows: T[]
): string {
  const head = headers.map((h) => escapeCell(h.label)).join(",");
  const body = rows
    .map((r) => headers.map((h) => escapeCell(r[h.key])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

/** Trigger a browser download of an already-built Blob as `filename`. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Trigger a browser download of `content` as `filename`. */
export function downloadCSV(filename: string, content: string): void {
  // Prepend a UTF-8 BOM so Excel opens Hebrew/accented text correctly.
  downloadBlob(filename, new Blob(["﻿", content], { type: "text/csv;charset=utf-8;" }));
}

/** Filesystem-safe slug for a patient name/email used in export filenames. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "patient";
}
