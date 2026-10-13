# Loading versus empty states

Date: 2026-10-13

## Problem
Several dashboard panels computed their view from `query.data ?? []` and rendered
the empty message straight away. While the request was still in flight the user
saw "No requests in this window yet." or an empty chart, then the real data
popped in. An empty state must only appear after the query has finished.

## Rule
For every query-backed panel: `isLoading` -> skeleton/spinner with a label;
`isError` -> short error text; loaded and empty -> empty state; else data.
Never derive "empty" or a fallback number from a query that has not resolved.

## New shared pieces (`components/shared/loading.tsx`)
- `Spinner`: ring spinner, `role="status"`, screen-reader label, stops under reduced motion.
- `InlineLoading`: spinner plus caption for small waits.
- `ChartSkeleton`: ghost bars pulsing with a centred "Loading chart..." chip.

## Audit and fixes

| Where | Symptom | Fix |
|-------|---------|-----|
| Admin overview, "Requests over time" | "No requests in this window yet." until the 100-row feed loaded | `loading` -> `ChartSkeleton`; `failed` -> error text; empty only after load |
| Admin reports, "Last 7 days" (3 bar charts) | Blank bars until summary loaded | `ChartSkeleton` while `summary.isLoading` |
| Admin reports, cancellation reasons | "No cancellations in this period." while loading | loading block with spinner and skeleton lines, error text on failure |
| Admin reports, recent feedback | "No feedback yet" empty state while loading | same loading block, error text on failure |
| Public home and /hospitals, nearby hospitals | "Demo data" badge and demo hospitals first, then live list replaced them | demo fallback only after the live query returns empty; skeleton cards while loading |
| Public hospital directory | "Demo data" badge flashed during load | badge gated on `!isLoading` |
| Driver duty screen, "Today's trips" | "(0)" count and "No trips completed today." before trips loaded | count hidden and `InlineLoading` while loading |
| Driver earnings, four KPI cards | Numbers computed from the request list, then jumped to server stats; rating showed "-" / "No ratings yet" first | skeletons until `stats` resolves |
| Patient request detail, feedback form | Rating form shown, then swapped to "Your feedback" | loading card until existing feedback is known |
| New request wizard, hospital picker | Empty list while loading | "Loading hospitals..." row inside the list |

Already correct (checked): patient requests list and payments, admin dispatch
board, tables under admin Resources, request detail sheet nearby units, driver
profile, payment success.

## Not changed
Fare badges fall back to the built-in default fares until live rates arrive; the
numbers normally match, so no placeholder was added.
