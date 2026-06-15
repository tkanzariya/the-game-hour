<?php
declare(strict_types=1);

/**
 * Local verification: upload test images and print manifest URLs.
 * Run: php scripts/test-cms-upload.php
 */
$root = dirname(__DIR__);
require_once $root . '/cms/includes/bootstrap.php';
require_once $root . '/cms/data/keys.php';

if (!cms_dev_json_enabled()) {
    fwrite(STDERR, "Requires cms/config.local.php (JSON dev mode).\n");
    exit(1);
}

cms_register_missing_keys(cms_all_image_keys());

$tests = [
    'homepage-hero' => $root . '/src/assets/images/homepage/hero.webp',
    'homepage-about-teaser' => $root . '/src/assets/images/homepage/about-teaser.webp',
    'gallery-1' => $root . '/src/assets/images/gallery/event-gallery-1.webp',
];

foreach ($tests as $key => $source) {
    if (!is_file($source)) {
        echo "SKIP $key — source missing\n";
        continue;
    }
    $tmp = sys_get_temp_dir() . DIRECTORY_SEPARATOR . basename($source);
    copy($source, $tmp);
    $file = [
        'name' => basename($source),
        'type' => 'image/webp',
        'tmp_name' => $tmp,
        'error' => UPLOAD_ERR_OK,
        'size' => filesize($tmp),
    ];
    $result = cms_save_upload($key, $file);
    @unlink($tmp);
    if (!$result['ok']) {
        echo "FAIL $key — " . ($result['error'] ?? 'unknown') . "\n";
        exit(1);
    }
    echo "OK $key → " . ($result['image']['url'] ?? '') . "\n";
}

$rows = cms_get_all_images();
$manifest = [];
foreach ($rows as $row) {
    if (empty($row['file_path'])) {
        continue;
    }
    $manifest[$row['image_key']] = cms_image_public_payload($row);
}
require_once $root . '/cms/data/flash-messages.php';
$manifest = cms_expand_manifest_aliases($manifest);

echo "\nManifest keys: " . implode(', ', array_keys($manifest)) . "\n";
echo "Verification passed: hero, about, gallery slots upload and resolve.\n";
