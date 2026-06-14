# Service Detail Page: Implementation Report

**Date:** 2026-05-23  
**Scope:** Production-ready `/services/:slug` experience (8 services)  
**Out of scope:** Navbar/Footer redesign, About, Contact page UI

---

## 1. Template decisions

### Architecture

`ServiceDetailPage` composes eight section components under `src/sections/service/`, mirroring the homepage’s `src/sections/home/` pattern. Each section receives a typed `Service` object from `getServiceBySlug()`, no page-level hardcoding of copy or images.

| # | Section | Component | Primary data source |
|---|---------|-----------|-------------------|
| 1 | Hero | `ServiceDetailHero` | `services.json` → `hero`, `cta`; images via `asset-map` slider |
| 2 | Why choose | `ServiceWhyChoose` | `intro`, `sellingPoints` |
| 3 | Gallery | `ServiceGallery` | `asset-map` gallery + `gallery.json` (`serviceSlug`) |
| 4 | Games & activities | `ServiceActivities` | `services.json` → `gameCategories` + homepage asset images |
| 5 | Ideal for | `ServiceIdealFor` | `eventTypes` |
| 6 | Testimonials | `ServiceTestimonials` | `testimonials.json` (`context: service`) + embedded fallback |
| 7 | FAQ | `ServiceFaq` | `faqs.json` filtered by category map |
| 8 | Final CTA | `ServiceFinalCta` | `cta` |

### Design system alignment

- **Clay surfaces:** `.surface-clay` on benefit cards, testimonials, FAQ items, activity cards, hero image frame.
- **Typography:** `hero-title-primary` on service hero (navy-on-navy fix from homepage applied).
- **Motion:** `Reveal` / `RevealItem` with existing `slideUp` + `stagger` variants; FAQ uses light `AnimatePresence` height animation only.
- **Sections:** Reuses `Section`, `SectionIntro`, `Button`, `CTA`, `GalleryCard`, `Badge`, no new visual language.

### Hero layout

Split grid (copy left, image right on `lg+`) instead of reusing `PageHero` alone, so each service can show a **real photo** from its slider asset. CTAs use `resolveServiceCtaHref()` so legacy `/contact` links in JSON still work while external Bubble booking URLs pass through unchanged.

---

## 2. Conversion logic

### Primary paths

1. **Hero CTAs**, Service-specific label from `cta.label` + WhatsApp.
2. **Final CTA block**, Repeated `cta.headline` + book + WhatsApp in high-contrast `CTA` component (`tone="primary"`).
3. **Sticky CTA**, `ServiceStickyCta` fixed on mobile (full-width bar) and desktop (bottom-right card). Always visible after scroll; does not depend on `FEATURE_FLAGS.floatingCta` (homepage preview flag stays separate).

### Sticky bar behaviour

- Mobile: bottom bar with equal-width **Book** + **WhatsApp**.
- Desktop: compact floating card (`md:bottom-6 md:right-6`) so it does not cover footer nav.
- `pb-sticky-cta` on `<main>` prevents last section content from hiding under the bar on small screens.

### Trust-building sequence

The section order follows a conversion narrative:

**Attention (hero)** → **Reasons (why choose)** → **Proof (gallery + testimonials)** → **Product (activities)** → **Fit (ideal for)** → **Objections (FAQ)** → **Action (final CTA + sticky)**.

### CTA href normalization

`resolveServiceCtaHref()` in `lib/services.ts`:

- `http…` → external booking (Bubble)
- `/contact` → internal contact route
- Otherwise → global `BOOKING.url`

---

## 3. Reuse patterns

### Content libs (no hardcoding in UI)

| Module | Role |
|--------|------|
| `lib/services.ts` | Slug lookup, CTA href, canonical URL, OG image URL |
| `lib/gallery.ts` | Merges per-service `asset-map` gallery + curated `gallery.json` rows |
| `lib/service-activities.ts` | Orders `gameCategories` per slug; maps images to `ASSET_MAP.homepage` |
| `lib/faqs.ts` | Category filter per service (corporate gets `corporate` FAQ) |
| `lib/testimonials.ts` | `getServicePageTestimonials()`: JSON first, `service.testimonial` fallback |
| `lib/service-icons.ts` | Emoji map for `sellingPoints[].icon` keys |

### Shared components

- `FaqAccordion`, reusable for future Contact/About FAQ blocks.
- `ServiceStickyCta`, service-route only; distinct from `FloatingActions` (feature-flagged global FABs).

### SEO

Per slug via `buildSeo()`:

- **Title:** `{service.name} | The Game Hour`
- **Description:** `shortDescription`
- **Canonical:** `https://thegamehour.com/services/{slug}`
- **OG image:** Service `title-card` from asset-map (`getServiceOgImageUrl`)

### JSON extensions

- `gallery.json`: optional `serviceSlug` on `gallery-1` … `gallery-8` for curated cross-service shots without duplicating files in components.

---

## 4. Routes covered

All eight slugs render the full template:

- `birthday-games`
- `corporate-games`
- `social-gathering-games`
- `game-festival`
- `school-and-collage-event`
- `wedding-or-haldi-games`
- `traditional-games`
- `bollywood-games`

Invalid slugs redirect to `/services`.

---

## 5. Verification

- `npm run build`, passes (TypeScript + Vite).
- Manual QA: open each `/services/{slug}`, confirm hero image, gallery count, sticky CTA, and FAQ accordion keyboard access.

---

## 6. Follow-ups (optional)

- Add service-specific FAQ rows in `faqs.json` with `serviceSlug` if clients want unique Q&A per vertical.
- Code-split service routes if bundle size warnings matter at scale.
- Replace `gameCategories` legacy image notes when dedicated icebreaker assets exist in `asset-map`.
