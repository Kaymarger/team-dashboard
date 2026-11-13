import { unstable_cache } from "next/cache";
import { parseFeaturedHtml, type ScrapedListing } from "@/lib/parse-listings";

export const FEATURED_LISTINGS_URL =
  "https://archibaldrealestate.ca/featured-properties/";

const CACHE_SECONDS = 60 * 60;

async function scrapeFeatured(): Promise<ScrapedListing[]> {
  const res = await fetch(FEATURED_LISTINGS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent":
        "Mozilla/5.0 (compatible; AREGTeamDashboard/1.0; +https://archibaldrealestate.ca)",
    },
  });
  const html = await res.text();
  if (!res.ok) {
    throw new Error(`The listings page replied HTTP ${res.status}.`);
  }
  const parsed = parseFeaturedHtml(html);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.listings;
}

const cachedScrape = unstable_cache(scrapeFeatured, ["areg-featured-listings"], {
  revalidate: CACHE_SECONDS,
});

const failureGlobal = globalThis as typeof globalThis & {
  __areg_listings_failure__?: { at: number; error: string };
};

/** Active listings from the public featured-properties page, cached for about an hour. */
export async function getActiveListings(): Promise<
  { ok: true; listings: ScrapedListing[] } | { ok: false; listings: []; error: string }
> {
  const recent = failureGlobal.__areg_listings_failure__;
  if (recent && Date.now() - recent.at < 2 * 60 * 1000) {
    return { ok: false, listings: [], error: recent.error };
  }
  try {
    const listings = await cachedScrape();
    failureGlobal.__areg_listings_failure__ = undefined;
    return { ok: true, listings };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The listings page took too long to answer."
        : error instanceof Error
          ? error.message
          : "The listings page could not be read.";
    failureGlobal.__areg_listings_failure__ = { at: Date.now(), error: message };
    return { ok: false, listings: [], error: message };
  }
}
