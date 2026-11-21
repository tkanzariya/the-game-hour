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
import { ABOUT_META } from '@/lib/seo/page-meta'

const aboutSeo = buildSeo({
  ...ABOUT_META,
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
