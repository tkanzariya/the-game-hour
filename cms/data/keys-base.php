<?php
/**
 * Image key registry (mirrors src/data/image-keys.ts).
 * `fallback` = path under cms/static/images/ for bundled preview thumbnails.
 */
$keys = [
    'homepage-hero' => [
        'title' => 'Homepage Hero Banner',
        'category' => 'Homepage',
        'fallback' => 'homepage/hero.webp',
        'usage' => 'Home page (/) — main hero · About page (/about) — hero (same image)',
    ],
    'homepage-about-teaser' => [
        'title' => 'Icebreakers Activity Card',
        'category' => 'Service Activity Cards',
        'fallback' => 'homepage/about-teaser.webp',
        'usage' => 'All service pages — Icebreakers activity card image',
    ],
    'about-hero' => [
        'title' => 'About Page Hero',
        'category' => 'About',
        'fallback' => 'homepage/hero.webp',
        'usage' => 'About page (/about) — main hero banner',
    ],
    'about-story' => [
        'title' => 'Our Story Section',
        'category' => 'About',
        'fallback' => 'homepage/about-teaser.webp',
        'usage' => 'About page — story section image and hero accent overlay',
    ],
    'about-pillar-connection' => [
        'title' => 'Connection Pillar Photo',
        'category' => 'About',
        'fallback' => 'gallery/moments/moment-1.webp',
        'usage' => 'About page — "Why we believe in play" — Connection card',
    ],
    'about-pillar-screen-free' => [
        'title' => 'Screen-free Pillar Photo',
        'category' => 'About',
        'fallback' => 'gallery/moments/moment-2.webp',
        'usage' => 'About page — "Why we believe in play" — Screen-free card',
    ],
    'about-gallery-spotlight' => [
        'title' => 'Gallery Invite Spotlight',
        'category' => 'About',
        'fallback' => 'gallery/event-gallery-2.webp',
        'usage' => 'About page — "See the joy in action" section',
    ],
    'homepage-team-building' => [
        'title' => 'Team Building Activity Card',
        'category' => 'Service Activity Cards',
        'fallback' => 'homepage/team-building.webp',
        'usage' => 'All service pages — Team Building activity card (not on home page)',
    ],
    'homepage-strategy-games' => [
        'title' => 'Strategy Games Activity Card',
        'category' => 'Service Activity Cards',
        'fallback' => 'homepage/strategy-games.webp',
        'usage' => 'All service pages — Strategy Games activity card (not on home page)',
    ],
    'gallery-hero' => [
        'title' => 'Gallery Page Hero Banner',
        'category' => 'Gallery',
        'fallback' => 'gallery/gallery-hero.webp',
        'usage' => 'Gallery page (/gallery) — hero banner',
    ],
    'gallery-1' => ['title' => 'Gallery Event Photo 1', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-1.webp', 'usage' => 'Gallery page — event photo grid slot 1'],
    'gallery-2' => ['title' => 'Gallery Event Photo 2', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-2.webp', 'usage' => 'Gallery page — event photo grid slot 2'],
    'gallery-3' => ['title' => 'Gallery Event Photo 3', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-3.webp', 'usage' => 'Gallery page — event photo grid slot 3'],
    'gallery-4' => ['title' => 'Gallery Event Photo 4', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-4.webp', 'usage' => 'Gallery page — event photo grid slot 4'],
    'gallery-5' => ['title' => 'Gallery Event Photo 5', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-5.webp', 'usage' => 'Gallery page — event photo grid slot 5'],
    'gallery-6' => ['title' => 'Gallery Event Photo 6', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-6.webp', 'usage' => 'Gallery page — event photo grid slot 6'],
    'gallery-7' => ['title' => 'Gallery Event Photo 7', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-7.webp', 'usage' => 'Gallery page — event photo grid slot 7'],
    'gallery-8' => ['title' => 'Gallery Event Photo 8', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-8.webp', 'usage' => 'Gallery page — event photo grid slot 8'],
    'gallery-9' => ['title' => 'Gallery Event Photo 9', 'category' => 'Gallery', 'fallback' => 'gallery/event-gallery-9.webp', 'usage' => 'Gallery page — event photo grid slot 9'],
    'gallery-moment-1' => ['title' => 'Gallery Featured Moment 1', 'category' => 'Gallery', 'fallback' => 'gallery/moments/moment-1.webp', 'usage' => 'Gallery page — featured moments · About page believe section'],
    'gallery-moment-2' => ['title' => 'Gallery Featured Moment 2', 'category' => 'Gallery', 'fallback' => 'gallery/moments/moment-2.webp', 'usage' => 'Gallery page — featured moments · About page believe section'],
    'gallery-moment-3' => ['title' => 'Gallery Featured Moment 3', 'category' => 'Gallery', 'fallback' => 'gallery/moments/moment-3.webp', 'usage' => 'Gallery page — featured moments · About page believe section'],
    'gallery-moment-4' => ['title' => 'Gallery Featured Moment 4', 'category' => 'Gallery', 'fallback' => 'gallery/moments/moment-4.webp', 'usage' => 'Gallery page — featured moments · About page believe section'],
    'gallery-moment-5' => ['title' => 'Gallery Featured Moment 5', 'category' => 'Gallery', 'fallback' => 'gallery/moments/moment-5.webp', 'usage' => 'Gallery page — featured moments'],
    'gallery-moment-6' => ['title' => 'Gallery Featured Moment 6', 'category' => 'Gallery', 'fallback' => 'gallery/moments/moment-6.webp', 'usage' => 'Gallery page — featured moments'],
    'branding-logo-light' => [
        'title' => 'Logo (light background)',
        'category' => 'Branding',
        'fallback' => 'branding/logo-light.webp',
        'usage' => 'Site header & footer — logo on light backgrounds',
    ],
    'branding-logo-dark' => [
        'title' => 'Logo (dark background)',
        'category' => 'Branding',
        'fallback' => 'branding/logo-dark.webp',
        'usage' => 'Site header & footer — logo on dark backgrounds',
    ],
    'seo-og-default' => [
        'title' => 'Default Social Share Image',
        'category' => 'SEO',
        'fallback' => 'seo/og-default.webp',
        'usage' => 'Open Graph / link preview when no page-specific image is set',
    ],
    'seo-social-preview' => [
        'title' => 'Social Preview Image',
        'category' => 'SEO',
        'fallback' => 'seo/social-preview.webp',
        'usage' => 'Dedicated social preview OG image',
    ],
];

for ($n = 1; $n <= 4; $n++) {
    $keys["homepage-moment-{$n}"] = [
        'title' => "Homepage Gallery Teaser {$n}",
        'category' => 'Homepage',
        'fallback' => "gallery/moments/moment-{$n}.webp",
        'usage' => "Home page (/) — \"A glimpse of the energy\" section — photo {$n}",
    ];
}

return $keys;
