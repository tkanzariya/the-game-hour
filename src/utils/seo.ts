import { SITE } from './constants'

import { getDefaultOgImageUrl } from '@/lib/seo/og-images'

export type SeoMeta = {
  title: string
  description: string
  canonical?: string
  ogType?: 'website' | 'article'
  ogImage?: string
  noIndex?: boolean
}

const defaultOgImage = getDefaultOgImageUrl()

/**
 * Build full page metadata. Pass partial overrides from each route/page.
 */
export function buildSeo(overrides: Partial<SeoMeta> & { title: string }): SeoMeta {
  const title = overrides.title.includes(SITE.name)
    ? overrides.title
    : `${overrides.title} | ${SITE.name}`

  return {
    title,
    description: overrides.description ?? SITE.description,
    canonical: overrides.canonical,
    ogType: overrides.ogType ?? 'website',
    ogImage: overrides.ogImage ?? defaultOgImage,
    noIndex: overrides.noIndex,
  }
}

/** Default site-wide SEO (home fallback) */
export const defaultSeo: SeoMeta = buildSeo({
  title: SITE.name,
  description: SITE.description,
})
