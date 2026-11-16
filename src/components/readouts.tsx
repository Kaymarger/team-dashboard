import { CalendarDays } from "lucide-react";
import type { ImportantDate, OutstandingNotary } from "@/lib/sheet-tables";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateParts(item: ImportantDate): { month: string; day: string } | null {
  if (!item.sortKey) return null;
  const match = item.sortKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return null;
  return { month, day: String(Number(match[3])) };
}

export function UpcomingDates({ dates }: { dates: ImportantDate[] }) {
  const upcoming = dates.filter((item) => item.when !== "past").slice(0, 3);
  if (!upcoming.length) {
    return (
      <div className="flex items-start gap-3">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#d4b483]" aria-hidden />
        <p className="text-sm text-[#b7b3ab]">Nothing on the calendar yet.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      {upcoming.map((item, index) => {
        const parts = dateParts(item);
        return (
          <li key={`${item.date}-${item.title}-${index}`} className="flex items-center gap-4">
            <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-[#2b2f3e] py-2">
              <span className="text-[0.65rem] tracking-[0.14em] text-[#d4b483] uppercase">
                {parts?.month ?? "Date"}
              </span>
              <span className="text-2xl font-light text-white">{parts?.day ?? "—"}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{item.title || "Untitled"}</p>
              {item.notes ? <p className="mt-0.5 line-clamp-2 text-xs text-[#b7b3ab]">{item.notes}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function OutstandingList({ rows }: { rows: OutstandingNotary[] }) {
  if (!rows.length) {
    return <p className="text-sm text-[#b7b3ab]">None outstanding.</p>;
  }
  return (
    <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
      {rows.map((row, index) => (
        <li key={`${row.address}-${index}`} className="text-sm leading-snug text-white">
          <span className="font-medium">{row.address || "Address not set"}</span>
          <span className="text-[#b7b3ab]">
            {row.side ? ` · ${row.side}` : ""}
            {row.closingDate ? ` · ${row.closingDate}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
