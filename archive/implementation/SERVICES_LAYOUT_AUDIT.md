# Services Layout Audit

**Date:** 2026-05-23  
**Scope:** `/services` layout only — no card redesign, content, or color changes

---

## Previous issues

| Issue | Root cause |
|-------|------------|
| **Cramped cards** | 75rem (1200px) container + thick `section-float` inset (~5.5rem horizontal) left ~1024px for grids |
| **Excessive side margins on large screens** | Content capped at 1200px while viewport often 1440–1920px+ |
| **Narrow images** | 6-column bento grid with every card at `col-span-3` (= 2 equal columns); `featured` only added min-height, not width |
| **Unnecessary text wrap** | Cards ~500px wide; long service names/descriptions wrapped early |
| **Compressed showcase feel** | Tight grid gaps (`gap-7` / `gap-8`) and `max-w-2xl` intros on a visual page |
| **Double boxing** | Container padding + float panel padding stacked horizontally |

---

## Container system audit

| Breakpoint | Before | After (services) | Rationale |
|------------|--------|------------------|-----------|
| **Mobile / tablet** | 100% − 1.25–1.5rem pad | Same | Full-bleed feel preserved |
| **Desktop (1024–1279px)** | max 1200px | max **1440px** (`container-app-wide`) | Uses laptop width; less dead margin |
| **Large desktop (1280–1535px)** | max 1200px | max **1440px**, 2rem side pad | Balanced gutters |
| **Ultra-wide (1536px+)** | max 1200px | max **1536px**, 2.5rem side pad | Cap without infinite stretch |

Default site pages remain at **75rem (1200px)** via `container-app`.

New tokens in `tokens.css`:

- `--width-container-wide: 90rem` (1440px)
- `--width-container-ultra: 96rem` (1536px)

---

## Changes made

### 1. Wide container (`container-app-wide`)

- `Container` accepts `width="wide"`
- `Section` passes `width` to container
- All `/services` sections + hero use wide width

### 2. Open float density (`section-float-open`)

- `Section` accepts `floatDensity="open"`
- Reduces float panel inner padding vs default (~40px more content width at lg)
- Slightly increased outer section spacing for vertical breathing room

### 3. Experiences grid (`ServicesAllExperiences`)

| Before | After |
|--------|-------|
| `lg:grid-cols-6` + `col-span-3` | `sm:grid-cols-2` (clean 2-column) |
| Featured = same width as others | Featured cards **`sm:col-span-2`** (full-width row) |
| `gap-7 lg:gap-8` | `gap-8 sm:gap-9 lg:gap-10 xl:gap-12` |

**Why:** Full-width featured rows (indices 0 and 4) make title-card images the hero of the section. Remaining six cards sit in a wider 2-column grid with larger gutters.

### 4. Supporting sections

- **Who we serve:** wider container, open float, `gap-7` → `gap-9`, 3-col until xl (5-col)
- **Gallery preview:** wider container, open float, larger gaps (`xl:gap-10`)
- **Final CTA:** wide + open float
- **Section intros:** `max-w-3xl` for less subtitle wrapping
- **Page hero:** wide container + wider subtitle measure

---

## Image priority (without changing ServiceCard)

| Lever | Effect |
|-------|--------|
| Wider container | ~+240px content at desktop |
| Open float panel | ~+40px horizontal per side |
| 2-col grid vs nested 6-col | Simpler math; cards ~650px+ vs ~500px |
| Featured full-width rows | Images span full showcase width (~1300px+ at ultra-wide) |
| Existing `aspect-[5/4]` | Unchanged — wider cards automatically yield taller images |

Card component, copy, and colors untouched.

---

## Responsive validation

| Viewport | Expected behaviour |
|----------|-------------------|
| **Mobile (<640px)** | Single column; full-width cards; standard container pad |
| **Tablet (640–1023px)** | 2-column grid; featured still span 2 = full width |
| **Laptop (1024–1279px)** | Wide container kicks in; 2-col + 2 featured full-width rows |
| **Desktop (1280–1535px)** | 1440px max; open float; largest practical card width |
| **Ultra-wide (1536px+)** | 1536px cap; proportional gutters |

---

## Why the layout feels more open

1. **More canvas** — Services content uses up to 336px more horizontal space on large displays.
2. **Less nested padding** — Open float panels stop “box inside box” compression.
3. **Image-first rhythm** — Two full-width featured cards break monotony and lead with photography.
4. **Generous gutters** — Grid gaps scale to 3rem on xl so cards don’t feel stacked.
5. **Better copy measure** — Wider intros reduce awkward subtitle line breaks.

---

## Files changed

| File | Change |
|------|--------|
| `src/styles/tokens.css` | Wide / ultra width tokens |
| `src/styles/globals.css` | `container-app-wide`, `section-float-open` |
| `src/styles/design-tokens.ts` | Layout width mirror |
| `src/components/Container/Container.tsx` | `width` prop |
| `src/components/Section/Section.tsx` | `width`, `floatDensity` props |
| `src/components/PageHero/PageHero.tsx` | `containerWidth` prop |
| `src/sections/services/*` | Wide + open layout; grid spacing |

---

## Test plan

1. Open `/services` at 1440px width — cards noticeably wider than before.
2. Confirm first and fifth experience cards span full grid width.
3. Resize to 375px — single column, no horizontal overflow.
4. Compare homepage container — should remain 1200px (unchanged).
5. Gallery preview — six images with more space between columns.
