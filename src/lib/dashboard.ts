import { readTabs, tabs } from "@/config/sheets";
import { addressesMatch } from "@/lib/parse-listings";
import { getActiveListings } from "@/lib/listings";
import { readTabRows, requireSheetId, SheetError } from "@/lib/google-sheets";
import {
  awayAgentsFrom,
  formatCurrency,
  importantDatesFrom,
  listingFilesFrom,
  outstandingNotaryFrom,
  pendingSubjectsFrom,
  statValueFrom,
  transactionsYtdFrom,
  type AwayAgent,
  type ImportantDate,
  type ListingFile,
  type OutstandingNotary,
  type PendingSubject,
} from "@/lib/sheet-tables";
import type { ScrapedListing } from "@/lib/parse-listings";

export type DashboardData = {
  sheetError: string | null;
  dates: ImportantDate[];
  transactionsYtd: string | null;
  teamVolume: string | null;
  away: AwayAgent[];
  listings: ScrapedListing[];
  listingsError: string | null;
  listingFiles: ListingFile[];
  outstandingNotary: OutstandingNotary[];
  pendingSubjects: PendingSubject[];
};

export function fileFor(
  address: string,
  files: ListingFile[],
  kind: "mls" | "strata" | "media",
): string {
  const hit = files.find((file) => addressesMatch(address, file.address));
  if (!hit) return "";
  if (kind === "mls") return hit.mlsUrl.trim();
  if (kind === "strata") return hit.strataUrl.trim();
  return hit.mediaUrl.trim();
}

export async function loadDashboard(): Promise<DashboardData> {
  const [sheet, listings] = await Promise.all([loadSheet(), getActiveListings()]);
  return {
    ...sheet,
    listings: listings.listings,
    listingsError: listings.ok ? null : listings.error,
  };
}

async function loadSheet(): Promise<Omit<DashboardData, "listings" | "listingsError">> {
  const empty = {
    sheetError: null as string | null,
    dates: [],
    transactionsYtd: null as string | null,
    teamVolume: null as string | null,
    away: [] as AwayAgent[],
    listingFiles: [],
    outstandingNotary: [],
    pendingSubjects: [],
  };
  try {
    const id = requireSheetId();
    const tables = await readTabRows(id, readTabs);
    return {
      sheetError: null,
      dates: importantDatesFrom(tables.get(tabs.importantDates) ?? []),
      transactionsYtd: transactionsYtdFrom(tables.get(tabs.stats) ?? []),
      teamVolume: formatCurrency(statValueFrom(tables.get(tabs.stats) ?? [], "team_volume_ytd")),
      away: awayAgentsFrom(tables.get(tabs.vacation) ?? []),
      listingFiles: listingFilesFrom(tables.get(tabs.listingFiles) ?? []),
      outstandingNotary: outstandingNotaryFrom(tables.get(tabs.outstandingNotary) ?? []),
      pendingSubjects: pendingSubjectsFrom(tables.get(tabs.pendingSubjects) ?? []),
    };
  } catch (error) {
    return {
      ...empty,
      sheetError:
        error instanceof SheetError || error instanceof Error
          ? error.message
          : "The team sheet could not be read.",
    };
  }
}
