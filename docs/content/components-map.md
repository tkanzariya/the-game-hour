# The Game Hour: Component Inventory

> Reusable UI patterns identified in legacy (`style.css` + HTML).  
> v2 mapping to proposed `src/` structure, **not implemented yet**.

---

## Layout

| Legacy pattern     | Description                                               | v2 location                      |
| ------------------ | --------------------------------------------------------- | -------------------------------- |
| `main-header`      | Fixed navy bar, logo image, horizontal nav, mobile toggle | `layouts/` + `components/Navbar` |
| `main-footer`      | 4-column grid + bottom bar + year script                  | `components/Footer`              |
| `container`        | Max 1200px centered wrapper                               | `components/Container`           |
| `section-padding`  | 80px vertical section rhythm                              | utility / `Section` wrapper      |
| `bg-primary-light` | Alternating light grey sections                           | `Section` variant                |

---

## Navigation

| Component      | Elements                                                       | Notes                                         |
| -------------- | -------------------------------------------------------------- | --------------------------------------------- |
| **Navbar**     | Logo, links (Home, About, Services, Games, Gallery), hamburger | Loaded via `fetch` into `#header-placeholder` |
| **Nav link**   | Text + orange underline `::after` on hover/active              |                                               |
| **Mobile nav** | `.main-nav.active` slide/toggle, icon bars ↔ times             | `script.js` attaches after header load        |

**v2 gaps:** No Contact in header; Services/Games are hash links on home.

---

## Hero variants

| Variant                 | Used on              | Structure                                                            |
| ----------------------- | -------------------- | -------------------------------------------------------------------- |
| **Hero alt (split)**    | Home, About, Gallery | Text left + image right, dark overlay bg optional                    |
| **Service hero slider** | 8 service pages      | Full-bleed rotating images, overlay, H1 + subtitle, prev/next arrows |
| **Contact hero**        | Contact              | Centered text only (Tailwind)                                        |

**Subcomponents:** `HeroText`, `HeroImage`, `HeroCTAGroup`, `SliderControls`, `SliderDot` (implicit)

---

## Buttons & links

| Component     | Classes      | Variants                               |
| ------------- | ------------ | -------------------------------------- |
| **Button**    | `.btn`       | primary, secondary, tertiary, whatsapp |
| **Text link** | `.link-more` | Arrow icon, hover slide                |

---

## Cards

| Component           | Legacy class                           | Used for                                           |
| ------------------- | -------------------------------------- | -------------------------------------------------- |
| **ServiceCard**     | `.service-card`                        | Home services grid: image, H3, text, tertiary CTA |
| **GameCard**        | `.game-card`                           | Home game highlights                               |
| **TestimonialCard** | `.testimonial-card`                    | Home + service pages: quote + cite                |
| **FeatureItem**     | `.feature-item`                        | Why choose us: icon + label only                  |
| **FeatureBox**      | `.feature-box`                         | Service selling points: icon, H4, body            |
| **CityCard**        | `.city-card`                           | Our reach: pill badge, icon, city name            |
| **GalleryItem**     | `.gallery-item` / `.gallery-item-full` | Thumbnail vs captioned full gallery                |
| **ContactInfoCard** | `.contact-info-card`                   | Contact page (Tailwind)                            |

---

## Grids & sections

| Section component     | Grid class                             | Columns                       |
| --------------------- | -------------------------------------- | ----------------------------- |
| **ServicesGrid**      | `.service-grid`                        | auto-fit minmax(280px)        |
| **GamesGrid**         | `.game-grid`                           | minmax(300px)                 |
| **TestimonialsGrid**  | `.testimonial-grid`                    | minmax(300px)                 |
| **FeaturesGrid**      | `.features-grid`                       | minmax(250px)                 |
| **OfferFeaturesGrid** | `.offer-features-grid`                 | minmax(280px), max 1000px     |
| **GalleryGrid**       | `.gallery-grid` / `.gallery-grid-full` | minmax(280px), gap 15px       |
| **CitiesGrid**        | `.cities-grid`                         | City badges                   |
| **DetailsImageGrid**  | `.details-image-grid`                  | 4-col → 2 → 1 responsive      |
| **StoryGrid**         | `.story-grid`                          | About timeline (3 items)      |
| **ValuesGrid**        | `.values-grid`                         | 6 value cards                 |
| **MVFlex**            | `.mv-flex`                             | Mission + vision side by side |

---

## Content blocks

| Component         | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| **SectionHeader** | H2 + optional `section-description`                      |
| **AboutSplit**    | Text + image two-column (home about teaser)              |
| **DetailsIntro**  | Service page intro H2 + paragraphs                       |
| **DetailsCTA**    | Closing headline + primary button                        |
| **DetailsVideo**  | YouTube iframe container + caption                       |
| **FooterCTA**     | Embedded in footer column: headline, text, dual buttons |

---

## Forms

| Component       | Page       | Fields                                             |
| --------------- | ---------- | -------------------------------------------------- |
| **ContactForm** | contact-us | name, email, service select, date, message, submit |
| **FormMessage** | contact-us | Success banner (client-only)                       |

**v2:** Wire to real backend or form service; unify styling with design tokens.

---

## Media

| Component             | Notes                                  |
| --------------------- | -------------------------------------- |
| **ImageCard**         | Rounded, shadow, optional fixed aspect |
| **VideoEmbed**        | 16:9 iframe wrapper `.video-container` |
| **ServiceHeroSlider** | JS-driven rotation in `script.js`      |

---

## Feedback & motion

| Component          | Behavior                                       |
| ------------------ | ---------------------------------------------- |
| **RevealOnScroll** | Adds `.active` via IntersectionObserver        |
| **FadeInUp**       | Hero stagger animation                         |
| **Icon**           | Font Awesome wrapper: size variants `icon-lg` |

---

## Proposed v2 component tree

```
src/components/
├── layout/
│   ├── Container.tsx
│   ├── Section.tsx
│   └── SectionHeader.tsx
├── navigation/
│   ├── Navbar.tsx
│   ├── NavLink.tsx
│   └── Footer.tsx
├── ui/
│   ├── Button.tsx
│   ├── Icon.tsx
│   └── TextLink.tsx
├── cards/
│   ├── ServiceCard.tsx
│   ├── GameCard.tsx
│   ├── TestimonialCard.tsx
│   ├── FeatureBox.tsx
│   ├── FeatureItem.tsx
│   ├── CityCard.tsx
│   └── GalleryCard.tsx
├── media/
│   ├── HeroSlider.tsx
│   └── VideoEmbed.tsx
└── forms/
    └── ContactForm.tsx

src/sections/          # Page-specific compositions
├── home/
├── about/
├── gallery/
└── services/
```

---

## Pages → sections matrix

| Page       | Sections to compose                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Home       | Hero, AboutShort, ServicesGrid, GameHighlights, Testimonials, GalleryTeaser, WhyChooseUs, OurReach |
| About      | Hero, StoryTimeline, MissionVision, ValuesGrid                                                     |
| Gallery    | Hero, GalleryGridFull                                                                              |
| Contact    | Hero, ContactFormSplit, MapPlaceholder                                                             |
| Service ×8 | ServiceHeroSlider, DetailsIntro, OfferFeatures, ImageGrid, Video, Testimonial, CTA                 |

---

## Third-party dependencies (legacy)

- Google Fonts (Poppins)
- Font Awesome 6 CDN
- Tailwind CDN (contact only)
- Bubble booking (external)
- YouTube embed (placeholder)
