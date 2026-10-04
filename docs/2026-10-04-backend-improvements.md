# Backend improvements (../ph-l2-b7-asnmnt-6)

Date: 2026-10-04. Backend is complete; these are what the frontend needs. Local edits only; user redeploys to Vercel and updates env.

## Done (typechecks)
1. `FRONTEND_URL` env; Stripe success/cancel URLs now go to `${FRONTEND_URL}/payment/success|cancel?sessionId=...`. Frontend page calls the unauthenticated `GET /payments/callback/*` to verify. Previously Stripe landed on a raw JSON page.
2. Seed adds `patient@dispatch.demo` and `driver@dispatch.demo` (password `Demo123!`, driver profile on ambulance DHK-1001) so all three one-click demo logins work. Admin stays `admin@dispatch.demo`.

## Proposed (need approval)
3. **`GET /admin/drivers`** — list driver profiles (status, ambulance, location). Today only `/admin/users?role=DRIVER` exists with no driver status, so dispatchers can't pick a driver. Also `PATCH /admin/drivers/:id` to link an ambulance.
4. **Dashboard time series** — extend `/admin/dashboard-stats` (or add `/admin/stats/timeseries`) with requests per day (last 14d), revenue per day, requests by priority. Needed for real charts; current stats are totals only.
5. **Driver location in request detail** — return `driver.currentLat/currentLng` on `GET /requests/:id` for patient + admin so the patient can see the ambulance move (frontend polls).
6. **`GET /payments/rates`** (public to authed users) — expose TRIP_RATES so the wizard can show an estimated fare per ambulance type.
7. **Public hospitals list** — `GET /hospitals` currently requires auth; landing page wants it public. Make GET list/detail public (reads only).
8. CORS: `CORS_ORIGIN` must include the frontend origin + localhost. Env only.
9. Postman/OpenAPI docs updated for 3, 4, 5, 6, 7.

Not changing: auth model (tokens in body; frontend wraps them into HTTP-only cookies via Next route handlers).
