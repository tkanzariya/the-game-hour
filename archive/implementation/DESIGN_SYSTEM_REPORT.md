# Design System Report: The Game Hour v2

> Generated: 2026-05-23  
> Authority: `SKILL.md` (claymorphism) + brand `#032A5D` + legacy orange  
> Preview: `/design-preview` · Tokens: `src/styles/design-tokens.ts`

---

## Design intent

**Modern experiential-events brand** expressed through **soft clay surfaces**, **navy + orange** contrast, and **accessible** motion, playful and premium without SaaS-flat or carnival aesthetics.

---

## How SKILL.md influenced implementation

| SKILL.md rule | Implementation |
|---------------|----------------|
| Claymorphism metaphor | `.surface-clay`, dual shadows (`shadow-clay`, `shadow-card`), rounded 2xl cards |
| Semantic tokens | `design-tokens.ts` + `tokens.css`: no raw hex in components |
| Spacing 4/8/12/16/24/32 | `spacing` scale remapped to 4px base |
| Montserrat + Poppins | Google Fonts in `index.html`; `--font-body` / `--font-heading` |
| WCAG 2.2 AA focus | Orange `focus-visible` rings; keyboard dropdown + Escape |
| Explicit states | Button hover/active/disabled; nav active; card hover lift |
| Single metaphor | No flat Material-only cards mixed with skeuomorphic chrome |
| **Brand override** | `#032A5D` + `#FF9933` instead of skill default `#3B82F6` |

See `SKILL_ANALYSIS.md` for full philosophy breakdown.

---

## Typography

| Role | Font | Weights | Rationale |
|------|------|---------|-----------|
| **Display / headings** | Poppins | 600-800 | SKILL display font; playful geometry, still corporate-safe |
| **Body / UI** | Montserrat | 400-700 | SKILL primary font; excellent UI readability |

**Previous fonts (Plus Jakarta / Source Sans)** replaced per skill priority.

### Scale (desktop-first)

| Token | Size | Use |
|-------|------|-----|
| text-xs | 0.875rem | Captions, footer legal |
| text-base | 1rem | Body default |
| text-lg-xl | 1.125-1.25rem | Lead paragraphs |
| text-4xl-5xl | 1.875-2.5rem | Section H2 |
| text-6xl | 3.25rem | Page H1 |

---

## Color palette

| Token | Hex | Use |
|-------|-----|-----|
| primary | `#032A5D` | Nav, headings, primary buttons |
| secondary | `#FF9933` | Accents, active nav, badges, focus |
| light | `#F5F8FC` | Page background (nostalgic soft) |
| surface-clay | `#FFFFFF` | Elevated clay panels |
| dark | `#021D40` | Footer |
| whatsapp | `#25D366` | WhatsApp only |

---

## Spacing, radius, shadows

### Spacing (SKILL 4-32px)

`4 · 8 · 12 · 16 · 24 · 32` → `0.25rem` through `2rem` (+ section `5rem` / `6rem`)

### Radius (clay = rounder)

| Token | Value | Use |
|-------|-------|-----|
| DEFAULT | 12px | Small elements |
| xl | 24px | Cards, CTA, dropdown |
| 2xl | 32px | Large panels |
| full | pill | Buttons, badges |

### Shadows

| Token | Effect |
|-------|--------|
| shadow-card | Clay depth + top highlight inset |
| shadow-card-hover | Deeper lift on hover |
| shadow-clay | Standalone clay panels |
| shadow-clay-pressed | Button active press |
| shadow-fab | Floating WhatsApp/Call |

---

## Components

| Component | Path | Notes |
|-----------|------|-------|
| Button | `components/Button` | Pill; clay press; 4 variants |
| Section | `components/Section` | Tones: default, muted, dark, warm |
| Container | `components/Container` | 1200px max |
| Badge | `components/Badge` | Puffy pill badges |
| PageHero | `components/PageHero` | Navy + orange radial; overlaps nav |
| ServiceCard | `components/ServiceCard` | Motion hover lift; 4:3 image |
| GalleryCard | `components/GalleryCard` | Clay frame + caption |
| StatCard | `components/StatCard` | **New**: stats with clay surface |
| CTA | `components/CTA` | Primary navy / light clay |
| Navbar | `components/Navbar` | Transparent→solid; services dropdown; logo |
| Footer | `components/Footer` | 12-col grid; social pills; navigation.json |
| FloatingActions | `components/FloatingActions` | Feature-flagged; motion scale |

---

## Navbar v1

- **Sticky** fixed header
- **Scroll:** `bg-transparent` → `bg-primary` + `shadow-header`
- **Logo:** `getLogoUrl('dark')` from asset map
- **Services dropdown** (desktop): clay panel, 8 services from `navigation.json`
- **Mobile:** accordion under Services
- **CTA:** Book Now (secondary pill)
- **A11y:** Escape closes menus; `aria-expanded`; focus-visible

---

## Footer v1

- Logo + tagline from `navigation.json`
- Quick links + all service links
- Contact block (phone, email, location)
- Social placeholders (IG / FB / IN circles)
- Plan Your Event CTA + Book / WhatsApp
- Copyright bar

---

## Floating actions

- WhatsApp + Call FABs (bottom-right)
- `FEATURE_FLAGS.floatingCta: false` in production
- Active on `/design-preview` via `preview` prop
- Framer `whileHover` / `whileTap` scale

---

## Animation system

| Pattern | Implementation |
|---------|----------------|
| Section reveal | `Reveal` + `slideUp` + `viewportOnce` |
| Stagger grids | `stagger` / `staggerItem` (100ms) |
| Card hover | Framer `whileHover={{ y: -6 }}` on ServiceCard |
| FAB | scale 1.06 hover / 0.96 tap |
| Easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Reduced motion | `prefers-reduced-motion` disables smooth scroll |

Files: `src/animations/variants.ts`, `src/components/motion/Reveal.tsx`

---

## Design preview route

**URL:** `/design-preview`

Sections: Typography · Colors · Buttons · Badges · Stats · Cards · CTA · Spacing · Nav/Footer note · Motion · Responsive · Floating

Uses real assets via `getAssetUrl()` and live Navbar/Footer from layout.

---

## Responsive breakpoints

| Breakpoint | Behavior |
|------------|----------|
| &lt;768px | Single column; mobile nav drawer |
| 768-1023px | 2-col grids |
| ≥1024px | Full nav + 3-col cards; footer 12-col |

---

## Build status

```
npm run build → PASS (2026-05-23)
```

---

## Related docs

- `SKILL_ANALYSIS.md`, SKILL.md extraction
- `design-system-v2.md`, earlier reference (partially superseded by tokens)
- `src/data/asset-map.ts`, image URLs for cards in preview

---

## QA checklist

- [x] Typography global (Poppins + Montserrat)
- [x] Tokens synced TS + CSS
- [x] All 10 component types production-ready
- [x] Navbar dropdown + mobile
- [x] Footer complete
- [x] Floating actions feature-flagged
- [x] Framer motion consistent
- [x] `/design-preview` internal QA
- [x] Build passes
- [ ] Homepage sections (out of scope)
- [ ] Enable `floatingCta` at launch
