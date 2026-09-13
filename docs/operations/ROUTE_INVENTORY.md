# Route Inventory

**Audit date:** 2026-05-23  
**Router:** `src/router.tsx`  
**Route constants:** `src/constants/routes.ts`  
**Navigation data:** `src/data/navigation.json`

---

## Summary

| Category | Count | Launch status |
|----------|-------|---------------|
| Marketing pages | 5 | Live |
| Service detail (dynamic) | 8 slugs | Live |
| Legacy redirects | 8 | Live (SPA redirect) |
| Contact | 1 | Live (real page) |
| Game library (legacy URL) | 1 | Redirect → `/services` (prod) |
| Preview / dev routes | 3 | Dev only; prod redirects home |
| Catch-all 404 | 1 | Live |
| Orphan page files | 5 | Not routed |

**Launch rule:** Every link in navbar, footer, mobile menu, and in-page CTAs resolves to a real page, a legacy redirect, an external booking/contact URL, or a home hash anchor.

---

## Static marketing routes

| Route | Component | Purpose | Accessible | Nav | Footer | Buttons / CTAs |
|-------|-----------|---------|------------|-----|--------|----------------|
| `/` | `HomePage` | Homepage — hero, stats, categories, why us, gallery teaser, testimonials, how it works, final CTA | Yes | Logo, Home | Logo | Book (external), Explore Services, gallery CTA, service cards, final CTA |
| `/about` | `AboutPage` | Brand story, believe in play, gallery/services invites, final CTA | Yes | About | About Us | Book, Services, Gallery invites, final CTA |
| `/services` | `ServicesPage` | Service discovery, audiences, all experiences, gallery invite, final CTA | Yes | Services (dropdown + page) | 8 service links | Book, service cards, audience cards |
| `/gallery` | `GalleryPage` | Photo gallery, browse, event stories, final CTA | Yes | Gallery | Gallery | Book, story → service links, final CTA |
| `/contact` | `ContactPage` | Contact hero, phone, email, location, book + WhatsApp | Yes | Contact | Contact | Book, WhatsApp (hero) |
| `/book` | redirect | Goes to `/book/social` | Direct URL only — site CTAs still Bubble |
| `/book/social` | `BookingPage` (social) | Local social booking form | Direct URL only |
| `/book/corporate` | `BookingPage` (corporate) | Local corporate booking form | Direct URL only |

---

## Dynamic service routes

**Pattern:** `/services/:slug` → `ServiceDetailPage`  
**Invalid slug:** Redirects to `/services`

| Route | Slug | Purpose | Nav | Footer | Linked from |
|-------|------|---------|-----|--------|-------------|
| `/services/birthday-games` | `birthday-games` | Birthday service detail | Services dropdown | Birthday Games | Home categories, Services page, footer, gallery stories |
| `/services/corporate-games` | `corporate-games` | Corporate service detail | Services dropdown | Corporate Games | Same pattern |
| `/services/social-gathering-games` | `social-gathering-games` | Social gatherings detail | Services dropdown | Social Gatherings | Same |
| `/services/game-festival` | `game-festival` | Community festival detail | Services dropdown | Game Festivals | Same |
| `/services/school-and-collage-event` | `school-and-collage-event` | School/college detail | Services dropdown | School & College | Same |
| `/services/wedding-or-haldi-games` | `wedding-or-haldi-games` | Wedding/haldi detail | Services dropdown | Wedding & Haldi | Same |
| `/services/traditional-games` | `traditional-games` | Traditional games detail | Services dropdown | Traditional Games | Same |
| `/services/bollywood-games` | `bollywood-games` | Bollywood games detail | Services dropdown | Bollywood Games | Same |

All service CTAs use external Bubble booking URLs via `resolveServiceCtaHref()` — not internal routes.

---

## Legacy service redirects

**Component:** `LegacyServiceRedirect` — instant SPA redirect, no content flash.

| Legacy route | Redirects to | Purpose |
|--------------|--------------|---------|
| `/corporate-events` | `/services/corporate-games` | Old site URL compatibility |
| `/birthday-events` | `/services/birthday-games` | Old site URL compatibility |
| `/school-events` | `/services/school-and-collage-event` | Old site URL compatibility |
| `/traditional-games` | `/services/traditional-games` | Old site URL compatibility |
| `/wedding-events` | `/services/wedding-or-haldi-games` | Old site URL compatibility |
| `/social-gathering` | `/services/social-gathering-games` | Old site URL compatibility |
| `/game-festival` | `/services/game-festival` | Old site URL compatibility |
| `/bollywood` | `/services/bollywood-games` | Old site URL compatibility |

Not linked from navigation — bookmark and external link preservation only.

---

## Redirect routes (launch)

| Route | Production behavior | Dev behavior | Linked from nav |
|-------|---------------------|--------------|-----------------|
| `/game-library` | Redirect → `/services` | Redirect → `/services` | Was footer “Our Games” — **updated to `/services`** |
| `/design-preview` | Redirect → `/` | `DesignPreviewPage` | Not linked |
| `/new-ui-preview` | Redirect → `/` | `NewUiPreviewPage` | Not linked |
| `/theme-preview/coral` | Redirect → `/` | `CoralThemePreviewPage` | Not linked |

---

## Error handling

| Route | Component | Purpose | Linked from |
|-------|-----------|---------|-------------|
| `*` (unmatched) | `NotFoundPage` | 404 with return home link | Broken URLs only |

---

## Hash anchors (same-page navigation)

| Anchor | Page | Linked from |
|--------|------|-------------|
| `/#trusted` | Home | About experiences invite |
| `#why-us`, `#testimonials`, etc. | Various | Internal section IDs (not nav links) |

---

## External routes (not in SPA router)

| Destination | Type | Linked from |
|-------------|------|-------------|
| Bubble booking (`booking-links.json`) | External HTTPS | Navbar Book, all final CTAs, service book buttons |
| WhatsApp (`wa.me/...`) | External HTTPS | Footer, final CTAs, contact page, service heroes |
| `tel:` / `mailto:` | Native | Footer, contact page, floating actions (when enabled) |
| Instagram / Facebook / LinkedIn | External HTTPS | Footer social icons |

---

## Orphan files (not in router)

These `.tsx` files exist on disk but are **not registered** in `router.tsx`. Safe for future deletion.

| File | Former purpose |
|------|----------------|
| `CorporateEventsPage.tsx` | Replaced by legacy redirect |
| `BirthdayEventsPage.tsx` | Replaced by legacy redirect |
| `SchoolEventsPage.tsx` | Replaced by legacy redirect |
| `TraditionalGamesPage.tsx` | Replaced by legacy redirect |
| `WeddingEventsPage.tsx` | Replaced by legacy redirect |
| `PlaceholderPage.tsx` | Shared stub (no longer used by live routes) |

---

## Navigation link matrix (post-audit)

### Navbar (`navigation.json` → `main`)

| Label | Route | Status |
|-------|-------|--------|
| Home | `/` | OK |
| About | `/about` | OK |
| Services | `/services` + dropdown to 8 slugs | OK |
| Gallery | `/gallery` | OK |
| Contact | `/contact` | OK (real page) |
| Book | External booking | OK |

### Footer quick links

| Label | Route | Status |
|-------|-------|--------|
| About Us | `/about` | OK |
| Our Experiences | `/services` | OK (was `/game-library`) |
| Gallery | `/gallery` | OK |
| Contact | `/contact` | OK |

### Footer service links

All 8 service slugs — verified against `services.json`.

---

## Route registration source

```
src/router.tsx
├── MainLayout
│   ├── /                     → HomePage
│   ├── about                 → AboutPage
│   ├── services              → ServicesPage
│   ├── services/:slug        → ServiceDetailPage
│   ├── gallery               → GalleryPage
│   ├── contact               → ContactPage
│   ├── game-library          → redirect (prod) / redirect (dev)
│   ├── [8 legacy paths]      → LegacyServiceRedirect
│   ├── design-preview        → dev page | prod → home
│   ├── new-ui-preview        → dev page | prod → home
│   ├── theme-preview/coral   → dev page | prod → home
│   └── *                     → NotFoundPage
```

---

## Related documents

- [BROKEN_LINK_AUDIT.md](../../archive/audits/BROKEN_LINK_AUDIT.md) — fixes applied in this audit
- [ROUTE_INVENTORY.md](ROUTE_INVENTORY.md) — full route catalog (current)
- [BOOKING_ROUTING_AUDIT.md](BOOKING_ROUTING_AUDIT.md) — external booking CTA audit
