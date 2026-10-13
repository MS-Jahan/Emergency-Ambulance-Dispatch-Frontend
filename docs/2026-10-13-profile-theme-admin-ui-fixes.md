# Profile, theme switch and admin UI fixes

Date: 2026-10-13

Feedback from a manual walkthrough. Each item: cause, fix.

| # | Problem | Cause | Fix |
|---|---------|-------|-----|
| 1 | Dark-theme switch thumb moved forward instead of back when turned off | Thumb was `absolute` with no `left`; inside a `<button>` the static position is centred, so `translate-x` started from the middle | `components/shared/toggle.tsx`: pin thumb with `left-0.5 top-0.5`, constant 2px border so on/off offsets match |
| 2 | Theme switch lived in Profile > Preferences only; driver/admin had none | Setting sat inside one page | New `ThemeToggle` (sun/moon) in the role shell top bar and the public header; `ThemeSync` in `Providers` applies `html[data-theme]` on every route. Preference card removed from Profile |
| 3 | Admin Resources tabs: active pill sat outside the tab bar, wrong colour | `TabsList` base has `group-data-horizontal/tabs:h-8`, which `h-auto` cannot override (variant-prefixed), so 36px pills overflowed a 32px bar; shadcn `dark:data-active:bg-input/30` beat the brand fill in dark | Override with `group-data-horizontal/tabs:h-auto`, add `dark:data-active:` brand classes, `w-fit max-w-full` |
| 4 | Users tab: name/email/role centred and stacked | `Card` is `flex flex-col`; `flex items-center justify-between` does not remove `flex-col` (different utility group) | `flex-row` on the users row and the same pattern in `request-detail-sheet.tsx` |
| 5 | Hospital cards too wide | Single-column list | `grid gap-3 md:grid-cols-2`, cards `h-full` |
| 6 | Profile cards badly placed | Four cards stacked in one narrow right column | New shared `AccountProfile`: photo/identity header card, then two balanced columns (Details and extras; Password and Sign out) |
| 7 | Photo upload button did nothing | It was a decorative `<span>`; backend has no avatar field or upload endpoint | `AvatarUpload`: file picker, type and 5 MB checks, centre-crop to 256px JPEG, stored per user id in `avatar-storage` (localStorage). `UserAvatar` shows it in profile and the header menu. Driver profile uses it too |
| 8 | No admin profile | Page did not exist | `/admin/profile` (shared `AccountProfile`), `Profile` in admin rail and in the user menu for every role |
| 9 | Change password unverified | n/a | Read-through only: frontend `PATCH /users/me/password {currentPassword,newPassword}` matches backend `changePasswordSchema`; backend checks current password, revokes refresh tokens; UI then signs out. Not exercised live, because it would change a shared demo account |
| 10 | `/admin/reports` empty on first load, fine later | No console or network error; looks like a transient first fetch. Not reproduced from code | Not changed. Reproduce with a hard refresh on `/admin/reports` and note the network tab |

## Decision: photo storage
Photos are device-local for now (no backend or storage credentials exist). The
whole feature goes through the `useAvatars` store, so moving to a server
`avatarUrl` later means swapping that store for a query plus an upload endpoint.
Trade-off: the photo does not follow the user to another browser.
