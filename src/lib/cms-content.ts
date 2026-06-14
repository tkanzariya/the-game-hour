/**
 * Runtime CMS content (testimonials + statistics) — loaded from PHP API.
 * Bundled JSON in src/data/content/ remains fallback when CMS is unavailable.
 */

import type { SiteMetricId } from '@/data/types'

export type CmsTestimonial = {
  id: string
  name: string
  role: string
  review: string
  rating: number
  placement: 'home' | 'service'
  serviceSlug?: string | null
  sortOrder?: number
  updatedAt?: string | null
}

export type CmsMetricEntry = {
  value: string
  label: string
}

export type CmsContentPayload = {
  version: number
  testimonials: CmsTestimonial[]
  metrics: Partial<Record<SiteMetricId, CmsMetricEntry>>
  generated_at?: string
}

const CMS_CONTENT_URL =
  import.meta.env.VITE_CMS_CONTENT_URL ?? '/cms/api/content.php'

const METRIC_IDS: SiteMetricId[] = [
  'events-hosted',
  'participants',
  'games-conducted',
  'cities-served',
]

let payload: CmsContentPayload | null = null
let loadPromise: Promise<CmsContentPayload | null> | null = null
/** True after a successful API response (even if lists are empty). */
let cmsReachable = false

export function isCmsContentReachable(): boolean {
  return cmsReachable
}

export function getCmsContentPayload(): CmsContentPayload | null {
  return payload
}

export function getCmsTestimonials(): CmsTestimonial[] {
  return payload?.testimonials ?? []
}

export function getCmsMetricValue(id: SiteMetricId): string | undefined {
  const value = payload?.metrics[id]?.value
  return value !== undefined && value !== '' ? value : undefined
}

export function setCmsContent(next: CmsContentPayload | null, reachable: boolean): void {
  payload = next
  cmsReachable = reachable
}

/** Fetch testimonials + statistics from PHP CMS. Safe to call multiple times. */
export function loadCmsContent(force = false): Promise<CmsContentPayload | null> {
  if (cmsReachable && payload && !force) return Promise.resolve(payload)
  if (loadPromise && !force) return loadPromise
  if (force) {
    cmsReachable = false
    loadPromise = null
  }

  loadPromise = fetch(CMS_CONTENT_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then(async (res) => {
      if (!res.ok) {
        setCmsContent(null, false)
        return null
      }
      const data = (await res.json()) as CmsContentPayload
      const normalized: CmsContentPayload = {
        version: data.version ?? 1,
        testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
        metrics: data.metrics ?? {},
        generated_at: data.generated_at,
      }
      setCmsContent(normalized, true)
      return normalized
    })
    .catch(() => {
      setCmsContent(null, false)
      return null
    })

  return loadPromise
}

export { CMS_CONTENT_URL, METRIC_IDS }
