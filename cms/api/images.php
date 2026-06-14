<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    cms_json_response(['error' => 'Method not allowed'], 405);
}

$key = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';

try {
    if ($key !== '') {
        $row = cms_get_image_by_key($key);
        if (!$row) {
            cms_json_response(['error' => 'Not found'], 404);
        }
        cms_json_response(cms_image_public_payload($row));
    }

    $category = isset($_GET['category']) ? trim((string) $_GET['category']) : null;
    $rows = cms_get_all_images($category ?: null);
    $manifest = [];
    foreach ($rows as $row) {
        if (empty($row['file_path'])) {
            continue;
        }
        $manifest[$row['image_key']] = cms_image_public_payload($row);
    }

    $manifest = cms_expand_manifest_aliases($manifest);

    cms_json_response([
        'generated_at' => gmdate('c'),
        'count' => count($manifest),
        'images' => $manifest,
    ]);
} catch (Throwable $e) {
    cms_json_response(['error' => 'CMS unavailable'], 503);
}
