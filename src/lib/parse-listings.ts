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

const STREET_ALIASES: Record<string, string> = {
  avenue: "ave",
  ave: "ave",
  street: "st",
  st: "st",
  drive: "dr",
  dr: "dr",
  road: "rd",
  rd: "rd",
  boulevard: "blvd",
  blvd: "blvd",
  court: "ct",
  crt: "ct",
  ct: "ct",
  crescent: "cres",
  cres: "cres",
  place: "pl",
  pl: "pl",
  lane: "ln",
  ln: "ln",
  highway: "hwy",
  hwy: "hwy",
  terrace: "terr",
  terr: "terr",
  circle: "cir",
  cir: "cir",
  parkway: "pkwy",
  pkwy: "pkwy",
};

const STREET_LABELS: Record<string, string> = {
  ave: "Ave",
  st: "St",
  dr: "Dr",
  rd: "Rd",
  blvd: "Blvd",
  ct: "Ct",
  cres: "Cres",
  pl: "Pl",
  ln: "Ln",
  hwy: "Hwy",
  terr: "Terr",
  cir: "Cir",
  pkwy: "Pkwy",
  way: "Way",
  trail: "Trail",
};

const DIRECTIONALS = new Set(["N", "S", "E", "W", "NE", "NW", "SE", "SW"]);

const UPPER_TOKENS = new Set([
  "BC",
  "AB",
  "SK",
  "MB",
  "ON",
  "QC",
  "NB",
  "NS",
  "PE",
  "PEI",
  "NL",
  "YT",
  "NT",
  "NU",
  "MLS",
]);

export function normalizeAddress(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(mls[^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => STREET_ALIASES[word] ?? word)
    .join(" ");
}

function styleAddressToken(token: string): string {
  if (/^#?\d+$/.test(token)) return token;
  const ordinal = token.match(/^(\d+)(st|nd|rd|th)$/i);
  if (ordinal) return `${ordinal[1]}${ordinal[2].toLowerCase()}`;
  const upper = token.toUpperCase();
  if (DIRECTIONALS.has(upper)) return upper;
  if (UPPER_TOKENS.has(upper)) return upper;
  if (/^[A-Z]\d[A-Z]$/i.test(token) || /^\d[A-Z]\d$/i.test(token)) return upper;
  const street = STREET_ALIASES[token.toLowerCase()] ?? (STREET_LABELS[token.toLowerCase()] ? token.toLowerCase() : "");
  if (street && STREET_LABELS[street]) return STREET_LABELS[street];
  if (STREET_LABELS[token.toLowerCase()]) return STREET_LABELS[token.toLowerCase()];
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

/** Title case an address, keeping unit numbers and directionals uppercase. */
export function titleCaseAddress(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[A-Za-z0-9#]+/g, (token) => styleAddressToken(token));
}

/**
 * Addresses to show in Current Listings and Property dropdowns.
 * Listing Files wins when it has rows. An empty tab falls back to the scrape.
 */
export function visibleListings(
  scraped: ScrapedListing[],
  fileAddresses: string[],
): ScrapedListing[] {
  const files = fileAddresses.map((address) => address.trim()).filter(Boolean);
  if (!files.length) {
    return scraped.map((listing) => ({
      address: titleCaseAddress(listing.address),
      mls: listing.mls,
    }));
  }
  const seen = new Set<string>();
  const listings: ScrapedListing[] = [];
  for (const address of files) {
    const key = normalizeAddress(address);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const hit = scraped.find((listing) => addressesMatch(listing.address, address));
    listings.push({
      address: titleCaseAddress(address),
      mls: hit?.mls ?? "",
    });
  }
  return listings;
}

export function addressesMatch(left: string, right: string): boolean {
  const a = normalizeAddress(left);
  const b = normalizeAddress(right);
  if (a.length < 8 || b.length < 8) return false;
  return a === b || a.includes(b) || b.includes(a);
}
