# 2026-10-10 Redesign and content brief (for the design tool)

Brand: RapidAid, emergency ambulance dispatch, Bangladesh. Tone: calm, fast, trustworthy. Palette: gauze #F2F5F7, paper #FFF, ink #0D1B2A, signal red #E0312B (emergencies only), oxygen teal #0E8C86 (available/success), amber #E9A21B (pending/warning), slate #5A6B7B. Font: Schibsted Grotesk. Dark mode supported.

## A. Public pages (current state and what content each needs)
| Page | Current | Content needed |
|---|---|---|
| `/` Home | Hero, stats, nearby hospitals (demo), how it works, features, role spotlights, districts, CTA | See section B |
| `/hospitals` | 20 demo hospitals by distance, live list when signed in | Search by name/district, filter ICU, map view, hospital detail drawer |
| `/services` | Static | Ambulance types (Basic, ICU, Cardiac) with equipment, price band, typical response |
| `/about` | Static | Mission, team, safety/compliance, partner logos |
| `/faq` | Static | Grouped Q&A: requesting, payment, privacy, drivers |
| `/contact` | Static | Hotline, email, form with category, map of HQ |
| `/login` | Form + 3 demo role buttons | Role cards with one-line description each, "what you will see" preview |
| `/register` | Form with password strength | Role choice (patient / driver application), terms |

## B. Homepage ideas to make it stronger
1. **Hero:** headline, one-line promise, big Request button, a "Call 999" secondary, animated map card showing an ambulance moving (replace the generic trip line box).
2. **Live-feeling stats strip** (demo values): median dispatch time, hospitals, active ambulances, requests served.
3. **Top hospitals near you** (done): IP-based, "Use my location", Demo data badge.
4. **Interactive coverage map** of Bangladesh with hospital pins by district.
5. **How it works:** 4 steps with illustrations, plus an interactive "try a request" mock.
6. **Ambulance types** cards: Basic, ICU, Cardiac, with equipment lists.
7. **First-aid quick guide:** CPR, bleeding, burns, choking: collapsible cards. Strong trust and SEO value.
8. **Trust band:** security, privacy, response SLAs, partner hospital logos.
9. **Testimonials / case stories** (only real or clearly marked demo).
10. **For drivers and hospitals:** recruitment strip.
11. **Pricing transparency:** base fare + per-km estimator widget.
12. **Mobile app / PWA install** prompt, SMS request fallback.
13. **FAQ preview** (4 questions) and final CTA.
14. **Emergency bar:** persistent sticky "Request now" on mobile.

## C. Inside the app after sign in
### Patient (`/dashboard`)
- Home: active request card with live status, big "Request ambulance" button, recent trips, saved addresses, emergency contacts.
- New request wizard: location (map pin / current), urgency, ambulance type, patient details, destination hospital (suggest nearest ICU), confirm.
- Request detail: trip line, map with driver position and ETA, call driver, share tracking link, cancel, receipt, rate trip.
- Payments: pending and paid, Stripe checkout, receipts.
- Profile: details, medical info (blood group, allergies), theme, password.
### Driver (`/driver`)
- Online/offline switch, current assignment with a single large next-step button, tap-to-navigate and call, day earnings and trip count, history, vehicle info.
### Admin (`/admin`, `/admin/dispatch`, `/admin/resources`)
- Overview: KPIs, requests-over-time chart, status donut, alerts for unassigned > N minutes.
- Dispatch board: pending / in progress / done, nearby ambulances ranked by distance, assign and reassign, cancel with reason.
- Resources: ambulances, hospitals, users, audit log with filters, CSV export.
- Add: live map of all units, SLA report, feedback inbox.

## D. Improvements checklist
- Replace repeated trip demo in role sections with role-specific mock screens.
- Real map (Mapbox/Leaflet) on hero and coverage section.
- Skeletons and empty states on every list; consistent error toasts.
- Accessibility: focus rings, contrast AA, reduced motion, keyboard nav on map and board.
- Performance: lazy-load map, image optimisation, Lighthouse > 90.
- i18n: Bangla / English toggle.
- Notifications: SMS and push on status change.
- Public hospital endpoint on the backend (read-only, no auth) so the homepage can use live data instead of demo data.

## E. Design asks for the plot/design tool
Produce: desktop and mobile homepage, hospitals page, login, patient request wizard, patient trip detail, driver assignment screen, admin dispatch board. Light and dark. Keep signal red reserved for emergency actions.
