<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();

$registry = cms_all_image_keys();
$prefillKey = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Please go back and try again.';
    } elseif (!isset($_FILES['image'])) {
        $error = 'Please choose a photo to upload.';
    } else {
        $imageKey = cms_sanitize_key((string) ($_POST['image_key'] ?? ''));
        $title = trim((string) ($_POST['title'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? ''));
        if ($imageKey === '') {
            $error = 'Something went wrong — please pick a photo from the list and try again.';
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
                $qs = cms_library_query_string($returnCategory, $returnSearch, 'Photo saved! It\'s now live on your website.');
                header('Location: ' . cms_admin_url('library.php') . $qs);
                exit;
            }
            $error = $result['error'] ?? 'Upload failed. Please try again.';
        }
    }
}

$returnCategory = trim((string) ($_GET['category'] ?? $_POST['return_category'] ?? ''));
$returnSearch = trim((string) ($_GET['q'] ?? $_POST['return_q'] ?? ''));
$backUrl = cms_admin_url('library.php') . cms_library_query_string($returnCategory, $returnSearch);
$token = cms_csrf_token();

// ── No photo selected: show friendly slot picker grouped by category ──
if ($prefillKey === '' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    $content = '<div class="page-intro">';
    $content .= '<h1>Which photo do you want to change?</h1>';
    $content .= '<p>Pick a photo below, then upload your new image.</p>';
    $content .= '</div>';
    $content .= '<p><a class="btn" href="' . htmlspecialchars($backUrl) . '">← Back to all photos</a></p>';

    $byCategory = [];
    foreach ($registry as $key => $meta) {
        $byCategory[$meta['category']][] = ['key' => $key, 'title' => $meta['title']];
    }

    foreach (cms_filter_categories() as $cat) {
        if (empty($byCategory[$cat])) {
            continue;
        }
        $content .= '<section class="category-section">';
        $content .= '<div class="category-header"><h2>' . htmlspecialchars($cat) . '</h2>';
        $content .= '<p>' . htmlspecialchars(cms_category_hint($cat)) . '</p></div>';
        $content .= '<div class="slot-grid">';
        foreach ($byCategory[$cat] as $slot) {
            $slotUrl = cms_admin_url('upload.php?key=' . urlencode($slot['key']))
                . ($returnCategory !== '' || $returnSearch !== '' ? '&' . ltrim(cms_library_query_string($returnCategory, $returnSearch), '?') : '');
            $content .= '<a class="slot-link" href="' . htmlspecialchars($slotUrl) . '">';
            $content .= htmlspecialchars($slot['title']);
            $content .= '<small>Tap to upload</small></a>';
        }
        $content .= '</div></section>';
    }

    cms_admin_layout('Choose photo', $content, 'upload');
    exit;
}

// ── Upload form for a specific photo ──
$meta = $registry[$prefillKey] ?? null;
$label = $meta['title'] ?? $prefillKey;
$categoryHint = $meta['category'] ?? '';
$existing = cms_get_image_by_key($prefillKey);
$hasExisting = $existing && !empty($existing['file_path']);
$previewUrl = cms_admin_url('preview.php?key=' . urlencode($prefillKey));

$content = '<div class="page-intro">';
$content .= '<h1>' . ($hasExisting ? 'Change this photo' : 'Add a photo') . '</h1>';
$content .= '<p>Choose a new image from your computer. It will replace the current photo on your website.</p>';
$content .= '</div>';

$content .= '<p><a class="btn" href="' . htmlspecialchars($backUrl) . '">← Back to all photos</a></p>';

if ($error) {
    $content .= '<p class="error">' . htmlspecialchars($error) . '</p>';
}

$content .= '<div class="upload-layout">';
$content .= '<div class="upload-target">';
$content .= '<h2>' . htmlspecialchars($label) . '</h2>';
if ($categoryHint !== '') {
    $content .= '<p>' . htmlspecialchars($categoryHint) . ' · ' . htmlspecialchars(cms_category_hint($categoryHint)) . '</p>';
}
if ($hasExisting) {
    $content .= '<p class="muted">Current photo last updated: ' . htmlspecialchars(cms_friendly_date($existing['updated_at'] ?? null)) . '</p>';
}
$content .= '</div>';

$content .= '<div class="card"><form method="post" enctype="multipart/form-data" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
$content .= '<input type="hidden" name="image_key" value="' . htmlspecialchars($prefillKey) . '">';
$content .= '<input type="hidden" name="return_category" value="' . htmlspecialchars($returnCategory) . '">';
$content .= '<input type="hidden" name="return_q" value="' . htmlspecialchars($returnSearch) . '">';

if ($hasExisting) {
    $content .= '<p class="muted">Current photo:</p>';
    $content .= '<img src="' . htmlspecialchars($previewUrl) . '" alt="Current photo" style="width:100%;max-height:200px;object-fit:contain;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:1rem;background:#f1f5f9">';
}

$content .= '<div class="dropzone-wrap">';
$content .= '<div class="dropzone" id="upload-dropzone" role="button" tabindex="0" aria-label="Choose a photo to upload">';
$content .= '<div class="dropzone-icon" aria-hidden="true">⬆️</div>';
$content .= '<strong>Drag a photo here or click to browse</strong>';
$content .= '<span class="muted">JPG, PNG, or WEBP · Max 5 MB</span>';
$content .= '<input type="file" id="upload-file" name="image" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required>';
$content .= '</div>';
$content .= '<div class="preview-box" id="upload-preview">';
$content .= '<img id="upload-preview-img" alt="Preview of selected photo">';
$content .= '<p id="upload-preview-name"></p>';
$content .= '</div></div>';

$content .= '<ul class="upload-tips">';
$content .= '<li>Use a clear, high-quality photo (landscape works best for banners).</li>';
$content .= '<li>Your change goes live as soon as you save — no need to republish the site.</li>';
$content .= '</ul>';

$content .= '<button type="submit" class="btn btn-primary btn-block">' . ($hasExisting ? 'Save new photo' : 'Upload photo') . '</button>';
$content .= '</form></div></div>';

cms_admin_layout($hasExisting ? 'Change photo' : 'Add photo', $content, 'upload');
