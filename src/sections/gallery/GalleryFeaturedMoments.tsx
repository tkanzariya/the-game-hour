import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import { toLightboxGallery } from '@/lib/lightbox'
import { getGalleryFeaturedMoments } from '@/lib/gallery-page'
import SectionIntro from '@/sections/home/SectionIntro'
import GalleryShowcaseCard from './GalleryShowcaseCard'

const LAYOUT = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-5',
  'lg:col-span-7',
] as const

export default function GalleryFeaturedMoments() {
  const { title, subtitle, images } = getGalleryFeaturedMoments()
  const gallery = toLightboxGallery(images)

  return (
    <Section tone="muted" id="featured" profile="marketing">
      <SectionIntro title={title} subtitle={subtitle} />
      <Reveal staggerChildren className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {images.map((item, index) => (
          <RevealItem key={item.id} className={LAYOUT[index] ?? 'lg:col-span-6'}>
            <GalleryShowcaseCard
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              priority={index === 0}
              gallery={gallery}
              galleryIndex={index}
            />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
