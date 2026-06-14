# Trust Stats Update

**Phase:** Trust & Credibility  
**Date:** 2026-05-23  
**Scope:** Replace placeholder statistics, remove disclaimer copy, align all stat surfaces to verified numbers. No section redesign or layout changes beyond restoring the original four-column stat grid.

---

## Verified metrics (source of truth)

All production stat surfaces read from `src/data/site-stats.json`.

| ID | Value | Label |
|----|-------|-------|
| `events-hosted` | 50+ | Events Hosted |
| `participants` | 3,000+ | Participants Engaged |
| `games-conducted` | 100+ | Games Conducted |
| `cities-served` | 6 | Cities Served |

---

## Old values → new values

### Primary metrics (Home, About, Gallery, Hero badge)

| Metric | Old value | Old label | New value | New label |
|--------|-----------|-----------|-----------|-----------|
| Events | 500+ | Events hosted / Events Hosted | **50+** | **Events Hosted** |
| Participants | 25K+ / 2K+ | Happy participants / Participants | **3,000+** | **Participants Engaged** |
| Games | 100+ | Unique games & activities / Games conducted | **100+** | **Games Conducted** |
| Cities | 6+ | Cities across Gujarat / Cities Served | **6** | **Cities Served** |

### Removed metrics

| Metric | Last value | Reason |
|--------|------------|--------|
| Years Active | 4+ | Not in verified set |
| Corporate Clients | 50+ | Not in verified set |
| Schools Served | 30+ | Not in verified set |
| Photos captured (Gallery only) | 1K+ | Page-specific placeholder, replaced by shared verified set |
| Communities served (About/Gallery) | 50+ | Placeholder segment metric, removed |

### Removed copy

| Location | Removed text |
|----------|----------------|
| Home `HomeTrustedStats` | "Metrics are representative placeholders pending final verified numbers." |
| About `AboutTrustedStats` | Same disclaimer (was in `about.json`, then inline) |
| Gallery `GalleryStats` | Same disclaimer (was in `gallery.json`) |
| `site-stats.json` meta | "Update values when final verified numbers are available." |

---

## Files updated

| File | Change |
|------|--------|
| `src/data/site-stats.json` | Four verified metrics; removed corporate/schools/years; meta marked `client-verified` |
| `src/data/types.ts` | `SiteMetricId` trimmed to four IDs |
| `src/sections/home/HomeTrustedStats.tsx` | Uses shared metrics; grid restored to `lg:grid-cols-4` |
| `src/sections/home/HomeHero.tsx` | Hero badge fallback updated to 50+ / Events Hosted |
| `src/sections/about/AboutTrustedStats.tsx` | Shared metrics; four-column grid |
| `src/sections/gallery/GalleryStats.tsx` | Shared metrics; four-column grid |
| `src/pages/DesignPreviewPage.tsx` | Stat demo cards aligned to verified set |
| `src/pages/CoralThemePreviewPage.tsx` | Stat demo aligned |
| `src/pages/NewUiPreviewPage.tsx` | "After" stat card aligned (legacy "Before" column unchanged as UI comparison) |

### Already correct (no change required)

| File | Notes |
|------|-------|
| `src/lib/site-stats.ts` | Central getter; no hardcoded values |
| `src/components/StatCard/StatCard.tsx` | Presentational only |
| `src/data/about.json` | Section titles/subtitles only; metrics removed in prior pass |
| `src/data/gallery.json` | Stats section titles/subtitles only; no disclaimer remains |

---

## Audit coverage

| Surface | Route / context | Status |
|---------|-----------------|--------|
| Homepage trusted stats | `/` `#trusted` | ✅ Four verified metrics |
| Homepage hero badge | `/` hero | ✅ 50+ Events Hosted |
| About trusted stats | `/about` `#trusted` | ✅ Same four metrics |
| Gallery stats band | `/gallery` `#stats` | ✅ Same four metrics |
| StatCard component | Shared | ✅ No embedded values |
| Design preview pages | Dev-only routes | ✅ Aligned for consistency |

---

## Remaining trust-related concerns

These were **not** in scope for this pass but still affect credibility at launch:

1. **Staging booking URLs** — Bubble `version-test` links undermine conversion confidence; swap to production URLs before launch (`BOOKING_ROUTING_AUDIT.md`).
2. **Placeholder routes in nav** — `/contact` and `/game-library` still show "content migration pending" if visited from footer/nav.
3. **Testimonials** — Copy may read generic; named clients or verifiable quotes would strengthen proof (`LAUNCH_EXECUTION_PLAN.md` Phase 2.2).
4. **Client logos / named organizations** — Not yet on Home or Corporate service page (Phase 2.3).
5. **NewUiPreviewPage "Before" column** — Still shows legacy `500+ events hosted` intentionally as a UI before/after demo; not linked from production nav.
6. **Internal docs** — `WEBSITE_AUDIT_REPORT.md`, `HOMEPAGE_DECISIONS.md`, and `ABOUT_PAGE_DECISIONS.md` still reference old placeholder stats; update separately if docs should reflect launch state.

---

## How to update numbers later

Edit `src/data/site-stats.json` only. Home, About, Gallery, and the hero badge will stay in sync automatically.

```json
{ "id": "participants", "value": "3,000+", "label": "Participants Engaged" }
```

Do not reintroduce disclaimer text when values change; update the JSON and redeploy.
