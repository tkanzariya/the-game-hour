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
];
