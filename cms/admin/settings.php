<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/bootstrap.php';
require_once __DIR__ . '/../includes/settings-store.php';
require_once __DIR__ . '/../includes/mail.php';

cms_require_admin();

$error = '';
$message = isset($_GET['msg']) ? cms_flash_message((string) $_GET['msg']) : '';
$notifyEmail = cms_settings_notify_email();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!cms_verify_csrf($_POST['csrf'] ?? null)) {
        $error = cms_flash_message('csrf_failed');
    } else {
        $action = (string) ($_POST['action'] ?? 'save');
        $email = strtolower(trim((string) ($_POST['notify_email'] ?? '')));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Enter a valid notification email address.';
            $notifyEmail = $email !== '' ? $email : $notifyEmail;
        } elseif ($action === 'test') {
            if (!cms_settings_set('notify_email', $email)) {
                $error = 'Could not save the email address.';
            } else {
                $notifyEmail = $email;
                $sample = cms_booking_alert_sample_vars();
                $sent = cms_mail_send(
                    $email,
                    'The Game Hour — test booking alert',
                    cms_booking_alert_text($sample),
                    null,
                    cms_booking_alert_html($sample),
                    [],
                    $sample
                );
                if (!empty($sent['ok'])) {
                    cms_redirect_with_msg(cms_admin_url('settings.php'), 'notify_test_sent');
                }
                $error = (string) ($sent['error'] ?? cms_flash_message('notify_test_failed'));
            }
        } else {
            if (!cms_settings_set('notify_email', $email)) {
                $error = 'Could not save the email address.';
            } else {
                cms_redirect_with_msg(cms_admin_url('settings.php'), 'notify_email_saved');
            }
        }
    }
}

$token = cms_csrf_token();
$mailReady = cms_mail_configured();

$content = '<div class="page-header">';
$content .= '<a class="back-link" href="' . htmlspecialchars(cms_admin_url('dashboard.php')) . '">← Dashboard</a>';
$content .= '<h1>Booking alerts</h1>';
$content .= '<p>When someone submits the public booking form, send a plain email to this address. Change it here anytime.</p>';
$content .= '</div>';

if ($message !== '') {
    $content .= '<div class="notice notice-success" role="status">' . htmlspecialchars($message) . '</div>';
}
if ($error !== '') {
    $content .= '<div class="notice notice-error" role="alert">' . htmlspecialchars($error) . '</div>';
}

if ($mailReady) {
    $content .= '<div class="notice notice-success" role="status">Resend is configured. New bookings will email <strong>'
        . htmlspecialchars($notifyEmail) . '</strong>.</div>';
} else {
    $content .= '<div class="notice notice-error" role="alert">';
    $content .= '<strong>Email sending is not on yet.</strong> Create a free Resend account at '
        . '<a href="https://resend.com" target="_blank" rel="noopener noreferrer">resend.com</a>, '
        . 'copy an API key, and add it to <code>cms/config.php</code> as <code>mail.resend_api_key</code>. '
        . 'Local: same key in <code>cms/config.local.php</code>. The address below is saved even before the key is set.';
    $content .= '</div>';
}

$content .= '<div class="card form-panel">';
$content .= '<form method="post" class="form">';
$content .= '<input type="hidden" name="csrf" value="' . htmlspecialchars($token) . '">';
$content .= '<label>Notification email';
$content .= '<input type="email" name="notify_email" value="' . htmlspecialchars($notifyEmail) . '" required autocomplete="email">';
$content .= '</label>';
$content .= '<p class="help">Internal only. Default is thegamehourr@gmail.com. Reply-To on alerts is the guest email.</p>';
$content .= '<div class="form-actions">';
$content .= '<button type="submit" name="action" value="save" class="btn btn-primary">Save email</button>';
$content .= '<button type="submit" name="action" value="test" class="btn btn-secondary">Send test email</button>';
$content .= '</div></form></div>';

cms_admin_layout('Booking alerts', $content, 'settings');
