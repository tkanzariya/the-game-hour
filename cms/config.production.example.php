<?php
/**
 * PRODUCTION / cPanel config template.
 *
 * On the server:
 *   1. Copy this file to: public_html/cms/config.php
 *   2. Fill in the real password
 *   3. Do NOT enable the "dev" JSON block on the server
 *
 * Host stays "localhost" on cPanel — that is correct there.
 * Never commit config.php with a real password.
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'thegameh_tgh_cms',
        'user' => 'thegameh_csm_user',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        // Generate: php -r "echo password_hash('your-password', PASSWORD_DEFAULT);"
        'username' => 'admin',
        'password_hash' => '$2y$10$REPLACE_WITH_BCRYPT_HASH',
    ],
    'uploads' => [
        'dir' => dirname(__DIR__) . '/uploads',
        'public_url' => '/uploads',
        'max_bytes' => 20 * 1024 * 1024,
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
        'resend_api_key' => '',
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
