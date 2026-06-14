/**
 * Internal asset resolution (bundled images). Used by assets.ts and cms-images.ts.
 */
import {
  ASSET_MAP,
  getServiceAssets,
  resolveAssetPath,
  type AssetEntry,
  type ServiceSlug,
} from '@/data/asset-map'

const imageModules = import.meta.glob<string>(
  '../assets/images/**/*.{jpg,jpeg,png,webp,svg,ico,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' },
)

const urlByPath = new Map<string, string>()

for (const [fullPath, url] of Object.entries(imageModules)) {
  const normalized = fullPath
    .replace(/^.*assets[/\\]images[/\\]/, '')
    .replace(/\\/g, '/')
  urlByPath.set(normalized, url)
}

export const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F3EEFF'/%3E%3Cstop offset='100%25' stop-color='%23E8EEF6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='300' rx='24'/%3E%3Ccircle cx='200' cy='118' r='36' fill='none' stroke='%238B5CF6' stroke-width='3'/%3E%3Cpath d='M188 118h24M200 106v24' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round'/%3E%3Ctext x='200' y='210' text-anchor='middle' fill='%23032A5D' font-family='sans-serif' font-size='14' font-weight='600'%3EThe Game Hour%3C/text%3E%3C/svg%3E"

export function getBundledImageUrl(relativePath: string | undefined): string {
  if (!relativePath) return PLACEHOLDER_SVG
  const key = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  return urlByPath.get(key) ?? PLACEHOLDER_SVG
}

export function hasBundledImage(relativePath: string): boolean {
  const key = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  return urlByPath.has(key)
}

export function resolveBundledAssetPath(
  entry: AssetEntry | undefined,
  format: 'webp' | 'jpg' | 'png' | 'svg' = 'webp',
): string | undefined {
  return resolveAssetPath(entry, format)
}

export { ASSET_MAP, getServiceAssets, urlByPath }
export type { AssetEntry, ServiceSlug }
