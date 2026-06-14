/**
 * CMS image keys — single source for PHP seed + React fallbacks.
 * Keys use kebab-case. Admin uploads override bundled assets at runtime.
 */

export type ImageKeyMeta = {
  title: string
  category: string
  /** Relative path under src/assets/images/ for bundled fallback */
  fallback: string
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

function serviceKeys(slug: (typeof SERVICE_SLUGS)[number], label: string): Record<string, ImageKeyMeta> {
  const base = `services/${slug}`
  const cat = serviceCategoryBySlug[slug]
  const keys: Record<string, ImageKeyMeta> = {
    [`${slug}-title-card`]: {
      title: `${label} Title Card`,
      category: cat,
      fallback: `${base}/title-card.webp`,
    },
  }
  for (let n = 1; n <= 3; n += 1) {
    keys[`${slug}-slider-${n}`] = {
      title: `${label} Gallery Image ${n}`,
      category: cat,
      fallback: `${base}/slider-${n}.webp`,
    }
  }
  for (let n = 1; n <= 4; n += 1) {
    keys[`${slug}-gallery-${n}`] = {
      title: `${label} Gallery Photo ${n}`,
      category: cat,
      fallback: `${base}/gallery-${n}.webp`,
    }
  }
  return keys
}

const homepageKeys: Record<string, ImageKeyMeta> = {
  'homepage-hero': {
    title: 'Homepage Hero Banner',
    category: 'Homepage',
    fallback: 'homepage/hero.webp',
  },
  'homepage-about-teaser': {
    title: 'Homepage About Section Image',
    category: 'About',
    fallback: 'homepage/about-teaser.webp',
  },
  'homepage-team-building': {
    title: 'Homepage Team Building Card',
    category: 'Homepage',
    fallback: 'homepage/team-building.webp',
  },
  'homepage-strategy-games': {
    title: 'Homepage Strategy Games Card',
    category: 'Homepage',
    fallback: 'homepage/strategy-games.webp',
  },
}

const galleryKeys: Record<string, ImageKeyMeta> = {
  'gallery-hero': {
    title: 'Gallery Page Hero Banner',
    category: 'Gallery',
    fallback: 'gallery/gallery-hero.webp',
  },
}

for (let n = 1; n <= 9; n += 1) {
  galleryKeys[`gallery-${n}`] = {
    title: `Gallery Photo ${n}`,
    category: 'Gallery',
    fallback: `gallery/event-gallery-${n}.webp`,
  }
}

for (let n = 1; n <= 6; n += 1) {
  galleryKeys[`gallery-moment-${n}`] = {
    title: `Gallery Moment ${n}`,
    category: 'Gallery',
    fallback: `gallery/moments/moment-${n}.webp`,
  }
}

/** Alias: birthday-hero → first birthday slider (common admin label) */
const aliasKeys: Record<string, ImageKeyMeta> = {
  'birthday-hero': {
    title: 'Birthday Games Hero Banner',
    category: 'Birthday Games',
    fallback: 'services/birthday-games/slider-1.webp',
  },
}

export const IMAGE_KEY_REGISTRY: Record<string, ImageKeyMeta> = {
  ...homepageKeys,
  ...galleryKeys,
  ...aliasKeys,
  ...SERVICE_SLUGS.reduce(
    (acc, slug) => ({ ...acc, ...serviceKeys(slug, serviceLabelBySlug[slug]) }),
    {} as Record<string, ImageKeyMeta>,
  ),
}

/** Map bundled asset path → CMS key (for transparent getAssetUrl integration) */
export const FALLBACK_PATH_TO_IMAGE_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(IMAGE_KEY_REGISTRY).map(([key, meta]) => [meta.fallback, key]),
)

export const IMAGE_KEY_LIST = Object.keys(IMAGE_KEY_REGISTRY)
