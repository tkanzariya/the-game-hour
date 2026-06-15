# Image Upload Optimization Plan

**Status:** Planned (not yet implemented)  
**Goal:** Accept large uploads from admins, store SEO-friendly optimized files on the server, and eliminate layout flash on the public site.

---

## Current behavior (after Phase 1 fixes)

| Step | What happens |
|------|----------------|
| Admin upload | Original file saved to `/uploads/{key}.{ext}` up to **20 MB** |
| Public site | Fetches `/cms/api/images.php` manifest, then shows CMS URL or bundled default |
| Flash fix | Hero images wait for manifest (`CmsImageFrame`) before rendering |
| Key isolation | Each CMS slot uses **only its own key** — `about-hero` no longer borrows `homepage-hero` |

---

## Proposed pipeline (Phase 2)

```
Admin selects file (any reasonable size)
        ↓
PHP receives upload (raise PHP upload_max_filesize / post_max_size on server if needed)
        ↓
Validate MIME + dimensions
        ↓
Optimize (GD or Imagick):
  • Auto-orient from EXIF
  • Strip EXIF/metadata (privacy + size)
  • Resize to max width per slot profile (see table below)
  • Encode WebP (primary) + optional JPEG fallback for older browsers
  • Quality ~80 WebP / ~85 JPEG
        ↓
Save to /uploads/{key}.webp
        ↓
Update DB file_path + updated_at
        ↓
Manifest serves cache-busted URL
```

### Recommended max dimensions (SEO + performance)

| Slot type | Max width | Aspect hint | Target file size |
|-----------|-----------|-------------|------------------|
| Hero (home, about, gallery) | 1920px | 16:9 or 5:4 | 120–250 KB WebP |
| Section cards / pillars | 1200px | 4:3 | 80–150 KB |
| Gallery grid | 960px | 4:3 | 60–120 KB |
| Thumbnails / accents | 640px | square | 30–60 KB |

### SEO considerations

- Preserve descriptive `alt` text in React (unchanged)
- Use `width` / `height` attributes to prevent CLS (already on heroes)
- Serve WebP with efficient compression
- Keep filenames stable (`{image-key}.webp`) for cacheability; bust cache via `?v={updated_at}`
- Optional: generate `srcset` in API for hero slots (future)

---

## Implementation tasks

1. **`cms/includes/image-optimizer.php`**
   - `cms_optimize_upload(string $tmpPath, string $destPath, array $profile): bool`
   - Profiles: `hero`, `card`, `gallery`, `thumb`

2. **Hook in `cms_save_upload()`**
   - After validation, run optimizer instead of raw `move_uploaded_file`
   - Always output `.webp` regardless of input format (PNG/JPG)

3. **Server config (cPanel)**
   - `upload_max_filesize = 32M`
   - `post_max_size = 36M`
   - `memory_limit = 256M` (for large source images during resize)

4. **Admin UX**
   - Show “Optimizing…” state on upload form
   - Success message includes final dimensions + file size
   - Remove raw MB limit text once compression is live

5. **Optional: default images in DB**
   - Seed `images` table with `file_path` pointing to bundled copies on first deploy
   - Removes bundled→CMS flash entirely for slots never customized
   - Lower priority if manifest preload + skeleton approach is sufficient

---

## Rollout order

1. ✅ Fix key cross-bleed + manifest flash (this release)
2. ✅ Fix upload redirect / 500 after save (this release)
3. Add `image-optimizer.php` + WebP conversion
4. Tune per-slot profiles using real event photos
5. (Optional) DB-seeded defaults for all 101 slots

---

## Effort estimate

| Item | Effort |
|------|--------|
| GD-based optimizer + WebP output | 1–2 days |
| Per-slot profiles in key registry | 0.5 day |
| Server PHP.ini guidance + testing | 0.5 day |
| DB default seeding (optional) | 1 day |

**Recommended next step:** Implement WebP optimizer in `cms_save_upload()` after confirming GD or Imagick is available on production cPanel.
