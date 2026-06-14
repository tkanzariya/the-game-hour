<?php

/** Plain-language hints shown above each category section in the photo manager. */
function cms_category_hint(string $category): string
{
    $hints = [
        'Homepage' => 'Main photos on your home page — hero banner and featured cards.',
        'About' => 'Images on the About page.',
        'Gallery' => 'Gallery page hero and event photos.',
        'Branding' => 'Logos and brand assets.',
        'SEO' => 'Social sharing and search preview images.',
        'Birthday Games' => 'Photos for the Birthday Games experience page.',
        'Corporate Games' => 'Photos for corporate team-building events.',
        'Wedding Games' => 'Photos for wedding and haldi celebrations.',
        'School & College' => 'Photos for school and college events.',
        'Social Gatherings' => 'Photos for social gathering experiences.',
        'Game Festival' => 'Photos for game festival events.',
        'Bollywood Theme' => 'Photos for Bollywood-themed games.',
        'Community Events' => 'Photos for traditional and community games.',
    ];

    return $hints[$category] ?? 'Website photos for this section.';
}

/** Short label for upload status badges. */
function cms_photo_status_label(bool $hasFile): string
{
    return $hasFile ? 'Live on website' : 'Using default photo';
}

/**
 * Group library rows by category in display order.
 *
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
        $ia = $order[$a] ?? 999;
        $ib = $order[$b] ?? 999;
        if ($ia === $ib) {
            return strcmp($a, $b);
        }
        return $ia <=> $ib;
    });

    return $groups;
}

/** Count how many slots in a row set already have an uploaded file. */
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

/** Format a date/time for non-technical readers. */
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
