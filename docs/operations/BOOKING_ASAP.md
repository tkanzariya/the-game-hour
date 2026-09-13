# Finish bookings ASAP (no hosting support / no remote MySQL)

You do **not** need Remote MySQL from your Windows PC. Use two tracks:

| Where | How bookings are stored |
|--------|-------------------------|
| **Your PC (today)** | JSON file — forms work now |
| **Live website (cPanel)** | MySQL `events` table — `localhost` works there |

---

## A) Test forms on your PC (now)

1. Install PHP if needed (Laragon/XAMPP), then in two terminals:

```powershell
npm run cms:dev
npm run dev
```

2. Open http://localhost:5173/book and submit a test booking with a screenshot.
3. Check `cms/dev-data/bookings.json` — if a new entry appears, the form works.

---

## B) Create the MySQL table (phpMyAdmin — 2 minutes, no support)

1. cPanel → **phpMyAdmin**
2. Click database **`thegameh_tgh_cms`** on the left
3. Click **Import** (top tabs)
4. Choose file: `cms/sql/migrate-events.sql` from this project on your computer
5. Click **Go**
6. Confirm table **`events`** appears in the left list

---

## C) Put MySQL on the live server (so real bookings save)

1. On the server, create/edit **`public_html/cms/config.php`**
2. Use [`cms/config.production.example.php`](../cms/config.production.example.php) as the template
3. Set `pass` to your real DB password
4. Keep `host` as **`localhost`**
5. Deploy the new site build (`npm run build` → upload `dist/` contents)
6. Test: open `https://yoursite.com/book`, submit once, then in phpMyAdmin open table `events` and confirm a new row

---

## Skip forever

- Remote MySQL / “Add Access Host” from your PC  
- Waiting for support for a remote hostname  

Those are only needed if you insist on connecting Windows → cPanel MySQL directly. The project does not need that.
