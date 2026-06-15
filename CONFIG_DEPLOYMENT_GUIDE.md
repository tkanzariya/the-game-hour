# CMS Config Deployment Guide — The Game Hour v2

**Audit date:** 2026-06-14  
**Source inspected:** `cms/config.sample.php`, `cms/includes/bootstrap.php`, `cms/tools/hash-password.php`, `cms/admin/login.php`  
**Scope:** Read-only — no files modified, no credentials generated.

---

## Executive summary

Production CMS configuration is a single PHP file: **`cms/config.php`**. It is loaded by `cms/includes/bootstrap.php` and must live **next to** `config.sample.php` inside the deployed `cms/` folder (`public_html/cms/config.php` on cPanel).

The file is **gitignored**, **excluded from build copy**, and **excluded from GitHub Actions deploy** — you create it manually on the server once.

---

## 1. Exact structure required for `cms/config.php`

The file must be a PHP script that **`return`s an associative array** with four top-level keys:

```text
cms/config.php
└── return [
      'db'      => [ ... ],   // MySQL connection
      'admin'   => [ ... ],   // CMS login credentials
      'uploads' => [ ... ],   // Image storage settings
      'session' => [ ... ],   // PHP session cookie settings
    ];
```

### How the CMS loads it

From `cms/includes/bootstrap.php`:

```php
$path = __DIR__ . '/../config.php';  // resolves to cms/config.php
$config = require $path;
```

If `config.php` is missing, the CMS returns HTTP **503** with:

```json
{"error":"CMS not configured. Copy config.sample.php to config.php"}
```

---

## 2. Every field — configuration requirements

### `db` — MySQL connection (required)

| Field | Type | Must configure? | Used for |
|-------|------|---------------|----------|
| `host` | string | **Yes** | PDO DSN host (typically `localhost` on cPanel) |
| `name` | string | **Yes** | Database name (cPanel often prefixes, e.g. `cpaneluser_thegamehour_cms`) |
| `user` | string | **Yes** | MySQL username |
| `pass` | string | **Yes** | MySQL password |
| `charset` | string | Optional | Defaults to `utf8mb4` in code if omitted |

**Code reference:** `cms_db()` builds  
`mysql:host={host};dbname={name};charset={charset}` and connects with `{user}` / `{pass}`.

---

### `admin` — CMS login (required)

| Field | Type | Must configure? | Used for |
|-------|------|---------------|----------|
| `username` | string | **Yes** | Admin login username (see §4) |
| `password_hash` | string | **Yes** | Bcrypt hash of admin password (see §5) |

**Code reference:** `cms_login()` compares submitted username to `admin.username` and verifies password with `password_verify($password, admin.password_hash)`.

Plain-text passwords are **never** stored in config.

---

### `uploads` — image storage (review defaults)

| Field | Type | Must configure? | Used for |
|-------|------|---------------|----------|
| `dir` | string | **Review** | Filesystem path where uploaded images are saved |
| `public_url` | string | **Review** | URL prefix served to the browser (typically `/uploads`) |
| `max_bytes` | int | Optional | Max upload size (sample: 5 MB) |
| `allowed_extensions` | string[] | Optional | Allowed file extensions |
| `allowed_mimes` | string[] | Optional | Allowed MIME types for validation |

**Default `dir` in sample:** `dirname(__DIR__) . '/uploads'`

When `config.php` lives in `public_html/cms/`, this resolves to **`public_html/uploads/`** (site-root uploads folder).

**Code reference:** `cms_uploads_dir()`, `cms_save_upload()`, `cms_public_upload_url()`.

---

### `session` — admin session cookie (optional defaults)

| Field | Type | Must configure? | Used for |
|-------|------|---------------|----------|
| `name` | string | Optional | PHP session cookie name (sample: `tgh_cms_session`) |
| `lifetime` | int | Optional | Cookie lifetime in seconds (sample: 8 hours) |

**Code reference:** `cms_start_session()` — sets `httponly`, `samesite=Lax`, `secure` when HTTPS detected.

---

## 3. Production-ready config template

Copy this structure to **`public_html/cms/config.php`** on the server. Replace every `CHANGE_ME` / placeholder with real values from cPanel. **Do not commit this file to Git.**

```php
<?php
/**
 * Production CMS configuration — server only.
 * Copy from cms/config.sample.php; never commit to Git.
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'CHANGE_ME_CPANEL_DATABASE_NAME',
        'user' => 'CHANGE_ME_CPANEL_MYSQL_USER',
        'pass' => 'CHANGE_ME_CPANEL_MYSQL_PASSWORD',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        'username' => 'CHANGE_ME_ADMIN_USERNAME',
        'password_hash' => 'CHANGE_ME_BCRYPT_HASH',
    ],
    'uploads' => [
        // Resolves to public_html/uploads/ when config.php is in public_html/cms/
        'dir' => dirname(__DIR__) . '/uploads',
        'public_url' => '/uploads',
        'max_bytes' => 5 * 1024 * 1024,
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp'],
        'allowed_mimes' => [
            'image/jpeg',
            'image/png',
            'image/webp',
        ],
    ],
    'session' => [
        'name' => 'tgh_cms_session',
        'lifetime' => 3600 * 8,
    ],
];
```

### cPanel field mapping

| Config key | Where to find it in cPanel |
|------------|----------------------------|
| `db.name` | **MySQL Databases** → database name (include account prefix) |
| `db.user` | **MySQL Databases** → user name (include account prefix) |
| `db.pass` | Password you set when creating the MySQL user |
| `db.host` | Almost always `localhost` on shared hosting |
| `admin.username` | Your choice (any non-empty string) |
| `admin.password_hash` | Generated locally — see §5 |

---

## 4. Admin username field

| Item | Detail |
|------|--------|
| **Config path** | `admin.username` |
| **Sample default** | `'admin'` in `config.sample.php` |
| **Login form field** | HTML input `name="username"` in `cms/admin/login.php` |
| **Validation** | Exact string match against `cms_config()['admin']['username']` |
| **Session key** | On success, stored as `$_SESSION['cms_admin']` |

**Recommendation for production:** Use a non-obvious username (not `admin` alone) and a strong password.

---

## 5. Password hash generation

The CMS stores a **bcrypt hash**, not a plain password.

| Item | Detail |
|------|--------|
| **Config path** | `admin.password_hash` |
| **Algorithm** | `password_hash(..., PASSWORD_DEFAULT)` → bcrypt (`$2y$...`) |
| **Verification** | `password_verify($plainPassword, $hash)` in `cms_login()` |

### Method A — project CLI tool (recommended)

Run on any machine with PHP (repo root):

```bash
php cms/tools/hash-password.php "YourSecurePassword"
```

Paste the single-line output into `admin.password_hash`.

### Method B — one-liner

```bash
php -r "echo password_hash('YourSecurePassword', PASSWORD_DEFAULT);"
```

### Rules

- Output is **one line** starting with `$2y$`
- Store the hash in `config.php`; store the plain password in a password manager
- The plain password **cannot be recovered** from the hash
- Regenerate the hash whenever you change the admin password

---

## 6. Where `config.php` must be placed on production

### Required location

```text
public_html/
├── cms/
│   ├── config.php          ← CREATE THIS (not in Git, not in CI deploy)
│   ├── config.sample.php   ← shipped with build (reference only)
│   ├── includes/
│   │   └── bootstrap.php   ← loads ../config.php
│   ├── admin/
│   └── api/
└── uploads/                ← writable; images saved here
```

| Environment | Path |
|-------------|------|
| **cPanel docroot** | `public_html/cms/config.php` |
| **Relative to bootstrap** | `cms/config.php` (one level above `cms/includes/`) |

### What does NOT deploy `config.php`

| Mechanism | Behavior |
|-----------|----------|
| **Git** | `cms/config.php` is in `.gitignore` |
| **`npm run build`** | `scripts/copy-cms-to-dist.mjs` skips `config.php` |
| **GitHub Actions** | `deploy-ftp.yml` excludes `cms/config.php` from mirror |

You must create `config.php` **manually on the server** (cPanel File Manager or SFTP) after the first site upload.

### Recommended file permissions

| Path | Permission |
|------|------------|
| `public_html/cms/config.php` | **640** (owner read/write, group read) |
| `public_html/uploads/` | **755** (775 only if uploads fail) |

---

## 7. Post-configuration verification

| Check | URL / action | Expected |
|-------|--------------|----------|
| Config present | `https://thegamehour.com/cms/api/images.php` | JSON manifest (not 503 “not configured”) |
| DB connected | Same URL | Not “CMS unavailable” / PDO error |
| Admin login | `https://thegamehour.com/admin/login.php` | Login with `admin.username` + plain password |
| First login | After successful login | Missing image keys auto-register (85 total rows) |
| Upload test | Admin → upload an image | File appears under `public_html/uploads/` |

---

## 8. Security checklist

- [ ] `config.php` exists only on server — never in Git or local commits
- [ ] MySQL user has access **only** to the CMS database
- [ ] `admin.password_hash` is a real bcrypt hash, not a placeholder
- [ ] `admin.username` is not a default guessable value for production
- [ ] `uploads/` is writable by PHP but blocks script execution (`.htaccess` shipped in build)
- [ ] Automated deploys preserve `cms/config.php` (GitHub Actions exclude rule)

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [cms/config.sample.php](cms/config.sample.php) | In-repo reference template |
| [SCHEMA_VERIFICATION.md](SCHEMA_VERIFICATION.md) | MySQL schema import |
| [docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md](docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md) | Full CMS deploy checklist |
| [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md) | Non-developer launch steps |
| [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) | CI deploy (preserves config.php) |

---

*Guide generated from static inspection of CMS PHP sources. No credentials were created or stored.*
