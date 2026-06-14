<?php
/**
 * Local dev router for PHP built-in server.
 * Usage: php -S localhost:8765 -t dist scripts/dev-router.php
 */
declare(strict_types=1);

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$root = dirname(__DIR__);

// Local dev: use repo cms/ when config.local.php exists (shared JSON store + uploads)
if (is_file($root . '/cms/config.local.php')) {
    $cmsRoot = $root . '/cms';
} else {
    $cmsRoot = is_dir($root . '/dist/cms') ? $root . '/dist/cms' : $root . '/cms';
}

if (preg_match('#^/uploads/(.*)$#', $uri, $m)) {
    $uploadFile = $cmsRoot . '/uploads/' . $m[1];
    if (is_file($uploadFile)) {
        $mime = mime_content_type($uploadFile) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        readfile($uploadFile);
        return true;
    }
}

if ($uri === '/admin' || $uri === '/admin/') {
    header('Location: /admin/login.php', true, 302);
    return true;
}

if (preg_match('#^/admin/(.*)$#', $uri, $m)) {
    $file = $cmsRoot . '/admin/' . $m[1];
    if (is_file($file)) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['css', 'js', 'map', 'woff', 'woff2', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'ico'], true)) {
            $types = [
                'css' => 'text/css; charset=UTF-8',
                'js' => 'application/javascript; charset=UTF-8',
                'map' => 'application/json; charset=UTF-8',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'webp' => 'image/webp',
                'svg' => 'image/svg+xml',
                'ico' => 'image/x-icon',
            ];
            header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
            readfile($file);
            return true;
        }
        require $file;
        return true;
    }
}

if (preg_match('#^/cms/(.*)$#', $uri, $m)) {
    $file = $cmsRoot . '/' . $m[1];
    if (is_file($file)) {
        require $file;
        return true;
    }
}

$docRoot = is_dir($root . '/dist') ? $root . '/dist' : $root . '/public';
$static = $docRoot . $uri;
if ($uri !== '/' && is_file($static)) {
    return false;
}

if ($uri === '/' && is_file($docRoot . '/index.html')) {
    return false;
}

http_response_code(404);
echo 'Not found';
return true;
