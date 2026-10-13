# Spurious "Session expired" toast after sign-in

Date: 2026-10-13

## Symptom
Signing in (e.g. demo "patient") showed "Session expired. Please sign in again."
but the user still ended up signed in.

## Cause
`SessionBootstrap` runs `useMe()` on every page, including `/login` while signed
out, so `['auth','me']` caches a 401 error. After a successful sign-in the
mutation called `setUser(user)`; the bootstrap effect then saw
`me.error.status === 401 && user` (stale error + fresh user), called `logout()`
and toasted. The target page mounted a fresh `useMe` observer, which refetched
successfully and set the user again, so the session looked fine afterwards.

## Fix
`useLogin`, `useRegister` and `useDemoLogin` now call
`queryClient.setQueryData(['auth','me'], user)` before `setUser`, replacing the
cached 401 with the signed-in user. No change to `SessionBootstrap`, which is
still correct for genuinely expired persisted sessions.

## Verify
Sign in via form and each demo button: no toast, lands on the role home.
Expired cookie with stale localStorage user: toast still shows once.
