# Profile unification, server-side photo, home spacing

Date: 2026-10-13

## Feedback and answers

**Is the photo going to the database?** Not before this change: the first version
kept it in the browser (`localStorage`), and the toast said "updated" regardless.
It now goes to the database as a base64 data URL (see the backend doc
`2026-10-13-profile-photo-avatar-url.md` in the backend repo). Flow: pick file ->
browser centre-crops to 256x256 and re-encodes as JPEG (~15-25 KB) -> `PATCH
/users/me { avatarUrl }` -> stored in `User.avatarUrl` (TEXT) -> returned by
`/users/me` and shown in the profile and the header menu. No Vercel storage or
third-party service is involved; Vercel functions have no writable disk. The UI
only says "updated" when the server echoes the same `avatarUrl` back, so an
un-migrated backend produces an error toast instead of a false success.

## Changes

| Area | Change |
|------|--------|
| Cards | `ui/card.tsx` base is now `rounded-2xl border border-hairline` (was `rounded-xl` + ring). Every card, including driver cards and Change password, now has the same radius and border. |
| Profile layout | One full-width column for patient, driver and admin: photo card, Details (name + phone side by side, email below, right-aligned Save), role extras, Change password, small right-aligned Log out. Shared `AccountProfile`; the driver page passes ambulance, licence and location cards as `extra`, plus the duty-status chip and a stricter phone rule. |
| Buttons | Save, Update password and Log out are compact (`h-10 px-5/6`), not full width. |
| Theme switch | Sits left of the 999 button in the public header and in the signed-in top bar. |
| Home spacing | Rule: a plain section that follows another plain section carries only bottom padding (`pb-12 sm:pb-16`); a plain section that follows a band or the hero carries `py-12 sm:py-16`; bands use `py-12 sm:py-16`. "First aid while you wait" had only bottom padding right after the district/band area, so it touched the section above; it now has top padding. Hero and bands moved from 14/16/20 to the same step. |
| "Request and track" text | The role spotlight mock-ups used `text-xs` (12px) for all labels; now `text-sm` (14px), with only the "Illustration" tag at 12px. |

## Rollout
Backend first (migration + deploy), then frontend; see the backend doc.

## Rollout log (2026-10-13)

1. Backend `prisma migrate deploy` against Neon: only `20261013120000_user_avatar` was pending; applied.
2. Backend pushed (`5aef8d3`); Vercel built it, but the production domain
   `emergency-ambulance-dispatch-api.vercel.app` stayed on an older deployment
   (the domain is pinned, so new production deployments are not served until it
   is re-pointed). Fixed with `vercel alias set <new deployment> emergency-ambulance-dispatch-api.vercel.app`.
   Remember this for every backend release: check `vercel inspect https://emergency-ambulance-dispatch-api.vercel.app`.
3. Live check on the demo patient: invalid `avatarUrl` -> 400; data URL saved and
   returned by `/users/me`; set back to `null`.
4. Frontend pushed (`0c1b887`) and live on the production alias.
