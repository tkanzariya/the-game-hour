<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-store.php';

cms_ops_require_json_admin();

$id = trim((string) ($_GET['id'] ?? ''));
if ($id === '') {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Missing event id.';
    exit;
}

$source = cms_ops_screenshot_source($id);
if ($source === null) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Screenshot not found.';
    exit;
}

$download = isset($_GET['download']);

if ($source['type'] === 'url') {
    $url = $source['url'];
    if ($download) {
        $body = @file_get_contents($url);
        if ($body !== false) {
            header('Content-Type: image/jpeg');
            header('Content-Disposition: attachment; filename="payment-screenshot.jpg"');
            header('Cache-Control: private, max-age=3600');
            echo $body;
            exit;
        }
    }
    header('Location: ' . $url, true, 302);
    exit;
}

$path = $source['path'];
$mime = mime_content_type($path) ?: 'application/octet-stream';
header('Content-Type: ' . $mime);
header('Cache-Control: private, max-age=3600');
header('X-Content-Type-Options: nosniff');
if ($download) {
    header('Content-Disposition: attachment; filename="' . basename($path) . '"');
}
readfile($path);
exit;
