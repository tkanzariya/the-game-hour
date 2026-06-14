<?php
declare(strict_types=1);

/** JSON file storage for Phase 1 content (local dev, no MySQL). */

function cms_dev_content_enabled(): bool
{
    $c = cms_config();
    return !empty($c['dev']['content_store']);
}

function cms_dev_content_path(): string
{
    $path = cms_config()['dev']['content_store'];
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!is_file($path)) {
        file_put_contents($path, json_encode([
            'testimonials' => [],
            'metrics' => cms_content_default_metrics(),
        ], JSON_PRETTY_PRINT));
    }
    return $path;
}

/** @return array{testimonials: list<array<string, mixed>>, metrics: array<string, string>} */
function cms_dev_content_load(): array
{
    $raw = file_get_contents(cms_dev_content_path());
    $data = json_decode($raw ?: '{}', true);
    if (!is_array($data)) {
        $data = [];
    }
    return [
        'testimonials' => is_array($data['testimonials'] ?? null) ? $data['testimonials'] : [],
        'metrics' => is_array($data['metrics'] ?? null)
            ? $data['metrics']
            : cms_content_default_metrics(),
    ];
}

/** @param array{testimonials: list<array<string, mixed>>, metrics: array<string, string>} $data */
function cms_dev_content_save(array $data): void
{
    file_put_contents(
        cms_dev_content_path(),
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
    );
}

function cms_dev_content_get_all_testimonials(bool $includeHidden): array
{
    $rows = cms_dev_content_load()['testimonials'];
    if (!$includeHidden) {
        $rows = array_values(array_filter(
            $rows,
            static fn (array $row): bool => !empty($row['visible']),
        ));
    }
    usort($rows, static function (array $a, array $b): int {
        $sort = ((int) ($a['sort_order'] ?? 0)) <=> ((int) ($b['sort_order'] ?? 0));
        if ($sort !== 0) {
            return $sort;
        }
        return ((int) ($b['id'] ?? 0)) <=> ((int) ($a['id'] ?? 0));
    });
    return $rows;
}

function cms_dev_content_get_testimonial(int $id): ?array
{
    foreach (cms_dev_content_load()['testimonials'] as $row) {
        if ((int) ($row['id'] ?? 0) === $id) {
            return $row;
        }
    }
    return null;
}

function cms_dev_content_count_testimonials(): int
{
    return count(cms_dev_content_load()['testimonials']);
}

/** @param array<string, mixed> $input */
function cms_dev_content_save_testimonial(array $input): array
{
    $data = cms_dev_content_load();
    $now = gmdate('Y-m-d H:i:s');
    $id = (int) ($input['id'] ?? 0);

    if ($id > 0) {
        $found = false;
        foreach ($data['testimonials'] as &$row) {
            if ((int) ($row['id'] ?? 0) === $id) {
                $row = array_merge($row, $input, ['id' => $id, 'updated_at' => $now]);
                $found = true;
                break;
            }
        }
        unset($row);
        if (!$found) {
            return ['ok' => false, 'error' => 'Testimonial not found.', 'code' => 'not_found'];
        }
    } else {
        $maxId = 0;
        foreach ($data['testimonials'] as $row) {
            $maxId = max($maxId, (int) ($row['id'] ?? 0));
        }
        $id = $maxId + 1;
        $input['id'] = $id;
        $input['created_at'] = $now;
        $input['updated_at'] = $now;
        $data['testimonials'][] = $input;
    }

    cms_dev_content_save($data);
    return ['ok' => true, 'id' => $id];
}

function cms_dev_content_delete_testimonial(int $id): bool
{
    $data = cms_dev_content_load();
    $before = count($data['testimonials']);
    $data['testimonials'] = array_values(array_filter(
        $data['testimonials'],
        static fn (array $row): bool => (int) ($row['id'] ?? 0) !== $id,
    ));
    if (count($data['testimonials']) === $before) {
        return false;
    }
    cms_dev_content_save($data);
    return true;
}

/** @return array<string, string> */
function cms_dev_content_get_metrics(): array
{
    $data = cms_dev_content_load();
    return array_merge(cms_content_default_metrics(), $data['metrics'] ?? []);
}

/** @param array<string, string> $values */
function cms_dev_content_save_metrics(array $values): void
{
    $data = cms_dev_content_load();
    foreach (cms_content_metric_keys() as $key) {
        if (isset($values[$key])) {
            $data['metrics'][$key] = $values[$key];
        }
    }
    cms_dev_content_save($data);
}

/** @param list<array<string, mixed>> $rows */
function cms_dev_content_seed_testimonials(array $rows): void
{
    $data = cms_dev_content_load();
    $data['testimonials'] = $rows;
    cms_dev_content_save($data);
}
