# Kyrith Builds — Deployment Audit

**Audit date:** 2026-05-23  
**Project audited:** `d:\Dell\Coding\KyrithBuilds`  
**Live site:** https://kyrithbuilds.com  
**GitHub:** https://github.com/kyrithbuilds/kyrith (`main` branch)

---

## Executive summary

Kyrith Builds uses **automated deployment**: push to `main` triggers **GitHub Actions**, which builds the Vite SPA and uploads to cPanel **`public_html`** via **lftp + explicit FTPS (port 21)**. A **manual zip fallback** exists for emergencies.

The Game Hour v2 currently has **no equivalent automation** — deployment is **manual** (`npm run build` → upload `dist/` via cPanel/FTP).

---

## Audit answers

| # | Question | Answer |
|---|----------|--------|
| 1 | Is GitHub connected to hosting? | **Yes, indirectly** — GitHub Actions connects to cPanel over **FTPS** using repository secrets. There is no native cPanel “Git deployment” hook; the link is the workflow. |
| 2 | Is there a GitHub Actions workflow? | **Yes** — `.github/workflows/deploy-ftp.yml` (deploy) and `.github/workflows/ci.yml` (build-only on PR/push). |
| 3 | Is FTP deployment configured? | **Yes** — explicit FTPS on port 21 via **lftp**; secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. |
| 4 | Is there a deployment script? | **Yes** — CI: `deploy-ftp.yml`; local fallback: `npm run pack-upload` → `scripts/package-for-hosting.mjs` → `kyrithbuilds-upload.zip`. |
| 5 | Is deployment manual? | **Primary: automatic** on `git push origin main`. **Fallback: manual** zip upload to cPanel File Manager. |
| 6 | Where are credentials stored? | **GitHub Actions Secrets** (FTP). **Server-only:** `public_html/api/config.local.php` (SendGrid, not in git). **Local-only:** `backend/api/config.local.php` (gitignored, included in manual zip only). |
| 7 | How is production updated when code is pushed? | Push to **`main`** → Actions runs `npm ci` + `npm run build` → lftp mirrors `dist/` to `public_html/` and `deploy-api/` to `public_html/api/` → HTTP health checks on `/` and `/contact`. |

---

## Deployment method

**Type:** CI/CD via GitHub Actions + FTPS file sync (not SSH, not cPanel Git pull, not rsync).

```text
Developer push to main
        │
        ▼
GitHub Actions (ubuntu-latest, Node 20)
  • npm ci
  • npm run build  →  dist/
  • stage deploy-api/ from backend/api/
  • lftp explicit FTPS
        │
        ├── dist/        ──mirror -R --delete──►  public_html/
        │                                              (excludes api/, config.local.php, logs/, uploads/)
        │
        └── deploy-api/  ──mirror -R (no delete)──►  public_html/api/
                                                       (preserves config.local.php on server)
        │
        ▼
Post-deploy curl checks (home + /contact)
        │
        ▼
https://kyrithbuilds.com
```

| Layer | Technology | Deployed to |
|-------|------------|-------------|
| Frontend | React 19, Vite 8, Tailwind 4 (SPA) | `public_html/` (contents of `dist/`) |
| Contact API | PHP (`backend/api/contact.php`) | `public_html/api/` |
| Email config | `config.local.php` | **Server only** — never uploaded by CI |
| Routing | Apache `.htaccess` | Copied from `public/` into `dist/` |

---

## Tools used

| Tool | Role |
|------|------|
| **GitHub Actions** | CI/CD runner |
| **Node.js 20** | Build environment |
| **Vite** | Production build → `dist/` |
| **lftp** | FTPS upload (`mirror -R`) |
| **cPanel** | Hosting, FTP account, `public_html` docroot |
| **Apache** | SPA fallback + API `.htaccess` |
| **curl** | Post-deploy health checks |
| **archiver** (npm) | Manual `kyrithbuilds-upload.zip` |
| **FileZilla** | Documented for credential verification |

**Removed / not used:** `SamKirkland/FTP-Deploy-Action` (replaced by lftp due to `530` login failures).

---

## Required credentials

### GitHub Actions secrets

Configure at: **GitHub repo → Settings → Secrets and variables → Actions → Secrets**

| Secret | Example | Notes |
|--------|---------|--------|
| `FTP_SERVER` | `ftp.kyrithbuilds.com` | Hostname only — **no** `ftp://` |
| `FTP_USERNAME` | `githubdeploy@kyrithbuilds.com` | Dedicated deploy FTP user |
| `FTP_PASSWORD` | *(account password)* | Must match FileZilla login |

Secrets are **never** committed to the repository or printed in workflow logs.

### GitHub Actions variables (optional)

| Variable | Recommended | Default if unset |
|----------|-------------|------------------|
| `FTP_SITE_DIR` | `.` | `.` (FTP user chrooted to `public_html`) |
| `DEPLOY_URL` | `https://kyrithbuilds.com` | `https://kyrithbuilds.com` |

**Important:** If the FTP account’s home **is already** `public_html`, set `FTP_SITE_DIR` to `.` — not `public_html` — or files land in `public_html/public_html/`.

### cPanel FTP account (one-time)

| Setting | Value |
|---------|--------|
| Host | `ftp.kyrithbuilds.com` |
| Port | **21** |
| Encryption | **Explicit FTP over TLS** |
| Remote directory | **`public_html`** (FTP user jailed to docroot) |
| Username | e.g. `githubdeploy@kyrithbuilds.com` |

### Server-only (not in GitHub, not deployed by CI)

| File | Purpose |
|------|---------|
| `public_html/api/config.local.php` | SendGrid API key, mail settings for contact form |

Created manually on server or via **`npm run pack-upload`** zip (includes local gitignored copy).

---

## Deployment steps

### Automatic (primary)

1. Commit changes on **`main`**
2. `git push origin main`
3. Open **GitHub → Actions → Deploy FTP**
4. Wait for green run (build + lftp + health checks)

**Manual re-run without code change:** Actions → Deploy FTP → **Run workflow** → branch `main`.

### What the workflow does (step-by-step)

1. Validate `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` exist  
2. Checkout code, install Node 20, `npm ci`, `npm run build`  
3. Copy API files to `deploy-api/` (`contact.php`, `.htaccess`, `config.local.example.php`)  
4. Install `lftp` on runner  
5. FTPS session:
   - `rm -rf assets` on server (avoid stale hashed bundles)
   - Mirror `dist/` → site root with `--delete` (excludes `api/`, secrets, logs, uploads)
   - Mirror `deploy-api/` → `api/` **without** `--delete` (preserves `config.local.php`)
6. curl `DEPLOY_URL/` and `DEPLOY_URL/contact` — body must contain `KyrithBuilds`  
7. Write job summary  

**Concurrency:** one deploy at a time (`cancel-in-progress: true`).

### Manual fallback (zip)

When Actions is unavailable or deploying `config.local.php` from local machine:

```bash
npm run pack-upload
```

1. Produces **`kyrithbuilds-upload.zip`** (`dist/` + `api/` including local `config.local.php` if present)  
2. cPanel File Manager → **`public_html`**  
3. Upload zip → **Extract** (overwrite)  
4. Test https://kyrithbuilds.com and `/contact` form  

### Rollback

**Preferred:** `git revert` bad commit → `git push origin main` (triggers redeploy of last good build).

**Emergency:** checkout good commit locally → `npm run pack-upload` → upload zip.

---

## CI-only workflow (no deploy)

**File:** `.github/workflows/ci.yml`  
**Trigger:** Push or PR to `main`  
**Steps:** `npm ci` + `npm run build` — **no FTP upload**

---

## Protected / never overwritten on server

| Path | Reason |
|------|--------|
| `public_html/api/config.local.php` | SendGrid secrets |
| `.env`, `.env.*` | Environment secrets |
| `logs/`, `uploads/`, `mail/` | Runtime data |
| `*.log` | Logs |

API mirror uses **no `--delete`** so production-only files in `api/` survive deploys.

---

## Can the same setup be reused for The Game Hour?

| Aspect | Kyrith Builds | The Game Hour v2 | Reusable? |
|--------|---------------|------------------|-----------|
| Hosting | cPanel / Apache / `public_html` | Same (documented) | **Yes** |
| Frontend | Vite SPA → `dist/` | Vite SPA → `dist/` | **Yes** |
| GitHub Actions FTPS | `deploy-ftp.yml` | **Not configured** | **Adapt workflow** |
| PHP backend | `public_html/api/` (contact) | `public_html/cms/` + `uploads/` | **Partial** — extra paths |
| Server secrets | `api/config.local.php` | `cms/config.php` + MySQL | **Different** — CMS config must stay server-only |
| Build output | `dist/` only | `dist/` includes `cms/`, `uploads/` | **Yes** with exclude tweaks |
| Health checks | `/`, `/contact` | `/`, `/admin/login.php`, `/cms/api/images.php` | **Customize** |
| Manual deploy | Zip + cPanel | [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md) | **Same pattern** |

### Recommendation for The Game Hour

**Yes, the Kyrith pipeline can be reused as a template** with these changes:

1. **Copy** `.github/workflows/deploy-ftp.yml` and adjust:
   - `DEPLOY_URL` → `https://thegamehour.com`
   - Health checks → homepage + `/cms/api/images.php` (JSON 200)
   - **Do not** `--delete` or overwrite `cms/config.php`, `uploads/*` (mirror excludes like Kyrith’s API config)
   - Optionally **do not** `--delete` entire `cms/` if uploads live there — TGH uses site-root `uploads/`; exclude `uploads/**` from delete (already in Kyrith excludes)

2. **Create** a dedicated FTP user on TGH cPanel jailed to `public_html` (same as Kyrith’s `githubdeploy@` pattern).

3. **Add GitHub secrets** on the TGH repository: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

4. **One-time server setup** remains manual (not in CI):
   - MySQL + `cms/config.php` (see [DEPLOYMENT_RUNBOOK.md](../DEPLOYMENT_RUNBOOK.md))
   - Writable `uploads/` permissions

5. **Add** `npm run pack-upload` equivalent for TGH (optional) — zip `dist/` for manual cPanel upload including `cms/` but excluding local `config.php`.

6. **Initialize git + GitHub** for TheGameHour-v2 if not already done (no `.git` detected in workspace at audit time).

### What TGH should not copy blindly

| Kyrith behavior | TGH consideration |
|-----------------|---------------------|
| `rm -rf assets` before mirror | OK — same hashed-bundle issue |
| `mirror --delete` on frontend | OK for SPA — **exclude** `cms/config.php`, `uploads/**`, `cms/uploads/**` |
| API deploy to `public_html/api/` | TGH uses `cms/` at root — single mirror of `dist/` may suffice |
| No CMS / MySQL in CI | TGH CMS DB setup stays manual per runbook |

---

## Comparison summary

| | Kyrith Builds | The Game Hour v2 |
|---|---------------|------------------|
| **Deployment method** | GitHub Actions + lftp FTPS | Manual (documented runbook) |
| **Trigger** | Push to `main` | Human uploads `dist/` |
| **Credentials** | GitHub Secrets | cPanel login / FTP (not in repo) |
| **Build command** | `npm run build` | `npm run build` (+ copies CMS to `dist/`) |
| **Automation** | Fully automated | None in repository |

---

## Source files (Kyrith Builds)

| File | Purpose |
|------|---------|
| `.github/workflows/deploy-ftp.yml` | Production deploy workflow |
| `.github/workflows/ci.yml` | Build-only CI |
| `.github/DEPLOYMENT.md` | Authoritative deployment documentation |
| `scripts/package-for-hosting.mjs` | Manual zip packager |
| `README.md` | Quick deploy reference |
| `.github/deploy/ftp-exclude-*.txt` | Exclude patterns (reference) |

---

## Related The Game Hour docs

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_RUNBOOK.md](../DEPLOYMENT_RUNBOOK.md) | TGH manual launch checklist |
| [deployment/CMS_DEPLOYMENT_CHECKLIST.md](../deployment/CMS_DEPLOYMENT_CHECKLIST.md) | CMS + MySQL server setup |
| [HANDBOOK.md](../HANDBOOK.md) | Post-launch operations |

---

*Audit based on local KyrithBuilds repository and `.github/DEPLOYMENT.md`. Git remote confirmed: `origin` → `github.com/kyrithbuilds/kyrith`, branch `main`.*
