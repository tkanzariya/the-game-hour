/**
 * Central image registry for The Game Hour v2.
 * Use `getAssetUrl()` from `@/lib/assets`, avoid hardcoded import paths in components.
 */

export type ImageFormats = {
  webp: string
  jpg?: string
  png?: string
  svg?: string
}

export type AssetEntry = ImageFormats & {
  alt?: string
}

export type ServiceAssets = {
  titleCard: AssetEntry
  slider: AssetEntry[]
  gallery: AssetEntry[]
}

function img(
  webp: string,
  opts?: Partial<ImageFormats> & { alt?: string },
): AssetEntry {
  const base = webp.replace(/\.webp$/, '')
  return {
    webp,
    jpg: opts?.jpg ?? `${base}.jpg`,
    png: opts?.png,
    svg: opts?.svg,
    alt: opts?.alt,
  }
}

function serviceAssets(slug: string, alt: string): ServiceAssets {
  const base = `services/${slug}`
  return {
    titleCard: img(`${base}/title-card.webp`, {
      png: `${base}/title-card.png`,
      alt: `${alt} | The Game Hour`,
    }),
    slider: [1, 2, 3].map((n) =>
      img(`${base}/slider-${n}.webp`, { alt: `${alt} event photo ${n}` }),
    ),
    gallery: [1, 2, 3, 4].map((n) =>
      img(`${base}/gallery-${n}.webp`, { alt: `${alt} gallery ${n}` }),
    ),
  }
}

export const ASSET_MAP = {
  branding: {
    logoLight: img('branding/logo-light.webp', {
      png: 'branding/logo-light.png',
      alt: 'The Game Hour logo',
    }),
    logoDark: img('branding/logo-dark.webp', {
      png: 'branding/logo-dark.png',
      alt: 'The Game Hour logo',
    }),
    logo: { svg: 'branding/logo.svg', webp: 'branding/logo.svg' },
  },

  homepage: {
    hero: img('homepage/hero.webp', {
      alt: 'People laughing and playing games at an event',
    }),
    aboutTeaser: img('homepage/about-teaser.webp', {
      alt: 'People playing games at an event',
    }),
    teamBuilding: img('homepage/team-building.webp', {
      alt: 'Team building games',
    }),
    strategyGames: img('homepage/strategy-games.webp', {
      alt: 'Strategy games',
    }),
  },

  services: {
    'birthday-games': serviceAssets('birthday-games', 'Birthday Games'),
    'corporate-games': serviceAssets('corporate-games', 'Corporate Games'),
    'social-gathering-games': serviceAssets(
      'social-gathering-games',
      'Social Gathering Games',
    ),
    'game-festival': serviceAssets('game-festival', 'Game Festival'),
    'school-and-collage-event': serviceAssets(
      'school-and-collage-event',
      'School & College Events',
    ),
    'wedding-or-haldi-games': serviceAssets(
      'wedding-or-haldi-games',
      'Wedding & Haldi Games',
    ),
    'traditional-games': serviceAssets('traditional-games', 'Traditional Games'),
    'bollywood-games': serviceAssets('bollywood-games', 'Bollywood Games'),
  },

  gallery: {
    hero: img('gallery/gallery-hero.webp', {
      alt: 'People enjoying games at a vibrant event',
    }),
    events: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
      img(`gallery/event-gallery-${n}.webp`, { alt: `Event gallery photo ${n}` }),
    ),
    moments: [1, 2, 3, 4, 5, 6].map((n) =>
      img(`gallery/moments/moment-${n}.webp`, { alt: `Event moment ${n}` }),
    ),
  },

  seo: {
    ogDefault: img('seo/og-default.webp', {
      jpg: 'seo/og-default.jpg',
      alt: 'The Game Hour: screen-free event games',
    }),
    socialPreview: img('seo/social-preview.webp', {
      jpg: 'seo/social-preview.jpg',
      alt: 'The Game Hour social preview',
    }),
  },

  icons: {
    favicon16: { webp: 'icons/favicon-16x16.png', png: 'icons/favicon-16x16.png' },
    favicon32: { webp: 'icons/favicon-32x32.png', png: 'icons/favicon-32x32.png' },
    faviconIco: { webp: 'icons/favicon.ico' },
  },
} as const

export type ServiceSlug = keyof typeof ASSET_MAP.services

/** Public OG paths (also copied to /public/) */
export const PUBLIC_ASSETS = {
  ogDefaultJpg: '/og-default.jpg',
  ogDefaultWebp: '/og-default.webp',
} as const

export function getServiceAssets(slug: ServiceSlug): ServiceAssets {
  return ASSET_MAP.services[slug]
}

/** Resolve primary path string from an asset entry */
export function resolveAssetPath(
  entry: AssetEntry | undefined,
  format: 'webp' | 'jpg' | 'png' | 'svg' = 'webp',
): string | undefined {
  if (!entry) return undefined
  if (format === 'webp') return entry.webp
  if (format === 'jpg') return entry.jpg
  if (format === 'png') return entry.png
  if (format === 'svg') return entry.svg
  return entry.webp
}
