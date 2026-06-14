<?php
declare(strict_types=1);

function cms_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $path = __DIR__ . '/../config.php';
    if (!is_file($path)) {
        http_response_code(503);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'CMS not configured. Copy config.sample.php to config.php']);
        exit;
    }
    $config = require $path;
    return $config;
}

function cms_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $db = cms_config()['db'];
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $db['host'],
        $db['name'],
        $db['charset'] ?? 'utf8mb4',
    );
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

function cms_uploads_dir(): string
{
    $dir = cms_config()['uploads']['dir'];
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function cms_public_upload_url(string $filePath): string
{
    $base = rtrim(cms_config()['uploads']['public_url'], '/');
    return $base . '/' . ltrim(str_replace('\\', '/', $filePath), '/');
}

function cms_cache_bust_url(string $publicPath, ?string $updatedAt): string
{
    $url = cms_public_upload_url($publicPath);
    if ($updatedAt) {
        $v = strtotime($updatedAt);
        if ($v !== false) {
            return $url . '?v=' . $v;
        }
    }
    return $url;
}

function cms_sanitize_key(string $key): string
{
    $key = strtolower(trim($key));
    $key = preg_replace('/[^a-z0-9\-_]/', '-', $key) ?? '';
    $key = preg_replace('/-+/', '-', $key) ?? '';
    return trim($key, '-');
}

function cms_json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function cms_start_session(): void
{
    $session = cms_config()['session'];
    if (session_status() === PHP_SESSION_NONE) {
        session_name($session['name']);
        session_set_cookie_params([
            'lifetime' => $session['lifetime'],
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        ]);
        session_start();
    }
}

function cms_csrf_token(): string
{
    cms_start_session();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function cms_verify_csrf(?string $token): bool
{
    cms_start_session();
    return is_string($token) && isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function cms_is_logged_in(): bool
{
    cms_start_session();
    return !empty($_SESSION['cms_admin']);
}

function cms_admin_base_path(): string
{
    return '/admin';
}

function cms_admin_url(string $path = ''): string
{
    $base = cms_admin_base_path();
    if ($path === '') {
        return $base . '/login.php';
    }
    return $base . '/' . ltrim($path, '/');
}

function cms_require_admin(): void
{
    if (!cms_is_logged_in()) {
        header('Location: ' . cms_admin_url('login.php'));
        exit;
    }
}

function cms_login(string $username, string $password): bool
{
    $admin = cms_config()['admin'];
    if ($username !== ($admin['username'] ?? '')) {
        return false;
    }
    if (!password_verify($password, $admin['password_hash'] ?? '')) {
        return false;
    }
    cms_start_session();
    session_regenerate_id(true);
    $_SESSION['cms_admin'] = $username;
    return true;
}

function cms_logout(): void
{
    cms_start_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function cms_validate_image_upload(array $file): array
{
    $cfg = cms_config()['uploads'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return ['ok' => false, 'error' => 'Upload failed. Please try again.'];
    }
    if (($file['size'] ?? 0) > ($cfg['max_bytes'] ?? 5242880)) {
        return ['ok' => false, 'error' => 'File too large. Maximum size is 5 MB.'];
    }
    $original = $file['name'] ?? '';
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    if (!in_array($ext, $cfg['allowed_extensions'], true)) {
        return ['ok' => false, 'error' => 'Invalid file type. Allowed: JPG, PNG, WEBP.'];
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $cfg['allowed_mimes'], true)) {
        return ['ok' => false, 'error' => 'Invalid image format detected.'];
    }
    if (@getimagesize($file['tmp_name']) === false) {
        return ['ok' => false, 'error' => 'File is not a valid image.'];
    }
    return ['ok' => true, 'ext' => $ext, 'mime' => $mime];
}

function cms_get_all_images(?string $category = null): array
{
    $sql = 'SELECT id, image_key, title, category, file_path, updated_at FROM images';
    $params = [];
    if ($category) {
        $sql .= ' WHERE category = :category';
        $params['category'] = $category;
    }
    $sql .= ' ORDER BY category ASC, title ASC';
    $stmt = cms_db()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function cms_get_image_by_key(string $key): ?array
{
    $stmt = cms_db()->prepare(
        'SELECT id, image_key, title, category, file_path, updated_at FROM images WHERE image_key = :key LIMIT 1',
    );
    $stmt->execute(['key' => $key]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function cms_image_public_payload(array $row): array
{
    $payload = [
        'key' => $row['image_key'],
        'title' => $row['title'],
        'category' => $row['category'],
        'updated_at' => $row['updated_at'],
        'url' => null,
    ];
    if (!empty($row['file_path'])) {
        $payload['url'] = cms_cache_bust_url($row['file_path'], $row['updated_at']);
    }
    return $payload;
}

function cms_save_upload(string $imageKey, array $file, ?string $title = null, ?string $category = null): array
{
    $imageKey = cms_sanitize_key($imageKey);
    if ($imageKey === '') {
        return ['ok' => false, 'error' => 'Invalid image key.'];
    }
    $validation = cms_validate_image_upload($file);
    if (!$validation['ok']) {
        return $validation;
    }
    $existing = cms_get_image_by_key($imageKey);
    $ext = $validation['ext'];
    $relativePath = $imageKey . '.' . $ext;
    $dest = cms_uploads_dir() . DIRECTORY_SEPARATOR . $relativePath;

    if ($existing && !empty($existing['file_path']) && $existing['file_path'] !== $relativePath) {
        $old = cms_uploads_dir() . DIRECTORY_SEPARATOR . $existing['file_path'];
        if (is_file($old)) {
            @unlink($old);
        }
    }

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        return ['ok' => false, 'error' => 'Could not save file on server.'];
    }

    $title = $title ?: ($existing['title'] ?? $imageKey);
    $category = $category ?: ($existing['category'] ?? 'General');

    if ($existing) {
        $stmt = cms_db()->prepare(
            'UPDATE images SET title = :title, category = :category, file_path = :path, updated_at = NOW() WHERE image_key = :key',
        );
        $stmt->execute([
            'title' => $title,
            'category' => $category,
            'path' => $relativePath,
            'key' => $imageKey,
        ]);
    } else {
        $stmt = cms_db()->prepare(
            'INSERT INTO images (image_key, title, category, file_path, updated_at) VALUES (:key, :title, :category, :path, NOW())',
        );
        $stmt->execute([
            'key' => $imageKey,
            'title' => $title,
            'category' => $category,
            'path' => $relativePath,
        ]);
    }

    $row = cms_get_image_by_key($imageKey);
    return ['ok' => true, 'image' => cms_image_public_payload($row)];
}

function cms_delete_image(string $imageKey): array
{
    $imageKey = cms_sanitize_key($imageKey);
    $row = cms_get_image_by_key($imageKey);
    if (!$row) {
        return ['ok' => false, 'error' => 'Image not found.'];
    }
    if (!empty($row['file_path'])) {
        $path = cms_uploads_dir() . DIRECTORY_SEPARATOR . $row['file_path'];
        if (is_file($path)) {
            @unlink($path);
        }
    }
    $stmt = cms_db()->prepare(
        'UPDATE images SET file_path = NULL, updated_at = NOW() WHERE image_key = :key',
    );
    $stmt->execute(['key' => $imageKey]);
    return ['ok' => true];
}

function cms_register_missing_keys(array $keys): int
{
    $inserted = 0;
    $stmt = cms_db()->prepare(
        'INSERT IGNORE INTO images (image_key, title, category, file_path) VALUES (:key, :title, :category, NULL)',
    );
    foreach ($keys as $key => $meta) {
        $stmt->execute([
            'key' => cms_sanitize_key($key),
            'title' => $meta['title'] ?? $key,
            'category' => $meta['category'] ?? 'General',
        ]);
        if ($stmt->rowCount() > 0) {
            $inserted++;
        }
    }
    return $inserted;
}

function cms_admin_layout(string $title, string $content): void
{
    $user = $_SESSION['cms_admin'] ?? 'admin';
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<title>' . htmlspecialchars($title) . ' · The Game Hour CMS</title>';
    echo '<link rel="stylesheet" href="' . htmlspecialchars(cms_admin_url('assets/admin.css')) . '"></head><body>';
    echo '<header class="topbar"><div class="brand">The Game Hour · Image CMS</div>';
    echo '<nav><a href="' . htmlspecialchars(cms_admin_url('library.php')) . '">Library</a>';
    echo '<a href="' . htmlspecialchars(cms_admin_url('upload.php')) . '">Upload</a>';
    echo '<span class="user">' . htmlspecialchars((string) $user) . '</span>';
    echo '<a href="' . htmlspecialchars(cms_admin_url('logout.php')) . '">Log out</a></nav></header>';
    echo '<main class="container">' . $content . '</main></body></html>';
}
