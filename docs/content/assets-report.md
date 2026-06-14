# The Game Hour: Image & Asset Audit

> Audit date: 2026-05-23  
> Scope: Production marketing site HTML in `TheGameHour-legacy` (excludes `===wordpress`, `Old Site`, `family-feud`).

**Critical finding:** The `/images/` directory is **referenced throughout HTML/CSS but not present in the repository** (likely gitignored or deployed separately). Copy assets from production server before v2 build.

---

## Summary

| Category | Count (approx.)       | Action                             |
| -------- | --------------------- | ---------------------------------- |
| KEEP     | ~90+ production paths | Migrate to `src/assets/`           |
| OPTIMIZE | ~90+                  | WebP/AVIF, rename, compress        |
| REMOVE   | 15+                   | Dead links, duplicates, non-brand  |
| MISSING  | 10+                   | Pages, favicons, videos, fix paths |

---

## KEEP: Brand & marketing (migrate to v2)

### Branding & meta

| Asset        | Legacy path                                                | Notes              |
| ------------ | ---------------------------------------------------------- | ------------------ |
| Logo         | `/images/tgh-logo.png`                                     | Header             |
| Favicon set  | `/favicon.ico`, `/favicon-16x16.png`, `/favicon-32x32.png` | Root               |
| Apple touch  | `/apple-touch-icon.png`                                    |                    |
| PWA icons    | `/android-chrome-192x192.png`, `512x512`                   | `site.webmanifest` |
| Web manifest | `/site.webmanifest`                                        | Copy metadata      |

### Home & core pages

| Asset               | Path                                                             |
| ------------------- | ---------------------------------------------------------------- |
| Hero                | `/images/Hero Section.jpg`                                       |
| About teaser        | `/images/About Us1.jpg`                                          |
| About hero          | `images/about-title.jpg`                                         |
| Gallery hero        | `images/gallery-hero-image.jpg`                                  |
| Strategy games      | `/images/Game Types/Strategy Games.jpg`                          |
| Team building       | `/images/team-building-games.jpg`                                |
| Gallery moments 1-6 | `images/Moments of Pure Joy - 6/Moments of Pure Joy - {1-6}.png` |
| Gallery full 1-9    | `images/event-gallery-{1-9}.jpg`                                 |

### Service title cards (`/images/Service Titles/`)

- `birthday-games-title-card.png`
- `corporate-games-title-card.png`
- `social-gathering-title-card.jpg`
- `game-festival-title-card.jpg`
- `school-event-title-card.jpg`
- `traditional-games-title-card.jpg`

### Root title images (not in Service Titles folder)

- `/images/wedding-games-title.jpg` (also **misused** for Icebreakers card on home)
- `/images/bollywood-games-title.jpg`

### Per-service photo folders

| Folder                           | Slider (×3)                                   | Gallery (×4)                        |
| -------------------------------- | --------------------------------------------- | ----------------------------------- |
| `1. Birthday Photos/`            | `birtday_photo_{1-3}.jpg`                     | + `birtday_photo_4.jpg`             |
| `2. Coporate Photos/`            | `corporate-activities-title-{1-3}`            | `corporate-activities-photo-{1-4}`  |
| `3. Social Gathering Photos/`    | `social-gathering-activities-title-{1-3}.jpg` | `photo-{1-3}.jpg`, `photo-4.png`    |
| `4. Game Festival Photos/`       | `game-festival-activities-title-{1-3}.jpg`    | `photo-{1-3}.jpg`, `photo-4.png`    |
| `5. SchoolCollege Event Photos/` | `game-festival-activities-title-{1-3}.jpg`    | mixed photo/title files             |
| `6. Wedding-Haldi Event Photos/` | `wedding-games-title-{1-3}.jpg`               | `wedding-games-photo-{1-4}`         |
| `7. Traditional Game Photos/`    | `traditional-games-title-{1-3}.jpg`           | `traditional-games-photo-{1-4}.jpg` |
| `8. Bollywood Game Photos/`      | `bollywood-games-title-{1-3}.jpg`             | `bollywood-games-photo-{1-4}.jpg`   |

---

## OPTIMIZE: Technical debt on KEEP assets

| Issue               | Examples                                  | Recommendation                              |
| ------------------- | ----------------------------------------- | ------------------------------------------- |
| Spaces in filenames | `Hero Section.jpg`, `About Us1.jpg`       | Rename to kebab-case: `hero-section.jpg`    |
| Typos               | `birtday_photo`, `Coporate`               | Fix on rename                               |
| Mixed extensions    | `.JPG`, `.jpg`, `.png`                    | Standardize; convert to `.webp`             |
| PNG gallery moments | `Moments of Pure Joy - *.png`             | Convert to WebP; likely large files         |
| Oversized heroes    | Full-bleed JPG sliders                    | Compress 80-85 quality; responsive `srcset` |
| Duplicate usage     | `wedding-games-title.jpg` for icebreakers | Shoot or select correct image               |
| Inconsistent paths  | `/images/...` vs `images/...`             | Single `@/assets/images/` import path       |
| Fixed grid crops    | CSS height 180-250px                      | Provide consistent aspect ratio sources     |
| CSS-only bg         | `index-title.png` in style.css            | Confirm file exists on server; add to repo  |

**Target structure (v2):**

```
src/assets/images/
├── brand/
├── heroes/
├── services/{slug}/
├── gallery/
└── games/
```

---

## REMOVE: Do not migrate

| Asset / path                                  | Reason                             |
| --------------------------------------------- | ---------------------------------- |
| `===wordpress/**` images                      | Unrelated archived spam sites      |
| `Old Site/public/images/**`                   | Superseded site version            |
| `family-feud/**`                              | Separate mini-app (optional later) |
| Contact page Tailwind-only styling            | No unique brand images             |
| Placeholder YouTube `your-video-id`           | Non-functional embed               |
| `email.thegamehour.com/emaillogin.html`       | External redirect stub             |
| Duplicate `script.js` include on `index.html` | Not an asset: fix in content      |
| Misleading stock alt text                     | Review on migration only           |

---

## MISSING: Required before launch

| Item                          | Priority | Notes                                                 |
| ----------------------------- | -------- | ----------------------------------------------------- |
| Entire `/images/` binary tree | **P0**   | Export from live cPanel/server                        |
| `game-library.html` + imagery | P1       | Linked from home CTA                                  |
| `index.html#contact` section  | P1       | Footer links to non-existent anchor                   |
| Contact in navbar             | P2       | IA gap                                                |
| Privacy policy page           | P2       | Footer placeholder `href="#"`                         |
| Real promo videos             | P2       | 8× placeholder iframes on service pages               |
| Dedicated icebreaker image    | P2       | Replace wedding title reuse                           |
| `index-title.png`             | P2       | Referenced in CSS for home hero bg: verify on server |
| OG/Twitter social images      | P3       | Not in legacy                                         |
| Game library content          | P3       | Page never built                                      |
| Map embed                     | P3       | Contact placeholder only                              |
| Form backend                  | P3       | Client-only fake submit                               |

---

## Path inconsistencies (fix on import)

| Problem                                                 | Occurrences                                     |
| ------------------------------------------------------- | ----------------------------------------------- |
| Leading slash vs relative                               | `index.html` gallery uses `images/` without `/` |
| Folder typo `Coporate`                                  | Corporate photo path                            |
| Filename typo `birtday`                                 | Birthday photos                                 |
| School folder reuses `game-festival-activities-*` names | Confusing naming                                |
| Home `#gallery { display: none }`                       | Section exists but hidden: confirm intent      |

---

## Recommended migration workflow

1. Download `/images/` + favicons from production hosting.
2. Run batch rename (kebab-case, fix typos).
3. Generate WebP (+ optional AVIF) at 1x and 2x widths.
4. Place in `TheGameHour-v2/src/assets/images/` per structure above.
5. Update `services.json` image paths to new URLs.
6. Add `assets-manifest.json` in v2 (optional) for build-time validation.

---

## Icon & font assets (non-raster)

| Asset              | Source                 | v2 action                       |
| ------------------ | ---------------------- | ------------------------------- |
| Poppins            | Google Fonts CDN       | Self-host or `npm` font package |
| Font Awesome       | CDN                    | Tree-shaken icon components     |
| `public/icons.svg` | Vite scaffold leftover | **REMOVE** if unused in v2      |
