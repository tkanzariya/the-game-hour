# About Page Decisions

**Date:** 2026-05-23  
**Scope:** Production About page (`/about`) for The Game Hour v2

---

## Design intent

The About page is a **story-first experience page**, not a corporate profile. Visitors should feel who we are through imagery, short copy, and proof, then be invited to discuss their event.

---

## Section reasoning

| # | Section | Role | Why this shape |
|---|---------|------|----------------|
| 1 | **About Hero** | Emotional entry | Headline leads with purpose ("We bring people back together"), not "About Us". Split hero + stacked inset photo mirrors homepage/service detail trust patterns. |
| 2 | **The Story** | Origin narrative | Split layout (image left, copy right on desktop) breaks card-grid rhythm. Milestone chips (2022 / 2023 / Today) compress legacy journey timeline without a long timeline wall. |
| 3 | **Why We Believe In Play** | Values through play | Two large image cards (Connection, Screen-free) plus three compact pillars avoid six identical tiles. Image-first for the emotional case. |
| 4 | **Trusted Experiences** | Social proof | Same metric vocabulary as homepage but reframed for About: events, participants, games conducted, communities served. Warm tone band adds visual break. |
| 5 | **What Makes Us Different** | Differentiation | Left-accent violet border + tagline chips signal "this is us" without a dry comparison table. Five traits map to booking objections (DIY kits, age gaps, phone culture). |
| 6 | **Moments That Matter** | Visual proof | Masonry-style gallery (one tall hero cell) uses production gallery + moment assets. Heavier than text sections; links to full gallery. |
| 7 | **Who We Serve** | Audience clarity | Image-led 3×2 grid with service title cards. Six segments (Corporate, Birthdays, Schools, Societies, Festivals, Weddings) link to service detail for conversion paths. |
| 8 | **Final CTA** | Conversion | Custom copy ("Discuss your event") vs generic footer CTA. Book + WhatsApp + contact form triple path matches homepage. |

---

## Trust-building strategy

1. **Show, then tell:** Hero and gallery sections lead with real event photography from `asset-map` and `gallery.json`.
2. **Origin story:** Family-gathering narrative from legacy `about-us.html` grounds the brand in a human moment, not a mission statement slide.
3. **Quantified proof:** Stats section with placeholder disclaimer (same policy as homepage) until verified figures ship.
4. **Differentiators as promises:** Facilitator-led, inclusive, multi-age, customizable, screen-free address what planners worry about before booking.
5. **Audience grid:** Proves breadth (corporate to weddings) with deep links to packages, not abstract labels.
6. **Consistent production cues:** `profile="marketing"`, violet accent chips, `surface-clay` cards, and facilitator/screen-free language aligned with Services and Home.

---

## Conversion strategy

| Touchpoint | Action |
|------------|--------|
| Hero | Book + Explore experiences |
| Who we serve | Each tile → service detail page |
| Moments gallery | View full gallery → `/gallery` |
| Final CTA | Bubble booking, WhatsApp, contact form |

Primary goal: **start a conversation about their event**, not passive brand awareness. Copy uses "tell us your date, venue, and crowd" to lower friction.

---

## Layout decisions

- **Marketing profile everywhere:** `Section profile="marketing"` → `container-app-wide` + open float, consistent with Home and Services.
- **Rhythm alternation:** Hero (dark flat) → muted story split → default play section → warm stats → muted differentiators → default gallery → muted audiences → default CTA.
- **No long paragraphs:** Story capped at lead + two short paragraphs; pillars and differentiators are one line each.
- **Image density:** Hero (2 images), story split, play featured cards, gallery masonry, audience title cards = majority visual weight.
- **Content source:** `src/data/about.json` + `lib/about-page.ts` getters, same pattern as `servicesPage` in `services.json`.

---

## SEO

| Field | Value |
|-------|--------|
| Title | `Our Story \| The Game Hour` |
| Description | Purpose-led copy with Gujarat, screen-free, and audience keywords |
| Canonical | `https://thegamehour.com/about` |
| OG image | `/og-default.jpg` (site-wide asset; dedicated about OG can replace later) |

---

## Files added / changed

```
src/data/about.json
src/data/types.ts          (+ AboutPageContent types)
src/data/index.ts          (+ aboutData export)
src/lib/about-page.ts
src/sections/about/*.tsx   (8 sections + index)
src/pages/AboutPage.tsx    (replaces placeholder)
ABOUT_PAGE_DECISIONS.md
```

---

## QA checklist

- [ ] `/about` renders all 8 sections on mobile and desktop
- [ ] No em/en dashes in user-facing copy (`WRITING_STYLE_RULES.md`)
- [ ] Violet accent visible on chips, borders, stat surfaces
- [ ] Audience cards link to correct service slugs
- [ ] Hero image uses `fetchPriority="high"`; below-fold images lazy-load
- [ ] Build passes (`npm run build`)
- [ ] Scroll-to-top on navigation works (existing `ScrollToTop`)
