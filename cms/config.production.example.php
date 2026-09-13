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
];
