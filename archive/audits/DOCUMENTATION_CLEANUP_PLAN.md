# Documentation Cleanup Plan

**Audit date:** 2026-05-23  
**Status:** Plan only — **no files have been moved or deleted**  
**Scope:** 60 project-owned `.md` files (see `DOCUMENTATION_INVENTORY.md`)

---

## Executive summary

The `TheGameHour-v2/` root contains **59 markdown files** accumulated across audit, planning, and implementation phases. Only **3** are referenced by application code. **~35** are historical reports safe to archive. **~4** are clear duplicates suitable for deletion after archive confirmation.

**Recommended outcome:**

| Action | Count |
|--------|------:|
| **KEEP** (relocate to `docs/`) | 15 |
| **ARCHIVE** (move to `archive/`) | 40 |
| **DELETE** (after confirming duplicate) | 4 |
| **Unchanged location** | 2 (`README.md`, parent `SKILL.md`) |

---

## Task 2 — Classification

### KEEP (15 files)

Operational documentation needed after launch. Move from repo root into structured `docs/` folders.

| File | Target path | Rationale |
|------|-------------|-----------|
| `CONTENT_MANAGEMENT_GUIDE.md` | `docs/content/CONTENT_MANAGEMENT_GUIDE.md` | Primary editor/developer content guide |
| `WRITING_STYLE_RULES.md` | `docs/content/WRITING_STYLE_RULES.md` | Ongoing copy standards |
| `IMAGE_INTERACTION_GUIDELINES.md` | `docs/content/IMAGE_INTERACTION_GUIDELINES.md` | Image UX rules for editors |
| `IMAGE_CMS_ARCHITECTURE.md` | `docs/cms/IMAGE_CMS_ARCHITECTURE.md` | CMS system reference |
| `CMS_DEPLOYMENT_CHECKLIST.md` | `docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md` | Production deploy runbook |
| `SEO_AUDIT.md` | `docs/seo/SEO_AUDIT.md` | SEO maintenance reference (refresh post-launch) |
| `CLARITY_SETUP.md` | `docs/analytics/CLARITY_SETUP.md` | Clarity operational guide |
| `ANALYTICS_AUDIT.md` | `docs/analytics/ANALYTICS_AUDIT.md` | Analytics stack reference |
| `BOOKING_ROUTING_AUDIT.md` | `docs/operations/BOOKING_ROUTING_AUDIT.md` | Booking URL map (still actionable) |
| `ROUTE_INVENTORY.md` | `docs/operations/ROUTE_INVENTORY.md` | Route catalog (**needs refresh** — see Task 3) |
| `PROJECT_STRUCTURE.md` | `docs/operations/PROJECT_STRUCTURE.md` | Repo layout reference (**needs refresh**) |
| `LAYOUT_SYSTEM_AUDIT.md` | `docs/operations/LAYOUT_SYSTEM_AUDIT.md` | Layout profiles — **referenced by code** (`layout.ts`, `layout.css`) |
| `content-map.md` | `docs/content/content-map.md` | Copy provenance (soft-linked from JSON) |
| `components-map.md` | `docs/content/components-map.md` | UI pattern reference |
| `assets-report.md` | `docs/content/assets-report.md` | Image inventory reference |

**Stay in place (2):**

| File | Location | Rationale |
|------|----------|-----------|
| `README.md` | `TheGameHour-v2/README.md` | GitHub/repo entry — update to index `docs/` |
| `SKILL.md` | `TheGameHour/SKILL.md` | Agent skill; referenced by code comments |

---

### ARCHIVE (40 files)

Historical value only — implementation complete, superseded, or point-in-time audits. Move to `TheGameHour-v2/archive/` preserving filenames.

#### CMS pre-production reports (4)

| File | Reason |
|------|--------|
| `ADMIN_URL_FIX.md` | Implementation complete; details belong in git history |
| `IMAGE_LABELS_REPORT.md` | Implementation complete |
| `IMAGE_FILTERING_REPORT.md` | Implementation complete |
| `CMS_USABILITY_REPORT.md` | Pre-prod validation snapshot |

#### Launch, QA & site audits (6)

| File | Reason |
|------|--------|
| `WEBSITE_AUDIT_REPORT.md` | Baseline audit; launch tasks tracked elsewhere |
| `PRE_LAUNCH_QA_REPORT.md` | Point-in-time QA snapshot |
| `LAUNCH_EXECUTION_PLAN.md` | Phase plan; many items done or obsolete |
| `BROKEN_LINK_AUDIT.md` | Pre-`/services`-removal link audit |
| `TRUST_AUTHORITY_PLAN.md` | Strategy doc; largely implemented |
| `TRUST_STATS_UPDATE.md` | Stat update log |

#### SEO & analytics implementation (1)

| File | Reason |
|------|--------|
| `SEO_IMPLEMENTATION_REPORT.md` | Sprint completion report; keep `SEO_AUDIT.md` for ops |

#### Routing (1)

| File | Reason |
|------|--------|
| `ROUTE_AUDIT.md` | Superseded by `ROUTE_INVENTORY.md` |

#### Design system & theme (11)

| File | Reason |
|------|--------|
| `design-system.md` | Superseded by tokens + v2 report |
| `design-system-v2.md` | Superseded by `design-tokens.ts` as source of truth |
| `DESIGN_SYSTEM_REPORT.md` | Implementation report |
| `DESIGN_IMPLEMENTATION_REPORT.md` | Sprint report |
| `SKILL_ANALYSIS.md` | Design-phase analysis |
| `CONTRAST_SYSTEM_REPORT.md` | Theme audit |
| `PURPLE_THEME_REVIEW.md` | Theme decision log |
| `CORAL_THEME_EVALUATION.md` | Rejected theme branch |
| `SOFT_UI_REVAMP.md` | UI revamp notes |
| `NAVBAR_REFINEMENT.md` | Implementation report |
| `HERO_HIERARCHY_FIX.md` | Fix report |

#### Assets (3)

| File | Reason |
|------|--------|
| `ASSET_MIGRATION_REPORT.md` | Migration complete |
| `ASSET_STRUCTURE_REPORT.md` | Structure settled in repo |
| `IMAGE_OPTIMIZATION_REPORT.md` | Optimization sprint complete |

#### Page & feature reports (13)

| File | Reason |
|------|--------|
| `HOMEPAGE_DECISIONS.md` | Decisions implemented |
| `HOMEPAGE_SHOWCASE_REVIEW.md` | Review complete |
| `ABOUT_PAGE_DECISIONS.md` | Decisions implemented |
| `GALLERY_PAGE_DECISIONS.md` | Decisions implemented |
| `SERVICE_ARCHITECTURE.md` | Partially outdated (`ServicesPage` removed) |
| `SERVICE_PAGE_REPORT.md` | Implementation report |
| `SERVICES_PAGE_REDESIGN.md` | Obsolete — index page removed |
| `SERVICES_PAGE_REMOVAL.md` | Important history; archive not delete |
| `SERVICES_LAYOUT_AUDIT.md` | Obsolete route |
| `FLOATING_CTA_POLISH.md` | Polish sprint complete |
| `SOCIAL_HIERARCHY_UPDATE.md` | Outdated (Facebook removed from site) |
| `PREMIUM_POLISH_REPORT.md` | Audit roadmap |
| `PREMIUM_POLISH_IMPLEMENTATION.md` | Sprint complete |
| `CONTENT_CONSOLIDATION_REPORT.md` | Consolidation complete |
| `CONTENT_LAYER_HEALTH.md` | Point-in-time snapshot |
| `SETUP_HEALTH_REPORT.md` | Early scaffold snapshot |

**Note on `LAYOUT_SYSTEM_AUDIT.md`:** Code references `@see LAYOUT_SYSTEM_AUDIT.md` in `layout.ts` and `layout.css`. Either (a) move to `docs/operations/` and update `@see` paths, or (b) keep a stub pointer in root. Recommended: move to `docs/operations/` and update 2 code comments in a follow-up PR.

---

### DELETE (4 files)

Delete only after confirming content is fully duplicated elsewhere. **Do not archive** — remove from repo.

| File | Reason | Superseded by |
|------|--------|---------------|
| `CONTENT_CLEANUP_REPORT.md` | One-time dash-cleanup meta-report | `WRITING_STYLE_RULES.md` + git history |
| `ROUTE_AUDIT.md` | Duplicate route documentation | `ROUTE_INVENTORY.md` (refresh needed) |
| `ASSET_MIGRATION_REPORT.md` | Duplicate asset history | `ASSET_STRUCTURE_REPORT.md` (archive) + repo tree |
| `SERVICES_PAGE_REDESIGN.md` | Obsolete feature | `SERVICES_PAGE_REMOVAL.md` (archive) + current router |

**Do not delete** `SEO_IMPLEMENTATION_REPORT.md` or CMS usability reports — archive instead (unique sprint detail).

---

## Task 3 — Issues found

### Broken or stale references (documentation vs current code)

These docs describe a site state that no longer matches the codebase:

| Document | Stale content | Current state |
|----------|---------------|---------------|
| `ROUTE_INVENTORY.md` | `/services` index, `ServicesPage`, footer → `/services` | `/services` redirects to `/#experiences`; index removed |
| `ROUTE_AUDIT.md` | Same | Same |
| `BROKEN_LINK_AUDIT.md` | Footer → `/services`, invalid slug → `/services` | Invalid slug → branded 404; experiences on homepage |
| `SEO_AUDIT.md` | Sitemap includes `/services`, `ServicesPage` SEO | `/services` removed from sitemap |
| `SEO_IMPLEMENTATION_REPORT.md` | Lists `/services` canonical | Obsolete entry |
| `CLARITY_SETUP.md` | Lists `/services` as tracked page | Route removed |
| `PROJECT_STRUCTURE.md` | `ServicesPage` placeholder | Page deleted |
| `SERVICE_ARCHITECTURE.md` | `/services` → `ServicesPage` | Detail routes only |
| `CONTENT_LAYER_HEALTH.md` | References `ServicesPage.tsx` | File removed |
| `CONTENT_CONSOLIDATION_REPORT.md` | `ServicesPage` gallery invite | Page removed |
| `SOCIAL_HIERARCHY_UPDATE.md` | Facebook as secondary tier | Facebook removed from site |
| `PRE_LAUNCH_QA_REPORT.md` | `ServicesPage`, `/services/not-a-real-slug` redirect | Outdated routing |
| `LAUNCH_EXECUTION_PLAN.md` | Tasks for `/game-library`, preview routes | Partially done; needs refresh |
| `WEBSITE_AUDIT_REPORT.md` | `ServicesPageHero`, four hero implementations | Services index gone |
| `TRUST_AUTHORITY_PLAN.md` | Services index section | Obsolete section |
| `README.md` | Lists planning artifacts only; omits CMS, SEO, deploy docs | Incomplete index |
| `IMAGE_CMS_ARCHITECTURE.md` | Category format `Service · …` | Admin now uses plain category names |

### Dead documentation (zero inbound links, low ongoing value)

| File | Verdict |
|------|---------|
| `CORAL_THEME_EVALUATION.md` | Dead — rejected branch |
| `SERVICES_LAYOUT_AUDIT.md` | Dead — route removed |
| `HOMEPAGE_SHOWCASE_REVIEW.md` | Dead — review complete |
| `GALLERY_PAGE_DECISIONS.md` | Dead — decisions shipped |

### Duplicate documentation clusters

| Topic | Files | Recommendation |
|-------|-------|----------------|
| **Routes** | `ROUTE_AUDIT`, `ROUTE_INVENTORY`, `BROKEN_LINK_AUDIT` | Keep one refreshed inventory; archive others |
| **Design system** | `design-system`, `design-system-v2`, `DESIGN_SYSTEM_REPORT`, `DESIGN_IMPLEMENTATION_REPORT`, `SKILL_ANALYSIS` | Source of truth = `design-tokens.ts` + `SKILL.md`; archive all five |
| **Assets** | `assets-report`, `ASSET_MIGRATION`, `ASSET_STRUCTURE`, `IMAGE_OPTIMIZATION` | Keep `assets-report`; archive three reports |
| **SEO** | `SEO_AUDIT`, `SEO_IMPLEMENTATION_REPORT` | Keep audit (refresh); archive implementation report |
| **Premium polish** | `PREMIUM_POLISH_REPORT`, `PREMIUM_POLISH_IMPLEMENTATION` | Archive both |
| **Services hub** | `SERVICES_PAGE_REDESIGN`, `SERVICES_LAYOUT_AUDIT`, `SERVICES_PAGE_REMOVAL` | Archive all; delete redesign only |
| **CMS usability** | 4 recent reports + architecture + checklist | Keep architecture + checklist; archive 4 reports |
| **Trust** | `TRUST_AUTHORITY_PLAN`, `TRUST_STATS_UPDATE`, `CONTENT_CONSOLIDATION_REPORT` | Archive all; operational copy in JSON + content guide |

### Outdated but still useful (archive, do not delete)

| File | Why keep in archive |
|------|---------------------|
| `WEBSITE_AUDIT_REPORT.md` | Largest baseline; useful for regression comparison |
| `PRE_LAUNCH_QA_REPORT.md` | Booking URL blocker still relevant until fixed |
| `SERVICES_PAGE_REMOVAL.md` | Documents intentional architecture change |
| `LAUNCH_EXECUTION_PLAN.md` | Some open tasks may remain |

---

## Task 4 — Recommended structure

```
TheGameHour/
├── SKILL.md                              ← agent skill (unchanged)
└── TheGameHour-v2/
    ├── README.md                         ← slim index → docs/
    ├── docs/
    │   ├── README.md                     ← NEW: documentation map
    │   ├── deployment/
    │   │   └── CMS_DEPLOYMENT_CHECKLIST.md
    │   ├── cms/
    │   │   └── IMAGE_CMS_ARCHITECTURE.md
    │   ├── seo/
    │   │   └── SEO_AUDIT.md              ← refresh post-launch
    │   ├── analytics/
    │   │   ├── CLARITY_SETUP.md
    │   │   └── ANALYTICS_AUDIT.md
    │   ├── content/
    │   │   ├── CONTENT_MANAGEMENT_GUIDE.md
    │   │   ├── WRITING_STYLE_RULES.md
    │   │   ├── IMAGE_INTERACTION_GUIDELINES.md
    │   │   ├── content-map.md
    │   │   ├── components-map.md
    │   │   └── assets-report.md
    │   └── operations/
    │       ├── PROJECT_STRUCTURE.md      ← refresh
    │       ├── ROUTE_INVENTORY.md        ← refresh
    │       ├── LAYOUT_SYSTEM_AUDIT.md    ← code-referenced
    │       └── BOOKING_ROUTING_AUDIT.md
    └── archive/
        ├── README.md                     ← NEW: explains archive purpose + date
        ├── audits/                       ← WEBSITE_AUDIT, SEO_IMPLEMENTATION, etc.
        ├── implementation/               ← sprint reports (CMS, SEO, polish, CTA)
        ├── decisions/                    ← *_DECISIONS.md, theme reviews
        └── migrations/                   ← asset/service migration reports
```

### Optional consolidation (future, not required now)

Merge these four CMS reports into one `docs/cms/ADMIN_GUIDE.md`:

- `ADMIN_URL_FIX.md`
- `IMAGE_LABELS_REPORT.md`
- `IMAGE_FILTERING_REPORT.md`
- `CMS_USABILITY_REPORT.md`

---

## Task 5 — Action lists with totals

### Files to KEEP — 15

Relocate to `docs/` subfolders (paths listed in Task 2).

### Files to ARCHIVE — 40

```
ADMIN_URL_FIX.md
IMAGE_LABELS_REPORT.md
IMAGE_FILTERING_REPORT.md
CMS_USABILITY_REPORT.md
WEBSITE_AUDIT_REPORT.md
PRE_LAUNCH_QA_REPORT.md
LAUNCH_EXECUTION_PLAN.md
BROKEN_LINK_AUDIT.md
TRUST_AUTHORITY_PLAN.md
TRUST_STATS_UPDATE.md
SEO_IMPLEMENTATION_REPORT.md
design-system.md
design-system-v2.md
DESIGN_SYSTEM_REPORT.md
DESIGN_IMPLEMENTATION_REPORT.md
SKILL_ANALYSIS.md
CONTRAST_SYSTEM_REPORT.md
PURPLE_THEME_REVIEW.md
CORAL_THEME_EVALUATION.md
SOFT_UI_REVAMP.md
NAVBAR_REFINEMENT.md
HERO_HIERARCHY_FIX.md
ASSET_STRUCTURE_REPORT.md
IMAGE_OPTIMIZATION_REPORT.md
HOMEPAGE_DECISIONS.md
HOMEPAGE_SHOWCASE_REVIEW.md
ABOUT_PAGE_DECISIONS.md
GALLERY_PAGE_DECISIONS.md
SERVICE_ARCHITECTURE.md
SERVICE_PAGE_REPORT.md
SERVICES_PAGE_REMOVAL.md
SERVICES_LAYOUT_AUDIT.md
FLOATING_CTA_POLISH.md
SOCIAL_HIERARCHY_UPDATE.md
PREMIUM_POLISH_REPORT.md
PREMIUM_POLISH_IMPLEMENTATION.md
CONTENT_CONSOLIDATION_REPORT.md
CONTENT_LAYER_HEALTH.md
SETUP_HEALTH_REPORT.md
```

### Files to DELETE — 4

Pure duplicates — remove from repo (do not archive):

```
CONTENT_CLEANUP_REPORT.md
ROUTE_AUDIT.md
ASSET_MIGRATION_REPORT.md
SERVICES_PAGE_REDESIGN.md
```

### Unchanged — 2

```
TheGameHour-v2/README.md          (update content, keep location)
TheGameHour/SKILL.md
```

---

## Totals

| Category | Count |
|----------|------:|
| Total project-owned `.md` | 60 |
| KEEP (move to `docs/`) | 15 |
| ARCHIVE | 40 |
| DELETE | 4 |
| Unchanged location | 2 |
| node_modules (ignore) | 224 |

**After cleanup:** `TheGameHour-v2/` root holds **1** markdown file (`README.md`) plus `docs/` and `archive/` trees (plus these two audit artifacts until relocated).

---

## Recommended execution order

1. **Create folders** — `docs/{deployment,cms,seo,analytics,content,operations}`, `archive/{audits,implementation,decisions,migrations}`
2. **Add `docs/README.md`** — documentation index with links to all KEEP files
3. **Add `archive/README.md`** — “historical reports; may not match current code”
4. **Move KEEP files** → `docs/` (git mv preserves history)
5. **Move ARCHIVE files** → `archive/` subfolders by category
6. **Update `TheGameHour-v2/README.md`** — replace planning-artifacts table with `docs/` index
7. **Update code `@see` links** — `LAYOUT_SYSTEM_AUDIT.md` → `docs/operations/LAYOUT_SYSTEM_AUDIT.md` (if layout audit kept in docs instead of archive)
8. **Refresh stale KEEP docs** — priority: `ROUTE_INVENTORY.md`, `PROJECT_STRUCTURE.md`, `SEO_AUDIT.md`, `IMAGE_CMS_ARCHITECTURE.md`
9. **Delete 4 files** — only after archive confirmed
10. **Optional:** Add `.cursor/rules` or `AGENTS.md` pointer to `docs/` for future agents

---

## Post-cleanup validation checklist

- [ ] `README.md` links resolve (no broken relative paths)
- [ ] `src/constants/layout.ts` and `layout.css` `@see` paths updated if file moved
- [ ] No references to deleted files remain in KEEP docs
- [ ] `BOOKING_ROUTING_AUDIT.md` still documents current `booking-links.json` URLs
- [ ] `CMS_DEPLOYMENT_CHECKLIST.md` reflects admin URL hardening (`/admin/login.php`)
- [ ] Archive README warns that `/services` index docs are historical

---

## Related artifact

Full file-level inventory with code/doc reference flags: **`DOCUMENTATION_INVENTORY.md`**

**No files were moved, archived, or deleted as part of this audit.**
