<?php
declare(strict_types=1);

/**
 * Game inquiries: admin creates a shortlist of games, the customer opens a private
 * link, picks the games they want and submits once before the link expires.
 *
 * Times are stored in UTC. Keep PHP 7.4-safe (no str_contains, match, union types).
 */

require_once __DIR__ . '/ops-games.php';
require_once __DIR__ . '/mail.php';

const CMS_INQ_MIN_EXPIRY_MINUTES = 5;
const CMS_INQ_MAX_EXPIRY_MINUTES = 60 * 24 * 30;

function cms_inq_now(): int
{
    return time();
}

function cms_inq_ts(?string $utc): ?int
{
    if ($utc === null || $utc === '') {
        return null;
    }
    $ts = strtotime($utc . ' UTC');
    return $ts === false ? null : $ts;
}

function cms_inq_fmt(?int $ts): ?string
{
    return $ts === null ? null : gmdate('Y-m-d H:i:s', $ts);
}

function cms_inq_iso(?string $utc): ?string
{
    $ts = cms_inq_ts($utc);
    return $ts === null ? null : gmdate('c', $ts);
}

/**
 * Normalize a stored record.
 *
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function cms_inq_normalize(array $row): array
{
    $ages = $row['age_groups'] ?? [];
    if (is_string($ages)) {
        $decoded = json_decode($ages, true);
        $ages = is_array($decoded) ? $decoded : [];
    }
    return [
        'id' => (int) $row['id'],
        'token' => (string) $row['token'],
        'customer_name' => (string) $row['customer_name'],
        'customer_phone' => isset($row['customer_phone']) && $row['customer_phone'] !== '' ? (string) $row['customer_phone'] : null,
        'event_type' => (string) ($row['event_type'] ?? ''),
        'age_groups' => cms_ops_game_code_list($ages),
        'participants' => isset($row['participants']) && $row['participants'] !== '' && $row['participants'] !== null ? (int) $row['participants'] : null,
        'max_games' => isset($row['max_games']) && $row['max_games'] !== '' && $row['max_games'] !== null ? (int) $row['max_games'] : null,
        'expires_at' => (string) $row['expires_at'],
        'opened_at' => !empty($row['opened_at']) ? (string) $row['opened_at'] : null,
        'submitted_at' => !empty($row['submitted_at']) ? (string) $row['submitted_at'] : null,
        'created_at' => !empty($row['created_at']) ? (string) $row['created_at'] : gmdate('Y-m-d H:i:s'),
        'game_ids' => cms_ops_int_ids($row['game_ids'] ?? []),
        'selected_ids' => cms_ops_int_ids($row['selected_ids'] ?? []),
    ];
}

/** @param array<string, mixed> $rec */
function cms_inq_status(array $rec): string
{
    if (!empty($rec['submitted_at'])) {
        return 'submitted';
    }
    $expires = cms_inq_ts((string) $rec['expires_at']);
    if ($expires !== null && $expires <= cms_inq_now()) {
        return 'expired';
    }
    return !empty($rec['opened_at']) ? 'opened' : 'pending';
}

/* ------------------------------------------------------------------ storage */

/** Create the inquiry tables on first use. Isolated so a failure cannot break other ops pages. */
function cms_inq_migrate_if_needed(): void
{
    static $attempted = false;
    if ($attempted || cms_dev_json_enabled()) {
        return;
    }
    $attempted = true;
    cms_ops_migrate_if_needed();
    $path = __DIR__ . '/../sql/migrate-inquiries.sql';
    if (!is_file($path)) {
        throw new RuntimeException('Missing migration file: migrate-inquiries.sql');
    }
    $pdo = cms_db();
    foreach (cms_events_split_sql_statements((string) file_get_contents($path)) as $statement) {
        $pdo->exec($statement);
    }
}

/** @return list<array<string, mixed>> */
function cms_inq_all(): array
{
    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $rows = isset($bundle['inquiries']) && is_array($bundle['inquiries']) ? $bundle['inquiries'] : [];
        $out = [];
        foreach ($rows as $row) {
            if (is_array($row) && isset($row['id'], $row['token'])) {
                $out[] = cms_inq_normalize($row);
            }
        }
        return $out;
    }
    cms_inq_migrate_if_needed();
    $pdo = cms_db();
    $rows = $pdo->query('SELECT * FROM inquiries ORDER BY id DESC')->fetchAll() ?: [];
    $links = $pdo->query(
        'SELECT inquiry_id, game_id, selected FROM inquiry_games ORDER BY inquiry_id, sort_order, game_id',
    )->fetchAll() ?: [];
    $byInquiry = [];
    foreach ($links as $link) {
        $key = (int) $link['inquiry_id'];
        $byInquiry[$key]['game_ids'][] = (int) $link['game_id'];
        if ((int) $link['selected'] === 1) {
            $byInquiry[$key]['selected_ids'][] = (int) $link['game_id'];
        }
    }
    $out = [];
    foreach ($rows as $row) {
        $key = (int) $row['id'];
        $row['game_ids'] = $byInquiry[$key]['game_ids'] ?? [];
        $row['selected_ids'] = $byInquiry[$key]['selected_ids'] ?? [];
        $out[] = cms_inq_normalize($row);
    }
    return $out;
}

/** @return array<string, mixed>|null */
function cms_inq_find(string $id): ?array
{
    foreach (cms_inq_all() as $rec) {
        if ((string) $rec['id'] === $id) {
            return $rec;
        }
    }
    return null;
}

/** @return array<string, mixed>|null */
function cms_inq_find_by_token(string $token): ?array
{
    if (preg_match('/^[a-f0-9]{32}$/', $token) !== 1) {
        return null;
    }
    foreach (cms_inq_all() as $rec) {
        if (hash_equals((string) $rec['token'], $token)) {
            return $rec;
        }
    }
    return null;
}

/**
 * Insert (id = 0) or replace a record. Returns the stored record.
 *
 * @param array<string, mixed> $rec
 * @return array<string, mixed>
 */
function cms_inq_put(array $rec): array
{
    $rec['game_ids'] = cms_ops_int_ids($rec['game_ids'] ?? []);
    $rec['selected_ids'] = array_values(array_intersect(cms_ops_int_ids($rec['selected_ids'] ?? []), $rec['game_ids']));

    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $rows = isset($bundle['inquiries']) && is_array($bundle['inquiries']) ? $bundle['inquiries'] : [];
        $maxId = 0;
        $index = null;
        foreach ($rows as $i => $row) {
            if (!is_array($row)) {
                continue;
            }
            $maxId = max($maxId, (int) ($row['id'] ?? 0));
            if ((int) $rec['id'] > 0 && (int) ($row['id'] ?? 0) === (int) $rec['id']) {
                $index = $i;
            }
        }
        if ($index === null) {
            $rec['id'] = $maxId + 1;
            $rows[] = $rec;
        } else {
            $rows[$index] = $rec;
        }
        $bundle['inquiries'] = array_values($rows);
        cms_ops_json_save_bundle($bundle);
        return cms_inq_normalize($rec);
    }

    cms_inq_migrate_if_needed();
    $pdo = cms_db();
    $params = [
        'token' => $rec['token'],
        'name' => $rec['customer_name'],
        'phone' => $rec['customer_phone'],
        'event_type' => $rec['event_type'],
        'ages' => json_encode(array_values($rec['age_groups']), JSON_UNESCAPED_UNICODE),
        'participants' => $rec['participants'],
        'max_games' => $rec['max_games'],
        'expires' => $rec['expires_at'],
        'opened' => $rec['opened_at'],
        'submitted' => $rec['submitted_at'],
    ];
    $pdo->beginTransaction();
    try {
        if ((int) $rec['id'] > 0) {
            $params['id'] = (int) $rec['id'];
            $pdo->prepare(
                'UPDATE inquiries SET customer_name = :name, customer_phone = :phone, event_type = :event_type,
                        age_groups = :ages, participants = :participants, max_games = :max_games,
                        expires_at = :expires, opened_at = :opened, submitted_at = :submitted
                 WHERE id = :id',
            )->execute(array_diff_key($params, ['token' => 1]));
            $id = (int) $rec['id'];
        } else {
            $pdo->prepare(
                'INSERT INTO inquiries (token, customer_name, customer_phone, event_type, age_groups,
                        participants, max_games, expires_at, opened_at, submitted_at)
                 VALUES (:token, :name, :phone, :event_type, :ages, :participants, :max_games, :expires, :opened, :submitted)',
            )->execute($params);
            $id = (int) $pdo->lastInsertId();
        }
        $pdo->prepare('DELETE FROM inquiry_games WHERE inquiry_id = :id')->execute(['id' => $id]);
        $ins = $pdo->prepare(
            'INSERT INTO inquiry_games (inquiry_id, game_id, sort_order, selected) VALUES (:i, :g, :s, :sel)',
        );
        foreach ($rec['game_ids'] as $order => $gameId) {
            $ins->execute([
                'i' => $id,
                'g' => $gameId,
                's' => $order,
                'sel' => in_array($gameId, $rec['selected_ids'], true) ? 1 : 0,
            ]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    $saved = cms_inq_find((string) $id);
    return $saved ?? cms_inq_normalize(array_merge($rec, ['id' => $id]));
}

function cms_inq_remove(string $id): bool
{
    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $rows = isset($bundle['inquiries']) && is_array($bundle['inquiries']) ? $bundle['inquiries'] : [];
        $kept = [];
        $found = false;
        foreach ($rows as $row) {
            if (is_array($row) && (string) ($row['id'] ?? '') === $id) {
                $found = true;
                continue;
            }
            $kept[] = $row;
        }
        if ($found) {
            $bundle['inquiries'] = $kept;
            cms_ops_json_save_bundle($bundle);
        }
        return $found;
    }
    cms_inq_migrate_if_needed();
    if (!ctype_digit($id)) {
        return false;
    }
    $stmt = cms_db()->prepare('DELETE FROM inquiries WHERE id = :id');
    $stmt->execute(['id' => (int) $id]);
    return $stmt->rowCount() > 0;
}

/* --------------------------------------------------------------- validation */

/**
 * @param array<string, mixed> $body
 * @return array{ok: true, data: array<string, mixed>}|array{ok: false, errors: array<string, string>}
 */
function cms_inq_validate(array $body, bool $requireExpiry): array
{
    $errors = [];

    $name = trim(preg_replace('/\s+/', ' ', (string) ($body['customer_name'] ?? '')) ?? '');
    if ($name === '') {
        $errors['customer_name'] = 'Enter the customer name.';
    } elseif (cms_ops_text_len($name) > 120) {
        $errors['customer_name'] = 'Use 120 characters or fewer.';
    }

    $phone = trim((string) ($body['customer_phone'] ?? ''));
    if ($phone !== '') {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if (strlen($digits) < 8 || strlen($digits) > 15) {
            $errors['customer_phone'] = 'Enter a valid phone number.';
        } else {
            $phone = $digits;
        }
    }

    $eventType = trim((string) ($body['event_type'] ?? ''));
    if ($eventType === '') {
        $errors['event_type'] = 'Choose an event type.';
    } elseif (cms_ops_game_code_list([$eventType]) === []) {
        $errors['event_type'] = 'Choose an event type from the list.';
    }

    $ages = cms_ops_game_code_list($body['age_groups'] ?? []);
    if ($ages === []) {
        $errors['age_groups'] = 'Choose at least one age group.';
    }

    $participants = $body['participants'] ?? null;
    $participantsValue = null;
    if ($participants !== null && $participants !== '') {
        if (!is_numeric($participants) || (int) $participants < 1 || (int) $participants > 5000 || (float) $participants != (int) $participants) {
            $errors['participants'] = 'Enter a whole number between 1 and 5000.';
        } else {
            $participantsValue = (int) $participants;
        }
    }

    $maxGames = $body['max_games'] ?? null;
    $maxGamesValue = null;
    if ($maxGames !== null && $maxGames !== '') {
        if (!is_numeric($maxGames) || (int) $maxGames < 1 || (int) $maxGames > 100 || (float) $maxGames != (int) $maxGames) {
            $errors['max_games'] = 'Enter a whole number between 1 and 100.';
        } else {
            $maxGamesValue = (int) $maxGames;
        }
    }

    $gameIds = cms_ops_int_ids($body['game_ids'] ?? []);
    if ($gameIds === []) {
        $errors['game_ids'] = 'Add at least one game for the customer to choose from.';
    } else {
        $known = [];
        foreach (cms_ops_list_games() as $game) {
            $known[(int) $game['id']] = true;
        }
        foreach ($gameIds as $gameId) {
            if (!isset($known[$gameId])) {
                $errors['game_ids'] = 'One of the games no longer exists. Refresh and try again.';
                break;
            }
        }
    }
    if ($maxGamesValue !== null && $gameIds !== [] && !isset($errors['game_ids']) && $maxGamesValue > count($gameIds)) {
        $errors['max_games'] = 'The limit is higher than the number of games you added.';
    }

    $expiry = null;
    if ($requireExpiry) {
        $minutes = $body['expiry_minutes'] ?? null;
        if (!is_numeric($minutes) || (int) $minutes < CMS_INQ_MIN_EXPIRY_MINUTES || (int) $minutes > CMS_INQ_MAX_EXPIRY_MINUTES) {
            $errors['expiry_minutes'] = 'Choose how long the link stays open.';
        } else {
            $expiry = (int) $minutes;
        }
    }

    if ($errors !== []) {
        return ['ok' => false, 'errors' => $errors];
    }
    return [
        'ok' => true,
        'data' => [
            'customer_name' => $name,
            'customer_phone' => $phone !== '' ? $phone : null,
            'event_type' => $eventType,
            'age_groups' => $ages,
            'participants' => $participantsValue,
            'max_games' => $maxGamesValue,
            'game_ids' => $gameIds,
            'expiry_minutes' => $expiry,
        ],
    ];
}

/* ------------------------------------------------------------ serialization */

/**
 * @param array<string, mixed> $rec
 * @param array<int, array<string, mixed>> $gamesById
 * @return array<string, mixed>
 */
function cms_inq_admin_view(array $rec, array $gamesById, bool $detail): array
{
    $out = [
        'id' => $rec['id'],
        'token' => $rec['token'],
        'customer_name' => $rec['customer_name'],
        'customer_phone' => $rec['customer_phone'],
        'event_type' => $rec['event_type'],
        'age_groups' => $rec['age_groups'],
        'participants' => $rec['participants'],
        'max_games' => $rec['max_games'],
        'status' => cms_inq_status($rec),
        'created_at' => cms_inq_iso($rec['created_at']),
        'expires_at' => cms_inq_iso($rec['expires_at']),
        'opened_at' => cms_inq_iso($rec['opened_at']),
        'submitted_at' => cms_inq_iso($rec['submitted_at']),
        'game_count' => count($rec['game_ids']),
        'selected_count' => count($rec['selected_ids']),
        'server_time' => gmdate('c'),
    ];
    if ($detail) {
        $out['game_ids'] = $rec['game_ids'];
        $out['selected_ids'] = $rec['selected_ids'];
        $out['selected_games'] = [];
        foreach ($rec['selected_ids'] as $gameId) {
            if (isset($gamesById[$gameId])) {
                $out['selected_games'][] = ['id' => $gameId, 'name' => (string) $gamesById[$gameId]['name']];
            }
        }
    }
    return $out;
}

/** @return array<int, array<string, mixed>> */
function cms_inq_games_by_id(): array
{
    $byId = [];
    foreach (cms_ops_games_public_list() as $game) {
        $byId[(int) $game['id']] = $game;
    }
    return $byId;
}

/**
 * What the customer is allowed to see.
 *
 * @param array<string, mixed> $rec
 * @return array<string, mixed>
 */
function cms_inq_customer_view(array $rec): array
{
    $byId = cms_inq_games_by_id();
    $games = [];
    foreach ($rec['game_ids'] as $gameId) {
        if (!isset($byId[$gameId])) {
            continue;
        }
        $g = $byId[$gameId];
        $games[] = [
            'id' => $g['id'],
            'name' => $g['name'],
            'description' => $g['description'],
            'formation' => $g['formation'],
            'avg_duration_minutes' => $g['avg_duration_minutes'],
            'group_size' => $g['group_size'],
            'traits' => $g['traits'],
            'video_url' => $g['video_url'],
            'venue_indoor' => $g['venue_indoor'],
            'venue_outdoor' => $g['venue_outdoor'],
        ];
    }
    return [
        'customer_name' => $rec['customer_name'],
        'event_type' => $rec['event_type'],
        'age_groups' => $rec['age_groups'],
        'participants' => $rec['participants'],
        'max_games' => $rec['max_games'],
        'status' => cms_inq_status($rec),
        'expires_at' => cms_inq_iso($rec['expires_at']),
        'submitted_at' => cms_inq_iso($rec['submitted_at']),
        'server_time' => gmdate('c'),
        'games' => $games,
        'selected_ids' => $rec['selected_ids'],
    ];
}

/* ------------------------------------------------------------- notification */

/**
 * @param array<string, mixed> $rec
 */
function cms_inq_notify_admin(array $rec): void
{
    try {
        $byId = cms_inq_games_by_id();
        $names = [];
        foreach ($rec['selected_ids'] as $gameId) {
            if (isset($byId[$gameId])) {
                $names[] = (string) $byId[$gameId]['name'];
            }
        }
        $link = cms_public_origin() . '/ops/inquiries/' . $rec['id'];
        $who = (string) $rec['customer_name'];
        $lines = [
            $who . ' has chosen their games.',
            '',
            'Event type: ' . $rec['event_type'],
            'Age groups: ' . implode(', ', $rec['age_groups']),
        ];
        if ($rec['participants'] !== null) {
            $lines[] = 'Participants: ' . $rec['participants'];
        }
        $lines[] = '';
        $lines[] = 'Selected games (' . count($names) . '):';
        foreach ($names as $name) {
            $lines[] = '- ' . $name;
        }
        $lines[] = '';
        $lines[] = 'Open the inquiry: ' . $link;
        $text = implode("\n", $lines);

        $items = '';
        foreach ($names as $name) {
            $items .= '<li style="margin:0 0 4px">' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</li>';
        }
        $html = '<div style="font-family:Arial,sans-serif;color:#032a5d;max-width:560px">'
            . '<h2 style="margin:0 0 8px">' . htmlspecialchars($who, ENT_QUOTES, 'UTF-8') . ' chose their games</h2>'
            . '<p style="margin:0 0 12px">' . htmlspecialchars((string) $rec['event_type'], ENT_QUOTES, 'UTF-8')
            . ' &middot; ' . htmlspecialchars(implode(', ', $rec['age_groups']), ENT_QUOTES, 'UTF-8')
            . ($rec['participants'] !== null ? ' &middot; ' . (int) $rec['participants'] . ' participants' : '')
            . '</p>'
            . '<p style="margin:0 0 4px"><strong>Selected games (' . count($names) . ')</strong></p>'
            . '<ul style="margin:0 0 16px;padding-left:20px">' . $items . '</ul>'
            . '<p><a href="' . htmlspecialchars($link, ENT_QUOTES, 'UTF-8') . '" style="background:#032a5d;color:#fff;'
            . 'padding:10px 16px;border-radius:8px;text-decoration:none">Open inquiry</a></p></div>';

        cms_mail_send(
            cms_settings_notify_email(),
            'Games selected — ' . $who,
            $text,
            null,
            $html,
        );
    } catch (Throwable $e) {
        // The selection is already saved; a mail failure must not block the customer.
    }
}
