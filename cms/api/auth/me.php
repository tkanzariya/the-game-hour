<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

if (!cms_dev_json_enabled()) {
    cms_ops_migrate_if_needed();
}

cms_json_response(cms_session_user_payload());
