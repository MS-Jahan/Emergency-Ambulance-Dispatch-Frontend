# 2026-10-10 Not-built features: detailed specification

Everything the prototype or the requirements brief shows that the product does not do yet. Each item has: purpose, why it is not built, data model, API contract, backend work, frontend work, security, tests, rollout and acceptance criteria. Repos: frontend `Emergency-Ambulance-Dispatch-Frontend`, backend `ph-l2-b7-asnmnt-6` (Express, Prisma, Postgres on Neon, Stripe, vitest, biome). Live: frontend `https://emergency-ambulance-dispatch-fronte.vercel.app`, API `https://emergency-ambulance-dispatch-api.vercel.app/api/v1`.

## 0. Ground rules for whoever implements this

- **The database is shared.** Development, tests against `.env`, and production use the same Neon database. Do not run `prisma migrate dev`, `db push` or the seed against it. Write migrations as SQL files in `prisma/migrations/`, test them on the local Postgres from `.env.test` (`dispatch_test`), and let the owner run `bun run db:deploy` once after review. Every schema change below is additive (new nullable columns, new tables) so old code keeps working while the migration is rolled out.
- **Real data only.** The assignment forbids placeholder content: no invented numbers, names or statuses in the UI. If the backend cannot provide a value, hide the element.
- **Response envelope:** `{ success, message, data }`. Errors: `{ success: false, message, errors? }`. Lists: `{ items, meta: { page, limit, total, totalPages } }`, `limit` capped at 100.
- **Forms:** React Hook Form + Zod, errors in the existing `FieldError` component. Lists keep their filters in the URL (`useSearchParams`).
- **Theme:** use token classes only (`bg-paper`, `text-ink`, `bg-brand`, ...), both light and dark must work. Do not hard-code colours.
- **Commits:** conventional messages, no tool or agent names anywhere. Docs go in `docs/` with a `YYYY-MM-DD-name.md` file name.
- **Deploy:** the API deploys on `git push` now, but the custom domain alias is pinned: after a push run `vercel alias set <new-url> emergency-ambulance-dispatch-api.vercel.app` (see backend `docs/deployment.md`). Env changes need a redeploy.

## 1. Bugs found and not yet fixed

### 1.1 Profile menu crash (fixed in `fix: wrap profile menu label...`, kept here for the record)
- **Symptom:** clicking the avatar in the patient dashboard header threw `Base UI error #31` twice and the menu did not open. The console also showed a `401` (separate, see below).
- **Cause:** `DropdownMenuLabel` is Base UI's `Menu.GroupLabel`, which requires an enclosing `Menu.Group`. `src/components/shell/role-shell.tsx` rendered it directly inside `DropdownMenuContent`.
- **Fix:** wrap the label in `DropdownMenuGroup`. Verified: menu opens, shows name, email and Sign out, console clean.
- **Rule to follow:** never use `DropdownMenuLabel`, `SelectLabel` or any `*GroupLabel` outside its group. Search the repo with `grep -rn "GroupLabel\|MenuLabel" src` after any UI change.
- **The 401:** it came from opening `/dashboard/requests/<id>` for a request that belongs to another account (`GET /requests/:id` correctly refuses). The page should show a clear "not found or not yours" state instead of a blank error. Acceptance: opening another user's trip id shows the not-found card with a Back to dashboard button, no console error.

### 1.2 "Navigate" link on the trip page points at `undefined,undefined`
- **Symptom:** `https://www.google.com/maps/dir/?api=1&destination=undefined,undefined` on `/dashboard/requests/[id]` and the driver card.
- **Cause:** the backend request select returns `destinationHospital: { id, name }` only, without `lat` and `lng`, and the page builds the link from `lat,lng`.
- **Fix (backend):** in `src/modules/requests/request.service.ts` add `address`, `lat`, `lng`, `phone` to the `destinationHospital` select in `DETAIL_INCLUDE` and `LIST_SELECT`. **Fix (frontend):** extend the `EmergencyRequest.destinationHospital` type, build the link only when both numbers exist, otherwise hide the Navigate button.
- **Tests:** request detail returns the four fields; link is hidden when hospital is missing.

### 1.3 Stripe checkout shows the merchant name "Team Hunt LLC"
- The Stripe test account behind `STRIPE_SECRET_KEY` is named Team Hunt LLC, so the hosted checkout page and the "Back to Team Hunt LLC" link show it. Change the public business name in Stripe Dashboard > Settings > Business > Public details to RapidAid, or set `payment_intent_data.description` / `custom_text` in `src/modules/payments/payment.service.ts`. No code change is strictly required.

### 1.4 Backend: git deploys and the pinned alias (done, documented)
- `vercel.json` now builds on Vercel; the alias `emergency-ambulance-dispatch-api.vercel.app` must still be moved by hand after each deploy. To remove that step, delete the manual alias and assign the domain to the project under Project > Settings > Domains, then verify that a push moves it. Not done because a mistake would take the live API down.

### 1.5 Verified on the live site on 2026-10-10
Demo login for all three roles, public hospitals and stats, patient trip page, full Stripe test payment (ICU trip, USD 35.00, redirected back to `/payment/success`, shows "Payment received"), cancel link goes to `/payment/cancel`. Test data left in the database: a handful of requests with addresses "12 Test Rd", "Debug Rd", "House 12, Road 5, Dhanmondi", "Payment test pickup" and one paid payment.

---

## 2. Contact form storage

- **Purpose:** the contact page currently opens the visitor's mail app (`mailto:`). Replace it with a real submission.
- **Why not built:** needs a new table, so a migration on the shared database.
- **Data model** (`prisma/schema.prisma`):
  ```prisma
  model ContactMessage {
    id         String   @id @default(cuid())
    name       String
    email      String
    phone      String?
    category   ContactCategory @default(GENERAL)
    message    String
    status     ContactStatus   @default(NEW)
    createdAt  DateTime @default(now())
    @@index([status, createdAt])
  }
  enum ContactCategory { GENERAL BILLING DRIVER HOSPITAL FEEDBACK }
  enum ContactStatus { NEW READ RESOLVED }
  ```
  Migration: `prisma/migrations/<ts>_contact_messages/migration.sql` (create the two enums, the table and the index).
- **API:**
  - `POST /api/v1/contact` (public). Body `{ name (2..80), email, phone? (7..20), category?, message (10..2000) }`. Zod validation, trim strings, strip control characters. Response `201 { message: "Message received", data: { id } }`. Rate limit: reuse the existing limiter style, 5 requests per hour per IP (an `authLimiter`-like `contactLimiter`). Honeypot: optional hidden field `website`, reject with `400` if filled.
  - `GET /api/v1/admin/contact-messages?page=&limit=&status=&q=` (ADMIN). Paginated list, newest first.
  - `PATCH /api/v1/admin/contact-messages/:id` (ADMIN) body `{ status }`.
- **Backend files:** `src/modules/contact/{contact.routes,contact.controller,contact.service,contact.validation}.ts`; register `/api/v1/contact` in `src/app.ts`; admin routes in `src/modules/admin/`. Update `docs/openapi.yaml` and the Postman collection.
- **Frontend:**
  - `src/components/public/contact-form.tsx`: keep the existing RHF + Zod form, add `category` select and a hidden honeypot, submit with a new `useSendContact()` hook in `src/lib/hooks.ts` (`api.post('/contact', body)`), toast on success, reset the form, show server validation errors inline.
  - Admin: new tab "Messages" in `/admin/resources` (`src/components/admin/contact-messages-table.tsx`) with URL-synced `?tab=messages&status=&page=`, status select (optimistic update), empty state.
- **Security:** never echo the message back in HTML unescaped (React already escapes); do not email addresses to third parties; rate limit; cap body size (global JSON limit is 1 MB, the schema caps the field at 2000 chars).
- **Tests:** validation (too short, bad email), honeypot rejected, rate limit returns 429 on the sixth call, admin-only list, status patch.
- **Acceptance:** submitting the live form creates a row, the admin sees it under Messages, a non-admin gets 403 on the list, the old `mailto:` behaviour is gone.
- **Effort:** about 3 hours.

## 3. Ambulance type and patient details on a request

- **Purpose:** the wizard should let the patient say what they need, and dispatch should rank ambulances by it. Today the ambulance type only exists on the ambulance.
- **Data model:** add nullable columns to `EmergencyRequest`: `requestedAmbulanceType AmbulanceType?`, `patientName String?`, `patientAge Int?`, `notes String?`, `callbackPhone String?`. Migration is additive (`ALTER TABLE ... ADD COLUMN`), old rows stay valid.
- **API:**
  - `POST /api/v1/requests` accepts the new optional fields. Zod: `requestedAmbulanceType` in `BASIC|ICU|CARDIAC`, `patientName` 2..80, `patientAge` 0..120, `notes` max 500, `callbackPhone` 7..20. Defaults: patient name and phone from the account.
  - `GET /api/v1/ambulances/nearby?lat=&lng=&type=` gains an optional `type` filter; when given, only ambulances of that type are returned. Items also include the assigned driver `{ id, name, phone }`.
  - Request responses (list, detail, my-assigned) include the five new fields.
  - Fare: `payment.service.ts` prices by the assigned ambulance's type (`TRIP_RATES`); keep that, so a BASIC ambulance sent for an ICU request charges BASIC. Document this.
- **Frontend:**
  - Wizard (`src/app/dashboard/requests/new/page.tsx`): step 2 gets ambulance type tiles (Basic, ICU, Cardiac with real fares $15, $35, $60 from a shared constant), patient name, age, callback phone, notes. All optional except priority. Zod schema updated, values sent in the POST.
  - Trip detail and admin detail sheet show the requested type and notes; the assign panel passes `type` to `useNearbyAmbulances` and shows a badge when the chosen ambulance type differs from the request.
  - Driver card shows patient name, phone, notes and the requested type.
- **Tests:** request created with and without the fields, type filter on nearby, validation errors, old clients (no new fields) still work.
- **Acceptance:** choosing ICU in the wizard on the live site shows ICU ambulances first on the dispatch board and the type on every screen.
- **Effort:** about 5 hours.

## 4. Patient profile extras: medical info, emergency contacts, saved addresses

- **Purpose:** prototype profile and request screens; speeds up a request and gives the driver context.
- **Data model:**
  ```prisma
  model PatientProfile {
    userId     String @id
    user       User   @relation(fields: [userId], references: [id])
    bloodGroup String?          // A+, A-, B+, B-, AB+, AB-, O+, O-
    allergies  String?
    conditions String?
    updatedAt  DateTime @updatedAt
  }
  model EmergencyContact {
    id String @id @default(cuid())
    userId String
    name String
    phone String
    relation String?
    user User @relation(fields: [userId], references: [id])
    @@index([userId])
  }
  model SavedAddress {
    id String @id @default(cuid())
    userId String
    label String           // Home, Work
    address String
    lat Float
    lng Float
    user User @relation(fields: [userId], references: [id])
    @@index([userId])
  }
  ```
  Add the three back-relations on `User`. Cap at 5 contacts and 10 addresses per user in the service.
- **API (PATIENT only, all scoped to the caller):** `GET/PUT /users/me/medical`; `GET/POST /users/me/contacts`, `DELETE /users/me/contacts/:id`; `GET/POST /users/me/addresses`, `DELETE /users/me/addresses/:id`. Responses wrapped like `{ contacts: [...] }`.
- **Privacy:** medical fields are visible to the patient, to the driver of an active request of that patient (add a `medical` object to the driver's request detail only while status is not COMPLETED/CANCELLED), and to admins. Never include them in list responses or logs.
- **Frontend:** profile page gets "Medical info", "Emergency contacts" and "Saved addresses" cards (RHF + Zod, optimistic add/remove). The wizard's location step offers saved addresses as chips. Hide the cards for DRIVER/ADMIN.
- **Tests:** ownership (user A cannot read or delete user B's rows), caps, blood group enum, driver sees medical only on an active trip.
- **Effort:** about 6 hours.

## 5. Password management

### 5.1 Change password (no email needed, do first)
- `PATCH /api/v1/users/me/password` body `{ currentPassword, newPassword (min 8, letter and number) }`; verify with bcrypt, hash the new one, revoke all refresh tokens of the user (set `revokedAt`). Google-only accounts (no password) get `400`.
- Frontend: "Change password" card on the three profile pages (patient, driver, admin shell) with strength meter component reuse (`password-strength.tsx`), sign the user out on success.
- Tests: wrong current password, weak new password, refresh tokens revoked.

### 5.2 Forgot and reset password (needs an email provider)
- **Blocked on:** a sender (Resend, SendGrid or SMTP) and a verified domain or sender address. Without it the flow cannot deliver the link.
- Data model: `PasswordResetToken { id, userId, tokenHash (sha256, unique), expiresAt (30 min), usedAt?, createdAt }`.
- API: `POST /auth/forgot-password { email }` always answers `200` with the same message (no account enumeration), creates a token and sends `FRONTEND_URL/reset-password?token=...`; `POST /auth/reset-password { token, newPassword }` checks hash, expiry and `usedAt`, updates the password, marks the token used, revokes refresh tokens. Rate limit both like login.
- Frontend: "Forgot password?" link on `/login`, pages `/forgot-password` and `/reset-password` (public, add to `proxy.ts` public routes), RHF + Zod, success and expired-token states.
- Env: `EMAIL_API_KEY`, `EMAIL_FROM`; add to `src/config/env.ts` as optional, and make the endpoint return `503 Email is not configured` when absent so it fails loudly instead of silently.

## 6. Driver application and onboarding

- **Purpose:** "Drive with us" currently links to register (which makes a patient). Drivers are created by admins (`POST /admin/drivers`).
- **Data model:** `DriverApplication { id, name, email, phone, licenseNumber, vehiclePlate?, message?, status (PENDING|APPROVED|REJECTED), reviewedById?, reviewedAt?, createdAt }` plus enum.
- **API:** `POST /driver-applications` (public, rate limited, same honeypot as contact); `GET /admin/driver-applications?status=&page=` and `PATCH /admin/driver-applications/:id { status }` (ADMIN). Approving calls the same service as `POST /admin/drivers` with a generated temporary password and marks the application approved. Until email exists (see 5.2), show the temporary password once to the admin in the UI.
- **Frontend:** `/drive-with-us` public page with the form, a link from the home page role card and the footer, admin tab "Applications" in `/admin/resources`.
- **Tests:** duplicate email, license uniqueness, approve creates exactly one driver and cannot be approved twice.
- **Effort:** about 5 hours.

## 7. Realtime trip updates and live driver position

- **Today:** trip pages and the dispatch board poll every 5 seconds. Driver position is stored (`DriverProfile.currentLat/currentLng` via `PATCH /driver/location`) but never shown to the patient.
- **Backend:**
  - Include `driver.currentLat/currentLng` and `driver.locationUpdatedAt` in `GET /requests/:id` only while the status is `ASSIGNED`, `EN_ROUTE_PICKUP`, `PICKED_UP` or `EN_ROUTE_HOSPITAL`, and only for the request's patient, the driver and admins.
  - Add `GET /requests/:id/stream` (Server-Sent Events). Vercel functions have execution limits, so on Vercel use short-lived SSE with `retry: 3000` and reconnect, or keep polling and lower the interval for the active trip. Do not add websockets on serverless.
  - Index: `DriverProfile.updatedAt` is already tracked; add `locationUpdatedAt` if freshness matters (nullable timestamp, additive).
- **Frontend:** a map on the trip page (reuse `map-picker.tsx` with Leaflet or the existing map dependency) showing pickup, hospital and driver marker, plus an ETA computed client-side from distance and a fixed average speed labelled "Estimated". Respect `prefers-reduced-motion`. Falls back to the current text card when position is missing.
- **Tests:** location visible to patient on active trip only, hidden after completion.
- **Effort:** about 8 hours.

## 8. Receipts

- **Purpose:** payments page offers no receipt.
- **Backend (optional):** `GET /payments/:id/receipt` returning `{ receipt: { number, paidAt, amount, currency, request: {...}, patient: {...}, ambulance: {...} } }`. Receipt number derived from `payment.id` (no new column).
- **Frontend (no backend needed for a first version):** `/dashboard/payments/[id]` printable page using the existing `GET /payments/:id` and the linked request, with a "Print / Save as PDF" button (`window.print()` and a print stylesheet). Link from each paid row and from `/payment/success`.
- **Acceptance:** a paid payment shows a clean one-page receipt in light mode when printed even if the app is in dark mode.
- **Effort:** about 3 hours.

## 9. Fare estimator

- **Backend:** `GET /fares/estimate?type=BASIC|ICU|CARDIAC` returns `{ estimate: { type, amount, currency } }` from `TRIP_RATES`, so the home page, services page and the wizard stop duplicating the numbers (they are hard-coded `$15/$35/$60` in three frontend files today). If distance pricing is ever added, extend with `km`.
- **Frontend:** a shared `useFares()` hook; the three places read from it; fall back to hiding the price on error.
- **Effort:** 1.5 hours.

## 10. Ambulance maintenance flag for drivers

- **API:** `PATCH /driver/ambulance/status { status: "AVAILABLE" | "MAINTENANCE" }` for the logged-in driver's own ambulance; refuse while the driver has an active trip (`409`) or while the ambulance is `ON_TRIP`. Write an audit log row.
- **Frontend:** toggle "Report maintenance" on the driver profile page, optimistic, reflected in the admin ambulance table and removed from nearby results (already filtered by status).
- **Tests:** blocked on active trip, only own ambulance, admin sees the change.
- **Effort:** 2 hours.

## 11. Notifications (SMS or push)

- **Blocked on:** a provider (Twilio, a Bangladesh SMS gateway, or Web Push with VAPID keys).
- **Design:** a small `notify(userId, event)` service called from `request.service.ts` on assign, picked up, completed and cancel; provider chosen by env; failures never fail the request (log and continue). Store `User.notifyBySms Boolean @default(false)` and opt in on the profile page. Web Push needs a service worker and a `PushSubscription` table.
- **Effort:** 6 to 10 hours depending on the provider.

## 12. Smaller frontend items

| Item | Spec |
|---|---|
| Google sign-in | Backend already has `POST /auth/google`. Add the Google Identity button on `/login` and `/register` (needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, equal to the backend `GOOGLE_CLIENT_ID`), post the credential to a new Next route `/api/auth/google` that mirrors `/api/auth/login` and sets the cookies. |
| Bangla / English toggle | Introduce `next-intl` or a small dictionary; scope first to public pages, header, login and the request wizard; persist the choice in a cookie; Bengali font fallback (add Noto Sans Bengali). |
| Public pages: services/about content | Add real copy only; no invented team members, partner logos or statistics. Partner hospitals can come from the live hospital list. |
| Hospital detail drawer | On `/hospitals`, clicking a card opens a drawer with address, phone (tap to call), directions link, and "Request an ambulance to this hospital" that prefills the wizard destination via `?hospital=<id>`. |
| Dashboard empty and error states | A shared "not found or not yours" card for 403/404 request pages (see 1.1). |
| Session expiry | When refresh fails, redirect to `/login?next=<path>` and honour `next` after login. |
| Accessibility pass | Keyboard order, focus rings in dialogs, `aria-live` for toasts, colour contrast of `text-oxygen`/`text-amber` in dark mode (overrides live at the end of `globals.css`). |

## 13. Suggested order and effort

1. Section 1 bugs (1.1 empty state, 1.2 hospital coordinates): 1.5 h.
2. Section 3 request fields and ambulance type: 5 h.
3. Section 2 contact messages: 3 h.
4. Section 5.1 change password, section 10 maintenance flag, section 9 fares: 5 h.
5. Section 8 receipts, section 12 hospital drawer and session expiry: 5 h.
6. Section 4 patient extras, section 6 driver applications: 11 h.
7. Section 7 realtime map, section 5.2, section 11, Bangla: only with provider or time.

After each item: `bun run typecheck && bun run lint && bun run test` in the backend, `npx tsc --noEmit && npx eslint src && npx next build` in the frontend, and a browser check in light and dark. Update `docs/openapi.yaml` and this file's status column.

## 14. Status

| Item | Status |
|---|---|
| 1.1 profile menu crash | fixed and pushed |
| 1.1 not-yours trip empty state | done (fc16291) |
| 1.2 hospital coordinates in request responses | done (backend 30baf75, frontend ea21fc9) |
| 1.3 Stripe business name | owner action in Stripe dashboard |
| 2 contact | done (backend ee5f570) |
| 3 request fields | done (backend 39ea824, frontend 97fcfd4) |
| 4 patient extras | open |
| 5.1 change password | done (backend 363833d) |
| 5.2 forgot/reset password | blocked on email provider |
| 6 driver applications | open |
| 7 realtime | open |
| 8 receipts | open |
| 9 fares | done (backend 363833d) |
| 10 maintenance | done (backend 363833d) |
| 11 notifications | blocked on provider |
| 12 small items | open |
