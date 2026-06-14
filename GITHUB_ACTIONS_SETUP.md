# GitHub Actions Setup — The Game Hour v2

**Workflow file:** `.github/workflows/deploy-ftp.yml`  
**Reference architecture:** [Kyrith Builds](https://github.com/kyrithbuilds/kyrith) (`deploy-ftp.yml`)  
**Repository:** https://github.com/tkanzariya/the-game-hour

---

## Deployment flow

```text
GitHub push (main)
        │
        ▼
GitHub Actions (ubuntu-latest, Node 20)
  • Validate FTP secrets
  • npm ci
  • npm run build  →  dist/  (includes cms/, uploads scaffold)
  • lftp explicit FTPS (port 21)
        │
        ▼
public_html/  (cPanel docroot)
        │
        ▼
Post-deploy: homepage HTTP 200 check
        │
        ▼
Actions job summary report
```

---

## Secrets to create

Add these in **GitHub → Repository → Settings → Secrets and variables → Actions → Secrets**.

| Secret | Example value | Notes |
|--------|---------------|-------|
| `FTP_SERVER` | `ftp.thegamehour.com` | Hostname only — no `ftp://` prefix |
| `FTP_USERNAME` | `githubdeploy@thegamehour.com` | Dedicated FTP user jailed to `public_html` |
| `FTP_PASSWORD` | *(from cPanel)* | Never commit; rotate if exposed |

**Do not** hardcode credentials in the workflow or repository.

### Recommended cPanel FTP user

1. cPanel → **FTP Accounts** → create user (e.g. `githubdeploy@thegamehour.com`)
2. Set home directory to **`public_html`** (or a subfolder if using chroot)
3. Use a strong password stored only in GitHub Secrets

---

## Optional repository variables

**Settings → Secrets and variables → Actions → Variables**

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEPLOY_URL` | `https://thegamehour.com` | Homepage URL for health check |
| `FTP_SITE_DIR` | `.` | Remote directory after FTP login. Use `.` when the FTP account lands in `public_html` already |

---

## Workflow behavior

### Triggers

| Event | When it runs |
|-------|--------------|
| **Push to `main`** | Automatic deploy after every merge/push |
| **`workflow_dispatch`** | Manual deploy from **Actions → Deploy FTP → Run workflow** |

### Concurrency

Only one deploy runs at a time (`concurrency: deploy-ftp`). A new push cancels an in-progress deploy.

### Build steps

```bash
npm ci
npm run build
```

Build output is verified:

- `dist/index.html` exists
- `dist/assets/` exists (Vite hashed bundles)
- `dist/cms/` exists
- `dist/cms/config.php` does **not** exist (credentials stay server-only)

### Deploy steps (lftp)

- **Protocol:** Explicit FTPS on **port 21**
- **Source:** `dist/` contents
- **Target:** `public_html/` (or `FTP_SITE_DIR`)
- **Mode:** `mirror -R --delete` with exclusions

#### Hashed assets

Before mirror, the workflow runs `rm -rf assets` on the server so old Vite JS/CSS bundles are removed. Fresh `dist/assets/` is uploaded each deploy. This prevents `index.html` from referencing deleted hashed files.

#### Protected paths (never overwritten or deleted)

| Path | Reason |
|------|--------|
| `cms/config.php` | MySQL + admin credentials (server-only) |
| `uploads/**` | User-uploaded images at site root |
| `cms/uploads/**` | CMS upload directory (if used) |

Also excluded: `.env`, `.env.*`, `logs/**`

### Health check

After upload:

- **GET** `{DEPLOY_URL}/` — must return HTTP **200**

If the check fails, the workflow fails with a warning (upload already completed).

### Actions summary

Every run writes a **Deploy summary** to the job summary tab (commit, branch, target, health check result).

---

## One-time server setup (not in CI)

Complete before the first automated deploy:

1. MySQL database + `cms/config.php` on server ([CMS_DEPLOYMENT_CHECKLIST.md](docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md))
2. Writable `uploads/` directory
3. FTP account + GitHub Secrets configured
4. DNS pointing `thegamehour.com` to hosting

See [DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md) for the full manual checklist.

---

## Rollback process

### Option A — Redeploy a previous commit (recommended)

```bash
git revert HEAD          # or reset to a known-good SHA locally
git push origin main     # triggers automatic redeploy
```

Or in GitHub: **Actions → Deploy FTP → Run workflow** on a previous commit via branch/tag checkout workflow (manual revert push is simpler).

### Option B — Manual cPanel restore

1. cPanel → **File Manager** or restore from backup
2. Replace `public_html/` files from a known-good `dist/` zip
3. Do **not** overwrite `cms/config.php` or `uploads/**`

### Option C — Disable auto-deploy temporarily

Rename or disable `.github/workflows/deploy-ftp.yml` on a branch, or remove FTP secrets to fail fast at validation (upload will not run).

### After rollback

Verify https://thegamehour.com returns 200 and spot-check `/admin/login.php` if CMS is in use.

---

## Enabling deployment

The workflow is **created but inactive until pushed with secrets configured**.

1. Add GitHub Secrets (`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`)
2. Complete one-time server setup
3. Commit and push `.github/workflows/deploy-ftp.yml`:
   ```bash
   git add .github/workflows/deploy-ftp.yml GITHUB_ACTIONS_SETUP.md
   git commit -m "Add GitHub Actions FTPS deploy workflow"
   git push origin main
   ```
4. Watch **Actions** tab for the first run

**First push with secrets will deploy to production.** Test FTP credentials with FileZilla before enabling if unsure.

---

## Validation checklist (pre-push)

| Check | Command / action |
|-------|------------------|
| Workflow YAML present | `.github/workflows/deploy-ftp.yml` |
| Secrets configured | GitHub Settings → Secrets (3 required) |
| Local build (optional) | `npm ci && npm run build` |
| FTP login test | FileZilla → explicit FTPS, port 21, `ftp.thegamehour.com` |
| Server config exists | `cms/config.php` on server, not in git |

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [docs/operations/KYRITH_DEPLOYMENT_AUDIT.md](docs/operations/KYRITH_DEPLOYMENT_AUDIT.md) | Reference pipeline audit |
| [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md) | Manual launch checklist |
| [docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md](docs/deployment/CMS_DEPLOYMENT_CHECKLIST.md) | CMS + MySQL setup |
| [PRE_COMMIT_AUDIT.md](PRE_COMMIT_AUDIT.md) | Git ignore / secrets audit |

---

*Do not store FTP credentials in this file or in the repository.*
