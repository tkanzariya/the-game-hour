# Services Page Removal Report

**Date:** 2026-05-23  
**Reason:** Service discovery moves to homepage experience cards, footer service links, and direct service URLs.

---

## Summary

The standalone `/services` index page has been removed. Service detail routes (`/services/:slug`) remain. Invalid slugs show a branded 404 instead of redirecting to a services hub.

---

## Routes Removed

| Route | Previous behavior | New behavior |
|-------|-------------------|--------------|
| `/services` (index) | `ServicesPage` | Redirect → `/#experiences` on homepage |

**Still active:**

| Route | Component |
|-------|-----------|
| `/services/:slug` | `ServiceDetailPage` |
| `/services/invalid-slug` | `NotFoundPage variant="service"` |

---

## Redirects Removed / Updated

| Source | Before | After |
|--------|--------|-------|
| Invalid service slug | `Navigate` → `/services` | Branded `NotFoundPage` (service variant) |
| `/game-library` (prod) | → `/services` | → `/#experiences` |
| `/game-library` (dev) | → `/services` | → `/#experiences` |
| Legacy redirect (missing slug) | → `/services` | → `/#experiences` |
| Bare `/services` | Services index page | → `/#experiences` |

Legacy per-event redirects (e.g. `/corporate-events` → `/services/corporate-games`) **unchanged**.

---

## Links Updated

### Navigation (`src/data/navigation.json`)

| Removed | Kept |
|---------|------|
| Main nav: "Services" | Home, About, Gallery, Contact |
| Footer quick link: "Our Experiences" → `/services` | About, Gallery, Contact |
| — | Footer service links (8 direct detail URLs) |

### Navbar (`src/components/Navbar/Navbar.tsx`)

- Removed Services dropdown (desktop + mobile submenu)
- Flat nav: Home · About · Gallery · Contact · Book

### CTAs → `/#experiences`

| File | Previous target |
|------|-----------------|
| `src/sections/home/HomeHero.tsx` | Explore experiences button + trust link |
| `src/sections/home/HomeEventCategories.tsx` | Removed redundant "View all services" button (cards already on page) |
| `src/sections/about/AboutHero.tsx` | Explore experiences |
| `src/sections/about/AboutExperiencesInvite.tsx` | Primary CTA |
| `src/pages/DesignPreviewPage.tsx` | View services |

### New route helper

```typescript
// src/constants/routes.ts
export const HOME_SECTIONS = { experiences: 'experiences' }
export const homeExperiencesPath = '/#experiences'
```

---

## Components Deleted

| Path | Description |
|------|-------------|
| `src/pages/ServicesPage.tsx` | Services index page |
| `src/lib/services-page.ts` | Services page content getters |
| `src/sections/services/ServicesPageHero.tsx` | |
| `src/sections/services/ServicesAllExperiences.tsx` | |
| `src/sections/services/ServicesWhoWeServe.tsx` | |
| `src/sections/services/ServicesGalleryInvite.tsx` | |
| `src/sections/services/ServicesFinalCta.tsx` | |
| `src/sections/services/index.ts` | |

**Export removed:** `ServicesPage` from `src/pages/index.ts`

**Not deleted:** `src/lib/services.ts`, `src/data/services.json` — still power service detail pages and homepage cards.

---

## Branded 404 for Invalid Service Slugs

**File:** `src/pages/NotFoundPage.tsx`

Added `variant="service"` prop:

- Headline: "We couldn't find that experience"
- CTAs: Back to home · Browse experiences (`/#experiences`) · Book your event
- `noIndex` SEO meta

**File:** `src/pages/ServiceDetailPage.tsx`

```tsx
if (!service) return <NotFoundPage variant="service" />
```

Also removed nested `<main>` (layout already provides one).

---

## SEO Updates

| Asset | Change |
|-------|--------|
| `public/sitemap.xml` | Removed `https://thegamehour.com/services` |
| Service detail URLs | Unchanged (8 slugs) |

---

## Service Discovery Paths (Post-Removal)

1. **Homepage** — `#experiences` section with 8 `ServiceCard` components
2. **Footer** — 8 service links under "Services" column
3. **Direct URLs** — `/services/{slug}`
4. **About page** — CTA to `/#experiences`
5. **Legacy URLs** — still redirect to canonical service slugs

---

## Files Modified

| File | Change |
|------|--------|
| `src/router.tsx` | Remove ServicesPage route; `/services` → experiences redirect |
| `src/constants/routes.ts` | Remove `ROUTES.services`; add `homeExperiencesPath` |
| `src/components/Navbar/Navbar.tsx` | Remove Services dropdown |
| `src/components/LegacyServiceRedirect.tsx` | Fallback → experiences |
| `src/pages/GameLibraryPage.tsx` | Redirect → experiences |
| `src/pages/ServiceDetailPage.tsx` | Invalid slug → branded 404 |
| `src/pages/NotFoundPage.tsx` | Branded layout + service variant |
| `src/data/navigation.json` | Remove Services links |
| `public/sitemap.xml` | Remove /services entry |

---

## Verification

- [x] `npm run build` passes
- [x] `/services/birthday-games` loads service detail
- [x] `/services/not-real` shows branded 404
- [x] `/services` redirects to `/#experiences`
- [x] No remaining `ROUTES.services` references in `src/`
