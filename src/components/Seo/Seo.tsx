import { Helmet } from 'react-helmet-async'
import { SITE } from '@/utils/constants'
import { OG_IMAGE_DIMENSIONS } from '@/lib/seo/og-images'
import type { SeoMeta } from '@/utils/seo'

type SeoProps = SeoMeta

export default function Seo({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  noIndex,
}: SeoProps) {
  const url = canonical ?? SITE.url

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:site_name" content={SITE.name} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && (
        <>
          <meta property="og:image:width" content={String(OG_IMAGE_DIMENSIONS.width)} />
          <meta property="og:image:height" content={String(OG_IMAGE_DIMENSIONS.height)} />
        </>
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
