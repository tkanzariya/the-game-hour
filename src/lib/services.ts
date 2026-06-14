import servicesData from '@/data/services.json'
import { getServiceAssets, resolveAssetPath, type ServiceSlug } from '@/data/asset-map'
import type { Service, ServicesData } from '@/data/types'
import { servicePath } from '@/constants/routes'
import { getBookingUrlForService } from '@/lib/booking'
import { SITE } from '@/utils/constants'

const data = servicesData as ServicesData

/** All services from services.json */
export function getAllServices(): Service[] {
  return data.services
}

/** Lookup service by URL slug */
export function getServiceBySlug(slug: string | undefined): Service | undefined {
  if (!slug) return undefined
  return data.services.find((s) => s.slug === slug)
}

export function isValidServiceSlug(slug: string): boolean {
  return data.services.some((s) => s.slug === slug)
}

export function getServiceSlugs(): string[] {
  return data.services.map((s) => s.slug)
}

export function getServicesMeta() {
  return data.meta
}

/** Resolve v2 webp path for a service asset via asset-map */
export function getServiceImagePath(
  slug: string,
  kind: 'titleCard' | 'slider' | 'gallery',
  index = 0,
): string | undefined {
  if (!isValidServiceSlug(slug)) return undefined
  const assets = getServiceAssets(slug as ServiceSlug)
  if (kind === 'titleCard') return resolveAssetPath(assets.titleCard, 'webp')
  if (kind === 'slider') return resolveAssetPath(assets.slider[index], 'webp')
  return resolveAssetPath(assets.gallery[index], 'webp')
}

/** Resolve live Bubble booking URL for a service (corporate vs default). */
export function resolveServiceCtaHref(service: Service): string {
  return getBookingUrlForService(service.slug)
}

export function getServiceCanonicalUrl(slug: string): string {
  return `${SITE.url}${servicePath(slug)}`
}

/** Re-export for backward compatibility; use @/lib/seo/og-images directly in new code. */
export { getServiceOgImageUrl } from '@/lib/seo/og-images'

export { data as servicesData }
