<?php
/**
 * Image key registry (mirrors src/data/image-keys.ts).
 * `fallback` = path under cms/static/images/ for bundled preview thumbnails.
 */
$keys = [
    'homepage-hero' => [
        'title' => cms_section_label('Hero', 1),
        'category' => 'Homepage',
        'fallback' => 'homepage/hero.webp',
        'usage' => 'Home page (/) — hero banner',
    ],
    'homepage-about-teaser' => [
        'title' => cms_section_label('Games & activities included', 1),
        'category' => 'Service Activity Cards',
        'fallback' => 'homepage/about-teaser.webp',
        'usage' => 'All service pages — Icebreakers activity card',
    ],
    'about-hero' => [
        'title' => cms_section_label('Hero', 1),
        'category' => 'About',
        'fallback' => 'gallery/moments/moment-3.webp',
        'usage' => 'About page (/about) — hero banner',
    ],
    'about-story' => [
        'title' => cms_section_label('Our story', 1),
        'category' => 'About',
        'fallback' => 'homepage/about-teaser.webp',
        'usage' => 'About page — story section and hero accent',
    ],
    'about-pillar-connection' => [
        'title' => cms_section_label('Why we believe in play', 1),
        'category' => 'About',
        'fallback' => 'gallery/moments/moment-1.webp',
        'usage' => 'About page — Connection pillar card',
    ],
    'about-pillar-screen-free' => [
        'title' => cms_section_label('Why we believe in play', 2),
        'category' => 'About',
        'fallback' => 'gallery/moments/moment-2.webp',
        'usage' => 'About page — Screen-free pillar card',
    ],
    'about-gallery-spotlight' => [
        'title' => cms_section_label('See the joy in action', 1),
        'category' => 'About',
        'fallback' => 'gallery/event-gallery-2.webp',
        'usage' => 'About page — gallery invite spotlight',
    ],
    'homepage-team-building' => [
        'title' => cms_section_label('Games & activities included', 3),
        'category' => 'Service Activity Cards',
        'fallback' => 'homepage/team-building.webp',
        'usage' => 'All service pages — Team Building activity card',
    ],
    'homepage-strategy-games' => [
        'title' => cms_section_label('Games & activities included', 2),
        'category' => 'Service Activity Cards',
        'fallback' => 'homepage/strategy-games.webp',
        'usage' => 'All service pages — Strategy Games activity card',
    ],
    'gallery-hero' => [
        'title' => cms_section_label('Hero', 1),
        'category' => 'Gallery',
        'fallback' => 'gallery/gallery-hero.webp',
        'usage' => 'Gallery page (/gallery) — hero banner',
    ],
    'branding-logo-light' => [
        'title' => cms_section_label('Site logo', 1),
        'category' => 'Branding',
        'fallback' => 'branding/logo-light.webp',
        'usage' => 'Header and footer — light background',
    ],
    'branding-logo-dark' => [
        'title' => cms_section_label('Site logo', 2),
        'category' => 'Branding',
        'fallback' => 'branding/logo-dark.webp',
        'usage' => 'Header and footer — dark background',
    ],
    'seo-og-default' => [
        'title' => cms_section_label('Social share preview', 1),
        'category' => 'SEO',
        'fallback' => 'seo/og-default.webp',
        'usage' => 'Default Open Graph / link preview image',
    ],
    'seo-social-preview' => [
        'title' => cms_section_label('Social share preview', 2),
        'category' => 'SEO',
        'fallback' => 'seo/social-preview.webp',
        'usage' => 'Dedicated social preview image',
    ],
];

for ($n = 1; $n <= 4; $n++) {
    $keys["homepage-moment-{$n}"] = [
        'title' => cms_section_label('A glimpse of the energy', $n),
        'category' => 'Homepage',
        'fallback' => "gallery/moments/moment-{$n}.webp",
        'usage' => "Home page (/) — gallery teaser photo {$n}",
    ];
}

$galleryFeaturedFallbacks = [
    1 => 'gallery/moments/moment-1.webp',
    2 => 'gallery/event-gallery-2.webp',
    3 => 'gallery/moments/moment-3.webp',
    4 => 'gallery/event-gallery-5.webp',
];

for ($n = 1; $n <= 4; $n++) {
    $keys["gallery-featured-{$n}"] = [
        'title' => cms_section_label('Featured moments', $n),
        'category' => 'Gallery',
        'fallback' => $galleryFeaturedFallbacks[$n],
        'usage' => 'Gallery page — Featured moments section',
    ];
}

$galleryEventFallbacks = [];
for ($n = 1; $n <= 9; $n++) {
    $galleryEventFallbacks[] = "gallery/event-gallery-{$n}.webp";
}
foreach ([4, 5, 6] as $n) {
    $galleryEventFallbacks[] = "gallery/moments/moment-{$n}.webp";
}

for ($n = 1; $n <= 12; $n++) {
    $keys["gallery-event-moment-{$n}"] = [
        'title' => cms_section_label('Event moments', $n),
        'category' => 'Gallery',
        'fallback' => $galleryEventFallbacks[$n - 1],
        'usage' => 'Gallery page — Event moments grid (Browse by experience)',
    ];
}

$galleryStoryFallbacks = [
    1 => 'gallery/event-gallery-2.webp',
    2 => 'gallery/event-gallery-4.webp',
    3 => 'gallery/event-gallery-6.webp',
];

for ($n = 1; $n <= 3; $n++) {
    $keys["gallery-story-{$n}"] = [
        'title' => cms_section_label('Stories behind the photos', $n),
        'category' => 'Gallery',
        'fallback' => $galleryStoryFallbacks[$n],
        'usage' => 'Gallery page — Stories section',
    ];
}

return $keys;
