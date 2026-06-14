<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../data/keys.php';
require_once __DIR__ . '/../../data/admin-ui.php';

cms_require_admin();
cms_admin_bootstrap();

$search = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
$filter = isset($_GET['category']) ? trim((string) $_GET['category']) : '';

$rowsByKey = cms_index_rows_by_key(cms_get_all_images());
$allRows = array_values($rowsByKey);
$totalSlots = count(cms_all_image_keys());
$uploaded = cms_count_uploaded($allRows);

$content = '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars(cms_admin_url('dashboard.php')) . '">← Dashboard</a>';
$content .= '<h1>Photos</h1>';
$content .= '<p>Choose a section to update images on your website.</p>';
$content .= '</div>';

$content .= '<div class="stats-row stats-row-compact">';
$content .= '<div class="stat-card stat-success"><span class="stat-value">' . $uploaded . '</span><span class="stat-label">Your uploads</span></div>';
$content .= '<div class="stat-card stat-warning"><span class="stat-value">' . ($totalSlots - $uploaded) . '</span><span class="stat-label">Using defaults</span></div>';
$content .= '<div class="stat-card"><span class="stat-value">' . $totalSlots . '</span><span class="stat-label">Total photo spots</span></div>';
$content .= '</div>';

$content .= '<form method="get" class="toolbar-inline">';
$content .= '<label>Search photos<input type="search" name="q" value="' . htmlspecialchars($search) . '" placeholder="Search by name…"></label>';
$content .= '<button type="submit" class="btn btn-secondary">Search</button>';
if ($search !== '') {
    $content .= '<a class="btn btn-ghost" href="' . htmlspecialchars(cms_admin_url('photos/index.php')) . '">Clear</a>';
}
$content .= '</form>';

if ($search !== '') {
    $rows = cms_filter_library_rows($allRows, $filter, $search);
    $content .= '<p class="results-meta">' . count($rows) . ' result' . (count($rows) === 1 ? '' : 's') . '</p>';
    $content .= '<div class="photo-grid">';
    foreach ($rows as $row) {
        $content .= cms_render_photo_card($row, $filter, $search);
    }
    $content .= '</div>';
} else {
    $content .= '<section id="categories" class="section">';
    $content .= '<div class="section-head"><h2>Photo categories</h2><p>Pick a section of your website to manage.</p></div>';
    $content .= '<div class="category-grid">';
    foreach (cms_dashboard_categories() as $cat) {
        $categoryId = $cat['id'];
        $stats = cms_category_stats($categoryId, $rowsByKey);
        if ($stats['total'] === 0) {
            continue;
        }
        $previewUrl = $stats['preview_key'] ? cms_admin_preview_url($stats['preview_key']) : '';
        $pct = $stats['total'] > 0 ? (int) round(($stats['uploaded'] / $stats['total']) * 100) : 0;
        $content .= '<article class="category-card">';
        $content .= '<div class="category-card-media">';
        if ($previewUrl !== '') {
            $content .= '<img src="' . htmlspecialchars($previewUrl) . '" alt="" loading="lazy">';
        }
        $content .= '<span class="category-card-icon" aria-hidden="true">' . $cat['icon'] . '</span>';
        $content .= '</div>';
        $content .= '<div class="category-card-body">';
        $content .= '<h3>' . htmlspecialchars($cat['label']) . '</h3>';
        $content .= '<p class="category-card-stat"><strong>' . $stats['uploaded'] . ' / ' . $stats['total'] . '</strong> images uploaded</p>';
        $content .= '<div class="progress-bar" role="progressbar" aria-valuenow="' . $pct . '" aria-valuemin="0" aria-valuemax="100"><span style="width:' . $pct . '%"></span></div>';
        $content .= '<a class="btn btn-primary btn-block" href="' . htmlspecialchars(cms_category_url($categoryId)) . '">Manage</a>';
        $content .= '</div></article>';
    }
    $content .= '</div></section>';
}

cms_admin_layout('Photos', $content, 'photos');
