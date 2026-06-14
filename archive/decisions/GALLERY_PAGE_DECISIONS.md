# Gallery Page Decisions

**Date:** 2026-05-23  
**Scope:** Production Gallery page (`/gallery`) for The Game Hour v2

---

## Design intent

The Gallery is a **trust-building, image-first sales page**. Visitors should look at real event photos and think: "This is exactly what I want at my event." It is not a photo dump or unstructured masonry wall.

---

## Section reasoning

| # | Section | Role | Why this shape |
|---|---------|------|----------------|
| 1 | **Gallery Hero** | Emotional entry | Headline ("Moments of laughter you can almost hear") leads with experience, not "Gallery". Split layout with `gallery-hero` asset mirrors About/Home hero patterns. |
| 2 | **Featured Moments** | Hero imagery | Asymmetric 12-column grid (7+5 / 5+7) gives editorial rhythm vs uniform cards. `GalleryShowcaseCard` uses 16:10 aspect for large, cinematic frames. |
| 3 | **Browse By Experience** | Interactive discovery | Client-side filter pills (8 experience types + All). No page reload. Violet accent on active filter. |
| 4 | **Event Moments Grid** | Filtered proof | Same section as browse (shared state). Curated limits (12 all / 8 per filter) prioritize quality. `AnimatePresence` for smooth transitions. |
| 5 | **Stories Behind The Photos** | Context + trust | Three alternating split layouts with real event titles (corporate offsite, school fest, community festival). Links to service packages. |
| 6 | **The Experience In Numbers** | Quantified proof | Stats over a photo backdrop (corporate gallery image + primary overlay). Photos, events, participants, communities. |
| 7 | **Final CTA** | Conversion | "Ready to create your own memories?" with Book + Contact + WhatsApp. |

---

## Layout choices

- **Marketing profile everywhere:** `Section profile="marketing"` for wide container + open float consistency.
- **Rhythm alternation:** Dark hero → muted featured → default browse → warm stories → muted stats → default CTA.
- **No masonry chaos:** Fixed aspect ratios (`aspect-4/3`, `aspect-[16/10]`) on all gallery cells prevent layout shift and keep spacing consistent.
- **Featured vs grid:** Featured section uses larger showcase cards; browse grid uses standard 3-column layout with generous `gap-6 lg:gap-8`.
- **Stories alternate:** Even-index stories image-left; odd-index image-right on desktop.

---

## Filtering strategy

| Decision | Rationale |
|----------|-----------|
| Client-side `useState` | Instant filter response, no router/query churn |
| Filter IDs = service slugs | Maps 1:1 to `gallery.json` `serviceSlug` and `ASSET_MAP.services` |
| "All moments" shows 12 curated items | Avoids dumping all assets; quality over quantity |
| Per-filter shows curated + service gallery photos | Merges JSON captions with service asset-map gallery (deduped by `src`) |
| `aria-live` count | Screen readers announce result count on filter change |
| Tab semantics on filter pills | `role="tablist"` / `role="tab"` / `aria-selected` for keyboard accessibility |

**Filter labels (production):** Birthday Games, Corporate Games, School Events, Wedding Activities, Social Gatherings, Traditional Games, Game Festivals, Bollywood Games.

---

## Performance decisions

| Technique | Where |
|-----------|--------|
| `fetchPriority="high"` | Hero image only |
| `loading="lazy"` | All below-fold gallery images |
| `decoding="async"` | All gallery `<img>` tags |
| Explicit `width` / `height` | Grid and showcase cards (640×480, 960×600) |
| Fixed aspect-ratio containers | Prevents CLS during lazy load |
| Curated image limits | 12 (all) / 8 (filtered) reduces DOM and bandwidth |
| `useMemo` on filtered results | Avoids recomputing merge/dedupe on unrelated renders |
| Stats backdrop `aria-hidden` | Decorative background does not duplicate alt text |

---

## Trust-building rationale

1. **Real event captions** from legacy `gallery.html` ground photos in context (birthday Jenga, corporate challenge, wedding reception).
2. **Featured picks** mix moment PNGs and event gallery shots for energy and participation.
3. **Experience filters** let planners self-select proof relevant to their event type.
4. **Story blocks** add human context beyond captions (headcount, venue type, outcome).
5. **Stats overlay** reinforces scale without leaving the visual page.
6. **Service deep links** from stories connect proof to bookable packages.

---

## SEO

| Field | Value |
|-------|--------|
| Title | `Event Gallery \| The Game Hour` |
| Description | Experience keywords + Gujarat + event types |
| Canonical | `https://thegamehour.com/gallery` |
| OG image | `/og-default.jpg` |

---

## Files added / changed

```
src/data/gallery.json         (+ page content block)
src/data/types.ts             (+ GalleryPageContent types)
src/lib/gallery.ts            (+ resolve, filter, page getters)
src/lib/gallery-page.ts
src/sections/gallery/*.tsx    (7 sections + showcase card)
src/pages/GalleryPage.tsx     (replaces placeholder)
GALLERY_PAGE_DECISIONS.md
```

---

## QA checklist

- [ ] `/gallery` renders all 7 sections on mobile and desktop
- [ ] Filters update grid without page reload
- [ ] Active filter shows violet accent pill
- [ ] No em/en dashes in copy (`WRITING_STYLE_RULES.md`)
- [ ] Images lazy-load below hero
- [ ] Build passes (`npm run build`)
- [ ] Keyboard: filter pills focusable with visible focus ring
