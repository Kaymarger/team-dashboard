import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import type { ImportantDate, OutstandingNotary } from "@/lib/sheet-tables";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e6e9f0] bg-white p-5 shadow-[0_10px_30px_rgba(14,26,43,0.05)] sm:p-6">
      <h2 className="font-heading text-lg font-semibold tracking-tight text-[#0e1a2b]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ImportantDates({ dates }: { dates: ImportantDate[] }) {
  if (!dates.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-[#f6f7f9] px-3 py-3">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#294c7d]" aria-hidden />
        <p className="text-sm text-[#5c5c5c]">Nothing on the calendar yet.</p>
      </div>
    );
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
    <section className="relative overflow-hidden rounded-2xl border border-[#e6e9f0] bg-white px-6 py-6 shadow-[0_16px_40px_rgba(14,26,43,0.06)] sm:px-8 sm:py-8">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[#294c7d]" aria-hidden />
      <p className="text-sm font-medium text-[#5c5c5c]">Transactions YTD</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-[#0e1a2b] sm:text-6xl">
        {value ?? <span className="text-[#0e1a2b]/30">—</span>}
      </p>
      <p className="mt-3 text-sm font-medium text-[#294c7d]">2026 transactions</p>
      <div className="mt-5 h-1 w-24 rounded-full bg-[#294c7d]" aria-hidden />
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
