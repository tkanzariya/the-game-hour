<?php

/** @return list<string> Filter categories shown in admin library */
function cms_filter_categories(): array
{
    return [
        'Homepage',
        'About',
        'Gallery',
        'Branding',
        'SEO',
        'Birthday Games',
        'Corporate Games',
        'Wedding Games',
        'School & College',
        'Social Gatherings',
        'Game Festival',
        'Bollywood Theme',
        'Community Events',
    ];
}

/** @return array<string, array{title: string, category: string}> */
function cms_all_image_keys(): array
{
    $keys = require __DIR__ . '/keys-base.php';

    $services = [
        'birthday-games' => ['label' => 'Birthday Games', 'category' => 'Birthday Games'],
        'corporate-games' => ['label' => 'Corporate Games', 'category' => 'Corporate Games'],
        'social-gathering-games' => ['label' => 'Social Gatherings', 'category' => 'Social Gatherings'],
        'game-festival' => ['label' => 'Game Festival', 'category' => 'Game Festival'],
        'school-and-collage-event' => ['label' => 'School & College', 'category' => 'School & College'],
        'wedding-or-haldi-games' => ['label' => 'Wedding Games', 'category' => 'Wedding Games'],
        'traditional-games' => ['label' => 'Community Events', 'category' => 'Community Events'],
        'bollywood-games' => ['label' => 'Bollywood Theme', 'category' => 'Bollywood Theme'],
    ];

    foreach ($services as $slug => $info) {
        $label = $info['label'];
        $cat = $info['category'];
        $keys["{$slug}-title-card"] = [
            'title' => "{$label} Title Card",
            'category' => $cat,
        ];
        for ($n = 1; $n <= 3; $n++) {
            $keys["{$slug}-slider-{$n}"] = [
                'title' => "{$label} Gallery Image {$n}",
                'category' => $cat,
            ];
        }
        for ($n = 1; $n <= 4; $n++) {
            $keys["{$slug}-gallery-{$n}"] = [
                'title' => "{$label} Gallery Photo {$n}",
                'category' => $cat,
            ];
        }
    }

    return $keys;
}

/** @return array{title: string, category: string} */
function cms_key_meta(string $key): array
{
    static $registry = null;
    if ($registry === null) {
        $registry = cms_all_image_keys();
    }
    return $registry[$key] ?? ['title' => $key, 'category' => 'General'];
}

function cms_display_label(string $key, ?array $row = null): string
{
    $meta = cms_key_meta($key);
    if ($meta['title'] !== $key) {
        return $meta['title'];
    }
    if ($row && !empty($row['title'])) {
        return $row['title'];
    }
    return $key;
}

/** Sync friendly labels and categories from registry into the database. */
function cms_sync_registry_metadata(): void
{
    $registry = cms_all_image_keys();
    $stmt = cms_db()->prepare(
        'UPDATE images SET title = :title, category = :category WHERE image_key = :key',
    );
    foreach ($registry as $key => $meta) {
        $stmt->execute([
            'title' => $meta['title'],
            'category' => $meta['category'],
            'key' => $key,
        ]);
    }
}

/**
 * @param list<array<string, mixed>> $rows
 * @return list<array<string, mixed>>
 */
function cms_filter_library_rows(array $rows, string $category, string $search): array
{
    $search = strtolower(trim($search));

    return array_values(array_filter($rows, static function (array $row) use ($category, $search): bool {
        $key = (string) ($row['image_key'] ?? '');
        $meta = cms_key_meta($key);
        $label = cms_display_label($key, $row);
        $rowCategory = (string) ($row['category'] ?? $meta['category']);

        if ($category !== '' && $rowCategory !== $category) {
            return false;
        }

        if ($search === '') {
            return true;
        }

        $haystack = strtolower($key . ' ' . $label . ' ' . $rowCategory);
        return str_contains($haystack, $search);
    }));
}

function cms_library_query_string(string $category, string $search, string $msg = ''): string
{
    $params = [];
    if ($category !== '') {
        $params['category'] = $category;
    }
    if ($search !== '') {
        $params['q'] = $search;
    }
    if ($msg !== '') {
        $params['msg'] = $msg;
    }
    return $params === [] ? '' : '?' . http_build_query($params);
}
