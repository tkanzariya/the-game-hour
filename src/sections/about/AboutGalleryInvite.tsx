import { Button } from '@/components/Button'
import { LightboxImage } from '@/components/ImageLightbox'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/motion'
import { ROUTES } from '@/constants/routes'
import { getAboutGalleryInvite } from '@/lib/about-page'
import { getImageByKey } from '@/lib/assets'
import SectionIntro from '@/sections/home/SectionIntro'

export default function AboutGalleryInvite() {
  const content = getAboutGalleryInvite()
  const spotlightSrc = getImageByKey('about-gallery-spotlight')

  return (
    <Section tone="warm" id="gallery-invite" profile="marketing">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div className="image-frame overflow-hidden rounded-3xl">
            <LightboxImage
              src={spotlightSrc}
              alt="Guests enjoying games at a Game Hour event"
              caption={content.description}
                className="aspect-[16/10] w-full object-cover sm:aspect-[3/2]"
                wrapperClassName="w-full"
                width={960}
                height={600}
                loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>
        <Reveal>
          <SectionIntro title={content.title} subtitle={content.description} />
          <Button variant="secondary" href={ROUTES.gallery} className="mt-6">
            {content.primaryLabel}
          </Button>
        </Reveal>
      </div>
    </Section>
  )
}
