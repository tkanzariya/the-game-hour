/**
 * CMS image keys — single source for PHP seed + React fallbacks.
 * Keys use kebab-case. Admin uploads override bundled assets at runtime.
 */

export type ImageKeyMeta = {
  title: string
  category: string
  /** Relative path under src/assets/images/ for bundled fallback */
  fallback: string
  /** Where this image appears on the public site */
  usage?: string
}

/** Admin display label: section name + number (e.g. "Featured moments — 1"). */
export function cmsSectionLabel(section: string, index: number): string {
  return `${section} — ${index}`
}

export const GALLERY_FEATURED_CMS_KEYS = [
  'gallery-featured-1',
  'gallery-featured-2',
  'gallery-featured-3',
  'gallery-featured-4',
] as const

export const GALLERY_EVENT_MOMENT_CMS_KEYS = Array.from(
  { length: 12 },
  (_, i) => `gallery-event-moment-${i + 1}`,
)

export const GALLERY_STORY_CMS_KEYS = [
  'gallery-story-1',
  'gallery-story-2',
  'gallery-story-3',
] as const

const SERVICE_SLUGS = [
  'birthday-games',
  'corporate-games',
  'social-gathering-games',
  'game-festival',
  'school-and-collage-event',
  'wedding-or-haldi-games',
  'traditional-games',
  'bollywood-games',
] as const

const serviceCategoryBySlug: Record<(typeof SERVICE_SLUGS)[number], string> = {
  'birthday-games': 'Birthday Games',
  'corporate-games': 'Corporate Games',
  'social-gathering-games': 'Social Gatherings',
  'game-festival': 'Game Festival',
  'school-and-collage-event': 'School & College',
  'wedding-or-haldi-games': 'Wedding Games',
  'traditional-games': 'Community Events',
  'bollywood-games': 'Bollywood Theme',
}

const serviceLabelBySlug: Record<(typeof SERVICE_SLUGS)[number], string> = {
  'birthday-games': 'Birthday Games',
  'corporate-games': 'Corporate Games',
  'social-gathering-games': 'Social Gatherings',
  'game-festival': 'Game Festival',
  'school-and-collage-event': 'School & College',
  'wedding-or-haldi-games': 'Wedding Games',
  'traditional-games': 'Community Events',
  'bollywood-games': 'Bollywood Theme',
}

function servicePageLabel(slug: (typeof SERVICE_SLUGS)[number]): string {
  const labels: Record<string, string> = {
    'wedding-or-haldi-games': 'Wedding / Haldi',
    'traditional-games': 'Traditional Games',
    'social-gathering-games': 'Social Gathering',
  }
  return labels[slug] ?? serviceLabelBySlug[slug]
}

function serviceKeys(slug: (typeof SERVICE_SLUGS)[number]): Record<string, ImageKeyMeta> {
  const base = `services/${slug}`
  const cat = serviceCategoryBySlug[slug]
  const page = `${servicePageLabel(slug)} page`
  const keys: Record<string, ImageKeyMeta> = {
    [`${slug}-title-card`]: {
      title: cmsSectionLabel('Experiences for every celebration', 1),
      category: cat,
      fallback: `${base}/title-card.webp`,
      usage: `${page} — home experience card`,
    },
  }
  for (let n = 1; n <= 3; n += 1) {
    keys[`${slug}-slider-${n}`] = {
      title: cmsSectionLabel('Hero', n),
      category: cat,
      fallback: `${base}/slider-${n}.webp`,
      usage: n === 1 ? `${page} — hero banner` : `${page} — hero slider ${n}`,
    }
  }
  for (let n = 1; n <= 4; n += 1) {
    keys[`${slug}-gallery-${n}`] = {
      title: cmsSectionLabel('See the energy in action', n),
      category: cat,
      fallback: `${base}/gallery-${n}.webp`,
      usage: `${page} — gallery grid photo ${n}`,
    }
  }
  return keys
}

const homepageKeys: Record<string, ImageKeyMeta> = {
  'homepage-hero': {
    title: cmsSectionLabel('Hero', 1),
    category: 'Homepage',
    fallback: 'homepage/hero.webp',
    usage: 'Home page (/) — hero banner',
  },
  'homepage-about-teaser': {
    title: cmsSectionLabel('Games & activities included', 1),
    category: 'Service Activity Cards',
    fallback: 'homepage/about-teaser.webp',
    usage: 'All service pages — Icebreakers activity card',
  },
}

const aboutKeys: Record<string, ImageKeyMeta> = {
  'about-hero': {
    title: cmsSectionLabel('Hero', 1),
    category: 'About',
    fallback: 'homepage/hero.webp',
    usage: 'About page (/about) — hero banner',
  },
  'about-story': {
    title: cmsSectionLabel('Our story', 1),
    category: 'About',
    fallback: 'homepage/about-teaser.webp',
    usage: 'About page — story section and hero accent',
  },
  'about-pillar-connection': {
    title: cmsSectionLabel('Why we believe in play', 1),
    category: 'About',
    fallback: 'gallery/moments/moment-1.webp',
    usage: 'About page — Connection pillar card',
  },
  'about-pillar-screen-free': {
    title: cmsSectionLabel('Why we believe in play', 2),
    category: 'About',
    fallback: 'gallery/moments/moment-2.webp',
    usage: 'About page — Screen-free pillar card',
  },
  'about-gallery-spotlight': {
    title: cmsSectionLabel('See the joy in action', 1),
    category: 'About',
    fallback: 'gallery/event-gallery-2.webp',
    usage: 'About page — gallery invite spotlight',
  },
}

for (let n = 1; n <= 4; n += 1) {
  homepageKeys[`homepage-moment-${n}`] = {
    title: cmsSectionLabel('A glimpse of the energy', n),
    category: 'Homepage',
    fallback: `gallery/moments/moment-${n}.webp`,
    usage: `Home page (/) — gallery teaser photo ${n}`,
  }
}

const serviceActivityKeys: Record<string, ImageKeyMeta> = {
  'homepage-team-building': {
    title: cmsSectionLabel('Games & activities included', 3),
    category: 'Service Activity Cards',
    fallback: 'homepage/team-building.webp',
    usage: 'All service pages — Team Building activity card',
  },
  'homepage-strategy-games': {
    title: cmsSectionLabel('Games & activities included', 2),
    category: 'Service Activity Cards',
    fallback: 'homepage/strategy-games.webp',
    usage: 'All service pages — Strategy Games activity card',
  },
}

const galleryFeaturedFallbacks = [
  'gallery/moments/moment-1.webp',
  'gallery/event-gallery-2.webp',
  'gallery/moments/moment-3.webp',
  'gallery/event-gallery-5.webp',
] as const

const galleryEventMomentFallbacks = [
  ...Array.from({ length: 9 }, (_, i) => `gallery/event-gallery-${i + 1}.webp`),
  'gallery/moments/moment-4.webp',
  'gallery/moments/moment-5.webp',
  'gallery/moments/moment-6.webp',
] as const

const galleryStoryFallbacks = [
  'gallery/event-gallery-2.webp',
  'gallery/event-gallery-4.webp',
  'gallery/event-gallery-6.webp',
] as const

const galleryKeys: Record<string, ImageKeyMeta> = {
  'gallery-hero': {
    title: cmsSectionLabel('Hero', 1),
    category: 'Gallery',
    fallback: 'gallery/gallery-hero.webp',
    usage: 'Gallery page (/gallery) — hero banner',
  },
}

for (let n = 1; n <= 4; n += 1) {
  galleryKeys[`gallery-featured-${n}`] = {
    title: cmsSectionLabel('Featured moments', n),
    category: 'Gallery',
    fallback: galleryFeaturedFallbacks[n - 1],
    usage: 'Gallery page — Featured moments section',
  }
}

for (let n = 1; n <= 12; n += 1) {
  galleryKeys[`gallery-event-moment-${n}`] = {
    title: cmsSectionLabel('Event moments', n),
    category: 'Gallery',
    fallback: galleryEventMomentFallbacks[n - 1],
    usage: 'Gallery page — Event moments grid (Browse by experience)',
  }
}

for (let n = 1; n <= 3; n += 1) {
  galleryKeys[`gallery-story-${n}`] = {
    title: cmsSectionLabel('Stories behind the photos', n),
    category: 'Gallery',
    fallback: galleryStoryFallbacks[n - 1],
    usage: 'Gallery page — Stories section',
  }
}

const brandingKeys: Record<string, ImageKeyMeta> = {
  'branding-logo-light': {
    title: cmsSectionLabel('Site logo', 1),
    category: 'Branding',
    fallback: 'branding/logo-light.webp',
    usage: 'Header and footer — light background',
  },
  'branding-logo-dark': {
    title: cmsSectionLabel('Site logo', 2),
    category: 'Branding',
    fallback: 'branding/logo-dark.webp',
    usage: 'Header and footer — dark background',
  },
}

const seoKeys: Record<string, ImageKeyMeta> = {
  'seo-og-default': {
    title: cmsSectionLabel('Social share preview', 1),
    category: 'SEO',
    fallback: 'seo/og-default.webp',
    usage: 'Default Open Graph / link preview image',
  },
  'seo-social-preview': {
    title: cmsSectionLabel('Social share preview', 2),
    category: 'SEO',
    fallback: 'seo/social-preview.webp',
    usage: 'Dedicated social preview image',
  },
}

/** Legacy DB keys → canonical keys used by the frontend */
export const CMS_KEY_ALIASES: Record<string, string> = {
  'birthday-hero': 'birthday-games-slider-1',
  'gallery-1': 'gallery-event-moment-1',
  'gallery-2': 'gallery-event-moment-2',
  'gallery-3': 'gallery-event-moment-3',
  'gallery-4': 'gallery-event-moment-4',
  'gallery-5': 'gallery-event-moment-5',
  'gallery-6': 'gallery-event-moment-6',
  'gallery-7': 'gallery-event-moment-7',
  'gallery-8': 'gallery-event-moment-8',
  'gallery-9': 'gallery-event-moment-9',
  'gallery-moment-1': 'gallery-featured-1',
  'gallery-moment-2': 'about-pillar-screen-free',
  'gallery-moment-3': 'gallery-featured-3',
  'gallery-moment-4': 'gallery-event-moment-10',
  'gallery-moment-5': 'gallery-event-moment-11',
  'gallery-moment-6': 'gallery-event-moment-12',
  'home-moment-1': 'gallery-featured-1',
  'home-moment-2': 'gallery-event-moment-10',
  'home-moment-3': 'gallery-featured-3',
  'home-moment-4': 'gallery-event-moment-10',
  'home-moment-5': 'gallery-event-moment-11',
  'home-moment-6': 'gallery-event-moment-12',
}

export const IMAGE_KEY_REGISTRY: Record<string, ImageKeyMeta> = {
  ...homepageKeys,
  ...aboutKeys,
  ...serviceActivityKeys,
  ...galleryKeys,
  ...brandingKeys,
  ...seoKeys,
  ...SERVICE_SLUGS.reduce(
    (acc, slug) => ({ ...acc, ...serviceKeys(slug) }),
    {} as Record<string, ImageKeyMeta>,
  ),
}

/** Map bundled asset path → CMS keys (multiple keys may share one fallback) */
export const FALLBACK_PATH_TO_IMAGE_KEYS: Record<string, string[]> = Object.entries(
  IMAGE_KEY_REGISTRY,
).reduce<Record<string, string[]>>((acc, [key, meta]) => {
  const path = meta.fallback
  if (!acc[path]) acc[path] = []
  acc[path].push(key)
  return acc
}, {})

/** @deprecated Use FALLBACK_PATH_TO_IMAGE_KEYS — first key per path */
export const FALLBACK_PATH_TO_IMAGE_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(FALLBACK_PATH_TO_IMAGE_KEYS).map(([path, keys]) => [path, keys[0]]),
)

export const IMAGE_KEY_LIST = Object.keys(IMAGE_KEY_REGISTRY)

/** Resolve legacy alias to canonical frontend key */
export function resolveCanonicalCmsKey(key: string): string {
  return CMS_KEY_ALIASES[key] ?? key
}

/** Keys that share the same bundled fallback (including legacy aliases). */
export function cmsKeysSharingFallback(key: string): string[] {
  const canonical = resolveCanonicalCmsKey(key)
  const meta = IMAGE_KEY_REGISTRY[canonical]
  if (!meta?.fallback) return [canonical]
  const siblings = new Set<string>([canonical])
  for (const sibling of FALLBACK_PATH_TO_IMAGE_KEYS[meta.fallback] ?? []) {
    siblings.add(resolveCanonicalCmsKey(sibling))
  }
  return [...siblings]
}
