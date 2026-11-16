/** Base64 characters per sheet cell. Sheets allows 50,000; stay under that. */
export const SCREENSHOT_CHUNK_CHARS = 45_000;

/** Reject when the combined JPEG base64 is over about 1.5 MB. */
export const MAX_ENCODED_CHARS = Math.floor(1.5 * 1024 * 1024);

export const MAX_SCREENSHOTS = 3;

export const TICKET_HEADERS = [
  "timestamp",
  "agent",
  "issue",
  "screenshot_count",
  "ticket_id",
  "status",
] as const;

export const SCREENSHOT_PREFIX = [
  "ticket_id",
  "image_index",
  "filename",
  "mime_type",
  "chunk_count",
] as const;

export const STORED_SCREENSHOT_MIME = "image/jpeg";

export function createTicketId(now: number, suffix: string): string {
  return `T${now}${suffix}`;
}

export function splitBase64(value: string, size = SCREENSHOT_CHUNK_CHARS): string[] {
  if (!value) return [];
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}

export function screenshotHeaders(chunkCount: number): string[] {
  const headers: string[] = [...SCREENSHOT_PREFIX];
  for (let index = 1; index <= chunkCount; index += 1) headers.push(`chunk_${index}`);
  return headers;
}

export function jpegFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "";
  const stem = base.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, " ").trim().slice(0, 80);
  return `${stem || "screenshot"}.jpg`;
}

export function normalizeBase64(value: string): string {
  const trimmed = value.trim().replace(/\s/g, "");
  const comma = trimmed.indexOf(",");
  if (trimmed.startsWith("data:") && comma !== -1) return trimmed.slice(comma + 1);
  return trimmed;
}

export function isRawBase64(value: string): boolean {
  if (!value || value.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}

export type PreparedScreenshot = {
  filename: string;
  mimeType: string;
  chunks: string[];
};

/** Check the uploaded JPEGs and split each one into sheet cells. Image index starts at 1. */
export function prepareScreenshots(
  shots: { filename?: string; base64?: string }[],
): PreparedScreenshot[] {
  if (shots.length > MAX_SCREENSHOTS) {
    throw new Error("You can attach up to 3 screenshots.");
  }
  let total = 0;
  const prepared: PreparedScreenshot[] = [];
  for (const shot of shots) {
    const data = normalizeBase64(String(shot.base64 ?? ""));
    if (!isRawBase64(data)) {
      throw new Error("One of the screenshots could not be read. Try a JPG or PNG.");
    }
    total += data.length;
    prepared.push({
      filename: jpegFilename(String(shot.filename ?? "")),
      mimeType: STORED_SCREENSHOT_MIME,
      chunks: splitBase64(data),
    });
  }
  if (total > MAX_ENCODED_CHARS) {
    throw new Error("Those screenshots are too large to send. Try fewer or smaller photos.");
  }
  return prepared;
}

export function screenshotRow(
  ticketId: string,
  imageIndex: number,
  shot: PreparedScreenshot,
): Record<string, string> {
  const values: Record<string, string> = {
    ticket_id: ticketId,
    image_index: String(imageIndex),
    filename: shot.filename,
    mime_type: shot.mimeType,
    chunk_count: String(shot.chunks.length),
  };
  shot.chunks.forEach((chunk, index) => {
    values[`chunk_${index + 1}`] = chunk;
  });
  return values;
}
