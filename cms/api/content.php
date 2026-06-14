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

try {
    cms_load_content_store();
    cms_content_seed_if_empty();
    cms_json_response(cms_content_public_payload());
} catch (Throwable $e) {
    cms_json_response(['error' => 'CMS content unavailable'], 503);
}
