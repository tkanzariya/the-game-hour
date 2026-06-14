# Image Interaction Guidelines

**Date:** 2026-05-23  
**Scope:** Site-wide image lightbox system for The Game Hour v2

---

## Design intent

Showcase and hero photography should feel **interactive and premium**. When an image looks clickable, clicking it opens a fullscreen lightbox viewer instead of the browser default or no action.

---

## System overview

| Piece | Location | Role |
|-------|----------|------|
| `LightboxProvider` | `MainLayout` | Global state + modal mount |
| `ImageLightbox` | Rendered by provider | Fullscreen modal UI |
| `LightboxImage` | Showcase components | Clickable trigger with visual cues |
| `toLightboxGallery()` | `lib/lightbox.ts` | Build gallery arrays for prev/next |

---

## Which images are clickable

### Enable lightbox (default)

| Context | Component / section |
|---------|---------------------|
| Page heroes | `HomeHero`, `AboutHero`, `GalleryHero`, `ServiceDetailHero` |
| Gallery grids | `GalleryCard`, `GalleryShowcaseCard`, `GalleryBrowseExperience` |
| Featured previews | `HomeGalleryMoments`, `ServicesGalleryPreview`, `GalleryFeaturedMoments` |
| About imagery | `AboutStory`, `AboutBelieveInPlay`, `AboutMomentsGallery`, `AboutWhoWeServe` (title cards) |
| Service detail | `ServiceGallery`, `ServiceActivities` |
| Service cards | `ServiceCard` image area |
| Story sections | `GalleryStories` |

### Do NOT enable lightbox

| Context | Reason |
|---------|--------|
| Logos (`Navbar`, `Footer`) | Brand marks, not content |
| Icons, favicons, decorative SVGs | Non-photographic |
| Stats backdrop (`GalleryStats`) | Decorative `aria-hidden` background |
| Small hero inset accents | Optional; use `showExpandIcon={false}` when kept as accent only |
| Placeholder / empty states | No meaningful fullscreen content |

Use `enableLightbox={false}` on `LightboxImage` for exceptions.

---

## Interaction behavior

### Open

1. User clicks or taps a `LightboxImage` trigger.
2. Fullscreen modal opens with dark primary backdrop and clay-style close button.
3. Full image loads on demand (spinner until ready).
4. Caption shown below image when provided.

### Close

- **X button** (top right)
- **Escape** key
- **Click/tap backdrop**

### Gallery navigation (when `gallery` prop is set)

- **Desktop:** Previous / next arrow buttons
- **Keyboard:** `ArrowLeft` / `ArrowRight`
- **Mobile:** Swipe left / right on image
- Counter: "2 of 12"

### Cards with links

When an image sits inside a linked card (`ServiceCard`, `AboutWhoWeServe`):

- **Image click** opens lightbox (`stopPropagation`).
- **Text / CTA click** follows the link.

---

## Visual cues (affordance)

All `LightboxImage` triggers include:

- `cursor: pointer`
- Hover / focus scale on image (`scale-[1.04]`)
- Violet **expand icon** (bottom right, fades in on hover/focus)
- `aria-label`: "View fullscreen: {alt}"

Class: `.lightbox-trigger` on the button wrapper.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ESC closes | `window` keydown listener while open |
| Focus management | Focus moves to close button on open; returns to trigger on close |
| Focus trap | Tab cycles within modal controls |
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, `aria-label` from alt text |
| Keyboard gallery | Arrow keys when multiple images |
| Live regions | Filter count on gallery page (`aria-live`) unchanged |
| Expand control | Decorative SVG `aria-hidden`; button carries label |

---

## Performance

| Technique | Detail |
|-----------|--------|
| Thumbnail first | Grid/hero uses existing optimized bundled assets |
| Deferred full load | Lightbox creates `new Image()` only when opened |
| Optional `srcFull` | Pass higher-res URL per item when available |
| Lazy loading | Triggers use `loading="lazy"` except hero `fetchPriority="high"` |
| Fixed aspects | Container aspect ratios prevent layout shift |
| Single modal instance | One portal-like fixed overlay, not per-image modals |

---

## Usage examples

### Single image

```tsx
<LightboxImage
  src={heroImage}
  alt="Guests laughing at an event"
  fetchPriority="high"
/>
```

### Gallery with navigation

```tsx
const gallery = toLightboxGallery(images)

<GalleryCard
  src={images[2].src}
  alt={images[2].alt}
  caption={images[2].caption}
  gallery={gallery}
  galleryIndex={2}
/>
```

### Programmatic open

```tsx
const { open } = useLightbox()
open({ items: [{ src, alt }], index: 0 })
```

---

## QA checklist

- [ ] Click any gallery card: lightbox opens, body scroll locked
- [ ] ESC and backdrop click close lightbox
- [ ] Focus returns to clicked image after close
- [ ] Arrow keys / swipe work in multi-image galleries
- [ ] Service card image opens lightbox; title link still navigates
- [ ] Logos do not open lightbox
- [ ] No em/en dashes in new copy

---

## Files

```
src/components/ImageLightbox/
  LightboxContext.tsx
  ImageLightbox.tsx
  LightboxImage.tsx
  types.ts
  index.ts
src/lib/lightbox.ts
src/layouts/MainLayout.tsx          (+ LightboxProvider)
IMAGE_INTERACTION_GUIDELINES.md
```
