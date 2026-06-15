<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

cms_require_admin();
cms_load_content_store();
cms_content_seed_if_empty();

$labels = cms_content_metric_labels();
$values = cms_content_get_metric_values();
$error = '';
$message = isset($_GET['msg']) ? cms_flash_message((string) $_GET['msg']) : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = cms_flash_message('csrf_failed');
    } else {
        $input = [];
        foreach (cms_content_metric_keys() as $key) {
            $input[$key] = trim((string) ($_POST[$key] ?? ''));
        }
        cms_content_save_metric_values($input);
        cms_redirect_with_msg(cms_admin_url('statistics.php'), 'statistics_saved');
    }
}

$token = cms_csrf_token();

$content = cms_content_setup_notice_html();
$content .= '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars(cms_admin_url('dashboard.php')) . '">← Dashboard</a>';
$content .= '<h1>Statistics</h1>';
$content .= '<p>Homepage numbers in the “Trusted experiences at scale” section. Labels are fixed.</p>';
$content .= '</div>';

if ($message !== '') {
    $content .= '<div class="notice notice-success" role="status">' . htmlspecialchars($message) . '</div>';
}
if ($error !== '') {
    $content .= '<div class="notice notice-error" role="alert">' . htmlspecialchars($error) . '</div>';
}

$content .= '<div class="card form-panel">';
$content .= '<form method="post" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';

foreach (cms_content_metric_keys() as $key) {
    $label = $labels[$key];
    $content .= '<label>' . htmlspecialchars($label);
    $content .= '<input type="text" name="' . htmlspecialchars($key) . '" value="' . htmlspecialchars($values[$key] ?? '') . '" maxlength="60" required>';
    $content .= '</label>';
}

$content .= '<div class="form-actions">';
$content .= '<button type="submit" class="btn btn-primary">Save statistics</button>';
$content .= '</div></form></div>';

cms_admin_layout('Statistics', $content, 'statistics');
