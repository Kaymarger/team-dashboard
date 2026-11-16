"use client";

import { useActionState, useRef, useState, type ReactNode } from "react";
import { submitTeamRequest, type FormState } from "@/app/actions";
import { SubmitButton, SuccessState } from "@/components/form-feedback";
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
  yesNotesHint,
  pdsDisclosure,
  pdsNote,
  yesNo,
} from "@/config/forms";
import { CincTicketForm } from "@/components/cinc-ticket-form";
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
  const [round, setRound] = useState(0);
  return (
    <FormRound
      key={round}
      title={title}
      form={form}
      className={className}
      onSuccess={onSuccess}
      onAnother={() => setRound((value) => value + 1)}
    >
      {children}
    </FormRound>
  );
}

function FormRound({
  title,
  form,
  className,
  onSuccess,
  onAnother,
  children,
}: {
  title: string;
  form: string;
  className?: string;
  onSuccess?: () => void;
  onAnother: () => void;
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

  if (state?.status === "success") {
    return <SuccessState message={state.message} onAnother={onAnother} />;
  }

  return (
    <div className={className}>
      <h2 className="sr-only">{title}</h2>
      <form ref={formRef} action={action} className="flex flex-col gap-4">
        <input type="hidden" name="form" value={form} />
        {children}
        <SubmitButton pending={pending} />
      </form>
      {state?.status === "error" ? (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
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
    <Field label="Number of Copies">
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

function NotaryForm({ addresses }: { addresses: string[] }) {
  const [choice, setChoice] = useState("");
  const other = choice === "other";

  return (
    <FormCard title="Notary Info" form="notary" onSuccess={() => setChoice("")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <AgentField />
        <Field label="Property">
          <select
            required
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
            className={controlClass}
          >
            <option value="">Select</option>
            {addresses.map((address) => (
              <option key={address} value={address}>
                {address}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
        </Field>
        {other ? (
          <Field label="Address" className="sm:col-span-2">
            <input name="property" required placeholder="Street address" className={controlClass} />
          </Field>
        ) : (
          <input type="hidden" name="property" value={choice} />
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
          <Field key={field.name} label={field.label} className="sm:col-span-2">
            <textarea
              name={field.name}
              rows={field.name === "notes" ? 2 : 3}
              required={field.required}
              placeholder={field.name === "notes" ? "Anything else the team should know" : "Notary or lawyer details"}
              className={`${controlClass} h-auto py-2`}
            />
          </Field>
        ))}
      </div>
    </FormCard>
  );
}

function RemoveForm({ pending }: { pending: PendingSubject[] }) {
  const [index, setIndex] = useState("");
  const other = index === "other";
  const row = !other && index !== "" ? pending[Number(index)] : null;

  return (
    <FormCard title="Remove Subjects" form="remove-subjects" onSuccess={() => setIndex("")}>
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
          <option value="other">Other</option>
        </select>
      </Field>
      {other ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Address" className="sm:col-span-2">
            <input name="property" required placeholder="Street address" className={controlClass} />
          </Field>
          <AgentField />
          <Field label="Subject Removal Date">
            <input name="subject_removal_date" type="date" required className={controlClass} />
          </Field>
        </div>
      ) : (
        <>
          <input type="hidden" name="property" value={row?.address ?? ""} />
          <input type="hidden" name="agent" value={row?.agent ?? ""} />
          <input type="hidden" name="subject_removal_date" value={row?.subjectRemovalDate ?? ""} />
          {row ? (
            <p className="text-sm text-[#5c5c5c]">
              {row.agent || "No agent on the sheet"} · {row.subjectRemovalDate || "No removal date"}
            </p>
          ) : null}
        </>
      )}
      <Field label="Notes">
        <textarea name="notes" rows={2} placeholder="Anything else the team should know" className={`${controlClass} h-auto py-2`} />
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
  const [offerDate, setOfferDate] = useState("");
  const [signage, setSignage] = useState("");
  const [emails, setEmails] = useState(["", ""]);
  const sourceConfig = leadSources.find((item) => item.value === source);
  const showBuilding = disclosure === pdsDisclosure;

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <AgentField />
        <Field label="Property Address">
          <input name="property_address" required placeholder="Street address" className={controlClass} />
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
          <input name="list_price" required placeholder="$900,000" className={controlClass} />
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
          <select
            name="offer_date"
            required
            value={offerDate}
            onChange={(event) => setOfferDate(event.target.value)}
            className={controlClass}
          >
            <option value="" disabled>
              Select
            </option>
            {yesNo.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {offerDate === "Yes" ? (
            <span className="text-[0.72rem] text-[#5c5c5c]">{yesNotesHint}</span>
          ) : null}
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
            <input name="lead_source_detail" placeholder="Add the detail here" className={controlClass} />
          </Field>
        ) : null}
        <Field label="Signage Needed">
          <select
            name="signage_needed"
            required
            value={signage}
            onChange={(event) => setSignage(event.target.value)}
            className={controlClass}
          >
            <option value="" disabled>
              Select
            </option>
            {yesNo.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {signage === "Yes" ? (
            <span className="text-[0.72rem] text-[#5c5c5c]">{yesNotesHint}</span>
          ) : null}
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
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-[#5c5c5c]">Seller Emails</span>
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
                aria-label={`Seller Email ${index + 1}`}
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
            Add Email
          </button>
        </div>
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={3} placeholder="Anything else the team should know" className={`${controlClass} h-auto py-2`} />
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
  pendingSubjects,
  outstandingNotary,
}: {
  formId: string;
  listings: ScrapedListing[];
  listingsFailed: boolean;
  pendingSubjects: PendingSubject[];
  outstandingNotary: OutstandingNotary[];
}) {
  if (formId === "notary") {
    const addresses = [
      ...new Set(outstandingNotary.map((row) => row.address.trim()).filter(Boolean)),
    ];
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-semibold text-[#0e1a2b]">Outstanding</h3>
          <div className="mt-2">
            <OutstandingList rows={outstandingNotary} />
          </div>
        </div>
        <NotaryForm addresses={addresses} />
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
  if (formId === "vacation") {
    return (
      <FormCard title="Submit Vacation Days" form="vacation">
        <AgentField />
        <Field label="Start Date">
          <input name="start_date" type="date" required className={controlClass} />
        </Field>
        <Field label="End Date">
          <input name="end_date" type="date" required className={controlClass} />
        </Field>
        <Field label="Notes">
          <textarea name="notes" rows={3} placeholder="Optional" className={`${controlClass} h-auto py-2`} />
        </Field>
      </FormCard>
    );
  }
  if (formId === "cinc-ticket") return <CincTicketForm />;
  if (formId === "meeting-topic") {
    return (
      <FormCard title="Team Meeting Topic" form="meeting-topic">
        <AgentField />
        <Field label="Topic">
          <input name="topic" required placeholder="What should we talk about?" className={controlClass} />
        </Field>
        <Field label="Details">
          <textarea name="details" rows={3} placeholder="A little more context" className={`${controlClass} h-auto py-2`} />
        </Field>
      </FormCard>
    );
  }
  return null;
}
