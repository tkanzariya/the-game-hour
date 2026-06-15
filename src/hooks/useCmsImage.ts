import { useMemo } from 'react'
import { useCmsImages } from '@/components/CmsImages'
import type { AssetEntry } from '@/lib/assets-internal'
import { getImageByKey } from '@/lib/cms-images'
import { getAssetUrl } from '@/lib/assets'

/** Wait for CMS manifest before resolving — avoids bundled→CMS image flash. */
export function useCmsImage(key: string): { src: string | undefined; ready: boolean } {
  const { loaded, manifest } = useCmsImages()
  return useMemo(
    () => ({
      ready: loaded,
      src: loaded ? getImageByKey(key) : undefined,
    }),
    [key, loaded, manifest],
  )
}

export function useCmsAssetUrl(
  entry: AssetEntry | undefined,
  format: 'webp' | 'jpg' | 'png' | 'svg' = 'webp',
): { src: string | undefined; ready: boolean } {
  const { loaded, manifest } = useCmsImages()
  return useMemo(
    () => ({
      ready: loaded,
      src: loaded && entry ? getAssetUrl(entry, format) : undefined,
    }),
    [entry, format, loaded, manifest],
  )
}
