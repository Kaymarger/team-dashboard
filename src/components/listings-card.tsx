"use client";

import { Home } from "lucide-react";

type ListingRow = {
  address: string;
  mls: string;
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

const pillClass =
  "inline-flex h-8 items-center justify-center rounded-full border border-[#d4b483]/45 px-3 text-[0.72rem] font-medium text-[#d4b483] transition hover:bg-[#d4b483] hover:text-[#2b2f3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4b483]";

export function ListingsCard({
  listings,
  error,
}: {
  listings: ListingRow[];
  error: string | null;
}) {
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
    <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
      {listings.map((listing) => {
        const links = [
          { label: "MLS Sheet", href: listing.mlsUrl },
          { label: "Strata Documents", href: listing.strataUrl },
          { label: "Listing Media", href: listing.mediaUrl },
        ].filter((item) => item.href.trim());
        return (
          <li key={`${listing.mls}:${listing.address}`} className="flex gap-3 rounded-xl border border-white/[0.06] bg-[#2b2f3e] px-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#d4b483]/12 text-[#d4b483]">
              <Home className="size-4" strokeWidth={1.6} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{listing.address}</p>
              {listing.mls ? <p className="mt-0.5 text-xs text-[#b7b3ab]">{listing.mls}</p> : null}
              <div className="mt-2 flex flex-wrap gap-2">
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
          </li>
        );
      })}
    </ul>
  );
}
