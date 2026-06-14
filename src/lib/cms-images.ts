/**
 * Runtime CMS image manifest — loaded from PHP API on production.
 * Bundled assets remain as fallback when CMS is unavailable or slot is empty.
 */
import {
  FALLBACK_PATH_TO_IMAGE_KEY,
  IMAGE_KEY_REGISTRY,
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
export function loadCmsManifest(): Promise<CmsManifest> {
  if (loaded) return Promise.resolve(manifest)
  if (loadPromise) return loadPromise

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
  const meta: ImageKeyMeta | undefined = IMAGE_KEY_REGISTRY[key]
  if (!meta?.fallback) return PLACEHOLDER_SVG
  return getBundledImageUrl(meta.fallback)
}

/**
 * Resolve image URL by CMS key (e.g. homepage-hero, gallery-1, birthday-hero).
 * Falls back to bundled Vite asset when CMS slot is empty or offline.
 */
export function getImageByKey(key: string): string {
  const cms = manifest[key]
  if (cms?.url) return cms.url
  return bundledFallbackForKey(key)
}

/**
 * Resolve by bundled asset path — used by getAssetUrl integration.
 */
export function getImageUrlForAssetPath(relativePath: string | undefined): string | undefined {
  if (!relativePath) return undefined
  const normalized = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  const cmsKey = FALLBACK_PATH_TO_IMAGE_KEY[normalized]
  if (cmsKey && manifest[cmsKey]?.url) {
    return manifest[cmsKey].url
  }
  return undefined
}

export { CMS_API_URL }
