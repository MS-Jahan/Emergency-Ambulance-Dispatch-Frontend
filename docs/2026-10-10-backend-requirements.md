# 2026-10-10 Backend requirements from the frontend

Backend repo: `../ph-l2-b7-asnmnt-6` (Express, Prisma, Postgres, Stripe). Base path `/api/v1`. This lists what the frontend needs that the backend does not provide today. Each item has priority: **P0** before submission (mandatory rule or broken demo), **P1** should have, **P2** nice to have. The frontend works without all of them: items marked "fallback" describe what the UI does now.

## P0. Needed for the submission

### 1. Public read access to hospitals
- **Today:** `hospitalsRouter.use(authenticate)` (`src/modules/hospitals/hospital.routes.ts:13`) puts every hospital route behind login. Signed-out visitors get 401.
- **Need:** `GET /hospitals` and `GET /hospitals/:id` readable without a token (move `authenticate` onto the write routes only, keep `requireRole('ADMIN')` for POST/PATCH/DELETE). Response fields already enough: `id, name, address, lat, lng, phone`. Optional extras for the directory: `district`, `beds`, `hasIcu`.
- **Why:** the homepage and `/hospitals` currently show 20 bundled demo hospitals labelled "Demo data". The assignment rule says real API only for core data.
- **Frontend fallback:** demo list stays when the API returns nothing or 401.
- **Verify:** `curl /api/v1/hospitals?limit=100` without Authorization returns 200 with items.

### 2. Demo accounts present in every environment
- Seed must create `patient@dispatch.demo`, `driver@dispatch.demo` (both `Demo123!`) and `admin@dispatch.demo` (`Admin123!`), a driver profile with an ambulance, three hospitals, and a few requests in different statuses so dashboards are not empty.
- Run `bun run db:seed` against the production database. In the dev database the demo patient and driver were missing until the seed ran, which made the one-click buttons fail with "Invalid email or password".
- The admin row already existed with the display name "New Name": confirm its password matches `DEMO_ADMIN_PASSWORD`, or reset it.
- The working tree has uncommitted seed and `.env.example` edits (`FRONTEND_URL`): review and commit them.

### 3. CORS and URLs for the deployed frontend
- `CORS_ORIGIN` must contain the deployed frontend origin (comma separated if more than one).
- `APP_BASE_URL` and `FRONTEND_URL` must be the real deployed URLs: Stripe success/cancel redirects land on the frontend `/payment/success` and `/payment/cancel`.
- Stripe webhook secret and test keys set on Vercel; webhook registered for `checkout.session.completed`.

## P1. Needed by features in the redesign

### 4. Driver ratings and earnings
- **Today:** `GET /feedback/request/:requestId` only; the driver cannot see their ratings. There is no payout model.
- **Need:** `GET /driver/me/stats` returning `{ completedTrips, activeTrips, averageRating, ratingCount, fareTotal }` (fares from completed trips' payments). Optionally `GET /driver/me/ratings?page=` with `rating, comment, requestId, createdAt`.
- **Frontend fallback:** the earnings page counts completed trips from `GET /requests/my-assigned` and sums fares by ambulance type using `TRIP_RATES` (15 / 35 / 60 USD). It shows no rating.

### 5. Driver trip history with filters
- **Need:** `GET /requests/my-assigned` to accept `status`, `from`, `to`, `q` (pickup address or hospital name) and return `ambulance` and `destinationHospital` in each item.
- **Frontend fallback:** fetches up to 100 and filters in the browser.

### 6. Admin reports
- **Need:** `GET /admin/reports/summary?from=&to=` returning requests per day, response time per day (assignedAt minus requestedAt), counts by priority and by ambulance type, cancellation reasons. `GET /admin/feedback?page=` listing recent feedback with driver and rating.
- **Frontend fallback:** `/admin/reports` aggregates the first 100 requests from `GET /admin/...requests` and `dashboard-stats` in the browser.
- **Export:** `GET /admin/audit-logs?format=csv` and `GET /requests?format=csv` for the Export CSV button (P2).

### 7. Public statistics
- `GET /public/stats` returning `{ hospitals, ambulancesAvailable, requestsCompleted }` (no auth, cached) so the homepage stats strip can show real numbers. Until then the strip shows only product facts (3 taps, 24/7, pay after arrival).

### 8. Request fields and filters
- `POST /requests` should accept an optional `ambulanceType` (`BASIC | ICU | CARDIAC`) so the wizard can express a preference, plus optional `patientName`, `patientAge`, `notes`, `callbackPhone`. Dispatch would then rank nearby ambulances by type.
- `GET /requests` filters: `status`, `priority`, `q`, `from`, `to`, `sort`, consistent for patient, driver and admin. The frontend already sends `status`, `priority` and `page` as URL params.
- `GET /ambulances/nearby` should include the assigned driver name and ambulance type in each item.

### 9. Contact form endpoint
- `POST /contact` with `{ name, email, phone?, category, message }`, rate limited, stored or emailed. Frontend currently opens the visitor's mail client (`mailto:`).

## P2. Nice to have

| # | Item | Why |
|---|---|---|
| 10 | Realtime trip updates (SSE or websocket) on `GET /requests/:id/stream` | Replace 5 s polling on trip pages and the dispatch board |
| 11 | Driver location in `GET /requests/:id` response (`driver.currentLat/currentLng`) for the patient trip map | Live ETA and map |
| 12 | Patient profile extras: `bloodGroup`, `allergies`, `conditions`, emergency contacts, saved addresses (`/users/me/addresses`, `/users/me/contacts`) | Prototype profile and request screens |
| 13 | Forgot / reset password (`POST /auth/forgot-password`, `POST /auth/reset-password`) and change password | Login page link |
| 14 | Driver application (`POST /driver-applications`) and admin review | "Drive with us" call to action |
| 15 | Receipt endpoint (`GET /payments/:id/receipt`, PDF or HTML) | Payments page download |
| 16 | Maintenance flag by driver (`PATCH /driver/ambulance/status` with `MAINTENANCE`) | Prototype driver profile toggle |
| 17 | Fare estimate `GET /fares/estimate?type=&km=` | Homepage estimator |
| 18 | Notifications (SMS or push) on status change | Patient and family updates |
| 19 | Cloudinary or similar upload for avatar and ambulance photos | Only if the domain needs uploads |

## Things the frontend assumes are true (check them)
- Login, register and refresh return `{ success, message, data }` with `data.user` and `data.accessToken` / `data.refreshToken` (the Next route handlers put them in HTTP-only cookies).
- Error responses use `{ success: false, message, errors? }` (the UI shows `message` in toasts).
- Pagination shape `{ items, meta: { page, limit, total, totalPages } }` on all lists.
- `PATCH /requests/:id/status` enforces the status machine and driver ownership; `POST /requests/:id/cancel` takes `cancelReason`.
- Payment initiate returns a Stripe Checkout URL; fares are `TRIP_RATES` in `src/lib/stripe.ts`.

## Suggested order
1. Item 1 (public hospitals), item 2 (seed), item 3 (CORS and URLs).
2. Items 4 to 6 so the driver and admin reports show real data instead of browser aggregation.
3. Items 7 to 9.
4. P2 as time allows; drop the matching UI from the prototype if skipped (the redesigned pages must not show fake data for them).
