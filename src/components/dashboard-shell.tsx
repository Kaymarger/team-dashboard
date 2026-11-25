"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ClipboardList,
  DollarSign,
  FolderOpen,
  History,
  Home,
  LineChart,
  LogOut,
  Plane,
  Scale,
  Search,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { ActionBoard } from "@/components/action-board";
import { ListingsCard } from "@/components/listings-card";
import { AwayList, NotaryList, PendingList, UpcomingDates } from "@/components/readouts";
import { brand } from "@/config/brand";
import { quickLinks } from "@/config/links";
import type { AwayAgent, ImportantDate, OutstandingNotary, PendingSubject } from "@/lib/sheet-tables";

type ListingRow = {
  address: string;
  mls: string;
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

const linkIcons = [FolderOpen, LineChart, Home, History];

const cardClass =
  "rounded-2xl border border-[#e6e1d8] bg-white shadow-[0_1px_2px_rgba(28,28,28,0.04),0_12px_32px_rgba(28,28,28,0.05)]";

const searchClass =
  "h-11 w-full rounded-full border border-[#e6e1d8] bg-[#f7f6f3] pr-4 pl-10 text-base text-[#1c1c1c] outline-none transition placeholder:text-[#716c65] focus-visible:border-[#a8875a] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#a8875a]/40 sm:text-sm";

function SectionCard({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: LucideIcon;
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className={`${cardClass} min-w-0 p-4 sm:p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#f6f3ee] text-[#876c47]">
            <Icon className="size-4" aria-hidden />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-[#1c1c1c]">{title}</h2>
        </div>
        {typeof count === "number" ? (
          <span className="text-xs font-medium text-[#716c65]">{count}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function HeroStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <section className={`${cardClass} relative min-w-0 overflow-hidden p-5 sm:p-6`}>
      <span className="absolute top-0 left-0 h-full w-1 bg-[#a8875a]" aria-hidden />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-[#876c47] uppercase">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1c1c1c] tabular-nums sm:text-4xl">{value}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f3ece3] text-[#876c47]">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </section>
  );
}

export function DashboardShell({
  dateLabel,
  today,
  ytd,
  teamVolume,
  away,
  dates,
  listings,
  listingsError,
  listingsFailed,
  pendingSubjects,
  outstandingNotary,
}: {
  dateLabel: string;
  today: string;
  ytd: string | null;
  teamVolume: string | null;
  away: AwayAgent[];
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
  const upcomingCount = dates.filter((item) => item.when !== "past").length;

  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-[#e6e1d8]/90 bg-white/85 backdrop-blur-md">
        <div className="mx-auto w-full min-w-0 max-w-[1200px] pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] sm:px-6">
          <div className="flex items-center gap-3 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Image
                src={brand.logo}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-xl border border-[#e6e1d8] bg-white object-contain p-1"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-[#1c1c1c]">{brand.group}</p>
                <p className="truncate text-xs text-[#716c65]">Team Dashboard</p>
              </div>
            </div>
            <label className="relative hidden w-64 shrink-0 md:block">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#716c65]" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search listings and actions"
                className={searchClass}
              />
            </label>
            <form action={logout} className="shrink-0">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#e6e1d8] bg-white px-3 text-sm font-medium text-[#3f3f3f] transition hover:border-[#1c1c1c] hover:text-[#1c1c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
          <label className="relative block pb-3 md:hidden">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#716c65]" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className={searchClass}
            />
          </label>
        </div>
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-[1200px] flex-col gap-8 pt-6 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:px-6 sm:pt-8 sm:pb-10">
        <div id="overview" className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1c1c1c] sm:text-3xl">Team Overview</h1>
            <p className="mt-1 text-sm text-[#716c65]">{dateLabel}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <HeroStat label="Transactions YTD" value={ytd ?? "—"} icon={TrendingUp} />
          <HeroStat label="Team Volume YTD" value={teamVolume ?? "—"} icon={DollarSign} />
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-2">
          <SectionCard icon={CalendarDays} title="Important Dates" count={upcomingCount}>
            <UpcomingDates dates={dates} today={today} />
          </SectionCard>
          <SectionCard icon={Plane} title="Out of Town" count={away.length}>
            <AwayList people={away} today={today} />
          </SectionCard>
          <SectionCard icon={ClipboardList} title="Pending Subjects" count={pendingSubjects.length}>
            <PendingList rows={pendingSubjects} today={today} />
          </SectionCard>
          <SectionCard icon={Scale} title="Outstanding Notary" count={outstandingNotary.length}>
            <NotaryList rows={outstandingNotary} today={today} />
          </SectionCard>
        </div>

        <section className="min-w-0">
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-[#1c1c1c]">Actions</h2>
          <ActionBoard
            query={query}
            listings={shownListings}
            listingsFailed={listingsFailed}
            pendingSubjects={pendingSubjects}
            outstandingNotary={outstandingNotary}
          />
        </section>

        <section id="current-listings" className={`${cardClass} min-w-0 scroll-mt-24 p-4 sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#f6f3ee] text-[#876c47]">
                <Home className="size-4" aria-hidden />
              </span>
              <h2 className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Current Listings</h2>
            </div>
            <span className="text-xs font-medium text-[#716c65]">{shownListings.length}</span>
          </div>
          <ListingsCard listings={shownListings} error={listingsFailed ? listingsError : null} />
        </section>

        <section className={`${cardClass} min-w-0 p-4 sm:p-5`}>
          <h2 className="text-sm font-semibold tracking-tight text-[#1c1c1c]">Quick Links</h2>
          <div className="mt-4 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {quickLinks.map((link, index) => {
              const Icon = linkIcons[index] ?? FolderOpen;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#e6e1d8] bg-[#f7f6f3] px-4 text-sm font-medium text-[#1c1c1c] transition hover:border-[#1c1c1c] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]"
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
