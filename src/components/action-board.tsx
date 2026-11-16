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
  icon: LucideIcon;
  href?: string;
};

const tiles: Tile[] = [
  { id: "pond", label: "Request Pond Access", icon: KeyRound },
  { id: "open-house", label: "Open House Availability", icon: DoorOpen, href: openHouseLink.href },
  { id: "notary", label: "Notary Info", icon: Scale },
  { id: "remove-subjects", label: "Remove Subjects", icon: ClipboardX },
  { id: "new-listing", label: "New Listing", icon: Home },
  { id: "buyers-guide", label: "Buyer's Guide", icon: BookOpen },
  { id: "feature-sheets", label: "Feature Sheets", icon: Files },
  { id: "mls", label: "MLS Sheets", icon: FileSpreadsheet },
  { id: "strata", label: "Strata Documents", icon: Building2 },
  { id: "listing-media", label: "Listing Media", icon: Camera },
  { id: "vacation", label: "Submit Vacation Days", icon: CalendarRange },
  { id: "meeting-topic", label: "Team Meeting Topic", icon: MessageSquareText },
  { id: "cinc-ticket", label: "Send CINC Support Ticket", icon: LifeBuoy },
];

const tileClass =
  "group flex min-h-[6.5rem] flex-col items-center justify-center gap-2.5 rounded-2xl bg-white px-3 py-4 text-center shadow-[0_10px_30px_rgba(14,26,43,0.06)] ring-1 ring-[#0e1a2b]/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(14,26,43,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d]";

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
                className="text-sm font-medium text-[#294c7d] underline-offset-4 hover:underline"
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const inner = (
            <>
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#294c7d]/10 text-[#294c7d] transition group-hover:bg-[#294c7d] group-hover:text-white">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-xs font-medium leading-tight text-[#0e1a2b] sm:text-sm">{tile.label}</span>
            </>
          );
          if (tile.href) {
            return (
              <a
                key={tile.id}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                className={tileClass}
              >
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

      {openTile ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0e1a2b]/40 p-0 sm:items-center sm:p-6"
          onClick={() => setOpenId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pt-4 pb-6 shadow-[0_24px_80px_rgba(14,26,43,0.2)] sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-heading text-lg font-semibold tracking-tight text-[#0e1a2b]">
                {openTile.label}
              </h2>
              <button
                type="button"
                autoFocus
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5c5c5c] hover:bg-[#f3f5f8] hover:text-[#0e1a2b]"
                onClick={() => setOpenId(null)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
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
          </div>
        </div>
      ) : null}
    </>
  );
}
