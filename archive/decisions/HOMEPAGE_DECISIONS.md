# Homepage V1: Decisions & Rationale

> Route: `/` · Component: `src/pages/HomePage.tsx`  
> Sections: `src/sections/home/*`  
> Preview: run dev server and open `/`

---

## Strategic goal

Answer five visitor questions in one scroll:

| Question | Section |
|----------|---------|
| Who are you? | Hero + Why Us |
| What do you do? | Hero subtext + Event Categories |
| Why trust you? | Trusted Stats + Testimonials |
| What experiences exist? | Event Categories (services.json) |
| How do I book? | Hero CTAs + How It Works + Final CTA |

**Not a legacy clone**, legacy stacked many equal-weight blocks (about, games grid, duplicate CTAs). V1 uses **storytelling arc**: emotion → proof → choice → differentiation → social proof → process → conversion.

---

## Section-by-section decisions

### 1. Hero

**Why:** First 3 seconds must convey category (event games), emotional benefit (real connection), and action (book).

**Improvements over legacy:**
- Headline leads with outcome (“Real laughter. Zero screen time.”) vs generic tagline-only
- Dual CTA: primary **Book** + secondary **Explore experiences** (clear funnel)
- Optimized `homepage/hero.webp` in clay frame, not raw full-bleed JPG
- Floating “500+ events” badge, instant credibility without scrolling
- Split layout: copy left / image right (desktop); stacked mobile-first

**Conversion:** Primary button → Bubble booking URL; secondary → `/services` for researchers.

---

### 2. Trusted Experiences (stats)

**Why:** Corporate and school buyers need numeric trust before browsing eight services.

**Metrics (placeholders):** 500+ events · 25K+ participants · 100+ games · 6+ cities, labeled as pending verification in UI.

**Improvements:** Dedicated beat before service grid; legacy buried proof in testimonials only.

---

### 3. Event Categories

**Why:** Core catalogue, must be dynamic from `services.json` for maintainability.

**Implementation:** `ServiceCard` × 8 with `title-card` assets via `asset-map`; links to `/services/:slug`.

**Improvements:** Single grid with short descriptions from JSON; removed legacy’s separate “game highlights” section that duplicated messaging with wrong image on icebreakers card.

---

### 4. Why The Game Hour

**Why:** Differentiation, “why not a DJ / magician / DIY games?”

**Six clay cards:** Screen-free · Facilitators · All ages · Corporate + family · Custom packages · Gujarat coverage.

**Improvements:** Legacy “Why Choose Us” was icon-font dependent and lower on page; V1 positions differentiation **before** gallery so rational buyers are convinced earlier.

---

### 5. Moments / Gallery

**Why:** Emotional proof, show real energy, not stock promises.

**Data:** `gallery.json` moment items + `ASSET_MAP.gallery.moments` WebP assets.

**Improvements:** Focused 6-image grid vs legacy’s mix of missing PNG paths; link to full `/gallery` for depth.

---

### 6. Testimonials

**Why:** Social proof from peers (CEO, parent, society secretary).

**Data:** `testimonials.json` filtered `context === 'home'` (3 quotes).

**Improvements:** Clay blockquotes with clear attribution; placed after visual proof for narrative flow.

---

### 7. How It Works

**Why:** Reduces booking anxiety, clear process beats “contact us and hope.”

**Steps:** Book → Plan → Play → Memories (4 columns, collapses to 2 on tablet, 1 on mobile).

**Improvements:** Legacy had no process section on homepage; this supports conversion-first UX.

---

### 8. Final CTA

**Why:** Last chance to convert scrollers who skipped hero CTA.

**Copy:** From `navigation.json` footer CTA (single source of truth).

**Actions:** Book · WhatsApp · Contact, three intent levels.

---

## Animation (SKILL.md aligned)

- `Reveal` / `RevealItem` with stagger on grids only
- No hero parallax or excessive motion
- Card hovers use existing ServiceCard / GalleryCard Framer lift
- Respects design system easing; subtle only

---

## Mobile UX

- Hero stacks: headline → CTAs → image
- Service grid: 1 → 2 → 4 columns
- Stats: 2×2 then 4-across
- Why Us: 1 → 2 → 3 columns
- Touch-friendly button sizes (`min-h` on Button md/lg)
- Sticky nav transparent→solid works over navy hero

---

## SEO

| Field | Value |
|-------|--------|
| Title | The Game Hour \| Screen-Free Event Games in Gujarat |
| Description | Book facilitator-led games for birthdays, weddings, corporate, schools, festivals |
| Canonical | `https://thegamehour.com` |
| OG image | `/og-default.jpg` (absolute URL) |
| Twitter | `summary_large_image` via `Seo` component |

---

## Technical architecture

```
HomePage.tsx
  └── sections/home/
        HomeHero.tsx
        HomeTrustedStats.tsx
        HomeEventCategories.tsx  ← services.json + asset-map
        HomeWhyUs.tsx
        HomeGalleryMoments.tsx   ← gallery.json + asset-map
        HomeTestimonials.tsx     ← testimonials.json (home)
        HomeHowItWorks.tsx
        HomeFinalCta.tsx         ← navigation.json CTA
```

**No changes** to reusable Button, Section, ServiceCard, etc., composition only.

---

## Out of scope (intentional)

- Game library teaser (moved to `/game-library` when built)
- Long “About” block (→ `/about` page later)
- FAQ accordion (→ contact or dedicated page)
- Floating WhatsApp FAB (still feature-flagged off)

---

## Next steps

1. Replace stat placeholders with verified numbers
2. Add real gallery originals when exported from production
3. A/B test hero headline with client
4. Enable `FEATURE_FLAGS.floatingCta` when ready for mobile conversion
