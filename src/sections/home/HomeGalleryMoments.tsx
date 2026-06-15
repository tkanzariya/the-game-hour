import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { GalleryCard } from '@/components/GalleryCard'
import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import { ROUTES } from '@/constants/routes'
import { galleryData } from '@/data'
import { useCmsImages } from '@/components/CmsImages'
import { getHomeGalleryTeaser } from '@/lib/content/stats'
import { getImageByKey } from '@/lib/assets'
import { toLightboxGallery } from '@/lib/lightbox'
import SectionIntro from './SectionIntro'

export default function HomeGalleryMoments() {
  const teaser = getHomeGalleryTeaser()
  const { loaded } = useCmsImages()
  const maxItems = teaser?.maxItems ?? 4
  const moments = galleryData.items
    .filter((item) => item.id.startsWith('home-moment'))
    .slice(0, maxItems)
  const lightboxGallery = loaded
    ? toLightboxGallery(
        moments.map((item, index) => ({
          src: getImageByKey(`homepage-moment-${index + 1}`),
          alt: item.alt,
          caption: item.caption,
        })),
      )
    : []

  return (
    <Section id="moments" profile="marketing">
      <SectionIntro
        title={teaser?.title ?? 'A glimpse of the energy'}
        subtitle={teaser?.subtitle ?? 'Four moments from real events. The full gallery has the rest.'}
      />
      <Reveal staggerChildren className="grid gap-4 sm:grid-cols-2">
        {moments.map((item, index) => (
          <RevealItem key={item.id}>
            <GalleryCard
              src={loaded ? getImageByKey(`homepage-moment-${index + 1}`) : undefined}
              alt={item.alt}
              caption={item.caption}
              gallery={lightboxGallery}
              galleryIndex={index}
            />
          </RevealItem>
        ))}
      </Reveal>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Button variant="secondary" href={ROUTES.gallery}>
          {teaser?.primaryLabel ?? 'View full gallery'}
        </Button>
        <Link
          to={ROUTES.gallery}
          className="text-sm font-semibold text-primary transition-brand hover:text-secondary-emphasis"
        >
          {teaser?.linkLabel ?? 'More photos from real events'} →
        </Link>
      </div>
    </Section>
  )
}
