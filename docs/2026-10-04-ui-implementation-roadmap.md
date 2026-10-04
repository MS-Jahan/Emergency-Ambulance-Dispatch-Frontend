# UI Implementation Roadmap — Modern Redesign

**Date:** 2026-10-04  
**Scope:** Incremental redesign using existing shadcn/ui + new components  
**Goal:** Phased rollout, no breaking changes to backend integration

---

## Phase 1: Landing & Auth (Redesign + Polish)

### New Components

1. **StatCard** (src/components/stat-card.tsx)
   - Props: `icon`, `value` (big), `label`, `accentColor`, `trend?` (up/down arrow)
   - No shadow, 1px border, left border accent (8px) in accent color
   - Padding 24px, icon 28px top-left
   - Mobile: full width, desktop: responsive grid (4 / 2 / 1 col)

2. **FeatureCard** (src/components/feature-card.tsx)
   - Props: `icon`, `title`, `description`, `accentSide` (left|top), `accentColor`
   - Left border 4px colored or top border (variant)
   - Card, 1px border, padding 20px
   - Icon 24px, title 16px bold, desc 14px gray

3. **HeroSection** (src/components/hero-section.tsx)
   - Grid 2 cols (mobile: 1), gap 48px
   - Left: headline, subhead, CTA button (56px)
   - Right: Lottie animation or SVG mockup (ambulance request flow)
   - Background: subtle gradient (Gauze → Paper)

4. **MotionCard** (src/components/motion-card.tsx)
   - Wraps shadcn Card, adds fade-in + slide-up on mount
   - Props: `delay`, `duration` (ms)
   - CSS animation, no JavaScript

### Page Updates

**src/app/page.tsx** (Landing)
```
Layout:
- Navigation (top): logo + nav links + auth buttons (sticky, 60px)
- Hero section (viewport height)
- Trust/stats section (4 stat cards)
- How-it-works section (4 step flow with SVG arrows)
- Features grid (6 cards, 2×3 → 1×6 mobile)
- Role spotlights (3 cards, alternating layout)
- CTA section (headline + 2 buttons)
- Footer (4 cols, links)

Styling:
- Use MotionCard for staggered entrance
- StatCard for KPIs
- FeatureCard for features grid
- Gradient backgrounds on hero, CTA
- Max-width 1280px, centered, px 16-24
```

**src/app/login/page.tsx** (Redesign)
```
Layout:
- Grid 2 cols (mobile: 1 col)
- Left (50%): Hero card
  - Icon 200px emoji or SVG
  - Headline: "Ambulance in seconds"
  - Subhead: "Emergency dispatch 24/7"
  - Background: teal gradient or solid teal with white text
- Right (50%): Form card
  - Heading: "Sign in to your account"
  - Email input (48px, left icon: mail)
  - Password input (48px, left icon: lock)
  - Forgot password link (right, 12px, gray)
  - Submit button (full width, 48px, Signal Red, rounded 6px)
  - Divider: "or"
  - Demo section:
    - Heading: "Try demo account"
    - 3 buttons (mobile: stacked):
      - Patient: Oxygen Teal, 👤, "Patient"
      - Driver: Amber, 🚗, "Driver"
      - Admin: Ink, 👨‍💼, "Admin"
      - Each 56px, rounded 6px, no shadow
  - Sign up link (bottom, "Don't have…")

Styling:
- Card on light bg, shadow 0 1px 3px rgba(black, 0.1)
- Inputs: 1px hairline border, 8px padding
- Buttons: no shadow, click ripple via Tailwind
```

**src/app/register/page.tsx** (Mirror of login)
```
Same layout as login, but form has:
- Name input
- Email input
- Password input + strength meter (Weak/Ok/Strong, color-coded)
- Phone input (optional)
- Checkbox: "I agree to terms"
- Submit: "Create account"
- Sign in link (bottom)
```

---

## Phase 2: Patient Dashboard (Redesign Core)

### New Components

1. **RequestCard** (src/components/request-card.tsx)
   - Used for: request list, dispatch board rows
   - Props: `request`, `onClick?`, `showMap?`, `compact?`
   - Layout:
     - Left (60%): status dot (8px, colored) + address (2 lines, bold + time)
     - Middle (25%): ambulance plate (if assigned) + driver name
     - Right (15%): trip line (compact, 120px)
   - Hover: border brightens, shadow lifts, cursor pointer
   - No background, 1px border, padding 16px, gap 12px

2. **QuickActionButton** (src/components/quick-action-button.tsx)
   - Full width, 56–64px, prominent
   - Props: `label`, `icon`, `onClick`, `loading`, `disabled`, `variant` (primary|outline)
   - Primary: Signal Red bg, white text, ripple
   - Outline: transparent, ink border, ink text

3. **EmptyState** (src/components/empty-state.tsx)
   - Props: `icon`, `heading`, `description`, `action?` (button + label)
   - Center-aligned, padding 40px
   - Icon 120px, heading 20px bold, desc 14px gray
   - Action button (outline, 48px)

4. **RequestWizardStep** (src/components/request-wizard-step.tsx)
   - Props: `stepNumber`, `totalSteps`, `heading`, `children`
   - Top: Progress bar (4–5px, colored segments)
   - Heading: "Step 1 of 3" + title
   - Content area
   - Bottom: Back/Next buttons (sticky on mobile, inline on desktop)

### Page Updates

**src/app/dashboard/page.tsx** (Home)
```
Layout:
- Hero card (full width, no border):
  - Heading: "You're safe. We're here 24/7."
  - Subhead: "Request an ambulance in seconds."
  - Button: "Request Now" (Signal Red, 56px)
  - Background: teal gradient or solid teal with white text
  - Padding 40px

- Quick stats row (4 cards, mobile: 2×2):
  - Total requests (StatCard)
  - Completed trips (StatCard)
  - Avg wait time (StatCard)
  - Rating (StatCard, stars)
  - Each 1px border, no shadow, 24px padding

- Recent requests section:
  - Heading: "Recent requests" (bold, 18px)
  - List of RequestCard components
  - If empty: EmptyState ("No requests yet…")
  - Hover on card: lifts, border brightens
  - Click: navigate to /dashboard/requests/[id]

Styling:
- Max-width 1040px, centered
- Padding 16–24px
- Gap 24px between sections
```

**src/app/dashboard/requests/new/page.tsx** (Wizard)
```
Layout:
- Modal or full-page (mobile: full page, desktop: 50% modal)
- RequestWizardStep component wrapper

Step 1: Location
- Map (full viewport or 60% width)
- Top-left: Step indicator + "Where are you?"
- Search box (transparent bg, white text, on map)
- Bottom: "Next" button (disabled if no pin)
- Gesture: tap map → pin drops, address fills search, next enabled

Step 2: Priority & Hospital
- Card layout
- Heading: "How urgent?"
- 3 radio buttons (full width, 48px each):
  - CRITICAL (Signal Red dot, text, "Life-threatening")
  - HIGH (Amber dot, "Serious but stable")
  - NORMAL (Teal dot, "Non-emergency")
- Selected: teal border, 4px, subtle bg tint
- Dropdown: "Select hospital" (shadcn Select)
- Fare estimate: "$15–60 depending on ambulance type" (small, gray)
- Buttons: "Back" (outline) | "Review" (Signal Red, 56px)

Step 3: Review
- Summary card:
  - Map thumbnail (200×200)
  - Address (2 lines, bold)
  - Priority badge (color-coded)
  - Hospital name
  - Fare ($X)
  - Note: "Pay after arrival"
- Buttons: "Back" | "Confirm" (Signal Red, 56px)
- On submit: loading spinner in button, disable both buttons
- On success: toast, navigate to /dashboard/requests/[newRequestId]

Styling:
- MotionCard fade-in for each step
- Gradient on map (top-left corner logo/branding)
- Inputs: 48px min height, 1px hairline border
```

**src/app/dashboard/requests/[id]/page.tsx** (Detail)
```
Layout:
- Sticky header (top 60px, light shadow):
  - Trip line (horizontal, full width, 80px height, centered)
  - Dot pulse animation on current status
  - Time elapsed (gray, small)
  - Status badge

- Info section (3 columns mobile: stacked):
  - Card 1: Location (pin icon, address, map thumbnail 200×200)
  - Card 2: Hospital (building icon, name, address)
  - Card 3: Priority (badge large, color-coded)

- Driver section (if assigned):
  - Heading: "Your driver"
  - Card:
    - Avatar (48px circle, initials or image)
    - Name (bold)
    - Rating (⭐ stars)
    - Phone (button: "Call" with phone icon)
    - Navigate button (full width, 48px, map icon)

- Map section (if assigned):
  - Height 300px (desktop) / 200px (mobile)
  - Ambulance location + patient location + route
  - Zoom buttons (+ / −)

- Status timeline (collapsible, DetailedTimeline component):
  - Latest first (reverse chronological)
  - Each row: time, status, actor, note

- Actions (sticky footer mobile, inline desktop):
  - If PENDING: "Cancel" (outline, red text, 48px)
  - If COMPLETED: "Pay now" (teal, 48px) + "Leave feedback" (link)

Styling:
- MotionCard fade-in for sections
- Map with markers, no 3D
- Trip line pulse animation on current dot
```

**src/app/dashboard/payments/page.tsx** (Payments)
```
Layout:
- Heading: "Payment history"
- Filter bar (desktop: inline, mobile: stacked):
  - Status dropdown (All / Pending / Paid / Failed)
  - Search by trip ID (input)
- List of payment cards (RequestCard variant):
  - Left: Trip ID (mono, 12px, gray) + date (14px, gray)
  - Middle: Amount (big, bold, color-coded: teal if paid, amber if pending)
  - Right: Status badge + action button (Pay / Receipt / Retry)
- If empty: EmptyState

Styling:
- Payment card slightly condensed (16px padding)
- Amount in color (not text, background)
```

**src/app/dashboard/profile/page.tsx** (Profile)
```
Layout:
- Avatar section (centered):
  - Avatar 96px (circle)
  - Upload button (small, overlay on bottom-right)
- Form card (max-width 400px, mobile: full width):
  - Name (readonly, input 48px)
  - Email (readonly, input 48px)
  - Phone (readonly, input 48px)
- Preferences card:
  - Dark mode toggle (shadcn Switch)
  - Notifications toggle
- Session card:
  - "Logged in as {email}"
  - Logout button (outline, red text, 48px)

Styling:
- Cards stacked, gap 24px
- Readonly inputs: gray bg, no border
```

---

## Phase 3: Driver Dashboard (Redesign Core)

### New Components

1. **DriverStatusToggle** (src/components/driver-status-toggle.tsx)
   - Props: `status`, `onChange`, `loading`
   - Large switch (shadcn Switch, 64px wide, 32px tall)
   - Color: green (online), gray (offline)
   - Subtext: "Last updated: X min ago"

2. **DriverActionButton** (src/components/driver-action-button.tsx)
   - Props: `status`, `onClick`, `loading`
   - Full width, 64px, dominates page
   - Color: Signal Red, white text
   - Text: "Start driving…", "Mark arrived…", etc. (changes per status)
   - Ripple on press, loading spinner during request

3. **TripCard** (src/components/trip-card.tsx)
   - Props: `trip`, `isActive`, `onCall`, `onNavigate`
   - If active: big, centered
   - If history: compact row
   - Active: 75% viewport width (desktop), full (mobile)

### Page Updates

**src/app/driver/page.tsx** (Duty)
```
Layout:
- Top bar (60px, sticky):
  - Logo (left)
  - Ambulance info: plate + type (center)
  - Settings icon (right)

- Main area (centered, full height):
  - DriverStatusToggle (top center)
  - Subtext: "You're Online"

  If online + assigned trip:
  - TripCard (big, 75% viewport):
    - Patient info: name (bold), address (2 lines)
    - Priority badge (CRITICAL/HIGH/NORMAL, color-coded)
    - Trip line (horizontal, 100px height, status labeled)
    - Current step pulse animation
    - Button row (2 buttons, full width, stacked mobile):
      - "Call patient" (48px, outline, phone icon)
      - "Navigate" (48px, Oxygen Teal, map icon → geo: link)
    - DriverActionButton (full width, 64px, Signal Red)
      - Text depends on status (e.g., "Start driving to patient")

  If online but no trip:
  - Empty card:
    - Icon: 🚗 (120px)
    - Heading: "No active trip"
    - Subtext: "You'll get a notification when assigned."
    - Refresh button (outline, 48px)

  If offline:
  - Message: "You're Offline. Toggle Online to receive trips."
  - Refresh button

- Collapsible history (bottom, "Today's trips"):
  - List of past trips (rows, compact)
  - Each: time, patient, status (COMPLETED/CANCELLED), link

Styling:
- Full viewport, no scrolling until history
- Dark mode on by default (night shift)
- Big touch targets (48–64px min)
- Ripple effect on button press
```

---

## Phase 4: Admin Dashboard (Redesign Core)

### New Components

1. **AdminSidebar** (src/components/layouts/admin-sidebar.tsx)
   - Props: `activePage`, `onNavigate`
   - Left 240px (desktop), collapsed icon bar (tablet), hamburger menu (mobile)
   - Nav items: Overview, Dispatch, Resources, Audit
   - Active: teal bg, white text, underline
   - Bottom: User avatar + name + settings icon

2. **AdminTopBar** (src/components/layouts/admin-top-bar.tsx)
   - Right of sidebar, full width
   - Left: Page title + breadcrumb
   - Center: Search box (placeholder: "Search…")
   - Right: User dropdown

3. **RequestRow** (src/components/request-row.tsx)
   - Compact row card (admin dispatch)
   - Props: `request`, `onClick`, `onAssign?`
   - Left: priority badge + patient + address
   - Middle: wait time
   - Right: ambulance/driver or "Assign" button

4. **RequestDetailSheet** (src/components/sheets/request-detail-sheet.tsx)
   - Side sheet (40% width desktop, full mobile)
   - Props: `requestId`, `onClose`, `onAssign`
   - Full request detail (address, priority, patient phone, hospital)
   - Nearby ambulances list (if not assigned)
   - Each: plate, type, distance, "Assign" button
   - Loading state while fetching

### Page Updates

**src/app/admin/page.tsx** (Overview Dashboard)
```
Layout:
- Top: KPI section (4 cards, responsive grid)
  - StatCard × 4:
    1. Users (icon 👥, teal accent)
    2. Requests today (icon 📋, red if > threshold else teal)
    3. Ambulances available (icon 🚗, teal)
    4. Revenue today (icon 💵, teal)
  - Each: 1px border, no shadow, padding 24px, left accent border 8px

- Middle: Charts section (2 columns, mobile: stacked)
  - Left (50%): Area chart (requests per day, last 14d)
    - Recharts, Oxygen Teal fill, smooth line, no points
    - Hover: tooltip (date, count)
  - Right (50%): Donut chart (requests by status)
    - Colors: Amber (PENDING), Amber (ASSIGNED), Teal (EN_ROUTE_*), Oxygen (COMPLETED), Signal Red (CANCELLED)
    - Center: total count, label "Total requests"
    - Legend below

- Bottom: Pending requests preview
  - Heading: "Recent pending requests"
  - List of RequestRow cards (top 5)
  - Each: priority + patient + address + wait time + assign button
  - Hover: lift, border brightens
  - Click: RequestDetailSheet opens

Styling:
- Dark mode by default
- Max-width 1400px, centered
- Padding 24px
- Gap 24px between sections
- Charts: teal/amber/red palette
```

**src/app/admin/dispatch/page.tsx** (Dispatch Board)
```
Layout:
- Full viewport, 3 equal columns (mobile/tablet: stacked)
- Column headers (sticky): "Pending (4)", "In Progress (5)", "Completed (12)"
- Each column: scrollable card stack, gap 12px

- Cards (RequestRow style):
  - Priority badge (top-left, Signal Red/Amber/Teal)
  - Patient name (bold, 14px)
  - Address (gray, 12px, 2 lines, truncate)
  - Waiting (icon ⏱ + "5 min", gray, small)
  - Footer: ambulance plate + driver initials (24px avatar)
  - Hover: border brightens, shadow lifts, cursor pointer
  - Click: RequestDetailSheet opens (side sheet)

- RequestDetailSheet (40% desktop, full mobile):
  - Close button (X, top-right)
  - Request ID (mono, gray)
  - Patient info: name, phone, address
  - Current hospital (if assigned) or dropdown to select
  - Nearby ambulances (if not assigned):
    - Subheading: "Nearby ambulances"
    - List: plate (bold), type (badge), distance (km), "Assign" button
    - Sorted by distance
  - Or (if assigned): Show ambulance + driver, "Reassign" button
  - Buttons: "Reassign" (outline) | "Cancel request" (red text, outline)
  - On assign: loading → success toast → card moves to next column

Styling:
- Dark mode by default
- Cards: 1px border, no shadow, padding 16px
- Hover ripple on cards
- Column headers: bold, ink color (dark mode)
- Scrollable columns with overflow-y auto
```

**src/app/admin/resources/page.tsx** (Resource Tabs)
```
Layout:
- Tabs (shadcn Tabs):
  - Tab 1: "Ambulances (24)"
  - Tab 2: "Hospitals (3)"
  - Tab 3: "Users (2.4k)"
  - Tab 4: "Audit logs"

Tab 1: Ambulances
- Header: "Ambulances (24 total)"
  - Button: "Add ambulance" (48px, Signal Red)
  - Filter: Type dropdown (All / BASIC / ICU / CARDIAC)
- Table (cards per row):
  - Plate (mono, bold)
  - Type (badge, color-coded)
  - Status (badge: AVAILABLE=teal, ON_TRIP=amber, MAINTENANCE=red)
  - Home hospital (gray, small)
  - Actions: Edit (pencil, outline button) | Delete (trash, red)
  - Hover: border brightens
  - Click row: Detail modal (edit form, reassign to driver)

Tab 2: Hospitals
- Header: "Hospitals (3 total)"
  - Button: "Add hospital" (48px, Signal Red)
- Table (cards per row):
  - Name (bold)
  - Address (2 lines, gray)
  - Phone (clickable, phone icon)
  - Ambulances here (count, small)
  - Actions: Edit | Delete
  - Click row: Detail modal (edit form)

Tab 3: Users
- Header: "Users (2.4k total)"
  - Filter: Role dropdown (All / Patients / Drivers / Admins)
  - Search: input (name/email)
- Table (cards per row):
  - Name (bold)
  - Email (gray)
  - Role (badge, color-coded)
  - Joined (date, gray, small)
  - Actions: View | Promote to driver (if PATIENT) | Delete
  - Hover: border brightens
  - Click "Promote": Dialog opens (confirm + license number input)

Tab 4: Audit logs
- Header: "Audit logs"
  - Filter: Type dropdown (All / Request / Ambulance / Driver / User)
  - Date picker
- Infinite scroll list (or pagination):
  - Each row: time (relative, gray), actor (name + role badge), action (verb), request (if relevant, link), details (gray, 1 line, truncate)
  - Hover: subtle bg tint
  - Click request link: RequestDetailSheet opens

Styling:
- Dark mode
- Table rows as cards, not thead/tbody
- Responsive: card layout on mobile, table on desktop
- 1px borders, no shadows
```

---

## Implementation Order & Effort

| Phase | Tasks | Components | Pages | Est. Commits | Days |
|-------|-------|-----------|-------|--------------|------|
| 1 | Landing redesign | StatCard, FeatureCard, HeroSection, MotionCard | page, login, register | 3 | 1 |
| 2 | Patient core | RequestCard, QuickActionButton, EmptyState, RequestWizardStep | dashboard/*, payments, profile | 5 | 2 |
| 3 | Driver | DriverStatusToggle, DriverActionButton, TripCard | driver | 2 | 0.5 |
| 4 | Admin | AdminSidebar, AdminTopBar, RequestRow, RequestDetailSheet | admin/*, dispatch, resources | 5 | 2 |
| 5 | Polish | Dark mode, responsive, animations | — | 3 | 1 |
| **Total** | | | | **18–20** | **6–7** |

---

## Git Commit Strategy

**Phase 1:**
- Commit 1: `feat: landing page hero, trust stats, features grid`
- Commit 2: `feat: redesigned login and register pages`

**Phase 2:**
- Commit 3: `feat: patient dashboard home with quick stats and request list`
- Commit 4: `feat: request wizard with map picker (3 steps)`
- Commit 5: `feat: request detail page with live tracking and status timeline`
- Commit 6: `feat: payments and profile pages redesigned`

**Phase 3:**
- Commit 7: `feat: driver duty page with status toggle and action button`

**Phase 4:**
- Commit 8: `feat: admin overview dashboard with KPI cards and charts`
- Commit 9: `feat: dispatch board with 3-column layout and assignment flow`
- Commit 10: `feat: admin resource tabs (ambulances, hospitals, users, audit)`

**Phase 5:**
- Commit 11: `feat: dark mode on admin and driver pages, responsive polish`
- Commit 12: `feat: animations, microinteractions, accessibility`

---

## Testing Before Each Commit

```bash
# Per task:
bun run lint         # ESLint passes
tsc --noEmit         # TypeScript strict
bun run build        # Next.js build succeeds
# Manual:
bun run dev          # Page renders, no console errors
# Mobile: DevTools 375px width, responsive checks
# Dark mode: toggle in UI, colors flip correctly
```

---

## Known Trade-offs

- **No new backend endpoints:** Admin improvements work with existing `/admin/*` routes.
- **No E2E tests:** Scope remains tsc + lint + build gate.
- **Images/icons:** Lucide React icons only (no custom illustrations yet); emoji used as placeholders.
- **Animations:** Fade-in + slide-up on load, no continuous motion (accessibility + performance).
- **Map:** Leaflet + OpenStreetMap (no Mapbox key required; free).
