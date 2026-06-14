# Broken Link Audit

**Audit date:** 2026-05-23  
**Goal:** No visitor-facing navigation leads to a dead end before launch.

**Build verified:** `npm run build` passes after fixes.

---

## Executive summary

| Issue type | Found | Fixed |
|------------|-------|-------|
| Placeholder pages in nav | 2 (`/contact`, `/game-library`) | 2 |
| Dev preview routes in production | 3 | 3 (redirect home) |
| Footer dead-end link | 1 (`/game-library`) | 1 |
| Invalid service slugs in nav | 0 | — |
| Orphan routed pages | 0 | — |
| Booking CTAs → `/contact` | 0 (prior audit) | — |

**Result:** All visible nav, footer, mobile menu, card, and CTA links resolve correctly for launch.

---

## Issues found (pre-fix)

### Critical — visitor dead ends

| Link source | Destination | Problem |
|-------------|-------------|---------|
| Navbar → Contact | `/contact` | `PlaceholderPage` — bare `<h1>` only |
| Footer → Contact | `/contact` | Same |
| Footer → Our Games | `/game-library` | `PlaceholderPage` — no content |

### Medium — production exposure

| Route | Problem |
|-------|---------|
| `/design-preview` | Internal QA page reachable in production |
| `/new-ui-preview` | Theme comparison page reachable in production |
| `/theme-preview/coral` | Archived theme preview reachable in production |

### Low — not visitor-facing

| Item | Notes |
|------|-------|
| Orphan page files (`*EventsPage.tsx`) | Not in router — no nav links |
| `PlaceholderPage.tsx` | Used only by removed live routes |
| Preview pages link to `/contact` | Dev-only; gated in prod |
| `FloatingActions` | Disabled via `FEATURE_FLAGS.floatingCta` |

---

## Fixes applied

### 1. Contact page — replaced placeholder

**File:** `src/pages/ContactPage.tsx`

| Before | After |
|--------|-------|
| `PlaceholderPage` stub | Real page: `PageHero` + phone, email, location cards |
| No actionable contact | Book + WhatsApp CTAs + `tel:` / `mailto:` links |

**Nav links preserved** — Contact remains in navbar and footer.

---

### 2. Game library — redirect + footer relink

| Change | Detail |
|--------|--------|
| **Footer link** | `"Our Games" → /game-library` changed to `"Our Experiences" → /services` in `navigation.json` |
| **Production route** | `/game-library` → redirect to `/services` via `Navigate` in `router.tsx` |
| **Dev route** | `/game-library` still registered; `GameLibraryPage` redirects to `/services` (bookmark compatibility) |

**File:** `src/pages/GameLibraryPage.tsx` — now `<Navigate to={ROUTES.services} replace />`

---

### 3. Preview routes — production gated

**File:** `src/router.tsx`

| Route | Development | Production |
|-------|-------------|------------|
| `/design-preview` | `DesignPreviewPage` | `ProductionRedirect` → `/` |
| `/new-ui-preview` | `NewUiPreviewPage` | `ProductionRedirect` → `/` |
| `/theme-preview/coral` | `CoralThemePreviewPage` | `ProductionRedirect` → `/` |

**New component:** `src/components/ProductionRedirect/ProductionRedirect.tsx`

Gated via `import.meta.env.DEV` — preview bundles still ship but routes redirect instantly in production builds.

---

## Links removed

| Link | Location | Replaced with |
|------|----------|--------------|
| Footer “Our Games” → `/game-library` | `navigation.json` | “Our Experiences” → `/services` |

No navbar links removed.

---

## Links redirected

| From | To | Mechanism | Preserves bookmarks |
|------|-----|-----------|---------------------|
| `/game-library` | `/services` | SPA `Navigate replace` | Yes |
| `/design-preview` | `/` | `ProductionRedirect` (prod only) | N/A (dev route) |
| `/new-ui-preview` | `/` | `ProductionRedirect` (prod only) | N/A |
| `/theme-preview/coral` | `/` | `ProductionRedirect` (prod only) | N/A |
| Invalid `/services/:slug` | `/services` | `ServiceDetailPage` | — |
| 8 legacy service URLs | `/services/{slug}` | `LegacyServiceRedirect` | Yes |

---

## Routes disabled (production)

Preview routes do not render content in production builds. They redirect to home instead of 404 to avoid dead ends from old bookmarks or docs links.

---

## Navigation systems verified

### Navbar + mobile menu

| Element | Targets | Status |
|---------|---------|--------|
| Logo | `/` | OK |
| Main links (5) | `/`, `/about`, `/services`, `/gallery`, `/contact` | OK |
| Services dropdown (8) | All valid service slugs | OK |
| View all services | `/services` | OK |
| Book button | External Bubble URL | OK |

### Footer

| Column | Targets | Status |
|--------|---------|--------|
| Logo | `/` | OK |
| Quick links (4) | `/about`, `/services`, `/gallery`, `/contact` | OK |
| Service links (8) | All valid service slugs | OK |
| Contact column | `tel:`, `mailto:`, social externals | OK |
| Plan CTA | Book + WhatsApp externals | OK |

### In-page CTAs and cards

| Component | Internal links | Status |
|-----------|--------------|--------|
| `HomeHero` | `/services` | OK |
| `HomeEventCategories` | `/services/{slug}` | OK |
| `HomeGalleryMoments` | `/gallery` | OK |
| `AboutExperiencesInvite` | `/services`, `/#trusted` | OK |
| `AboutGalleryInvite` | `/gallery` | OK |
| `ServicesWhoWeServe` | `/services/{slug}` | OK |
| `ServicesAllExperiences` | `/services/{slug}` | OK |
| `GalleryStories` | `/services/{slug}` | OK |
| `ServiceCard` | `/services/{slug}` | OK |
| All `*FinalCta` | External book + WhatsApp | OK |
| `ServiceStickyCta` | External book + WhatsApp | OK |

---

## Remaining concerns

| Item | Severity | Recommendation |
|------|----------|----------------|
| **404 page styling** | Low | `NotFoundPage` is minimal; add branded 404 + links to Services (post-launch polish) |
| **Orphan page files** | Low | Delete `*EventsPage.tsx` and `PlaceholderPage.tsx` in cleanup pass |
| **Staging booking URLs** | Medium | `booking-links.json` still points to Bubble `version-test` — update before launch (content, not routing) |
| **Game library feature** | Low | When built, add route + nav item; until then redirect is correct |
| **FloatingActions** | Low | Feature flag off; WhatsApp/call available via footer and contact page |
| **Hash link `/#trusted`** | OK | HomeTrustedStats section id verified on homepage |

---

## Launch checklist

- [x] Navbar has no placeholder destinations
- [x] Footer has no placeholder destinations
- [x] Mobile menu matches navbar
- [x] `/contact` is a real page
- [x] `/game-library` redirects (footer no longer links there)
- [x] Preview routes gated in production
- [x] All 8 service footer/dropdown slugs valid
- [x] Invalid service slugs redirect to `/services`
- [x] Legacy URLs redirect to canonical service pages
- [x] Booking CTAs use external URLs (not `/contact`)
- [x] Production build passes

---

## Files changed in this audit

| File | Change |
|------|--------|
| `src/pages/ContactPage.tsx` | Real contact page |
| `src/pages/GameLibraryPage.tsx` | Redirect to services |
| `src/router.tsx` | Dev/prod route gating, game-library redirect |
| `src/components/ProductionRedirect/` | New production redirect component |
| `src/data/navigation.json` | Footer quick link updated |
| `ROUTE_INVENTORY.md` | Created |
| `BROKEN_LINK_AUDIT.md` | Created |

---

## Related documents

- `ROUTE_INVENTORY.md` — full route catalog
- `BOOKING_ROUTING_AUDIT.md` — booking CTA external URL audit
- `LAUNCH_EXECUTION_PLAN.md` — launch task tracking
