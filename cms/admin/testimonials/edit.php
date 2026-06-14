<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';

cms_require_admin();
cms_content_seed_if_empty();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$isEdit = $id > 0;
$row = $isEdit ? cms_content_get_testimonial($id) : null;
if ($isEdit && $row === null) {
    cms_redirect_with_msg(cms_admin_url('testimonials/index.php'), 'not_found');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = cms_flash_message('csrf_failed');
    } else {
        $payload = [
            'id' => (int) ($_POST['id'] ?? 0),
            'name' => $_POST['name'] ?? '',
            'role' => $_POST['role'] ?? '',
            'review' => $_POST['review'] ?? '',
            'rating' => $_POST['rating'] ?? 5,
            'visible' => isset($_POST['visible']) ? 1 : 0,
            'sort_order' => $_POST['sort_order'] ?? 0,
            'placement' => $_POST['placement'] ?? 'home',
            'service_slug' => $_POST['service_slug'] ?? '',
        ];
        $result = cms_content_save_testimonial($payload);
        if ($result['ok']) {
            $code = $isEdit ? 'testimonial_updated' : 'testimonial_created';
            cms_redirect_with_msg(cms_admin_url('testimonials/index.php'), $code);
        }
        $error = $result['error'] ?? 'Could not save testimonial.';
        $row = array_merge($row ?? [], $payload);
    }
}

$defaults = [
    'name' => '',
    'role' => '',
    'review' => '',
    'rating' => 5,
    'visible' => 1,
    'sort_order' => 0,
    'placement' => 'home',
    'service_slug' => '',
];
$form = array_merge($defaults, $row ?? []);
$token = cms_csrf_token();

$content = '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars(cms_admin_url('testimonials/index.php')) . '">← Testimonials</a>';
$content .= '<h1>' . ($isEdit ? 'Edit testimonial' : 'Add testimonial') . '</h1>';
$content .= '</div>';

if ($error !== '') {
    $content .= '<div class="notice notice-error" role="alert">' . htmlspecialchars($error) . '</div>';
}

$content .= '<div class="card form-panel">';
$content .= '<form method="post" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
if ($isEdit) {
    $content .= '<input type="hidden" name="id" value="' . $id . '">';
}

$content .= '<label>Name<input type="text" name="name" required maxlength="255" value="' . htmlspecialchars((string) $form['name']) . '"></label>';
$content .= '<label>Role<input type="text" name="role" maxlength="255" value="' . htmlspecialchars((string) $form['role']) . '" placeholder="e.g. HR Lead, Ahmedabad"></label>';
$content .= '<label>Review<textarea name="review" required rows="6" maxlength="2000">' . htmlspecialchars((string) $form['review']) . '</textarea></label>';

$content .= '<label>Rating<select name="rating">';
for ($r = 5; $r >= 1; $r--) {
    $sel = (int) $form['rating'] === $r ? ' selected' : '';
    $content .= '<option value="' . $r . '"' . $sel . '>' . $r . ' star' . ($r === 1 ? '' : 's') . '</option>';
}
$content .= '</select></label>';

$content .= '<label>Sort order<input type="number" name="sort_order" value="' . (int) $form['sort_order'] . '" step="1" min="0" max="9999">';
$content .= '<span class="field-hint">Lower numbers appear first. Same order uses newest first.</span></label>';

$content .= '<label>Show on website<input type="checkbox" name="visible" value="1"' . (!empty($form['visible']) ? ' checked' : '') . '></label>';

$content .= '<fieldset class="fieldset"><legend>Where it appears</legend>';
$placement = (string) $form['placement'];
$content .= '<label class="radio-row"><input type="radio" name="placement" value="home"' . ($placement !== 'service' ? ' checked' : '') . '> Home page testimonials</label>';
$content .= '<label class="radio-row"><input type="radio" name="placement" value="service"' . ($placement === 'service' ? ' checked' : '') . '> Service page testimonials</label>';
$content .= '<label>Service page<select name="service_slug">';
$content .= '<option value="">— Select service —</option>';
foreach (cms_content_service_options() as $opt) {
    $sel = (string) ($form['service_slug'] ?? '') === $opt['id'] ? ' selected' : '';
    $content .= '<option value="' . htmlspecialchars($opt['id']) . '"' . $sel . '>' . htmlspecialchars($opt['label']) . '</option>';
}
$content .= '</select></label></fieldset>';

$content .= '<div class="form-actions">';
$content .= '<button type="submit" class="btn btn-primary">' . ($isEdit ? 'Save changes' : 'Add testimonial') . '</button>';
$content .= '<a class="btn btn-secondary" href="' . htmlspecialchars(cms_admin_url('testimonials/index.php')) . '">Cancel</a>';
$content .= '</div></form></div>';

cms_admin_layout($isEdit ? 'Edit testimonial' : 'Add testimonial', $content, 'testimonials');
