# Implementation Phases — Dispatch Frontend

**Deadline:** 2026-10-10 23:59 UTC  
**Deadline est:** 6 days, 21 hours remaining  
**Status:** Phase 1 in progress, Phase 2+ pending  
**Commits so far:** 3 conventional (scaffold, auth infrastructure, login/home/trip-line)

---

## Phase 1: Auth & Core Infrastructure [DONE: 3/5 commits]

Goal: Login, session management, role-based routing.

- [x] Scaffold Next.js 16, shadcn/ui, TanStack Query, Zustand, Recharts, Sonnet
- [x] Color palette (signal red, oxygen teal, amber, slate); Schibsted Grotesk typeface
- [x] Types & API types (User, roles, requests, payments, ambulances, hospitals)
- [x] Zustand stores: auth, UI state, request wizard draft
- [x] TanStack Query hooks for auth, patient, driver, admin endpoints
- [x] Proxy.ts: role-based routing, token validation, redirects
- [x] Login page: email/password + one-click demo buttons (3 roles)
- [x] Home page: hero, features, CTA; no auth required
- [x] Trip Line component: visual status indicator (PENDING → COMPLETED)
- [ ] Register page: email, password, name, phone; Zod validation + React Hook Form
- [ ] Session check on app load (fetch /users/me, set auth state)

**Tasks:**
```
- Register page form (email, password confirm, name, phone)
- Zod schema for registration
- useRegister hook integration
- Session restoration on mount (QueryClientProvider + useMe)
- Error toast when session expired
```

---

## Phase 2: Shared Components & Layouts [0/7 commits]

Goal: Reusable data & UI components, dashboard layouts for 3 roles.

**Components to build:**

1. **DataTable** (patient, admin, driver request lists)
   - Columns: status, priority, address, ambulance, time
   - Sorting, pagination
   - Row click → detail modal/page
   - Empty state ("No requests yet. Request an ambulance.")

2. **StatusBadge** (PENDING, ASSIGNED, EN_ROUTE_PICKUP, etc.)
   - Color-coded by status
   - Text label inside

3. **PriorityBadge** (CRITICAL, HIGH, NORMAL)
   - Signal red for CRITICAL
   - Amber for HIGH
   - Slate for NORMAL

4. **StatCard** (admin dashboard)
   - Icon + value + label + sparkline
   - Vary sizes by importance

5. **Layouts:**
   - PatientLayout: bottom tab bar (mobile), left sidebar (desktop)
   - DriverLayout: minimal, full-width primary action
   - AdminLayout: left rail + top bar, dense

6. **Modals:**
   - RequestDetailModal
   - AssignAmbulanceSheet (admin)
   - UpdateStatusSheet (driver)

7. **LoadingStates:**
   - Skeleton loaders for DataTable, StatCard
   - loading.tsx on every data route

---

## Phase 3: Patient Features [0/8 commits]

Goal: Request creation (wizard), tracking, payment flow.

**Routes:**
- `/dashboard` → My requests list + quick request button
- `/dashboard/requests/new` → 3-step wizard (location → priority → review)
- `/dashboard/requests/[id]` → Request detail + driver location + trip line + feedback form
- `/dashboard/payments` → Payment history, initiate payment
- `/dashboard/profile` → Name, phone, email (readonly), avatar

**New request wizard:**
1. **Step 1: Location picker**
   - Map with Leaflet + OpenStreetMap (no key)
   - Pin or search box (geocoding API optional; manual entry OK)
   - Pickup address text field
   - "Use my location" button → geolocation API
   - Current address in preview

2. **Step 2: Priority & hospital**
   - Radio buttons: CRITICAL, HIGH, NORMAL
   - Hospital selector (auto-fetch from /hospitals)
   - Show estimated fare by ambulance type

3. **Step 3: Review**
   - Summary: location, priority, hospital
   - Create button → POST /requests
   - Redirect to detail page

**Detail page:**
- Trip line (horizontal status flow)
- Request info: address, priority, hospital
- Driver info: name, phone, rating (once assigned)
- Driver location on map (poll GET /requests/:id, read driver.currentLat/Lng)
- Status history (statusLogs)
- Payment button (only if COMPLETED)
- Cancel button (only if PENDING or ASSIGNED)

**Payments:**
- List payments (date, trip, amount, status)
- Click → detail (trip info, receipt)
- Initiate payment → Stripe checkout → redirect to /payment/success or /payment/cancel

---

## Phase 4: Driver Features [0/3 commits]

Goal: Online/offline toggle, trip queue, status updates, location tracking.

**Routes:**
- `/driver` → Status toggle, active trip card, trip history
- No sub-routes; everything on one page (one big action button)

**UI:**
- Top: Online/Offline toggle (56px min tap target)
- Ambulance info: plate, type, status
- Current trip (if any):
  - Patient name, address, priority
  - Pickup on map
  - Trip line (current status)
  - Big status button: "Start driving" → "Arrived" → etc. (one action per state)
  - Tap-to-call patient
  - Tap-to-navigate (geo: link to patient location)
- History: list of past trips (link to detail)

**Logic:**
- Fetch /driver/me on mount (get profile, ambulance, active trip)
- Poll GET /requests?role=DRIVER every 5s for active trip
- On status button click: PATCH /requests/:id/status + note
- On location change: PATCH /driver/location (throttle to 10s intervals)
- Turn off location tracking when offline

---

## Phase 5: Admin Features [0/5 commits]

Goal: Dashboard stats, dispatch board, resource management.

**Routes:**
- `/admin` → Dashboard (stats cards, charts, pending requests preview)
- `/admin/requests` → Dispatch board (columns: pending, active, done)
- `/admin/ambulances` → Table, CRUD
- `/admin/hospitals` → Table, CRUD
- `/admin/users` → Table, list/filter patients and drivers
- `/admin/audit-logs` → Immutable log of all actions

**Dashboard:**
- KPI cards: total users, patients, drivers, ambulances, available ambulances, requests (total, pending, completed, cancelled), revenue
- Chart 1: Area chart, requests per day (last 14 days)
- Chart 2: Donut chart, requests by status
- Chart 3: Area chart, revenue per day (last 14 days)
- Preview: pending requests (first 5)

**Dispatch board (signature feature):**
- 3 columns: Pending (sorted by priority), In Progress, Completed Today
- Each request card: patient name, address, priority badge, ambulance + driver, time waiting
- Pending card click → Side sheet opens
  - Lists nearby ambulances (radius, distance calculated)
  - Click ambulance → Assign button
  - POST /requests/:id/assign → refresh board

**Requests table:**
- Filter by status, priority (URL params: ?status=PENDING&priority=CRITICAL)
- Sort by time, priority
- Row click → detail modal

**Ambulances table:**
- Columns: plate, type, status, home hospital, actions (edit, delete)
- Create button → form modal
- Status badge color-coded

**Hospitals table:**
- Columns: name, address, phone, actions
- Create, edit, delete

**Users table:**
- Filter by role (?role=PATIENT or ?role=DRIVER)
- Search by name/email (?q=name)
- Columns: name, email, phone, role, joined
- Promote user to driver: click row → modal, set role + license number

**Audit logs:**
- Immutable, paginated
- Columns: time, actor, action, request (link), before/after
- Filter by request (?requestId=...)

---

## Phase 6: Payment & Callbacks [0/2 commits]

Goal: Stripe checkout, success/cancel pages.

**Routes:**
- `/payment/success?sessionId=...` → verify payment with backend, show receipt
- `/payment/cancel?sessionId=...` → show cancellation, offer retry

**Success page:**
- Fetch GET /payments/callback/success?sessionId=...
- Display: trip info, amount, receipt
- Button: "Back to trips" → /dashboard/payments

**Cancel page:**
- Fetch GET /payments/callback/cancel?sessionId=...
- Display: trip info, amount, cancellation reason (if any)
- Button: "Try again" → /dashboard/payments → click payment again

---

## Phase 7: Public Pages & Polish [0/2 commits]

Goal: About, services, contact, FAQ; Responsive design; Performance.

**Routes:**
- `/about` → Who we are, mission
- `/services` → Service types, response times
- `/contact` → Contact form (basic, no backend required)
- `/faq` → FAQ (static)
- `/hospitals` → Public hospital list (no auth required)
- `404.tsx` → Custom 404 page
- `error.tsx` → Global error boundary

**Responsive:**
- Test on mobile (375px), tablet (768px), desktop (1440px)
- Bottom tab bar on patient mobile
- Full-width buttons on small screens
- Trip line vertical on mobile, horizontal on desktop

**Performance:**
- next/image for all images
- Code splitting per route
- Lazy load charts (Recharts)
- Pagination limit=10 by default
- Revalidate static pages every 1h (cache)

---

## Phase 8: Testing & Deployment [0/1 commit]

Goal: Verify all flows, deploy to Vercel.

**Verification checklist:**
- [ ] Demo Patient: create request, pay, feedback
- [ ] Demo Driver: go online, accept trip, track location, mark picked up → delivered
- [ ] Demo Admin: dispatch request, assign ambulance, view analytics
- [ ] One-click logins work for all 3 roles
- [ ] Role redirects correct (patient → /dashboard, driver → /driver, admin → /admin)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Stripe test mode checkout works
- [ ] Payment success/cancel redirect
- [ ] 20+ meaningful commits with conventional format

**Deployment:**
- Push to GitHub (public or private)
- Connect to Vercel
- Set env vars: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_MAPBOX_TOKEN (if using)
- Deploy
- Test live payment flow
- Record 5–10 min demo video

---

## Quick Reference: File Structure

```
src/
├── app/
│   ├── (auth)/                 # Public auth routes
│   │   ├── login/page.tsx      # Done
│   │   └── register/page.tsx   # Phase 1
│   ├── (public)/               # No auth required
│   │   ├── page.tsx            # Done (home)
│   │   ├── about/page.tsx      # Phase 7
│   │   ├── services/page.tsx   # Phase 7
│   │   ├── contact/page.tsx    # Phase 7
│   │   ├── faq/page.tsx        # Phase 7
│   │   └── hospitals/page.tsx  # Phase 7
│   ├── dashboard/              # Patient only
│   │   ├── page.tsx            # Phase 3
│   │   ├── requests/
│   │   │   ├── new/page.tsx    # Phase 3 (wizard)
│   │   │   └── [id]/page.tsx   # Phase 3 (detail)
│   │   ├── payments/page.tsx   # Phase 3
│   │   └── profile/page.tsx    # Phase 3
│   ├── driver/                 # Driver only
│   │   └── page.tsx            # Phase 4
│   ├── admin/                  # Admin only
│   │   ├── page.tsx            # Phase 5 (dashboard)
│   │   ├── requests/page.tsx   # Phase 5
│   │   ├── ambulances/page.tsx # Phase 5
│   │   ├── hospitals/page.tsx  # Phase 5
│   │   ├── users/page.tsx      # Phase 5
│   │   └── audit-logs/page.tsx # Phase 5
│   ├── payment/                # Stripe callbacks
│   │   ├── success/page.tsx    # Phase 6
│   │   └── cancel/page.tsx     # Phase 6
│   ├── layout.tsx              # Done
│   ├── page.tsx                # Done (home)
│   ├── error.tsx               # Phase 7
│   ├── not-found.tsx           # Phase 7
│   ├── loading.tsx             # Phase 2
│   └── globals.css             # Done
├── components/
│   ├── ui/                     # shadcn components
│   ├── providers.tsx           # Done
│   ├── trip-line.tsx           # Done
│   ├── data-table.tsx          # Phase 2
│   ├── status-badge.tsx        # Phase 2
│   ├── priority-badge.tsx      # Phase 2
│   ├── stat-card.tsx           # Phase 2
│   ├── layouts/
│   │   ├── patient-layout.tsx  # Phase 2
│   │   ├── driver-layout.tsx   # Phase 2
│   │   └── admin-layout.tsx    # Phase 2
│   └── modals/
│       ├── request-detail.tsx  # Phase 3
│       ├── assign-ambulance.tsx# Phase 5
│       └── update-status.tsx   # Phase 4
├── lib/
│   ├── api.ts                  # Done
│   ├── store.ts                # Done
│   ├── hooks.ts                # Done (needs demo login endpoint added)
│   └── utils.ts                # Done (shadcn)
├── types/
│   └── api.ts                  # Done
└── env.ts                      # Done

proxy.ts                        # Done (role-based routing)
```

---

## Commit Strategy

Target: 20+ commits by deadline. Suggested 3–4 commits per phase.

Example:
- Phase 1, commit 4: Register page, session restoration
- Phase 2, commit 5: Data table, shared components
- Phase 2, commit 6: Dashboard layouts
- Phase 3, commit 7: Request wizard (3 steps)
- Phase 3, commit 8: Request detail, trip tracking
- Phase 3, commit 9: Payment initiation, Stripe integration
- Phase 4, commit 10: Driver status toggle, trip queue
- Phase 5, commit 11: Admin dashboard, KPI cards, charts
- Phase 5, commit 12: Dispatch board, assign ambulances
- Phase 5, commit 13: Resource tables (ambulances, hospitals, users)
- Phase 6, commit 14: Payment success/cancel pages
- Phase 7, commit 15–17: Public pages, polish, responsive
- Phase 8, commit 18–20: Final verification, deployment notes

Each commit title format:
```
feat: <feature>
fix: <bug>
refactor: <change>
style: <formatting>
chore: <tooling>

Body (optional): why, not how.
```

---

## Backend API Assumptions

All endpoints require Bearer token in Authorization header (token read from HTTP-only cookie by proxy).

### Endpoints used in frontend

**Auth (public)**
- POST /auth/register → { user, accessToken, refreshToken }
- POST /auth/login → { user, accessToken, refreshToken }
- POST /auth/demo → { user, accessToken, refreshToken } (NEW: pass { role })
- POST /auth/logout → { success: true }

**User (authenticated)**
- GET /users/me → { user: User }
- PATCH /users/me → { user: User }

**Hospitals (public for GET, admin for POST/PATCH/DELETE)**
- GET /hospitals?limit=100 → { items: Hospital[], meta }
- POST /hospitals → { hospital: Hospital }
- PATCH /hospitals/:id → { hospital: Hospital }
- DELETE /hospitals/:id → { success: true }

**Ambulances (admin only, except GET/nearby)**
- GET /ambulances?page=1&limit=10 → { items: Ambulance[], meta }
- GET /ambulances/nearby?lat=...&lng=...&radiusKm=10 → { items: Ambulance[], meta }
- POST /ambulances → { ambulance: Ambulance }
- PATCH /ambulances/:id → { ambulance: Ambulance }
- DELETE /ambulances/:id → { success: true }

**Requests**
- POST /requests → { request: EmergencyRequest }
- GET /requests?page=1&limit=10&status=...&priority=... → { items: EmergencyRequest[], meta }
- GET /requests/:id → { data: EmergencyRequest }
- PATCH /requests/:id/status → { request: EmergencyRequest }
- POST /requests/:id/cancel → { request: EmergencyRequest }
- POST /requests/:id/assign (admin) → { request: EmergencyRequest }

**Driver**
- GET /driver/me → { data: DriverProfile }
- PATCH /driver/status → { user: DriverProfile }
- PATCH /driver/location → { success: true }

**Payments**
- POST /payments/initiate → { payment: Payment, checkoutUrl: string }
- GET /payments/my?page=1&limit=10 → { items: Payment[], meta }
- GET /payments/callback/success?sessionId=... → { payment: Payment }
- GET /payments/callback/cancel?sessionId=... → { payment: Payment }

**Admin**
- GET /admin/dashboard-stats → { stats: DashboardStats }
- GET /admin/users?page=1&limit=10&role=PATIENT&q=... → { items: User[], meta }
- PATCH /admin/users/:id/role → { user: User }
- GET /admin/drivers (NEW endpoint) → { items: DriverProfile[], meta }
- GET /admin/audit-logs?page=1&limit=10&requestId=... → { items: AuditLog[], meta }

**Feedback**
- POST /feedback → { feedback: Feedback }
- GET /feedback/request/:id → { feedback: Feedback[] }

---

## Environment Variables

Frontend (.env.local):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=  # optional; use OpenStreetMap if not set
```

Backend (.env, already updated):
```
FRONTEND_URL=http://localhost:3000
```

---

## Notes

- Stripe test mode uses test card `4242 4242 4242 4242`, any future date, any CVC.
- Demo credentials already in seed:
  - admin@dispatch.demo / Admin123!
  - patient@dispatch.demo / Demo123!
  - driver@dispatch.demo / Demo123!
- Backend improvements 3, 4, 5, 6 from design doc (new endpoints, driver location, rates API, public hospitals) should be implemented if time permits, but frontend works without them (falls back gracefully).
- No Mapbox token = use OpenStreetMap + Leaflet (fully free).
