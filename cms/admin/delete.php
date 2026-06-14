<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . cms_admin_url('dashboard.php'));
    exit;
}

$category = trim((string) ($_POST['category'] ?? ''));
$search = trim((string) ($_POST['q'] ?? ''));
$return = trim((string) ($_POST['return'] ?? ''));

if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
    $msg = 'Session expired.';
} else {
    $key = cms_sanitize_key((string) ($_POST['image_key'] ?? ''));
    $result = cms_delete_image($key);
    $msg = $result['ok'] ? 'Photo removed. The website default is showing again.' : ($result['error'] ?? 'Delete failed.');
}

if ($return === 'category' && $category !== '') {
    header('Location: ' . cms_category_url($category) . cms_library_query_string('', '', $msg));
    exit;
}

header('Location: ' . cms_admin_url('photos.php') . cms_library_query_string('', $search, $msg));
