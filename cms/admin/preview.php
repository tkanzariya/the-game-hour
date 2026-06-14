<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';

cms_require_admin();

$key = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';
if ($key === '') {
    http_response_code(400);
    echo 'Missing key';
    exit;
}

$resolved = cms_resolve_preview_file($key);
if ($resolved === null) {
    http_response_code(404);
    echo 'Image not available.';
    exit;
}

$path = $resolved['path'];
$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mimeByExt = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'gif' => 'image/gif',
    'svg' => 'image/svg+xml',
];
$mime = $mimeByExt[$ext] ?? null;
if ($mime === null && class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($path) ?: 'application/octet-stream';
}
$mime ??= 'application/octet-stream';

header('Content-Type: ' . $mime);
header('Content-Length: ' . (string) filesize($path));
header('Cache-Control: private, max-age=3600');
if ($resolved['source'] === 'default') {
    header('X-CMS-Image-Source: default');
}
readfile($path);
