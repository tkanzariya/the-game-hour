# Image Optimization Report: The Game Hour v2

> Generated: 2026-05-23  
> Source: `TheGameHour-legacy/images/` (98 files, ~383 MB)  
> Pipeline: `npm run assets:migrate` → `scripts/migrate-assets.mjs` (Sharp)  
> Stats: `scripts/migration-stats.json`

## Executive summary

| Metric | Value |
|--------|-------|
| Legacy files on disk | 98 |
| Legacy total size | **383.3 MB** |
| Assets migrated & optimized | **89** (+ 3 icons copied) |
| Migrated source total | **343.6 MB** |
| Optimized WebP total | **16.9 MB** |
| **Size reduction** | **~95%** |
| Output files in `src/assets/images/` | **182** (WebP + JPG/PNG fallbacks) |
| Files over 500 KB target | **1** (`gallery/gallery-hero.webp` @ 610 KB) |
| Files under 300 KB (ideal) | **~72** |

---

## Optimization settings

| Type | Max width | WebP quality | Formats emitted |
|------|-----------|--------------|-----------------|
| Hero / large photo | 1600px | 78-82 | WebP + JPEG fallback |
| Service slider | 1400px | 82 | WebP + JPEG |
| Service gallery | 1200px | 82 | WebP + JPEG |
| Title cards (PNG/JPG) | 800px | 85 | WebP + PNG |
| Logo | 512px | 90 | WebP + PNG |
| OG / social | 1200×630 | 85 | WebP + JPEG → `public/` |

Targets: **&lt;300 KB ideal**, **&lt;500 KB maximum** (WebP primary).

---

## Largest wins (original → WebP)

| Asset | Original | WebP | Savings |
|-------|----------|------|---------|
| `homepage/hero` | 8,671 KB | 364 KB | 96% |
| `services/wedding-or-haldi-games/gallery-4` | 11,641 KB | 193 KB | 98% |
| `services/wedding-or-haldi-games/gallery-1` | 11,221 KB | 337 KB | 97% |
| `services/traditional-games/gallery-1` | 17,100 KB | 234 KB | 99% |
| `services/traditional-games/gallery-2` | 13,864 KB | 128 KB | 99% |
| `services/game-festival/slider-3` | 10,769 KB | 438 KB | 96% |
| `services/corporate-games/gallery-2` | 5,864 KB | 469 KB | 92% |
| `services/wedding-or-haldi-games/title-card` | 11,221 KB | 216 KB | 98% |

---

## Homepage assets

| File | Original | WebP | Status |
|------|----------|------|--------|
| `homepage/hero` | 8,671 KB | 364 KB | ✅ |
| `homepage/about-teaser` | 2,025 KB | 355 KB | ✅ |
| `homepage/team-building` | 1,372 KB | 225 KB | ✅ |
| `homepage/strategy-games` | 3,959 KB | 444 KB | ✅ |

---

## Branding & icons

| File | Original | WebP | PNG | Notes |
|------|----------|------|-----|-------|
| `branding/logo-light` | 129 KB | 27 KB | 99 KB | From `tgh-logo.png` |
| `branding/logo-dark` |: | 27 KB | 99 KB | Alias for dark nav (same as light until white logo supplied) |
| `branding/logo.svg` | 9 KB |: |, | From Vite favicon |
| `icons/favicon-*` |: |, |, | Copied to `icons/` + `public/` |

---

## Service assets (per slug)

Each service has: `title-card`, `slider-1..3`, `gallery-1..4` (WebP + fallbacks).

| Slug | Title card WebP | Largest slider WebP | Notes |
|------|-----------------|---------------------|-------|
| `birthday-games` | 46 KB | 282 KB | ✅ |
| `corporate-games` | 55 KB | 281 KB | gallery-2 @ 469 KB |
| `social-gathering-games` | 75 KB | 258 KB | ✅ |
| `game-festival` | 105 KB | 438 KB | ✅ |
| `school-and-collage-event` | 69 KB | 410 KB | ✅ |
| `wedding-or-haldi-games` | 216 KB | 464 KB | Heavy source files compressed well |
| `traditional-games` | 87 KB | 491 KB | slider-2 near limit |
| `bollywood-games` | 36 KB | 95 KB | ✅ |

---

## Gallery placeholders (legacy files missing)

These were **not on disk** in legacy; v2 uses curated service photos:

| v2 path | Source used | WebP |
|---------|-------------|------|
| `gallery/event-gallery-1..9` | Mixed service gallery photos | 62-469 KB |
| `gallery/moments/moment-1..6` | Mixed service photos | 34-337 KB |
| `gallery/gallery-hero` | Corporate gallery-2 | **610 KB** ⚠️ |

Replace with original production `event-gallery-*.jpg` and `Moments of Pure Joy` PNGs when available.

---

## SEO assets (generated)

| File | Size | Location |
|------|------|----------|
| `seo/og-default.webp` | 108 KB | `src/assets/images/seo/` |
| `seo/og-default.jpg` | 130 KB | + copied to `public/og-default.jpg` |
| `seo/social-preview.webp` | ~108 KB | Social sharing |
| `public/og-default.webp` | 108 KB | Static URL for meta tags |

---

## Legacy: REMOVE (not migrated)

| File / pattern | Reason |
|----------------|--------|
| `About Us2.jpg` | Unused duplicate |
| `about-title.jpg` | Duplicate of About Us1 |
| `Birthday Games title.jpg`, `Game Festival title.jpg` | Superseded by Service Titles |
| `index-title.png` | Not referenced in active HTML |
| `birtday_photo_5..10` | Beyond services.json gallery set |
| `corporate-activities-title-7..10`, `photo-6` | Not in corporate-games.html |
| `NOT USED 3.jpg` | Explicitly marked unused |
| `dadasd.jpg`, `IMG_20250629_*.jpg` | Junk / camera roll |
| Extra social/festival photos (5-9) | Not wired in HTML |
| `wedding-games-title.jpg` on home icebreakers | Wrong asset (not migrated for icebreakers) |

---

## Legacy: MISSING (referenced in HTML, not in repo)

| Legacy path | v2 handling |
|-------------|-------------|
| `images/event-gallery-1..9.jpg` | Placeholders from service photos |
| `images/gallery-hero-image.jpg` | `gallery/gallery-hero.webp` from corporate photo |
| `images/Moments of Pure Joy - 6/*.png` | `gallery/moments/moment-*.webp` placeholders |

---

## Re-run migration

```bash
npm run assets:migrate
```

Requires `TheGameHour-legacy/images/` and devDependency `sharp`.

---

## Follow-up

1. Export missing gallery originals from production and re-run migration for true gallery set.
2. Recompress `gallery/gallery-hero.webp` to &lt;500 KB (or swap source).
3. Provide white `logo-dark` variant for dark `#032A5D` navbar if needed.
4. Replace generated OG with designed 1200×630 branded creative.
