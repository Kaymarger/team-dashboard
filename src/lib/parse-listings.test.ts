import assert from "node:assert/strict";
import test from "node:test";
import { addressesMatch, parseFeaturedHtml } from "./parse-listings";
import { importantDatesFrom, transactionsYtdFrom } from "./sheet-tables";
import { buildRequest, RequestError } from "./requests";

const html = `
<html><body>
<article>
  <h3>104 3621 W 26th Avenue in Vancouver: Dunbar Condo for sale in "Dunbar House" (Vancouver West) : MLS®# R3183291</h3>
  <p>Status: Active</p>
  <p>MLS® Num: R3183291</p>
</article>
<article>
  <h3>90 Tidewater Way: Lions Bay House for sale (West Vancouver) : MLS®# R3168549</h3>
  <p>Status: Active</p>
</article>
<article>
  <h3>10 Sold Street in Vancouver: House for sale : MLS®# R1000001</h3>
  <p>Status: Sold</p>
</article>
</body></html>
`;

test("parse featured listings and skip sold", () => {
  const parsed = parseFeaturedHtml(html);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(
    parsed.listings.map((listing) => listing.mls),
    ["R3183291", "R3168549"],
  );
  assert.equal(parsed.listings[0].address, "104 3621 W 26th Avenue, Vancouver");
  assert.equal(parsed.listings[1].address, "90 Tidewater Way, West Vancouver");
});

test("cloudflare challenge is a failed scrape", () => {
  const parsed = parseFeaturedHtml("<html><title>Just a moment...</title><p>cf-chl</p></html>");
  assert.equal(parsed.ok, false);
});

test("address match ignores punctuation and mls suffix", () => {
  assert.equal(
    addressesMatch("104 3621 W 26th Avenue, Vancouver", "104 3621 W. 26th Avenue Vancouver"),
    true,
  );
  assert.equal(addressesMatch("12 A St", "99 Other"), false);
});

test("important dates show upcoming first", () => {
  const rows = [
    ["date", "title", "notes"],
    ["2026-01-02", "Past item", "done"],
    ["November 20, 2026", "Team meeting", "bring stats"],
    ["2026-11-13", "Today", ""],
    ["", "Undated", "sometime"],
  ];
  const dates = importantDatesFrom(rows, "2026-11-13");
  assert.deepEqual(
    dates.map((item) => item.title),
    ["Today", "Team meeting", "Undated", "Past item"],
  );
  assert.equal(dates[0].when, "upcoming");
  assert.equal(dates[3].when, "past");
});

test("stats row reads transactions_ytd", () => {
  assert.equal(
    transactionsYtdFrom([
      ["key", "value"],
      ["transactions_ytd", "18"],
    ]),
    "18",
  );
  assert.equal(transactionsYtdFrom([["transactions_ytd", "4"]]), "4");
});

const ctx = {
  listings: [{ address: "104 3621 W 26th Avenue, Vancouver" }],
  listingsLoaded: true,
  notaryOptions: ["22 Main Street"],
  pendingSubjects: [
    {
      address: "22 Main Street",
      agent: "Casey Archibald",
      subjectRemovalDate: "2026-12-01",
    },
  ],
};

test("pond request is a new row for the chosen agent", () => {
  const built = buildRequest("pond", { agent: "Cassie Kang" }, ctx);
  assert.equal(built.tab, "Request Pond Access");
  assert.deepEqual(built.headers, ["timestamp", "agent", "status"]);
  assert.equal(built.values.agent, "Cassie Kang");
  assert.equal(built.values.status, "new");
});

test("notary request keeps provisional detail columns", () => {
  const built = buildRequest(
    "notary",
    {
      agent: "Kevin Barrett",
      property: "22 Main Street",
      side: "Buyer",
      notary_name: "Ada Law",
      firm: "Law & Co",
      phone: "604-555-0100",
      email: "ada@example.com",
      notary_info: "Use the side door.",
      completion_date: "2026-12-15",
      notes: "Rush",
    },
    ctx,
  );
  assert.equal(built.tab, "Submit Notary Info");
  assert.equal(built.values.side, "Buyer");
  assert.equal(built.values.notary_info, "Use the side door.");
  assert.ok(built.headers.includes("completion_date"));
  assert.equal(built.values.status, "new");
});

test("remove subjects copies the pending row", () => {
  const built = buildRequest(
    "remove-subjects",
    { property: "22 Main Street", notes: "Signed" },
    ctx,
  );
  assert.equal(built.values.agent, "Casey Archibald");
  assert.equal(built.values.subject_removal_date, "2026-12-01");
  assert.equal(built.values.notes, "Signed");
});

test("new listing requires building type only for PDS", () => {
  assert.throws(
    () =>
      buildRequest(
        "new-listing",
        {
          agent: "Doris Stratoberdha",
          property_address: "1 New Road",
          list_date: "2026-11-20",
          list_term: "3 Months",
          list_price: "$900,000",
          commission: "Standard",
          offer_date: "No",
          disclosure: "Property Disclosure Statement",
          seller_email: ["a@example.com", "b@example.com"],
          lead_source: "REW",
          lead_source_detail: "personal",
          signage_needed: "Yes",
          send_onboarding_form: "No",
        },
        ctx,
      ),
    RequestError,
  );

  const built = buildRequest(
    "new-listing",
    {
      agent: "Doris Stratoberdha",
      property_address: "1 New Road",
      list_date: "2026-11-20",
      list_term: "See Notes",
      list_price: "$900,000",
      commission: "See Notes",
      offer_date: "Yes",
      disclosure: "Property Non-Disclosure Statement",
      seller_email: "seller@example.com",
      lead_source: "CINC",
      signage_needed: "No",
      send_onboarding_form: "Yes",
      notes: "Gate code 12",
    },
    ctx,
  );
  assert.equal(built.tab, "New Listings");
  assert.equal(built.values.building_type, "");
  assert.equal(built.values.seller_emails, "seller@example.com");
  assert.equal(built.values.lead_source_detail, "");
  assert.equal(built.headers.at(-1), "status");
});
