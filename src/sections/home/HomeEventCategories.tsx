import { Section } from '@/components/Section'
import { ServiceCard } from '@/components/ServiceCard'
import { Reveal, RevealItem } from '@/components/motion'
import { servicePath } from '@/constants/routes'
import { ASSET_MAP, type ServiceSlug } from '@/data/asset-map'
import { getAllServices } from '@/lib/services'
import { getAssetUrl } from '@/lib/assets'
import SectionIntro from './SectionIntro'

export default function HomeEventCategories() {
  const services = getAllServices()

  return (
    <Section id="experiences" profile="marketing">
      <SectionIntro
        title="Experiences for every celebration"
        subtitle="Pick your event type, we tailor games, facilitators, and setup so the vibe fits your crowd."
      />
      <Reveal
        staggerChildren
        className="grid gap-9 sm:grid-cols-2 sm:gap-10 lg:gap-11 xl:grid-cols-3 xl:gap-12"
      >
        {services.map((service) => {
          const slug = service.slug as ServiceSlug
          const titleCard = ASSET_MAP.services[slug]?.titleCard
          return (
            <RevealItem key={service.slug} className="h-full">
              <ServiceCard
                variant="clay"
                layout="showcase"
                title={service.name}
                description={service.shortDescription}
                href={servicePath(service.slug)}
                imageSrc={titleCard ? getAssetUrl(titleCard) : undefined}
                imageAlt={titleCard?.alt}
              />
            </RevealItem>
          )
        })}
      </Reveal>
    </Section>
  )
}
