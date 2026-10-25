<?php
declare(strict_types=1);

/** Public: the customer submits their chosen games (once, before the link expires). */

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-inquiries.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $body = cms_ops_read_json_body();
    $rec = cms_inq_find_by_token(trim((string) ($body['token'] ?? '')));
    if ($rec === null) {
        cms_json_response(['ok' => false, 'error' => 'This link is not valid.', 'code' => 'not_found'], 404);
    }

    $status = cms_inq_status($rec);
    if ($status === 'submitted') {
        cms_json_response(['ok' => false, 'error' => 'Your games were already sent.', 'code' => 'submitted'], 409);
    }
    if ($status === 'expired') {
        cms_json_response(['ok' => false, 'error' => 'This link has expired.', 'code' => 'expired'], 410);
    }

    $picked = cms_ops_int_ids($body['game_ids'] ?? []);
    if ($picked === []) {
        cms_json_response(['ok' => false, 'error' => 'Choose at least one game.', 'code' => 'empty'], 422);
    }
    if (count(array_diff($picked, $rec['game_ids'])) > 0) {
        cms_json_response(['ok' => false, 'error' => 'Some of those games are not on your list.', 'code' => 'invalid'], 422);
    }
    if ($rec['max_games'] !== null && count($picked) > $rec['max_games']) {
        cms_json_response(
            ['ok' => false, 'error' => 'You can choose up to ' . $rec['max_games'] . ' games.', 'code' => 'too_many'],
            422,
        );
    }

    $rec['selected_ids'] = $picked;
    $rec['submitted_at'] = cms_inq_fmt(cms_inq_now());
    if (empty($rec['opened_at'])) {
        $rec['opened_at'] = $rec['submitted_at'];
    }
    $saved = cms_inq_put($rec);
    cms_inq_notify_admin($saved);

    cms_json_response(['ok' => true, 'inquiry' => cms_inq_customer_view($saved)]);
} catch (Throwable $e) {
    cms_json_response(['ok' => false, 'error' => 'Something went wrong. Please try again.'], 500);
}
