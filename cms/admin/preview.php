<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

cms_require_admin();

$key = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';
if ($key === '') {
    http_response_code(400);
    echo 'Missing key';
    exit;
}

$row = cms_get_image_by_key($key);
if (!$row || empty($row['file_path'])) {
    http_response_code(404);
    echo 'No image uploaded for this key.';
    exit;
}

$path = cms_uploads_dir() . DIRECTORY_SEPARATOR . $row['file_path'];
if (!is_file($path)) {
    http_response_code(404);
    echo 'File missing on server.';
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($path) ?: 'application/octet-stream';
header('Content-Type: ' . $mime);
header('Content-Length: ' . (string) filesize($path));
header('Cache-Control: private, max-age=3600');
readfile($path);
