<?php
declare(strict_types=1);

/**
 * Inventory: items, purchases (optional invoice file) and manual stock adjustments.
 *
 * Stock is never typed in by hand. It is always
 *   total quantity purchased + sum of adjustments (lost / damaged / used are negative).
 * Keep PHP 7.4-safe (no str_contains, match, union types, nullsafe).
 */

require_once __DIR__ . '/ops-games.php';

const CMS_INV_KINDS = ['items', 'purchases', 'adjustments'];

/** Reason code => sign of the change (-1 removes stock, 1 adds it). */
const CMS_INV_REASONS = [
    'lost' => -1,
    'damaged' => -1,
    'used' => -1,
    'recount_remove' => -1,
    'found' => 1,
    'recount_add' => 1,
];

const CMS_INV_MAX_INVOICE_BYTES = 10 * 1024 * 1024;

/* ---------------------------------------------------------------- migration */

function cms_inv_table(string $kind): string
{
    return 'inventory_' . $kind;
}

/** Create the inventory tables on first use. Isolated so a failure cannot break other ops pages. */
function cms_inv_migrate_if_needed(): void
{
    static $attempted = false;
    if ($attempted || cms_dev_json_enabled()) {
        return;
    }
    $attempted = true;
    cms_ops_migrate_if_needed();
    $path = __DIR__ . '/../sql/migrate-inventory.sql';
    if (!is_file($path)) {
        throw new RuntimeException('Missing migration file: migrate-inventory.sql');
    }
    $pdo = cms_db();
    foreach (cms_events_split_sql_statements((string) file_get_contents($path)) as $statement) {
        $pdo->exec($statement);
    }
}

/* ------------------------------------------------------------------ storage */

/** @return list<string> columns that may be written for a kind */
function cms_inv_columns(string $kind): array
{
    if ($kind === 'items') {
        return ['name', 'category', 'unit', 'min_stock', 'notes'];
    }
    if ($kind === 'purchases') {
        return ['item_id', 'purchased_on', 'quantity', 'total_price', 'vendor', 'invoice_path', 'invoice_name', 'notes'];
    }
    return ['item_id', 'adjusted_on', 'delta', 'reason', 'notes'];
}

/**
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function cms_inv_normalize(string $kind, array $row): array
{
    $out = ['id' => (int) $row['id']];
    if ($kind === 'items') {
        $out['name'] = (string) $row['name'];
        $out['category'] = isset($row['category']) && $row['category'] !== '' ? (string) $row['category'] : null;
        $out['unit'] = isset($row['unit']) && $row['unit'] !== '' ? (string) $row['unit'] : 'pcs';
        $out['min_stock'] = (int) ($row['min_stock'] ?? 0);
        $out['notes'] = isset($row['notes']) && $row['notes'] !== '' ? (string) $row['notes'] : null;
    } elseif ($kind === 'purchases') {
        $out['item_id'] = (int) $row['item_id'];
        $out['purchased_on'] = substr((string) $row['purchased_on'], 0, 10);
        $out['quantity'] = (int) $row['quantity'];
        // The total is what was actually paid; the price of one is worked out from it.
        $out['total_price'] = round((float) ($row['total_price'] ?? 0), 2);
        $out['unit_price'] = $out['quantity'] > 0 ? round($out['total_price'] / $out['quantity'], 2) : 0.0;
        $out['vendor'] = isset($row['vendor']) && $row['vendor'] !== '' ? (string) $row['vendor'] : null;
        $out['invoice_path'] = isset($row['invoice_path']) && $row['invoice_path'] !== '' ? (string) $row['invoice_path'] : null;
        $out['invoice_name'] = isset($row['invoice_name']) && $row['invoice_name'] !== '' ? (string) $row['invoice_name'] : null;
        $out['notes'] = isset($row['notes']) && $row['notes'] !== '' ? (string) $row['notes'] : null;
    } else {
        $out['item_id'] = (int) $row['item_id'];
        $out['adjusted_on'] = substr((string) $row['adjusted_on'], 0, 10);
        $out['delta'] = (int) $row['delta'];
        $out['reason'] = (string) $row['reason'];
        $out['notes'] = isset($row['notes']) && $row['notes'] !== '' ? (string) $row['notes'] : null;
    }
    $out['created_at'] = isset($row['created_at']) && $row['created_at'] !== '' ? (string) $row['created_at'] : null;
    return $out;
}

/** @return list<array<string, mixed>> */
function cms_inv_all(string $kind): array
{
    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $rows = $bundle['inventory'][$kind] ?? [];
        $out = [];
        foreach (is_array($rows) ? $rows : [] as $row) {
            if (is_array($row) && isset($row['id'])) {
                $out[] = cms_inv_normalize($kind, $row);
            }
        }
        return $out;
    }
    cms_inv_migrate_if_needed();
    $rows = cms_db()->query('SELECT * FROM ' . cms_inv_table($kind) . ' ORDER BY id ASC')->fetchAll() ?: [];
    return array_map(static function (array $row) use ($kind): array {
        return cms_inv_normalize($kind, $row);
    }, $rows);
}

/** @return array<string, mixed>|null */
function cms_inv_find(string $kind, int $id)
{
    foreach (cms_inv_all($kind) as $row) {
        if ($row['id'] === $id) {
            return $row;
        }
    }
    return null;
}

/**
 * Insert (id 0) or update a row. Only whitelisted columns are written.
 *
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function cms_inv_put(string $kind, array $row): array
{
    $values = [];
    foreach (cms_inv_columns($kind) as $column) {
        $values[$column] = $row[$column] ?? null;
    }
    $id = (int) ($row['id'] ?? 0);

    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $rows = $bundle['inventory'][$kind] ?? [];
        $rows = is_array($rows) ? $rows : [];
        $maxId = 0;
        $index = null;
        foreach ($rows as $i => $existing) {
            if (!is_array($existing)) {
                continue;
            }
            $maxId = max($maxId, (int) ($existing['id'] ?? 0));
            if ($id > 0 && (int) ($existing['id'] ?? 0) === $id) {
                $index = $i;
            }
        }
        if ($index === null) {
            $id = $maxId + 1;
            $values['created_at'] = gmdate('Y-m-d H:i:s');
            $rows[] = ['id' => $id] + $values;
        } else {
            $values['created_at'] = $rows[$index]['created_at'] ?? gmdate('Y-m-d H:i:s');
            $rows[$index] = ['id' => $id] + $values;
        }
        $bundle['inventory'][$kind] = array_values($rows);
        cms_ops_json_save_bundle($bundle);
        return cms_inv_normalize($kind, ['id' => $id] + $values);
    }

    cms_inv_migrate_if_needed();
    $pdo = cms_db();
    $table = cms_inv_table($kind);
    $columns = array_keys($values);
    if ($id > 0) {
        $set = [];
        foreach ($columns as $column) {
            $set[] = $column . ' = :' . $column;
        }
        $values['__id'] = $id;
        $pdo->prepare('UPDATE ' . $table . ' SET ' . implode(', ', $set) . ' WHERE id = :__id')->execute($values);
    } else {
        $pdo->prepare(
            'INSERT INTO ' . $table . ' (' . implode(', ', $columns) . ') VALUES (:' . implode(', :', $columns) . ')',
        )->execute($values);
        $id = (int) $pdo->lastInsertId();
    }
    $saved = cms_inv_find($kind, $id);
    if ($saved === null) {
        throw new RuntimeException('Could not read the saved row.');
    }
    return $saved;
}

function cms_inv_remove(string $kind, int $id): bool
{
    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $rows = $bundle['inventory'][$kind] ?? [];
        $kept = [];
        $found = false;
        foreach (is_array($rows) ? $rows : [] as $row) {
            if (is_array($row) && (int) ($row['id'] ?? 0) === $id) {
                $found = true;
                continue;
            }
            $kept[] = $row;
        }
        if (!$found) {
            return false;
        }
        $bundle['inventory'][$kind] = $kept;
        if ($kind === 'items') {
            foreach (['purchases', 'adjustments'] as $child) {
                $bundle['inventory'][$child] = array_values(array_filter(
                    is_array($bundle['inventory'][$child] ?? null) ? $bundle['inventory'][$child] : [],
                    static function ($row) use ($id): bool {
                        return !is_array($row) || (int) ($row['item_id'] ?? 0) !== $id;
                    },
                ));
            }
        }
        cms_ops_json_save_bundle($bundle);
        return true;
    }
    cms_inv_migrate_if_needed();
    $stmt = cms_db()->prepare('DELETE FROM ' . cms_inv_table($kind) . ' WHERE id = :id');
    $stmt->execute(['id' => $id]);
    return $stmt->rowCount() > 0;
}

/* ----------------------------------------------------------------- invoices */

function cms_inv_invoice_dir(): string
{
    $dir = cms_uploads_dir() . DIRECTORY_SEPARATOR . 'inventory-invoices';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    // Invoices are private: nothing here may be fetched by URL. They are served by the API after login.
    $guard = $dir . DIRECTORY_SEPARATOR . '.htaccess';
    if (!is_file($guard)) {
        @file_put_contents($guard, "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    return $dir;
}

/**
 * Check and store an uploaded invoice (PDF or photo).
 *
 * @param array<string, mixed> $file an entry of $_FILES
 * @return array{ok: true, path: string, name: string}|array{ok: false, error: string}
 */
function cms_inv_save_invoice(array $file): array
{
    $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
        return ['ok' => false, 'error' => 'That file is too large. The limit is 10 MB.'];
    }
    if ($error !== UPLOAD_ERR_OK || empty($file['tmp_name'])) {
        return ['ok' => false, 'error' => 'The invoice could not be uploaded. Please try again.'];
    }
    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > CMS_INV_MAX_INVOICE_BYTES) {
        return ['ok' => false, 'error' => 'That file is too large. The limit is 10 MB.'];
    }

    // Decide the type from the file's own first bytes, never from the name or the browser's claim.
    $head = (string) file_get_contents((string) $file['tmp_name'], false, null, 0, 16);
    $ext = null;
    if (strncmp($head, '%PDF', 4) === 0) {
        $ext = 'pdf';
    } elseif (strncmp($head, "\xFF\xD8\xFF", 3) === 0) {
        $ext = 'jpg';
    } elseif (strncmp($head, "\x89PNG\r\n\x1A\n", 8) === 0) {
        $ext = 'png';
    } elseif (strncmp($head, 'RIFF', 4) === 0 && substr($head, 8, 4) === 'WEBP') {
        $ext = 'webp';
    }
    if ($ext === null) {
        return ['ok' => false, 'error' => 'Upload a PDF, JPG, PNG or WEBP file.'];
    }

    $dir = cms_inv_invoice_dir();
    $filename = 'inv_' . gmdate('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $dest = $dir . DIRECTORY_SEPARATOR . $filename;
    $saved = is_uploaded_file((string) $file['tmp_name'])
        ? move_uploaded_file((string) $file['tmp_name'], $dest)
        : copy((string) $file['tmp_name'], $dest);
    if (!$saved) {
        return ['ok' => false, 'error' => 'The invoice could not be saved. Please try again.'];
    }

    $original = trim(preg_replace('/[\x00-\x1F\x7F\/\\\\]+/', '', (string) ($file['name'] ?? '')) ?? '');
    if ($original === '' || cms_ops_text_len($original) > 120) {
        $original = 'invoice.' . $ext;
    }
    return ['ok' => true, 'path' => 'inventory-invoices/' . $filename, 'name' => $original];
}

/** Absolute path of a stored invoice, only if it really is inside the invoice folder. */
function cms_inv_invoice_file(?string $relative): ?string
{
    if ($relative === null || $relative === '' || strpos($relative, 'inventory-invoices/') !== 0) {
        return null;
    }
    $dir = realpath(cms_inv_invoice_dir());
    $path = realpath(cms_uploads_dir() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative));
    if ($dir === false || $path === false || strpos($path, $dir . DIRECTORY_SEPARATOR) !== 0 || !is_file($path)) {
        return null;
    }
    return $path;
}

function cms_inv_delete_invoice_file(?string $relative): void
{
    $path = cms_inv_invoice_file($relative);
    if ($path !== null) {
        @unlink($path);
    }
}

/* ------------------------------------------------------------------- stock */

/**
 * @param list<array<string, mixed>> $items
 * @param list<array<string, mixed>> $purchases
 * @param list<array<string, mixed>> $adjustments
 * @return array<int, array<string, mixed>> stats keyed by item id
 */
function cms_inv_stats(array $items, array $purchases, array $adjustments): array
{
    $stats = [];
    foreach ($items as $item) {
        $stats[$item['id']] = [
            'purchased' => 0, 'spent' => 0.0, 'adjusted' => 0, 'purchase_count' => 0, 'last_purchased_on' => null,
        ];
    }
    foreach ($purchases as $p) {
        if (!isset($stats[$p['item_id']])) {
            continue;
        }
        $s = &$stats[$p['item_id']];
        $s['purchased'] += $p['quantity'];
        $s['spent'] += $p['total_price'];
        $s['purchase_count']++;
        if ($s['last_purchased_on'] === null || $p['purchased_on'] > $s['last_purchased_on']) {
            $s['last_purchased_on'] = $p['purchased_on'];
        }
        unset($s);
    }
    foreach ($adjustments as $a) {
        if (isset($stats[$a['item_id']])) {
            $stats[$a['item_id']]['adjusted'] += $a['delta'];
        }
    }
    return $stats;
}

/**
 * @param array<string, mixed> $item
 * @param array<string, mixed> $s stats for the item
 * @return array<string, mixed>
 */
function cms_inv_item_view(array $item, array $s): array
{
    $stock = $s['purchased'] + $s['adjusted'];
    $avg = $s['purchased'] > 0 ? $s['spent'] / $s['purchased'] : 0.0;
    return [
        'id' => $item['id'],
        'name' => $item['name'],
        'category' => $item['category'],
        'unit' => $item['unit'],
        'min_stock' => $item['min_stock'],
        'notes' => $item['notes'],
        'stock' => $stock,
        'total_purchased' => $s['purchased'],
        'total_spent' => round($s['spent'], 2),
        'avg_cost' => round($avg, 2),
        'value' => round(max($stock, 0) * $avg, 2),
        'last_purchased_on' => $s['last_purchased_on'],
        'purchase_count' => $s['purchase_count'],
        'out_of_stock' => $stock <= 0,
        'low_stock' => $stock > 0 && $item['min_stock'] > 0 && $stock <= $item['min_stock'],
    ];
}

/** Current stock of one item, optionally pretending a purchase or adjustment was changed. */
function cms_inv_stock_of(int $itemId, int $purchaseDelta = 0, int $adjustmentDelta = 0): int
{
    $stock = $purchaseDelta + $adjustmentDelta;
    foreach (cms_inv_all('purchases') as $p) {
        if ($p['item_id'] === $itemId) {
            $stock += $p['quantity'];
        }
    }
    foreach (cms_inv_all('adjustments') as $a) {
        if ($a['item_id'] === $itemId) {
            $stock += $a['delta'];
        }
    }
    return $stock;
}

/** @return array<string, mixed> everything the list page needs */
function cms_inv_overview(): array
{
    $items = cms_inv_all('items');
    $stats = cms_inv_stats($items, cms_inv_all('purchases'), cms_inv_all('adjustments'));
    $views = [];
    $totals = ['item_count' => count($items), 'units' => 0, 'value' => 0.0, 'spent' => 0.0, 'low' => 0, 'out' => 0];
    foreach ($items as $item) {
        $view = cms_inv_item_view($item, $stats[$item['id']]);
        $views[] = $view;
        $totals['units'] += max($view['stock'], 0);
        $totals['value'] += $view['value'];
        $totals['spent'] += $view['total_spent'];
        $totals['low'] += $view['low_stock'] ? 1 : 0;
        $totals['out'] += $view['out_of_stock'] ? 1 : 0;
    }
    usort($views, static function (array $a, array $b): int {
        return strcasecmp((string) $a['name'], (string) $b['name']);
    });
    $totals['value'] = round($totals['value'], 2);
    $totals['spent'] = round($totals['spent'], 2);
    return ['items' => $views, 'totals' => $totals];
}

/** @return array<string, mixed>|null */
function cms_inv_detail(int $id)
{
    $item = cms_inv_find('items', $id);
    if ($item === null) {
        return null;
    }
    $purchases = array_values(array_filter(cms_inv_all('purchases'), static function (array $p) use ($id): bool {
        return $p['item_id'] === $id;
    }));
    $adjustments = array_values(array_filter(cms_inv_all('adjustments'), static function (array $a) use ($id): bool {
        return $a['item_id'] === $id;
    }));
    $stats = cms_inv_stats([$item], $purchases, $adjustments);
    $view = cms_inv_item_view($item, $stats[$id]);

    usort($purchases, static function (array $a, array $b): int {
        return strcmp($b['purchased_on'] . sprintf('%09d', $b['id']), $a['purchased_on'] . sprintf('%09d', $a['id']));
    });
    usort($adjustments, static function (array $a, array $b): int {
        return strcmp($b['adjusted_on'] . sprintf('%09d', $b['id']), $a['adjusted_on'] . sprintf('%09d', $a['id']));
    });
    $view['purchases'] = array_map(static function (array $p): array {
        return [
            'id' => $p['id'],
            'purchased_on' => $p['purchased_on'],
            'quantity' => $p['quantity'],
            'unit_price' => $p['unit_price'],
            'total' => $p['total_price'],
            'vendor' => $p['vendor'],
            'notes' => $p['notes'],
            'has_invoice' => $p['invoice_path'] !== null,
            'invoice_name' => $p['invoice_name'],
        ];
    }, $purchases);
    $view['adjustments'] = array_map(static function (array $a): array {
        return [
            'id' => $a['id'],
            'adjusted_on' => $a['adjusted_on'],
            'delta' => $a['delta'],
            'reason' => $a['reason'],
            'notes' => $a['notes'],
        ];
    }, $adjustments);
    return $view;
}

/* --------------------------------------------------------------- validation */

/** @param mixed $raw */
function cms_inv_valid_date($raw): ?string
{
    $value = trim((string) $raw);
    $d = DateTime::createFromFormat('!Y-m-d', $value);
    if ($d === false || $d->format('Y-m-d') !== $value) {
        return null;
    }
    return $value;
}

/** @param mixed $raw */
function cms_inv_whole($raw, int $min, int $max): ?int
{
    if (!is_numeric($raw) || (float) $raw != (int) $raw) {
        return null;
    }
    $n = (int) $raw;
    return $n >= $min && $n <= $max ? $n : null;
}

/**
 * @param array<string, mixed> $body
 * @return array{ok: true, data: array<string, mixed>}|array{ok: false, errors: array<string, string>}
 */
function cms_inv_validate_item(array $body, int $selfId)
{
    $errors = [];
    $name = trim(preg_replace('/\s+/', ' ', (string) ($body['name'] ?? '')) ?? '');
    if ($name === '') {
        $errors['name'] = 'Enter the item name.';
    } elseif (cms_ops_text_len($name) > 120) {
        $errors['name'] = 'Use 120 characters or fewer.';
    } else {
        foreach (cms_inv_all('items') as $other) {
            if ($other['id'] !== $selfId && cms_ops_text_lower($other['name']) === cms_ops_text_lower($name)) {
                $errors['name'] = 'You already have an item with this name.';
                break;
            }
        }
    }
    $category = trim(preg_replace('/\s+/', ' ', (string) ($body['category'] ?? '')) ?? '');
    if (cms_ops_text_len($category) > 60) {
        $errors['category'] = 'Use 60 characters or fewer.';
    }
    $unit = trim((string) ($body['unit'] ?? ''));
    if ($unit === '') {
        $unit = 'pcs';
    } elseif (cms_ops_text_len($unit) > 20) {
        $errors['unit'] = 'Use 20 characters or fewer.';
    }
    $min = cms_inv_whole(($body['min_stock'] ?? '') === '' ? 0 : $body['min_stock'], 0, 1000000);
    if ($min === null) {
        $errors['min_stock'] = 'Enter a whole number, or leave it at 0.';
    }
    $notes = trim((string) ($body['notes'] ?? ''));
    if (cms_ops_text_len($notes) > 500) {
        $errors['notes'] = 'Use 500 characters or fewer.';
    }
    if ($errors !== []) {
        return ['ok' => false, 'errors' => $errors];
    }
    return ['ok' => true, 'data' => [
        'name' => $name,
        'category' => $category !== '' ? $category : null,
        'unit' => $unit,
        'min_stock' => $min,
        'notes' => $notes !== '' ? $notes : null,
    ]];
}

/**
 * @param array<string, mixed> $body
 * @return array{ok: true, data: array<string, mixed>}|array{ok: false, errors: array<string, string>}
 */
function cms_inv_validate_purchase(array $body)
{
    $errors = [];
    $date = cms_inv_valid_date($body['purchased_on'] ?? '');
    if ($date === null) {
        $errors['purchased_on'] = 'Choose the date you bought it.';
    } elseif ($date > gmdate('Y-m-d', time() + 86400)) {
        $errors['purchased_on'] = 'The purchase date can’t be in the future.';
    }
    $qty = cms_inv_whole($body['quantity'] ?? '', 1, 1000000);
    if ($qty === null) {
        $errors['quantity'] = 'Enter a whole number of 1 or more.';
    }
    // The price can be typed as the price of one, or as the total paid for the whole purchase.
    $mode = (string) ($body['price_mode'] ?? 'each') === 'total' ? 'total' : 'each';
    $priceRaw = $body['price'] ?? '';
    $total = null;
    if (is_numeric($priceRaw) && (float) $priceRaw >= 0 && (float) $priceRaw <= 100000000) {
        $total = round($mode === 'total' ? (float) $priceRaw : (float) $priceRaw * (int) ($qty ?? 0), 2);
        if ($qty !== null && $total > 100000000) {
            $total = null;
        }
    }
    if ($total === null) {
        $errors['price'] = $mode === 'total'
            ? 'Enter the total you paid, like 2550.'
            : 'Enter the price of one, like 45 or 45.50.';
    }
    $vendor = trim((string) ($body['vendor'] ?? ''));
    if (cms_ops_text_len($vendor) > 120) {
        $errors['vendor'] = 'Use 120 characters or fewer.';
    }
    $notes = trim((string) ($body['notes'] ?? ''));
    if (cms_ops_text_len($notes) > 500) {
        $errors['notes'] = 'Use 500 characters or fewer.';
    }
    if ($errors !== []) {
        return ['ok' => false, 'errors' => $errors];
    }
    return ['ok' => true, 'data' => [
        'purchased_on' => $date,
        'quantity' => $qty,
        'total_price' => $total,
        'vendor' => $vendor !== '' ? $vendor : null,
        'notes' => $notes !== '' ? $notes : null,
    ]];
}

/**
 * @param array<string, mixed> $body
 * @return array{ok: true, data: array<string, mixed>}|array{ok: false, errors: array<string, string>}
 */
function cms_inv_validate_adjustment(array $body, int $itemId)
{
    $errors = [];
    $date = cms_inv_valid_date($body['adjusted_on'] ?? '');
    if ($date === null) {
        $errors['adjusted_on'] = 'Choose a date.';
    } elseif ($date > gmdate('Y-m-d', time() + 86400)) {
        $errors['adjusted_on'] = 'The date can’t be in the future.';
    }
    $reason = (string) ($body['reason'] ?? '');
    if (!isset(CMS_INV_REASONS[$reason])) {
        $errors['reason'] = 'Choose a reason.';
    }
    $qty = cms_inv_whole($body['quantity'] ?? '', 1, 1000000);
    if ($qty === null) {
        $errors['quantity'] = 'Enter a whole number of 1 or more.';
    }
    $notes = trim((string) ($body['notes'] ?? ''));
    if (cms_ops_text_len($notes) > 500) {
        $errors['notes'] = 'Use 500 characters or fewer.';
    }
    if ($errors === []) {
        $delta = CMS_INV_REASONS[$reason] * $qty;
        $stock = cms_inv_stock_of($itemId);
        if ($stock + $delta < 0) {
            $errors['quantity'] = 'Only ' . $stock . ' in stock, so you can’t remove ' . $qty . '.';
        }
    }
    if ($errors !== []) {
        return ['ok' => false, 'errors' => $errors];
    }
    return ['ok' => true, 'data' => [
        'adjusted_on' => $date,
        'delta' => CMS_INV_REASONS[$reason] * $qty,
        'reason' => $reason,
        'notes' => $notes !== '' ? $notes : null,
    ]];
}
