# Homepage Showcase Review

**Date:** 2026-05-23  
**Scope:** `HomeEventCategories` section only — not full homepage redesign  
**Route:** `/` → “Experiences for every celebration”

---

## What was wrong

| Symptom | Cause |
|---------|--------|
| **Too narrow** | `xl:grid-cols-4` squeezed eight cards into four columns (~280px/card at 1200px container) |
| **Too tall / portrait feel** | Clay default uses `aspect-[5/4]` + thick `m-4` frame + tall text block below |
| **Tiny images** | Narrow column width + frame inset left little room for photography |
| **Excessive text wrap** | Narrow cards forced titles and descriptions into many lines |
| **Weak hierarchy** | Text block competed with image; card read as “info tile” not “experience photo” |
| **Wasted margins** | Standard 1200px container + default float inset on a visual showcase section |

The section behaved like a **compact listing grid** (services index pattern) instead of a **homepage showcase gallery**.

---

## What changed

### 1. Section width (`width="wide"` + `floatDensity="open"`)

- Content uses up to **1440px** (1536px on ultra-wide), same system as `/services`
- Open float reduces double-box padding so grids use horizontal space

### 2. Grid density — fewer, wider cards

| Breakpoint | Before | After |
|------------|--------|-------|
| Mobile | 1 col | 1 col |
| sm–lg | 2 cols | 2 cols |
| xl+ | **4 cols** | **3 cols max** |

**Never more than 3 cards per row.** Laptop/desktop stays at 2 columns until xl, so cards stay wide.

### 3. Row breathing room

- Gaps: `gap-9` → `xl:gap-12` (up to 3rem between cards)
- CTA margin: `mt-10` → `mt-12 md:mt-14`

### 4. Showcase card layout (`layout="showcase"`)

Homepage-only prop on `ServiceCard` (services page unchanged):

| Property | Standard (clay) | Showcase |
|----------|-----------------|----------|
| Image aspect | 5:4 (near square) | **16:10 landscape** |
| Frame inset | m-4 | m-3 (more image area) |
| Text padding | p-6–7 | p-5–6 (shorter card body) |
| CTA spacing | mt-6 | mt-4 |

Hierarchy preserved: **Image → Title → Description → CTA**

### 5. Intro measure

- `max-w-3xl` on section intro — less subtitle wrapping above the grid

---

## Card width comparison (approximate)

At **1280px viewport**, open wide section (~1180px content):

| Layout | Columns | Card width | Image width (showcase) |
|--------|---------|------------|------------------------|
| Before (4 col) | 4 | ~270px | ~200px |
| After (2 col) | 2 | ~560px | ~520px |
| After (3 col @ xl) | 3 | ~360px | ~330px |

At **1440px**, 3-column row: **~420px+ card width** vs **~300px before**.

---

## Would visitors notice photos first?

**Before:** No — four narrow columns and square-ish crops made text and chrome as prominent as photography.

**After:** Yes — at 2 columns (laptop), each title-card image spans ~half the showcase width with a cinematic 16:10 crop. At 3 columns (large desktop), images remain clearly dominant over the compact text band below.

---

## Why this fits an image-first event brand

1. **Experiences are visual** — Game Hour sells laughter in a room; wide landscape crops mirror event photography.
2. **Homepage ≠ catalog** — The homepage teases; `/services` can use bento and full-width featured rows. Home showcase prioritizes **impact over density**.
3. **Premium pacing** — Fewer cards per row + larger gutters feel like a curated gallery, not a product grid.
4. **Same cards, same copy** — Clay surface, sparkle, chip CTA, and all service content unchanged; only layout density and showcase proportions differ.

---

## Files changed

| File | Change |
|------|--------|
| `src/sections/home/HomeEventCategories.tsx` | Wide section, 2–3 col grid, showcase layout |
| `src/components/ServiceCard/ServiceCard.tsx` | Optional `layout="showcase"` (homepage only) |

---

## Test plan

1. `/` at 1280px — 2 wide cards per row; landscape images dominate.
2. `/` at 1536px — 3 cards per row; still substantially wider than old 4-col layout.
3. `/` at 375px — single column; no overflow.
4. `/services` — unchanged listing/bento behaviour (no `layout="showcase"`).
