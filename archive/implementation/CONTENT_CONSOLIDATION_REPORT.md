# Content Consolidation Report

**Phase:** Content Consolidation  
**Date:** 2026-05-23  
**Reference:** `TRUST_AUTHORITY_PLAN.md` Task 6  
**Scope:** Reduce repeated trust/content sections across pages. No redesign, no new routes, no performance work.

---

## Goal

Each page should have one clear job. Visitors browsing Home → About → Gallery → Services should not encounter the same stats band, photo grid, or audience map twice.

---

## Task 1 — Content ownership map

| Content type | Primary owner | Secondary (allowed) | Removed from |
|--------------|---------------|---------------------|--------------|
| **Verified stats (4 metrics)** | Homepage `#trusted` | Hero badge only | About, Gallery |
| **Testimonials** | Homepage `#testimonials` | Service detail (per slug) | — (unchanged) |
| **Why Us / differentiators** | Homepage `HomeWhyUs` | — | About (differentiators removed) |
| **Gallery photos (full)** | Gallery page | — | Services preview grid |
| **Gallery teaser (4 photos)** | Homepage `#moments` | — | Reduced from 6 → 4 |
| **Event stories (short)** | Gallery `#stories` | — | — |
| **Who we serve** | Services `#who-we-serve` | — | About audience grid |
| **Brand story + journey** | About `#story` | — | — |
| **Brand philosophy** | About `#believe-in-play` | — | — |
| **Service discovery** | Services (hero + all experiences) | Home event categories (entry point) | — |
| **Service-specific proof** | Service detail (gallery + testimonials) | — | — |

### Page purpose after consolidation

| Page | Purpose |
|------|---------|
| **Home** | Convert: proof (stats), differentiation (why us), social proof (testimonials), teaser → Gallery |
| **About** | Believe: origin story, milestones, philosophy; route to Services & Gallery |
| **Gallery** | Show: full visual proof + event stories |
| **Services** | Choose: audiences + eight packages; link to Gallery for photos |
| **Service detail** | Decide + book: service proof, FAQ, scoped testimonials |

---

## Task 2 & 3 — What changed

### Homepage (unchanged structure, refined teaser)

| Section | Status |
|---------|--------|
| Hero, Trusted Stats, Event Categories, Why Us, Testimonials, How It Works, Final CTA | **Kept** |
| Gallery moments | **Trimmed** to 4 items (2×2 grid); copy from `content/stats.json` → `homeGalleryTeaser` |

### About page

| Removed | Replaced with | Why |
|---------|---------------|-----|
| `AboutTrustedStats` | — (story milestones + link to `/#trusted`) | Stats owned by Home |
| `AboutDifferentiators` | — (`AboutBelieveInPlay` covers philosophy; Why Us on Home) | Duplicate of Home Why Us |
| `AboutMomentsGallery` (6-photo grid) | `AboutGalleryInvite` (1 featured photo + CTA) | Gallery owns visual proof |
| `AboutWhoWeServe` (6-card grid) | `AboutExperiencesInvite` (CTA → Services + link to stats) | Services owns audience map |

**New About flow:** Hero → Story → Believe in Play → Gallery Invite → Experiences Invite → Final CTA

### Gallery page

| Removed | Replaced with | Why |
|---------|---------------|-----|
| `GalleryStats` (4-metric band) | — | Same stats as Home; Gallery focuses on photos + stories |

**Gallery flow:** Hero → Featured → Browse → Stories → Final CTA

### Services page

| Removed | Replaced with | Why |
|---------|---------------|-----|
| `ServicesGalleryPreview` (6-photo grid) | `ServicesGalleryInvite` (text CTA band) | Gallery owns photos; Services points there |

**Services flow:** Hero → All Experiences → Who We Serve → Gallery Invite → Final CTA

### Service detail

No changes. Testimonials, service gallery, and FAQ remain scoped to each package.

---

## Task 4 — Replacements (not blind removal)

| Page | Removed section | Replacement behavior |
|------|-----------------|----------------------|
| About | Stats band | `AboutExperiencesInvite` links to `/#trusted` for impact numbers |
| About | 6-photo gallery | `AboutGalleryInvite`: one featured image + “Browse event gallery” |
| About | Who we serve grid | `AboutExperiencesInvite`: “Explore experiences” → `/services` |
| Services | 6-photo preview | `ServicesGalleryInvite`: explains full proof lives on Gallery |
| Home | 6-photo teaser | 4-photo teaser with updated copy (“A glimpse of the energy”) |
| Gallery | Stats band | Visual density from browse grid + stories carries proof |

All replacement copy lives in data files:

- `src/data/about.json` → `galleryInvite`, `experiencesInvite`
- `src/data/services.json` → `servicesPage.galleryInvite`
- `src/data/content/stats.json` → `homeGalleryTeaser`, stats `sections.home` only

---

## Files removed

| File | Reason |
|------|--------|
| `src/sections/about/AboutTrustedStats.tsx` | Stats consolidated to Home |
| `src/sections/about/AboutDifferentiators.tsx` | Overlapped Home Why Us |
| `src/sections/about/AboutMomentsGallery.tsx` | Replaced by AboutGalleryInvite |
| `src/sections/about/AboutWhoWeServe.tsx` | Replaced by AboutExperiencesInvite |
| `src/sections/gallery/GalleryStats.tsx` | Stats consolidated to Home |
| `src/sections/services/ServicesGalleryPreview.tsx` | Replaced by ServicesGalleryInvite |

## Files added

| File | Role |
|------|------|
| `src/sections/about/AboutGalleryInvite.tsx` | Single-image gallery CTA |
| `src/sections/about/AboutExperiencesInvite.tsx` | Services + stats cross-links |
| `src/sections/services/ServicesGalleryInvite.tsx` | Gallery CTA without photo grid |

## Files updated

| File | Change |
|------|--------|
| `src/pages/AboutPage.tsx` | New section lineup |
| `src/pages/GalleryPage.tsx` | Removed GalleryStats |
| `src/pages/ServicesPage.tsx` | Gallery invite instead of preview |
| `src/sections/home/HomeGalleryMoments.tsx` | 4-item teaser from content JSON |
| `src/data/about.json` | Removed differentiators/moments/audiences; added invites |
| `src/data/content/stats.json` | Home-only stats section + gallery teaser config |
| `src/data/services.json` | Added `galleryInvite` under `servicesPage` |
| `src/data/types.ts` | Updated About + Services page types |
| `src/lib/about-page.ts` | New getters; removed obsolete getters |
| `src/lib/services-page.ts` | `getServicesPageGalleryInvite()` |
| `src/lib/content/stats.ts` | `getHomeGalleryTeaser()` |
| `src/lib/gallery-page.ts` | Removed `getGalleryStats()` |

---

## UX impact

### Positive

- **Less templated feel:** Browsing four main pages no longer repeats the same stats band three times or the same six-photo layout three times.
- **Clearer mental model:** Home = proof + quotes; Gallery = photos; Services = pick your crowd; About = why we exist.
- **Shorter About page:** Focus on narrative instead of re-proving with numbers and grids.
- **Intentional cross-links:** About and Services now *point* to owned content instead of duplicating it.

### Trade-offs

- **About no longer shows stats inline.** Users who land on About first must follow “See our impact in numbers” to Home `#trusted`. Acceptable: About is story-first.
- **Services has no inline photos.** One extra click to Gallery. Acceptable: Services is selection-first; service detail still has photos.
- **Home shows 4 gallery thumbs instead of 6.** Stronger “teaser not duplicate” signal; full set on Gallery.

### Unchanged

- Service detail pages still carry service-specific gallery + testimonials (appropriate depth for decision stage).
- Home still has stats, testimonials, and why us (primary trust stack).

---

## Before vs after (section counts)

| Signal | Before (max repeats) | After |
|--------|------------------------|-------|
| Stats band | 3 (Home, About, Gallery) | **1** (Home) |
| Multi-photo gallery grid | 3 (Home 6, About 6, Services 6) | **1 full** (Gallery) + **1 teaser** (Home 4) |
| Who we serve grid | 2 (About 6, Services 5) | **1** (Services) |
| Why us / differentiators | 2 (Home, About) | **1** (Home) + About philosophy pillars |

---

## Related docs

- `TRUST_AUTHORITY_PLAN.md` — trust strategy and consolidation rationale
- `CONTENT_MANAGEMENT_GUIDE.md` — how to edit consolidated content JSON
- `TRUST_STATS_UPDATE.md` — verified stat values

---

## Build status

`npm run build` passes after consolidation.
