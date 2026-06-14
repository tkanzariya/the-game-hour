<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();

$registry = cms_all_image_keys();
$prefillKey = isset($_GET['key']) ? cms_sanitize_key((string) $_GET['key']) : '';
$error = '';
$errorCode = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $errorCode = 'csrf_failed';
        $error = cms_flash_message($errorCode);
    } elseif (!isset($_FILES['image'])) {
        $errorCode = 'no_file';
        $error = cms_flash_message($errorCode);
    } else {
        $imageKey = cms_sanitize_key((string) ($_POST['image_key'] ?? ''));
        $title = trim((string) ($_POST['title'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? ''));
        if ($imageKey === '') {
            $errorCode = 'not_found';
            $error = cms_flash_message($errorCode);
        } else {
            $meta = $registry[$imageKey] ?? null;
            if (!$title && $meta) {
                $title = $meta['title'];
            }
            if (!$category && $meta) {
                $category = $meta['category'];
            }
            $hadCustom = cms_has_custom_upload(cms_get_image_by_key($imageKey));
            $result = cms_save_upload($imageKey, $_FILES['image'], $title ?: null, $category ?: null);
            if ($result['ok']) {
                $returnCategory = trim((string) ($_POST['return_category'] ?? ''));
                $msgCode = $hadCustom ? 'replace_success' : 'upload_success';
                if ($returnCategory !== '') {
                    cms_redirect_with_msg(cms_category_url($returnCategory), $msgCode);
                }
                cms_redirect_with_msg(cms_admin_url('photos.php') . cms_library_query_string('', trim((string) ($_POST['return_q'] ?? ''))), $msgCode);
            }
            $errorCode = (string) ($result['code'] ?? 'upload_failed');
            $error = (string) ($result['error'] ?? cms_flash_message('upload_failed'));
        }
    }
}

$returnCategory = trim((string) ($_GET['category'] ?? $_POST['return_category'] ?? ''));
$returnSearch = trim((string) ($_GET['q'] ?? $_POST['return_q'] ?? ''));
$backUrl = $returnCategory !== ''
    ? cms_category_url($returnCategory)
    : cms_admin_url('photos.php') . cms_library_query_string('', $returnSearch);

if ($prefillKey === '' || !isset($registry[$prefillKey])) {
    header('Location: ' . cms_admin_url('dashboard.php'));
    exit;
}

$meta = $registry[$prefillKey];
$label = $meta['title'];
$usage = (string) ($meta['usage'] ?? '');
$existing = cms_get_image_by_key($prefillKey);
$hasCustom = cms_has_custom_upload($existing);
$previewUrl = cms_admin_preview_url($prefillKey);
$token = cms_csrf_token();

$content = '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars($backUrl) . '">← Back</a>';
$content .= '<h1>' . ($hasCustom ? 'Replace photo' : 'Upload photo') . '</h1>';
$content .= '<p>' . htmlspecialchars($label) . '</p>';
if ($usage !== '') {
    $content .= '<p class="photo-card-usage">' . htmlspecialchars($usage) . '</p>';
}
$content .= '</div>';

if ($error) {
    $content .= '<div class="notice notice-error" role="alert">' . htmlspecialchars($error) . '</div>';
}

$content .= '<div class="upload-panel card">';
$content .= '<div class="upload-current">';
$content .= '<p class="upload-current-label">Current image on website</p>';
$content .= '<img src="' . htmlspecialchars($previewUrl) . '" alt="Current photo">';
$content .= '<span class="photo-card-badge ' . ($hasCustom ? 'badge-live' : 'badge-default') . '">'
    . ($hasCustom ? 'Your upload' : 'Using website default') . '</span>';
$content .= '</div>';

$content .= '<form method="post" enctype="multipart/form-data" class="upload-form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
$content .= '<input type="hidden" name="image_key" value="' . htmlspecialchars($prefillKey) . '">';
$content .= '<input type="hidden" name="return_category" value="' . htmlspecialchars($returnCategory) . '">';
$content .= '<input type="hidden" name="return_q" value="' . htmlspecialchars($returnSearch) . '">';

$content .= '<div class="dropzone-wrap">';
$content .= '<div class="dropzone" id="upload-dropzone" role="button" tabindex="0">';
$content .= '<div class="dropzone-icon">⬆️</div>';
$content .= '<strong>Choose a new photo</strong>';
$content .= '<span class="muted">Drag & drop or click to browse · JPG, PNG, WEBP · Max 5 MB</span>';
$content .= '<input type="file" id="upload-file" name="image" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required>';
$content .= '</div>';
$content .= '<div class="preview-box" id="upload-preview">';
$content .= '<img id="upload-preview-img" alt="Preview">';
$content .= '<p id="upload-preview-name"></p>';
$content .= '</div></div>';

$content .= '<button type="submit" class="btn btn-primary btn-block">' . ($hasCustom ? 'Save new photo' : 'Upload photo') . '</button>';
$content .= '</form></div>';

cms_admin_layout($hasCustom ? 'Replace photo' : 'Upload photo', $content, 'categories');
