import { CalendarDays, Plane, Scale, ClipboardList } from "lucide-react";
import {
  countdownLabel,
  formatDateRange,
  parseSheetDate,
  type AwayAgent,
  type ImportantDate,
  type OutstandingNotary,
  type PendingSubject,
} from "@/lib/sheet-tables";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateParts(sortKey: string | null): { month: string; day: string } | null {
  if (!sortKey) return null;
  const match = sortKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return null;
  return { month, day: String(Number(match[3])) };
}

function Chip({ children, tone }: { children: string; tone: "now" | "soon" | "quiet" }) {
  const tones = {
    now: "bg-[#1c1c1c] text-white",
    soon: "bg-[#f3ece3] text-[#876c47]",
    quiet: "bg-[#f4f2ee] text-[#3f3f3f]",
  };
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[0.7rem] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function chipTone(label: string): "now" | "soon" | "quiet" {
  if (label === "Today" || label === "Tomorrow" || label === "Away now") return "now";
  if (label.startsWith("In ") && Number(label.split(" ")[1]) <= 7) return "soon";
  return "quiet";
}

function DateBadge({ sortKey, fallback }: { sortKey: string | null; fallback?: string }) {
  const parts = dateParts(sortKey);
  return (
    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f6f3ee]">
      <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-[#876c47] uppercase">
        {parts?.month ?? "Date"}
      </span>
      <span className="text-base leading-none font-semibold text-[#1c1c1c]">{parts?.day ?? fallback ?? "—"}</span>
    </span>
  );
}

function EmptyNote({ icon: Icon, children }: { icon: typeof CalendarDays; children: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#f7f6f3] px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#876c47] shadow-[0_1px_2px_rgba(28,28,28,0.04)]">
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="text-sm text-[#716c65]">{children}</p>
    </div>
  );
}

export function UpcomingDates({ dates, today }: { dates: ImportantDate[]; today: string }) {
  const upcoming = dates.filter((item) => item.when !== "past").slice(0, 5);
  if (!upcoming.length) {
    return <EmptyNote icon={CalendarDays}>Nothing on the calendar yet.</EmptyNote>;
  }
  return (
    <ul className="space-y-2">
      {upcoming.map((item, index) => {
        const label = countdownLabel(item.sortKey, today);
        return (
          <li key={`${item.date}-${item.title}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#f7f6f3] px-3 py-2.5">
            <DateBadge sortKey={item.sortKey} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1c1c1c]">{item.title || "Untitled"}</p>
              {item.notes ? <p className="mt-0.5 line-clamp-1 text-xs text-[#716c65]">{item.notes}</p> : null}
            </div>
            {label ? <Chip tone={chipTone(label)}>{label}</Chip> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function AwayList({ people, today }: { people: AwayAgent[]; today: string }) {
  if (!people.length) {
    return <EmptyNote icon={Plane}>No one is away in the next two weeks.</EmptyNote>;
  }
  return (
    <ul className="space-y-2">
      {people.map((person) => {
        const awayNow = person.start <= today && person.end >= today;
        const label = awayNow ? "Away now" : countdownLabel(person.start, today);
        return (
          <li key={`${person.agent}:${person.start}:${person.end}`} className="flex items-center gap-3 rounded-xl bg-[#f7f6f3] px-3 py-2.5">
            <DateBadge sortKey={person.start} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1c1c1c]">{person.agent}</p>
              <p className="mt-0.5 text-xs text-[#716c65]">{person.range}</p>
            </div>
            {label ? <Chip tone={chipTone(label)}>{label}</Chip> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function PendingList({ rows, today }: { rows: PendingSubject[]; today: string }) {
  if (!rows.length) {
    return <EmptyNote icon={ClipboardList}>No subjects are pending.</EmptyNote>;
  }
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {rows.map((row, index) => {
        const sortKey = parseSheetDate(row.subjectRemovalDate);
        const label = countdownLabel(sortKey, today);
        return (
          <li key={`${row.address}-${row.agent}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#f7f6f3] px-3 py-2.5">
            <DateBadge sortKey={sortKey} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1c1c1c]">{row.address || "Address not set"}</p>
              <p className="mt-0.5 truncate text-xs text-[#716c65]">
                {row.agent || "Agent not set"}
                {sortKey ? ` · ${formatDateRange(sortKey, sortKey)}` : row.subjectRemovalDate ? ` · ${row.subjectRemovalDate}` : ""}
              </p>
            </div>
            {label ? <Chip tone={chipTone(label)}>{label}</Chip> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function NotaryList({ rows, today }: { rows: OutstandingNotary[]; today: string }) {
  if (!rows.length) {
    return <EmptyNote icon={Scale}>None outstanding.</EmptyNote>;
  }
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {rows.map((row, index) => {
        const sortKey = parseSheetDate(row.closingDate);
        const label = countdownLabel(sortKey, today);
        return (
          <li key={`${row.address}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#f7f6f3] px-3 py-2.5">
            <DateBadge sortKey={sortKey} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1c1c1c]">{row.address || "Address not set"}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#716c65]">
                {row.side ? (
                  <span className="inline-flex h-5 items-center rounded-full bg-white px-2 font-medium text-[#3f3f3f]">{row.side}</span>
                ) : null}
                <span>{sortKey ? formatDateRange(sortKey, sortKey) : row.closingDate || "No closing date"}</span>
              </p>
            </div>
            {label ? <Chip tone={chipTone(label)}>{label}</Chip> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function OutstandingList({ rows }: { rows: OutstandingNotary[] }) {
  if (!rows.length) {
    return <p className="text-sm text-[#716c65]">None outstanding.</p>;
  }
  return (
    <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
      {rows.map((row, index) => (
        <li key={`${row.address}-${index}`} className="text-sm leading-snug text-[#1c1c1c]">
          <span className="font-medium">{row.address || "Address not set"}</span>
          <span className="text-[#716c65]">
            {row.side ? ` · ${row.side}` : ""}
            {row.closingDate ? ` · ${row.closingDate}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
