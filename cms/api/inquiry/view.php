<?php
declare(strict_types=1);

/**
 * Public: what a customer sees when they open their private games link.
 * The unguessable token is the only credential; nothing else about the business is exposed.
 */

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-inquiries.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

try {
    $rec = cms_inq_find_by_token(trim((string) ($_GET['token'] ?? '')));
    if ($rec === null) {
        cms_json_response(['ok' => false, 'error' => 'This link is not valid.', 'code' => 'not_found'], 404);
    }

    $status = cms_inq_status($rec);
    if ($status === 'pending') {
        // First open: remember it so the admin can see the customer has looked.
        $rec['opened_at'] = cms_inq_fmt(cms_inq_now());
        $rec = cms_inq_put($rec);
    }

    if ($status === 'expired') {
        cms_json_response([
            'ok' => true,
            'inquiry' => [
                'customer_name' => $rec['customer_name'],
                'status' => 'expired',
                'expires_at' => cms_inq_iso($rec['expires_at']),
                'server_time' => gmdate('c'),
                'games' => [],
                'selected_ids' => [],
            ],
        ]);
    }

    cms_json_response(['ok' => true, 'inquiry' => cms_inq_customer_view($rec)]);
} catch (Throwable $e) {
    cms_json_response(['ok' => false, 'error' => 'Something went wrong. Please try again.'], 500);
}
