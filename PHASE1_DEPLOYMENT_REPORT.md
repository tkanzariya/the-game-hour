# Phase 1 Deployment Report — CMS Content Manager

**Date:** 2026-06-15  
**Site:** https://thegamehour.com  
**Repository:** `tkanzariya/the-game-hour` (branch `main`)

---

## Executive summary

| Item | Status |
|------|--------|
| Code committed & pushed | ✅ Complete |
| GitHub Actions FTP deploy | ✅ Complete (hotfix run passed) |
| Website (homepage) | ✅ HTTP 200 |
| Admin login | ✅ HTTP 200 — Website Manager UI live |
| Image CMS API | ✅ HTTP 200 — existing photos API restored |
| Content API (`/cms/api/content.php`) | ⚠️ HTTP 503 — **DB migration required** |
| Testimonials / statistics (CMS runtime) | ⚠️ Using bundled JSON fallback until content API is live |

**Action required:** Run `cms/sql/migrate-content-phase1.sql` in phpMyAdmin, then log in to admin once to seed testimonials.

---

## Commits deployed

| Commit | Message |
|--------|---------|
| `7503fdc` | Implement CMS Content Manager Phase 1 |
| `fd2e9df` | Fix CMS bootstrap: lazy-load content store to restore image API |

---

## Production deployment steps (executed)

### 1. Pre-deploy

- [x] Phase 1 approved
- [x] Local build verified (`npm run build`)
- [x] Deliverables doc: `CMS_CONTENT_MANAGER_PHASE1.md`

### 2. Git

```bash
git add <Phase 1 files>
git commit -m "Implement CMS Content Manager Phase 1"
git push origin main
# Hotfix follow-up:
git commit -m "Fix CMS bootstrap: lazy-load content store to restore image API"
git push origin main
```

### 3. GitHub Actions (Deploy FTP)

| Run | Commit | Result | Notes |
|-----|--------|--------|-------|
| [#27509582266](https://github.com/tkanzariya/the-game-hour/actions/runs/27509582266) | `7503fdc` | ❌ Failed health check | FTP upload succeeded; homepage check returned HTTP 415 (host/WAF quirk). CMS returned HTTP 500 — content module was eagerly loaded in `bootstrap.php`. |
| [#27509803480](https://github.com/tkanzariya/the-game-hour/actions/runs/27509803480) | `fd2e9df` | ✅ Success | Lazy-load fix + seed JSON in `cms/data/`. All steps green including homepage check. |

**Deploy flow:** `push main` → `npm ci && npm run build` → FTPS mirror `dist/` → `public_html/`  
**Protected on server:** `cms/config.php`, `uploads/**`, `cms/uploads/**`

### 4. Database migration

**Automatic (on first content API / admin login):**  
`cms/includes/content-migrate.php` runs `cms/sql/migrate-content-phase1.sql` when `testimonials` and `site_metrics` tables are missing.

**Current production status:** Auto-migration did **not** succeed (content API returns 503). Likely cause: MySQL user in `cms/config.php` lacks `CREATE TABLE` privilege (common on shared hosting).

**Manual step (required):**

1. cPanel → **phpMyAdmin**
2. Select the CMS database (same as in `cms/config.php` → `db.name`)
3. **Import** or paste SQL from:
   ```
   public_html/cms/sql/migrate-content-phase1.sql
   ```
4. Confirm tables exist: `testimonials`, `site_metrics`
5. Confirm seed rows in `site_metrics` (4 keys)

### 5. Seed testimonials (after migration)

1. Visit https://thegamehour.com/admin/login.php
2. Sign in with production admin credentials
3. On first login, `cms_content_seed_if_empty()` imports from `cms/data/testimonials.json`
4. Verify: https://thegamehour.com/cms/api/content.php returns JSON with `version: 1`

---

## Post-deploy verification

| Check | URL | Expected | Actual (2026-06-15) |
|-------|-----|----------|------------------------|
| Website loads | https://thegamehour.com/ | 200 | ✅ 200 |
| Admin loads | https://thegamehour.com/admin/login.php | 200, “Website Manager” | ✅ 200 |
| Image CMS API | https://thegamehour.com/cms/api/images.php | 200 + JSON | ✅ 200 (`count: 2`) |
| Content API | https://thegamehour.com/cms/api/content.php | 200 + testimonials + metrics | ⚠️ 503 `{"error":"CMS content unavailable"}` |
| Testimonials on site | Homepage `#testimonials` | Name, role, review, stars | ⚠️ Bundled JSON fallback (API offline) |
| Statistics on site | Homepage `#trusted` | 50+, 3,000+, 100+, 6 | ⚠️ Bundled JSON fallback (API offline) |
| Photos admin | `/admin/photos/index.php` | Category hub unchanged | ✅ Deployed (login required) |

### API smoke commands

```bash
curl -sS https://thegamehour.com/cms/api/images.php | head -c 200
curl -sS https://thegamehour.com/cms/api/content.php | head -c 500
```

After migration + admin login, content API should return:

```json
{
  "version": 1,
  "testimonials": [ ... ],
  "metrics": {
    "events-hosted": { "value": "50+", "label": "Events Hosted" },
    ...
  }
}
```

---

## Incident: CMS HTTP 500 after first deploy

**Symptom:** All CMS endpoints (`/cms/api/images.php`, `/admin/login.php`) returned HTTP 500.

**Cause:** Phase 1 added eager `require` of `content-store.php` in `bootstrap.php`, loaded on every CMS request including the image API.

**Fix (`fd2e9df`):**

- Lazy-load via `cms_load_content_store()` only from content admin + `/cms/api/content.php`
- Copy seed JSON to `cms/data/testimonials.json` and `cms/data/stats.json` for production seeding
- PHP 7-compatible SQL splitter in `content-migrate.php`

---

## Post-deploy actions required

### Immediate (owner / cPanel)

1. **Run SQL migration** in phpMyAdmin (`migrate-content-phase1.sql`)
2. **Log in to admin** once to seed testimonials
3. **Verify content API** returns 200
4. **Hard-refresh homepage** (Ctrl+F5) — testimonials/stats should load from CMS without rebuild

### Recommended follow-ups

| Priority | Task |
|----------|------|
| High | Complete phpMyAdmin migration (blocks CMS testimonials/stats) |
| Medium | Block public HTTP access to `cms/data/*.json` via `.htaccess` (seed files currently return 200) |
| Medium | Extend GitHub Actions health check to include `/cms/api/content.php` |
| Low | Fix workflow homepage check HTTP 415 (add `Accept: text/html` or `-H "User-Agent: ..."`) |
| Low | Commit `CMS_CONTENT_MANAGER_PLAN.md` and audit docs if desired (left untracked) |

### Optional verification after migration

- [ ] Edit one statistic in admin → refresh homepage → value updates
- [ ] Edit one testimonial → refresh homepage → quote updates
- [ ] Upload/replace a photo → confirm image API still serves it
- [ ] Service page testimonials filter by service slug

---

## Files deployed (Phase 1)

| Area | Key paths |
|------|-----------|
| Migration SQL | `cms/sql/migrate-content-phase1.sql` |
| Auto-migrate | `cms/includes/content-migrate.php` |
| Content store | `cms/includes/content-store.php`, `dev-content-store.php` |
| Public API | `cms/api/content.php` |
| Admin | `cms/admin/dashboard.php`, `testimonials/*`, `statistics.php`, `photos/index.php` |
| Seed data | `cms/data/testimonials.json`, `cms/data/stats.json` |
| Frontend | `src/lib/cms-content.ts`, `src/components/CmsContent/*`, updated testimonials/stats loaders |

---

## Rollback plan

If issues persist after migration:

1. **Frontend:** Automatically falls back to bundled JSON when content API fails (no rollback needed for public site)
2. **Code rollback:** Revert to commit `c875c1b` and push (triggers redeploy)
3. **Database rollback (optional):** `DROP TABLE IF EXISTS testimonials, site_metrics;` — only if you need to undo Phase 1 tables (data loss)

---

## Deployment status

**Overall: Partially complete**

- ✅ Application code live on production
- ✅ Image CMS operational
- ✅ Admin UI live (Website Manager)
- ⚠️ Content API pending MySQL migration (manual phpMyAdmin step)
- ⚠️ CMS-driven testimonials/statistics pending until content API returns 200

Once phpMyAdmin migration is done and admin login seeds data, Phase 1 is fully operational with no further deploy required.
