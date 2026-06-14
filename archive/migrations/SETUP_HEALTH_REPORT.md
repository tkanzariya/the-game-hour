# Setup Health Report: TheGameHour-v2

**Generated:** 2026-05-23  
**Environment:** Windows · Node (project local) · Vite 8.0.14  
**Scope:** Foundation verification before page implementation (read-only audit; no code changes)

---

## Executive summary

| Result | Count |
| --- | --- |
| **PASS** | 10 / 10 checklist items |
| **WARNING** | 8 non-blocking gaps |
| **FAIL** | 0 |

The project is **healthy and ready for page implementation** with the warnings below addressed incrementally.

---

## Checklist results

### 1. React Router is functioning: **PASS**

| Check | Result |
| --- | --- |
| `RouterProvider` in `App.tsx` | OK |
| `createBrowserRouter` in `src/router.tsx` | OK |
| Child routes under `MainLayout` | 12 child routes + index + `*` catch-all |
| Path constants in `utils/routes.ts` | Aligned with router |

**Routes registered:**

| Path | Page | HTTP (dev)* |
| --- | --- | --- |
| `/` | HomePage | 200 |
| `/about` | AboutPage | 200 |
| `/services` | ServicesPage | 200 |
| `/gallery` | GalleryPage | 200 |
| `/contact` | ContactPage | 200 |
| `/game-library` | GameLibraryPage | 200 |
| `/corporate-events` | CorporateEventsPage | 200 |
| `/birthday-events` | BirthdayEventsPage | 200 |
| `/school-events` | SchoolEventsPage | 200 |
| `/traditional-games` | TraditionalGamesPage | 200 |
| `/wedding-events` | WeddingEventsPage | 200 |
| `/design-preview` | DesignPreviewPage | 200 |
| `/nonexistent-page` | NotFoundPage (client) | 200† |

\*Vite SPA dev server returns `index.html` (200) for all paths; 404 UI is rendered client-side by React Router `path: '*'`.  
†Expected SPA behaviour, not a failure.

---

### 2. App runs successfully (`npm run dev`): **PASS**

| Check | Result |
| --- | --- |
| Dev server start | OK |
| URL | http://localhost:5173/ |
| Ready time | ~1.4s |

Dev server was running during audit (PID active, no crash).

---

### 3. All placeholder routes load without errors: **PASS**

| Check | Result |
| --- | --- |
| All listed routes return shell HTML | OK |
| Pages use `PlaceholderPage` + `<Seo>` | OK |
| Client-side 404 via `NotFoundPage` | OK |
| No missing page module imports | OK |

**Note:** Pages render placeholder `<h1>` titles inside styled Navbar/Footer shell, by design.

---

### 4. Tailwind is properly configured: **PASS**

| Check | Result |
| --- | --- |
| `tailwindcss` ^4.3.0 in dependencies | OK |
| `@tailwindcss/vite` plugin in `vite.config.ts` | OK |
| `@import 'tailwindcss'` in `globals.css` | OK |
| `@theme` tokens in `tokens.css` | OK |
| Built CSS includes utilities (`bg-primary`, etc.) | OK (~31.9 kB CSS in `dist/`) |
| Custom utility `.container-app` | OK |

---

### 5. Framer Motion installed correctly: **PASS**

| Check | Result |
| --- | --- |
| Package `framer-motion` ^12.40.0 | Installed |
| Types import in `animations/variants.ts` | OK |
| Runtime import in `components/motion/Reveal.tsx` | OK |
| Used on `/design-preview` (stagger cards) | OK |
| Build bundles motion without error | OK |

---

### 6. `react-helmet-async` configured: **PASS**

| Check | Result |
| --- | --- |
| Package `react-helmet-async` ^3.0.0 | Installed |
| `HelmetProvider` wraps app in `main.tsx` | OK |
| `Seo` component uses `<Helmet>` | OK |
| `buildSeo()` helper in `utils/seo.ts` | OK |
| Placeholder + 404 + design-preview set meta | OK |

---

### 7. No TypeScript errors: **PASS**

| Command | Exit code |
| --- | --- |
| `tsc -b` (via `npm run build`) | 0 |
| `npx tsc -b` (explicit) | 0 |

Strict options enabled: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.

---

### 8. No ESLint errors: **PASS**

| Command | Exit code |
| --- | --- |
| `npm run lint` | 0 |
| `npm run format:check` | 0 |

---

### 9. `MainLayout` wraps routes correctly: **PASS**

```
Router
└── MainLayout (path: /)
    ├── Navbar (fixed)
    ├── <Outlet /> + pt-[4.5rem]  ← page content
    ├── Footer
    └── FloatingActions (feature-flagged)
```

| Check | Result |
| --- | --- |
| All page routes are `children` of `MainLayout` | OK |
| `Outlet` renders active page | OK |
| Shared chrome on every route | OK |

---

### 10. Project builds successfully (`npm run build`): **PASS**

| Output | Value |
| --- | --- |
| Exit code | 0 |
| `dist/index.html` | 0.79 kB |
| CSS bundle | 31.86 kB (gzip 6.20 kB) |
| JS bundle | 446.35 kB (gzip 142.41 kB) |
| `.htaccess` copied to `dist/` | OK (SPA fallback) |

---

## Warnings (non-blocking)

### WARNING-01: Service routes incomplete vs `services.json`

`services.json` defines **8 services**, but only **5** have dedicated placeholder routes:

| Service (`services.json`) | Route in app |
| --- | --- |
| birthday | `/birthday-events` ✓ |
| corporate | `/corporate-events` ✓ |
| social-gathering | **Missing** |
| game-festival | **Missing** |
| school-college | `/school-events` ✓ |
| wedding-haldi | `/wedding-events` ✓ |
| traditional | `/traditional-games` ✓ |
| bollywood | **Missing** |

**Recommendation:** Add `/social-gathering`, `/game-festival`, `/bollywood` (or map all services from JSON in Phase 2).

---

### WARNING-02: Asset folders empty

`src/assets/images/`, `icons/`, `videos/` have no production files (per `assets-report.md`, legacy `/images/` not in repo).

**Recommendation:** Copy images from production server before building real pages; ServiceCard/Gallery will show placeholders until then.

---

### WARNING-03: SEO default OG image missing

`utils/seo.ts` references `https://thegamehour.com/og-default.jpg`, file not in `public/`.

**Recommendation:** Add `public/og-default.jpg` (1200×630) before launch.

---

### WARNING-04: Legacy floating components unused

`FloatingCTA/` and `WhatsAppButton/` still exist but `MainLayout` uses `FloatingActions/` only.

**Recommendation:** Remove dead components or re-export from `FloatingActions` to avoid confusion.

---

### WARNING-05: Floating CTAs disabled

`FEATURE_FLAGS.floatingCta: false`, WhatsApp/Call buttons hidden on live routes (visible on `/design-preview` only).

**Recommendation:** Enable after stakeholder approval before launch.

---

### WARNING-06: `services.json` not wired to UI

Data file exists (659 lines) but no page imports it yet.

**Recommendation:** Create `hooks/useServices.ts` or load in `ServicesPage` during migration.

---

### WARNING-07: Bundle size (Framer Motion)

JS bundle ~446 kB, Framer Motion included; only actively used on `/design-preview` today.

**Recommendation:** Acceptable for now; consider lazy-loading motion on content pages if size becomes a concern.

---

### WARNING-08: No automated route/E2E tests

Health checks were manual (build, lint, HTTP smoke). No Vitest/Playwright setup.

**Recommendation:** Add minimal route smoke test before large page rollout.

---

## Dependency matrix

| Package | Version | Status |
| --- | --- | --- |
| react | ^19.2.6 | PASS |
| react-dom | ^19.2.6 | PASS |
| react-router-dom | ^7.15.1 | PASS |
| framer-motion | ^12.40.0 | PASS |
| react-helmet-async | ^3.0.0 | PASS |
| tailwindcss | ^4.3.0 | PASS |
| @tailwindcss/vite | ^4.3.0 | PASS |
| vite | ^8.0.12 | PASS |
| typescript | ~6.0.2 | PASS |
| eslint | ^10.3.0 | PASS |

---

## Recommended fixes before page implementation

### Priority 1 (before building real pages)

1. **Import brand assets**, logo to `src/assets/icons/`, hero/gallery images per `assets-report.md`.
2. **Add missing service routes**, align router with all 8 entries in `services.json`.
3. **Wire `services.json`** into Services hub and service detail templates.
4. **Add `public/og-default.jpg`** for social sharing.

### Priority 2 (during page build)

5. **Remove or consolidate** `FloatingCTA` / `WhatsAppButton` dead code.
6. **Enable floating CTAs** when approved (`FEATURE_FLAGS.floatingCta = true`).
7. **Add route-level code splitting** (`React.lazy`) for large pages if bundle grows.

### Priority 3 (before production deploy)

8. **Verify Apache `.htaccess`** on cPanel after uploading `dist/`.
9. **Add Vitest or Playwright** smoke tests for critical routes.
10. **Replace placeholder copy** from `content-map.md`, do not ship `<h1>` placeholders.

---

## Verification commands (reproduce)

```bash
cd TheGameHour-v2
npm run dev          # http://localhost:5173
npm run build        # must exit 0
npm run lint         # must exit 0
npx tsc -b           # must exit 0
npm run format:check # must exit 0
```

---

## Conclusion

**Overall status: PASS, foundation is stable.**

No **FAIL** items. Address **WARNING-01** (missing service routes) and **WARNING-02** (assets) first when starting homepage and service page implementation.
