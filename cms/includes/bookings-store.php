<?php
declare(strict_types=1);

require_once __DIR__ . '/events-migrate.php';

/**
 * Validate and persist booking submissions (MySQL events table, or JSON in local CMS mode).
 */

/** @return list<string> */
function cms_booking_event_types(): array
{
    return [
        'birthday',
        'get_together',
        'traditional',
        'playdate',
        'game_festival',
        'sports_day',
        'kitty_party',
    ];
}

/** @return list<string> */
function cms_booking_age_groups(): array
{
    return ['4-7', '8-12', '13-14', '15+_adults', 'senior_citizens'];
}

/**
 * @param array<string, mixed> $data
 * @return array{ok: true}|array{ok: false, error: string, fields?: array<string, string>}
 */
function cms_booking_validate(array $data): array
{
    $fields = [];
    $category = (string) ($data['event_category'] ?? '');
    if (!in_array($category, ['social', 'corporate'], true)) {
        return ['ok' => false, 'error' => 'Invalid booking category.'];
    }

    $email = trim((string) ($data['email'] ?? ''));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $fields['email'] = 'Enter a valid email address.';
    }

    $contactName = trim((string) ($data['contact_name'] ?? ''));
    if ($contactName === '') {
        $fields['contact_name'] = 'Your name is required.';
    }

    $address = trim((string) ($data['address'] ?? ''));
    if ($address === '') {
        $fields['address'] = 'Address is required.';
    }

    $phone = preg_replace('/\D+/', '', (string) ($data['phone'] ?? '')) ?? '';
    if (strlen($phone) !== 10) {
        $fields['phone'] = 'Contact number must be exactly 10 digits.';
    }

    $participants = (int) ($data['participant_count'] ?? 0);
    if ($participants < 1) {
        $fields['participant_count'] = 'Number of participants must be at least 1.';
    }

    $eventDate = trim((string) ($data['event_date'] ?? ''));
    if ($eventDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $eventDate)) {
        $fields['event_date'] = 'Select a valid event date.';
    } else {
        $today = new DateTimeImmutable('today');
        $parsed = DateTimeImmutable::createFromFormat('Y-m-d', $eventDate);
        if (!$parsed || $parsed < $today) {
            $fields['event_date'] = 'Date cannot be before today.';
        }
    }

    $eventTime = trim((string) ($data['event_time'] ?? ''));
    if ($eventTime === '' || !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $eventTime)) {
        $fields['event_time'] = 'Select a valid event time.';
    } else {
        $parts = explode(':', $eventTime);
        $minute = (int) ($parts[1] ?? -1);
        if (!in_array($minute, [0, 15, 30, 45], true)) {
            $fields['event_time'] = 'Minutes must be 00, 15, 30, or 45.';
        }
    }

    $venueType = (string) ($data['venue_type'] ?? '');
    if (!in_array($venueType, ['indoor', 'outdoor'], true)) {
        $fields['venue_type'] = 'Select indoor or outdoor.';
    }

    $paymentMode = (string) ($data['payment_mode'] ?? '');
    if (!in_array($paymentMode, ['online', 'online_cash'], true)) {
        $fields['payment_mode'] = 'Select a payment mode.';
    }

    $terms = $data['terms_accepted'] ?? false;
    if ($terms !== true && $terms !== 1 && $terms !== '1' && $terms !== 'true') {
        $fields['terms_accepted'] = 'You must agree to the terms and conditions.';
    }

    if ($category === 'social') {
        $eventType = (string) ($data['event_type'] ?? '');
        if (!in_array($eventType, cms_booking_event_types(), true)) {
            $fields['event_type'] = 'Select a type of event.';
        }
        $ageGroup = (string) ($data['age_group'] ?? '');
        if (!in_array($ageGroup, cms_booking_age_groups(), true)) {
            $fields['age_group'] = 'Select an age group.';
        }
    } else {
        $company = trim((string) ($data['company_name'] ?? ''));
        if ($company === '') {
            $fields['company_name'] = 'Company name is required.';
        }
    }

    if ($fields !== []) {
        return ['ok' => false, 'error' => 'Please fix the highlighted fields.', 'fields' => $fields];
    }

    return ['ok' => true];
}

/**
 * @param array<string, mixed> $file
 * @return array{ok: true, path: string}|array{ok: false, error: string, code?: string}
 */
function cms_booking_save_screenshot(array $file): array
{
    $validation = cms_validate_image_upload($file);
    if (!$validation['ok']) {
        return $validation;
    }

    $dir = cms_uploads_dir() . DIRECTORY_SEPARATOR . 'payment-screenshots';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $ext = (string) $validation['ext'];
    $filename = 'pay_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $relativePath = 'payment-screenshots/' . $filename;
    $dest = $dir . DIRECTORY_SEPARATOR . $filename;

    if (is_uploaded_file($file['tmp_name'])) {
        $saved = move_uploaded_file($file['tmp_name'], $dest);
    } else {
        $saved = copy($file['tmp_name'], $dest);
    }

    if (!$saved) {
        return ['ok' => false, 'error' => 'Could not save payment screenshot.', 'code' => 'upload_failed'];
    }

    return ['ok' => true, 'path' => $relativePath];
}

/**
 * @param array<string, mixed> $data
 * @return array{ok: true, bookingId: int|string}|array{ok: false, error: string, fields?: array<string, string>}
 */
function cms_booking_create(array $data, array $screenshotFile): array
{
    $validated = cms_booking_validate($data);
    if (!$validated['ok']) {
        return $validated;
    }

    if (!isset($screenshotFile['error']) || (int) $screenshotFile['error'] === UPLOAD_ERR_NO_FILE) {
        return [
            'ok' => false,
            'error' => 'Your booking is not saved until a payment screenshot is uploaded.',
            'fields' => ['payment_screenshot' => 'Attach a payment screenshot to submit.'],
        ];
    }

    $savedFile = cms_booking_save_screenshot($screenshotFile);
    if (!$savedFile['ok']) {
        return [
            'ok' => false,
            'error' => (string) ($savedFile['error'] ?? 'Screenshot upload failed.'),
            'fields' => ['payment_screenshot' => (string) ($savedFile['error'] ?? 'Upload failed.')],
        ];
    }

    $category = (string) $data['event_category'];
    $phone = preg_replace('/\D+/', '', (string) $data['phone']) ?? '';
    $eventTime = (string) $data['event_time'];
    if (preg_match('/^\d{2}:\d{2}$/', $eventTime)) {
        $eventTime .= ':00';
    }

    $row = [
        'event_category' => $category,
        'event_status' => 'pending',
        'email' => trim((string) $data['email']),
        'contact_name' => trim((string) $data['contact_name']),
        'phone' => $phone,
        'address' => trim((string) $data['address']),
        'birthday_person_name' => $category === 'social'
            ? (trim((string) ($data['birthday_person_name'] ?? '')) ?: null)
            : null,
        'company_name' => $category === 'corporate'
            ? trim((string) ($data['company_name'] ?? ''))
            : null,
        'event_type' => $category === 'social' ? (string) ($data['event_type'] ?? null) : null,
        'participant_count' => (int) $data['participant_count'],
        'age_group' => $category === 'social' ? (string) ($data['age_group'] ?? null) : null,
        'event_date' => (string) $data['event_date'],
        'event_time' => $eventTime,
        'venue_name' => trim((string) ($data['venue_name'] ?? '')) ?: null,
        'venue_type' => (string) $data['venue_type'],
        'payment_mode' => (string) $data['payment_mode'],
        'referral_source' => trim((string) ($data['referral_source'] ?? '')) ?: null,
        'special_requirements' => trim((string) ($data['special_requirements'] ?? '')) ?: null,
        'terms_accepted_at' => date('Y-m-d H:i:s'),
        'advance_payment_date' => date('Y-m-d'),
        'advance_payment_completed' => 1,
        'payment_screenshot_path' => $savedFile['path'],
    ];

    if (cms_dev_json_enabled()) {
        return cms_booking_create_json($row);
    }

    if (!cms_events_db_ready()) {
        $msg = cms_events_migration_error() ?? 'Events database is not ready.';
        return ['ok' => false, 'error' => $msg];
    }

    try {
        $sql = 'INSERT INTO events (
            event_category, event_status, email, contact_name, phone, address,
            birthday_person_name, company_name, event_type, participant_count, age_group,
            event_date, event_time, venue_name, venue_type, payment_mode,
            referral_source, special_requirements, terms_accepted_at,
            advance_payment_date, advance_payment_completed, payment_screenshot_path
        ) VALUES (
            :event_category, :event_status, :email, :contact_name, :phone, :address,
            :birthday_person_name, :company_name, :event_type, :participant_count, :age_group,
            :event_date, :event_time, :venue_name, :venue_type, :payment_mode,
            :referral_source, :special_requirements, :terms_accepted_at,
            :advance_payment_date, :advance_payment_completed, :payment_screenshot_path
        )';
        $stmt = cms_db()->prepare($sql);
        $stmt->execute($row);
        $id = (int) cms_db()->lastInsertId();
        return ['ok' => true, 'bookingId' => $id];
    } catch (Throwable $e) {
        @unlink(cms_uploads_dir() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $savedFile['path']));
        return ['ok' => false, 'error' => 'Could not save booking. Please try again.'];
    }
}

/**
 * @param array<string, mixed> $row
 * @return array{ok: true, bookingId: string}
 */
function cms_booking_create_json(array $row): array
{
    $path = cms_booking_json_path();
    $raw = is_file($path) ? file_get_contents($path) : '{"bookings":[]}';
    $data = json_decode($raw ?: '{"bookings":[]}', true);
    if (!is_array($data) || !isset($data['bookings']) || !is_array($data['bookings'])) {
        $data = ['bookings' => []];
    }
    $id = 'local-' . date('YmdHis') . '-' . bin2hex(random_bytes(3));
    $row['id'] = $id;
    $row['created_at'] = date('c');
    $data['bookings'][] = $row;
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    return ['ok' => true, 'bookingId' => $id];
}

function cms_booking_json_path(): string
{
    $cfg = cms_config();
    if (!empty($cfg['dev']['bookings_store'])) {
        $path = (string) $cfg['dev']['bookings_store'];
    } else {
        $path = dirname(__DIR__) . '/dev-data/bookings.json';
    }
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $path;
}
