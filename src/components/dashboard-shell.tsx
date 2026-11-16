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

const panelClass =
  "rounded-xl border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(28,28,28,0.04),0_8px_24px_rgba(28,28,28,0.04)]";

const searchClass =
  "w-full rounded-lg border border-[#d9d5cd] bg-white pr-3 pl-9 text-base text-[#1c1c1c] outline-none placeholder:text-[#716c65] focus-visible:border-[#a8875a] focus-visible:ring-2 focus-visible:ring-[#a8875a]/40";

function StatPanel({ label, value }: { label: string; value: string }) {
  return (
    <section className={`${panelClass} min-w-0 px-3 py-3 sm:px-4 sm:py-4`}>
      <p className="text-[0.62rem] font-medium leading-tight tracking-[0.08em] text-[#876c47] uppercase sm:text-[0.68rem] sm:tracking-[0.14em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2326] sm:text-3xl">{value}</p>
      <span className="mt-3 block h-0.5 w-8 rounded-full bg-[#a8875a]" aria-hidden />
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
      <header className="border-b border-[#e5e2dc] bg-white">
        <div className="mx-auto w-full min-w-0 max-w-[1200px] pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-4 pl-[max(1rem,env(safe-area-inset-left))] sm:px-6 sm:pt-6 sm:pb-4">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Image
                src={brand.logo}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-md border border-[#e5e2dc] bg-white object-contain p-0.5"
              />
              <p className="truncate text-sm text-[#1c1c1c]">
                {brand.group} · Team Dashboard
              </p>
            </div>
            <label className="relative hidden w-56 shrink-0 sm:block">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#716c65]" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className={`h-10 ${searchClass} sm:text-sm`}
              />
            </label>
            <form action={logout} className="shrink-0">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-[#3a3a3a] hover:text-[#1c1c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
          <label className="relative mt-3 block sm:hidden">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#716c65]" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className={`h-11 ${searchClass}`}
            />
          </label>
        </div>
      </header>
      <div className="mx-auto flex w-full min-w-0 max-w-[1200px] flex-col gap-6 pt-6 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:px-6 sm:pt-6 sm:pb-6">

        <div id="overview">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c]">Team Overview</h1>
          <p className="mt-1 text-sm text-[#716c65]">{dateLabel}</p>
        </div>

        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <StatPanel label="Transactions YTD" value={ytd ?? "—"} />
            <StatPanel label="Active Listings" value={String(listings.length)} />
            <StatPanel label="Pending Subjects" value={String(pendingSubjects.length)} />
            <StatPanel label="Outstanding Notary" value={String(outstandingNotary.length)} />
          </div>
          <section className={`${panelClass} min-w-0 p-4`}>
            <p className="text-[0.68rem] font-medium tracking-[0.14em] text-[#876c47] uppercase">Important Dates</p>
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
          <h2 className="text-[0.68rem] font-medium tracking-[0.14em] text-[#876c47] uppercase">Current Listings</h2>
          <div className="mt-4">
            <ListingsCard listings={shownListings} error={listingsFailed ? listingsError : null} />
          </div>
        </section>

        <section className={`${panelClass} min-w-0 p-4`}>
          <h2 className="text-[0.68rem] font-medium tracking-[0.14em] text-[#876c47] uppercase">Quick Links</h2>
          <div className="mt-4 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {quickLinks.map((link, index) => {
              const Icon = linkIcons[index] ?? FolderOpen;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#e5e2dc] bg-white px-4 text-sm text-[#1c1c1c] transition hover:border-[#1f2326] hover:bg-[#f1efea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]"
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
