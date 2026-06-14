import { Seo } from '@/components/Seo'
import {
  AboutBelieveInPlay,
  AboutExperiencesInvite,
  AboutFinalCta,
  AboutGalleryInvite,
  AboutHero,
  AboutStory,
} from '@/sections/about'
import { ROUTES } from '@/constants/routes'
import { SITE } from '@/utils/constants'
import { buildSeo } from '@/utils/seo'
import { getSocialPreviewOgImageUrl } from '@/lib/seo/og-images'

const aboutSeo = buildSeo({
  title: 'Our Story | The Game Hour',
  description:
    'Discover why The Game Hour exists: facilitator-led, screen-free games for birthdays, weddings, corporates, schools, and festivals across Gujarat. Real play. Real connection.',
  canonical: `${SITE.url}${ROUTES.about}`,
  ogImage: getSocialPreviewOgImageUrl(),
})

export default function AboutPage() {
  return (
    <>
      <Seo {...aboutSeo} />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutBelieveInPlay />
        <AboutGalleryInvite />
        <AboutExperiencesInvite />
        <AboutFinalCta />
      </main>
    </>
  )
}
