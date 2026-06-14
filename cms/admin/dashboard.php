<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../data/keys.php';
require_once __DIR__ . '/../data/admin-ui.php';

cms_require_admin();
cms_admin_bootstrap();
cms_load_content_store();
cms_content_seed_if_empty();

$rowsByKey = cms_index_rows_by_key(cms_get_all_images());
$allRows = array_values($rowsByKey);
$totalSlots = count(cms_all_image_keys());
$uploaded = cms_count_uploaded($allRows);

$testimonialRows = cms_content_get_all_testimonials(true);
$visibleTestimonials = count(array_filter($testimonialRows, static fn (array $r): bool => !empty($r['visible'])));

$content = '<div class="page-header">';
$content .= '<h1>Dashboard</h1>';
$content .= '<p>Manage photos, testimonials, and homepage statistics for your website.</p>';
$content .= '</div>';

$content .= '<div class="category-grid dashboard-sections">';

$content .= '<article class="category-card">';
$content .= '<div class="category-card-media section-card-media section-card-photos"><span class="category-card-icon" aria-hidden="true">📷</span></div>';
$content .= '<div class="category-card-body">';
$content .= '<h3>Photos</h3>';
$content .= '<p class="category-card-stat"><strong>' . $uploaded . ' / ' . $totalSlots . '</strong> images uploaded</p>';
$content .= '<a class="btn btn-primary btn-block" href="' . htmlspecialchars(cms_admin_url('photos/index.php')) . '">Manage photos</a>';
$content .= '</div></article>';

$content .= '<article class="category-card">';
$content .= '<div class="category-card-media section-card-media section-card-testimonials"><span class="category-card-icon" aria-hidden="true">💬</span></div>';
$content .= '<div class="category-card-body">';
$content .= '<h3>Testimonials</h3>';
$content .= '<p class="category-card-stat"><strong>' . $visibleTestimonials . '</strong> visible · ' . count($testimonialRows) . ' total</p>';
$content .= '<a class="btn btn-primary btn-block" href="' . htmlspecialchars(cms_admin_url('testimonials/index.php')) . '">Manage testimonials</a>';
$content .= '</div></article>';

$content .= '<article class="category-card">';
$content .= '<div class="category-card-media section-card-media section-card-stats"><span class="category-card-icon" aria-hidden="true">📊</span></div>';
$content .= '<div class="category-card-body">';
$content .= '<h3>Statistics</h3>';
$content .= '<p class="category-card-stat">Homepage trust numbers</p>';
$content .= '<a class="btn btn-primary btn-block" href="' . htmlspecialchars(cms_admin_url('statistics.php')) . '">Edit statistics</a>';
$content .= '</div></article>';

$content .= '</div>';

cms_admin_layout('Dashboard', $content, 'dashboard');
