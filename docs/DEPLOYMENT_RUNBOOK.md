# Deployment Runbook

**Site:** The Game Hour (v2)  
**Audience:** Site owner or cPanel operator (minimal technical background)  
**Hosting:** Apache/cPanel + PHP + MySQL  

Use this checklist for a **first launch** or **full redeploy**. Work top to bottom; check each box before moving on.

Replace `YOUR-DOMAIN` with your live domain (e.g. `thegamehour.com`).

---

## Before you start

| You need | Notes |
|----------|--------|
| cPanel login | File Manager, MySQL, phpMyAdmin |
| FTP/File Manager access | Upload folder contents |
| A `dist/` folder | Ask your developer to run `npm run build` and send the **contents** of `dist/` |
| CMS admin password | Choose a strong password; developer can generate the hash (see Phase 4) |
| MySQL database name, user, password | Create in cPanel (Phase 3) |
| Production booking URLs | Bubble **production** links (not `version-test`) — confirm with your developer before launch |

**Important:** Upload **everything inside** `dist/`, not the `dist` folder itself. The site root should contain `index.html`, `.htaccess`, `assets/`, `cms/`, etc.

---

## Phase 1 — Upload the website

### 1.1 Upload files

- [ ] Log in to cPanel → **File Manager**
- [ ] Open `public_html/` (or your site document root)
- [ ] Upload **all files and folders** from `dist/`:
  - [ ] `index.html`
  - [ ] `.htaccess` (enable “Show Hidden Files” if you do not see it)
  - [ ] `assets/` folder
  - [ ] `cms/` folder
  - [ ] `uploads/` folder
  - [ ] `robots.txt`
  - [ ] `sitemap.xml`
  - [ ] `og/` folder (if present)

### 1.2 Confirm upload

- [ ] Visit `https://YOUR-DOMAIN/` — homepage loads (not a blank page or directory listing)
- [ ] Visit `https://YOUR-DOMAIN/about` — About page loads (not 404)
- [ ] If inner pages show 404, `.htaccess` is missing or Apache rewrite is off — contact your host

---

## Phase 2 — Image CMS (database)

### 2.1 Create MySQL database

- [ ] cPanel → **MySQL Databases**
- [ ] Create a new database (note the full name, e.g. `youruser_tgh_cms`)
- [ ] Create a MySQL user with a strong password
- [ ] Add the user to the database with **ALL PRIVILEGES**

### 2.2 Import CMS tables

- [ ] Open **phpMyAdmin**
- [ ] Select your new database
- [ ] Click **Import**
- [ ] Choose file: `public_html/cms/sql/schema.sql`
- [ ] Run import — confirm success (creates the `images` table)

---

## Phase 3 — Image CMS (configuration)

### 3.1 Create config file

- [ ] In File Manager, go to `public_html/cms/`
- [ ] Copy `config.sample.php` → rename copy to `config.php`
- [ ] Edit `config.php` and fill in:

| Setting | What to enter |
|---------|----------------|
| `db.host` | Usually `localhost` on cPanel |
| `db.name` | Your database name |
| `db.user` | Your MySQL username |
| `db.pass` | Your MySQL password |
| `admin.username` | Your chosen CMS login name |
| `admin.password_hash` | See step 3.2 |

### 3.2 Set CMS admin password

Ask your developer to run (once, on any computer with PHP):

```bash
php cms/tools/hash-password.php "YourSecurePassword"
```

- [ ] Paste the output into `admin.password_hash` in `config.php`
- [ ] Save the file
- [ ] Store your plain password in a password manager (it cannot be recovered from the hash)

### 3.3 Set folder permissions

- [ ] `public_html/uploads/` → permission **755** (use **775** only if uploads fail)
- [ ] `public_html/cms/config.php` → permission **640**

---

## Phase 4 — CMS verification

### 4.1 API check

- [ ] Open in browser: `https://YOUR-DOMAIN/cms/api/images.php`
- [ ] **Pass:** Page shows JSON like `{"generated_at":"…","count":0,"images":{}}`
- [ ] **Fail:** Message about “CMS not configured” → fix `config.php`
- [ ] **Fail:** “CMS unavailable” → check MySQL credentials

### 4.2 Admin login

- [ ] Open: `https://YOUR-DOMAIN/admin/login.php`
- [ ] Sign in with your CMS username and password
- [ ] **Pass:** Image library opens with a list of image slots (~85 after first login)
- [ ] **Pass:** Page styling looks correct (not unstyled plain HTML)

### 4.3 Test upload

- [ ] In library, filter **Homepage**
- [ ] Find **Homepage Hero Banner** → click **Upload** or **Replace**
- [ ] Upload a JPG, PNG, or WEBP under 5 MB
- [ ] **Pass:** Success message returns to library
- [ ] Open `https://YOUR-DOMAIN/` in a **private/incognito** window
- [ ] **Pass:** New hero image appears
- [ ] Optional: click **Delete** on test image to restore default

### 4.4 Security quick check

- [ ] Open `https://YOUR-DOMAIN/admin/library.php` while logged out → redirects to login
- [ ] Log out from CMS when finished testing

---

## Phase 5 — Launch content checks

Complete these **before** announcing the site. Ask your developer to update files and rebuild if anything is wrong.

### 5.1 Booking links (critical)

- [ ] Click **Book** on the homepage → opens your **production** booking form (not a “version-test” URL)
- [ ] Open **Corporate Games** service page → Book button uses the **corporate** booking URL
- [ ] Test on mobile: floating Book button works

### 5.2 Contact and social

- [ ] Footer phone number clicks to dial correctly
- [ ] Footer email opens mail client
- [ ] Instagram and LinkedIn links open correct profiles

### 5.3 Content spot check

- [ ] Home, About, Gallery, Contact pages read correctly (no placeholder lorem text)
- [ ] Open two service pages from the menu — images and text load
- [ ] Invalid URL test: `https://YOUR-DOMAIN/services/not-real` → friendly “not found” page (not a broken layout)

---

## Phase 6 — Site smoke test

Test on **desktop** and **phone**. Use Chrome or Safari.

### 6.1 Pages

| Page | URL | Pass |
|------|-----|:----:|
| Home | `/` | [ ] |
| About | `/about` | [ ] |
| Gallery | `/gallery` | [ ] |
| Contact | `/contact` | [ ] |
| Birthday Games | `/services/birthday-games` | [ ] |
| Corporate Games | `/services/corporate-games` | [ ] |

### 6.2 Navigation

- [ ] Top menu links work on all pages
- [ ] Footer links work
- [ ] Logo returns to homepage
- [ ] “Experiences” / service links on homepage work

### 6.3 Forms and CTAs

- [ ] WhatsApp button opens WhatsApp with correct number
- [ ] All Book buttons open booking in a new tab
- [ ] No button is dead or links to `#`

### 6.4 Performance and visuals

- [ ] Images load (no large broken-image icons)
- [ ] Site usable on phone (no horizontal scroll on main pages)
- [ ] HTTPS padlock shows in browser (SSL enabled)

---

## Phase 7 — SEO verification

### 7.1 Files accessible

Open each URL in your browser — each should load (not 404):

- [ ] `https://YOUR-DOMAIN/robots.txt`
- [ ] `https://YOUR-DOMAIN/sitemap.xml`

### 7.2 Homepage metadata (view page source)

On `https://YOUR-DOMAIN/`, right-click → **View Page Source** (or Ctrl+U):

- [ ] One `<title>` tag with your site name
- [ ] `<meta name="description" …>` present
- [ ] `<link rel="canonical" href="https://YOUR-DOMAIN/" …>` present
- [ ] `<meta property="og:image" …>` present

Repeat on **About**, **Gallery**, and **one service page** — each should have its own title and canonical URL.

### 7.3 Social sharing preview

- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — enter `https://YOUR-DOMAIN/` → Scrape → no errors for `og:image`
- [ ] Test one service URL the same way
- [ ] Optional: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) for the homepage

### 7.4 Google Search Console (after launch)

- [ ] Add property for `https://YOUR-DOMAIN` in [Google Search Console](https://search.google.com/search-console)
- [ ] Submit sitemap: `https://YOUR-DOMAIN/sitemap.xml`
- [ ] Use **URL Inspection** on homepage → confirm Google can fetch the page

### 7.5 Structured data (optional but recommended)

- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) — test a service page URL
- [ ] **Pass:** FAQ structured data detected (if page has FAQs)

---

## Phase 8 — Analytics verification (Microsoft Clarity)

Clarity runs **only on the live production site** (not during local preview on a developer machine).

### 8.1 Confirm script loads

On the **live** site `https://YOUR-DOMAIN/`:

- [ ] Open browser **Developer Tools** (F12) → **Network** tab
- [ ] Refresh the page
- [ ] Filter by `clarity`
- [ ] **Pass:** A request to `clarity.ms/tag/x6t7glrd45` appears

*(If you are not comfortable with DevTools, skip to 8.2 — dashboard confirmation is enough.)*

### 8.2 Clarity dashboard

- [ ] Sign in at [https://clarity.microsoft.com/](https://clarity.microsoft.com/)
- [ ] Open project **x6t7glrd45**
- [ ] Browse 3–4 pages on your live site (Home → About → Gallery → a service)
- [ ] Wait **15–30 minutes**, refresh Clarity
- [ ] **Pass:** At least one session/recording appears

### 8.3 Privacy

- [ ] Privacy policy mentions analytics/session recording if required for your business

---

## Phase 9 — Go-live signoff

### Final checklist

- [ ] All Phase 1–8 boxes above checked
- [ ] CMS admin password stored securely
- [ ] CMS URL bookmarked: `https://YOUR-DOMAIN/admin/login.php`
- [ ] Developer contact noted for future rebuilds (`npm run build` → re-upload `dist/`)
- [ ] Old website (if any) redirects to new domain or is disabled

### Signoff

| Role | Name | Date |
|------|------|------|
| Deployed by | | |
| Content approved by | | |
| Go-live approved by | | |

---

## After launch — quick reference

| Task | How |
|------|-----|
| Change a photo | CMS → `https://YOUR-DOMAIN/admin/login.php` |
| Change phone, stats, testimonials | Ask developer to edit `src/data/content/` → rebuild → re-upload `dist/` |
| Change booking URL | `booking-links.json` → rebuild → re-upload |
| Redeploy site update | Upload new `dist/` contents (overwrite files; keep `cms/config.php` and `uploads/` images) |

**Day-to-day guide:** [HANDBOOK.md](HANDBOOK.md)  
**CMS detail:** [deployment/CMS_DEPLOYMENT_CHECKLIST.md](deployment/CMS_DEPLOYMENT_CHECKLIST.md)

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| Inner pages 404 | Confirm `.htaccess` is in site root; ask host to enable `mod_rewrite` |
| CMS login fails | Check `password_hash` in `config.php`; regenerate hash with developer |
| Upload fails | Set `uploads/` to 755 or 775; check disk quota in cPanel |
| Site works but CMS API 503 | Wrong MySQL password or database name in `config.php` |
| Booking goes to wrong site | Developer must update `booking-links.json` and redeploy |
| Clarity shows no data | Confirm you are testing the **live** HTTPS site, not localhost |
| Old images after CMS upload | Hard refresh (Ctrl+Shift+R) or test in incognito |

---

## When to call a developer

- First-time build (`npm run build`) before upload
- Changing text in JSON content files
- Swapping booking URLs in code
- SSL certificate not working
- Anything in this runbook fails after you retry the troubleshooting step
