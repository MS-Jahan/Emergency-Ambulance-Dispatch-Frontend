# Route protection, role guard and session fixes

Date: 2026-10-13

## Reports
1. Left rail in the admin shell stops short of the bottom of the screen.
2. Signed in as admin, signed out, signed in as patient with `?next=/admin`: the
   admin page rendered for the patient and fired admin API calls (403 from the
   backend).
3. Returning to a tab after a while, pages load again or bounce to
   `/login?next=...`.

## Causes

| # | Cause |
|---|-------|
| 1 | The rail was `fixed inset-y-16`, which sets `top: 4rem` and `bottom: 4rem`. Now `top-16 bottom-0`. |
| 2a | **`proxy.ts` sat in the project root, but this app uses `src/app`. Next only loads the proxy from `src/`, so it never ran.** Build output had no "Proxy (Middleware)" line. No server-side redirect existed for anonymous or wrong-role visitors. Moved to `src/proxy.ts`. |
| 2b | The sign-in hooks followed any `next` value, so a stale `?next=/admin` sent a patient to `/admin`. |
| 2c | The previous account's React Query cache and the Next client router cache survived sign-out and sign-in, so old admin pages and data could be shown to the next account. |
| 2d | The dashboard shells never checked the signed-in role in the browser. |
| 3a | The access cookie lived 15 minutes (same as the JWT). After that, the proxy saw no cookie and redirected to `/login` even though the 7-day refresh cookie was valid. |
| 3b | The backend rotates refresh tokens (a used one is revoked at once). After the access token expired, a page firing several requests tried to rotate the same token in parallel; all but one failed with 401, and the client then sent the user to `/login`. |

## Fixes
- `src/proxy.ts` (moved): anonymous -> `/login?next=...`; wrong role -> that
  role's home; signed-in visitor on `/login` or `/register` -> own home (was
  always `/dashboard`); unknown role value or bad token -> login and clear cookies.
  Verified on a local production build with crafted cookies: patient, driver and
  admin each reach only their own area, anonymous visitors are redirected, and
  public pages stay open.
- `postLoginTarget()` in `lib/hooks.ts`: after sign-in, `next` is honoured only
  if it is not in another role's area.
- Sign-in, register and demo login call `queryClient.clear()` before seeding the
  new user. Sign-out clears the cache and does a full page load to `/login`,
  which also drops the client router cache.
- `RoleShell` checks the role from `/users/me`; a wrong-area visit shows a
  spinner and is replaced with the right home before page content mounts. It
  only redirects on the server's answer, so a stale stored role cannot bounce
  against the proxy.
- Access cookie now lasts 7 days like the refresh cookie. The JWT inside still
  expires after 15 minutes and the backend enforces that; `/api/proxy` renews it
  on the first 401.
- `/api/proxy` shares one refresh per refresh token on a server instance and
  reuses the result for 15 seconds, so parallel requests no longer fight over a
  rotating token. Separate serverless instances can still race rarely; a short
  grace window for a just-used refresh token in the backend would close that.
- Logout route no longer passes the request as a response init.

## Security notes
- The proxy reads the role claim without verifying the signature. It only picks
  which page to show. Real enforcement is the backend: it returned 403 for the
  patient's admin calls, so no admin data was exposed. Do not rely on the proxy
  or the shell guard for protection.
- Side effect to know: a signed-in user who opens `/login` is now sent to their
  dashboard. To switch demo accounts, sign out first.
