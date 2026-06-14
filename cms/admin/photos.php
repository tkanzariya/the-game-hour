<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();
cms_admin_bootstrap();

$search = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
$filter = isset($_GET['category']) ? trim((string) $_GET['category']) : '';

$allRows = cms_get_all_images();
$rows = cms_filter_library_rows($allRows, $filter, $search);

$content = '<div class="page-header">';
$content .= '<h1>All Photos</h1>';
if ($search !== '') {
    $content .= '<p>Showing results for “' . htmlspecialchars($search) . '”</p>';
} else {
    $content .= '<p>Search or filter every photo spot on your website.</p>';
}
$content .= '</div>';

$content .= '<form method="get" class="toolbar-inline">';
$content .= '<label>Filter by category<select name="category">';
$content .= '<option value="">All categories</option>';
foreach (cms_filter_categories() as $cat) {
    $sel = $filter === $cat ? ' selected' : '';
    $content .= '<option value="' . htmlspecialchars($cat) . '"' . $sel . '>' . htmlspecialchars($cat) . '</option>';
}
$content .= '</select></label>';
$content .= '<input type="hidden" name="q" value="' . htmlspecialchars($search) . '">';
$content .= '<button type="submit" class="btn btn-secondary">Apply filter</button>';
if ($filter !== '') {
    $content .= '<a class="btn btn-ghost" href="' . htmlspecialchars(cms_admin_url('photos.php') . cms_library_query_string('', $search)) . '">Clear filter</a>';
}
$content .= '</form>';

if (count($rows) === 0) {
    $content .= '<div class="empty-state">';
    $content .= '<div class="empty-state-icon">🔍</div>';
    $content .= '<h2>No photos found</h2>';
    $content .= '<p>Try a different search term or category.</p>';
    $content .= '<a class="btn btn-primary" href="' . htmlspecialchars(cms_admin_url('photos.php')) . '">View all</a>';
    $content .= '</div>';
} else {
    $content .= '<p class="results-meta">' . count($rows) . ' photo' . (count($rows) === 1 ? '' : 's') . '</p>';
    $content .= '<div class="photo-grid">';
    foreach ($rows as $row) {
        $content .= cms_render_photo_card($row, $filter, $search);
    }
    $content .= '</div>';
}

cms_admin_layout('All Photos', $content, 'photos', $search);
