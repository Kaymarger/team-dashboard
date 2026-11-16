import Image from "next/image";
import { connection } from "next/server";
import { ActionBoard } from "@/components/action-board";
import { ListingsCard } from "@/components/listings-card";
import { ImportantDates, Section, TransactionsCard } from "@/components/readouts";
import { SignOutButton } from "@/components/sign-out-button";
import { brand } from "@/config/brand";
import { quickLinks } from "@/config/links";
import { fileFor, loadDashboard } from "@/lib/dashboard";
import { visibleListings } from "@/lib/parse-listings";

export const dynamic = "force-dynamic";

function greeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Vancouver",
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  await connection();
  const data = await loadDashboard();
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={brand.logo}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#294c7d]">{greeting()}</p>
            <h1 className="truncate font-heading text-2xl font-semibold tracking-tight text-[#0e1a2b]">
              {brand.name}
            </h1>
            <p className="truncate text-sm text-[#5c5c5c]">{brand.group}</p>
          </div>
        </div>
        <SignOutButton />
      </header>

      {data.sheetError ? (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          {data.sheetError}
        </p>
      ) : null}

      <TransactionsCard value={data.transactionsYtd} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-8">
        <ActionBoard
          listings={listings}
          listingsFailed={listingsFailed}
          pendingSubjects={data.pendingSubjects}
          outstandingNotary={data.outstandingNotary}
        />
        <div className="flex flex-col gap-6">
          <Section title="Important Dates">
            <ImportantDates dates={data.dates} />
          </Section>
          <Section title="Current Listings">
            <ListingsCard listings={listings} error={listingsFailed ? data.listingsError : null} />
          </Section>
        </div>
      </div>

      <nav aria-label="Quick Links" className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="text-sm font-semibold text-[#5c5c5c]">Quick Links</span>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full border border-[#e6e9f0] bg-white px-4 text-sm font-medium text-[#294c7d] shadow-sm hover:border-[#294c7d]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
