# Image CMS Architecture

**Project:** The Game Hour v2  
**Stack:** PHP 8+ · MySQL · cPanel · React (Vite SPA)  
**Goal:** Non-technical image updates without code, Git, FTP, or redeploys.

---

## Overview

A lightweight **PHP + MySQL image CMS** runs alongside the React site on Linux/cPanel hosting. An admin panel at **`/admin`** lets staff upload, replace, delete, and preview images. The public website loads a JSON manifest from **`/cms/api/images.php`** and overrides bundled assets at runtime via **`getImageByKey()`**.

```
┌─────────────────┐     upload/replace      ┌──────────────┐
│  Admin (/admin) │ ───────────────────────►│ MySQL images │
└────────┬────────┘                         └──────┬───────┘
         │                                           │
         ▼                                           ▼
┌─────────────────┐     GET manifest          ┌──────────────┐
│  /uploads/*     │ ◄─────────────────────────│  React SPA   │
└─────────────────┘                           └──────────────┘
```

**No Node backend. No external CMS. No Bubble.**

---

## Database Schema

**Table: `images`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT UNSIGNED PK AUTO_INCREMENT | Internal ID |
| `image_key` | VARCHAR(120) UNIQUE | Stable key used by frontend (e.g. `homepage-hero`) |
| `title` | VARCHAR(255) | Human label in admin |
| `category` | VARCHAR(120) | Grouping filter (Homepage, Gallery, Service · …) |
| `file_path` | VARCHAR(512) NULL | Relative path under `/uploads/` (e.g. `homepage-hero.webp`) |
| `updated_at` | TIMESTAMP NULL | Used for cache-busting |
| `created_at` | TIMESTAMP | Row creation |

**SQL files:**

- `cms/sql/schema.sql` — create table + starter rows
- Keys auto-synced from `cms/data/keys.php` on admin login

---

## File Structure

```
TheGameHour-v2/
├── cms/
│   ├── config.sample.php      # Copy → config.php (gitignored)
│   ├── includes/
│   │   ├── bootstrap.php      # DB, auth, upload helpers
│   │   └── .htaccess          # Deny web access
│   ├── admin/
│   │   ├── login.php            # /admin
│   │   ├── library.php          # Thumbnail grid
│   │   ├── upload.php           # Upload / replace
│   │   ├── delete.php
│   │   ├── preview.php
│   │   ├── logout.php
│   │   └── assets/admin.css
│   ├── api/
│   │   └── images.php           # Public JSON manifest
│   ├── data/
│   │   ├── keys-base.php
│   │   └── keys.php             # Full key registry (mirrors TS)
│   ├── sql/
│   │   └── schema.sql
│   ├── tools/
│   │   └── hash-password.php
│   └── uploads/                 # Dev fallback (prod uses /uploads at site root)
├── uploads/                     # Created in dist/ on build (writable on server)
├── src/
│   ├── data/image-keys.ts       # Frontend key registry + fallbacks
│   ├── lib/cms-images.ts        # getImageByKey(), manifest loader
│   ├── lib/assets.ts            # CMS-aware getAssetUrl()
│   └── components/CmsImages/    # Provider wrapper
└── public/.htaccess             # SPA + /admin + /cms routes
```

**After `npm run build`:** `dist/` contains React app + `dist/cms/` + `dist/uploads/.htaccess`.

---

## Image Keys

Keys use **kebab-case**. Examples:

| Key | Used for |
|-----|----------|
| `homepage-hero` | Home hero image |
| `gallery-hero` | Gallery page hero |
| `gallery-1` … `gallery-9` | Gallery grid photos |
| `gallery-moment-1` … `6` | Home gallery moments |
| `birthday-hero` | Alias → birthday slider 1 |
| `birthday-games-title-card` | Service card image |
| `birthday-games-slider-1` | Service hero slider |
| `corporate-games-gallery-2` | Service gallery slot |

Full registry: `src/data/image-keys.ts` (87+ slots across 8 services).

---

## Admin Panel

**URL:** `https://thegamehour.com/admin`

| Screen | Actions |
|--------|---------|
| **Login** | Username + password (session, 8 hours) |
| **Library** | Thumbnail, key, category, last updated; filter by category |
| **Upload** | Select key slot, choose file, save |
| **Replace** | Same as upload on existing key |
| **Delete** | Removes file; site falls back to bundled default |
| **Preview** | Full-size image in new tab |

No code or FTP required for day-to-day updates.

---

## Public API

**GET** `/cms/api/images.php`

Returns all uploaded images:

```json
{
  "generated_at": "2026-05-23T12:00:00+00:00",
  "count": 12,
  "images": {
    "homepage-hero": {
      "key": "homepage-hero",
      "title": "Homepage hero",
      "category": "Homepage",
      "updated_at": "2026-05-23 11:30:00",
      "url": "/uploads/homepage-hero.webp?v=1716466200"
    }
  }
}
```

**GET** `/cms/api/images.php?key=homepage-hero` — single image.

---

## Frontend Integration

### Automatic (existing components)

`getAssetUrl()` and `getImageUrl()` check the CMS manifest first via path → key mapping. **No component changes required** for most pages.

### Explicit key lookup

```typescript
import { getImageByKey } from '@/lib/assets'

const heroSrc = getImageByKey('homepage-hero')
```

### React hook

```typescript
import { useCmsImages } from '@/components/CmsImages'

const { getImageByKey, loaded, refresh } = useCmsImages()
```

`CmsImagesProvider` wraps the site in `MainLayout` and fetches the manifest on load.

### Fallback behavior

1. CMS uploaded image → `/uploads/{key}.webp?v={timestamp}`
2. CMS offline or empty slot → bundled Vite asset from `src/assets/images/`
3. Missing entirely → placeholder SVG

Local dev (`npm run dev`) works without PHP — bundled assets always display.

---

## Cache Busting

Every API URL includes `?v={unix_timestamp}` from `updated_at`. When an image is replaced:

1. MySQL `updated_at` updates to `NOW()`
2. API returns new `?v=` parameter
3. Browsers fetch the fresh file immediately

No redeploy or hard refresh required.

---

## Security

| Control | Implementation |
|---------|----------------|
| Admin auth | Session + bcrypt password (`config.php`) |
| CSRF | Token on all admin POST forms |
| File types | JPG, JPEG, PNG, WEBP only |
| MIME validation | `finfo` + `getimagesize()` |
| Size limit | 5 MB max |
| Uploads folder | `.htaccess` blocks PHP execution |
| Includes/config | `.htaccess` denies direct access |
| Key sanitization | Alphanumeric + hyphens only |

**Generate password hash:**

```bash
php cms/tools/hash-password.php "YourSecurePassword"
```

Paste hash into `cms/config.php` → `admin.password_hash`.

---

## Deployment (cPanel)

### 1. Build locally

```bash
npm run build
```

Upload **contents of `dist/`** to `public_html/`.

### 2. MySQL

1. cPanel → **MySQL Databases** → create database + user
2. phpMyAdmin → import `cms/sql/schema.sql`
3. Grant user ALL on database

### 3. Configure CMS

On server, copy `cms/config.sample.php` → `cms/config.php`:

```php
'db' => [
    'host' => 'localhost',
    'name' => 'youruser_tgh_cms',
    'user' => 'youruser_cms',
    'pass' => '…',
],
'admin' => [
    'username' => 'admin',
    'password_hash' => '…',  // from hash-password.php
],
```

### 4. Writable uploads folder

```bash
chmod 755 public_html/uploads
chmod 755 public_html/cms/uploads   # if used
```

Ensure PHP can write to `public_html/uploads/` (config `dir` = site root `/uploads`).

### 5. Verify routes

`.htaccess` in site root must include (already in repo):

```apache
RewriteRule ^cms/ - [L]
RewriteRule ^uploads/ - [L]
RewriteRule ^admin/?$ cms/admin/login.php [L]
RewriteRule ^admin/(.*)$ cms/admin/$1 [L]
```

### 6. Smoke test

| URL | Expected |
|-----|----------|
| `/admin` | Login screen |
| `/cms/api/images.php` | JSON (empty images OK before uploads) |
| Upload via admin | File appears in `/uploads/` |
| Homepage | New image visible (may need hard refresh once if CDN) |

---

## Environment Variables (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_CMS_API_URL` | `/cms/api/images.php` | Override API path |

Set in `.env.production` if API lives on a subdomain.

---

## Future Extensibility

| Extension | How |
|-----------|-----|
| **New image slots** | Add to `src/data/image-keys.ts` + `cms/data/keys.php`; auto-register on admin login |
| **Alt text in CMS** | Add `alt_text` column; expose in API; use in `<img alt>` |
| **Multiple admins** | Replace config auth with `admins` table |
| **Audit log** | `image_revisions` table on upload/delete |
| **WebP auto-convert** | GD/Imagick in `cms_save_upload()` |
| **Drag-and-drop bulk upload** | Extend admin UI (still PHP) |
| **CDN** | Prefix `public_url` with CDN domain in config |
| **OG image sync** | Map `seo-og-default` key to copy into `/public/og-default.jpg` via cron |

---

## Operational Guide (for non-developers)

1. Go to **thegamehour.com/admin**
2. Sign in with credentials provided by your developer
3. Open **Library** to see all image slots
4. Click **Upload** or **Replace** on a row
5. Choose the matching **image key** (e.g. `gallery-3` for gallery photo 3)
6. Select a photo from your computer (max 5 MB, JPG/PNG/WEBP)
7. Click **Save image**
8. Visit the website — the new photo appears within seconds

To remove a custom photo: **Delete** in library. The site shows the original default until you upload again.

---

## Summary

| Requirement | Status |
|-------------|--------|
| PHP + MySQL on cPanel | ✅ |
| Admin at `/admin` | ✅ |
| Upload / replace / delete / preview | ✅ |
| Thumbnail library | ✅ |
| Storage in `/uploads/` + MySQL | ✅ |
| `getImageByKey()` frontend | ✅ |
| Cache busting | ✅ |
| Security (auth, validation, limits) | ✅ |
| No redeploy for image changes | ✅ |

**Simple image management. No developer required for image updates.**
