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

function serviceKeys(slug: (typeof SERVICE_SLUGS)[number], label: string): Record<string, ImageKeyMeta> {
  const base = `services/${slug}`
  const cat = serviceCategoryBySlug[slug]
  const page = `${servicePageLabel(slug)} experience page`
  const keys: Record<string, ImageKeyMeta> = {
    [`${slug}-title-card`]: {
      title: `${label} Title Card`,
      category: cat,
      fallback: `${base}/title-card.webp`,
      usage: `${page} — home event category card & service pages`,
    },
  }
  for (let n = 1; n <= 3; n += 1) {
    keys[`${slug}-slider-${n}`] = {
      title: n === 1 ? `${label} Hero Banner` : `${label} Slider Image ${n}`,
      category: cat,
      fallback: `${base}/slider-${n}.webp`,
      usage: n === 1 ? `${page} — hero banner (ServiceDetailHero)` : `${page} — hero slider image ${n}`,
    }
  }
  for (let n = 1; n <= 4; n += 1) {
    keys[`${slug}-gallery-${n}`] = {
      title: `${label} Gallery Photo ${n}`,
      category: cat,
      fallback: `${base}/gallery-${n}.webp`,
      usage: `${page} — gallery grid photo ${n}`,
    }
  }
  return keys
}

const homepageKeys: Record<string, ImageKeyMeta> = {
  'homepage-hero': {
    title: 'Homepage Hero Banner',
    category: 'Homepage',
    fallback: 'homepage/hero.webp',
    usage: 'Home page (/) — main hero · About page (/about) — hero (same image)',
  },
  'homepage-about-teaser': {
    title: 'Icebreakers Activity Card',
    category: 'Service Activity Cards',
    fallback: 'homepage/about-teaser.webp',
    usage: 'All service pages — Icebreakers activity card image',
  },
}

const aboutKeys: Record<string, ImageKeyMeta> = {
  'about-hero': {
    title: 'About Page Hero',
    category: 'About',
    fallback: 'homepage/hero.webp',
    usage: 'About page (/about) — main hero banner',
  },
  'about-story': {
    title: 'Our Story Section',
    category: 'About',
    fallback: 'homepage/about-teaser.webp',
    usage: 'About page — story section image and hero accent overlay',
  },
  'about-pillar-connection': {
    title: 'Connection Pillar Photo',
    category: 'About',
    fallback: 'gallery/moments/moment-1.webp',
    usage: 'About page — "Why we believe in play" — Connection card',
  },
  'about-pillar-screen-free': {
    title: 'Screen-free Pillar Photo',
    category: 'About',
    fallback: 'gallery/moments/moment-2.webp',
    usage: 'About page — "Why we believe in play" — Screen-free card',
  },
  'about-gallery-spotlight': {
    title: 'Gallery Invite Spotlight',
    category: 'About',
    fallback: 'gallery/event-gallery-2.webp',
    usage: 'About page — "See the joy in action" section',
  },
}

for (let n = 1; n <= 4; n += 1) {
  homepageKeys[`homepage-moment-${n}`] = {
    title: `Homepage Gallery Teaser ${n}`,
    category: 'Homepage',
    fallback: `gallery/moments/moment-${n}.webp`,
    usage: `Home page (/) — "A glimpse of the energy" section — photo ${n}`,
  }
}

const serviceActivityKeys: Record<string, ImageKeyMeta> = {
  'homepage-team-building': {
    title: 'Team Building Activity Card',
    category: 'Service Activity Cards',
    fallback: 'homepage/team-building.webp',
    usage: 'All service pages (Birthday, Corporate, etc.) — Team Building activity card',
  },
  'homepage-strategy-games': {
    title: 'Strategy Games Activity Card',
    category: 'Service Activity Cards',
    fallback: 'homepage/strategy-games.webp',
    usage: 'All service pages (Birthday, Corporate, etc.) — Strategy Games activity card',
  },
}

const galleryKeys: Record<string, ImageKeyMeta> = {
  'gallery-hero': {
    title: 'Gallery Page Hero Banner',
    category: 'Gallery',
    fallback: 'gallery/gallery-hero.webp',
    usage: 'Gallery page (/gallery) — hero banner',
  },
}

for (let n = 1; n <= 9; n += 1) {
  galleryKeys[`gallery-${n}`] = {
    title: `Gallery Event Photo ${n}`,
    category: 'Gallery',
    fallback: `gallery/event-gallery-${n}.webp`,
    usage: `Gallery page — event photo grid slot ${n}`,
  }
}

for (let n = 1; n <= 6; n += 1) {
  galleryKeys[`gallery-moment-${n}`] = {
    title: `Gallery Featured Moment ${n}`,
    category: 'Gallery',
    fallback: `gallery/moments/moment-${n}.webp`,
    usage:
      n <= 4
        ? `Gallery page (/gallery) — featured moments · About page believe section (not home teaser)`
        : `Gallery page (/gallery) — featured moments`,
  }
}

const brandingKeys: Record<string, ImageKeyMeta> = {
  'branding-logo-light': {
    title: 'Logo (light background)',
    category: 'Branding',
    fallback: 'branding/logo-light.webp',
    usage: 'Site header & footer — logo on light backgrounds',
  },
  'branding-logo-dark': {
    title: 'Logo (dark background)',
    category: 'Branding',
    fallback: 'branding/logo-dark.webp',
    usage: 'Site header & footer — logo on dark backgrounds',
  },
}

const seoKeys: Record<string, ImageKeyMeta> = {
  'seo-og-default': {
    title: 'Default Social Share Image',
    category: 'SEO',
    fallback: 'seo/og-default.webp',
    usage: 'Open Graph / link preview when no page-specific image is set',
  },
  'seo-social-preview': {
    title: 'Social Preview Image',
    category: 'SEO',
    fallback: 'seo/social-preview.webp',
    usage: 'Dedicated social preview OG image',
  },
}

/** Legacy DB keys → canonical keys used by the frontend */
export const CMS_KEY_ALIASES: Record<string, string> = {
  'birthday-hero': 'birthday-games-slider-1',
}

export const IMAGE_KEY_REGISTRY: Record<string, ImageKeyMeta> = {
  ...homepageKeys,
  ...aboutKeys,
  ...serviceActivityKeys,
  ...galleryKeys,
  ...brandingKeys,
  ...seoKeys,
  ...SERVICE_SLUGS.reduce(
    (acc, slug) => ({ ...acc, ...serviceKeys(slug, serviceLabelBySlug[slug]) }),
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
