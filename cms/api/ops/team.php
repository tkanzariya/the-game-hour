<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-store.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

cms_ops_require_json_admin();
cms_json_response(['ok' => true, 'team' => cms_ops_list_team()]);
