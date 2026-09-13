<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    cms_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$body = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($body)) {
    $body = $_POST;
}

$identifier = trim((string) ($body['username'] ?? $body['email'] ?? ''));
$password = (string) ($body['password'] ?? '');

if ($identifier === '' || $password === '') {
    cms_json_response(['ok' => false, 'error' => 'Enter your email or username and password.'], 422);
}

if (!cms_login($identifier, $password)) {
    cms_json_response(['ok' => false, 'error' => 'That email or password did not work. Please try again.'], 401);
}

cms_json_response(cms_session_user_payload());
