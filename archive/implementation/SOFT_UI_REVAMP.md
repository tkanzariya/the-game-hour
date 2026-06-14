# Soft UI Revamp Report

**Date:** 2026-05-23  
**Type:** Visual refinement only (presentation layer)

---

## What stayed the same

| Area | Unchanged |
|------|-----------|
| Content | All copy in JSON, sections, and SEO strings |
| Routes | `/`, `/services`, `/services/:slug`, etc. |
| Information architecture | Homepage section order, services page sections |
| Components API | Same component names and props (defaults tuned) |
| Brand colors | `#032A5D` navy + `#FF9933` orange |
| Data layer | `services.json`, `gallery.json`, asset-map |

---

## What changed

### 1. Global design language (`tokens.css`, `design-tokens.ts`, `globals.css`)

- **Softer background:** Subtle vertical gradient on `body` instead of flat fill.
- **Larger radii:** Up to `--radius-3xl` (44px) for section panels.
- **Softer shadows:** Lower-contrast `--shadow-clay`, new `--shadow-float` for section blocks.
- **Surface tints:** Slightly cooler, airier clay muted tones.
- **More section spacing:** Increased `--spacing-section` and outer float gaps.

### 2. Floating section containers (`Section.tsx`)

- Default `layout="float"` wraps content in `.section-float` panels with breathing room between sections.
- Tones map to `section-float-default`, `-muted`, `-warm`.
- `layout="flat"` and `tone="dark"` still full-bleed (heroes, navy bands).

### 3. Image treatment

- New `.image-frame` utility: padded inset, rounded inner photo, soft border.
- Applied to home hero, service detail hero, service cards (clay), and gallery cards.

### 4. Cards

| Component | Refinement |
|-----------|------------|
| **ServiceCard** | Clay default; `image-frame`; pill CTA chip; hover `scale(1.01)` + lift |
| **GalleryCard** | Full clay surface; framed image; `rounded-3xl` |
| **StatCard** | Taller padding; `rounded-3xl`; motion hover |
| **CTA** | `rounded-3xl`; float shadow on primary; more padding |

### 5. Buttons (`Button.tsx`)

- **Chunkier:** Taller min-heights, more horizontal padding.
- **Friendlier shape:** `rounded-2xl` instead of pill (less corporate).
- **Softer borders:** Lighter border opacity on secondary/tertiary.
- **Hover:** `scale(1.02)` on all variants.

### 6. Spacing audit

- Section intros: `mb-12` to `mb-16` on large screens.
- Home/services grids: `gap-7` / `gap-8`.
- Float section outer padding: `py-5` to `py-9` responsive.

### 7. Animation (`variants.ts`)

- Reduced reveal distance (`y: 20` → `14` on stagger items).
- Card hover: `scale(1.02)` + `-4px` lift.
- Slower, softer easing retained (`easeOutExpo`).

### 8. Services page polish

- Same sections; visual lift via float panels, larger card gaps, clay + image frames on all experience cards.

---

## Preview route

**`/new-ui-preview`** (`NewUiPreviewPage.tsx`)

Side-by-side **Before** (scoped `.ui-legacy` styles) vs **After** (live components) for:

- Buttons
- Service card
- Gallery card
- Stat card + CTA
- Flat section vs floating section

Legacy styles live in `src/styles/legacy-preview.css` (preview only, not loaded site-wide).

---

## Why this fits The Game Hour

1. **Image-heavy brand:** Framed photos and larger card radii put event energy first, matching reference screenshots.
2. **Playful premium:** Floating panels and soft shadows feel celebratory, not corporate SaaS.
3. **Claymorphism (SKILL.md):** Dual shadows, rounded XL surfaces, warm gradients preserved and softened.
4. **No disruption:** Same booking paths, service slugs, and copy. Only presentation evolved.

---

## Verification

```bash
cd TheGameHour-v2
npm run build
npm run dev
```

- `/` and `/services`: floating sections, softer cards.
- `/new-ui-preview`: component comparison.
- `/design-preview`: still available for full token audit.

---

## Files touched (summary)

- `src/styles/tokens.css`, `globals.css`, `design-tokens.ts`
- `src/components/Section`, `Button`, `ServiceCard`, `GalleryCard`, `StatCard`, `CTA`
- `src/animations/variants.ts`
- `src/sections/home/*` (hero image frame, grid gaps)
- `src/sections/services/*`, `src/sections/service/ServiceDetailHero.tsx`
- `src/pages/NewUiPreviewPage.tsx`, `src/styles/legacy-preview.css`
- `src/constants/routes.ts`, `src/router.tsx`
