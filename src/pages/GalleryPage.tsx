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
import { GALLERY_META } from '@/lib/seo/page-meta'

const gallerySeo = buildSeo({
  ...GALLERY_META,
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
