# Documentation Inventory

**Audit date:** 2026-05-23  
**Repository scope:** `TheGameHour/` (project-owned markdown only)  
**Excluded:** `TheGameHour-v2/node_modules/**` (224 dependency README/LICENSE files)

**Totals:** 60 project-owned `.md` files — 59 in `TheGameHour-v2/` root + 1 at `TheGameHour/SKILL.md`

---

## Summary

| Metric | Count |
|--------|------:|
| Project-owned `.md` files | 60 |
| Referenced by application code | 3 |
| Referenced by other project docs | 52 |
| Unreferenced by any project doc | 8 |
| node_modules `.md` (excluded) | 224 |

---

## Code reference legend

**Referenced by code = Yes** only when application source (`src/`, `scripts/`, `cms/`) explicitly names the file. Provenance strings in JSON metadata count as soft references.

| File | Code reference location |
|------|-------------------------|
| `LAYOUT_SYSTEM_AUDIT.md` | `src/constants/layout.ts`, `src/styles/layout.css` |
| `content-map.md` | `src/data/navigation.json`, `src/data/about.json` (`meta.source`) |
| `SKILL.md` | `src/styles/design-tokens.ts`, `src/styles/globals.css`, `src/pages/DesignPreviewPage.tsx` |

No build scripts, routers, or CMS PHP files import or require any other `.md` file.

---

## Full inventory

| Filename | Location | Purpose | Referenced by code? | Referenced by docs? |
|----------|----------|---------|:-------------------:|:-------------------:|
| `README.md` | `TheGameHour-v2/` | Project entry point, stack, scripts, deploy basics | No | Yes |
| `PROJECT_STRUCTURE.md` | `TheGameHour-v2/` | Folder layout and migration architecture | No | Yes |
| `SKILL.md` | `TheGameHour/` | Claymorphism design-system skill (agent + UI guidelines) | Yes | Yes |
| **Content & copy** |
| `CONTENT_MANAGEMENT_GUIDE.md` | `TheGameHour-v2/` | Operational guide: JSON content, booking links, images | No | Yes |
| `WRITING_STYLE_RULES.md` | `TheGameHour-v2/` | Copy standards (punctuation, tone, SEO format) | No | Yes |
| `content-map.md` | `TheGameHour-v2/` | Legacy-to-v2 page copy inventory (planning artifact) | Yes | Yes |
| `components-map.md` | `TheGameHour-v2/` | Reusable UI pattern inventory from legacy audit | No | Yes |
| `IMAGE_INTERACTION_GUIDELINES.md` | `TheGameHour-v2/` | Image UX guidelines for editors and implementers | No | No |
| **CMS & deployment** |
| `IMAGE_CMS_ARCHITECTURE.md` | `TheGameHour-v2/` | Image CMS system design, schema, security, deploy overview | No | Yes |
| `CMS_DEPLOYMENT_CHECKLIST.md` | `TheGameHour-v2/` | Production CMS deploy steps, permissions, validation | No | No |
| `ADMIN_URL_FIX.md` | `TheGameHour-v2/` | Admin URL hardening implementation report (301 + absolute paths) | No | Yes |
| `IMAGE_LABELS_REPORT.md` | `TheGameHour-v2/` | Friendly CMS label mapping report | No | Yes |
| `IMAGE_FILTERING_REPORT.md` | `TheGameHour-v2/` | CMS library filter/search implementation report | No | Yes |
| `CMS_USABILITY_REPORT.md` | `TheGameHour-v2/` | Pre-production CMS usability validation summary | No | No |
| **SEO & analytics** |
| `SEO_AUDIT.md` | `TheGameHour-v2/` | SEO findings and recommendations (pre/post implementation) | No | Yes |
| `SEO_IMPLEMENTATION_REPORT.md` | `TheGameHour-v2/` | SEO sprint completion report (canonical, OG, sitemap, JSON-LD) | No | No |
| `ANALYTICS_AUDIT.md` | `TheGameHour-v2/` | GA/GTM/Clarity audit and recommendations | No | Yes |
| `CLARITY_SETUP.md` | `TheGameHour-v2/` | Microsoft Clarity integration guide | No | Yes |
| **Routing & booking** |
| `ROUTE_INVENTORY.md` | `TheGameHour-v2/` | Full route catalog with CTAs and nav links | No | Yes |
| `ROUTE_AUDIT.md` | `TheGameHour-v2/` | Early route wiring audit (superseded partially) | No | Yes |
| `BROKEN_LINK_AUDIT.md` | `TheGameHour-v2/` | Broken link fixes and redirect audit | No | Yes |
| `BOOKING_ROUTING_AUDIT.md` | `TheGameHour-v2/` | Booking CTA URL mapping (Bubble default vs corporate) | No | Yes |
| **Launch & QA** |
| `LAUNCH_EXECUTION_PLAN.md` | `TheGameHour-v2/` | Phased launch task plan from website audit | No | Yes |
| `PRE_LAUNCH_QA_REPORT.md` | `TheGameHour-v2/` | Pre-launch QA findings (booking blocker, UX issues) | No | No |
| `WEBSITE_AUDIT_REPORT.md` | `TheGameHour-v2/` | Comprehensive UX/performance/content baseline audit | No | Yes |
| **Trust & content strategy** |
| `TRUST_AUTHORITY_PLAN.md` | `TheGameHour-v2/` | Trust signals, stats, testimonials strategy | No | Yes |
| `TRUST_STATS_UPDATE.md` | `TheGameHour-v2/` | Verified stat values and trust copy updates | No | Yes |
| `CONTENT_CONSOLIDATION_REPORT.md` | `TheGameHour-v2/` | Page role consolidation (reduce repetition) | No | Yes |
| **Design system** |
| `design-system.md` | `TheGameHour-v2/` | Original brand audit + v2 recommendations | No | Yes |
| `design-system-v2.md` | `TheGameHour-v2/` | Claymorphism token/component reference | No | Yes |
| `DESIGN_SYSTEM_REPORT.md` | `TheGameHour-v2/` | SKILL-aligned design system implementation report | No | Yes |
| `DESIGN_IMPLEMENTATION_REPORT.md` | `TheGameHour-v2/` | Design preview page and token implementation sprint | No | Yes |
| `SKILL_ANALYSIS.md` | `TheGameHour-v2/` | SKILL.md philosophy mapped to TGH brand | No | Yes |
| `CONTRAST_SYSTEM_REPORT.md` | `TheGameHour-v2/` | Contrast/accessibility audit on theme surfaces | No | No |
| `PURPLE_THEME_REVIEW.md` | `TheGameHour-v2/` | Violet accent theme review | No | Yes |
| `CORAL_THEME_EVALUATION.md` | `TheGameHour-v2/` | Coral theme evaluation (not adopted) | No | No |
| `SOFT_UI_REVAMP.md` | `TheGameHour-v2/` | Soft UI / clay surface revamp notes | No | No |
| `NAVBAR_REFINEMENT.md` | `TheGameHour-v2/` | Navbar structure and styling refinement | No | Yes |
| `HERO_HIERARCHY_FIX.md` | `TheGameHour-v2/` | Hero typography hierarchy fix report | No | Yes |
| **Assets & images** |
| `assets-report.md` | `TheGameHour-v2/` | Legacy image KEEP/OPTIMIZE/REMOVE audit | No | Yes |
| `ASSET_MIGRATION_REPORT.md` | `TheGameHour-v2/` | Asset migration from legacy paths | No | Yes |
| `ASSET_STRUCTURE_REPORT.md` | `TheGameHour-v2/` | Final asset folder structure report | No | Yes |
| `IMAGE_OPTIMIZATION_REPORT.md` | `TheGameHour-v2/` | WebP optimization and size savings | No | Yes |
| **Page & feature implementation reports** |
| `HOMEPAGE_DECISIONS.md` | `TheGameHour-v2/` | Homepage section decisions log | No | Yes |
| `HOMEPAGE_SHOWCASE_REVIEW.md` | `TheGameHour-v2/` | Homepage showcase layout review | No | No |
| `ABOUT_PAGE_DECISIONS.md` | `TheGameHour-v2/` | About page content/structure decisions | No | Yes |
| `GALLERY_PAGE_DECISIONS.md` | `TheGameHour-v2/` | Gallery page decisions log | No | No |
| `SERVICE_ARCHITECTURE.md` | `TheGameHour-v2/` | Service routes and data layer architecture | No | Yes |
| `SERVICE_PAGE_REPORT.md` | `TheGameHour-v2/` | Service detail page implementation report | No | Yes |
| `SERVICES_PAGE_REDESIGN.md` | `TheGameHour-v2/` | Services index page redesign (removed later) | No | Yes |
| `SERVICES_PAGE_REMOVAL.md` | `TheGameHour-v2/` | Removal of standalone `/services` index | No | No |
| `SERVICES_LAYOUT_AUDIT.md` | `TheGameHour-v2/` | `/services` layout width audit (obsolete route) | No | No |
| `LAYOUT_SYSTEM_AUDIT.md` | `TheGameHour-v2/` | Layout width profiles and container system | Yes | No |
| `FLOATING_CTA_POLISH.md` | `TheGameHour-v2/` | Floating actions + sticky CTA polish report | No | No |
| `SOCIAL_HIERARCHY_UPDATE.md` | `TheGameHour-v2/` | Social channel hierarchy (Facebook secondary) | No | No |
| `PREMIUM_POLISH_REPORT.md` | `TheGameHour-v2/` | Premium polish audit and roadmap | No | Yes |
| `PREMIUM_POLISH_IMPLEMENTATION.md` | `TheGameHour-v2/` | Premium polish sprint completion report | No | No |
| **Meta & setup** |
| `SETUP_HEALTH_REPORT.md` | `TheGameHour-v2/` | Early scaffold health check (Vite, deps, placeholders) | No | Yes |
| `CONTENT_LAYER_HEALTH.md` | `TheGameHour-v2/` | Content JSON layer status snapshot | No | Yes |
| `CONTENT_CLEANUP_REPORT.md` | `TheGameHour-v2/` | Em/en dash cleanup meta-report | No | Yes |

---

## Unreferenced documentation (no incoming links from other project docs)

These files are not linked from any other project-owned `.md` file. They may still be valuable operationally.

| File | Notes |
|------|-------|
| `CMS_DEPLOYMENT_CHECKLIST.md` | Critical for deploy; should be linked from README |
| `CMS_USABILITY_REPORT.md` | Recent; links outward only |
| `SEO_IMPLEMENTATION_REPORT.md` | Completion report; no backlinks |
| `PRE_LAUNCH_QA_REPORT.md` | Point-in-time QA |
| `CONTRAST_SYSTEM_REPORT.md` | Theme audit |
| `CORAL_THEME_EVALUATION.md` | Rejected theme branch |
| `SOFT_UI_REVAMP.md` | Implementation notes |
| `IMAGE_INTERACTION_GUIDELINES.md` | Should link from CONTENT_MANAGEMENT_GUIDE |
| `GALLERY_PAGE_DECISIONS.md` | Historical decisions |
| `HOMEPAGE_SHOWCASE_REVIEW.md` | Historical review |
| `SERVICES_LAYOUT_AUDIT.md` | Obsolete ( `/services` index removed) |
| `SERVICES_PAGE_REMOVAL.md` | Recent; not yet cross-linked |
| `FLOATING_CTA_POLISH.md` | Recent implementation report |
| `SOCIAL_HIERARCHY_UPDATE.md` | Contradicts current code (Facebook removed) |
| `PREMIUM_POLISH_IMPLEMENTATION.md` | Links outward only |
| `LAYOUT_SYSTEM_AUDIT.md` | Referenced by code, not docs |

---

## node_modules (excluded from cleanup)

224 markdown files under `TheGameHour-v2/node_modules/` are third-party package documentation. **Do not move, archive, or delete.** They are managed by npm and excluded from this cleanup plan.

---

## Parent repository note

`TheGameHour/SKILL.md` lives one level above the v2 app. It is an agent skill file, not a project report. Keep at repo root or symlink from `docs/design/` — do not archive with phase reports.
