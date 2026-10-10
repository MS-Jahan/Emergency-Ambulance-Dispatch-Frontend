# 2026-10-10 Implementation Plan and Fixes

Implementation plan to address all open issues recorded in `2026-10-10-issues-found.md` according to the B7A7 project specifications (`../B7A7/README.md`, `project-requirements.md`, `timeline-breakdown.md`).

---

## 1. Summary of Issues and Resolution Strategy

### B2. URL State Synchronization (Blocker / Mandatory)
- **Requirements**: All filtering, sorting, searching, and pagination must be synchronized with the URL (`useSearchParams`), supporting deep-linking and bookmarking.
- **Affected views**:
  - Patient dashboard requests list: `status`, `page`, `limit`.
  - Patient payments list: `status`, `q`, `page`.
  - Admin dispatch board: `view`, `priority`, `page`.
  - Admin resources: active tab (`?tab=ambulances|hospitals|users|audit`), table filters (`type`, `q`, `role`, `actor`).
  - Public `/hospitals`: `q`, `district`, `sort`.
- **Next.js 16 consideration**: Wrap components reading `useSearchParams()` in `<Suspense>` boundaries to preserve static optimization where appropriate.

### B3. Metadata & Server/Client Component Architecture (High / Mandatory)
- **Requirements**: Server Components by default; per-page `Metadata` (title, description, openGraph) on all public and primary routes.
- **Implementation**:
  - Refactor public routes (`/`, `/about`, `/services`, `/contact`, `/faq`, `/hospitals`, `/login`, `/register`) to Server Components exporting `metadata`.
  - Move interactive stateful forms and dynamic widgets into focused Client Component islands (`ContactForm`, `LoginForm`, `RegisterForm`, `HospitalsClientView`, etc.).
  - Update openGraph and meta descriptions to accurately represent national emergency coverage.

### B4. Role Dashboard Page Coverage (High / Mandatory)
- **Requirements**: At least 18 fully functional pages, including at least 3 pages per role dashboard:
  - Patient / User (3+): `/dashboard` (My Requests), `/dashboard/payments` (Payment History), `/dashboard/profile` (Profile & Settings), plus `/dashboard/requests/new` and `/dashboard/requests/[id]`.
  - Provider / Driver (3): `/driver` (Duty & Active Trips), `/driver/earnings` (Earnings, Shift Stats & Ratings), `/driver/profile` (Driver Profile, Availability & Vehicle).
  - Admin (4): `/admin` (Overview & Charts), `/admin/dispatch` (Dispatch Board), `/admin/resources` (Resources CRUD), `/admin/reports` (Audit Reports & Metrics).
- **Navigation**: Update `nav-config.ts` so driver and admin navigation reflects all pages.

### B6. Form Validation with React Hook Form + Zod (High / Mandatory)
- **Requirements**: All forms must use React Hook Form with Zod schema validation.
- **Implementation**:
  - `login`: convert to `useForm<LoginForm>` with `zodResolver(loginSchema)`.
  - `contact`: convert to `useForm<ContactForm>` with `zodResolver(contactSchema)`.
  - `request wizard`: use React Hook Form + Zod schema for pickup and urgency validation.
  - `admin ambulance form`: convert to React Hook Form + Zod.
  - `admin hospital form`: convert to React Hook Form + Zod.
  - `admin driver creation`: convert to React Hook Form + Zod.
  - `feedback form`: convert to React Hook Form + Zod.
  - `cancel request dialog`: convert to React Hook Form + Zod.

### B7. Optimistic Updates (Medium)
- **Implementation**: Implement TanStack Query `onMutate`, `onError`, `onSettled` cache updates with rollbacks:
  - Driver status toggle (`useUpdateDriverStatus`).
  - Driver trip status progression (`useUpdateRequestStatus`).
  - Request cancellation (`useCancelRequest`).
  - Ambulance status/details update (`useUpdateAmbulance`).

### B8. Specialized Loading Skeletons (`loading.tsx`) (Medium / Mandatory)
- **Implementation**: Add page-specific `loading.tsx` skeletons for:
  - `/hospitals/loading.tsx`
  - `/dashboard/payments/loading.tsx`
  - `/dashboard/requests/new/loading.tsx`
  - `/dashboard/requests/[id]/loading.tsx`
  - `/admin/dispatch/loading.tsx`
  - `/admin/resources/loading.tsx`
  - `/admin/reports/loading.tsx`
  - `/driver/earnings/loading.tsx`
  - `/driver/profile/loading.tsx`

### B9 / A4. Public Hospital Endpoint & Live Data Integration
- **Backend**: NOT done. `hospital.routes.ts` still requires auth on `GET /` and `GET /:id`. Until a public read route exists the frontend falls back to the labelled demo hospitals.
- **Frontend**: Query real backend hospitals directly; remove demo data disclaimer and fallback limitations.

### B5. `next/image` Optimization
- **Implementation**: Adopt `next/image` for avatar graphics, hospital thumbnails, and hero illustration imagery.

### B10 & B11. Role Spotlight & Visual Differentiation
- **Implementation**: Replace duplicate `TripLineDemo` in role spotlight sections with role-specific interactive preview cards (patient request preview, driver trip action preview, dispatcher assignment preview).

---

## 2. Execution Order
1. Implement optimistic updates in `src/lib/hooks.ts`.
2. Implement React Hook Form + Zod for Login, Contact, Request Wizard, Admin Dialogs, Cancel & Feedback.
3. Implement URL State Synchronization (`useSearchParams` with Suspense) across Patient Requests, Payments, Admin Resources tabs & filters, and Hospitals directory.
4. Implement missing pages:
   - `/driver/earnings/page.tsx`
   - `/driver/profile/page.tsx`
   - `/admin/reports/page.tsx`
   - Update `nav-config.ts` and `proxy.ts`.
5. Implement specialized `loading.tsx` skeletons across all data-fetching routes.
6. Refactor public pages into Server Components with metadata and client interactive islands.
7. Integrate `next/image` and role-specific spotlight components.
8. Verify production build (`bun run build`), verify tests, and commit clean changes in stages.
