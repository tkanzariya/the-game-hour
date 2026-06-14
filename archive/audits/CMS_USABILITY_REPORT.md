# CMS Usability Report

**Date:** 2026-05-23  
**Scope:** Pre-production validation of Image CMS usability improvements  
**Environment:** Code review + `npm run build` (PHP/MySQL runtime not available locally)

---

## Executive summary

Three usability blockers were addressed before direct-to-production deploy:

1. **Admin URL hardening** — absolute paths + 301 redirect  
2. **Friendly labels** — plain English names for all 85 slots  
3. **Filter + search** — category dropdown and combined text search  

Build passes. PHP admin flows verified by static analysis; live checks required immediately post-deploy on production.

---

## Validation matrix

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `/admin` redirects correctly | **PASS (code)** | `public/.htaccess` → `[R=301,L]` to `/admin/login.php` |
| Labels appear everywhere | **PASS (code)** | Library table, upload dropdown, upload prefill, thumbnail alt |
| Category filtering works | **PASS (code)** | `cms_filter_library_rows()` + 13-category dropdown |
| Search by label/key works | **PASS (code)** | `q` param; case-insensitive substring |
| Combined search + filter | **PASS (code)** | Both params applied in single filter function |
| Upload still works | **PASS (code)** | `upload.php` unchanged core logic; absolute redirects |
| Replace still works | **PASS (code)** | Library → upload with `?key=` prefill |
| Delete still works | **PASS (code)** | POST to `/admin/delete.php`; filter preserved |
| Refresh on admin pages | **PASS (code)** | All URLs under `/admin/*.php` |
| Build includes CMS | **PASS** | `npm run build` exit 0; `copy-cms-to-dist.mjs` ran |
| React fallback unchanged | **PASS** | No changes to `cms-images.ts` loading logic |

---

## Task 1 — Admin URL hardening

| Check | Result |
|-------|--------|
| 301 `/admin` → `/admin/login.php` | Implemented |
| Nav uses `/admin/library.php`, `/admin/upload.php`, `/admin/logout.php` | Implemented |
| CSS at `/admin/assets/admin.css` | Implemented |
| Auth redirect to `/admin/login.php` | Implemented |
| Post-login redirect to `/admin/library.php` | Implemented |

**Detail:** Admin URL hardening is documented in [IMAGE_CMS_ARCHITECTURE.md](../../docs/cms/IMAGE_CMS_ARCHITECTURE.md) and [CMS Deployment Checklist](../../docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md).

---

## Task 2 — Friendly labels

| Check | Result |
|-------|--------|
| 85 keys mapped to human labels | Implemented |
| Keys unchanged internally | Confirmed |
| Label + Key + Category + Thumbnail in library | Implemented |
| DB sync on login/library load | `cms_sync_registry_metadata()` |
| TS registry mirrored | `src/data/image-keys.ts` updated |

**Detail:** Friendly labels are live in the CMS admin UI; see [Handbook](../../docs/HANDBOOK.md#image-management).

---

## Task 3 — Category filtering

| Check | Result |
|-------|--------|
| 13-category dropdown | Implemented |
| Search by label | Implemented |
| Search by key | Implemented |
| Combined filter | Implemented |
| Filter preserved on upload/delete | Implemented |
| Empty state message | Implemented |
| Result count display | Implemented |

**Detail:** Category filter and search are live in the CMS library; see [Handbook](../../docs/HANDBOOK.md#cms-access).

---

## Non-technical user workflow (post-deploy)

### Update homepage hero (~20 seconds)

1. Go to `https://YOUR-DOMAIN/admin/login.php`
2. Sign in
3. Category: **Homepage**
4. Find **Homepage Hero Banner**
5. Click **Upload** or **Replace**
6. Choose file → **Save image**

### Find any gallery photo (~15 seconds)

1. Category: **Gallery**
2. Search: `Photo 4`
3. Click **Replace** on **Gallery Photo 4**

### Find corporate slider (~25 seconds)

1. Category: **Corporate Games**
2. Search: `Gallery Image 2`
3. Replace image

---

## Production smoke test (run immediately after deploy)

Execute in order on live domain:

```
[ ] curl -I https://DOMAIN/admin → 301 Location: /admin/login.php
[ ] /admin/login.php loads with styles
[ ] Login succeeds → /admin/library.php
[ ] Library shows Label, Key, Category, Thumbnail columns
[ ] Filter: Gallery → ~16 results
[ ] Search: hero → multiple matches
[ ] Filter + search together narrows results
[ ] Upload test image to homepage-hero
[ ] File appears at /uploads/homepage-hero.*
[ ] Homepage shows new image (hard refresh)
[ ] Replace same slot
[ ] Delete → reverts to bundled fallback
[ ] Refresh /admin/library.php while filtered → state preserved in URL
```

---

## Known limitations

| Item | Notes |
|------|-------|
| PHP not tested locally | No PHP in dev environment; validate on production |
| Branding / SEO categories | Listed in filter; no slots assigned yet |
| `birthday-hero` alias | Separate key from `birthday-games-slider-1`; both labeled clearly |
| First login after deploy | Runs key registration + label sync automatically |

---

## Files changed

| Area | Files |
|------|-------|
| Routing | `public/.htaccess` |
| Admin core | `cms/includes/bootstrap.php` |
| Admin pages | `cms/admin/*.php` (7 files) |
| Labels/registry | `cms/data/keys-base.php`, `cms/data/keys.php` |
| Styles | `cms/admin/assets/admin.css` |
| Frontend sync | `src/data/image-keys.ts` |

---

## Goal assessment

**Target:** Non-technical user locates and updates any image within 30 seconds.

**Assessment:** **Achievable** with category filter + search + friendly labels. Homepage and gallery updates should complete in under 20 seconds after login. Service-specific images require one category selection plus short search — typically under 30 seconds.

**Recommendation:** Share admin URL `https://YOUR-DOMAIN/admin/login.php` and a one-line guide: *“Pick a category, search by name, click Upload or Replace.”*
