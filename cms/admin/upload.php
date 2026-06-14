<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';

cms_require_admin();

$registry = cms_all_image_keys();
$prefillKey = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'Session expired. Please try again.';
    } elseif (!isset($_FILES['image'])) {
        $error = 'Please choose an image file.';
    } else {
        $imageKey = cms_sanitize_key((string) ($_POST['image_key'] ?? ''));
        $title = trim((string) ($_POST['title'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? ''));
        if ($imageKey === '') {
            $error = 'Please select or enter an image key.';
        } else {
            $meta = $registry[$imageKey] ?? null;
            if (!$title && $meta) {
                $title = $meta['title'];
            }
            if (!$category && $meta) {
                $category = $meta['category'];
            }
            $result = cms_save_upload($imageKey, $_FILES['image'], $title ?: null, $category ?: null);
            if ($result['ok']) {
                $returnCategory = trim((string) ($_POST['return_category'] ?? ''));
                $returnSearch = trim((string) ($_POST['return_q'] ?? ''));
                $qs = cms_library_query_string($returnCategory, $returnSearch, 'Image saved successfully.');
                header('Location: ' . cms_admin_url('library.php') . $qs);
                exit;
            }
            $error = $result['error'] ?? 'Upload failed.';
        }
    }
}

$returnCategory = trim((string) ($_GET['category'] ?? $_POST['return_category'] ?? ''));
$returnSearch = trim((string) ($_GET['q'] ?? $_POST['return_q'] ?? ''));

$token = cms_csrf_token();
$content = '<div class="page-head"><h1>Upload / replace image</h1>';
$content .= '<a class="btn" href="' . htmlspecialchars(cms_admin_url('library.php') . cms_library_query_string($returnCategory, $returnSearch)) . '">Back to library</a></div>';

if ($error) {
    $content .= '<p class="error">' . htmlspecialchars($error) . '</p>';
}

$content .= '<div class="card"><form method="post" enctype="multipart/form-data" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
$content .= '<input type="hidden" name="return_category" value="' . htmlspecialchars($returnCategory) . '">';
$content .= '<input type="hidden" name="return_q" value="' . htmlspecialchars($returnSearch) . '">';
$content .= '<label>Image slot<select name="image_key" required>';
$content .= '<option value="">Select a slot…</option>';
foreach ($registry as $key => $meta) {
    $sel = ($prefillKey === $key || (isset($_POST['image_key']) && $_POST['image_key'] === $key)) ? ' selected' : '';
    $content .= '<option value="' . htmlspecialchars($key) . '"' . $sel . '>'
        . htmlspecialchars($meta['title']) . ' (' . htmlspecialchars($key) . ')</option>';
}
$content .= '</select></label>';
$content .= '<p class="muted">Choose the slot by its friendly name. The technical key stays the same on the website.</p>';
$content .= '<label>Image file<input type="file" name="image" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required></label>';
$content .= '<p class="muted">Max 5 MB. Allowed: JPG, PNG, WEBP.</p>';
$content .= '<button type="submit" class="btn primary">Save image</button></form></div>';

if ($prefillKey !== '' && isset($registry[$prefillKey])) {
    $prefillLabel = htmlspecialchars($registry[$prefillKey]['title']);
    $content .= '<div class="card slot-preview"><h2>Selected slot</h2>';
    $content .= '<p><strong>' . $prefillLabel . '</strong></p>';
    $content .= '<p class="muted"><code>' . htmlspecialchars($prefillKey) . '</code> · '
        . htmlspecialchars($registry[$prefillKey]['category']) . '</p></div>';
}

cms_admin_layout('Upload', $content);
