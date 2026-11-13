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

export function transactionsYtdFrom(rows: string[][]): string | null {
  for (const row of rows) {
    for (let index = 0; index < row.length; index += 1) {
      if (normalizeHeader(row[index] ?? "") !== "transactions_ytd") continue;
      const next = row.slice(index + 1).find((cell) => cell.trim());
      if (next) return next.trim();
    }
  }
  return null;
}

export function listingFilesFrom(rows: string[][]): ListingFile[] {
  return objectsFrom(rows, ["address", "mls_url", "strata_url"])
    .filter((row) => row.address)
    .map((row) => ({
      address: row.address,
      mlsUrl: row.mls_url ?? "",
      strataUrl: row.strata_url ?? "",
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

export function notaryOptionsFrom(rows: string[][]): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const row of objectsFrom(rows, ["address"])) {
    const address = row.address?.trim() ?? "";
    const key = address.toLowerCase();
    if (!address || seen.has(key)) continue;
    seen.add(key);
    options.push(address);
  }
  return options;
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
