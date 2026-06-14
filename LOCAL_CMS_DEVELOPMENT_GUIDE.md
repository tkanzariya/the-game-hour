# Local CMS Development Guide

Run and test the Image CMS on your machine **without deploying**.

## Recommended approach

**PHP built-in server + JSON dev store (no MySQL)**

This is the simplest reliable setup:

- Same PHP admin UI and API as production
- Image metadata stored in `cms/dev-data/images.json`
- Uploads saved to `cms/uploads/`
- No database installation required

Production continues to use MySQL + `cms/config.php` unchanged.

## Prerequisites

- **PHP 8.1+** with extensions: `pdo` (unused in JSON mode), `fileinfo`, `gd` or `exif` optional
- **Node.js 20+** (for syncing CMS assets into `dist/`)

## One-time setup

```powershell
cd TheGameHour-v2

# 1. Local CMS config (JSON mode, dev credentials)
copy cms\config.dev.sample.php cms\config.local.php

# 2. Build frontend OR create dist shell (CMS dev works without full Vite build)
npm run cms:sync

# Optional: full site build for testing CMS overrides on React pages
npm run build
```

### Default dev login

| Field | Value |
|-------|-------|
| URL | http://localhost:8765/admin/login.php |
| Username | `devadmin` |
| Password | `dev123` |

## Start local CMS

```powershell
npm run cms:dev
```

This runs:

1. `node scripts/copy-cms-to-dist.mjs` — syncs `cms/` → `dist/cms/`, static preview images, and `config.local.php`
2. `php -S localhost:8765 -t dist scripts/dev-router.php` — routes `/admin`, `/cms`, `/uploads`

## URLs

| URL | Purpose |
|-----|---------|
| http://localhost:8765/admin/login.php | CMS admin |
| http://localhost:8765/admin/dashboard.php | Category dashboard |
| http://localhost:8765/cms/api/images.php | JSON manifest (same as production API) |
| http://localhost:8765/ | React site (requires `npm run build` first) |

## How to test

### 1. Image mapping

```powershell
node scripts/verify-cms-mapping.mjs
node scripts/audit-image-mappings.mjs
```

Review `IMAGE_MAPPING_AUDIT.md` for the full CMS key → frontend matrix.

### 2. Upload flow

1. Sign in at `/admin/login.php`
2. Open **Homepage** → **Homepage Hero Banner** → Upload
3. Upload a test JPG
4. Confirm green success toast
5. Open http://localhost:8765/cms/api/images.php — should include `"homepage-hero"` with `/uploads/homepage-hero.jpg` URL

### 3. Website override (requires built React app)

1. Run `npm run build` once
2. Start `npm run cms:dev`
3. Open http://localhost:8765/
4. Homepage hero should show your uploaded image after manifest loads

### 4. API manifest

```powershell
curl http://localhost:8765/cms/api/images.php
```

## Is MySQL required?

| Environment | Storage |
|-------------|---------|
| **Local dev (this guide)** | No — JSON file via `config.local.php` |
| **Production (cPanel)** | Yes — MySQL table `images` via `cms/config.php` |

To use MySQL locally instead, copy `cms/config.sample.php` → `cms/config.php`, create the database from `cms/sql/schema.sql`, and **do not** create `config.local.php`.

## File layout

```
cms/
  config.local.php      ← local only (gitignored)
  config.dev.sample.php ← template
  dev-data/images.json  ← JSON store (gitignored)
  uploads/              ← uploaded files (gitignored)
scripts/
  dev-router.php        ← PHP built-in server router
  copy-cms-to-dist.mjs  ← sync CMS into dist/
  verify-cms-mapping.mjs
  audit-image-mappings.mjs
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `CMS not configured` | Copy `config.dev.sample.php` → `config.local.php` |
| Admin has no styles | Use `/admin/login.php` (not bare `/admin`) |
| Upload succeeds but 404 on image | Check `cms/uploads/` exists; restart `npm run cms:dev` |
| React site shows bundled image only | Run `npm run build`; hard-refresh; check `/cms/api/images.php` |
| `pdo` / MySQL errors locally | Ensure `config.local.php` exists (JSON mode bypasses MySQL) |

## Commands reference

```powershell
npm run cms:sync    # Sync CMS + static images to dist/
npm run cms:dev     # Start PHP server on :8765
npm run cms:audit   # Regenerate IMAGE_MAPPING_AUDIT.md
node scripts/verify-cms-mapping.mjs   # Quick mapping smoke test
```
