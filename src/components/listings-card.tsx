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
  "inline-flex h-9 items-center justify-center rounded-full bg-[#e7eef8] px-3 text-xs font-semibold text-[#294c7d] transition hover:bg-[#294c7d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#294c7d] focus-visible:ring-offset-2";

export function ListingsCard({
  listings,
  error,
}: {
  listings: ListingRow[];
  error: string | null;
}) {
  if (!listings.length && error) {
    return (
      <p className="rounded-xl bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-950">
        Active listings could not be loaded.
      </p>
    );
  }

  if (!listings.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-[#f6f7f9] px-3 py-3">
        <Home className="mt-0.5 size-4 shrink-0 text-[#294c7d]" aria-hidden />
        <p className="text-sm text-[#5c5c5c]">No active listings right now.</p>
      </div>
    );
  }

  return (
    <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
      {listings.map((listing) => {
        const links = [
          { label: "MLS Sheet", href: listing.mlsUrl },
          { label: "Strata Documents", href: listing.strataUrl },
          { label: "Listing Media", href: listing.mediaUrl },
        ].filter((item) => item.href.trim());
        return (
          <li key={`${listing.mls}:${listing.address}`} className="rounded-xl border border-[#e6e9f0] bg-[#f8fafc] px-3 py-3">
            <p className="text-sm font-semibold text-[#0e1a2b]">{listing.address}</p>
            {listing.mls ? <p className="mt-0.5 text-xs text-[#294c7d]">{listing.mls}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {links.length ? (
                links.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={pillClass}>
                    {item.label}
                  </a>
                ))
              ) : (
                <span className="text-sm text-[#5c5c5c]">Not available yet</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
