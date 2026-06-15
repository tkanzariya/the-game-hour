# Schema Verification — The Game Hour Image CMS

**Audit date:** 2026-06-14  
**Scope:** Read-only verification of `schema.sql` — no migrations run, no code modified.

---

## Executive summary

The CMS database schema lives at **`cms/sql/schema.sql`**. It defines **one table** (`images`), which is the **only table required** by the PHP CMS codebase. Admin authentication uses `cms/config.php` (file-based credentials), not database tables.

**Verdict:** The schema is **complete for CMS operation**. Importing it creates the required table structure and 21 starter image-key rows. Remaining image keys (64) are registered automatically on first admin login.

---

## 1. Schema file path

| Item | Value |
|------|-------|
| **Exact path (repo)** | `cms/sql/schema.sql` |
| **Absolute path (local)** | `d:\Dell\Coding\TheGameHour\TheGameHour-v2\cms\sql\schema.sql` |
| **Deployed path (cPanel)** | `public_html/cms/sql/schema.sql` |
| **Other SQL files in `cms/sql/`** | None (`seed-services.sql` referenced in a comment does **not** exist) |

---

## 2. Required CMS tables — verification

Cross-checked all SQL in the CMS PHP codebase (`cms/includes/bootstrap.php`, `cms/data/keys.php`, admin scripts, API).

| Table referenced in code | Required? | Created by `schema.sql`? |
|--------------------------|-----------|---------------------------|
| `images` | **Yes** | **Yes** |

### Not stored in MySQL (by design)

| Concern | Storage |
|---------|---------|
| Admin username / password | `cms/config.php` (`admin.username`, `admin.password_hash`) |
| Upload paths / limits | `cms/config.php` (`uploads` section) |
| DB connection | `cms/config.php` (`db` section) |
| Image key registry (source of truth) | `cms/data/keys-base.php` + `cms/data/keys.php` |

**Conclusion:** `schema.sql` creates **all required CMS tables**. No missing `CREATE TABLE` statements were found relative to application code.

---

## 3. Tables that will be created

Importing `schema.sql` creates **1 table**:

### `images`

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | `INT UNSIGNED` | NO | Primary key, auto-increment |
| `image_key` | `VARCHAR(120)` | NO | Stable frontend key (e.g. `homepage-hero`) |
| `title` | `VARCHAR(255)` | NO | Human-readable label in admin |
| `category` | `VARCHAR(120)` | NO | Grouping / filter (default `General`) |
| `file_path` | `VARCHAR(512)` | YES | Relative path under `/uploads/` |
| `updated_at` | `TIMESTAMP` | YES | Cache-busting on manifest API |
| `created_at` | `TIMESTAMP` | NO | Row creation (default `CURRENT_TIMESTAMP`) |

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `PRIMARY` | `id` | Row identity |
| `uq_image_key` | `image_key` (UNIQUE) | One row per image slot |
| `idx_category` | `category` | Admin library category filter |
| `idx_updated` | `updated_at` | Sorting / cache logic |

**Engine / charset:** `InnoDB`, `utf8mb4`, `utf8mb4_unicode_ci`

---

## 4. Seed data in `schema.sql`

The file includes an `INSERT INTO images ... ON DUPLICATE KEY UPDATE` block with **21 seed rows**:

| Category | Keys seeded |
|----------|-------------|
| Homepage | `homepage-hero`, `homepage-about-teaser`, `homepage-team-building`, `homepage-strategy-games` |
| Gallery | `gallery-hero`, `gallery-1` … `gallery-9`, `gallery-moment-1` … `gallery-moment-6` |
| Service | `birthday-hero` |

All seed rows have `file_path = NULL` (no images until uploaded via admin).

### Full key registry (85 total)

| Source | Count | When applied |
|--------|------:|--------------|
| `schema.sql` INSERT | 21 | On phpMyAdmin import |
| `cms_register_missing_keys()` | +64 | First successful admin login |
| **Total expected rows** | **85** | After first login |

Service keys (8 services × 8 slots each: title-card, slider 1–3, gallery 1–4) are defined in `cms/data/keys.php` and inserted at login — not in `schema.sql`.

---

## 5. Column ↔ application mapping

| PHP function / file | SQL operation | Columns used |
|---------------------|---------------|--------------|
| `cms_get_all_images()` | `SELECT … FROM images` | `id`, `image_key`, `title`, `category`, `file_path`, `updated_at` |
| `cms_get_image_by_key()` | `SELECT … WHERE image_key` | Same |
| `cms_save_upload()` | `INSERT` / `UPDATE images` | `image_key`, `title`, `category`, `file_path`, `updated_at` |
| `cms_delete_image()` | `UPDATE images SET file_path = NULL` | `image_key`, `updated_at` |
| `cms_register_missing_keys()` | `INSERT IGNORE INTO images` | `image_key`, `title`, `category`, `file_path` |
| `cms_sync_registry_metadata()` | `UPDATE images SET title, category` | `image_key`, `title`, `category` |
| `cms/api/images.php` | Via bootstrap helpers | Reads `images` only |

All referenced columns exist in the schema. No orphan column references.

---

## 6. Notes and caveats

| Item | Detail |
|------|--------|
| `seed-services.sql` | Mentioned in schema comment (line 44) but **file does not exist** — not required; first admin login registers service keys |
| Re-import safety | `CREATE TABLE IF NOT EXISTS` and `ON DUPLICATE KEY UPDATE` allow safe re-run of seed INSERT for existing keys |
| Migrations | No migration runner in project — single manual import via phpMyAdmin |
| Post-import check | `SELECT COUNT(*) FROM images;` → expect **21** after import, **85** after first admin login |

---

## 7. How to import (reference only — not executed)

```text
cPanel → MySQL Databases → phpMyAdmin
→ Select database → Import → cms/sql/schema.sql
```

See [docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md](docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md) for full server setup.

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [docs/cms/IMAGE_CMS_ARCHITECTURE.md](docs/cms/IMAGE_CMS_ARCHITECTURE.md) | CMS design and schema overview |
| [docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md](docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md) | Database import steps |
| [cms/config.sample.php](cms/config.sample.php) | DB credentials template |

---

*Verification performed by static analysis of `cms/sql/schema.sql` and CMS PHP SQL usage. No migrations were executed.*
