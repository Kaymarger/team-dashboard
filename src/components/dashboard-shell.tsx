"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Briefcase,
  FolderOpen,
  Gauge,
  History,
  Home,
  LineChart,
  LogOut,
  Power,
  Search,
  Users,
} from "lucide-react";
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

const nav = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "requests", label: "Requests", icon: Gauge },
  { id: "listings", label: "Listings", icon: Briefcase },
  { id: "transactions", label: "Transactions", icon: LineChart },
  { id: "team", label: "Team", icon: Users },
];

const linkIcons = [FolderOpen, LineChart, Home, History];

function StatPanel({ label, value, marker }: { label: string; value: string; marker: string }) {
  return (
    <section className="rounded-2xl bg-[#383d50] px-5 py-5">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-[3px]" style={{ background: marker }} aria-hidden />
        <p className="text-xs text-[#b7b3ab]">{label}</p>
      </div>
      <p className="mt-4 text-5xl font-light tracking-tight text-white sm:text-6xl">{value}</p>
    </section>
  );
}

export function DashboardShell({
  greeting,
  dateLabel,
  ytd,
  dates,
  listings,
  listingsError,
  listingsFailed,
  pendingSubjects,
  outstandingNotary,
}: {
  greeting: string;
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
    <div className="min-h-screen md:pl-[76px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center bg-[#33384a] py-5 md:flex">
        <Image src={brand.logo} alt="" width={36} height={36} className="h-9 w-9 rounded-full bg-white object-contain p-1" />
        <nav className="mt-8 flex flex-1 flex-col items-center gap-2" aria-label="Sections">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-label={item.label}
                title={item.label}
                className="flex size-11 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/5 hover:text-[#d4b483] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
              >
                <Icon className="size-5" strokeWidth={1.6} />
              </a>
            );
          })}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="flex size-11 items-center justify-center rounded-xl text-white/80 hover:bg-white/5 hover:text-[#d4b483] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
          >
            <Power className="size-5" strokeWidth={1.6} />
          </button>
        </form>
      </aside>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 pb-28 sm:px-6 md:pb-10">
        <header id="overview" className="scroll-mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#d4b483] text-sm font-semibold text-[#2b2f3e]">
              AR
            </span>
            <div>
              <p className="text-lg text-white">{greeting}, team</p>
              <p className="text-sm text-[#b7b3ab]">{dateLabel}</p>
            </div>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6d717c]" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-11 w-full rounded-xl bg-white pr-3 pl-10 text-sm text-[#2b2f3e] outline-none placeholder:text-[#8d918c] focus-visible:ring-2 focus-visible:ring-[#d4b483]"
            />
          </label>
        </header>

        <h1 className="text-4xl font-light tracking-tight text-white sm:text-5xl">Team Overview</h1>

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatPanel label="Transactions YTD" value={ytd ?? "—"} marker="#d4b483" />
            <StatPanel label="Active Listings" value={String(listings.length)} marker="#c4b49a" />
            <StatPanel label="Pending Subjects" value={String(pendingSubjects.length)} marker="#a3b18a" />
            <StatPanel label="Outstanding Notary" value={String(outstandingNotary.length)} marker="#b7a99a" />
          </div>
          <section className="rounded-2xl bg-[#383d50] p-5 xl:row-span-1">
            <p className="text-xs tracking-[0.16em] text-[#9a9eae] uppercase">Important Dates</p>
            <div className="mt-4">
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

        <section id="current-listings" className="scroll-mt-24 rounded-2xl bg-[#383d50] p-5">
          <h2 className="text-[0.7rem] font-medium tracking-[0.22em] text-[#9a9eae] uppercase">Current Listings</h2>
          <div className="mt-4">
            <ListingsCard listings={shownListings} error={listingsFailed ? listingsError : null} />
          </div>
        </section>

        <section className="rounded-2xl bg-[#383d50] p-5">
          <h2 className="text-[0.7rem] font-medium tracking-[0.22em] text-[#9a9eae] uppercase">Quick Links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickLinks.map((link, index) => {
              const Icon = linkIcons[index] ?? FolderOpen;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-[#f7f5f2] transition hover:border-[#d4b483]/60 hover:text-[#d4b483] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
                >
                  <Icon className="size-4" aria-hidden />
                  {link.label}
                </a>
              );
            })}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around bg-[#33384a] px-2 py-2 md:hidden" aria-label="Sections">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-label={item.label}
              className="flex size-11 items-center justify-center rounded-xl text-white"
            >
              <Icon className="size-5" strokeWidth={1.6} />
            </a>
          );
        })}
        <form action={logout}>
          <button type="submit" aria-label="Sign out" className="flex size-11 items-center justify-center rounded-xl text-white">
            <LogOut className="size-5" strokeWidth={1.6} />
          </button>
        </form>
      </nav>
    </div>
  );
}
