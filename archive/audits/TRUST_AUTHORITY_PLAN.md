# Trust & Authority Plan

**Phase:** Trust & Authority  
**Date:** 2026-05-23  
**Scope:** Audit, strategy, content architecture, section consolidation guidance. No page redesigns, no new routes, no performance work in this phase.

**Prerequisite:** Content Management phase complete (`src/data/content/`).

---

## Executive summary

The site has a solid **Level 1 (immediate proof)** foundation: verified stats, real gallery photos, facilitator-led positioning, and outcome-focused placeholder testimonials. **Level 2 (social proof)** is partially built but invisible: logo architecture exists with no assets or UI. **Level 3 (authority)** is thin: no named clients, no published case studies, no press or credentials.

The highest-impact next steps are: (1) replace placeholder testimonials with real quotes, (2) add logo assets and enable one logo strip, (3) consolidate repeated trust sections across pages, (4) publish event stories when case-study UI ships.

---

## Task 1 — Trust signal audit

### Homepage (`/`)

| Section | Trust type | Strength | Notes |
|---------|------------|----------|-------|
| Hero badge (50+ Events) | Immediate proof | **Strong** | Verified stat from `stats.json` |
| Hero trust line | Positioning | **Medium** | Claims trust; no logos or names |
| Trusted stats band | Immediate proof | **Strong** | Same 4 metrics as About/Gallery |
| Event categories | Relevance | **Medium** | Shows breadth, not proof |
| Why us (6 cards) | Authority / differentiation | **Medium** | Claims facilitators, screen-free; overlaps About differentiators |
| Gallery moments (6 photos) | Visual proof | **Strong** | Real images; generic alts on some |
| Testimonials (3) | Social proof | **Weak–Medium** | Outcome-focused placeholders; notice visible |
| How it works | Process clarity | **Low trust** | Reduces friction, not credibility |
| Final CTA | Conversion | **Neutral** | No trust element |

**Missing:** Client/corporate/school logo strip, named organisations, press, awards.

---

### About (`/about`)

| Section | Trust type | Strength | Notes |
|---------|------------|----------|-------|
| Hero + trust line | Brand story | **Medium** | Narrative, not quantified proof |
| Story + milestones | Authority | **Medium** | Origin story builds familiarity |
| Believe in play | Values | **Low–Medium** | Emotional, not evidential |
| Trusted stats | Immediate proof | **Strong** | **Duplicate of Home** (same 4 metrics) |
| Differentiators | Authority | **Medium** | Overlaps Home Why Us |
| Moments gallery | Visual proof | **Strong** | **Overlaps Home gallery moments** |
| Who we serve (6 audiences) | Relevance | **Medium** | **Overlaps Services who-we-serve** |
| Final CTA | Conversion | **Neutral** | — |

**Missing:** Team photos, founder credentials, client logos, verified testimonial on About.

---

### Gallery (`/gallery`)

| Section | Trust type | Strength | Notes |
|---------|------------|----------|-------|
| Hero | Visual promise | **Medium** | — |
| Featured moments | Visual proof | **Strong** | Curated real photos |
| Browse + grid | Visual proof | **Strong** | Largest proof surface on site |
| Stories (3 blocks) | Social proof / narrative | **Medium** | Short context; not full case studies |
| Stats band | Immediate proof | **Strong** | **Third repeat of same 4 stats** |
| Final CTA | Conversion | **Neutral** | — |

**Missing:** Client names in stories, dates, participant counts in UI (data ready in `event-stories.json`).

---

### Services (`/services`)

| Section | Trust type | Strength | Notes |
|---------|------------|----------|-------|
| Hero + Book CTA | Conversion | **Neutral** | No trust strip |
| All experiences (8 cards) | Relevance | **Medium** | — |
| Who we serve (5 audiences) | Relevance | **Medium** | **Overlaps About audiences** (different count/copy) |
| Gallery preview (6 photos) | Visual proof | **Strong** | **Fourth gallery preview surface** |
| Final CTA | Conversion | **Neutral** | — |

**Missing:** Stats, testimonials, logos, aggregate proof on overview.

---

### Service detail (`/services/:slug`)

| Section | Trust type | Strength | Notes |
|---------|------------|----------|-------|
| Hero + service CTA | Conversion | **Medium** | Trust bullets hardcoded in component |
| Why choose (selling points) | Differentiation | **Medium** | From `services.json` |
| Service gallery | Visual proof | **Strong** | Service-specific photos |
| Activities / ideal for | Relevance | **Low trust** | Helps selection |
| Testimonials (1–2 per slug) | Social proof | **Weak–Medium** | Placeholders; notice visible |
| FAQ | Authority / clarity | **Medium** | Dynamic booking answer from content |
| Sticky CTA | Conversion | **Neutral** | — |

**Missing:** Corporate logos on corporate-games, school logos on school service, case study link, stat snippet.

---

### Cross-cutting trust assets

| Asset | Status | File |
|-------|--------|------|
| Verified stats | **Live** | `content/stats.json` |
| Testimonials | **Placeholder, upgraded** | `content/testimonials.json` |
| Gallery short stories | **Live** | `content/gallery-stories.json` |
| Event case studies | **Architecture only** | `content/event-stories.json` |
| Trust logos (5 categories) | **Architecture only** | `content/client-logos.json` |
| FAQs | **Live** | `content/faqs.json` |
| Company contact | **Live** | `content/company-info.json` |
| Booking URLs | **Staging** | `content/booking-links.json` |

---

## Task 2 — Trust strategy

### Level 1: Immediate proof

*Goal: Visitor believes “this is real, active, and professional” within 5 seconds.*

| Signal | Current | Target |
|--------|---------|--------|
| Verified metrics | 4 stats on Home, About, Gallery + hero badge | Keep; show on **one primary page only** long-term |
| Real event photography | Gallery, Home moments, Services preview | Keep; improve captions/alts in JSON |
| Facilitator-led positioning | Why us, differentiators, service copy | Keep; avoid duplicating on same scroll path |
| Contact details | Footer, FAQ | Keep |
| Production booking URL | Staging | **Swap before launch** |

**Principle:** Numbers and photos do the heavy lifting. No disclaimers on stats.

---

### Level 2: Social proof

*Goal: Visitor sees “people like me had a good outcome.”*

| Signal | Current | Target |
|--------|---------|--------|
| Testimonials | 12 outcome-focused placeholders + visible notice | Replace with **real named quotes**; remove notice |
| Gallery stories | 3 short narratives | Keep on Gallery; link forward to case studies |
| Client / school / society logos | Architecture ready, 0 assets | Add 5–10 logos; enable **one** home placement |
| Repeat bookings / society return | In placeholder copy only | Capture in real testimonials |
| Video / reels | None | Future; not this phase |

**Principle:** Specificity beats volume. One quote with “85 team members, four rounds” beats five generic praise lines.

---

### Level 3: Authority

*Goal: Visitor believes “they are the go-to games partner in Gujarat.”*

| Signal | Current | Target |
|--------|---------|--------|
| Origin story | About page | Keep |
| Event case studies | `event-stories.json` draft items | Publish 2–3 when UI ships |
| Team / facilitator credibility | Not present | Photos + short bios (future content file) |
| Press / awards / partnerships | Not present | Add when available |
| SEO / structured data | Basic Seo component | Organization schema (future) |
| Corporate HR path | Service page only | Logo strip + case study on corporate-games |

**Principle:** Authority is earned with named evidence, not adjectives.

---

## Task 3 — Trust logo architecture

**File:** `src/data/content/client-logos.json`  
**Loaders:** `src/lib/content/client-logos.ts`

### Categories supported

| Category ID | Use case |
|-------------|----------|
| `corporate` | Company logos for HR / offsite credibility |
| `school` | Schools and colleges |
| `community` | Societies, clubs, residential complexes |
| `partner` | Venues, planners, collaborators |
| `client` | General client mark when category unclear |

### Item schema

```json
{
  "id": "logo-acme-corp",
  "name": "Acme Corp",
  "category": "corporate",
  "imagePath": "trust-logos/acme.webp",
  "url": "https://example.com",
  "city": "Ahmedabad"
}
```

Place images under `src/assets/images/trust-logos/`.

### Placements (not enabled yet)

| Page key | Default categories | `enabled` |
|----------|-------------------|-----------|
| `home` | corporate, school, community | `false` |
| `about` | corporate, community, school | `false` |
| `services` | corporate, school, community | `false` |
| `gallery` | community, client | `false` |
| `corporateService` | corporate | `false` |

Set `"enabled": true` on a placement when logos exist. UI component not built yet; architecture prevents scattered hardcoding.

### Loader API

- `getTrustLogosByCategory(category)`
- `getTrustLogoPlacement('home')`
- `shouldShowTrustLogos('home')` — true only if enabled **and** items exist

---

## Task 4 — Testimonials upgrade

**File:** `src/data/content/testimonials.json`

### What changed

- Added **`outcome`** headline per quote (for future UI)
- Added **`eventType`**, **`participantCount`**, typed **`theme`**
- Rewrote all quotes to be **outcome-focused and specific**
- Added **`service-corporate-bonding`** for team-bonding coverage
- Removed generic praise patterns

### Theme coverage

| Theme | Home | Service pages |
|-------|------|---------------|
| `team-bonding` | ✓ | corporate-games |
| `participation` | — | corporate-games |
| `engagement` | — | game-festival, bollywood-games |
| `kids-involvement` | ✓ | birthday, school |
| `community-interaction` | ✓ | festival, social, wedding, traditional |

### Before launch

1. Replace quotes with client-approved text
2. Set `"status": "verified"` and remove `"notice"` from meta
3. Optionally add `photoId` field later for testimonial + event photo pairing

---

## Task 5 — Event story architecture

**File:** `src/data/content/event-stories.json`  
**Loaders:** `src/lib/content/event-stories.ts`

### Purpose

Full case-study records for future UI. **Distinct from** `gallery-stories.json` (short Gallery page blocks).

### Item schema

| Field | Required | Purpose |
|-------|----------|---------|
| `id` | Yes | Stable key |
| `status` | Yes | `draft` \| `published` \| `archived` |
| `title` | Yes | Event headline |
| `location.city` | Yes | Local credibility |
| `location.venue` | No | Specificity |
| `audience` | Yes | corporate, school, community, etc. |
| `participants` | No | Scale proof |
| `serviceSlug` | Yes | Links to service detail |
| `date` | No | Recency (`YYYY-MM`) |
| `story` | Yes | Narrative body |
| `outcomes` | Yes | Bullet-ready results |
| `photoIds` | Yes | References `gallery.json` item ids |
| `featured` | No | Homepage / Gallery promotion |

### Sample drafts included

- `event-corporate-offsite-ahmedabad` (120 participants)
- `event-society-festival-vadodara` (350 participants)

### Loader API

- `getPublishedEventStories()`
- `getFeaturedEventStories()`
- `getEventStoriesByService(slug)`

**Not rendered on site yet.** No routes added in this phase.

---

## Task 6 — Trust section consolidation

### Problem: repetition erodes trust

Visitors who browse Home → About → Gallery → Services see the **same stats three times**, **similar audience grids twice**, and **gallery previews three times**. Repetition feels like filler, not reinforcement.

### Recommended ownership (one primary home per signal)

| Trust signal | Primary page | Secondary (optional) | Remove or reduce elsewhere |
|--------------|--------------|----------------------|----------------------------|
| **Stats (4 metrics)** | **Home** | — | Remove from About and Gallery, or show **2-metric subset** on Gallery only |
| **Testimonials** | **Home** (3 quotes) | **Service detail** (1–2 per slug) | Do not add to About, Services, Gallery |
| **Gallery photos** | **Gallery** | Home: **4 moments max** | Remove Services gallery preview OR reduce to 3 thumbs + link |
| **Who we serve** | **Services** | — | Remove from About OR reduce About to text-only mention |
| **Differentiators / Why us** | **Home** (Why us) | About: **Differentiators only** | Drop one; they say the same thing |
| **Short event stories** | **Gallery** | — | Do not duplicate on Home |
| **Full case studies** | Future `/stories` or Gallery subsection | Service detail sidebar | — |
| **Logo strip** | **Home** (when ready) | Corporate service detail | One strip sitewide max |

### Section verdict

| Section | Verdict |
|---------|---------|
| HomeTrustedStats | **Keep** (primary stats) |
| AboutTrustedStats | **Consolidate** → remove or replace with logo strip |
| GalleryStats | **Consolidate** → remove or 2-stat variant |
| HomeTestimonials | **Keep** |
| ServiceTestimonials | **Keep** (scoped per service) |
| HomeGalleryMoments | **Keep** (trim to 4 items) |
| AboutMomentsGallery | **Consolidate** → link to Gallery instead of full grid |
| ServicesGalleryPreview | **Consolidate** → remove or 3-image teaser |
| AboutWhoWeServe | **Consolidate** → merge with Services or shorten |
| ServicesWhoWeServe | **Keep** (primary audience map) |
| HomeWhyUs vs AboutDifferentiators | **Consolidate** → keep one narrative set |
| GalleryStories | **Keep** |
| Service FAQ | **Keep** |

### Implementation note

Consolidation is **planned**, not executed in this phase. Track as Phase 2 trust implementation tasks.

---

## Task 7 — Gaps and priority order

### Current state scorecard

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Immediate proof | 7/10 | Verified stats + strong photos |
| Social proof | 4/10 | Placeholder testimonials, no logos |
| Authority | 3/10 | Story exists; no case studies or names |
| Consistency | 5/10 | Repeated sections dilute impact |
| Launch readiness | 5/10 | Staging booking URL still live |

---

### Priority roadmap

#### P0 — Before launch (trust blockers)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Replace placeholder testimonials with real client quotes | Medium | High |
| 2 | Swap booking URLs to production in `booking-links.json` | Low | High |
| 3 | Remove testimonial placeholder notice from meta | Low | Medium |

#### P1 — First trust sprint (no redesign)

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 4 | Add 5–10 trust logos + enable `placements.home` | Medium | High |
| 5 | Consolidate stats to Home only (remove About + Gallery bands) | Low | Medium |
| 6 | Trim gallery preview duplication (Home 4, drop Services preview) | Low | Medium |
| 7 | Improve gallery item alts/captions in `gallery.json` | Medium | Medium |

#### P2 — Authority build

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 8 | Publish 2 `event-stories.json` items; build case-study card UI | High | High |
| 9 | Enable corporate logo strip on `corporate-games` detail | Medium | High |
| 10 | Merge About/Services “who we serve” into single content source | Medium | Medium |
| 11 | Add team/facilitator content file + About section | Medium | Medium |

#### P3 — Later

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 12 | Organization JSON-LD schema | Low | Medium |
| 13 | Video testimonials or event reels | High | Medium |
| 14 | Press / awards row | Low | Low–Medium |

---

## Content file reference

| File | Phase status |
|------|--------------|
| `content/stats.json` | Live |
| `content/testimonials.json` | Upgraded placeholders |
| `content/client-logos.json` | Architecture + categories |
| `content/event-stories.json` | Architecture + 2 drafts |
| `content/gallery-stories.json` | Live (short form) |
| `content/faqs.json` | Live |
| `content/company-info.json` | Live |
| `content/booking-links.json` | Live (staging URLs) |

**Related docs:** `CONTENT_MANAGEMENT_GUIDE.md`, `TRUST_STATS_UPDATE.md`, `WEBSITE_AUDIT_REPORT.md`

---

## Out of scope (this phase)

- Page layout or visual redesign
- New routes (`/stories`, `/clients`, etc.)
- Logo strip or case study React components
- Performance / bundle optimization
- Contact page or Game Library stubs

These are documented for the next implementation sprint after client assets and quotes are collected.
