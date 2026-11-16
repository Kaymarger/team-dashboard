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

const tiles: Tile[] = [
  { id: "pond", label: "Request Pond Access", description: "Ask to be added to the pond.", icon: KeyRound },
  { id: "open-house", label: "Open House Availability", description: "Open the shared availability form.", icon: DoorOpen, href: openHouseLink.href },
  { id: "buyers-guide", label: "Buyer's Guide", description: "Request printed buyer's guides.", icon: BookOpen },
  { id: "feature-sheets", label: "Feature Sheets", description: "Request feature sheet copies.", icon: Files },
  { id: "new-listing", label: "New Listing", description: "Start the new-listing checklist.", icon: Home },
  { id: "mls", label: "MLS Sheets", description: "Open MLS sheets for active listings.", icon: FileSpreadsheet },
  { id: "strata", label: "Strata Documents", description: "Open strata documents for active listings.", icon: Building2 },
  { id: "listing-media", label: "Listing Media", description: "Open photos and media for active listings.", icon: Camera },
  { id: "notary", label: "Notary Info", description: "Send notary details for a file.", icon: Scale },
  { id: "remove-subjects", label: "Remove Subjects", description: "Record a subject removal.", icon: ClipboardX },
  { id: "vacation", label: "Submit Vacation Days", description: "Let the team know you'll be away.", icon: CalendarRange },
  { id: "meeting-topic", label: "Team Meeting Topic", description: "Suggest something for the next meeting.", icon: MessageSquareText },
  { id: "cinc-ticket", label: "Send CINC Support Ticket", description: "Tell us what isn't working in CINC.", icon: LifeBuoy },
];

const tileClass =
  "group flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-white/[0.06] bg-[#383d50] px-2.5 py-2 text-left transition hover:border-[#d4b483]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] sm:h-12 sm:py-0";

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
    return <p className="text-sm text-[#b7b3ab]">No active listings right now.</p>;
  }
  return (
    <ul className="space-y-2">
      {listings.map((listing) => {
        const href = fileHref(listing, tileId).trim();
        return (
          <li
            key={`${listing.mls}:${listing.address}`}
            className="flex min-w-0 flex-col gap-2 rounded-2xl bg-[#2b2f3e] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="min-w-0 text-sm font-medium break-words text-white">{listing.address}</span>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#d4b483]/50 px-3 text-sm font-medium text-[#d4b483] hover:bg-[#d4b483] hover:text-[#2b2f3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
              >
                {linkLabel}
              </a>
            ) : (
              <span className="text-sm text-[#b7b3ab]">Not available yet</span>
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
  query,
}: {
  listings: LinkedListing[];
  listingsFailed: boolean;
  pendingSubjects: PendingSubject[];
  outstandingNotary: OutstandingNotary[];
  query: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const titleId = useId();
  const q = query.trim().toLowerCase();
  const visibleTiles = tiles.filter(
    (tile) => !q || `${tile.label} ${tile.description}`.toLowerCase().includes(q),
  );
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
      <section id="actions" aria-label="Actions" className="min-w-0">
        {visibleTiles.length === 0 ? (
          <p className="text-sm text-[#b7b3ab]">No actions match that search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleTiles.map((tile) => {
              const Icon = tile.icon;
              const inner = (
                <>
                  <Icon className="size-4 shrink-0 text-[#d4b483]" strokeWidth={1.7} aria-hidden />
                  <span className="min-w-0 text-[0.8125rem] leading-snug font-medium break-words text-white sm:truncate sm:text-xs">{tile.label}</span>
                </>
              );
              if (tile.href) {
                return (
                  <a
                    key={tile.id}
                    href={tile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={tile.description}
                    className={tileClass}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <button
                  key={tile.id}
                  type="button"
                  title={tile.description}
                  className={tileClass}
                  onClick={() => setOpenId(tile.id)}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {openTile ? (
        <div className="fixed inset-0 z-50 flex bg-black/55 sm:justify-end" onClick={() => setOpenId(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex h-dvh w-full max-w-full flex-col bg-[#323746] pt-[env(safe-area-inset-top)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:ml-auto sm:h-full sm:max-w-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 id={titleId} className="text-xl font-light tracking-tight text-white sm:text-2xl">
                  {openTile.label}
                </h2>
                <p className="mt-1 text-sm text-[#b7b3ab]">{openTile.description}</p>
              </div>
              <button
                type="button"
                autoFocus
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#c9c6bf] hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]"
                onClick={() => setOpenId(null)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
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
