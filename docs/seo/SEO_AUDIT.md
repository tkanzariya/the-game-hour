# SEO Audit

**Date:** 2026-05-23  
**Scope:** Home, About, Gallery, Services, all 8 service detail pages  
**Stack:** `react-helmet-async` via `Seo` + `buildSeo()` in `src/utils/seo.ts`

---

## Executive summary

| Area | Status | Priority |
|------|--------|----------|
| Title tags | Good baseline; room for local keywords | Low |
| Meta descriptions | Present on all pages; mostly 95–133 chars | Medium — extend toward 150 |
| OG tags | Rendered but **image URL likely broken** | **Critical** |
| Canonical URLs | Set in page config but **not emitted as `<link rel="canonical">`** | **Critical** |
| H1 structure | One H1 per page on all audited routes | OK |
| JSON-LD schema | **None implemented** | High opportunity |
| robots.txt / sitemap | **Missing** | High |
| Twitter cards | `summary_large_image` set | OK |

**Launch blockers:** canonical link tag, resolvable OG image at a stable absolute URL.

---

## Global SEO infrastructure

### What works

- Central `buildSeo()` appends `| The Game Hour` when title omits brand name
- Each marketing page sets `title`, `description`, `canonical`, `ogImage`
- Service pages derive metadata from `services.json` dynamically
- `HelmetProvider` wraps the app (`src/main.tsx`)
- 404 uses `noindex,nofollow`
- Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`
- Twitter: `summary_large_image`, title, description, image

### Gaps in `Seo.tsx`

| Missing tag | Impact |
|-------------|--------|
| `<link rel="canonical" href="...">` | Google may index duplicate URLs; canonical in config is unused for crawlers |
| `og:image:width` / `og:image:height` | Weaker social preview reliability |
| `og:locale` | Minor; `company-info.json` has `en_IN` |
| `twitter:site` / `@handle` | Optional if brand account exists |
| JSON-LD `<script type="application/ld+json">` | No rich results (FAQ, local business, breadcrumbs) |

### OG image system issue

Pages hardcode:

```ts
ogImage: `${SITE.url}${PUBLIC_ASSETS.ogDefaultJpg}` // → https://thegamehour.com/og-default.jpg
```

**Problem:** `public/og-default.jpg` is **not present** in the repo (only `favicon.svg`, `icons.svg`, `.htaccess` in `public/`). Crawlers and social debuggers will 404 the OG image.

`getOgImageUrl()` in `src/lib/assets.ts` resolves the bundled `seo/og-default` asset correctly at runtime but **is not used** by page-level SEO config.

**Service OG images:** `getServiceOgImageUrl()` prefixes `SITE.url` onto Vite-bundled asset paths (e.g. `/assets/title-card-*.webp`). Issues:

- Hash changes every build → broken bookmarks in social caches
- With `base: './'`, paths may be relative (`./assets/...`) → invalid absolute URLs when concatenated
- Fallback `${SITE.url}/og-default.jpg` has same missing-file problem

---

## Page-by-page audit

### Home (`/`)

| Field | Current value | Status |
|-------|---------------|--------|
| **Title** | `The Game Hour \| Screen-Free Event Games in Gujarat` | Strong — brand + primary keyword |
| **Meta description** | Book facilitator-led birthday, wedding, corporate… (~130 chars) | Good; add Gujarat city names or CTA to reach ~155 |
| **Canonical** | `https://thegamehour.com` | Set in config — **not in `<head>`** |
| **OG image** | `https://thegamehour.com/og-default.jpg` | **Likely 404** |
| **H1** | `Real laughter.` + `Zero screen time.` | One H1; differs from title (acceptable) |
| **OG type** | `website` | OK |

**Fixes:** Add canonical tag; use `getOgImageUrl()` or copy OG asset to `public/`; consider `WebSite` + `Organization` schema.

---

### About (`/about`)

| Field | Current value | Status |
|-------|---------------|--------|
| **Title** | `Our Story | The Game Hour` | OK; could add “Gujarat” for local SEO |
| **Meta description** | Discover why The Game Hour exists… (~150 chars) | Good length |
| **Canonical** | `https://thegamehour.com/about` | Config only |
| **OG image** | Site default (broken path) | Generic; no about-specific image |
| **H1** | `We bring people back together, one game at a time.` | One H1; aligns with brand story |

**Fixes:** Canonical tag; optional dedicated OG (team/event photo); `AboutPage` schema via `Organization`.

---

### Gallery (`/gallery`)

| Field | Current value | Status |
|-------|---------------|--------|
| **Title** | `Event Gallery | The Game Hour` | OK |
| **Meta description** | Browse real photos from birthday, corporate… (~130 chars) | Good; mention “Ahmedabad” optionally |
| **Canonical** | `https://thegamehour.com/gallery` | Config only |
| **OG image** | Site default (broken) | **Missed opportunity** — use gallery hero or `social-preview` asset |
| **H1** | `Our Event Gallery` (from `gallery.json`) | One H1; close to title |

**Fixes:** OG image from `ASSET_MAP.gallery.hero` or `ASSET_MAP.seo.socialPreview`; `ImageGallery` / `ItemList` schema for featured photos.

---

### Services (`/services`)

| Field | Current value | Status |
|-------|---------------|--------|
| **Title** | `Event Game Services | The Game Hour` | OK |
| **Meta description** | Birthday, corporate, wedding, school, festival… (~120 chars) | Good; slightly short |
| **Canonical** | `https://thegamehour.com/services` | Config only |
| **OG image** | Site default (broken) | Generic |
| **H1** | `Every celebration deserves real laughter` | One H1; differs from title (hero copy vs SEO title — OK) |

**Fixes:** Extend description; `ItemList` schema for 8 services; canonical + OG fixes.

---

### Service detail pages (`/services/:slug`)

All use `ServiceDetailPage` → `buildSeo({ title: service.name, description: service.shortDescription, canonical: getServiceCanonicalUrl(), ogImage: getServiceOgImageUrl() })`.

| Slug | Title tag | Meta description (chars) | H1 (hero) | Title ↔ H1 match |
|-------|-----------|------------------------|-----------|------------------|
| `birthday-games` | Birthday Games \| The Game Hour | 100 | Birthday Games | Yes |
| `corporate-games` | Corporate Games \| The Game Hour | 104 | Corporate Games | Yes |
| `social-gathering-games` | Social Gathering Games \| The Game Hour | 100 | Social Gatherings Games | Close |
| `game-festival` | Game Festivals \| The Game Hour | 99 | Society & Community Game Festivals | **Mismatch** |
| `school-and-collage-event` | School/College Events \| The Game Hour | 95 | School & College Sports Events | **Mismatch** |
| `wedding-or-haldi-games` | Wedding/Haldi Activities \| The Game Hour | 95 | Wedding & Haldi Event Games | **Mismatch** |
| `traditional-games` | Traditional Games \| The Game Hour | 132 | The Classic Traditional Games Festival | **Mismatch** |
| `bollywood-games` | Bollywood Games \| The Game Hour | 133 | The Ultimate Bollywood Game Event | **Mismatch** |

**Common issues (all 8):**

- Canonical URLs correctly formed — **not emitted in HTML**
- OG images per service — **unstable/broken URL construction**
- Descriptions lack “Gujarat” on most (except implied in site copy)
- FAQ sections exist but **no `FAQPage` schema**
- Invalid slug redirects to `/services` (good) but no SEO on redirect

**Fixes:** Add optional `seo.title` / `seo.description` in `services.json`; align `name` with H1 or accept mismatch; stable public OG images per service; `Service` + `FAQPage` JSON-LD.

---

## Schema opportunities

| Schema type | Where | Data source | Benefit |
|-------------|-------|-------------|---------|
| **Organization** | All pages (site-wide) | `company-info.json` | Brand knowledge panel |
| **LocalBusiness** | Home, Contact | `contact` + `site` | Local pack / maps signals |
| **WebSite** | Home | `site.url`, `site.name` | Sitelinks search box (optional) |
| **Service** | Each service page | `name`, `shortDescription`, `eventTypes`, booking URL | Rich service understanding |
| **FAQPage** | Service pages | `faqs.json` via `getFaqsForService()` | FAQ rich results |
| **BreadcrumbList** | About, Gallery, Services, Service detail | Routes + labels | SERP breadcrumb display |
| **ItemList** | Services index | 8 services | Carousel/listing context |
| **ImageGallery** | Gallery | `gallery.json` items | Image search context |

**Recommended first ship:** `Organization` + `LocalBusiness` on layout, `FAQPage` on service pages, `BreadcrumbList` on inner pages.

---

## H1 and heading hygiene

| Page | H1 source | Notes |
|------|-----------|-------|
| Home | `home.json` headlinePrimary + accent | Single H1 |
| About | `about.json` hero.headline | Single H1 |
| Gallery | `gallery.json` hero.headline | Single H1 |
| Services | `services.json` servicesPage.hero.headline | Single H1 via `PageHero` |
| Service detail | `service.hero.headline` | Single H1 |
| Contact | `PageHero` title | Single H1 (not in original scope) |

No duplicate H1 issues found. Section titles correctly use H2/H3.

---

## index.html baseline

```html
<html lang="en">
<title>The Game Hour</title>
```

- Static title overwritten by Helmet on hydration — OK for SPA
- Consider `lang="en-IN"` to match `site.locale`
- No default meta description in HTML — crawlers without JS may see thin content (SPA limitation; prerender or static meta optional)

---

## Missing launch files

| File | Purpose |
|------|---------|
| `public/robots.txt` | Allow crawling, point to sitemap |
| `public/sitemap.xml` | List 5 marketing + 8 service + contact URLs |
| `public/og-default.jpg` | Stable 1200×630 OG fallback (1200×630 px) |

---

## Prioritized fixes

### P0 — Launch blockers

#### 1. Emit canonical link tag

**File:** `src/components/Seo/Seo.tsx`

```tsx
{canonical && <link rel="canonical" href={canonical} />}
```

Use `canonical` for `og:url` (already does via `url = canonical ?? SITE.url`).

#### 2. Fix default OG image URL

**Option A (recommended):** Copy branded OG to public root:

```
public/og-default.jpg   (1200×630)
public/og-default.webp
```

Run asset migration script or copy from `src/assets/images/seo/` if present.

**Option B:** Use runtime helper everywhere:

```tsx
import { getOgImageUrl } from '@/lib/assets'

ogImage: getOgImageUrl() // returns absolute-ready bundled URL
```

Update Home, About, Gallery, Services pages to use `getOgImageUrl()` instead of hardcoded `PUBLIC_ASSETS` path.

#### 3. Stabilize service OG images

Copy each service `title-card` to `public/og/services/{slug}.jpg` OR serve from fixed public paths:

```ts
export function getServiceOgImageUrl(slug: string): string {
  return `${SITE.url}/og/services/${slug}.jpg`
}
```

Generate images at build time in `scripts/` if needed.

---

### P1 — High impact

#### 4. Add JSON-LD — Organization + LocalBusiness

**File:** new `src/components/Seo/StructuredData.tsx` or extend `Seo.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "The Game Hour",
  "url": "https://thegamehour.com",
  "telephone": "+919924007700",
  "email": "info@thegamehour.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ahmedabad",
    "addressRegion": "Gujarat",
    "addressCountry": "IN"
  },
  "areaServed": "Gujarat",
  "description": "..."
}
```

Inject once in `MainLayout` or per-page.

#### 5. Add FAQPage schema on service pages

Map `getFaqsForService(slug)` to:

```json
{
  "@type": "FAQPage",
  "mainEntity": [{ "@type": "Question", "name": "...", "acceptedAnswer": { ... } }]
}
```

**File:** `ServiceDetailPage.tsx` or `ServiceFaq.tsx`

#### 6. Add `robots.txt` and `sitemap.xml`

**`public/robots.txt`:**

```
User-agent: *
Allow: /
Sitemap: https://thegamehour.com/sitemap.xml
```

**`public/sitemap.xml`:** Include `/`, `/about`, `/services`, `/gallery`, `/contact`, all 8 `/services/{slug}`.

Consider generating sitemap via `scripts/generate-sitemap.mjs` from `services.json` + routes.

---

### P2 — Medium impact

#### 7. Page-specific OG images

| Page | Suggested OG source |
|------|-------------------|
| Home | `seo/og-default` or homepage hero |
| Gallery | `gallery/hero` or `seo/social-preview` |
| Services | Collage or default |
| Service detail | Service title card (stable public URL) |

#### 8. Extend meta descriptions toward 150–160 chars

Add location + CTA. Example for `school-and-collage-event`:

> Current (95): *Energetic and fun games perfect for school and college fests...*  
> Proposed (~155): *Professional school & college fest games across Gujarat — sports days, freshers, and farewells with facilitator-led, screen-free energy. Book The Game Hour.*

Store in `services.json` as optional `seo.description` override.

#### 9. BreadcrumbList schema

Home → Services → Birthday Games on detail pages.

#### 10. Align service `name` with hero H1 (optional)

Reduces confusion between title tag and on-page H1 for 4 services with mismatches. SEO impact is low if descriptions are strong.

---

### P3 — Polish

| Fix | Detail |
|-----|--------|
| `og:image:width` / `height` | `1200` / `630` |
| `og:locale` | `en_IN` |
| `html lang` | `en-IN` in `index.html` |
| Gallery OG title | Match “Our Event Gallery” if desired |
| Prerender/SSG | For critical routes if JS-only crawling is a concern |
| `hreflang` | Only if multi-language launches |

---

## Recommended copy updates (optional)

| Page | Current title | Suggested title (≤60 chars) |
|------|---------------|---------------------------|
| About | Our Story \| The Game Hour | About Us \| Screen-Free Games in Gujarat |
| Gallery | Event Gallery \| The Game Hour | Event Photo Gallery \| The Game Hour |
| Services | Event Game Services \| The Game Hour | Game Experiences & Packages \| The Game Hour |

Only change if analytics/keyword research supports it.

---

## Verification checklist

After fixes:

- [ ] View source / DevTools → `<link rel="canonical">` on every page
- [ ] View source → `<meta property="og:image">` resolves (200, image/jpeg or webp)
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — no og:image warnings
- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator) — summary_large_image preview
- [ ] Google Search Console → URL inspection for canonical
- [ ] Rich Results Test — FAQPage on a service URL
- [ ] `curl https://thegamehour.com/og-default.jpg` → 200
- [ ] `curl https://thegamehour.com/robots.txt` → 200
- [ ] `curl https://thegamehour.com/sitemap.xml` → 200

---

## Files reference

| File | Role |
|------|------|
| `src/components/Seo/Seo.tsx` | Meta tag rendering |
| `src/utils/seo.ts` | `buildSeo()` helper |
| `src/pages/HomePage.tsx` | Home SEO config |
| `src/pages/AboutPage.tsx` | About SEO config |
| `src/pages/GalleryPage.tsx` | Gallery SEO config |
| `src/pages/ServicesPage.tsx` | Services SEO config |
| `src/pages/ServiceDetailPage.tsx` | Dynamic service SEO |
| `src/lib/services.ts` | `getServiceCanonicalUrl`, `getServiceOgImageUrl` |
| `src/lib/assets.ts` | `getOgImageUrl()` |
| `src/data/content/company-info.json` | Site URL, locale, contact |
| `src/data/services.json` | Service names, descriptions |
| `index.html` | Static HTML shell |

---

## Related documents

- [ROUTE_INVENTORY.md](../operations/ROUTE_INVENTORY.md) — canonical URL paths per route
- [CONTENT_MANAGEMENT_GUIDE.md](../content/CONTENT_MANAGEMENT_GUIDE.md) — where to edit copy
- [Setup Health Report (archive)](../../archive/migrations/SETUP_HEALTH_REPORT.md) — prior OG image note
- `IMAGE_OPTIMIZATION_REPORT.md` — OG asset locations
