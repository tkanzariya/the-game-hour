<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';

$qs = $_SERVER['QUERY_STRING'] ?? '';
$target = cms_admin_url('photos/index.php');
if ($qs !== '') {
    $target .= '?' . $qs;
}
header('Location: ' . $target, true, 302);
exit;
