"use client";

import { useState } from "react";

type ListingRow = {
  address: string;
  mls: string;
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

const linkClass = "text-sm font-medium text-[#294c7d] underline-offset-4 hover:underline";

export function ListingsCard({
  listings,
  error,
}: {
  listings: ListingRow[];
  error: string | null;
}) {
  const [open, setOpen] = useState<string | null>(null);

  if (!listings.length && error) {
    return (
      <p className="text-sm leading-relaxed text-amber-800">Active listings could not be loaded.</p>
    );
  }

  if (!listings.length) {
    return <p className="text-sm text-[#5c5c5c]">No active listings right now.</p>;
  }

  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
      {listings.map((listing) => {
        const key = `${listing.mls}:${listing.address}`;
        const expanded = open === key;
        const links = [
          { label: "MLS Sheet", href: listing.mlsUrl },
          { label: "Strata Documents", href: listing.strataUrl },
          { label: "Listing Media", href: listing.mediaUrl },
        ].filter((item) => item.href.trim());
        return (
          <li key={key} className="rounded-xl border border-[#e7ebf2] bg-[#f8fafc] px-3 py-2.5">
            <button
              type="button"
              className="flex w-full items-baseline justify-between gap-3 text-left"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : key)}
            >
              <span className="text-sm font-medium text-[#0e1a2b]">{listing.address}</span>
              {listing.mls ? (
                <span className="shrink-0 text-[0.7rem] text-[#294c7d]">{listing.mls}</span>
              ) : null}
            </button>
            {expanded ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e7ebf2] pt-3">
                {links.length ? (
                  links.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {item.label}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-[#5c5c5c]">Not available yet</span>
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
