# SKILL.md Analysis: The Game Hour v2

> Source: `/SKILL.md` (claymorphism design system skill)  
> Priority applied: **skill.md → brand `#032A5D` → legacy → best practices**

## Design intent (one sentence)

Express The Game Hour as a **playful, premium experiential-events brand** through **soft, rounded, clay-like surfaces** with **high contrast**, clear hierarchy, and **accessible** interactions, using TGH navy and warm orange, not the skill’s default blue palette.

---

## Design philosophy

| Principle | From SKILL.md | TGH adaptation |
|-----------|---------------|----------------|
| Visual metaphor | Claymorphism: puffy, malleable, 3D-soft UI | Rounded XL surfaces, dual soft shadows, subtle gradients on cards/CTAs |
| Mood | Modern, high-contrast, playful | Energetic orange accents on deep navy; nostalgic `#F5F8FC` backgrounds |
| Consistency | Single metaphor; no mixing flat SaaS + skeuomorphism | Clay cards + clean type; avoid flat Material-only or carnival clutter |
| Tokens first | Semantic tokens over raw values | `design-tokens.ts` + `tokens.css` drive all components |
| Accessibility | WCAG 2.2 AA, keyboard-first, visible focus | Orange focus rings, dropdown keyboard support, `focus-visible` on all interactives |
| Tone | Concise, confident, helpful | Short labels, active nav states, clear CTAs |

**Avoid (per skill + brand brief):** corporate SaaS gray dashboards, generic agency purple gradients, childish carnival yellow overload.

---

## Typography preferences

| Role | SKILL.md default | **Implemented** | Rationale |
|------|------------------|-----------------|-----------|
| Primary / body | Montserrat | **Montserrat** 400-700 | Skill priority; readable for service copy |
| Display / headings | Poppins | **Poppins** 600-800 | Skill priority; playful display without childish tone |
| Mono | JetBrains Mono | Not used | No code UI in marketing site |

Desktop-first expressive scale; weights 400-800 only where needed.

---

## Layout patterns

- **Container:** max 1200px (`75rem`), horizontal padding 16-20px responsive.
- **Sections:** vertical rhythm 80-96px desktop, tighter on mobile; alternate `default` / `muted` / `dark` tones.
- **Hero:** full-width navy clay panel with warm radial glow (orange), generous top padding for fixed nav.
- **Grids:** 1 → 2 → 3 columns for cards; gallery 2-4 columns.
- **Footer:** multi-column link grid collapsing to stack on mobile.

---

## Component behavior (skill expectations)

| Component | Required states | Behavior |
|-----------|-----------------|----------|
| Button | default, hover, focus-visible, active, disabled | Pill shape; clay shadow; slight press on active; 2px focus ring |
| Cards | hover lift, focus within link | Soft clay elevation; image scale on hover; no harsh borders |
| Nav | default, hover, active, open (mobile) | Sticky; glass → solid; services dropdown on desktop |
| Badge | variants with readable contrast | Puffy full radius; semantic colors |
| CTA | primary / light panels | Rounded XL clay block; clear action row |

---

## Motion guidance

- **Duration:** 150ms (fast), 300ms (default), 400ms (slow), 800ms (reveal).
- **Easing:** `cubic-bezier(0.25, 0.1, 0.25, 1)`, smooth, not bouncy circus.
- **Reveal:** slide up + fade, stagger children 100ms (sections, card grids).
- **Hover:** translateY -4px on cards; scale 1.02-1.05 on FABs; no excessive parallax.
- **Respect:** `prefers-reduced-motion` via Framer reduced motion (future hook in config).

---

## Visual hierarchy

1. **H1 / PageHero**, Poppins extrabold, white on navy.
2. **H2 section titles**, Poppins bold + orange accent bar (`heading-accent`).
3. **H3 card titles**, Poppins semibold, primary navy.
4. **Body**, Montserrat regular, `#444` on light surfaces.
5. **Meta / captions**, Smaller, muted grey.
6. **CTAs**, Orange secondary buttons on navy; primary navy on light.

---

## Inferred constraints

- Do not use skill default primary `#3B82F6`, brand `#032A5D` wins.
- Clay shadows must stay subtle on navy (avoid muddy grey blobs).
- Spacing scale locked to **4 / 8 / 12 / 16 / 24 / 32** px multiples.
- Gallery/event photography carries color energy; UI chrome stays restrained.
- Floating WhatsApp/Call **feature-flagged** until launch approval.
- One visual metaphor: **clay-on-brand**, not neumorphism + flat mix.

---

## Conflict resolutions log

| Conflict | Resolution |
|----------|------------|
| SKILL fonts vs existing Plus Jakarta / Source Sans | **Montserrat + Poppins** (skill wins) |
| SKILL blue vs TGH navy | **#032A5D** (brand wins) |
| SKILL white surface vs nostalgic `#F5F8FC` | **#F5F8FC` light** (brand wins) |
| Fully transparent nav on light pages | **Glass `primary/10` → solid `primary`** for readability |

---

## QA checklist (from skill)

- [x] Semantic color tokens used in components
- [x] Focus-visible on buttons, links, dropdown triggers
- [x] Spacing rhythm 4-32 scale
- [x] Component states documented in `DESIGN_SYSTEM_REPORT.md`
- [x] `/design-preview` for internal validation
- [ ] `prefers-reduced-motion` global override (recommended next pass)
