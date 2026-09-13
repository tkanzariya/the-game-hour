<?php
declare(strict_types=1);

/**
 * Bubble CSV → games, team_members, events (with G- Coaches / G- Selected Games ID joins).
 */

require_once __DIR__ . '/ops-migrate.php';
require_once __DIR__ . '/ops-store.php';

const CMS_BUBBLE_IMPORT_HMAC_MESSAGE = 'tgh-bubble-csv-v1';

/** @return array<string, string> */
function cms_bubble_age_group_map(): array
{
    return [
        '4-7' => '4-7',
        '8-12' => '8-12',
        '13-14' => '13-14',
        'adults (15+)' => '15+_adults',
        'adults(15+)' => '15+_adults',
        '15+_adults' => '15+_adults',
        'senior citizen' => 'senior_citizens',
        'senior citizens' => 'senior_citizens',
        'senior_citizens' => 'senior_citizens',
    ];
}

/** @return array<string, string> */
function cms_bubble_event_type_map(): array
{
    return [
        'birthday' => 'birthday',
        'get together' => 'get_together',
        'get_together' => 'get_together',
        'traditional' => 'traditional',
        'playdate' => 'playdate',
        'game festival' => 'game_festival',
        'game_festival' => 'game_festival',
        'sports day' => 'sports_day',
        'sports_day' => 'sports_day',
        'kitty party' => 'kitty_party',
        'kitty_party' => 'kitty_party',
        'corporate' => 'corporate',
    ];
}

function cms_bubble_import_token(): string
{
    $pass = (string) (cms_config()['db']['pass'] ?? '');
    if ($pass === '' || str_contains($pass, 'CHANGE_ME')) {
        return '';
    }
    return hash_hmac('sha256', CMS_BUBBLE_IMPORT_HMAC_MESSAGE, $pass);
}

function cms_bubble_http_authorized(): bool
{
    $user = cms_current_user();
    if (is_array($user) && ($user['role'] ?? '') === 'admin') {
        return true;
    }
    $header = $_SERVER['HTTP_X_TGH_IMPORT_TOKEN'] ?? '';
    $expected = cms_bubble_import_token();
    return $expected !== '' && is_string($header) && hash_equals($expected, $header);
}

/**
 * @return list<array<string, string>>
 */
function cms_bubble_parse_csv(string $path): array
{
    if (!is_file($path)) {
        throw new RuntimeException('CSV not found: ' . $path);
    }
    $fh = fopen($path, 'r');
    if ($fh === false) {
        throw new RuntimeException('Cannot read CSV: ' . $path);
    }
    $headers = fgetcsv($fh);
    if (!is_array($headers) || $headers === []) {
        fclose($fh);
        throw new RuntimeException('CSV has no header row: ' . $path);
    }
    $headers = array_map(static fn ($h) => trim((string) $h), $headers);
    $rows = [];
    while (($row = fgetcsv($fh)) !== false) {
        if ($row === [null] || $row === []) {
            continue;
        }
        $assoc = [];
        foreach ($headers as $i => $header) {
            if ($header === '') {
                continue;
            }
            $assoc[$header] = trim((string) ($row[$i] ?? ''));
        }
        $rows[] = $assoc;
    }
    fclose($fh);
    return $rows;
}

function cms_bubble_cell(array $row, string ...$keys): string
{
    foreach ($keys as $key) {
        if (array_key_exists($key, $row) && trim((string) $row[$key]) !== '') {
            return trim((string) $row[$key]);
        }
    }
    return '';
}

/** @return list<string> */
function cms_bubble_split_list(string $raw): array
{
    if (trim($raw) === '') {
        return [];
    }
    $parts = preg_split('/\s*,\s*/', $raw) ?: [];
    $out = [];
    foreach ($parts as $part) {
        $part = trim($part);
        if ($part !== '') {
            $out[] = $part;
        }
    }
    return $out;
}

/** @return list<string> */
function cms_bubble_id_list(string $raw): array
{
    $ids = [];
    foreach (cms_bubble_split_list($raw) as $part) {
        if (preg_match('/^\d+x\d+$/', $part) === 1) {
            $ids[] = $part;
        }
    }
    return array_values(array_unique($ids));
}

function cms_bubble_parse_datetime(string $raw): ?DateTimeImmutable
{
    $raw = trim($raw);
    if ($raw === '') {
        return null;
    }
    foreach (['M j, Y g:i a', 'M j, Y h:i a', 'M d, Y g:i a', 'M d, Y h:i a'] as $fmt) {
        $dt = DateTimeImmutable::createFromFormat('!' . $fmt, $raw);
        if ($dt instanceof DateTimeImmutable) {
            return $dt;
        }
    }
    $ts = strtotime($raw);
    if ($ts === false) {
        return null;
    }
    return (new DateTimeImmutable('@' . $ts))->setTimezone(new DateTimeZone(date_default_timezone_get()));
}

function cms_bubble_yes_no(string $raw): int
{
    $v = strtolower(trim($raw));
    return in_array($v, ['yes', 'y', 'true', '1'], true) ? 1 : 0;
}

function cms_bubble_https_url(string $raw): ?string
{
    $raw = trim($raw);
    if ($raw === '') {
        return null;
    }
    if (str_starts_with($raw, '//')) {
        return 'https:' . $raw;
    }
    return $raw;
}

function cms_bubble_map_age_group(string $raw): ?string
{
    $key = strtolower(preg_replace('/\s+/', ' ', trim($raw)) ?? '');
    return cms_bubble_age_group_map()[$key] ?? null;
}

function cms_bubble_map_event_type(string $raw): ?string
{
    $key = strtolower(preg_replace('/\s+/', ' ', trim($raw)) ?? '');
    return cms_bubble_event_type_map()[$key] ?? null;
}

function cms_bubble_map_position(string $raw): string
{
    $allowed = ['Coach', 'IT', 'Trainer', 'Sales', 'Marketing', 'BDE'];
    $needle = strtolower(trim($raw));
    foreach ($allowed as $value) {
        if (strtolower($value) === $needle) {
            return $value;
        }
    }
    return 'Coach';
}

function cms_bubble_map_status(string $raw): string
{
    $v = strtolower(trim($raw));
    if (in_array($v, ['completed', 'complete', 'done'], true)) {
        return 'completed';
    }
    if (in_array($v, ['cancelled', 'canceled'], true)) {
        return 'cancelled';
    }
    return 'pending';
}

function cms_bubble_map_category(string $raw): string
{
    return strtolower(trim($raw)) === 'corporate' ? 'corporate' : 'social';
}

function cms_bubble_map_venue(string $raw, string $fallback = 'indoor'): string
{
    $v = strtolower(trim($raw));
    if (str_contains($v, 'outdoor')) {
        return 'outdoor';
    }
    if (str_contains($v, 'indoor')) {
        return 'indoor';
    }
    return $fallback;
}

function cms_bubble_map_payment(string $raw): string
{
    $v = strtolower(trim($raw));
    if (str_contains($v, 'cash')) {
        return 'online_cash';
    }
    return 'online';
}

function cms_bubble_money(string $raw): ?string
{
    $raw = trim(str_replace([',', '₹', 'Rs.', 'Rs'], '', $raw));
    if ($raw === '') {
        return null;
    }
    if (!is_numeric($raw)) {
        return null;
    }
    return number_format((float) $raw, 2, '.', '');
}

function cms_bubble_phone(string $raw): string
{
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    if (strlen($digits) > 20) {
        $digits = substr($digits, -20);
    }
    return $digits;
}

/**
 * @param list<array<string, string>> $rows
 * @return array{games: list<array<string, mixed>>, team: list<array<string, mixed>>, events: list<array<string, mixed>>, warnings: list<string>}
 */
function cms_bubble_transform(array $gameRows, array $teamRows, array $eventRows): array
{
    $warnings = [];
    $games = [];
    foreach ($gameRows as $i => $row) {
        $mapped = cms_bubble_map_game($row);
        if ($mapped === null) {
            $warnings[] = 'Skipped game row ' . ($i + 2) . ' (missing unique id or name).';
            continue;
        }
        $games[] = $mapped;
    }

    $team = [];
    foreach ($teamRows as $i => $row) {
        $mapped = cms_bubble_map_team($row);
        if ($mapped === null) {
            $warnings[] = 'Skipped team row ' . ($i + 2) . ' (missing unique id or name).';
            continue;
        }
        $team[] = $mapped;
    }

    $gameIds = [];
    foreach ($games as $game) {
        $gameIds[$game['bubble_id']] = true;
    }
    $teamIds = [];
    foreach ($team as $member) {
        $teamIds[$member['bubble_id']] = true;
    }

    $events = [];
    foreach ($eventRows as $i => $row) {
        $mapped = cms_bubble_map_event($row);
        if ($mapped === null) {
            $warnings[] = 'Skipped event row ' . ($i + 2) . ' (missing unique id).';
            continue;
        }
        foreach ($mapped['game_bubble_ids'] as $id) {
            if (!isset($gameIds[$id])) {
                $warnings[] = 'Event ' . $mapped['bubble_id'] . ' references unknown game ' . $id . '.';
            }
        }
        foreach ($mapped['team_bubble_ids'] as $id) {
            if (!isset($teamIds[$id])) {
                $warnings[] = 'Event ' . $mapped['bubble_id'] . ' references unknown coach ' . $id . '.';
            }
        }
        $events[] = $mapped;
    }

    return ['games' => $games, 'team' => $team, 'events' => $events, 'warnings' => $warnings];
}

/** @param array<string, string> $row */
function cms_bubble_map_game(array $row): ?array
{
    $bubbleId = cms_bubble_cell($row, 'unique id', 'unique_id', 'Unique id');
    $name = cms_bubble_cell($row, '01 Game Name', 'Game Name', 'Game name', 'name');
    if ($bubbleId === '' || $name === '') {
        return null;
    }
    $venueRaw = strtolower(cms_bubble_cell($row, 'Venue Type', 'Venue type'));
    $ageGroups = [];
    foreach (cms_bubble_split_list(cms_bubble_cell($row, 'Age Group', 'Age group')) as $part) {
        $mapped = cms_bubble_map_age_group($part);
        if ($mapped !== null) {
            $ageGroups[] = $mapped;
        }
    }
    $eventTypes = [];
    foreach (cms_bubble_split_list(cms_bubble_cell($row, 'Event Type', 'Event type')) as $part) {
        $mapped = cms_bubble_map_event_type($part);
        if ($mapped !== null) {
            $eventTypes[] = $mapped;
        }
    }
    $created = cms_bubble_parse_datetime(cms_bubble_cell($row, 'Creation Date', 'Creation date'));
    $duration = cms_bubble_cell($row, 'Avg Duration', 'Avg duration');
    $category = cms_bubble_cell($row, 'Game Category', 'Game category');
    $video = cms_bubble_https_url(cms_bubble_cell($row, 'Video Link', 'Video link'));

    return [
        'bubble_id' => $bubbleId,
        'name' => $name,
        'description' => cms_bubble_cell($row, 'Game Card Description', 'Game card description') ?: null,
        'category' => $category !== '' ? $category : null,
        'formation' => cms_bubble_cell($row, 'Formation') ?: null,
        'avg_duration_minutes' => ctype_digit($duration) ? (int) $duration : null,
        'group_size' => cms_bubble_cell($row, 'Group Size', 'Group size') ?: null,
        'traits' => cms_bubble_cell($row, 'Traits') ?: null,
        'video_url' => $video,
        'venue_indoor' => str_contains($venueRaw, 'indoor') ? 1 : 0,
        'venue_outdoor' => str_contains($venueRaw, 'outdoor') ? 1 : 0,
        'age_groups' => array_values(array_unique($ageGroups)),
        'event_types' => array_values(array_unique($eventTypes)),
        'created_at' => $created?->format('Y-m-d H:i:s'),
    ];
}

/** @param array<string, string> $row */
function cms_bubble_map_team(array $row): ?array
{
    $bubbleId = cms_bubble_cell($row, 'unique id', 'unique_id');
    $name = cms_bubble_cell($row, 'Name');
    if ($bubbleId === '' || $name === '') {
        return null;
    }
    $dob = cms_bubble_parse_datetime(cms_bubble_cell($row, 'DOB'));
    $created = cms_bubble_parse_datetime(cms_bubble_cell($row, 'Creation Date', 'Creation date'));
    $email = strtolower(cms_bubble_cell($row, 'Email'));

    return [
        'bubble_id' => $bubbleId,
        'name' => $name,
        'email' => $email !== '' ? $email : null,
        'phone' => cms_bubble_phone(cms_bubble_cell($row, 'Phone')),
        'address' => cms_bubble_cell($row, 'Address') ?: null,
        'date_of_birth' => $dob?->format('Y-m-d'),
        'position' => cms_bubble_map_position(cms_bubble_cell($row, 'Current Postion', 'Current Position', 'Position')),
        'employment_status' => cms_bubble_cell($row, 'Employment Status') ?: null,
        'previous_company' => cms_bubble_cell($row, 'Previous/Current Company') ?: null,
        'previous_post' => cms_bubble_cell($row, 'Previous/Current Post') ?: null,
        'qualification' => cms_bubble_cell($row, 'Qualification') ?: null,
        'referral' => cms_bubble_cell($row, 'Referral') ?: null,
        'resume_path' => cms_bubble_https_url(cms_bubble_cell($row, 'Resume')),
        'has_vehicle' => cms_bubble_yes_no(cms_bubble_cell($row, 'Vehicle Status')),
        'willing_to_travel' => cms_bubble_yes_no(cms_bubble_cell($row, 'Willingness to Travel')),
        'created_at' => $created?->format('Y-m-d H:i:s'),
    ];
}

/** @param array<string, string> $row */
function cms_bubble_map_event(array $row): ?array
{
    $bubbleId = cms_bubble_cell($row, 'unique id', 'unique_id');
    if ($bubbleId === '') {
        return null;
    }
    $category = cms_bubble_map_category(cms_bubble_cell($row, 'E - Main Event Type', 'E- Main Event Type'));
    $status = cms_bubble_map_status(cms_bubble_cell($row, 'Event Status'));
    $when = cms_bubble_parse_datetime(cms_bubble_cell($row, 'E - Event Timings', 'E- Event Timings'));
    $created = cms_bubble_parse_datetime(cms_bubble_cell($row, 'Creation Date', 'Creation date'));
    if ($when === null) {
        $when = $created ?? new DateTimeImmutable('now');
    }
    $termsAt = $created ?? $when;
    $nameField = cms_bubble_cell($row, 'E - Birthday/Company Name', 'E- Birthday/Company Name');
    $age = cms_bubble_map_age_group(cms_bubble_cell($row, 'E - Age Group', 'E- Age Group'));
    $type = cms_bubble_map_event_type(cms_bubble_cell($row, 'E - Type of Event', 'E- Type of Event'));
    $participants = cms_bubble_cell($row, 'E - Participants', 'E- Participants');
    $instagram = ltrim(cms_bubble_cell($row, 'C- Insta ID', 'C- Instagram'), '@');
    $advanceDate = cms_bubble_parse_datetime(cms_bubble_cell($row, 'P - Advance Date'));
    $finalDate = cms_bubble_parse_datetime(cms_bubble_cell($row, 'P - Final Payment Date'));

    return [
        'bubble_id' => $bubbleId,
        'event_category' => $category,
        'event_status' => $status,
        'email' => strtolower(cms_bubble_cell($row, 'C- Email')) ?: 'imported@thegamehour.local',
        'contact_name' => cms_bubble_cell($row, 'C- Name'),
        'phone' => cms_bubble_phone(cms_bubble_cell($row, 'C- Contact No')),
        'address' => cms_bubble_cell($row, 'C- Address'),
        'birthday_person_name' => $category === 'social' ? ($nameField !== '' ? $nameField : null) : null,
        'company_name' => $category === 'corporate' ? ($nameField !== '' ? $nameField : null) : null,
        'event_type' => $type,
        'participant_count' => ctype_digit($participants) && (int) $participants > 0 ? (int) $participants : 1,
        'age_group' => $age,
        'event_date' => $when->format('Y-m-d'),
        'event_time' => $when->format('H:i:s'),
        'venue_name' => cms_bubble_cell($row, 'E - Venue Address', 'E- Venue Address') ?: null,
        'venue_type' => cms_bubble_map_venue(cms_bubble_cell($row, 'E - Venue Type', 'E- Venue Type')),
        'payment_mode' => cms_bubble_map_payment(cms_bubble_cell($row, 'C- Payment Method')),
        'referral_source' => cms_bubble_cell($row, 'E - Source', 'E- Source') ?: null,
        'special_requirements' => cms_bubble_cell($row, 'E - Special Requirements', 'E- Special Requirements') ?: null,
        'terms_accepted_at' => $termsAt->format('Y-m-d H:i:s'),
        'price' => cms_bubble_money(cms_bubble_cell($row, 'P - Price')),
        'advance_amount' => cms_bubble_money(cms_bubble_cell($row, 'P - Advance Amount')),
        'full_payment_amount' => cms_bubble_money(cms_bubble_cell($row, 'P - Final Amount')),
        'event_expenses' => cms_bubble_money(cms_bubble_cell($row, 'P - Event Expenses')),
        'advance_payment_date' => $advanceDate?->format('Y-m-d'),
        'full_payment_date' => $finalDate?->format('Y-m-d'),
        'advance_payment_completed' => cms_bubble_yes_no(cms_bubble_cell($row, 'P - Advance Payment Done?')),
        'full_payment_completed' => cms_bubble_yes_no(cms_bubble_cell($row, 'P - Full Payment Done?')),
        'payment_screenshot_path' => cms_bubble_https_url(cms_bubble_cell($row, 'Payment SS')),
        'instagram_handle' => $instagram !== '' ? $instagram : null,
        'added_to_calendar' => $status === 'pending' ? 0 : 1,
        'created_at' => $created?->format('Y-m-d H:i:s'),
        'game_bubble_ids' => cms_bubble_id_list(cms_bubble_cell($row, 'G- Selected Games')),
        'team_bubble_ids' => cms_bubble_id_list(cms_bubble_cell($row, 'G- Coaches')),
    ];
}

/**
 * @return array{games: list<array<string, mixed>>, team: list<array<string, mixed>>, events: list<array<string, mixed>>, warnings: list<string>}
 */
function cms_bubble_load_from_paths(string $gamesPath, string $teamPath, string $eventsPath): array
{
    return cms_bubble_transform(
        cms_bubble_parse_csv($gamesPath),
        cms_bubble_parse_csv($teamPath),
        cms_bubble_parse_csv($eventsPath),
    );
}

function cms_bubble_sql_quote(mixed $value): string
{
    if ($value === null) {
        return 'NULL';
    }
    if (is_int($value) || is_float($value)) {
        return (string) $value;
    }
    $s = (string) $value;
    return "'" . str_replace(["\\", "'"], ["\\\\", "''"], $s) . "'";
}

function cms_bubble_sql_ident(string $name): string
{
    return '`' . str_replace('`', '``', $name) . '`';
}

/**
 * @param array<string, mixed> $row
 * @param list<string> $columns
 */
function cms_bubble_sql_values(array $row, array $columns): string
{
    $parts = [];
    foreach ($columns as $col) {
        $parts[] = cms_bubble_sql_quote($row[$col] ?? null);
    }
    return '(' . implode(', ', $parts) . ')';
}

/**
 * @param array{games: list<array<string, mixed>>, team: list<array<string, mixed>>, events: list<array<string, mixed>>} $data
 */
function cms_bubble_build_sql(array $data): string
{
    $out = [];
    $out[] = '-- Bubble CSV import (generated). Do not commit — contains customer PII.';
    $out[] = '-- Re-runnable: upserts on bubble_id. Does not delete form bookings without bubble_id.';
    $out[] = 'SET NAMES utf8mb4;';
    $out[] = 'SET FOREIGN_KEY_CHECKS = 0;';
    $out[] = 'START TRANSACTION;';
    $out[] = '';

    $ops = dirname(__DIR__) . '/sql/migrate-ops.sql';
    $ids = dirname(__DIR__) . '/sql/migrate-bubble-ids.sql';
    if (is_file($ops)) {
        $out[] = '-- ops tables';
        $out[] = trim((string) file_get_contents($ops));
        $out[] = '';
    }
    if (is_file($ids)) {
        $out[] = trim((string) file_get_contents($ids));
        $out[] = '';
    }

    $teamCols = [
        'bubble_id', 'name', 'email', 'phone', 'address', 'date_of_birth', 'position',
        'employment_status', 'previous_company', 'previous_post', 'qualification', 'referral',
        'resume_path', 'has_vehicle', 'willing_to_travel', 'created_at',
    ];
    $out[] = 'INSERT INTO team_members (' . implode(', ', array_map('cms_bubble_sql_ident', $teamCols)) . ') VALUES';
    $teamValues = [];
    foreach ($data['team'] as $row) {
        $teamValues[] = '  ' . cms_bubble_sql_values($row, $teamCols);
    }
    $out[] = implode(",\n", $teamValues);
    $out[] = 'ON DUPLICATE KEY UPDATE';
    $updates = [];
    foreach ($teamCols as $col) {
        if ($col === 'bubble_id' || $col === 'created_at') {
            continue;
        }
        $updates[] = '  ' . cms_bubble_sql_ident($col) . ' = VALUES(' . cms_bubble_sql_ident($col) . ')';
    }
    $out[] = implode(",\n", $updates) . ';';
    $out[] = '';

    $gameCols = [
        'bubble_id', 'name', 'description', 'category', 'formation', 'avg_duration_minutes',
        'group_size', 'traits', 'video_url', 'venue_indoor', 'venue_outdoor', 'created_at',
    ];
    $out[] = 'INSERT INTO games (' . implode(', ', array_map('cms_bubble_sql_ident', $gameCols)) . ') VALUES';
    $gameValues = [];
    foreach ($data['games'] as $row) {
        $gameValues[] = '  ' . cms_bubble_sql_values($row, $gameCols);
    }
    $out[] = implode(",\n", $gameValues);
    $out[] = 'ON DUPLICATE KEY UPDATE';
    $updates = [];
    foreach ($gameCols as $col) {
        if ($col === 'bubble_id' || $col === 'created_at') {
            continue;
        }
        $updates[] = '  ' . cms_bubble_sql_ident($col) . ' = VALUES(' . cms_bubble_sql_ident($col) . ')';
    }
    $out[] = implode(",\n", $updates) . ';';
    $out[] = '';

    $out[] = 'DELETE gag FROM game_age_groups gag INNER JOIN games g ON g.id = gag.game_id WHERE g.bubble_id IS NOT NULL;';
    $out[] = 'DELETE gety FROM game_event_types gety INNER JOIN games g ON g.id = gety.game_id WHERE g.bubble_id IS NOT NULL;';
    foreach ($data['games'] as $row) {
        foreach ($row['age_groups'] as $age) {
            $out[] = 'INSERT IGNORE INTO game_age_groups (game_id, age_group) SELECT id, '
                . cms_bubble_sql_quote($age) . ' FROM games WHERE bubble_id = ' . cms_bubble_sql_quote($row['bubble_id']) . ' LIMIT 1;';
        }
        foreach ($row['event_types'] as $type) {
            $out[] = 'INSERT IGNORE INTO game_event_types (game_id, event_type) SELECT id, '
                . cms_bubble_sql_quote($type) . ' FROM games WHERE bubble_id = ' . cms_bubble_sql_quote($row['bubble_id']) . ' LIMIT 1;';
        }
    }
    $out[] = '';

    $eventCols = [
        'bubble_id', 'event_category', 'event_status', 'email', 'contact_name', 'phone', 'address',
        'birthday_person_name', 'company_name', 'event_type', 'participant_count', 'age_group',
        'event_date', 'event_time', 'venue_name', 'venue_type', 'payment_mode', 'referral_source',
        'special_requirements', 'terms_accepted_at', 'price', 'advance_amount', 'full_payment_amount',
        'event_expenses', 'advance_payment_date', 'full_payment_date', 'advance_payment_completed',
        'full_payment_completed', 'payment_screenshot_path', 'instagram_handle', 'added_to_calendar',
        'created_at',
    ];
    $out[] = 'INSERT INTO events (' . implode(', ', array_map('cms_bubble_sql_ident', $eventCols)) . ') VALUES';
    $eventValues = [];
    foreach ($data['events'] as $row) {
        $eventValues[] = '  ' . cms_bubble_sql_values($row, $eventCols);
    }
    $out[] = implode(",\n", $eventValues);
    $out[] = 'ON DUPLICATE KEY UPDATE';
    $updates = [];
    foreach ($eventCols as $col) {
        if ($col === 'bubble_id' || $col === 'created_at' || $col === 'terms_accepted_at') {
            continue;
        }
        $updates[] = '  ' . cms_bubble_sql_ident($col) . ' = VALUES(' . cms_bubble_sql_ident($col) . ')';
    }
    $out[] = implode(",\n", $updates) . ';';
    $out[] = '';

    $out[] = 'DELETE eg FROM event_games eg INNER JOIN events e ON e.id = eg.event_id WHERE e.bubble_id IS NOT NULL;';
    $out[] = 'DELETE et FROM event_team et INNER JOIN events e ON e.id = et.event_id WHERE e.bubble_id IS NOT NULL;';
    foreach ($data['events'] as $row) {
        $sort = 0;
        foreach ($row['game_bubble_ids'] as $gameId) {
            $out[] = 'INSERT IGNORE INTO event_games (event_id, game_id, sort_order) SELECT e.id, g.id, '
                . $sort . ' FROM events e JOIN games g ON g.bubble_id = ' . cms_bubble_sql_quote($gameId)
                . ' WHERE e.bubble_id = ' . cms_bubble_sql_quote($row['bubble_id']) . ';';
            $sort++;
        }
        foreach ($row['team_bubble_ids'] as $teamId) {
            $out[] = 'INSERT IGNORE INTO event_team (event_id, team_member_id) SELECT e.id, t.id FROM events e JOIN team_members t ON t.bubble_id = '
                . cms_bubble_sql_quote($teamId) . ' WHERE e.bubble_id = ' . cms_bubble_sql_quote($row['bubble_id']) . ';';
        }
    }

    $out[] = '';
    $out[] = 'SET FOREIGN_KEY_CHECKS = 1;';
    $out[] = 'COMMIT;';
    return implode("\n", $out) . "\n";
}

/**
 * @param array{games: list<array<string, mixed>>, team: list<array<string, mixed>>, events: list<array<string, mixed>>} $data
 * @return array{games: int, team: int, events: int}
 */
function cms_bubble_apply_pdo(PDO $pdo, array $data): array
{
    cms_ops_migrate_if_needed();
    cms_ops_add_event_columns();
    cms_ops_add_bubble_id_columns();

    $pdo->beginTransaction();
    try {
        $teamIds = [];
        foreach ($data['team'] as $row) {
            $teamIds[$row['bubble_id']] = cms_bubble_upsert_team($pdo, $row);
        }
        $gameIds = [];
        foreach ($data['games'] as $row) {
            $gameIds[$row['bubble_id']] = cms_bubble_upsert_game($pdo, $row);
        }
        foreach ($data['events'] as $row) {
            $eventId = cms_bubble_upsert_event($pdo, $row);
            cms_ops_replace_event_games(
                $eventId,
                array_values(array_filter(array_map(
                    static fn (string $id): int => $gameIds[$id] ?? 0,
                    $row['game_bubble_ids'],
                ))),
            );
            cms_ops_replace_event_team(
                $eventId,
                array_values(array_filter(array_map(
                    static fn (string $id): int => $teamIds[$id] ?? 0,
                    $row['team_bubble_ids'],
                ))),
            );
        }
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }

    return [
        'games' => count($data['games']),
        'team' => count($data['team']),
        'events' => count($data['events']),
    ];
}

function cms_bubble_lookup_id(PDO $pdo, string $table, string $bubbleId): ?int
{
    $stmt = $pdo->prepare('SELECT id FROM ' . cms_bubble_sql_ident($table) . ' WHERE bubble_id = :id LIMIT 1');
    $stmt->execute(['id' => $bubbleId]);
    $found = $stmt->fetchColumn();
    return $found !== false ? (int) $found : null;
}

/** @param array<string, mixed> $row */
function cms_bubble_upsert_team(PDO $pdo, array $row): int
{
    $id = cms_bubble_lookup_id($pdo, 'team_members', $row['bubble_id']);
    $fields = [
        'name', 'email', 'phone', 'address', 'date_of_birth', 'position', 'employment_status',
        'previous_company', 'previous_post', 'qualification', 'referral', 'resume_path',
        'has_vehicle', 'willing_to_travel', 'bubble_id',
    ];
    if ($id === null) {
        $cols = $fields;
        if (!empty($row['created_at'])) {
            $cols[] = 'created_at';
        }
        $sql = 'INSERT INTO team_members (' . implode(', ', array_map('cms_bubble_sql_ident', $cols)) . ') VALUES ('
            . implode(', ', array_map(static fn (string $c): string => ':' . $c, $cols)) . ')';
        $pdo->prepare($sql)->execute(cms_bubble_bind($row, $cols));
        return (int) $pdo->lastInsertId();
    }
    $sets = [];
    foreach ($fields as $col) {
        if ($col === 'bubble_id') {
            continue;
        }
        $sets[] = cms_bubble_sql_ident($col) . ' = :' . $col;
    }
    $bind = cms_bubble_bind($row, $fields);
    $bind['id'] = $id;
    $pdo->prepare('UPDATE team_members SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($bind);
    return $id;
}

/** @param array<string, mixed> $row */
function cms_bubble_upsert_game(PDO $pdo, array $row): int
{
    $id = cms_bubble_lookup_id($pdo, 'games', $row['bubble_id']);
    $fields = [
        'name', 'description', 'category', 'formation', 'avg_duration_minutes', 'group_size',
        'traits', 'video_url', 'venue_indoor', 'venue_outdoor', 'bubble_id',
    ];
    if ($id === null) {
        $cols = $fields;
        if (!empty($row['created_at'])) {
            $cols[] = 'created_at';
        }
        $sql = 'INSERT INTO games (' . implode(', ', array_map('cms_bubble_sql_ident', $cols)) . ') VALUES ('
            . implode(', ', array_map(static fn (string $c): string => ':' . $c, $cols)) . ')';
        $pdo->prepare($sql)->execute(cms_bubble_bind($row, $cols));
        $id = (int) $pdo->lastInsertId();
    } else {
        $sets = [];
        foreach ($fields as $col) {
            if ($col === 'bubble_id') {
                continue;
            }
            $sets[] = cms_bubble_sql_ident($col) . ' = :' . $col;
        }
        $bind = cms_bubble_bind($row, $fields);
        $bind['id'] = $id;
        $pdo->prepare('UPDATE games SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($bind);
    }
    $pdo->prepare('DELETE FROM game_age_groups WHERE game_id = :id')->execute(['id' => $id]);
    $pdo->prepare('DELETE FROM game_event_types WHERE game_id = :id')->execute(['id' => $id]);
    $ageStmt = $pdo->prepare('INSERT INTO game_age_groups (game_id, age_group) VALUES (:game_id, :age_group)');
    foreach ($row['age_groups'] as $age) {
        $ageStmt->execute(['game_id' => $id, 'age_group' => $age]);
    }
    $typeStmt = $pdo->prepare('INSERT INTO game_event_types (game_id, event_type) VALUES (:game_id, :event_type)');
    foreach ($row['event_types'] as $type) {
        $typeStmt->execute(['game_id' => $id, 'event_type' => $type]);
    }
    return $id;
}

/** @param array<string, mixed> $row */
function cms_bubble_upsert_event(PDO $pdo, array $row): int
{
    $id = cms_bubble_lookup_id($pdo, 'events', $row['bubble_id']);
    $fields = [
        'event_category', 'event_status', 'email', 'contact_name', 'phone', 'address',
        'birthday_person_name', 'company_name', 'event_type', 'participant_count', 'age_group',
        'event_date', 'event_time', 'venue_name', 'venue_type', 'payment_mode', 'referral_source',
        'special_requirements', 'terms_accepted_at', 'price', 'advance_amount', 'full_payment_amount',
        'event_expenses', 'advance_payment_date', 'full_payment_date', 'advance_payment_completed',
        'full_payment_completed', 'payment_screenshot_path', 'instagram_handle', 'added_to_calendar',
        'bubble_id',
    ];
    if ($id === null) {
        $cols = $fields;
        if (!empty($row['created_at'])) {
            $cols[] = 'created_at';
        }
        $sql = 'INSERT INTO events (' . implode(', ', array_map('cms_bubble_sql_ident', $cols)) . ') VALUES ('
            . implode(', ', array_map(static fn (string $c): string => ':' . $c, $cols)) . ')';
        $pdo->prepare($sql)->execute(cms_bubble_bind($row, $cols));
        return (int) $pdo->lastInsertId();
    }
    $sets = [];
    foreach ($fields as $col) {
        if ($col === 'bubble_id' || $col === 'terms_accepted_at') {
            continue;
        }
        $sets[] = cms_bubble_sql_ident($col) . ' = :' . $col;
    }
    $bind = cms_bubble_bind($row, $fields);
    unset($bind['terms_accepted_at']);
    $bind['id'] = $id;
    $pdo->prepare('UPDATE events SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($bind);
    return $id;
}

/**
 * @param array<string, mixed> $row
 * @param list<string> $cols
 * @return array<string, mixed>
 */
function cms_bubble_bind(array $row, array $cols): array
{
    $bind = [];
    foreach ($cols as $col) {
        $bind[$col] = $row[$col] ?? null;
    }
    return $bind;
}

/**
 * @param array{games: list<array<string, mixed>>, team: list<array<string, mixed>>, events: list<array<string, mixed>>} $data
 * @return array{games: int, team: int, events: int}
 */
function cms_bubble_apply_json(array $data): array
{
    $bundle = cms_ops_json_bundle();
    $nextId = 1;
    foreach (array_merge($bundle['games'], $bundle['team'], $bundle['bookings']) as $row) {
        if (is_array($row) && isset($row['id']) && is_numeric($row['id'])) {
            $nextId = max($nextId, (int) $row['id'] + 1);
        }
    }

    $teamByBubble = [];
    foreach ($bundle['team'] as $i => $row) {
        if (is_array($row) && !empty($row['bubble_id'])) {
            $teamByBubble[(string) $row['bubble_id']] = $i;
        }
    }
    $teamIds = [];
    foreach ($data['team'] as $row) {
        $idx = $teamByBubble[$row['bubble_id']] ?? null;
        if ($idx === null) {
            $row['id'] = $nextId++;
            $bundle['team'][] = $row;
            $teamIds[$row['bubble_id']] = (int) $row['id'];
        } else {
            $row['id'] = (int) $bundle['team'][$idx]['id'];
            $bundle['team'][$idx] = array_merge($bundle['team'][$idx], $row);
            $teamIds[$row['bubble_id']] = (int) $row['id'];
        }
    }

    $gameByBubble = [];
    foreach ($bundle['games'] as $i => $row) {
        if (is_array($row) && !empty($row['bubble_id'])) {
            $gameByBubble[(string) $row['bubble_id']] = $i;
        }
    }
    $gameIds = [];
    foreach ($data['games'] as $row) {
        $idx = $gameByBubble[$row['bubble_id']] ?? null;
        if ($idx === null) {
            $row['id'] = $nextId++;
            $bundle['games'][] = $row;
            $gameIds[$row['bubble_id']] = (int) $row['id'];
        } else {
            $row['id'] = (int) $bundle['games'][$idx]['id'];
            $bundle['games'][$idx] = array_merge($bundle['games'][$idx], $row);
            $gameIds[$row['bubble_id']] = (int) $row['id'];
        }
    }

    $eventByBubble = [];
    foreach ($bundle['bookings'] as $i => $row) {
        if (is_array($row) && !empty($row['bubble_id'])) {
            $eventByBubble[(string) $row['bubble_id']] = $i;
        }
    }
    foreach ($data['events'] as $row) {
        $row['game_ids'] = array_values(array_filter(array_map(
            static fn (string $id): int => $gameIds[$id] ?? 0,
            $row['game_bubble_ids'],
        )));
        $row['team_ids'] = array_values(array_filter(array_map(
            static fn (string $id): int => $teamIds[$id] ?? 0,
            $row['team_bubble_ids'],
        )));
        unset($row['game_bubble_ids'], $row['team_bubble_ids']);
        $idx = $eventByBubble[$row['bubble_id']] ?? null;
        if ($idx === null) {
            $row['id'] = $nextId++;
            $bundle['bookings'][] = $row;
        } else {
            $row['id'] = $bundle['bookings'][$idx]['id'];
            $bundle['bookings'][$idx] = array_merge($bundle['bookings'][$idx], $row);
        }
    }

    cms_ops_json_save_bundle($bundle);
    return [
        'games' => count($data['games']),
        'team' => count($data['team']),
        'events' => count($data['events']),
    ];
}
