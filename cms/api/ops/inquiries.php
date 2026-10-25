<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-inquiries.php';

header('Cache-Control: no-store');

cms_ops_require_json_admin();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$id = trim((string) ($_GET['id'] ?? ''));
$action = trim((string) ($_GET['action'] ?? ''));

try {
    $gamesById = cms_inq_games_by_id();

    if ($method === 'GET') {
        if ($id !== '') {
            $rec = cms_inq_find($id);
            if ($rec === null) {
                cms_json_response(['ok' => false, 'error' => 'Inquiry not found.'], 404);
            }
            cms_json_response(['ok' => true, 'inquiry' => cms_inq_admin_view($rec, $gamesById, true)]);
        }
        $list = [];
        foreach (cms_inq_all() as $rec) {
            $list[] = cms_inq_admin_view($rec, $gamesById, false);
        }
        cms_json_response(['ok' => true, 'inquiries' => $list]);
    }

    if ($method === 'DELETE') {
        cms_ops_verify_json_csrf();
        if ($id === '' || !cms_inq_remove($id)) {
            cms_json_response(['ok' => false, 'error' => 'Inquiry not found.'], 404);
        }
        cms_json_response(['ok' => true]);
    }

    if ($method !== 'POST') {
        cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    }

    cms_ops_verify_json_csrf();
    $body = cms_ops_read_json_body();
    $now = cms_inq_now();

    // Expire now / extend / reopen: all act on an existing inquiry.
    if ($action !== '') {
        $rec = $id !== '' ? cms_inq_find($id) : null;
        if ($rec === null) {
            cms_json_response(['ok' => false, 'error' => 'Inquiry not found.'], 404);
        }
        if ($action === 'expire') {
            $rec['expires_at'] = cms_inq_fmt($now);
        } elseif ($action === 'extend' || $action === 'reopen') {
            $minutes = $body['minutes'] ?? null;
            if (!is_numeric($minutes) || (int) $minutes < CMS_INQ_MIN_EXPIRY_MINUTES || (int) $minutes > CMS_INQ_MAX_EXPIRY_MINUTES) {
                cms_json_response(['ok' => false, 'error' => 'Choose how long to extend the link.'], 422);
            }
            if ($action === 'reopen') {
                // Let the customer change their picks: clear the submission, keep what they chose.
                $rec['submitted_at'] = null;
                $rec['expires_at'] = cms_inq_fmt($now + (int) $minutes * 60);
            } else {
                $current = cms_inq_ts((string) $rec['expires_at']) ?? $now;
                $rec['expires_at'] = cms_inq_fmt(max($now, $current) + (int) $minutes * 60);
            }
        } else {
            cms_json_response(['ok' => false, 'error' => 'Unknown action.'], 400);
        }
        $saved = cms_inq_put($rec);
        cms_json_response(['ok' => true, 'inquiry' => cms_inq_admin_view($saved, $gamesById, true)]);
    }

    $creating = $id === '';
    $checked = cms_inq_validate($body, $creating);
    if (!$checked['ok']) {
        cms_json_response(['ok' => false, 'error' => 'Check the highlighted fields.', 'errors' => $checked['errors']], 422);
    }
    $data = $checked['data'];

    if ($creating) {
        $rec = [
            'id' => 0,
            'token' => bin2hex(random_bytes(16)),
            'created_at' => cms_inq_fmt($now),
            'expires_at' => cms_inq_fmt($now + (int) $data['expiry_minutes'] * 60),
            'opened_at' => null,
            'submitted_at' => null,
            'selected_ids' => [],
        ];
    } else {
        $rec = cms_inq_find($id);
        if ($rec === null) {
            cms_json_response(['ok' => false, 'error' => 'Inquiry not found.'], 404);
        }
    }
    foreach (['customer_name', 'customer_phone', 'event_type', 'age_groups', 'participants', 'max_games', 'game_ids'] as $field) {
        $rec[$field] = $data[$field];
    }

    $saved = cms_inq_put($rec);
    cms_json_response(
        ['ok' => true, 'inquiry' => cms_inq_admin_view($saved, $gamesById, true)],
        $creating ? 201 : 200,
    );
} catch (Throwable $e) {
    cms_json_response(['ok' => false, 'error' => 'Could not complete that. Please try again.'], 500);
}
