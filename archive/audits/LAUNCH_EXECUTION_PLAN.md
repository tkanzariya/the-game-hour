# Launch Execution Plan

**Date:** 2026-05-23  
**Source:** [WEBSITE_AUDIT_REPORT.md](../../docs/operations/WEBSITE_AUDIT_REPORT.md)  
**Goal:** Turn audit findings into a sequenced, shippable launch roadmap.

**Legend**

| Field | Values |
|-------|--------|
| **Impact** | High / Medium / Low — user or business effect if unfixed |
| **Effort** | Low (< 1 day) / Medium (1–3 days) / High (> 3 days) |
| **Priority** | 1 = do first, 5 = do last within phase |

---

## Phase 1 — Launch Blockers

Must complete before any public marketing launch. These break trust, SEO, routing, or legal HTML.

| # | Item | Impact | Effort | Priority | Notes |
|---|------|--------|--------|----------|-------|
| 1.1 | **Swap Bubble booking URLs from `version-test` to production** | High | Low | 1 | Update `BOOKING.url` + `BOOKING.corporateUrl` in `constants.ts`; verify `services.json` meta matches. |
| 1.2 | **Fix `/contact` dead end** | High | Low | 1 | Option A: remove from nav/footer until page exists. Option B: redirect to booking or WhatsApp. Option C: minimal contact page (phone, email, WhatsApp, book link). |
| 1.3 | **Ensure OG image resolves (`/og-default.jpg`)** | High | Low | 2 | Copy from `src/assets/images/seo/` to `public/` or fix `buildSeo` paths. Verify Facebook/Twitter debugger. |
| 1.4 | **Remove nested `<main>` elements** | High | Low | 2 | Keep single `<main>` in `MainLayout`; remove from About, Gallery, Services, ServiceDetail, Placeholder, NotFound pages. |
| 1.5 | **Verify all image assets deploy (no "Image pending")** | High | Medium | 2 | Confirm ~185 assets in deploy pipeline; run `npm run assets:migrate` if needed; smoke-test every page. |
| 1.6 | **Remove or gate preview routes from production** | Medium | Low | 3 | `/design-preview`, `/new-ui-preview`, `/theme-preview/coral` — dev-only flag or strip from prod router. |
| 1.7 | **Fix `/game-library` footer dead end** | High | Low | 3 | Unlink from footer OR redirect to `/services` OR ship minimal stub with "coming soon" + Book CTA (not bare `<h1>`). |
| 1.8 | **Remove placeholder page SEO ("content migration pending")** | Medium | Low | 4 | If Contact/Game Library stay routed, use `noIndex` + branded minimal layout until real content ships. |
| 1.9 | **Verify deploy paths for `base: './'` and absolute OG URLs** | Medium | Low | 4 | Confirm canonical + OG URLs use full `https://thegamehour.com/...` on production host. |
| 1.10 | **Update FAQ booking answer** | Medium | Low | 5 | Point to live Bubble URL; remove reference to non-existent contact form. |

**Phase 1 exit criteria:** All booking CTAs hit production Bubble; no nav links to broken stubs; valid HTML landmarks; OG/social previews work; all production images load.

---

## Phase 2 — Trust & Credibility

Content and signals that make the brand feel real, verified, and premium.

| # | Item | Impact | Effort | Priority | Notes |
|---|------|--------|--------|----------|-------|
| 2.1 | **Replace or remove placeholder stats + disclaimer** | High | Medium | 1 | Either use verified numbers or remove stats sections until ready. Never ship "pending verified numbers" copy. |
| 2.2 | **Rewrite testimonials for specificity** | High | Medium | 1 | Add event type, city, outcome; cut "absolute hit / magical / game-changer" phrasing. |
| 2.3 | **Add client logos or named organizations (if available)** | High | Medium | 2 | Even 3–5 logos on Home or Corporate service page lifts credibility sharply. |
| 2.4 | **Expand Gallery stories (3 → 5–6) with real metrics** | Medium | Medium | 2 | Headcount, city, event type per story; ties photos to outcomes. |
| 2.5 | **Visualize facilitator credentials** | Medium | Medium | 3 | Short "who runs your event" block on About or service template — photo + 2 lines. |
| 2.6 | **Refresh legacy service intro copy** | Medium | Medium | 3 | Audit `services.json` intros for template tone; tighten to brand voice rules. |
| 2.7 | **Align CTA labels site-wide** | Low | Low | 4 | Standardize on "Book your event" vs "Discuss your event" — pick one primary phrase. |
| 2.8 | **Add cities-served visual (Gujarat map or city chips)** | Medium | Low | 4 | Reinforces "Our Reach" without another stats band. |
| 2.9 | **Replace emoji section icons with SVG or photo chips** | Medium | Medium | 5 | HomeWhyUs, About pillars, audience cards — premium polish. |
| 2.10 | **Event video or reel (15–30s)** | High | High | 5 | Strongest competitive differentiator; can ship post-launch if photos are strong. |

**Phase 2 exit criteria:** No placeholder trust copy visible; testimonials and stats defensible; social sharing looks professional.

---

## Phase 3 — UX Improvements

Structural friction, navigation, accessibility, and journey clarity.

| # | Item | Impact | Effort | Priority | Notes |
|---|------|--------|--------|----------|-------|
| 3.1 | **Prefix duplicate section IDs per page** | Medium | Low | 1 | `#book` → `#home-book`, `#gallery-book`, etc. Fixes invalid HTML + anchor links. |
| 3.2 | **Lightbox: add `aria-live` for slide changes** | Medium | Low | 1 | Announce "Image 2 of 8" to screen readers. |
| 3.3 | **Lightbox: fix backdrop focus order** | Medium | Low | 2 | Backdrop should not precede close button in tab order; use inert backdrop or `tabIndex={-1}`. |
| 3.4 | **Gallery filters: roving tabindex + arrow keys** | Medium | Low | 2 | Complete tablist pattern for keyboard users. |
| 3.5 | **Services dropdown: add `aria-controls`** | Low | Low | 3 | Link trigger button to panel id. |
| 3.6 | **Mobile nav: focus trap when drawer open** | Medium | Medium | 3 | Trap focus inside mobile menu; return on close. |
| 3.7 | **Add skip-to-content link** | Medium | Low | 3 | Hidden until focused; jumps past nav. |
| 3.8 | **Service detail breadcrumb** | Medium | Low | 4 | `Services > Corporate Games` — orientation + back path. |
| 3.9 | **Clarify ServiceCard interaction (lightbox vs navigate)** | Medium | Low | 4 | Optional "View photos" vs "Explore package" affordance; or disable lightbox on linked cards. |
| 3.10 | **Reduce cross-page section repetition** | Medium | High | 4 | Pick one canonical home for: Who We Serve, stats band, gallery teaser. Link elsewhere instead of duplicating. |
| 3.11 | **Shorten About page for ready-to-book users** | Medium | Medium | 5 | Collapse or merge Believe in Play + Differentiators; or add jump links. |
| 3.12 | **Gallery filter pills: touch target audit at 320px** | Low | Low | 5 | Ensure min 44px height on filter buttons. |
| 3.13 | **Unify final CTA section tone** | Low | Low | 5 | Services `tone="warm"` vs others `default` — pick one pattern. |
| 3.14 | **Mobile services nav: reduce taps to service** | Medium | Medium | 5 | Consider flat service list in drawer vs nested accordion. |

**Phase 3 exit criteria:** Valid unique IDs; lightbox and nav pass basic a11y checks; no confusing dead-end interactions.

---

## Phase 4 — Conversion Improvements

Optimize paths from interest → booking.

| # | Item | Impact | Effort | Priority | Notes |
|---|------|--------|--------|----------|-------|
| 4.1 | **Enable FloatingActions (WhatsApp + call) in production** | High | Low | 1 | `FEATURE_FLAGS.floatingCta: true` — matches footer promise; high-intent mobile path. |
| 4.2 | **Gallery mid-page Book CTA after Featured Moments** | High | Low | 1 | Capture peak emotional moment without full scroll. |
| 4.3 | **Sticky CTA: emphasize Book over WhatsApp on mobile** | Medium | Low | 2 | Primary button full-width first; WhatsApp secondary/icon. |
| 4.4 | **FAQ deep-link to Bubble booking** | Medium | Low | 2 | Inline link in booking FAQ answer on every service page. |
| 4.5 | **Corporate fast path from Services overview** | Medium | Medium | 3 | Secondary CTA or hero variant linking to corporate booking URL (not only via detail page). |
| 4.6 | **Gallery filter URL query sync (`?experience=birthday-games`)** | Medium | Medium | 3 | Shareable filtered views; better ad landing alignment. |
| 4.7 | **Service detail: multiple testimonials or mini-carousel** | Medium | Medium | 3 | Single quote feels thin for high-ticket events. |
| 4.8 | **External booking handoff cue** | Low | Low | 4 | Optional "Opens booking form in new tab" screen-reader text or subtle helper line. |
| 4.9 | **About audience tiles: add Book secondary action** | Medium | Low | 4 | Keep service link primary; small Book link for hot leads. |
| 4.10 | **Email capture / quote PDF (not ready to book)** | Medium | High | 5 | Lead nurture for corporate planners; post-launch unless CRM exists. |
| 4.11 | **Decision helper for 8 services** | Medium | High | 5 | "What's your event?" quiz → recommended service; post-launch enhancement. |
| 4.12 | **Authentic urgency (if true)** | Low | Low | 5 | e.g. "Weekend slots fill fast in wedding season" — only if factual. |

**Phase 4 exit criteria:** Book path visible at every major emotional peak; WhatsApp/call always reachable on mobile; corporate funnel not blocked.

---

## Phase 5 — Performance Optimization

Speed, bundle size, and perceived performance.

| # | Item | Impact | Effort | Priority | Notes |
|---|------|--------|--------|----------|-------|
| 5.1 | **Route-level code splitting (`React.lazy`)** | High | Medium | 1 | Lazy load About, Gallery, Services, ServiceDetail, Contact. Largest win for home-first visitors. |
| 5.2 | **Optimize `gallery-hero` (~610 KB webp)** | High | Low | 1 | Re-compress or resize; target < 200 KB for LCP. |
| 5.3 | **Self-host or async-load Google Fonts** | Medium | Medium | 2 | Remove render-blocking `<link>` in `index.html`; use `font-display: swap`. |
| 5.4 | **Hero images: compress + priority hints** | Medium | Low | 2 | Verify `fetchPriority="high"` only on one LCP image per page; lazy rest. |
| 5.5 | **Responsive images (`srcset` / `<picture>`)** | Medium | High | 3 | Hero + gallery grids; mobile shouldn't load desktop-width assets. |
| 5.6 | **Split Framer Motion or reduce motion scope** | Medium | High | 3 | Consider lazy-loading motion on below-fold sections only. |
| 5.7 | **Change image glob from `eager: true` to lazy map** | Medium | Medium | 4 | Defer non-critical asset URL resolution at startup. |
| 5.8 | **Add bundle analyzer + chunk budget** | Low | Low | 4 | Prevent regression; target initial JS < 150 KB gzip post-split. |
| 5.9 | **Preconnect only required third parties** | Low | Low | 5 | Audit `preconnect` for fonts/CDN after self-hosting. |
| 5.10 | **Service worker / static caching (optional)** | Low | High | 5 | Post-launch; marketing site may not need PWA. |

**Phase 5 exit criteria:** Home LCP < 2.5s on 4G (target); initial JS split; no single image > 300 KB on critical path.

---

## Quick Wins (< 1 hour each)

| Item | Phase | Impact |
|------|-------|--------|
| Production Bubble URLs (1.1) | 1 | High |
| Remove nested `<main>` (1.4) | 1 | High |
| Copy OG image to `public/` (1.3) | 1 | High |
| Remove Contact from nav OR redirect to WhatsApp (1.2) | 1 | High |
| Unlink Game Library from footer (1.7) | 1 | High |
| Gate preview routes with env flag (1.6) | 1 | Medium |
| Update FAQ booking answer (1.10) | 1 | Medium |
| Prefix duplicate section IDs (3.1) | 3 | Medium |
| Lightbox `aria-live` (3.2) | 3 | Medium |
| Lightbox backdrop focus fix (3.3) | 3 | Medium |
| Enable FloatingActions flag (4.1) | 4 | High |
| Gallery mid-page Book button (4.2) | 4 | High |
| FAQ Bubble deep-link (4.4) | 4 | Medium |
| Align CTA label copy (2.7) | 2 | Low |
| Remove stats disclaimer text (part of 2.1) | 2 | High |
| `noIndex` on placeholder pages (1.8) | 1 | Medium |
| Delete orphan page files (see backlog) | — | Low |

---

## High Impact Wins

Maximum business/trust effect relative to effort. **Do these early.**

| Rank | Item | Phase | Effort |
|------|------|-------|--------|
| 1 | Production booking URLs | 1 | Low |
| 2 | Fix Contact + Game Library dead ends | 1 | Low |
| 3 | Remove placeholder stats / disclaimer | 2 | Medium |
| 4 | Verify assets deploy correctly | 1 | Medium |
| 5 | OG image + social previews | 1 | Low |
| 6 | Enable FloatingActions (WhatsApp) | 4 | Low |
| 7 | Gallery mid-page Book CTA | 4 | Low |
| 8 | Route code splitting | 5 | Medium |
| 9 | Rewrite testimonials | 2 | Medium |
| 10 | Optimize gallery-hero weight | 5 | Low |

---

## Can Wait Until After Launch

Safe to defer without blocking a credible first launch (monitor analytics after).

| Item | Phase | Why it can wait |
|------|-------|-----------------|
| Event video / reel | 2 | High effort; photos sufficient for v1 |
| Client logo wall | 2 | Needs client approval |
| Email capture / quote PDF | 4 | Requires backend/CRM |
| Service decision quiz | 4 | Nice-to-have for 8 services |
| Unified hero component refactor | 3/5 | Maintainability, not user-visible |
| Consolidate 5 FinalCta components | 3 | DRY refactor |
| Reduce cross-page repetition (full edit) | 3 | Content strategy pass |
| Responsive srcset everywhere | 5 | Works without; optimize when metrics show mobile pain |
| Framer Motion splitting | 5 | Acceptable gzip today |
| TypeScript `strict` mode | — | Dev quality, not user-facing |
| TS/CSS token sync | — | Internal consistency |
| Footer SVG social icons | 2 | Cosmetic |
| Breadcrumb on service detail | 3 | Small UX gain |
| Gallery filter URL sync | 4 | Shareability, not core funnel |
| Corporate booking on Services hero | 4 | Detail page path works |
| `school-and-collage-event` slug redirect | — | Only if renaming |
| Test suite for routing/booking | — | Post-launch stability |
| PWA / service worker | 5 | Optional |
| Authentic urgency copy | 4 | Only if operationally true |
| Compare experiences tool | 3 | Post-launch IA |
| Placeholder page full redesign | 1 | Only if keeping routes live |

---

## Recommended Implementation Sequence

Execute in order. Each sprint assumes the prior is complete or in parallel where noted.

### Sprint 0 — Pre-launch checklist (Day 1)

**Goal:** Nothing embarrassing or broken goes live.

1. **1.1** Production Bubble URLs  
2. **1.3** OG image in `public/`  
3. **1.4** Remove nested `<main>`  
4. **1.2** Contact: remove from nav OR redirect (pick one)  
5. **1.7** Game Library: unlink footer OR redirect  
6. **1.6** Gate preview routes  
7. **1.10** FAQ booking copy  
8. **2.1** Remove stats disclaimer (hide section or use real numbers)  
9. **1.5** Asset deploy smoke test (all pages, all services)

**Parallel:** **1.8** `noIndex` on any remaining stubs.

---

### Sprint 1 — Trust polish (Days 2–4)

**Goal:** Site feels verified, not "under construction."

1. **2.1** Finalize stats strategy (real numbers or remove bands on Home/About/Gallery)  
2. **2.2** Testimonial rewrite (home + top 3 services first)  
3. **2.7** CTA label alignment  
4. **3.1** Unique section IDs  
5. **4.1** Enable FloatingActions  
6. **4.2** Gallery mid-page Book CTA  
7. **4.4** FAQ booking deep-links  

**Parallel:** **3.2–3.3** Lightbox a11y quick fixes.

---

### Sprint 2 — UX hardening (Days 5–7)

**Goal:** Smoother journeys, fewer confusion points.

1. **3.8** Service breadcrumbs  
2. **3.9** ServiceCard interaction clarity  
3. **3.6** Mobile nav focus trap  
4. **3.7** Skip-to-content  
5. **3.4** Gallery filter keyboard nav  
6. **4.3** Sticky CTA hierarchy (Book primary)  
7. **2.4** Expand gallery stories (if content ready)

**Optional same sprint:** **2.3** Client logos if assets exist.

---

### Sprint 3 — Performance (Days 8–10)

**Goal:** Faster first load, better mobile scores.

1. **5.1** Route-level code splitting  
2. **5.2** Compress gallery-hero  
3. **5.4** Hero image audit (priority + lazy)  
4. **5.3** Font loading strategy  
5. **5.8** Bundle analyzer baseline  

**Measure:** Lighthouse mobile on Home + Gallery before/after.

---

### Sprint 4 — Conversion depth (Post-launch Week 2)

**Goal:** Iterate based on analytics.

1. **4.5** Corporate fast path on Services  
2. **4.7** Service testimonial carousel  
3. **4.6** Gallery filter URL sync  
4. **2.8** Cities served visual  
5. **3.10** Content deduplication pass (one Who We Serve, one stats home)

---

### Sprint 5 — Premium polish (Post-launch Month 2+)

**Goal:** Close gap vs top experiential brands.

1. **2.10** Event video reel  
2. **2.9** Replace emoji icons  
3. **5.5** Responsive srcset  
4. **3.14** Unified MarketingHero component  
5. **2.5** Facilitator credentials block  
6. **4.10–4.11** Lead capture / decision helper (if justified by traffic)

---

## Summary matrix

| Phase | Items | Est. pre-launch effort | Launch required? |
|-------|-------|------------------------|------------------|
| **1 — Launch Blockers** | 10 | 1–2 days | **Yes** |
| **2 — Trust & Credibility** | 10 | 2–5 days (partial OK) | **Partial** (2.1–2.2 minimum) |
| **3 — UX Improvements** | 14 | 3–7 days | Partial (3.1, 3.2–3.3 recommended) |
| **4 — Conversion** | 12 | 1–3 days quick wins; rest post-launch | Partial (4.1–4.2 recommended) |
| **5 — Performance** | 10 | 2–4 days for 5.1–5.4 | Partial (5.1–5.2 recommended) |

### Minimum viable launch (MVL)

If time-constrained, ship after **Sprint 0** + these additions:

- **2.1** No placeholder stats disclaimer  
- **4.1** FloatingActions enabled  
- **5.2** gallery-hero compressed  

Everything else in Phases 3–5 can roll out in the two weeks after launch using analytics (bounce on Contact, Gallery→Book rate, mobile LCP).

---

## Tracking

Use this checklist in PR titles or project board:

```
[Launch-1.x]  Phase 1 — Launch Blockers
[Launch-2.x]  Phase 2 — Trust & Credibility
[Launch-3.x]  Phase 3 — UX Improvements
[Launch-4.x]  Phase 4 — Conversion
[Launch-5.x]  Phase 5 — Performance
```

**Related docs:** [WEBSITE_AUDIT_REPORT.md](../../docs/operations/WEBSITE_AUDIT_REPORT.md) · [BOOKING_ROUTING_AUDIT.md](../../docs/operations/BOOKING_ROUTING_AUDIT.md)

---

*Plan derived from audit. No implementation included.*
