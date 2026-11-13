import Image from "next/image";
import { connection } from "next/server";
import { ListingsCard } from "@/components/listings-card";
import { RequestForms } from "@/components/request-forms";
import {
  ImportantDates,
  OutstandingList,
  Section,
  TransactionsCard,
} from "@/components/readouts";
import { brand } from "@/config/brand";
import { openHouseLink, quickLinks } from "@/config/links";
import { fileFor, loadDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connection();
  const data = await loadDashboard();
  const listings = data.listings.map((listing) => ({
    address: listing.address,
    mls: listing.mls,
    mlsUrl: fileFor(listing.address, data.listingFiles, "mls"),
    strataUrl: fileFor(listing.address, data.listingFiles, "strata"),
  }));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pt-2 pb-12">
      <header className="mb-1 flex items-center gap-3">
        <Image
          src={brand.logo}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 rounded-md bg-white object-contain p-0.5"
        />
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight">{brand.name}</h1>
          <p className="text-[0.68rem] text-[#c5c5c5]">
            {brand.group} · {brand.office}
          </p>
        </div>
      </header>

      {data.sheetError ? (
        <p
          className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-xs text-amber-100"
          role="alert"
        >
          {data.sheetError}
        </p>
      ) : null}

      <Section title="Important Dates">
        <ImportantDates dates={data.dates} />
      </Section>
      <Section title="Transactions YTD">
        <TransactionsCard value={data.transactionsYtd} />
      </Section>
      <Section title="Current Listings">
        <ListingsCard listings={listings} error={data.listingsError} />
      </Section>
      <Section title={openHouseLink.label}>
        <a
          href={openHouseLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-lg bg-[#294c7d] px-3 text-xs font-medium text-white hover:bg-[#294c7d]/80"
        >
          Open the form
        </a>
      </Section>
      <Section title="Outstanding Notary Info">
        <OutstandingList rows={data.outstandingNotary} />
      </Section>

      <RequestForms
        listings={data.listings}
        listingsFailed={Boolean(data.listingsError)}
        notaryOptions={data.notaryOptions}
        pendingSubjects={data.pendingSubjects}
      />

      <Section title="Quick Links">
        <ul className="grid grid-cols-2 gap-1.5">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 items-center rounded-lg border border-white/10 bg-black/20 px-2 text-xs hover:border-[#294c7d]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
