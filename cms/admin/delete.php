<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';

cms_require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . cms_admin_url('library.php'));
    exit;
}

$category = trim((string) ($_POST['category'] ?? ''));
$search = trim((string) ($_POST['q'] ?? ''));

if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
    $qs = cms_library_query_string($category, $search, 'Session expired.');
    header('Location: ' . cms_admin_url('library.php') . $qs);
    exit;
}

$key = cms_sanitize_key((string) ($_POST['image_key'] ?? ''));
$result = cms_delete_image($key);
$msg = $result['ok'] ? 'Image removed.' : ($result['error'] ?? 'Delete failed.');
$qs = cms_library_query_string($category, $search, $msg);
header('Location: ' . cms_admin_url('library.php') . $qs);
