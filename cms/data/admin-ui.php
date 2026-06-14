<?php

/** Plain-language hints for category pages. */
function cms_category_hint(string $category): string
{
    $hints = [
        'Homepage' => 'Home page hero + "A glimpse of the energy" gallery teaser (4 photos). Event cards are under each experience type.',
        'About' => 'About page hero, story section, pillar photos, and gallery spotlight (5 images).',
        'Gallery' => 'Gallery page hero and event photos.',
        'Service Activity Cards' => 'Shared activity cards shown on Birthday, Corporate, Wedding, and other service pages.',
        'Birthday Games' => 'Birthday party experience page.',
        'Corporate Games' => 'Corporate team-building experience page.',
        'Wedding Games' => 'Wedding and haldi celebration page.',
        'School & College' => 'School and college events page.',
        'Social Gatherings' => 'Social gathering experiences page.',
        'Game Festival' => 'Game festival experience page.',
        'Bollywood Theme' => 'Bollywood-themed games page.',
        'Community Events' => 'Traditional and community games page.',
        'Branding' => 'Logos and brand assets.',
        'SEO' => 'Social sharing and search preview images.',
    ];
    return $hints[$category] ?? 'Website photos for this section.';
}

function cms_friendly_date(?string $datetime): string
{
    if ($datetime === null || $datetime === '') {
        return 'Not updated yet';
    }
    $ts = strtotime($datetime);
    if ($ts === false) {
        return 'Not updated yet';
    }
    return date('j M Y, g:i A', $ts);
}

function cms_count_uploaded(array $rows): int
{
    $count = 0;
    foreach ($rows as $row) {
        if (!empty($row['file_path'])) {
            $count++;
        }
    }
    return $count;
}

/**
 * @param list<array<string, mixed>> $rows
 * @return array<string, list<array<string, mixed>>>
 */
function cms_group_rows_by_category(array $rows): array
{
    $order = array_flip(cms_filter_categories());
    $groups = [];
    foreach ($rows as $row) {
        $key = (string) ($row['image_key'] ?? '');
        $category = (string) ($row['category'] ?? cms_key_meta($key)['category']);
        $groups[$category][] = $row;
    }
    uksort($groups, static function (string $a, string $b) use ($order): int {
        return ($order[$a] ?? 999) <=> ($order[$b] ?? 999);
    });
    return $groups;
}

/**
 * Build stats for a category from registry + DB rows.
 *
 * @param array<string, array<string, mixed>> $rowsByKey
 * @return array{total: int, uploaded: int, preview_key: ?string}
 */
function cms_category_stats(string $category, array $rowsByKey): array
{
    $registry = cms_all_image_keys();
    $total = 0;
    $uploaded = 0;
    $previewKey = null;

    foreach ($registry as $key => $meta) {
        if (($meta['category'] ?? '') !== $category) {
            continue;
        }
        $total++;
        $row = $rowsByKey[$key] ?? null;
        if ($row && !empty($row['file_path'])) {
            $uploaded++;
            if ($previewKey === null) {
                $previewKey = $key;
            }
        } elseif ($previewKey === null) {
            $previewKey = $key;
        }
    }

    return ['total' => $total, 'uploaded' => $uploaded, 'preview_key' => $previewKey];
}

/** Whether the slot uses a custom upload vs bundled default. */
function cms_has_custom_upload(?array $row): bool
{
    return $row !== null && !empty($row['file_path']);
}

/** Admin preview URL for any slot (upload or bundled default). */
function cms_admin_preview_url(string $key): string
{
    return cms_admin_url('preview.php?key=' . urlencode($key));
}

/** Upload page URL preserving return context. */
function cms_upload_url(string $key, string $returnCategory = '', string $returnSearch = ''): string
{
    $url = cms_admin_url('upload.php?key=' . urlencode($key));
    $qs = cms_library_query_string($returnCategory, $returnSearch);
    if ($qs !== '') {
        $url .= '&' . ltrim($qs, '?');
    }
    return $url;
}

/** Category page URL. */
function cms_category_url(string $category): string
{
    return cms_admin_url('category.php?cat=' . urlencode($category));
}

/**
 * Render a photo card HTML fragment.
 *
 * @param array<string, mixed> $row
 */
function cms_render_photo_card(array $row, string $returnCategory = '', string $returnSearch = ''): string
{
    $key = (string) $row['image_key'];
    $label = cms_display_label($key, $row);
    $meta = cms_key_meta($key);
    $custom = cms_has_custom_upload($row);
    $previewUrl = cms_admin_preview_url($key);
    $uploadUrl = cms_upload_url($key, $returnCategory, $returnSearch);
    $usage = htmlspecialchars((string) ($meta['usage'] ?? 'Website'));
    $date = htmlspecialchars(cms_friendly_date($row['updated_at'] ?? null));

    $statusClass = $custom ? 'badge-live' : 'badge-default';
    $statusLabel = $custom ? 'Your upload' : 'Using website default';

    $html = '<article class="photo-card">';
    $html .= '<div class="photo-card-media">';
    $html .= '<img src="' . htmlspecialchars($previewUrl) . '" alt="' . htmlspecialchars($label) . '" loading="lazy">';
    $html .= '<span class="photo-card-badge ' . $statusClass . '">' . $statusLabel . '</span>';
    $html .= '</div>';
    $html .= '<div class="photo-card-body">';
    $html .= '<h3 class="photo-card-title">' . htmlspecialchars($label) . '</h3>';
    $html .= '<p class="photo-card-usage">' . $usage . '</p>';
    $html .= '<p class="photo-card-date">' . $date . '</p>';
    $html .= '<div class="photo-card-actions">';
    $html .= '<a class="btn btn-primary" href="' . htmlspecialchars($uploadUrl) . '">' . ($custom ? 'Replace' : 'Upload') . '</a>';
    $html .= '<a class="btn btn-secondary" href="' . htmlspecialchars($previewUrl) . '" target="_blank" rel="noopener">View full size</a>';
    if ($custom) {
        $html .= '<form method="post" action="' . htmlspecialchars(cms_admin_url('delete.php')) . '" class="inline" data-confirm-delete data-photo-label="' . htmlspecialchars($label) . '">';
        $html .= '<input type="hidden" name="csrf" value="' . htmlspecialchars(cms_csrf_token()) . '">';
        $html .= '<input type="hidden" name="image_key" value="' . htmlspecialchars($key) . '">';
        $html .= '<input type="hidden" name="category" value="' . htmlspecialchars($returnCategory) . '">';
        $html .= '<input type="hidden" name="q" value="' . htmlspecialchars($returnSearch) . '">';
        $html .= '<input type="hidden" name="return" value="' . htmlspecialchars($returnCategory !== '' ? 'category' : 'photos') . '">';
        $html .= '<button type="submit" class="btn btn-danger">Remove</button></form>';
    }
    $html .= '</div></div></article>';

    return $html;
}

/** Sync keys on admin bootstrap. */
function cms_admin_bootstrap(): void
{
    cms_register_missing_keys(cms_all_image_keys());
    cms_sync_registry_metadata();
}

/** Index rows by image_key. */
function cms_index_rows_by_key(array $rows): array
{
    $indexed = [];
    foreach ($rows as $row) {
        $indexed[(string) $row['image_key']] = $row;
    }
    return $indexed;
}

/** Merge registry keys with DB rows for a category. */
function cms_category_rows(string $category, array $rowsByKey): array
{
    $out = [];
    foreach (cms_all_image_keys() as $key => $meta) {
        if (($meta['category'] ?? '') !== $category) {
            continue;
        }
        $out[] = $rowsByKey[$key] ?? [
            'image_key' => $key,
            'title' => $meta['title'],
            'category' => $meta['category'],
            'file_path' => null,
            'updated_at' => null,
        ];
    }
    return $out;
}
