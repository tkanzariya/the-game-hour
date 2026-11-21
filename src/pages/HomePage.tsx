import { Seo } from '@/components/Seo'
import {
  HomeEventCategories,
  HomeFinalCta,
  HomeGalleryMoments,
  HomeHero,
  HomeHowItWorks,
  HomeTestimonials,
  HomeTrustedStats,
  HomeWhyUs,
} from '@/sections/home'
import { SITE } from '@/utils/constants'
import { buildSeo } from '@/utils/seo'
import { getDefaultOgImageUrl } from '@/lib/seo/og-images'
import { HOME_META } from '@/lib/seo/page-meta'

const homeSeo = buildSeo({
  ...HOME_META,
  canonical: SITE.url,
  ogImage: getDefaultOgImageUrl(),
})

export default function HomePage() {
  return (
    <>
      <Seo {...homeSeo} />

      <HomeHero />
      <HomeEventCategories />
      <HomeWhyUs />
      <HomeTrustedStats />
      <HomeGalleryMoments />
      <HomeTestimonials />
      <HomeHowItWorks />
      <HomeFinalCta />
    </>
  )
}
