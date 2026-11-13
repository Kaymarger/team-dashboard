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
    <section className="rounded-xl border border-[#294c7d]/40 bg-white/[0.06] p-3 backdrop-blur-xl">
      <h2 className="font-heading text-sm font-medium tracking-tight">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function ImportantDates({ dates }: { dates: ImportantDate[] }) {
  if (!dates.length) {
    return <p className="text-xs text-[#c5c5c5]">No dates yet.</p>;
  }
  return (
    <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
      {dates.map((item, index) => (
        <li key={`${item.date}-${item.title}-${index}`} className={item.when === "past" ? "opacity-60" : undefined}>
          <p className="text-xs leading-snug">
            {item.date ? <span className="text-[#9fb4d4]">{item.date} · </span> : null}
            <span className="font-medium">{item.title || "Untitled"}</span>
          </p>
          {item.notes ? <p className="text-[0.68rem] leading-snug text-[#c5c5c5]">{item.notes}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function TransactionsCard({ value }: { value: string | null }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold tracking-tight">{value ?? "—"}</span>
      <span className="text-[0.68rem] text-[#c5c5c5]">2026 transactions</span>
    </p>
  );
}

export function OutstandingList({ rows }: { rows: OutstandingNotary[] }) {
  if (!rows.length) {
    return <p className="text-xs text-[#c5c5c5]">None outstanding.</p>;
  }
  return (
    <ul className="max-h-36 space-y-1 overflow-y-auto pr-1">
      {rows.map((row, index) => (
        <li key={`${row.address}-${index}`} className="text-xs leading-snug">
          <span className="font-medium">{row.address || "Address not set"}</span>
          <span className="text-[#c5c5c5]">
            {row.side ? ` · ${row.side}` : ""}
            {row.closingDate ? ` · ${row.closingDate}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
