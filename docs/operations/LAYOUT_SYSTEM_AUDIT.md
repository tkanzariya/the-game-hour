# Layout System Audit

**Date:** 2026-05-23  
**Scope:** Site-wide layout width consistency — no content changes

---

## Executive summary

Homepage sections used **two different effective widths**: most sections at ~1064px content (1200px container + default float inset), while “Experiences for every celebration” used ~1304px (1440px wide + open float). That ~240px gap caused visible misalignment between Trusted Stats, Why Us, and the showcase grid.

A **`marketing` layout profile** now unifies production pages: wide container, open float panel, shared intro measure, and aligned chrome (navbar/footer).

---

## Task 1 — Homepage section audit (before)

| Section | Container | Float density | Effective content width @ 1280px* |
|---------|-----------|---------------|-------------------------------------|
| HomeHero | `container-app` (1200) | — (flat) | ~1152px |
| Trusted Stats | default | default | ~1064px |
| **Experiences** | **wide (1440)** | **open** | **~1240px** |
| Why Us | default | default | ~1064px |
| Gallery Moments | default | default | ~1064px |
| Testimonials | default | default | ~1064px |
| How It Works | default | default | ~1064px |
| Final CTA | default | default | ~1064px |

\*Approximate: container max − horizontal padding − float panel inset.

### Nested constraints found

- `Section` → `Container` → `section-float` (double horizontal inset)
- `SectionIntro` used `max-w-2xl` (672px) except Experiences (`max-w-3xl` override)
- Navbar hardcoded `max-w-[75rem]` — misaligned with wide sections
- Footer used default 1200px container

---

## Task 2 — Layout grid system

**Previously:** Ad-hoc `width="wide"` and `floatDensity="open"` on individual sections. No shared profile.

**Now:**

| Layer | Token / class | Value |
|-------|---------------|-------|
| Page shell | `--width-container-wide` | 90rem (1440px) |
| Ultra-wide cap | `--width-container-ultra` | 96rem (1536px) |
| Legacy / dev | `--width-container` | 75rem (1200px) |
| Container (marketing) | `.container-app-wide` | Responsive padding |
| Float panel (marketing) | `.section-float-open` | Reduced inset |
| Intro copy | `--width-prose` / `.prose-intro` | 48rem (768px) |
| Chrome alignment | `.layout-shell-max` | Matches wide container |

**Profile API** (`src/constants/layout.ts`):

```ts
LAYOUT_PROFILE.marketing → { width: 'wide', floatDensity: 'open' }
LAYOUT_PROFILE.default   → { width: 'default', floatDensity: 'default' }
```

`<Section profile="marketing" />` resolves width + float density automatically.

---

## Task 3 — Homepage width strategy

| Role | Desktop (1280+) | Tablet (768–1279) | Mobile (<768) |
|------|-------------------|-------------------|-----------------|
| **Page max** | 1440px → 1536px @ 2xl | 100% | 100% |
| **Content / grid max** | Same as page (inside open float) | Same | Same |
| **Section float inset** | `section-float-open` (2–2.25rem sides) | 1.5–2rem | 1rem |
| **Container padding** | 2rem (wide) / 2.5rem (ultra) | 1.5rem | 1.25rem |
| **Intro prose** | 48rem centered | 48rem | 100% − pad |
| **Grid gutters** | Per-section (unchanged) | — | — |

**Rule:** All homepage `<Section>` components use `profile="marketing"`. Heroes use `Container width="wide"`.

**Intentional exceptions:** None on homepage. Tone (`muted` / `default`) and padding (`sm`) vary; width does not.

---

## Task 4 — Homepage normalization

All eight homepage sections + hero now use the marketing profile:

- `HomeHero` — `Container width="wide"`
- `HomeTrustedStats` — `profile="marketing"`
- `HomeEventCategories` — `profile="marketing"` (removed ad-hoc wide/open/className)
- `HomeWhyUs` — `profile="marketing"`
- `HomeGalleryMoments` — `profile="marketing"`
- `HomeTestimonials` — `profile="marketing"`
- `HomeHowItWorks` — `profile="marketing"`
- `HomeFinalCta` — `profile="marketing"`

`SectionIntro` default center measure: **`prose-intro`** (48rem) for all sections.

---

## Task 5 — Other pages

| Page | Status | Notes |
|------|--------|-------|
| **Services** | ✅ Normalized | All sections → `profile="marketing"`; hero already `containerWidth="wide"` |
| **Service detail** | ✅ Normalized | All 7 sections + hero container → marketing / wide |
| **About** | ✅ Placeholder | `container-app-wide` via PlaceholderPage |
| **Gallery** | ✅ Placeholder | Same |
| **Contact** | ✅ Placeholder | Same |
| **Design preview** | Unchanged | `profile="default"` (1200px) — dev-only |

**Chrome:** Navbar `.layout-shell-max` + Footer `width="wide"` align with marketing content.

---

## Problems found

1. **Split homepage widths** — one showcase section wider than neighbors  
2. **No layout profile** — wide/open copied manually, easy to drift  
3. **Inconsistent intro measure** — max-w-2xl vs max-w-3xl overrides  
4. **Navbar/footer at 1200px** — chrome narrower than wide content  
5. **Double inset** — default float padding + default container on most sections  

---

## New layout rules

1. **Production pages** → `<Section profile="marketing">`  
2. **Heroes** → `<Container width="wide">` or `<PageHero containerWidth="wide">`  
3. **Section headings** → `SectionIntro` (uses `prose-intro`, 48rem)  
4. **Do not mix** `width="wide"` on one section and default on adjacent sections on the same page  
5. **Dev/preview pages** → omit profile or use `profile="default"`  
6. **Explicit overrides** — `width` / `floatDensity` props still override profile when needed  

---

## Sections / files modified

| File | Change |
|------|--------|
| `src/constants/layout.ts` | **New** — layout profiles |
| `src/styles/layout.css` | **New** — shell + prose utilities |
| `src/styles/tokens.css` | `--width-prose` |
| `src/styles/globals.css` | Import layout.css |
| `src/components/Section/Section.tsx` | `profile` prop |
| `src/sections/home/SectionIntro.tsx` | Unified `prose-intro` |
| `src/sections/home/*` | All sections `profile="marketing"` |
| `src/sections/services/*` | `profile="marketing"` |
| `src/sections/service/*` | `profile="marketing"` |
| `src/components/Navbar/Navbar.tsx` | `layout-shell-max` |
| `src/components/Footer/Footer.tsx` | `width="wide"` |
| `src/pages/PlaceholderPage.tsx` | `container-app-wide` |
| `src/styles/design-tokens.ts` | Prose + container mirror |

---

## Effective width after (marketing profile @ 1280px)

| Layer | Width |
|-------|------:|
| Container max | 1440px |
| − container padding | ~32px × 2 |
| − float open inset | ~32px × 2 |
| **≈ Grid content** | **~1312px** |

All homepage sections now share this column.

---

## Test plan

1. Scroll homepage — float panels should align flush left/right across sections.  
2. Compare Trusted Stats vs Experiences — same outer panel width.  
3. Navbar bar width matches section panels at 1440px viewport.  
4. Footer columns align with homepage content.  
5. `/services` and `/services/birthday-games` — consistent with homepage.  
6. `/about` placeholder — wide container, not 1200px.  
7. `/design-preview` — remains 1200px (default profile).
