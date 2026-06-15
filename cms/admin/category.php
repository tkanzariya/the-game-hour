<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();
cms_admin_bootstrap();

$category = isset($_GET['cat']) ? trim((string) $_GET['cat']) : '';
$message = isset($_GET['msg']) ? trim((string) $_GET['msg']) : '';

$validCategories = cms_filter_categories();
if ($category === '' || !in_array($category, $validCategories, true)) {
    header('Location: ' . cms_admin_url('photos/index.php'));
    exit;
}

$label = $category;
foreach (cms_dashboard_categories() as $cat) {
    if ($cat['id'] === $category) {
        $label = $cat['label'];
        break;
    }
}

$rowsByKey = cms_index_rows_by_key(cms_get_all_images());
$rows = cms_category_rows($category, $rowsByKey);
$stats = cms_category_stats($category, $rowsByKey);

$content = cms_admin_flash_notice($message);
$content .= '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars(cms_admin_url('photos/index.php')) . '">← Photos</a>';
$content .= '<h1>' . htmlspecialchars($label) . '</h1>';
$content .= '<p>' . htmlspecialchars(cms_category_hint($category)) . '</p>';
$content .= '<p class="category-summary"><strong>' . $stats['uploaded'] . ' / ' . $stats['total'] . '</strong> images uploaded in this section</p>';
$content .= '</div>';

$content .= '<div class="photo-grid">';
foreach ($rows as $row) {
    $content .= cms_render_photo_card($row, $category, '');
}
$content .= '</div>';

cms_admin_layout($label, $content, 'categories');
