# 2026-10-10 Redesign and content brief (for the design tool)

Brand: RapidAid, emergency ambulance dispatch, Bangladesh. Tone: calm, fast, trustworthy. Palette: gauze #F2F5F7, paper #FFF, ink #0D1B2A, signal red #E0312B (emergencies only), oxygen teal #0E8C86 (available/success), amber #E9A21B (pending/warning), slate #5A6B7B. Font: Schibsted Grotesk. Dark mode supported.

## A. Public pages (current state and what content each needs)
| Page | Current | Content needed |
|---|---|---|
| `/` Home | Hero, stats, nearby hospitals (demo), how it works, features, role spotlights, districts, CTA | See section B |
| `/hospitals` | 20 demo hospitals by distance, live list when signed in | Search by name/district, filter ICU, map view, hospital detail drawer |
| `/services` | Static | Ambulance types (Basic, ICU, Cardiac) with equipment, price band, typical response |
| `/about` | Static | Mission, team, safety/compliance, partner logos |
| `/faq` | Static | Grouped Q&A: requesting, payment, privacy, drivers |
| `/contact` | Static | Hotline, email, form with category, map of HQ |
| `/login` | Form + 3 demo role buttons | Role cards with one-line description each, "what you will see" preview |
| `/register` | Form with password strength | Role choice (patient / driver application), terms |

## B. Homepage ideas to make it stronger
1. **Hero:** headline, one-line promise, big Request button, a "Call 999" secondary, animated map card showing an ambulance moving (replace the generic trip line box).
2. **Live-feeling stats strip** (demo values): median dispatch time, hospitals, active ambulances, requests served.
3. **Top hospitals near you** (done): IP-based, "Use my location", Demo data badge.
4. **Interactive coverage map** of Bangladesh with hospital pins by district.
5. **How it works:** 4 steps with illustrations, plus an interactive "try a request" mock.
6. **Ambulance types** cards: Basic, ICU, Cardiac, with equipment lists.
7. **First-aid quick guide:** CPR, bleeding, burns, choking: collapsible cards. Strong trust and SEO value.
8. **Trust band:** security, privacy, response SLAs, partner hospital logos.
9. **Testimonials / case stories** (only real or clearly marked demo).
10. **For drivers and hospitals:** recruitment strip.
11. **Pricing transparency:** base fare + per-km estimator widget.
12. **Mobile app / PWA install** prompt, SMS request fallback.
13. **FAQ preview** (4 questions) and final CTA.
14. **Emergency bar:** persistent sticky "Request now" on mobile.

## C. Inside the app after sign in
### Patient (`/dashboard`)
- Home: active request card with live status, big "Request ambulance" button, recent trips, saved addresses, emergency contacts.
- New request wizard: location (map pin / current), urgency, ambulance type, patient details, destination hospital (suggest nearest ICU), confirm.
- Request detail: trip line, map with driver position and ETA, call driver, share tracking link, cancel, receipt, rate trip.
- Payments: pending and paid, Stripe checkout, receipts.
- Profile: details, medical info (blood group, allergies), theme, password.
### Driver (`/driver`)
- Online/offline switch, current assignment with a single large next-step button, tap-to-navigate and call, day earnings and trip count, history, vehicle info.
### Admin (`/admin`, `/admin/dispatch`, `/admin/resources`)
- Overview: KPIs, requests-over-time chart, status donut, alerts for unassigned > N minutes.
- Dispatch board: pending / in progress / done, nearby ambulances ranked by distance, assign and reassign, cancel with reason.
- Resources: ambulances, hospitals, users, audit log with filters, CSV export.
- Add: live map of all units, SLA report, feedback inbox.

## D. Improvements checklist
- Replace repeated trip demo in role sections with role-specific mock screens.
- Real map (Mapbox/Leaflet) on hero and coverage section.
- Skeletons and empty states on every list; consistent error toasts.
- Accessibility: focus rings, contrast AA, reduced motion, keyboard nav on map and board.
- Performance: lazy-load map, image optimisation, Lighthouse > 90.
- i18n: Bangla / English toggle.
- Notifications: SMS and push on status change.
- Public hospital endpoint on the backend (read-only, no auth) so the homepage can use live data instead of demo data.

## E. Design asks for the plot/design tool
Produce: desktop and mobile homepage, hospitals page, login, patient request wizard, patient trip detail, driver assignment screen, admin dispatch board. Light and dark. Keep signal red reserved for emergency actions.

---

# Part 2. Per-page functionality spec

Backend base: `/api/v1`. Roles: PATIENT, DRIVER, ADMIN. Request status line: PENDING, ASSIGNED, EN_ROUTE_PICKUP, PICKED_UP, EN_ROUTE_HOSPITAL, COMPLETED, CANCELLED. Priority: CRITICAL, HIGH, NORMAL. Ambulance types: BASIC, ICU, CARDIAC. Ambulance status: AVAILABLE, ON_TRIP, MAINTENANCE. Driver status: AVAILABLE, ON_TRIP, OFFLINE. Payment: PENDING, PAID, FAILED, REFUNDED.

Legend: **Exists** = built today. **New** = needs building. **Backend** = needs backend work.

## 1. Public pages (no sign in)

### `/` Home
| Block | Functionality | Status |
|---|---|---|
| Header | Sticky; nav; 999 tap-to-call; Sign in; Get started; mobile scroll nav; theme toggle | Exists (theme toggle New) |
| Hero | Request now (goes to register if signed out, wizard if signed in); Sign in; moving-ambulance map card | Exists (map card New) |
| Stats strip | Four numbers; count-up on scroll; later from a public stats endpoint | Exists (static) / Backend for live |
| Nearby hospitals | Top 5 by distance from IP location; Use my location button; Demo data badge; denied-permission message | Exists |
| Hospital card | Click opens detail drawer: address, phone (tap to call), beds, ICU, directions link | New |
| How it works | 4 steps; interactive "try a request" mock | Exists (mock New) |
| Features | 6 cards | Exists |
| Role spotlights | Patient / driver / dispatcher; each with its own mock screen, not the shared trip demo | Needs work |
| Ambulance types | Basic / ICU / Cardiac cards with equipment and when to choose | New |
| First-aid guide | Collapsible CPR, bleeding, burns, choking, stroke signs; offline-friendly | New |
| Coverage | District chips now; click chip filters hospital list; later map with pins | Exists (chips) / map New |
| Fare estimator | Distance + ambulance type gives price band | New / Backend |
| FAQ preview | 4 questions, link to `/faq` | New |
| Final CTA | Request now, Sign in | Exists |
| Mobile sticky bar | Persistent Request now button under 768px | New |

### `/hospitals`
- List of all hospitals sorted by distance (Exists, demo data), "Use my location" (Exists).
- Search by name and district; filter ICU only; filter by district chip; sort by distance / beds (New).
- Map/list toggle with pins (New).
- Detail drawer: info, call, directions, "Request ambulance to here" (prefills destination in wizard) (New).
- Signed in: live directory from `GET /hospitals` (Exists). Public read-only endpoint (Backend) would remove the demo-data label.

### `/services`
- Ambulance type comparison table: equipment, crew, typical use, price band, response time (New content).
- "Request this type" CTA that prefills the wizard (New).
- Add-ons: oxygen, wheelchair, long-distance, inter-hospital transfer (New).

### `/about`
- Mission, how dispatch works, safety and privacy promises, team, partner hospitals, data handling statement (New content).

### `/faq`
- Grouped accordion: requesting, tracking, payment, privacy, drivers, hospitals; search box; "still need help" contact link (New).

### `/contact`
- Form: name, email, phone, category, message; client validation; success state. Needs a backend endpoint or mailto fallback (Backend).
- Hotline, email, HQ address, map, working hours (New content).

### `/login`
- Email + password with show/hide; inline errors; loading state (Exists).
- Three demo role buttons: Patient, Driver, Admin, each with a one-line "you will see" caption (Exists, captions New).
- Google sign in (`POST /auth/google` exists in backend) (New).
- Forgot password (Backend missing).
- Redirect back to the page the user came from after login (New).

### `/register`
- Name, email, phone, password with strength meter, terms checkbox (Exists).
- Role is always PATIENT. Drivers are created by admin (`POST /admin/drivers`). Add a "Drive with us" application form (New, Backend).
- Google sign up (New).

### `/payment/success`, `/payment/cancel`
- Success: poll payment by session id, show receipt, link to trip (Exists). Cancel: retry payment button (Exists).

### 404 and error pages
- Friendly not-found with hospital search and Call 999; error boundary with retry (Exists, polish New).

## 2. Patient app (`/dashboard`)

### `/dashboard` My requests
| Functionality | Endpoint | Status |
|---|---|---|
| Active request banner with status line, ETA, "Open trip" | `GET /requests` | Exists |
| Big "Request ambulance" button | | Exists |
| Request history with status filter, pagination | `GET /requests` | Exists |
| Saved addresses and emergency contacts | | New / Backend |
| Empty state with first-request prompt | | Exists |

### `/dashboard/requests/new` Request wizard
| Step | Functionality | Status |
|---|---|---|
| 1 Location | Map picker, "use current location", address text, reverse geocode | Exists (map picker); reverse geocode New |
| 2 Details | Priority (CRITICAL / HIGH / NORMAL), ambulance type, patient name/age/condition notes, callback phone | Exists / partly New |
| 3 Destination | Choose hospital; suggest nearest ICU hospital for CRITICAL | Exists (list); suggestion New |
| 4 Confirm | Summary, edit links, submit `POST /requests`, then redirect to trip page | Exists |
- Draft saved locally so a refresh does not lose input (New).
- Call 999 shortcut visible on every step (New).

### `/dashboard/requests/[id]` Trip detail
- Trip line with live status; poll `GET /requests/:id` (Exists). Switch to websocket/SSE for true realtime (Backend).
- Map with pickup, hospital and driver position; ETA (New; driver location comes from `PATCH /driver/location`).
- Driver card: name, plate, ambulance type, tap to call (Exists partly).
- Share tracking link with family (New / Backend).
- Cancel with reason (`POST /requests/:id/cancel`) allowed before pickup (Exists).
- After COMPLETED: Pay now (`POST /payments/initiate`, Stripe checkout) and Rate trip (`POST /feedback`, one per request) (Exists).
- Audit-style timeline of status times (New).

### `/dashboard/payments`
- List with status badges, amount, date, link to trip, pagination (`GET /payments/my`) (Exists).
- Retry failed payment, download receipt PDF (New / Backend).

### `/dashboard/profile`
- Edit name, phone (`PATCH /users/me`) (Exists); theme toggle (Exists).
- Medical info: blood group, allergies, conditions, emergency contacts (New / Backend).
- Change password, delete account (Backend).

## 3. Driver app (`/driver`)

### `/driver` Duty
| Functionality | Endpoint | Status |
|---|---|---|
| Online/offline toggle (AVAILABLE / OFFLINE) | `PATCH /driver/status` | Exists |
| Auto-send GPS while online | `PATCH /driver/location` | Exists |
| Current assignment card, one big next-step button (Start pickup, Picked up, To hospital, Complete) | `PATCH /requests/:id/status` | Exists |
| Tap to call patient, tap to navigate (maps deep link) | | Exists |
| Assigned requests list | `GET /requests/my-assigned` | Exists |
| Incoming assignment alert (sound, vibration) | | New |
| Today summary: trips, distance, hours online | | New / Backend |
| Vehicle info and status (maintenance flag) | `GET /driver/me` | Exists partly |

### `/driver/history` (nav link was removed because the page does not exist yet)
- Past trips with date, route, status, patient rating; filter by day (New). Uses `GET /requests`.

## 4. Admin app

### `/admin` Overview
- KPI tiles from `GET /admin/dashboard-stats`: total, pending, active, completed, cancelled, ambulances available (Exists).
- Requests-over-time area chart, status donut (Exists).
- Alerts: unassigned longer than N minutes, ambulances in maintenance (New).
- Date range filter, export CSV (New).

### `/admin/dispatch` Dispatch board
- Three columns: pending, in progress, done, with priority sort and CRITICAL highlight (Exists).
- Detail sheet per request: patient, location, timeline, audit (Exists).
- Nearby ambulances ranked by distance (`GET /ambulances/nearby`), assign / reassign (`POST /requests/:id/assign`) (Exists).
- Cancel with reason (Exists).
- Live map of all units and requests (New). Auto-refresh or realtime push (New / Backend).
- Filters: priority, type, district, search by patient (New).

### `/admin/resources` (tabs; replaces the four separate nav items that pointed at missing pages)
- Ambulances: list, create, edit, delete, status change (`/ambulances`) (Exists).
- Hospitals: list, create, edit, delete (`/hospitals`) (Exists).
- Users: list with role filter, change role (`PATCH /admin/users/:id/role`), create driver (`POST /admin/drivers`) (Exists).
- Audit log: filter by request, actor, action, date range; export (`GET /admin/audit-logs`) (Exists; filters partly New).
- Suggested split into real routes (`/admin/ambulances`, `/admin/hospitals`, `/admin/users`, `/admin/audit`) when the designs land.
- New: feedback inbox (`GET /feedback/request/:id` per request; a list endpoint is Backend), payments report (Backend).

## 5. Cross-cutting functionality
- Auth: HTTP-only cookie session, silent refresh via `/api/auth/refresh`, role-based redirect (`roleHome`), logout everywhere (Exists).
- Route guards: `proxy.ts` blocks wrong-role routes (Exists).
- Notifications: toast now; add SMS/push on status change (Backend).
- Theme: light/dark persisted (Exists).
- i18n: Bangla / English (New).
- Accessibility: keyboard flows, focus rings, AA contrast, reduced motion (partly Exists).
- Loading, empty and error states on every list (Exists, audit for gaps).
- Analytics and error tracking (New).

## 6. Fixes made while writing this spec
- Nav items `/driver/history`, `/admin/ambulances`, `/admin/hospitals`, `/admin/users`, `/admin/audit` pointed at pages that do not exist (404). Removed the driver one and collapsed the admin ones into a single "Resources" link to `/admin/resources`.

---

# Part 3. Context from the assignment repo (B7A7) and backend, and gaps found

Sources: `../B7A7` (README, project-requirements, timeline) and `../ph-l2-b7-asnmnt-6` (schema, routes, docs). Submission deadline in the README: **2026-10-10, 11:59 PM**.

## Mandatory rules that constrain the redesign
| Rule | Current state | Action |
|---|---|---|
| Real API only; no mock/hardcoded data for core workflows | Homepage and `/hospitals` use 20 demo hospitals (hospitals are not the request workflow; labelled "Demo data") | Keep as agreed, but add a public read-only `GET /hospitals/public` (or drop auth on the list) in the backend and switch the homepage to it. This also removes the grading risk. |
| No placeholder content, no lorem ipsum | Stats strip values and coverage text are static marketing copy | Source from `GET /admin/dashboard-stats` equivalent public endpoint, or phrase as claims that are true of the demo |
| URL state sync (`useSearchParams`) for all filters, sort, search, pagination | **Not implemented** in dashboards, dispatch board, resource tables, hospitals page (only payment pages read params) | Add `?page=&status=&priority=&q=` to: patient request list, payment list, admin dispatch, ambulances, hospitals, users, audit log, `/hospitals` |
| Metadata API (title, description, Open Graph) on all public pages | Only root layout has metadata; home is a client component | Convert home/about/services/faq/contact/hospitals to Server Components with `export const metadata`; keep only interactive parts (`NearbyHospitals`, demo) as client islands |
| Server Components by default, `loading.tsx` on every data page | `loading.tsx` exists for admin, driver, dashboard only; many pages are `use client` | Split; add `loading.tsx` for `/hospitals` and request detail |
| Min 18 pages with category coverage | 19 `page.tsx` files, but the provider(driver) group has 1 page, admin has no reports page | Add driver `/driver/history`, `/driver/earnings`, `/driver/profile`; admin `/admin/reports` (and optionally split resources) |
| Three roles, route guard + conditional UI | Done (`proxy.ts`, role shell) | Re-verify after redesign |
| One-click demo login, 3 roles | Done, now working | Add captions per role; verify on production URL |
| Multi-step wizard | Request wizard exists | Keep |
| Form standards: React Hook Form + Zod | Verify every form (contact, profile, admin create dialogs) | Audit |
| Optimistic UI updates | Not confirmed | Add to driver status toggle, assignment, cancel |
| Recharts data viz on admin | Done | Keep |
| Stripe test-mode flow with success and cancel pages | Done | Test on production |
| 20+ meaningful commits | Check `git log` count | Keep committing per feature |
| Deployment, demo credentials, video | Pending | Set `NEXT_PUBLIC_API_BASE_URL` on Vercel (now tolerant of a missing `/api/v1`), run the seed on the production DB |

## Backend facts that shape the UI (from schema and routes)
- Models: User, DriverProfile (licenseNumber, status, currentLat/Lng, ambulance), Ambulance (plate, type, status, homeHospital), Hospital (name, address, lat, lng, phone), EmergencyRequest (pickup address/lat/lng, priority, status, ambulance, driver, destinationHospital, cancelReason, requestedAt/assignedAt/completedAt), RequestStatusLog (actor, from, to, note), Payment (amount, currency, stripeSessionId, status), Feedback (rating 1-5, comment, one per request), RefreshToken.
- **Not in the backend** (so my Part 2 items marked "Backend" truly need backend work): patient medical info, saved addresses, emergency contacts, patient age/condition notes, ambulance type chosen at request time (type is only on the ambulance), fare estimate, earnings, contact form, forgot password, driver application, public stats, realtime push, feedback list endpoint, receipts. Remove or defer these from the design if backend time is not available.
- Endpoints available: auth (register, login, google, refresh-token, logout), users (me get/patch), hospitals (list/get authenticated; create/patch/delete admin), ambulances (list, nearby, get, create/patch/delete admin), requests (list, my-assigned, get, create PATIENT, assign ADMIN, status, cancel), driver (me, status, location), admin (create driver, users list, role patch, dashboard-stats, audit-logs), payments (initiate, my, get, callback success/cancel, Stripe webhook), feedback (create PATIENT, list per request).
- Earnings page can be derived on the frontend from completed trips + payments only if payment amount is visible to the driver; otherwise show trips-completed and ratings, which the backend does support (feedback per driver).

## Revised priority order (given the deadline)
1. URL-synced filters and pagination on every list (mandatory, currently missing).
2. Metadata on public pages and Server Component split for home/about/services/faq/contact.
3. Missing driver pages (history, profile, earnings-as-trips-and-ratings) and `/admin/reports`.
4. Public hospitals endpoint on the backend, then drop the demo-data label.
5. Optimistic updates, form audit, role-specific mockups on the home page.
6. Deploy, set env vars, seed production DB, record video.
