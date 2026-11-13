import type { ReactNode } from "react";
import type { ImportantDate, OutstandingNotary } from "@/lib/sheet-tables";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(14,26,43,0.06)] ring-1 ring-[#0e1a2b]/5">
      <h2 className="font-heading text-base font-semibold tracking-tight text-[#0e1a2b]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ImportantDates({ dates }: { dates: ImportantDate[] }) {
  if (!dates.length) {
    return <p className="text-sm text-[#5c5c5c]">No dates yet.</p>;
  }
  return (
    <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
      {dates.map((item, index) => (
        <li key={`${item.date}-${item.title}-${index}`} className={item.when === "past" ? "opacity-55" : undefined}>
          <p className="text-sm leading-snug text-[#0e1a2b]">
            {item.date ? <span className="font-medium text-[#294c7d]">{item.date} · </span> : null}
            <span className="font-medium">{item.title || "Untitled"}</span>
          </p>
          {item.notes ? <p className="mt-0.5 text-xs leading-relaxed text-[#5c5c5c]">{item.notes}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function TransactionsCard({ value }: { value: string | null }) {
  return (
    <section className="rounded-2xl bg-white px-6 py-6 shadow-[0_10px_30px_rgba(14,26,43,0.06)] ring-1 ring-[#0e1a2b]/5 sm:px-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#5c5c5c] uppercase">Transactions YTD</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-[#0e1a2b] sm:text-6xl">
        {value ?? <span className="text-[#0e1a2b]/25">—</span>}
      </p>
      <p className="mt-2 text-sm text-[#294c7d]">2026 transactions</p>
    </section>
  );
}

export function OutstandingList({ rows }: { rows: OutstandingNotary[] }) {
  if (!rows.length) {
    return <p className="text-sm text-[#5c5c5c]">None outstanding.</p>;
  }
  return (
    <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
      {rows.map((row, index) => (
        <li key={`${row.address}-${index}`} className="text-sm leading-snug text-[#0e1a2b]">
          <span className="font-medium">{row.address || "Address not set"}</span>
          <span className="text-[#5c5c5c]">
            {row.side ? ` · ${row.side}` : ""}
            {row.closingDate ? ` · ${row.closingDate}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
