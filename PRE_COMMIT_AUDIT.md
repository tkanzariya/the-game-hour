# Pre-Commit Audit — The Game Hour v2

**Audit date:** 2026-05-23  
**Project path:** `d:\Dell\Coding\TheGameHour\TheGameHour-v2`  
**Purpose:** Verify the repository is ready for its first commit and first push to GitHub.

---

## Executive summary

The repository is **ready for its first commit**. Branch is `main`, remote `origin` points to GitHub, and **487 files** are staged (~**48.2 MB** uncompressed). No secrets, credentials, build artifacts, or ignored paths were found in the staging area. **No commit or push has been performed.**

**Verdict:** Safe to proceed with `git commit` followed by `git push -u origin main` after you review this report.

---

## Repository configuration

| Item | Value |
|------|-------|
| Branch | `main` |
| Commits | **0** (not committed yet) |
| Remote name | `origin` |
| Fetch URL | `https://github.com/tkanzariya/the-game-hour.git` |
| Push URL | `https://github.com/tkanzariya/the-game-hour.git` |
| Remote HEAD | Unknown (empty GitHub repo or not yet pushed) |

### Remote verification

```
origin  https://github.com/tkanzariya/the-game-hour.git (fetch)
origin  https://github.com/tkanzariya/the-game-hour.git (push)
```

Both fetch and push URLs match the requested repository.

---

## Staging summary

| Metric | Value |
|--------|------:|
| **Total files staged** | **487** |
| Lines added (git stat) | 29,781 |
| Uncompressed size (working tree) | **~48.23 MB** |
| Image assets staged | 198 |
| Files over 1 MB | 5 |

### Staged files by directory

| Directory | Files |
|-----------|------:|
| `src/` | 373 |
| `archive/` | 34 |
| `docs/` | 22 |
| `public/` | 20 |
| `cms/` | 18 |
| `(root)` | 14 |
| `scripts/` | 6 |

### Not staged (this audit report)

| File | Status |
|------|--------|
| `PRE_COMMIT_AUDIT.md` | **Untracked** — created after staging; add before commit if you want it in the repo |

---

## Largest files that will be committed

Top 20 by file size (uncompressed):

| Size | Path |
|-----:|------|
| 1.66 MB | `src/assets/images/services/wedding-or-haldi-games/title-card.png` |
| 1.38 MB | `src/assets/images/services/school-and-collage-event/gallery-2.png` |
| 1.18 MB | `src/assets/images/services/game-festival/gallery-4.png` |
| 1.07 MB | `src/assets/images/services/corporate-games/slider-1.png` |
| 1.04 MB | `src/assets/images/services/social-gathering-games/gallery-4.png` |
| 901 KB | `src/assets/images/gallery/gallery-hero.jpg` |
| 853 KB | `src/assets/images/services/game-festival/title-card.png` |
| 828 KB | `src/assets/images/services/traditional-games/title-card.png` |
| 693 KB | `src/assets/images/services/social-gathering-games/title-card.png` |
| 627 KB | `src/assets/images/services/traditional-games/slider-2.jpg` |
| 620 KB | `src/assets/images/services/school-and-collage-event/title-card.png` |
| 610 KB | `src/assets/images/gallery/gallery-hero.webp` |
| 592 KB | `src/assets/images/services/corporate-games/gallery-2.jpg` |
| 592 KB | `src/assets/images/gallery/event-gallery-2.jpg` |
| 582 KB | `src/assets/images/homepage/strategy-games.jpg` |
| 572 KB | `src/assets/images/services/corporate-games/title-card.png` |
| 531 KB | `src/assets/images/services/birthday-games/title-card.png` |
| 491 KB | `src/assets/images/services/traditional-games/slider-2.webp` |
| 480 KB | `src/assets/images/services/traditional-games/slider-1.webp` |
| 470 KB | `src/assets/images/services/traditional-games/slider-1.jpg` |

Also notable:

| Size | Path | Notes |
|-----:|------|-------|
| ~131 KB | `package-lock.json` | Normal for npm lockfile |
| ~131 KB | (largest non-image code files are markdown/docs) | No oversized source files |

**Note:** Five PNG title-card/gallery images exceed 1 MB. These are intentional site assets, not secrets or build output. Consider future image optimization (optional, not blocking).

---

## Expected first commit size

| Measure | Estimate |
|---------|----------|
| Working tree (487 files) | **~48.2 MB** uncompressed |
| Git pack (after commit) | **~45–50 MB** (similar; binary images compress modestly) |
| GitHub soft limit | 100 MB per file — **no file exceeds this** |
| GitHub repo warning threshold | 50 MB per file — **none exceeded** |

The first push will upload the full project history (one commit). Clone/download size will be similar to the working tree minus ignored folders.

---

## Files that should NOT be committed — audit result

Scanned the **487 staged paths** for forbidden patterns:

| Pattern | Staged matches | Status |
|---------|---------------:|--------|
| `node_modules/` | 0 | **Clear** |
| `dist/` | 0 | **Clear** |
| `cms/config.php` | 0 | **Clear** |
| `.env` / `.env.*` | 0 | **Clear** |
| User uploads (`uploads/*.jpg`, etc.) | 0 | **Clear** |
| `cms/uploads/*` (except scaffold) | 0 | **Clear** |

### Correctly excluded (present on disk, not staged)

| Path | Approx. files | Reason |
|------|--------------:|--------|
| `node_modules/` | ~7,216 | `.gitignore` |
| `dist/` | 186 | `.gitignore` |
| `cms/config.php` | 0 (absent) | `.gitignore` + not created |
| `.env*` | 0 (absent) | `.gitignore` |

### Intentionally staged (reviewed, safe)

| Path | Why it is OK |
|------|--------------|
| `cms/config.sample.php` | Placeholder credentials only (`CHANGE_ME`) |
| `cms/uploads/.gitkeep`, `.htaccess` | Scaffold only, no user images |
| `cms/tools/hash-password.php` | CLI utility; stores no secrets |
| `src/assets/images/**` | Public marketing images (198 files) |

**No files were found in the staging area that should be removed before commit.**

---

## Secrets detected

| Severity | Finding | Location | Action |
|----------|---------|----------|--------|
| **None** | No real API keys, tokens, or password hashes | — | Proceed |
| Info | Placeholder DB password | `cms/config.sample.php` (`CHANGE_ME`) | Safe — template only |
| Info | Placeholder bcrypt hash | `cms/config.sample.php` (`REPLACE_WITH_BCRYPT_HASH`) | Safe — template only |
| Info | Public Clarity project ID | `src/lib/analytics/clarity.ts` (`x6t7glrd45`) | Safe — client-side analytics ID |
| Info | FTP secret **names** in docs | `docs/operations/KYRITH_DEPLOYMENT_AUDIT.md`, `GIT_STATUS_REPORT.md` | Documentation only; no values |
| Pre-launch | Bubble **version-test** URLs | `src/data/content/booking-links.json`, `src/data/services.json` | Not secrets — update URLs before production launch |

**No credentials, private keys, or real password hashes detected in staged files.**

---

## Actions completed vs pending

| Action | Status |
|--------|--------|
| Rename branch to `main` | **Done** |
| Add remote `origin` | **Done** |
| Verify remote configuration | **Done** |
| Stage all trackable files (`git add .`) | **Done** — 487 files |
| Generate `PRE_COMMIT_AUDIT.md` | **Done** |
| Initial commit | **Not done** (intentionally) |
| Push to GitHub | **Not done** (intentionally) |
| GitHub Actions | **Not created** (intentionally) |

---

## Recommended next commands

When you are ready:

```bash
cd TheGameHour-v2

# Optional: include this audit in the first commit
git add PRE_COMMIT_AUDIT.md

git commit -m "Initial commit: The Game Hour v2"

git push -u origin main
```

Ensure the GitHub repository `tkanzariya/the-game-hour` exists and you have push access (HTTPS credentials or SSH if you change the remote).

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [GIT_INIT_REPORT.md](GIT_INIT_REPORT.md) | Git initialization and `.gitignore` audit |
| [GIT_STATUS_REPORT.md](GIT_STATUS_REPORT.md) | Pre-init repository audit |
| [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md) | Manual deployment checklist |
| [docs/operations/KYRITH_DEPLOYMENT_AUDIT.md](docs/operations/KYRITH_DEPLOYMENT_AUDIT.md) | Future GitHub Actions template |

---

*Audit performed after `git branch -M main`, `git remote add origin`, and `git add .`. No commit or push executed.*
