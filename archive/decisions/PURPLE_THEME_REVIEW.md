# Purple Theme — Applied to Production

**Date:** 2026-05-23  
**Status:** **Live** — violet accent is the production theme  
**Archived comparison:** `/theme-preview/coral` (scoped coral restore)

---

## Palette (production)

| Token | Hex | Role |
|-------|-----|------|
| Primary | `#032A5D` | Navy backgrounds, primary CTAs |
| Accent (`secondary`) | `#8B5CF6` | Badges, nav active, hero accent, Book pill |
| Accent Hover | `#7C3AED` | Hover on violet surfaces |
| Light | `#F3EEFF` | Card chips, FAQ open, stat icon bg |
| Surface | `#EDE9FE` | Warm section panels |
| Emphasis | `#6D28D9` | Links and hovers on light backgrounds |

**Updated in:** `src/styles/tokens.css`, `src/styles/design-tokens.ts`

**Removed:** `/theme-preview/purple` (preview page discarded; accent applied site-wide)

---

## What changed

- Production accent switched from Soft Coral to Violet across all pages (homepage, services, navbar, footer, cards).
- Primary navy CTAs unchanged.
- Layout and content unchanged.
- Coral preview route kept as archived comparison with scoped token override.

---

## Evaluation summary

| Criterion | Assessment |
|-----------|------------|
| Premium feel | Strong — violet + navy reads refined |
| Playfulness | Moderate — cooler than coral; relies on photography/copy for warmth |
| Brand memorability | Distinct in local events market |
| Differentiation | Good vs orange/coral competitors |

See full pros/cons below from the original preview evaluation.

---

## Pros

1. **Premium positioning:** Elevates TGH toward curated experiences.
2. **Navy harmony:** Violet and navy are a high-contrast, elegant pairing.
3. **Cool/warm balance:** Warm event photos + cool accent on clay panels.
4. **Differentiation:** Less common than orange/coral in Gujarat events market.
5. **Accessible emphasis:** `#6D28D9` on white passes AA for link hovers.

---

## Cons

1. **Less inherently playful:** Cooler tone than coral for “real laughter” messaging.
2. **Generic violet risk:** `#8B5CF6` is widely used in tech/SaaS.
3. **Photography dependency:** Needs warm hero imagery to avoid feeling cold.

---

## Accessibility (WCAG 2.2 AA)

| Pairing | Ratio (approx.) | Notes |
|---------|----------------:|-------|
| Violet `#8B5CF6` on navy | ~5.8:1 | Pass — hero accent, nav active |
| Emphasis `#6D28D9` on white | ~7.0:1 | Pass — link hovers |
| Navy on Light `#F3EEFF` | ~13.5:1 | Pass |
| Violet `#8B5CF6` on white | ~3.4:1 | Fail small text — use emphasis on light bg |
| Navy on violet fill | ~3.5:1 | Pass bold/large — badges, Book pill |

---

## Test plan

1. Open `/` — hero accent line, Book pill, stat chip should be violet.
2. Check `/services` — card highlights and section underlines violet.
3. Navbar active link + footer headings — violet.
4. Visit `/theme-preview/coral` — should temporarily show archived coral accent only on that route.
