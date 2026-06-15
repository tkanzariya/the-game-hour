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

const homeSeo = buildSeo({
  title: `${SITE.name} | Screen-Free Event Games in Gujarat`,
  description:
    'Book facilitator-led birthday, wedding, corporate, school, and festival games across Gujarat. The Game Hour creates playful, premium, screen-free experiences guests remember.',
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
