<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/bubble-import.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

cms_ops_require_json_admin();
cms_ops_verify_json_csrf();

$games = $_FILES['games'] ?? null;
$team = $_FILES['team'] ?? null;
$events = $_FILES['events'] ?? null;
foreach (['games' => $games, 'team' => $team, 'events' => $events] as $label => $file) {
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || empty($file['tmp_name'])) {
        cms_json_response(['ok' => false, 'error' => 'Upload three CSV files: games, team, and events.'], 422);
    }
}

try {
    $data = cms_bubble_load_from_paths(
        (string) $games['tmp_name'],
        (string) $team['tmp_name'],
        (string) $events['tmp_name'],
    );
    if (cms_dev_json_enabled()) {
        $stats = cms_bubble_apply_json($data);
        $target = 'json';
    } else {
        $stats = cms_bubble_apply_pdo(cms_db(), $data);
        $target = 'mysql';
    }
} catch (Throwable $e) {
    cms_json_response(['ok' => false, 'error' => 'Import failed: ' . $e->getMessage()], 500);
}

cms_json_response([
    'ok' => true,
    'target' => $target,
    'imported' => $stats,
    'warnings' => $data['warnings'],
]);
