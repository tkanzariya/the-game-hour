<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

cms_require_admin();
cms_load_content_store();
cms_content_seed_if_empty();

$message = isset($_GET['msg']) ? cms_flash_message((string) $_GET['msg']) : '';
$rows = cms_content_get_all_testimonials(true);

$content = '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars(cms_admin_url('dashboard.php')) . '">← Dashboard</a>';
$content .= '<div class="page-header-row">';
$content .= '<div><h1>Testimonials</h1>';
$content .= '<p>Guest reviews on the home page and service pages. Lower sort order appears first.</p></div>';
$content .= '<a class="btn btn-primary" href="' . htmlspecialchars(cms_admin_url('testimonials/edit.php')) . '">+ Add testimonial</a>';
$content .= '</div></div>';

if ($message !== '') {
    $content .= '<div class="notice notice-success" role="status">' . htmlspecialchars($message) . '</div>';
}

if (count($rows) === 0) {
    $content .= '<div class="empty-state"><div class="empty-state-icon">💬</div>';
    $content .= '<h2>No testimonials yet</h2>';
    $content .= '<p>Add your first guest review or they will load from defaults on first login.</p>';
    $content .= '<a class="btn btn-primary" href="' . htmlspecialchars(cms_admin_url('testimonials/edit.php')) . '">Add testimonial</a></div>';
} else {
    $content .= '<div class="data-table-wrap"><table class="data-table">';
    $content .= '<thead><tr><th>Order</th><th>Rating</th><th>Name</th><th>Role</th><th>Page</th><th>Status</th><th></th></tr></thead><tbody>';
    foreach ($rows as $row) {
        $id = (int) ($row['id'] ?? 0);
        $visible = !empty($row['visible']);
        $placement = (string) ($row['placement'] ?? 'home');
        $pageLabel = $placement === 'service'
            ? 'Service · ' . (string) ($row['service_slug'] ?? '')
            : 'Home';
        $content .= '<tr>';
        $content .= '<td>' . (int) ($row['sort_order'] ?? 0) . '</td>';
        $content .= '<td><span class="stars" aria-label="' . (int) ($row['rating'] ?? 5) . ' stars">' . cms_content_stars((int) ($row['rating'] ?? 5)) . '</span></td>';
        $content .= '<td><strong>' . htmlspecialchars((string) ($row['name'] ?? '')) . '</strong></td>';
        $content .= '<td>' . htmlspecialchars((string) ($row['role'] ?? '')) . '</td>';
        $content .= '<td>' . htmlspecialchars($pageLabel) . '</td>';
        $content .= '<td><span class="photo-card-badge ' . ($visible ? 'badge-live' : 'badge-default') . '">' . ($visible ? 'Visible' : 'Hidden') . '</span></td>';
        $content .= '<td class="table-actions">';
        $content .= '<a class="btn btn-secondary btn-sm" href="' . htmlspecialchars(cms_admin_url('testimonials/edit.php?id=' . $id)) . '">Edit</a>';
        $content .= '<form method="post" action="' . htmlspecialchars(cms_admin_url('testimonials/delete.php')) . '" class="inline" data-confirm-delete data-photo-label="this testimonial">';
        $content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars(cms_csrf_token()) . '">';
        $content .= '<input type="hidden" name="id" value="' . $id . '">';
        $content .= '<button type="submit" class="btn btn-danger btn-sm">Delete</button></form>';
        $content .= '</td></tr>';
    }
    $content .= '</tbody></table></div>';
}

cms_admin_layout('Testimonials', $content, 'testimonials');
