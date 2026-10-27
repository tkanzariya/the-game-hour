<?php
declare(strict_types=1);

/**
 * Keep events in sync with a Google Calendar using a service account.
 *
 * Nothing here may break a booking or an edit: every public function catches its own
 * errors and returns a result array instead of throwing. When Google is not configured
 * the functions do nothing.
 *
 * Needs the openssl and curl PHP extensions. Keep PHP 7.4-safe.
 */

require_once __DIR__ . '/ops-store.php';
require_once __DIR__ . '/mail.php';

const CMS_GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

/* ------------------------------------------------------------------- config */

/**
 * Check the settings and say what is wrong, in plain words. Never includes secret values.
 *
 * @param array<string, mixed> $all the whole CMS config array
 * @return array{config: array<string, mixed>|null, problem: string|null}
 */
function cms_gcal_inspect(array $all, string $configFile = 'config.php'): array
{
    $cfg = $all['google_calendar'] ?? null;
    if (!is_array($cfg)) {
        foreach ($all as $section => $value) {
            if (is_array($value) && isset($value['google_calendar']) && is_array($value['google_calendar'])) {
                return [
                    'config' => null,
                    'problem' => 'The google_calendar block is inside the \'' . $section . '\' section of '
                        . $configFile . '. Move it out so it sits directly inside the main list, just above the final "];".',
                ];
            }
        }
        return [
            'config' => null,
            'problem' => 'No google_calendar block found in ' . $configFile . ' on the server.'
                . ($configFile !== 'config.php' ? ' (This server is reading ' . $configFile . ' instead of config.php.)' : ''),
        ];
    }
    if (array_key_exists('enabled', $cfg) && !$cfg['enabled']) {
        return ['config' => null, 'problem' => 'google_calendar is switched off (enabled is false).'];
    }

    $email = trim((string) ($cfg['client_email'] ?? ''));
    $key = (string) ($cfg['private_key'] ?? '');
    $file = trim((string) ($cfg['service_account_file'] ?? ''));
    if ($file !== '') {
        if (!is_file($file) || !is_readable($file)) {
            if ($email === '' || $key === '') {
                return ['config' => null, 'problem' => 'service_account_file points to a file that cannot be read.'];
            }
        } else {
            $json = json_decode((string) file_get_contents($file), true);
            if (is_array($json)) {
                $email = trim((string) ($json['client_email'] ?? $email));
                $key = (string) ($json['private_key'] ?? $key);
            }
        }
    }
    $key = str_replace('\\n', "\n", $key);
    // Forgive a key pasted without its BEGIN/END lines (only the long text in the middle).
    $body = preg_replace('/\s+/', '', $key) ?? '';
    if (strpos($key, 'BEGIN') === false && strlen($body) > 800 && preg_match('#^[A-Za-z0-9+/=]+$#', $body) === 1) {
        $key = "-----BEGIN PRIVATE KEY-----\n" . chunk_split($body, 64, "\n") . "-----END PRIVATE KEY-----\n";
    }
    $calendarId = trim((string) ($cfg['calendar_id'] ?? ''));

    if ($calendarId === '') {
        return ['config' => null, 'problem' => 'calendar_id is empty.'];
    }
    if ($email === '') {
        return ['config' => null, 'problem' => 'client_email is empty.'];
    }
    if (stripos($email, 'paste') !== false || strpos($email, '@') === false) {
        return ['config' => null, 'problem' => 'client_email still has the placeholder text or is not an email address.'];
    }
    if (trim($key) === '') {
        return ['config' => null, 'problem' => 'private_key is empty.'];
    }
    if (stripos($key, 'paste') !== false && strpos($key, 'PRIVATE KEY') === false) {
        return ['config' => null, 'problem' => 'private_key still has the placeholder text.'];
    }
    if (strpos($key, 'BEGIN PRIVATE KEY') === false || strpos($key, 'END PRIVATE KEY') === false) {
        return [
            'config' => null,
            'problem' => 'private_key is incomplete. It must start with -----BEGIN PRIVATE KEY----- and end with -----END PRIVATE KEY-----.',
        ];
    }

    $duration = (int) ($cfg['default_duration_minutes'] ?? 120);
    return [
        'config' => [
            'calendar_id' => $calendarId,
            'client_email' => $email,
            'private_key' => $key,
            'timezone' => trim((string) ($cfg['timezone'] ?? '')) ?: 'Asia/Kolkata',
            'duration' => $duration >= 15 && $duration <= 1440 ? $duration : 120,
            // Overridable so the flow can be tested against a local stand-in for Google.
            'token_url' => trim((string) ($cfg['token_url'] ?? '')) ?: 'https://oauth2.googleapis.com/token',
            'api_base' => rtrim(trim((string) ($cfg['api_base'] ?? '')) ?: 'https://www.googleapis.com/calendar/v3', '/'),
        ],
        'problem' => null,
    ];
}

/** Which config file the CMS is reading (a config.local.php next to it takes over). */
function cms_gcal_config_file_name(): string
{
    return is_file(__DIR__ . '/../config.local.php') ? 'config.local.php' : 'config.php';
}

/** @return array{config: array<string, mixed>|null, problem: string|null} */
function cms_gcal_state(): array
{
    static $state = null;
    if ($state === null) {
        $state = cms_gcal_inspect(cms_config(), cms_gcal_config_file_name());
    }
    return $state;
}

/**
 * Normalized settings, or null when calendar sync is switched off or incomplete.
 *
 * @return array<string, mixed>|null
 */
function cms_gcal_config()
{
    return cms_gcal_state()['config'];
}

/** Plain-words reason the sync is not running, or null when it is ready. */
function cms_gcal_setup_issue(): ?string
{
    return cms_gcal_state()['problem'];
}

function cms_gcal_enabled(): bool
{
    return cms_gcal_config() !== null;
}

function cms_gcal_log(string $message): void
{
    error_log('[google-calendar] ' . $message);
}

/* --------------------------------------------------------------------- http */

/**
 * @param list<string> $headers
 * @return array{status: int, body: array<string, mixed>|null, error: string}
 */
function cms_gcal_http(string $method, string $url, array $headers = [], $body = null): array
{
    if (!function_exists('curl_init')) {
        return ['status' => 0, 'body' => null, 'error' => 'PHP curl is required.'];
    }
    $ch = curl_init($url);
    if ($ch === false) {
        return ['status' => 0, 'body' => null, 'error' => 'Could not start the request.'];
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT => 12,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $cafile = (string) ini_get('curl.cainfo');
    if ($cafile !== '' && is_file($cafile)) {
        curl_setopt($ch, CURLOPT_CAINFO, $cafile);
    }
    $raw = curl_exec($ch);
    $errno = curl_errno($ch);
    $curlError = curl_error($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno !== 0 || $raw === false) {
        return ['status' => 0, 'body' => null, 'error' => 'Could not reach Google. ' . $curlError];
    }
    $decoded = json_decode((string) $raw, true);
    return ['status' => $status, 'body' => is_array($decoded) ? $decoded : null, 'error' => ''];
}

/** @param array<string, mixed>|null $body */
function cms_gcal_error_text(array $response, string $fallback): string
{
    if ($response['error'] !== '') {
        return $response['error'];
    }
    $body = $response['body'];
    if (is_array($body)) {
        if (isset($body['error']['message'])) {
            return (string) $body['error']['message'];
        }
        if (isset($body['error_description'])) {
            return (string) $body['error_description'];
        }
        if (isset($body['error']) && is_string($body['error'])) {
            return $body['error'];
        }
    }
    return $fallback . ' (HTTP ' . $response['status'] . ')';
}

/* -------------------------------------------------------------------- token */

function cms_gcal_b64url(string $raw): string
{
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
}

/**
 * Short-lived access token for the service account, cached on disk for about an hour.
 *
 * @param array<string, mixed> $cfg
 * @return array{ok: true, token: string}|array{ok: false, error: string}
 */
function cms_gcal_token(array $cfg): array
{
    if (!function_exists('openssl_sign')) {
        return ['ok' => false, 'error' => 'The PHP openssl extension is required.'];
    }
    $cache = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tgh_gcal_' . md5($cfg['client_email'] . '|' . $cfg['token_url']) . '.json';
    if (is_file($cache)) {
        $saved = json_decode((string) file_get_contents($cache), true);
        if (is_array($saved) && !empty($saved['token']) && (int) ($saved['exp'] ?? 0) > time() + 60) {
            return ['ok' => true, 'token' => (string) $saved['token']];
        }
    }

    $now = time();
    $header = cms_gcal_b64url((string) json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claims = cms_gcal_b64url((string) json_encode([
        'iss' => $cfg['client_email'],
        'scope' => CMS_GCAL_SCOPE,
        'aud' => $cfg['token_url'],
        'iat' => $now,
        'exp' => $now + 3600,
    ]));
    $signature = '';
    $key = openssl_pkey_get_private($cfg['private_key']);
    if ($key === false || !openssl_sign($header . '.' . $claims, $signature, $key, OPENSSL_ALGO_SHA256)) {
        return ['ok' => false, 'error' => 'The service account private key could not be read.'];
    }

    $response = cms_gcal_http(
        'POST',
        (string) $cfg['token_url'],
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $header . '.' . $claims . '.' . cms_gcal_b64url($signature),
        ]),
    );
    $token = is_array($response['body']) ? (string) ($response['body']['access_token'] ?? '') : '';
    if ($response['status'] !== 200 || $token === '') {
        return ['ok' => false, 'error' => 'Google sign-in failed: ' . cms_gcal_error_text($response, 'No token')];
    }
    $lifetime = is_array($response['body']) ? (int) ($response['body']['expires_in'] ?? 3600) : 3600;
    @file_put_contents($cache, json_encode(['token' => $token, 'exp' => $now + $lifetime]), LOCK_EX);
    return ['ok' => true, 'token' => $token];
}

/**
 * @param array<string, mixed> $cfg
 * @param array<string, mixed>|null $payload
 * @return array{status: int, body: array<string, mixed>|null, error: string}
 */
function cms_gcal_call(array $cfg, string $method, string $path, $payload = null): array
{
    $token = cms_gcal_token($cfg);
    if (!$token['ok']) {
        return ['status' => 0, 'body' => null, 'error' => $token['error']];
    }
    $url = $cfg['api_base'] . '/calendars/' . rawurlencode((string) $cfg['calendar_id']) . $path;
    $headers = ['Authorization: Bearer ' . $token['token'], 'Accept: application/json'];
    $body = null;
    if ($payload !== null) {
        $headers[] = 'Content-Type: application/json';
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    return cms_gcal_http($method, $url, $headers, $body);
}

/* ------------------------------------------------------------ event content */

/** @param array<string, mixed> $row */
function cms_gcal_type_label(array $row): string
{
    if ((string) ($row['event_category'] ?? '') === 'corporate') {
        return 'Corporate event';
    }
    $type = (string) ($row['event_type'] ?? '');
    return $type === '' ? 'Event' : ucwords(str_replace('_', ' ', $type));
}

/**
 * Google event resource for a stored event, or null when it has no usable date.
 *
 * @param array<string, mixed> $row
 * @param array<string, mixed> $cfg
 * @return array<string, mixed>|null
 */
function cms_gcal_event_body(array $row, array $cfg)
{
    $date = (string) ($row['event_date'] ?? '');
    if (preg_match('/^\d{4}-\d{2}-\d{2}/', $date) !== 1) {
        return null;
    }
    $date = substr($date, 0, 10);
    $time = (string) ($row['event_time'] ?? '');
    $zone = new DateTimeZone((string) $cfg['timezone']);

    if (preg_match('/^(\d{2}):(\d{2})/', $time, $m) === 1) {
        $start = new DateTimeImmutable($date . ' ' . $m[1] . ':' . $m[2] . ':00', $zone);
        $end = $start->modify('+' . (int) $cfg['duration'] . ' minutes');
        $when = [
            'start' => ['dateTime' => $start->format('c'), 'timeZone' => (string) $cfg['timezone']],
            'end' => ['dateTime' => $end->format('c'), 'timeZone' => (string) $cfg['timezone']],
        ];
    } else {
        $day = new DateTimeImmutable($date, $zone);
        $when = [
            'start' => ['date' => $day->format('Y-m-d')],
            'end' => ['date' => $day->modify('+1 day')->format('Y-m-d')],
        ];
    }

    $who = cms_ops_display_name($row);
    $lines = [];
    $add = static function (string $label, $value) use (&$lines): void {
        $text = trim((string) $value);
        if ($text !== '') {
            $lines[] = $label . ': ' . $text;
        }
    };
    $add('Customer', trim((string) ($row['contact_name'] ?? '')));
    $add('Phone', $row['phone'] ?? '');
    $add('Email', $row['email'] ?? '');
    $add('Birthday person', $row['birthday_person_name'] ?? '');
    $add('Participants', ($row['participant_count'] ?? 0) ? (string) $row['participant_count'] : '');
    $add('Age group', $row['age_group'] ?? '');
    $add('Venue type', $row['venue_type'] ?? '');
    $add('Address', $row['address'] ?? '');
    $add('Notes', $row['special_requirements'] ?? '');
    $lines[] = '';
    $lines[] = 'Open in Ops: ' . cms_public_origin() . '/ops/events/' . $row['id'];

    $location = trim((string) ($row['venue_name'] ?? ''));
    if ($location === '') {
        $location = trim((string) ($row['address'] ?? ''));
    }

    return array_merge([
        'summary' => cms_gcal_type_label($row) . ': ' . $who,
        'description' => implode("\n", $lines),
        'location' => $location,
        'extendedProperties' => ['private' => ['tgh_event_id' => (string) $row['id']]],
    ], $when);
}

/* ------------------------------------------------------------------ storage */

/** Add the link column once; harmless if it already exists. */
function cms_gcal_ensure_column(): void
{
    static $done = false;
    if ($done || cms_dev_json_enabled()) {
        return;
    }
    $done = true;
    try {
        if (!cms_ops_column_exists('events', 'google_event_id')) {
            cms_db()->exec('ALTER TABLE events ADD COLUMN google_event_id VARCHAR(128) DEFAULT NULL');
        }
    } catch (Throwable $e) {
        cms_gcal_log('Could not add google_event_id column: ' . $e->getMessage());
    }
}

/** @return array<string, mixed>|null */
function cms_gcal_load_row(string $id)
{
    if (cms_dev_json_enabled()) {
        return cms_ops_find_json_booking($id);
    }
    cms_gcal_ensure_column();
    if (!ctype_digit($id)) {
        return null;
    }
    $stmt = cms_db()->prepare('SELECT * FROM events WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => (int) $id]);
    $row = $stmt->fetch();
    return is_array($row) ? $row : null;
}

/** Remember (or forget) the Google event id; optionally flip the "on calendar" flag. */
function cms_gcal_store_link(string $id, ?string $googleId, ?bool $onCalendar): void
{
    if (cms_dev_json_enabled()) {
        $bundle = cms_ops_json_bundle();
        foreach ($bundle['bookings'] as $i => $booking) {
            if (is_array($booking) && (string) ($booking['id'] ?? '') === $id) {
                $bundle['bookings'][$i]['google_event_id'] = $googleId;
                if ($onCalendar !== null) {
                    $bundle['bookings'][$i]['added_to_calendar'] = $onCalendar ? 1 : 0;
                }
                cms_ops_json_save_bundle($bundle);
                return;
            }
        }
        return;
    }
    $sql = 'UPDATE events SET google_event_id = :g' . ($onCalendar !== null ? ', added_to_calendar = :f' : '') . ' WHERE id = :id';
    $params = ['g' => $googleId, 'id' => (int) $id];
    if ($onCalendar !== null) {
        $params['f'] = $onCalendar ? 1 : 0;
    }
    cms_db()->prepare($sql)->execute($params);
}

/* --------------------------------------------------------------- operations */

/**
 * @param array<string, mixed> $cfg
 * @param array<string, mixed> $row
 * @return array{ok: true, id: string, created: bool}|array{ok: false, error: string}
 */
function cms_gcal_upsert(array $cfg, array $row): array
{
    $body = cms_gcal_event_body($row, $cfg);
    if ($body === null) {
        return ['ok' => false, 'error' => 'The event has no valid date.'];
    }
    $eventId = trim((string) ($row['google_event_id'] ?? ''));

    // After a half-finished earlier attempt the event may exist without us knowing its id.
    if ($eventId === '') {
        $found = cms_gcal_call(
            $cfg,
            'GET',
            '/events?maxResults=1&showDeleted=false&privateExtendedProperty=' . rawurlencode('tgh_event_id=' . $row['id']),
        );
        if ($found['status'] === 200 && is_array($found['body']) && !empty($found['body']['items'][0]['id'])) {
            $eventId = (string) $found['body']['items'][0]['id'];
        } elseif ($found['status'] !== 200) {
            return ['ok' => false, 'error' => cms_gcal_error_text($found, 'Could not read the calendar')];
        }
    }

    if ($eventId !== '') {
        $patched = cms_gcal_call($cfg, 'PATCH', '/events/' . rawurlencode($eventId), $body);
        if ($patched['status'] === 200) {
            return ['ok' => true, 'id' => $eventId, 'created' => false];
        }
        if ($patched['status'] !== 404 && $patched['status'] !== 410) {
            return ['ok' => false, 'error' => cms_gcal_error_text($patched, 'Could not update the calendar event')];
        }
        // Deleted by hand in Google Calendar: fall through and create it again.
    }

    $created = cms_gcal_call($cfg, 'POST', '/events', $body);
    $newId = is_array($created['body']) ? (string) ($created['body']['id'] ?? '') : '';
    if (($created['status'] !== 200 && $created['status'] !== 201) || $newId === '') {
        return ['ok' => false, 'error' => cms_gcal_error_text($created, 'Could not create the calendar event')];
    }
    return ['ok' => true, 'id' => $newId, 'created' => true];
}

/**
 * @param array<string, mixed> $cfg
 * @return array{ok: bool, error?: string}
 */
function cms_gcal_delete_remote(array $cfg, string $googleId): array
{
    $res = cms_gcal_call($cfg, 'DELETE', '/events/' . rawurlencode($googleId));
    if ($res['status'] === 204 || $res['status'] === 200 || $res['status'] === 404 || $res['status'] === 410) {
        return ['ok' => true];
    }
    return ['ok' => false, 'error' => cms_gcal_error_text($res, 'Could not remove the calendar event')];
}

/**
 * Bring the Google Calendar entry in line with the stored event.
 *
 * Options:
 *  - create: add it if it is not on the calendar yet (a fresh booking, or an explicit request)
 *  - force:  ignore the "already on my calendar" flag and the past-date check
 *
 * Without create or force, an unlinked event is only added when it is still upcoming and
 * not already marked as on the calendar (events added by hand before this existed).
 *
 * @param array<string, bool> $opts
 * @return array{ok: bool, action: string, error?: string}
 */
function cms_gcal_sync(string $id, array $opts = []): array
{
    try {
        $cfg = cms_gcal_config();
        if ($cfg === null) {
            return ['ok' => true, 'action' => 'skipped'];
        }
        $row = cms_gcal_load_row($id);
        if ($row === null) {
            return ['ok' => false, 'action' => 'none', 'error' => 'Event not found.'];
        }
        $force = !empty($opts['force']);
        $linked = trim((string) ($row['google_event_id'] ?? ''));
        $status = cms_ops_canonical_event_status($row['event_status'] ?? 'pending');

        if ($status === 'cancelled') {
            if ($linked === '') {
                return ['ok' => true, 'action' => 'none'];
            }
            $removed = cms_gcal_delete_remote($cfg, $linked);
            if (!$removed['ok']) {
                cms_gcal_log('Event ' . $id . ': ' . $removed['error']);
                return ['ok' => false, 'action' => 'none', 'error' => (string) $removed['error']];
            }
            cms_gcal_store_link($id, null, false);
            return ['ok' => true, 'action' => 'deleted'];
        }

        if ($linked === '' && !$force && empty($opts['create'])) {
            $date = substr((string) ($row['event_date'] ?? ''), 0, 10);
            $upcoming = $date !== '' && $date >= date('Y-m-d');
            $manual = (int) ($row['added_to_calendar'] ?? 0) === 1;
            if (!$upcoming || $manual) {
                return ['ok' => true, 'action' => 'none'];
            }
        }

        $result = cms_gcal_upsert($cfg, $row);
        if (!$result['ok']) {
            cms_gcal_log('Event ' . $id . ': ' . $result['error']);
            return ['ok' => false, 'action' => 'none', 'error' => $result['error']];
        }
        cms_gcal_store_link($id, $result['id'], $result['created'] ? true : null);
        return ['ok' => true, 'action' => $result['created'] ? 'created' : 'updated'];
    } catch (Throwable $e) {
        cms_gcal_log('Event ' . $id . ': ' . $e->getMessage());
        return ['ok' => false, 'action' => 'none', 'error' => 'Calendar sync failed.'];
    }
}

/** Call before an event is deleted so it does not linger on the calendar. */
function cms_gcal_remove_before_delete(string $id): void
{
    try {
        $cfg = cms_gcal_config();
        if ($cfg === null) {
            return;
        }
        $row = cms_gcal_load_row($id);
        $linked = $row === null ? '' : trim((string) ($row['google_event_id'] ?? ''));
        if ($linked !== '') {
            $removed = cms_gcal_delete_remote($cfg, $linked);
            if (!$removed['ok']) {
                cms_gcal_log('Event ' . $id . ': ' . $removed['error']);
            }
        }
    } catch (Throwable $e) {
        cms_gcal_log('Event ' . $id . ': ' . $e->getMessage());
    }
}

/**
 * Run the sync after the response has gone out, so a slow Google never delays a customer.
 *
 * @param array<string, bool> $opts
 */
function cms_gcal_sync_after_response(string $id, array $opts = []): void
{
    if (!cms_gcal_enabled()) {
        return;
    }
    register_shutdown_function(static function () use ($id, $opts): void {
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        } elseif (function_exists('litespeed_finish_request')) {
            litespeed_finish_request();
        }
        cms_gcal_sync($id, $opts);
    });
}
