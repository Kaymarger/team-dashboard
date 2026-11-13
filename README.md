# AREG Team

Internal dashboard for agents at Archibald Real Estate Group (RE/MAX Crest Realty, Vancouver).

Agents sign in with one shared password, check dates and listing files, and submit requests. Each request adds a row to a Google Sheet. A backend bot (not in this repo) polls rows whose `status` is `new` and fulfils them. This app does not send email.

The sign-in, service-account, and sheet-write approach matches [command-center](https://github.com/Kaymarger/command-center). Use the same `GOOGLE_SERVICE_ACCOUNT_JSON` so one key can be shared. Do not put real secrets in this repo.

## Put it on Vercel

`main` is what Vercel’s free Hobby plan should auto-deploy. Connect the public GitHub repo and set these as Production environment variables:

| Name | What it is |
| --- | --- |
| `TEAM_PASSWORD` | Shared team password. At least 8 characters. |
| `TEAM_SHEET_ID` | The id in the Google Sheet URL (`https://docs.google.com/spreadsheets/d/<id>/edit`). The spreadsheet itself is created by hand; the app adds tabs. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | The full JSON key file for a Google service account, including the curly braces. Same name command-center uses. |

Share that spreadsheet with the service account’s `client_email` as an **Editor**. Reads and new tabs both use that key.

Copy `.env.example` to `.env.local` for local runs. `.env*` files are gitignored.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What the sheet looks like

Header matching ignores case, spaces, and underscores (`closing date` and `closing_date` are the same column). A missing tab is treated as empty. The app creates a **write** tab, and writes its header row, when that tab is missing or the first row is blank. It does not overwrite a header row that is already filled in. On submit it appends one row aligned to those headers. `timestamp` is Vancouver local time (`YYYY-MM-DD HH:mm:ss`). `status` is always `new`.

The backend bot fills every read-only tab. This app only reads them.

### Read-only tabs

| Tab | Columns | What the page shows |
| --- | --- | --- |
| `Important Dates` | `date`, `title`, `notes` | Compact list, upcoming dates first (including today, America/Vancouver), then undated, then past. |
| `Stats` | a row whose cell is `transactions_ytd`, and the next cell on that row is the number. A `key` / `value` header row is fine. | Transactions YTD card for 2026. |
| `Listing Files` | `address`, `mls_url`, `strata_url` | Active listings. Current Listings and every Property dropdown show these addresses (matched without caring about case). A matching address opens the MLS or strata link instead of sending a request. If this tab has no addresses, the page falls back to the featured-properties scrape. |
| `Outstanding Notary` | `address`, `side`, `closing_date` | Compact list. |
| `Notary Options` | `address` | Property dropdown on Submit Notary Info. |
| `Pending Subjects` | `address`, `agent`, `subject_removal_date` | Property dropdown on Remove Subjects. The submitted row copies the agent and removal date from the chosen row. |

Empty read-only tabs show a short empty state, not an error. A missing password, sheet id, or service-account key shows one message at the top.

### Request tabs

Each submitted row is the whole handoff.

| Tab | Columns |
| --- | --- |
| `Request Pond Access` | `timestamp`, `agent`, `status` |
| `Request Buyer's Guide` | `timestamp`, `agent`, `copies` (1–5), `status` |
| `Request Feature Sheets` | `timestamp`, `property`, `agent`, `copies` (1–15), `status` |
| `Strata Documents` | `timestamp`, `property`, `agent`, `status` |
| `Listing Media` | `timestamp`, `property`, `agent`, `status` |
| `MLS Sheet` | `timestamp`, `property`, `agent`, `status` |
| `Vacation Days` | `timestamp`, `agent`, `start_date`, `end_date`, `notes`, `status` |
| `Submit Notary Info` | `timestamp`, `agent`, `property`, `side` (`Buyer` or `Seller`), then the provisional fields in `src/config/forms.ts` (`notary_name`, `firm`, `phone`, `email`, `notary_info`, `completion_date`, `notes`), `status` |
| `Remove Subjects` | `timestamp`, `property`, `agent`, `subject_removal_date`, `notes`, `status` |
| `New Listings` | `timestamp`, `agent`, `property_address`, `list_date`, `list_term`, `list_price`, `commission`, `offer_date` (`Yes`/`No`), `disclosure`, `building_type` (Attached/Detached, blank unless the disclosure is a Property Disclosure Statement), `seller_emails` (several addresses separated by `; `), `lead_source`, `lead_source_detail`, `signage_needed`, `send_onboarding_form`, `notes`, `status` |
| `Meeting Topics` | `timestamp`, `agent`, `topic`, `details`, `status` |

Open House Availability is only a link to the Google Form. It does not write a tab.

Current Listings and the Property dropdowns on Feature Sheets, Strata Documents, Listing Media, and MLS Sheet use the `Listing Files` addresses, with capitalization normalized (directionals like W and SW stay uppercase). The [featured properties page](https://archibaldrealestate.ca/featured-properties/) is scraped and cached for about an hour only as a fallback when `Listing Files` has no addresses, and to attach an MLS number when one matches. If that page cannot be read and the tab is empty, those fields become a free-text address. New Listing asks for a property address directly, because that home is not on the active list yet. Notary and Remove Subjects use their own sheet tabs, and fall back to typed fields when those tabs are empty.

Seller emails, list terms, lead sources, disclosure choices, and the notary detail fields are in `src/config/forms.ts`. Agent names are in `src/config/agents.ts`. Quick links and the open-house form are in `src/config/links.ts`.

## Not included

- No confirmation “fulfilment link”. If the bot later adds a column on a tab, new rows leave that cell blank.
- No email, and no editing of the read-only tabs.
- No in-app fulfilment. The bot owns every `new` row after it is appended.
