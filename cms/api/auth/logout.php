<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

cms_logout();
cms_json_response(['ok' => true, 'user' => null]);
