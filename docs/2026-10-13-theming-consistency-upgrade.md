# Theming consistency upgrade

Date: 2026-10-13

## Why

Rubric, category 1 (12 marks): "Modern design with consistent theming, unified
color palette, typography scale, and spacing system across all pages."
Failure mode named by the rubric: inconsistent theming, poor typography, or no
unified palette.

An audit of `src/app/globals.css` and `src/` found the building blocks exist
(tokens, two fonts, shadcn primitives) but the system leaks in four places.

## Findings

| # | Finding | Evidence |
|---|---------|----------|
| 1 | Dark mode is a different brand. Light = cream `#F5EAD8` + terracotta `#8C491A`; dark = slate navy `#0F172A` + sky blue `#60A5FA`. | `globals.css` `:root` vs `:root[data-theme="dark"], .dark` |
| 2 | Status colours bypass the tokens. Raw Tailwind `amber-700/300`, `emerald-400`, plus hex overrides (`#4ade80`, `#fbbf24`, `#f87171`) in CSS. | `admin/page.tsx:26-27`, `admin/reports/page.tsx:216,219`, `audit-log-table.tsx:22`, `users-table.tsx:49`, `ambulances-table.tsx:66`, `globals.css` text-status overrides |
| 3 | Type scale is not a scale. Arbitrary `text-[9px]`, `[10px]` x7, `[11px]` x14, `[0.8rem]`. Page `h1` sizes vary: 3xl, 4xl, 3xl→4xl, 4xl→5xl, 5xl→7xl. | grep over `src/` |
| 4 | Spacing and shape rhythm is loose. Containers: seven different `max-w-*`. Public section padding: `py-10/12/14/16/20`. Six radii in use. | grep over `src/` |

## Decisions

### D1. Warm dark theme (same brand, not a second one)

Dark mode keeps the terracotta identity on an espresso ground. Neutral hues stay
warm. Brand text step is lightened (not swapped to blue) so it holds WCAG AA on
the dark ground.

| Token | Light | Dark (new) |
|-------|-------|------------|
| `--gauze` (ground) | `#F5EAD8` | `#17120E` |
| `--paper` (card) | `#FFF9EF` | `#231B15` |
| `--ink` | `#201E1D` | `#F5EAD8` |
| `--console` | `#2E2B25` | `#0F0B08` |
| `--slate` (muted text) | `#6B5F50` | `#B8A68E` |
| `--hairline` (border) | `#D9C7A6` | `#3B2F25` |
| `--brand` | `#8C491A` | `#E0976A` |
| `--brand-soft` | `#F1DCC8` | `rgba(224,151,106,0.16)` |
| `--brand-foreground` | `#FFFFFF` | `#17120E` |

Secondary/muted/input in dark use `rgba(245,234,216,0.08)` / `0.06` (warm tint,
was cool white).

### D2. Status text tokens

New tokens so no component needs a `dark:` patch for status colour:

| Token | Light | Dark |
|-------|-------|------|
| `--oxygen-text` | `#15803D` | `#4ADE80` |
| `--amber-text` | `#B45309` | `#FBBF24` |
| `--signal-text` | `#B91C1C` | `#F87171` |

Exposed to Tailwind as `text-oxygen-text`, `text-amber-text`,
`text-signal-text` (and `border-/bg-` variants if needed). The existing
`.text-oxygen/.text-amber/.text-signal` dark overrides in `globals.css` now read
these variables instead of hard-coded hex, so untouched call sites keep working.
Raw Tailwind palette classes (`amber-700`, `emerald-400`, ...) are banned.

### D3. Type scale

One minimum size: `text-xs` (12px). No arbitrary pixel sizes.

Three `h1` levels, defined once in `globals.css` as utilities:

| Utility | Size | Used for |
|---------|------|----------|
| `title-display` | `text-5xl sm:text-6xl lg:text-7xl`, leading 1.02 | home hero only |
| `title-hero` | `text-4xl sm:text-5xl` | public page headers (about, services, faq, contact, hospitals) |
| `title-page` | `text-3xl sm:text-4xl` | app pages, auth forms, payment result pages, wizard steps, not-found, error |

Body scale unchanged: `text-sm` default UI, `text-base` prose, `text-xs`
captions/eyebrows. `h2` `h3` `h4` keep base-layer sizes. Headings never use
`font-bold` (Caprasimo has one weight; global `!important` already pins 400).

### D4. Layout primitives

New `src/components/shared/page-container.tsx`:

- `PageContainer` — width tiers: `narrow` = `max-w-3xl`, `default` = `max-w-5xl`,
  `wide` = `max-w-7xl`; always `mx-auto w-full px-4 sm:px-6 lg:px-8`.
- `Section` — vertical rhythm `py-12 sm:py-16`; optional `tone="muted"` band.

Applied to the public pages (home, about, services, faq, contact, hospitals).
App shells (admin/driver/dashboard) already share `role-shell` and keep it.

### D5. Radius rule (three shapes)

| Use | Class |
|-----|-------|
| Controls, small tiles, inner chips | `rounded-lg` |
| Cards, panels, sheets | `rounded-2xl` |
| Pills, avatars, badges | `rounded-full` |

Mapping: `rounded-3xl` → `rounded-2xl`; `rounded-md` → `rounded-lg`;
`rounded-xl` → `rounded-2xl` on card-like containers (border + background +
padding) else `rounded-lg`. Files in `src/components/ui/` (shadcn primitives) are
left alone.

## Work plan

Parallel wave 1 (disjoint concerns):

1. `globals.css`: D1, D2 tokens + `@theme` mappings, D3 utilities.
2. Replace raw palette classes in the 5 files listed in finding 2 (D2).
3. Replace arbitrary text sizes with `text-xs` in 11 files (D3).
4. Normalise every page `h1` to the three utilities (D3).
5. Create `page-container.tsx` and apply to public pages (D4).

Wave 2 (after wave 1, touches many files): radius collapse (D5).

Then: lint, build, grep checks, manual review of the diff, commit in small steps,
push.

## Verification

- `bun run lint` and `bun run build` pass.
- `grep -rE "(bg|text|border)-(amber|emerald|red|green|blue|slate)-[0-9]{2,3}" src` returns nothing.
- `grep -rE "text-\[[0-9.]+(px|rem)\]" src` returns nothing (except `components/ui`, if any).
- `grep -rE "rounded-(3xl|md|xl)\b" src --include=*.tsx` only matches `components/ui`.
- Every `h1` uses one of `title-display`, `title-hero`, `title-page`.
- Toggle dark mode on a patient page and on admin/driver: terracotta brand, warm
  ground, no blue.

## Not changed

Fonts (Figtree + Caprasimo), signal/oxygen/amber base colours, shadcn primitives
in `components/ui`, shell layouts.

## Outcome

Implemented 2026-10-13 in two commits (tokens/type/containers, then radius).

- `globals.css`: warm dark palette, `--oxygen-text/--amber-text/--signal-text`,
  `title-display|hero|page` utilities.
- 5 files moved off raw Tailwind palette classes; 27 `h1`s on the three utilities
  (only exception: card heading in `dashboard/requests/[id]`, not a page title).
- All sub-12px text raised to `text-xs`; the one `text-[0.8rem]` left lives in
  `components/ui/button.tsx` (shadcn primitive, out of scope).
- `PageContainer`/`Section` in `components/shared/page-container.tsx`; public
  pages use it. `Section` is available but pages still use their own `<section>`
  bands; adopt it when those pages are next touched.
- Radius collapsed to `rounded-lg` / `rounded-2xl` / `rounded-full` outside
  `components/ui`.
- Checks: `tsc`, `bun run lint` (0 errors, 8 pre-existing warnings), `bun run build`
  pass; all verification greps empty.
- Not done: visual dark-mode screenshot pass (browser tooling unavailable this
  session). Do a manual toggle check before the demo.
