import { normalizeHeader } from "@/lib/google-sheets";

export type ImportantDate = {
  date: string;
  title: string;
  notes: string;
  sortKey: string | null;
  when: "upcoming" | "past" | "undated";
};

export type ListingFile = {
  address: string;
  mlsUrl: string;
  strataUrl: string;
  mediaUrl: string;
};

export type OutstandingNotary = {
  address: string;
  side: string;
  closingDate: string;
};

export type PendingSubject = {
  address: string;
  agent: string;
  subjectRemovalDate: string;
};

function objectsFrom(
  rows: string[][],
  expected: readonly string[],
): Record<string, string>[] {
  if (!rows.length) return [];
  const headers = rows[0].map((cell) => normalizeHeader(cell));
  const headerRow = expected.some((key) => headers.includes(key));
  const source = headerRow ? rows.slice(1) : rows;
  const keys = headerRow ? headers : [...expected];
  return source
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => {
      const record: Record<string, string> = {};
      keys.forEach((key, index) => {
        if (!key) return;
        record[key] = row[index]?.trim() ?? "";
      });
      return record;
    });
}

export function vancouverToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function ymd(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1990 || year > 2200) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Calendar date as YYYY-MM-DD. Does not shift the day across time zones. */
export function parseSheetDate(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return ymd(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const ymdSlash = raw.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
  if (ymdSlash) return ymd(Number(ymdSlash[1]), Number(ymdSlash[2]), Number(ymdSlash[3]));
  const named = raw.match(
    /^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/,
  );
  if (named) {
    const month = MONTHS[named[1].toLowerCase()];
    if (!month) return null;
    return ymd(Number(named[3]), month, Number(named[2]));
  }
  const dayFirst = raw.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?,?\s+(\d{4})$/);
  if (dayFirst) {
    const month = MONTHS[dayFirst[2].toLowerCase()];
    if (!month) return null;
    return ymd(Number(dayFirst[3]), month, Number(dayFirst[1]));
  }
  if (/^\d{5}$/.test(raw)) {
    const serial = Number(raw);
    if (serial >= 20000 && serial <= 80000) {
      const utc = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return ymd(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
    }
  }
  const slash = raw.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? 2000 + Number(slash[3]) : Number(slash[3]);
    let month = Number(slash[1]);
    let day = Number(slash[2]);
    if (month > 12 && day <= 12) {
      [month, day] = [day, month];
    }
    return ymd(year, month, day);
  }
  return null;
}

export function importantDatesFrom(rows: string[][], today = vancouverToday()): ImportantDate[] {
  const records = objectsFrom(rows, ["date", "title", "notes"]);
  const items = records
    .map((row) => {
      const date = row.date ?? "";
      const title = row.title ?? "";
      const notes = row.notes ?? "";
      if (!date && !title && !notes) return null;
      const sortKey = parseSheetDate(date);
      const when: ImportantDate["when"] = !sortKey
        ? "undated"
        : sortKey >= today
          ? "upcoming"
          : "past";
      return { date, title, notes, sortKey, when };
    })
    .filter((item): item is ImportantDate => Boolean(item));

  const rank = { upcoming: 0, undated: 1, past: 2 };
  return items.sort((a, b) => {
    if (rank[a.when] !== rank[b.when]) return rank[a.when] - rank[b.when];
    if (a.sortKey && b.sortKey && a.sortKey !== b.sortKey) {
      return a.when === "past" ? b.sortKey.localeCompare(a.sortKey) : a.sortKey.localeCompare(b.sortKey);
    }
    return a.title.localeCompare(b.title);
  });
}

export function statValueFrom(rows: string[][], key: string): string | null {
  const wanted = normalizeHeader(key);
  for (const row of rows) {
    for (let index = 0; index < row.length; index += 1) {
      if (normalizeHeader(row[index] ?? "") !== wanted) continue;
      const next = row.slice(index + 1).find((cell) => cell.trim());
      if (next) return next.trim();
    }
  }
  return null;
}

export function transactionsYtdFrom(rows: string[][]): string | null {
  return statValueFrom(rows, "transactions_ytd");
}

/** Whole dollars, like $90,696,373. A value that is not a number is returned as written. */
export function formatCurrency(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/cad/gi, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return raw.trim();
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return raw.trim();
  const digits = Number.isInteger(value) ? 0 : 2;
  const formatted = new Intl.NumberFormat("en-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  return `$${formatted}`;
}

export type AwayAgent = {
  agent: string;
  start: string;
  end: string;
  range: string;
};

const RANGE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function addCalendarDays(ymdValue: string, days: number): string {
  const match = ymdValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return ymdValue;
  const utc = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days));
  return ymd(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate()) ?? ymdValue;
}

function prettyDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const month = RANGE_MONTHS[Number(match[2]) - 1] ?? match[2];
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function formatDateRange(start: string, end: string): string {
  if (start === end) return prettyDate(start);
  const startParts = start.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const endParts = end.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!startParts || !endParts) return `${prettyDate(start)} – ${prettyDate(end)}`;
  const startMonth = RANGE_MONTHS[Number(startParts[2]) - 1] ?? startParts[2];
  const endMonth = RANGE_MONTHS[Number(endParts[2]) - 1] ?? endParts[2];
  if (startParts[1] === endParts[1] && startParts[2] === endParts[2]) {
    return `${startMonth} ${Number(startParts[3])}–${Number(endParts[3])}, ${startParts[1]}`;
  }
  if (startParts[1] === endParts[1]) {
    return `${startMonth} ${Number(startParts[3])} – ${endMonth} ${Number(endParts[3])}, ${startParts[1]}`;
  }
  return `${prettyDate(start)} – ${prettyDate(end)}`;
}

/** Vacations that overlap today through the next `windowDays` days, Vancouver calendar. */
export function awayAgentsFrom(
  rows: string[][],
  today = vancouverToday(),
  windowDays = 14,
): AwayAgent[] {
  const windowEnd = addCalendarDays(today, windowDays);
  const people = objectsFrom(rows, ["timestamp", "agent", "start_date", "end_date", "notes", "status"])
    .map((row) => {
      const agent = (row.agent ?? "").trim();
      if (!agent) return null;
      let start = parseSheetDate(row.start_date ?? "");
      let end = parseSheetDate(row.end_date ?? "");
      if (!start && end) start = end;
      if (start && !end) end = start;
      if (!start || !end) return null;
      if (end < start) [start, end] = [end, start];
      if (end < today || start > windowEnd) return null;
      return { agent, start, end, range: formatDateRange(start, end) };
    })
    .filter((item): item is AwayAgent => Boolean(item));

  return people.sort((a, b) => a.start.localeCompare(b.start) || a.agent.localeCompare(b.agent));
}

export function listingFilesFrom(rows: string[][]): ListingFile[] {
  return objectsFrom(rows, ["address", "mls_url", "strata_url", "media_url"])
    .filter((row) => row.address)
    .map((row) => ({
      address: row.address,
      mlsUrl: row.mls_url ?? "",
      strataUrl: row.strata_url ?? "",
      mediaUrl: row.media_url ?? "",
    }));
}

export function outstandingNotaryFrom(rows: string[][]): OutstandingNotary[] {
  return objectsFrom(rows, ["address", "side", "closing_date"])
    .filter((row) => row.address || row.side || row.closing_date)
    .map((row) => ({
      address: row.address ?? "",
      side: row.side ?? "",
      closingDate: row.closing_date ?? "",
    }));
}

export function pendingSubjectsFrom(rows: string[][]): PendingSubject[] {
  return objectsFrom(rows, ["address", "agent", "subject_removal_date"])
    .filter((row) => row.address)
    .map((row) => ({
      address: row.address,
      agent: row.agent ?? "",
      subjectRemovalDate: row.subject_removal_date ?? "",
    }));
}

export function vancouverTimestamp(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
