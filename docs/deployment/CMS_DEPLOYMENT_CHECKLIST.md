# CMS Deployment Checklist

**Audit date:** 2026-05-23  
**Scope:** Image CMS (PHP + MySQL) for The Game Hour v2  
**Architecture:** No changes — readiness verification only

---

## Audit Summary

| # | Check | Result | Notes |
|---|--------|--------|-------|
| 1 | `cms/` copied into build output | **PASS** | `npm run build` runs `scripts/copy-cms-to-dist.mjs`; 18 source files → `dist/cms/` (excludes `config.php`) |
| 2 | All admin routes exist | **PASS** | 7 PHP endpoints + `assets/admin.css` under `cms/admin/` |
| 3 | `.htaccess` rewrite rules | **PASS** | CMS/upload/admin rules precede SPA fallback in `public/.htaccess` (copied to `dist/.htaccess`) |
| 4 | Uploads directory exists | **PASS** | Build creates `dist/uploads/` with `.htaccess` + `.gitkeep`; template at `cms/uploads/` |
| 5 | Uploads permissions | **ACTION REQUIRED** | Must be writable by PHP on server (see Permissions) |
| 6 | MySQL schema complete | **PASS with caveat** | Table + indexes OK; SQL seeds 21 rows; remaining 64 keys auto-register on first admin login |
| 7 | `config.sample.php` settings | **PASS** | Covers `db`, `admin`, `uploads`, `session` — all consumed by `bootstrap.php` |
| 8 | No hardcoded localhost in app | **PASS** | React uses relative `/cms/api/images.php`; only `db.host => localhost` in sample config (standard on cPanel) |
| 9 | API URLs resolve in production | **PASS** | Default path `/cms/api/images.php`; override via `VITE_CMS_API_URL` at build time if needed |
| 10 | React graceful CMS fallback | **PASS** | `loadCmsManifest()` catches errors; empty manifest → bundled assets via `getImageByKey()` |

**Overall:** Ready to deploy **after** server-side MySQL + `config.php` setup. CMS has **not** been end-to-end tested on a live PHP host in this project.

---

## Files to Upload

Upload **everything inside `dist/`** to the site document root (`public_html/` on cPanel).

### Required tree (post-`npm run build`)

```
public_html/
├── index.html
├── .htaccess                    ← SPA + CMS rewrites
├── assets/                      ← Vite bundles (hashed filenames)
├── cms/
│   ├── admin/
│   │   ├── index.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── library.php
│   │   ├── upload.php
│   │   ├── delete.php
│   │   ├── preview.php
│   │   └── assets/admin.css
│   ├── api/
│   │   └── images.php
│   ├── data/
│   │   ├── keys.php
│   │   └── keys-base.php
│   ├── includes/
│   │   ├── bootstrap.php
│   │   └── .htaccess            ← denies direct access
│   ├── sql/
│   │   └── schema.sql
│   ├── tools/
│   │   └── hash-password.php
│   ├── uploads/                 ← template only (empty)
│   └── config.sample.php
├── uploads/                     ← live uploaded images (writable)
│   └── .htaccess                ← blocks PHP execution
├── og/                          ← if present from build
├── robots.txt
└── sitemap.xml
```

### Do NOT upload from repo root

| Path | Reason |
|------|--------|
| `cms/config.php` (local) | Gitignored; create fresh on server |
| `node_modules/` | Not needed on server |
| `src/` | Already compiled into `dist/assets/` |

### Create on server (not in build)

| File | Action |
|------|--------|
| `cms/config.php` | Copy from `cms/config.sample.php` and fill credentials |
| `uploads/*` (image files) | Created by CMS on first upload |

---

## Database Steps

### 1. Create database and user (cPanel)

1. **MySQL Databases** → create database (e.g. `youruser_tgh_cms`)
2. Create MySQL user with strong password
3. Add user to database with **ALL PRIVILEGES**

### 2. Import schema

In **phpMyAdmin**, select the database and import:

```
cms/sql/schema.sql
```

(from deployed `public_html/cms/sql/schema.sql`)

This creates the `images` table with:

- `id`, `image_key`, `title`, `category`, `file_path`, `updated_at`, `created_at`
- Unique index on `image_key`
- **21 seed rows** (homepage, gallery, one service hero)

### 3. Register remaining image keys (85 total)

**Option A (recommended):** Sign in to admin once — `login.php` calls `cms_register_missing_keys()` and inserts all 64 remaining keys from `cms/data/keys.php`.

**Option B:** Re-import is not required; schema comment references `seed-services.sql` which **does not exist** — first login handles this.

### 4. Verify

```sql
SELECT COUNT(*) FROM images;
-- Expect 85 after first successful admin login
```

---

## Permissions Required

| Path | Permission | Purpose |
|------|------------|---------|
| `uploads/` | **755** (or **775** if host requires group write) | PHP must create/write `{image-key}.{ext}` files |
| `cms/uploads/` | 755 | Optional; not used when `config.php` `uploads.dir` points to site-root `uploads/` |
| `cms/config.php` | **640** or **600** | Readable by web server only; contains DB password + bcrypt hash |
| Other `cms/` PHP files | 644 | Standard read/execute via Apache |

### cPanel notes

- PHP typically runs as your cPanel user — `uploads/` owned by that user with `755` is usually sufficient.
- If uploads fail with “Could not save file on server”, try `775` on `uploads/` or confirm open_basedir / disk quota.
- `cms/includes/.htaccess` blocks direct HTTP access to bootstrap code.

### Uploads path resolution

With `config.php` at `public_html/cms/config.php`, the sample setting:

```php
'dir' => dirname(__DIR__) . '/uploads',
```

resolves to **`public_html/uploads/`** (site root), matching `public_url` => `/uploads` and `.htaccess` rule `RewriteRule ^uploads/ - [L]`.

---

## Environment Configuration

### Server requirements

| Requirement | Version / detail |
|-------------|------------------|
| PHP | 8.0+ recommended |
| Extensions | `pdo_mysql`, `fileinfo`, sessions |
| MySQL | 5.7+ / MariaDB 10.3+ |
| Apache | `mod_rewrite` enabled |
| HTTPS | Recommended (session cookie `secure` flag when HTTPS detected) |

### Create `cms/config.php` on server

```bash
cp cms/config.sample.php cms/config.php
```

Edit values:

```php
return [
    'db' => [
        'host' => 'localhost',           // cPanel MySQL host (usually localhost)
        'name' => 'youruser_tgh_cms',
        'user' => 'youruser_cms',
        'pass' => 'YOUR_DB_PASSWORD',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        'username' => 'admin',           // change if desired
        'password_hash' => '...',        // see below
    ],
    'uploads' => [
        'dir' => dirname(__DIR__) . '/uploads',
        'public_url' => '/uploads',
        'max_bytes' => 5242880,
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp'],
        'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
    ],
    'session' => [
        'name' => 'tgh_cms_session',
        'lifetime' => 28800,
    ],
];
```

### Generate admin password hash

On any machine with PHP:

```bash
php cms/tools/hash-password.php "YourSecurePassword"
```

Paste output into `admin.password_hash` in `config.php`.

### Optional frontend build variable

Only if API is hosted at a non-default path:

```bash
VITE_CMS_API_URL=/cms/api/images.php npm run build
```

Default (no env var): relative `/cms/api/images.php` — correct for same-origin deployment.

---

## Admin Routes Reference

| Public URL | Maps to | Purpose |
|------------|---------|---------|
| `/admin/login.php` | `cms/admin/login.php` | **Recommended entry** — sign in |
| `/admin/library.php` | `cms/admin/library.php` | Image library |
| `/admin/upload.php` | `cms/admin/upload.php` | Upload / replace |
| `/admin/logout.php` | `cms/admin/logout.php` | End session |
| `/admin/preview.php?key=…` | `cms/admin/preview.php` | Authenticated image preview |
| `/admin` | `cms/admin/login.php` | Shortcut (see Known Risks) |
| `/cms/admin/login.php` | Direct PHP path | Always works |
| `/cms/api/images.php` | Public JSON manifest | Used by React |

`.htaccess` rules (must remain **before** SPA fallback):

```apache
RewriteRule ^cms/ - [L]
RewriteRule ^uploads/ - [L]
RewriteRule ^admin/?$ cms/admin/login.php [L]
RewriteRule ^admin/(.*)$ cms/admin/$1 [L]
```

---

## Validation Steps

Run these **in order** after deployment.

### 1. Build verification (local, before upload)

```bash
npm run build
```

Confirm:

- [ ] `dist/cms/` exists with 18 files
- [ ] `dist/uploads/.htaccess` exists
- [ ] `dist/.htaccess` contains CMS rules
- [ ] `dist/cms/config.php` does **not** exist

### 2. Configuration

- [ ] `cms/config.php` exists on server (not committed)
- [ ] DB credentials connect (no 503 from API)
- [ ] Admin password hash is valid bcrypt (not placeholder)

### 3. API smoke test

```bash
curl -s https://YOUR-DOMAIN/cms/api/images.php
```

Expected (before uploads):

```json
{"generated_at":"…","count":0,"images":{}}
```

With missing `config.php`:

```json
{"error":"CMS not configured. Copy config.sample.php to config.php"}
```

HTTP **503** — site still works; React uses bundled images.

Single key:

```bash
curl -s "https://YOUR-DOMAIN/cms/api/images.php?key=homepage-hero"
```

### 4. Admin smoke test

- [ ] Open `https://YOUR-DOMAIN/admin/login.php`
- [ ] Sign in with configured credentials
- [ ] Library loads with **85** image slots (after first login)
- [ ] Upload a test JPG to `homepage-hero`
- [ ] File appears at `https://YOUR-DOMAIN/uploads/homepage-hero.jpg` (or `.webp`/`.png`)
- [ ] API manifest includes `homepage-hero` with cache-busted URL
- [ ] Homepage shows CMS image (hard refresh / incognito)
- [ ] Delete/replace flow works
- [ ] Logout clears session

### 5. Frontend fallback test

- [ ] Rename `config.php` temporarily → site loads with bundled images (no console crash)
- [ ] Restore `config.php`

### 6. Security spot checks

- [ ] `https://YOUR-DOMAIN/cms/includes/bootstrap.php` → **403/ denied**
- [ ] `https://YOUR-DOMAIN/uploads/` → directory listing disabled
- [ ] Admin pages require login (visit `/admin/library.php` logged out → redirect to login)

---

## Known Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **CMS never tested on live PHP** | High | Complete validation steps on staging before production |
| **`config.php` missing on first deploy** | High | API returns 503; site works with fallbacks but admin unusable until configured |
| **`/admin` bare URL vs relative links** | Medium | Admin PHP uses relative URLs (`library.php`, `assets/admin.css`). From browser URL `/admin` (no trailing path segment), redirects may resolve to `/library.php` (SPA) instead of `/admin/library.php`. **Use `/admin/login.php` as the canonical admin URL.** |
| **Partial SQL seed (21/85 rows)** | Low | First admin login registers all keys; no manual SQL needed |
| **`seed-services.sql` referenced but absent** | Low | Documented in schema comment only; login registration replaces it |
| **Placeholder password hash in sample** | High | Login fails until real bcrypt hash is set in `config.php` |
| **Upload directory not writable** | High | Upload form error: “Could not save file on server” — fix permissions on `uploads/` |
| **Wrong MySQL credentials** | High | API 503 JSON `{error: CMS unavailable}`; admin shows errors |
| **Missing `mod_rewrite`** | High | `/admin/*` and SPA routes break — enable Apache rewrite |
| **Subdirectory deploy** | Medium | If site is not at domain root, relative API path `/cms/api/images.php` may need `VITE_CMS_API_URL` rebuild |
| **5 MB upload limit** | Low | Documented in config; large hero images may need compression |
| **CORS `Access-Control-Allow-Origin: *` on API** | Low | Public read-only manifest; acceptable for same-site use |
| **Session over HTTP** | Medium | Cookie `secure` only when HTTPS detected; use HTTPS in production |

---

## Step-by-Step Deployment Order

Follow this sequence exactly to avoid partial states where the SPA is live but CMS is broken.

### Phase A — Prepare (local)

1. Run `npm run build` and confirm `dist/` contains `cms/`, `uploads/`, `.htaccess`.
2. Generate admin password hash with `php cms/tools/hash-password.php` (note for server setup).
3. Prepare MySQL database name, user, and password for cPanel.

### Phase B — Staging upload

4. Upload **all contents** of `dist/` to staging document root (FTP / File Manager).
5. Confirm `.htaccess` uploaded (enable “show hidden files” in cPanel File Manager).

### Phase C — Database

6. Create MySQL database + user in cPanel; grant privileges.
7. Import `cms/sql/schema.sql` via phpMyAdmin.

### Phase D — Server configuration

8. Copy `cms/config.sample.php` → `cms/config.php` on server.
9. Fill `db` credentials and `admin.password_hash`.
10. Set permissions: `uploads/` → **755** (775 if needed); `config.php` → **640**.

### Phase E — Verify backend

11. `GET /cms/api/images.php` → JSON 200 (empty images OK).
12. Open `/admin/login.php` → sign in.
13. Confirm library shows all image keys (85 after registration).
14. Upload one test image; confirm file in `/uploads/` and API manifest entry.

### Phase F — Verify frontend

15. Load homepage; confirm CMS image appears for uploaded key.
16. Test fallback: temporarily break DB connection — site still renders with bundled assets.

### Phase G — Production

17. Repeat steps 4–16 on production (or promote staging DB/files per your process).
18. Restrict admin URL knowledge; use strong admin password.
19. Remove or protect `cms/tools/hash-password.php` from public use if desired (optional hardening).

---

## Quick Reference URLs (production)

Replace `YOUR-DOMAIN` with staging or production host.

| Resource | URL |
|----------|-----|
| Admin login | `https://YOUR-DOMAIN/admin/login.php` |
| Image API | `https://YOUR-DOMAIN/cms/api/images.php` |
| Uploaded file | `https://YOUR-DOMAIN/uploads/{image-key}.{ext}` |
| Public site | `https://YOUR-DOMAIN/` |

---

## Related Documentation

- [IMAGE_CMS_ARCHITECTURE.md](../cms/IMAGE_CMS_ARCHITECTURE.md) — system design and security model
- [HANDBOOK.md](../HANDBOOK.md) — operations overview
- `cms/config.sample.php` — configuration template
- `cms/sql/schema.sql` — database DDL + partial seed
