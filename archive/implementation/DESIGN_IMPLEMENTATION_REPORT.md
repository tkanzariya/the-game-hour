# Design Implementation Report

**Project:** The Game Hour v2  
**Date:** 2026-05-23  
**Scope:** Visual identity + reusable components (no homepage, no content migration)

---

## Summary

Implemented a cohesive design system aligned with **premium + playful + nostalgic** positioning, anchored on primary `#032A5D` and warm orange `#FF9933`. All components are responsive and wired into the existing app shell.

**Preview route:** [/design-preview](http://localhost:5173/design-preview) (run `npm run dev`)

---

## 1. Design system documentation

| Deliverable                    | Path                          |
| ------------------------------ | ----------------------------- |
| Design system v2               | `design-system-v2.md`         |
| TS tokens (updated typography) | `src/styles/design-tokens.ts` |
| Tailwind theme                 | `src/styles/tokens.css`       |
| Global base + utilities        | `src/styles/globals.css`      |

---

## 2. Typography decision

| Role     | Font                  | Rationale                                                                    |
| -------- | --------------------- | ---------------------------------------------------------------------------- |
| Headings | **Plus Jakarta Sans** | Bold, modern experiential feel; works for corporate and celebration contexts |
| Body     | **Source Sans 3**     | Highly readable; trustworthy for long service copy                           |

Loaded in `index.html`. Legacy Poppins retired for v2 UI.

---

## 3. Components built

| Component           | Location                      | Status                            |
| ------------------- | ----------------------------- | --------------------------------- |
| Button              | `components/Button/`          | 4 variants, 3 sizes, link support |
| Badge               | `components/Badge/`           | 4 variants                        |
| Section             | `components/Section/`         | 4 tones, padding options          |
| Container           | `components/Container/`       | Max 1200px                        |
| PageHero            | `components/PageHero/`        | Navy + glow, responsive type      |
| ServiceCard         | `components/ServiceCard/`     | Hover lift, optional link         |
| GalleryCard         | `components/GalleryCard/`     | Hover scale, caption              |
| CTA                 | `components/CTA/`             | Primary / light tones             |
| Navbar              | `components/Navbar/`          | Desktop + mobile, sticky scroll   |
| Footer              | `components/Footer/`          | Links, contact, social, CTA       |
| FloatingActions     | `components/FloatingActions/` | WhatsApp + Call (inactive)        |
| Reveal / RevealItem | `components/motion/`          | Scroll animations                 |

---

## 4. Navbar v1

- Fixed top, `4.5rem` height
- **Transparent:** `bg-primary/85` + `backdrop-blur`
- **Scrolled:** solid `bg-primary` + `shadow-header`
- Desktop: nav links + Book Now
- Mobile: hamburger panel
- Active route: orange text (`secondary`)

Hook: `hooks/useScrolled.ts`

---

## 5. Footer v1

- Dark navy (`bg-dark`)
- Columns: brand, quick links (+ game library), contact + social placeholders (IG/FB/IN), plan-your-event CTA
- Copyright bar

Data from `utils/constants.ts` (contact, social, booking).

---

## 6. Floating CTA

- `FloatingActions`, WhatsApp (green) + Call (navy) fixed bottom-right
- **`FEATURE_FLAGS.floatingCta: false`**, not interactive on production routes
- **`preview` prop**, fully interactive on `/design-preview` only

To activate site-wide: set `FEATURE_FLAGS.floatingCta = true` in `constants.ts`.

---

## 7. Animation language

| Effect           | Implementation                   |
| ---------------- | -------------------------------- |
| Brand transition | `.transition-brand` (300ms)      |
| Card hover       | `-translate-y-2`, shadow upgrade |
| Image hover      | `scale-105`                      |
| Scroll reveal    | `Reveal` + `slideUp`             |
| Grid stagger     | `stagger` + `RevealItem`         |
| Nav scroll       | opacity + blur → solid           |

Presets: `src/animations/variants.ts`  
Config: `src/animations/config.ts` (`viewportOnce`)

---

## 8. UI showcase page

| Route             | Component                     |
| ----------------- | ----------------------------- |
| `/design-preview` | `pages/DesignPreviewPage.tsx` |

Sections: typography, colors, buttons, badges, cards (stagger), CTA, spacing notes, motion, floating actions preview.

SEO: `noIndex: true`

---

## 9. Files changed / added

**New**

- `design-system-v2.md`
- `DESIGN_IMPLEMENTATION_REPORT.md`
- `components/Container/`, `Badge/`, `FloatingActions/`, `motion/`
- `pages/DesignPreviewPage.tsx`
- `hooks/useScrolled.ts`
- `utils/cn.ts`

**Updated**

- All styled components listed above
- `layouts/MainLayout.tsx`, nav offset padding, FloatingActions
- `router.tsx`, `routes.ts`, design-preview route
- `tokens.css`, `globals.css`, `design-tokens.ts`, `index.html`
- `constants.ts`, SOCIAL links

**Unchanged intentionally**

- Placeholder pages (Home, About, etc.), still title-only
- `services.json`, not wired to UI
- Legacy reference, not modified

---

## 10. Verification

```bash
cd TheGameHour-v2
npm run dev
# Visit http://localhost:5173/design-preview
npm run build
```

---

## Next steps (out of scope)

1. Import brand logo into `assets/icons/`
2. Wire `services.json` into Services page + ServiceCard grid
3. Build real page sections from `content-map.md`
4. Enable floating CTAs when approved
5. Add real gallery images per `assets-report.md`
