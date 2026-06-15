# CMS Content Manager Plan

**Project:** The Game Hour v2 — CMS evolution  
**Goal:** Transform the Photo Manager into a **Website Manager** for non-technical owners  
**Status:** Planning only — **do not deploy until implementation is complete and verified**  
**Generated:** 2026-06-15

---

## 1. Executive summary

Today the PHP CMS only manages **images** (101 slots). All other dynamic content — testimonials, homepage statistics, booking URLs, contact details, and social links — lives in **static JSON files** under `src/data/content/` and is baked into the React bundle at build time.

To meet the goal of **no code edits for routine updates**, we will:

1. **Extend the CMS backend** (MySQL + local JSON dev store) to persist text/settings content.
2. **Expose a public read API** (same pattern as `/cms/api/images.php`).
3. **Load content at runtime** in the React app (similar to `CmsImagesProvider`).
4. **Simplify admin navigation** to Dashboard + Logout, with six dashboard sections.

Photos keep the existing upload/category workflow; everything else becomes form-based CRUD.

---

## 2. Current state vs target state

| Area | Today | Target |
|------|--------|--------|
| Admin brand | “Photo Manager” | “Website Manager” |
| Sidebar | Dashboard, All Photos, Categories, Settings, Logout | **Dashboard, Logout** |
| Photos | Category grid + upload | Same UX, reached from **Dashboard → Photos** |
| Testimonials | `src/data/content/testimonials.json` | DB + admin CRUD, runtime API |
| Statistics | `src/data/content/stats.json` | DB + admin form, runtime API |
| Booking / WhatsApp URLs | `src/data/content/booking-links.json` + `company-info.json` | DB + admin form, runtime API |
| Contact | `src/data/content/company-info.json` | DB + admin form, runtime API |
| Social | `src/data/content/social-links.json` | DB + admin form + visibility toggles, runtime API |
| Frontend | Build-time JSON imports | Fetch CMS content manifest on page load; JSON files remain **fallback defaults** |

---

## 3. Proposed database schema changes

Extend `cms/sql/schema.sql`. Existing `images` table is **unchanged**.

### 3.1 `testimonials`

Supports CRUD, reorder, hide/show, optional photo.

```sql
CREATE TABLE IF NOT EXISTS testimonials (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  role VARCHAR(255) NOT NULL DEFAULT '',
  review TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  photo_path VARCHAR(512) DEFAULT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  -- Where the testimonial appears (preserves current home vs service behaviour)
  placement ENUM('home', 'service', 'both') NOT NULL DEFAULT 'home',
  service_slug VARCHAR(120) DEFAULT NULL,
  outcome VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_testimonial_slug (slug),
  KEY idx_visible_sort (visible, sort_order),
  KEY idx_placement (placement),
  KEY idx_service_slug (service_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Field mapping from current JSON**

| User-facing field | DB column | Notes |
|-------------------|-----------|--------|
| Name | `name` | Split from legacy `attribution` (e.g. “Rahul M., HR Lead…” → name + role) |
| Role | `role` | Job / title / location line |
| Review | `review` | Was `quote` |
| Rating | `rating` | New; 1–5 stars in UI |
| Photo | `photo_path` | Optional; file in `cms/uploads/testimonials/` |
| Hide/Show | `visible` | `0` = hidden, `1` = live |
| Reorder | `sort_order` | Lower = first |

**Seed migration:** Import all 12 items from `testimonials.json` on first admin login (one-time migration script).

---

### 3.2 `site_metrics`

Four fixed homepage stats (editable values + labels).

```sql
CREATE TABLE IF NOT EXISTS site_metrics (
  metric_key VARCHAR(60) NOT NULL PRIMARY KEY,
  value VARCHAR(60) NOT NULL DEFAULT '',
  label VARCHAR(120) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_metrics (metric_key, value, label, sort_order) VALUES
('events-hosted',   '50+',    'Events Hosted',        1),
('participants',    '3,000+', 'Participants Engaged', 2),
('games-conducted', '100+',   'Games Conducted',      3),
('cities-served',   '6',      'Cities Served',        4)
ON DUPLICATE KEY UPDATE value = VALUES(value);
```

Section title/subtitle (“Trusted experiences at scale”) can stay in code for v1 or move to `site_settings` (see below) in a later phase.

---

### 3.3 `site_links`

Booking and action URLs (single-row logical group, key-value rows).

```sql
CREATE TABLE IF NOT EXISTS site_links (
  link_key VARCHAR(60) NOT NULL PRIMARY KEY,
  url VARCHAR(512) NOT NULL DEFAULT '',
  label VARCHAR(120) DEFAULT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO site_links (link_key, url) VALUES
('booking_default',   'https://the-game-hour.bubbleapps.io/version-test/'),
('booking_corporate', 'https://the-game-hour.bubbleapps.io/version-test/corporate_booking'),
('whatsapp',          'https://wa.me/919924007700'),
('instagram',         'https://www.instagram.com/thegamehour'),
('linkedin',          'https://www.linkedin.com/company/the-game-hour/'),
('facebook',          '')
ON DUPLICATE KEY UPDATE url = VALUES(url);
```

**Note:** Instagram / LinkedIn / Facebook also appear in `social_channels` (below) for **visibility and display copy**. `site_links` holds the canonical URL used by CTAs; social section controls whether each channel is shown.

---

### 3.4 `contact_info`

Single-row table (always `id = 1`).

```sql
CREATE TABLE IF NOT EXISTS contact_info (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  email VARCHAR(255) NOT NULL DEFAULT '',
  phone_e164 VARCHAR(32) NOT NULL DEFAULT '',
  phone_display VARCHAR(64) NOT NULL DEFAULT '',
  address_street VARCHAR(512) NOT NULL DEFAULT '',
  address_locality VARCHAR(120) NOT NULL DEFAULT '',
  address_region VARCHAR(120) NOT NULL DEFAULT '',
  postal_code VARCHAR(20) NOT NULL DEFAULT '',
  address_country CHAR(2) NOT NULL DEFAULT 'IN',
  location_display TEXT NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

`location_display` = multi-line footer/contact block (current `company-info.json` → `contact.location`).

---

### 3.5 `social_channels`

URLs + visibility + optional display lines (footer cards).

```sql
CREATE TABLE IF NOT EXISTS social_channels (
  channel_key VARCHAR(60) NOT NULL PRIMARY KEY,
  url VARCHAR(512) NOT NULL DEFAULT '',
  label VARCHAR(120) NOT NULL DEFAULT '',
  abbr VARCHAR(8) DEFAULT NULL,
  lines_json JSON DEFAULT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO social_channels (channel_key, url, label, abbr, lines_json, visible, sort_order) VALUES
('instagram', 'https://www.instagram.com/thegamehour', 'Instagram', 'IG',
 '["Real events.","Real photos.","Real experiences."]', 1, 1),
('linkedin', 'https://www.linkedin.com/company/the-game-hour/', 'LinkedIn', 'IN',
 '["Corporate credibility.","Professional event expertise.","Business trust."]', 1, 2),
('facebook', '', 'Facebook', 'FB', '[]', 0, 3)
ON DUPLICATE KEY UPDATE url = VALUES(url);
```

---

### 3.6 Optional: `site_settings` (phase 2)

Generic key-value store for section headings, CTA labels, etc. **Not required for MVP** but avoids future schema churn:

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(120) NOT NULL PRIMARY KEY,
  setting_group VARCHAR(60) NOT NULL DEFAULT 'general',
  value_json JSON NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  KEY idx_group (setting_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

MVP can keep button labels (`bookNow`, `whatsapp`, etc.) in bundled JSON; owners rarely change those.

---

### 3.7 Local dev storage (JSON)

Mirror production tables in `cms/dev-data/content.json`:

```json
{
  "testimonials": [ /* rows */ ],
  "site_metrics": [ /* rows */ ],
  "site_links": { "booking_default": "...", ... },
  "contact_info": { /* single object */ },
  "social_channels": [ /* rows */ ]
}
```

Same dual-path pattern as `dev-json-store.php` for images: `cms_dev_json_enabled()` routes all content CRUD to JSON when `config.local.php` is present.

---

## 4. Proposed admin UI structure

### 4.1 Global shell

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (fixed)          │  Main content                    │
│  ─────────────────        │                                  │
│  The Game Hour            │  [Page title]                    │
│  Website Manager          │                                  │
│                           │  …                               │
│  ● Dashboard              │                                  │
│                           │                                  │
│  ─────────────────        │                                  │
│  admin@…                  │                                  │
│  Log out                  │                                  │
└─────────────────────────────────────────────────────────────┘
```

**Removed from sidebar**

- All Photos  
- Categories  
- Settings  
- Global photo search bar (search moves inside Photos section only)

**Renamed**

- “Photo Manager” → “Website Manager” (title, sidebar brand, `<title>` tag)

---

### 4.2 Dashboard (`admin/dashboard.php`)

Six section cards (same visual language as current category cards):

| # | Card | Subtitle | Opens |
|---|------|----------|--------|
| 1 | **Photos** | Manage hero, gallery, service & about images | `photos/index.php` (category hub) |
| 2 | **Testimonials** | Guest reviews on home & service pages | `testimonials/index.php` |
| 3 | **Statistics** | Homepage trust numbers | `statistics.php` |
| 4 | **Links & URLs** | Booking forms & WhatsApp | `links.php` |
| 5 | **Contact Information** | Address, phone, email | `contact.php` |
| 6 | **Social Media** | Instagram, LinkedIn, Facebook | `social.php` |

Each card shows a **status line** (e.g. “3 testimonials hidden”, “Facebook link not set”, “12 / 101 photos uploaded”).

---

### 4.3 Photos section (existing, relocated)

**Route:** `admin/photos/index.php` (or keep `dashboard.php` photos block + `category.php`)

No functional change to upload/delete/preview. Navigation path:

```
Dashboard → Photos → [Category] → [Upload]
```

Pages (unchanged logic, updated breadcrumbs):

| Page | Purpose |
|------|---------|
| `photos/index.php` | Category grid (current `#categories` block) |
| `category.php?cat=…` | Photo cards for one category |
| `upload.php?key=…` | Upload / replace |
| `delete.php` | POST remove upload |
| `preview.php` | Full-size preview |

Breadcrumb example: `Dashboard › Photos › Gallery › Featured moments — 1`

---

### 4.4 Testimonials section

**List** — `admin/testimonials/index.php`

```
┌──────────────────────────────────────────────────────────┐
│  Testimonials                          [+ Add testimonial] │
│  Drag rows to reorder · Hidden items stay in admin only   │
├──────────────────────────────────────────────────────────┤
│  ≡  ★★★★★  Rahul M. · HR Lead          [Home]   [Edit] [Hide] │
│  ≡  ★★★★★  Priya P. · Birthday Host   [Home]   [Edit] [Hide] │
│  ≡  ★★★★☆  Mrs. Sharma · Parent        [Birthday] [Edit] [Hide] │
└──────────────────────────────────────────────────────────┘
```

- **Reorder:** drag handle updates `sort_order` via `POST testimonials/reorder.php` (JSON array of ids).
- **Hide/Show:** toggles `visible` without delete.
- **Delete:** confirm modal → soft option later; MVP = hard delete.

**Add / Edit** — `admin/testimonials/edit.php?id=…`

| Field | Input |
|-------|--------|
| Name | text |
| Role | text |
| Review | textarea |
| Rating | 1–5 star picker |
| Photo | optional upload (same validation as images) |
| Show on website | checkbox (`visible`) |
| Appears on | select: Home page / Service page / Both |
| Service (if applicable) | dropdown of 8 service slugs |

---

### 4.5 Statistics section

**Page:** `admin/statistics.php`

Simple form — four rows, no add/delete:

| Metric | Value (editable) | Label (editable) |
|--------|----------------|------------------|
| Events Hosted | `50+` | Events Hosted |
| Participants Engaged | `3,000+` | Participants Engaged |
| Games Conducted | `100+` | Games Conducted |
| Cities Served | `6` | Cities Served |

Single **Save changes** button. Preview hint: “Shown in homepage ‘Trusted experiences at scale’ section.”

---

### 4.6 Links & URLs section

**Page:** `admin/links.php`

| Field | Example |
|-------|---------|
| Booking URL (default) | `https://…` |
| Corporate booking URL | `https://…` |
| WhatsApp URL | `https://wa.me/919924007700` |

Validation: must be `https://` URLs. WhatsApp helper text: “Use wa.me link format.”

---

### 4.7 Contact Information section

**Page:** `admin/contact.php`

| Field | Notes |
|-------|--------|
| Email | `info@thegamehour.com` |
| Phone (display) | `+91 99240 07700` |
| Phone (link) | E.164 for `tel:` / WhatsApp consistency |
| Street address | Single line |
| City / locality | Bodakdev, Ahmedabad |
| State | Gujarat |
| Postal code | 380059 |
| Country | IN |
| Address (display) | Multi-line preview for footer (auto-generated from fields + manual override toggle) |

---

### 4.8 Social Media section

**Page:** `admin/social.php`

| Channel | URL | Show on website |
|---------|-----|-----------------|
| Instagram | … | ☑ |
| LinkedIn | … | ☑ |
| Facebook | … | ☐ |

Optional: edit short taglines (`lines_json`) per channel — collapsed “Advanced display text” accordion.

---

## 5. Public API (read-only)

New endpoint: **`GET /cms/api/content.php`**

Response shape (versioned):

```json
{
  "generated_at": "2026-06-15T12:00:00+00:00",
  "version": 1,
  "testimonials": [
    {
      "id": "home-corporate-engagement",
      "name": "Rahul M.",
      "role": "HR Lead, IT Services Firm, Ahmedabad",
      "review": "…",
      "rating": 5,
      "photoUrl": null,
      "placement": "home",
      "serviceSlug": "corporate-games",
      "outcome": "Cross-department engagement…"
    }
  ],
  "metrics": {
    "events-hosted": { "value": "50+", "label": "Events Hosted" },
    "participants": { "value": "3,000+", "label": "Participants Engaged" }
  },
  "links": {
    "booking_default": "https://…",
    "booking_corporate": "https://…",
    "whatsapp": "https://wa.me/…"
  },
  "contact": {
    "email": "…",
    "phoneDisplay": "…",
    "phone": "…",
    "location": "…",
    "address": { "streetAddress": "…", … }
  },
  "social": [
    { "id": "instagram", "url": "…", "label": "Instagram", "visible": true, "lines": ["…"] }
  ]
}
```

- Only **`visible = 1`** testimonials and social channels are returned.
- Testimonial photos: `/uploads/testimonials/{slug}.webp`
- CORS: same as `images.php` (`Access-Control-Allow-Origin: *`)
- Cache: `Cache-Control: no-store` for admin freshness; optional `?v=` cache bust on frontend

---

## 6. Frontend integration (no rebuild for content edits)

### 6.1 New provider

```
MainLayout
  └── CmsContentProvider   ← new (parallel to CmsImagesProvider)
        └── fetch /cms/api/content.php on mount
        └── expose hooks: useTestimonials(), useSiteMetrics(), etc.
```

### 6.2 Loader fallback chain

Each getter follows:

1. CMS manifest (if loaded)  
2. Bundled JSON default (`src/data/content/*.json`)  
3. Never blank — same as image CMS

**Files to update in implementation phase:**

| Loader | Change |
|--------|--------|
| `src/lib/content/testimonials.ts` | Read from CMS manifest first |
| `src/lib/content/stats.ts` | Read metrics from CMS |
| `src/lib/content/booking.ts` | Read URLs from CMS |
| `src/lib/content/company.ts` | Read contact from CMS |
| `src/lib/content/social.ts` | Read social from CMS |

JSON files **stay in repo** as seed defaults and offline fallback — not deleted.

### 6.3 Testimonial UI updates

- `HomeTestimonials.tsx` / `ServiceTestimonials.tsx`: show star rating, optional photo avatar.
- Map `name` + `role` instead of single `attribution` string.

---

## 7. PHP backend structure (implementation)

```
cms/
├── admin/
│   ├── dashboard.php          ← 6 section cards (rewrite)
│   ├── photos/
│   │   └── index.php          ← category hub (from dashboard #categories)
│   ├── testimonials/
│   │   ├── index.php
│   │   ├── edit.php
│   │   ├── reorder.php
│   │   └── delete.php
│   ├── statistics.php
│   ├── links.php
│   ├── contact.php
│   ├── social.php
│   ├── category.php           ← unchanged
│   ├── upload.php             ← unchanged
│   └── …
├── api/
│   ├── images.php             ← unchanged
│   └── content.php            ← new public read API
├── includes/
│   ├── bootstrap.php          ← layout rebrand + nav trim
│   ├── content-store.php      ← MySQL CRUD abstraction
│   └── dev-content-store.php  ← JSON dev mirror
├── data/
│   └── content-seed.php       ← one-time import from JSON files
└── sql/
    ├── schema.sql             ← append new tables
    └── migrate-content.sql    ← production migration script
```

**Legacy redirects**

- `photos.php` → `photos/index.php`
- `settings.php` → `dashboard.php` (or remove)
- `library.php` → `dashboard.php` (already partially done)

---

## 8. Security & validation

| Concern | Approach |
|---------|----------|
| Auth | Existing session + CSRF on all POST forms |
| URLs | `filter_var(FILTER_VALIDATE_URL)`, require `https://` |
| Email | `filter_var(FILTER_VALIDATE_EMAIL)` |
| Phone | Strip to E.164 for storage; formatted display separate |
| Testimonial review | Strip tags; max 2000 chars |
| Rating | Clamp 1–5 |
| File uploads | Reuse `cms_validate_image_upload()`; max 5 MB; JPG/PNG/WebP |
| SQL | Prepared statements only (existing pattern) |
| Public API | GET only; no admin data leaked |

---

## 9. Migration plan

1. **Deploy schema** via phpMyAdmin (`migrate-content.sql`) — does not touch `images` or uploads.
2. **Seed data** on first admin login: `cms_seed_content_from_defaults()` reads bundled JSON paths from a one-time PHP script (or ship SQL INSERTs).
3. **Deploy PHP admin + API** — old sidebar still works briefly if needed.
4. **Deploy frontend** with `CmsContentProvider` — falls back to JSON if API 503.
5. **Verify** home testimonials, stats, footer contact, booking CTAs, social icons.
6. **Owner training:** single bookmark → `/admin/` → Dashboard sections.

**Rollback:** Frontend falls back to bundled JSON automatically; DB tables can remain unused.

---

## 10. Implementation phases

| Phase | Scope | Deploy? |
|-------|--------|---------|
| **0** | This plan + approval | No |
| **1** | Schema + seed + `content.php` API + dev JSON store | Staging |
| **2** | Admin shell (nav trim, dashboard cards, rebrand) | Staging |
| **3** | Statistics, Links, Contact, Social forms | Staging |
| **4** | Testimonials CRUD + reorder + photo upload | Staging |
| **5** | Frontend `CmsContentProvider` + testimonial UI | Staging |
| **6** | Photos section breadcrumb polish only | Staging |
| **7** | End-to-end QA + owner walkthrough | Production |

**Estimated new admin pages:** 8  
**Estimated new PHP includes:** 2  
**Estimated React files touched:** ~15  
**Database tables added:** 5 (+ optional `site_settings` later)

---

## 11. Out of scope (future Website Manager phases)

These remain JSON/code for now; can move to CMS later via `site_settings` or dedicated modules:

- FAQ copy (`faqs.json`)
- Service page long-form copy (`services.json`)
- Homepage section headings (`home.json`, `stats.json` section titles)
- Gallery story text (`gallery-stories.json`)
- Navigation menu labels (`navigation.json`)
- SEO meta defaults

---

## 12. Acceptance criteria

- [ ] Sidebar shows only **Dashboard** and **Log out**
- [ ] Dashboard lists all **6 sections**; each opens without sidebar clutter
- [ ] Owner can update stats, links, contact, social **without git or redeploy**
- [ ] Owner can add/edit/delete/reorder/hide testimonials
- [ ] Optional testimonial photo upload works
- [ ] Photo management unchanged in capability
- [ ] Live site reflects CMS edits within seconds (hard refresh)
- [ ] Local dev works with `config.local.php` JSON store (no MySQL)
- [ ] Public site still works if CMS API is down (bundled JSON fallback)

---

## 13. Decision log

| Decision | Rationale |
|----------|-----------|
| Separate `social_channels` + `site_links` | User asked for Links & Social as distinct dashboard sections; URLs synced on save |
| Keep `images` table as-is | Zero regression risk for photo CMS |
| Runtime fetch vs rebuild | Required for “no code edits”; matches existing image manifest pattern |
| Testimonials normalized table | Reorder + CRUD + visibility need row-level ops |
| Metrics as fixed keys | Only four values; no arbitrary add/delete needed |
| Bundled JSON retained | Offline fallback + first-install seed + developer ergonomics |

---

*Next step after approval: implement Phase 1 (schema + API + seed) on a feature branch — **not** pushed to production until Phase 7 QA passes.*
