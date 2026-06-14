/**
 * Runtime CMS image manifest — loaded from PHP API on production.
 * Bundled assets remain as fallback when CMS is unavailable or slot is empty.
 */
import {
  FALLBACK_PATH_TO_IMAGE_KEYS,
  IMAGE_KEY_REGISTRY,
  cmsKeysSharingFallback,
  resolveCanonicalCmsKey,
  type ImageKeyMeta,
} from '@/data/image-keys'
import { getBundledImageUrl, PLACEHOLDER_SVG } from '@/lib/assets-internal'

export type CmsImageEntry = {
  key: string
  url: string
  title?: string
  category?: string
  updated_at?: string | null
}

export type CmsManifest = Record<string, CmsImageEntry>

const CMS_API_URL =
  import.meta.env.VITE_CMS_API_URL ?? '/cms/api/images.php'

let manifest: CmsManifest = {}
let loadPromise: Promise<CmsManifest> | null = null
let loaded = false

export function isCmsManifestLoaded(): boolean {
  return loaded
}

export function getCmsManifest(): CmsManifest {
  return manifest
}

export function setCmsManifest(next: CmsManifest): void {
  manifest = next
  loaded = true
}

/** Fetch all uploaded images from PHP CMS. Safe to call multiple times. */
export function loadCmsManifest(force = false): Promise<CmsManifest> {
  if (loaded && !force) return Promise.resolve(manifest)
  if (loadPromise && !force) return loadPromise
  if (force) {
    loaded = false
    loadPromise = null
  }

  loadPromise = fetch(CMS_API_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then(async (res) => {
      if (!res.ok) return {}
      const data = (await res.json()) as { images?: CmsManifest }
      const images = data.images ?? {}
      setCmsManifest(images)
      return images
    })
    .catch(() => {
      loaded = true
      return {}
    })

  return loadPromise
}

function bundledFallbackForKey(key: string): string {
  const canonical = resolveCanonicalCmsKey(key)
  const meta: ImageKeyMeta | undefined = IMAGE_KEY_REGISTRY[canonical]
  if (!meta?.fallback) return PLACEHOLDER_SVG
  return getBundledImageUrl(meta.fallback)
}

function manifestUrlForKey(key: string): string | undefined {
  for (const candidate of cmsKeysSharingFallback(key)) {
    const direct = manifest[candidate]?.url
    if (direct) return direct
    for (const [manifestKey, entry] of Object.entries(manifest)) {
      if (!entry?.url) continue
      if (resolveCanonicalCmsKey(manifestKey) === candidate) {
        return entry.url
      }
    }
  }
  return undefined
}

/**
 * Resolve image URL by CMS key (e.g. homepage-hero, gallery-1, birthday-games-slider-1).
 * Falls back to bundled Vite asset when CMS slot is empty or offline.
 */
export function getImageByKey(key: string): string {
  const cmsUrl = manifestUrlForKey(key)
  if (cmsUrl) return cmsUrl
  return bundledFallbackForKey(key)
}

/**
 * Resolve by bundled asset path — used by getAssetUrl integration.
 */
export function getImageUrlForAssetPath(relativePath: string | undefined): string | undefined {
  if (!relativePath) return undefined
  const normalized = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  const keys = FALLBACK_PATH_TO_IMAGE_KEYS[normalized] ?? []
  for (const cmsKey of keys) {
    const url = manifestUrlForKey(cmsKey)
    if (url) return url
  }
  return undefined
}

export { CMS_API_URL }
