<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/bootstrap.php';
require_once __DIR__ . '/../../includes/ops-store.php';
require_once __DIR__ . '/../../includes/mail.php';
require_once __DIR__ . '/../../data/keys.php';

header('Cache-Control: no-store');
cms_ops_require_json_admin();

$method = $_SERVER['REQUEST_METHOD'];
$section = $_GET['section'] ?? '';
if (!in_array($method, ['GET', 'POST', 'DELETE'], true)) {
    cms_json_response(['error' => 'Method not allowed.'], 405);
}
if ($method !== 'GET') {
    cms_ops_verify_json_csrf();
}
$input = $method === 'POST' ? cms_ops_read_json_body() : [];

try {
    if ($section === 'photos') {
        $registry = cms_all_image_keys();
        if ($method === 'GET') {
            $rows = array_column(cms_get_all_images(), null, 'image_key');
            $photos = [];
            foreach ($registry + $rows as $key => $meta) {
                $row = $rows[$key] ?? [];
                $photos[] = [
                    'key' => $key,
                    'title' => $meta['title'],
                    'category' => $meta['category'],
                    'usage' => $meta['usage'] ?? '',
                    'uploaded' => !empty($row['file_path']),
                    'preview' => !empty($row['file_path']) || !empty($meta['fallback'])
                        ? '/admin/preview.php?key=' . rawurlencode($key) : null,
                ];
            }
            cms_json_response(['photos' => $photos]);
        }
        $key = $_GET['key'] ?? '';
        if (!is_string($key) || !preg_match('/^[a-z0-9_-]+$/D', $key)) {
            cms_json_response(['error' => 'Invalid photo slot.'], 400);
        }
        $meta = $registry[$key] ?? cms_get_image_by_key($key);
        if (!$meta) {
            cms_json_response(['error' => 'Photo slot not found.'], 404);
        }
        if ($method === 'POST' && !isset($_FILES['image'])) {
            cms_json_response(['error' => 'Select an image within the server upload limit.'], 422);
        }
        $result = $method === 'DELETE' ? cms_delete_image($key)
            : cms_save_upload($key, $_FILES['image'], $meta['title'], $meta['category']);
        cms_json_response($result, $result['ok'] ? 200 : 422);
    }

    if ($section === 'alerts') {
        if ($method === 'GET') {
            cms_json_response(['email' => cms_settings_notify_email(), 'configured' => cms_mail_configured()]);
        }
        if ($method === 'POST') {
            $email = trim((string) ($input['email'] ?? ''));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                cms_json_response(['error' => 'Enter a valid notification email address.'], 422);
            }
            if (($input['action'] ?? '') === 'test') {
                $sample = cms_booking_alert_sample_vars();
                $sent = cms_mail_send($email, 'The Game Hour: test booking alert', cms_booking_alert_text($sample),
                    null, cms_booking_alert_html($sample), [], $sample);
                cms_json_response($sent, !empty($sent['ok']) ? 200 : 422);
            }
            $ok = cms_settings_set('notify_email', $email);
            cms_json_response($ok ? ['ok' => true] : ['error' => 'Could not save the email address.'], $ok ? 200 : 500);
        }
    }

    if ($section === 'statistics' || $section === 'testimonials') {
        cms_load_content_store();
        if (!cms_content_db_ready()) {
            cms_json_response(['error' => 'Website content storage is unavailable.'], 503);
        }
        if ($section === 'statistics') {
            if ($method === 'GET') {
                cms_json_response(['values' => cms_content_get_metric_values(), 'labels' => cms_content_metric_labels()]);
            }
            if ($method === 'POST') {
                $values = [];
                foreach (cms_content_metric_keys() as $key) {
                    $value = $input[$key] ?? null;
                    if (!is_string($value) || trim($value) === '' || cms_content_text_length($value) > 60) {
                        cms_json_response(['error' => 'Enter a value of up to 60 characters for each statistic.'], 422);
                    }
                    $values[$key] = $value;
                }
                cms_content_save_metric_values($values);
                cms_json_response(['ok' => true]);
            }
        } else {
            if ($method === 'GET') {
                $rows = cms_content_get_all_testimonials(true);
                foreach ($rows as &$row) {
                    $row['id'] = (int) $row['id'];
                    $row['visible'] = (bool) $row['visible'];
                    $row['rating'] = (int) $row['rating'];
                    $row['sort_order'] = (int) $row['sort_order'];
                }
                unset($row);
                cms_json_response(['testimonials' => $rows, 'services' => cms_content_service_options()]);
            }
            if ($method === 'POST') {
                $result = cms_content_save_testimonial($input);
                cms_json_response($result, $result['ok'] ? 200 : (($result['code'] ?? '') === 'not_found' ? 404 : 422));
            }
            $id = filter_var($_GET['id'] ?? '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($id && cms_content_delete_testimonial($id)) {
                cms_json_response(['ok' => true]);
            }
            cms_json_response(['error' => 'Testimonial not found.'], 404);
        }
    }

    cms_json_response(['error' => 'Unknown website control or method.'], 404);
} catch (Throwable $error) {
    error_log('Website manager: ' . get_class($error));
    cms_json_response(['error' => 'The website manager could not complete this request. Try again.'], 500);
}
