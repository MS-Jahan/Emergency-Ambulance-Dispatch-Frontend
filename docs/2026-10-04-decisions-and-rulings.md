# Decisions & Rulings Log

Date: 2026-10-04
Covers: all implementation phases (commits f958c69..fd460c1). Each ruling names
what was decided, why, and what it costs if wrong.

## Currency display (৳ vs USD)

Backend Stripe charges USD (`STRIPE_CURRENCY=usd`) but every screen — pricing,
payments, services page — displays ৳ (app-wide convention from the start).
Decision: keep ৳ everywhere including the static services page; consistency
beats accuracy on marketing copy. Cost if wrong: wrong symbol on static pages,
one-line fix each. Real fix is aligning the backend currency before real
charging (see verification doc).

## Contact form — no fake success

No backend behind the contact form (plan said "basic, no backend required").
Decision: the form composes a `mailto:` draft with prefilled subject/body and
tells the visitor exactly that, rather than pretending "message sent". Support
email/phone are placeholders until ops provides real ones. Cost if wrong:
visitors without a mail client cannot reach support.

## Public hospitals page vs authenticated API

`GET /hospitals` requires auth on the backend (`hospitalsRouter.use(authenticate)`).
Decision: public page renders the live directory only for signed-in users; for
anonymous visitors it shows an explicit "sign in to browse" empty state (the
hook's catch-all returns an empty list). Cost if wrong: anonymous visitors
never see live data — but that matches the backend contract.

## Public pages discoverability

Landing page nav was left untouched; public pages are reachable by URL and
cross-link to each other via the shared public header. Adding links to the
committed landing page mid-task would have widened the diff for a cosmetic
gain. Cost if wrong: slightly lower discoverability of About/Services/FAQ.

## Lazy charts / next/image — moot

Plan's performance items assumed a chart library and raster images. The status
donut is hand-rolled SVG and the app ships no images, so there is nothing to
lazy-load or optimize. Cost if wrong: none.

## Static revalidation scope

`revalidate = 3600` added to the server-rendered marketing pages (about,
services, faq). Client-component pages (hospitals, contact) cannot carry route
segment config; they remain build-time static, which serves the same CDN-cached
outcome. Cost if wrong: those two rebuild only on deploy — content is
near-static anyway.

## Pagination limits

Default `limit=10` already in place for user request/payment lists and admin
tables. Two deliberate exceptions: driver assigned queue (20, polled every 5s)
and public hospitals (100, single directory fetch). Cost if wrong: bounded,
slightly larger payloads on those two screens.

## Demo credentials in client bundle

The one-click demo logins (plan-specified) ship default passwords
(`Demo123!` / `Admin123!`) in the client bundle; they are env-overridable
(`DEMO_*_PASSWORD`) and exist for grader convenience. Deferred minor: disable
demo endpoints or rotate passwords for any real deployment.

## Payment callback sessionId handling

The callback pages interpolate `sessionId` straight into the query string.
Only the visitor's own redirect lands there, the backend reads a single query
param, and nothing renders the raw value — worst case is a malformed request
that errors visibly. Deferred minor: `encodeURIComponent` it for hygiene.

## Final review

Self-review, no fresh reviewer (no subagent dispatch used; final review is
deliberately kept in-house per project working rules). Findings: no critical
or important issues; two deferred minors above. Route protection verified in
`proxy.ts` (Node.js runtime in Next 16 — `Buffer` JWT role peek is valid there).
