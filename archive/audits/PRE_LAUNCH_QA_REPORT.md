# Pre-Launch QA Report

**Project:** TheGameHour-v2  
**Date:** 2026-05-23  
**Scope:** Homepage, About, Gallery, Services, all 8 Service Detail pages, Booking flow  
**Viewports reviewed:** Desktop, tablet, mobile (code audit + production build preview at `127.0.0.1:4173`)

---

## Executive Summary

The site is **functionally complete** for navigation, image rendering, lightbox, and structured data. **One launch blocker** remains: all booking CTAs still point to the Bubble **test** environment. Several content and UX mismatches should be fixed before launch.

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 3 |
| Medium | 8 |
| Low | 5 |

---

## Critical

### 1. All booking links go to Bubble staging (`version-test`)

**Files:** `src/data/content/booking-links.json`, all CTAs via `getDefaultBookingUrl()` / `resolveServiceCtaHref()`

```
default:   https://the-game-hour.bubbleapps.io/version-test/
corporate: https://the-game-hour.bubbleapps.io/version-test/corporate_booking
```

**Affected:** Navbar (desktop + mobile), Footer, Home/About/Gallery/Services/Contact CTAs, every service detail hero/final CTA/sticky bar. Corporate correctly uses the corporate URL (still test).

**Visitor impact:** Every “Book” action opens a staging booking form, not production.

**Fix:** Update `booking-links.json` with production Bubble URLs before deploy.

---

## High

### 2. Gallery story links to wrong service package

**Files:** `src/data/content/gallery-stories.json`, `src/data/gallery.json`, `src/sections/gallery/GalleryStories.tsx`

Story **“Community festival”** uses `gallery-6`, whose caption reads *“traditional game at a local festival”* and is tagged `traditional-games` in `gallery.json`. The story links to `/services/game-festival`.

**Visitor impact:** Photo, caption, and “View package” link tell three different stories. Users clicking through land on Game Festival, not Traditional Games.

---

### 3. Service card image tap opens lightbox instead of navigating

**Files:** `src/components/ServiceCard/ServiceCard.tsx`, `src/sections/services/ServicesAllExperiences.tsx`, `src/sections/home/HomeEventCategories.tsx`

Services page copy: *“Tap any card to see what’s included.”* The image is a `LightboxImage` button; only the text block below is a `<Link>` to the service page.

**Visitor impact:** Tapping the largest part of the card (the photo) opens fullscreen preview instead of the service detail page. Same on home event categories.

---

### 4. Sticky booking bar ignores per-service CTA labels

**File:** `src/components/ServiceStickyCta/ServiceStickyCta.tsx`

Hero buttons use specific labels (e.g. “Request a Corporate Games Proposal”). The sticky bar overrides any label containing `"Book"` to generic **“Book event”** — all 8 services match this condition.

**Visitor impact:** Bottom bar always shows a generic label while hero/final CTAs above use tailored copy.

---

## Medium

### 5. Testimonial subtitle grammar — “events events”

**Files:** `src/lib/content/testimonials.ts`, `src/sections/service/ServiceTestimonials.tsx`

Template: `"Organisers who chose The Game Hour for their {{serviceName}} events."`

For **School/College Events**, rendered text is:  
*"Organisers who chose The Game Hour for their **school/college events events**."*

Similar awkward phrasing on Game Festivals (*“game festivals events”*) and Wedding/Haldi (*“wedding/haldi activities events”*).

---

### 6. Social Gathering service hero headline typo

**File:** `src/data/services.json` (`social-gathering-games`)

Hero headline reads **“Social Gatherings Games”** (extra “s”). Service name is “Social Gathering Games”.

---

### 7. URL slug typo: “collage” instead of “college”

**Files:** `src/data/services.json`, `src/data/navigation.json`, `public/sitemap.xml`

Canonical slug: `school-and-collage-event`. Visible in browser URL bar, footer links, and sitemap.

---

### 8. Mobile menu: Services submenu stays expanded after close

**File:** `src/components/Navbar/Navbar.tsx`

`mobileServicesOpen` is not reset when the hamburger menu closes. Reopening the menu shows the Services submenu already expanded.

---

### 9. Invalid service slug silently redirects to services index

**File:** `src/pages/ServiceDetailPage.tsx`

`/services/not-a-real-slug` → redirect to `/services` with no message. Typos and old bookmarks get no explanation.

---

### 10. 404 page is visually bare

**File:** `src/pages/NotFoundPage.tsx`

Plain heading and “Return home” link inside `container-app`. Nav/footer render, but the page lacks the design-system hero/CTA treatment used elsewhere.

---

### 11. Single testimonial in a two-column grid on service pages

**File:** `src/sections/service/ServiceTestimonials.tsx`

Grid uses `md:grid-cols-2` but 7 of 8 services have only one testimonial (corporate has 2). On desktop/tablet, one card sits beside empty space.

---

### 12. Desktop nav: “Services” not highlighted on service detail pages

**File:** `src/components/Navbar/Navbar.tsx`

Services is a dropdown `<button>`, not a `NavLink`. Visiting `/services/birthday-games` does not mark “Services” as active.

---

## Low

### 13. Nested `<main>` landmarks on several pages

**Files:** `src/layouts/MainLayout.tsx` (outer `<main>`), `AboutPage`, `GalleryPage`, `ServicesPage`, `ServiceDetailPage`, `NotFoundPage` (inner `<main>`)

Screen readers encounter nested main landmarks. Not visually obvious but affects accessibility tooling.

---

### 14. Body scroll lock can conflict (mobile menu + lightbox)

**Files:** `src/components/Navbar/Navbar.tsx`, `src/components/ImageLightbox/ImageLightbox.tsx`

Both set `document.body.style.overflow`. Closing the lightbox while the mobile menu is open may restore page scroll while the menu overlay is still visible.

---

### 15. Floating WhatsApp/call FABs disabled

**Files:** `src/utils/constants.ts` (`FEATURE_FLAGS.floatingCta: false`), `src/components/FloatingActions/FloatingActions.tsx`

Component returns `null`. WhatsApp remains available in footer and page CTAs; only floating buttons are absent.

---

### 16. Service hero lightbox is single-image only

**File:** `src/sections/service/ServiceDetailHero.tsx`

Hero image opens lightbox without gallery navigation. Service gallery section below supports full gallery. Functional but inconsistent.

---

### 17. Testimonials marked “draft” in content metadata

**File:** `src/data/content/testimonials.json` — `"status": "draft"`

Content displays correctly. Metadata suggests copy may not be final sign-off.

---

## Verified OK

### Routing & navigation

| Check | Result |
|-------|--------|
| Home `/` | ✅ |
| About `/about` | ✅ |
| Gallery `/gallery` | ✅ |
| Services `/services` | ✅ |
| Contact `/contact` | ✅ |
| All 8 service detail slugs | ✅ |
| Legacy URL redirects | ✅ |
| Preview routes in production | ✅ Redirect home (`ProductionRedirect`) |
| Navbar links | ✅ Match router |
| Footer quick links + 8 service links | ✅ Match router |
| Mobile menu navigation | ✅ Works (submenu state issue noted above) |

**Service slugs verified:** `birthday-games`, `corporate-games`, `social-gathering-games`, `game-festival`, `school-and-collage-event`, `wedding-or-haldi-games`, `traditional-games`, `bollywood-games`

---

### Images

| Check | Result |
|-------|--------|
| Source assets under `src/assets/images/` | ✅ 181 files after `npm run assets:migrate` |
| Production build bundles photos | ✅ 145 files in `dist/assets/` |
| Homepage hero | ✅ Loads (HTTP 200) |
| Service title cards / sliders | ✅ Present per slug |
| Gallery grid images | ✅ Present |
| Logo (navbar/footer) | ✅ `logo-dark.webp` resolves |
| Broken image fallbacks | ✅ Placeholder only when asset path missing (not observed with migrated assets) |
| OG images in `public/` | ✅ `og-default.jpg`, `og/social-preview.jpg`, `og/gallery.jpg`, 8× `og/services/*.jpg` (HTTP 200 on preview) |

**Deploy note:** Run `npm run assets:migrate && npm run assets:og-public` before build if image binaries are not in the repo.

---

### Lightbox

| Check | Result |
|-------|--------|
| `LightboxProvider` in layout | ✅ |
| Gallery page | ✅ Multi-image gallery with prev/next |
| Service gallery sections | ✅ |
| Home moments / about images | ✅ |
| Keyboard (Escape, arrows) | ✅ Implemented |
| Focus trap | ✅ Implemented |
| Mobile swipe hint | ✅ Shown when multiple images |

---

### Booking flow

| Check | Result |
|-------|--------|
| Navbar Book button | ⚠️ Works but **test URL** |
| Footer Book + WhatsApp | ⚠️ Works but **test URL** |
| Home / About / Gallery / Services / Contact CTAs | ⚠️ Test URL |
| Service detail hero CTA | ⚠️ Test URL; corporate → corporate form |
| Sticky CTA (mobile + desktop) | ⚠️ Test URL |
| `tel:` and `mailto:` links | ✅ Valid |
| WhatsApp deep link | ✅ `https://wa.me/919924007700` |

---

### Testimonials

| Page | Count | Displays |
|------|-------|----------|
| Home | 3 | ✅ Outcome lines + quotes |
| Birthday Games | 1 | ✅ |
| Corporate Games | 2 | ✅ |
| Social Gathering | 1 | ✅ |
| Game Festival | 1 | ✅ |
| School/College | 1 | ✅ |
| Wedding/Haldi | 1 | ✅ |
| Traditional Games | 1 | ✅ |
| Bollywood Games | 1 | ✅ |

---

### Structured data

| Schema | Scope | Result |
|--------|-------|--------|
| Organization | Global | ✅ Valid JSON-LD from `company-info.json` |
| LocalBusiness | Global | ✅ Valid JSON-LD |
| FAQPage | Each service detail | ✅ Built from `getFaqsForService()`; no runtime errors |
| Canonical tags | All public pages | ✅ |
| `robots.txt` / `sitemap.xml` | Static | ✅ HTTP 200 on preview |

No structured-data parse errors expected in Rich Results Test (manual post-deploy check recommended).

---

### Console & performance

| Check | Result |
|-------|--------|
| `console.log` / `console.error` in `src/` | ✅ None found |
| Production build | ✅ Passes |
| Clarity analytics | ✅ Production-only, single init, SPA tracking |
| Layout shift mitigation | ✅ Hero/service images use explicit `width`/`height` and aspect-ratio classes |
| Sticky CTA overlap | ✅ `pb-sticky-cta` padding on service detail pages |

---

## Launch Readiness

| Requirement | Status |
|-------------|--------|
| Pages load and navigate correctly | ✅ Ready |
| Images load (with migrated assets) | ✅ Ready |
| Lightbox functional | ✅ Ready |
| SEO assets (canonical, OG, sitemap, schema) | ✅ Ready |
| Booking flow | ❌ **Blocked** — swap to production URLs |
| Content accuracy (gallery story, typos) | ⚠️ Fix recommended |

### Must fix before launch

1. **Production booking URLs** in `booking-links.json`

### Should fix before launch

2. Gallery story #3 service/link mismatch  
3. Service card tap behavior vs page copy  
4. Sticky CTA label consistency  
5. School/College testimonial subtitle double “events”

### Can ship with known low/medium items

Mobile submenu state, 404 styling, nested `<main>`, single-testimonial grid layout, slug typo “collage”, floating FABs off.

---

## Manual post-deploy checklist

- [ ] Open each page on real phone (375px) — confirm sticky CTA doesn’t cover FAQ accordion
- [ ] Tap Book on corporate service → corporate Bubble form (production URL)
- [ ] Facebook/LinkedIn link debugger on Home + one service page
- [ ] Google Rich Results Test on `/services/corporate-games`
- [ ] Submit `https://thegamehour.com/sitemap.xml` in Search Console

**Overall:** Launch-ready after booking URLs are updated. No other SEO or routing blockers found.
