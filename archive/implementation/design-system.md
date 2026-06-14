# The Game Hour: Design System

> Source: legacy audit (`TheGameHour-legacy/style.css`, HTML pages).  
> Implementation tokens: `src/styles/design-tokens.ts`

---

## Brand personality

### What The Game Hour feels like

| Trait                     | Evidence from legacy                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| **Playful & energetic**   | Bright orange accents, lift-on-hover cards, scroll animations, exclamation-heavy copy |
| **Nostalgic & wholesome** | “Screen-free fun,” traditional games, family reunions, classic activities             |
| **Warm & inclusive**      | All-ages messaging, cross-generational games, Gujarat city reach                      |
| **Approachable premium**  | Navy professionalism + structured service pages, not luxury-minimal                   |
| **Community-first**       | Society festivals, schools, weddings: human connection over corporate sterility      |

**Not:** cold corporate SaaS, dark/edgy nightlife, ultra-minimal luxury.

**Positioning sentence:** _A friendly, high-energy event partner that brings people together through nostalgic, screen-free play, professional enough to trust for weddings and corporates, fun enough for kids and festivals._

---

## Color audit (legacy)

| Token              | Hex               | Usage                                                               |
| ------------------ | ----------------- | ------------------------------------------------------------------- |
| Primary            | `#032A5D`         | Headings, header bg, primary buttons, icons (feature boxes)         |
| Secondary (accent) | `#FF9933`         | H2 underline, nav hover, city-card hover, feature icons, logo hover |
| White              | `#FFFFFF`         | Backgrounds, button text on primary                                 |
| Light grey         | `#F8F8F8`         | Section alt backgrounds (`bg-primary-light`)                        |
| Text               | `#444444`         | Body copy                                                           |
| Dark grey          | `#333333`         | Section descriptions                                                |
| WhatsApp           | `#25D366`         | WhatsApp CTA button                                                 |
| Hero overlay       | `rgba(0,0,0,0.6)` | Hero-alt background dim                                             |

**Outlier (do not carry to v2):** `contact-us.html` uses Tailwind red `#EF4444` and grey `#1F2937`, inconsistent with main brand.

---

## Complementary palette (v2 recommendation)

Built around confirmed primary `#032A5D`:

| Role             | Hex                   | Rationale                                               |
| ---------------- | --------------------- | ------------------------------------------------------- |
| Primary          | `#032A5D`             | Brand anchor (unchanged)                                |
| Primary 700-500  | `#04397D` → `#1E67B8` | Depth for hovers, gradients, links                      |
| Dark             | `#021D40`             | Footer depth, hero text on light                        |
| Light            | `#F5F8FC`             | Page background (slightly cooler than legacy `#F8F8F8`) |
| Secondary (warm) | `#FF9933`             | Preserve legacy orange energy                           |
| Secondary light  | `#FFB366`             | Soft highlights, badges                                 |
| Secondary dark   | `#E67E00`             | Hover on orange elements                                |
| Muted text       | `#6B7280`             | Supporting copy                                         |
| Success          | `#22C55E`             | Form success, confirmations                             |
| Warning          | `#F59E0B`             | Alerts, optional badges                                 |
| WhatsApp         | `#25D366`             | Channel CTA only                                        |

**Usage ratio:** ~70% navy/white/light neutrals, ~20% orange accent, ~10% semantic/social.

---

## Typography

| Element             | Legacy                                     | v2 token                              |
| ------------------- | ------------------------------------------ | ------------------------------------- |
| Family              | Poppins (Google Fonts: 300, 400, 600, 700) | `typography.fontFamily.sans`          |
| H1 (home)           | 3.5rem / 700                               | `fontSize.6xl`                        |
| H1 (hero-alt)       | 3.8rem / white                             | `fontSize.7xl`                        |
| H2                  | 2.5rem / centered / underline accent       | `fontSize.5xl` + orange `::after` bar |
| H3                  | 1.8rem                                     | `fontSize.4xl`                        |
| Body                | 18px implicit / line-height 1.6            | `base` + `lineHeight.normal`          |
| Section description | 1.1rem / `#333`                            | `fontSize.lg`                         |
| Button              | 1.05rem / 600                              | `fontSize.md` / `semibold`            |

**Recommendation:** Keep Poppins. Add optional display tightening on H1 (`letterSpacing.h1`). Consider `font-display: swap` for performance.

---

## Buttons

| Variant       | Style                                                           | Hover                       |
| ------------- | --------------------------------------------------------------- | --------------------------- |
| **Primary**   | Navy fill, white text, 2px border, pill (`border-radius: 50px`) | Invert: white bg, navy text |
| **Secondary** | White fill, navy border/text                                    | Navy fill, white text       |
| **Tertiary**  | Transparent, navy border (smaller padding)                      | Navy fill, white text       |
| **WhatsApp**  | `#25D366` fill                                                  | Invert like primary         |

Padding: `12px 28px` (primary/secondary), `8px 20px` (tertiary).  
Transition: `0.3s ease` on all properties.

---

## Spacing & layout

| Pattern                      | Value                                     |
| ---------------------------- | ----------------------------------------- |
| Container max-width          | `1200px`                                  |
| Container horizontal padding | `20px`                                    |
| Section vertical padding     | `80px 0` (`.section-padding`)             |
| Grid gaps (cards)            | `30px` (services/games), `15px` (gallery) |
| Hero top padding             | `120px` (clears fixed header)             |
| H2 bottom margin             | `40px`                                    |
| Stack gap (hero alt)         | `40px`                                    |

Scale mapped in `design-tokens.ts` → `spacing`, `layout`.

---

## Cards & surfaces

| Component                    | Radius      | Shadow                       | Hover                               |
| ---------------------------- | ----------- | ---------------------------- | ----------------------------------- |
| Service card                 | `8px`       | `0 5px 15px rgba(0,0,0,.08)` | `translateY(-10px)`, deeper shadow  |
| Game card                    | `8px`       | Same                         | Same lift                           |
| Testimonial card             | `8px`       | Same                         | `translateY(-5px)`                  |
| Gallery item                 | `8px`       | Same                         | `scale(1.02)` + image `scale(1.05)` |
| Feature item (why choose)    | `8px`       | Same                         | `translateY(-5px)`                  |
| Feature box (service detail) | `8px`       | Same + border                | `translateY(-8px)`, orange border   |
| City badge                   | `50px` pill | `0 4px 10px`                 | Bg → orange, text → navy            |

Images in cards: fixed heights (service `180px`, game `200px`, gallery `250px`), `object-fit: cover`.

---

## Motion & interaction

| Effect              | Implementation                                            |
| ------------------- | --------------------------------------------------------- |
| Scroll reveal       | `IntersectionObserver` on `.reveal-on-scroll` → `.active` |
| Hero stagger        | `.fade-in-up` + `.delay-1` … `.delay-5`                   |
| Nav underline       | `::after` width transition on hover/active                |
| Link “Learn more”   | `translateX(5px)` + color → orange                        |
| Service hero slider | Auto-rotate images, chevron arrows                        |
| Global              | `scroll-behavior: smooth`                                 |

v2: implement via Framer Motion using presets in `src/animations/variants.ts`, matching ~300-800ms durations.

---

## Icons

- **Library:** Font Awesome 6.0 beta3 (CDN)
- **Usage:** Nav toggle, feature grids, service selling points, footer contact, city cards, slider arrows
- **Colors:** Orange for decorative feature icons; navy for feature-box defaults; white on navy header

**Recommendation:** Migrate to a tree-shaken icon set (e.g. Lucide or FA subset) in v2 to reduce CDN weight.

---

## Recommendations summary

1. **Unify contact page** onto main design system (remove red Tailwind theme).
2. **Keep orange secondary**, it defines the brand’s warmth; do not replace with cold cyan.
3. **Fix content/IA issues** before build: missing `#contact`, broken `game-library.html`, hidden home gallery (`#gallery { display: none }`).
4. **Standardize imagery**, WebP, consistent paths, dedicated icebreaker asset.
5. **Accessibility**, ensure orange/navy contrast on buttons; add focus rings in v2 (legacy lacks visible focus styles).
6. **Single token file**, `design-tokens.ts` is source of truth; extend `tokens.css` `@theme` when implementing UI.
