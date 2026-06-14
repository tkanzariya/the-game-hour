<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if (cms_is_logged_in()) {
    header('Location: ' . cms_admin_url('library.php'));
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'Session expired. Please try again.';
    } else {
        $user = trim((string) ($_POST['username'] ?? ''));
        $pass = (string) ($_POST['password'] ?? '');
        if (cms_login($user, $pass)) {
            require_once __DIR__ . '/../data/keys.php';
            cms_register_missing_keys(cms_all_image_keys());
            cms_sync_registry_metadata();
            header('Location: ' . cms_admin_url('library.php'));
            exit;
        }
        $error = 'Invalid username or password.';
    }
}

$token = cms_csrf_token();
$content = '<div class="card login-card">';
$content .= '<h1>Image CMS</h1><p class="muted">Manage website photos without code or FTP.</p>';
if ($error) {
    $content .= '<p class="error">' . htmlspecialchars($error) . '</p>';
}
$content .= '<form method="post" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
$content .= '<label>Username<input type="text" name="username" required autocomplete="username"></label>';
$content .= '<label>Password<input type="password" name="password" required autocomplete="current-password"></label>';
$content .= '<button type="submit" class="btn primary">Sign in</button></form></div>';

cms_admin_layout('Sign in', $content);
