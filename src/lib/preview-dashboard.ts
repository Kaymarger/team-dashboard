import type { DashboardData } from "@/lib/dashboard";

/**
 * Local screenshot fixture only. Production never reads this: NODE_ENV is
 * production on Vercel, and the flag is not set there.
 */
export function previewDashboard(): DashboardData | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.DASHBOARD_PREVIEW !== "1") return null;

  return {
    sheetError: null,
    transactionsYtd: "85",
    listingsError: null,
    dates: [
      {
        date: "Nov 18, 2026",
        title: "Team meeting",
        notes: "Bring listing updates",
        sortKey: "2026-11-18",
        when: "upcoming",
      },
      {
        date: "Nov 21, 2026",
        title: "Dunbar open house",
        notes: "Saturday 2–4",
        sortKey: "2026-11-21",
        when: "upcoming",
      },
      {
        date: "Dec 2, 2026",
        title: "Broker tour",
        notes: "West side",
        sortKey: "2026-12-02",
        when: "upcoming",
      },
    ],
    listings: [
      { address: "104 3621 W 26th Ave, Vancouver", mls: "R3183291" },
      { address: "64 728 W 14th St, North Vancouver", mls: "R3181182" },
      { address: "1101 2077 Nelson St, Vancouver", mls: "R3175537" },
    ],
    listingFiles: [
      {
        address: "104 3621 W 26th Ave, Vancouver",
        mlsUrl: "https://example.com/mls/r3183291",
        strataUrl: "https://example.com/strata/dunbar",
        mediaUrl: "https://example.com/media/dunbar",
      },
      {
        address: "64 728 W 14th St, North Vancouver",
        mlsUrl: "https://example.com/mls/r3181182",
        strataUrl: "",
        mediaUrl: "https://example.com/media/noma",
      },
      {
        address: "1101 2077 Nelson St, Vancouver",
        mlsUrl: "https://example.com/mls/r3175537",
        strataUrl: "https://example.com/strata/nelson",
        mediaUrl: "https://example.com/media/nelson",
      },
    ],
    outstandingNotary: [
      { address: "216 1777 W 7th Ave, Vancouver", side: "Buyer", closingDate: "Dec 12, 2026" },
      { address: "1907 E 40th Ave, Vancouver", side: "Seller", closingDate: "Dec 18, 2026" },
      { address: "90 Tidewater Way, Lions Bay", side: "Seller", closingDate: "Jan 8, 2027" },
    ],
    pendingSubjects: [
      { address: "102 320 W 2nd St, North Vancouver", agent: "Casey Archibald", subjectRemovalDate: "2026-11-24" },
      { address: "315 711 W 14th St, North Vancouver", agent: "Cassie Kang", subjectRemovalDate: "2026-11-26" },
      { address: "103 108 W Esplanade, North Vancouver", agent: "Kevin Barrett", subjectRemovalDate: "2026-11-28" },
      { address: "9024 Riverside Dr, Whistler", agent: "Doris Stratoberdha", subjectRemovalDate: "2026-12-01" },
    ],
  };
}
