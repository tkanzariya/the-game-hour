# Local Booking Forms + Events DB

Bookings live on this site at `/book` (social) and `/book/corporate` (corporate). Bubble CTAs are unchanged until you flip [`src/data/content/booking-links.json`](src/data/content/booking-links.json).

## Prerequisites

- **PHP 8.1+** on your PATH (`php -v`). On Windows, install XAMPP/Laragon or add PHP to PATH.
- **Node.js 20+**
- For MySQL mode: credentials in `cms/config.local.php` (see [BOOKING_LOCAL_SETUP.md](./BOOKING_LOCAL_SETUP.md))

## Run locally (JSON mode — no MySQL)

Good for UI + API smoke tests. Bookings are saved to `cms/dev-data/bookings.json`.

```powershell
# 1. One-time: local CMS config
copy cms\config.dev.sample.php cms\config.local.php

# 2. Terminal A — PHP API (port 8765)
npm run cms:dev

# 3. Terminal B — Vite (proxies /cms and /uploads to 8765)
npm run dev
```

Open:

- http://localhost:5173/book
- http://localhost:5173/book/corporate

Submit with a payment screenshot → check `cms/dev-data/bookings.json` and `cms/uploads/payment-screenshots/`.

## MySQL (production-style)

1. Copy [`cms/config.sample.php`](cms/config.sample.php) → `cms/config.local.php` (or use production values without the `dev.json_store` key).
2. Fill `db.host`, `db.name`, `db.user`, `db.pass` from cPanel → **MySQL® Databases** (or copy from live `config.php` on the server).
3. Import [`cms/sql/migrate-events.sql`](cms/sql/migrate-events.sql) in phpMyAdmin **or** let the API create the table on first booking (needs `CREATE TABLE` privilege).
4. Restart `npm run cms:dev` (or deploy CMS) and submit a test booking — confirm a row in `events`.

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

Point `urls.default` / `urls.corporate` in `booking-links.json` to `/book` and `/book/corporate` (same-origin paths, not Bubble).
