"use client";

import { useId, useState } from "react";
import { ChevronDown, Home } from "lucide-react";

type ListingRow = {
  address: string;
  mls: string;
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

const pillClass =
  "inline-flex h-11 items-center justify-center rounded-full border border-[#d4b483]/45 px-3 text-sm font-medium text-[#d4b483] transition hover:bg-[#d4b483] hover:text-[#2b2f3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]";

export function ListingsCard({
  listings,
  error,
}: {
  listings: ListingRow[];
  error: string | null;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const baseId = useId();

  if (!listings.length && error) {
    return (
      <p className="rounded-xl bg-[#4a4038] px-3 py-3 text-sm leading-relaxed text-[#f0d7c4]">
        Active listings could not be loaded.
      </p>
    );
  }

  if (!listings.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-[#2b2f3e] px-3 py-4">
        <Home className="mt-0.5 size-4 shrink-0 text-[#d4b483]" aria-hidden />
        <p className="text-sm text-[#b7b3ab]">No active listings right now.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 sm:max-h-[32rem] sm:overflow-y-auto sm:pr-1">
      {listings.map((listing, index) => {
        const key = `${listing.mls}:${listing.address}`;
        const open = openKey === key;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        const links = [
          { label: "MLS Sheet", href: listing.mlsUrl },
          { label: "Strata Documents", href: listing.strataUrl },
          { label: "Listing Media", href: listing.mediaUrl },
        ].filter((item) => item.href.trim());
        return (
          <li key={key} className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#2b2f3e]">
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483] focus-visible:ring-inset"
              onClick={() => setOpenKey(open ? null : key)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#d4b483]/12 text-[#d4b483]">
                <Home className="size-4" strokeWidth={1.6} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug font-medium break-words text-white">{listing.address}</span>
              {listing.mls ? (
                <span className="shrink-0 text-xs text-[#b7b3ab]">{listing.mls}</span>
              ) : null}
              <ChevronDown
                className={`size-4 shrink-0 text-[#b7b3ab] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-2 px-3 pt-1 pb-3">
                  {links.length ? (
                    links.map((item) => (
                      <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={pillClass}>
                        {item.label}
                      </a>
                    ))
                  ) : (
                    <span className="text-sm text-[#b7b3ab]">Not available yet</span>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
