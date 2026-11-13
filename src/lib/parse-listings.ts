export type ScrapedListing = {
  address: string;
  mls: string;
};

const MLS_RE = /MLS\s*®?\s*(?:#|Num:)\s*([A-Z]{1,3}\d{4,})/gi;

export function isCloudflareChallenge(html: string): boolean {
  const sample = html.slice(0, 4000).toLowerCase();
  return (
    sample.includes("just a moment") ||
    sample.includes("cf-mitigated") ||
    sample.includes("cdn-cgi/challenge-platform") ||
    sample.includes("cf-chl")
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr|article|section)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#174;|&reg;/gi, "®")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function cleanPiece(value: string): string {
  return value.replace(/\s+/g, " ").replace(/^[#*\s]+/, "").trim();
}

export function addressFromHeading(heading: string): string | null {
  const withoutMls = cleanPiece(
    heading.replace(/MLS\s*®?\s*(?:#|Num:)\s*[A-Z]{1,3}\d{4,}/gi, " "),
  );
  const tail = withoutMls.length > 280 ? withoutMls.slice(-280) : withoutMls;
  const inCity = tail.match(/([0-9][^:\n]{2,90}?)\s+in\s+([A-Za-z][^:\n]{1,40}?)\s*:/);
  if (inCity) {
    const street = cleanPiece(inCity[1]);
    const city = cleanPiece(inCity[2]);
    if (street.length >= 4 && city.length >= 2) return `${street}, ${city}`;
  }
  const simple = tail.match(/([0-9][^:\n]{2,80}?)\s*:/);
  if (simple) {
    const street = cleanPiece(simple[1]);
    const parens = [...tail.matchAll(/\(([^)]+)\)/g)];
    const city = parens.length ? cleanPiece(parens[parens.length - 1][1]) : "";
    if (street.length >= 4) return city ? `${street}, ${city}` : street;
  }
  return null;
}

function statusFor(text: string, index: number, length: number): string | null {
  const afterStart = index + length;
  const nextMls = text.slice(afterStart).search(/MLS\s*®?/i);
  const afterEnd = nextMls >= 0 ? afterStart + nextMls : Math.min(text.length, afterStart + 600);
  const forward = text.slice(afterStart, afterEnd).match(/Status:\s*([A-Za-z]+)/i);
  if (forward) return forward[1].toLowerCase();

  const before = text.slice(0, index);
  const prev = before.toLowerCase().lastIndexOf("mls");
  const backward = [...text.slice(Math.max(0, prev), index).matchAll(/Status:\s*([A-Za-z]+)/gi)];
  const last = backward.at(-1);
  return last ? last[1].toLowerCase() : null;
}

/**
 * Pull active listings from the featured-properties HTML.
 * Returns ok:false when the page is a bot challenge or nothing could be read.
 */
export function parseFeaturedHtml(
  html: string,
): { ok: true; listings: ScrapedListing[] } | { ok: false; error: string } {
  if (!html || !html.trim()) {
    return { ok: false, error: "The listings page was empty." };
  }
  if (isCloudflareChallenge(html)) {
    return { ok: false, error: "The listings page asked for a browser check." };
  }
  const text = stripHtml(html);
  const listings: ScrapedListing[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(MLS_RE)) {
    const mls = match[1]?.toUpperCase();
    const index = match.index ?? 0;
    if (!mls || seen.has(mls)) continue;
    const status = statusFor(text, index, match[0].length);
    if (status && status !== "active") continue;
    const lineStart = text.lastIndexOf("\n", index) + 1;
    const heading = text.slice(lineStart, index + match[0].length);
    const address = addressFromHeading(heading);
    if (!address) continue;
    seen.add(mls);
    listings.push({ address, mls });
  }
  if (!listings.length) {
    return { ok: false, error: "No active listings could be read from the page." };
  }
  return { ok: true, listings };
}

export function normalizeAddress(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(mls[^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function addressesMatch(left: string, right: string): boolean {
  const a = normalizeAddress(left);
  const b = normalizeAddress(right);
  if (a.length < 8 || b.length < 8) return false;
  return a === b || a.includes(b) || b.includes(a);
}
