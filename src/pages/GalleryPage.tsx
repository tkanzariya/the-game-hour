import { Seo } from '@/components/Seo'
import {
  GalleryBrowseExperience,
  GalleryFeaturedMoments,
  GalleryFinalCta,
  GalleryHero,
  GalleryStories,
} from '@/sections/gallery'
import { ROUTES } from '@/constants/routes'
import { SITE } from '@/utils/constants'
import { buildSeo } from '@/utils/seo'
import { getGalleryOgImageUrl } from '@/lib/seo/og-images'

const gallerySeo = buildSeo({
  title: 'Event Gallery | The Game Hour',
  description:
    'Browse real photos from birthday, corporate, wedding, school, and festival game events across Gujarat. See the laughter, energy, and connection The Game Hour brings.',
  canonical: `${SITE.url}${ROUTES.gallery}`,
  ogImage: getGalleryOgImageUrl(),
})

export default function GalleryPage() {
  return (
    <>
      <Seo {...gallerySeo} />
      <main>
        <GalleryHero />
        <GalleryFeaturedMoments />
        <GalleryBrowseExperience />
        <GalleryStories />
        <GalleryFinalCta />
      </main>
    </>
  )
}
