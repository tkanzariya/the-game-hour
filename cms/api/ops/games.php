<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-games.php';

header('Cache-Control: no-store');

cms_ops_require_json_admin();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$id = trim((string) ($_GET['id'] ?? ''));

if ($method === 'GET') {
    cms_json_response(['ok' => true, 'games' => cms_ops_games_public_list()]);
}

if ($method === 'POST' || $method === 'PATCH') {
    cms_ops_verify_json_csrf();
    $checked = cms_ops_game_validate(cms_ops_read_json_body());
    if (!$checked['ok']) {
        cms_json_response(['ok' => false, 'error' => 'Check the highlighted fields.', 'errors' => $checked['errors']], 422);
    }
    $result = cms_ops_save_game($id !== '' ? $id : null, $checked['data']);
    if (!$result['ok']) {
        cms_json_response(['ok' => false, 'error' => $result['error']], $result['status'] ?? 422);
    }
    cms_json_response(['ok' => true, 'game' => $result['game']], $id !== '' ? 200 : 201);
}

if ($method === 'DELETE') {
    cms_ops_verify_json_csrf();
    if ($id === '') {
        cms_json_response(['ok' => false, 'error' => 'Missing game id.'], 400);
    }
    $result = cms_ops_delete_game($id);
    if (!$result['ok']) {
        cms_json_response(['ok' => false, 'error' => $result['error']], $result['status'] ?? 422);
    }
    cms_json_response(['ok' => true]);
}

cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
