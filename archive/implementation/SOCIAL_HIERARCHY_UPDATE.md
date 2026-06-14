# Social Hierarchy Update Report

**Date:** 2026-05-23  
**Goal:** Instagram and LinkedIn as primary channels; Facebook visually secondary.

---

## Summary

Social links now use a **tier system** in content JSON. Footer and Contact page render Instagram and LinkedIn as prominent cards with messaging taglines. Facebook appears as a smaller, muted icon link.

---

## Content Changes

**File:** `src/data/content/social-links.json`

| Order | Channel | Tier | Tagline |
|-------|---------|------|---------|
| 1 | Instagram | `primary` | Real events. Real photos. Real experiences. |
| 2 | LinkedIn | `primary` | Professional credibility, corporate event expertise, and business trust. |
| 3 | Facebook | `secondary` | — |

**Type update:** `src/data/types.ts` — `SocialLinkItem` adds optional `tier` and `tagline`.

**Helpers:** `src/lib/content/social.ts`

- `getPrimarySocialLinks()` — Instagram + LinkedIn
- `getSecondarySocialLinks()` — Facebook

---

## New Component

**`src/components/SocialChannels/SocialChannels.tsx`**

Shared renderer with two variants:

| Variant | Used on | Layout |
|---------|---------|--------|
| `footer` | Footer contact column | Stacked primary cards + small Facebook icon |
| `contact` | Contact page | 2-column primary cards on sm+, dark panel background |

### Primary channel card (Instagram / LinkedIn)

- `surface-accent` icon chip (44–48px) — visually dominant
- Channel name in bold white
- Tagline in `text-white/75`
- Full-card link target — large click area
- Hover: border highlight, background lift, glow on icon
- Active: `scale(0.99)`

### Secondary channel (Facebook)

- 36px circular icon button
- `bg-white/8`, `text-white/70` — deliberately subdued
- Placed below primary cards with "Also on" screen-reader text
- Same hover/active affordances, smaller footprint

Facebook is **not** given a tagline card — avoids competing with primary channels.

---

## Footer

**File:** `src/components/Footer/Footer.tsx`

**Before:** Three equal 40×40 icon circles in a row.

**After:**

```
Follow us
┌─────────────────────────────────────┐
│ [IG] Instagram                      │
│      Real events. Real photos...    │
├─────────────────────────────────────┤
│ [IN] LinkedIn                       │
│      Professional credibility...    │
└─────────────────────────────────────┘
  (f)  ← small Facebook icon
```

- Responsive: cards stack in contact column on all breakpoints
- Grid layout (`lg:grid-cols-12`) unchanged — no column overflow
- Accessibility: each card is a single `<a>` with visible label + tagline; Facebook has `aria-label`

---

## Contact Page

**File:** `src/pages/ContactPage.tsx`

Added **"Connect with us"** card spanning full width:

- Intro copy references Instagram photos + LinkedIn corporate work
- Primary cards in `bg-primary` panel for contrast against clay section
- Uses `SocialChannels variant="contact"` — wider 2-column grid on tablet+

---

## Messaging Alignment

| Channel | Communicates |
|---------|--------------|
| **Instagram** | Real events, real photos, real experiences — social proof for families & celebrations |
| **LinkedIn** | Professional credibility, corporate expertise, business trust |
| **Facebook** | Present but not promoted — link available for users who search there |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Contrast on dark footer | White text on `bg-white/10` cards; accent icons use `text-on-accent` |
| Focus states | Inherit `transition-brand`; card borders highlight on hover/focus-within |
| Screen readers | Facebook row prefixed with visually hidden "Also on" |
| Touch targets | Primary cards ≥ 44px height; secondary icons 36px (acceptable for supplementary link) |
| External links | `rel="noopener noreferrer"` + `target="_blank"` |

---

## Files Changed

| File | Change |
|------|--------|
| `src/data/content/social-links.json` | Tier, taglines, reorder |
| `src/data/types.ts` | `tier`, `tagline` on `SocialLinkItem` |
| `src/lib/content/social.ts` | Primary/secondary getters |
| `src/components/SocialChannels/SocialChannels.tsx` | New component |
| `src/components/SocialChannels/index.ts` | Export |
| `src/components/Footer/Footer.tsx` | SocialChannels integration |
| `src/pages/ContactPage.tsx` | Connect with us section |

---

## Verification

- [x] Instagram and LinkedIn render larger than Facebook
- [x] Taglines visible on footer (desktop + mobile)
- [x] Contact page shows expanded social section
- [x] Facebook not visually dominant
- [x] Build passes
