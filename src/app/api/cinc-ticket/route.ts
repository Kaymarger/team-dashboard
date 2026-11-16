import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAgent } from "@/config/agents";
import { tabs } from "@/config/sheets";
import { TEAM_SESSION_COOKIE, isValidSession, teamPassword } from "@/lib/auth";
import { appendNamedRow, appendNamedRows, SheetError } from "@/lib/google-sheets";
import { vancouverTimestamp } from "@/lib/sheet-tables";
import {
  TICKET_HEADERS,
  createTicketId,
  prepareScreenshots,
  screenshotHeaders,
  screenshotRow,
} from "@/lib/ticket-images";

export const runtime = "nodejs";
export const maxDuration = 60;

type TicketBody = {
  agent?: unknown;
  issue?: unknown;
  screenshots?: unknown;
};

async function denied(): Promise<NextResponse | null> {
  const password = teamPassword();
  if (!password) {
    return NextResponse.json({ error: "Sign-in is not set up yet." }, { status: 503 });
  }
  const token = (await cookies()).get(TEAM_SESSION_COOKIE)?.value;
  if (!isValidSession(token, password)) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const blocked = await denied();
  if (blocked) return blocked;

  let body: TicketBody;
  try {
    body = (await request.json()) as TicketBody;
  } catch {
    return NextResponse.json({ error: "That ticket could not be read." }, { status: 400 });
  }

  const agent = String(body.agent ?? "").trim();
  const issue = String(body.issue ?? "").trim();
  if (!isAgent(agent)) {
    return NextResponse.json({ error: "Choose an agent." }, { status: 400 });
  }
  if (!issue) {
    return NextResponse.json({ error: "Describe the issue." }, { status: 400 });
  }
  if (issue.length > 8000) {
    return NextResponse.json({ error: "That description is too long." }, { status: 400 });
  }
  const shots = Array.isArray(body.screenshots) ? body.screenshots : [];
  if (shots.some((shot) => !shot || typeof shot !== "object")) {
    return NextResponse.json({ error: "One of the screenshots could not be read. Try a JPG or PNG." }, { status: 400 });
  }

  try {
    const prepared = prepareScreenshots(
      shots.map((shot) => {
        const row = shot as { filename?: unknown; base64?: unknown };
        return { filename: String(row.filename ?? ""), base64: String(row.base64 ?? "") };
      }),
    );
    const ticketId = createTicketId(Date.now(), randomBytes(3).toString("hex"));
    const widest = prepared.reduce((max, shot) => Math.max(max, shot.chunks.length), 0);
    if (prepared.length) {
      await appendNamedRows(
        tabs.ticketScreenshots,
        screenshotHeaders(widest),
        prepared.map((shot, index) => screenshotRow(ticketId, index + 1, shot)),
        { raw: true },
      );
    }
    await appendNamedRow(tabs.cincTickets, TICKET_HEADERS, {
      timestamp: vancouverTimestamp(),
      agent,
      issue,
      screenshot_count: String(prepared.length),
      ticket_id: ticketId,
      status: "new",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof SheetError || error instanceof Error
        ? error.message
        : "The request could not be sent.";
    const status = error instanceof SheetError ? error.status : 400;
    return NextResponse.json({ error: message }, { status: status >= 400 && status < 600 ? status : 400 });
  }
}
