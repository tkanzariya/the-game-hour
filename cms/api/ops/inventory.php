<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-inventory.php';

header('Cache-Control: no-store');

cms_ops_require_json_admin();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$resource = (string) ($_GET['resource'] ?? 'item');
$id = (int) ($_GET['id'] ?? 0);

function inv_fail(string $message, int $status, array $errors = []): void
{
    $payload = ['ok' => false, 'error' => $message];
    if ($errors !== []) {
        $payload['errors'] = $errors;
    }
    cms_json_response($payload, $status);
}

/** Send back the item's full page of data after a change. */
function inv_respond_item(int $itemId, int $status = 200): void
{
    $detail = cms_inv_detail($itemId);
    if ($detail === null) {
        inv_fail('Item not found.', 404);
    }
    cms_json_response(['ok' => true, 'item' => $detail], $status);
}

try {
    /* ------------------------------------------------------------- read */
    if ($method === 'GET') {
        if ($resource === 'invoice') {
            $purchase = $id > 0 ? cms_inv_find('purchases', $id) : null;
            $path = $purchase === null ? null : cms_inv_invoice_file($purchase['invoice_path']);
            if ($path === null) {
                http_response_code(404);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Invoice not found.';
                exit;
            }
            $types = ['pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $name = preg_replace('/[^A-Za-z0-9._ -]+/', '_', (string) ($purchase['invoice_name'] ?? basename($path))) ?: basename($path);
            header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
            header('Content-Length: ' . (string) filesize($path));
            header('X-Content-Type-Options: nosniff');
            header('Cache-Control: private, max-age=3600');
            header('Content-Disposition: ' . (isset($_GET['download']) ? 'attachment' : 'inline') . '; filename="' . $name . '"');
            readfile($path);
            exit;
        }
        if ($id > 0) {
            inv_respond_item($id);
        }
        cms_json_response(['ok' => true] + cms_inv_overview());
    }

    cms_ops_verify_json_csrf();

    /* ----------------------------------------------------------- delete */
    if ($method === 'DELETE') {
        if ($id <= 0) {
            inv_fail('Missing id.', 400);
        }
        if ($resource === 'item') {
            foreach (cms_inv_all('purchases') as $p) {
                if ($p['item_id'] === $id) {
                    cms_inv_delete_invoice_file($p['invoice_path']);
                }
            }
            if (!cms_inv_remove('items', $id)) {
                inv_fail('Item not found.', 404);
            }
            cms_json_response(['ok' => true]);
        }
        if ($resource === 'purchase') {
            $purchase = cms_inv_find('purchases', $id);
            if ($purchase === null) {
                inv_fail('Purchase not found.', 404);
            }
            if (cms_inv_stock_of($purchase['item_id'], -$purchase['quantity']) < 0) {
                inv_fail(
                    'You can’t delete this purchase because some of it has already been used or written off. Record a correction instead.',
                    422,
                );
            }
            cms_inv_remove('purchases', $id);
            cms_inv_delete_invoice_file($purchase['invoice_path']);
            inv_respond_item($purchase['item_id']);
        }
        if ($resource === 'adjustment') {
            $adjustment = cms_inv_find('adjustments', $id);
            if ($adjustment === null) {
                inv_fail('Entry not found.', 404);
            }
            if (cms_inv_stock_of($adjustment['item_id'], 0, -$adjustment['delta']) < 0) {
                inv_fail('Removing this entry would put the stock below zero.', 422);
            }
            cms_inv_remove('adjustments', $id);
            inv_respond_item($adjustment['item_id']);
        }
        inv_fail('Unknown resource.', 400);
    }

    if ($method !== 'POST') {
        inv_fail('Method not allowed', 405);
    }

    $body = cms_ops_read_json_body();

    /* ------------------------------------------------------------- item */
    if ($resource === 'item') {
        $checked = cms_inv_validate_item($body, $id);
        if (!$checked['ok']) {
            inv_fail('Check the highlighted fields.', 422, $checked['errors']);
        }
        if ($id > 0 && cms_inv_find('items', $id) === null) {
            inv_fail('Item not found.', 404);
        }
        $saved = cms_inv_put('items', ['id' => $id] + $checked['data']);
        inv_respond_item($saved['id'], $id > 0 ? 200 : 201);
    }

    /* --------------------------------------------------------- purchase */
    if ($resource === 'purchase') {
        $existing = $id > 0 ? cms_inv_find('purchases', $id) : null;
        if ($id > 0 && $existing === null) {
            inv_fail('Purchase not found.', 404);
        }
        $itemId = $existing !== null ? $existing['item_id'] : (int) ($body['item_id'] ?? 0);
        if (cms_inv_find('items', $itemId) === null) {
            inv_fail('Item not found.', 404);
        }
        $checked = cms_inv_validate_purchase($body);
        if (!$checked['ok']) {
            inv_fail('Check the highlighted fields.', 422, $checked['errors']);
        }
        $data = $checked['data'];
        if ($existing !== null && cms_inv_stock_of($itemId, $data['quantity'] - $existing['quantity']) < 0) {
            inv_fail('Check the highlighted fields.', 422, [
                'quantity' => 'Some of this purchase is already used or written off, so it can’t go that low.',
            ]);
        }

        $path = $existing['invoice_path'] ?? null;
        $name = $existing['invoice_name'] ?? null;
        $oldPath = $path;
        $newFileSaved = false;
        if (isset($_FILES['invoice']) && (int) ($_FILES['invoice']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            $upload = cms_inv_save_invoice($_FILES['invoice']);
            if (!$upload['ok']) {
                inv_fail('Check the highlighted fields.', 422, ['invoice' => $upload['error']]);
            }
            $path = $upload['path'];
            $name = $upload['name'];
            $newFileSaved = true;
        } elseif (!empty($body['remove_invoice'])) {
            $path = null;
            $name = null;
        }

        try {
            $saved = cms_inv_put('purchases', [
                'id' => $id,
                'item_id' => $itemId,
                'invoice_path' => $path,
                'invoice_name' => $name,
            ] + $data);
        } catch (Throwable $e) {
            if ($newFileSaved) {
                cms_inv_delete_invoice_file($path);
            }
            throw $e;
        }
        if ($oldPath !== null && $oldPath !== $path) {
            cms_inv_delete_invoice_file($oldPath);
        }
        inv_respond_item($saved['item_id'], $id > 0 ? 200 : 201);
    }

    /* ------------------------------------------------------- adjustment */
    if ($resource === 'adjustment') {
        $itemId = (int) ($body['item_id'] ?? 0);
        if (cms_inv_find('items', $itemId) === null) {
            inv_fail('Item not found.', 404);
        }
        $checked = cms_inv_validate_adjustment($body, $itemId);
        if (!$checked['ok']) {
            inv_fail('Check the highlighted fields.', 422, $checked['errors']);
        }
        cms_inv_put('adjustments', ['id' => 0, 'item_id' => $itemId] + $checked['data']);
        inv_respond_item($itemId, 201);
    }

    inv_fail('Unknown resource.', 400);
} catch (Throwable $e) {
    error_log('[inventory] ' . $e->getMessage());
    inv_fail('Could not complete that. Please try again.', 500);
}
