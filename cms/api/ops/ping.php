<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

header('Cache-Control: no-store');
cms_json_response(['ok' => true, 'pong' => true, 'php' => PHP_VERSION]);
