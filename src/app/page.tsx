import { connection } from "next/server";
import { DashboardShell } from "@/components/dashboard-shell";
import { fileFor, loadDashboard } from "@/lib/dashboard";
import { visibleListings } from "@/lib/parse-listings";
import { previewDashboard } from "@/lib/preview-dashboard";
import { vancouverToday } from "@/lib/sheet-tables";

export const dynamic = "force-dynamic";

function todayLabel(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
}

export default async function HomePage() {
  await connection();
  const data = previewDashboard() ?? (await loadDashboard());
  const chosen = visibleListings(
    data.listings,
    data.listingFiles.map((file) => file.address),
  );
  const listings = chosen.map((listing) => ({
    address: listing.address,
    mls: listing.mls,
    mlsUrl: fileFor(listing.address, data.listingFiles, "mls"),
    strataUrl: fileFor(listing.address, data.listingFiles, "strata"),
    mediaUrl: fileFor(listing.address, data.listingFiles, "media"),
  }));
  const listingsFailed =
    chosen.length === 0 && Boolean(data.listingsError) && data.listingFiles.length === 0;

  return (
    <>
      {data.sheetError ? (
        <p className="mx-auto mt-4 w-[min(100%-2rem,72rem)] rounded-2xl border border-[#e5e2dc] bg-[#f6f1ea] px-4 py-3 text-sm text-[#6b3a2e]" role="alert">
          {data.sheetError}
        </p>
      ) : null}
      <DashboardShell
        dateLabel={todayLabel()}
        today={vancouverToday()}
        ytd={data.transactionsYtd}
        teamVolume={data.teamVolume}
        away={data.away}
        dates={data.dates}
        listings={listings}
        listingsError={data.listingsError}
        listingsFailed={listingsFailed}
        pendingSubjects={data.pendingSubjects}
        outstandingNotary={data.outstandingNotary}
      />
    </>
  );
}
