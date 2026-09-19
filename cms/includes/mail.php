<?php
declare(strict_types=1);

/**
 * Internal booking alerts via Resend (free HTTP API).
 * Failures must not block saving the booking.
 */

require_once __DIR__ . '/settings-store.php';

function cms_mail_resend_api_key(): string
{
    return trim((string) (cms_config()['mail']['resend_api_key'] ?? ''));
}

function cms_mail_template_id(): string
{
    return trim((string) (cms_config()['mail']['resend_template_id'] ?? ''));
}

function cms_mail_from_address(): string
{
    $from = trim((string) (cms_config()['mail']['from'] ?? ''));
    return $from !== '' ? $from : 'The Game Hour <onboarding@resend.dev>';
}

function cms_mail_configured(): bool
{
    return cms_mail_resend_api_key() !== '' && function_exists('curl_init');
}

function cms_public_origin(): string
{
    $cfg = cms_config();
    if (!empty($cfg['site']['url'])) {
        return rtrim((string) $cfg['site']['url'], '/');
    }
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $host = isset($_SERVER['HTTP_HOST']) ? (string) $_SERVER['HTTP_HOST'] : 'thegamehour.com';
    return ($https ? 'https' : 'http') . '://' . $host;
}

function cms_mail_format_date(string $ymd): string
{
    $parsed = DateTimeImmutable::createFromFormat('Y-m-d', $ymd);
    if (!$parsed) {
        return $ymd;
    }
    return $parsed->format('M j, Y');
}

function cms_mail_format_time(string $time): string
{
    if (!preg_match('/^(\d{2}):(\d{2})/', $time, $m)) {
        return trim($time);
    }
    $hour = (int) $m[1];
    $minute = (int) $m[2];
    $period = $hour >= 12 ? 'pm' : 'am';
    $hour12 = $hour % 12;
    if ($hour12 === 0) {
        $hour12 = 12;
    }
    return $hour12 . ':' . str_pad((string) $minute, 2, '0', STR_PAD_LEFT) . ' ' . $period;
}

/**
 * @param array<string, mixed> $row
 * @return array<string, string>
 */
function cms_booking_alert_vars($bookingId, array $row): array
{
    $venue = trim((string) ($row['venue_name'] ?? ''));
    $address = trim((string) ($row['address'] ?? ''));
    $location = $venue !== '' ? $venue : $address;
    $instagram = ltrim(trim((string) ($row['instagram_handle'] ?? '')), '@');
    $requirements = trim((string) ($row['special_requirements'] ?? ''));
    if ($requirements === '') {
        $requirements = 'None';
    }

    return [
        'GREETING_NAME' => 'Vijay',
        'EVENT_DATE' => cms_mail_format_date(trim((string) ($row['event_date'] ?? ''))),
        'LOCATION' => $location !== '' ? $location : 'Not provided',
        'EVENT_TIME' => cms_mail_format_time(trim((string) ($row['event_time'] ?? ''))),
        'PARTICIPANTS' => (string) ($row['participant_count'] ?? ''),
        'SPECIAL_REQUIREMENTS' => $requirements,
        'INSTAGRAM' => $instagram,
        'CLIENT_NAME' => trim((string) ($row['contact_name'] ?? '')),
        'CLIENT_PHONE' => trim((string) ($row['phone'] ?? '')),
        'CLIENT_EMAIL' => trim((string) ($row['email'] ?? '')),
        'OPS_URL' => cms_public_origin() . '/ops/events/' . rawurlencode((string) $bookingId),
    ];
}

/**
 * @return array<string, string>
 */
function cms_booking_alert_sample_vars(): array
{
    return cms_booking_alert_vars('test', [
        'event_date' => '2026-09-04',
        'venue_name' => 'Shivalay Parisar opp kanam Residency kudasan Gandhinagar',
        'event_time' => '19:00',
        'participant_count' => 100,
        'special_requirements' => 'New games for all age groups and activities and a very gud anchor to conduct the program and well behaved people to organise activities properly.',
        'instagram_handle' => 'Sarinvidhi',
        'contact_name' => 'Vidhi Sarin',
        'phone' => '8849902012',
        'email' => 'test@example.com',
    ]);
}

function cms_booking_alert_text(array $vars): string
{
    $lines = [
        'Hello ' . $vars['GREETING_NAME'] . '!',
        '',
        "You've just received a new event booking! 🎉",
        '',
        'Event Details:',
        '',
        'Date: ' . $vars['EVENT_DATE'],
        'Location: ' . $vars['LOCATION'],
        'Time: ' . $vars['EVENT_TIME'],
        'Number of Participants: ' . $vars['PARTICIPANTS'],
        'Special Requirements/Requests:',
        $vars['SPECIAL_REQUIREMENTS'],
    ];
    if ($vars['INSTAGRAM'] !== '') {
        $lines[] = 'Insta ID: ' . $vars['INSTAGRAM'];
    }
    $lines[] = '';
    $lines[] = 'Booked by:';
    $lines[] = 'Client Name: ' . $vars['CLIENT_NAME'];
    $lines[] = 'Contact: ' . $vars['CLIENT_PHONE'];
    if ($vars['CLIENT_EMAIL'] !== '') {
        $lines[] = 'Email: ' . $vars['CLIENT_EMAIL'];
    }
    $lines[] = '';
    $lines[] = "Let's make this event unforgettable! 💪";
    $lines[] = 'The Game Hour Team';
    $lines[] = '';
    $lines[] = 'Payment screenshot is attached when available.';
    $lines[] = 'Open in ops: ' . $vars['OPS_URL'];
    return implode("\n", $lines);
}

function cms_booking_alert_html(array $vars): string
{
    $esc = static function ($value): string {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    };
    $reqHtml = nl2br($esc($vars['SPECIAL_REQUIREMENTS']));
    $insta = $vars['INSTAGRAM'] !== ''
        ? '<p style="margin:8px 0 0;"><strong>Insta ID:</strong> ' . $esc($vars['INSTAGRAM']) . '</p>'
        : '';
    $email = $vars['CLIENT_EMAIL'] !== ''
        ? '<p style="margin:8px 0 0;"><strong>Email:</strong> ' . $esc($vars['CLIENT_EMAIL']) . '</p>'
        : '';

    return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#111;">'
        . '<p>Hello ' . $esc($vars['GREETING_NAME']) . '!</p>'
        . '<p>You&rsquo;ve just received a new event booking! 🎉</p>'
        . '<p><strong>Event Details:</strong></p>'
        . '<p style="margin:0;"><strong>Date:</strong> ' . $esc($vars['EVENT_DATE']) . '</p>'
        . '<p style="margin:8px 0 0;"><strong>Location:</strong> ' . $esc($vars['LOCATION']) . '</p>'
        . '<p style="margin:8px 0 0;"><strong>Time:</strong> ' . $esc($vars['EVENT_TIME']) . '</p>'
        . '<p style="margin:8px 0 0;"><strong>Number of Participants:</strong> ' . $esc($vars['PARTICIPANTS']) . '</p>'
        . '<p style="margin:16px 0 0;"><strong>Special Requirements/Requests:</strong></p>'
        . '<p style="margin:8px 0 0;">' . $reqHtml . '</p>'
        . $insta
        . '<p style="margin:24px 0 8px;"><strong>Booked by:</strong></p>'
        . '<p style="margin:0;"><strong>Client Name:</strong> ' . $esc($vars['CLIENT_NAME']) . '</p>'
        . '<p style="margin:8px 0 0;"><strong>Contact:</strong> ' . $esc($vars['CLIENT_PHONE']) . '</p>'
        . $email
        . '<p style="margin:24px 0 0;">Let&rsquo;s make this event unforgettable! 💪</p>'
        . '<p>The Game Hour Team</p>'
        . '<p style="margin:24px 0 0;font-size:13px;color:#555;">Payment screenshot is attached when available.<br>'
        . '<a href="' . $esc($vars['OPS_URL']) . '">Open in ops</a></p>'
        . '</div>';
}

/**
 * @return list<array{filename: string, content: string}>
 */
function cms_mail_screenshot_attachments(array $row): array
{
    $relative = str_replace('\\', '/', (string) ($row['payment_screenshot_path'] ?? ''));
    if ($relative === '' || strpos($relative, '..') !== false) {
        return [];
    }
    $path = cms_uploads_dir() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
    if (!is_file($path) || !is_readable($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return [];
    }
    $filename = basename($relative);
    if ($filename === '' || $filename === '.' || $filename === '..') {
        $filename = 'payment-screenshot.jpg';
    }
    return [[
        'filename' => $filename,
        'content' => base64_encode($raw),
    ]];
}

/**
 * @param list<array{filename: string, content: string}> $attachments
 * @return array{ok: bool, error?: string}
 */
function cms_mail_send(
    string $to,
    string $subject,
    string $text,
    $replyTo = null,
    $html = null,
    array $attachments = [],
    array $templateVariables = []
): array {
    $to = trim($to);
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Notify email is not valid.'];
    }
    $apiKey = cms_mail_resend_api_key();
    if ($apiKey === '') {
        return ['ok' => false, 'error' => 'Add mail.resend_api_key in cms/config.php (Resend free API key).'];
    }
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'error' => 'PHP curl is required to send email.'];
    }

    $payload = [
        'from' => cms_mail_from_address(),
        'to' => [$to],
        'subject' => $subject,
    ];
    $templateId = cms_mail_template_id();
    if ($templateId !== '' && $templateVariables !== []) {
        $safeVars = [];
        foreach ($templateVariables as $key => $value) {
            $cut = (string) $value;
            $safeVars[(string) $key] = function_exists('mb_substr')
                ? mb_substr($cut, 0, 2000)
                : substr($cut, 0, 2000);
        }
        $payload['template'] = [
            'id' => $templateId,
            'variables' => $safeVars,
        ];
    } else {
        $payload['text'] = $text;
        if (is_string($html) && $html !== '') {
            $payload['html'] = $html;
        }
    }
    if (is_string($replyTo) && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $payload['reply_to'] = $replyTo;
    }
    if ($attachments !== []) {
        $payload['attachments'] = $attachments;
    }

    $ch = curl_init('https://api.resend.com/emails');
    if ($ch === false) {
        return ['ok' => false, 'error' => 'Could not start the mail request.'];
    }
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $cafile = (string) ini_get('curl.cainfo');
    if ($cafile !== '' && is_file($cafile)) {
        curl_setopt($ch, CURLOPT_CAINFO, $cafile);
    }
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $curlError = curl_error($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno !== 0 || $body === false) {
        if ($errno === 60) {
            return ['ok' => false, 'error' => 'Could not reach Resend (SSL). On Windows PHP, set curl.cainfo in php.ini to a cacert.pem CA bundle.'];
        }
        $hint = trim($curlError);
        return ['ok' => false, 'error' => 'Could not reach Resend.' . ($hint !== '' ? ' ' . $hint : ' Try again later.')];
    }
    if ($code < 200 || $code >= 300) {
        $decoded = json_decode((string) $body, true);
        $message = is_array($decoded) ? (string) ($decoded['message'] ?? '') : '';
        return ['ok' => false, 'error' => $message !== '' ? $message : 'Resend rejected the email (HTTP ' . $code . ').'];
    }
    return ['ok' => true];
}

/**
 * @param array<string, mixed> $row
 */
function cms_booking_notify_admin($bookingId, array $row): void
{
    try {
        $to = cms_settings_notify_email();
        $name = trim((string) ($row['contact_name'] ?? ''));
        $subject = 'New event booking'
            . ($name !== '' ? ' — ' . $name : '')
            . ' #' . $bookingId;
        $vars = cms_booking_alert_vars($bookingId, $row);
        cms_mail_send(
            $to,
            $subject,
            cms_booking_alert_text($vars),
            $vars['CLIENT_EMAIL'] !== '' ? $vars['CLIENT_EMAIL'] : null,
            cms_booking_alert_html($vars),
            cms_mail_screenshot_attachments($row),
            $vars
        );
    } catch (Throwable $e) {
        // Booking already saved; skip mail errors.
    }
}
