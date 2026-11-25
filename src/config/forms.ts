/**
 * Form choices and provisional fields live here so they are easy to edit.
 * Sheet columns for Submit Notary Info follow `notaryDetailFields` in order.
 */

export type DetailField = {
  name: string;
  label: string;
  input: "text" | "email" | "tel" | "date" | "textarea";
  required?: boolean;
};

export const notarySides = ["Buyer", "Seller"] as const;

/** Order here is the order of the columns after agent, property, and side. */
export const notaryDetailFields: DetailField[] = [
  { name: "notary_info", label: "Notary Info", input: "textarea", required: true },
  { name: "notes", label: "Notes", input: "textarea" },
];

export const yesNotesHint = "Please write details in the notes";

export const listTerms = ["3 Months", "6 Months", "See Notes"] as const;

export const commissionOptions = ["Standard", "See Notes"] as const;

export const disclosureOptions = [
  "Property Disclosure Statement",
  "Property Non-Disclosure Statement",
] as const;

export const pdsDisclosure = "Property Disclosure Statement";

export const buildingTypes = ["Attached", "Detached"] as const;

export const pdsNote =
  "PDS will be roughly prepped in DocuSign drafts, please review before sending to sellers.";

export const newListingReminder =
  "Please complete Fintrac & PDS (if applicable).";

export const yesNo = ["Yes", "No"] as const;

export type LeadSource = {
  value: string;
  note?: string;
  detail?: boolean;
};

export const leadSources: LeadSource[] = [
  { value: "CINC" },
  {
    value: "REW",
    note: "please write below if your personal REW",
    detail: true,
  },
  {
    value: "Referral Exchange",
    note: "please write below if your personal Referral Exchange",
    detail: true,
  },
  { value: "Sphere of Influence" },
  { value: "Past Client" },
  { value: "Past Client Referral" },
  { value: "Other Referral" },
  { value: "Open Houses" },
  { value: "Other" },
];

export const giftOccasions = ["Closing", "Birthday", "Anniversary", "Other"] as const;

export const copyLimits = {
  buyersGuide: { min: 1, max: 5 },
  sellersGuide: { min: 1, max: 5 },
  featureSheets: { min: 1, max: 15 },
} as const;

/** Columns written to the New Listings tab, after timestamp. status is added last. */
export const newListingColumns = [
  "agent",
  "property_address",
  "list_date",
  "list_term",
  "list_price",
  "commission",
  "offer_date",
  "disclosure",
  "building_type",
  "seller_emails",
  "lead_source",
  "lead_source_detail",
  "signage_needed",
  "send_onboarding_form",
  "notes",
] as const;
