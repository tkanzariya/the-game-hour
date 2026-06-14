# Asset Structure Report: The Game Hour v2

> Generated: 2026-05-23  
> Registry: `src/data/asset-map.ts`  
> Resolver: `src/lib/assets.ts`

## Directory layout

```
src/assets/images/
├── branding/           # Logo variants (SVG, WebP, PNG)
├── homepage/           # Hero, about, game-type teasers
├── services/           # Per-slug title, slider, gallery
│   ├── birthday-games/
│   ├── corporate-games/
│   ├── social-gathering-games/
│   ├── game-festival/
│   ├── school-and-collage-event/
│   ├── wedding-or-haldi-games/
│   ├── traditional-games/
│   └── bollywood-games/
├── gallery/            # Gallery page + home moments
│   └── moments/
├── seo/                # OG + social preview
└── icons/              # Favicon set

public/
├── og-default.jpg      # Meta fallback (copied from seo/)
├── og-default.webp
├── favicon-16x16.png
├── favicon-32x32.png
└── favicon.ico
```

**182 files** total under `src/assets/images/` (WebP primary + JPG/PNG fallbacks).

---

## Naming convention

| Pattern | Example |
|---------|---------|
| kebab-case | `hero.webp`, `about-teaser.webp` |
| Service folder = slug | `services/birthday-games/` |
| Role suffix | `title-card`, `slider-1`, `gallery-4` |
| Format | `.webp` primary, `.jpg` / `.png` fallback |

---

## Central registry (`asset-map.ts`)

All image references flow through **`ASSET_MAP`**, do not hardcode import paths in UI.

```ts
import { ASSET_MAP, getServiceAssets } from '@/data/asset-map'
import { getAssetUrl, getLogoUrl, getOgImageUrl } from '@/lib/assets'

// Logo
getLogoUrl('light')  // branding/logo-light.webp
getLogoUrl('dark')   // branding/logo-dark.webp

// Homepage
getAssetUrl(ASSET_MAP.homepage.hero)

// Service by slug
const assets = getServiceAssets('corporate-games')
getAssetUrl(assets.slider[0])

// Gallery
getAssetUrl(ASSET_MAP.gallery.events[0])

// SEO
getOgImageUrl()  // bundled seo asset or /og-default.jpg
```

### `ASSET_MAP` sections

| Key | Contents |
|-----|----------|
| `branding` | `logoLight`, `logoDark`, `logo` (SVG) |
| `homepage` | `hero`, `aboutTeaser`, `teamBuilding`, `strategyGames` |
| `services` | 8 slugs × `{ titleCard, slider[3], gallery[4] }` |
| `gallery` | `hero`, `events[9]`, `moments[6]` |
| `seo` | `ogDefault`, `socialPreview` |
| `icons` | `favicon16`, `favicon32`, `faviconIco` |

---

## Service asset matrix

| Slug | Files |
|------|-------|
| `birthday-games` | title-card, slider-1..3, gallery-1..4 |
| `corporate-games` | same |
| `social-gathering-games` | same |
| `game-festival` | same |
| `school-and-collage-event` | same |
| `wedding-or-haldi-games` | same |
| `traditional-games` | same |
| `bollywood-games` | same |

**32 WebP files per service category** (8 × 7 images) + fallbacks.

---

## Data layer integration

| File | Role |
|------|------|
| `src/data/asset-map.ts` | Typed paths + `getServiceAssets()` |
| `src/data/gallery.json` | `v2Src` → `gallery/*.webp` |
| `src/data/asset-manifest.json` | Legacy audit trail (historical) |
| `src/lib/assets.ts` | `getAssetUrl()`, Vite glob resolver |
| `src/lib/services.ts` | `getServiceImagePath()` via asset-map |

---

## Logo handling

| Variant | Path | Use case |
|---------|------|----------|
| SVG | `branding/logo.svg` | Scalable, favicon-derived |
| Light WebP/PNG | `branding/logo-light.*` | Light backgrounds |
| Dark WebP/PNG | `branding/logo-dark.*` | Dark nav/footer (`#032A5D`): currently aliases light until white logo provided |

Favicons: `icons/` + mirrored in `public/` for static hosting.

---

## Gallery & placeholders

| Asset | Status |
|-------|--------|
| `gallery/event-gallery-1..9.webp` | **Placeholder** (legacy JPGs missing) |
| `gallery/moments/moment-1..6.webp` | **Placeholder** (legacy PNGs missing) |
| `gallery/gallery-hero.webp` | **Placeholder** from corporate photo |

Documented in `gallery.json` meta note.

---

## Scripts

| Command | Action |
|---------|--------|
| `npm run assets:migrate` | Full legacy → v2 optimize pipeline |
| `npm run build` | Bundles assets via Vite `import.meta.glob` |

---

## Build verification

```
npm run build  →  PASS (2026-05-23)
```

Assets included in production bundle via hashed URLs under `dist/assets/`.

---

## Related docs

- `IMAGE_OPTIMIZATION_REPORT.md`, sizes and savings
- Earlier migration audit removed (superseded by this report)
- `CONTENT_LAYER_HEALTH.md`, content layer status
