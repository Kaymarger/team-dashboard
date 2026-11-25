import assert from "node:assert/strict";
import test from "node:test";
import { addressesMatch, parseFeaturedHtml, titleCaseAddress, visibleListings } from "./parse-listings";
import {
  awayAgentsFrom,
  countdownLabel,
  formatCurrency,
  importantDatesFrom,
  parseSheetDate,
  statValueFrom,
  transactionsYtdFrom,
} from "./sheet-tables";
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
  assert.equal(addressesMatch("1939 W 12th Ave", "1939 W 12th Avenue"), true);
  assert.equal(addressesMatch("12 A St", "99 Other"), false);
});

test("addresses use title case and keep directionals", () => {
  assert.equal(titleCaseAddress("1939 W 12TH AVENUE"), "1939 W 12th Ave");
  assert.equal(titleCaseAddress("104 3621 w 26th avenue, vancouver"), "104 3621 W 26th Ave, Vancouver");
  assert.equal(titleCaseAddress("90 SW Marine Drive"), "90 SW Marine Dr");
});

test("listing files hide sold addresses that are not on the sheet", () => {
  const scraped = [
    { address: "1939 W 12TH AVENUE, Vancouver", mls: "R3168453" },
    { address: "104 3621 W 26th Avenue, Vancouver", mls: "R3183291" },
  ];
  assert.deepEqual(visibleListings(scraped, ["104 3621 w 26th avenue, vancouver"]), [
    { address: "104 3621 W 26th Ave, Vancouver", mls: "R3183291" },
  ]);
  assert.equal(visibleListings(scraped, []).length, 2);
  assert.equal(visibleListings(scraped, [])[0].address, "1939 W 12th Ave, Vancouver");
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

test("notary request keeps agent, property, side, info, and notes", () => {
  const built = buildRequest(
    "notary",
    {
      agent: "Kevin Barrett",
      property: "88 Other Road",
      side: "Seller",
      notary_info: "Call after 3.",
      notes: "Rush",
    },
    ctx,
  );
  assert.deepEqual(built.headers, [
    "timestamp",
    "agent",
    "property",
    "side",
    "notary_info",
    "notes",
    "status",
  ]);
  assert.equal(built.values.notary_info, "Call after 3.");
  assert.equal(built.values.property, "88 Other Road");
});

test("remove subjects accepts an address that is not pending", () => {
  const built = buildRequest(
    "remove-subjects",
    {
      property: "9 Side Street",
      agent: "Cassie Kang",
      subject_removal_date: "2026-12-20",
      notes: "",
    },
    ctx,
  );
  assert.equal(built.values.property, "9 Side Street");
  assert.equal(built.values.agent, "Cassie Kang");
  assert.equal(built.values.subject_removal_date, "2026-12-20");
});

test("listing file tiles do not write a request row", () => {
  assert.throws(() => buildRequest("mls", { property: "22 Main Street", agent: "Cassie Kang" }, ctx), RequestError);
  assert.throws(() => buildRequest("strata", { property: "22 Main Street", agent: "Cassie Kang" }, ctx), RequestError);
  assert.throws(
    () => buildRequest("listing-media", { property: "22 Main Street", agent: "Cassie Kang" }, ctx),
    RequestError,
  );
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

test("accepted offers write their own tab", () => {
  const offer = buildRequest(
    "accepted-offer",
    { agent: "Casey Archibald", client_or_address: "Jordan Lee, 10 Oak St" },
    ctx,
  );
  assert.equal(offer.tab, "Accepted Offers");
  assert.deepEqual(offer.headers, ["timestamp", "agent", "client_or_address", "status"]);
  assert.equal(offer.values.client_or_address, "Jordan Lee, 10 Oak St");
  assert.equal(offer.values.status, "new");
});

test("new handoff forms write their own tabs", () => {
  const pond = buildRequest("remove-pond", { agent: "Cassie Kang" }, ctx);
  assert.equal(pond.tab, "Remove from Pond");
  assert.deepEqual(pond.headers, ["timestamp", "agent", "status"]);
  assert.equal(pond.values.status, "new");

  const guide = buildRequest("sellers-guide", { agent: "Kevin Barrett", copies: "3" }, ctx);
  assert.equal(guide.tab, "Request Seller's Guide");
  assert.deepEqual(guide.headers, ["timestamp", "agent", "copies", "status"]);
  assert.equal(guide.values.copies, "3");

  const sheets = buildRequest(
    "feature-sheets",
    { property: "104 3621 W 26th Avenue, Vancouver", agent: "Cassie Kang", copies: "2" },
    ctx,
  );
  assert.equal(sheets.tab, "Request Feature Sheets");
});

test("countdown labels use the Vancouver calendar day", () => {
  assert.equal(countdownLabel("2026-11-25", "2026-11-25"), "Today");
  assert.equal(countdownLabel("2026-11-26", "2026-11-25"), "Tomorrow");
  assert.equal(countdownLabel("2026-11-29", "2026-11-25"), "In 4 days");
  assert.equal(countdownLabel("2026-11-24", "2026-11-25"), "Yesterday");
});

test("team volume is currency and read from team_volume_ytd", () => {
  assert.equal(formatCurrency("90696373"), "$90,696,373");
  assert.equal(formatCurrency("$90,696,373"), "$90,696,373");
  assert.equal(
    statValueFrom(
      [
        ["key", "value"],
        ["transactions_ytd", "85"],
        ["team_volume_ytd", "90696373"],
      ],
      "team_volume_ytd",
    ),
    "90696373",
  );
  assert.equal(transactionsYtdFrom([["transactions_ytd", "85"], ["team_volume_ytd", "1"]]), "85");
});

test("away list keeps vacations that overlap the next two weeks", () => {
  const today = "2026-11-25";
  const rows = [
    ["timestamp", "agent", "start_date", "end_date", "notes", "status"],
    ["2026-11-01 09:00:00", "Doris Stratoberdha", "2026-11-01", "2026-11-10", "", "new"],
    ["2026-11-20 09:00:00", "Cassie Kang", "December 1, 2026", "12/5/2026", "", "new"],
    ["2026-11-20 09:00:00", "Casey Archibald", "2026-11-24", "2026-11-28", "", "new"],
    ["2026-11-20 09:00:00", "Kevin Barrett", "25/11/2026", "2026-11-25", "", "new"],
    ["2026-11-20 09:00:00", "Chantel Machnik", "2026-12-20", "2026-12-22", "", "new"],
  ];
  const away = awayAgentsFrom(rows, today);
  assert.deepEqual(
    away.map((item) => item.agent),
    ["Casey Archibald", "Kevin Barrett", "Cassie Kang"],
  );
  assert.equal(away[0].range, "Nov 24–28, 2026");
  assert.equal(away[1].range, "Nov 25, 2026");
  assert.equal(away[2].range, "Dec 1–5, 2026");
  const serial = String(Math.round((Date.UTC(2026, 10, 25) - Date.UTC(1899, 11, 30)) / 86400000));
  assert.equal(parseSheetDate(serial), "2026-11-25");
});
