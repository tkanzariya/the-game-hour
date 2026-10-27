<?php
/**
 * Copy to config.php and fill in cPanel MySQL credentials.
 * Never commit config.php with real passwords.
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'thegamehour_cms',
        'user' => 'thegamehour_cms',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        // Generate: php -r "echo password_hash('your-password', PASSWORD_DEFAULT);"
        'username' => 'admin',
        'password_hash' => '$2y$10$REPLACE_WITH_BCRYPT_HASH',
    ],
    'uploads' => [
        // Resolves to site-root /uploads (public_html/uploads on cPanel)
        'dir' => dirname(__DIR__) . '/uploads',
        'public_url' => '/uploads',
        'max_bytes' => 20 * 1024 * 1024, // 20 MB — compressed on save in a future release
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp'],
        'allowed_mimes' => [
            'image/jpeg',
            'image/png',
            'image/webp',
        ],
    ],
    'session' => [
        'name' => 'tgh_cms_session',
        'lifetime' => 3600 * 8,
    ],
    'mail' => [
        // Free Resend API (https://resend.com) — never commit the live key
        'resend_api_key' => '',
        // Optional: published Resend dashboard template id. Same free send quota.
        'resend_template_id' => '',
        'from' => 'The Game Hour <onboarding@resend.dev>',
    ],
    // Adds every new booking to a Google Calendar (see docs/operations/GOOGLE_CALENDAR_SETUP.md).
    // Leave this whole block out to keep calendar sync switched off.
    'google_calendar' => [
        'calendar_id' => 'thegamehourr@gmail.com',
        // Either point at the downloaded service-account JSON key (keep it OUTSIDE public_html)...
        'service_account_file' => '',
        // ...or paste the two values from that JSON file instead:
        'client_email' => '',
        'private_key' => '',
        'timezone' => 'Asia/Kolkata',
        // Bookings only have a start time, so events are this long (minutes).
        'default_duration_minutes' => 120,
    ],
];
