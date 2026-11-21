<?php
declare(strict_types=1);

/**
 * Web-sized WebP of a CMS photo: GET /media/{key}-{width}.webp (rewritten here by .htaccess).
 * Falls back to the original upload when a resized copy cannot be made, so a picture never breaks.
 */
require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/image-optimize.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    http_response_code(405);
    exit;
}

$key = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';
$width = isset($_GET['w']) ? (int) $_GET['w'] : 0;
if ($key === '' || !in_array($width, cms_web_image_widths(), true)) {
    http_response_code(404);
    exit;
}

try {
    $row = cms_get_image_by_key($key);
} catch (Throwable $e) {
    http_response_code(503);
    exit;
}
if (!$row || !cms_web_image_eligible($row['file_path'] ?? null)) {
    http_response_code(404);
    exit;
}

$path = cms_web_image_ensure($key, (string) $row['file_path'], $width);
if ($path === null) {
    if (!is_file(cms_uploads_dir() . DIRECTORY_SEPARATOR . $row['file_path'])) {
        http_response_code(404);
        exit;
    }
    // Cannot resize here: send the original instead.
    header('Cache-Control: public, max-age=300');
    header('Location: ' . cms_cache_bust_url((string) $row['file_path'], $row['updated_at'] ?? null), true, 302);
    exit;
}

$mtime = (int) filemtime($path);
$size = (int) filesize($path);
$etag = '"' . dechex($mtime) . '-' . dechex($size) . '"';

header('Content-Type: image/webp');
header('X-Content-Type-Options: nosniff');
header('ETag: ' . $etag);
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $mtime) . ' GMT');
// The site adds ?v=<upload time> to its URLs, so a changed photo has a new address and can be cached for good.
// Without it (the front page hero) the address stays the same, so browsers re-check after an hour.
if (isset($_GET['v'])) {
    header('Cache-Control: public, max-age=31536000, immutable');
} else {
    header('Cache-Control: public, max-age=3600, stale-while-revalidate=86400');
}

if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
    http_response_code(304);
    exit;
}

header('Content-Length: ' . $size);
if ($method === 'GET') {
    readfile($path);
}
