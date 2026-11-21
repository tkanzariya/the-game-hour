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

// Web-sized WebP copies of CMS photos (mirrors the /media/ rule in public/.htaccess)
if (preg_match('#^/media/([a-z0-9_-]+)-(480|800|1200|1600)(\.webp)?$#', $uri, $m)) {
    $_GET['key'] = $m[1];
    $_GET['w'] = $m[2];
    require $cmsRoot . '/api/img.php';
    return true;
}

if (preg_match('#^/cms/(.*)$#', $uri, $m)) {
    $file = $cmsRoot . '/' . $m[1];
    if (is_file($file)) {
        require $file;
        return true;
    }
}

$docRoot = is_dir($root . '/dist') ? $root . '/dist' : $root . '/public';

// --- Mirrors public/.htaccess (change both together) ---

$redirect = static function (string $to): bool {
    header('Location: ' . $to, true, 301);
    return true;
};

$sendHtml = static function (string $file, int $status = 200): bool {
    http_response_code($status);
    header('Content-Type: text/html; charset=UTF-8');
    readfile($file);
    return true;
};

// Pages that moved
$moved = [
    '#^/services/school-and-collage-event/?$#' => '/services/school-and-college-events',
    '#^/school-and-collage-event\.html$#' => '/services/school-and-college-events',
    '#^/(birthday-games|corporate-games|social-gathering-games|game-festival|wedding-or-haldi-games|traditional-games|bollywood-games)\.html$#' => '/services/$1',
    '#^/corporate-events/?$#' => '/services/corporate-games',
    '#^/birthday-events/?$#' => '/services/birthday-games',
    '#^/school-events/?$#' => '/services/school-and-college-events',
    '#^/wedding-events/?$#' => '/services/wedding-or-haldi-games',
    '#^/social-gathering/?$#' => '/services/social-gathering-games',
    '#^/bollywood/?$#' => '/services/bollywood-games',
    '#^/(traditional-games|game-festival)/?$#' => '/services/$1',
    '#^/(services|game-library)/?$#' => '/',
];
foreach ($moved as $pattern => $target) {
    if (preg_match($pattern, $uri)) {
        return $redirect(preg_replace($pattern, $target, $uri));
    }
}

// No trailing slash on page addresses
if ($uri !== '/' && substr($uri, -1) === '/' && !is_dir($docRoot . $uri)) {
    return $redirect(rtrim($uri, '/'));
}

// Real files are served as they are
if ($uri !== '/' && is_file($docRoot . $uri)) {
    return false;
}
if ($uri === '/' && is_file($docRoot . '/index.html')) {
    return false;
}

// Prerendered public pages
$prerendered = $docRoot . '/prerender' . $uri . '.html';
if (strpos($uri, '..') === false && is_file($prerendered)) {
    return $sendHtml($prerendered);
}

// Parts of the app rendered in the browser
if (preg_match('#^/(ops|book|choose-games)(/.*)?$#', $uri) && is_file($docRoot . '/app.html')) {
    return $sendHtml($docRoot . '/app.html');
}

// Anything else does not exist
if (is_file($docRoot . '/404.html')) {
    return $sendHtml($docRoot . '/404.html', 404);
}
http_response_code(404);
echo 'Not found';
return true;
