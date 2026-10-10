# 2026-10-10 Issues found (detailed)

Audit of the frontend (`Emergency-Ambulance-Dispatch-Frontend`), the backend (`ph-l2-b7-asnmnt-6`) and the assignment rules (`B7A7/README.md`, `project-requirements.md`, `timeline-breakdown.md`). Submission deadline in the README: 2026-10-10, 11:59 PM.

Status key: **Fixed** (done and committed), **Open** (not done), **Decision** (needs a product choice).
Severity: **Blocker** (breaks the app or a mandatory rule), **High**, **Medium**, **Low**.

---

## A. Bugs reported by the user

### A1. `Route not found: POST /auth/login` on Patient / Driver / Admin buttons: Fixed, Blocker
- **Evidence:** the message comes from the backend's `notFoundHandler` (`src/middleware/errorHandler.ts:14`), which prints `req.originalUrl`. It printed `/auth/login`, but the backend mounts auth at `/api/v1/auth` (`src/app.ts:60`). So the request reached the backend without the `/api/v1` prefix.
- **Root cause:** `NEXT_PUBLIC_API_BASE_URL` was set to the bare host. `src/lib/backend.ts` builds `${base}/auth/login`, so the prefix was lost. The in-code default already had `/api/v1`, so only a configured value could trigger this.
- **Fix:** `normalizeApiBase()` in `src/env.ts` trims trailing slashes and appends `/api/v1` when missing.
- **Verification:** ran the frontend with the bare `http://localhost:5000`; demo login returned success for all three roles.
- **Related:** `src/app/api/proxy/[...path]/route.ts` and the token refresh route use the same variable, so they are fixed by the same change.

### A2. Demo login failed with "Invalid email or password": Fixed, Blocker
- **Evidence:** after A1, `POST /api/v1/auth/login` for `patient@dispatch.demo` and `driver@dispatch.demo` returned "Invalid email or password".
- **Root cause:** the dev database had no demo patient or driver rows; the seed had not been run there.
- **Fix:** ran `bun run db:seed` (upsert, `update: {}`, so existing rows are untouched). Then all three logins worked.
- **Still open:** the same seed must be run against the production database before submission, or the one-click buttons fail on the live site. The admin account already existed with a different display name ("New Name"), so its password is the one in the database, not necessarily `Admin123!`. The `DEMO_ADMIN_*` env vars must match what is stored.

### A3. Login button text invisible until hover: Fixed, High
- **Cause:** the homepage call-to-action used the `outline` button variant, which sets `bg-background` (light in light mode). The label was `text-paper` (white). White text on a light background reads as empty until the hover style swaps the background.
- **Fix:** transparent background with fixed white text on a fixed dark band. The band used `bg-ink`, which flips to a light colour in dark mode, so it now uses a fixed dark colour.
- **Same pattern checked on:** hero Sign in, header Sign in, role spotlight buttons. All now set an explicit background.

### A4. Homepage "Hospitals near you" empty for visitors: Fixed (with a caveat), High
- **Cause:** `GET /hospitals` sits behind `authenticate` (`hospital.routes.ts:13`). Signed-out visitors got a 401, the hook swallowed it into an empty list, and the page showed an empty state.
- **Fix:** bundled 20 demo hospitals, IP-based ordering via `/api/geo`, a "Use my location" button, and a "Demo data" badge.
- **Caveat (Decision):** the assignment says "Real API only ... Mock data, hardcoded JSON ... NOT accepted for any core workflow." Hospitals are not the request workflow, but a grader could still object. The clean fix is a public read-only hospitals endpoint on the backend.

---

## B. Issues found while auditing

### B1. Navigation links to pages that do not exist: Fixed, High
`src/components/shell/nav-config.ts` linked to `/driver/history`, `/admin/ambulances`, `/admin/hospitals`, `/admin/users`, `/admin/audit`. None has a `page.tsx` (the admin data lives in tabs at `/admin/resources`). Clicking any of them gave a 404 inside the signed-in shell. Driver link removed; admin links collapsed into one "Resources" link.

### B2. No URL state for filters, sort, search or pagination: Open, Blocker (mandatory rule)
- **Rule:** "All filtering, sorting, searching, and pagination must be reflected in the URL ... using `useSearchParams`."
- **Evidence:** `grep useSearchParams` matches only `payment/success` and `payment/cancel`.
- **Affected lists:** patient request list, payments list, admin dispatch board, ambulances / hospitals / users / audit tabs, `/hospitals`. Admin tab selection is also not in the URL (`Tabs defaultValue="ambulances"`).
- **Impact:** refresh loses the view; links cannot be shared; marks lost under "Performance & Optimization" (URL state) and the page requirements.

### B3. Public pages have no metadata; most pages are client components: Open, High (mandatory rule)
- **Evidence:** `export const metadata` appears only in `src/app/layout.tsx`. Of 19 pages, 16 start with `'use client'`; only `about`, `faq`, `services` are Server Components.
- **Rule:** "All public pages must have proper Metadata (title, description, Open Graph)" and "Use Server Components by default."
- **Impact:** every public page shares one generic title; no Open Graph; weak mark on "Next.js Architecture" (15%).
- **Needs:** per-page metadata for `/`, `/about`, `/services`, `/faq`, `/contact`, `/hospitals`, `/login`, `/register`. Home, hospitals and contact must split into a server shell plus small client islands (`NearbyHospitals`, contact form, trip demo). The layout's description also says only "Dhaka", while the demo data now spans the country.

### B4. Missing pages for the driver role and admin reports: Open, High (mandatory rule)
- **Rule:** at least 18 real pages, with three pages per role dashboard (Provider: tasks, earnings, profile; Admin: overview, resource management, reports/settings).
- **Now:** 19 `page.tsx` files, but driver has 1 (`/driver`), admin has 3 (overview, dispatch, resources) with no reports page, and patient has 3 plus the wizard and trip detail.
- **Risk:** the total passes only because public and payment pages pad it; the per-role coverage does not.
- **Backend limit:** there is no earnings endpoint. A driver earnings page can show completed-trip counts and ratings (feedback is per driver) but not money, unless payments are exposed to drivers.

### B5. `next/image` not used anywhere: Open, Medium (mandatory rule)
`grep "next/image" src` returns nothing. The app is mostly icons and SVG, so the practical gap is small, but the rule says "Use `next/image` for all images." Any hero or about-page photography added by the redesign must use it.

### B6. Forms are not all React Hook Form + Zod: Open, High (mandatory rule)
- **Rule:** "All forms must use React Hook Form ... with Zod."
- **Uses it:** register, profile.
- **Does not:** login (`useState` + manual check), contact (`useState`), request wizard (`src/app/dashboard/requests/new/page.tsx`, `useState`), admin dialogs for ambulances, hospitals, users/driver creation (no `useForm` or zod in `src/components/admin/`), the feedback form, cancel-reason dialog.
- **Impact:** inconsistent validation messages; frontend rules can drift from the backend schemas (`*.validation.ts`). Marked 10% in the grading table.

### B7. No optimistic updates: Open, Medium
`grep onMutate|optimistic` returns nothing. The timeline asks for optimistic UI on instant-feedback actions. Best candidates: driver online/offline toggle, driver next-step button, admin ambulance status change, request cancel.

### B8. `loading.tsx` missing on several data pages: Open, Medium
Present: `dashboard`, `admin`, `driver` (route-group level only). Missing: `/hospitals`, `/dashboard/requests/[id]`, `/dashboard/requests/new`, `/admin/dispatch`, `/admin/resources`, `/dashboard/payments`. Group-level skeletons show a generic shape, not the page's. Requirement: a skeleton for every data-fetching page.

### B9. Public hospital data cannot be real without a backend change: Open, Medium (Decision)
See A4. Options: (1) add an unauthenticated `GET /hospitals/public` returning name, address, lat, lng, phone; (2) make `GET /hospitals` public and keep write routes admin-only. Either removes the need for the "Demo data" label.

### B10. Stats strip and coverage text are static claims: Open, Medium
"< 3 min median dispatch", "20 hospitals", "24/7", "3 taps" are hardcoded. The rule bans placeholder content. "20 hospitals" is true of the demo list only; "< 3 min" is unverifiable. Replace with real counts from a public stats endpoint, or reword as product facts that are true (for example "3 taps to request").

### B11. Role spotlight sections reuse one animated demo three times: Open, Medium (design)
The patient, driver and dispatcher blocks all render the same `TripLineDemo`. They need role-specific visuals (request wizard, driver action button, dispatch board). Also, the first screenshot showed the hero card being small and visually weak next to the headline.

### B12. IP geolocation edge cases: Open, Low
- On the dev machine the IP resolved to Singapore, outside Bangladesh; the code falls back to Dhaka correctly.
- `/api/geo` calls a third-party service (`ipwho.is`) server-side with the visitor's IP when not on Vercel; on Vercel it uses the geo headers instead. Document this in the privacy text; consider rate limiting the route.
- The browser geolocation result is not persisted, so it is lost on refresh.

### B13. Auth gate (`proxy.ts`) details: Open, Low
- Role is read from the unsigned JWT payload; fine for routing (the backend enforces real authorization) but must never be used for data decisions.
- Signed-in driver or admin visiting `/login` is redirected to `/dashboard`, then bounced to their own home: two hops instead of one.
- The access token expiry is not checked in `proxy.ts`; an expired cookie passes the gate and the first API call triggers refresh. Works, but the shell can flash before redirect.
- Unknown paths are classed as `public` through the `'/'` prefix match; harmless because Next serves the 404.

### B14. Contact form has no backend: Open, Low (Decision)
`src/app/contact/page.tsx` opens the visitor's mail client with a prefilled message. Honest, but it is not a real submission. Needs a backend endpoint (or a transactional email route) if the page is meant to be functional.

### B15. Content gaps in the brief versus the backend: Open, Medium
Items proposed in the first draft of the brief that the schema cannot support: patient medical info, saved addresses, emergency contacts, patient age and condition on the request, ambulance type chosen at request time, fare estimate, driver earnings, forgot password, driver application, push or SMS notifications, realtime updates, feedback list for admins, payment receipts. They are now tagged "Backend" in `2026-10-10-redesign-content-brief.md`. Do not design these without backend time.

### B16. Environment and deployment: Open, High
- `.env*` is git-ignored, so deploy settings were invisible. Added `.env.example`.
- Vercel needs `NEXT_PUBLIC_API_BASE_URL` (now tolerant of a missing `/api/v1`), and optionally `NEXT_PUBLIC_MAPBOX_TOKEN` and `DEMO_*` overrides.
- Backend CORS: `CORS_ORIGIN` must include the deployed frontend origin. The proxy route calls the backend server-side, so browsers do not hit CORS, but any direct browser call would.
- Seed the production database (see A2).

### B17. Process and submission rules: Open
- Commits: 39 on the branch against a minimum of 20, so the count is met. Keep messages free of tool or agent names (project rule in `AGENTS.md`).
- Still to do: live URL, demo credentials list, 5 to 10 minute video, submission template.
- Hotline: the header shows `tel:999`, which is Bangladesh's national emergency number; confirm it is the intended number for the product.

---

## C. Priority order
1. B2 URL state (mandatory, missing)
2. B3 metadata and server/client split (mandatory, missing)
3. B4 missing driver and admin pages (mandatory coverage)
4. B6 forms to React Hook Form + Zod (mandatory)
5. B9 / A4 public hospitals endpoint, then remove demo label
6. B7 optimistic updates, B8 skeletons, B5 `next/image`
7. B10, B11 content and visual polish
8. B16 / A2 deploy, seed production, record video

## D. What is verified versus assumed
- **Verified by running code:** A1, A2 (curl against local backend and frontend), A3 and the homepage layout (browser screenshot), B1 (file listing against nav config), B2 to B8 (grep and file listing on the current tree).
- **Not run:** a production build, Lighthouse, the Stripe payment flow, the dashboard pages after login, mobile layouts of the redesigned homepage.
- **Assumed:** B12 production behaviour of the geo route; B16 production environment values.
