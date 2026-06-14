# Analytics Audit

**Date:** 2026-05-23  
**Project:** The Game Hour v2 (`TheGameHour-v2/`)  
**Search scope:** `src/`, `public/`, `index.html`, build output, project docs (excluding `node_modules/`)

---

## Executive summary

| Platform | Found in codebase | Active | SPA page views |
|----------|-----------------|--------|----------------|
| Google Analytics (GA4) | **No** | **No** | N/A |
| Google Tag Manager (GTM) | **No** | **No** | N/A |
| Microsoft Clarity | **Yes** (added this audit) | Production only | Yes — History API + explicit page labels |

**No Google Analytics or GTM implementation exists** in the v2 React app. Tracking IDs, `dataLayer`, `gtag`, and measurement IDs were not found in source, HTML shell, or public assets.

**Microsoft Clarity** is now integrated globally via `Analytics` in `MainLayout` (project ID: `x6t7glrd45`).

---

## Search methodology

Patterns searched project-wide:

| Pattern | Matches in `src/` |
|---------|------------------|
| `gtag` | None |
| `google-analytics` | None |
| `googletagmanager` | None |
| `GTM-` | None |
| `GA4` | None |
| `measurement_id` / `G-` (GA4 IDs) | None |
| `google tag` | None |
| `dataLayer` | None |
| `UA-` (Universal Analytics) | None |

Also checked:

- `index.html` — fonts only, no analytics scripts
- `public/` — `.htaccess`, favicon, icons only
- `src/utils/constants.ts` — no analytics config
- Legacy docs (`content-map.md`, `SETUP_HEALTH_REPORT.md`) — no GA snippets referenced for v2

---

## Google Analytics

### Existing implementation

**None.**

There is no:

- `gtag.js` script tag
- GA4 config (`G-XXXXXXXX`)
- Universal Analytics (`UA-XXXXXXXX`)
- `react-ga4` or `@analytics/google-analytics` dependency
- Environment variables for measurement IDs

### Tracking IDs found

| ID type | Value | Location |
|---------|-------|----------|
| GA4 Measurement ID | — | Not found |
| Universal Analytics | — | Not found |
| Google Ads conversion | — | Not found |

### Active status

**Inactive** — nothing to load or execute.

---

## Google Tag Manager

### Existing implementation

**None.**

There is no:

- GTM container snippet in `index.html`
- `GTM-XXXX` container ID in code or env files
- `dataLayer` initialization
- GTM noscript iframe

### GTM containers found

| Container ID | Location |
|--------------|----------|
| — | Not found |

### Active status

**Inactive.**

---

## React Router page view tracking (Google)

**Not applicable** — no GA/GTM is installed.

If GA4 is added later, note:

- React Router v6 (`createBrowserRouter`) uses the History API (`pushState` / `replaceState`).
- GA4 does **not** auto-track SPA navigations with the base gtag snippet alone.
- Required pattern: listen to `useLocation()` and call `gtag('event', 'page_view', { page_path: pathname })` or use GTM History Change trigger.

Current app has `ScrollToTop` on pathname change but **no analytics hook**.

---

## Microsoft Clarity (current implementation)

| Field | Value |
|-------|-------|
| **Project ID** | `x6t7glrd45` |
| **Loader** | `src/lib/analytics/clarity.ts` |
| **Mount point** | `Analytics` component in `MainLayout` |
| **Production only** | `import.meta.env.PROD` guard |
| **Single init** | Module flag + `useRef` + script selector check |
| **SPA tracking** | Clarity History API auto-detect + `clarity('set', 'page', path)` on route change |

See [CLARITY_SETUP.md](CLARITY_SETUP.md) for implementation details.

---

## Recommendations

### If adding Google Analytics later

**Option A — GA4 direct (simplest)**

1. Add measurement ID to `src/data/content/analytics.json` or env (`VITE_GA_MEASUREMENT_ID`).
2. Create `src/lib/analytics/google.ts` with prod-only gtag load.
3. Extend `Analytics.tsx` to fire `page_view` on `pathname` change.

**Option B — GTM (flexible)**

1. Add `GTM-XXXXXXX` to `index.html` or dynamic inject (prod only).
2. Configure GA4 tag inside GTM container.
3. Enable GTM **History Change** trigger for SPA page views.

### Priority order

| Priority | Action |
|----------|--------|
| Done | Microsoft Clarity for heatmaps/recordings |
| Optional | GA4 when marketing needs funnel/conversion data |
| Optional | GTM if multiple tags (Ads, Meta pixel) needed without code deploys |

---

## Files reference

| File | Role |
|------|------|
| `src/components/Analytics/Analytics.tsx` | Analytics mount + route tracking |
| `src/lib/analytics/clarity.ts` | Clarity init + page helper |
| `src/layouts/MainLayout.tsx` | Global Analytics render |
| `src/components/ScrollToTop/ScrollToTop.tsx` | Scroll only (not analytics) |
| `index.html` | No third-party analytics |

---

## Related documents

- [CLARITY_SETUP.md](CLARITY_SETUP.md) — Clarity integration guide
- [SEO_AUDIT.md](../seo/SEO_AUDIT.md) — organic search metadata (separate from analytics)
