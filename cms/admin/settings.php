<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

cms_require_admin();

$content = '<div class="page-header">';
$content .= '<h1>Settings</h1>';
$content .= '<p>Your Photo Manager account and website connection.</p>';
$content .= '</div>';

$content .= '<div class="settings-grid">';
$content .= '<div class="card settings-card">';
$content .= '<h2>Your account</h2>';
$content .= '<p class="muted">Signed in as <strong>' . htmlspecialchars((string) ($_SESSION['cms_admin'] ?? '')) . '</strong></p>';
$content .= '<p class="muted">To change your password, ask your developer to generate a new hash in <code>cms/config.php</code>.</p>';
$content .= '</div>';

$content .= '<div class="card settings-card">';
$content .= '<h2>Website</h2>';
$content .= '<p class="muted">Photos you upload appear on <a href="https://thegamehour.com" target="_blank" rel="noopener">thegamehour.com</a> within seconds.</p>';
$content .= '<p class="muted">Removing a photo restores the original default image bundled with the site.</p>';
$content .= '</div>';

$content .= '<div class="card settings-card">';
$content .= '<h2>Need help?</h2>';
$content .= '<ul class="settings-list">';
$content .= '<li>Use <strong>Dashboard → Categories</strong> to manage photos section by section.</li>';
$content .= '<li>Use the search bar to find photos by name (e.g. “Homepage Hero”).</li>';
$content .= '<li>Accepted formats: JPG, PNG, WEBP — max 5 MB.</li>';
$content .= '</ul>';
$content .= '</div>';
$content .= '</div>';

cms_admin_layout('Settings', $content, 'settings');
