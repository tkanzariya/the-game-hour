# Image Mapping Audit

Generated: 2026-06-14T18:48:16.451Z

## Summary

| Metric | Count |
|--------|------:|
| CMS / registry keys | 88 |
| Duplicate fallback paths | 0 |
| Asset-map paths missing registry | 0 |

## Resolution chain

1. React components call `getAssetUrl(ASSET_MAP…)` with a bundled path (e.g. `homepage/hero.webp`).
2. `getImageUrlForAssetPath()` maps path → CMS key(s) via `FALLBACK_PATH_TO_IMAGE_KEYS`.
3. CMS manifest from `/cms/api/images.php` supplies uploaded URL when `file_path` is set.
4. Otherwise bundled Vite asset is used.

## Full mapping matrix

| CMS Label | CMS Key | Asset Path | Frontend Component | Website Location |
|-----------|---------|------------|-------------------|------------------|
| About Section Image | `homepage-about-teaser` | `homepage/about-teaser.webp` | AboutHero, AboutStory, service-activities | About page story/accent · activity cards |
| Birthday Games Gallery Photo 1 | `birthday-games-gallery-1` | `services/birthday-games/gallery-1.webp` | gallery.ts service grids | Birthday Games page gallery grid |
| Birthday Games Gallery Photo 2 | `birthday-games-gallery-2` | `services/birthday-games/gallery-2.webp` | gallery.ts service grids | Birthday Games page gallery grid |
| Birthday Games Gallery Photo 3 | `birthday-games-gallery-3` | `services/birthday-games/gallery-3.webp` | gallery.ts service grids | Birthday Games page gallery grid |
| Birthday Games Gallery Photo 4 | `birthday-games-gallery-4` | `services/birthday-games/gallery-4.webp` | gallery.ts service grids | Birthday Games page gallery grid |
| Birthday Games Hero Banner | `birthday-games-slider-1` | `services/birthday-games/slider-1.webp` | ServiceDetailHero | Birthday Games page hero |
| Birthday Games Gallery Image 2 | `birthday-games-slider-2` | `services/birthday-games/slider-2.webp` | Service gallery sections | Birthday Games page slider 2 |
| Birthday Games Gallery Image 3 | `birthday-games-slider-3` | `services/birthday-games/slider-3.webp` | Service gallery sections | Birthday Games page slider 3 |
| Birthday Games Title Card | `birthday-games-title-card` | `services/birthday-games/title-card.webp` | HomeEventCategories, service pages | Birthday Games card on home · service detail pages |
| Bollywood Theme Gallery Photo 1 | `bollywood-games-gallery-1` | `services/bollywood-games/gallery-1.webp` | gallery.ts service grids | Bollywood Theme page gallery grid |
| Bollywood Theme Gallery Photo 2 | `bollywood-games-gallery-2` | `services/bollywood-games/gallery-2.webp` | gallery.ts service grids | Bollywood Theme page gallery grid |
| Bollywood Theme Gallery Photo 3 | `bollywood-games-gallery-3` | `services/bollywood-games/gallery-3.webp` | gallery.ts service grids | Bollywood Theme page gallery grid |
| Bollywood Theme Gallery Photo 4 | `bollywood-games-gallery-4` | `services/bollywood-games/gallery-4.webp` | gallery.ts service grids | Bollywood Theme page gallery grid |
| Bollywood Theme Hero Banner | `bollywood-games-slider-1` | `services/bollywood-games/slider-1.webp` | ServiceDetailHero | Bollywood Theme page hero |
| Bollywood Theme Gallery Image 2 | `bollywood-games-slider-2` | `services/bollywood-games/slider-2.webp` | Service gallery sections | Bollywood Theme page slider 2 |
| Bollywood Theme Gallery Image 3 | `bollywood-games-slider-3` | `services/bollywood-games/slider-3.webp` | Service gallery sections | Bollywood Theme page slider 3 |
| Bollywood Theme Title Card | `bollywood-games-title-card` | `services/bollywood-games/title-card.webp` | HomeEventCategories, service pages | Bollywood Theme card on home · service detail pages |
| Logo (dark background) | `branding-logo-dark` | `branding/logo-dark.webp` | getLogoUrl | Site header/footer logo (dark) |
| Logo (light background) | `branding-logo-light` | `branding/logo-light.webp` | getLogoUrl | Site header/footer logo (light) |
| Community Events Gallery Photo 1 | `traditional-games-gallery-1` | `services/traditional-games/gallery-1.webp` | gallery.ts service grids | Community Events page gallery grid |
| Community Events Gallery Photo 2 | `traditional-games-gallery-2` | `services/traditional-games/gallery-2.webp` | gallery.ts service grids | Community Events page gallery grid |
| Community Events Gallery Photo 3 | `traditional-games-gallery-3` | `services/traditional-games/gallery-3.webp` | gallery.ts service grids | Community Events page gallery grid |
| Community Events Gallery Photo 4 | `traditional-games-gallery-4` | `services/traditional-games/gallery-4.webp` | gallery.ts service grids | Community Events page gallery grid |
| Community Events Hero Banner | `traditional-games-slider-1` | `services/traditional-games/slider-1.webp` | ServiceDetailHero | Community Events page hero |
| Community Events Gallery Image 2 | `traditional-games-slider-2` | `services/traditional-games/slider-2.webp` | Service gallery sections | Community Events page slider 2 |
| Community Events Gallery Image 3 | `traditional-games-slider-3` | `services/traditional-games/slider-3.webp` | Service gallery sections | Community Events page slider 3 |
| Community Events Title Card | `traditional-games-title-card` | `services/traditional-games/title-card.webp` | HomeEventCategories, service pages | Community Events card on home · service detail pages |
| Corporate Games Gallery Photo 1 | `corporate-games-gallery-1` | `services/corporate-games/gallery-1.webp` | gallery.ts service grids | Corporate Games page gallery grid |
| Corporate Games Gallery Photo 2 | `corporate-games-gallery-2` | `services/corporate-games/gallery-2.webp` | gallery.ts service grids | Corporate Games page gallery grid |
| Corporate Games Gallery Photo 3 | `corporate-games-gallery-3` | `services/corporate-games/gallery-3.webp` | gallery.ts service grids | Corporate Games page gallery grid |
| Corporate Games Gallery Photo 4 | `corporate-games-gallery-4` | `services/corporate-games/gallery-4.webp` | gallery.ts service grids | Corporate Games page gallery grid |
| Corporate Games Hero Banner | `corporate-games-slider-1` | `services/corporate-games/slider-1.webp` | ServiceDetailHero | Corporate Games page hero |
| Corporate Games Gallery Image 2 | `corporate-games-slider-2` | `services/corporate-games/slider-2.webp` | Service gallery sections | Corporate Games page slider 2 |
| Corporate Games Gallery Image 3 | `corporate-games-slider-3` | `services/corporate-games/slider-3.webp` | Service gallery sections | Corporate Games page slider 3 |
| Corporate Games Title Card | `corporate-games-title-card` | `services/corporate-games/title-card.webp` | HomeEventCategories, service pages | Corporate Games card on home · service detail pages |
| Gallery Photo 1 | `gallery-1` | `gallery/event-gallery-1.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 1 |
| Gallery Photo 2 | `gallery-2` | `gallery/event-gallery-2.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 2 |
| Gallery Photo 3 | `gallery-3` | `gallery/event-gallery-3.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 3 |
| Gallery Photo 4 | `gallery-4` | `gallery/event-gallery-4.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 4 |
| Gallery Photo 5 | `gallery-5` | `gallery/event-gallery-5.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 5 |
| Gallery Photo 6 | `gallery-6` | `gallery/event-gallery-6.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 6 |
| Gallery Photo 7 | `gallery-7` | `gallery/event-gallery-7.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 7 |
| Gallery Photo 8 | `gallery-8` | `gallery/event-gallery-8.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 8 |
| Gallery Photo 9 | `gallery-9` | `gallery/event-gallery-9.webp` | gallery.ts resolveGalleryItem | Gallery page event grid photo 9 |
| Gallery Page Hero Banner | `gallery-hero` | `gallery/gallery-hero.webp` | GalleryHero | Gallery `/gallery` hero |
| Gallery Moment 1 | `gallery-moment-1` | `gallery/moments/moment-1.webp` | HomeGalleryMoments, AboutBelieveInPlay, gallery.ts | Gallery moments · home/about featured moments 1 |
| Gallery Moment 2 | `gallery-moment-2` | `gallery/moments/moment-2.webp` | HomeGalleryMoments, AboutBelieveInPlay, gallery.ts | Gallery moments · home/about featured moments 2 |
| Gallery Moment 3 | `gallery-moment-3` | `gallery/moments/moment-3.webp` | HomeGalleryMoments, AboutBelieveInPlay, gallery.ts | Gallery moments · home/about featured moments 3 |
| Gallery Moment 4 | `gallery-moment-4` | `gallery/moments/moment-4.webp` | HomeGalleryMoments, AboutBelieveInPlay, gallery.ts | Gallery moments · home/about featured moments 4 |
| Gallery Moment 5 | `gallery-moment-5` | `gallery/moments/moment-5.webp` | HomeGalleryMoments, AboutBelieveInPlay, gallery.ts | Gallery moments · home/about featured moments 5 |
| Gallery Moment 6 | `gallery-moment-6` | `gallery/moments/moment-6.webp` | HomeGalleryMoments, AboutBelieveInPlay, gallery.ts | Gallery moments · home/about featured moments 6 |
| Game Festival Gallery Photo 1 | `game-festival-gallery-1` | `services/game-festival/gallery-1.webp` | gallery.ts service grids | Game Festival page gallery grid |
| Game Festival Gallery Photo 2 | `game-festival-gallery-2` | `services/game-festival/gallery-2.webp` | gallery.ts service grids | Game Festival page gallery grid |
| Game Festival Gallery Photo 3 | `game-festival-gallery-3` | `services/game-festival/gallery-3.webp` | gallery.ts service grids | Game Festival page gallery grid |
| Game Festival Gallery Photo 4 | `game-festival-gallery-4` | `services/game-festival/gallery-4.webp` | gallery.ts service grids | Game Festival page gallery grid |
| Game Festival Hero Banner | `game-festival-slider-1` | `services/game-festival/slider-1.webp` | ServiceDetailHero | Game Festival page hero |
| Game Festival Gallery Image 2 | `game-festival-slider-2` | `services/game-festival/slider-2.webp` | Service gallery sections | Game Festival page slider 2 |
| Game Festival Gallery Image 3 | `game-festival-slider-3` | `services/game-festival/slider-3.webp` | Service gallery sections | Game Festival page slider 3 |
| Game Festival Title Card | `game-festival-title-card` | `services/game-festival/title-card.webp` | HomeEventCategories, service pages | Game Festival card on home · service detail pages |
| Homepage Hero Banner | `homepage-hero` | `homepage/hero.webp` | HomeHero, AboutHero | Home `/` hero · About `/about` hero (shared) |
| School & College Gallery Photo 1 | `school-and-collage-event-gallery-1` | `services/school-and-collage-event/gallery-1.webp` | gallery.ts service grids | School & College page gallery grid |
| School & College Gallery Photo 2 | `school-and-collage-event-gallery-2` | `services/school-and-collage-event/gallery-2.webp` | gallery.ts service grids | School & College page gallery grid |
| School & College Gallery Photo 3 | `school-and-collage-event-gallery-3` | `services/school-and-collage-event/gallery-3.webp` | gallery.ts service grids | School & College page gallery grid |
| School & College Gallery Photo 4 | `school-and-collage-event-gallery-4` | `services/school-and-collage-event/gallery-4.webp` | gallery.ts service grids | School & College page gallery grid |
| School & College Hero Banner | `school-and-collage-event-slider-1` | `services/school-and-collage-event/slider-1.webp` | ServiceDetailHero | School & College page hero |
| School & College Gallery Image 2 | `school-and-collage-event-slider-2` | `services/school-and-collage-event/slider-2.webp` | Service gallery sections | School & College page slider 2 |
| School & College Gallery Image 3 | `school-and-collage-event-slider-3` | `services/school-and-collage-event/slider-3.webp` | Service gallery sections | School & College page slider 3 |
| School & College Title Card | `school-and-collage-event-title-card` | `services/school-and-collage-event/title-card.webp` | HomeEventCategories, service pages | School & College card on home · service detail pages |
| Default Social Share Image | `seo-og-default` | `seo/og-default.webp` | getOgImageUrl | Default Open Graph / social share image |
| Social Preview Image | `seo-social-preview` | `seo/social-preview.webp` | og-images | Social preview OG image |
| Strategy Games Activity Card | `homepage-strategy-games` | `homepage/strategy-games.webp` | service-activities | Home/service activity cards — strategy |
| Team Building Activity Card | `homepage-team-building` | `homepage/team-building.webp` | service-activities | Home/service activity cards — team building |
| Social Gatherings Gallery Photo 1 | `social-gathering-games-gallery-1` | `services/social-gathering-games/gallery-1.webp` | gallery.ts service grids | Social Gatherings page gallery grid |
| Social Gatherings Gallery Photo 2 | `social-gathering-games-gallery-2` | `services/social-gathering-games/gallery-2.webp` | gallery.ts service grids | Social Gatherings page gallery grid |
| Social Gatherings Gallery Photo 3 | `social-gathering-games-gallery-3` | `services/social-gathering-games/gallery-3.webp` | gallery.ts service grids | Social Gatherings page gallery grid |
| Social Gatherings Gallery Photo 4 | `social-gathering-games-gallery-4` | `services/social-gathering-games/gallery-4.webp` | gallery.ts service grids | Social Gatherings page gallery grid |
| Social Gatherings Hero Banner | `social-gathering-games-slider-1` | `services/social-gathering-games/slider-1.webp` | ServiceDetailHero | Social Gatherings page hero |
| Social Gatherings Gallery Image 2 | `social-gathering-games-slider-2` | `services/social-gathering-games/slider-2.webp` | Service gallery sections | Social Gatherings page slider 2 |
| Social Gatherings Gallery Image 3 | `social-gathering-games-slider-3` | `services/social-gathering-games/slider-3.webp` | Service gallery sections | Social Gatherings page slider 3 |
| Social Gatherings Title Card | `social-gathering-games-title-card` | `services/social-gathering-games/title-card.webp` | HomeEventCategories, service pages | Social Gatherings card on home · service detail pages |
| Wedding Games Gallery Photo 1 | `wedding-or-haldi-games-gallery-1` | `services/wedding-or-haldi-games/gallery-1.webp` | gallery.ts service grids | Wedding Games page gallery grid |
| Wedding Games Gallery Photo 2 | `wedding-or-haldi-games-gallery-2` | `services/wedding-or-haldi-games/gallery-2.webp` | gallery.ts service grids | Wedding Games page gallery grid |
| Wedding Games Gallery Photo 3 | `wedding-or-haldi-games-gallery-3` | `services/wedding-or-haldi-games/gallery-3.webp` | gallery.ts service grids | Wedding Games page gallery grid |
| Wedding Games Gallery Photo 4 | `wedding-or-haldi-games-gallery-4` | `services/wedding-or-haldi-games/gallery-4.webp` | gallery.ts service grids | Wedding Games page gallery grid |
| Wedding Games Hero Banner | `wedding-or-haldi-games-slider-1` | `services/wedding-or-haldi-games/slider-1.webp` | ServiceDetailHero | Wedding Games page hero |
| Wedding Games Gallery Image 2 | `wedding-or-haldi-games-slider-2` | `services/wedding-or-haldi-games/slider-2.webp` | Service gallery sections | Wedding Games page slider 2 |
| Wedding Games Gallery Image 3 | `wedding-or-haldi-games-slider-3` | `services/wedding-or-haldi-games/slider-3.webp` | Service gallery sections | Wedding Games page slider 3 |
| Wedding Games Title Card | `wedding-or-haldi-games-title-card` | `services/wedding-or-haldi-games/title-card.webp` | HomeEventCategories, service pages | Wedding Games card on home · service detail pages |