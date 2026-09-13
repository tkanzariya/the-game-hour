<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/bookings-store.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cms_json_response(['error' => 'Method not allowed'], 405);
}

$payloadRaw = $_POST['payload'] ?? null;
if (!is_string($payloadRaw) || $payloadRaw === '') {
    cms_json_response([
        'ok' => false,
        'error' => 'Missing booking payload.',
    ], 400);
}

$payload = json_decode($payloadRaw, true);
if (!is_array($payload)) {
    cms_json_response([
        'ok' => false,
        'error' => 'Invalid booking payload.',
    ], 400);
}

$screenshot = $_FILES['payment_screenshot'] ?? [
    'name' => '',
    'type' => '',
    'tmp_name' => '',
    'error' => UPLOAD_ERR_NO_FILE,
    'size' => 0,
];

$result = cms_booking_create($payload, $screenshot);

if (!$result['ok']) {
    cms_json_response([
        'ok' => false,
        'error' => $result['error'] ?? 'Booking failed.',
        'fields' => $result['fields'] ?? new stdClass(),
    ], 422);
}

cms_json_response([
    'ok' => true,
    'bookingId' => $result['bookingId'],
    'message' => 'Booking submitted successfully.',
]);
