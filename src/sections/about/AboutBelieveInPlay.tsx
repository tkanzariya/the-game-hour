import { Section } from '@/components/Section'
import { LightboxImage } from '@/components/ImageLightbox'
import { IconChip } from '@/components/Icon'
import { Reveal, RevealItem } from '@/components/motion'
import { ASSET_MAP } from '@/data/asset-map'
import { getAssetUrl } from '@/lib/assets'
import { getAboutBelieveInPlay } from '@/lib/about-page'
import { toLightboxGallery } from '@/lib/lightbox'
import { resolveIconName } from '@/lib/service-icons'
import SectionIntro from '@/sections/home/SectionIntro'

const FEATURED_PILLAR_IDS = new Set(['connection', 'screen-free'])

export default function AboutBelieveInPlay() {
  const content = getAboutBelieveInPlay()
  const momentImages = ASSET_MAP.gallery.moments
  const featured = content.pillars.filter((p) => FEATURED_PILLAR_IDS.has(p.id))
  const compact = content.pillars.filter((p) => !FEATURED_PILLAR_IDS.has(p.id))
  const featuredGallery = featured.map((pillar, index) => {
    const image = momentImages[index]
    return {
      src: getAssetUrl(image),
      alt: image.alt ?? pillar.title,
      caption: pillar.description,
    }
  })
  const lightboxGallery = toLightboxGallery(featuredGallery)

  return (
    <Section id="believe-in-play" profile="marketing">
      <SectionIntro title={content.title} subtitle={content.subtitle} />
      <Reveal staggerChildren className="grid gap-5 lg:grid-cols-2">
        {featured.map((pillar, index) => {
          const image = momentImages[index]

          return (
            <RevealItem key={pillar.id}>
              <article className="group surface-clay h-full overflow-hidden rounded-3xl transition-brand hover:-translate-y-1 hover:shadow-card-hover">
                <div className="image-frame m-3 mb-0 aspect-[16/10] overflow-hidden">
                  <LightboxImage
                    src={getAssetUrl(image)}
                    alt={image.alt ?? pillar.title}
                    caption={pillar.description}
                    gallery={lightboxGallery}
                    galleryIndex={index}
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full w-full"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-5 pt-4">
                  <IconChip name={resolveIconName(pillar.icon)} size="lg" />
                  <h3 className="mt-3 font-heading text-xl font-bold text-primary">{pillar.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
                    {pillar.description}
                  </p>
                </div>
              </article>
            </RevealItem>
          )
        })}
      </Reveal>
      <Reveal staggerChildren className="mt-5 grid gap-5 sm:grid-cols-3">
        {compact.map((pillar) => (
          <RevealItem key={pillar.id}>
            <article className="surface-clay h-full rounded-2xl p-5 transition-brand hover:-translate-y-1 hover:shadow-card-hover">
              <IconChip name={resolveIconName(pillar.icon)} size="lg" />
              <h3 className="mt-3 font-heading text-lg font-bold text-primary">{pillar.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-accent-muted-grey">
                {pillar.description}
              </p>
            </article>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
