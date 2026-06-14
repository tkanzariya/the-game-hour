import { LightboxImage } from '@/components/ImageLightbox'
import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import { getActivitiesForService } from '@/lib/service-activities'
import type { Service } from '@/data/types'
import SectionIntro from '@/sections/home/SectionIntro'

type ServiceActivitiesProps = {
  service: Service
}

export default function ServiceActivities({ service }: ServiceActivitiesProps) {
  const activities = getActivitiesForService(service.slug)

  return (
    <Section tone="warm" id="activities" profile="marketing">
      <SectionIntro
        title="Games & activities included"
        subtitle="Every package blends high-energy rounds with moments that fit your crowd, facilitators adapt on the day."
      />
      <Reveal staggerChildren className="grid gap-6 md:grid-cols-3">
        {activities.map((activity) => (
          <RevealItem key={activity.id}>
            <article className="surface-clay flex h-full flex-col overflow-hidden rounded-2xl transition-brand hover:-translate-y-1 hover:shadow-card-hover">
              <div className="aspect-video overflow-hidden bg-surface-muted">
                <LightboxImage
                  src={activity.imageUrl}
                  alt={activity.name}
                  className="h-full w-full object-cover"
                  wrapperClassName="h-full w-full"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-heading text-lg font-bold text-primary">
                  {activity.name}
                </h3>
                <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-accent-muted-grey">
                  {activity.description}
                </p>
              </div>
            </article>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
