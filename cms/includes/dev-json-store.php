<?php
declare(strict_types=1);

/** JSON file storage for local CMS development (no MySQL required). */

function cms_dev_json_enabled(): bool
{
    $c = cms_config();
    return !empty($c['dev']['json_store']);
}

function cms_dev_json_path(): string
{
    $path = cms_config()['dev']['json_store'];
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!is_file($path)) {
        file_put_contents($path, json_encode(['images' => []], JSON_PRETTY_PRINT));
    }
    return $path;
}

/** @return array{images: list<array<string, mixed>>} */
function cms_dev_json_load(): array
{
    $raw = file_get_contents(cms_dev_json_path());
    $data = json_decode($raw ?: '{}', true);
    if (!is_array($data) || !isset($data['images']) || !is_array($data['images'])) {
        return ['images' => []];
    }
    return $data;
}

/** @param array{images: list<array<string, mixed>>} $data */
function cms_dev_json_save(array $data): void
{
    file_put_contents(
        cms_dev_json_path(),
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
    );
}

function cms_dev_json_get_all_images(?string $category = null): array
{
    $rows = cms_dev_json_load()['images'];
    if ($category) {
        $rows = array_values(array_filter(
            $rows,
            static fn (array $row): bool => ($row['category'] ?? '') === $category,
        ));
    }
    usort($rows, static function (array $a, array $b): int {
        $c = strcmp((string) ($a['category'] ?? ''), (string) ($b['category'] ?? ''));
        return $c !== 0 ? $c : strcmp((string) ($a['title'] ?? ''), (string) ($b['title'] ?? ''));
    });
    return $rows;
}

function cms_dev_json_get_image_by_key(string $key): ?array
{
    foreach (cms_dev_json_load()['images'] as $row) {
        if (($row['image_key'] ?? '') === $key) {
            return $row;
        }
    }
    return null;
}

function cms_dev_json_save_upload(string $imageKey, array $file, ?string $title, ?string $category): array
{
    $validation = cms_validate_image_upload($file);
    if (!$validation['ok']) {
        return $validation;
    }

    $existing = cms_dev_json_get_image_by_key($imageKey);
    $ext = $validation['ext'];
    $relativePath = $imageKey . '.' . $ext;
    $dest = cms_uploads_dir() . DIRECTORY_SEPARATOR . $relativePath;

    if ($existing && !empty($existing['file_path']) && $existing['file_path'] !== $relativePath) {
        $old = cms_uploads_dir() . DIRECTORY_SEPARATOR . $existing['file_path'];
        if (is_file($old)) {
            @unlink($old);
        }
    }

    if (is_uploaded_file($file['tmp_name'])) {
        $saved = move_uploaded_file($file['tmp_name'], $dest);
    } else {
        $saved = copy($file['tmp_name'], $dest);
    }
    if (!$saved) {
        return ['ok' => false, 'error' => 'Could not save file on server.', 'code' => 'upload_failed'];
    }

    $data = cms_dev_json_load();
    $now = gmdate('Y-m-d H:i:s');
    $found = false;
    foreach ($data['images'] as &$row) {
        if (($row['image_key'] ?? '') === $imageKey) {
            $row['title'] = $title ?: ($existing['title'] ?? $imageKey);
            $row['category'] = $category ?: ($existing['category'] ?? 'General');
            $row['file_path'] = $relativePath;
            $row['updated_at'] = $now;
            $found = true;
            break;
        }
    }
    unset($row);
    if (!$found) {
        $data['images'][] = [
            'image_key' => $imageKey,
            'title' => $title ?: $imageKey,
            'category' => $category ?: 'General',
            'file_path' => $relativePath,
            'updated_at' => $now,
        ];
    }
    cms_dev_json_save($data);
    $row = cms_dev_json_get_image_by_key($imageKey);
    return ['ok' => true, 'image' => cms_image_public_payload($row)];
}

function cms_dev_json_delete_image(string $imageKey): array
{
    $data = cms_dev_json_load();
    $found = false;
    foreach ($data['images'] as &$row) {
        if (($row['image_key'] ?? '') === $imageKey) {
            if (!empty($row['file_path'])) {
                $path = cms_uploads_dir() . DIRECTORY_SEPARATOR . $row['file_path'];
                if (is_file($path)) {
                    @unlink($path);
                }
            }
            $row['file_path'] = null;
            $row['updated_at'] = gmdate('Y-m-d H:i:s');
            $found = true;
            break;
        }
    }
    unset($row);
    if (!$found) {
        return ['ok' => false, 'error' => 'Image not found.', 'code' => 'not_found'];
    }
    cms_dev_json_save($data);
    return ['ok' => true];
}

function cms_dev_json_register_missing_keys(array $keys): int
{
    $data = cms_dev_json_load();
    $existing = [];
    foreach ($data['images'] as $row) {
        $existing[(string) ($row['image_key'] ?? '')] = true;
    }
    $inserted = 0;
    foreach ($keys as $key => $meta) {
        $key = cms_sanitize_key($key);
        if ($key === '' || isset($existing[$key])) {
            continue;
        }
        $data['images'][] = [
            'image_key' => $key,
            'title' => $meta['title'] ?? $key,
            'category' => $meta['category'] ?? 'General',
            'file_path' => null,
            'updated_at' => null,
        ];
        $inserted++;
    }
    if ($inserted > 0) {
        cms_dev_json_save($data);
    }
    return $inserted;
}

function cms_dev_json_sync_registry_metadata(array $registry): void
{
    $data = cms_dev_json_load();
    $changed = false;
    foreach ($data['images'] as &$row) {
        $key = (string) ($row['image_key'] ?? '');
        if (!isset($registry[$key])) {
            continue;
        }
        $meta = $registry[$key];
        $row['title'] = $meta['title'];
        $row['category'] = $meta['category'];
        $changed = true;
    }
    unset($row);
    if ($changed) {
        cms_dev_json_save($data);
    }
}
