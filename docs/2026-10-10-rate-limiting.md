# 2026-10-10 Rate limiting behind the Next.js proxy

## Problem
Browsers never call the API directly. Every request goes browser, Next.js route handler (`/api/proxy/*`, `/api/auth/*`), API. The API therefore saw the frontend's server address for every visitor, and its limiters (`authLimiter` 30 per 15 min, `globalLimiter` 300 per 15 min, `contactLimiter` 5 per hour) used that address as the key. All visitors shared one bucket per instance, so a few demo logins by one grader could lock out everyone else.

A second defect made things worse: `contactLimiter` keyed on the raw `x-forwarded-for` header, which any client can set, so one visitor could send unlimited messages by changing the header on every request.

## Options considered
| Option | How it works | Verdict |
|---|---|---|
| Limit inside the Next proxy | The proxy counts requests per visitor before calling the API | The proxy runs in many short-lived serverless instances with separate memory, so counts are weak; and the API stays unprotected for anyone who calls it directly. Useful only as an extra layer. |
| **Next forwards the visitor address, API trusts it only with a shared secret** | The proxy reads the visitor address that Vercel sets, sends it as `x-client-ip` plus `x-proxy-secret`; the API keys limits on it only if the secret matches | **Chosen.** Small change, API stays the single place that enforces limits, direct callers are still limited by their connecting address, nothing breaks when the secret is missing. |
| Browser calls the API directly | The API sees the real address | Breaks the HTTP-only cookie design (tokens would reach the browser), needs CORS and exposes the API surface. Rejected. |
| Shared store for counters (Redis) | Counts live in one place, not in each instance's memory | Good addition on top of the chosen option (see Limits below); needs an Upstash or Vercel KV key, so it fits the plug-in-later approach. Not built yet. |
| Vercel Firewall rate limiting | Rate rules at the platform edge | Works without code, but rules depend on the plan and sit outside the repo. Possible extra layer. |

## What was built
Backend (`ph-l2-b7-asnmnt-6`):
- `src/middleware/clientKey.ts`: `clientKey(req)` returns `client:<visitor ip>` when `x-proxy-secret` equals `PROXY_SHARED_SECRET` (constant-time compare) and `x-client-ip` is a valid IP, otherwise `conn:<connecting ip>`. IPv6 addresses are normalised with `ipKeyGenerator`.
- All three limiters use it; the spoofable `x-forwarded-for` key is gone.
- `app.set('trust proxy', 1)` on Vercel so direct callers are keyed by the address Vercel's edge reports.
- New optional env `PROXY_SHARED_SECRET` (16+ characters). Documented in `.env.example`, `README.md`, `docs/deployment.md`.
- Tests: `tests/client-key.test.ts` (separate buckets per forwarded visitor, header ignored without the secret or with a wrong secret or an invalid address) and `tests/contact.test.ts` (contact limit isolates visitors).

Frontend:
- `src/lib/backend.ts`: `clientHeaders(req)` picks the address from `x-vercel-forwarded-for`, then `x-real-ip`, then the first `x-forwarded-for` value (Vercel sets these at its edge; clients cannot override them) and adds the secret. `backendFetch(path, init, req)` merges them.
- Used by `/api/proxy/*` (including the token refresh) and the five `/api/auth/*` routes (login, register, demo, refresh, logout).
- Nothing is sent when `PROXY_SHARED_SECRET` is unset or no address is known (local development), and the API then limits by connection as before.

## Setup (already done for production)
1. Generate a secret: `openssl rand -hex 32`.
2. Set the same value as `PROXY_SHARED_SECRET` on both Vercel projects (production). It is a server-side variable: never prefix it with `NEXT_PUBLIC_`.
3. Redeploy both projects (environment variables apply to new deployments) and move the API alias (`docs/deployment.md` in the backend).
To rotate: set a new value on both projects and redeploy both; between the two deployments the API simply falls back to connection keys.

## Verified on 2026-10-10 against the live API
- 33 failed logins signed as visitor A: 30 answered 401, then 429; a signed request for visitor B in the same moment answered 401 (own bucket).
- The same header without the secret did not pick a bucket.
- After three logins through the live frontend, the API's counter for the forwarding machine's own address showed those hits, so the frontend does pass the real address.

## Limits and next steps
- **Counters are held in each API instance's memory.** On Vercel several instances can run, and a cold start empties the counts, so limits are best effort: they stop casual abuse and accidental floods but are not a hard guarantee. A first test run right after a deployment spread its requests over fresh instances and never reached 429; the repeat on warm instances did. For hard limits add a shared store: express-rate-limit has Redis stores, and with Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, optional env like the email keys) the limiter can switch to it automatically when the variables exist.
- Failed and successful requests both count against `authLimiter` (30 per 15 min per visitor). That is enough for demos; raise it if many reviewers share one office address.
- If the secret leaks, someone can choose their own bucket and dodge their limit; rotate it. It cannot be used to read data.
