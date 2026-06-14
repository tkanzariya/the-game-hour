<?php
declare(strict_types=1);

/** Fixed metric labels (not editable in admin). */
function cms_content_metric_labels(): array
{
    return [
        'events-hosted' => 'Events Hosted',
        'participants' => 'Participants Engaged',
        'games-conducted' => 'Games Conducted',
        'cities-served' => 'Cities Served',
    ];
}

/** @return list<string> */
function cms_content_metric_keys(): array
{
    return array_keys(cms_content_metric_labels());
}

/** @return array<string, string> */
function cms_content_default_metrics(): array
{
    return [
        'events-hosted' => '50+',
        'participants' => '3,000+',
        'games-conducted' => '100+',
        'cities-served' => '6',
    ];
}

function cms_content_defaults_json_path(string $filename): string
{
    $cmsData = __DIR__ . '/' . $filename;
    if (is_file($cmsData)) {
        return $cmsData;
    }
    return dirname(__DIR__, 2) . '/src/data/content/' . $filename;
}

/** Split legacy attribution into name + role. */
function cms_content_split_attribution(string $attribution): array
{
    $attribution = trim($attribution);
    if ($attribution === '') {
        return ['name' => '', 'role' => ''];
    }
    $parts = array_map('trim', explode(',', $attribution, 2));
    if (count($parts) === 2) {
        return ['name' => $parts[0], 'role' => $parts[1]];
    }
    return ['name' => $attribution, 'role' => ''];
}

/** @return list<array<string, mixed>> */
function cms_content_seed_testimonials_from_json(): array
{
    $path = cms_content_defaults_json_path('testimonials.json');
    if (!is_file($path)) {
        return [];
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data) || !is_array($data['items'] ?? null)) {
        return [];
    }

    $rows = [];
    $sort = 0;
    foreach ($data['items'] as $item) {
        if (!is_array($item)) {
            continue;
        }
        $sort += 10;
        $split = cms_content_split_attribution((string) ($item['attribution'] ?? ''));
        $context = (string) ($item['context'] ?? 'home');
        $placement = $context === 'service' ? 'service' : 'home';
        $slug = cms_sanitize_key((string) ($item['id'] ?? 'testimonial-' . $sort));
        if ($slug === '') {
            $slug = 'testimonial-' . $sort;
        }
        $rows[] = [
            'slug' => $slug,
            'name' => $split['name'],
            'role' => $split['role'],
            'review' => (string) ($item['quote'] ?? ''),
            'rating' => 5,
            'visible' => 1,
            'sort_order' => $sort,
            'placement' => $placement,
            'service_slug' => $item['serviceSlug'] ?? null,
        ];
    }
    return $rows;
}

/** @return list<array<string, mixed>> */
function cms_content_seed_metrics_from_json(): array
{
    $defaults = cms_content_default_metrics();
    $path = cms_content_defaults_json_path('stats.json');
    if (!is_file($path)) {
        return array_map(
            static fn (string $key, string $value): array => ['metric_key' => $key, 'value' => $value],
            array_keys($defaults),
            array_values($defaults),
        );
    }
    $data = json_decode((string) file_get_contents($path), true);
    $metrics = is_array($data['metrics'] ?? null) ? $data['metrics'] : [];
    $out = [];
    foreach (cms_content_metric_keys() as $key) {
        $value = $defaults[$key];
        foreach ($metrics as $metric) {
            if (is_array($metric) && ($metric['id'] ?? '') === $key) {
                $value = (string) ($metric['value'] ?? $value);
                break;
            }
        }
        $out[] = ['metric_key' => $key, 'value' => $value];
    }
    return $out;
}
