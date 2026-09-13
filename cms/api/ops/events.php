<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

try {
    require_once __DIR__ . '/../../includes/ops-store.php';
} catch (Throwable $e) {
    cms_json_response([
        'ok' => false,
        'error' => 'Could not load events.',
        'debug' => [
            'stage' => 'require-ops-store',
            'type' => get_class($e),
            'message' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => basename($e->getFile()),
        ],
    ], 500);
}

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

cms_ops_require_json_admin();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$id = trim((string) ($_GET['id'] ?? ''));

if ($method === 'GET' && $id !== '') {
    $event = cms_ops_get_event($id);
    if ($event === null) {
        cms_json_response(['ok' => false, 'error' => 'Event not found.'], 404);
    }
    cms_json_response(['ok' => true, 'event' => $event]);
}

if ($method === 'GET') {
    try {
        $events = cms_ops_list_events([
            'category' => (string) ($_GET['category'] ?? ''),
            'status' => (string) ($_GET['status'] ?? ''),
            'q' => (string) ($_GET['q'] ?? ''),
            'from' => (string) ($_GET['from'] ?? ''),
            'to' => (string) ($_GET['to'] ?? ''),
        ]);
        cms_json_response(['ok' => true, 'events' => $events]);
    } catch (Throwable $e) {
        cms_json_response([
            'ok' => false,
            'error' => 'Could not load events.',
            'debug' => [
                'stage' => 'list',
                'type' => get_class($e),
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile()),
            ],
        ], 500);
    }
}

if ($method === 'DELETE') {
    cms_ops_verify_json_csrf();
    if ($id === '') {
        cms_json_response(['ok' => false, 'error' => 'Missing event id.'], 400);
    }
    $result = cms_ops_delete_event($id);
    if (!$result['ok']) {
        cms_json_response(['ok' => false, 'error' => $result['error']], 422);
    }
    cms_json_response(['ok' => true]);
}

if ($method === 'PATCH' || $method === 'POST') {
    cms_ops_verify_json_csrf();
    if ($id === '') {
        cms_json_response(['ok' => false, 'error' => 'Missing event id.'], 400);
    }
    $result = cms_ops_update_event($id, cms_ops_read_json_body());
    if (!$result['ok']) {
        cms_json_response(['ok' => false, 'error' => $result['error']], 422);
    }
    cms_json_response(['ok' => true, 'event' => $result['event']]);
}

cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
