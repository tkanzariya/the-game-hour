# Website Improvement Plan

Tracks the work that follows the public-site audit of thegamehour.com (17 Nov 2026).
Update the checkboxes and the "Log" section as work lands, so a fresh session can pick up from here.

**Goal:** make the public site look professional (not template/AI-made), win trust, and rank for local searches,
without removing any of the key sections (hero, experiences, why us, stats, gallery, testimonials, how it works, final CTA).

**Rules for this work**

- Keep all eight home sections and all eight service pages.
- Never invent testimonials, client names, numbers or prices. Use only what the owner supplies.
- Public copy follows `docs/content/WRITING_STYLE_RULES.md`.
- Deploy is a push to `main` (`.github/workflows/deploy-ftp.yml`). Push only when the owner says so.

---

## Audit findings (what we are fixing)

### Trust

1. Live testimonials are placeholders. `src/data/content/testimonials.json` is marked
   `"source": "placeholder-content", "status": "draft"` (invented names such as "TechSolutions Pvt. Ltd.", "GEC College").
2. Internal brief text is visible to visitors:
   - Contact page, LinkedIn card: "Corporate credibility. Professional event expertise. Business trust."
   - About page: "That is where visual proof belongs."
   - Home testimonials: "OUTCOME: ..." labels and "Outcome-focused feedback".
3. No founder name or face, no client names or logos, no video, no price guidance.
4. Stats (50+ events, 3,000+ participants, 100+ games, 6 cities) are unverified. Owner to confirm.

### Search and sharing

5. Every URL returned the same empty 1 KB HTML shell (title "The Game Hour", no description).
   WhatsApp, Instagram, LinkedIn and AI crawlers do not run JavaScript, so they saw nothing.
6. Unknown URLs returned HTTP 200 (soft 404).
7. `http://` and `www.` did not redirect to `https://thegamehour.com`.
8. Hero photo is a 2.6 MB PNG and only starts loading after two API calls.
9. Page titles lack search terms ("Corporate Games | The Game Hour"). One slug is misspelled: `school-and-collage-event`.
10. Service pages are thin (about 500 words) and reuse the same FAQs.
11. No Google Business Profile check done yet. No public content beyond 12 pages.

### Look and feel

12. Every section is the same rounded white card with a centred heading, purple underline and a sparkle badge.
13. Everything fades in on scroll, leaving blank space; the mobile home page is about 14,000 px tall.
14. Slogan copy ("Unleash the fun", "unforgettable") instead of specifics.
15. Four competing contact buttons on one screen (nav Book, floating Book Now, WhatsApp, phone).

### Could not be checked

- Search volumes and Indian rankings (keyword data service returned a payment error; web search tool is US-only).
- Whether Google has indexed the site. Owner should check Google Search Console.

---

## Phase 1: SEO foundations

No owner input needed.

- [x] 1.1 Real HTML for each public page (build-time prerender: content, title, description, canonical, Open Graph, JSON-LD)
- [x] 1.2 Real 404 status for unknown URLs
- [x] 1.3 Redirects: `http` to `https`, `www` to bare domain, trailing slash, legacy URLs (server-side 301s)
- [x] 1.4 Keyword-led titles and descriptions for home, about, gallery, contact and the eight service pages
- [x] 1.5 Fix the `school-and-collage-event` slug (new slug + 301 from the old one)
- [x] 1.6 Hero text visible without JavaScript (no fade-in above the fold)
- [x] 1.7 Sitemap generated at build time from the route list
- [x] 1.8 Deploy and verify on live (status codes, redirects, WhatsApp link preview)
- [x] 1.9 Web-sized WebP copies of every CMS photo, made on first request (`/media/{key}-{width}.webp`, see
      `cms/includes/image-optimize.php` and `cms/api/img.php`). Covers existing uploads too, no re-upload needed.
      Originals are never changed.
- [x] 1.10 Home hero image is in the first HTML (`/media/homepage-hero-1600.webp`), so it downloads alongside the scripts
- [ ] 1.11 Owner: verify the site in Google Search Console and submit `sitemap.xml`
- [ ] 1.12 Owner: create or claim the Google Business Profile, add photos, ask past clients for reviews

## Phase 2: Trust and proof

Needs owner input (see "Owner to supply").

- [ ] 2.1 Replace placeholder testimonials with real ones, or hide the sections until they exist
- [ ] 2.2 Remove leaked brief text (contact LinkedIn card, about gallery invite, "OUTCOME" labels)
- [ ] 2.3 Founder/team block on About (name, photo, two lines)
- [ ] 2.4 Client names or logos strip (`src/data/content/client-logos.json` already exists)
- [ ] 2.5 Price guidance ("packages from ₹X") or a clear "what a quote includes" block
- [ ] 2.6 Confirm or correct the stats
- [ ] 2.7 Review schema: add `aggregateRating` only when real Google reviews exist

## Phase 3: Look and copy

- [ ] 3.1 Rewrite hero and section copy with specifics (games, crowd sizes, places) in the house style
- [ ] 3.2 Break the card sameness: vary section layouts, lead with large photos, drop sparkle badges
- [ ] 3.3 Cut scroll animations to at most the hero; no blank space while scrolling
- [ ] 3.4 Shorten the mobile home page (carousels or two-up grids for the eight experiences, tighter spacing)
- [ ] 3.5 One primary action per screen: decide between nav "Book" and floating "Book Now"; keep WhatsApp
- [ ] 3.6 Short event video in the hero or gallery, if the owner has one

## Phase 4: Content that ranks

- [ ] 4.1 Keyword research with real volumes (when a data source is available)
- [ ] 4.2 Deepen each service page: what happens, sample games, group sizes, duration, venue needs, service-specific FAQs
- [ ] 4.3 Public game library from the ops games catalogue (one page per game or per category)
- [ ] 4.4 City pages only where there is real proof (Ahmedabad first)
- [ ] 4.5 Guides: "team building games for employees", "haldi games for guests", "society festival game ideas"
- [ ] 4.6 Internal links between services, games and guides

### Keyword targets (judgment, not yet backed by data)

| Page | Primary | Secondary |
|------|---------|-----------|
| Home | event games organiser in Ahmedabad | screen-free games, game host Gujarat |
| Corporate | corporate team building games Ahmedabad | team building activities in Ahmedabad, employee engagement games |
| Birthday | birthday party games organiser Ahmedabad | game host for kids' birthday party |
| Wedding / Haldi | haldi games, sangeet games for guests | wedding games organiser Ahmedabad |
| Game festivals | society festival games | community event games Ahmedabad |
| School / College | school carnival games, college fest games | sports day games organiser |
| Social gatherings | family get-together games | kitty party games host |
| Traditional | traditional Indian games for events | old-school games |
| Bollywood | Bollywood theme party games | Bollywood game host |

Competitors seen for these searches: VenueLook and PartyOne (directories), Kreeda Tantra (local).

---

## Owner to supply

- Real testimonials (name, role or relation, city; WhatsApp screenshots are fine) and permission to publish
- Founder name, photo and a short story
- Client names or logos that may be shown
- Confirmation of the stats
- A starting price or price range, if it can be public
- Any event video

---

## How Phase 1 works (for whoever maintains it)

- `npm run build` now also runs `scripts/prerender.mjs`. It builds a server bundle from `src/entry-server.tsx`,
  renders each public route to HTML and writes:
  - `dist/index.html` (home, prerendered)
  - `dist/prerender/<path>.html` (other public pages)
  - `dist/404.html` (not-found page, served with status 404)
  - `dist/app.html` (the empty app shell, used by `/ops`, `/book`, `/choose-games`)
  - `dist/sitemap.xml`
- The page list is `prerenderPages` in `src/entry-server.tsx`. Add a public page there and it is prerendered,
  added to the sitemap and added to the clean-URL rule in `dist/.htaccess`.
- Public routes live in `src/public-routes.tsx` (shared by the browser router and the prerender).
- Titles and descriptions live in `src/lib/seo/page-meta.ts`.
- `public/.htaccess` maps clean URLs to those files and holds the redirects.
  `scripts/dev-router.php` mirrors the same rules for local testing. Change both together.
- The school page URL is now `/services/school-and-college-events`. The internal service slug is still
  `school-and-collage-event` because CMS image keys and asset folders use it (`SERVICE_URL_SLUGS` in `src/constants/routes.ts`).
- Local check of the built site: `php -S 127.0.0.1:8765 -t dist scripts/dev-router.php`.
- Not testable locally: the Apache rules themselves (no Apache here). After the first deploy check
  `https://`, `http://`, `www.`, `/about`, an unknown URL (must be 404) and `/ops`. The live server is nginx (Engintron)
  in front of Apache, so the `http` to `https` rule checks both `%{HTTPS}` and `X-Forwarded-Proto`.
- The browser hydrates the prerendered HTML (`src/main.tsx`), so the page behaves exactly as before once JavaScript loads.
- Text edited in the CMS appears after JavaScript loads; the static HTML carries the bundled text until the next deploy.

---

## Image copies (for whoever maintains it)

- `images.php` now returns `web_url` next to `url` for JPG, PNG and WEBP uploads. The site prefers `web_url`
  (`src/lib/cms-images.ts`); `url` (the original) stays for the admin screens.
- Widths allowed: 480, 800, 1200, 1600 (hero images 1600, everything else 1200). Copies are stored in `uploads/_web/`
  and rebuilt when the original is replaced. Quality 82, never enlarged, phone-photo rotation (EXIF) respected.
- If the server has no GD/WebP support, or an image is too big for PHP's memory limit, `web_url` is left out or
  `/media/...` redirects to the original, so pictures never break (they are just not smaller).
- The home hero uses a fixed address with no `?v=` so it can sit in the HTML. Browsers re-check it hourly,
  so a newly uploaded hero can take up to an hour to appear for returning visitors.
- Local test: `php -c <ini with extension=gd> -S 127.0.0.1:8765 -t dist scripts/dev-router.php`.

## Log

- 2026-11-17: Audit done. Plan written. Phase 1 items 1.1 to 1.7 implemented locally.
- 2026-11-21: Pushed as commit 1e6cd04 and verified on live: http and www redirect to https://thegamehour.com,
  trailing slash and old URLs 301, unknown URLs return 404, /ops, /book, /choose-games, /admin and /cms still work,
  sitemap lists 12 URLs, share-preview tags and page text are in the first HTML response.
  Next: 1.9 and 1.10 (hero image), then the owner tasks 1.11 and 1.12.
- 2026-11-21: Image copies and hero in first HTML built (1.9, 1.10). Tested locally: 1600 px WebP made from a 2400 px
  source, rotation correct, 304 on repeat requests, redirect to original without GD, bundled hero shown when no CMS hero.
