<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();
cms_admin_bootstrap();

$rowsByKey = cms_index_rows_by_key(cms_get_all_images());
$allRows = array_values($rowsByKey);
$totalSlots = count(cms_all_image_keys());
$uploaded = cms_count_uploaded($allRows);

$content = '<div class="page-header">';
$content .= '<h1>Dashboard</h1>';
$content .= '<p>Manage website photos by section. Pick a category to view and update images.</p>';
$content .= '</div>';

$content .= '<div class="stats-row">';
$content .= '<div class="stat-card stat-success"><span class="stat-value">' . $uploaded . '</span><span class="stat-label">Your uploads</span></div>';
$content .= '<div class="stat-card stat-warning"><span class="stat-value">' . ($totalSlots - $uploaded) . '</span><span class="stat-label">Using defaults</span></div>';
$content .= '<div class="stat-card"><span class="stat-value">' . $totalSlots . '</span><span class="stat-label">Total photo spots</span></div>';
$content .= '</div>';

$content .= '<section id="categories" class="section">';
$content .= '<div class="section-head"><h2>Categories</h2><p>Choose a section of your website to manage.</p></div>';
$content .= '<div class="category-grid">';

foreach (cms_dashboard_categories() as $cat) {
    $categoryId = $cat['id'];
    $stats = cms_category_stats($categoryId, $rowsByKey);
    if ($stats['total'] === 0) {
        continue;
    }

    $previewUrl = $stats['preview_key']
        ? cms_admin_preview_url($stats['preview_key'])
        : '';
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

cms_admin_layout('Dashboard', $content, 'dashboard');
