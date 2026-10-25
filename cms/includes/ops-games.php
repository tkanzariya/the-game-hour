<?php
declare(strict_types=1);

/**
 * Games catalog: normalize, validate, create, update, delete.
 * Keep PHP 7.4-safe (no str_contains, match, union types, nullsafe).
 */

require_once __DIR__ . '/ops-store.php';

const CMS_OPS_GAME_FORMATIONS = [
    'Open Formation',
    'Circle Formation',
    'Team Game',
    'Race Game',
    'Rest Game',
];

const CMS_OPS_GAME_GROUP_SIZES = [
    'Small (1-5 people)',
    'Medium (6-10 people)',
    'Large (11-20 people)',
    'Extra Large (21+ people)',
];

const CMS_OPS_GAME_MAX_TRAITS = 12;

/** Length in characters; works without the mbstring extension. */
function cms_ops_text_len(string $text): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($text, 'UTF-8');
    }
    $count = preg_match_all('/./us', $text);
    return $count === false ? strlen($text) : $count;
}

function cms_ops_text_lower(string $text): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
}

/**
 * @param mixed $raw JSON string, comma-separated string, or array
 * @return list<string>
 */
function cms_ops_game_traits_list($raw): array
{
    if (is_string($raw)) {
        $trimmed = trim($raw);
        if ($trimmed === '') {
            return [];
        }
        $decoded = json_decode($trimmed, true);
        $raw = is_array($decoded) ? $decoded : explode(',', $trimmed);
    }
    if (!is_array($raw)) {
        return [];
    }
    $out = [];
    $seen = [];
    foreach ($raw as $item) {
        $trait = trim(preg_replace('/\s+/', ' ', (string) $item) ?? '');
        if ($trait === '' || cms_ops_text_len($trait) > 40) {
            continue;
        }
        $key = cms_ops_text_lower($trait);
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        $out[] = $trait;
        if (count($out) >= CMS_OPS_GAME_MAX_TRAITS) {
            break;
        }
    }
    return $out;
}

/**
 * @param array<string, mixed> $row
 * @return array<string, mixed>
 */
function cms_ops_game_public(array $row): array
{
    $duration = $row['avg_duration_minutes'] ?? null;
    return [
        'id' => (int) $row['id'],
        'name' => (string) $row['name'],
        'description' => isset($row['description']) ? (string) $row['description'] : '',
        'formation' => isset($row['formation']) && $row['formation'] !== '' ? (string) $row['formation'] : null,
        'avg_duration_minutes' => $duration !== null && $duration !== '' ? (int) $duration : null,
        'group_size' => isset($row['group_size']) && $row['group_size'] !== '' ? (string) $row['group_size'] : null,
        'traits' => cms_ops_game_traits_list($row['traits'] ?? []),
        'video_url' => isset($row['video_url']) && $row['video_url'] !== '' ? (string) $row['video_url'] : null,
        'venue_indoor' => !empty($row['venue_indoor']),
        'venue_outdoor' => !empty($row['venue_outdoor']),
        'age_groups' => cms_ops_game_code_list($row['age_groups'] ?? []),
        'event_types' => cms_ops_game_code_list($row['event_types'] ?? []),
    ];
}

/**
 * @param mixed $raw
 * @return list<string>
 */
function cms_ops_game_code_list($raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    $out = [];
    foreach ($raw as $item) {
        $code = trim((string) $item);
        if ($code !== '' && cms_ops_text_len($code) <= 60 && preg_match('/[\x00-\x1F<>]/', $code) !== 1) {
            $out[] = $code;
        }
    }
    return array_values(array_unique($out));
}

/** @return list<array<string, mixed>> */
function cms_ops_games_public_list(): array
{
    return array_map('cms_ops_game_public', cms_ops_list_games());
}

/**
 * Validate and normalize a request body.
 *
 * @param array<string, mixed> $body
 * @return array{ok: true, data: array<string, mixed>}|array{ok: false, errors: array<string, string>}
 */
function cms_ops_game_validate(array $body): array
{
    $errors = [];

    $name = trim(preg_replace('/\s+/', ' ', (string) ($body['name'] ?? '')) ?? '');
    if ($name === '') {
        $errors['name'] = 'Enter a game name.';
    } elseif (cms_ops_text_len($name) > 120) {
        $errors['name'] = 'Use 120 characters or fewer.';
    }

    $formation = trim((string) ($body['formation'] ?? ''));
    if ($formation !== '' && !in_array($formation, CMS_OPS_GAME_FORMATIONS, true)) {
        $errors['formation'] = 'Choose a formation from the list.';
    }

    $groupSize = trim((string) ($body['group_size'] ?? ''));
    if ($groupSize !== '' && !in_array($groupSize, CMS_OPS_GAME_GROUP_SIZES, true)) {
        $errors['group_size'] = 'Choose a group size from the list.';
    }

    $duration = $body['avg_duration_minutes'] ?? null;
    $durationValue = null;
    if ($duration !== null && $duration !== '') {
        if (!is_numeric($duration) || (int) $duration < 1 || (int) $duration > 600 || (float) $duration != (int) $duration) {
            $errors['avg_duration_minutes'] = 'Enter whole minutes between 1 and 600.';
        } else {
            $durationValue = (int) $duration;
        }
    }

    $video = trim((string) ($body['video_url'] ?? ''));
    if ($video !== '') {
        if (cms_ops_text_len($video) > 512 || filter_var($video, FILTER_VALIDATE_URL) === false
            || preg_match('#^https?://#i', $video) !== 1) {
            $errors['video_url'] = 'Enter a full link starting with https://.';
        }
    }

    $description = trim((string) ($body['description'] ?? ''));
    if (cms_ops_text_len($description) > 2000) {
        $errors['description'] = 'Use 2000 characters or fewer.';
    }

    $eventTypes = cms_ops_game_code_list($body['event_types'] ?? []);
    $ageGroups = cms_ops_game_code_list($body['age_groups'] ?? []);

    $indoor = !empty($body['venue_indoor']);
    $outdoor = !empty($body['venue_outdoor']);

    if ($errors !== []) {
        return ['ok' => false, 'errors' => $errors];
    }

    return [
        'ok' => true,
        'data' => [
            'name' => $name,
            'description' => $description,
            'formation' => $formation !== '' ? $formation : null,
            'avg_duration_minutes' => $durationValue,
            'group_size' => $groupSize !== '' ? $groupSize : null,
            'traits' => cms_ops_game_traits_list($body['traits'] ?? []),
            'video_url' => $video !== '' ? $video : null,
            'venue_indoor' => $indoor,
            'venue_outdoor' => $outdoor,
            'age_groups' => $ageGroups,
            'event_types' => $eventTypes,
        ],
    ];
}

/**
 * @param array<string, mixed> $data validated payload
 * @return array{ok: true, game: array<string, mixed>}|array{ok: false, error: string, status?: int}
 */
function cms_ops_save_game(?string $id, array $data): array
{
    if (cms_dev_json_enabled()) {
        return cms_ops_save_game_json($id, $data);
    }
    cms_ops_migrate_if_needed();
    if (!cms_ops_tables_exist()) {
        return ['ok' => false, 'error' => 'Games are not set up yet.', 'status' => 500];
    }
    $pdo = cms_db();

    $dup = $pdo->prepare('SELECT id FROM games WHERE LOWER(name) = LOWER(:name) AND id <> :id LIMIT 1');
    $dup->execute(['name' => $data['name'], 'id' => $id !== null && ctype_digit($id) ? (int) $id : 0]);
    if ($dup->fetch()) {
        return ['ok' => false, 'error' => 'A game with this name already exists.', 'status' => 422];
    }

    $params = [
        'name' => $data['name'],
        'description' => $data['description'] !== '' ? $data['description'] : null,
        'formation' => $data['formation'],
        'duration' => $data['avg_duration_minutes'],
        'group_size' => $data['group_size'],
        'traits' => json_encode($data['traits'], JSON_UNESCAPED_UNICODE),
        'video_url' => $data['video_url'],
        'indoor' => $data['venue_indoor'] ? 1 : 0,
        'outdoor' => $data['venue_outdoor'] ? 1 : 0,
    ];

    $pdo->beginTransaction();
    try {
        if ($id === null) {
            $pdo->prepare(
                'INSERT INTO games (name, description, formation, avg_duration_minutes, group_size, traits, video_url, venue_indoor, venue_outdoor)
                 VALUES (:name, :description, :formation, :duration, :group_size, :traits, :video_url, :indoor, :outdoor)',
            )->execute($params);
            $gameId = (int) $pdo->lastInsertId();
        } else {
            if (!ctype_digit($id)) {
                $pdo->rollBack();
                return ['ok' => false, 'error' => 'Game not found.', 'status' => 404];
            }
            $gameId = (int) $id;
            $exists = $pdo->prepare('SELECT id FROM games WHERE id = :id LIMIT 1');
            $exists->execute(['id' => $gameId]);
            if (!$exists->fetch()) {
                $pdo->rollBack();
                return ['ok' => false, 'error' => 'Game not found.', 'status' => 404];
            }
            $params['id'] = $gameId;
            $pdo->prepare(
                'UPDATE games SET name = :name, description = :description, formation = :formation,
                        avg_duration_minutes = :duration, group_size = :group_size, traits = :traits,
                        video_url = :video_url, venue_indoor = :indoor, venue_outdoor = :outdoor
                 WHERE id = :id',
            )->execute($params);
        }

        $pdo->prepare('DELETE FROM game_age_groups WHERE game_id = :id')->execute(['id' => $gameId]);
        $pdo->prepare('DELETE FROM game_event_types WHERE game_id = :id')->execute(['id' => $gameId]);
        $ageStmt = $pdo->prepare('INSERT INTO game_age_groups (game_id, age_group) VALUES (:id, :value)');
        foreach ($data['age_groups'] as $value) {
            $ageStmt->execute(['id' => $gameId, 'value' => $value]);
        }
        $typeStmt = $pdo->prepare('INSERT INTO game_event_types (game_id, event_type) VALUES (:id, :value)');
        foreach ($data['event_types'] as $value) {
            $typeStmt->execute(['id' => $gameId, 'value' => $value]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        return ['ok' => false, 'error' => 'Could not save game.', 'status' => 500];
    }

    foreach (cms_ops_games_public_list() as $game) {
        if ($game['id'] === $gameId) {
            return ['ok' => true, 'game' => $game];
        }
    }
    return ['ok' => false, 'error' => 'Could not save game.', 'status' => 500];
}

/**
 * @param array<string, mixed> $data
 * @return array{ok: true, game: array<string, mixed>}|array{ok: false, error: string, status?: int}
 */
function cms_ops_save_game_json(?string $id, array $data): array
{
    $bundle = cms_ops_json_bundle();
    $maxId = 0;
    $index = null;
    foreach ($bundle['games'] as $i => $row) {
        if (!is_array($row)) {
            continue;
        }
        $rowId = (int) ($row['id'] ?? 0);
        $maxId = max($maxId, $rowId);
        if ($id !== null && (string) $rowId === $id) {
            $index = $i;
        }
        if (
            cms_ops_text_lower((string) ($row['name'] ?? '')) === cms_ops_text_lower((string) $data['name'])
            && (string) $rowId !== (string) $id
        ) {
            return ['ok' => false, 'error' => 'A game with this name already exists.', 'status' => 422];
        }
    }
    if ($id !== null && $index === null) {
        return ['ok' => false, 'error' => 'Game not found.', 'status' => 404];
    }

    $record = $data;
    $record['id'] = $id !== null ? (int) $id : $maxId + 1;
    if ($index === null) {
        $bundle['games'][] = $record;
    } else {
        $bundle['games'][$index] = $record;
    }
    cms_ops_json_save_bundle($bundle);

    return ['ok' => true, 'game' => cms_ops_game_public($record)];
}

/**
 * @return array{ok: true}|array{ok: false, error: string, status?: int}
 */
function cms_ops_delete_game(string $id): array
{
    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        $kept = [];
        $found = false;
        foreach ($bundle['games'] as $row) {
            if (is_array($row) && (string) ($row['id'] ?? '') === $id) {
                $found = true;
                continue;
            }
            $kept[] = $row;
        }
        if (!$found) {
            return ['ok' => false, 'error' => 'Game not found.', 'status' => 404];
        }
        $bundle['games'] = $kept;
        foreach ($bundle['bookings'] as $i => $booking) {
            if (is_array($booking) && isset($booking['game_ids']) && is_array($booking['game_ids'])) {
                $bundle['bookings'][$i]['game_ids'] = array_values(array_filter(
                    $booking['game_ids'],
                    static function ($gameId) use ($id): bool {
                        return (string) $gameId !== $id;
                    },
                ));
            }
        }
        cms_ops_json_save_bundle($bundle);
        return ['ok' => true];
    }

    cms_ops_migrate_if_needed();
    if (!ctype_digit($id) || !cms_ops_tables_exist()) {
        return ['ok' => false, 'error' => 'Game not found.', 'status' => 404];
    }
    $stmt = cms_db()->prepare('DELETE FROM games WHERE id = :id');
    $stmt->execute(['id' => (int) $id]);
    if ($stmt->rowCount() === 0) {
        return ['ok' => false, 'error' => 'Game not found.', 'status' => 404];
    }
    return ['ok' => true];
}
