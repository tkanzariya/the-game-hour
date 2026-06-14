<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

cms_logout();
header('Location: ' . cms_admin_url('login.php'));
