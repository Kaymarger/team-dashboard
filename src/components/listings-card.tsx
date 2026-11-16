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
  "inline-flex h-11 items-center justify-center rounded-full border border-[#1f2326] px-3 text-sm font-medium text-[#1f2326] transition hover:bg-[#1f2326] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a]";

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
      <p className="rounded-xl bg-[#f6f1ea] px-3 py-3 text-sm leading-relaxed text-[#6b3a2e]">
        Active listings could not be loaded.
      </p>
    );
  }

  if (!listings.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-[#f7f6f3] px-3 py-4">
        <Home className="mt-0.5 size-4 shrink-0 text-[#1f2326]" aria-hidden />
        <p className="text-sm text-[#716c65]">No active listings right now.</p>
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
          <li key={key} className="overflow-hidden rounded-xl border border-[#e5e2dc] bg-white">
            <button
              id={buttonId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8875a] focus-visible:ring-inset"
              onClick={() => setOpenKey(open ? null : key)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f1efea] text-[#1f2326]">
                <Home className="size-4" strokeWidth={1.6} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-sm leading-snug font-medium break-words text-[#1c1c1c]">{listing.address}</span>
              {listing.mls ? (
                <span className="shrink-0 text-xs text-[#716c65]">{listing.mls}</span>
              ) : null}
              <ChevronDown
                className={`size-4 shrink-0 text-[#716c65] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
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
                    <span className="text-sm text-[#716c65]">Not available yet</span>
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
