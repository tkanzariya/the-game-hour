# The Game Hour: Design System v2

> Implementation reference for the v2 rebuild. Tokens: `src/styles/design-tokens.ts` + `src/styles/tokens.css`.

---

## Brand positioning

**Modern experiential-events brand**, not generic SaaS, not carnival-yellow childish.

| Pillar                 | Expression                                                         |
| ---------------------- | ------------------------------------------------------------------ |
| Energetic              | Orange accents, lift hovers, stagger reveals                       |
| Nostalgic              | Soft `#F5F8FC` surfaces, warm copy tone, classic games positioning |
| Premium                | Deep navy `#032A5D`, restrained shadows, confident typography      |
| Playful                | Pill buttons, rounded cards, gradient hero glow                    |
| Trustworthy            | Readable body type, structured footer, corporate-friendly navy     |
| Exciting (kids/events) | Secondary orange highlights, high-contrast CTAs                    |

**Avoid:** bright yellow-heavy palettes, neon gradients, overly rounded “bubble” UI.

---

## Color palettes

### Primary (navy)

| Token       | Hex       | Use                                      |
| ----------- | --------- | ---------------------------------------- |
| primary     | `#032A5D` | Brand, header, headings, primary buttons |
| primary-700 | `#04397D` | Hover depth                              |
| primary-600 | `#0A4D9A` | Gradients, links                         |
| primary-500 | `#1E67B8` | Illustration placeholders                |
| dark        | `#021D40` | Footer, hero overlay                     |

### Neutral

| Token             | Hex       | Use                |
| ----------------- | --------- | ------------------ |
| light             | `#F5F8FC` | Page background    |
| surface-muted     | `#EEF2F7` | Alternate sections |
| surface-elevated  | `#FFFFFF` | Cards              |
| text              | `#444444` | Body               |
| dark-grey         | `#333333` | Strong body        |
| accent-muted-grey | `#6B7280` | Captions, meta     |

### Accent (warm orange: legacy secondary)

| Token           | Hex       | Use                                       |
| --------------- | --------- | ----------------------------------------- |
| secondary       | `#FF9933` | Underlines, nav active, badges, hero glow |
| secondary-light | `#FFB366` | Soft highlights                           |
| secondary-dark  | `#E67E00` | Pressed states                            |

### Semantic

| Token    | Hex       | Use                |
| -------- | --------- | ------------------ |
| whatsapp | `#25D366` | WhatsApp CTA only  |
| success  | `#22C55E` | Form success       |
| warning  | `#F59E0B` | Alerts (sparingly) |

---

## Typography

### Fonts (Google Fonts)

| Role         | Family                                                                   | Weights            | Rationale                                                                                                        |
| ------------ | ------------------------------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Headings** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | 600, 700, 800      | Geometric but friendly: memorable for event brands without feeling childish. Strong enough for corporate trust. |
| **Body**     | [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3)         | 400, 500, 600, 700 | Excellent readability at small sizes; neutral and professional for service descriptions and forms.               |

**Why not Poppins only?** Legacy used Poppins; v2 keeps orange/navy equity but upgrades hierarchy, display headings feel more “experiential,” body feels more editorial/trustworthy.

### Scale

| Token        | Size          | Use             |
| ------------ | ------------- | --------------- |
| text-xs      | 0.875rem      | Captions        |
| text-sm      | 0.95rem       | Card body       |
| text-base    | 1rem          | Body default    |
| text-lg-xl   | 1.125-1.25rem | Lead paragraphs |
| text-2xl-3xl | 1.35-1.5rem   | Card titles     |
| text-4xl-5xl | 1.875-2.5rem  | Section H2      |
| text-6xl-7xl | 3.25-3.75rem  | Page H1         |

**Heading treatment:** `.heading-accent`, 4px orange bar under section titles (legacy equity).

---

## Spacing

| Token      | Value                         | Use                              |
| ---------- | ----------------------------- | -------------------------------- |
| section    | 5rem (80px)                   | Default section vertical padding |
| section-sm | 3.5rem                        | Compact sections                 |
| header     | 4.5rem (72px)                 | Fixed navbar height              |
| container  | 75rem max, 1.25rem inline pad | Content width                    |

---

## Border radius

| Token   | Value  | Use             |
| ------- | ------ | --------------- |
| DEFAULT | 8px    | Cards, images   |
| md      | 12px   | CTA blocks      |
| lg      | 16px   | Large panels    |
| full    | 9999px | Buttons, badges |

---

## Shadows

| Token              | Use                   |
| ------------------ | --------------------- |
| shadow-header      | Sticky nav (scrolled) |
| shadow-card        | Resting cards         |
| shadow-card-hover  | Hover lift            |
| shadow-image       | Hero / primary CTA    |
| shadow-glow-orange | Optional accent glow  |

---

## Motion language

| Pattern         | Spec                                       | Component                |
| --------------- | ------------------------------------------ | ------------------------ |
| **Transition**  | 300ms `cubic-bezier(0.25, 0.1, 0.25, 1)`   | `.transition-brand`      |
| **Hover lift**  | `translateY(-8px)` + deeper shadow         | ServiceCard              |
| **Hover scale** | Image `scale(1.05)`                        | GalleryCard, ServiceCard |
| **Reveal**      | slideUp 24px + fade, once in viewport      | `Reveal`                 |
| **Stagger**     | 100ms children, 50ms delay                 | `Reveal` + `RevealItem`  |
| **Nav**         | bg opacity + backdrop blur → solid primary | Navbar scroll            |

Framer presets: `src/animations/variants.ts`

---

## Components (implemented)

| Component       | Variants / notes                                  |
| --------------- | ------------------------------------------------- |
| Button          | primary, secondary, tertiary, whatsapp · sm/md/lg |
| Badge           | primary, secondary, outline, muted                |
| Section         | default, muted, dark, warm                        |
| Container       | max-width wrapper                                 |
| PageHero        | navy + orange radial glow                         |
| ServiceCard     | linked card, placeholder image block              |
| GalleryCard     | aspect 4/3, caption                               |
| CTA             | primary (navy) / light                            |
| Navbar          | sticky, transparent blur → solid                  |
| Footer          | 4-column, social placeholders                     |
| FloatingActions | WhatsApp + Call (feature-flagged)                 |

Preview all at **`/design-preview`**.
