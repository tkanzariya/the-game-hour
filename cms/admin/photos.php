<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

header('Location: ' . cms_admin_url('photos/index.php'), true, 302);
exit;
