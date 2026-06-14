# Booking Routing Audit

**Date:** 2026-05-23  
**Scope:** Site-wide booking CTA routing to live Bubble booking system

---

## Booking URLs (source of truth)

| Key | URL | Used for |
|-----|-----|----------|
| **Default** | `https://the-game-hour.bubbleapps.io/version-test/` | All booking CTAs except Corporate Games |
| **Corporate** | `https://the-game-hour.bubbleapps.io/version-test/corporate_booking` | Corporate Games service page only |

**Code:** `BOOKING.url` and `BOOKING.corporateUrl` in `src/utils/constants.ts`  
**Resolver:** `getBookingUrlForService(slug)` in `src/lib/booking.ts`  
**Service CTAs:** `resolveServiceCtaHref(service)` in `src/lib/services.ts`

---

## External link behavior

**Decision: open booking URLs in a new tab** (`external` on `Button`, or `target="_blank"` on Navbar anchors).

| Factor | New tab (chosen) | Same tab |
|--------|------------------|----------|
| Cross-domain handoff | Bubble is a separate app; keeps marketing site open | User loses service page context |
| Mobile | User can return via browser tab switch | Back button may skip booking mid-flow |
| Consistency | Matches Navbar Book pills and WhatsApp pattern | Would require changing Navbar + all Buttons |
| Conversion | User can compare packages while booking | Slightly fewer steps |

All production booking buttons use `external` (or explicit `target="_blank"` on Navbar).

---

## Routing table

| Source | CTA label | Destination |
|--------|-----------|-------------|
| **Navbar** (desktop + mobile) | Book | Default booking URL (new tab) |
| **Footer** → Plan Your Event | Book Now | Default booking URL (new tab) |
| **HomeHero** | Book your event | Default booking URL (new tab) |
| **HomeFinalCta** | Book your event now | Default booking URL (new tab) |
| **AboutHero** | Book your event | Default booking URL (new tab) |
| **AboutFinalCta** | Discuss your event | Default booking URL (new tab) |
| **ServicesPageHero** | Book your event | Default booking URL (new tab) |
| **ServicesFinalCta** | Book your event now | Default booking URL (new tab) |
| **GalleryFinalCta** | Book event | Default booking URL (new tab) |
| **ServiceDetailHero** | Service CTA label | Default or corporate by slug (new tab) |
| **ServiceFinalCta** | Service CTA label | Default or corporate by slug (new tab) |
| **ServiceStickyCta** | Book event / Book now | Default or corporate by slug (new tab) |

### Service pages (`resolveServiceCtaHref`)

| Service slug | CTA label (from JSON) | Destination |
|--------------|----------------------|-------------|
| `birthday-games` | Book Your Birthday Games Now! | Default |
| `corporate-games` | Request a Corporate Games Proposal | **Corporate** |
| `social-gathering-games` | Plan Your Social Event Games! | Default |
| `game-festival` | Plan Your Society Festival Now! | Default |
| `school-and-collage-event` | Organize Your Sports Event Today! | Default |
| `wedding-or-haldi-games` | Book Your Wedding Games Host! | Default |
| `traditional-games` | Book Your Nostalgia Event! | Default |
| `bollywood-games` | Plan Your Bollywood Game Night! | Default |

---

## Inventory (booking-intent CTAs audited)

### Updated to live booking

- Navbar Book (×2)
- Footer Book Now
- Home hero + final CTA
- About hero + final CTA
- Services page hero + final CTA
- Gallery final CTA
- All 8 service detail heroes, final CTAs, sticky CTAs
- `services.json` all `cta.href` fields (were `/contact` except birthday)

### Removed (contact page postponed)

| Location | Removed CTA | Reason |
|----------|-------------|--------|
| HomeFinalCta | Contact form → `/contact` | Redundant; contact page not live |
| AboutFinalCta | Contact form → `/contact` | Same |
| GalleryFinalCta | Contact us → `/contact` | Same; Book + WhatsApp retained |

### Not booking (unchanged)

| Item | Route / action | Notes |
|------|----------------|-------|
| Nav / footer "Contact" links | `/contact` | Informational nav; page remains placeholder |
| Footer phone / email | `tel:` / `mailto:` | Support channels |
| WhatsApp buttons | `wa.me/...` | Messaging, not Bubble booking |
| FloatingActions | WhatsApp + call | Feature flag off in prod |
| HomeHero location link | `/services` | Was `/contact`; not a booking CTA |
| ServiceCard body links | Service detail pages | Navigation only |
| HomeHowItWorks "Book" step | Text only | Process copy, not a link |

---

## Corporate-specific routes

Only **`corporate-games`** resolves to the corporate Bubble URL via:

```ts
getBookingUrlForService('corporate-games')
// → BOOKING.corporateUrl
```

No homepage, services overview, or non-corporate section uses the corporate URL. Corporate audience cards on About/Services link to the service page; booking happens on that page's CTAs.

---

## Files changed

```
src/utils/constants.ts          (+ BOOKING.corporateUrl)
src/lib/booking.ts              (new resolver)
src/lib/services.ts             (resolveServiceCtaHref → booking lib)
src/data/services.json          (all cta.href + meta.corporateBookingUrl)
src/data/types.ts               (+ corporateBookingUrl meta)
src/data/faqs.json              (booking FAQ copy)
src/data/gallery.json           (finalCta labels)
src/sections/home/HomeFinalCta.tsx
src/sections/home/HomeHero.tsx
src/sections/about/AboutFinalCta.tsx
src/sections/gallery/GalleryFinalCta.tsx
BOOKING_ROUTING_AUDIT.md
```

---

## Remaining warnings

1. **`/contact` route still exists** as a placeholder page. Nav/footer Contact links remain for future launch; they do not receive booking traffic from CTAs audited above.
2. **`FloatingActions`** has no Book pill today (WhatsApp + call only). If enabled later, add Book → default booking URL.
3. **Preview pages** (`DesignPreviewPage`, `CoralThemePreviewPage`, `NewUiPreviewPage`) use `BOOKING.url` but some mock buttons have no href; not production routes.
4. **`services.json` `cta.href`** is documentation; runtime always uses `resolveServiceCtaHref()` by slug. Keep JSON in sync for content editors.
5. **Corporate booking on Services overview** intentionally uses default URL on hero/final CTA. Users choose Corporate Games service page for corporate-specific form.

---

## Verification checklist

- [x] No booking CTA points to `/contact`
- [x] Only `corporate-games` uses corporate booking URL
- [x] Navbar + Footer Book use default URL
- [x] All booking links open in new tab
- [x] Build passes
