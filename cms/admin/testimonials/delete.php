<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

cms_require_admin();

$id = (int) ($_POST['id'] ?? 0);
if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
    cms_redirect_with_msg(cms_admin_url('testimonials/index.php'), 'csrf_failed');
}
if ($id <= 0) {
    cms_redirect_with_msg(cms_admin_url('testimonials/index.php'), 'not_found');
}

if (cms_content_delete_testimonial($id)) {
    cms_redirect_with_msg(cms_admin_url('testimonials/index.php'), 'testimonial_deleted');
}
cms_redirect_with_msg(cms_admin_url('testimonials/index.php'), 'delete_failed');
