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
| `Listing Files` | `address`, `mls_url`, `strata_url`, `media_url` | Active listings. Current Listings, Feature Sheets, and the MLS Sheet, Strata Documents, and Listing Media dialogs use these addresses. A blank URL is hidden on the address row and shown as “Not available yet” in those dialogs. If this tab has no addresses, the page falls back to the featured-properties scrape. |
| `Outstanding Notary` | `address`, `side`, `closing_date` | Shown inside Notary Info. Those addresses fill the Property dropdown, along with Other. |
| `Pending Subjects` | `address`, `agent`, `subject_removal_date` | Property dropdown on Remove Subjects, along with Other. A listed row copies the agent and removal date. Other asks for the address, agent, and date. |

Empty read-only tabs show a short empty state, not an error. A missing password, sheet id, or service-account key shows one message at the top.

### Request tabs

Each submitted row is the whole handoff.

| Tab | Columns |
| --- | --- |
| `Request Pond Access` | `timestamp`, `agent`, `status` |
| `Request Buyer's Guide` | `timestamp`, `agent`, `copies` (1–5), `status` |
| `Request Feature Sheets` | `timestamp`, `property`, `agent`, `copies` (1–15), `status` |
| `Vacation Days` | `timestamp`, `agent`, `start_date`, `end_date`, `notes`, `status` |
| `Submit Notary Info` | `timestamp`, `agent`, `property`, `side` (`Buyer` or `Seller`), `notary_info`, `notes`, `status` |
| `Remove Subjects` | `timestamp`, `property`, `agent`, `subject_removal_date`, `notes`, `status` |
| `New Listings` | `timestamp`, `agent`, `property_address`, `list_date`, `list_term`, `list_price`, `commission`, `offer_date` (`Yes`/`No`), `disclosure`, `building_type` (Attached/Detached, blank unless the disclosure is a Property Disclosure Statement), `seller_emails` (several addresses separated by `; `), `lead_source`, `lead_source_detail`, `signage_needed`, `send_onboarding_form`, `notes`, `status` |
| `Meeting Topics` | `timestamp`, `agent`, `topic`, `details`, `status` |
| `CINC Support Tickets` | `timestamp`, `agent`, `issue`, `screenshot_count`, `ticket_id`, `status` (`new`) |
| `Ticket Screenshots` | `ticket_id`, `image_index` (1 for the first image), `filename`, `mime_type` (`image/jpeg`), `chunk_count`, then `chunk_1`, `chunk_2`, … one column per piece. One row per image. Each chunk is at most 45,000 characters of base64. To rebuild a photo, concatenate `chunk_1` through `chunk_{chunk_count}`, base64-decode that string, and save it as a `.jpg`. Ignore any later chunk columns on that row. |

Open House Availability is only a link to the Google Form. It does not write a tab.

Current Listings and the Feature Sheets property dropdown use the `Listing Files` addresses, with capitalization normalized (directionals like W and SW stay uppercase). MLS Sheets, Strata Documents, and Listing Media open a list of those addresses and link to `mls_url`, `strata_url`, or `media_url`. They do not add a sheet row. The [featured properties page](https://archibaldrealestate.ca/featured-properties/) is scraped and cached for about an hour only as a fallback when `Listing Files` has no addresses, and to attach an MLS number when one matches. If that page cannot be read and the tab is empty, Feature Sheets becomes a free-text address. New Listing asks for a property address directly, because that home is not on the active list yet. Notary Info takes its property list from Outstanding Notary, and Remove Subjects takes its list from Pending Subjects. Both include Other for a typed address.

Seller emails, list terms, lead sources, disclosure choices, and the notary detail fields are in `src/config/forms.ts`. Agent names are in `src/config/agents.ts`. Quick links and the open-house form are in `src/config/links.ts`.

## Not included

- No confirmation “fulfilment link”. If the bot later adds a column on a tab, new rows leave that cell blank.
- No email, and no editing of the read-only tabs.
- No in-app fulfilment. The bot owns every `new` row after it is appended.
