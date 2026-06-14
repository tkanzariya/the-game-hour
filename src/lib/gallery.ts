import { galleryData } from '@/data'
import { GALLERY_EVENT_MOMENT_CMS_KEYS } from '@/data/image-keys'
import { ASSET_MAP, type ServiceSlug } from '@/data/asset-map'
import type { GalleryItem, GalleryPageContent } from '@/data/types'
import { getAssetUrl, getImageByKey, getServiceAssetUrl } from '@/lib/assets'

export type ResolvedGalleryImage = {
  id: string
  src: string
  alt: string
  caption?: string
  serviceSlug?: string
}

export type ServiceGalleryImage = {
  id: string
  src: string
  alt: string
  caption?: string
}

export const GALLERY_FILTER_ALL = 'all' as const
export type GalleryFilterId = typeof GALLERY_FILTER_ALL | ServiceSlug

const fallbackPage: GalleryPageContent = {
  hero: {
    eyebrow: 'Real events · Real joy',
    headline: 'Moments of laughter you can almost hear.',
    subheadline: galleryData.hero.subheadline,
  },
  featuredMoments: {
    title: 'Featured moments',
    subtitle: 'Energy, participation, and connection captured at events we hosted.',
  },
  browse: {
    title: 'Browse by experience',
    subtitle: 'Filter by experience type.',
  },
  grid: {
    title: 'Event moments',
    subtitle: 'A curated look at the play we bring to venues across Gujarat.',
  },
  filters: [{ id: 'all', label: 'All moments' }],
  finalCta: {
    headline: 'Ready to create your own memories?',
    description: '',
    primaryLabel: 'Book event',
    secondaryLabel: 'Contact us',
  },
}

export function getGalleryPageContent(): GalleryPageContent {
  return galleryData.page ?? fallbackPage
}

/** Resolve a gallery.json item to a bundled asset URL. */
export function resolveGalleryItem(item: GalleryItem): ResolvedGalleryImage {
  const momentMatch = item.v2Src.match(/moments\/moment-(\d+)/)
  if (momentMatch) {
    const index = Number.parseInt(momentMatch[1], 10) - 1
    const entry = ASSET_MAP.gallery.moments[index] ?? ASSET_MAP.gallery.moments[0]
    return {
      id: item.id,
      src: getAssetUrl(entry),
      alt: item.alt,
      caption: item.caption,
      serviceSlug: item.serviceSlug,
    }
  }

  const eventMatch = item.v2Src.match(/event-gallery-(\d+)/)
  if (eventMatch) {
    const index = Number.parseInt(eventMatch[1], 10) - 1
    const entry = ASSET_MAP.gallery.events[index] ?? ASSET_MAP.gallery.events[0]
    return {
      id: item.id,
      src: getAssetUrl(entry),
      alt: item.alt,
      caption: item.caption,
      serviceSlug: item.serviceSlug,
    }
  }

  return {
    id: item.id,
    src: getAssetUrl(ASSET_MAP.gallery.events[0]),
    alt: item.alt,
    caption: item.caption,
    serviceSlug: item.serviceSlug,
  }
}

export function getGalleryItemById(id: string): ResolvedGalleryImage | undefined {
  const item = galleryData.items.find((entry) => entry.id === id)
  return item ? resolveGalleryItem(item) : undefined
}

export function getGalleryItemsByIds(ids: string[]): ResolvedGalleryImage[] {
  return ids
    .map((id) => getGalleryItemById(id))
    .filter((item): item is ResolvedGalleryImage => item !== undefined)
}

function dedupeBySrc(images: ResolvedGalleryImage[]): ResolvedGalleryImage[] {
  const seen = new Set<string>()
  return images.filter((image) => {
    if (seen.has(image.src)) return false
    seen.add(image.src)
    return true
  })
}

/** Service hero/slider/gallery assets from asset-map. */
export function getServiceGalleryImages(slug: string): ServiceGalleryImage[] {
  if (!(slug in ASSET_MAP.services)) return []
  const serviceSlug = slug as ServiceSlug
  const assets = ASSET_MAP.services[serviceSlug]
  return assets.gallery.map((entry, index) => ({
    id: `${slug}-gallery-${index + 1}`,
    src: getServiceAssetUrl(serviceSlug, 'gallery', index),
    alt: entry.alt ?? `${slug} event photo`,
  }))
}

/** Optional curated items from gallery.json tagged for this service. */
export function getCuratedGalleryForService(slug: string): GalleryItem[] {
  return galleryData.items.filter(
    (item) => item.serviceSlug === slug && !item.id.startsWith('home-moment'),
  )
}

export function getCuratedGalleryUrls(slug: string): ServiceGalleryImage[] {
  return getCuratedGalleryForService(slug).map((item) => {
    const resolved = resolveGalleryItem(item)
    return {
      id: resolved.id,
      src: resolved.src,
      alt: resolved.alt,
      caption: resolved.caption,
    }
  })
}

/** Featured event gallery rows for services overview preview (excludes home-moment ids). */
export function getFeaturedGalleryPreview(limit = 6): ServiceGalleryImage[] {
  const featured = galleryData.items
    .filter((item) => item.featured && item.id.startsWith('gallery-'))
    .slice(0, limit)

  return featured.map((item) => {
    const resolved = resolveGalleryItem(item)
    return {
      id: resolved.id,
      src: resolved.src,
      alt: resolved.alt,
      caption: resolved.caption,
    }
  })
}

/** Curated grid for gallery page "Event moments" section (all filter). */
export function getFilteredGalleryImages(filter: GalleryFilterId): ResolvedGalleryImage[] {
  if (filter === GALLERY_FILTER_ALL) {
    return GALLERY_EVENT_MOMENT_CMS_KEYS.map((key, index) => ({
      id: key,
      src: getImageByKey(key),
      alt: `Event moment ${index + 1}`,
    }))
  }

  const curated = galleryData.items
    .filter((item) => item.serviceSlug === filter)
    .map(resolveGalleryItem)
  const service = getServiceGalleryImages(filter).map((item) => ({
    ...item,
    serviceSlug: filter,
  }))

  return dedupeBySrc([...curated, ...service]).slice(0, 8)
}

/** Merged gallery: service photos first, then curated JSON extras (deduped by src). */
export function getMergedServiceGallery(slug: string): ServiceGalleryImage[] {
  const primary = getServiceGalleryImages(slug)
  const curated = getCuratedGalleryUrls(slug)
  const seen = new Set(primary.map((i) => i.src))
  const extras = curated.filter((i) => !seen.has(i.src))
  return [...primary, ...extras]
}

export function isGalleryServiceSlug(id: string): id is ServiceSlug {
  return id in ASSET_MAP.services
}
