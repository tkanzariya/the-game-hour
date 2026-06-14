# The Game Hour — Operations Handbook

**Audience:** Content editors, site owners, and developers  
**Project:** TheGameHour-v2  
**Last updated:** 2026-05-23

Single entry point for day-to-day website operations after launch.

---

## CMS access

The **Image CMS** runs on production/staging (PHP + MySQL on cPanel). It is **not** available via `npm run dev`.

| Item | Value |
|------|--------|
| **Admin URL** | `https://YOUR-DOMAIN/admin/login.php` |
| **Shortcut** | `https://YOUR-DOMAIN/admin` → redirects to login |
| **Credentials** | Set in `cms/config.php` on the server (never committed) |

**First-time server setup:** See [CMS Deployment Checklist](deployment/CMS_DEPLOYMENT_CHECKLIST.md).

**How it works:** See [Image CMS Architecture](cms/IMAGE_CMS_ARCHITECTURE.md).

### Sign in

1. Open `/admin/login.php`
2. Enter username and password from `cms/config.php`
3. Library loads all **85 image slots** with friendly labels

### Find an image quickly

1. **Category** dropdown (e.g. Gallery, Birthday Games)
2. **Search** by label or key (e.g. `Gallery Photo 4`, `homepage-hero`)
3. Click **Upload** or **Replace**

---

## Image management

### Via CMS (recommended)

- Upload JPG, PNG, or WEBP (max 5 MB)
- Images appear at `/uploads/{key}.{ext}` on the live site
- Website uses CMS image automatically; bundled fallback if slot is empty

### Via code (fallback / initial assets)

- Bundled images: `src/assets/images/`
- Image key registry: `src/data/image-keys.ts`
- UX guidelines: [Image Interaction Guidelines](content/IMAGE_INTERACTION_GUIDELINES.md)
- Legacy inventory: [assets-report.md](content/assets-report.md)

### After CMS upload

Hard refresh the public page (or incognito) to confirm the new image. API responses are cache-busted by `updated_at`.

---

## Content management

**Primary guide:** [Content Management Guide](content/CONTENT_MANAGEMENT_GUIDE.md)

### Quick file map

| Change | File |
|--------|------|
| Stats, section titles | `src/data/content/stats.json` |
| Testimonials | `src/data/content/testimonials.json` |
| FAQs | `src/data/content/faqs.json` |
| Gallery story blocks | `src/data/content/gallery-stories.json` |
| Company name, email, phone | `src/data/content/company-info.json` |
| Social links | `src/data/content/social-links.json` |
| Booking URLs and button labels | `src/data/content/booking-links.json` |
| Service descriptions | `src/data/services.json` |
| Navigation / footer | `src/data/navigation.json` |

### Copy standards

Follow [Writing Style Rules](content/WRITING_STYLE_RULES.md) (no em/en dashes in user-facing copy).

### Workflow

1. Edit JSON under `src/data/content/`
2. Validate JSON (no trailing commas)
3. Run `npm run build`
4. Deploy `dist/` to server

---

## Testimonials

**File:** `src/data/content/testimonials.json`

- `"items"` array holds quotes for home and service pages
- Set `"context": "home"` or tie to a service via `"serviceSlug"`
- While using placeholders, `"meta.status": "placeholder"` may show a site notice
- Set `"meta.status": "verified"` and remove `"notice"` when using real client quotes

Full examples: [Content Management Guide → Testimonials](content/CONTENT_MANAGEMENT_GUIDE.md#how-to-add-testimonials)

---

## Stats

**File:** `src/data/content/stats.json`

- **`metrics`** — numbers shown on Home, About, Gallery (e.g. `50+` Events Hosted)
- **`sections`** — headline/subtitle per page for stat bands
- Home hero badge also reads from stats

Verified values and trust notes: [Trust Stats Update (archive)](../archive/audits/TRUST_STATS_UPDATE.md)

---

## Booking URLs

**File:** `src/data/content/booking-links.json`

```json
"urls": {
  "default": "https://…",
  "corporate": "https://…"
}
```

- **`default`** — all standard Book CTAs
- **`corporate`** — Corporate Games service page only

**Before launch:** Replace Bubble `version-test` URLs with production URLs.

**Full CTA map:** [Booking Routing Audit](operations/BOOKING_ROUTING_AUDIT.md)

---

## Deployment

**Launch checklist:** [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md) — upload, CMS, SEO, analytics, smoke tests.

### Site (React + static assets)

```bash
npm run build
```

Upload **contents of `dist/`** to `public_html/` (or staging docroot). Includes:

- `index.html`, `assets/`, `.htaccess`
- `cms/` (PHP admin + API)
- `uploads/` (writable on server)

### CMS (first deploy only)

1. Create MySQL database → import `cms/sql/schema.sql`
2. Copy `cms/config.sample.php` → `cms/config.php`
3. Set DB credentials + bcrypt admin password
4. `chmod 755 uploads/` (775 if needed)

**Full checklist:** [CMS Deployment Checklist](deployment/CMS_DEPLOYMENT_CHECKLIST.md)

### Apache requirements

- `mod_rewrite` enabled
- `.htaccess` in site root (SPA + CMS routes)

---

## Analytics

### Microsoft Clarity (configured)

Session recordings and heatmaps. Setup and env vars: [Clarity Setup](analytics/CLARITY_SETUP.md)

### GA / GTM (optional)

Not wired by default. Recommendations: [Analytics Audit](analytics/ANALYTICS_AUDIT.md)

### SEO (organic)

Metadata, sitemap, structured data: [SEO Audit](seo/SEO_AUDIT.md) · [SEO Implementation Report](seo/SEO_IMPLEMENTATION_REPORT.md)

---

## Related documentation

| Topic | Document |
|-------|----------|
| All docs index | [docs/README.md](README.md) |
| Routes | [Route Inventory](operations/ROUTE_INVENTORY.md) |
| Repo layout | [Project Structure](operations/PROJECT_STRUCTURE.md) |
| Site baseline audit | [Website Audit Report](operations/WEBSITE_AUDIT_REPORT.md) |
| Historical reports | [archive/README.md](../archive/README.md) |

---

## Support checklist

| Task | Where |
|------|--------|
| Change homepage hero image | CMS → Homepage → Homepage Hero Banner |
| Update phone number | `company-info.json` |
| Fix booking link | `booking-links.json` |
| Add testimonial | `testimonials.json` |
| Deploy code change | `npm run build` → upload `dist/` |
| CMS not loading | Check `cms/config.php`, MySQL, PHP errors |
