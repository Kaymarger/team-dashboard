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
        className="inline-flex h-7 items-center rounded-lg bg-[#294c7d] px-2.5 text-[0.72rem] font-medium text-white hover:bg-[#294c7d]/80"
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
          className="h-8 rounded-lg bg-[#294c7d] px-2.5 text-[0.72rem] font-medium text-white hover:bg-[#294c7d]/80 disabled:opacity-60"
        >
          {pending ? "Sending…" : `Request ${label}`}
        </button>
      </div>
      {state ? (
        <p
          className={state.status === "success" ? "text-[0.68rem] text-emerald-200" : "text-[0.68rem] text-red-200"}
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

  if (error) {
    return (
      <p className="text-xs leading-relaxed text-amber-100">
        Active listings could not be loaded. Type the address on the MLS Sheet
        and Strata Documents forms.
      </p>
    );
  }

  if (!listings.length) {
    return <p className="text-xs text-[#c5c5c5]">No active listings right now.</p>;
  }

  return (
    <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
      {listings.map((listing) => {
        const key = `${listing.mls}:${listing.address}`;
        const expanded = open === key;
        return (
          <li key={key} className="rounded-lg border border-white/10 bg-black/15 px-2 py-1.5">
            <button
              type="button"
              className="flex w-full items-baseline justify-between gap-2 text-left"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : key)}
            >
              <span className="text-xs font-medium text-foreground">{listing.address}</span>
              <span className="shrink-0 text-[0.65rem] text-[#9fb4d4]">{listing.mls}</span>
            </button>
            {expanded ? (
              <div className="mt-2 grid gap-2 border-t border-white/10 pt-2">
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
