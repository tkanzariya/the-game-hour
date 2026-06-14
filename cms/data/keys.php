<?php

/** Dashboard category cards (display order). */
function cms_dashboard_categories(): array
{
    return [
        ['id' => 'Homepage', 'label' => 'Homepage', 'icon' => '🏠'],
        ['id' => 'About', 'label' => 'About', 'icon' => 'ℹ️'],
        ['id' => 'Gallery', 'label' => 'Gallery', 'icon' => '📸'],
        ['id' => 'Service Activity Cards', 'label' => 'Service Activity Cards', 'icon' => '🎯'],
        ['id' => 'Birthday Games', 'label' => 'Birthday Games', 'icon' => '🎂'],
        ['id' => 'Corporate Games', 'label' => 'Corporate Games', 'icon' => '💼'],
        ['id' => 'Wedding Games', 'label' => 'Wedding / Haldi', 'icon' => '💒'],
        ['id' => 'School & College', 'label' => 'School & College', 'icon' => '🎓'],
        ['id' => 'Social Gatherings', 'label' => 'Social Gathering', 'icon' => '🎉'],
        ['id' => 'Game Festival', 'label' => 'Game Festival', 'icon' => '🎪'],
        ['id' => 'Bollywood Theme', 'label' => 'Bollywood Games', 'icon' => '🎬'],
        ['id' => 'Community Events', 'label' => 'Community Events', 'icon' => '🪔'],
        ['id' => 'Branding', 'label' => 'Branding', 'icon' => '✨'],
        ['id' => 'SEO', 'label' => 'SEO', 'icon' => '🔍'],
    ];
}

/** @return list<string> All filter categories */
function cms_filter_categories(): array
{
    return array_column(cms_dashboard_categories(), 'id');
}

/** @return array<string, array{title: string, category: string, fallback?: string, usage?: string}> */
function cms_all_image_keys(): array
{
    $keys = require __DIR__ . '/keys-base.php';

    $services = [
        'birthday-games' => ['label' => 'Birthday Games', 'category' => 'Birthday Games', 'page' => 'Birthday Games experience page'],
        'corporate-games' => ['label' => 'Corporate Games', 'category' => 'Corporate Games', 'page' => 'Corporate Games experience page'],
        'social-gathering-games' => ['label' => 'Social Gatherings', 'category' => 'Social Gatherings', 'page' => 'Social Gathering experience page'],
        'game-festival' => ['label' => 'Game Festival', 'category' => 'Game Festival', 'page' => 'Game Festival experience page'],
        'school-and-collage-event' => ['label' => 'School & College', 'category' => 'School & College', 'page' => 'School & College experience page'],
        'wedding-or-haldi-games' => ['label' => 'Wedding Games', 'category' => 'Wedding Games', 'page' => 'Wedding / Haldi experience page'],
        'traditional-games' => ['label' => 'Community Events', 'category' => 'Community Events', 'page' => 'Traditional Games experience page'],
        'bollywood-games' => ['label' => 'Bollywood Theme', 'category' => 'Bollywood Theme', 'page' => 'Bollywood Games experience page'],
    ];

    foreach ($services as $slug => $info) {
        $label = $info['label'];
        $cat = $info['category'];
        $page = $info['page'];
        $base = "services/{$slug}";

        $keys["{$slug}-title-card"] = [
            'title' => "{$label} Title Card",
            'category' => $cat,
            'fallback' => "{$base}/title-card.webp",
            'usage' => "{$page} — home event category card & service pages",
        ];
        for ($n = 1; $n <= 3; $n++) {
            $sliderTitle = $n === 1 ? "{$label} Hero Banner" : "{$label} Slider Image {$n}";
            $sliderUsage = $n === 1
                ? "{$page} — hero banner (ServiceDetailHero)"
                : "{$page} — hero slider image {$n}";
            $keys["{$slug}-slider-{$n}"] = [
                'title' => $sliderTitle,
                'category' => $cat,
                'fallback' => "{$base}/slider-{$n}.webp",
                'usage' => $sliderUsage,
            ];
        }
        for ($n = 1; $n <= 4; $n++) {
            $keys["{$slug}-gallery-{$n}"] = [
                'title' => "{$label} Gallery Photo {$n}",
                'category' => $cat,
                'fallback' => "{$base}/gallery-{$n}.webp",
                'usage' => "{$page} — gallery photo {$n}",
            ];
        }
    }

    return $keys;
}

/** @return array{title: string, category: string, fallback?: string, usage?: string} */
function cms_key_meta(string $key): array
{
    static $registry = null;
    if ($registry === null) {
        $registry = cms_all_image_keys();
    }
    return $registry[$key] ?? ['title' => $key, 'category' => 'General', 'fallback' => '', 'usage' => 'Website'];
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

function cms_sync_registry_metadata(): void
{
    $registry = cms_all_image_keys();
    if (cms_dev_json_enabled()) {
        cms_dev_json_sync_registry_metadata($registry);
        return;
    }
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
        $usage = (string) ($meta['usage'] ?? '');

        if ($category !== '' && $rowCategory !== $category) {
            return false;
        }

        if ($search === '') {
            return true;
        }

        $haystack = strtolower($key . ' ' . $label . ' ' . $rowCategory . ' ' . $usage);
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
