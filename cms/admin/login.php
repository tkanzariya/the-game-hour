<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if (cms_is_logged_in()) {
    header('Location: ' . cms_admin_url('dashboard.php'));
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Please sign in again.';
    } else {
        $user = trim((string) ($_POST['username'] ?? ''));
        $pass = (string) ($_POST['password'] ?? '');
        if (cms_login($user, $pass)) {
            require_once __DIR__ . '/../data/keys.php';
            cms_register_missing_keys(cms_all_image_keys());
            cms_sync_registry_metadata();
            cms_content_seed_if_empty();
            header('Location: ' . cms_admin_url('dashboard.php'));
            exit;
        }
        $error = 'That username or password did not work. Please try again.';
    }
}

$token = cms_csrf_token();
$content = '<div class="login-page"><div class="card login-card">';
$content .= '<div class="login-icon" aria-hidden="true">📷</div>';
$content .= '<h1>Welcome back</h1>';
$content .= '<p class="muted">Sign in to manage your website content.</p>';
if ($error) {
    $content .= '<p class="error">' . htmlspecialchars($error) . '</p>';
}
$content .= '<form method="post" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
$content .= '<label>Username<input type="text" name="username" required autocomplete="username" placeholder="Your login name"></label>';
$content .= '<label>Password<input type="password" name="password" required autocomplete="current-password" placeholder="Your password"></label>';
$content .= '<button type="submit" class="btn btn-primary btn-block">Sign in</button></form></div></div>';

cms_admin_layout('Sign in', $content, '', '', true);
