<?php
declare(strict_types=1);

/** Admin-editable CMS settings (notify email). Secrets stay in config.php. */

function cms_settings_default_notify_email(): string
{
    return 'thegamehourr@gmail.com';
}

function cms_settings_json_path(): string
{
    $cfg = cms_config();
    if (!empty($cfg['dev']['settings_store'])) {
        $path = (string) $cfg['dev']['settings_store'];
    } else {
        $path = dirname(__DIR__) . '/dev-data/settings.json';
    }
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $path;
}

function cms_settings_migrate(): void
{
    if (cms_dev_json_enabled()) {
        return;
    }
    static $attempted = false;
    if ($attempted) {
        return;
    }
    $attempted = true;
    try {
        cms_db()->exec(
            'CREATE TABLE IF NOT EXISTS cms_settings (
                setting_key VARCHAR(80) NOT NULL PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    } catch (Throwable $e) {
        // Caller falls back to the default notify address.
    }
}

function cms_settings_get(string $key, string $default = ''): string
{
    if (cms_dev_json_enabled()) {
        $path = cms_settings_json_path();
        if (!is_file($path)) {
            return $default;
        }
        $raw = file_get_contents($path);
        $data = json_decode($raw ?: '{}', true);
        if (!is_array($data)) {
            return $default;
        }
        $value = trim((string) ($data[$key] ?? ''));
        return $value !== '' ? $value : $default;
    }

    cms_settings_migrate();
    try {
        $stmt = cms_db()->prepare('SELECT setting_value FROM cms_settings WHERE setting_key = :key');
        $stmt->execute(['key' => $key]);
        $row = $stmt->fetch();
        if (!$row) {
            return $default;
        }
        $value = trim((string) ($row['setting_value'] ?? ''));
        return $value !== '' ? $value : $default;
    } catch (Throwable $e) {
        return $default;
    }
}

function cms_settings_set(string $key, string $value): bool
{
    $value = trim($value);
    if (cms_dev_json_enabled()) {
        $path = cms_settings_json_path();
        $data = [];
        if (is_file($path)) {
            $decoded = json_decode((string) file_get_contents($path), true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }
        $data[$key] = $value;
        return file_put_contents(
            $path,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
        ) !== false;
    }

    cms_settings_migrate();
    try {
        $stmt = cms_db()->prepare(
            'INSERT INTO cms_settings (setting_key, setting_value, updated_at)
             VALUES (:key, :value, UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = UTC_TIMESTAMP()'
        );
        $stmt->execute(['key' => $key, 'value' => $value]);
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

function cms_settings_notify_email(): string
{
    return cms_settings_get('notify_email', cms_settings_default_notify_email());
}
