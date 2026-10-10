# 2026-10-10 Not-built features and open risks (detailed specification)

Updated after the first round of fixes. Part A says what exists now, so nobody rebuilds it. Part B lists risks and defects that are not fixed. Part C specifies every feature that is still not built, in enough detail to implement without asking questions. Part D gives the order, effort and the actions only the owner can do.

Repos: frontend `Emergency-Ambulance-Dispatch-Frontend` (Next.js 16, Tailwind v4, base-ui, TanStack Query), backend `ph-l2-b7-asnmnt-6` (Express, Prisma, Postgres on Neon, Stripe, vitest, biome). Live: frontend `https://emergency-ambulance-dispatch-fronte.vercel.app`, API `https://emergency-ambulance-dispatch-api.vercel.app/api/v1`.

---

## Part 0. Ground rules for anyone implementing

1. **The database is shared.** Development, the local backend on port 5000 and production all use the same Neon database. Never run `prisma migrate dev`, `db push` or the seed against it. Write each migration by hand as SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`, keep it additive (new tables, new nullable columns, new enums), test on the local Postgres from `.env.test` (`dispatch_test`), and have the owner run `bunx prisma migrate deploy` once. **Rollout order:** apply the migration first, then push the backend, then move the API alias, then push the frontend. Old code keeps working against the new columns because they are nullable.
2. **Real data only.** The assignment forbids placeholder content: no invented numbers, names, emails, certifications or claims. If the backend cannot supply a value, hide the element. Reviewers have already had to remove invented text twice (receipt, home page).
3. **API conventions.** Envelope `{ success, message, data }`; errors `{ success: false, message, errors? }`; lists `{ items, meta: { page, limit, total, totalPages } }` with `limit` capped at 100; singletons wrapped (`data.request`, `data.profile`). Zod validation through the existing `validate()` middleware; `AppError` helpers; `catchAsync`; `sendResponse`.
4. **Frontend conventions.** React Hook Form + Zod; errors via `FieldError`; token classes only (`bg-paper`, `text-ink`, `bg-brand`, `text-brand-foreground`, ...), never hard-coded colours; both themes (`html[data-theme="dark"]`); lists keep filters in the URL with `useSearchParams` inside a `Suspense`; skeleton `loading.tsx` for data pages; Server Components by default; `next/image` for raster images; no `any`.
5. **Commits.** Conventional messages, no tool or agent names anywhere (messages, comments, docs). Docs in `docs/YYYY-MM-DD-name.md`.
6. **Deploy.** The API deploys on `git push` (builds with `bun run build`), but the domain `emergency-ambulance-dispatch-api.vercel.app` is a hand-pinned alias: after the deployment is Ready run `vercel alias set <new-deployment-url> emergency-ambulance-dispatch-api.vercel.app`. Environment variables are read at deploy time, so redeploy after changing them. The frontend deploys on push; `NEXT_PUBLIC_*` values are inlined at build time.
7. **Checks before every commit.** Backend: `bun run typecheck && bun run lint && bun run test`. Frontend: `npx tsc --noEmit && npx eslint src && npx next build`. Then look at the page in the browser in light and dark.

---

## Part A. What exists now (do not rebuild)

### A.1 Backend endpoints (all under `/api/v1`)

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /auth/register`, `/login`, `/google`, `/refresh-token`, `/logout` | public (rate limited) |
| Me | `GET/PATCH /users/me`, `PATCH /users/me/password` | signed in; password route rate limited, revokes refresh tokens |
| Hospitals | `GET /hospitals`, `GET /hospitals/:id` | **public**; `POST/PATCH/DELETE` admin |
| Ambulances | `GET /ambulances`, `/ambulances/:id`, `/ambulances/nearby?lat&lng&radiusKm&type` | signed in; writes admin |
| Requests | `GET /requests`, `/requests/my-assigned` (filters: status, from, to, q), `/requests/:id`; `POST /requests`, `/:id/assign`, `/:id/cancel`; `PATCH /:id/status` | by role |
| Driver | `GET /driver/me`, `/driver/me/stats`; `PATCH /driver/status`, `/driver/location`, `/driver/ambulance/status` | driver |
| Payments | `POST /payments/initiate`, `GET /payments/my`, `/payments/:id`; callbacks `GET /payments/callback/success|cancel`; Stripe webhook | patient / public |
| Feedback | `POST /feedback`, `GET /feedback/request/:requestId` | patient / by request |
| Admin | `GET /admin/users`, `/dashboard-stats`, `/audit-logs`, `/reports/summary`, `/feedback`, `/contact-messages`; `POST /admin/drivers`; `PATCH /admin/users/:id/role`, `/admin/contact-messages/:id` | admin |
| Public | `GET /public/stats` (cached 60 s), `GET /fares/estimate?type=`, `POST /contact` (5 per hour, honeypot field `website`) | public |

### A.2 Data model now
`User` (name, email, password?, phone, role, googleId?, isVerified, deletedAt), `DriverProfile` (licenseNumber, status, currentLat/Lng, ambulanceId), `Ambulance` (plateNumber, type, status, homeHospitalId), `Hospital` (name, address, lat, lng, phone), `EmergencyRequest` (pickup address/lat/lng, priority, status, ambulance, driver, destinationHospital, cancelReason, timestamps, **requestedAmbulanceType, patientName, patientAge, notes, callbackPhone**), `RequestStatusLog`, `Payment`, `Feedback`, `RefreshToken`, **`ContactMessage`** (category, status). Enums include `ContactCategory` and `ContactStatus`.

### A.3 Frontend pages now
Public: `/`, `/about`, `/services`, `/faq`, `/contact`, `/hospitals`, `/login`, `/register`, `/payment/success`, `/payment/cancel`. Patient: `/dashboard`, `/dashboard/requests/new` (3-step wizard with ambulance type and patient details), `/dashboard/requests/[id]`, `/dashboard/payments`, `/dashboard/payments/[id]` (printable receipt), `/dashboard/profile` (details, theme, change password). Driver: `/driver`, `/driver/earnings`, `/driver/profile` (includes maintenance toggle). Admin: `/admin`, `/admin/dispatch` (board plus assign-nearest panel), `/admin/resources` (tabs: ambulances, hospitals, users, messages, audit), `/admin/reports`.

### A.4 Verified on the live site on 2026-10-10
One-click demo login for all three roles, public hospitals and stats, patient trip page, a full Stripe test payment (ICU trip, USD 35.00, returned to `/payment/success`), cancel redirect to `/payment/cancel`, contact submission appearing in the admin Messages tab, fares endpoint.

---

## Part B. Risks and defects that are not fixed

### B.1 Rate limits shared by every visitor (FIXED, see `docs/2026-10-10-rate-limiting.md`)
The Next proxy now forwards the visitor address with a shared secret (`PROXY_SHARED_SECRET`, set on both Vercel projects) and the API keys all limiters on it; the spoofable `x-forwarded-for` key of the contact limiter is removed. Verified live. **Remaining:** counters are in each API instance's memory (best effort on serverless); a shared Redis store (Upstash) would make them exact and can be added behind optional environment variables.

### B.2 Stripe checkout shows another business name (MEDIUM, owner action)
The hosted checkout and its back link say "Team Hunt LLC" because that is the Stripe account's public business name. Change it under Stripe Dashboard, Settings, Business, Public details (set RapidAid). Optionally set `payment_intent_data.description` in `src/modules/payments/payment.service.ts` so the Stripe dashboard shows "RapidAid ambulance trip".

### B.3 Demo data in the shared database (MEDIUM)
Seven or more test requests (addresses like "12 Test Rd", "Debug Rd", "House 12, Road 5, Dhanmondi", "Payment test pickup"), one paid payment, a few cancelled test trips and resolved test contact messages. The API cannot delete requests. Either leave them (dashboards look populated) or remove them with a one-off SQL script reviewed by the owner (`DELETE` in the order: `Feedback`, `Payment`, `RequestStatusLog`, then `EmergencyRequest`, filtered by `pickupAddress` in the known test strings), then reseed three tidy requests.

### B.4 Maintenance toggle writes no audit row (LOW)
`updateMyAmbulanceStatus` in `src/modules/drivers/driver.service.ts` updates the ambulance but does not record who changed it. The audit-log page only shows request status logs today. Create a small `AmbulanceStatusLog { id, ambulanceId, actorId, fromStatus, toStatus, createdAt }` table and show it in the admin audit tab.

### B.5 API domain is a manual alias (MEDIUM)
After every backend push someone must run `vercel alias set`. To make pushes self-publishing: in the Vercel dashboard remove the alias `emergency-ambulance-dispatch-api.vercel.app` from the old deployment, then add the same domain under Project, Settings, Domains so it follows the production branch. Verify on a no-op push before relying on it; a mistake takes the live API down.

### B.6 No automated tests or CI on the frontend (MEDIUM)
The backend has 92 tests; the frontend has none. Minimum: Vitest + React Testing Library for `normalizeApiBase`, the wizard schema, `FieldError`, the receipt page, and a Playwright smoke test (login with each demo role, open the main page, log out). GitHub Actions workflow running `tsc`, `eslint`, `next build` on every push for both repos.

### B.7 Accessibility and contrast not audited (MEDIUM)
Static colours `oxygen`, `amber`, `signal` are overridden for text in dark mode at the end of `src/app/globals.css`; backgrounds that use them with white text were not measured. Run an automated check (axe or Lighthouse) on `/`, `/login`, `/dashboard`, `/driver`, `/admin` in both themes and fix: focus order in dialogs and sheets, `aria-live` for toasts, label for every icon-only button, reduced-motion respect.

### B.8 Fares are copied in the frontend (LOW)
`$15 / $35 / $60` still appear as literals in `src/app/page.tsx`, `src/app/services/page.tsx` and the wizard even though `useFares()` and `GET /fares/estimate` exist. Replace the literals with the hook and hide the price when it fails to load.

### B.9 Driver card contact details (LOW)
The driver duty card shows the patient name and phone from `/requests/my-assigned`, but the Call button must be disabled for requests without a phone and the notes and requested type added in the last round should appear in the card. Check `src/app/driver/page.tsx`.

---

## Part C. Features that are not built

Each item: purpose, why it is not built, data model, API contract, backend work, frontend work, security, tests, rollout, acceptance, effort.

### C.1 Patient profile extras: medical info, emergency contacts, saved addresses
- **Purpose:** speed up a request, give the crew medical context, and match the prototype profile and wizard screens.
- **Why not built:** needs three new tables and privacy rules.
- **Data model (additive migration):**
  ```prisma
  model PatientProfile {
    userId     String   @id
    user       User     @relation(fields: [userId], references: [id])
    bloodGroup BloodGroup?
    allergies  String?
    conditions String?
    updatedAt  DateTime @updatedAt
  }
  enum BloodGroup { A_POS A_NEG B_POS B_NEG AB_POS AB_NEG O_POS O_NEG }
  model EmergencyContact {
    id String @id @default(cuid())
    userId String
    name String
    phone String
    relation String?
    createdAt DateTime @default(now())
    user User @relation(fields: [userId], references: [id])
    @@index([userId])
  }
  model SavedAddress {
    id String @id @default(cuid())
    userId String
    label String
    address String
    lat Float
    lng Float
    createdAt DateTime @default(now())
    user User @relation(fields: [userId], references: [id])
    @@index([userId])
  }
  ```
  Add the three back-relations on `User`. Limits enforced in the service: 5 contacts, 10 addresses per user.
- **API (role PATIENT, always scoped to the caller):**
  - `GET /users/me/medical` returns `{ medical: { bloodGroup, allergies, conditions } }`; `PUT /users/me/medical` upserts (`allergies`, `conditions` max 500 chars).
  - `GET /users/me/contacts` returns `{ contacts: [...] }`; `POST` body `{ name 2..80, phone 7..20, relation? max 40 }`; `DELETE /users/me/contacts/:id`.
  - `GET /users/me/addresses`; `POST` body `{ label 1..30, address 5..200, lat, lng }`; `DELETE /:id`.
  - Request detail for the **assigned driver** and admins includes `patientMedical: { bloodGroup, allergies, conditions }` and `emergencyContacts` only while the request status is not `COMPLETED` or `CANCELLED`. Never in lists, never in logs.
- **Frontend:**
  - `/dashboard/profile`: three cards ("Medical info", "Emergency contacts", "Saved addresses") with RHF + Zod forms, optimistic add and remove, empty states; hidden for driver and admin.
  - Wizard step 1: saved addresses as chips above the map; choosing one sets address and pin.
  - Driver duty card: collapsible "Medical info" and a tap-to-call list of emergency contacts during an active trip.
  - Hooks in `src/lib/hooks.ts`: `useMedical`, `useUpdateMedical`, `useContacts`, `useAddContact`, `useDeleteContact`, `useAddresses`, `useAddAddress`, `useDeleteAddress`.
- **Security and privacy:** ownership check on every id route (return 404 for other users' ids, not 403); medical fields only exposed per the rule above; add a line to the privacy text on the FAQ page.
- **Tests:** ownership (user A cannot read or delete B's rows), caps, blood group enum, driver sees medical only on an active trip assigned to them, completed trip hides it.
- **Rollout:** migration, backend, then frontend.
- **Acceptance:** a patient saves "Home", picks it in the wizard, and the assigned driver sees blood group and a callable contact on the active trip, and no longer after completion.
- **Effort:** 6 hours.

### C.2 Driver applications ("Drive with us")
- **Purpose:** the home page role card and the footer point drivers to register, which creates a patient. Drivers are created only by admins today.
- **Why not built:** new table, public form, admin review, and onboarding credentials without email.
- **Data model:**
  ```prisma
  model DriverApplication {
    id String @id @default(cuid())
    name String
    email String
    phone String
    licenseNumber String
    vehiclePlate String?
    message String?
    status ApplicationStatus @default(PENDING)
    reviewedById String?
    reviewedAt DateTime?
    createdAt DateTime @default(now())
    @@index([status, createdAt])
  }
  enum ApplicationStatus { PENDING APPROVED REJECTED }
  ```
- **API:**
  - `POST /driver-applications` (public, limiter like contact, honeypot `website`): body `{ name, email, phone, licenseNumber (5..30), vehiclePlate?, message? (max 500) }`. Reject when the email already belongs to a user or has a pending application (`409`).
  - `GET /admin/driver-applications?status=&page=&limit=` and `PATCH /admin/driver-applications/:id { status: APPROVED | REJECTED }`.
  - Approving calls the existing create-driver service used by `POST /admin/drivers` with a generated temporary password (12 characters, letters and digits), marks the application approved in one transaction, and returns `{ driver, temporaryPassword }` **once**. Without an email provider the admin must pass the password on; show it once in a modal with a copy button and never store it in clear text.
- **Frontend:** public page `/drive-with-us` (server shell, client form), linked from the home role card, footer and header menu; admin tab "Applications" in `/admin/resources` with status filter in the URL and Approve and Reject buttons (confirm dialog); add the route to `proxy.ts` public list.
- **Security:** rate limit, honeypot, uniqueness checks, approval only by admin, password shown once.
- **Tests:** duplicate email, duplicate license, approve creates exactly one driver and cannot be repeated, reject keeps no user, public route needs no token.
- **Acceptance:** an applicant submits, the admin approves, the new driver can log in with the temporary password and has an empty driver profile.
- **Effort:** 5 hours.

### C.3 Live trip tracking (driver position, map, push of updates)
- **Today:** the trip page polls every few seconds, the dispatch board polls every 5 s. The driver app sends `PATCH /driver/location`, stored in `DriverProfile.currentLat/currentLng`, but nothing shows it to the patient.
- **Data:** add `DriverProfile.locationUpdatedAt DateTime?` (nullable, additive) and set it in `updateMyLocation`.
- **API:**
  - `GET /requests/:id` adds `driverLocation: { lat, lng, updatedAt } | null`. Only for the request's patient, its driver and admins, and only while status is `ASSIGNED`, `EN_ROUTE_PICKUP`, `PICKED_UP` or `EN_ROUTE_HOSPITAL`; `null` otherwise and when `updatedAt` is older than 2 minutes.
  - Optional `GET /requests/:id/events` Server-Sent Events stream with `retry: 3000`. Vercel functions have execution limits, so make the stream short-lived (about 25 s) and let the client reconnect. If that proves unreliable keep polling and lower the interval to 3 s only for the active trip.
- **Frontend:** on `/dashboard/requests/[id]` show a Leaflet map (the project already ships `react-leaflet` and `map-picker.tsx`) with pickup, hospital and driver markers, a line between them, and an "Estimated arrival" computed from distance divided by a fixed average speed and **labelled as an estimate**. Respect `prefers-reduced-motion` (no marker animation). Fall back to the current text card when `driverLocation` is null. The driver app must send location every 10 seconds while online (check `useUpdateDriverLocation` usage in `src/app/driver/page.tsx`; use `navigator.geolocation.watchPosition`, stop when offline).
- **Privacy:** location precision only during an active trip.
- **Tests:** visible to patient on an active trip only, hidden for other patients and after completion, stale position returns null.
- **Acceptance:** with a driver moving in the driver app, the patient map marker follows within 10 seconds; after completion the marker disappears.
- **Effort:** 8 hours.

### C.4 Forgot password and reset password
- **Status: BUILT, waiting only for keys.** Backend `POST /auth/forgot-password` and `/auth/reset-password`, `PasswordResetToken` table (migration applied), Resend client `src/lib/email.ts`; frontend `/forgot-password` and `/reset-password`. It works as soon as `RESEND_API_KEY` and `EMAIL_FROM` are set on the backend (no code change needed). Full plug-in steps, variable names and behaviour without keys are in `docs/2026-10-10-email-sms-integrations.md`. The "Forgot password?" link stays hidden until the backend reports email as configured.
- **Original blocker:** an email provider and a verified sender address. Without keys the link cannot be delivered, so the endpoint answers the generic message and sends nothing.
- **Data model:** `PasswordResetToken { id, userId, tokenHash (sha256, unique), expiresAt, usedAt?, createdAt }`, index on `userId`.
- **API:**
  - `POST /auth/forgot-password { email }` always answers `200` with the same message (no account enumeration). If the user exists and has a password, create a token (32 random bytes, store only the hash, expiry 30 minutes) and email `FRONTEND_URL/reset-password?token=...`. Limiter: 5 per hour per client (see B.1).
  - `POST /auth/reset-password { token, newPassword }` verifies hash, expiry and `usedAt`, sets the new password, marks the token used, revokes all refresh tokens. Same password rules as change password.
  - New env `EMAIL_API_KEY`, `EMAIL_FROM`; endpoints answer `503 Email is not configured` when missing so failure is loud.
- **Frontend:** "Forgot password?" under the login form; pages `/forgot-password` and `/reset-password` (public, add to `proxy.ts`), RHF + Zod, states for success, expired and invalid token; after reset redirect to `/login` with a toast.
- **Tests:** unknown email returns the same response, token single use, expiry, refresh tokens revoked, Google-only accounts do not get a token.
- **Effort:** 4 hours plus provider setup.

### C.5 Notifications (SMS or push)
- **Status: email and SMS BUILT, waiting only for keys.** Twilio and a generic webhook adapter (for Bangladesh gateways), phone normalisation, trip event notifications gated by `User.notifySms` and `User.notifyEmail` (migration applied), contact alerts to `ADMIN_NOTIFY_EMAIL`, `GET /public/capabilities`, admin test endpoints and an Integrations card; see `docs/2026-10-10-email-sms-integrations.md`. Web Push (service worker, VAPID keys, `PushSubscription` table) is still not built.
- **Original blocker:** a provider (Twilio, a Bangladesh SMS gateway, or Web Push with VAPID keys).
- **Design:** one `notify(userId, event, payload)` service called from `request.service.ts` on assign, picked up, completed and cancelled; provider selected by env; failures are logged and never fail the request. Preferences: `User.notifyBySms Boolean @default(false)` (additive) edited on the profile page, with phone required. Web Push adds a `PushSubscription { id, userId, endpoint unique, p256dh, auth, createdAt }` table, a service worker `public/sw.js`, and an "Enable notifications" button on the profile.
- **Templates:** short, no medical data ("Your ambulance DHK-2002 is on the way", "Your trip is complete, pay at <link>").
- **Tests:** called once per transition, not called when preference is off, provider failure does not break the status update.
- **Effort:** 6 to 10 hours depending on provider.

### C.6 Google sign-in in the UI
- **Today:** `POST /auth/google` exists in the backend (`googleLoginSchema`, `GOOGLE_CLIENT_ID` required). The frontend has no button.
- **Frontend:** load Google Identity Services on `/login` and `/register`, render the button, send the ID token to a new Next route `src/app/api/auth/google/route.ts` that mirrors `/api/auth/login` (call backend `/auth/google`, set cookies with `setAuthCookies`, return the user). New env `NEXT_PUBLIC_GOOGLE_CLIENT_ID` equal to the backend `GOOGLE_CLIENT_ID`; add the frontend origins to the Google Cloud OAuth client (authorised JavaScript origins: the live URL and `http://localhost:3000`). Role is always PATIENT for Google sign-up. Show a clear error when the account exists with another method.
- **Tests:** route handler with a mocked backend; button hidden when the env var is missing.
- **Effort:** 3 hours plus Google Cloud configuration.

### C.7 Bangla and English
- **Scope first:** public pages, header, login and register, request wizard, trip statuses, toasts.
- **Approach:** `next-intl` (or a small typed dictionary) with locale in a cookie (`NEXT_LOCALE`), a language switch in the header and profile, no URL prefix change to keep links stable. Add `Noto Sans Bengali` through `next/font/google` with `display: swap` and a Latin fallback. All status labels come from one map in `src/lib/labels.ts` so both languages stay in step. Numbers and dates use `Intl` with the locale.
- **Quality:** translations reviewed by a Bangla speaker; no machine-only strings in medical or payment text.
- **Tests:** switching the locale changes the header and the wizard titles; missing keys fall back to English and are logged in dev.
- **Effort:** 10 hours for the first scope.

### C.8 Admin and data features
| Item | Spec |
|---|---|
| CSV export from the API | `GET /requests?format=csv` and `GET /admin/audit-logs?format=csv` streaming with `Content-Disposition`; admin only; the Reports page "Export CSV" button then uses it so the export covers all rows, not only the 100 loaded in the browser. |
| Audit log filters | Add `actorId`, `toStatus`, `from`, `to` to `GET /admin/audit-logs` and URL-synced filters in the audit tab. |
| Hospital fields | `Hospital.district String?`, `beds Int?`, `hasIcu Boolean?` (additive); admin hospital form fields; the public directory uses them for the district filter and cards instead of address matching. |
| Ambulance and driver photos | Optional. Cloudinary unsigned upload preset, `photoUrl String?` on `Ambulance` and `User`, upload with progress and preview in the admin forms. Only if time allows; the assignment marks uploads as domain-dependent. |
| Account deletion | `DELETE /users/me` soft delete (`deletedAt`), revoke tokens, anonymise name and phone, keep requests and payments for records; confirm dialog on the profile. |
| Admin settings page | Read-only environment status (API version, Stripe mode, currency), nothing secret. Optional. |
| Payments report | `GET /admin/payments/summary?from&to` with totals by status and by day, shown on Reports (revenue today, 7 days). |

### C.9 Content, SEO and polish
| Item | Spec |
|---|---|
| About and services copy | Replace generic text with facts the product can back: how dispatch works, the three ambulance types and fares (from `useFares`), privacy promises that are true. No team names, partner logos or statistics unless real. |
| SEO files | `src/app/sitemap.ts`, `src/app/robots.ts`, per-page Open Graph image (static `public/og.png` built from the logo, loaded with `next/image` metadata), `metadataBase` set to the live URL. |
| Error pages | `error.tsx` and `not-found.tsx` per role area with a link back to the right home; global `loading.tsx` skeletons already exist for most data pages. |
| Performance | Lighthouse on `/` and `/hospitals`: lazy-load Leaflet only on pages that use it, `next/dynamic` for the receipt print styles, check bundle with `next build` output, serve the logo as SVG through `next/image`. |
| PWA (optional) | Web manifest and icons so the driver and patient apps can be installed; service worker only if push (C.5) is built. |
| Monitoring | Add Sentry or Vercel Analytics for errors and page views; backend `pino` logs already go to Vercel logs. |

---

## Part D. Order, effort and owner actions

### D.1 Suggested order (about 55 hours in total; the first four items protect the submission)
1. **B.1** shared rate-limit key (2 h). Do first: it can make the demo buttons fail during grading.
2. **B.6** minimal CI and a Playwright smoke test (3 h), **B.7** accessibility pass (3 h), **B.8** and **B.9** small cleanups (1 h).
3. **C.6** Google sign-in (3 h, shows well in a demo).
4. **C.1** patient extras (6 h) and **C.2** driver applications (5 h): they fill the empty parts of the prototype.
5. **C.8** CSV export, audit filters, hospital fields, payments summary (6 h).
6. **C.3** live tracking (8 h).
7. **C.9** content and SEO (4 h).
8. **C.4**, **C.5**, **C.7** only with a provider or a translator.

### D.2 Dependencies
`C.4` and `C.5` need an email or SMS provider. `C.6` needs Google Cloud configuration. `C.3` needs the `locationUpdatedAt` migration. `C.1`, `C.2`, `C.8` (hospital fields) need migrations. Every migration follows the rollout order in Part 0.

### D.3 Actions only the owner can do
- Set the public business name in the Stripe dashboard (B.2).
- Apply any new migration with `bunx prisma migrate deploy` before pushing backend code that needs it.
- Add `PROXY_SHARED_SECRET` to both Vercel projects (B.1) and redeploy.
- Create Google OAuth origins and set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (C.6).
- Choose and configure an email or SMS provider (C.4, C.5).
- Decide whether to delete the test data in the shared database (B.3).
- Move the API alias after backend deployments (B.5) until the domain is assigned to the project.

---

## Part E. Status

| Item | Status |
|---|---|
| Profile menu crash (Base UI error 31) | fixed |
| Public pages bounced logged-out visitors to /login (side effect of the session-expiry redirect) | fixed (frontend 5ddfaa1); the 401 redirect now applies only under /dashboard, /driver, /admin |
| Trip not-found card | done (frontend baedb6d) |
| Hospital coordinates in request responses and Navigate link | done (backend 30baf75, frontend 2352f97) |
| Request ambulance type and patient details | done (backend 39ea824, frontend e62f98d) |
| Contact messages and admin tab | done (backend ee5f570, frontend c29b9e7) |
| Change password | done (backend 363833d, fba634b; frontend b31634e) |
| Ambulance maintenance toggle | done without audit row (B.4) |
| Fares endpoint and hook | done; literals still in three pages (B.8) |
| Receipts | done (backend 00c4a64, frontend 3fedb86, wording a77eb5f) |
| Hospital drawer, session-expiry redirect | done (frontend 3fedb86) |
| B.1 shared rate-limit key | fixed (backend fb847ef, f58fd75; frontend 7682c2c); optional shared Redis store still open |
| B.2 Stripe business name | owner action |
| B.3 test data | open, owner decision |
| B.4 maintenance audit row | open |
| B.5 API alias automation | open |
| B.6 frontend tests and CI | open |
| B.7 accessibility pass | open |
| B.8 use fares hook everywhere | open |
| B.9 driver card details | open |
| C.1 patient extras | open |
| C.2 driver applications | open |
| C.3 live tracking | open |
| C.4 forgot and reset password | built (backend a782990, frontend 4e6cc6c); works once Resend keys are added |
| C.5 notifications | email and SMS built (backend 8c11dc9, 52330a1, 9aacfce, 3831c14, 46fbcc0, hardening 3c3e8f1; frontend f01a28f, c8c5a3f, 3f3c04f); works once keys are added; web push not built |
| C.6 Google sign-in UI | open |
| C.7 Bangla and English | open |
| C.8 admin and data features | open |
| C.9 content, SEO, polish | open |
