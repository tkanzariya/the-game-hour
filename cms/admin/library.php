<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';

cms_require_admin();

$filter = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
$search = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
$message = isset($_GET['msg']) ? trim((string) $_GET['msg']) : '';

cms_register_missing_keys(cms_all_image_keys());
cms_sync_registry_metadata();

$allRows = cms_get_all_images();
$rows = cms_filter_library_rows($allRows, $filter, $search);
$filterCategories = cms_filter_categories();

$content = '<div class="page-head"><h1>Image library</h1>';
$content .= '<a class="btn primary" href="' . htmlspecialchars(cms_admin_url('upload.php')) . '">Upload image</a></div>';

if ($message !== '') {
    $content .= '<p class="success">' . htmlspecialchars($message) . '</p>';
}

$content .= '<form method="get" class="filters">';
$content .= '<label class="search-field">Search';
$content .= '<span class="sr-only">Search by label or key</span>';
$content .= '<input id="library-search" type="search" name="q" value="' . htmlspecialchars($search) . '" placeholder="Search label or key…"></label>';
$content .= '<label>Category<select name="category"><option value="">All categories</option>';
foreach ($filterCategories as $cat) {
    $sel = $filter === $cat ? ' selected' : '';
    $content .= '<option value="' . htmlspecialchars($cat) . '"' . $sel . '>' . htmlspecialchars($cat) . '</option>';
}
$content .= '</select></label>';
$content .= '<button type="submit" class="btn primary">Apply</button>';
if ($filter !== '' || $search !== '') {
    $content .= '<a class="btn" href="' . htmlspecialchars(cms_admin_url('library.php')) . '">Clear</a>';
}
$content .= '</form>';

$count = count($rows);
$total = count($allRows);
$content .= '<p class="results-count">' . $count . ' of ' . $total . ' image slots'
    . ($filter !== '' || $search !== '' ? ' (filtered)' : '') . '</p>';

$content .= '<div class="table-wrap"><table><thead><tr>';
$content .= '<th>Thumbnail</th><th>Label</th><th>Key</th><th>Category</th><th>Last updated</th><th>Actions</th>';
$content .= '</tr></thead><tbody>';

if ($count === 0) {
    $content .= '<tr><td colspan="6" class="empty-row">No images match your search. Try another label, key, or category.</td></tr>';
}

foreach ($rows as $row) {
    $key = $row['image_key'];
    $label = cms_display_label($key, $row);
    $category = (string) ($row['category'] ?? cms_key_meta($key)['category']);
    $hasFile = !empty($row['file_path']);
    $previewUrl = cms_admin_url('preview.php?key=' . urlencode($key));
    $thumb = $hasFile
        ? '<img class="thumb" src="' . htmlspecialchars($previewUrl) . '" alt="' . htmlspecialchars($label) . '">'
        : '<span class="thumb empty">No file</span>';
    $updated = $row['updated_at'] ? htmlspecialchars($row['updated_at']) : '—';
    $uploadQs = cms_library_query_string($filter, $search);
    $uploadUrl = cms_admin_url('upload.php?key=' . urlencode($key))
        . ($uploadQs !== '' ? '&' . ltrim($uploadQs, '?') : '');

    $content .= '<tr>';
    $content .= '<td>' . $thumb . '</td>';
    $content .= '<td class="label-cell"><strong>' . htmlspecialchars($label) . '</strong></td>';
    $content .= '<td><code>' . htmlspecialchars($key) . '</code></td>';
    $content .= '<td>' . htmlspecialchars($category) . '</td>';
    $content .= '<td>' . $updated . '</td>';
    $content .= '<td class="actions">';
    $content .= '<a class="btn small" href="' . htmlspecialchars($uploadUrl) . '">' . ($hasFile ? 'Replace' : 'Upload') . '</a>';
    if ($hasFile) {
        $content .= '<a class="btn small" href="' . htmlspecialchars($previewUrl) . '" target="_blank" rel="noopener">Preview</a>';
        $content .= '<form method="post" action="' . htmlspecialchars(cms_admin_url('delete.php')) . '" class="inline" onsubmit="return confirm(\'Remove this image? The website will use the default until you upload again.\');">';
        $content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars(cms_csrf_token()) . '">';
        $content .= '<input type="hidden" name="image_key" value="' . htmlspecialchars($key) . '">';
        $content .= '<input type="hidden" name="category" value="' . htmlspecialchars($filter) . '">';
        $content .= '<input type="hidden" name="q" value="' . htmlspecialchars($search) . '">';
        $content .= '<button type="submit" class="btn small danger">Delete</button></form>';
    }
    $content .= '</td></tr>';
}

$content .= '</tbody></table></div>';

cms_admin_layout('Library', $content);
