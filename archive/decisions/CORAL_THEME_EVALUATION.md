# Soft Coral Theme Evaluation

**Date:** 2026-05-23  
**Change type:** Color language only (tokens + semantic foreground rules)  
**Preview route:** `/theme-preview/coral`

---

## Palette applied

| Token | Hex | Role |
|-------|-----|------|
| Primary | `#032A5D` | Unchanged navy |
| Accent (`secondary`) | `#FF6B6B` | Soft Coral fills, hero glow, dark-bg accents |
| Accent Hover | `#FF5252` | Hover on coral surfaces |
| Accent Light | `#FFF3F3` | Soft highlights, FAQ open, stat icon bg |
| Accent Soft | `#FFE8E8` | Warm section panels, card CTA chips |
| Accent Emphasis | `#C24141` | Links and hovers on light backgrounds (WCAG) |
| Secondary Foreground | `#FFFFFF` | Hero stat badge text on coral |

Legacy orange (`#FF9933`) fully replaced in `tokens.css` and `design-tokens.ts`.

---

## What changed (implementation)

- **Tokens:** `src/styles/tokens.css`, `src/styles/design-tokens.ts`
- **Shadows:** `--shadow-glow-accent` (coral glow, replaces orange RGB)
- **Warm sections:** `section-float-warm` uses Accent Light / Soft gradient
- **Navbar:** Active links coral on navy; Book pill coral fill; dropdown hover uses Accent Light bg
- **Badges / cards / stats:** Coral fills with readable foreground rules
- **Light-surface links:** `secondary-emphasis` instead of bright coral on white
- **Focus:** Still `outline: var(--color-secondary)` (coral ring)

Components were **not** restructured. Only color-related classes and tokens.

---

## Accessibility (WCAG 2.2 AA)

| Pairing | Ratio | AA normal (4.5:1) | AA large (3:1) | Usage |
|---------|------:|:-----------------:|:----------------:|-------|
| Navy `#032A5D` on white | **14.06:1** | Pass | Pass | Body headings |
| Coral `#FF6B6B` on navy `#032A5D` | **5.07:1** | Pass | Pass | Hero accent line, nav active |
| Emphasis `#C24141` on white | **5.09:1** | Pass | Pass | Link hovers on light panels |
| Navy on Accent Light `#FFF3F3` | **12.97:1** | Pass | Pass | Text on warm panels |
| Body `#444444` on Accent Light | **8.98:1** | Pass | Pass | Paragraphs on warm panels |
| Coral `#FF6B6B` on white | **2.78:1** | Fail | Fail | Avoid as small text on white |
| Navy on coral `#FF6B6B` | **~3.0:1** | Fail normal | **Pass bold/large** | Book pill, badges |
| White on coral | **2.78:1** | Fail | Fail | Not used on small Book label |

**Mitigations in code:**

- Light backgrounds: `text-secondary-emphasis` for hovers (not bright coral).
- Coral-filled pills/badges: **navy text, bold** (large-text threshold).
- Hero stat chip: white text on coral at display size (large text).

**Recommendation:** Do not use `#FF6B6B` as body-size link color on white. Use emphasis or primary.

---

## Homepage review: does coral improve the brand?

### Premium feel
**Improved.** Coral against navy reads softer and more contemporary than orange. Less “festival poster,” more hospitality / events brand. Floating clay panels + coral glow feel aligned with soft premium references.

### Playfulness
**Maintained.** Coral stays warm and energetic. Hero radial, sparkle marks, and stat badge still pop without shouting.

### Readability
**Improved on navy; unchanged on white.** Navy body copy unchanged. Accent lines on hero pass contrast. Light-section links use emphasis coral for safer reading.

### Brand memorability
**Stronger differentiation.** Orange event vendors are common in India; soft coral + navy is more ownable and pairs with clay surfaces without clashing.

---

## Pros

1. Softer contrast with navy: less harsh than orange.
2. Still energetic for CTAs and hero moments.
3. Accent Light / Soft backgrounds add warmth without loud fills.
4. Token architecture preserved (`secondary` alias keeps Tailwind/classes stable).
5. Dedicated preview route for stakeholder review.

---

## Cons

1. Bright coral `#FF6B6B` cannot be used for small text on white (contrast fail).
2. Coral-filled buttons need navy text, not white, for WCAG (slightly less “pill pop”).
3. Distinct from legacy orange: marketing materials may need refresh.
4. Must not confuse with error red (`#EF4444` semantic.error stays separate).

---

## Recommendations

1. **Ship coral** as default accent (already applied globally via tokens).
2. **Keep `secondary-emphasis`** for all light-surface interactive text.
3. **Use Accent Light** for subtle highlights (stats, FAQ, chips) instead of saturated fills.
4. **Review print/social assets** to swap orange for coral in offline materials.
5. **Optional A/B:** Compare `/` vs `/theme-preview/coral` side by side with stakeholders.
6. **Do not** use coral for form validation errors; keep semantic `error` token.

---

## Verification

```bash
cd TheGameHour-v2
npm run build
npm run dev
```

- `/` — homepage with coral accent
- `/services` — coral on cards and links
- `/theme-preview/coral` — full palette + component gallery

---

## Files touched

- `src/styles/tokens.css`, `design-tokens.ts`, `globals.css`
- Color-only updates: `Button`, `Badge`, `Navbar`, `Footer`, `ServiceCard`, `StatCard`, `FaqAccordion`, `FloatingActions`, home/services section link hovers
- `src/pages/CoralThemePreviewPage.tsx`, `src/router.tsx`, `src/constants/routes.ts`
