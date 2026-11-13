"use server";

import { cookies } from "next/headers";
import { tabs } from "@/config/sheets";
import {
  TEAM_SESSION_COOKIE,
  isValidSession,
  teamPassword,
} from "@/lib/auth";
import { appendNamedRow, readTabRows, requireSheetId, SheetError } from "@/lib/google-sheets";
import { getActiveListings } from "@/lib/listings";
import { buildRequest, RequestError, type FieldBag, type RequestContext } from "@/lib/requests";
import { notaryOptionsFrom, pendingSubjectsFrom, vancouverTimestamp } from "@/lib/sheet-tables";

export type FormState = {
  status: "success" | "error";
  message: string;
};

async function sessionError(): Promise<string | null> {
  const password = teamPassword();
  if (!password) return "Sign-in is not set up yet.";
  const token = (await cookies()).get(TEAM_SESSION_COOKIE)?.value;
  if (!isValidSession(token, password)) return "Sign in required.";
  return null;
}

function bagFrom(formData: FormData): FieldBag {
  const bag: FieldBag = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key === "form") continue;
    const current = bag[key];
    if (current === undefined) bag[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else bag[key] = [current, value];
  }
  return bag;
}

async function loadContext(): Promise<RequestContext> {
  const listingsResult = await getActiveListings();
  let notaryOptions: string[] = [];
  let pending: RequestContext["pendingSubjects"] = [];
  try {
    const id = requireSheetId();
    const tables = await readTabRows(id, [tabs.notaryOptions, tabs.pendingSubjects]);
    notaryOptions = notaryOptionsFrom(tables.get(tabs.notaryOptions) ?? []);
    pending = pendingSubjectsFrom(tables.get(tabs.pendingSubjects) ?? []);
  } catch {
    // The write below reports a missing sheet. Empty lists allow typed addresses.
  }
  return {
    listings: listingsResult.listings,
    listingsLoaded: listingsResult.ok && listingsResult.listings.length > 0,
    notaryOptions,
    pendingSubjects: pending,
  };
}

export async function submitTeamRequest(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const denied = await sessionError();
  if (denied) return { status: "error", message: denied };

  try {
    const built = buildRequest(String(formData.get("form") ?? ""), bagFrom(formData), await loadContext());
    await appendNamedRow(built.tab, built.headers, {
      ...built.values,
      timestamp: vancouverTimestamp(),
      status: "new",
    });
    return { status: "success", message: "Request sent." };
  } catch (error) {
    const message =
      error instanceof RequestError || error instanceof SheetError
        ? error.message
        : error instanceof Error
          ? error.message
          : "The request could not be sent.";
    return { status: "error", message };
  }
}
