# Verification & Deployment Checklist

Date: 2026-10-04
Scope: all 8 implementation phases of the dispatch frontend.

## What was verified (automated, per task)

Every task passed the gate `bunx tsc --noEmit && bun run lint && bun run build`
immediately before its commit. The build prerenders every public page as static
content and compiles all 26 routes (see `bun run build` output: About, Services,
Hospitals, FAQ, Contact, login, register, dashboard, driver, admin, payment
callbacks, 404).

## Route inventory (from build output)

- Public static: `/`, `/about`, `/services`, `/hospitals`, `/faq`, `/contact`,
  `/login`, `/register`, `/not-found`, `/error`
- Patient: `/dashboard` (sidebar shell, mobile bottom tabs), `/dashboard/requests`,
  `/dashboard/requests/new` (3-step wizard), `/dashboard/requests/[id]` (live
  polling), `/dashboard/payments`, `/dashboard/profile`
- Driver: `/driver` (duty toggle, assigned queue, location update)
- Admin: `/admin` (overview stats), `/admin/dispatch`, `/admin/resources`
  (ambulances / hospitals / users / audit tabs)
- Payment callbacks: `/payment/success?sessionId=…`, `/payment/cancel?sessionId=…`
  calling `GET /payments/callback/{success|cancel}` (unauthenticated on backend,
  verified against `../ph-l2-b7-asnmnt-6` source)

## Verification checklist status

| Item | Status | Notes |
|---|---|---|
| Demo Patient: create request → pay → feedback | code complete | wizard, Stripe initiate, callback pages, feedback form all built; needs live backend run |
| Demo Driver: duty → accept → location → picked up → delivered | code complete | 5s polling on assigned queue, status transitions wired |
| Demo Admin: dispatch → assign → analytics | code complete | dispatch board with nearby-ambulance lookup, overview dashboard |
| One-click demo logins (3 roles) | code complete | `useDemoLogin` against backend demo endpoints |
| Role redirects | code complete | `roleHome()` maps PATIENT→/dashboard, DRIVER→/driver, ADMIN→/admin |
| Responsive 375/768/1440 | implemented, spot-checked in code | bottom tab bar (patient), vertical trip line <640px, full-width wizard/auth buttons, scrollable public nav |
| Stripe test-mode checkout | needs live run | frontend initiates + renders callbacks; Stripe keys live in backend env |
| Payment success/cancel redirect | code complete | backend `FRONTEND_URL` must point at this deploy |
| 20+ conventional commits | done | `git log` on master from auth through verification docs |

## Known contract notes

- Backend `GET /hospitals` requires auth; public hospitals page shows a
  sign-in empty state for anonymous visitors by design.
- Services page displays ৳ amounts (app-wide convention); backend Stripe
  charges in USD per `STRIPE_CURRENCY=usd`. Reconcile before real charging.
- Contact form composes an email draft (no backend); support address is a
  placeholder until ops provides a real one.

## Deployment steps

1. Push `master` to GitHub.
2. Vercel: import repo, framework auto-detects Next.js 16.
3. Env vars: `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.example.com/api/v1`).
   Map token only if a map provider is wired into request creation.
4. Backend must set `FRONTEND_URL` to the Vercel domain so Stripe redirects
   land on `/payment/success` and `/payment/cancel`.
5. Smoke test: demo patient login → raise request → (admin assign) → pay via
   Stripe test card 4242… → confirm `/payment/success` shows PAID.
6. Record the 5–10 minute demo video against the deployed URL.

## Not automated

No test framework exists in this repo (no unit/E2E infra was in scope); the
per-task gate is typecheck + lint + production build, and the flows above need
one live pass against a running backend before sign-off.
