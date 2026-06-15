<?php
/**
 * Local CMS development config (no MySQL).
 *
 * Setup:
 *   copy cms/config.dev.sample.php cms/config.local.php
 *
 * Used automatically by scripts/dev-router.php when config.local.php exists.
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'unused',
        'user' => 'unused',
        'pass' => 'unused',
        'charset' => 'utf8mb4',
    ],
    'admin' => [
        'username' => 'devadmin',
        // password: dev123
        'password_hash' => '$2y$10$AOh9f3FPnaWvZRIarpE5sOauj.Ct5XVwtUETT/oNl8tiyK59tvSdy',
    ],
    'uploads' => [
        'dir' => __DIR__ . '/uploads',
        'public_url' => '/uploads',
        'max_bytes' => 20 * 1024 * 1024,
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'webp'],
        'allowed_mimes' => ['image/jpeg', 'image/png', 'image/webp'],
    ],
    'session' => [
        'name' => 'tgh_cms_dev',
        'lifetime' => 3600 * 8,
    ],
    'dev' => [
        'json_store' => __DIR__ . '/dev-data/images.json',
        'content_store' => __DIR__ . '/dev-data/content.json',
    ],
];
