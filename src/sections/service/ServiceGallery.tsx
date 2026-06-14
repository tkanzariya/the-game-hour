import { GalleryCard } from '@/components/GalleryCard'
import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import { getMergedServiceGallery } from '@/lib/gallery'
import { toLightboxGallery } from '@/lib/lightbox'
import type { Service } from '@/data/types'
import SectionIntro from '@/sections/home/SectionIntro'

type ServiceGalleryProps = {
  service: Service
}

export default function ServiceGallery({ service }: ServiceGalleryProps) {
  const images = getMergedServiceGallery(service.slug)
  const lightboxGallery = toLightboxGallery(images)

  return (
    <Section id="gallery" profile="marketing">
      <SectionIntro
        title="See the energy in action"
        subtitle={`Real moments from ${service.name.toLowerCase()}, laughter, teamwork, and guests who forgot their phones.`}
      />
      <Reveal staggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((item, index) => (
          <RevealItem key={item.id}>
            <GalleryCard
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              gallery={lightboxGallery}
              galleryIndex={index}
            />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
