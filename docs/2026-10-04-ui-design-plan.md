# UI design plan — "Dispatch" (Emergency Ambulance Dispatch)

Date: 2026-10-04.

## Subject, audience, job
Product: ambulance request and dispatch for Dhaka. Three audiences with very different states of mind:
- **Patient / caller**: scared, one thumb, bad signal. Job: get an ambulance in under 30 seconds, then see it coming.
- **Driver**: in a moving vehicle, gloves, glare. Job: see the next action and press one big button.
- **Admin / dispatcher**: sits all shift, watches a queue. Job: assign the right ambulance fast, spot stuck trips.

So: one design system, three density modes (calm-large, glanceable-huge, dense-console).

## Plan (pass 1)
**Color** (cool clinical base, one hot signal):
- Gauze `#F2F5F7` page, Paper `#FFFFFF` surface
- Triage Ink `#0D1B2A` text / dark console surface `#0A141F`
- Signal Red `#E0312B` — used ONLY for emergency/critical/SOS. Nowhere decorative.
- Oxygen Teal `#0E8C86` available / done / pay success
- Amber `#E9A21B` pending / assigned / warning
- Slate `#5A6B7B` secondary text, hairlines `#D8DFE5`
Dark mode: Triage Ink surfaces; Signal Red stays identical so meaning never shifts. Driver and admin default to dark (night shifts, in-cab glare reduction); patient + public default to light. Theme toggle everywhere.

**Type**: Schibsted Grotesk only (variable). 700 tight-tracked for headlines, 500 for UI, 400 body, tabular figures for times/plates/money. Scale 12/14/16/20/28/44/72. Body max 68ch. Sentence case everywhere. No all-caps labels, no mono labels.

**Signature element — the Trip Line**: a horizontal (vertical on mobile) route drawn from the backend state machine: PENDING → ASSIGNED → EN_ROUTE_PICKUP → PICKED_UP → EN_ROUTE_HOSPITAL → COMPLETED. Filled segment in the current status color, current node pulses once on change (answers a real event, not decoration). Reused in: landing hero (live demo that auto-plays a sample trip), request detail, driver active trip, admin board rows (compact). This is the one memorable thing; everything else stays quiet.

**Layout concept**
- Public: left-aligned. Hero = giant "Request an ambulance" headline left, the Trip Line demo right; below it, hospitals near you (real API data) and how dispatch works. A persistent red "Request now" button on mobile.
- Patient: mobile-first, bottom tab bar (Home, Requests, Payments, Profile); desktop becomes left rail. New request = 3-step wizard (Where → How urgent → Review) with map pin picker (Leaflet + OpenStreetMap, no key) and "use my location".
- Driver: single column, one primary action button the full width of the screen showing the NEXT legal status ("Start driving to patient"), online/offline switch pinned at top, trip card with tap-to-call and tap-to-navigate (geo: link). Min tap target 56px.
- Admin: left rail + top bar, dense. Overview = KPIs + requests-per-day area chart + status donut + revenue; **Dispatch board** = columns Pending / Active / Done with priority sorting, click a pending card opens a side sheet listing nearby ambulances (distance) → Assign. Tables use URL-synced filters.

```
Admin dispatch board
+-------------+----------------------------------------------+
| rail        | Pending (3)   | In progress (5) | Done today  |
| Overview    | [CRIT] Mirpur | o--o--o----     | ...         |
| Dispatch *  | [HIGH] Uttara | o--o-------     |             |
| Hospitals   |   -> sheet: nearby ambulances, Assign        |
+-------------+----------------------------------------------+
Driver
+---------------------------+
| Online [====o]  DHK-1001  |
| Trip: Mirpur 10 · CRITICAL|
| o--o--o-----              |
| [  Start driving to       |
|    patient  (huge)     ]  |
| Call patient | Navigate   |
+---------------------------+
```

**Principles**: red means emergency only; the trip line is the only motif; motion only on state change; radius 6px on data surfaces, full-round only on the SOS/primary action; no identical-card grids — lists are rows, KPIs vary in size by importance; shadows replaced by 1px hairlines + surface tone steps.

## Self-review against defaults (pass 2) — changes made
- First instinct was an ECG heartbeat line + red/white medical cross. Generic medical-template look. Replaced with the trip line derived from the product's real state machine.
- First instinct was dark + acid accent for admin. Rejected (cliché #2). Kept dark only as a shift-work function, with the same single red.
- Dropped eyebrow labels, numbered steps (wizard steps ARE a sequence, so step indicator kept there only), gradient washes, stat-card grid with identical sizes.
- Landing "stats" row dropped; replaced by live hospitals from the API.

## Copy rules
Plain verbs: "Request ambulance", "Assign ambulance", "Mark picked up", "Pay for trip". Same verb in button, toast, and audit log. Errors say what failed and what to do. Empty states invite an action ("No requests yet. Request an ambulance when you need one.").
