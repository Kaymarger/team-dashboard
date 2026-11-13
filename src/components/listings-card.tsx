"use client";

import { useState } from "react";
import { useActionState } from "react";
import { submitTeamRequest, type FormState } from "@/app/actions";
import { AgentField } from "@/components/fields";

type ListingRow = {
  address: string;
  mls: string;
  mlsUrl: string;
  strataUrl: string;
};

function ActionRow({
  form,
  label,
  href,
  property,
}: {
  form: "mls" | "strata";
  label: string;
  href: string;
  property: string;
}) {
  const [state, action, pending] = useActionState<FormState | null, FormData>(
    submitTeamRequest,
    null,
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center rounded-xl bg-[#294c7d] px-3 text-xs font-medium text-white hover:bg-[#0e1a2b]"
      >
        Open {label}
      </a>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-1.5">
      <input type="hidden" name="form" value={form} />
      <input type="hidden" name="property" value={property} />
      <div className="grid grid-cols-[1fr_auto] items-end gap-1.5">
        <AgentField />
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-xl bg-[#0e1a2b] px-3 text-xs font-medium text-white hover:bg-[#294c7d] disabled:opacity-60"
        >
          {pending ? "Sending…" : `Request ${label}`}
        </button>
      </div>
      {state ? (
        <p
          className={state.status === "success" ? "text-xs text-emerald-700" : "text-xs text-red-700"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

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
      <p className="text-sm leading-relaxed text-amber-800">
        Active listings could not be loaded. Type the address on the MLS Sheets
        and Strata Documents forms.
      </p>
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
              <div className="mt-3 grid gap-3 border-t border-[#e7ebf2] pt-3">
                <ActionRow form="mls" label="MLS Sheet" href={listing.mlsUrl} property={listing.address} />
                <ActionRow
                  form="strata"
                  label="Strata Documents"
                  href={listing.strataUrl}
                  property={listing.address}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
