# CMS Content Manager — Phase 1 Deliverables

Phase 1 adds **Photos** (unchanged), **Testimonials**, and **Statistics** to the Website Manager admin. Testimonials and statistics update the live site at runtime via `/cms/api/content.php` — no rebuild or redeploy required.

**Status:** Implemented locally — **do not deploy until approved.**

---

## 1. Database schema changes

Run on production MySQL **after** the existing `images` table is in place:

**File:** `cms/sql/migrate-content-phase1.sql`

### New tables

| Table | Purpose |
|-------|---------|
| `testimonials` | CRUD testimonials (name, role, review, rating, visible, sort_order, placement, service_slug) |
| `site_metrics` | Four fixed homepage stat values (key/value pairs) |

### `testimonials` columns

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT UNSIGNED PK | Auto-increment |
| `slug` | VARCHAR(120) UNIQUE | Stable public id |
| `name` | VARCHAR(255) | Required |
| `role` | VARCHAR(255) | Optional subtitle (e.g. “HR Lead, Ahmedabad”) |
| `review` | TEXT | Required |
| `rating` | TINYINT 1–5 | Default 5 |
| `visible` | TINYINT(1) | 1 = shown on site |
| `sort_order` | INT | Lower first; tie → newest id |
| `placement` | ENUM home/service | Where testimonial appears |
| `service_slug` | VARCHAR(120) NULL | Required when placement = service |

### `site_metrics` seed rows

| metric_key | Default value | Label (fixed in code) |
|------------|---------------|------------------------|
| `events-hosted` | `50+` | Events Hosted |
| `participants` | `3,000+` | Participants Engaged |
| `games-conducted` | `100+` | Games Conducted |
| `cities-served` | `6` | Cities Served |

Testimonials are **not** in SQL seed data. On first admin login, `cms_content_seed_if_empty()` imports from `src/data/content/testimonials.json` when the table is empty.

Tables are also appended to `cms/sql/schema.sql` for reference.

---

## 2. Admin screenshots (capture before deploy)

Log in at `/admin/login.php` and capture:

| # | Screen | URL (local: `http://localhost:8765/admin/...`) |
|---|--------|------------------------------------------------|
| 1 | Dashboard (3 cards) | `dashboard.php` |
| 2 | Photos hub | `photos/index.php` |
| 3 | Testimonials list | `testimonials/index.php` |
| 4 | Add/Edit testimonial form | `testimonials/edit.php` |
| 5 | Statistics form | `statistics.php` |

**Local credentials** (`cms/config.local.php`): `devadmin` / `dev123`

Sidebar should show only **Dashboard** and **Log out**.

---

## 3. Local testing instructions

### Prerequisites

- PHP 8.1+ on PATH
- Node.js 20+

### One-time setup

```bash
cd TheGameHour-v2
npm install
copy cms\config.dev.sample.php cms\config.local.php   # Windows
# cp cms/config.dev.sample.php cms/config.local.php    # macOS/Linux
```

Ensure `cms/config.local.php` includes:

```php
'dev' => [
    'json_store' => __DIR__ . '/dev-data/images.json',
    'content_store' => __DIR__ . '/dev-data/content.json',
],
```

### Run locally (no MySQL)

**Terminal 1 — frontend:**

```bash
npm run dev
```

**Terminal 2 — CMS + built SPA:**

```bash
npm run build
npm run cms:dev
```

Open:

- Site: `http://localhost:8765/`
- Admin: `http://localhost:8765/admin/login.php`

### Test flow

1. **Login** → dashboard shows Photos, Testimonials, Statistics cards.
2. **Testimonials** → list loads (seeded from bundled JSON on first login).
3. **Edit a testimonial** → change review text → Save → refresh homepage → updated quote appears **without** `npm run build`.
4. **Add testimonial** → set placement Home, visible on → appears on homepage.
5. **Statistics** → change `50+` to `75+` → Save → refresh homepage “Trusted experiences” section shows new value.
6. **Photos** → open a category → upload/replace still works (unchanged flow).
7. **API check:**

   ```bash
   curl -s http://localhost:8765/cms/api/content.php | jq .
   ```

   Expect JSON with `testimonials`, `metrics`, `version: 1`.

8. **Fallback** — stop PHP server, reload site → testimonials/stats fall back to bundled JSON in `src/data/content/`.

### Dev storage files

| File | Contents |
|------|----------|
| `cms/dev-data/images.json` | Photo CMS (existing) |
| `cms/dev-data/content.json` | Testimonials + metrics (auto-created) |

---

## 4. Verification checklist

### Admin

- [ ] Sidebar: Dashboard + Log out only
- [ ] Dashboard: Photos, Testimonials, Statistics cards
- [ ] Testimonials: list, add, edit, delete, visible toggle
- [ ] Testimonials: sort order respected (lower first)
- [ ] Testimonials: home vs service placement + service slug
- [ ] Statistics: four value fields only; labels not editable
- [ ] Flash messages on save/delete
- [ ] Photos: category → upload flow unchanged

### Frontend (runtime)

- [ ] Homepage testimonials show name, role, review, star rating
- [ ] Service page testimonials filter by service slug
- [ ] Homepage stats section uses CMS values
- [ ] Hero badge (`events-hosted`) uses CMS value
- [ ] Changes visible after browser refresh (no rebuild)
- [ ] CMS API failure → bundled JSON fallback

### API

- [ ] `GET /cms/api/content.php` returns 200 + JSON
- [ ] Hidden testimonials (`visible = 0`) excluded from public API
- [ ] `Cache-Control: no-store` on content API

### Out of scope (confirm absent)

- [ ] No Links, Contact, Social, FAQ admin pages
- [ ] No `site_links`, `contact_info`, `social_channels`, `site_settings` tables
- [ ] No testimonial photos or drag-and-drop reorder UI

---

## 5. Migration plan (production)

**Do not run until approved.**

### Step 1 — Backup

- Export MySQL database (phpMyAdmin → Export).
- Backup `cms/uploads/` if not already in version control.

### Step 2 — Deploy code

- Push/deploy branch containing Phase 1 files.
- Ensure `cms/` is copied to production document root (existing `copy-cms-to-dist` build step).

### Step 3 — Run SQL

In phpMyAdmin, execute:

```
cms/sql/migrate-content-phase1.sql
```

Safe to re-run (`IF NOT EXISTS`, idempotent metric inserts).

### Step 4 — First admin login

- Log in to `/admin/login.php`.
- Seed runs automatically if `testimonials` is empty (imports bundled JSON).
- Metric rows insert on first access if missing.

### Step 5 — Smoke test on staging/production

1. Open `/cms/api/content.php` — verify JSON.
2. Edit one statistic value in admin → refresh homepage.
3. Edit one testimonial → refresh homepage.
4. Confirm photos still load from existing CMS.

### Step 6 — Rollback (if needed)

- Revert code deploy to previous release.
- Frontend falls back to bundled JSON automatically if API is missing.
- Optional: `DROP TABLE testimonials, site_metrics;` only if you need to undo DB (data loss).

---

## Architecture summary

```
Admin (PHP)                    Public API                    React SPA
─────────────                  ──────────                    ─────────
testimonials CRUD    ──►  content.json / MySQL  ◄──  GET /cms/api/content.php
statistics form              │                              │
                               └──────────────────────────────┘
                                              │
                                    CmsContentProvider
                                    testimonials.ts / stats.ts
                                    (JSON fallback if API fails)
```

### Key files

| Area | Path |
|------|------|
| Migration SQL | `cms/sql/migrate-content-phase1.sql` |
| Content store | `cms/includes/content-store.php`, `dev-content-store.php` |
| Public API | `cms/api/content.php` |
| Admin UI | `cms/admin/dashboard.php`, `testimonials/*`, `statistics.php`, `photos/index.php` |
| Frontend loader | `src/lib/cms-content.ts` |
| Provider | `src/components/CmsContent/CmsContentProvider.tsx` |
| Fallback JSON | `src/data/content/testimonials.json`, `stats.json` |

---

## Approval gate

After you review local implementation, screenshots, and this checklist:

1. Confirm migration window.
2. Run production SQL + deploy.
3. Post-deploy smoke test.

**No automatic production push is included in this phase.**
