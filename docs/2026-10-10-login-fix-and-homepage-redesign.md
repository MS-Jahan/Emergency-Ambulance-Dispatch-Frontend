# 2026-10-10 Login fix, demo hospitals, homepage redesign

## 1. Bug: `Route not found: POST /auth/login`
- **Symptom:** clicking Patient / Driver / Admin demo buttons (and normal sign in) returned the backend's 404 `Route not found: POST /auth/login`.
- **Root cause:** the backend mounts everything under `/api/v1` (`src/app.ts`). The 404 message prints `req.originalUrl`, and it showed `/auth/login`, so the Next server route called the backend without the `/api/v1` prefix. `NEXT_PUBLIC_API_BASE_URL` was set to the bare host. The code default included the prefix, so only a configured env var could cause it.
- **Fix:** `src/env.ts` now normalises the base URL (`normalizeApiBase`): trims trailing slashes and appends `/api/v1` when missing. Added `.env.example`.
- **Verified:** with `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` (bare), demo login for PATIENT, DRIVER, ADMIN all return success.
- **Second cause found:** demo users did not exist in the dev database, so demo login would fail with "Invalid email or password". Ran `bun run db:seed` in the backend (upsert, idempotent). Demo creds: `patient@dispatch.demo` / `driver@dispatch.demo` with `Demo123!`, `admin@dispatch.demo` with `Admin123!`.

## 2. Bug: login button text invisible until hover
- The homepage CTA "Login" used the `outline` variant, which keeps `bg-background` (light). With `text-paper` (white) the text was white on light until hover. Fixed by `bg-transparent text-white`, and by using fixed colours on the always-dark CTA band. All Link-wrapping-Button patterns on the homepage now use `render={<Link/>}` (no nested interactive elements).

## 3. Hospitals on the homepage
- Decision: do not call the authenticated backend from public pages (`/hospitals` requires a token, so the section was always empty). Use bundled demo data and label it **Demo data**.
- `src/data/demo-hospitals.ts`: 20 hospitals across 15 districts.
- `src/app/api/geo/route.ts`: approximate location from IP (Vercel geo headers, else ipwho.is, else Dhaka). Never fails.
- `src/components/public/nearby-hospitals.tsx`: top 5 by haversine distance from IP location; "Use my location" button asks browser permission and re-sorts. IPs outside Bangladesh fall back to Dhaka. Denied permission shows a message and keeps IP results.
- `/hospitals` shows all 20 sorted by distance, plus the live directory when signed in.

## 4. Redesign done so far
- Sticky header with brand mark, 999 hotline, Sign in + Get started.
- Hero scaled up, stats strip, hospital network section, district coverage chips, fixed CTA band.

## 5. Known gaps (see brief)
- Role sections reuse the same trip demo three times; replace with role-specific mockups.
- Pages inside the app (dashboard, driver, admin) are not yet redesigned.
- Demo hospitals phone numbers and bed counts are illustrative only.

See `2026-10-10-redesign-content-brief.md` for the designer brief.
