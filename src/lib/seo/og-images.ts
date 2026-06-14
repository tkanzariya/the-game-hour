/**
 * Stable absolute OG image URLs for social crawlers.
 * Prefer /public paths (copied at build/migrate time) over Vite-hashed bundle URLs.
 */
import { ASSET_MAP, PUBLIC_ASSETS, type AssetEntry, type ServiceSlug } from '@/data/asset-map'
import { SITE } from '@/utils/constants'

/** Root-relative public path → absolute production URL. */
export function toAbsolutePublicUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE.url}${normalized}`
}

export function getDefaultOgImageUrl(): string {
  return toAbsolutePublicUrl(PUBLIC_ASSETS.ogDefaultJpg)
}

export function getSocialPreviewOgImageUrl(): string {
  return toAbsolutePublicUrl('/og/social-preview.jpg')
}

export function getGalleryOgImageUrl(): string {
  return toAbsolutePublicUrl('/og/gallery.jpg')
}

function isServiceSlug(slug: string): slug is ServiceSlug {
  return slug in ASSET_MAP.services
}

/** Map asset-map entry to a stable public OG path when available. */
export function getAssetOgImageUrl(entry: AssetEntry | undefined, fallback = getDefaultOgImageUrl()): string {
  if (!entry) return fallback

  if (entry === ASSET_MAP.seo.socialPreview) return getSocialPreviewOgImageUrl()
  if (entry === ASSET_MAP.gallery.hero) return getGalleryOgImageUrl()
  if (entry === ASSET_MAP.seo.ogDefault) return getDefaultOgImageUrl()

  return fallback
}

/** Service detail pages: stable /og/services/{slug}.jpg with default fallback. */
export function getServiceOgImageUrl(slug: string): string {
  if (!isServiceSlug(slug)) return getDefaultOgImageUrl()
  return toAbsolutePublicUrl(`/og/services/${slug}.jpg`)
}

export const OG_IMAGE_DIMENSIONS = { width: 1200, height: 630 } as const
