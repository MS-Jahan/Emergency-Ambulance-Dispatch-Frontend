# Frontend plan — Emergency Ambulance Dispatch (B7A7)

Date: 2026-10-04. Deadline: 2026-10-10 23:59. Domain: Emergency Ambulance Dispatch (student id last digit 5).

Design: see 2026-10-04-ui-design-plan.md. Backend: 2026-10-04-backend-improvements.md.

Sources: `../B7A7` (requirements), `../ph-l2-b7-asnmnt-6` (backend, already built; Express 5 + Prisma + Stripe, 42 endpoints).

## Roles (3, matches backend enum)
| Role | Dashboard | Purpose |
|---|---|---|
| PATIENT | `/dashboard` | create/track/cancel requests, pay, feedback |
| DRIVER | `/driver` | go online/offline, assigned trips, advance status, location |
| ADMIN | `/admin` | hospitals, ambulances, dispatch, users, stats, audit logs |

## Stack
Next.js (App Router) + TypeScript strict, Tailwind CSS + shadcn/ui, TanStack Query (client server-state), Zustand (UI state + wizard draft), React Hook Form + Zod, Recharts, Sonner, Lucide, next/image. Stripe checkout hosted by backend (test mode).

## Auth design
- Backend returns `{accessToken, refreshToken}` in body (no cookies).
- Next.js route handlers (`/api/auth/*`) proxy login/register/refresh/logout and store tokens in HTTP-only cookies. Browser never sees tokens.
- `middleware.ts` (proxy) reads access-token cookie, decodes role claim, redirects: unauthenticated -> `/login`, wrong role -> own dashboard. Expired access token + valid refresh cookie -> refresh in middleware.
- Server components fetch backend with token from cookies. Client components call backend through `/api/proxy/*` route handler (adds Bearer header, handles refresh). Avoids CORS and token exposure.
- One-click demo login: three buttons post to `/api/auth/demo` with role; server holds the demo credentials via env.

## Page list (>= 18)
Public: `/`, `/about`, `/services`, `/contact`, `/faq`, `/hospitals` (public list w/ URL filters)
Auth: `/login`, `/register`
Patient: `/dashboard`, `/dashboard/requests/new` (3-step wizard), `/dashboard/requests/[id]`, `/dashboard/payments`, `/dashboard/profile`
Driver: `/driver`, `/driver/trips`, `/driver/profile`
Admin: `/admin`, `/admin/requests`, `/admin/ambulances`, `/admin/hospitals`, `/admin/users`, `/admin/audit-logs`
Payment: `/payment/success`, `/payment/cancel`
Utility: `not-found.tsx`, `error.tsx`, `loading.tsx` per data route.

## Backend polish needed (done in ../ph-l2-b7-asnmnt-6, local only, user redeploys)
1. Stripe `success_url`/`cancel_url` pointed at backend JSON callbacks. Frontend needs browser redirect to its own pages. Add env `FRONTEND_URL`; checkout URLs -> `${FRONTEND_URL}/payment/success?sessionId=...`. Frontend page then calls `GET /payments/callback/success?sessionId=` (unauthenticated, verifies with Stripe) to render result.
2. Seed only had admin. Add demo patient + driver (+ driver profile linked to ambulance) so all 3 demo buttons work.
3. CORS_ORIGIN must include the frontend origin(s).

## Build order
1. Docs + backend polish. 2. Scaffold, theme, layouts. 3. Auth + middleware + demo login. 4. API layer + shared components (DataTable, StatCard, StatusBadge, SearchInput, Pagination, EmptyState). 5. Patient, driver, admin features. 6. Payment flow. 7. Charts, polish, perf, responsive. 8. Deploy notes + video script. 20+ conventional commits throughout.
