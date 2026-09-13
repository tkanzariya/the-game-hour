<?php
declare(strict_types=1);

require_once __DIR__ . '/bookings-store.php';
require_once __DIR__ . '/ops-migrate.php';

function cms_ops_require_json_login(): array
{
    if (!cms_is_logged_in()) {
        cms_json_response(['ok' => false, 'error' => 'Please sign in.'], 401);
    }
    $user = cms_current_user();
    if ($user === null) {
        cms_json_response(['ok' => false, 'error' => 'Please sign in.'], 401);
    }
    return $user;
}

function cms_ops_require_json_admin(): array
{
    $user = cms_ops_require_json_login();
    if ($user['role'] !== 'admin') {
        cms_json_response(['ok' => false, 'error' => 'Admin access required.'], 403);
    }
    return $user;
}

function cms_ops_verify_json_csrf(): void
{
    $header = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!cms_verify_csrf(is_string($header) ? $header : null)) {
        cms_json_response(['ok' => false, 'error' => 'Your session expired. Please sign in again.'], 419);
    }
}

/** @return array<string, mixed> */
function cms_ops_read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return $_POST;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function cms_ops_display_name(array $row): string
{
    $company = trim((string) ($row['company_name'] ?? ''));
    if ($company !== '') {
        return $company;
    }
    $contact = trim((string) ($row['contact_name'] ?? ''));
    if ($contact !== '') {
        return $contact;
    }
    $birthday = trim((string) ($row['birthday_person_name'] ?? ''));
    return $birthday !== '' ? $birthday : 'Untitled event';
}

/**
 * @param array<string, mixed> $row
 * @param list<array{id: int, name: string}> $games
 * @param list<array{id: int, name: string}> $team
 * @return array<string, mixed>
 */
function cms_ops_serialize_event(array $row, array $games = [], array $team = [], bool $detail = false): array
{
    $payload = [
        'id' => $row['id'],
        'display_name' => cms_ops_display_name($row),
        'event_category' => (string) ($row['event_category'] ?? ''),
        'event_status' => (string) ($row['event_status'] ?? 'pending'),
        'email' => (string) ($row['email'] ?? ''),
        'contact_name' => (string) ($row['contact_name'] ?? ''),
        'phone' => (string) ($row['phone'] ?? ''),
        'address' => (string) ($row['address'] ?? ''),
        'birthday_person_name' => $row['birthday_person_name'] ?? null,
        'company_name' => $row['company_name'] ?? null,
        'instagram_handle' => $row['instagram_handle'] ?? null,
        'event_type' => $row['event_type'] ?? null,
        'participant_count' => (int) ($row['participant_count'] ?? 0),
        'age_group' => $row['age_group'] ?? null,
        'event_date' => (string) ($row['event_date'] ?? ''),
        'event_time' => (string) ($row['event_time'] ?? ''),
        'venue_name' => $row['venue_name'] ?? null,
        'venue_type' => $row['venue_type'] ?? null,
        'payment_mode' => $row['payment_mode'] ?? null,
        'referral_source' => $row['referral_source'] ?? null,
        'special_requirements' => $row['special_requirements'] ?? null,
        'price' => cms_ops_money($row['price'] ?? null),
        'advance_amount' => cms_ops_money($row['advance_amount'] ?? null),
        'full_payment_amount' => cms_ops_money($row['full_payment_amount'] ?? null),
        'event_expenses' => cms_ops_money($row['event_expenses'] ?? null),
        'advance_payment_date' => $row['advance_payment_date'] ?? null,
        'full_payment_date' => $row['full_payment_date'] ?? null,
        'advance_payment_completed' => (int) ($row['advance_payment_completed'] ?? 0) === 1,
        'full_payment_completed' => (int) ($row['full_payment_completed'] ?? 0) === 1,
        'added_to_calendar' => (int) ($row['added_to_calendar'] ?? 0) === 1,
        'has_screenshot' => cms_ops_screenshot_from_row($row) !== null,
        'created_at' => $row['created_at'] ?? null,
    ];
    if ($detail) {
        $payload['games'] = $games;
        $payload['team'] = $team;
        $payload['screenshot_url'] = cms_ops_screenshot_from_row($row);
    }
    return $payload;
}

function cms_ops_money($value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }
    return round((float) $value, 2);
}

/**
 * @param array{category?: string, status?: string, q?: string} $filters
 * @return list<array<string, mixed>>
 */
function cms_ops_list_events(array $filters): array
{
    if (cms_dev_json_enabled()) {
        return cms_ops_list_events_json($filters);
    }
    cms_ops_migrate_if_needed();
    if (!cms_events_table_exists()) {
        return [];
    }

    $sql = 'SELECT * FROM events WHERE 1=1';
    $params = [];
    $category = trim((string) ($filters['category'] ?? ''));
    if (in_array($category, ['social', 'corporate'], true)) {
        $sql .= ' AND event_category = :category';
        $params['category'] = $category;
    }
    $status = trim((string) ($filters['status'] ?? ''));
    if (in_array($status, ['pending', 'upcoming', 'completed'], true)) {
        $sql .= ' AND event_status = :status';
        $params['status'] = $status;
    }
    $q = trim((string) ($filters['q'] ?? ''));
    if ($q !== '') {
        $sql .= ' AND (
            contact_name LIKE :q OR company_name LIKE :q
            OR birthday_person_name LIKE :q OR phone LIKE :q OR email LIKE :q
        )';
        $params['q'] = '%' . $q . '%';
    }
    $sql .= ' ORDER BY event_date DESC, event_time DESC, id DESC';
    $stmt = cms_db()->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll() ?: [];
    $out = [];
    foreach ($rows as $row) {
        $out[] = cms_ops_serialize_event($row);
    }
    return $out;
}

/**
 * @return array<string, mixed>|null
 */
function cms_ops_get_event(string $id): ?array
{
    if (cms_dev_json_enabled()) {
        $row = cms_ops_find_json_booking($id);
        if ($row === null) {
            return null;
        }
        return cms_ops_serialize_event(
            $row,
            cms_ops_json_named_list($row['game_ids'] ?? [], 'games'),
            cms_ops_json_named_list($row['team_ids'] ?? [], 'team'),
            true,
        );
    }
    cms_ops_migrate_if_needed();
    if (!ctype_digit($id)) {
        return null;
    }
    $stmt = cms_db()->prepare('SELECT * FROM events WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => (int) $id]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }
    return cms_ops_serialize_event(
        $row,
        cms_ops_event_games((int) $id),
        cms_ops_event_team((int) $id),
        true,
    );
}

/** @return list<array{id: int, name: string}> */
function cms_ops_event_games(int $eventId): array
{
    $stmt = cms_db()->prepare(
        'SELECT g.id, g.name
         FROM event_games eg
         INNER JOIN games g ON g.id = eg.game_id
         WHERE eg.event_id = :id
         ORDER BY eg.sort_order ASC, g.name ASC',
    );
    $stmt->execute(['id' => $eventId]);
    return $stmt->fetchAll() ?: [];
}

/** @return list<array{id: int, name: string}> */
function cms_ops_event_team(int $eventId): array
{
    $stmt = cms_db()->prepare(
        'SELECT t.id, t.name
         FROM event_team et
         INNER JOIN team_members t ON t.id = et.team_member_id
         WHERE et.event_id = :id
         ORDER BY t.name ASC',
    );
    $stmt->execute(['id' => $eventId]);
    return $stmt->fetchAll() ?: [];
}

/**
 * @param array<string, mixed> $patch
 * @return array{ok: true, event: array<string, mixed>}|array{ok: false, error: string}
 */
function cms_ops_update_event(string $id, array $patch): array
{
    if (cms_dev_json_enabled()) {
        return cms_ops_update_event_json($id, $patch);
    }
    cms_ops_migrate_if_needed();
    if (!ctype_digit($id) || !cms_events_table_exists()) {
        return ['ok' => false, 'error' => 'Event not found.'];
    }
    $eventId = (int) $id;
    $stmt = cms_db()->prepare('SELECT id FROM events WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $eventId]);
    if (!$stmt->fetch()) {
        return ['ok' => false, 'error' => 'Event not found.'];
    }

    $fields = [];
    $params = ['id' => $eventId];
    $allowed = [
        'event_status' => 'status',
        'venue_name' => 'string',
        'event_date' => 'date',
        'event_time' => 'time',
        'price' => 'money',
        'event_expenses' => 'money',
        'advance_amount' => 'money',
        'full_payment_amount' => 'money',
        'advance_payment_date' => 'date_or_null',
        'full_payment_date' => 'date_or_null',
        'advance_payment_completed' => 'bool',
        'full_payment_completed' => 'bool',
        'added_to_calendar' => 'bool',
        'instagram_handle' => 'string',
        'event_type' => 'string',
        'age_group' => 'string',
        'participant_count' => 'int',
        'venue_type' => 'venue',
        'payment_mode' => 'string',
        'referral_source' => 'string',
        'special_requirements' => 'string',
    ];

    foreach ($allowed as $column => $kind) {
        if (!array_key_exists($column, $patch)) {
            continue;
        }
        $value = cms_ops_normalize_patch_value($kind, $patch[$column]);
        if ($value instanceof RuntimeException) {
            return ['ok' => false, 'error' => $value->getMessage()];
        }
        $fields[] = $column . ' = :' . $column;
        $params[$column] = $value;
    }

    $pdo = cms_db();
    $pdo->beginTransaction();
    try {
        if ($fields !== []) {
            $sql = 'UPDATE events SET ' . implode(', ', $fields) . ' WHERE id = :id';
            $update = $pdo->prepare($sql);
            $update->execute($params);
        }
        if (array_key_exists('game_ids', $patch)) {
            cms_ops_replace_event_games($eventId, cms_ops_int_ids($patch['game_ids']));
        }
        if (array_key_exists('team_ids', $patch)) {
            cms_ops_replace_event_team($eventId, cms_ops_int_ids($patch['team_ids']));
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        return ['ok' => false, 'error' => 'Could not save event.'];
    }

    $event = cms_ops_get_event((string) $eventId);
    if ($event === null) {
        return ['ok' => false, 'error' => 'Event not found after save.'];
    }
    return ['ok' => true, 'event' => $event];
}

/**
 * @return array{ok: true}|array{ok: false, error: string}
 */
function cms_ops_delete_event(string $id)
{
    if (cms_dev_json_enabled()) {
        return cms_ops_delete_event_json($id);
    }
    cms_ops_migrate_if_needed();
    if (!ctype_digit($id) || !cms_events_table_exists()) {
        return ['ok' => false, 'error' => 'Event not found.'];
    }
    $eventId = (int) $id;
    $stmt = cms_db()->prepare('SELECT id, payment_screenshot_path FROM events WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $eventId]);
    $row = $stmt->fetch();
    if (!$row) {
        return ['ok' => false, 'error' => 'Event not found.'];
    }

    $pdo = cms_db();
    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM event_games WHERE event_id = :id')->execute(['id' => $eventId]);
        $pdo->prepare('DELETE FROM event_team WHERE event_id = :id')->execute(['id' => $eventId]);
        $pdo->prepare('DELETE FROM events WHERE id = :id')->execute(['id' => $eventId]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        return ['ok' => false, 'error' => 'Could not delete event.'];
    }

    cms_ops_delete_local_screenshot_file(
        is_string($row['payment_screenshot_path'] ?? null) ? $row['payment_screenshot_path'] : null
    );
    return ['ok' => true];
}

/**
 * @return array{ok: true}|array{ok: false, error: string}
 */
function cms_ops_delete_event_json(string $id)
{
    $data = cms_ops_json_bundle();
    $kept = [];
    $found = null;
    foreach ($data['bookings'] as $row) {
        if (!is_array($row) || (string) ($row['id'] ?? '') !== $id) {
            $kept[] = $row;
            continue;
        }
        $found = $row;
    }
    if ($found === null) {
        return ['ok' => false, 'error' => 'Event not found.'];
    }
    $data['bookings'] = $kept;
    cms_ops_json_save_bundle($data);
    cms_ops_delete_local_screenshot_file(
        is_string($found['payment_screenshot_path'] ?? null) ? $found['payment_screenshot_path'] : null
    );
    return ['ok' => true];
}

function cms_ops_delete_local_screenshot_file($relative)
{
    $source = cms_ops_screenshot_source_from_path($relative);
    if ($source === null || $source['type'] !== 'file') {
        return;
    }
    $uploads = realpath(cms_uploads_dir());
    $real = realpath($source['path']);
    if ($uploads === false || $real === false) {
        return;
    }
    if (strpos($real, $uploads) !== 0 || !is_file($real)) {
        return;
    }
    unlink($real);
}

function cms_ops_normalize_patch_value(string $kind, $raw)
{
    if ($kind === 'status') {
        $value = (string) $raw;
        if (!in_array($value, ['pending', 'upcoming', 'completed'], true)) {
            return new RuntimeException('Invalid event status.');
        }
        return $value;
    }
    if ($kind === 'venue') {
        $value = (string) $raw;
        if (!in_array($value, ['indoor', 'outdoor'], true)) {
            return new RuntimeException('Venue type must be indoor or outdoor.');
        }
        return $value;
    }
    if ($kind === 'bool') {
        return ($raw === true || $raw === 1 || $raw === '1' || $raw === 'true') ? 1 : 0;
    }
    if ($kind === 'money') {
        if ($raw === null || $raw === '') {
            return null;
        }
        return round((float) $raw, 2);
    }
    if ($kind === 'int') {
        $n = (int) $raw;
        return $n < 1 ? 1 : $n;
    }
    if ($kind === 'date') {
        $value = trim((string) $raw);
        if ($value === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return new RuntimeException('Enter a valid date.');
        }
        return $value;
    }
    if ($kind === 'date_or_null') {
        $value = trim((string) ($raw ?? ''));
        if ($value === '') {
            return null;
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return new RuntimeException('Enter a valid date.');
        }
        return $value;
    }
    if ($kind === 'time') {
        $value = trim((string) $raw);
        if (preg_match('/^\d{2}:\d{2}$/', $value)) {
            $value .= ':00';
        }
        if (!preg_match('/^\d{2}:\d{2}:\d{2}$/', $value)) {
            return new RuntimeException('Enter a valid time.');
        }
        return $value;
    }
    $value = trim((string) ($raw ?? ''));
    return $value === '' ? null : $value;
}

/** @return list<int> */
function cms_ops_int_ids($raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    $ids = [];
    foreach ($raw as $item) {
        $id = (int) $item;
        if ($id > 0) {
            $ids[] = $id;
        }
    }
    return array_values(array_unique($ids));
}

/** @param list<int> $gameIds */
function cms_ops_replace_event_games(int $eventId, array $gameIds): void
{
    cms_db()->prepare('DELETE FROM event_games WHERE event_id = :id')->execute(['id' => $eventId]);
    $stmt = cms_db()->prepare(
        'INSERT INTO event_games (event_id, game_id, sort_order) VALUES (:event_id, :game_id, :sort_order)',
    );
    foreach (array_values($gameIds) as $i => $gameId) {
        $stmt->execute(['event_id' => $eventId, 'game_id' => $gameId, 'sort_order' => $i]);
    }
}

/** @param list<int> $teamIds */
function cms_ops_replace_event_team(int $eventId, array $teamIds): void
{
    cms_db()->prepare('DELETE FROM event_team WHERE event_id = :id')->execute(['id' => $eventId]);
    $stmt = cms_db()->prepare(
        'INSERT INTO event_team (event_id, team_member_id) VALUES (:event_id, :team_member_id)',
    );
    foreach ($teamIds as $teamId) {
        $stmt->execute(['event_id' => $eventId, 'team_member_id' => $teamId]);
    }
}

/** @return list<array<string, mixed>> */
function cms_ops_list_games(): array
{
    if (cms_dev_json_enabled()) {
        return cms_ops_json_catalog('games');
    }
    cms_ops_migrate_if_needed();
    if (!cms_ops_tables_exist()) {
        return [];
    }
    $rows = cms_db()->query(
        'SELECT id, name, description, category, formation, avg_duration_minutes,
                group_size, traits, video_url, venue_indoor, venue_outdoor
         FROM games ORDER BY name ASC',
    )->fetchAll() ?: [];
    $out = [];
    foreach ($rows as $row) {
        $id = (int) $row['id'];
        $out[] = [
            'id' => $id,
            'name' => (string) $row['name'],
            'description' => $row['description'],
            'category' => $row['category'],
            'formation' => $row['formation'],
            'avg_duration_minutes' => $row['avg_duration_minutes'] !== null ? (int) $row['avg_duration_minutes'] : null,
            'group_size' => $row['group_size'],
            'traits' => $row['traits'],
            'video_url' => $row['video_url'],
            'venue_indoor' => (int) $row['venue_indoor'] === 1,
            'venue_outdoor' => (int) $row['venue_outdoor'] === 1,
            'age_groups' => cms_ops_game_age_groups($id),
            'event_types' => cms_ops_game_event_types($id),
        ];
    }
    return $out;
}

/** @return list<string> */
function cms_ops_game_age_groups(int $gameId): array
{
    $stmt = cms_db()->prepare('SELECT age_group FROM game_age_groups WHERE game_id = :id ORDER BY age_group');
    $stmt->execute(['id' => $gameId]);
    return array_map('strval', $stmt->fetchAll(PDO::FETCH_COLUMN) ?: []);
}

/** @return list<string> */
function cms_ops_game_event_types(int $gameId): array
{
    $stmt = cms_db()->prepare('SELECT event_type FROM game_event_types WHERE game_id = :id ORDER BY event_type');
    $stmt->execute(['id' => $gameId]);
    return array_map('strval', $stmt->fetchAll(PDO::FETCH_COLUMN) ?: []);
}

/** @return list<array<string, mixed>> */
function cms_ops_list_team(): array
{
    if (cms_dev_json_enabled()) {
        return cms_ops_json_catalog('team');
    }
    cms_ops_migrate_if_needed();
    if (!cms_ops_tables_exist()) {
        return [];
    }
    $rows = cms_db()->query(
        'SELECT id, name, email, phone, position, has_vehicle, willing_to_travel
         FROM team_members ORDER BY name ASC',
    )->fetchAll() ?: [];
    $out = [];
    foreach ($rows as $row) {
        $out[] = [
            'id' => (int) $row['id'],
            'name' => (string) $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'position' => (string) $row['position'],
            'has_vehicle' => (int) $row['has_vehicle'] === 1,
            'willing_to_travel' => (int) $row['willing_to_travel'] === 1,
        ];
    }
    return $out;
}

/**
 * @return array{type: 'file', path: string}|array{type: 'url', url: string}|null
 */
function cms_ops_screenshot_source(string $id): ?array
{
    $relative = null;
    if (cms_dev_json_enabled()) {
        $row = cms_ops_find_json_booking($id);
        $relative = is_string($row['payment_screenshot_path'] ?? null) ? $row['payment_screenshot_path'] : null;
    } else {
        if (!ctype_digit($id)) {
            return null;
        }
        $stmt = cms_db()->prepare('SELECT payment_screenshot_path FROM events WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => (int) $id]);
        $row = $stmt->fetch();
        $relative = is_string($row['payment_screenshot_path'] ?? null) ? $row['payment_screenshot_path'] : null;
    }
    return cms_ops_screenshot_source_from_path($relative);
}

/**
 * Same-origin URL for an event screenshot, or null when nothing can be shown.
 *
 * @param array<string, mixed> $row
 */
function cms_ops_screenshot_from_row(array $row): ?string
{
    $source = cms_ops_screenshot_source_from_path(
        is_string($row['payment_screenshot_path'] ?? null) ? $row['payment_screenshot_path'] : null
    );
    $id = (string) ($row['id'] ?? '');
    if ($source === null || $id === '') {
        return null;
    }
    return '/cms/api/ops/screenshot.php?id=' . rawurlencode($id);
}

/**
 * @return array{type: 'file', path: string}|array{type: 'url', url: string}|null
 */
function cms_ops_screenshot_source_from_path($raw): ?array
{
    $relative = trim((string) $raw);
    if ($relative === '') {
        return null;
    }
    if (preg_match('#^https?://#i', $relative)) {
        return ['type' => 'url', 'url' => $relative];
    }
    $relative = str_replace(['\\', '..'], ['/', ''], $relative);
    $path = cms_uploads_dir() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
    if (!is_file($path)) {
        return null;
    }
    return ['type' => 'file', 'path' => $path];
}

function cms_ops_screenshot_absolute_path(string $id): ?string
{
    $source = cms_ops_screenshot_source($id);
    if ($source === null || $source['type'] !== 'file') {
        return null;
    }
    return $source['path'];
}

/** @return array{bookings: list<array<string, mixed>>, games?: list<array<string, mixed>>, team?: list<array<string, mixed>>} */
function cms_ops_json_bundle(): array
{
    $path = cms_booking_json_path();
    $raw = is_file($path) ? file_get_contents($path) : '{"bookings":[]}';
    $data = json_decode($raw ?: '{"bookings":[]}', true);
    if (!is_array($data)) {
        $data = [];
    }
    if (!isset($data['bookings']) || !is_array($data['bookings'])) {
        $data['bookings'] = [];
    }
    if (!isset($data['games']) || !is_array($data['games'])) {
        $data['games'] = [];
    }
    if (!isset($data['team']) || !is_array($data['team'])) {
        $data['team'] = [];
    }
    return $data;
}

function cms_ops_json_save_bundle(array $data): void
{
    file_put_contents(
        cms_booking_json_path(),
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
    );
}

/**
 * @param array{category?: string, status?: string, q?: string} $filters
 * @return list<array<string, mixed>>
 */
function cms_ops_list_events_json(array $filters): array
{
    $data = cms_ops_json_bundle();
    $out = [];
    foreach ($data['bookings'] as $row) {
        if (!is_array($row)) {
            continue;
        }
        $category = trim((string) ($filters['category'] ?? ''));
        if (in_array($category, ['social', 'corporate'], true) && ($row['event_category'] ?? '') !== $category) {
            continue;
        }
        $status = trim((string) ($filters['status'] ?? ''));
        if (in_array($status, ['pending', 'upcoming', 'completed'], true) && ($row['event_status'] ?? '') !== $status) {
            continue;
        }
        $q = strtolower(trim((string) ($filters['q'] ?? '')));
        if ($q !== '') {
            $hay = strtolower(implode(' ', [
                (string) ($row['contact_name'] ?? ''),
                (string) ($row['company_name'] ?? ''),
                (string) ($row['birthday_person_name'] ?? ''),
                (string) ($row['phone'] ?? ''),
                (string) ($row['email'] ?? ''),
            ]));
            if (!str_contains($hay, $q)) {
                continue;
            }
        }
        $out[] = cms_ops_serialize_event($row);
    }
    usort($out, static function (array $a, array $b): int {
        $date = strcmp((string) $b['event_date'], (string) $a['event_date']);
        if ($date !== 0) {
            return $date;
        }
        return strcmp((string) $b['event_time'], (string) $a['event_time']);
    });
    return $out;
}

/** @return array<string, mixed>|null */
function cms_ops_find_json_booking(string $id): ?array
{
    foreach (cms_ops_json_bundle()['bookings'] as $row) {
        if (is_array($row) && (string) ($row['id'] ?? '') === $id) {
            return $row;
        }
    }
    return null;
}

/**
 * @param list<int> $ids
 * @return list<array{id: int, name: string}>
 */
function cms_ops_json_named_list($ids, string $kind): array
{
    $wanted = cms_ops_int_ids($ids);
    $catalog = cms_ops_json_catalog($kind === 'team' ? 'team' : 'games');
    $byId = [];
    foreach ($catalog as $item) {
        $byId[(int) $item['id']] = $item;
    }
    $out = [];
    foreach ($wanted as $id) {
        if (isset($byId[$id])) {
            $out[] = ['id' => $id, 'name' => (string) $byId[$id]['name']];
        }
    }
    return $out;
}

/** @return list<array<string, mixed>> */
function cms_ops_json_catalog(string $kind): array
{
    $data = cms_ops_json_bundle();
    $rows = $kind === 'team' ? $data['team'] : $data['games'];
    $out = [];
    foreach ($rows as $row) {
        if (is_array($row) && isset($row['id'], $row['name'])) {
            $out[] = $row;
        }
    }
    return $out;
}

/**
 * @param array<string, mixed> $patch
 * @return array{ok: true, event: array<string, mixed>}|array{ok: false, error: string}
 */
function cms_ops_update_event_json(string $id, array $patch): array
{
    $data = cms_ops_json_bundle();
    $found = false;
    foreach ($data['bookings'] as $i => $row) {
        if (!is_array($row) || (string) ($row['id'] ?? '') !== $id) {
            continue;
        }
        $found = true;
        $map = [
            'event_status', 'venue_name', 'event_date', 'event_time', 'price', 'event_expenses',
            'advance_amount', 'full_payment_amount', 'advance_payment_date', 'full_payment_date',
            'advance_payment_completed', 'full_payment_completed', 'added_to_calendar',
            'instagram_handle', 'event_type', 'age_group', 'participant_count', 'venue_type',
            'payment_mode', 'referral_source', 'special_requirements',
        ];
        foreach ($map as $column) {
            if (!array_key_exists($column, $patch)) {
                continue;
            }
            if ($column === 'event_status') {
                $kind = 'status';
            } elseif ($column === 'venue_type') {
                $kind = 'venue';
            } elseif (in_array($column, ['price', 'event_expenses', 'advance_amount', 'full_payment_amount'], true)) {
                $kind = 'money';
            } elseif (in_array($column, ['advance_payment_completed', 'full_payment_completed', 'added_to_calendar'], true)) {
                $kind = 'bool';
            } elseif ($column === 'participant_count') {
                $kind = 'int';
            } elseif ($column === 'event_date') {
                $kind = 'date';
            } elseif (in_array($column, ['advance_payment_date', 'full_payment_date'], true)) {
                $kind = 'date_or_null';
            } elseif ($column === 'event_time') {
                $kind = 'time';
            } else {
                $kind = 'string';
            }
            $value = cms_ops_normalize_patch_value($kind, $patch[$column]);
            if ($value instanceof RuntimeException) {
                return ['ok' => false, 'error' => $value->getMessage()];
            }
            $data['bookings'][$i][$column] = $value;
        }
        if (array_key_exists('game_ids', $patch)) {
            $data['bookings'][$i]['game_ids'] = cms_ops_int_ids($patch['game_ids']);
        }
        if (array_key_exists('team_ids', $patch)) {
            $data['bookings'][$i]['team_ids'] = cms_ops_int_ids($patch['team_ids']);
        }
        break;
    }
    if (!$found) {
        return ['ok' => false, 'error' => 'Event not found.'];
    }
    cms_ops_json_save_bundle($data);
    $event = cms_ops_get_event($id);
    if ($event === null) {
        return ['ok' => false, 'error' => 'Event not found after save.'];
    }
    return ['ok' => true, 'event' => $event];
}
