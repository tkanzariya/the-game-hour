# Content Management Guide

**For:** Non-developers and content editors  
**Project:** TheGameHour-v2  
**Last updated:** 2026-05-23

This guide explains how to update frequently changing website content **without editing React code**. All editable copy for stats, testimonials, FAQs, gallery stories, company details, social links, and booking URLs lives in one folder.

---

## Where content lives

```
src/data/content/
├── stats.json           ← Numbers shown on Home, About, Gallery
├── testimonials.json    ← Client quotes (Home + service pages)
├── client-logos.json    ← Logo strip (ready when you add logos)
├── faqs.json            ← Questions on service detail pages
├── gallery-stories.json ← Story blocks on Gallery page
├── company-info.json    ← Name, email, phone, address, footer copy
├── social-links.json    ← Instagram, Facebook, LinkedIn
└── booking-links.json   ← Booking form URLs + button labels
```

**Rule:** Edit these JSON files only. Save, then rebuild/redeploy the site. Components read from these files automatically.

---

## Quick reference — single source of truth

| What you want to change | Edit this file only |
|-------------------------|---------------------|
| Event stats (50+ events, etc.) | `stats.json` |
| Testimonials | `testimonials.json` |
| Client logos | `client-logos.json` |
| FAQs | `faqs.json` |
| Gallery story text | `gallery-stories.json` |
| Company name, email, phone | `company-info.json` |
| Social media URLs | `social-links.json` |
| Booking form links, “Book now” labels | `booking-links.json` |

Do **not** duplicate these values in other files. The booking FAQ answer pulls email, phone, and booking URL automatically from `company-info.json` and `booking-links.json`.

---

## How to edit stats

**File:** `src/data/content/stats.json`

### Metrics (numbers on all stat sections)

Each metric has three fields:

```json
{
  "id": "events-hosted",
  "value": "50+",
  "label": "Events Hosted"
}
```

| Field | What it controls |
|-------|------------------|
| `value` | The big number (e.g. `50+`, `3,000+`, `6`) |
| `label` | Text under the number |
| `id` | Internal key — do not change unless a developer asks |

**Where these appear:**
- Home → “Trusted experiences at scale” section
- About → trusted stats section
- Gallery → stats band over photo
- Home hero → floating “50+ Events Hosted” badge

### Section titles (headlines above stats)

Under `"sections"` in the same file:

```json
"sections": {
  "home": {
    "title": "Trusted experiences at scale",
    "subtitle": "From intimate birthday parties..."
  },
  "about": { ... },
  "gallery": { ... }
}
```

Change `title` or `subtitle` to update the heading on that page only.

---

## How to add testimonials

**File:** `src/data/content/testimonials.json`

### Placeholder notice

The file includes a status notice shown on the site until real reviews are added:

```json
"meta": {
  "status": "placeholder",
  "notice": "Placeholder testimonials pending real client reviews..."
}
```

Remove `"notice"` (or set `"status": "verified"`) when using real client quotes.

### Add a home page testimonial

Add an object inside `"items"`:

```json
{
  "id": "home-unique-id",
  "quote": "Describe the outcome: participation, engagement, kids involved, etc.",
  "attribution": "Name, Role, Organisation, City",
  "context": "home",
  "serviceSlug": "corporate-games",
  "theme": "team-engagement"
}
```

- `"context": "home"` → shows on homepage (max 3 recommended for layout)
- `"serviceSlug"` → optional link context for filtering

### Add a service page testimonial

Same structure, but use `"context": "service"` and match `"serviceSlug"` to a service:

| Service | `serviceSlug` value |
|---------|---------------------|
| Corporate Games | `corporate-games` |
| Birthday Games | `birthday-games` |
| Game Festival | `game-festival` |
| School Events | `school-and-collage-event` |
| Wedding / Haldi | `wedding-or-haldi-games` |
| Social Gatherings | `social-gathering-games` |
| Traditional Games | `traditional-games` |
| Bollywood Games | `bollywood-games` |

### Section headings

Edit under `"sections"`:

```json
"sections": {
  "home": {
    "title": "What hosts say after the games",
    "subtitle": "..."
  },
  "service": {
    "title": "What hosts say",
    "subtitleTemplate": "Families and organisers who chose The Game Hour for their {{serviceName}} events."
  }
}
```

Keep `{{serviceName}}` in the service template — it is replaced automatically.

### Writing tips

Focus on **outcomes**, not generic praise:

- Team engagement and cross-department participation
- Employee participation rates
- Kids staying involved without screens
- Community / multi-generation interaction

Avoid empty phrases like “Great event!” or “Highly recommend!”

---

## How to add client logos

**File:** `src/data/content/client-logos.json`

When ready, add each logo to `"items"`:

```json
{
  "id": "client-acme",
  "name": "Acme Corp",
  "imagePath": "marketing/clients/acme.webp",
  "url": "https://example.com"
}
```

1. Place the image in `src/assets/images/marketing/clients/` (or path your developer confirms)
2. Set `imagePath` relative to `src/assets/images/`
3. `url` is optional (click-through link)

The `"items"` array is currently empty — no logo strip renders until items are added and a developer enables the section component.

---

## How to edit FAQs

**File:** `src/data/content/faqs.json`

### Add or edit a question

```json
{
  "id": "faq-custom",
  "question": "Can games be customized for our event theme?",
  "answer": "Absolutely. We tailor game selection...",
  "category": "services"
}
```

Categories: `general`, `booking`, `corporate`, `services`

### Booking FAQ (auto-updates contact info)

The booking question uses `"dynamic": true` — **do not** paste email/phone/URL manually:

```json
{
  "id": "faq-booking",
  "question": "How do I book The Game Hour?",
  "dynamic": true,
  "category": "booking"
}
```

The answer is built from `company-info.json` + `booking-links.json`. Update contact details there instead.

### Section heading (service pages)

```json
"sections": {
  "service": {
    "title": "Frequently asked questions",
    "subtitle": "Quick answers before you book..."
  }
}
```

---

## How to edit gallery stories

**File:** `src/data/content/gallery-stories.json`

Each story links to a gallery image by `imageId` (must exist in `src/data/gallery.json`):

```json
{
  "id": "story-corporate",
  "title": "Corporate offsite in Ahmedabad",
  "context": "120 team members, mixed departments...",
  "imageId": "gallery-2",
  "serviceSlug": "corporate-games"
}
```

Top-level fields:

| Field | Purpose |
|-------|---------|
| `title` / `subtitle` | Section heading on Gallery page |
| `itemEyebrow` | Small label above each story (e.g. “Real event”) |
| `serviceLinkTemplate` | Link text; keep `{{serviceName}}` placeholder |

---

## How to update company information

**File:** `src/data/content/company-info.json`

```json
"site": {
  "name": "The Game Hour",
  "tagline": "Unleash the Fun. Reconnect with Joy.",
  "description": "Screen-free games...",
  "url": "https://thegamehour.com"
},
"contact": {
  "email": "info@thegamehour.com",
  "phone": "+919924007700",
  "phoneDisplay": "+91 99240 07700",
  "whatsappUrl": "https://wa.me/919924007700",
  "location": "Ahmedabad, Gujarat, India"
}
```

**Used on:** Footer, SEO meta tags, FAQ booking answer, WhatsApp buttons.

Footer column headings and tagline suffix are under `"footer"`.

---

## How to update social links

**File:** `src/data/content/social-links.json`

```json
{
  "id": "instagram",
  "url": "https://www.instagram.com/thegamehour",
  "label": "Instagram",
  "abbr": "IG"
}
```

- `url` — full profile link
- `label` — accessibility / screen reader name
- `abbr` — two-letter icon in footer (IG, FB, IN)

Add, remove, or reorder items in the `"items"` array. Footer updates automatically.

---

## How to update booking links

**File:** `src/data/content/booking-links.json`

### URLs (most important before launch)

```json
"urls": {
  "default": "https://the-game-hour.bubbleapps.io/version-test/",
  "corporate": "https://the-game-hour.bubbleapps.io/version-test/corporate_booking"
}
```

- `default` — all standard “Book” buttons
- `corporate` — Corporate Games service page only

Replace `version-test` with production Bubble URLs when launching.

### Button labels

```json
"labels": {
  "bookNow": "Book Now",
  "book": "Book",
  "bookEvent": "Book event",
  "bookYourEvent": "Book your event",
  "bookYourEventNow": "Book your event now",
  "whatsapp": "WhatsApp",
  "whatsappUs": "WhatsApp us",
  "exploreExperiences": "Explore experiences"
}
```

Change text here once — navbar, footer, heroes, and CTAs all use these labels.

---

## Content audit (Task 1 summary)

### Moved to `src/data/content/` (centralized)

| Category | Was | Now |
|----------|-----|-----|
| Stats | `site-stats.json` + hardcoded Home section titles | `content/stats.json` |
| Testimonials | `testimonials.json` + hardcoded section titles | `content/testimonials.json` |
| FAQs | `faqs.json` + hardcoded ServiceFaq titles | `content/faqs.json` |
| Gallery stories | `gallery.json` page.stories + hardcoded eyebrow | `content/gallery-stories.json` |
| Company info | `utils/constants.ts` SITE/CONTACT | `content/company-info.json` |
| Social links | `constants.ts` SOCIAL + Footer hardcoded labels | `content/social-links.json` |
| Booking | `constants.ts` BOOKING + scattered button text | `content/booking-links.json` |
| Client logos | Not implemented | `content/client-logos.json` (ready) |

### Still in other data files (page-specific, less frequent changes)

| File | Contents |
|------|----------|
| `src/data/about.json` | About page narrative, milestones, audiences |
| `src/data/gallery.json` | Gallery images, filters, featured moments |
| `src/data/services.json` | Service descriptions, selling points, per-service CTA headlines |
| `src/data/navigation.json` | Menu links, footer tagline, CTA headline |

### Still hardcoded in components (future `home.json` candidate)

These sections were **not** moved in this phase but remain candidates for a future content file:

- Home hero headline and body copy (`HomeHero.tsx`)
- Home “Why us” and “How it works” cards
- Service detail hero eyebrow and trust bullets

---

## Workflow for editors

1. Open the relevant file under `src/data/content/`
2. Edit JSON carefully — use a JSON-aware editor (VS Code, Cursor)
3. Validate JSON (no trailing commas, quotes on all strings)
4. Save the file
5. Ask your developer to run `npm run build` and deploy, or use your CI pipeline

### JSON tips

- Use double quotes `"` for all strings
- No comma after the last item in a list
- Copy an existing item as a template when adding testimonials or FAQs

---

## Technical reference (for developers)

Loaders live in `src/lib/content/`:

```
src/lib/content/
├── stats.ts
├── testimonials.ts
├── faqs.ts
├── gallery-stories.ts
├── company.ts
├── social.ts
├── booking.ts
├── client-logos.ts
└── index.ts
```

Legacy re-exports (backward compatible):

- `src/lib/site-stats.ts` → `content/stats`
- `src/lib/testimonials.ts` → `content/testimonials`
- `src/lib/faqs.ts` → `content/faqs`
- `src/lib/booking.ts` → `content/booking`
- `src/utils/constants.ts` → reads from content JSON at build time

---

## Related docs

- [Trust Stats Update (archive)](../../archive/audits/TRUST_STATS_UPDATE.md) — verified stat values and trust phase notes
- [Booking Routing Audit](../operations/BOOKING_ROUTING_AUDIT.md) — which pages use default vs corporate booking URLs
- [Handbook](../HANDBOOK.md) — operations overview
