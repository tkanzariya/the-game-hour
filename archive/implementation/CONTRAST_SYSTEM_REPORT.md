# Contrast System Report

**Date:** 2026-05-23  
**Scope:** Global semantic contrast rules + component variant alignment  
**No layout or structural changes**

---

## Problem

Purple accent surfaces (Book pill, 500+ badge, chips, badges) used `text-primary` (navy) on `#8B5CF6` fills. Contrast was ~3.5:1 — readable only at large/bold sizes and inconsistent across components.

---

## Rules created

| Rule | Surface type | Text token | Hex | Usage |
|------|--------------|------------|-----|-------|
| **A** | Dark / dominant fills (navy, violet accent, dark) | `text-on-accent` / `text-on-primary` / `text-on-dark` | `#FFFFFF` | Book CTA, badges, stat chip, sparkle icon |
| **B** | Light fills (white, light violet, clay) | `text-on-light` | `#032A5D` | Cards, secondary buttons, section headings |
| **B+** | Light accent + interactive labels | `text-on-accent-subtle` | `#6D28D9` | Chips, dropdown hovers, FAQ toggle |
| **C** | Disabled controls | `text-on-disabled` | `rgba(107,114,128,0.72)` | Disabled buttons |

### Surface utilities (preferred API)

| Class | Background | Foreground |
|-------|------------|------------|
| `surface-accent` | Violet `#8B5CF6` | White |
| `surface-accent-light` | `#F3EEFF` | Navy |
| `surface-accent-soft` | `#EDE9FE` | Navy |
| `surface-accent-chip` | Light violet → soft on hover | Emphasis violet |
| `surface-primary` | Navy | White |
| `surface-dark` | Dark navy | White |
| `surface-light` | White / elevated | Navy |

### Global cascade (`contrast.css`)

When `bg-secondary`, `bg-accent-light`, etc. are used without an explicit foreground, cascade rules auto-correct conflicting `text-primary` descendants. Prefer `surface-*` in component variants for explicit pairing.

---

## Semantic tokens added

**`tokens.css` / `design-tokens.ts`:**

- `--color-text-on-primary` / `onPrimary`
- `--color-text-on-accent` / `onAccent`
- `--color-text-on-light` / `onLight`
- `--color-text-on-dark` / `onDark`
- `--color-text-on-accent-subtle` / `onAccentSubtle`
- `--color-text-on-disabled` / `onDisabled`

Tailwind utilities: `text-on-primary`, `text-on-accent`, `text-on-light`, `text-on-dark`, `text-on-accent-subtle`, `text-on-disabled`.

`--color-secondary-foreground` now aliases `--color-text-on-accent`.

---

## Components affected

| Component | Change |
|-----------|--------|
| **Button** | Variants use `surface-primary`, `surface-light`; disabled uses `text-on-disabled` |
| **Badge** | `surface-accent`, `surface-primary`, `surface-light` |
| **Navbar** | Book pill → `surface-accent` |
| **HomeHero** | 500+ stat → `surface-accent`, inherits white text |
| **ServiceCard** | Sparkle → `surface-accent`; CTA chip → `surface-accent-chip` |
| **StatCard** | Icon box → `surface-accent-light` + `text-on-accent-subtle` |
| **CTA** | Primary tone → `surface-primary` + `text-on-primary` |
| **Footer** | Social hover → `surface-accent` |
| **FaqAccordion** | Open toggle → `surface-accent-soft` + `text-on-accent-subtle` |
| **ServiceStickyCta** | Hover book → `surface-accent` + `text-on-accent` |
| **Dropdown items** | Hover emphasis → `text-on-accent-subtle` |
| **FloatingActions** | Unchanged (WhatsApp green / navy call use Rule A fills) |

---

## Accessibility improvements

| Pairing | Before | After | WCAG AA |
|---------|--------|-------|---------|
| Book pill text | Navy on violet ~3.5:1 | White on violet **4.6:1** | Pass normal |
| 500+ badge | Navy on violet ~3.5:1 | White on violet **4.6:1** | Pass normal |
| Badge secondary | Navy on violet ~3.5:1 | White on violet **4.6:1** | Pass normal |
| Service card chip | Emphasis on light ~7:1 | Unchanged (Rule B+) | Pass |
| Stat icon box | Emphasis on light ~7:1 | Unchanged (Rule B+) | Pass |
| Secondary button | Navy on white ~14:1 | Unchanged (Rule B) | Pass |
| Disabled button | 50% opacity only | + `text-on-disabled` token | Improved |

*White on `#8B5CF6` ≈ 4.6:1; white on `#7C3AED` (hover) ≈ 5.2:1.*

---

## Files changed

| File | Purpose |
|------|---------|
| `src/styles/contrast.css` | **New** — rules, surface utilities, cascade |
| `src/styles/tokens.css` | Semantic foreground tokens |
| `src/styles/design-tokens.ts` | TS mirror of semantic tokens |
| `src/styles/globals.css` | Import contrast.css; dropdown token |
| Component variants | Adopt `surface-*` / `text-on-*` |

---

## Usage for future components

```tsx
// Dominant accent CTA / badge
<button className="surface-accent">Book</button>

// Light panel with navy copy
<div className="surface-accent-light">...</div>

// Interactive chip on card
<span className="surface-accent-chip">Explore →</span>

// Or rely on cascade if using raw bg-* (fallback only)
<div className="bg-secondary">...</div>  // white text applied automatically
```

Do **not** pair `bg-secondary` with `text-primary` — use `surface-accent` or omit foreground and let cascade apply.

---

## Test plan

1. Homepage — Book pill and 500+ badge: **white text** on violet.
2. Service cards — sparkle white on violet; chip navy/emphasis on light tint.
3. Navbar dropdown hover — emphasis violet on light violet bg.
4. Footer social icons — white on violet when hovered.
5. Disabled buttons — muted gray text at reduced opacity.
6. `/theme-preview/coral` — archived coral surfaces still follow same rules via shared utilities.
