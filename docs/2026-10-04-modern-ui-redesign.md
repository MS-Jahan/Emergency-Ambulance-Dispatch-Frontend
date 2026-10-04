# Modern UI Redesign — Dispatch Frontend

**Date:** 2026-10-04  
**Scope:** Landing, home, auth, patient, driver, admin dashboards  
**Goal:** Cool, modern look using shadcn/ui + grooved layouts + dark mode default for admin

---

## Design Direction

**Vibe:** Clinical efficiency meets modern product. Motion when it means something. Dark mode admin (night shift workers), light mode public pages.

**Palette (unchanged but used better):**
- Signal Red (#E0312B) → emergencies, critical CTAs only
- Oxygen Teal (#0E8C86) → success, available, complete
- Amber (#E9A21B) → pending, assigned, warning
- Slate (#5A6B7B) → secondary text, dividers
- Ink (#0D1B2A) / Console (#0A141F) → text, surfaces
- Gauze (#F2F5F7) / Paper (#FFFFFF) → backgrounds
- Hairline (#D8DFE5) → 1px borders

**Typography:** Schibsted Grotesk throughout, no fallback decorative typefaces. Use weight + spacing, not multiple families.

---

## Landing Page Redesign

**Current:** Simple hero, 3-column features, footer CTA.  
**Issue:** Flat, looks like template.  
**Goal:** Modern SaaS landing with motion, depth, credibility.

### New Sections

1. **Hero (full viewport)**
   - Left: Headline "Ambulance in seconds" + subhead. CTA button (Signal Red, 56px tall).
   - Right: Animated ambulance request flow (Lottie or CSS). Pulse the trip line dots as demo.
   - Background: Subtle gradient (Gauze → Paper), no texture.

2. **Trust / Social Proof**
   - Row of stats: "15k+ requests", "99.2% on-time", "24/7 active"
   - Stat cards: big number, small label, metric icon (Lucide).
   - No animation, just clean vertical rhythm.

3. **How It Works (Visual Flow)**
   - 4 steps: Location → Dispatch → En Route → Delivered.
   - Each step: icon (Lucide), headline, 1-line description.
   - Between each: arrow or subtle line flow.
   - On scroll: cards fade + slide in (once per page load, not annoyingly).

4. **Features Grid (shadcn Cards)**
   - 6 features in 2×3 grid (3 columns on desktop, 1 on mobile).
   - Each card: icon, headline, 2-line description, border-left accent color (teal for available, amber for tracking, red for emergency).
   - No shadows, 1px hairline border, padding 24px, gap 16px.

5. **Role Spotlight (3 Sections)**
   - **For Patients:** "Request & Track"  
     Card: icon + headline + benefits list (no bullets, just checks ✓). Teal accent.
   - **For Drivers:** "Work Flexibly"  
     Card: icon + headline + benefits. Amber accent.
   - **For Admin:** "Dispatch Smartly"  
     Card: icon + headline + benefits. Ink accent.
   - Alternate layout: card on left, screenshot on right (mobile screenshot for patient, in-app UI mockup for driver, dashboard for admin).

6. **CTA Section (Before Footer)**
   - Center: "Ready to save lives?"
   - 2 buttons: "Request now" (Signal Red) + "Login" (outline).
   - Subtext: "No credit card required. Available 24/7."

7. **Footer**
   - 4 columns: Product (link to features), Company (about, contact), Legal (privacy, terms), Social (icons only, no text).
   - Bottom: Copyright + tagline.

---

## Auth Pages Redesign (Login / Register)

**Current:** Centered card, forms below demo buttons.  
**Issue:** Boring, disconnects login from product.  
**Goal:** Contextual, motion, better hierarchy.

### Login Page

- **Left (50% on desktop, full mobile):** Hero card showing "Ambulance in seconds" + illustrated ambulance (SVG or emoji large 200px).
- **Right:** Login form in card.
  - Headline: "Sign in to your account"
  - Email + Password inputs (shadcn Input with left icon, 48px min height).
  - "Forgot password?" link (gray, right-aligned, small).
  - Submit button: full width, 48px, Signal Red on hover.
  - Divider: "or"
  - Demo login section:
    - "Try with demo account" heading.
    - 3 buttons in row (mobile: stacked):
      - Patient (Oxygen Teal) with 👤 + "Patient"
      - Driver (Amber) with 🚗 + "Driver"
      - Admin (Ink) with 👨‍💼 + "Admin"
    - Each 56px height, rounded corners (6px), no drop shadow.
  - Sign up link at bottom: "Don't have an account?" + link in teal.

### Register Page

- Mirror layout (left hero, right form).
- Form steps: Name → Email → Password (with strength meter: weak/ok/strong, color-coded).
- Phone (optional).
- Checkbox: "I agree to terms" + link.
- Submit: "Create account".
- Sign in link at bottom.

---

## Patient Dashboard Redesign

**Current:** List of requests, cards with minimal info.  
**Issue:** Looks like a spreadsheet. Lacks urgency.  
**Goal:** Clarity + visual hierarchy + quick actions.

### Dashboard Shell

- **Top bar:** Logo, user name + avatar (rounded, 32px), settings icon.
- **Mobile:** Bottom tab bar (Home, Requests, Payments, Profile) — each 4 tabs, 48px from bottom.
- **Desktop:** Left sidebar (120px, sticky), logo, 4 nav items + settings at bottom.

### Dashboard Home Page

- **Hero card (full width):** "You're safe. We're here 24/7."  
  Subheading: "Request an ambulance in seconds."  
  Big button: "Request Now" (Signal Red, 56px).

- **Quick stats row:**
  - Total requests (number big, label small)
  - Completed trips (number, label, icon check)
  - Average wait time (minutes, label)
  - Feedback rating (stars, label)
  - Use StatCard component: no shadow, 1px border, compact layout, icon top-left (28px).

- **Recent requests section:**
  - Headline: "Recent requests"
  - Table rows (not spreadsheet-like):
    - Each row is a Card, 1px border, padding 16px, gap between.
    - Left: status dot (small, 8px) + address (2 lines: street + time).
    - Middle: ambulance (if assigned) + driver name (if assigned).
    - Right: trip line (compact, horizontal, 120px wide).
    - Hover: slight lift, border brightens, cursor pointer → detail page.
  - If no requests: empty state (icon + "No requests yet. When you request an ambulance, they'll show here.").

### New Request Wizard

**Step 1: Location**
- Map full-screen (or 60% on desktop, 100% on mobile).
- Top-left: "Step 1 of 3" + "Where are you?"
- Bottom-left: Search box (transparent bg, white text, placeholder gray).
- Button at bottom: "Next" (disabled if no location picked).
- Gesture: tap map or search → pin drops, address fills in, next button enabled.

**Step 2: Priority & Hospital**
- Card (mobile: full screen, desktop: modal or side sheet).
- Headline: "How urgent?"
- Radio buttons (3 rows, each full width, 48px min height):
  - CRITICAL (Signal Red dot, text) — "Life-threatening emergency"
  - HIGH (Amber dot) — "Serious but stable"
  - NORMAL (Teal dot) — "Non-emergency"
- Selected row: teal border, slight background tint.
- Below: "Select hospital (optional)" — dropdown or combobox (shadcn Select).
- Show estimated fare (small, gray): "$15–60 depending on ambulance type"
- Buttons: "Back" (outline) | "Review" (Signal Red).

**Step 3: Review**
- Summary card:
  - Location (map thumbnail 200x200, address, time).
  - Priority (badge: CRITICAL/HIGH/NORMAL with color).
  - Hospital (name, address).
  - Estimated fare (with warning: "Pay after arrival").
- Buttons: "Back" | "Confirm & Request" (Signal Red, 56px).
- On submit: loading spinner in button, disable during request.
- On success: navigate to detail page, toast "Request created!"

### Request Detail Page

- **Header card (sticky on mobile):**
  - Trip line (horizontal, full width, 80px height). Dots pulse on current status.
  - Time elapsed (gray text, small): "Waiting for ambulance for 3 min"
  - Status badge: PENDING / ASSIGNED / EN_ROUTE_PICKUP / etc.

- **Info section:**
  - Heading: "Your request"
  - 3 cards (mobile: stacked, desktop: 1 row):
    - Card 1: Location (pin icon, address 2 lines, small map thumbnail).
    - Card 2: Hospital (building icon, hospital name, address).
    - Card 3: Priority (circle badge with color).

- **Driver section (if assigned):**
  - Heading: "Your driver"
  - Card with driver avatar (48px circle), name, rating (stars), phone (call button).
  - "Tap to call" button (full width, 48px, outline, phone icon).

- **Map section (if assigned):**
  - Small map showing ambulance location + patient location + route.
  - Zoom buttons (+ / −).
  - "Navigate" button (geo: link to patient location).

- **Status timeline (collapsible):**
  - "Trip timeline" heading.
  - List of status changes (time, status, note if any).
  - Reverse chronological (latest first).

- **Actions (footer or floating):**
  - If PENDING: "Cancel" button (outline, red text).
  - If COMPLETED: "Pay now" button (Oxygen Teal) + "Leave feedback" link.

### Payments Page

- Heading: "Payment history"
- Filter: Status dropdown (All / Pending / Paid / Failed).
- Table (cards per row):
  - Trip ID (short code, mono font).
  - Trip date (small, gray).
  - Amount (big, teal if paid, amber if pending).
  - Status badge (color-coded).
  - Action: "Pay" (if PENDING), "Receipt" (if PAID), "Retry" (if FAILED).
- If no payments: empty state.

### Profile Page

- Card sections:
  - **Basic info:** Name, email (readonly), phone (readonly).
  - **Avatar:** Current avatar (48px), upload button.
  - **Preferences:** Dark mode toggle (global), notifications toggle.
  - **Session:** "Logged in as…" + Logout button (red text, outline).

---

## Driver Dashboard Redesign

**Current:** One page with toggle + trip card.  
**Goal:** Big, glanceable UI. One action button dominates.

### Layout

- **Top bar:** Logo, driver name + ambulance plate (e.g., "DHK-1001"), settings.
- **Full screen, centered.**

### Status Toggle (Top)

- Heading: "You're {Online | Offline}"
- Large toggle switch (shadcn Switch, 64px wide, 32px tall).
- Color: Green when online, Gray when offline.
- Subtext: "Last updated: 2 min ago"

### Current Trip Card (If Assigned)

- Big card (75% viewport on desktop, full on mobile).
- Heading: "Your current trip"
- Patient info: Name, address (2 lines), priority badge (Signal Red if CRITICAL, etc.).
- Trip line: Horizontal, 100px tall, status dots + labels.
- Current step highlighted: pulse animation on dot.
- Buttons row (full width, stacked on small screens):
  - Left: "Call patient" (phone icon, 56px height, outline).
  - Right: "Navigate" (map icon, 56px height, Oxygen Teal, opens geo: link).
- Status action button (FULL WIDTH, 64px, dominates bottom):
  - State depends on current status:
    - ASSIGNED: "Start driving to patient"
    - EN_ROUTE_PICKUP: "Mark arrived at pickup"
    - PICKED_UP: "Start driving to hospital"
    - EN_ROUTE_HOSPITAL: "Mark arrived at hospital"
  - Color: Signal Red background, white text, ripple on press.
  - On press: loading spinner, disable, then success toast.

### If No Trip

- Big empty card:
  - Icon: 🚗 (120px)
  - Heading: "No active trip"
  - Subtext: "You'll get a notification when assigned a patient."
  - Button: "Refresh" (outline, 48px).

### Trip History (Collapsible)

- Heading: "Today's trips"
- List of completed/cancelled trips (simple rows):
  - Time, patient, status (COMPLETED/CANCELLED), quick link to detail.

---

## Admin Dashboard Redesign

**Current:** Stats cards, donut chart, request preview.  
**Goal:** Command center. Dark mode default. Visual hierarchy.

### Overall Layout

- **Left sidebar (240px on desktop, collapsed on mobile):**
  - Logo (32px).
  - Nav items: Overview (chart icon), Dispatch (radio icon), Resources (box icon), Audit (list icon).
  - Active item: teal background, white text.
  - User at bottom: avatar (32px) + name + settings icon.

- **Top bar:** Page title, breadcrumb (if nested), search bar (placeholder: "Search requests, drivers, ambulances"), user dropdown.

- **Main area:** Full viewport, scrollable, grid-based layout.

### Overview Page

- **KPI Section (top):**
  - 4 columns (3 on tablet, 1 on mobile):
    - **Users:** Big number (2.4k), label "Total users", icon 👥, border-left Teal.
    - **Requests:** Big number (156), label "Today", icon 📋, border-left Signal Red if > threshold, else Teal.
    - **Ambulances:** Big number (24), label "Available: 18", icon 🚗, border-left Teal.
    - **Revenue:** Big number ($4.2k), label "Today", icon 💵, border-left Oxygen Teal.
  - Each card: no shadow, 1px border, padding 24px, gap 16px text-image.

- **Charts Section (middle):**
  - Left (50%): Requests per day (area chart, last 14 days, Recharts).
    - X-axis: date labels.
    - Y-axis: count.
    - Area fill: teal gradient.
    - Smooth line, no points visible, hover tooltip.
  - Right (50%): Status donut (PENDING, ASSIGNED, EN_ROUTE, COMPLETED, CANCELLED).
    - Colors: amber, amber, teal, oxygen, red (respectively).
    - Center text: total count big, label "Total requests".
    - Legend below.

- **Recent Pending Requests (bottom):**
  - Table-like rows (cards):
    - Left: priority badge (CRITICAL/HIGH/NORMAL) + patient name + address.
    - Middle: time waiting + ambulance/driver (if assigned).
    - Right: assign button (outline, teal) or status badge (if already assigned).
  - Hover: subtle lift, row becomes clickable → dispatch detail sheet.

### Dispatch Board Page

- **Full viewport layout:**
  - 3 equal columns on desktop, stacked on mobile/tablet.
  - Column headers: "Pending (4)", "In Progress (5)", "Completed (12)" — bold, ink text.

- **Each column: scrollable card stack**
  - Cards are mini-request cards:
    - Top: priority badge (Signal Red for CRITICAL, Amber for HIGH, Teal for NORMAL).
    - Name: patient name (bold, 14px).
    - Address: gray, 12px, 2 lines max, truncate.
    - Waiting: "Waiting 5 min" (small, gray, clock icon).
    - Footer: ambulance plate (if assigned) + driver initials (if assigned, small avatar 24px).
    - Hover: border brightens, shadow, cursor pointer.
    - Click: side sheet opens showing full detail + nearby ambulance list.

- **Side sheet (on card click):**
  - Close button (top-right, X icon).
  - Heading: "Request detail" + request ID.
  - Patient info: name, phone (call button), address.
  - Ambulance selector (if not assigned):
    - "Nearby ambulances" subheading.
    - List of ambulances with distance (e.g., "DHK-1001 (BASIC) — 0.8 km away").
    - Each row: plate + type + distance + assign button.
    - On assign: loading → success toast → card moves to "In Progress" column.
  - Or (if assigned): Show current ambulance + driver + option to reassign.
  - Buttons: "Reassign" (outline) | "Cancel request" (red text, outline).

### Resources Tabs (Ambulances / Hospitals / Users / Audit)

#### Ambulances Tab

- **Header row:**
  - Heading: "Ambulances (24 total)"
  - "Add ambulance" button (Signal Red, 48px).
  - Filter: Type dropdown (All / BASIC / ICU / CARDIAC).

- **Table (cards per row):**
  - Plate (mono, bold).
  - Type (badge: color-coded).
  - Status (badge: AVAILABLE=teal, ON_TRIP=amber, MAINTENANCE=red).
  - Home hospital (small, gray).
  - Actions: Edit (pencil icon, outline button) | Delete (trash, red text).
  - Row click: full detail modal (plate, type, status, hospital, assign to driver if available).

#### Hospitals Tab

- **Header row:**
  - Heading: "Hospitals (3 total)"
  - "Add hospital" button.

- **Table:**
  - Name (bold).
  - Address (2 lines, gray).
  - Phone (clickable, phone icon).
  - Ambulances based here (count).
  - Actions: Edit | Delete.

#### Users Tab

- **Header row:**
  - Heading: "Users (2.4k total)"
  - Filter: Role dropdown (All / Patients / Drivers / Admins).
  - Search box (name/email).

- **Table:**
  - Name (bold).
  - Email.
  - Role (badge: color-coded).
  - Joined (date, small, gray).
  - Actions: View | Promote to driver (if PATIENT) | Delete.

#### Audit Logs Tab

- **Header row:**
  - Heading: "Audit logs"
  - Filter: Type dropdown (All / Request / Ambulance / Driver / User).
  - Date picker.

- **Table (infinite scroll or paginated):**
  - Time (relative: "2 min ago").
  - Actor (name + role badge).
  - Action (verb: "assigned", "cancelled", "updated status").
  - Request (if relevant, link).
  - Details (small gray text, max 1 line, truncate).

---

## Component Palette (shadcn/ui Usage)

**New components to add:**
- `Card` — all data containers (already exist)
- `Badge` — status, priority, role (already exist)
- `Button` — all CTAs, variants: primary (Signal Red), secondary (outline), ghost
- `Input` — search, forms (already exist)
- `Select` — dropdowns (already exist)
- `Dialog` — modals for add/edit
- `Sheet` — side panels (dispatch detail, request edit)
- `Tabs` — admin resource tabs (already exist)
- `Table` → custom: cards instead of thead/tbody on mobile
- `Skeleton` — loading states on data pages
- `Tooltip` — hover hints on abbreviated text
- `Progress` — password strength, upload progress
- `Switch` — driver online/offline toggle, settings

**New hooks/utilities:**
- `useLocalStorage` — persist sort/filter prefs
- `useDebounce` — search input throttling
- `useIntersectionObserver` — infinite scroll audit logs
- `useClipboard` — copy request ID, etc.

---

## Motion & Microinteractions

**Use sparingly:**
- **Page load:** cards fade in + slide up (100ms stagger).
- **Status change:** trip line dot pulses (2s cycle, 3 cycles then stop).
- **Hover:** 200ms ease-in card lift + border brighten.
- **Press:** ripple effect on buttons (Tailwind ripple or custom).
- **Loading:** skeleton shimmer or spinner (Sonner + Lucide icons).
- **Success:** toast (Sonner) + brief pulse on affected row.

No continuous animations (distracting on dark mode). No parallax (janky on mobile).

---

## Dark Mode

**Admin & driver pages:** dark mode on by default (settings can toggle).  
**Public & patient pages:** light mode by default.

Colors flip per CSS variables already defined. Ensure:
- Text contrast ≥ 4.5:1 (WCAG AA).
- Borders: 1px hairline, less visible on dark (maybe 10% opacity white).
- Inputs: darker bg (Console), hairline border, white text.
- Cards: 1px border, no shadow (or very subtle rgba shadow).

---

## Responsive Breakpoints

- **Mobile (375px):** Full width, tab bar, stacked layouts, big touch targets (48px min).
- **Tablet (768px):** Left sidebar collapses to icon bar, 2-column grids become 1 column.
- **Desktop (1440px):** Full layouts, 3-4 column grids, left rail always visible.

---

## Implementation Priority

**Phase 1 (Landing + Auth):** Hero, trust stats, how-it-works, features grid, role spotlights, redesigned login/register.

**Phase 2 (Patient):** Dashboard home, quick stats, request list, wizard (3 steps + map), detail page + trip line.

**Phase 3 (Driver):** Status toggle, trip card, call/navigate buttons, status action button, trip history.

**Phase 4 (Admin):** Overview (KPIs + charts), dispatch board (3 columns), resource tabs.

**Phase 5 (Polish):** Dark mode, responsive tests, animations (fade-in, pulse, hover lifts), accessibility (ARIA, keyboard nav).

---

## File Changes Needed

New components:
- `src/components/stat-card.tsx` — KPI display (enhanced)
- `src/components/request-card.tsx` — dispatch board + list rows
- `src/components/trip-line-compact.tsx` — smaller version for admin
- `src/components/driver-action-button.tsx` — big status button for driver
- `src/components/admin-nav.tsx` — sidebar + top bar for admin
- `src/components/empty-state.tsx` — no data illustrations

Page updates:
- `src/app/page.tsx` — full hero + sections redesign
- `src/app/login/page.tsx` — side-by-side layout
- `src/app/register/page.tsx` — mirror of login
- `src/app/dashboard/page.tsx` — hero + quick stats + recent requests
- `src/app/dashboard/requests/new/page.tsx` — wizard (3-step modal or full pages)
- `src/app/dashboard/requests/[id]/page.tsx` — detail + map + status
- `src/app/driver/page.tsx` — toggle + trip card + big button
- `src/app/admin/page.tsx` — KPI cards + charts
- `src/app/admin/dispatch/page.tsx` — 3-column board
- `src/app/admin/resources/page.tsx` — tabs (ambulances, hospitals, users, audit)

Layout updates:
- `src/components/layouts/admin-layout.tsx` — sidebar + top bar
- `src/components/layouts/patient-layout.tsx` — tab bar + sidebar dual
- `src/components/layouts/driver-layout.tsx` — minimal, just top bar

---

## Notes

- No heavy animations (reduces battery on mobile, improves 111-speed).
- Keep color meaning consistent (red = emergency/action, teal = done/safe, amber = pending).
- Shadows replaced with 1px borders (modern, cleaner, no depth illusions).
- Form fields: 48px min height for touch (not 32px defaults).
- All tooltips use Lucide icons + Sonner toasts, no native alerts.
- Accessible (WCAG AA): keyboard nav, ARIA labels, focus rings visible, color not sole indicator.
