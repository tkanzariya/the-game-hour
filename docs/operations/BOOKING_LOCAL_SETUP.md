# Local Booking Forms + Events DB

Bookings live on this site at `/book/social` and `/book/corporate` (`/book` redirects to social). Bubble CTAs are unchanged until you flip [`src/data/content/booking-links.json`](src/data/content/booking-links.json).

## Prerequisites

- **PHP 8.1+** — `npm run cms:dev` looks on PATH, then `%LOCALAPPDATA%\Programs\php83\php.exe`, XAMPP, and Laragon. `php -v` is not required.
- **Node.js 20+**
- For MySQL mode: credentials in `cms/config.local.php` (see [BOOKING_LOCAL_SETUP.md](./BOOKING_LOCAL_SETUP.md))

## Run locally (JSON mode — no MySQL, no live deploy)

Use this for ops UI, validation, and booking form work.

```powershell
npm run local
```

That starts PHP on `http://127.0.0.1:8765` and Vite on `http://localhost:5173`. Open:

- http://localhost:5173/ops/login — events list + edit
- http://localhost:5173/book/social
- http://localhost:5173/book/corporate

Sign in with `devadmin` / `dev123`. Saves go to gitignored `cms/dev-data/bookings.json`.

If Vite is already running, only start the API:

```powershell
npm run cms:dev
```

`cms:dev` creates `cms/config.local.php` from `cms/config.dev.sample.php` when missing, and seeds dummy events/games/team from `cms/data/ops-dummy.json` when `bookings.json` does not exist. Your existing `bookings.json` is left alone.

Stay on **localhost:5173** (Vite proxies `/cms`). Do not sign in on port 8765 for the React app — cookies will not match.

## Two terminals (optional)

```powershell
# Terminal A — PHP API (finds PHP even if it is not on PATH)
npm run cms:dev

# Terminal B — Vite
npm run dev
```


## MySQL (production-style)

1. Copy [`cms/config.sample.php`](cms/config.sample.php) → `cms/config.local.php` (or use production values without the `dev.json_store` key).
2. Fill `db.host`, `db.name`, `db.user`, `db.pass` from cPanel → **MySQL® Databases** (or copy from live `config.php` on the server).
3. Import [`cms/sql/migrate-events.sql`](cms/sql/migrate-events.sql) and [`cms/sql/migrate-ops.sql`](cms/sql/migrate-ops.sql) in phpMyAdmin **or** let the API create tables on first ops/booking request (needs `CREATE TABLE` privilege).
4. Restart `npm run cms:dev` (or deploy CMS) and submit a test booking — confirm a row in `events`.

## Operations workspace

- URL: http://localhost:5173/ops/login (needs `npm run local` or `cms:dev` + Vite)
- Local JSON mode: `devadmin` / `dev123`. Events, games, and team come from `cms/dev-data/bookings.json` (seeded from `cms/data/ops-dummy.json` if missing).
- Live MySQL: first admin user is copied from `cms/config.php` into the `users` table. Then sign in at `/ops/login`.
- Historical Bubble CSV import is **not run yet**. When fuller exports arrive, see expected columns in [`cms/tools/import-bubble.php`](../../cms/tools/import-bubble.php) and run it from the command line.

## Payment bank details

### Where to find credentials

| Item | Where |
|------|--------|
| Database name | cPanel → MySQL Databases → Current Databases (left sidebar in phpMyAdmin) |
| Username / password | cPanel → MySQL Databases → Current Users |
| Host on server | Usually `localhost` |
| Remote from your PC | cPanel → Remote MySQL → add your public IP; host may be your domain or a hostname shown in cPanel |

Never commit `cms/config.local.php` or `cms/config.php` (gitignored).

## Payment bank details

Configured in [`src/data/content/booking-form.json`](src/data/content/booking-form.json). Confirm account number / IFSC with the business if Bubble screenshots disagreed.

## Flip site CTAs (when ready)

Point `urls.default` / `urls.corporate` in `booking-links.json` to `/book/social` and `/book/corporate` (same-origin paths, not Bubble).
