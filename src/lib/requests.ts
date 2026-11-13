import { isAgent } from "@/config/agents";
import {
  buildingTypes,
  commissionOptions,
  copyLimits,
  disclosureOptions,
  leadSources,
  listTerms,
  newListingColumns,
  notaryDetailFields,
  notarySides,
  pdsDisclosure,
  yesNo,
} from "@/config/forms";
import { tabs } from "@/config/sheets";
import type { PendingSubject } from "@/lib/sheet-tables";

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestError";
  }
}

export type FieldBag = Record<string, string | string[]>;

export type RequestContext = {
  listings: { address: string }[];
  listingsLoaded: boolean;
  pendingSubjects: PendingSubject[];
};

export type BuiltRequest = {
  tab: string;
  headers: string[];
  values: Record<string, string>;
};

function one(fields: FieldBag, name: string): string {
  const value = fields[name];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean)[0] ?? "";
  return typeof value === "string" ? value.trim() : "";
}

function many(fields: FieldBag, name: string): string[] {
  const value = fields[name];
  const list = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return list.map((item) => item.trim()).filter(Boolean);
}

function clip(value: string, max: number): string {
  return value.slice(0, max);
}

function agentOf(fields: FieldBag): string {
  const agent = one(fields, "agent");
  if (!isAgent(agent)) throw new RequestError("Choose an agent.");
  return agent;
}

function propertyOf(fields: FieldBag, ctx: RequestContext): string {
  const property = clip(one(fields, "property"), 300);
  if (!property) throw new RequestError("Enter a property.");
  if (ctx.listingsLoaded && ctx.listings.length) {
    const known = ctx.listings.some((listing) => listing.address === property);
    if (!known) throw new RequestError("Choose a property from the list.");
  }
  return property;
}

function copiesOf(fields: FieldBag, min: number, max: number): string {
  const raw = one(fields, "copies");
  if (!/^\d+$/.test(raw)) {
    throw new RequestError(`Enter a number of copies from ${min} to ${max}.`);
  }
  const count = Number(raw);
  if (count < min || count > max) {
    throw new RequestError(`Enter a number of copies from ${min} to ${max}.`);
  }
  return String(count);
}

function isoDate(value: string, label: string, required: boolean): string {
  if (!value) {
    if (required) throw new RequestError(`Enter ${label}.`);
    return "";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RequestError(`Enter ${label} as a date.`);
  }
  return value;
}

function choice(value: string, options: readonly string[], label: string): string {
  if (!options.includes(value)) throw new RequestError(`Choose ${label}.`);
  return value;
}

function emailOf(value: string, required: boolean): string {
  if (!value) {
    if (required) throw new RequestError("Enter an email.");
    return "";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 200) {
    throw new RequestError("Enter a valid email.");
  }
  return value;
}

function handoff(headers: string[], values: Record<string, string>): BuiltRequest["values"] {
  return { ...values, status: "new" };
}

function base(tab: string, columns: string[], values: Record<string, string>): BuiltRequest {
  return {
    tab,
    headers: ["timestamp", ...columns, "status"],
    values: handoff(columns, values),
  };
}

export function buildRequest(form: string, fields: FieldBag, ctx: RequestContext): BuiltRequest {
  switch (form) {
    case "pond":
      return base(tabs.pond, ["agent"], { agent: agentOf(fields) });
    case "buyers-guide":
      return base(tabs.buyersGuide, ["agent", "copies"], {
        agent: agentOf(fields),
        copies: copiesOf(fields, copyLimits.buyersGuide.min, copyLimits.buyersGuide.max),
      });
    case "feature-sheets":
      return base(tabs.featureSheets, ["property", "agent", "copies"], {
        property: propertyOf(fields, ctx),
        agent: agentOf(fields),
        copies: copiesOf(fields, copyLimits.featureSheets.min, copyLimits.featureSheets.max),
      });
    case "strata":
    case "listing-media":
    case "mls":
      throw new RequestError("Open that file from the listing list.");
    case "vacation": {
      const start = isoDate(one(fields, "start_date"), "a start date", true);
      const end = isoDate(one(fields, "end_date"), "an end date", true);
      if (end < start) throw new RequestError("The end date is before the start date.");
      return base(tabs.vacation, ["agent", "start_date", "end_date", "notes"], {
        agent: agentOf(fields),
        start_date: start,
        end_date: end,
        notes: clip(one(fields, "notes"), 4000),
      });
    }
    case "notary":
      return buildNotary(fields);
    case "remove-subjects":
      return buildRemoveSubjects(fields, ctx);
    case "new-listing":
      return buildNewListing(fields);
    case "meeting-topic": {
      const topic = clip(one(fields, "topic"), 300);
      if (!topic) throw new RequestError("Enter a topic.");
      return base(tabs.meetingTopics, ["agent", "topic", "details"], {
        agent: agentOf(fields),
        topic,
        details: clip(one(fields, "details"), 4000),
      });
    }
    default:
      throw new RequestError("That form is not recognized.");
  }
}

function buildNotary(fields: FieldBag): BuiltRequest {
  const property = clip(one(fields, "property"), 300);
  if (!property) throw new RequestError("Enter a property.");
  const side = choice(one(fields, "side"), notarySides, "Buyer or Seller");
  const details: Record<string, string> = {};
  for (const field of notaryDetailFields) {
    const raw = clip(one(fields, field.name), field.input === "textarea" ? 4000 : 300);
    if (field.input === "email") details[field.name] = emailOf(raw, Boolean(field.required));
    else if (field.input === "date") details[field.name] = isoDate(raw, field.label.toLowerCase(), Boolean(field.required));
    else if (field.required && !raw) throw new RequestError(`Enter ${field.label.toLowerCase()}.`);
    else details[field.name] = raw;
  }
  return base(tabs.notary, ["agent", "property", "side", ...notaryDetailFields.map((field) => field.name)], {
    agent: agentOf(fields),
    property,
    side,
    ...details,
  });
}

function buildRemoveSubjects(fields: FieldBag, ctx: RequestContext): BuiltRequest {
  const notes = clip(one(fields, "notes"), 4000);
  const property = clip(one(fields, "property"), 300);
  if (!property) throw new RequestError("Enter a property.");

  if (ctx.pendingSubjects.length) {
    const agentHint = one(fields, "agent");
    const dateHint = one(fields, "subject_removal_date");
    const matches = ctx.pendingSubjects.filter(
      (row) => row.address.toLowerCase() === property.toLowerCase(),
    );
    const exact = matches.find(
      (row) =>
        (!agentHint || row.agent === agentHint) &&
        (!dateHint || row.subjectRemovalDate === dateHint),
    );
    if (exact) {
      return base(
      tabs.removeSubjects,
      ["property", "agent", "subject_removal_date", "notes"],
      {
        property: exact.address,
        agent: exact.agent,
        subject_removal_date: exact.subjectRemovalDate,
        notes,
      },
      );
    }
  }

  return base(tabs.removeSubjects, ["property", "agent", "subject_removal_date", "notes"], {
    property,
    agent: agentOf(fields),
    subject_removal_date: isoDate(one(fields, "subject_removal_date"), "the subject removal date", true),
    notes,
  });
}

function buildNewListing(fields: FieldBag): BuiltRequest {
  const property = clip(one(fields, "property_address"), 300);
  if (!property) throw new RequestError("Enter the property address.");
  const listPrice = clip(one(fields, "list_price"), 40);
  if (!listPrice) throw new RequestError("Enter the list price.");
  const disclosure = choice(one(fields, "disclosure"), disclosureOptions, "a disclosure");
  const building =
    disclosure === pdsDisclosure
      ? choice(one(fields, "building_type"), buildingTypes, "Attached or Detached")
      : "";
  const source = choice(
    one(fields, "lead_source"),
    leadSources.map((item) => item.value),
    "a lead source",
  );
  const sourceConfig = leadSources.find((item) => item.value === source);
  const emails = many(fields, "seller_email");
  if (!emails.length) throw new RequestError("Enter at least one seller email.");
  for (const email of emails) emailOf(email, true);

  const values: Record<string, string> = {
    agent: agentOf(fields),
    property_address: property,
    list_date: isoDate(one(fields, "list_date"), "the list date", true),
    list_term: choice(one(fields, "list_term"), listTerms, "a list term"),
    list_price: listPrice,
    commission: choice(one(fields, "commission"), commissionOptions, "a commission"),
    offer_date: choice(one(fields, "offer_date"), yesNo, "Yes or No for offer date"),
    disclosure,
    building_type: building,
    seller_emails: emails.join("; "),
    lead_source: source,
    lead_source_detail: sourceConfig?.detail ? clip(one(fields, "lead_source_detail"), 300) : "",
    signage_needed: choice(one(fields, "signage_needed"), yesNo, "Yes or No for signage"),
    send_onboarding_form: choice(
      one(fields, "send_onboarding_form"),
      yesNo,
      "Yes or No for the onboarding form",
    ),
    notes: clip(one(fields, "notes"), 4000),
  };

  return base(tabs.newListings, [...newListingColumns], values);
}
