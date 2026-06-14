# Microsoft Clarity Setup

**Date:** 2026-05-23  
**Project ID:** `x6t7glrd45`  
**Status:** Integrated — production builds only

---

## Overview

Microsoft Clarity is loaded globally for session recordings, heatmaps, and scroll maps. It initializes once per page load, runs only in production Vite builds, and tracks React Router navigations as separate page views.

---

## Files modified

| File | Change |
|------|--------|
| `src/lib/analytics/clarity.ts` | **Created** — init, prod guard, page tracking helper |
| `src/lib/analytics/index.ts` | **Created** — barrel exports |
| `src/lib/analytics/analytics.d.ts` | **Created** — `window.clarity` TypeScript types |
| `src/components/Analytics/Analytics.tsx` | **Created** — mount init + route effect |
| `src/components/Analytics/index.ts` | **Created** — export |
| `src/layouts/MainLayout.tsx` | **Modified** — render `<Analytics />` once inside router layout |

**Documentation:**

| File | Purpose |
|------|---------|
| [ANALYTICS_AUDIT.md](ANALYTICS_AUDIT.md) | Full analytics search audit (GA/GTM/Clarity) |
| [CLARITY_SETUP.md](CLARITY_SETUP.md) | This file |

---

## Implementation approach

### 1. Production-only loading

```ts
export function isClarityEnabled(): boolean {
  return import.meta.env.PROD
}
```

- **Development** (`npm run dev`): Clarity does not load. No dev traffic in Clarity dashboard.
- **Production** (`npm run build`): Clarity loads on deployed site.

### 2. Single initialization

Three guards prevent duplicate scripts:

1. **Module flag** — `let initialized = false` in `clarity.ts`
2. **Component ref** — `useRef` in `Analytics.tsx` ensures mount effect runs once
3. **DOM check** — skips inject if `script[src*="clarity.ms/tag/"]` already exists

Standard Microsoft snippet loads asynchronously from:

```
https://www.clarity.ms/tag/x6t7glrd45
```

### 3. SPA route tracking

`Analytics` uses `useLocation()` from React Router:

```tsx
useEffect(() => {
  const path = `${pathname}${search}`
  trackClarityPageView(path)
}, [pathname, search])
```

`trackClarityPageView` calls:

```ts
window.clarity('set', 'page', path)
```

**Why both?**

- Clarity **automatically** detects History API changes (React Router uses `pushState`).
- Explicit `set page` labels improve readability in the Clarity dashboard (`/services/birthday-games` vs generic URLs).

Mounted in `MainLayout` (inside `RouterProvider`) so `useLocation()` is valid on all routes.

### 4. Architecture diagram

```
main.tsx
  └── App
        └── RouterProvider
              └── MainLayout
                    ├── Analytics      ← init once + track routes
                    ├── ScrollToTop    ← scroll only
                    ├── Navbar
                    ├── Outlet (pages)
                    └── Footer
```

---

## Configuration

| Setting | Value | Where to change |
|---------|-------|-----------------|
| Project ID | `x6t7glrd45` | `src/lib/analytics/clarity.ts` → `CLARITY_PROJECT_ID` |
| Enable/disable | Production build | Vite `import.meta.env.PROD` (no env file needed) |

To use a different ID per environment later, move ID to `VITE_CLARITY_PROJECT_ID` in `.env.production`.

---

## Verification steps

### Local development (should NOT load)

1. Run `npm run dev`
2. Open DevTools → **Network** tab
3. Filter `clarity`
4. **Expected:** No requests to `clarity.ms`
5. Console: `window.clarity` → `undefined`

### Production build (should load)

1. Run `npm run build && npm run preview` (or deploy to staging)
2. Open site in browser
3. Network tab → filter `clarity`
4. **Expected:** Request to `https://www.clarity.ms/tag/x6t7glrd45`
5. Console: `typeof window.clarity` → `"function"`

### Single initialization

1. In production preview, run in console:

```js
document.querySelectorAll('script[src*="clarity.ms/tag/"]').').length
```

2. **Expected:** `1` (exactly one script tag)

### SPA route tracking

1. Open production preview
2. Navigate: Home → Services → a service detail page → Gallery
3. In Clarity dashboard (may take a few minutes): verify separate page entries for:
   - `/`
   - `/services`
   - `/services/birthday-games` (or chosen slug)
   - `/gallery`

4. Optional console check after navigation:

```js
// After clicking to /about
window.clarity && window.clarity('set', 'page', '/about')
```

### Clarity dashboard

1. Sign in at [https://clarity.microsoft.com/](https://clarity.microsoft.com/)
2. Open project `x6t7glrd45`
3. Confirm sessions appear after visiting production URL
4. Check **Recordings** and **Heatmaps** populate within ~2 hours of traffic

---

## Troubleshooting

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| No data in Clarity | Testing on `npm run dev` | Use production build or preview |
| Duplicate sessions | Script injected twice | Check only one `<Analytics />` in tree |
| Routes not split | Low traffic / delay | Wait for dashboard; verify `set page` in Network |
| Ad blocker hides Clarity | Browser extension | Test in incognito without blockers |

---

## Privacy & compliance

- Clarity records user interactions (clicks, scrolls, session replay).
- Add disclosure to Privacy Policy before launch if not already present.
- Clarity supports [masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api#masking) via `clarity('set', 'mask', ...)` if needed for forms or PII fields.

---

## Future extensions

When adding Google Analytics, extend `Analytics.tsx` rather than creating a second mount:

```tsx
// Future pattern
useEffect(() => {
  initClarity()
  initGoogleAnalytics()
}, [])

useEffect(() => {
  trackClarityPageView(path)
  trackGaPageView(path)
}, [pathname, search])
```

See [ANALYTICS_AUDIT.md](ANALYTICS_AUDIT.md) for GA/GTM recommendations.
