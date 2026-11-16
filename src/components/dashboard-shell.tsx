"use client";

import { useState } from "react";
import Image from "next/image";
import { FolderOpen, History, Home, LineChart, LogOut, Search } from "lucide-react";
import { logout } from "@/app/login/actions";
import { ActionBoard } from "@/components/action-board";
import { ListingsCard } from "@/components/listings-card";
import { UpcomingDates } from "@/components/readouts";
import { brand } from "@/config/brand";
import { quickLinks } from "@/config/links";
import type { ImportantDate, OutstandingNotary, PendingSubject } from "@/lib/sheet-tables";

type ListingRow = {
  address: string;
  mls: string;
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

const linkIcons = [FolderOpen, LineChart, Home, History];

const panelClass = "rounded-xl border border-white/[0.06] bg-[#383d50]";

function StatPanel({ label, value }: { label: string; value: string }) {
  return (
    <section className={`${panelClass} min-w-0 px-3 py-3 sm:px-4 sm:py-4`}>
      <p className="text-[0.62rem] font-medium leading-tight tracking-[0.08em] text-[#d4b483] uppercase sm:text-[0.68rem] sm:tracking-[0.14em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</p>
    </section>
  );
}

export function DashboardShell({
  dateLabel,
  ytd,
  dates,
  listings,
  listingsError,
  listingsFailed,
  pendingSubjects,
  outstandingNotary,
}: {
  dateLabel: string;
  ytd: string | null;
  dates: ImportantDate[];
  listings: ListingRow[];
  listingsError: string | null;
  listingsFailed: boolean;
  pendingSubjects: PendingSubject[];
  outstandingNotary: OutstandingNotary[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shownListings = q
    ? listings.filter((listing) => `${listing.address} ${listing.mls}`.toLowerCase().includes(q))
    : listings;

  return (
    <div className="overflow-x-clip">
      <div className="mx-auto flex w-full min-w-0 max-w-[1200px] flex-col gap-6 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:px-6 sm:py-6">
        <header className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Image
                src={brand.logo}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-md bg-white object-contain p-0.5"
              />
              <p className="truncate text-sm text-[#f7f5f2]">
                {brand.group} · Team Dashboard
              </p>
            </div>
            <label className="relative hidden w-56 shrink-0 sm:block">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8d918c]" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#383d50] pr-3 pl-9 text-base text-white outline-none placeholder:text-[#8d918c] focus-visible:border-[#d4b483] focus-visible:ring-2 focus-visible:ring-[#d4b483]/40 sm:text-sm"
              />
            </label>
            <form action={logout} className="shrink-0">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-[#b7b3ab] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
          <label className="relative mt-3 block sm:hidden">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8d918c]" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-11 w-full rounded-lg border border-white/[0.06] bg-[#383d50] pr-3 pl-9 text-base text-white outline-none placeholder:text-[#8d918c] focus-visible:border-[#d4b483] focus-visible:ring-2 focus-visible:ring-[#d4b483]/40"
            />
          </label>
        </header>

        <div id="overview">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Team Overview</h1>
          <p className="mt-1 text-sm text-[#b7b3ab]">{dateLabel}</p>
        </div>

        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <StatPanel label="Transactions YTD" value={ytd ?? "—"} />
            <StatPanel label="Active Listings" value={String(listings.length)} />
            <StatPanel label="Pending Subjects" value={String(pendingSubjects.length)} />
            <StatPanel label="Outstanding Notary" value={String(outstandingNotary.length)} />
          </div>
          <section className={`${panelClass} min-w-0 p-4`}>
            <p className="text-[0.68rem] font-medium tracking-[0.14em] text-[#9a9eae] uppercase">Important Dates</p>
            <div className="mt-3">
              <UpcomingDates dates={dates} />
            </div>
          </section>
        </div>

        <ActionBoard
          query={query}
          listings={shownListings}
          listingsFailed={listingsFailed}
          pendingSubjects={pendingSubjects}
          outstandingNotary={outstandingNotary}
        />

        <section id="current-listings" className={`${panelClass} min-w-0 scroll-mt-24 p-4`}>
          <h2 className="text-[0.68rem] font-medium tracking-[0.14em] text-[#9a9eae] uppercase">Current Listings</h2>
          <div className="mt-4">
            <ListingsCard listings={shownListings} error={listingsFailed ? listingsError : null} />
          </div>
        </section>

        <section className={`${panelClass} min-w-0 p-4`}>
          <h2 className="text-[0.68rem] font-medium tracking-[0.14em] text-[#9a9eae] uppercase">Quick Links</h2>
          <div className="mt-4 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {quickLinks.map((link, index) => {
              const Icon = linkIcons[index] ?? FolderOpen;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-[#f7f5f2] transition hover:border-[#d4b483]/60 hover:text-[#d4b483] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
                >
                  <Icon className="size-4" aria-hidden />
                  {link.label}
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
