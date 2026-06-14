# The Game Hour v2: Project Structure

Scalable application foundation for the static React rebuild. Content and visual design are **not** migrated yet, see planning docs (`design-system.md`, `content-map.md`, `services.json`).

---

## Stack

| Layer   | Choice                | Why                                           |
| ------- | --------------------- | --------------------------------------------- |
| Build   | Vite 8                | Fast dev, static `dist/` for Apache/cPanel    |
| UI      | React 19 + TypeScript | Typed components, ecosystem                   |
| Styling | Tailwind CSS v4       | `@theme` maps to `design-tokens.ts`           |
| Routing | React Router 7        | Client-side routes + `.htaccess` SPA fallback |
| Motion  | Framer Motion         | Presets in `animations/`                      |
| SEO     | react-helmet-async    | Per-route title, description, OG tags         |
| Deploy  | `base: './'`          | Relative assets on shared hosting             |

---

## Directory map

```
TheGameHour-v2/
├── PROJECT_STRUCTURE.md      ← This file
├── design-system.md          ← Brand audit (planning)
├── content-map.md            ← Copy inventory (planning)
├── components-map.md         ← UI patterns (planning)
├── assets-report.md          ← Image audit (planning)
│
├── public/                   ← Static files copied to dist root
│   └── .htaccess             ← SPA rewrite for Apache
│
└── src/
    ├── main.tsx              ← HelmetProvider + mount
    ├── App.tsx               ← RouterProvider
    ├── router.tsx            ← Route table → pages
    │
    ├── styles/
    │   ├── design-tokens.ts  ← TS source of truth (colors, spacing, …)
    │   ├── tokens.css        ← Tailwind @theme + CSS variables
    │   └── globals.css       ← Base layer + .container-app utility
    │
    ├── utils/
    │   ├── constants.ts      ← SITE, CONTACT, BOOKING, feature flags
    │   ├── routes.ts         ← ROUTES + NAV_LINKS (single path source)
    │   └── seo.ts            ← buildSeo(), default meta
    │
    ├── layouts/
    │   └── MainLayout.tsx    ← Navbar + Outlet + Footer + future CTAs
    │
    ├── pages/                ← One file per route (placeholder titles only)
    │   ├── PlaceholderPage.tsx
    │   ├── HomePage.tsx
    │   ├── AboutPage.tsx
    │   └── …
    │
    ├── components/           ← Empty shells (UI phase adds styling)
    │   ├── Navbar/
    │   ├── Footer/
    │   ├── Button/
    │   ├── Section/
    │   ├── PageHero/
    │   ├── ServiceCard/
    │   ├── CTA/
    │   ├── GalleryCard/
    │   ├── Seo/
    │   ├── FloatingCTA/      ← Gated by FEATURE_FLAGS
    │   └── WhatsAppButton/   ← Gated by FEATURE_FLAGS
    │
    ├── sections/             ← Page-specific compositions (future)
    ├── hooks/                ← Custom hooks (future)
    ├── data/
    │   └── services.json     ← Service content (not wired to UI yet)
    │
    ├── animations/
    │   ├── variants.ts       ← fadeIn, slideUp, stagger, staggerItem
    │   └── config.ts         ← motionTransition, viewportOnce
    │
    └── assets/
        ├── images/           ← Migrated photos (from legacy /images/)
        ├── icons/            ← Logo, favicons, UI icons
        └── videos/           ← Embeds / local promo clips
```

---

## Routing

All paths are defined in `src/utils/routes.ts` as `ROUTES` and reused by `router.tsx` and `Navbar`.

| Path                 | Page component         | Status            |
| -------------------- | ---------------------- | ----------------- |
| `/`                  | `HomePage`             | Placeholder       |
| `/about`             | `AboutPage`            | Placeholder       |
| `/services`          | `ServicesPage`         | Placeholder       |
| `/gallery`           | `GalleryPage`          | Placeholder       |
| `/contact`           | `ContactPage`          | Placeholder       |
| `/game-library`      | `GameLibraryPage`      | Placeholder       |
| `/corporate-events`  | `CorporateEventsPage`  | Placeholder       |
| `/birthday-events`   | `BirthdayEventsPage`   | Placeholder       |
| `/school-events`     | `SchoolEventsPage`     | Placeholder       |
| `/traditional-games` | `TraditionalGamesPage` | Placeholder       |
| `/wedding-events`    | `WeddingEventsPage`    | Placeholder       |
| `*`                  | `NotFoundPage`         | 404 inside layout |

Service slugs use marketing-friendly paths (`corporate-events`) rather than legacy filenames (`corporate-games.html`). Map to `services.json` `slug` during content migration.

---

## Theme system

1. **`design-tokens.ts`**, programmatic tokens (TypeScript consumers, documentation).
2. **`tokens.css`**, `@theme` block for Tailwind utilities (`bg-primary`, `text-secondary`, `shadow-card`, etc.).
3. **`globals.css`**, base typography, `.container-app` (max 1200px / 75rem).

Brand intent: **premium** navy depth, **playful** orange accents, **nostalgic** soft `#F5F8FC` backgrounds.

---

## SEO

- `HelmetProvider` wraps the app in `main.tsx`.
- Each page uses `<Seo {...buildSeo({ title })} />` from `components/Seo`.
- `buildSeo()` appends `| The Game Hour` to titles and sets OG + Twitter tags.
- Replace `og-default.jpg` when brand OG image exists.

---

## Layout shell

`MainLayout` renders:

1. `Navbar`, placeholder links from `NAV_LINKS`
2. `<Outlet />`, active page
3. `Footer`, placeholder
4. `FloatingCTA` / `WhatsAppButton`, return `null` until `FEATURE_FLAGS` enabled

---

## Animation presets

| Export         | Use                               |
| -------------- | --------------------------------- |
| `fadeIn`       | Simple opacity reveal             |
| `slideUp`      | Section enter (legacy fade-in-up) |
| `stagger`      | Parent container                  |
| `staggerItem`  | Grid children                     |
| `viewportOnce` | Intersection-style once trigger   |

Wrap with `motion.*` in the UI phase; do not animate placeholder pages yet.

---

## Data flow (future)

```
services.json → pages/ServicesPage + sections
content-map.md → section copy
assets/images/ → GalleryCard, PageHero, ServiceCard
design-system.md → Tailwind classes on components
```

---

## Commands

```bash
npm run dev      # http://localhost:5173
npm run build    # dist/ for deployment
npm run lint
npm run format
```

---

## Next phases (not in scope)

1. Copy production images into `src/assets/images/`
2. Style global components per `design-system.md`
3. Compose `sections/` from `content-map.md` + `services.json`
4. Enable `FEATURE_FLAGS.floatingCta` / `whatsappButton`
5. Wire contact form backend
