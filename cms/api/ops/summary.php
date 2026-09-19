<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

try {
    require_once __DIR__ . '/../../includes/ops-store.php';
} catch (Throwable $e) {
    cms_json_response([
        'ok' => false,
        'error' => 'Could not load summary.',
    ], 500);
}

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

cms_ops_require_json_admin();

try {
    $period = (string) ($_GET['period'] ?? 'all');
    cms_json_response(['ok' => true, 'summary' => cms_ops_summary($period)]);
} catch (Throwable $e) {
    cms_json_response([
        'ok' => false,
        'error' => 'Could not load summary.',
    ], 500);
}
