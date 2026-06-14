<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();

$filter = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
$search = isset($_GET['q']) ? trim((string) $_GET['q']) : '';

cms_register_missing_keys(cms_all_image_keys());
cms_sync_registry_metadata();

$allRows = cms_get_all_images();
$rows = cms_filter_library_rows($allRows, $filter, $search);
$groups = cms_group_rows_by_category($rows);
$filterCategories = cms_filter_categories();

$total = count($allRows);
$uploaded = cms_count_uploaded($allRows);
$missing = $total - $uploaded;

$content = '<div class="page-intro">';
$content .= '<h1>Your website photos</h1>';
$content .= '<p>Tap any photo below to change it. Updates appear on the live site right away.</p>';
$content .= '</div>';

$content .= '<div class="stats-row">';
$content .= '<div class="stat-card is-success"><strong>' . $uploaded . '</strong><span>Photos you\'ve uploaded</span></div>';
$content .= '<div class="stat-card is-warning"><strong>' . $missing . '</strong><span>Still using defaults</span></div>';
$content .= '<div class="stat-card"><strong>' . $total . '</strong><span>Total photo spots</span></div>';
$content .= '</div>';

$content .= '<form method="get" class="toolbar" id="library-search-form">';
$content .= '<div class="search-bar">';
$content .= '<label for="library-search" class="sr-only">Search photos</label>';
$content .= '<input id="library-search" type="search" name="q" value="' . htmlspecialchars($search) . '" placeholder="Search by photo name…" autocomplete="off">';
$content .= '</div>';
$content .= '<div class="filter-pills">';
$allActive = $filter === '' ? ' is-active' : '';
$content .= '<a class="filter-pill' . $allActive . '" href="' . htmlspecialchars(cms_admin_url('library.php') . cms_library_query_string('', $search)) . '">All</a>';
foreach ($filterCategories as $cat) {
    $active = $filter === $cat ? ' is-active' : '';
    $href = cms_admin_url('library.php') . cms_library_query_string($cat, $search);
    $content .= '<a class="filter-pill' . $active . '" href="' . htmlspecialchars($href) . '">' . htmlspecialchars($cat) . '</a>';
}
$content .= '</div></form>';

if (count($rows) === 0) {
    $content .= '<div class="empty-state">';
    $content .= '<div class="empty-state-icon" aria-hidden="true">🔍</div>';
    $content .= '<h2>No photos found</h2>';
    $content .= '<p>Try a different search or choose another category above.</p>';
    $content .= '<a class="btn btn-primary" href="' . htmlspecialchars(cms_admin_url('library.php')) . '">Show all photos</a>';
    $content .= '</div>';
} else {
    foreach ($groups as $category => $categoryRows) {
        $catUploaded = cms_count_uploaded($categoryRows);
        $catTotal = count($categoryRows);

        $content .= '<section class="category-section">';
        $content .= '<div class="category-header">';
        $content .= '<h2>' . htmlspecialchars($category) . '</h2>';
        $content .= '<p>' . htmlspecialchars(cms_category_hint($category)) . '</p>';
        $content .= '<div class="category-count">' . $catUploaded . ' of ' . $catTotal . ' photos uploaded</div>';
        $content .= '</div>';
        $content .= '<div class="photo-grid">';

        foreach ($categoryRows as $row) {
            $key = $row['image_key'];
            $label = cms_display_label($key, $row);
            $hasFile = !empty($row['file_path']);
            $previewUrl = cms_admin_url('preview.php?key=' . urlencode($key));
            $uploadQs = cms_library_query_string($filter, $search);
            $uploadUrl = cms_admin_url('upload.php?key=' . urlencode($key))
                . ($uploadQs !== '' ? '&' . ltrim($uploadQs, '?') : '');

            $content .= '<article class="photo-card">';
            $content .= '<div class="photo-card-media">';
            if ($hasFile) {
                $content .= '<img src="' . htmlspecialchars($previewUrl) . '" alt="' . htmlspecialchars($label) . '">';
            } else {
                $content .= '<div class="photo-card-placeholder"><span>📷</span><span>No photo yet</span></div>';
            }
            $content .= '</div>';
            $content .= '<div class="photo-card-body">';
            $content .= '<h3 class="photo-card-title">' . htmlspecialchars($label) . '</h3>';
            $content .= '<div class="photo-card-meta">';
            if ($hasFile) {
                $content .= '<span class="badge badge-live">✓ Live</span>';
            } else {
                $content .= '<span class="badge badge-default">Default</span>';
            }
            $content .= '<span class="photo-card-date">' . htmlspecialchars(cms_friendly_date($row['updated_at'] ?? null)) . '</span>';
            $content .= '</div>';
            $content .= '<div class="photo-card-actions">';
            $btnLabel = $hasFile ? 'Change photo' : 'Add photo';
            $content .= '<a class="btn btn-primary" href="' . htmlspecialchars($uploadUrl) . '">' . $btnLabel . '</a>';
            if ($hasFile) {
                $content .= '<a class="btn btn-ghost" href="' . htmlspecialchars($previewUrl) . '" target="_blank" rel="noopener">View full size</a>';
                $content .= '<form method="post" action="' . htmlspecialchars(cms_admin_url('delete.php')) . '" class="inline" data-confirm-delete data-photo-label="' . htmlspecialchars($label) . '">';
                $content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars(cms_csrf_token()) . '">';
                $content .= '<input type="hidden" name="image_key" value="' . htmlspecialchars($key) . '">';
                $content .= '<input type="hidden" name="category" value="' . htmlspecialchars($filter) . '">';
                $content .= '<input type="hidden" name="q" value="' . htmlspecialchars($search) . '">';
                $content .= '<button type="submit" class="btn btn-danger">Remove</button></form>';
            }
            $content .= '</div></div></article>';
        }

        $content .= '</div></section>';
    }
}

cms_admin_layout('All photos', $content, 'library');
