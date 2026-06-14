/**
 * Resolve asset URLs — CMS overrides bundled images when uploaded.
 */
import { getImageUrlForAssetPath } from '@/lib/cms-images'
import {
  ASSET_MAP,
  getBundledImageUrl,
  getServiceAssets,
  hasBundledImage,
  PLACEHOLDER_SVG,
  resolveBundledAssetPath,
  type AssetEntry,
  type ServiceSlug,
} from '@/lib/assets-internal'
import { getDefaultOgImageUrl } from '@/lib/seo/og-images'

export { getImageByKey } from '@/lib/cms-images'
export { ASSET_MAP, getServiceAssets }

/**
 * Get URL for a relative path under src/assets/images/
 * Checks CMS manifest first, then bundled asset.
 */
export function getImageUrl(relativePath: string | undefined): string {
  if (!relativePath) return PLACEHOLDER_SVG
  const cmsUrl = getImageUrlForAssetPath(relativePath)
  if (cmsUrl) return cmsUrl
  return getBundledImageUrl(relativePath)
}

/**
 * Get URL from an asset-map entry (webp default, jpg/png/svg fallback).
 */
export function getAssetUrl(
  entry: AssetEntry | undefined,
  format: 'webp' | 'jpg' | 'png' | 'svg' = 'webp',
): string {
  const path = resolveBundledAssetPath(entry, format)
  if (!path) return PLACEHOLDER_SVG

  const cmsFromPath = getImageUrlForAssetPath(path)
  if (cmsFromPath) return cmsFromPath

  const resolved = getBundledImageUrl(path)
  if (resolved !== PLACEHOLDER_SVG) return resolved

  if (format === 'webp' && entry?.jpg) {
    const cmsJpg = getImageUrlForAssetPath(entry.jpg)
    if (cmsJpg) return cmsJpg
    return getBundledImageUrl(entry.jpg)
  }
  if (format === 'webp' && entry?.png) {
    const cmsPng = getImageUrlForAssetPath(entry.png)
    if (cmsPng) return cmsPng
    return getBundledImageUrl(entry.png)
  }
  return resolved
}

export function getLogoUrl(variant: 'light' | 'dark' = 'light'): string {
  return variant === 'dark'
    ? getAssetUrl(ASSET_MAP.branding.logoDark)
    : getAssetUrl(ASSET_MAP.branding.logoLight)
}

export function getOgImageUrl(): string {
  const bundled = getAssetUrl(ASSET_MAP.seo.ogDefault)
  if (bundled !== PLACEHOLDER_SVG) return bundled
  return getDefaultOgImageUrl()
}

export function getServiceAssetUrl(
  slug: ServiceSlug,
  kind: 'titleCard' | 'slider' | 'gallery',
  index = 0,
  format: 'webp' | 'jpg' | 'png' = 'webp',
): string {
  const assets = getServiceAssets(slug)
  if (kind === 'titleCard') return getAssetUrl(assets.titleCard, format)
  if (kind === 'slider') return getAssetUrl(assets.slider[index], format)
  return getAssetUrl(assets.gallery[index], format)
}

export function hasImage(relativePath: string): boolean {
  const key = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  return hasBundledImage(key)
}

export function hasAsset(entry: AssetEntry | undefined): boolean {
  const path = resolveBundledAssetPath(entry, 'webp')
  return path ? hasImage(path) : false
}
