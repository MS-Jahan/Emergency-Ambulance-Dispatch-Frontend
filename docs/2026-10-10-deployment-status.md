# 2026-10-10 Deployment status and fixes

## Live URLs
- Frontend: https://emergency-ambulance-dispatch-fronte.vercel.app (Vercel project `emergency-ambulance-dispatch-frontend`, deploys on git push, about 50 s)
- Backend: https://emergency-ambulance-dispatch-api.vercel.app (Vercel project `emergency-ambulance-dispatch-api`)

## What was wrong
1. **Backend pushes did not publish.** `vercel.json` uses `builds` with `dist/server.js`; `dist/` is git-ignored and `buildCommand` is skipped, so git-triggered deploys had empty output. They showed "Ready" after 3 to 5 seconds but served nothing.
2. **The API domain was pinned to a 33-day-old deployment.** `emergency-ambulance-dispatch-api.vercel.app` was aliased by hand to the Sep 7 deployment, so even a good deploy would not have gone live.
3. **The frontend pointed at the old backend.** `NEXT_PUBLIC_API_BASE_URL` on Vercel referenced a backend that did not have the new routes.

## What was done
- Built the backend locally and deployed with `vercel --prod`, then moved the API domain alias to the new deployment.
- Replaced `NEXT_PUBLIC_API_BASE_URL` (production and preview) with `https://emergency-ambulance-dispatch-api.vercel.app/api/v1` and redeployed the frontend (env values are inlined at build time, so a rebuild is required).
- Soft-deleted two duplicate "Square Hospital" rows through the admin API.
- Documented the deploy procedure in the backend `docs/deployment.md`.

## Verified on the live URLs
- `GET /api/v1/public/stats` and `GET /api/v1/hospitals` answer without a token.
- Frontend proxy returns the same, and one-click demo login works for PATIENT, DRIVER and ADMIN.
- `/`, `/hospitals`, `/login`, `/services` return 200.

## Still to do by hand
- Stripe: `FRONTEND_URL` is already set on the backend project; confirm it equals the frontend URL above, and that the webhook points at `<api>/api/v1/payments/webhook`.
- Run a real test-mode payment on the live site (not done here).
- Optional: make git pushes deploy the backend (see backend `docs/deployment.md`).
