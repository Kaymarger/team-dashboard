import { createSign } from "node:crypto";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type TokenCache = { token: string; expiresAt: number };

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const tokenGlobal = globalThis as typeof globalThis & {
  __areg_team_google_token__?: TokenCache;
};

function envValue(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function teamSheetId(): string {
  return envValue("TEAM_SHEET_ID");
}

/** Same env var command-center uses, so one service-account key can be reused. */
export function loadServiceAccount(): ServiceAccount | null {
  const raw = envValue("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!raw) return null;
  let parsed: Partial<ServiceAccount>;
  try {
    parsed = JSON.parse(raw) as Partial<ServiceAccount>;
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is set, but it is not valid JSON. Paste the whole key file, including the curly braces.",
    );
  }
  const email = parsed.client_email?.trim() ?? "";
  let key = parsed.private_key?.trim() ?? "";
  if (!email || !key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key. Use the JSON key downloaded from Google Cloud.",
    );
  }
  key = key.replace(/\\n/g, "\n");
  return { client_email: email, private_key: key };
}

export class SheetError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SheetError";
    this.status = status;
  }
}

function base64url(value: string | Buffer): string {
  const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buf.toString("base64url");
}

async function accessToken(): Promise<{ token: string; email: string }> {
  const account = loadServiceAccount();
  if (!account) {
    throw new SheetError(503, "GOOGLE_SERVICE_ACCOUNT_JSON is not set on the host.");
  }
  const cached = tokenGlobal.__areg_team_google_token__;
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return { token: cached.token, email: account.client_email };
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: SHEETS_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString("base64url")}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error_description?: string;
    error?: string;
  };
  if (!res.ok || !body.access_token) {
    const detail = body.error_description || body.error || `HTTP ${res.status}`;
    throw new SheetError(
      res.status,
      `Google did not accept the service account key (${detail}). Check GOOGLE_SERVICE_ACCOUNT_JSON.`,
    );
  }
  tokenGlobal.__areg_team_google_token__ = {
    token: body.access_token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };
  return { token: body.access_token, email: account.client_email };
}

export function sameTitle(left: string, right: string): boolean {
  if (left.trim().toLowerCase() === right.trim().toLowerCase()) return true;
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const a = norm(left);
  const b = norm(right);
  return a.length > 0 && a === b;
}

function quoteTitle(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

type ListedTab = { title: string; sheetId: number };

async function googleFetch(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => ({}))) as unknown;
  return { status: res.status, body };
}

function googleMessage(status: number, body: unknown, action: string, email?: string): string {
  const detail =
    (body as { error?: { message?: string } } | null)?.error?.message?.trim() ?? "";
  let message = detail
    ? `Google could not ${action} (HTTP ${status}): ${detail}`
    : `Google could not ${action} (HTTP ${status}).`;
  if (status === 403 && email) {
    message += ` Share the sheet with ${email} as an Editor.`;
  }
  if (status === 404) message += " Check TEAM_SHEET_ID on the host.";
  return message;
}

export async function listSheetTitles(
  spreadsheetId: string,
): Promise<ListedTab[]> {
  const { token, email } = await accessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties(title,sheetId)`;
  const { status, body } = await googleFetch(url, token);
  if (status !== 200) {
    throw new SheetError(status, googleMessage(status, body, "read the spreadsheet", email));
  }
  const sheets =
    (body as { sheets?: { properties?: { title?: string; sheetId?: number } }[] }).sheets ??
    [];
  return sheets.map((sheet) => ({
    title: sheet.properties?.title?.trim() || "Sheet",
    sheetId: sheet.properties?.sheetId ?? 0,
  }));
}

export async function readTabRows(
  spreadsheetId: string,
  titles: readonly string[],
): Promise<Map<string, string[][]>> {
  const wanted = [...titles];
  const result = new Map<string, string[][]>();
  for (const title of wanted) result.set(title, []);
  if (!wanted.length) return result;

  const listed = await listSheetTitles(spreadsheetId);
  const present = wanted.flatMap((title) => {
    const hit = listed.find((tab) => sameTitle(tab.title, title));
    return hit ? [{ wanted: title, title: hit.title }] : [];
  });
  if (!present.length) return result;

  const { token, email } = await accessToken();
  const params = new URLSearchParams();
  params.set("valueRenderOption", "FORMATTED_VALUE");
  params.set("majorDimension", "ROWS");
  for (const tab of present) params.append("ranges", `${quoteTitle(tab.title)}!A:Z`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchGet?${params.toString()}`;
  const { status, body } = await googleFetch(url, token);
  if (status !== 200) {
    throw new SheetError(status, googleMessage(status, body, "read the spreadsheet", email));
  }
  const valueRanges =
    (body as { valueRanges?: { values?: unknown }[] }).valueRanges ?? [];
  present.forEach((tab, index) => {
    result.set(tab.wanted, cellsFrom(valueRanges[index]?.values));
  });
  return result;
}

function cellsFrom(values: unknown): string[][] {
  if (!Array.isArray(values)) return [];
  return values.map((row) =>
    Array.isArray(row) ? row.map((cell) => (cell == null ? "" : String(cell))) : [],
  );
}

async function writeHeaderRow(
  spreadsheetId: string,
  title: string,
  headers: readonly string[],
  token: string,
  email: string,
): Promise<void> {
  const range = `${quoteTitle(title)}!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const { status, body } = await googleFetch(url, token, {
    method: "PUT",
    body: JSON.stringify({ values: [headers] }),
  });
  if (status !== 200) {
    throw new SheetError(
      status,
      googleMessage(status, body, `write the ${title} header`, email),
    );
  }
}

/**
 * Create a tab when it is missing, and write the header row when the tab
 * has no header yet. An existing header row is left as it is.
 */
export async function ensureSheetTab(
  spreadsheetId: string,
  title: string,
  headers: readonly string[],
): Promise<string> {
  const listed = await listSheetTitles(spreadsheetId);
  const found = listed.find((tab) => sameTitle(tab.title, title));
  const { token, email } = await accessToken();

  const actual = found?.title ?? title;
  if (!found) {
    const createUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`;
    const created = await googleFetch(createUrl, token, {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title } } }],
      }),
    });
    if (created.status !== 200) {
      const detail =
        (created.body as { error?: { message?: string } } | null)?.error?.message?.trim() ??
        "";
      if (!(created.status === 400 && /already exists/i.test(detail))) {
        throw new SheetError(
          created.status,
          googleMessage(created.status, created.body, `add the ${title} tab`, email),
        );
      }
    }
    await writeHeaderRow(spreadsheetId, title, headers, token, email);
    return title;
  }

  const headerRange = `${quoteTitle(actual)}!A1:Z1`;
  const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(headerRange)}?valueRenderOption=FORMATTED_VALUE`;
  const headerRead = await googleFetch(headerUrl, token);
  if (headerRead.status !== 200) {
    throw new SheetError(
      headerRead.status,
      googleMessage(headerRead.status, headerRead.body, `read the ${actual} header`, email),
    );
  }
  const existing = cellsFrom(
    (headerRead.body as { values?: unknown }).values,
  )[0] ?? [];
  if (existing.every((cell) => !cell.trim())) {
    await writeHeaderRow(spreadsheetId, actual, headers, token, email);
  }
  return actual;
}

/** Append rows in the order given, starting at column A. */
export async function appendSheetRows(
  spreadsheetId: string,
  tabTitle: string,
  rows: string[][],
  input: "USER_ENTERED" | "RAW" = "USER_ENTERED",
): Promise<void> {
  if (!rows.length) return;
  const { token, email } = await accessToken();
  const range = `${quoteTitle(tabTitle)}!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=${input}&insertDataOption=INSERT_ROWS`;
  const { status, body } = await googleFetch(url, token, {
    method: "POST",
    body: JSON.stringify({ values: rows }),
  });
  if (status === 200) return;
  throw new SheetError(
    status,
    googleMessage(status, body, `add a row to ${tabTitle}`, email),
  );
}

/** Append one row in the order given, starting at column A. */
export async function appendSheetRow(
  spreadsheetId: string,
  tabTitle: string,
  values: string[],
): Promise<void> {
  await appendSheetRows(spreadsheetId, tabTitle, [values]);
}

/** The whole first row, including columns past Z. */
async function readFirstRow(spreadsheetId: string, title: string): Promise<string[]> {
  const { token, email } = await accessToken();
  const range = `${quoteTitle(title)}!1:1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS`;
  const { status, body } = await googleFetch(url, token);
  if (status !== 200) {
    throw new SheetError(status, googleMessage(status, body, `read the ${title} header`, email));
  }
  return cellsFrom((body as { values?: unknown }).values)[0] ?? [];
}

export function requireSheetId(): string {
  const id = teamSheetId();
  if (!id) {
    throw new SheetError(503, "TEAM_SHEET_ID is not set on the host.");
  }
  return id;
}

function trimTrailing(cells: string[]): string[] {
  const copy = [...cells];
  while (copy.length && !copy[copy.length - 1]?.trim()) copy.pop();
  return copy.map((cell) => cell.trim());
}

/**
 * Make sure the tab and its header exist, then append a row aligned to the
 * header that is actually on the sheet. Missing columns are added on the
 * right. Extra columns (such as a fulfilment link the bot adds later) stay blank.
 */
export async function appendNamedRow(
  tabTitle: string,
  headers: readonly string[],
  values: Record<string, string>,
): Promise<void> {
  await appendNamedRows(tabTitle, headers, [values]);
}

/**
 * Append several rows aligned to the sheet header. Missing columns are added
 * on the right. Pass raw when a cell must be stored exactly, such as base64.
 */
export async function appendNamedRows(
  tabTitle: string,
  headers: readonly string[],
  valueRows: Record<string, string>[],
  options?: { raw?: boolean },
): Promise<void> {
  if (!valueRows.length) return;
  const spreadsheetId = requireSheetId();
  const actual = await ensureSheetTab(spreadsheetId, tabTitle, headers);
  let columns = trimTrailing(await readFirstRow(spreadsheetId, actual));
  if (!columns.length) columns = [...headers];

  const present = new Set(columns.map((column) => normalizeHeader(column)));
  const missing = headers.filter((header) => !present.has(normalizeHeader(header)));
  if (missing.length) {
    columns = [...columns, ...missing];
    const { token, email } = await accessToken();
    await writeHeaderRow(spreadsheetId, actual, columns, token, email);
  }

  const lines = valueRows.map((values) =>
    columns.map((column) => values[normalizeHeader(column)] ?? ""),
  );
  await appendSheetRows(spreadsheetId, actual, lines, options?.raw ? "RAW" : "USER_ENTERED");
}

export function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
