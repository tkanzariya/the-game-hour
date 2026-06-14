<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

if (cms_is_logged_in()) {
    header('Location: ' . cms_admin_url('dashboard.php'));
} else {
    header('Location: ' . cms_admin_url('login.php'));
}
