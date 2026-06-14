import { Badge } from '@/components/Badge'
import { Section } from '@/components/Section'
import { Reveal, RevealItem } from '@/components/motion'
import type { Service } from '@/data/types'
import SectionIntro from '@/sections/home/SectionIntro'

type ServiceIdealForProps = {
  service: Service
}

export default function ServiceIdealFor({ service }: ServiceIdealForProps) {
  return (
    <Section tone="muted" id="ideal-for" profile="marketing">
      <SectionIntro
        title="Ideal for"
        subtitle="Whether you are planning for a small group or a large venue, we tailor the experience to your occasion."
      />
      <Reveal className="flex flex-wrap justify-center gap-3">
        {service.eventTypes.map((eventType) => (
          <RevealItem key={eventType}>
            <Badge variant="outline" className="px-5 py-2.5 text-sm font-semibold">
              {eventType}
            </Badge>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  )
}
