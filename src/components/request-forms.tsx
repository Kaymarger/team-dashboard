"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { submitTeamRequest, type FormState } from "@/app/actions";
import { AgentField, controlClass, Field } from "@/components/fields";
import {
  buildingTypes,
  commissionOptions,
  copyLimits,
  disclosureOptions,
  leadSources,
  listTerms,
  newListingReminder,
  notaryDetailFields,
  notarySides,
  pdsDisclosure,
  pdsNote,
  yesNo,
} from "@/config/forms";
import { OutstandingList } from "@/components/readouts";
import type { OutstandingNotary, PendingSubject } from "@/lib/sheet-tables";
import type { ScrapedListing } from "@/lib/parse-listings";

function FormCard({
  title,
  form,
  className,
  onSuccess,
  children,
}: {
  title: string;
  form: string;
  className?: string;
  onSuccess?: () => void;
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState | null, FormData>(
    async (prev, formData) => {
      const result = await submitTeamRequest(prev, formData);
      if (result.status === "success") {
        formRef.current?.reset();
        onSuccess?.();
      }
      return result;
    },
    null,
  );

  return (
    <div className={className}>
      <h2 className="sr-only">{title}</h2>
      <form ref={formRef} action={action} className="flex flex-col gap-3">
        <input type="hidden" name="form" value={form} />
        {children}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 h-11 rounded-xl bg-[#0e1a2b] px-3 text-sm font-medium text-white hover:bg-[#294c7d] disabled:opacity-60"
        >
          {pending ? "Sending…" : "Submit"}
        </button>
      </form>
      {state ? (
        <p
          className={
            state.status === "success"
              ? "mt-3 text-sm text-emerald-700"
              : "mt-3 text-sm text-red-700"
          }
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function PropertyField({
  listings,
  listingsFailed,
}: {
  listings: ScrapedListing[];
  listingsFailed: boolean;
}) {
  if (!listings.length) {
    return (
      <Field label="Property">
        <input name="property" required className={controlClass} placeholder="Address" />
        {listingsFailed ? (
          <span className="text-[0.7rem] leading-snug text-amber-800">
            Listings could not be loaded. Type the address.
          </span>
        ) : null}
      </Field>
    );
  }
  return (
    <Field label="Property">
      <select name="property" required defaultValue="" className={controlClass}>
        <option value="" disabled>
          Select
        </option>
        {listings.map((listing) => (
          <option key={`${listing.mls}:${listing.address}`} value={listing.address}>
            {listing.mls ? `${listing.address} (${listing.mls})` : listing.address}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CopiesField({ min, max }: { min: number; max: number }) {
  return (
    <Field label="Number of copies">
      <input
        name="copies"
        type="number"
        min={min}
        max={max}
        required
        defaultValue={1}
        className={controlClass}
      />
    </Field>
  );
}

function NotaryForm({
  options,
}: {
  options: string[];
}) {
  return (
    <FormCard title="Submit Notary Info" form="notary" className="sm:col-span-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <AgentField />
        {options.length ? (
          <Field label="Property">
            <select name="property" required defaultValue="" className={controlClass}>
              <option value="" disabled>
                Select
              </option>
              {options.map((address) => (
                <option key={address} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Property">
            <input name="property" required className={controlClass} placeholder="Address" />
            <span className="text-[0.65rem] text-[#5c5c5c]">No addresses in Notary Options yet.</span>
          </Field>
        )}
        <Field label="Side">
          <select name="side" required defaultValue="" className={controlClass}>
            <option value="" disabled>
              Select
            </option>
            {notarySides.map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>
        </Field>
        {notaryDetailFields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            className={field.input === "textarea" ? "sm:col-span-2" : undefined}
          >
            {field.input === "textarea" ? (
              <textarea name={field.name} rows={2} className={`${controlClass} h-auto py-1.5`} />
            ) : (
              <input
                name={field.name}
                type={field.input === "date" ? "date" : field.input === "email" ? "email" : field.input === "tel" ? "tel" : "text"}
                className={controlClass}
              />
            )}
          </Field>
        ))}
      </div>
    </FormCard>
  );
}

function RemoveForm({ pending }: { pending: PendingSubject[] }) {
  const [index, setIndex] = useState("");
  const row = index === "" ? null : pending[Number(index)];

  return (
    <FormCard
      title="Remove Subjects"
      form="remove-subjects"
      className="sm:col-span-2"
      onSuccess={() => setIndex("")}
    >
      {pending.length ? (
        <>
          <Field label="Property">
            <select
              required
              value={index}
              onChange={(event) => setIndex(event.target.value)}
              className={controlClass}
            >
              <option value="">Select</option>
              {pending.map((item, itemIndex) => (
                <option key={`${item.address}-${itemIndex}`} value={String(itemIndex)}>
                  {item.address}
                  {item.agent ? ` · ${item.agent}` : ""}
                  {item.subjectRemovalDate ? ` · ${item.subjectRemovalDate}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <input type="hidden" name="property" value={row?.address ?? ""} />
          <input type="hidden" name="agent" value={row?.agent ?? ""} />
          <input type="hidden" name="subject_removal_date" value={row?.subjectRemovalDate ?? ""} />
          {row ? (
            <p className="text-[0.68rem] text-[#5c5c5c]">
              {row.agent || "No agent on the sheet"} · {row.subjectRemovalDate || "No removal date"}
            </p>
          ) : null}
        </>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="text-[0.68rem] text-[#5c5c5c] sm:col-span-2">
            No pending subjects on the sheet. Enter the details below.
          </p>
          <Field label="Property">
            <input name="property" required className={controlClass} />
          </Field>
          <AgentField />
          <Field label="Subject removal date">
            <input name="subject_removal_date" type="date" required className={controlClass} />
          </Field>
        </div>
      )}
      <Field label="Notes">
        <textarea name="notes" rows={2} className={`${controlClass} h-auto py-1.5`} />
      </Field>
    </FormCard>
  );
}

function NewListingForm() {
  const [generation, setGeneration] = useState(0);
  return (
    <FormCard
      title="New Listing"
      form="new-listing"
      className="sm:col-span-2"
      onSuccess={() => setGeneration((value) => value + 1)}
    >
      <NewListingFields key={generation} />
    </FormCard>
  );
}

function NewListingFields() {
  const [disclosure, setDisclosure] = useState("");
  const [source, setSource] = useState("");
  const [emails, setEmails] = useState(["", ""]);
  const sourceConfig = leadSources.find((item) => item.value === source);
  const showBuilding = disclosure === pdsDisclosure;

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <AgentField />
        <Field label="Property Address">
          <input name="property_address" required className={controlClass} />
        </Field>
        <Field label="List Date">
          <input name="list_date" type="date" required className={controlClass} />
        </Field>
        <Field label="List Term">
          <select name="list_term" required defaultValue="" className={controlClass}>
            <option value="" disabled>
              Select
            </option>
            {listTerms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </Field>
        <Field label="List Price">
          <input name="list_price" required className={controlClass} />
        </Field>
        <Field label="Commission">
          <select name="commission" required defaultValue="" className={controlClass}>
            <option value="" disabled>
              Select
            </option>
            {commissionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Offer Date">
          <select name="offer_date" required defaultValue="" className={controlClass}>
            <option value="" disabled>
              Select
            </option>
            {yesNo.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Disclosure">
          <select
            name="disclosure"
            required
            value={disclosure}
            onChange={(event) => setDisclosure(event.target.value)}
            className={controlClass}
          >
            <option value="" disabled>
              Select
            </option>
            {disclosureOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        {showBuilding ? (
          <Field label="Attached / Detached" className="sm:col-span-2">
            <select name="building_type" required defaultValue="" className={controlClass}>
              <option value="" disabled>
                Select
              </option>
              {buildingTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-[0.72rem] leading-snug text-[#5c5c5c]">{pdsNote}</span>
          </Field>
        ) : null}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[0.68rem] font-medium text-[#5c5c5c]">Seller Emails</span>
          {emails.map((email, index) => (
            <div key={index} className="flex gap-1.5">
              <input
                name="seller_email"
                type="email"
                required={index === 0}
                value={email}
                onChange={(event) =>
                  setEmails((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  )
                }
                className={controlClass}
                aria-label={`Seller email ${index + 1}`}
              />
              {index > 1 ? (
                <button
                  type="button"
                  className="h-10 rounded-xl border border-[#e1e5ee] px-2 text-xs text-[#5c5c5c]"
                  onClick={() => setEmails((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="h-8 self-start rounded-xl border border-[#e1e5ee] px-2.5 text-xs font-medium text-[#294c7d]"
            onClick={() => setEmails((current) => [...current, ""])}
          >
            + Add email
          </button>
        </div>
        <Field label="Lead Source" className="sm:col-span-2">
          <select
            name="lead_source"
            required
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={controlClass}
          >
            <option value="" disabled>
              Select
            </option>
            {leadSources.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value}
              </option>
            ))}
          </select>
          {sourceConfig?.note ? (
            <span className="text-[0.72rem] text-[#5c5c5c]">{sourceConfig.note}</span>
          ) : null}
        </Field>
        {sourceConfig?.detail ? (
          <Field label="Details" className="sm:col-span-2">
            <input name="lead_source_detail" className={controlClass} />
          </Field>
        ) : null}
        <Field label="Signage Needed">
          <select name="signage_needed" required defaultValue="" className={controlClass}>
            <option value="" disabled>
              Select
            </option>
            {yesNo.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Send Listing Onboarding Form to Seller">
          <select name="send_onboarding_form" required defaultValue="" className={controlClass}>
            <option value="" disabled>
              Select
            </option>
            {yesNo.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={2} className={`${controlClass} h-auto py-1.5`} />
        </Field>
      </div>
      <p className="text-sm font-medium text-[#294c7d]">{newListingReminder}</p>
    </>
  );
}

export function RequestFormPanel({
  formId,
  listings,
  listingsFailed,
  notaryOptions,
  pendingSubjects,
  outstandingNotary,
}: {
  formId: string;
  listings: ScrapedListing[];
  listingsFailed: boolean;
  notaryOptions: string[];
  pendingSubjects: PendingSubject[];
  outstandingNotary: OutstandingNotary[];
}) {
  if (formId === "notary") {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xs font-semibold tracking-[0.12em] text-[#5c5c5c] uppercase">
            Outstanding
          </h3>
          <div className="mt-2">
            <OutstandingList rows={outstandingNotary} />
          </div>
        </div>
        <NotaryForm options={notaryOptions} />
      </div>
    );
  }
  if (formId === "remove-subjects") return <RemoveForm pending={pendingSubjects} />;
  if (formId === "new-listing") return <NewListingForm />;
  if (formId === "pond") {
    return (
      <FormCard title="Request Pond Access" form="pond">
        <AgentField />
      </FormCard>
    );
  }
  if (formId === "buyers-guide") {
    return (
      <FormCard title="Request Buyer's Guide" form="buyers-guide">
        <AgentField />
        <CopiesField min={copyLimits.buyersGuide.min} max={copyLimits.buyersGuide.max} />
      </FormCard>
    );
  }
  if (formId === "feature-sheets") {
    return (
      <FormCard title="Request Feature Sheets" form="feature-sheets">
        <PropertyField listings={listings} listingsFailed={listingsFailed} />
        <AgentField />
        <CopiesField min={copyLimits.featureSheets.min} max={copyLimits.featureSheets.max} />
      </FormCard>
    );
  }
  if (formId === "strata") {
    return (
      <FormCard title="Strata Documents" form="strata">
        <PropertyField listings={listings} listingsFailed={listingsFailed} />
        <AgentField />
      </FormCard>
    );
  }
  if (formId === "listing-media") {
    return (
      <FormCard title="Listing Media" form="listing-media">
        <PropertyField listings={listings} listingsFailed={listingsFailed} />
        <AgentField />
      </FormCard>
    );
  }
  if (formId === "mls") {
    return (
      <FormCard title="MLS Sheets" form="mls">
        <PropertyField listings={listings} listingsFailed={listingsFailed} />
        <AgentField />
      </FormCard>
    );
  }
  if (formId === "vacation") {
    return (
      <FormCard title="Submit Vacation Days" form="vacation">
        <AgentField />
        <Field label="Dates">
          <span className="grid grid-cols-2 gap-2">
            <input name="start_date" type="date" required aria-label="Start date" className={controlClass} />
            <input name="end_date" type="date" required aria-label="End date" className={controlClass} />
          </span>
        </Field>
        <Field label="Notes">
          <textarea name="notes" rows={2} className={`${controlClass} h-auto py-2`} />
        </Field>
      </FormCard>
    );
  }
  if (formId === "meeting-topic") {
    return (
      <FormCard title="Team Meeting Topic" form="meeting-topic">
        <AgentField />
        <Field label="Topic">
          <input name="topic" required className={controlClass} />
        </Field>
        <Field label="Details">
          <textarea name="details" rows={3} className={`${controlClass} h-auto py-2`} />
        </Field>
      </FormCard>
    );
  }
  return null;
}
