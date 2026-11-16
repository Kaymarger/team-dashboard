"use client";

import { useEffect, useId, useState } from "react";
import {
  BookOpen,
  Building2,
  CalendarRange,
  Camera,
  DoorOpen,
  ClipboardX,
  FileSpreadsheet,
  Files,
  Home,
  KeyRound,
  LifeBuoy,
  MessageSquareText,
  Scale,
  X,
  type LucideIcon,
} from "lucide-react";
import { CloseFormContext } from "@/components/form-feedback";
import { RequestFormPanel } from "@/components/request-forms";
import { openHouseLink } from "@/config/links";
import type { OutstandingNotary, PendingSubject } from "@/lib/sheet-tables";
import type { ScrapedListing } from "@/lib/parse-listings";

type LinkedListing = ScrapedListing & {
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

type Tile = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
};

const groups: { label: string; tiles: Tile[] }[] = [
  {
    label: "Requests",
    tiles: [
      { id: "pond", label: "Request Pond Access", description: "Ask to be added to the pond.", icon: KeyRound },
      { id: "open-house", label: "Open House Availability", description: "Open the shared availability form.", icon: DoorOpen, href: openHouseLink.href },
      { id: "buyers-guide", label: "Buyer's Guide", description: "Request printed buyer's guides.", icon: BookOpen },
      { id: "feature-sheets", label: "Feature Sheets", description: "Request feature sheet copies.", icon: Files },
      { id: "cinc-ticket", label: "Send CINC Support Ticket", description: "Tell us what isn't working in CINC.", icon: LifeBuoy },
    ],
  },
  {
    label: "Listings",
    tiles: [
      { id: "new-listing", label: "New Listing", description: "Start the new-listing checklist.", icon: Home },
      { id: "mls", label: "MLS Sheets", description: "Open MLS sheets for active listings.", icon: FileSpreadsheet },
      { id: "strata", label: "Strata Documents", description: "Open strata documents for active listings.", icon: Building2 },
      { id: "listing-media", label: "Listing Media", description: "Open photos and media for active listings.", icon: Camera },
    ],
  },
  {
    label: "Transactions",
    tiles: [
      { id: "notary", label: "Notary Info", description: "Send notary details for a file.", icon: Scale },
      { id: "remove-subjects", label: "Remove Subjects", description: "Record a subject removal.", icon: ClipboardX },
    ],
  },
  {
    label: "Team",
    tiles: [
      { id: "vacation", label: "Submit Vacation Days", description: "Let the team know you'll be away.", icon: CalendarRange },
      { id: "meeting-topic", label: "Team Meeting Topic", description: "Suggest something for the next meeting.", icon: MessageSquareText },
    ],
  },
];

const tiles = groups.flatMap((group) => group.tiles);

const tileClass =
  "group flex min-h-16 w-full items-start gap-3 rounded-2xl border border-[#e6e9f0] bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(14,26,43,0.05)] transition hover:-translate-y-0.5 hover:border-[#294c7d]/30 hover:shadow-[0_14px_34px_rgba(14,26,43,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2";

function fileHref(listing: LinkedListing, id: string): string {
  if (id === "mls") return listing.mlsUrl;
  if (id === "strata") return listing.strataUrl;
  return listing.mediaUrl;
}

function ListingFileDialog({
  listings,
  tileId,
  linkLabel,
}: {
  listings: LinkedListing[];
  tileId: string;
  linkLabel: string;
}) {
  if (!listings.length) {
    return <p className="text-sm text-[#5c5c5c]">No active listings right now.</p>;
  }
  return (
    <ul className="space-y-2">
      {listings.map((listing) => {
        const href = fileHref(listing, tileId).trim();
        return (
          <li
            key={`${listing.mls}:${listing.address}`}
            className="flex flex-col gap-1 rounded-xl border border-[#e7ebf2] bg-[#f8fafc] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-[#0e1a2b]">{listing.address}</span>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-full bg-[#e7eef8] px-3 text-xs font-semibold text-[#294c7d] hover:bg-[#294c7d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d]"
              >
                {linkLabel}
              </a>
            ) : (
              <span className="text-sm text-[#5c5c5c]">Not available yet</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ActionBoard({
  listings,
  listingsFailed,
  pendingSubjects,
  outstandingNotary,
}: {
  listings: LinkedListing[];
  listingsFailed: boolean;
  pendingSubjects: PendingSubject[];
  outstandingNotary: OutstandingNotary[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const titleId = useId();
  const openTile = tiles.find((tile) => tile.id === openId && !tile.href) ?? null;

  useEffect(() => {
    if (!openTile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [openTile]);

  return (
    <>
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.label} aria-labelledby={`group-${group.label}`}>
            <h2 id={`group-${group.label}`} className="text-sm font-semibold text-[#5c5c5c]">
              {group.label}
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.tiles.map((tile) => {
                const Icon = tile.icon;
                const inner = (
                  <>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e7eef8] text-[#294c7d] transition group-hover:bg-[#294c7d] group-hover:text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0e1a2b]">{tile.label}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-[#5c5c5c]">{tile.description}</span>
                    </span>
                  </>
                );
                if (tile.href) {
                  return (
                    <a key={tile.id} href={tile.href} target="_blank" rel="noopener noreferrer" className={tileClass}>
                      {inner}
                    </a>
                  );
                }
                return (
                  <button key={tile.id} type="button" className={tileClass} onClick={() => setOpenId(tile.id)}>
                    {inner}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {openTile ? (
        <div className="fixed inset-0 z-50 flex bg-[#0e1a2b]/40" onClick={() => setOpenId(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="ml-auto flex h-full w-full flex-col bg-white shadow-[0_24px_80px_rgba(14,26,43,0.24)] sm:max-w-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e6e9f0] px-5 py-4 sm:px-6">
              <div>
                <h2 id={titleId} className="font-heading text-xl font-semibold tracking-tight text-[#0e1a2b]">
                  {openTile.label}
                </h2>
                <p className="mt-1 text-sm text-[#5c5c5c]">{openTile.description}</p>
              </div>
              <button
                type="button"
                autoFocus
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#5c5c5c] hover:bg-[#f3f5f8] hover:text-[#0e1a2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d]"
                onClick={() => setOpenId(null)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <CloseFormContext.Provider value={() => setOpenId(null)}>
                {openTile.id === "mls" || openTile.id === "strata" || openTile.id === "listing-media" ? (
                  <ListingFileDialog listings={listings} tileId={openTile.id} linkLabel={openTile.label} />
                ) : (
                  <RequestFormPanel
                    key={openTile.id}
                    formId={openTile.id}
                    listings={listings}
                    listingsFailed={listingsFailed}
                    pendingSubjects={pendingSubjects}
                    outstandingNotary={outstandingNotary}
                  />
                )}
              </CloseFormContext.Provider>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
