# Google Calendar sync: setup

Every new booking is added to the Game Hour Google Calendar (`thegamehourr@gmail.com`) as soon as the customer submits the form. The entry follows the event afterwards, and the app does the following:

| What happens in Ops | What happens on the calendar |
| --- | --- |
| Customer submits a booking | Event is created (title, time, venue, contact details, link back to Ops) |
| You edit date, time, venue, type, age group, participants, venue type or notes | The same calendar event is updated (never duplicated) |
| You set the status to **Cancelled** | The calendar event is removed |
| You set it back to Pending or Completed | The calendar event is added again |
| You delete the event | The calendar event is removed |
| Anything goes wrong with Google | The booking or edit still saves. Open the event and press **Add to Google Calendar** to retry. |

The event page in Ops shows whether an event is on the calendar and has an **Add to Google Calendar / Update Calendar** button.

**Existing events are not touched.** Past events and events already marked "added to calendar" by hand are left alone, so you will not get duplicates of what you added manually. Use the button on an event if you want it pushed anyway.

## What you need

A **service account**. An API key or an OAuth client secret is not used. A Google API key can only read public data and cannot create events on a private calendar, so you can ignore the ones you already have.

## One-time setup (about 10 minutes)

### 1. Create the service account
1. Open [console.cloud.google.com](https://console.cloud.google.com) signed in as `thegamehourr@gmail.com`.
2. Create a project (or choose an existing one).
3. **APIs & Services → Library → Google Calendar API → Enable.**
4. **IAM & Admin → Service Accounts → Create service account.** Give it any name (for example `tgh-calendar`). You can skip the optional role and user-access steps.
5. Open the new service account → **Keys → Add key → Create new key → JSON.** A `.json` file downloads. **This file is a password: do not email it, paste it in chat, or commit it to git.**

### 2. Share the calendar with it
1. Open [calendar.google.com](https://calendar.google.com) as `thegamehourr@gmail.com`.
2. Hover your calendar in the left list → **⋮ → Settings and sharing.**
3. **Share with specific people or groups → Add people and groups.**
4. Paste the service account's email. It is the `client_email` value in the JSON file and looks like `tgh-calendar@your-project.iam.gserviceaccount.com`.
5. Set the permission to **Make changes to events** and send.

### 3. Put the key on the server
Edit `cms/config.php` on the server (cPanel File Manager). This file is never overwritten by deployments. Add the block below to the array.

**Option A (recommended): keep the JSON file outside `public_html`**
```php
'google_calendar' => [
    'calendar_id' => 'thegamehourr@gmail.com',
    'service_account_file' => '/home/YOUR_CPANEL_USER/secrets/tgh-calendar.json',
],
```
Upload the JSON file to that path first. Do not upload it inside `public_html`.

**Option B: paste the two values from the JSON file**
```php
'google_calendar' => [
    'calendar_id' => 'thegamehourr@gmail.com',
    'client_email' => 'tgh-calendar@your-project.iam.gserviceaccount.com',
    'private_key' => "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
],
```
Keep the `\n` characters exactly as they appear in the JSON file.

Optional keys: `timezone` (default `Asia/Kolkata`) and `default_duration_minutes` (default `120`; bookings only have a start time, so this sets how long the calendar entry is).

### 4. Check that it works
1. In Ops, open any upcoming event → **Add to Google Calendar**.
2. You should see "Added to Google Calendar", and the event appears in the calendar a few seconds later.
3. Submit a test booking on `/book`. It should appear on the calendar by itself.

## If it doesn't work

Pressing **Add to Google Calendar** shows the reason. The usual ones:

| Message | Fix |
| --- | --- |
| "Google Calendar is not set up on the server yet." | The `google_calendar` block is missing, or `client_email`, `private_key` or `calendar_id` is empty. |
| "Google sign-in failed" | The key is wrong or was deleted, the Calendar API is not enabled, or the `\n` characters in `private_key` were damaged. Create a new key. |
| "Not Found" when creating | The calendar is not shared with the service account, or `calendar_id` is wrong. Redo step 2. |
| "Forbidden" / "Insufficient permission" | The share permission is lower than **Make changes to events**. |
| "The PHP openssl extension is required" | Ask the host to enable `openssl` and `curl` for PHP (cPanel: Select PHP Version → Extensions). |

Server-side details are written to the PHP error log with the prefix `[google-calendar]`.

## Security notes
- The service account can only reach calendars that were explicitly shared with it.
- If the JSON key is ever exposed, delete it in Google Cloud (**Service Accounts → Keys**) and create a new one.
- Customers never see the calendar entry. The description contains the customer's phone number and email, so share the calendar only with people who should see them.
