# The Game Hour v2 — Complete Website Audit

**Date:** 2026-05-23  
**Scope:** Full production marketing site (Home, About, Gallery, Services, 8 Service Detail pages)  
**Method:** Code review, design-system audit, UX journey mapping, build output analysis  
**Rule:** Audit only. No fixes implemented.

---

## Executive Summary

The Game Hour v2 is a **solid, visually coherent marketing rebuild** with a real design system, image-first storytelling, and working booking routing. It reads as a **strong MVP**, not yet a **premium experiential brand** at the level of top event agencies.

The claymorphism + violet accent direction is distinctive and mostly consistent. The biggest gaps are **trust erosion** (placeholder stats, staging booking URLs, stub nav pages), **structural debt** (duplicate sections/IDs, nested `<main>`, monolithic bundle), and **journey dead ends** (Contact, Game Library).

### Overall Scores

| Dimension | Score | Summary |
|-----------|-------|---------|
| **Overall** | **7.0 / 10** | Cohesive rebuild with clear gaps before launch-grade polish |
| **UI** | **7.5 / 10** | Strong visual language; repetition and unfinished chrome hold it back |
| **UX** | **6.5 / 10** | Core funnels work; dead ends and duplicate content add friction |
| **Conversion** | **6.5 / 10** | CTAs everywhere but trust signals and staging URLs undermine confidence |
| **Performance** | **5.5 / 10** | Single ~608 KB JS chunk, heavy images, blocking fonts |
| **Accessibility** | **7.0 / 10** | Good button contrast and lightbox basics; HTML and SR gaps remain |

---

## Section 1 — UI Review

### Area scores (1–10)

| Area | Score | Notes |
|------|-------|-------|
| **Homepage** | 8 | Strong hero, clear arc, good image density. Stats disclaimer visible on-page hurts polish. `#experiences` + `#trusted` + `#moments` + `#testimonials` + `#book` is long; middle sections blur together. |
| **About** | 7.5 | Emotional hero and story land well. Overlaps Home/Services (`Who we serve`, stats, gallery). Milestone chips feel slightly template-like. |
| **Gallery** | 8 | Best image-first page. Featured asymmetry + filters feel intentional. Filter pill row may feel dense on small phones. |
| **Services** | 7 | Clean overview. `ServicesAllExperiences` duplicates Home service grid with different card layout. `Who we serve` duplicates About/Services patterns. |
| **Service detail** | 7.5 | Complete template (hero → why → gallery → activities → ideal for → testimonial → FAQ → CTA). Eight pages feel same-shaped; differentiation is mostly copy/images. |
| **Navbar** | 8 | Floating pill nav is premium. Services dropdown works. Book pill stands out. Mobile drawer functional but long (8 services + links). |
| **Footer** | 6.5 | Information-dense. Social icons as "IG/FB/IN" abbreviations feel dated vs icon SVGs. Links to **Contact** and **Game Library** stubs. |
| **Cards** | 7.5 | Clay cards + image frames cohesive. `ServiceCard` image opens lightbox while card body links to service — clever but can confuse ("Did I book or navigate?"). |
| **Buttons** | 8 | Four variants, consistent sizing, good hover/focus. Secondary-on-navy in sticky CTA uses heavy overrides (`!important`-style classes). |
| **Modals / Lightbox** | 7.5 | Premium dark backdrop, clay close button, swipe on mobile. Loading spinner is generic. Prev/next hidden below `md`. |

### Visual inconsistencies

1. **Hero implementations split four ways:** `HomeHero`, `AboutHero`, `GalleryHero`, `ServiceDetailHero` are bespoke; only `ServicesPageHero` uses shared `PageHero`. Same brand, duplicated markup and drift risk.
2. **Final CTA section tone:** Services uses `tone="warm"`; Home/About/Gallery use `tone="default"`. Subtle but breaks rhythm when cross-navigating.
3. **Emoji as section icons** (`HomeWhyUs`, About pillars, Services audiences): Playful but **below premium experiential brands** that use custom illustration or photography.
4. **Intro width drift:** Most sections use `SectionIntro` + `prose-intro`; heroes and some service blocks still use raw `max-w-2xl` / `max-w-3xl`.
5. **Placeholder page styling:** Contact/Game Library use bare `container-app-wide` + `<h1>` — visually disconnected from the rest of the site.

### Layout / width

- Marketing profile (`profile="marketing"`) is applied consistently on production sections — **good**.
- Home page has no inner `<main>`; About/Gallery/Services/ServiceDetail add their own — **inconsistent document structure** (see Accessibility).
- `SectionIntro` lives under `sections/home/` but drives About/Gallery/Services — organizational smell, not user-visible.

### Typography & hierarchy

- Poppins headings + Montserrat body is clear.
- Section titles (`heading-accent`) create rhythm; **too many sections share the same intro pattern** (centered H2 + grey subtitle), reducing hierarchy between primary and secondary blocks.
- Visible **placeholder stats disclaimer** on Home and About (`text-xs text-accent-muted-grey`) reads as "we are not ready" to visitors who miss the internal context.

### Repetitive / unfinished sections

| Pattern | Appears on |
|---------|------------|
| Stats band + disclaimer | Home, About, Gallery |
| Who we serve grid | About, Services |
| Gallery preview / moments | Home, About, Services, Gallery |
| Final CTA (Book + WhatsApp) | Home, About, Gallery, Services, all Service detail |
| 8 service cards grid | Home, Services |

**Verdict:** The site tells the same proof points multiple times before the user reaches booking. Not broken, but **not ruthlessly edited**.

---

## Section 2 — Design System Review

### What works

- Token stack in `design-tokens.ts` + `tokens.css` with contrast system (`contrast.css`) — **mature for v2**.
- Layout profiles (`default` vs `marketing`) in `constants/layout.ts` — **correct abstraction**.
- Clay surfaces, float panels, image frames, button variants — **cohesive family**.
- Framer Motion reveal language is consistent (`Reveal` / `RevealItem`).

### Violations & drift

| Issue | Severity | Detail |
|-------|----------|--------|
| **TS ↔ CSS token mismatch** | Medium | `radius.sm`: 4px (TS) vs 6px (CSS). `sectionPaddingYSm`: 3rem vs 3.5rem. Shadow `header`/`sm`/`fab` values differ slightly. |
| **Section padding bypasses tokens** | Medium | `Section.tsx` uses hardcoded Tailwind `py-20 md:py-24 lg:py-28` instead of `--spacing-section` vars. |
| **Nav dropdown radii** | Low | Hardcoded `1rem` / `0.625rem` — not from radius scale. |
| **Legacy alias** | Low | `shadow-glow-orange` duplicates `shadow-glow-accent` (coral migration leftover). |
| **`secondaryHover` = `secondaryDark`** | Low | Redundant color entries in TS. |
| **Service intro overrides** | Low | `ServiceWhyChoose`, `ServiceFaq` use ad-hoc `max-w-3xl` instead of `prose-intro`. |
| **Deprecated `tokens.ts`** | Low | Re-export shim still exists. |

### Card behavior consistency

- `GalleryCard`, `GalleryShowcaseCard`, `ServiceCard` all use clay + image-frame + hover lift — **aligned**.
- `StatCard` uses accent-light icon chip; stats on Gallery use photo backdrop — **intentional variation**, acceptable.
- `ServiceCard` `layout="showcase"` vs `standard` — homepage uses showcase correctly; services page uses featured flag — **good**.

### Animation language

- Hover: `y: -4 to -6`, scale ~1.02, 350ms ease — **consistent**.
- Page reveals: scroll-triggered stagger — **consistent**.
- Lightbox: separate enter/exit — **fits brand**.
- Risk: **motion-heavy pages** (Gallery filters + grid + every card hover) may feel busy on low-end devices.

---

## Section 3 — UX Review

### Journey 1: Visitor → Homepage → Service → Booking

```
Home Hero [Book | Explore Services]
    ↓
Service grid OR Services nav dropdown
    ↓
Service detail (hero Book + sticky bar)
    ↓
External Bubble booking (new tab)
```

**Friction points:**

1. **Book opens new tab** — correct for external app, but no "you are leaving the site" cue; some users may not realize booking started.
2. **Corporate booking URL** only on Corporate Games detail — Home/Services corporate cards link to service page first (extra step). Acceptable but not optimized for HR buyers ready to book.
3. **ServiceCard image vs link** — clicking image opens lightbox; clicking text goes to service. Power users may miss the service page entirely.
4. **No pricing or package summary** before booking — Bubble must carry full expectation-setting.

**Missing pathways:**

- No "Compare experiences" or decision helper for first-time visitors overwhelmed by 8 services.
- No breadcrumb on service detail (`Services > Corporate Games`).

### Journey 2: Visitor → Gallery → Booking

```
Gallery Hero → Featured → Filter grid → Stories → Stats → Book CTA
```

**Strengths:** Gallery is the strongest trust page; images sell the experience.

**Friction:**

1. Filters reset grid with animation — good feedback, but **no URL state** (can't share "Birthday Games" filter link).
2. Stories section is strong but **only 3 stories** — feels sample-sized.
3. Gallery → Book is one click at bottom; **no mid-page Book** after Featured (long scroll on mobile).

### Journey 3: Visitor → About → Booking

```
About Hero [Book | Explore] → Story → Values → Stats → Differentiators → Gallery → Audiences → CTA
```

**Friction:**

1. About is **long** (8 sections) before final CTA; trust-building is thorough but **fatiguing** for ready-to-book users.
2. "Discuss your event" CTA label differs from "Book your event" elsewhere — minor cognitive load.
3. Audience cards link to services (good) but **no direct Book** on audience tiles.

### Dead ends

| Route | Issue |
|-------|-------|
| `/contact` | In main nav + footer; **placeholder page only** ("content migration pending") |
| `/game-library` | Footer quick link; **placeholder** |
| Preview routes | `/design-preview`, `/new-ui-preview`, `/theme-preview/coral` — reachable in production router |

### Missing CTAs

- **Gallery mid-page** book prompt after Featured Moments.
- **About** sticky or floating book (only at bottom).
- **FloatingActions** disabled in production (`FEATURE_FLAGS.floatingCta: false`) — WhatsApp/call FAB not available despite footer promoting WhatsApp.

---

## Section 4 — Conversion Review

### CTA placement & hierarchy

**Strengths:**

- Book appears in: Navbar (always), Footer, every page hero, every final CTA, service sticky bar.
- WhatsApp secondary path on most conversion blocks — **appropriate for Indian market**.
- Service-specific CTA labels from JSON ("Request a Corporate Games Proposal") — **better than generic Book**.

**Weaknesses:**

1. **Primary vs secondary hierarchy blurs** when Book and WhatsApp sit side-by-side with equal visual weight (sticky bar: 50/50 split on mobile).
2. **Staging booking URLs** (`version-test`) — if a savvy visitor notices, **instant trust loss**.
3. **Placeholder metrics** with on-page disclaimer — actively signals incomplete business validation.
4. **Testimonials** read legacy-generic ("absolute hit!", "magical", "Highly recommend!") — weak social proof vs named companies with logos.
5. **No urgency or scarcity** (fine if authentic, but no "limited weekend slots" etc.) — neutral, not a bug.
6. **No video** — experiential brands often lead with 15–30s event reel; photos alone compete but don't win against video-heavy competitors.

### Trust signals audit

| Signal | Status |
|--------|--------|
| Real event photos | Strong (when assets deployed) |
| Client logos | Missing |
| Named testimonials | Present but generic copy |
| Stats | Placeholder with disclaimer |
| Facilitator credentials | Mentioned in copy, not visualized |
| Cities served | Mentioned (Gujarat) — good |
| FAQ | Present on service pages — good |
| Booking form | External Bubble — functional |

### Missed conversion opportunities

1. Corporate HR path: no dedicated landing CTA from Services overview hero (uses default URL).
2. Post-gallery emotional peak → immediate Book (requires scroll).
3. Service detail: testimonial is **single quote** — one card, not a carousel of proof.
4. No email capture / "Get a quote PDF" for users not ready to book.
5. FAQ booking answer still references generic "booking form" without deep-link to Bubble.

---

## Section 5 — Mobile Review

Reviewed against layout breakpoints and component classes (320 / 375 / 768).

### 320px (small phones)

| Issue | Risk |
|-------|------|
| Gallery filter pills (9 buttons) | Horizontal wrap creates **tall filter block**; scanning difficulty |
| Navbar Book + hamburger | Fits; Book pill may feel cramped next to menu |
| Service sticky CTA | Two equal-width buttons — **good touch targets** (min-h-11) |
| Hero headlines `text-4xl` → `text-6xl` | May still feel large on 320; likely OK with line breaks |
| Masonry gallery cells | Complex grid may produce ** uneven row heights** |

### 375px (standard mobile)

- Generally **good** — marketing open float gives breathing room.
- Mobile nav `max-h-[min(80vh,32rem)]` — long services submenu may require scroll inside drawer.

### 768px (tablet)

- Grids transition 2-col — **appropriate**.
- Lightbox prev/next buttons appear at `md` — good.
- Service sticky CTA moves to bottom-right floating card — **good desktop pattern**.

### Touch targets

- Buttons: min-h 40/48/56px by size — **passes 44px guideline** on md/lg.
- Lightbox expand icon: 36px — **slightly small**; whole image is tappable (OK).
- Filter pills: `px-4 py-2` — borderline on 320px; should verify ≥44px height.

### Navigation issues

- Mobile services accordion adds **2 taps** to reach a service (Menu → Services → Service).
- No skip-to-content link.

---

## Section 6 — Accessibility Review

### Contrast

- Contrast system (Rules A/B/C) addresses violet-on-navy issues — **strong improvement**.
- White text on primary navy CTAs — **pass**.
- Muted grey body text on clay — generally acceptable; verify `--color-accent-muted-grey` on `surface-muted` in all tones.

### Keyboard navigation

- Navbar: Escape closes menu/dropdown — **good**.
- Lightbox: Escape, arrows, Tab trap — **good basics**.
- Gallery filters: `role="tablist"` / `role="tab"` but **no roving tabindex** — arrow keys don't move between filters.
- Focus visible on buttons — **good** (`focus-visible:outline`).

### Focus management

- Lightbox: focus to close button on open, restore to trigger on close — **good**.
- Lightbox backdrop is focusable `<button>` before panel — **awkward tab order**.
- Mobile nav: focus trap not explicit when open.

### Lightbox / modal

| Check | Status |
|-------|--------|
| `role="dialog"` + `aria-modal` | Yes |
| Slide change announced | **No** `aria-live` |
| Redundant button + img alt | Minor redundancy |
| Body scroll lock | Yes |

### HTML structure

- **Nested `<main>`:** `MainLayout` wraps `<main><Outlet /></main>`; About, Gallery, Services, ServiceDetail, Placeholder, NotFound add **second `<main>`** — **invalid HTML**, screen reader landmark confusion.
- **Duplicate `id` values** across pages (`#book`, `#moments`, `#trusted`, `#who-we-serve`, `#testimonials`, `#experiences`) — invalid when thinking site-wide; breaks unique fragment links.

### Dropdowns

- Services dropdown: `aria-expanded`, `aria-haspopup` on button — **good**.
- Click-outside closes — **good**.
- No `aria-controls` linking button to panel id.

---

## Section 7 — Performance Review

Based on `npm run build` output and Vite config.

### Bundle

| Asset | Size (gzip) | Issue |
|-------|-------------|-------|
| `index-*.js` | ~608 KB (~183 KB gzip) | **Single monolithic chunk** — no route splitting |
| `index-*.css` | ~69 KB (~11 KB gzip) | Acceptable |
| Framer Motion | In main bundle | Heavy for mostly scroll reveals |

**No `React.lazy` on routes.** Home visitor downloads Gallery + About + all service logic upfront.

### Images

- `import.meta.glob(..., { eager: true })` — **all images mapped at init** (~185 files under `src/assets/`).
- Migration stats flag `gallery-hero` at **~610 KB webp** — LCP risk on Gallery page.
- Hero images ~340–370 KB webp — heavy but common for hero; needs priority + lazy below fold.
- Lightbox loads full image on open — **good** deferred pattern.
- No responsive `srcset` / `<picture>` — mobile loads same assets as desktop.

### Fonts

- Google Fonts loaded synchronously in `index.html` — **render-blocking**.
- Only weights 400–800 loaded — reasonable subset.

### Route loading

- All pages static imports in `router.tsx`.
- Preview pages (`DesignPreviewPage`, etc.) included in production router — **unnecessary weight + exposure**.

### SEO assets

- `PUBLIC_ASSETS.ogDefaultJpg` → `/og-default.jpg` referenced in SEO.
- **`public/` only has favicon, icons, htaccess** — OG image may 404 unless copied at deploy.

---

## Section 8 — Content Review

### Headlines — strong

- Home: "Real laughter. Zero screen time." — **distinctive, on-brand**.
- Gallery: "Moments of laughter you can almost hear." — **evocative**.
- About: "We bring people back together, one game at a time." — **human**.

### Generic / weak areas

| Content | Issue |
|---------|-------|
| Testimonials | Legacy tone ("absolute hit", "magical", "game-changer") — ** interchangeable with any event vendor** |
| Stats disclaimer | "representative placeholders pending final verified numbers" — **should not ship to production** |
| Service intros | Some paragraphs still read **template-like** from legacy JSON |
| FAQ booking answer | References booking form without URL; Contact page doesn't exist |
| Placeholder pages | "content migration pending" in SEO description — **unprofessional if indexed** |
| Emoji section icons | "🎯 🎤 👨‍👩‍👧‍👦" — friendly, not premium |

### Repetition

- "Screen-free", "facilitator-led", "Gujarat" appear **many times** — good for SEO, fatiguing for humans on long sessions.
- Footer CTA copy reused on Home + Services final CTA verbatim.
- Who we serve descriptions duplicated between About JSON and Services JSON audiences.

### Placeholder content still visible

- HomeTrustedStats, AboutTrustedStats, GalleryStats — placeholder metrics.
- Contact, Game Library pages — stub.
- `HomeHowItWorks` step labels "Book / Plan / Play / Memories" — fine as process copy, not placeholders.

---

## Section 9 — Technical Review

### Routing

- Clean SPA structure with legacy redirects — **good**.
- Invalid service slug → redirect to `/services` — **good**.
- **5 orphan page files** (`BirthdayEventsPage`, etc.) — dead code.
- `NotFoundPage` imports deprecated `@/utils/routes` shim.

### Component architecture

- Page → sections → shared components — **clear layering**.
- Data in JSON + lib getters — **maintainable**.
- **High duplication:** 5× `*FinalCta` components, 2× trusted stats, 2× who-we-serve, 4× hero implementations.
- `SectionIntro` in `sections/home/` used globally — mild coupling.

### State management

- Minimal React state (gallery filters, nav open, lightbox context) — **appropriate for marketing site**.
- No global store needed today.

### Asset management

- Central `asset-map.ts` + `getAssetUrl()` — **good pattern**.
- Assets exist locally (~185 files) but **may not be committed** (gitignore); deploy process must include migration output.
- Placeholder SVG when asset missing — dev-friendly, **bad if reached in production**.

### Booking architecture

- `lib/booking.ts` slug resolver — **correct single source at runtime**.
- URLs also in `constants.ts`, `services.json` meta, and per-service `cta.href` — **triple redundancy**; JSON hrefs unused at runtime.

### Future risks

1. Adding 9th service requires slug updates in asset-map, services.json, navigation, booking filters.
2. No tests — regressions in routing/booking undetected.
3. TypeScript `strict` not enabled — weak compile safety.
4. `school-and-collage-event` typo baked into slug and URLs — permanent unless redirected.
5. Preview routes in production — accidental indexing, bundle bloat.

---

## Section 10 — Bug Hunt

| Category | Finding | Severity |
|----------|---------|----------|
| **HTML** | Nested `<main>` on 4+ pages | High |
| **HTML** | Duplicate section IDs site-wide | Medium |
| **Routing** | `/contact`, `/game-library` live stubs linked from nav | High |
| **SEO** | `/og-default.jpg` likely 404 in `public/` | High |
| **Booking** | All URLs point to Bubble `version-test` (staging) | Critical (pre-launch) |
| **Links** | Footer Contact → placeholder | High |
| **Content** | FAQ references contact/booking form inconsistently | Medium |
| **Interaction** | ServiceCard: lightbox vs navigate split | Low (UX confusion) |
| **Interaction** | Gallery filter tabs: no keyboard arrow nav | Medium |
| **Lightbox** | No SR announcement on slide change | Medium |
| **Mobile** | Lightbox prev/next hidden; swipe-only | Low |
| **Visual** | Placeholder stats disclaimer visible | Medium |
| **Dead code** | 5 orphan event page components | Low |
| **Deploy** | `base: './'` relative paths — verify OG/social absolute URLs | Medium |

No evidence of broken internal service links (slugs match navigation). Legacy redirects wired.

---

## Section 11 — Competitive Review

**Compared to:** premium experiential agencies, corporate team-building studios, modern wedding experience vendors.

### Would this feel premium?

**Partially.**

| Premium signals | Present? |
|-----------------|----------|
| Custom visual identity (clay + violet) | Yes |
| Full-bleed photography | Yes |
| Editorial gallery | Yes |
| Cinematic video / reel | No |
| Client logo wall | No |
| Case studies with metrics | No (stories are short) |
| Polished microcopy | Mixed |
| Instant booking confidence | Undermined by staging URL + placeholder stats |

### What feels modern

- Floating nav, scroll reveals, lightbox, filterable gallery.
- Wide marketing layout, open float panels.
- Mobile sticky booking bar on service pages.

### What feels outdated or unfinished

- Emoji iconography in feature grids.
- Footer social "IG/FB/IN" text badges.
- Placeholder pages linked in primary navigation.
- Visible "pending verified numbers" disclaimer.
- Generic testimonial voice.
- No game library despite footer promise.
- Monolithic SPA without perceived performance optimization.

**Honest positioning today:** Upper-mid tier regional event brand site — **not yet** in the league of national experiential agencies that lead with video, case studies, and flawless launch polish.

---

## Section 12 — Prioritization

### CRITICAL (fix before marketing launch)

1. **Swap booking URLs from `version-test` to production Bubble URLs**
2. **Replace or remove placeholder stats** — do not ship visible disclaimer to customers
3. **Fix `/contact` dead end** — remove from nav until built, or redirect to booking/WhatsApp
4. **Ensure OG image exists at `/og-default.jpg`** (or fix SEO paths)
5. **Remove nested `<main>` elements** — single landmark in MainLayout only

### HIGH

6. **Implement or unlink `/game-library`** footer route
7. **Route-level code splitting** — lazy load Gallery, About, Services, ServiceDetail
8. **Consolidate duplicate section IDs** — prefix with page scope (`home-book`, `gallery-book`)
9. **Add `aria-live` to lightbox** slide changes; fix backdrop focus order
10. **Verify all 185 assets deploy** — no "Image pending" in production
11. **Gate preview routes** behind dev flag or remove from production router
12. **Upgrade testimonials** — specific outcomes, photos, or logos; cut generic praise

### MEDIUM

13. **Consolidate 5 FinalCta components** into one configurable block
14. **Unify hero pattern** — extend `PageHero` or shared `MarketingHero` for all pages
15. **Reduce cross-page repetition** — pick one home for Who We Serve, one stats band
16. **Gallery filters: URL query sync** for shareable filtered views
17. **Self-host or async-load fonts** — remove render-blocking Google Fonts
18. **Responsive images** — srcset for hero and gallery grids
19. **Corporate booking CTA** on Services page hero when audience = corporate (optional funnel)
20. **Enable FloatingActions** or remove dead FAB stubs

### LOW

21. Sync TS/CSS radius and shadow tokens
22. Replace emoji icons with SVG or photo chips
23. Footer social proper icons
24. Delete orphan placeholder page files
25. Enable TypeScript `strict`
26. Breadcrumb on service detail
27. Roving tabindex on gallery filter tabs
28. Consolidate booking URL to single constant import (remove JSON drift)

---

## Top 20 Improvements (ranked)

1. Production Bubble booking URLs (not staging)
2. Remove/replace placeholder stats and on-page disclaimer
3. Fix Contact nav dead end (build page or redirect)
4. Fix OG image 404 risk
5. Fix nested `<main>` HTML
6. Lazy-load routes + split JS bundle
7. Deploy-verify all image assets
8. Remove or gate preview routes from production
9. Rewrite testimonials for specificity and trust
10. Unify duplicate section IDs
11. Lightbox accessibility (aria-live, focus order)
12. Build or unlink Game Library
13. Consolidate FinalCta duplication
14. Reduce Who We Serve / stats / gallery repetition across pages
15. Self-host fonts / eliminate render-blocking
16. Optimize gallery-hero and hero image weight + srcset
17. Unified hero component across pages
18. Gallery filter URL state + keyboard nav
19. ServiceCard interaction clarity (lightbox vs navigate)
20. Footer social icons + remove "IG/FB/IN" abbreviations

---

## Appendix — Booking CTA Routing Table (verified)

All booking CTAs should point to Bubble (not `/contact`). Current implementation:

| Source | Label | Destination |
|--------|-------|-------------|
| Navbar Book | Book | Default Bubble URL |
| Footer | Book Now | Default Bubble URL |
| HomeHero | Book your event | Default |
| HomeFinalCta | Book your event now | Default |
| AboutHero | Book your event | Default |
| AboutFinalCta | Discuss your event | Default |
| ServicesPageHero | Book your event | Default |
| ServicesFinalCta | Book your event now | Default |
| GalleryFinalCta | Book event | Default |
| ServiceDetailHero | Per-service label | Default or **Corporate** (corporate-games only) |
| ServiceFinalCta | Per-service label | Default or Corporate |
| ServiceStickyCta | Book event / Book now | Default or Corporate |

**Warning:** URLs currently use `version-test` path on Bubble.

---

## Appendix — Page Section Map

| Page | Sections |
|------|----------|
| Home | Hero, Stats, Experiences (8 cards), Why Us, Gallery moments, Testimonials, How it works, Final CTA |
| About | Hero, Story, Believe in Play, Stats, Differentiators, Moments gallery, Who we serve, Final CTA |
| Services | Hero, All experiences, Who we serve, Gallery preview, Final CTA |
| Gallery | Hero, Featured, Browse+grid, Stories, Stats, Final CTA |
| Service ×8 | Hero, Why choose, Gallery, Activities, Ideal for, Testimonial, FAQ, Final CTA + Sticky CTA |

---

*End of audit. No code changes were made.*
