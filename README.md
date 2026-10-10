# RapidAid: Emergency Ambulance Dispatch (Frontend)

The web app for an emergency ambulance service in Bangladesh. A patient asks for an ambulance in a few steps, an admin dispatches the nearest available unit, the driver moves the trip through its stages, and the patient pays online after the ride. Built with Next.js (App Router) on top of the [Emergency Ambulance Dispatch API](https://github.com/MS-Jahan/Emergency-Ambulance-Dispatch-API).

| | |
|---|---|
| **Live app** | https://emergency-ambulance-dispatch-fronte.vercel.app |
| **Live API** | https://emergency-ambulance-dispatch-api.vercel.app/api/v1 (docs at `/api/v1/docs`) |
| **Backend repo** | https://github.com/MS-Jahan/Emergency-Ambulance-Dispatch-API |

## Try it: demo accounts

The sign-in page has one-click **Patient / Driver / Admin** buttons and a "Demo account credentials" panel that fills the form. The accounts are public test accounts with sample data:

| Role | Email | Password | What you see |
|---|---|---|---|
| Admin | `admin@dispatch.demo` | `Admin123!` | KPIs and charts, dispatch board with assign-nearest, ambulances, hospitals, users, contact messages, audit log, reports, integrations status |
| Patient | `patient@dispatch.demo` | `Demo123!` | Request wizard, live trip page, payments and receipts, profile |
| Driver | `driver@dispatch.demo` | `Demo123!` | Duty switch, one big next-step button, earnings, ambulance maintenance toggle |

**Test payment:** after a trip is completed, the patient's "Pay now" opens Stripe in test mode. Use card `4242 4242 4242 4242`, any future expiry, any CVC and any name.

## What each role can do

**Patient** (`/dashboard`)
- Request an ambulance in three steps: pin the pickup on a map (or use the current location), choose priority, ambulance type and patient details, pick a destination hospital, confirm.
- Follow the trip on a status line from requested to completed, call the driver, cancel before pickup.
- Pay after the trip through Stripe, open a printable receipt, rate the trip.
- Keep a profile, switch light or dark theme, change the password, choose email or SMS trip updates when those channels are configured.

**Driver** (`/driver`)
- Go online or offline, see the assigned trip, advance it with one large button per step, call the patient or open directions.
- See completed trips, fares and rating on the earnings page, mark the ambulance as in maintenance.

**Admin** (`/admin`)
- Overview with KPIs, requests over time and status split.
- Dispatch board (pending, in progress, done) with nearby ambulances ranked by distance and an assign-nearest panel.
- Manage ambulances, hospitals, users (create drivers, change roles), read contact messages, browse the audit log.
- Reports with response times, ambulance-type mix, cancellation reasons and recent feedback; export incidents to CSV.

**Visitors** (no account)
- Home page with the nearest hospitals (by approximate location, or by the device location after permission), the three ambulance types with their fares, first-aid guidance, plus Services, About, FAQ, Contact, a hospital directory with search and district filter, password reset by email when email is configured.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, route handlers, `proxy.ts`), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui on Base UI, Lucide icons, Caprasimo and Figtree fonts, light and dark themes |
| Data | TanStack Query (caching, optimistic updates), Zustand (auth and UI state) |
| Forms | React Hook Form + Zod |
| Maps and charts | Leaflet and react-leaflet, Recharts |
| Notifications | Sonner toasts |
| Payments | Stripe Checkout (test mode), handled by the API |
| Hosting | Vercel |

## How it talks to the API

Browsers never call the API directly:

1. Sign-in goes to Next route handlers under `/api/auth/*`, which call the API and store the access and refresh tokens in **HTTP-only cookies**. Tokens never reach client JavaScript.
2. Data calls go to `/api/proxy/*`, which adds the bearer token from the cookie, refreshes it once on a 401, and forwards the request.
3. The proxy also forwards the visitor's address with a shared secret so the API can rate-limit per visitor (see `docs/2026-10-10-rate-limiting.md`).
4. `proxy.ts` guards `/dashboard`, `/driver` and `/admin` by role; the shell and pages hide what a role may not use.

## Run it locally

Requirements: Bun (or Node 20+) and a running API.

```bash
# 1. the API (separate repo): create its database, then
bun run db:deploy && bun run db:seed && bun run dev      # http://localhost:5000

# 2. this app
cp .env.example .env.local
bun install
bun run dev                                               # http://localhost:3000
```

### Environment variables

| Variable | Needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes (default `http://localhost:5000/api/v1`) | API address; `/api/v1` is added if you leave it out |
| `PROXY_SHARED_SECRET` | optional | Same value as on the API; lets rate limits key on the visitor. Server-side only. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | optional | Reserved for a Mapbox map style; the app uses OpenStreetMap tiles without it |
| `DEMO_PATIENT_EMAIL`, `DEMO_PATIENT_PASSWORD`, `DEMO_DRIVER_EMAIL`, `DEMO_DRIVER_PASSWORD`, `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` | optional | Point the one-click buttons at different seeded accounts (the credentials panel on the sign-in page still lists the defaults) |

Email and SMS are configured on the API, not here: the app asks the API which channels exist and shows the matching screens. See `docs/2026-10-10-email-sms-integrations.md`.

### Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Development server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

## Project layout

```
src/app/                 routes: public pages, /login, /register, /forgot-password, /reset-password,
                         /dashboard (patient), /driver, /admin, /payment/*, and /api/* route handlers
src/components/ui/       base components (button, card, dialog, select, tabs, ...)
src/components/shell/    role shell and navigation
src/components/admin|auth|profile|public|request|shared/   feature components
src/lib/                 api client, TanStack Query hooks, stores, geo helpers, demo accounts
src/data/                demo hospitals used only when the API returns none
src/types/api.ts         types of API responses
proxy.ts                 role-based route protection
docs/                    plans, decisions, issues, specs and guides (dated file names)
```

## Pages

| Area | Routes |
|---|---|
| Public | `/`, `/about`, `/services`, `/faq`, `/contact`, `/hospitals`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/payment/success`, `/payment/cancel` |
| Patient | `/dashboard`, `/dashboard/requests/new`, `/dashboard/requests/[id]`, `/dashboard/payments`, `/dashboard/payments/[id]`, `/dashboard/profile` |
| Driver | `/driver`, `/driver/earnings`, `/driver/profile` |
| Admin | `/admin`, `/admin/dispatch`, `/admin/resources` (ambulances, hospitals, users, messages, audit), `/admin/reports` |

Lists keep their filters and page in the URL, so any view can be bookmarked or shared. Data pages show skeletons while loading, empty states when there is nothing to show, and an error boundary with toasts on failures.

## Deployment

The frontend deploys from `master` on Vercel. Set `NEXT_PUBLIC_API_BASE_URL` (value is inlined at build time) and `PROXY_SHARED_SECRET`, then push. The API deploys separately; its steps, including moving the API domain alias, are in the backend repo's `docs/deployment.md`.

## Documentation

All plans, decisions and reports live in `docs/` with `YYYY-MM-DD-name.md` names. Good starting points:

- `2026-10-10-not-built-spec.md`: what is still missing, open risks and detailed specs
- `2026-10-10-email-sms-integrations.md`: plug in Resend and an SMS provider
- `2026-10-10-rate-limiting.md`: how per-visitor rate limiting works behind the proxy
- `2026-10-10-backend-requirements.md`: what the frontend needs from the API
- `2026-10-10-issues-found.md`, `2026-10-10-deployment-status.md`: audit and deployment notes

## Known limits

- The hospital directory falls back to a labelled demo list only if the API returns no hospitals.
- Email, SMS, Google sign-in, Bangla, live driver tracking on the map, patient medical profile and driver applications are not built yet; each is specified in the not-built document.
- Rate-limit counters live in each API instance's memory, so limits are best effort on serverless hosting.
